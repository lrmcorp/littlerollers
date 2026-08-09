import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import schemaContract from './v1-schema-contract.json';
import { deltaEventKey, type CanonicalDeltaEvent, type DeltaOperation } from './v1-delta';

type DecodedRowEvent = Omit<CanonicalDeltaEvent, 'eventKey' | 'sourceBranchId' | 'correlationId'>;

const sourceColumns = Object.fromEntries(
  Object.entries(schemaContract.tables).map(([table, contract]) => [table, contract.columns]),
) as Record<string, string[]>;

export function assertMysqlbinlogGtidContinuity(text: string, fromGtidSet: string) {
  const highWater = new Map<string, bigint>();
  for (const member of fromGtidSet.split(',')) {
    const [sid, ...intervals] = member.trim().split(':');
    if (!sid || !intervals.length) throw new Error('BINLOG_GTID_SET_INVALID');
    for (const interval of intervals) {
      const bounds = interval.split('-');
      const end = bounds.at(-1);
      if (!end || !/^\d+$/u.test(end)) throw new Error('BINLOG_GTID_SET_INVALID');
      const value = BigInt(end);
      if (value > (highWater.get(sid) ?? 0n)) highWater.set(sid, value);
    }
  }
  const observed: string[] = [];
  for (const match of text.matchAll(/SET @@SESSION\.GTID_NEXT=\s*'([^']+)'/gu)) {
    const gtid = match[1]!;
    if (gtid === 'AUTOMATIC') continue;
    const separator = gtid.lastIndexOf(':');
    const sid = gtid.slice(0, separator);
    const sequenceText = gtid.slice(separator + 1);
    if (!sid || !/^\d+$/u.test(sequenceText)) throw new Error('BINLOG_GTID_INVALID');
    const sequence = BigInt(sequenceText);
    const expected = (highWater.get(sid) ?? 0n) + 1n;
    if (sequence !== expected) throw new Error('BINLOG_GTID_GAP');
    highWater.set(sid, sequence);
    observed.push(gtid);
  }
  return observed;
}

function mysqlLiteral(value: string): unknown {
  const withoutComment = value.replace(/\s+\/\*.*\*\/\s*$/u, '').trim();
  if (withoutComment === 'NULL') return null;
  if (/^-?\d+$/u.test(withoutComment)) {
    const integer = BigInt(withoutComment);
    return integer <= BigInt(Number.MAX_SAFE_INTEGER) && integer >= BigInt(Number.MIN_SAFE_INTEGER)
      ? Number(integer)
      : withoutComment;
  }
  if (/^-?\d+\.\d+$/u.test(withoutComment)) return withoutComment;
  const quoted = withoutComment.match(/^(?:_binary)?'(.*)'$/su);
  if (!quoted) return withoutComment;
  return quoted[1]!
    .replace(/\\0/gu, '\0')
    .replace(/\\n/gu, '\n')
    .replace(/\\r/gu, '\r')
    .replace(/\\t/gu, '\t')
    .replace(/\\'/gu, "'")
    .replace(/\\"/gu, '"')
    .replace(/\\\\/gu, '\\');
}

function rowObject(table: string, values: Map<number, unknown>): Record<string, unknown> {
  const columns = sourceColumns[table];
  if (!columns) throw new Error(`BINLOG_SOURCE_TABLE_NOT_ALLOWED:${table}`);
  const row: Record<string, unknown> = {};
  for (const [position, value] of values) {
    const column = columns[position - 1];
    if (!column) throw new Error(`BINLOG_COLUMN_POSITION_INVALID:${table}:${position}`);
    // mysqlbinlog renders TIMESTAMP values as Unix seconds, while DATETIME is
    // normally quoted. Canonical payloads use ISO strings so the full-import
    // and row-level delta mappers observe equivalent temporal values.
    row[column] =
      typeof value === 'number' && /(?:^|_)(?:created|updated|deleted|read|verified)_at$/u.test(column)
        ? new Date(value * 1000).toISOString()
        : value;
  }
  if (Object.keys(row).length !== columns.length)
    throw new Error(`BINLOG_FULL_ROW_IMAGE_REQUIRED:${table}`);
  return row;
}

function rowSourceId(table: string, row: Record<string, unknown>): string {
  if (row.id !== null && row.id !== undefined) return String(row.id);
  if (table === 'model_has_roles') return `${row.role_id}:${row.model_id}:${row.model_type}`;
  if (table === 'model_has_permissions')
    return `${row.permission_id}:${row.model_id}:${row.model_type}`;
  if (table === 'role_has_permissions') return `${row.permission_id}:${row.role_id}`;
  throw new Error(`BINLOG_SOURCE_ID_REQUIRED:${table}`);
}

function mysqlbinlogTimestamp(line: string): Date | null {
  const match = line.match(/^#(\d{6})\s+(\d{1,2}):(\d{2}):(\d{2})/u);
  if (!match) return null;
  const [, date, hour, minute, second] = match;
  const year = 2000 + Number(date!.slice(0, 2));
  const month = Number(date!.slice(2, 4)) - 1;
  const day = Number(date!.slice(4, 6));
  return new Date(Date.UTC(year, month, day, Number(hour), Number(minute), Number(second)));
}

export function decodeMysqlbinlogText(
  text: string,
  input: { transactionOrderStart: bigint; binlogFile: string },
): DecodedRowEvent[] {
  const lines = text.split(/\r?\n/u);
  const events: DecodedRowEvent[] = [];
  let gtid: string | null = null;
  let transactionOrder = input.transactionOrderStart;
  let eventOrder = 0;
  let position: string | null = null;
  let occurredAt: Date | null = null;
  let table: string | null = null;
  let operation: DeltaOperation | null = null;
  let section: 'BEFORE' | 'AFTER' | null = null;
  let before = new Map<number, unknown>();
  let after = new Map<number, unknown>();

  const flush = () => {
    if (!table || !operation) return;
    const beforeRow = operation === 'INSERT' ? null : rowObject(table, before);
    const afterRow = operation === 'DELETE' ? null : rowObject(table, after);
    const selected = afterRow ?? beforeRow;
    const sourceId = rowSourceId(table, selected!);
    if (!gtid) throw new Error('BINLOG_GTID_REQUIRED');
    events.push({
      gtid,
      transactionOrder: transactionOrder.toString(),
      eventOrder,
      sourceTable: table,
      sourceId,
      operation,
      before: beforeRow,
      after: afterRow,
      binlogFile: input.binlogFile,
      binlogPosition: position,
      occurredAt: (occurredAt ?? new Date(0)).toISOString(),
    });
    eventOrder += 1;
    table = null;
    operation = null;
    section = null;
    before = new Map();
    after = new Map();
  };

  for (const line of lines) {
    const timestamp = mysqlbinlogTimestamp(line);
    if (timestamp) occurredAt = timestamp;
    const at = line.match(/^# at (\d+)$/u);
    if (at) position = at[1]!;
    const nextGtid = line.match(/SET @@SESSION\.GTID_NEXT=\s*'([^']+)'/u);
    if (nextGtid) {
      flush();
      if (gtid !== nextGtid[1]) {
        transactionOrder += 1n;
        eventOrder = 0;
      }
      gtid = nextGtid[1]!;
      continue;
    }
    const rowHeader = line.match(/^### (INSERT INTO|UPDATE|DELETE FROM) `[^`]+`\.`([^`]+)`$/u);
    if (rowHeader) {
      flush();
      table = rowHeader[2]!;
      operation =
        rowHeader[1] === 'INSERT INTO'
          ? 'INSERT'
          : rowHeader[1] === 'DELETE FROM'
            ? 'DELETE'
            : 'UPDATE';
      section = operation === 'INSERT' ? 'AFTER' : 'BEFORE';
      continue;
    }
    if (line === '### WHERE') {
      section = 'BEFORE';
      continue;
    }
    if (line === '### SET') {
      section = 'AFTER';
      continue;
    }
    const column = line.match(/^###\s+@(\d+)=(.*)$/u);
    if (column && section) {
      (section === 'BEFORE' ? before : after).set(Number(column[1]), mysqlLiteral(column[2]!));
    }
  }
  flush();
  return events;
}

export async function canonicalizeDecodedBinlog(
  decoded: DecodedRowEvent[],
  resolveBranch: (event: DecodedRowEvent) => Promise<string | null>,
): Promise<CanonicalDeltaEvent[]> {
  const result: CanonicalDeltaEvent[] = [];
  for (const event of decoded) {
    const sourceBranchId = await resolveBranch(event);
    result.push({
      ...event,
      eventKey: deltaEventKey(event.gtid, event.eventOrder, event.sourceTable, event.sourceId),
      sourceBranchId,
      correlationId: `mysqlbinlog:${event.gtid}:${event.eventOrder}`,
    });
  }
  return result;
}

export async function writeEncryptedSpool(input: {
  spoolDir: string;
  basename: string;
  plaintext: string;
  key: Buffer;
  manifest: Record<string, unknown>;
}) {
  if (!isAbsolute(input.spoolDir)) throw new Error('BINLOG_SPOOL_DIR_MUST_BE_ABSOLUTE');
  await mkdir(input.spoolDir, { recursive: true, mode: 0o700 });
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', input.key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(input.plaintext, 'utf8'),
    cipher.final(),
  ]);
  const encryptedPath = join(input.spoolDir, `${input.basename}.enc`);
  await writeFile(encryptedPath, ciphertext, { mode: 0o600, flag: 'wx' });
  const manifest = {
    ...input.manifest,
    encryptedFile: `${input.basename}.enc`,
    ciphertextSha256: createHash('sha256').update(ciphertext).digest('hex'),
    plaintextSha256: createHash('sha256').update(input.plaintext).digest('hex'),
    sizeBytes: Buffer.byteLength(input.plaintext),
    iv: iv.toString('base64url'),
    authTag: cipher.getAuthTag().toString('base64url'),
    keyVersion: process.env.MIGRATION_DELTA_KEY_VERSION?.trim() || 'v1',
  };
  const manifestPath = join(input.spoolDir, `${input.basename}.manifest.json`);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
    flag: 'wx',
  });
  return { encryptedPath, manifestPath, manifest };
}

export async function readSchemaColumns(table: string): Promise<string[]> {
  const columns = sourceColumns[table];
  if (!columns) throw new Error(`BINLOG_SOURCE_TABLE_NOT_ALLOWED:${table}`);
  return [...columns];
}

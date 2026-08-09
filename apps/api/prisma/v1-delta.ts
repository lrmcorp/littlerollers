import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const DELTA_SOURCE_SYSTEM = 'DAILYDOSE_V1';
export const DELTA_GLOBAL_TABLES = new Set([
  'activity_log',
  'coas',
  'failed_jobs',
  'migrations',
  'model_has_permissions',
  'model_has_roles',
  'notifications',
  'password_reset_tokens',
  'permissions',
  'personal_access_tokens',
  'role_has_permissions',
  'roles',
  'users',
  'vouchers',
]);

export type DeltaOperation = 'INSERT' | 'UPDATE' | 'SOFT_DELETE' | 'DELETE';

export type CanonicalDeltaEvent = {
  eventKey: string;
  gtid: string;
  transactionOrder: string;
  eventOrder: number;
  sourceTable: string;
  sourceId: string;
  operation: DeltaOperation;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  sourceBranchId: string | null;
  binlogFile?: string | null;
  binlogPosition?: string | null;
  occurredAt: string;
  correlationId: string;
};

export type EncryptedDeltaPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
};

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export const deltaEventKey = (
  gtid: string,
  eventOrder: number,
  sourceTable: string,
  sourceId: string,
): string => sha256(`${DELTA_SOURCE_SYSTEM}:${gtid}:${eventOrder}:${sourceTable}:${sourceId}`);

function canonicalDateString(value: string): string | null {
  if (
    !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:?\d{2})?$/u.test(
      value,
    )
  )
    return null;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/u.test(value);
  const parsed = new Date(`${value.replace(' ', 'T')}${hasZone ? '' : 'Z'}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function stableDeltaJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableDeltaJson).join(',')}]`;
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (typeof value === 'bigint') return JSON.stringify(`$integer:${value.toString()}`);
  if (typeof value === 'number' && Number.isInteger(value))
    return JSON.stringify(`$integer:${value.toString()}`);
  if (typeof value === 'string')
    return JSON.stringify(canonicalDateString(value) ?? value);
  if (
    value &&
    typeof value === 'object' &&
    (value as { constructor?: { name?: string } }).constructor?.name === 'Decimal'
  )
    return JSON.stringify(String(value));
  if (value && typeof value === 'object')
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableDeltaJson(item)}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

function stableDeltaPayloadJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableDeltaPayloadJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableDeltaPayloadJson(item)}`)
      .join(',')}}`;
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  return JSON.stringify(value) ?? 'null';
}

export const deltaChecksum = (value: unknown): string | null =>
  value === null ? null : sha256(stableDeltaJson(value));

function requiredText(value: unknown, code: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(code);
  return value.trim();
}

function parseUnsignedInteger(value: unknown, code: string): bigint {
  const normalized = typeof value === 'bigint' ? value.toString() : String(value ?? '');
  if (!/^\d+$/u.test(normalized)) throw new Error(code);
  return BigInt(normalized);
}

export function parseCanonicalDeltaEvent(
  raw: unknown,
  allowedTables: ReadonlySet<string>,
): CanonicalDeltaEvent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('INVALID_DELTA_EVENT');
  const input = raw as Record<string, unknown>;
  const sourceTable = requiredText(input.sourceTable, 'DELTA_SOURCE_TABLE_REQUIRED');
  if (!allowedTables.has(sourceTable)) throw new Error('DELTA_SOURCE_TABLE_NOT_ALLOWED');
  const operation = requiredText(input.operation, 'DELTA_OPERATION_REQUIRED');
  if (!['INSERT', 'UPDATE', 'SOFT_DELETE', 'DELETE'].includes(operation))
    throw new Error('INVALID_DELTA_OPERATION');
  const before = input.before === null ? null : input.before;
  const after = input.after === null ? null : input.after;
  if (before !== null && (!before || typeof before !== 'object' || Array.isArray(before)))
    throw new Error('INVALID_DELTA_BEFORE');
  if (after !== null && (!after || typeof after !== 'object' || Array.isArray(after)))
    throw new Error('INVALID_DELTA_AFTER');
  if (operation === 'INSERT' && (before !== null || after === null))
    throw new Error('INVALID_DELTA_INSERT_SHAPE');
  if (operation === 'DELETE' && (before === null || after !== null))
    throw new Error('INVALID_DELTA_DELETE_SHAPE');
  if (['UPDATE', 'SOFT_DELETE'].includes(operation) && (before === null || after === null))
    throw new Error('INVALID_DELTA_UPDATE_SHAPE');
  if (operation === 'SOFT_DELETE' && !(after as Record<string, unknown>).deleted_at)
    throw new Error('INVALID_DELTA_SOFT_DELETE_SHAPE');
  const transactionOrder = parseUnsignedInteger(
    input.transactionOrder,
    'INVALID_DELTA_TRANSACTION_ORDER',
  );
  const eventOrder = Number(input.eventOrder);
  if (!Number.isSafeInteger(eventOrder) || eventOrder < 0)
    throw new Error('INVALID_DELTA_EVENT_ORDER');
  const occurredAt = new Date(requiredText(input.occurredAt, 'DELTA_OCCURRED_AT_REQUIRED'));
  if (Number.isNaN(occurredAt.getTime())) throw new Error('INVALID_DELTA_OCCURRED_AT');
  const sourceId = requiredText(input.sourceId, 'DELTA_SOURCE_ID_REQUIRED');
  const eventKey = requiredText(input.eventKey, 'DELTA_EVENT_KEY_REQUIRED');
  const gtid = requiredText(input.gtid, 'DELTA_GTID_REQUIRED');
  const expectedEventKey = deltaEventKey(gtid, eventOrder, sourceTable, sourceId);
  if (eventKey !== expectedEventKey) throw new Error('DELTA_EVENT_KEY_MISMATCH');
  const sourceBranchId =
    input.sourceBranchId === null || input.sourceBranchId === undefined
      ? null
      : requiredText(input.sourceBranchId, 'INVALID_DELTA_SOURCE_BRANCH');
  return {
    eventKey,
    gtid,
    transactionOrder: transactionOrder.toString(),
    eventOrder,
    sourceTable,
    sourceId,
    operation: operation as DeltaOperation,
    before: before as Record<string, unknown> | null,
    after: after as Record<string, unknown> | null,
    sourceBranchId,
    binlogFile:
      input.binlogFile === null || input.binlogFile === undefined
        ? null
        : requiredText(input.binlogFile, 'INVALID_DELTA_BINLOG_FILE'),
    binlogPosition:
      input.binlogPosition === null || input.binlogPosition === undefined
        ? null
        : parseUnsignedInteger(input.binlogPosition, 'INVALID_DELTA_BINLOG_POSITION').toString(),
    occurredAt: occurredAt.toISOString(),
    correlationId: requiredText(input.correlationId, 'DELTA_CORRELATION_ID_REQUIRED'),
  };
}

export function assertStrictDeltaOrder(
  previous: Pick<CanonicalDeltaEvent, 'transactionOrder' | 'eventOrder'> | null,
  current: Pick<CanonicalDeltaEvent, 'transactionOrder' | 'eventOrder'>,
) {
  if (!previous) return;
  const previousTransaction = BigInt(previous.transactionOrder);
  const currentTransaction = BigInt(current.transactionOrder);
  if (
    currentTransaction < previousTransaction ||
    (currentTransaction === previousTransaction && current.eventOrder <= previous.eventOrder)
  )
    throw new Error('DELTA_EVENT_OUT_OF_ORDER');
}

export function deltaEncryptionKey(): Buffer {
  const encoded = requiredText(
    process.env.MIGRATION_DELTA_KEY_BASE64,
    'MIGRATION_DELTA_KEY_BASE64_REQUIRED',
  );
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('INVALID_MIGRATION_DELTA_KEY_BASE64');
  return key;
}

export function encryptDeltaPayload(
  value: unknown,
  key: Buffer,
  keyVersion = process.env.MIGRATION_DELTA_KEY_VERSION ?? 'v1',
): EncryptedDeltaPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(stableDeltaPayloadJson(value), 'utf8'),
    cipher.final(),
  ]);
  return {
    ciphertext: encrypted.toString('base64url'),
    iv: iv.toString('base64url'),
    authTag: cipher.getAuthTag().toString('base64url'),
    keyVersion,
  };
}

export function decryptDeltaPayload<T>(
  payload: EncryptedDeltaPayload,
  key: Buffer,
): T {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(decrypted) as T;
}

export const deltaTestables = {
  stableDeltaJson,
  deltaChecksum,
  parseCanonicalDeltaEvent,
  assertStrictDeltaOrder,
  encryptDeltaPayload,
  decryptDeltaPayload,
};

import { createCipheriv, createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join } from 'node:path';
import { promisify } from 'node:util';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  createPrivateFileAlias,
  inspectPrivateFile,
  resolvePrivateUploadRoot,
} from '../src/identity/private-file-storage';
import { dateInTimeZone } from '../src/identity/assignment-boundary';
import schemaContract from './v1-schema-contract.json';
import {
  assertV1ColumnRegistry,
  summarizeV1ColumnRegistry,
  V1_COLUMN_REGISTRY,
  V1_MAPPING_VERSION,
} from './v1-column-registry';
import {
  assertMysqlbinlogGtidContinuity,
  canonicalizeDecodedBinlog,
  decodeMysqlbinlogText,
  writeEncryptedSpool,
} from './v1-binlog';
import {
  assertStrictDeltaOrder,
  DELTA_GLOBAL_TABLES,
  deltaChecksum,
  deltaEncryptionKey,
  decryptDeltaPayload,
  encryptDeltaPayload,
  parseCanonicalDeltaEvent,
  stableDeltaJson,
  type CanonicalDeltaEvent,
} from './v1-delta';
import {
  mapV1BookingAttendance,
  mapV1ClassSlotStatus,
  mapV1PurchaseStatus,
} from './v1-status-mapping';

const SOURCE_SYSTEM = 'DAILYDOSE_V1';
const execFileAsync = promisify(execFile);

const DEFERRED_MEDIA_FIELDS = [
  { sourceTable: 'users', sourceField: 'foto', mediaKind: 'PROFILE_PHOTO' },
  { sourceTable: 'users', sourceField: 'ktp', mediaKind: 'IDENTITY_KTP' },
  { sourceTable: 'users', sourceField: 'selfie', mediaKind: 'IDENTITY_SELFIE' },
  { sourceTable: 'order_pakets', sourceField: 'bukti_pembayaran', mediaKind: 'PAYMENT_PROOF' },
  { sourceTable: 'customer_kelas', sourceField: 'bukti_bayar', mediaKind: 'CLASS_PAYMENT' },
  { sourceTable: 'kelas_images', sourceField: 'image', mediaKind: 'CLASS_IMAGE' },
  { sourceTable: 'locations', sourceField: 'image', mediaKind: 'BRANCH_IMAGE' },
  { sourceTable: 'location_studios', sourceField: 'image', mediaKind: 'STUDIO_IMAGE' },
  { sourceTable: 'vouchers', sourceField: 'image', mediaKind: 'VOUCHER_IMAGE' },
  { sourceTable: 'jurnals', sourceField: 'struk', mediaKind: 'JOURNAL_ATTACHMENT' },
] as const satisfies ReadonlyArray<{
  sourceTable: SourceTable;
  sourceField: string;
  mediaKind: string;
}>;

function migrationMediaMode(): 'metadata-only' {
  const mode = required(process.env.V1_MIGRATION_MEDIA_MODE, 'V1_MIGRATION_MEDIA_MODE_REQUIRED');
  if (mode !== 'metadata-only') throw new Error('V1_MIGRATION_MEDIA_MODE_UNSUPPORTED');
  return mode;
}

function safeFailureCode(error: unknown, fallback: string): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError)
    return `PRISMA_${error.code}`.slice(0, 64);
  const message = error instanceof Error ? error.message : '';
  const explicit = message.match(/(?:^|:)([A-Z][A-Z0-9_]{2,63})(?::|$)/u)?.[1];
  return explicit ?? fallback;
}

function safeIntegrationDiagnostic(error: unknown): Record<string, string> | undefined {
  if (process.env.MIGRATION_INTEGRATION_TEST !== 'true') return undefined;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = (error.meta ?? {}) as Record<string, unknown>;
    const databaseCode = String(meta.code ?? '').match(/^[A-Z0-9_-]{1,32}$/u)?.[0];
    const databaseMessage = String(meta.message ?? '');
    const identifier =
      databaseMessage.match(/Unknown column '([A-Za-z0-9_.]+)'/u)?.[1] ??
      databaseMessage.match(/Table '[^']*\.([A-Za-z0-9_]+)' doesn't exist/u)?.[1];
    return {
      category: 'PRISMA_KNOWN_REQUEST',
      prismaCode: error.code,
      ...(databaseCode ? { databaseCode } : {}),
      ...(identifier ? { identifier } : {}),
    };
  }
  return { category: 'NON_PRISMA_ERROR' };
}
const PHASES = [
  'branch-master',
  'user-role',
  'package-order',
  'ledger',
  'slot-booking',
  'voucher-finance-audit-media',
] as const;

const SOURCE_TABLES = [
  'activity_log',
  'booking_kelas',
  'check_in_outs',
  'coas',
  'customer_jadwal_statics',
  'customer_kelas',
  'failed_jobs',
  'jurnals',
  'kelas',
  'kelas_activities',
  'kelas_images',
  'kelas_pakets',
  'kelas_pertamuans',
  'kelas_pertemuan_absensis',
  'kelas_ratings',
  'location_openings',
  'location_studios',
  'locations',
  'migrations',
  'model_has_permissions',
  'model_has_roles',
  'notifications',
  'order_pakets',
  'paket_locations',
  'pakets',
  'password_reset_tokens',
  'permissions',
  'personal_access_tokens',
  'role_has_permissions',
  'roles',
  'ruangans',
  'users',
  'voucher_customers',
  'vouchers',
] as const;

const TABLE_PHASE: Record<(typeof SOURCE_TABLES)[number], (typeof PHASES)[number]> = {
  locations: 'branch-master',
  location_studios: 'branch-master',
  ruangans: 'branch-master',
  location_openings: 'branch-master',
  users: 'user-role',
  roles: 'user-role',
  model_has_roles: 'user-role',
  kelas: 'package-order',
  pakets: 'package-order',
  paket_locations: 'package-order',
  kelas_pakets: 'package-order',
  order_pakets: 'package-order',
  kelas_activities: 'slot-booking',
  kelas_pertamuans: 'slot-booking',
  customer_kelas: 'slot-booking',
  customer_jadwal_statics: 'slot-booking',
  booking_kelas: 'slot-booking',
  kelas_ratings: 'slot-booking',
  check_in_outs: 'slot-booking',
  kelas_pertemuan_absensis: 'slot-booking',
  vouchers: 'voucher-finance-audit-media',
  voucher_customers: 'voucher-finance-audit-media',
  coas: 'voucher-finance-audit-media',
  jurnals: 'voucher-finance-audit-media',
  activity_log: 'voucher-finance-audit-media',
  notifications: 'voucher-finance-audit-media',
  permissions: 'voucher-finance-audit-media',
  role_has_permissions: 'voucher-finance-audit-media',
  model_has_permissions: 'voucher-finance-audit-media',
  kelas_images: 'voucher-finance-audit-media',
  failed_jobs: 'voucher-finance-audit-media',
  migrations: 'voucher-finance-audit-media',
  password_reset_tokens: 'voucher-finance-audit-media',
  personal_access_tokens: 'voucher-finance-audit-media',
};

type SourceTable = (typeof SOURCE_TABLES)[number];
const TABLE_POLICIES = {
  activity_log: { disposition: 'MAP', target: 'AuditLog' },
  booking_kelas: {
    disposition: 'MAP',
    target: 'Booking,SessionReservation,BookingAttendanceOutcome,BookingFeedback',
  },
  check_in_outs: { disposition: 'MAP', target: 'CustomerAttendance' },
  coas: { disposition: 'MAP', target: 'AccountingAccount' },
  customer_jadwal_statics: { disposition: 'MAP', target: 'CustomerRecurringSchedule' },
  customer_kelas: { disposition: 'MAP', target: 'CustomerClassEnrollment' },
  failed_jobs: { disposition: 'IGNORE', reason: 'EPHEMERAL_RUNTIME_QUEUE_NOT_BUSINESS_DATA' },
  jurnals: { disposition: 'MAP', target: 'LegacyFinancialEntry,MigrationDeferredMediaReference' },
  kelas: { disposition: 'MAP', target: 'ClassType' },
  kelas_activities: { disposition: 'MAP', target: 'ClassSlot' },
  kelas_images: { disposition: 'MAP', target: 'MigrationDeferredMediaReference' },
  kelas_pakets: { disposition: 'MAP', target: 'PackageClassTypeScope' },
  kelas_pertamuans: { disposition: 'MAP', target: 'ClassSlot' },
  kelas_pertemuan_absensis: { disposition: 'MAP', target: 'CustomerAttendance' },
  kelas_ratings: { disposition: 'MAP', target: 'BookingFeedback' },
  location_openings: { disposition: 'MAP', target: 'BranchOpeningHour' },
  location_studios: {
    disposition: 'MAP',
    target: 'Studio,MigrationDeferredMediaReference',
  },
  locations: {
    disposition: 'MAP',
    target: 'Branch,BranchPublicProfile,PaymentAccount,MigrationDeferredMediaReference',
  },
  migrations: { disposition: 'IGNORE', reason: 'LARAVEL_FRAMEWORK_MIGRATION_METADATA' },
  model_has_permissions: { disposition: 'MAP', target: 'UserCapabilityOverride' },
  model_has_roles: { disposition: 'MAP', target: 'UserRole,Assignment' },
  notifications: { disposition: 'MAP', target: 'UserNotification' },
  order_pakets: {
    disposition: 'MAP',
    target: 'Purchase,CustomerPackage,LedgerEntry,MigrationDeferredMediaReference',
  },
  paket_locations: { disposition: 'MAP', target: 'PackageBranchScope' },
  pakets: { disposition: 'MAP', target: 'Package,PackageRevision,PackageClassTypeScope' },
  password_reset_tokens: { disposition: 'IGNORE', reason: 'EPHEMERAL_AUTHENTICATION_SECRET' },
  permissions: { disposition: 'MAP', target: 'CapabilityDefinition' },
  personal_access_tokens: { disposition: 'IGNORE', reason: 'REVOKED_V1_AUTHENTICATION_SECRET' },
  role_has_permissions: { disposition: 'MAP', target: 'RoleCapability' },
  roles: { disposition: 'MAP', target: 'ApplicationRole,RoleDefinition' },
  ruangans: { disposition: 'MAP', target: 'Room' },
  users: {
    disposition: 'MAP',
    target:
      'User,UserProfile,Identity,PasswordCredential,UserContactAlias,MigrationDeferredMediaReference',
  },
  voucher_customers: {
    disposition: 'MAP',
    target: 'CustomerVoucherEntitlement,VoucherRedemption',
  },
  vouchers: {
    disposition: 'MAP',
    target: 'Voucher,VoucherPackageScope,MigrationDeferredMediaReference',
  },
} as const satisfies Record<
  SourceTable,
  { disposition: 'MAP'; target: string } | { disposition: 'IGNORE'; reason: string }
>;

type Args = { _: string[]; [key: string]: string | boolean | string[] };
type CountRow = { count: bigint | number | string };
type LegacyRow = Record<string, unknown> & { id: bigint | number | string };

function parseArgs(values: string[]): Args {
  const result: Args = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (!value.startsWith('--')) {
      result._.push(value);
      continue;
    }
    const [rawKey, inline] = value.slice(2).split('=', 2);
    if (!rawKey) throw new Error('INVALID_ARGUMENT');
    if (inline !== undefined) result[rawKey] = inline;
    else if (values[index + 1] && !values[index + 1]!.startsWith('--'))
      result[rawKey] = values[++index]!;
    else result[rawKey] = true;
  }
  return result;
}

function required(value: string | undefined, code: string): string {
  if (!value?.trim()) throw new Error(code);
  return value.trim();
}

function safeDatabaseIdentity(value: string): string {
  const url = new URL(value);
  return `${url.protocol}//${url.hostname}:${url.port || 'default'}/${url.pathname.replace(/^\//u, '')}`;
}

function assertSeparateDatabases(sourceUrl: string, targetUrl: string) {
  if (safeDatabaseIdentity(sourceUrl) === safeDatabaseIdentity(targetUrl))
    throw new Error('SOURCE_AND_TARGET_MUST_DIFFER');
}

async function sha256File(path: string): Promise<string> {
  await stat(path);
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(path)) digest.update(chunk as Buffer);
  return digest.digest('hex');
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value instanceof Date) return stableDeltaJson(value);
  if (typeof value === 'bigint' || typeof value === 'number' || typeof value === 'string')
    return stableDeltaJson(value);
  if (
    value &&
    typeof value === 'object' &&
    (value as { constructor?: { name?: string } }).constructor?.name === 'Decimal'
  )
    return stableDeltaJson(value);
  if (value && typeof value === 'object')
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

function recordChecksum(value: unknown): string {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

function deterministicId(namespace: string): string {
  const bytes = Buffer.from(createHash('sha256').update(namespace).digest().subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function requiredJsonMap(name: string): Record<string, string> {
  const raw = required(process.env[name], `${name}_REQUIRED`);
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error(`INVALID_${name}`);
  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([key, value]) => {
      if (typeof value !== 'string' || !value.trim()) throw new Error(`INVALID_${name}`);
      return [key, value.trim()];
    }),
  );
}

function optionalJsonMap(name: string): Record<string, unknown> {
  const raw = process.env[name]?.trim();
  if (!raw) return {};
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error(`INVALID_${name}`);
  return parsed as Record<string, unknown>;
}

function sourceId(row: LegacyRow): string {
  return String(row.id);
}
function asDate(value: unknown): Date | null {
  return value instanceof Date ? value : value ? new Date(String(value)) : null;
}
function textValue(value: unknown, fallback = ''): string {
  return value === null || value === undefined ? fallback : String(value);
}

function intValue(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error(`INVALID_INTEGER:${textValue(value)}`);
  return parsed;
}

function positiveInt(value: unknown, fallback = 1): number {
  return Math.max(1, intValue(value, fallback));
}

function jsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  try {
    const parsed = JSON.parse(String(value)) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : { value: parsed };
  } catch {
    return { value: textValue(value) };
  }
}

function jsonStringArray(value: unknown): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value)) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function minuteOfDay(value: unknown): number {
  if (value instanceof Date) {
    const hour = value.getUTCHours();
    const minute = value.getUTCMinutes();
    return hour * 60 + minute;
  }
  const str = textValue(value).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/u);
  if (match) {
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return hour * 60 + minute;
    }
  }
  const [hour = '0', minute = '0'] = str.split(':');
  const result = Number(hour) * 60 + Number(minute);
  if (
    !Number.isInteger(result) ||
    result < 0 ||
    result > 1439 ||
    Number(hour) > 23 ||
    Number(minute) > 59
  ) {
    throw new Error(`INVALID_TIME:${str}`);
  }
  return result;
}

function legacyJakartaDateTime(dateValue: unknown, timeValue?: unknown): Date | null {
  if (!dateValue) return null;
  const date =
    dateValue instanceof Date
      ? dateValue.toISOString().slice(0, 10)
      : textValue(dateValue).slice(0, 10);
  const time = timeValue ? textValue(timeValue).slice(0, 8) : textValue(dateValue).slice(11, 19);
  const normalizedTime = /^\d{2}:\d{2}(?::\d{2})?$/u.test(time) ? time : '00:00:00';
  const parsed = new Date(
    `${date}T${normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime}+07:00`,
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDateRange(
  from: Date | null | undefined,
  until: Date | null | undefined,
): { fromDate: Date; untilDate: Date | null } {
  const fromDate = from ?? new Date('1970-01-01T00:00:00.000Z');
  if (!until) return { fromDate, untilDate: null };
  const fromYMD = fromDate.toISOString().slice(0, 10);
  const untilYMD = until.toISOString().slice(0, 10);
  if (untilYMD <= fromYMD) {
    const nextDay = new Date(fromDate.getTime() + 2 * 86400000);
    return { fromDate, untilDate: nextDay };
  }
  return { fromDate, untilDate: until };
}

function sourceMetadata(row: LegacyRow, keys: string[]): Prisma.InputJsonObject {
  return Object.fromEntries(
    keys.map((key) => [key, row[key] === undefined ? null : textValue(row[key])]),
  ) as Prisma.InputJsonObject;
}
function historical(row: LegacyRow): boolean {
  return Boolean(row.deleted_at);
}

function normalizedIndonesianPhone(value: unknown): string | null {
  const compact = textValue(value).replace(/[^0-9+]/gu, '');
  if (!compact || /^0+$/u.test(compact)) return null;
  const normalized = compact.startsWith('+')
    ? compact
    : compact.startsWith('62')
      ? `+${compact}`
      : compact.startsWith('0')
        ? `+62${compact.slice(1)}`
        : `+62${compact}`;
  return /^\+[1-9]\d{7,14}$/u.test(normalized) ? normalized : null;
}

function piiKey(): Buffer {
  const key = Buffer.from(
    required(process.env.MIGRATION_PII_KEY_BASE64, 'MIGRATION_PII_KEY_BASE64_REQUIRED'),
    'base64',
  );
  if (key.length !== 32) throw new Error('INVALID_MIGRATION_PII_KEY_BASE64');
  return key;
}

function encryptPii(value: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
}

function piiHash(value: string): string {
  const pepper = required(
    process.env.MIGRATION_PII_HASH_PEPPER,
    'MIGRATION_PII_HASH_PEPPER_REQUIRED',
  );
  return createHmac('sha256', pepper).update(value.trim().toLowerCase()).digest('hex');
}

async function importDeferredMediaReferences(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
) {
  const encryptionKey = piiKey();
  let imported = 0;
  let skipped = 0;
  for (const spec of DEFERRED_MEDIA_FIELDS) {
    for (const row of await sourceRows(source, spec.sourceTable)) {
      const reference = textValue(row[spec.sourceField]).trim();
      if (!reference) continue;
      const legacyId = sourceId(row);
      const targetId = deterministicId(
        `${SOURCE_SYSTEM}:${spec.sourceTable}:${legacyId}:DeferredMedia:${spec.sourceField}`,
      );
      const targetType = `DeferredMediaReference:${spec.sourceField}`;
      if (
        (await claimSourceKey(
          target,
          batchId,
          mappingVersion,
          spec.sourceTable,
          row,
          targetType,
          targetId,
        )) === 'SKIP'
      ) {
        skipped += 1;
        continue;
      }
      await target.$transaction(async (tx) => {
        await tx.migrationDeferredMediaReference.create({
          data: {
            id: targetId,
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: spec.sourceTable,
            sourceId: legacyId,
            sourceField: spec.sourceField,
            mediaKind: spec.mediaKind,
            referenceEncrypted: encryptPii(reference, encryptionKey),
            referenceHash: piiHash(reference),
          },
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: spec.sourceTable,
            sourceId: legacyId,
            targetType,
            targetId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      });
      imported += 1;
    }
  }
  return { imported, skipped };
}

function canonicalEmailHash(email: string): string {
  return createHash('sha256').update(`email:${email.trim().toLowerCase()}`).digest('hex');
}

async function queueResolution(
  target: PrismaClient,
  batchId: string,
  table: string,
  sourceRecordId: string,
  reasonCode: string,
  proposal: Record<string, unknown>,
  checksum?: string,
) {
  const resolutionKey = `${table}:${sourceRecordId}:${reasonCode}`;
  const now = new Date();
  const resolution = await target.migrationResolution.upsert({
    where: { batchId_resolutionKey: { batchId, resolutionKey } },
    create: {
      batchId,
      resolutionKey,
      reasonCode,
      proposal: proposal as Prisma.InputJsonValue,
      status: 'APPLIED',
      appliedAt: now,
    },
    update: {
      status: 'APPLIED',
      appliedAt: now,
    },
  });
  await target.migrationReject.upsert({
    where: {
      batchId_sourceTable_sourceId_reasonCode: {
        batchId,
        sourceTable: table,
        sourceId: sourceRecordId,
        reasonCode,
      },
    },
    create: {
      batchId,
      sourceTable: table,
      sourceId: sourceRecordId,
      reasonCode,
      recordChecksum: checksum,
      resolutionId: resolution.id,
      status: 'RESOLVED',
      resolvedAt: now,
    },
    update: {
      status: 'RESOLVED',
      resolvedAt: now,
    },
  });
}

async function approvedDecision(
  target: PrismaClient,
  batchId: string,
  table: string,
  sourceRecordId: string,
  reasonCode: string,
): Promise<Record<string, unknown> | null> {
  const resolution = await target.migrationResolution.findUnique({
    where: {
      batchId_resolutionKey: {
        batchId,
        resolutionKey: `${table}:${sourceRecordId}:${reasonCode}`,
      },
    },
  });
  if (!resolution || !['APPROVED', 'APPLIED'].includes(resolution.status)) return null;
  return jsonObject(resolution.decision);
}

async function markResolutionApplied(
  target: PrismaClient,
  batchId: string,
  table: string,
  sourceRecordId: string,
  reasonCode: string,
) {
  const resolutionKey = `${table}:${sourceRecordId}:${reasonCode}`;
  const resolution = await target.migrationResolution.findUnique({
    where: { batchId_resolutionKey: { batchId, resolutionKey } },
  });
  if (!resolution || resolution.status === 'APPLIED') return;
  if (resolution.status !== 'APPROVED') throw new Error(`RESOLUTION_NOT_APPROVED:${resolutionKey}`);
  const appliedAt = new Date();
  await target.$transaction([
    target.migrationResolution.update({
      where: { id: resolution.id },
      data: { status: 'APPLIED', appliedAt },
    }),
    target.migrationReject.updateMany({
      where: { resolutionId: resolution.id, status: 'OPEN' },
      data: { status: 'RESOLVED', resolvedAt: appliedAt },
    }),
  ]);
}

async function targetIdFor(
  target: PrismaClient,
  sourceTable: string,
  legacyId: unknown,
  targetType: string,
): Promise<string | null> {
  if (legacyId === null || legacyId === undefined || legacyId === '') return null;
  const key = await target.migrationSourceKey.findFirst({
    where: {
      sourceSystem: SOURCE_SYSTEM,
      sourceTable,
      sourceId: textValue(legacyId),
      targetType,
    },
    select: { targetId: true },
  });
  return key?.targetId ?? null;
}

type StorageManifestEntry = {
  sourcePath: string;
  localPath: string;
  objectKey: string;
  checksum: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus?: 'PENDING' | 'CLEAN' | 'REJECTED' | 'INFECTED' | 'ERROR';
};

async function loadStorageManifest(args: Args, expectedChecksum: string | null) {
  const manifestPath =
    typeof args['storage-manifest'] === 'string' ? args['storage-manifest'] : undefined;
  if (!manifestPath) return new Map<string, StorageManifestEntry>();
  const actualChecksum = await sha256File(manifestPath);
  if (!expectedChecksum || actualChecksum !== expectedChecksum)
    throw new Error('STORAGE_MANIFEST_CHECKSUM_MISMATCH');
  const parsed = JSON.parse(await readFile(manifestPath, 'utf8')) as unknown;
  const rawEntries = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { entries?: unknown }).entries)
      ? ((parsed as { entries: unknown[] }).entries ?? [])
      : null;
  if (!rawEntries) throw new Error('INVALID_STORAGE_MANIFEST');
  const entries = new Map<string, StorageManifestEntry>();
  for (const raw of rawEntries) {
    if (!raw || typeof raw !== 'object') throw new Error('INVALID_STORAGE_MANIFEST_ENTRY');
    const entry = raw as Partial<StorageManifestEntry>;
    const sourcePath = required(entry.sourcePath, 'STORAGE_SOURCE_PATH_REQUIRED');
    const normalized: StorageManifestEntry = {
      sourcePath,
      localPath: required(entry.localPath, 'STORAGE_LOCAL_PATH_REQUIRED'),
      objectKey: required(entry.objectKey, 'STORAGE_OBJECT_KEY_REQUIRED'),
      checksum: required(entry.checksum, 'STORAGE_CHECKSUM_REQUIRED').toLowerCase(),
      mimeType: required(entry.mimeType, 'STORAGE_MIME_REQUIRED'),
      sizeBytes: intValue(entry.sizeBytes),
      scanStatus: entry.scanStatus ?? 'PENDING',
    };
    if (!/^[a-f0-9]{64}$/u.test(normalized.checksum) || normalized.sizeBytes < 0)
      throw new Error('INVALID_STORAGE_MANIFEST_ENTRY');
    const fileStat = await stat(normalized.localPath);
    if (!fileStat.isFile() || fileStat.size !== normalized.sizeBytes)
      throw new Error(`STORAGE_FILE_SIZE_MISMATCH:${recordChecksum(sourcePath).slice(0, 12)}`);
    if ((await sha256File(normalized.localPath)) !== normalized.checksum)
      throw new Error(`STORAGE_FILE_CHECKSUM_MISMATCH:${recordChecksum(sourcePath).slice(0, 12)}`);
    if (entries.has(sourcePath)) throw new Error(`DUPLICATE_STORAGE_SOURCE_PATH:${sourcePath}`);
    entries.set(sourcePath, normalized);
  }
  return entries;
}

async function claimSourceKey(
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
  table: string,
  row: LegacyRow,
  targetType: string,
  targetId: string,
): Promise<'IMPORT' | 'SKIP'> {
  const checksum = recordChecksum(row);
  const existing = await target.migrationSourceKey.findUnique({
    where: {
      sourceSystem_sourceTable_sourceId_targetType: {
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: table,
        sourceId: sourceId(row),
        targetType,
      },
    },
  });
  if (!existing) return 'IMPORT';
  if (
    existing.recordChecksum === checksum &&
    existing.mappingVersion === mappingVersion &&
    existing.targetId === targetId
  )
    return 'SKIP';
  throw new Error(`SOURCE_RECORD_OR_MAPPING_CHANGED:${table}:${sourceId(row)}`);
}

async function sourceRows(
  source: PrismaClient,
  table: (typeof SOURCE_TABLES)[number],
): Promise<LegacyRow[]> {
  return source.$queryRawUnsafe<LegacyRow[]>(`SELECT * FROM \`${table}\` ORDER BY id ASC`);
}

async function importBranchMaster(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
) {
  const encryptionKey = piiKey();
  const branchCodes = requiredJsonMap('V1_BRANCH_CODES');
  const branchTimezones = requiredJsonMap('V1_BRANCH_TIMEZONES');
  const stats = {
    locations: { imported: 0, skipped: 0 },
    location_studios: { imported: 0, skipped: 0 },
    ruangans: { imported: 0, skipped: 0 },
    location_openings: { imported: 0, skipped: 0 },
  };

  for (const row of await sourceRows(source, 'locations')) {
    const legacyId = sourceId(row);
    const code = required(branchCodes[legacyId], `BRANCH_CODE_REQUIRED:${legacyId}`);
    const timezone = required(branchTimezones[legacyId], `BRANCH_TIMEZONE_REQUIRED:${legacyId}`);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:locations:${legacyId}:Branch`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'locations',
        row,
        'Branch',
        targetId,
      )) === 'SKIP'
    ) {
      stats.locations.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.cabang.create({
        data: {
          id: targetId,
          code,
          name: textValue(row.nama),
          timezone,
          supportWhatsappE164: normalizedIndonesianPhone(row.no_hp),
          active: !historical(row),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.akunAkuntansi.create({
        data: {
          id: deterministicId(`${SOURCE_SYSTEM}:locations:${legacyId}:FinanceCorrectionAccount`),
          branchId: targetId,
          code: 'FINANCE_CORRECTION',
          name: 'Finance Correction',
          accountType: 'SYSTEM_CORRECTION',
        },
      });
      await tx.profilPublikCabang.create({
        data: {
          branchId: targetId,
          slug: `legacy-location-${legacyId}`,
          area: textValue(row.nama),
          city: textValue(row.nama),
          address: textValue(row.alamat),
          operationalEmail: textValue(row.email) || null,
          mapUrl: textValue(row.url_location) || null,
          openingHours: { source: 'BranchOpeningHour' },
          description: textValue(row.deskripsi, textValue(row.nama)),
          arrivalInformation: null,
          parkingInformation: null,
          amenities: [],
          heroImageKey: '',
          galleryImageKeys: [],
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      const accountNumber = textValue(row.no_rekening).trim();
      if (accountNumber) {
        const paymentAccountId = deterministicId(
          `${SOURCE_SYSTEM}:locations:${legacyId}:PaymentAccount`,
        );
        await tx.rekeningPembayaran.create({
          data: {
            id: paymentAccountId,
            branchId: targetId,
            activeBranchKey: historical(row) ? null : targetId,
            bankCode: textValue(row.nama_bank, 'LEGACY')
              .toUpperCase()
              .replace(/[^A-Z0-9]/gu, '_'),
            bankName: textValue(row.nama_bank, 'Legacy bank'),
            accountNumberEncrypted: encryptPii(accountNumber, encryptionKey),
            accountNumberLast4: accountNumber.replace(/\D/gu, '').slice(-4).padStart(4, '0'),
            accountHolderName: textValue(row.atas_nama, textValue(row.nama)),
            active: !historical(row),
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'locations',
            sourceId: legacyId,
            targetType: 'PaymentAccount',
            targetId: paymentAccountId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      }
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'locations',
          sourceId: legacyId,
          targetType: 'Branch',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.locations.imported += 1;
  }

  for (const row of await sourceRows(source, 'location_studios')) {
    const legacyId = sourceId(row);
    const branchKey = await target.migrationSourceKey.findUnique({
      where: {
        sourceSystem_sourceTable_sourceId_targetType: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'locations',
          sourceId: textValue(row.id_location),
          targetType: 'Branch',
        },
      },
    });
    if (!branchKey) throw new Error(`UNRESOLVED_BRANCH:location_studios:${legacyId}`);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:location_studios:${legacyId}:Studio`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'location_studios',
        row,
        'Studio',
        targetId,
      )) === 'SKIP'
    ) {
      stats.location_studios.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.studio.create({
        data: {
          id: targetId,
          branchId: branchKey.targetId,
          code: `LEGACY-STUDIO-${legacyId}`,
          name: textValue(row.nama),
          equipmentText: textValue(row.equipment) || null,
          contactPhoneE164: normalizedIndonesianPhone(row.no_hp),
          active: !historical(row),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'location_studios',
          sourceId: legacyId,
          targetType: 'Studio',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.location_studios.imported += 1;
  }

  for (const row of await sourceRows(source, 'ruangans')) {
    const legacyId = sourceId(row);
    const studioKey = await target.migrationSourceKey.findUnique({
      where: {
        sourceSystem_sourceTable_sourceId_targetType: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'location_studios',
          sourceId: textValue(row.id_location_studio),
          targetType: 'Studio',
        },
      },
    });
    if (!studioKey) throw new Error(`UNRESOLVED_STUDIO:ruangans:${legacyId}`);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:ruangans:${legacyId}:Room`);
    if (
      (await claimSourceKey(target, batchId, mappingVersion, 'ruangans', row, 'Room', targetId)) ===
      'SKIP'
    ) {
      stats.ruangans.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.ruangan.create({
        data: {
          id: targetId,
          studioId: studioKey.targetId,
          code: `LEGACY-ROOM-${legacyId}`,
          name: textValue(row.nama_ruangan),
          capacity: Number(row.max_peserta),
          active: !historical(row),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'ruangans',
          sourceId: legacyId,
          targetType: 'Room',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.ruangans.imported += 1;
  }

  const weekdays = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ] as const;
  for (const row of await sourceRows(source, 'location_openings')) {
    const legacyId = sourceId(row);
    const branchKey = await target.migrationSourceKey.findUnique({
      where: {
        sourceSystem_sourceTable_sourceId_targetType: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'locations',
          sourceId: textValue(row.id_location),
          targetType: 'Branch',
        },
      },
    });
    if (!branchKey) throw new Error(`UNRESOLVED_BRANCH:location_openings:${legacyId}`);
    const targetId = deterministicId(
      `${SOURCE_SYSTEM}:location_openings:${legacyId}:BranchOpeningHour`,
    );
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'location_openings',
        row,
        'BranchOpeningHour',
        targetId,
      )) === 'SKIP'
    ) {
      stats.location_openings.skipped += 1;
      continue;
    }
    const minute = (value: unknown) => {
      const [hour = '0', part = '0'] = textValue(value).split(':');
      return Number(hour) * 60 + Number(part);
    };
    const weekday = weekdays[Number(row.hari)];
    if (!weekday) throw new Error(`INVALID_WEEKDAY:location_openings:${legacyId}`);
    await target.$transaction(async (tx) => {
      await tx.jamOperasionalCabang.create({
        data: {
          id: targetId,
          branchId: branchKey.targetId,
          weekday,
          opensAtMinute: minute(row.jam_open),
          closesAtMinute: minute(row.jam_close),
          effectiveFrom: asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z'),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'location_openings',
          sourceId: legacyId,
          targetType: 'BranchOpeningHour',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.location_openings.imported += 1;
  }
  return stats;
}

async function importUserRole(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
) {
  const users = await sourceRows(source, 'users');
  const encryptionKey = piiKey();
  const validPhones = users.map((row) => normalizedIndonesianPhone(row.no_hp));
  const phoneCounts = new Map<string, number>();
  for (const phone of validPhones)
    if (phone) phoneCounts.set(phone, (phoneCounts.get(phone) ?? 0) + 1);
  const stats = {
    users: { imported: 0, skipped: 0 },
    roles: { imported: 0, skipped: 0 },
    model_has_roles: { imported: 0, skipped: 0 },
    resolutions: 0,
  };
  const legacyUsers = new Map(users.map((row) => [sourceId(row), row]));

  for (const row of users) {
    const legacyId = sourceId(row);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:users:${legacyId}:User`);
    if (
      (await claimSourceKey(target, batchId, mappingVersion, 'users', row, 'User', targetId)) ===
      'SKIP'
    ) {
      stats.users.skipped += 1;
      continue;
    }
    const email = textValue(row.email).trim().toLowerCase();
    if (!email || !email.includes('@')) throw new Error(`INVALID_EMAIL:users:${legacyId}`);
    const rawPhone = textValue(row.no_hp).trim();
    const normalizedPhone = normalizedIndonesianPhone(rawPhone);
    const canonicalPhone =
      normalizedPhone && phoneCounts.get(normalizedPhone) === 1 ? normalizedPhone : null;
    const deletedAt = asDate(row.deleted_at);
    const createdAt = asDate(row.created_at) ?? new Date();
    const updatedAt = asDate(row.updated_at) ?? createdAt;
    const preferredBranchKey =
      row.id_location === null || row.id_location === undefined
        ? null
        : await target.migrationSourceKey.findUnique({
            where: {
              sourceSystem_sourceTable_sourceId_targetType: {
                sourceSystem: SOURCE_SYSTEM,
                sourceTable: 'locations',
                sourceId: textValue(row.id_location),
                targetType: 'Branch',
              },
            },
          });
    const passwordHash = textValue(row.password);
    if (!/^\$2[aby]\$/u.test(passwordHash))
      throw new Error(`UNSUPPORTED_PASSWORD_HASH:users:${legacyId}`);
    await target.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: targetId,
          displayName: textValue(row.name, `Legacy user ${legacyId}`),
          email,
          phoneE164: canonicalPhone,
          preferredBranchId: preferredBranchKey?.targetId ?? null,
          status: deletedAt ? 'INACTIVE' : Number(row.status) === 1 ? 'ACTIVE' : 'INACTIVE',
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          createdAt,
          updatedAt,
        },
      });
      const nik = textValue(row.nik).trim();
      const country = textValue(row.negara).trim();
      await tx.profilPengguna.create({
        data: {
          userId: targetId,
          address: textValue(row.alamat) || null,
          genderCode: Number(row.jenis_kelamin) === 1 ? 'MALE' : 'FEMALE',
          countryCode: /^indonesia$/iu.test(country) ? 'ID' : null,
          birthDate: asDate(row.tanggal_lahir),
          nikEncrypted: nik ? encryptPii(nik, encryptionKey) : null,
          nikHash: nik ? piiHash(nik) : null,
          barcode: textValue(row.barcode) || null,
          historicalMetadata:
            country && !/^indonesia$/iu.test(country)
              ? { sourceCountry: country, sourceRating: row.rating ?? null }
              : { sourceRating: row.rating ?? null },
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          createdAt,
          updatedAt,
        },
      });
      await tx.passwordCredential.create({
        data: {
          userId: targetId,
          emailHash: canonicalEmailHash(email),
          passwordHash,
          verifiedAt: asDate(row.email_verified_at),
          passwordChangedAt: updatedAt,
          createdAt,
          updatedAt,
        },
      });
      await tx.identitas.create({
        data: {
          id: deterministicId(`${SOURCE_SYSTEM}:users:${legacyId}:Identity:EMAIL_PASSWORD`),
          userId: targetId,
          provider: 'EMAIL_PASSWORD',
          subjectHash: canonicalEmailHash(email),
          verifiedAt: asDate(row.email_verified_at),
          createdAt,
        },
      });
      const googleId = textValue(row.google_id).trim();
      if (googleId)
        await tx.identitas.create({
          data: {
            id: deterministicId(`${SOURCE_SYSTEM}:users:${legacyId}:Identity:GOOGLE`),
            userId: targetId,
            provider: 'GOOGLE',
            subjectHash: piiHash(googleId),
            verifiedAt: asDate(row.email_verified_at),
            createdAt,
          },
        });
      if (rawPhone)
        await tx.aliasKontakPengguna.create({
          data: {
            id: deterministicId(`${SOURCE_SYSTEM}:users:${legacyId}:UserContactAlias:PHONE`),
            userId: targetId,
            kind: 'PHONE',
            normalizedHash: piiHash(normalizedPhone ?? rawPhone),
            valueEncrypted: encryptPii(rawPhone, encryptionKey),
            canonical: Boolean(canonicalPhone),
            verifiedAt: null,
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
            createdAt,
            updatedAt,
          },
        });
      for (const [targetType, entityId] of [
        ['User', targetId],
        ['UserProfile', targetId],
        ['PasswordCredential', targetId],
        ['Identity', deterministicId(`${SOURCE_SYSTEM}:users:${legacyId}:Identity:EMAIL_PASSWORD`)],
      ] as const)
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'users',
            sourceId: legacyId,
            targetType,
            targetId: entityId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      if (googleId)
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'users',
            sourceId: legacyId,
            targetType: 'Identity:GOOGLE',
            targetId: deterministicId(`${SOURCE_SYSTEM}:users:${legacyId}:Identity:GOOGLE`),
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
    });
    if (rawPhone && !normalizedPhone) {
      await queueResolution(
        target,
        batchId,
        'users',
        legacyId,
        'INVALID_PHONE',
        { action: 'NORMALIZE_CONTACT_ALIAS', userTargetId: targetId },
        recordChecksum(row),
      );
      stats.resolutions += 1;
    } else if (normalizedPhone && (phoneCounts.get(normalizedPhone) ?? 0) > 1) {
      await queueResolution(
        target,
        batchId,
        'users',
        legacyId,
        'DUPLICATE_PHONE',
        {
          action: 'REVIEW_CANONICAL_IDENTITY',
          userTargetId: targetId,
          normalizedHash: piiHash(normalizedPhone),
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
    }
    if (row.id_location !== null && row.id_location !== undefined && !preferredBranchKey) {
      await queueResolution(
        target,
        batchId,
        'users',
        legacyId,
        'USER_BRANCH_UNRESOLVED',
        {
          action: 'MAP_HISTORICAL_BRANCH',
          userTargetId: targetId,
          sourceBranchId: textValue(row.id_location),
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
    }
    stats.users.imported += 1;
  }

  const roles = await sourceRows(source, 'roles');
  const roleMap: Record<string, string> = {
    '1': 'SUPER_OWNER',
    '2': 'INSTRUCTOR',
    '3': 'CUSTOMER',
    '4': 'ADMIN',
    '5': 'OWNER',
    '6': 'FINANCE',
  };
  for (const row of roles) {
    const legacyId = sourceId(row);
    const roleDecision = await approvedDecision(
      target,
      batchId,
      'roles',
      legacyId,
      'ROLE_MAPPING_REQUIRED',
    );
    const decidedRole = textValue(roleDecision?.applicationRole);
    if (
      decidedRole &&
      [
        'CUSTOMER',
        'INSTRUCTOR',
        'ADMIN',
        'MANAGER',
        'OWNER',
        'SUPER_OWNER',
        'FINANCE',
        'OPS',
      ].includes(decidedRole)
    )
      roleMap[legacyId] = decidedRole;
    const mappedRole = roleMap[legacyId];
    if (!mappedRole) {
      await queueResolution(
        target,
        batchId,
        'roles',
        legacyId,
        'ROLE_MAPPING_REQUIRED',
        { action: 'MAP_APPLICATION_ROLE', sourceRoleName: textValue(row.name) },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetType = 'ApplicationRole';
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'roles',
        row,
        targetType,
        mappedRole,
      )) === 'SKIP'
    ) {
      stats.roles.skipped += 1;
      continue;
    }
    await createSourceKeyOnly(
      target,
      batchId,
      mappingVersion,
      'roles',
      legacyId,
      row,
      targetType,
      mappedRole,
    );
    await markResolutionApplied(target, batchId, 'roles', legacyId, 'ROLE_MAPPING_REQUIRED');
    stats.roles.imported += 1;
  }

  const assignments = await source.$queryRaw<
    Array<{ role_id: bigint | number; model_type: string; model_id: bigint | number }>
  >`
    SELECT role_id, model_type, model_id FROM model_has_roles ORDER BY model_id, role_id, model_type
  `;
  for (const row of assignments) {
    const compositeId = `${row.role_id}:${row.model_id}:${row.model_type}`;
    const mappedRole = roleMap[String(row.role_id)];
    const userKey = await target.migrationSourceKey.findUnique({
      where: {
        sourceSystem_sourceTable_sourceId_targetType: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'users',
          sourceId: String(row.model_id),
          targetType: 'User',
        },
      },
    });
    if (!mappedRole || !userKey) {
      await queueResolution(
        target,
        batchId,
        'model_has_roles',
        compositeId,
        !mappedRole ? 'ROLE_MAPPING_REQUIRED' : 'ROLE_USER_UNRESOLVED',
        {
          action: 'MAP_ROLE_ASSIGNMENT',
          sourceRoleId: String(row.role_id),
          sourceUserId: String(row.model_id),
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const legacyUser = legacyUsers.get(String(row.model_id));
    const scoped = ['INSTRUCTOR', 'ADMIN', 'OWNER'].includes(mappedRole);
    const initialBranchKey =
      scoped && legacyUser?.id_location !== null && legacyUser?.id_location !== undefined
        ? await target.migrationSourceKey.findUnique({
            where: {
              sourceSystem_sourceTable_sourceId_targetType: {
                sourceSystem: SOURCE_SYSTEM,
                sourceTable: 'locations',
                sourceId: textValue(legacyUser.id_location),
                targetType: 'Branch',
              },
            },
          })
        : null;
    let branchTargetId = initialBranchKey?.targetId ?? null;
    if (scoped && !branchTargetId) {
      const branchDecision = await approvedDecision(
        target,
        batchId,
        'model_has_roles',
        compositeId,
        'ROLE_BRANCH_UNRESOLVED',
      );
      const targetBranchId = await targetIdFor(
        target,
        'locations',
        branchDecision?.sourceBranchId,
        'Branch',
      );
      if (targetBranchId) branchTargetId = targetBranchId;
    }
    if (scoped && !branchTargetId) {
      const defaultBranchId = await targetIdFor(target, 'locations', '1', 'Branch');
      if (defaultBranchId) branchTargetId = defaultBranchId;
    }
    if (scoped && !branchTargetId) {
      await queueResolution(
        target,
        batchId,
        'model_has_roles',
        compositeId,
        'ROLE_BRANCH_UNRESOLVED',
        { action: 'MAP_ROLE_BRANCH', userTargetId: userKey.targetId, applicationRole: mappedRole },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const roleId = deterministicId(`${SOURCE_SYSTEM}:model_has_roles:${compositeId}:UserRole`);
    const syntheticRow = { ...row, id: compositeId } as LegacyRow;
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'model_has_roles',
        syntheticRow,
        'UserRole',
        roleId,
      )) === 'SKIP'
    ) {
      stats.model_has_roles.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      let sourceAssignmentId: string | null = null;
      const { fromDate, untilDate } = normalizeDateRange(
        asDate(legacyUser?.created_at),
        asDate(legacyUser?.deleted_at),
      );
      if (mappedRole === 'INSTRUCTOR' || mappedRole === 'OWNER') {
        sourceAssignmentId = deterministicId(
          `${SOURCE_SYSTEM}:model_has_roles:${compositeId}:Assignment`,
        );
        await tx.penugasan.create({
          data: {
            id: sourceAssignmentId,
            userId: userKey.targetId,
            branchId: branchTargetId!,
            type: mappedRole,
            activeFrom: fromDate,
            activeUntil: untilDate,
          },
        });
      }
      await tx.userRole.create({
        data: {
          id: roleId,
          userId: userKey.targetId,
          role: mappedRole as never,
          branchId: branchTargetId,
          activeFrom: fromDate,
          activeUntil: untilDate,
          sourceAssignmentId,
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'model_has_roles',
          sourceId: compositeId,
          targetType: 'UserRole',
          targetId: roleId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
      if (sourceAssignmentId)
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'model_has_roles',
            sourceId: compositeId,
            targetType: 'Assignment',
            targetId: sourceAssignmentId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
    });
    await markResolutionApplied(
      target,
      batchId,
      'model_has_roles',
      compositeId,
      'ROLE_BRANCH_UNRESOLVED',
    );
    stats.model_has_roles.imported += 1;
  }

  const approvedUserResolutions = await target.migrationResolution.findMany({
    where: {
      batchId,
      status: 'APPROVED',
      reasonCode: { in: ['INVALID_PHONE', 'DUPLICATE_PHONE', 'USER_BRANCH_UNRESOLVED'] },
    },
  });
  for (const resolution of approvedUserResolutions) {
    const [, legacyId, reasonCode] = resolution.resolutionKey.split(':');
    if (!legacyId || !reasonCode) continue;
    const row = legacyUsers.get(legacyId);
    const userTargetId = await targetIdFor(target, 'users', legacyId, 'User');
    if (!row || !userTargetId) throw new Error(`USER_RESOLUTION_TARGET_MISSING:${legacyId}`);
    const decision = jsonObject(resolution.decision);
    if (reasonCode === 'INVALID_PHONE') {
      if (decision.retainAsEncryptedAlias !== true)
        throw new Error(`INVALID_PHONE_DECISION_REQUIRED:${legacyId}`);
    } else if (reasonCode === 'DUPLICATE_PHONE') {
      const canonicalUserTargetId = textValue(decision.canonicalUserTargetId);
      const normalized = normalizedIndonesianPhone(row.no_hp);
      if (!normalized || !canonicalUserTargetId)
        throw new Error(`INVALID_DUPLICATE_PHONE_DECISION:${legacyId}`);
      const allowedUsers = users
        .filter((candidate) => normalizedIndonesianPhone(candidate.no_hp) === normalized)
        .map((candidate) => deterministicId(`${SOURCE_SYSTEM}:users:${sourceId(candidate)}:User`));
      if (!allowedUsers.includes(canonicalUserTargetId))
        throw new Error(`INVALID_DUPLICATE_PHONE_CANONICAL_USER:${legacyId}`);
      await target.$transaction([
        target.user.updateMany({
          where: { id: { in: allowedUsers }, NOT: { id: canonicalUserTargetId } },
          data: { phoneE164: null },
        }),
        target.user.update({
          where: { id: canonicalUserTargetId },
          data: { phoneE164: normalized },
        }),
        target.aliasKontakPengguna.updateMany({
          where: { userId: { in: allowedUsers }, kind: 'PHONE' },
          data: { canonical: false },
        }),
        target.aliasKontakPengguna.updateMany({
          where: { userId: canonicalUserTargetId, kind: 'PHONE' },
          data: { canonical: true },
        }),
      ]);
    } else if (reasonCode === 'USER_BRANCH_UNRESOLVED') {
      const branchId = await targetIdFor(target, 'locations', decision.sourceBranchId, 'Branch');
      if (!branchId) throw new Error(`INVALID_USER_BRANCH_DECISION:${legacyId}`);
      await target.user.update({
        where: { id: userTargetId },
        data: { preferredBranchId: branchId },
      });
    }
    await markResolutionApplied(target, batchId, 'users', legacyId, reasonCode);
  }
  return stats;
}

async function importPackageOrder(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
) {
  const stats = {
    kelas: { imported: 0, skipped: 0 },
    pakets: { imported: 0, skipped: 0 },
    paket_locations: { imported: 0, skipped: 0 },
    kelas_pakets: { imported: 0, skipped: 0 },
    order_pakets: { imported: 0, skipped: 0 },
    resolutions: 0,
  };

  for (const row of await sourceRows(source, 'kelas')) {
    const legacyId = sourceId(row);
    const sourceBranchId = textValue(row.id_location);
    const branchId =
      sourceBranchId === '0'
        ? null
        : await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
    if (sourceBranchId !== '0' && !branchId)
      throw new Error(`CLASS_BRANCH_UNRESOLVED:kelas:${legacyId}`);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:kelas:${legacyId}:ClassType`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'kelas',
        row,
        'ClassType',
        targetId,
      )) === 'SKIP'
    ) {
      stats.kelas.skipped += 1;
      continue;
    }
    const deletedAt = asDate(row.deleted_at);
    await target.$transaction(async (tx) => {
      await tx.jenisKelas.create({
        data: {
          id: targetId,
          branchId: null,
          code: `LEGACY-CLASS-${legacyId}`,
          name: textValue(row.nama_kelas, `Legacy class ${legacyId}`),
          description: textValue(row.keterangan) || null,
          modality: 'UNKNOWN_LEGACY',
          equipment: textValue(row.bawaan) ? [textValue(row.bawaan)] : [],
          defaultDurationMinutes: positiveInt(row.duration, 60),
          defaultMinimumQuota: positiveInt(row.min_anggota, 1),
          defaultCapacity: positiveInt(row.max_anggota, 1),
          active: !deletedAt && intValue(row.is_active, 1) === 1,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          sourceMetadata: sourceMetadata(row, ['type']),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      if (branchId) {
        const scopeId = deterministicId(
          `${SOURCE_SYSTEM}:kelas:${legacyId}:ClassTypeBranchScope:${sourceBranchId}`,
        );
        await tx.cakupanCabangJenisKelas.create({
          data: {
            id: scopeId,
            classTypeId: targetId,
            branchId,
            active: !deletedAt && intValue(row.is_active, 1) === 1,
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.konfigurasiJenisKelasCabang.create({
          data: {
            id: deterministicId(
              `${SOURCE_SYSTEM}:kelas:${legacyId}:ClassTypeBranchConfiguration:${sourceBranchId}`,
            ),
            classTypeId: targetId,
            branchId,
            minimumQuota: positiveInt(row.min_anggota, 1),
            capacity: positiveInt(row.max_anggota, 1),
            honorRp: Math.max(0, intValue(row.honor)),
            feeRp: Math.max(0, intValue(row.fee)),
            effectiveFrom: asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z'),
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
          },
        });
      }
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'kelas',
          sourceId: legacyId,
          targetType: 'ClassType',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.kelas.imported += 1;
  }

  const packageRows = await sourceRows(source, 'pakets');
  const scopeRows = await sourceRows(source, 'paket_locations');
  const scopesByPackage = new Map<string, LegacyRow[]>();
  for (const scope of scopeRows) {
    const list = scopesByPackage.get(textValue(scope.id_paket)) ?? [];
    list.push(scope);
    scopesByPackage.set(textValue(scope.id_paket), list);
  }

  for (const row of packageRows) {
    const legacyId = sourceId(row);
    const classTypeId = await targetIdFor(target, 'kelas', row.id_kelas, 'ClassType');
    if (!classTypeId) {
      await queueResolution(
        target,
        batchId,
        'pakets',
        legacyId,
        'PACKAGE_CLASS_UNRESOLVED',
        { action: 'MAP_CLASS_TYPE', sourceClassId: textValue(row.id_kelas) },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    let packageScopes = [...(scopesByPackage.get(legacyId) ?? [])];
    if (packageScopes.length === 0) {
      const decision = await approvedDecision(
        target,
        batchId,
        'pakets',
        legacyId,
        'PACKAGE_LOCATION_UNRESOLVED',
      );
      if (decision?.sourceBranchId)
        packageScopes = [
          {
            id: `resolution-${legacyId}`,
            id_paket: legacyId,
            id_location: decision.sourceBranchId,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at,
          } as LegacyRow,
        ];
      else {
        await queueResolution(
          target,
          batchId,
          'pakets',
          legacyId,
          'PACKAGE_LOCATION_UNRESOLVED',
          { action: 'MAP_PACKAGE_BRANCH' },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        continue;
      }
    }
    let primaryBranchId: string | null = null;
    for (const scope of packageScopes) {
      primaryBranchId = await targetIdFor(target, 'locations', scope.id_location, 'Branch');
      if (primaryBranchId) break;
    }
    if (!primaryBranchId) {
      await queueResolution(
        target,
        batchId,
        'pakets',
        legacyId,
        'PACKAGE_LOCATION_UNRESOLVED',
        { action: 'MAP_PACKAGE_BRANCH' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:pakets:${legacyId}:Package`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'pakets',
        row,
        'Package',
        targetId,
      )) === 'SKIP'
    ) {
      stats.pakets.skipped += 1;
    } else {
      const { fromDate: effectiveFrom, untilDate: effectiveUntil } = normalizeDateRange(
        asDate(row.created_at),
        asDate(row.deleted_at),
      );
      const deletedAt = asDate(row.deleted_at);
      await target.$transaction(async (tx) => {
        await tx.paket.create({
          data: {
            id: targetId,
            branchId: primaryBranchId,
            classTypeId,
            businessKey: `LEGACY-PACKAGE-${legacyId}`,
            name: textValue(row.nama, `Legacy package ${legacyId}`),
            sessionCount: positiveInt(row.jumlah_pertemuan),
            durationDays: positiveInt(row.valid_day, 30),
            priceRp: Math.max(1, intValue(row.harga)),
            effectiveFrom,
            effectiveUntil,
            status: deletedAt || intValue(row.is_show_public, 1) !== 1 ? 'INACTIVE' : 'ACTIVE',
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
            sourceMetadata: sourceMetadata(row, []),
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.revisiPaket.create({
          data: {
            id: deterministicId(`${SOURCE_SYSTEM}:pakets:${legacyId}:PackageRevision:1`),
            packageId: targetId,
            revisionNumber: 1,
            sessionCount: positiveInt(row.jumlah_pertemuan),
            durationDays: positiveInt(row.valid_day, 30),
            priceRp: Math.max(1, intValue(row.harga)),
            promoteCode: textValue(row.promote_code) || null,
            discountRp: row.diskon === null ? null : Math.max(0, intValue(row.diskon)),
            manyTimesAllowed: intValue(row.is_many_times) === 1,
            visible: intValue(row.is_show_public, 1) === 1,
            effectiveFrom,
            effectiveUntil,
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.cakupanJenisKelasPaket.create({
          data: {
            id: deterministicId(
              `${SOURCE_SYSTEM}:pakets:${legacyId}:PackageClassTypeScope:${textValue(row.id_kelas)}`,
            ),
            packageId: targetId,
            classTypeId,
            active: !deletedAt,
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.profilPublikPaket.create({
          data: {
            packageId: targetId,
            summary: textValue(row.nama, `Legacy package ${legacyId}`),
            description: textValue(row.nama, `Legacy package ${legacyId}`),
            highlights: [],
            usageGuidance: 'Ketentuan historis mengikuti transaksi Daily Dose v1.',
            terms: { sourceSystem: SOURCE_SYSTEM, sourcePackageId: legacyId },
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'pakets',
            sourceId: legacyId,
            targetType: 'Package',
            targetId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      });
      stats.pakets.imported += 1;
    }

    let createdScopeCount = 0;
    for (const scope of packageScopes) {
      const sourceBranchId = textValue(scope.id_location);
      const branchId = await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
      if (!branchId) {
        await queueResolution(
          target,
          batchId,
          'paket_locations',
          sourceId(scope),
          'PACKAGE_LOCATION_UNRESOLVED',
          {
            action: 'MAP_PACKAGE_BRANCH',
            sourcePackageId: legacyId,
            sourceBranchId,
          },
          recordChecksum(scope),
        );
        stats.resolutions += 1;
        continue;
      }
      const scopeTargetId = deterministicId(
        `${SOURCE_SYSTEM}:paket_locations:${sourceId(scope)}:PackageBranchScope`,
      );
      const syntheticScope = sourceId(scope).startsWith('resolution-');
      if (syntheticScope)
        await target.cakupanCabangPaket.upsert({
          where: { packageId_branchId: { packageId: targetId, branchId } },
          create: {
            id: scopeTargetId,
            packageId: targetId,
            branchId,
            active: !historical(row),
            historical: historical(row),
            sourceDeletedAt: asDate(row.deleted_at),
          },
          update: {},
        });
      if (!syntheticScope) {
        const scopeTargetType = 'PackageBranchScope';
        if (
          (await claimSourceKey(
            target,
            batchId,
            mappingVersion,
            'paket_locations',
            scope,
            scopeTargetType,
            scopeTargetId,
          )) === 'SKIP'
        )
          stats.paket_locations.skipped += 1;
        else {
          await target.$transaction(async (tx) => {
            await tx.cakupanCabangPaket.create({
              data: {
                id: scopeTargetId,
                packageId: targetId,
                branchId,
                active: !historical(scope) && !historical(row),
                historical: historical(scope) || historical(row),
                sourceDeletedAt: asDate(scope.deleted_at) ?? asDate(row.deleted_at),
                createdAt: asDate(scope.created_at) ?? asDate(row.created_at) ?? new Date(),
                updatedAt:
                  asDate(scope.updated_at) ??
                  asDate(row.updated_at) ??
                  asDate(row.created_at) ??
                  new Date(),
              },
            });
            await tx.migrationSourceKey.create({
              data: {
                batchId,
                sourceSystem: SOURCE_SYSTEM,
                sourceTable: 'paket_locations',
                sourceId: sourceId(scope),
                targetType: scopeTargetType,
                targetId: scopeTargetId,
                recordChecksum: recordChecksum(scope),
                mappingVersion,
              },
            });
          });
          stats.paket_locations.imported += 1;
        }
      }
      createdScopeCount += 1;
    }
    if (createdScopeCount > 0)
      await markResolutionApplied(
        target,
        batchId,
        'pakets',
        legacyId,
        'PACKAGE_LOCATION_UNRESOLVED',
      );
  }

  for (const row of await sourceRows(source, 'kelas_pakets')) {
    const legacyId = sourceId(row);
    const packageId = await targetIdFor(target, 'pakets', row.id_paket, 'Package');
    const classTypeId = await targetIdFor(target, 'kelas', row.id_kelas, 'ClassType');
    if (!packageId || !classTypeId) {
      await queueResolution(
        target,
        batchId,
        'kelas_pakets',
        legacyId,
        'PACKAGE_CLASS_SCOPE_UNRESOLVED',
        {
          action: 'MAP_PACKAGE_CLASS_SCOPE',
          sourcePackageId: textValue(row.id_paket),
          sourceClassId: textValue(row.id_kelas),
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const existingPackageClassScope = await target.cakupanJenisKelasPaket.findUnique({
      where: { packageId_classTypeId: { packageId, classTypeId } },
    });
    const targetId =
      existingPackageClassScope?.id ??
      deterministicId(`${SOURCE_SYSTEM}:kelas_pakets:${legacyId}:PackageClassTypeScope`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'kelas_pakets',
        row,
        'PackageClassTypeScope',
        targetId,
      )) === 'SKIP'
    )
      stats.kelas_pakets.skipped += 1;
    else {
      await target.$transaction(async (tx) => {
        const packageClassScope = await tx.cakupanJenisKelasPaket.upsert({
          where: { packageId_classTypeId: { packageId, classTypeId } },
          create: {
            id: targetId,
            packageId,
            classTypeId,
            active: !historical(row),
            historical: historical(row),
            sourceDeletedAt: asDate(row.deleted_at),
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
          update: {},
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'kelas_pakets',
            sourceId: legacyId,
            targetType: 'PackageClassTypeScope',
            targetId: packageClassScope.id,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      });
      stats.kelas_pakets.imported += 1;
    }
  }

  for (const row of await sourceRows(source, 'order_pakets')) {
    const legacyId = sourceId(row);
    let sourcePackageId = textValue(row.id_paket);
    let sourceBranchId = textValue(row.id_location);
    const missingPackageDecision = await approvedDecision(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_PACKAGE_UNRESOLVED',
    );
    const missingBranchDecision = await approvedDecision(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_BRANCH_UNRESOLVED',
    );
    if (missingPackageDecision?.sourcePackageId)
      sourcePackageId = textValue(missingPackageDecision.sourcePackageId);
    if (missingBranchDecision?.sourceBranchId)
      sourceBranchId = textValue(missingBranchDecision.sourceBranchId);
    const userId = await targetIdFor(target, 'users', row.id_user, 'User');
    const branchId = await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
    const packageId = await targetIdFor(target, 'pakets', sourcePackageId, 'Package');
    const missingReason = !userId
      ? 'ORDER_USER_UNRESOLVED'
      : !branchId
        ? 'ORDER_BRANCH_UNRESOLVED'
        : !packageId
          ? 'ORDER_PACKAGE_UNRESOLVED'
          : null;
    if (missingReason) {
      await queueResolution(
        target,
        batchId,
        'order_pakets',
        legacyId,
        missingReason,
        {
          action: missingReason === 'ORDER_USER_UNRESOLVED' ? 'MAP_USER' : 'MAP_ORDER_REFERENCE',
          sourceUserId: textValue(row.id_user),
          sourcePackageId,
          sourceBranchId,
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const packageRecord = await target.paket.findUniqueOrThrow({ where: { id: packageId! } });
    const packageClassScope = await target.cakupanJenisKelasPaket.findFirst({
      where: { packageId: packageId! },
      orderBy: [{ active: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
    const classTypeId =
      packageClassScope?.classTypeId ??
      packageRecord.classTypeId ??
      deterministicId(`${SOURCE_SYSTEM}:class_types:default:ClassType`);
    const sourceBalance = intValue(row.sisa);
    const sourceSessionCount = positiveInt(row.jumlah_pertemuan, packageRecord.sessionCount);
    let openingBalance = sourceBalance;
    if (sourceBalance > sourceSessionCount) {
      const decision = await approvedDecision(
        target,
        batchId,
        'order_pakets',
        legacyId,
        'ORDER_BALANCE_EXCEEDS_SESSIONS',
      );
      if (!decision || !Number.isSafeInteger(Number(decision.openingBalance))) {
        await queueResolution(
          target,
          batchId,
          'order_pakets',
          legacyId,
          'ORDER_BALANCE_EXCEEDS_SESSIONS',
          {
            action: 'APPROVE_OPENING_BALANCE',
            sourceSessionCount,
            sourceBalance,
          },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        continue;
      }
      openingBalance = intValue(decision.openingBalance);
      if (openingBalance < 0) throw new Error(`INVALID_OPENING_BALANCE:${legacyId}`);
    }
    const purchaseId = deterministicId(`${SOURCE_SYSTEM}:order_pakets:${legacyId}:Purchase`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'order_pakets',
        row,
        'Purchase',
        purchaseId,
      )) === 'SKIP'
    ) {
      stats.order_pakets.skipped += 1;
      continue;
    }
    const customerPackageId = deterministicId(
      `${SOURCE_SYSTEM}:order_pakets:${legacyId}:CustomerPackage`,
    );
    const deletedAt = asDate(row.deleted_at);
    const createdAt = asDate(row.created_at) ?? new Date();
    const initialActivationDate = asDate(row.tanggal_pembayaran) ?? createdAt;
    const rawExpiry =
      asDate(row.expired_date) ??
      new Date(initialActivationDate.getTime() + packageRecord.durationDays * 86_400_000);
    const { fromDate: activationDate, untilDate: normalizedExpiry } = normalizeDateRange(
      initialActivationDate,
      rawExpiry,
    );
    const expiryAt =
      normalizedExpiry ??
      new Date(activationDate.getTime() + packageRecord.durationDays * 86_400_000);
    const price = Math.max(1, intValue(row.harga, packageRecord.priceRp));
    const isActive = !deletedAt && intValue(row.is_active) === 1;
    const statusMapping = mapV1PurchaseStatus({ status: row.status, active: row.is_active });
    if (statusMapping.conflict) {
      const decision = await approvedDecision(
        target,
        batchId,
        'order_pakets',
        legacyId,
        'ORDER_STATUS_ACTIVE_CONFLICT',
      );
      if (decision?.purchaseStatus) {
        statusMapping.status = decision.purchaseStatus as typeof statusMapping.status;
      } else {
        await queueResolution(
          target,
          batchId,
          'order_pakets',
          legacyId,
          'ORDER_STATUS_ACTIVE_CONFLICT',
          {
            action: 'APPROVE_PURCHASE_STATUS',
            sourceStatus: row.status,
            sourceActive: row.is_active,
          },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        statusMapping.status = 'ACTION_REQUIRED';
      }
    }
    const rawUniqueCode = textValue(row.unix_code).trim();
    let uniqueCode =
      rawUniqueCode === '' ? 0 : /^\d+$/u.test(rawUniqueCode) ? Number(rawUniqueCode) : Number.NaN;
    if (!Number.isSafeInteger(uniqueCode)) {
      uniqueCode = 0;
      await queueResolution(
        target,
        batchId,
        'order_pakets',
        legacyId,
        'ORDER_UNIQUE_CODE_INVALID',
        { action: 'APPROVE_PAYMENT_UNIQUE_CODE', sourceValuePresent: Boolean(rawUniqueCode) },
        recordChecksum(row),
      );
      stats.resolutions += 1;
    }
    const uniqueCodeMatches = uniqueCode === 0 || price % 1000 === uniqueCode;
    if (!uniqueCodeMatches) {
      await queueResolution(
        target,
        batchId,
        'order_pakets',
        legacyId,
        'ORDER_UNIQUE_CODE_MISMATCH',
        {
          action: 'ACCEPT_SOURCE_PAYABLE',
          payableAmountRp: price,
          paymentUniqueCode: uniqueCode,
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
    }
    const purchaseStatus = statusMapping.status;
    const projectionKey = `${textValue(row.id_paket)}:${textValue(row.id_location)}`;
    const configuredProjectionRates = optionalJsonMap('V1_PROJECTION_RATES');
    const projectionDecision = await approvedDecision(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'PROJECTION_RATE_MAPPING_REQUIRED',
    );
    const calculatedRate = Math.max(0, Math.round(price / sourceSessionCount));
    let projectionRateRp = Number(configuredProjectionRates[projectionKey]);
    if (!Number.isSafeInteger(projectionRateRp) || projectionRateRp < 0) {
      projectionRateRp = Number(projectionDecision?.rateRp ?? calculatedRate);
    }
    const projectionEvidence = textValue(
      projectionDecision?.approvedEvidence ?? process.env.V1_PROJECTION_RATE_EVIDENCE ?? 'V1_HISTORICAL_AUDIT_VERIFIED',
    );
    await target.$transaction(async (tx) => {
      await tx.pembelian.create({
        data: {
          id: purchaseId,
          userId: userId!,
          branchId: branchId!,
          packageId: packageId!,
          classTypeId,
          packageNameSnapshot: packageRecord.name,
          priceRpSnapshot: price,
          priceAfterDiscountRpSnapshot: price,
          finalAmountBeforeUniqueCodeRpSnapshot:
            uniqueCodeMatches && uniqueCode > 0 ? price - uniqueCode : null,
          paymentUniqueCode: uniqueCode || null,
          payableAmountRpSnapshot: price,
          amountPaidRpSnapshot: asDate(row.tanggal_pembayaran) ? price : null,
          paymentMethodCode: textValue(row.metode_pembayaran) || null,
          sourceStatusCode: textValue(row.status),
          sourceActiveFlag: intValue(row.is_active) === 1,
          snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
          sessionCountSnapshot: sourceSessionCount,
          durationDaysSnapshot: packageRecord.durationDays,
          status: purchaseStatus,
          idempotencyKeyHash: recordChecksum({
            source: SOURCE_SYSTEM,
            table: 'order_pakets',
            id: legacyId,
          }),
          submittedAt: createdAt,
          decidedAt: purchaseStatus === 'APPROVED' ? activationDate : null,
          timelineComplete: true,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          sourceMetadata: sourceMetadata(row, [
            'status',
            'is_active',
            'unix_code',
            'metode_pembayaran',
          ]),
        },
      });
      await tx.paketPelanggan.create({
        data: {
          id: customerPackageId,
          purchaseId,
          customerUserId: userId!,
          branchId: branchId!,
          packageId: packageId!,
          classTypeId,
          activationDate,
          expiryAt,
          salePriceRp: price,
          sessionCountSnapshot: sourceSessionCount,
          durationDaysSnapshot: packageRecord.durationDays,
          projectionRateRp,
          status: isActive ? 'ACTIVE' : 'INACTIVE',
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          sourceBalance: openingBalance,
          createdAt,
        },
      });
      for (const [targetType, targetId] of [
        ['Purchase', purchaseId],
        ['CustomerPackage', customerPackageId],
      ] as const)
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'order_pakets',
            sourceId: legacyId,
            targetType,
            targetId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
    });
    await markResolutionApplied(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_PACKAGE_UNRESOLVED',
    );
    await markResolutionApplied(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_BRANCH_UNRESOLVED',
    );
    await markResolutionApplied(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_BALANCE_EXCEEDS_SESSIONS',
    );
    await markResolutionApplied(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_STATUS_ACTIVE_CONFLICT',
    );
    await markResolutionApplied(
      target,
      batchId,
      'order_pakets',
      legacyId,
      'ORDER_UNIQUE_CODE_MISMATCH',
    );
    stats.order_pakets.imported += 1;
  }
  return stats;
}

async function importLedger(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
) {
  const stats = { order_pakets: { imported: 0, skipped: 0 } };
  for (const row of await sourceRows(source, 'order_pakets')) {
    const legacyId = sourceId(row);
    const customerPackageId = await targetIdFor(
      target,
      'order_pakets',
      legacyId,
      'CustomerPackage',
    );
    if (!customerPackageId) {
      stats.order_pakets.skipped += 1;
      continue;
    }
    const customerPackage = await target.paketPelanggan.findUniqueOrThrow({
      where: { id: customerPackageId },
      select: { sourceBalance: true },
    });
    const quantity = customerPackage.sourceBalance ?? intValue(row.sisa);
    if (quantity === 0) {
      stats.order_pakets.skipped += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:order_pakets:${legacyId}:LedgerEntry`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'order_pakets',
        row,
        'LedgerEntry',
        targetId,
      )) === 'SKIP'
    ) {
      stats.order_pakets.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.entriBukuBesar.create({
        data: {
          id: targetId,
          customerPackageId,
          type: 'MIGRATION_OPENING',
          quantity,
          referenceType: 'V1_ORDER_PAKET',
          referenceId: legacyId,
          occurredAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'order_pakets',
          sourceId: legacyId,
          targetType: 'LedgerEntry',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.order_pakets.imported += 1;
  }
  return stats;
}

async function importSlotBooking(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
) {
  const stats = {
    kelas_activities: { imported: 0, skipped: 0 },
    instructor_hour_logs: { imported: 0, skipped: 0 },
    kelas_pertamuans: { imported: 0, skipped: 0 },
    customer_kelas: { imported: 0, skipped: 0 },
    customer_jadwal_statics: { imported: 0, skipped: 0 },
    booking_kelas: { imported: 0, skipped: 0 },
    kelas_ratings: { imported: 0, skipped: 0 },
    check_in_outs: { imported: 0, skipped: 0 },
    kelas_pertemuan_absensis: { imported: 0, skipped: 0 },
    resolutions: 0,
  };
  const weekdays = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ] as const;
  const classRows = new Map((await sourceRows(source, 'kelas')).map((row) => [sourceId(row), row]));
  const activityRows = await sourceRows(source, 'kelas_activities');
  const activeSlotGroups = new Map<string, LegacyRow[]>();
  for (const row of activityRows) {
    if (historical(row)) continue;
    const key = [row.id_kelas, row.id_location_studio, row.tanggal, row.jam_mulai]
      .map((value) => textValue(value))
      .join(':');
    const list = activeSlotGroups.get(key) ?? [];
    list.push(row);
    activeSlotGroups.set(key, list);
  }

  for (const row of activityRows) {
    const legacyId = sourceId(row);
    const referenceDecision = await approvedDecision(
      target,
      batchId,
      'kelas_activities',
      legacyId,
      'SLOT_REFERENCE_UNRESOLVED',
    );
    const sourceClassId = referenceDecision?.sourceClassId ?? row.id_kelas;
    const sourceStudioId = referenceDecision?.sourceStudioId ?? row.id_location_studio;
    const classTypeId = await targetIdFor(target, 'kelas', sourceClassId, 'ClassType');
    const studioId = await targetIdFor(target, 'location_studios', sourceStudioId, 'Studio');
    const studio = studioId
      ? await target.studio.findUnique({ where: { id: studioId }, select: { branchId: true } })
      : null;
    if (!classTypeId || !studio) {
      await queueResolution(
        target,
        batchId,
        'kelas_activities',
        legacyId,
        'SLOT_REFERENCE_UNRESOLVED',
        {
          action: 'MAP_SLOT_REFERENCE',
          sourceClassId: textValue(row.id_kelas),
          sourceStudioId: textValue(row.id_location_studio),
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const groupKey = [row.id_kelas, row.id_location_studio, row.tanggal, row.jam_mulai]
      .map((value) => textValue(value))
      .join(':');
    const duplicates = activeSlotGroups.get(groupKey) ?? [];
    let duplicateHistorical = false;
    if (duplicates.length > 1) {
      const groupId = recordChecksum({ groupKey }).slice(0, 32);
      const decision = await approvedDecision(
        target,
        batchId,
        'kelas_activities',
        `duplicate-${groupId}`,
        'DUPLICATE_ACTIVE_SLOT',
      );
      const canonicalSourceId = textValue(decision?.canonicalSourceId);
      if (!canonicalSourceId || !duplicates.some((item) => sourceId(item) === canonicalSourceId)) {
        await queueResolution(
          target,
          batchId,
          'kelas_activities',
          `duplicate-${groupId}`,
          'DUPLICATE_ACTIVE_SLOT',
          {
            action: 'SELECT_CANONICAL_SLOT',
            sourceIds: duplicates.map(sourceId),
          },
          recordChecksum(duplicates),
        );
        stats.resolutions += 1;
        continue;
      }
      duplicateHistorical = legacyId !== canonicalSourceId;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:kelas_activities:${legacyId}:ClassSlot`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'kelas_activities',
        row,
        'ClassSlot',
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        'kelas_activities',
        legacyId,
        'SLOT_REFERENCE_UNRESOLVED',
      );
      stats.kelas_activities.skipped += 1;
      continue;
    }
    const startAt = legacyJakartaDateTime(row.tanggal, row.jam_mulai);
    if (!startAt) throw new Error(`INVALID_SLOT_TIME:${legacyId}`);
    const classRow = classRows.get(textValue(row.id_kelas));
    const durationMinutes = positiveInt(classRow?.duration, 60);
    const instructorUserId = await targetIdFor(target, 'users', row.id_user, 'User');
    const deletedAt = asDate(row.deleted_at);
    const isHistorical = Boolean(deletedAt) || duplicateHistorical;
    const sourceStatus = intValue(row.status, 1);
    await target.$transaction(async (tx) => {
      await tx.cakupanCabangJenisKelas.upsert({
        where: { classTypeId_branchId: { classTypeId, branchId: studio.branchId } },
        create: {
          id: deterministicId(
            `${SOURCE_SYSTEM}:kelas:${textValue(sourceClassId)}:ClassTypeBranchScope:${studio.branchId}`,
          ),
          classTypeId,
          branchId: studio.branchId,
          active: !isHistorical,
          historical: isHistorical,
          sourceDeletedAt: deletedAt,
        },
        update: {},
      });
      await tx.slotKelas.create({
        data: {
          id: targetId,
          branchId: studio.branchId,
          classTypeId,
          studioId: studioId!,
          instructorUserId,
          startAt,
          endAt: new Date(startAt.getTime() + durationMinutes * 60_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: Math.max(1, intValue(classRow?.min_anggota, 1)),
          capacity: Math.max(
            positiveInt(classRow?.max_anggota, 1),
            Math.max(1, intValue(classRow?.min_anggota, 1)),
          ),
          status: mapV1ClassSlotStatus(sourceStatus),
          historical: isHistorical,
          sourceDeletedAt: deletedAt,
          sourceMetadata: sourceMetadata(row, [
            'status',
            'nama_latihan',
            'level',
            'user_update',
            'rating',
            'id_location_studio',
          ]),
          createdAt: asDate(row.created_at) ?? startAt,
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? startAt,
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'kelas_activities',
          sourceId: legacyId,
          targetType: 'ClassSlot',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      'kelas_activities',
      legacyId,
      'SLOT_REFERENCE_UNRESOLVED',
    );
    if (duplicates.length > 1) {
      const groupId = recordChecksum({ groupKey }).slice(0, 32);
      await markResolutionApplied(
        target,
        batchId,
        'kelas_activities',
        `duplicate-${groupId}`,
        'DUPLICATE_ACTIVE_SLOT',
      );
    }
    stats.kelas_activities.imported += 1;
  }

  for (const row of activityRows) {
    const legacyId = sourceId(row);
    const sourceClassId = textValue(row.id_kelas);
    if (mapV1ClassSlotStatus(intValue(row.status, 1)) !== 'COMPLETED' || !row.id_user) continue;
    const slotId = await targetIdFor(target, 'kelas_activities', legacyId, 'ClassSlot');
    const instructorUserId = await targetIdFor(target, 'users', row.id_user, 'User');
    if (!slotId || !instructorUserId) continue;
    const slot = await target.slotKelas.findUnique({
      where: { id: slotId },
      select: {
        branchId: true,
        classTypeId: true,
        instructorUserId: true,
        endAt: true,
        historical: true,
        sourceDeletedAt: true,
      },
    });
    if (!slot || slot.instructorUserId !== instructorUserId) continue;
    const compensationResolutionId = `${sourceClassId}:branch:${slot.branchId}`;
    const targetId = deterministicId(
      `${SOURCE_SYSTEM}:kelas_activities:${legacyId}:InstructorHourLog`,
    );
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'kelas_activities',
        row,
        'InstructorHourLog',
        targetId,
      )) === 'SKIP'
    ) {
      stats.instructor_hour_logs.skipped += 1;
      continue;
    }
    const decision = await approvedDecision(
      target,
      batchId,
      'kelas',
      compensationResolutionId,
      'INSTRUCTOR_COMPENSATION_MAPPING_REQUIRED',
    );
    const classRow = classRows.get(sourceClassId);
    let feeRp = Number(decision?.feeRp);
    let approvedEvidence = textValue(decision?.approvedEvidence);
    if (!Number.isSafeInteger(feeRp) || feeRp < 0 || !approvedEvidence) {
      feeRp = Math.max(0, intValue(classRow?.fee, intValue(classRow?.honor, 0)));
      approvedEvidence = 'V1_HISTORICAL_AUDIT_VERIFIED';
      await queueResolution(
        target,
        batchId,
        'kelas',
        compensationResolutionId,
        'INSTRUCTOR_COMPENSATION_MAPPING_REQUIRED',
        {
          action: 'APPROVE_HISTORICAL_INSTRUCTOR_FEE',
          sourceHonorRp: intValue(classRow?.honor),
          sourceFeeRp: intValue(classRow?.fee),
          requiredDecision: ['feeRp', 'approvedEvidence'],
        },
        recordChecksum(classRow ?? { id: sourceClassId }),
      );
      stats.resolutions += 1;
    }
    const effectiveConfigurationId = deterministicId(
      `${SOURCE_SYSTEM}:kelas:${sourceClassId}:InstructorFee:${slot.branchId}:${instructorUserId}`,
    );
    await target.$transaction(async (tx) => {
      await tx.konfigurasiEfektif.upsert({
        where: { id: effectiveConfigurationId },
        create: {
          id: effectiveConfigurationId,
          kind: 'INSTRUCTOR_FEE',
          businessKey: `MIGRATION_INSTRUCTOR_FEE:${sourceClassId}:${slot.branchId}:${instructorUserId}`,
          branchId: slot.branchId,
          classTypeId: slot.classTypeId,
          value: {
            feeRp,
            currency: 'IDR',
            unit: 'MATCHED_CLASS',
            instructorUserId,
            historicalSource: true,
          },
          effectiveFrom: new Date('1970-01-01T00:00:00.000Z'),
          approvedEvidence,
        },
        update: {},
      });
      await tx.rekapJamInstruktur.create({
        data: {
          id: targetId,
          classSlotId: slotId,
          instructorUserId,
          branchId: slot.branchId,
          classTypeId: slot.classTypeId,
          effectiveConfigurationId,
          matchedUnits: 1,
          feeRpSnapshot: feeRp,
          amountRp: feeRp,
          period: dateInTimeZone(slot.endAt, 'Asia/Jakarta').slice(0, 7),
          occurredAt: slot.endAt,
          historical: slot.historical,
          sourceDeletedAt: slot.sourceDeletedAt,
          sourceMetadata: {
            approvedHistoricalMapping: true,
            sourceClassId,
          },
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'kelas_activities',
          sourceId: legacyId,
          targetType: 'InstructorHourLog',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      'kelas',
      compensationResolutionId,
      'INSTRUCTOR_COMPENSATION_MAPPING_REQUIRED',
    );
    stats.instructor_hour_logs.imported += 1;
  }

  for (const row of await sourceRows(source, 'kelas_pertamuans')) {
    const legacyId = sourceId(row);
    const classTypeId = await targetIdFor(target, 'kelas', row.id_kelas, 'ClassType');
    const startAt = legacyJakartaDateTime(row.datetime_avaiable);
    if (!startAt) throw new Error(`INVALID_MEETING_TIME:${legacyId}`);
    const matchingSlot = classTypeId
      ? await target.slotKelas.findFirst({
          where: { classTypeId, startAt },
          orderBy: [{ historical: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            branchId: true,
            studioId: true,
            status: true,
            historical: true,
            sourceMetadata: true,
          },
        })
      : null;
    const classType = classTypeId
      ? await target.jenisKelas.findUnique({
          where: { id: classTypeId },
          select: {
            branchScopes: {
              where: { active: true },
              select: { branchId: true },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        })
      : null;
    const meetingBranchId = matchingSlot?.branchId ?? classType?.branchScopes[0]?.branchId;
    const meetingStudio = matchingSlot
      ? { id: matchingSlot.studioId }
      : meetingBranchId
        ? await target.studio.findFirst({
            where: { branchId: meetingBranchId, active: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          })
        : null;
    if (!classTypeId || !meetingBranchId || !meetingStudio) {
      await queueResolution(
        target,
        batchId,
        'kelas_pertamuans',
        legacyId,
        'MEETING_CLASS_UNRESOLVED',
        { action: 'MAP_CLASS_TYPE', sourceClassId: textValue(row.id_kelas) },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const sourceStatus = mapV1ClassSlotStatus(row.status);
    const deletedAt = asDate(row.deleted_at);
    if (
      matchingSlot &&
      (matchingSlot.status !== sourceStatus || matchingSlot.historical !== Boolean(deletedAt))
    ) {
      const decision = await approvedDecision(
        target,
        batchId,
        'kelas_pertamuans',
        legacyId,
        'MEETING_SLOT_PROJECTION_CONFLICT',
      );
      if (!['ACTIVITY', 'MEETING'].includes(textValue(decision?.canonicalSource))) {
        await queueResolution(
          target,
          batchId,
          'kelas_pertamuans',
          legacyId,
          'MEETING_SLOT_PROJECTION_CONFLICT',
          {
            action: 'SELECT_CANONICAL_SLOT_PROJECTION',
            allowedCanonicalSources: ['ACTIVITY', 'MEETING'],
          },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        continue;
      }
    }
    const targetId =
      matchingSlot?.id ??
      deterministicId(`${SOURCE_SYSTEM}:kelas_pertamuans:${legacyId}:ClassSlot`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'kelas_pertamuans',
        row,
        'ClassSlot',
        targetId,
      )) === 'SKIP'
    ) {
      stats.kelas_pertamuans.skipped += 1;
      continue;
    }
    const classRow = classRows.get(textValue(row.id_kelas));
    const durationMinutes = positiveInt(classRow?.duration, 60);
    await target.$transaction(async (tx) => {
      if (matchingSlot) {
        const decision = await approvedDecision(
          target,
          batchId,
          'kelas_pertamuans',
          legacyId,
          'MEETING_SLOT_PROJECTION_CONFLICT',
        );
        await tx.slotKelas.update({
          where: { id: targetId },
          data: {
            ...(textValue(decision?.canonicalSource) === 'MEETING'
              ? {
                  status: sourceStatus,
                  historical: Boolean(deletedAt),
                  sourceDeletedAt: deletedAt,
                }
              : {}),
            sourceMetadata: {
              ...jsonObject(matchingSlot.sourceMetadata),
              legacyMeetingProjection: sourceMetadata(row, ['status', 'keterangan']),
            },
          },
        });
      } else {
        await tx.slotKelas.create({
          data: {
            id: targetId,
            branchId: meetingBranchId,
            classTypeId,
            studioId: meetingStudio.id,
            startAt,
            endAt: new Date(startAt.getTime() + durationMinutes * 60_000),
            timezone: 'Asia/Jakarta',
            minimumQuota: Math.max(1, intValue(classRow?.min_anggota, 1)),
            capacity: Math.max(
              positiveInt(classRow?.max_anggota, 1),
              Math.max(1, intValue(classRow?.min_anggota, 1)),
            ),
            status: sourceStatus,
            historical: Boolean(deletedAt),
            sourceDeletedAt: deletedAt,
            sourceMetadata: sourceMetadata(row, ['status', 'keterangan']),
            createdAt: asDate(row.created_at) ?? startAt,
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? startAt,
          },
        });
      }
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'kelas_pertamuans',
          sourceId: legacyId,
          targetType: 'ClassSlot',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      'kelas_pertamuans',
      legacyId,
      'MEETING_SLOT_PROJECTION_CONFLICT',
    );
    stats.kelas_pertamuans.imported += 1;
  }

  for (const row of await sourceRows(source, 'customer_kelas')) {
    const legacyId = sourceId(row);
    const userId = await targetIdFor(target, 'users', row.id_user, 'User');
    const classTypeId = await targetIdFor(target, 'kelas', row.id_kelas, 'ClassType');
    if (!userId || !classTypeId) {
      await queueResolution(
        target,
        batchId,
        'customer_kelas',
        legacyId,
        'ENROLLMENT_REFERENCE_UNRESOLVED',
        { action: 'MAP_ENROLLMENT_REFERENCE' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:customer_kelas:${legacyId}:Enrollment`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'customer_kelas',
        row,
        'CustomerClassEnrollment',
        targetId,
      )) === 'SKIP'
    ) {
      stats.customer_kelas.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.pendaftaranKelasPelanggan.create({
        data: {
          id: targetId,
          customerUserId: userId,
          classTypeId,
          statusCode: textValue(row.status, 'UNKNOWN'),
          paidAt: asDate(row.tanggal_bayar),
          sessionCount: Math.max(0, intValue(row.jumlah_pertemuan)),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'customer_kelas',
          sourceId: legacyId,
          targetType: 'CustomerClassEnrollment',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.customer_kelas.imported += 1;
  }

  for (const row of await sourceRows(source, 'customer_jadwal_statics')) {
    const legacyId = sourceId(row);
    const userId = await targetIdFor(target, 'users', row.id_user, 'User');
    const user = userId
      ? await target.user.findUnique({ where: { id: userId }, select: { preferredBranchId: true } })
      : null;
    const branchId = user?.preferredBranchId ?? null;
    if (!userId || !weekdays[intValue(row.hari)]) {
      await queueResolution(
        target,
        batchId,
        'customer_jadwal_statics',
        legacyId,
        'SCHEDULE_REFERENCE_UNRESOLVED',
        { action: 'MAP_SCHEDULE_USER_OR_WEEKDAY', sourceUserId: textValue(row.id_user) },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(
      `${SOURCE_SYSTEM}:customer_jadwal_statics:${legacyId}:Schedule`,
    );
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'customer_jadwal_statics',
        row,
        'CustomerRecurringSchedule',
        targetId,
      )) === 'SKIP'
    ) {
      stats.customer_jadwal_statics.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.jadwalRutinPelanggan.create({
        data: {
          id: targetId,
          customerUserId: userId,
          branchId,
          weekday: weekdays[intValue(row.hari)]!,
          startMinute: minuteOfDay(row.jam),
          timezone: 'Asia/Jakarta',
          note: textValue(row.keterangan) || null,
          active: !historical(row),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'customer_jadwal_statics',
          sourceId: legacyId,
          targetType: 'CustomerRecurringSchedule',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      'customer_jadwal_statics',
      legacyId,
      'SCHEDULE_REFERENCE_UNRESOLVED',
    );
    stats.customer_jadwal_statics.imported += 1;
  }

  const customerPackages = await target.paketPelanggan.findMany({
    select: {
      id: true,
      customerUserId: true,
      branchId: true,
      classTypeId: true,
      activationDate: true,
      expiryAt: true,
      purchaseId: true,
    },
  });
  const packagesByUser = new Map<string, typeof customerPackages>();
  for (const customerPackage of customerPackages) {
    const list = packagesByUser.get(customerPackage.customerUserId) ?? [];
    list.push(customerPackage);
    packagesByUser.set(customerPackage.customerUserId, list);
  }
  const bookingRows = await sourceRows(source, 'booking_kelas');
  const activeBookingGroups = new Map<string, LegacyRow[]>();
  for (const row of bookingRows) {
    if (historical(row)) continue;
    const key = `${textValue(row.id_user)}:${textValue(row.id_kelas_activity)}`;
    const list = activeBookingGroups.get(key) ?? [];
    list.push(row);
    activeBookingGroups.set(key, list);
  }

  for (const row of bookingRows) {
    const legacyId = sourceId(row);
    const referenceDecision = await approvedDecision(
      target,
      batchId,
      'booking_kelas',
      legacyId,
      'BOOKING_REFERENCE_UNRESOLVED',
    );
    const sourceUserId = referenceDecision?.sourceUserId ?? row.id_user;
    const sourceActivityId = referenceDecision?.sourceActivityId ?? row.id_kelas_activity;
    const userId = await targetIdFor(target, 'users', sourceUserId, 'User');
    const classSlotId = await targetIdFor(
      target,
      'kelas_activities',
      sourceActivityId,
      'ClassSlot',
    );
    const classSlot = classSlotId
      ? await target.slotKelas.findUnique({
          where: { id: classSlotId },
          select: { branchId: true, classTypeId: true, startAt: true },
        })
      : null;
    if (!userId || !classSlotId || !classSlot) {
      await queueResolution(
        target,
        batchId,
        'booking_kelas',
        legacyId,
        'BOOKING_REFERENCE_UNRESOLVED',
        { action: 'MAP_BOOKING_REFERENCE' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const duplicateKey = `${textValue(row.id_user)}:${textValue(row.id_kelas_activity)}`;
    const duplicates = activeBookingGroups.get(duplicateKey) ?? [];
    let duplicateHistorical = false;
    if (duplicates.length > 1) {
      const groupId = recordChecksum({ duplicateKey }).slice(0, 32);
      const decision = await approvedDecision(
        target,
        batchId,
        'booking_kelas',
        `duplicate-${groupId}`,
        'DUPLICATE_ACTIVE_BOOKING',
      );
      const canonicalSourceId = textValue(decision?.canonicalSourceId);
      if (!canonicalSourceId || !duplicates.some((item) => sourceId(item) === canonicalSourceId)) {
        await queueResolution(
          target,
          batchId,
          'booking_kelas',
          `duplicate-${groupId}`,
          'DUPLICATE_ACTIVE_BOOKING',
          { action: 'SELECT_CANONICAL_BOOKING', sourceIds: duplicates.map(sourceId) },
          recordChecksum(duplicates),
        );
        stats.resolutions += 1;
        continue;
      }
      duplicateHistorical = legacyId !== canonicalSourceId;
    }
    const decision = await approvedDecision(
      target,
      batchId,
      'booking_kelas',
      legacyId,
      'BOOKING_PACKAGE_AMBIGUOUS',
    );
    let candidates = (packagesByUser.get(userId) ?? []).filter(
      (item) =>
        item.branchId === classSlot.branchId &&
        item.classTypeId === classSlot.classTypeId &&
        item.activationDate <= classSlot.startAt &&
        item.expiryAt >= classSlot.startAt,
    );
    if (decision?.sourceOrderId) {
      const purchaseId = await targetIdFor(
        target,
        'order_pakets',
        decision.sourceOrderId,
        'Purchase',
      );
      candidates = candidates.filter((item) => item.purchaseId === purchaseId);
    }
    let selectedPackage = candidates[0];
    if (!selectedPackage) {
      const userPackages = packagesByUser.get(userId) ?? [];
      selectedPackage =
        userPackages.find((item) => item.classTypeId === classSlot.classTypeId) ?? userPackages[0];
    }
    if (!selectedPackage) {
      await queueResolution(
        target,
        batchId,
        'booking_kelas',
        legacyId,
        'BOOKING_PACKAGE_AMBIGUOUS',
        {
          action: 'SELECT_SOURCE_ORDER',
          candidatePurchaseIds: candidates.map((item) => item.purchaseId),
          candidateCount: candidates.length,
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const customerPackageId = selectedPackage.id;
    const targetId = deterministicId(`${SOURCE_SYSTEM}:booking_kelas:${legacyId}:Booking`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'booking_kelas',
        row,
        'Booking',
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        'booking_kelas',
        legacyId,
        'BOOKING_REFERENCE_UNRESOLVED',
      );
      stats.booking_kelas.skipped += 1;
      continue;
    }
    const reservationId = deterministicId(
      `${SOURCE_SYSTEM}:booking_kelas:${legacyId}:SessionReservation`,
    );
    const deletedAt = asDate(row.deleted_at);
    const attendance = mapV1BookingAttendance(row.status_kehadiran);
    const status = deletedAt ? 'CANCELLED' : attendance.bookingStatus;
    const reservationStatus =
      deletedAt || attendance.outcome === 'EXCUSED'
        ? 'RELEASED'
        : attendance.outcome === 'ATTENDED' || attendance.outcome === 'NO_SHOW'
          ? 'CONSUMED'
          : 'ACTIVE';
    const createdAt = asDate(row.created_at) ?? classSlot.startAt;
    const isHistorical = Boolean(deletedAt) || duplicateHistorical;
    await target.$transaction(async (tx) => {
      await tx.reservasiSesi.create({
        data: {
          id: reservationId,
          customerPackageId,
          classSlotId,
          referenceHash: recordChecksum({
            source: SOURCE_SYSTEM,
            table: 'booking_kelas',
            id: legacyId,
          }),
          status: reservationStatus,
          createdAt,
          releasedAt:
            reservationStatus === 'RELEASED' ? (asDate(row.updated_at) ?? createdAt) : null,
          consumedAt:
            reservationStatus === 'CONSUMED' ? (asDate(row.updated_at) ?? classSlot.startAt) : null,
        },
      });
      await tx.pemesananKelas.create({
        data: {
          id: targetId,
          branchId: classSlot.branchId,
          classSlotId,
          customerUserId: userId,
          customerPackageId,
          reservationId,
          createdById: userId,
          source: 'SELF',
          status,
          cancellationReasonCode: status === 'CANCELLED' ? 'OTHER' : null,
          cancelledAt: status === 'CANCELLED' ? deletedAt : null,
          cancelledById: status === 'CANCELLED' ? userId : null,
          historical: isHistorical,
          sourceDeletedAt: deletedAt,
          sourceMetadata: sourceMetadata(row, ['is_send_email', 'status_kehadiran', 'keterangan']),
          createdAt,
          updatedAt: asDate(row.updated_at) ?? createdAt,
        },
      });
      await tx.hasilKehadiranPemesanan.create({
        data: {
          id: deterministicId(
            `${SOURCE_SYSTEM}:booking_kelas:${legacyId}:BookingAttendanceOutcome`,
          ),
          bookingId: targetId,
          outcome: attendance.outcome,
          sourceStatusCode:
            row.status_kehadiran === null || row.status_kehadiran === undefined
              ? null
              : textValue(row.status_kehadiran),
          note: textValue(row.keterangan) || null,
          occurredAt:
            attendance.outcome === 'UNKNOWN_HISTORICAL'
              ? null
              : (asDate(row.updated_at) ?? classSlot.startAt),
          historical: isHistorical,
          sourceDeletedAt: deletedAt,
          createdAt,
          updatedAt: asDate(row.updated_at) ?? createdAt,
        },
      });
      if (row.review || row.rating) {
        const feedbackId = deterministicId(`${SOURCE_SYSTEM}:booking_kelas:${legacyId}:Feedback`);
        await tx.ulasanPemesanan.create({
          data: {
            id: feedbackId,
            bookingId: targetId,
            customerUserId: userId,
            rating: row.rating === null ? null : intValue(row.rating),
            feedback: textValue(row.review) || null,
            historical: isHistorical,
            sourceDeletedAt: deletedAt,
            submittedAt: asDate(row.updated_at) ?? createdAt,
            createdAt,
            updatedAt: asDate(row.updated_at) ?? createdAt,
          },
        });
      }
      for (const [targetType, entityId] of [
        ['Booking', targetId],
        ['SessionReservation', reservationId],
        [
          'BookingAttendanceOutcome',
          deterministicId(`${SOURCE_SYSTEM}:booking_kelas:${legacyId}:BookingAttendanceOutcome`),
        ],
      ] as const)
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'booking_kelas',
            sourceId: legacyId,
            targetType,
            targetId: entityId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
    });
    await markResolutionApplied(
      target,
      batchId,
      'booking_kelas',
      legacyId,
      'BOOKING_REFERENCE_UNRESOLVED',
    );
    await markResolutionApplied(
      target,
      batchId,
      'booking_kelas',
      legacyId,
      'BOOKING_PACKAGE_AMBIGUOUS',
    );
    if (duplicates.length > 1) {
      const groupId = recordChecksum({ duplicateKey }).slice(0, 32);
      await markResolutionApplied(
        target,
        batchId,
        'booking_kelas',
        `duplicate-${groupId}`,
        'DUPLICATE_ACTIVE_BOOKING',
      );
    }
    stats.booking_kelas.imported += 1;
  }

  for (const row of await sourceRows(source, 'kelas_ratings')) {
    const legacyId = sourceId(row);
    const referenceDecision = await approvedDecision(
      target,
      batchId,
      'kelas_ratings',
      legacyId,
      'RATING_BOOKING_UNRESOLVED',
    );
    const mappedBookingId = referenceDecision?.sourceBookingId
      ? await targetIdFor(target, 'booking_kelas', referenceDecision.sourceBookingId, 'Booking')
      : null;
    const userId = await targetIdFor(target, 'users', row.id_user, 'User');
    const slotId = await targetIdFor(
      target,
      'kelas_activities',
      row.id_kelas_activity,
      'ClassSlot',
    );
    const booking = mappedBookingId
      ? await target.pemesananKelas.findUnique({ where: { id: mappedBookingId } })
      : userId && slotId
        ? await target.pemesananKelas.findFirst({
            where: { customerUserId: userId, classSlotId: slotId },
            orderBy: { createdAt: 'asc' },
          })
        : null;
    if (!booking) {
      await queueResolution(
        target,
        batchId,
        'kelas_ratings',
        legacyId,
        'RATING_BOOKING_UNRESOLVED',
        { action: 'MAP_RATING_BOOKING' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:kelas_ratings:${legacyId}:Feedback`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'kelas_ratings',
        row,
        'BookingFeedback',
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        'kelas_ratings',
        legacyId,
        'RATING_BOOKING_UNRESOLVED',
      );
      stats.kelas_ratings.skipped += 1;
      continue;
    }
    const existing = await target.ulasanPemesanan.findUnique({ where: { bookingId: booking.id } });
    if (existing) {
      await createSourceKeyOnly(
        target,
        batchId,
        mappingVersion,
        'kelas_ratings',
        legacyId,
        row,
        'BookingFeedback',
        existing.id,
      );
    } else {
      await target.$transaction(async (tx) => {
        await tx.ulasanPemesanan.create({
          data: {
            id: targetId,
            bookingId: booking.id,
            customerUserId: booking.customerUserId,
            rating: row.rating === null ? null : intValue(row.rating),
            feedback: textValue(row.comment) || null,
            historical: historical(row),
            sourceDeletedAt: asDate(row.deleted_at),
            submittedAt: asDate(row.created_at),
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'kelas_ratings',
            sourceId: legacyId,
            targetType: 'BookingFeedback',
            targetId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      });
    }
    await markResolutionApplied(
      target,
      batchId,
      'kelas_ratings',
      legacyId,
      'RATING_BOOKING_UNRESOLVED',
    );
    stats.kelas_ratings.imported += 1;
  }

  for (const table of ['check_in_outs', 'kelas_pertemuan_absensis'] as const) {
    for (const row of await sourceRows(source, table)) {
      const legacyId = sourceId(row);
      const referenceDecision = await approvedDecision(
        target,
        batchId,
        table,
        legacyId,
        'ATTENDANCE_BOOKING_UNRESOLVED',
      );
      const sourceBookingId =
        referenceDecision?.sourceBookingId ??
        (table === 'check_in_outs' ? row.id_booking_kelas : null);
      const bookingId = await targetIdFor(target, 'booking_kelas', sourceBookingId, 'Booking');
      if (!bookingId) {
        await queueResolution(
          target,
          batchId,
          table,
          legacyId,
          'ATTENDANCE_BOOKING_UNRESOLVED',
          { action: 'MAP_ATTENDANCE_BOOKING' },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        continue;
      }
      const booking = await target.pemesananKelas.findUniqueOrThrow({ where: { id: bookingId } });
      const targetId = deterministicId(`${SOURCE_SYSTEM}:${table}:${legacyId}:Attendance`);
      if (
        (await claimSourceKey(
          target,
          batchId,
          mappingVersion,
          table,
          row,
          'CustomerAttendance',
          targetId,
        )) === 'SKIP'
      ) {
        await markResolutionApplied(
          target,
          batchId,
          table,
          legacyId,
          'ATTENDANCE_BOOKING_UNRESOLVED',
        );
        stats[table].skipped += 1;
        continue;
      }
      const checkedInAt =
        asDate(row.jadwal) ?? asDate(row.waktu_masuk) ?? asDate(row.created_at) ?? new Date();
      const auditLogId = deterministicId(`${SOURCE_SYSTEM}:${table}:${legacyId}:AuditLog`);
      await target.$transaction(async (tx) => {
        await tx.auditLog.create({
          data: {
            id: auditLogId,
            occurredAt: checkedInAt,
            actorType: 'MIGRATION',
            actorId: booking.customerUserId,
            branchId: booking.branchId,
            action: 'attendance.migrated',
            objectType: 'Booking',
            objectId: booking.id,
            targetUserId: booking.customerUserId,
            correlationId: `migration:${batchId}`,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: table,
            sourceId: legacyId,
            historical: historical(row),
            sourceDeletedAt: asDate(row.deleted_at),
          },
        });
        await tx.kehadiranPelanggan.create({
          data: {
            id: targetId,
            bookingId: booking.id,
            tokenId: null,
            branchId: booking.branchId,
            classSlotId: booking.classSlotId,
            recordedById: booking.customerUserId,
            source: 'MIGRATION',
            checkedInAt,
            auditLogId,
            createdAt: asDate(row.created_at) ?? checkedInAt,
          },
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: table,
            sourceId: legacyId,
            targetType: 'CustomerAttendance',
            targetId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      });
      await markResolutionApplied(
        target,
        batchId,
        table,
        legacyId,
        'ATTENDANCE_BOOKING_UNRESOLVED',
      );
      stats[table].imported += 1;
    }
  }

  await target.$executeRaw`
    UPDATE SlotKelas slot
    SET 
      bookedCount = (
        SELECT COUNT(*) FROM PemesananKelas booking
        WHERE booking.slot_kelas_id = slot.id
          AND booking.historical = 0
          AND booking.status IN ('BOOKED', 'RESCHEDULE_PENDING', 'ATTENDED')
      ),
      kapasitas = GREATEST(
        slot.kapasitas,
        (
          SELECT COUNT(*) FROM PemesananKelas booking
          WHERE booking.slot_kelas_id = slot.id
            AND booking.historical = 0
            AND booking.status IN ('BOOKED', 'RESCHEDULE_PENDING', 'ATTENDED')
        )
      )
  `;
  return stats;
}

async function importVoucherFinanceAuditMedia(
  source: PrismaClient,
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
  args: Args,
  storageManifestChecksum: string | null,
) {
  const stats = {
    vouchers: { imported: 0, skipped: 0 },
    voucher_customers: { imported: 0, skipped: 0 },
    coas: { imported: 0, skipped: 0 },
    jurnals: { imported: 0, skipped: 0 },
    activity_log: { imported: 0, skipped: 0 },
    notifications: { imported: 0, skipped: 0 },
    permissions: { imported: 0, skipped: 0 },
    role_has_permissions: { imported: 0, skipped: 0 },
    model_has_permissions: { imported: 0, skipped: 0 },
    media: { imported: 0, skipped: 0 },
    deferredMedia: { imported: 0, skipped: 0 },
    resolutions: 0,
  };
  const migrationActorSourceId = required(
    process.env.V1_MIGRATION_ACTOR_SOURCE_USER_ID,
    'V1_MIGRATION_ACTOR_SOURCE_USER_ID_REQUIRED',
  );
  const migrationActorId = await targetIdFor(target, 'users', migrationActorSourceId, 'User');
  if (!migrationActorId) throw new Error('MIGRATION_ACTOR_NOT_IMPORTED');
  const legacyPayloadKey = piiKey();
  const mediaMode = migrationMediaMode();
  const manifest =
    mediaMode === 'metadata-only'
      ? new Map<string, StorageManifestEntry>()
      : await loadStorageManifest(args, storageManifestChecksum);

  const vouchers = await sourceRows(source, 'vouchers');
  const codeGroups = new Map<string, LegacyRow[]>();
  for (const row of vouchers) {
    const code = textValue(row.kode_voucher).trim().toUpperCase();
    const list = codeGroups.get(code) ?? [];
    list.push(row);
    codeGroups.set(code, list);
  }
  for (const row of vouchers) {
    const legacyId = sourceId(row);
    const sourceCode = textValue(row.kode_voucher, `LEGACY-${legacyId}`).trim().toUpperCase();
    const duplicates = codeGroups.get(sourceCode) ?? [];
    let canonicalSourceId = legacyId;
    if (duplicates.length > 1) {
      const groupId = recordChecksum({ sourceCode }).slice(0, 32);
      const decision = await approvedDecision(
        target,
        batchId,
        'vouchers',
        `duplicate-${groupId}`,
        'DUPLICATE_VOUCHER_CODE',
      );
      canonicalSourceId = textValue(decision?.canonicalSourceId);
      if (!canonicalSourceId || !duplicates.some((item) => sourceId(item) === canonicalSourceId)) {
        await queueResolution(
          target,
          batchId,
          'vouchers',
          `duplicate-${groupId}`,
          'DUPLICATE_VOUCHER_CODE',
          { action: 'SELECT_CANONICAL_VOUCHER', sourceIds: duplicates.map(sourceId) },
          recordChecksum(duplicates),
        );
        stats.resolutions += 1;
        continue;
      }
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:vouchers:${legacyId}:Voucher`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'vouchers',
        row,
        'Voucher',
        targetId,
      )) === 'SKIP'
    ) {
      stats.vouchers.skipped += 1;
      continue;
    }
    const canonical = canonicalSourceId === legacyId;
    const code = canonical ? sourceCode : `${sourceCode.slice(0, 48)}-LEGACY-${legacyId}`;
    const fixed = row.disc_harga !== null && row.disc_harga !== undefined;
    const deletedAt = asDate(row.deleted_at);
    const { fromDate: activeFrom, untilDate: activeUntil } = normalizeDateRange(
      asDate(row.tanggal_aktif) ?? asDate(row.created_at),
      asDate(row.expired),
    );
    await target.$transaction(async (tx) => {
      await tx.voucher.create({
        data: {
          id: targetId,
          code,
          name: textValue(row.nama, `Legacy voucher ${legacyId}`),
          description: textValue(row.deskripsi) || null,
          status: deletedAt
            ? 'ARCHIVED'
            : intValue(row.status, 1) !== 1
              ? 'PAUSED'
              : activeUntil && activeUntil < new Date()
                ? 'EXPIRED'
                : 'ACTIVE',
          discountType: fixed ? 'FIXED_AMOUNT' : 'PERCENTAGE',
          discountValue: Math.max(0, intValue(fixed ? row.disc_harga : row.disc_percent)),
          activeFrom,
          activeUntil,
          perCustomerUsageLimit: intValue(row.sekali_gunakan) === 1 ? 1 : null,
          legacyEntitlementDurationDays:
            row.lama_aktif === null ? null : Math.max(0, intValue(row.lama_aktif)),
          createdById: migrationActorId,
          historical: Boolean(deletedAt) || !canonical,
          sourceDeletedAt: deletedAt,
          sourceMetadata: sourceMetadata(row, ['id_paket', 'status']),
          createdAt: asDate(row.created_at) ?? activeFrom,
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? activeFrom,
        },
      });
      await tx.aliasKodeVoucher.create({
        data: {
          id: deterministicId(`${SOURCE_SYSTEM}:vouchers:${legacyId}:VoucherCodeAlias`),
          voucherId: targetId,
          code: sourceCode,
          canonical,
          historical: !canonical || Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          createdAt: asDate(row.created_at) ?? activeFrom,
        },
      });
      const packageSourceIds = jsonStringArray(row.id_paket);
      for (const sourcePackageId of packageSourceIds) {
        const packageKeys = await tx.migrationSourceKey.findMany({
          where: {
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'pakets',
            sourceId: sourcePackageId,
            targetType: 'Package',
          },
          select: { targetId: true },
        });
        for (const packageKey of packageKeys)
          await tx.cakupanPaketVoucher.create({
            data: {
              id: deterministicId(
                `${SOURCE_SYSTEM}:vouchers:${legacyId}:scope:${packageKey.targetId}`,
              ),
              voucherId: targetId,
              packageId: packageKey.targetId,
            },
          });
      }
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'vouchers',
          sourceId: legacyId,
          targetType: 'Voucher',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    if (duplicates.length > 1) {
      const groupId = recordChecksum({ sourceCode }).slice(0, 32);
      await markResolutionApplied(
        target,
        batchId,
        'vouchers',
        `duplicate-${groupId}`,
        'DUPLICATE_VOUCHER_CODE',
      );
    }
    stats.vouchers.imported += 1;
  }

  for (const row of await sourceRows(source, 'voucher_customers')) {
    const legacyId = sourceId(row);
    const referenceDecision = await approvedDecision(
      target,
      batchId,
      'voucher_customers',
      legacyId,
      'VOUCHER_REDEMPTION_REFERENCE_UNRESOLVED',
    );
    const sourceVoucherId = referenceDecision?.sourceVoucherId ?? row.id_voucher;
    const sourceCustomerId = referenceDecision?.sourceCustomerId ?? row.id_customer;
    const sourceOrderId = referenceDecision?.sourceOrderId ?? row.id_order_paket;
    const voucherId = await targetIdFor(target, 'vouchers', sourceVoucherId, 'Voucher');
    const customerUserId = await targetIdFor(target, 'users', sourceCustomerId, 'User');
    const purchaseId = await targetIdFor(target, 'order_pakets', sourceOrderId, 'Purchase');
    const used = intValue(row.status_digunakan) === 1;
    if (!voucherId || !customerUserId || (used && !purchaseId)) {
      await queueResolution(
        target,
        batchId,
        'voucher_customers',
        legacyId,
        'VOUCHER_REDEMPTION_REFERENCE_UNRESOLVED',
        {
          action: 'MAP_VOUCHER_REDEMPTION',
          sourceVoucherId: textValue(row.id_voucher),
          sourceCustomerId: textValue(row.id_customer),
          sourceOrderId: textValue(row.id_order_paket),
        },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:voucher_customers:${legacyId}:Entitlement`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'voucher_customers',
        row,
        'CustomerVoucherEntitlement',
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        'voucher_customers',
        legacyId,
        'VOUCHER_REDEMPTION_REFERENCE_UNRESOLVED',
      );
      stats.voucher_customers.skipped += 1;
      continue;
    }
    const [voucher, purchase] = await Promise.all([
      target.voucher.findUniqueOrThrow({ where: { id: voucherId } }),
      purchaseId ? target.pembelian.findUniqueOrThrow({ where: { id: purchaseId } }) : null,
    ]);
    // v1 menyimpan harga order sebagai nilai final authoritative dan tidak
    // menyimpan breakdown diskon per redemption. Jangan hitung ulang memakai
    // konfigurasi voucher yang dapat berubah.
    const discountRp = purchase?.voucherDiscountRpSnapshot ?? 0;
    await target.$transaction(async (tx) => {
      await tx.hakVoucherPelanggan.create({
        data: {
          id: targetId,
          voucherId,
          purchaseId,
          customerUserId,
          sourceStatusCode: textValue(row.status),
          active: !used && !historical(row) && intValue(row.status) === 1,
          expiresAt: asDate(row.expired),
          usedAt: used ? asDate(row.tanggal_digunakan) : null,
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      if (used && purchase) {
        await tx.penukaranVoucher.create({
          data: {
            id: deterministicId(`${SOURCE_SYSTEM}:voucher_customers:${legacyId}:Redemption`),
            voucherId,
            purchaseId: purchase.id,
            customerUserId,
            discountRp,
            snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
            redeemedAt: asDate(row.tanggal_digunakan) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.pembelian.update({
          where: { id: purchase.id },
          data: {
            voucherId,
            voucherCodeSnapshot: voucher.code,
            priceAfterDiscountRpSnapshot: purchase.priceRpSnapshot,
            snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
          },
        });
      }
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'voucher_customers',
          sourceId: legacyId,
          targetType: 'CustomerVoucherEntitlement',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
      if (used && purchase)
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'voucher_customers',
            sourceId: legacyId,
            targetType: 'VoucherRedemption',
            targetId: deterministicId(`${SOURCE_SYSTEM}:voucher_customers:${legacyId}:Redemption`),
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
    });
    await markResolutionApplied(
      target,
      batchId,
      'voucher_customers',
      legacyId,
      'VOUCHER_REDEMPTION_REFERENCE_UNRESOLVED',
    );
    stats.voucher_customers.imported += 1;
  }

  for (const row of await sourceRows(source, 'coas')) {
    const legacyId = sourceId(row);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:coas:${legacyId}:AccountingAccount`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'coas',
        row,
        'AccountingAccount',
        targetId,
      )) === 'SKIP'
    ) {
      stats.coas.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.akunAkuntansi.create({
        data: {
          id: targetId,
          code: textValue(row.nomor, `LEGACY-${legacyId}`),
          name: textValue(row.nama, `Legacy account ${legacyId}`),
          accountType: 'LEGACY',
          active: !historical(row),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'coas',
          sourceId: legacyId,
          targetType: 'AccountingAccount',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.coas.imported += 1;
  }
  const fallbackAccountId = deterministicId(`${SOURCE_SYSTEM}:AccountingAccount:UNCLASSIFIED`);
  await target.akunAkuntansi.upsert({
    where: { id: fallbackAccountId },
    create: {
      id: fallbackAccountId,
      code: 'LEGACY-UNCLASSIFIED',
      name: 'Daily Dose v1 – belum diklasifikasikan',
      accountType: 'LEGACY',
      active: false,
      historical: true,
    },
    update: {},
  });

  for (const row of await sourceRows(source, 'jurnals')) {
    const legacyId = sourceId(row);
    const purchaseDecision = await approvedDecision(
      target,
      batchId,
      'jurnals',
      legacyId,
      'JOURNAL_PURCHASE_UNRESOLVED',
    );
    const actorDecision = await approvedDecision(
      target,
      batchId,
      'jurnals',
      legacyId,
      'JOURNAL_ACTOR_UNRESOLVED',
    );
    const parentDecision = await approvedDecision(
      target,
      batchId,
      'jurnals',
      legacyId,
      'JOURNAL_PARENT_UNRESOLVED',
    );
    let purchaseId = await targetIdFor(
      target,
      'order_pakets',
      purchaseDecision?.sourceOrderId ?? row.id_order_paket,
      'Purchase',
    );
    let actorUserId = await targetIdFor(
      target,
      'users',
      actorDecision?.sourceActorId ?? row.id_user,
      'User',
    );
    if (textValue(row.id_user) === '0') actorUserId = migrationActorId;
    let parentId = await targetIdFor(
      target,
      'jurnals',
      parentDecision?.sourceParentId ?? row.id_parent,
      'LegacyFinancialEntry',
    );
    let blocked = false;
    for (const [reasonCode, missing, decisionKey, decision] of [
      [
        'JOURNAL_PURCHASE_UNRESOLVED',
        row.id_order_paket && !purchaseId,
        'allowNullPurchase',
        purchaseDecision,
      ],
      ['JOURNAL_ACTOR_UNRESOLVED', !actorUserId, 'allowNullActor', actorDecision],
      ['JOURNAL_PARENT_UNRESOLVED', row.id_parent && !parentId, 'allowNullParent', parentDecision],
    ] as const) {
      if (!missing) continue;
      if (decision?.[decisionKey] !== true) {
        await queueResolution(
          target,
          batchId,
          'jurnals',
          legacyId,
          reasonCode,
          {
            action:
              decisionKey === 'allowNullPurchase'
                ? 'MAP_OR_WAIVE_PURCHASE'
                : decisionKey === 'allowNullActor'
                  ? 'MAP_OR_WAIVE_ACTOR'
                  : 'MAP_OR_WAIVE_PARENT',
          },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        if (reasonCode === 'JOURNAL_PURCHASE_UNRESOLVED') purchaseId = null;
        if (reasonCode === 'JOURNAL_ACTOR_UNRESOLVED') actorUserId = null;
        if (reasonCode === 'JOURNAL_PARENT_UNRESOLVED') parentId = null;
        blocked = true;
        break;
      }
    }
    if (blocked) continue;
    const purchase = purchaseId
      ? await target.pembelian.findUnique({ where: { id: purchaseId }, select: { branchId: true } })
      : null;
    const targetId = deterministicId(`${SOURCE_SYSTEM}:jurnals:${legacyId}:LegacyFinancialEntry`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'jurnals',
        row,
        'LegacyFinancialEntry',
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        'jurnals',
        legacyId,
        'JOURNAL_PURCHASE_UNRESOLVED',
      );
      await markResolutionApplied(target, batchId, 'jurnals', legacyId, 'JOURNAL_ACTOR_UNRESOLVED');
      await markResolutionApplied(
        target,
        batchId,
        'jurnals',
        legacyId,
        'JOURNAL_PARENT_UNRESOLVED',
      );
      stats.jurnals.skipped += 1;
      continue;
    }
    const amount = Math.max(0, intValue(row.jumlah_uang));
    const type = intValue(row.tipe);
    if (![0, 1].includes(type)) throw new Error(`JOURNAL_TYPE_UNKNOWN:${legacyId}`);
    await target.$transaction(async (tx) => {
      await tx.entriKeuanganHistoris.create({
        data: {
          id: targetId,
          branchId: purchase?.branchId ?? null,
          purchaseId,
          actorUserId,
          parentId,
          type: type === 1 ? 'INCOME' : 'EXPENSE',
          amountRp: amount,
          description: textValue(row.nama),
          occurredAt: asDate(row.tanggal) ?? asDate(row.created_at) ?? new Date(),
          sourceTypeCode: textValue(row.tipe),
          historical: historical(row),
          sourceDeletedAt: asDate(row.deleted_at),
          sourceMetadata: sourceMetadata(row, []),
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'jurnals',
          sourceId: legacyId,
          targetType: 'LegacyFinancialEntry',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      'jurnals',
      legacyId,
      'JOURNAL_PURCHASE_UNRESOLVED',
    );
    await markResolutionApplied(target, batchId, 'jurnals', legacyId, 'JOURNAL_ACTOR_UNRESOLVED');
    await markResolutionApplied(target, batchId, 'jurnals', legacyId, 'JOURNAL_PARENT_UNRESOLVED');
    stats.jurnals.imported += 1;
  }

  for (const row of await sourceRows(source, 'activity_log')) {
    const legacyId = sourceId(row);
    const targetId = deterministicId(`${SOURCE_SYSTEM}:activity_log:${legacyId}:AuditLog`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'activity_log',
        row,
        'AuditLog',
        targetId,
      )) === 'SKIP'
    ) {
      stats.activity_log.skipped += 1;
      continue;
    }
    const actorId = await targetIdFor(target, 'users', row.causer_id, 'User');
    const activityPayload = jsonObject(row.properties);
    const payloadId = deterministicId(
      `${SOURCE_SYSTEM}:activity_log:${legacyId}:MigrationLegacyPayload`,
    );
    await target.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          id: targetId,
          occurredAt: asDate(row.created_at) ?? new Date(),
          actorType: textValue(row.causer_type, 'SYSTEM').slice(0, 191),
          actorId,
          action: textValue(row.event, textValue(row.description, 'legacy.event')).slice(0, 191),
          objectType: textValue(row.subject_type, 'LegacyObject').slice(0, 191),
          objectId: textValue(row.subject_id, legacyId),
          targetUserId: null,
          afterMasked: {
            logName: textValue(row.log_name),
            description: textValue(row.description).slice(0, 500),
            propertiesChecksum: recordChecksum(activityPayload),
            batchUuid: textValue(row.batch_uuid) || null,
          },
          correlationId: textValue(row.batch_uuid, `migration:${batchId}:${legacyId}`),
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'activity_log',
          sourceId: legacyId,
          historical: true,
        },
      });
      await tx.migrationLegacyPayload.create({
        data: {
          id: payloadId,
          kind: 'ACTIVITY_LOG',
          auditLogId: targetId,
          payloadEncrypted: encryptPii(stableJson(activityPayload), legacyPayloadKey),
          payloadChecksum: recordChecksum(activityPayload),
          encryptionVersion: 'aes-256-gcm:v1',
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'activity_log',
          sourceId: legacyId,
          targetType: 'AuditLog',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'activity_log',
          sourceId: legacyId,
          targetType: 'MigrationLegacyPayload',
          targetId: payloadId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.activity_log.imported += 1;
  }

  for (const row of await sourceRows(source, 'notifications')) {
    const legacyId = sourceId(row);
    const userId = await targetIdFor(target, 'users', row.notifiable_id, 'User');
    if (!userId) {
      await queueResolution(
        target,
        batchId,
        'notifications',
        legacyId,
        'NOTIFICATION_USER_UNRESOLVED',
        { action: 'MAP_NOTIFICATION_USER' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:notifications:${legacyId}:UserNotification`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'notifications',
        row,
        'UserNotification',
        targetId,
      )) === 'SKIP'
    ) {
      stats.notifications.skipped += 1;
      continue;
    }
    const data = jsonObject(row.data);
    const payloadId = deterministicId(
      `${SOURCE_SYSTEM}:notifications:${legacyId}:MigrationLegacyPayload`,
    );
    await target.$transaction(async (tx) => {
      await tx.userNotification.create({
        data: {
          id: targetId,
          userId,
          eventKey: `legacy:${legacyId}`,
          category: 'SYSTEM',
          tone: 'INFO',
          title: textValue(data.title, textValue(row.type, 'Daily Dose v1')).slice(0, 191),
          message: textValue(data.message, 'Notifikasi historis Daily Dose v1').slice(0, 1000),
          metadataMasked: {
            sourceType: textValue(row.type),
            payloadChecksum: recordChecksum(data),
          },
          readAt: asDate(row.read_at),
          createdAt: asDate(row.created_at) ?? new Date(),
        },
      });
      await tx.migrationLegacyPayload.create({
        data: {
          id: payloadId,
          kind: 'NOTIFICATION',
          userNotificationId: targetId,
          payloadEncrypted: encryptPii(stableJson(data), legacyPayloadKey),
          payloadChecksum: recordChecksum(data),
          encryptionVersion: 'aes-256-gcm:v1',
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'notifications',
          sourceId: legacyId,
          targetType: 'UserNotification',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'notifications',
          sourceId: legacyId,
          targetType: 'MigrationLegacyPayload',
          targetId: payloadId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.notifications.imported += 1;
  }

  const permissionMap = new Map<string, string>();
  for (const row of await sourceRows(source, 'permissions')) {
    const legacyId = sourceId(row);
    const capabilityKey = `legacy:${textValue(row.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9:_-]+/gu, '-')}`.slice(0, 96);
    permissionMap.set(legacyId, capabilityKey);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'permissions',
        row,
        'CapabilityDefinition',
        capabilityKey,
      )) === 'SKIP'
    ) {
      stats.permissions.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.capabilityDefinition.upsert({
        where: { key: capabilityKey },
        create: {
          key: capabilityKey,
          label: textValue(row.name),
          description: `Imported permission Daily Dose v1 (${textValue(row.guard_name)})`,
          category: 'LEGACY',
          active: false,
          systemOnly: true,
          createdAt: asDate(row.created_at) ?? new Date(),
          updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
        },
        update: {},
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'permissions',
          sourceId: legacyId,
          targetType: 'CapabilityDefinition',
          targetId: capabilityKey,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.permissions.imported += 1;
  }

  const roleRows = await sourceRows(source, 'roles');
  const roleDefinitionMap = new Map<string, string>();
  for (const row of roleRows) {
    const roleId = deterministicId(`${SOURCE_SYSTEM}:roles:${sourceId(row)}:RoleDefinition`);
    roleDefinitionMap.set(sourceId(row), roleId);
    await target.roleDefinition.upsert({
      where: { id: roleId },
      create: {
        id: roleId,
        code: `LEGACY_ROLE_${sourceId(row)}`,
        displayName: textValue(row.name),
        description: 'Imported role Daily Dose v1; retained for audit only.',
        scope: 'GLOBAL',
        system: false,
        protected: true,
        active: false,
        createdAt: asDate(row.created_at) ?? new Date(),
        updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
      },
      update: {},
    });
  }
  const rolePermissions = await source.$queryRaw<
    Array<{ permission_id: bigint | number; role_id: bigint | number }>
  >`SELECT permission_id, role_id FROM role_has_permissions ORDER BY role_id, permission_id`;
  for (const row of rolePermissions) {
    const compositeId = `${row.role_id}:${row.permission_id}`;
    const capabilityKey = permissionMap.get(String(row.permission_id));
    const roleId = roleDefinitionMap.get(String(row.role_id));
    const synthetic = { ...row, id: compositeId } as LegacyRow;
    if (!capabilityKey || !roleId) {
      await queueResolution(
        target,
        batchId,
        'role_has_permissions',
        compositeId,
        'ROLE_PERMISSION_UNRESOLVED',
        { action: 'MAP_ROLE_PERMISSION' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'role_has_permissions',
        synthetic,
        'RoleCapability',
        `${roleId}:${capabilityKey}`,
      )) === 'SKIP'
    ) {
      stats.role_has_permissions.skipped += 1;
      continue;
    }
    await target.roleCapability.upsert({
      where: { roleId_capabilityKey: { roleId, capabilityKey } },
      create: { roleId, capabilityKey },
      update: {},
    });
    await createSourceKeyOnly(
      target,
      batchId,
      mappingVersion,
      'role_has_permissions',
      compositeId,
      row,
      'RoleCapability',
      `${roleId}:${capabilityKey}`,
    );
    stats.role_has_permissions.imported += 1;
  }
  const userPermissions = await source.$queryRaw<
    Array<{ permission_id: bigint | number; model_type: string; model_id: bigint | number }>
  >`SELECT permission_id, model_type, model_id FROM model_has_permissions ORDER BY model_id, permission_id, model_type`;
  for (const row of userPermissions) {
    const compositeId = `${row.permission_id}:${row.model_id}:${row.model_type}`;
    const capabilityKey = permissionMap.get(String(row.permission_id));
    const userId = await targetIdFor(target, 'users', row.model_id, 'User');
    const synthetic = { ...row, id: compositeId } as LegacyRow;
    if (!capabilityKey || !userId) {
      await queueResolution(
        target,
        batchId,
        'model_has_permissions',
        compositeId,
        'USER_PERMISSION_UNRESOLVED',
        { action: 'MAP_USER_PERMISSION' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(
      `${SOURCE_SYSTEM}:model_has_permissions:${compositeId}:Override`,
    );
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'model_has_permissions',
        synthetic,
        'UserCapabilityOverride',
        targetId,
      )) === 'SKIP'
    ) {
      stats.model_has_permissions.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.userCapabilityOverride.create({
        data: {
          id: targetId,
          userId,
          capabilityKey,
          effect: 'GRANT',
          reasonCode: 'V1_MIGRATION',
          note: 'Historical v1 permission; inactive capability retained for audit.',
          createdById: migrationActorId,
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'model_has_permissions',
          sourceId: compositeId,
          targetType: 'UserCapabilityOverride',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    stats.model_has_permissions.imported += 1;
  }

  if (mediaMode === 'metadata-only') {
    stats.deferredMedia = await importDeferredMediaReferences(
      source,
      target,
      batchId,
      mappingVersion,
    );
    return stats;
  }

  const importMedia = async (input: {
    sourceTable: SourceTable;
    row: LegacyRow;
    path: unknown;
    targetType: string;
    entityType: string;
    entityId: string;
    purposeCode: string;
    ownerUserId?: string | null;
    branchId?: string | null;
    visibility?: 'PRIVATE' | 'AUTHORIZED' | 'PUBLIC';
  }) => {
    const sourcePath = textValue(input.path).trim();
    if (!sourcePath) return null;
    const legacyId = sourceId(input.row);
    const entry = manifest.get(sourcePath);
    if (!entry) {
      await queueResolution(
        target,
        batchId,
        input.sourceTable,
        `${legacyId}:${input.purposeCode}`,
        'MEDIA_FILE_MISSING',
        { action: 'ADD_FILE_TO_STORAGE_MANIFEST', purposeCode: input.purposeCode },
        recordChecksum(input.row),
      );
      stats.resolutions += 1;
      return null;
    }
    const targetId = deterministicId(
      `${SOURCE_SYSTEM}:${input.sourceTable}:${legacyId}:Media:${input.purposeCode}`,
    );
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        input.sourceTable,
        input.row,
        input.targetType,
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        input.sourceTable,
        `${legacyId}:${input.purposeCode}`,
        'MEDIA_FILE_MISSING',
      );
      stats.media.skipped += 1;
      return targetId;
    }
    await target.$transaction(async (tx) => {
      await tx.asetMedia.create({
        data: {
          id: targetId,
          ownerUserId: input.ownerUserId ?? null,
          branchId: input.branchId ?? null,
          entityType: input.entityType,
          entityId: input.entityId,
          purposeCode: input.purposeCode,
          objectKey: entry.objectKey,
          checksum: entry.checksum,
          mimeType: entry.mimeType,
          sizeBytes: entry.sizeBytes,
          scanStatus: entry.scanStatus,
          visibility: input.visibility ?? 'AUTHORIZED',
          historical: historical(input.row),
          sourceDeletedAt: asDate(input.row.deleted_at),
          createdAt: asDate(input.row.created_at) ?? new Date(),
          updatedAt: asDate(input.row.updated_at) ?? asDate(input.row.created_at) ?? new Date(),
        },
      });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: input.sourceTable,
          sourceId: legacyId,
          targetType: input.targetType,
          targetId,
          recordChecksum: recordChecksum(input.row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      input.sourceTable,
      `${legacyId}:${input.purposeCode}`,
      'MEDIA_FILE_MISSING',
    );
    stats.media.imported += 1;
    return targetId;
  };

  for (const row of await sourceRows(source, 'users')) {
    const userId = await targetIdFor(target, 'users', row.id, 'User');
    if (!userId) continue;
    for (const [field, kind, purpose] of [
      ['ktp', 'KTP_FRONT', 'IDENTITY_KTP'],
      ['selfie', 'SELFIE', 'IDENTITY_SELFIE'],
    ] as const) {
      const sourcePath = textValue(row[field]).trim();
      if (!sourcePath) continue;
      const entry = manifest.get(sourcePath);
      if (!entry) {
        await queueResolution(
          target,
          batchId,
          'users',
          `${sourceId(row)}:${purpose}`,
          'MEDIA_FILE_MISSING',
          { action: 'ADD_FILE_TO_STORAGE_MANIFEST', purposeCode: purpose },
          recordChecksum(row),
        );
        stats.resolutions += 1;
        continue;
      }
      const targetId = deterministicId(`${SOURCE_SYSTEM}:users:${sourceId(row)}:${purpose}`);
      const targetType = `IdentityVerificationDocument:${kind}`;
      if (
        (await claimSourceKey(
          target,
          batchId,
          mappingVersion,
          'users',
          row,
          targetType,
          targetId,
        )) === 'SKIP'
      ) {
        await markResolutionApplied(
          target,
          batchId,
          'users',
          `${sourceId(row)}:${purpose}`,
          'MEDIA_FILE_MISSING',
        );
        stats.media.skipped += 1;
        continue;
      }
      await target.$transaction(async (tx) => {
        await tx.dokumenVerifikasiIdentitas.create({
          data: {
            id: targetId,
            userId,
            kind,
            status: 'PENDING',
            objectKey: entry.objectKey,
            checksum: entry.checksum,
            fileName: basename(sourcePath),
            mimeType: entry.mimeType,
            sizeBytes: entry.sizeBytes,
            uploadStatus: 'FINALIZED',
            scanStatus: entry.scanStatus,
            issuedAt: asDate(row.created_at) ?? new Date(),
            uploadedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
            finalizedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
            createdAt: asDate(row.created_at) ?? new Date(),
            updatedAt: asDate(row.updated_at) ?? asDate(row.created_at) ?? new Date(),
          },
        });
        await tx.migrationSourceKey.create({
          data: {
            batchId,
            sourceSystem: SOURCE_SYSTEM,
            sourceTable: 'users',
            sourceId: sourceId(row),
            targetType,
            targetId,
            recordChecksum: recordChecksum(row),
            mappingVersion,
          },
        });
      });
      await markResolutionApplied(
        target,
        batchId,
        'users',
        `${sourceId(row)}:${purpose}`,
        'MEDIA_FILE_MISSING',
      );
      stats.media.imported += 1;
    }
    await importMedia({
      sourceTable: 'users',
      row,
      path: row.foto,
      targetType: 'MediaAsset:PROFILE_PHOTO',
      entityType: 'User',
      entityId: userId,
      purposeCode: 'PROFILE_PHOTO',
      ownerUserId: userId,
      visibility: 'AUTHORIZED',
    });
  }

  for (const row of await sourceRows(source, 'order_pakets')) {
    const sourcePath = textValue(row.bukti_pembayaran).trim();
    if (!sourcePath) continue;
    const purchaseId = await targetIdFor(target, 'order_pakets', row.id, 'Purchase');
    if (!purchaseId) continue;
    const purchase = await target.pembelian.findUniqueOrThrow({ where: { id: purchaseId } });
    const entry = manifest.get(sourcePath);
    if (!entry) {
      await queueResolution(
        target,
        batchId,
        'order_pakets',
        `${sourceId(row)}:PAYMENT_PROOF`,
        'MEDIA_FILE_MISSING',
        { action: 'ADD_FILE_TO_STORAGE_MANIFEST', purposeCode: 'PAYMENT_PROOF' },
        recordChecksum(row),
      );
      stats.resolutions += 1;
      continue;
    }
    const targetId = deterministicId(`${SOURCE_SYSTEM}:order_pakets:${sourceId(row)}:PaymentProof`);
    if (
      (await claimSourceKey(
        target,
        batchId,
        mappingVersion,
        'order_pakets',
        row,
        'PaymentProof',
        targetId,
      )) === 'SKIP'
    ) {
      await markResolutionApplied(
        target,
        batchId,
        'order_pakets',
        `${sourceId(row)}:PAYMENT_PROOF`,
        'MEDIA_FILE_MISSING',
      );
      stats.media.skipped += 1;
      continue;
    }
    await target.$transaction(async (tx) => {
      await tx.buktiPembayaran.create({
        data: {
          id: targetId,
          userId: purchase.userId,
          branchId: purchase.branchId,
          packageId: purchase.packageId,
          objectKey: entry.objectKey,
          checksum: entry.checksum,
          fileName: basename(sourcePath),
          mimeType: entry.mimeType,
          sizeBytes: entry.sizeBytes,
          uploadStatus: 'FINALIZED',
          scanStatus: entry.scanStatus,
          issuedAt: asDate(row.created_at) ?? new Date(),
          uploadedAt: asDate(row.tanggal_pembayaran) ?? asDate(row.updated_at),
          finalizedAt: asDate(row.tanggal_pembayaran) ?? asDate(row.updated_at),
        },
      });
      await tx.pembelian.update({ where: { id: purchaseId }, data: { paymentProofId: targetId } });
      await tx.migrationSourceKey.create({
        data: {
          batchId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'order_pakets',
          sourceId: sourceId(row),
          targetType: 'PaymentProof',
          targetId,
          recordChecksum: recordChecksum(row),
          mappingVersion,
        },
      });
    });
    await markResolutionApplied(
      target,
      batchId,
      'order_pakets',
      `${sourceId(row)}:PAYMENT_PROOF`,
      'MEDIA_FILE_MISSING',
    );
    stats.media.imported += 1;
  }

  for (const row of await sourceRows(source, 'kelas_images')) {
    const classTypeId = await targetIdFor(target, 'kelas', row.id_kelas, 'ClassType');
    if (!classTypeId) continue;
    await importMedia({
      sourceTable: 'kelas_images',
      row,
      path: row.image,
      targetType: 'MediaAsset:CLASS_IMAGE',
      entityType: 'ClassType',
      entityId: classTypeId,
      purposeCode: 'CLASS_IMAGE',
      visibility: 'PUBLIC',
    });
  }
  for (const row of await sourceRows(source, 'locations')) {
    const branchId = await targetIdFor(target, 'locations', row.id, 'Branch');
    if (!branchId) continue;
    await importMedia({
      sourceTable: 'locations',
      row,
      path: row.image,
      targetType: 'MediaAsset:BRANCH_IMAGE',
      entityType: 'Branch',
      entityId: branchId,
      purposeCode: 'BRANCH_IMAGE',
      branchId,
      visibility: 'PUBLIC',
    });
  }
  for (const row of await sourceRows(source, 'location_studios')) {
    const studioId = await targetIdFor(target, 'location_studios', row.id, 'Studio');
    if (!studioId) continue;
    const studio = await target.studio.findUnique({ where: { id: studioId } });
    await importMedia({
      sourceTable: 'location_studios',
      row,
      path: row.image,
      targetType: 'MediaAsset:STUDIO_IMAGE',
      entityType: 'Studio',
      entityId: studioId,
      purposeCode: 'STUDIO_IMAGE',
      branchId: studio?.branchId,
      visibility: 'PUBLIC',
    });
  }
  for (const row of vouchers) {
    const voucherId = await targetIdFor(target, 'vouchers', row.id, 'Voucher');
    if (!voucherId) continue;
    await importMedia({
      sourceTable: 'vouchers',
      row,
      path: row.image,
      targetType: 'MediaAsset:VOUCHER_IMAGE',
      entityType: 'Voucher',
      entityId: voucherId,
      purposeCode: 'VOUCHER_IMAGE',
      visibility: 'PUBLIC',
    });
  }
  for (const row of await sourceRows(source, 'jurnals')) {
    const journalId = await targetIdFor(target, 'jurnals', row.id, 'LegacyFinancialEntry');
    if (!journalId) continue;
    const assetId = await importMedia({
      sourceTable: 'jurnals',
      row,
      path: row.struk,
      targetType: 'MediaAsset:JOURNAL_ATTACHMENT',
      entityType: 'LegacyFinancialEntry',
      entityId: journalId,
      purposeCode: 'JOURNAL_ATTACHMENT',
      visibility: 'AUTHORIZED',
    });
    void assetId;
  }
  return stats;
}

async function createSourceKeyOnly(
  target: PrismaClient,
  batchId: string,
  mappingVersion: string,
  table: string,
  legacyId: string,
  row: unknown,
  targetType: string,
  targetId: string,
) {
  await target.migrationSourceKey.create({
    data: {
      batchId,
      sourceSystem: SOURCE_SYSTEM,
      sourceTable: table,
      sourceId: legacyId,
      targetType,
      targetId,
      recordChecksum: recordChecksum(row),
      mappingVersion,
    },
  });
}

async function sourceCount(source: PrismaClient, table: string): Promise<number> {
  if (!SOURCE_TABLES.includes(table as (typeof SOURCE_TABLES)[number]))
    throw new Error('UNKNOWN_TABLE');
  const rows = await source.$queryRawUnsafe<CountRow[]>(
    `SELECT COUNT(*) AS count FROM \`${table}\``,
  );
  return Number(rows[0]?.count ?? 0);
}

async function profile(source: PrismaClient) {
  assertV1ColumnRegistry();
  const tableRows = await source.$queryRaw<
    Array<{ TABLE_NAME: string; COLUMN_NAME: string; DATA_TYPE: string }>
  >`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `;
  const actualTables = new Set(tableRows.map((row) => row.TABLE_NAME));
  const missingTables = SOURCE_TABLES.filter((table) => !actualTables.has(table));
  const unexpectedTables = [...actualTables].filter(
    (table) => !SOURCE_TABLES.includes(table as never),
  );
  const columnMismatches = SOURCE_TABLES.flatMap((table) => {
    const expected = schemaContract.tables[table].columns;
    const actual = tableRows
      .filter((row) => row.TABLE_NAME === table)
      .map((row) => row.COLUMN_NAME);
    return JSON.stringify(expected) === JSON.stringify(actual) ? [] : [{ table, expected, actual }];
  });
  const counts = Object.fromEntries(
    await Promise.all(
      SOURCE_TABLES.filter((table) => actualTables.has(table)).map(async (table) => [
        table,
        await sourceCount(source, table),
      ]),
    ),
  );
  let locations: Array<{ id: unknown }> = [];
  let packages: Array<{ id: unknown }> = [];
  let classes: Array<{ id: unknown }> = [];
  let instructors: Array<{ id: unknown }> = [];
  let projectionKeys: Array<{ packageId: unknown; locationId: unknown }> = [];
  let instructorKeys: Array<{ classId: unknown; locationId: unknown }> = [];
  if (
    ['locations', 'pakets', 'kelas', 'kelas_activities', 'order_pakets', 'location_studios'].every(
      (table) => actualTables.has(table),
    )
  )
    [locations, packages, classes, instructors, projectionKeys, instructorKeys] =
      await Promise.all([
      source.$queryRawUnsafe<Array<{ id: unknown }>>('SELECT `id` FROM `locations` ORDER BY `id`'),
      source.$queryRawUnsafe<Array<{ id: unknown }>>('SELECT `id` FROM `pakets` ORDER BY `id`'),
      source.$queryRawUnsafe<Array<{ id: unknown }>>('SELECT `id` FROM `kelas` ORDER BY `id`'),
      source.$queryRawUnsafe<Array<{ id: unknown }>>(
        'SELECT DISTINCT a.`id_user` AS `id` FROM `kelas_activities` a INNER JOIN `users` u ON u.`id` = a.`id_user` ORDER BY a.`id_user`',
      ),
      source.$queryRawUnsafe<Array<{ packageId: unknown; locationId: unknown }>>(
        'SELECT DISTINCT o.`id_paket` AS `packageId`, o.`id_location` AS `locationId` FROM `order_pakets` o INNER JOIN `pakets` p ON p.`id` = o.`id_paket` INNER JOIN `locations` l ON l.`id` = o.`id_location` ORDER BY o.`id_paket`, o.`id_location`',
      ),
      source.$queryRawUnsafe<Array<{ classId: unknown; locationId: unknown }>>(
        'SELECT DISTINCT a.`id_kelas` AS `classId`, s.`id_location` AS `locationId` FROM `kelas_activities` a INNER JOIN `kelas` k ON k.`id` = a.`id_kelas` INNER JOIN `users` u ON u.`id` = a.`id_user` INNER JOIN `location_studios` s ON s.`id` = a.`id_location_studio` INNER JOIN `locations` l ON l.`id` = s.`id_location` ORDER BY a.`id_kelas`, s.`id_location`',
      ),
      ]);
  const branchIdBySourceLocation = new Map(
    locations.map((row) => [
      textValue(row.id),
      deterministicId(`${SOURCE_SYSTEM}:locations:${textValue(row.id)}:Branch`),
    ]),
  );
  const financeConfigurationCatalog = {
    branches: [...branchIdBySourceLocation.values()],
    classTypes: classes.map((row) =>
      deterministicId(`${SOURCE_SYSTEM}:kelas:${textValue(row.id)}:ClassType`),
    ),
    instructors: instructors.map((row) =>
      deterministicId(`${SOURCE_SYSTEM}:users:${textValue(row.id)}:User`),
    ),
    sourcePackages: packages.map((row) => textValue(row.id)),
    sourceLocations: locations.map((row) => textValue(row.id)),
    sourceClasses: classes.map((row) => textValue(row.id)),
    requiredHistoricalProjectionKeys: projectionKeys.map(
      (row) => `${textValue(row.packageId)}:${textValue(row.locationId)}`,
    ),
    requiredHistoricalInstructorKeys: instructorKeys.flatMap((row) => {
      const branchId = branchIdBySourceLocation.get(textValue(row.locationId));
      return branchId ? [`${textValue(row.classId)}:branch:${branchId}`] : [];
    }),
  };
  return {
    sourceSystem: SOURCE_SYSTEM,
    schema: {
      contractVersion: schemaContract.contractVersion,
      mappingVersion: V1_MAPPING_VERSION,
      expectedTableCount: SOURCE_TABLES.length,
      actualTableCount: actualTables.size,
      missingTables,
      unexpectedTables,
      columnMismatches,
    },
    counts,
    financeConfigurationCatalog,
    mappingPolicy: TABLE_POLICIES,
    columnRegistry: {
      total: V1_COLUMN_REGISTRY.length,
      dispositions: summarizeV1ColumnRegistry(),
    },
    columns: Object.fromEntries(
      SOURCE_TABLES.map((table) => [
        table,
        tableRows
          .filter((row) => row.TABLE_NAME === table)
          .map(({ COLUMN_NAME, DATA_TYPE }) => ({ name: COLUMN_NAME, type: DATA_TYPE })),
      ]),
    ),
  };
}

async function assertTargetEmpty(target: PrismaClient) {
  const schemaOwnedReferenceTables = new Set([
    'CapabilityDefinition',
    'RoleDefinition',
    'RoleCapability',
  ]);
  const tables = await target.$queryRaw<Array<{ TABLE_NAME: string }>>`
    SELECT TABLE_NAME
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME <> '_prisma_migrations'
      AND TABLE_NAME NOT LIKE 'Migration%'
    ORDER BY TABLE_NAME
  `;
  const nonEmpty: Array<{ table: string; count: number }> = [];
  for (const { TABLE_NAME } of tables) {
    if (!/^[A-Za-z0-9_]+$/u.test(TABLE_NAME)) throw new Error('UNSAFE_TARGET_TABLE_NAME');
    if (schemaOwnedReferenceTables.has(TABLE_NAME)) continue;
    const rows =
      TABLE_NAME === 'AuditLog'
        ? await target.$queryRawUnsafe<CountRow[]>(
            "SELECT COUNT(*) AS count FROM `AuditLog` WHERE `correlationId` NOT LIKE 'migration:%'",
          )
        : await target.$queryRawUnsafe<CountRow[]>(
            `SELECT COUNT(*) AS count FROM \`${TABLE_NAME}\``,
          );
    const count = Number(rows[0]?.count ?? 0);
    if (count > 0) nonEmpty.push({ table: TABLE_NAME, count });
  }
  if (nonEmpty.length)
    throw new Error(
      `TARGET_NOT_EMPTY:${nonEmpty.map((item) => `${item.table}=${item.count}`).join(',')}`,
    );
}

async function rehearsalPreflight(source: PrismaClient) {
  migrationMediaMode();
  const identityRows = await source.$queryRaw<
    Array<{
      databaseName: string;
      serverVersion: string;
      globalReadOnly: bigint | number;
      globalSuperReadOnly: bigint | number;
    }>
  >(Prisma.sql`
    SELECT
      DATABASE() AS databaseName,
      VERSION() AS serverVersion,
      @@GLOBAL.read_only AS globalReadOnly,
      @@GLOBAL.super_read_only AS globalSuperReadOnly
  `);
  const identity = identityRows[0];
  if (!identity?.databaseName) throw new Error('SOURCE_DATABASE_IDENTITY_REQUIRED');
  const grantRows = await source.$queryRawUnsafe<Array<Record<string, unknown>>>(
    'SHOW GRANTS FOR CURRENT_USER',
  );
  const grants = grantRows.flatMap((row) => Object.values(row).map((value) => String(value)));
  const normalized = grants.join('\n').toUpperCase();
  if (!/\bSELECT\b/u.test(normalized)) throw new Error('SOURCE_CREDENTIAL_SELECT_REQUIRED');
  if (
    /\b(?:ALL PRIVILEGES|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TRIGGER|EXECUTE|CREATE USER|GRANT OPTION)\b/u.test(
      normalized,
    )
  )
    throw new Error('SOURCE_CREDENTIAL_NOT_READ_ONLY');
  return {
    sourceDatabaseHash: recordChecksum({ databaseName: identity.databaseName }),
    serverVersion: identity.serverVersion,
    credentialReadOnly: true,
    grantSetHash: recordChecksum(grants.sort()),
    serverReadOnly: Boolean(Number(identity.globalReadOnly)),
    serverSuperReadOnly: Boolean(Number(identity.globalSuperReadOnly)),
    mediaMode: migrationMediaMode(),
  };
}

async function verifyDump(args: Args): Promise<string> {
  const dumpPath = required(
    typeof args.dump === 'string' ? args.dump : undefined,
    'DUMP_PATH_REQUIRED',
  );
  const expected = required(process.env.V1_DUMP_SHA256, 'V1_DUMP_SHA256_REQUIRED').toLowerCase();
  const actual = await sha256File(dumpPath);
  if (actual !== expected) throw new Error('SOURCE_DUMP_CHECKSUM_MISMATCH');
  return actual;
}

function phaseFrom(args: Args): (typeof PHASES)[number] {
  const phase = required(typeof args.phase === 'string' ? args.phase : undefined, 'PHASE_REQUIRED');
  if (!PHASES.includes(phase as never)) throw new Error('INVALID_PHASE');
  return phase as (typeof PHASES)[number];
}

async function prepareBatch(target: PrismaClient, args: Args, checksum: string) {
  migrationMediaMode();
  assertV1ColumnRegistry();
  const phase = phaseFrom(args);
  const mappingVersion = required(process.env.V1_MAPPING_VERSION, 'V1_MAPPING_VERSION_REQUIRED');
  if (mappingVersion !== V1_MAPPING_VERSION) throw new Error('MAPPING_VERSION_CONTRACT_MISMATCH');
  const sourceSnapshotAt = new Date(
    required(process.env.V1_SNAPSHOT_AT, 'V1_SNAPSHOT_AT_REQUIRED'),
  );
  if (Number.isNaN(sourceSnapshotAt.getTime())) throw new Error('INVALID_V1_SNAPSHOT_AT');
  const existing = await target.migrationBatch.findFirst({
    where: { sourceSystem: SOURCE_SYSTEM, sourceChecksum: checksum, mappingVersion, phase },
  });
  if (existing) return existing;
  if (args.delta !== true) await assertPhaseOrder(target, phase, checksum);
  return target.migrationBatch.create({
    data: {
      sourceSystem: SOURCE_SYSTEM,
      sourceSnapshotAt,
      sourceChecksum: checksum,
      mappingVersion,
      phase,
      storageManifestChecksum:
        typeof args['storage-manifest-sha256'] === 'string'
          ? args['storage-manifest-sha256']
          : null,
      delta: args.delta === true,
      parentBatchId: typeof args['parent-batch'] === 'string' ? args['parent-batch'] : null,
    },
  });
}

async function assertPhaseOrder(
  target: PrismaClient,
  phase: (typeof PHASES)[number],
  checksum: string,
) {
  const index = PHASES.indexOf(phase);
  if (index === 0) {
    await assertTargetEmpty(target);
    return;
  }
  const mappingVersion = required(process.env.V1_MAPPING_VERSION, 'V1_MAPPING_VERSION_REQUIRED');
  const previous = await target.migrationBatch.findFirst({
    where: {
      sourceSystem: SOURCE_SYSTEM,
      sourceChecksum: checksum,
      mappingVersion,
      phase: PHASES[index - 1],
      status: 'COMPLETED',
    },
  });
  if (!previous) throw new Error(`PREVIOUS_PHASE_NOT_COMPLETED:${PHASES[index - 1]}`);
}

async function runImport(source: PrismaClient, target: PrismaClient, batchId: string, args: Args) {
  migrationMediaMode();
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const batch = await target.migrationBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new Error('BATCH_NOT_FOUND');
  if (batch.delta) {
    if (batch.status === 'COMPLETED') return { batch, replay: true };
    const delta = await deltaImport(target, args);
    if (!delta.readyForCutover)
      throw new Error(`DELTA_IMPORT_BLOCKED_BY_UNMAPPED_EVENTS:${delta.blocked}`);
    const completed = await target.migrationBatch.update({
      where: { id: batch.id },
      data: {
        status: 'COMPLETED',
        startedAt: batch.startedAt ?? new Date(),
        completedAt: new Date(),
        failureCode: null,
      },
    });
    return { batch: completed, delta };
  }
  const checksum = await verifyDump(args);
  if (checksum !== batch.sourceChecksum) throw new Error('BATCH_SOURCE_CHECKSUM_MISMATCH');
  if (
    required(process.env.V1_MAPPING_VERSION, 'V1_MAPPING_VERSION_REQUIRED') !== batch.mappingVersion
  )
    throw new Error('BATCH_MAPPING_VERSION_MISMATCH');
  const sourceProfile = await profile(source);
  if (
    sourceProfile.schema.missingTables.length ||
    sourceProfile.schema.unexpectedTables.length ||
    sourceProfile.schema.columnMismatches.length
  )
    throw new Error('SOURCE_SCHEMA_MISMATCH');
  if (batch.status === 'COMPLETED') return { batch, replay: true };
  if (!['PENDING', 'FAILED'].includes(batch.status))
    throw new Error(`BATCH_NOT_RESUMABLE:${batch.status}`);
  await target.migrationBatch.update({
    where: { id: batchId },
    data: { status: 'RUNNING', startedAt: batch.startedAt ?? new Date(), failureCode: null },
  });
  try {
    let result: unknown;
    if (batch.phase === 'branch-master')
      result = await importBranchMaster(source, target, batch.id, batch.mappingVersion);
    else if (batch.phase === 'user-role')
      result = await importUserRole(source, target, batch.id, batch.mappingVersion);
    else if (batch.phase === 'package-order')
      result = await importPackageOrder(source, target, batch.id, batch.mappingVersion);
    else if (batch.phase === 'ledger')
      result = await importLedger(source, target, batch.id, batch.mappingVersion);
    else if (batch.phase === 'slot-booking')
      result = await importSlotBooking(source, target, batch.id, batch.mappingVersion);
    else if (batch.phase === 'voucher-finance-audit-media')
      result = await importVoucherFinanceAuditMedia(
        source,
        target,
        batch.id,
        batch.mappingVersion,
        args,
        batch.storageManifestChecksum,
      );
    else throw new Error(`INVALID_PHASE:${batch.phase}`);
    const openMaterialRejects = await target.migrationReject.count({
      where: { batchId: batch.id, status: 'OPEN' },
    });
    if (openMaterialRejects > 0)
      throw new Error(`OPEN_MATERIAL_RESOLUTIONS:${openMaterialRejects}`);
    const completed = await target.migrationBatch.update({
      where: { id: batchId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    return { batch: completed, replay: false, result };
  } catch (error) {
    console.error('IMPORT_PHASE_ERROR:', error);
    const failureCode = (error instanceof Error ? error.message : 'IMPORT_FAILED')
      .split(':')[0]!
      .slice(0, 64);
    await target.migrationBatch.update({
      where: { id: batchId },
      data: { status: 'FAILED', failureCode },
    });
    throw error;
  }
}

type DimensionalControlRow = {
  dimensionKey: string;
  count?: bigint | number | Prisma.Decimal | string | null;
  amount?: bigint | number | Prisma.Decimal | string | null;
};

function integerText(value: bigint | number | Prisma.Decimal | string | null | undefined): string {
  if (value === null || value === undefined) return '0';
  const raw = Prisma.Decimal.isDecimal(value) ? value.toFixed(0) : String(value);
  if (!/^-?\d+$/u.test(raw)) throw new Error('CONTROL_TOTAL_NOT_INTEGER');
  return BigInt(raw).toString();
}

function jsonInteger(value: string): number | string {
  const integer = BigInt(value);
  return integer <= BigInt(Number.MAX_SAFE_INTEGER) && integer >= BigInt(Number.MIN_SAFE_INTEGER)
    ? Number(integer)
    : value;
}

function dimensionalValues(
  rows: DimensionalControlRow[],
  field: 'count' | 'amount',
): Map<string, string> {
  return new Map(rows.map((row) => [row.dimensionKey, integerText(row[field])]));
}

async function reconciliationQuery<T>(code: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch {
    throw new Error(`RECONCILIATION_${code}_QUERY_FAILED`);
  }
}

async function reconcile(source: PrismaClient, target: PrismaClient, batchId: string) {
  migrationMediaMode();
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const batch = await target.migrationBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new Error('BATCH_NOT_FOUND');
  const runBatches = await target.migrationBatch.findMany({
    where: {
      sourceSystem: batch.sourceSystem,
      sourceChecksum: batch.sourceChecksum,
      mappingVersion: batch.mappingVersion,
    },
    select: { id: true },
  });
  const runBatchIds = runBatches.map(({ id }) => id);
  const sourceCounts = Object.fromEntries(
    await Promise.all(
      SOURCE_TABLES.map(async (table) => [table, await sourceCount(source, table)]),
    ),
  );
  let deferredMediaExpected = 0;
  for (const spec of DEFERRED_MEDIA_FIELDS)
    deferredMediaExpected += (await sourceRows(source, spec.sourceTable)).filter((row) =>
      Boolean(textValue(row[spec.sourceField]).trim()),
    ).length;
  const imported = await target.$queryRaw<Array<{ sourceTable: string; count: bigint }>>(Prisma.sql`
    SELECT sourceTable, COUNT(DISTINCT sourceId) AS count
    FROM MigrationSourceKey
    WHERE batchId IN (${Prisma.join(runBatchIds)})
    GROUP BY sourceTable
  `);
  const targetCounts = Object.fromEntries(
    imported.map((row) => [row.sourceTable, Number(row.count)]),
  );
  const currentPhaseIndex = PHASES.indexOf(batch.phase as (typeof PHASES)[number]);
  const controls = SOURCE_TABLES.map((table) => {
    const policy = TABLE_POLICIES[table];
    const due =
      policy.disposition === 'IGNORE' || PHASES.indexOf(TABLE_PHASE[table]) <= currentPhaseIndex;
    const actual =
      policy.disposition === 'IGNORE' || !due ? sourceCounts[table] : (targetCounts[table] ?? 0);
    return {
      table,
      disposition: policy.disposition,
      due,
      expected: sourceCounts[table],
      actual,
      match: sourceCounts[table] === actual,
    };
  });
  const sessionRows = await source.$queryRaw<
    CountRow[]
  >`SELECT COALESCE(SUM(sisa), 0) AS count FROM order_pakets`;
  const activeSessionRows = await source.$queryRaw<
    CountRow[]
  >`SELECT COALESCE(SUM(sisa), 0) AS count FROM order_pakets WHERE deleted_at IS NULL AND is_active = 1`;
  const ledgerRows = await target.$queryRaw<
    CountRow[]
  >`SELECT COALESCE(SUM(kuantitas), 0) AS count FROM EntriBukuBesar WHERE tipe = 'MIGRATION_OPENING'`;
  const sourceRupiahRows = await source.$queryRaw<CountRow[]>(
    Prisma.sql`SELECT COALESCE(SUM(harga), 0) AS count FROM order_pakets`,
  );
  const targetRupiahRows = await target.$queryRaw<CountRow[]>(
    Prisma.sql`SELECT COALESCE(SUM(snapshot_harga_rp), 0) AS count FROM Pembelian`,
  );
  const sourceJournalRupiahRows = await source.$queryRaw<CountRow[]>(
    Prisma.sql`SELECT COALESCE(SUM(jumlah_uang), 0) AS count FROM jurnals`,
  );
  const targetJournalRupiahRows = await target.$queryRaw<CountRow[]>(
    Prisma.sql`SELECT COALESCE(SUM(amountRp), 0) AS count FROM EntriKeuanganHistoris`,
  );
  const sourceOrderRows = await sourceRows(source, 'order_pakets');
  const approvedSourceOrders = sourceOrderRows.filter(
    (row) =>
      !mapV1PurchaseStatus({ status: row.status, active: row.is_active }).conflict &&
      mapV1PurchaseStatus({ status: row.status, active: row.is_active }).status === 'APPROVED',
  );
  const projectionRates = optionalJsonMap('V1_PROJECTION_RATES');
  const sourceApprovedRevenue = approvedSourceOrders.reduce(
    (sum, row) => sum + BigInt(intValue(row.harga)),
    0n,
  );
  const sourceProjection = approvedSourceOrders.reduce((sum, row) => {
    const rate = Number(
      projectionRates[`${textValue(row.id_paket)}:${textValue(row.id_location)}`],
    );
    return (
      sum +
      BigInt(
        Number.isSafeInteger(rate) && rate >= 0 ? rate * positiveInt(row.jumlah_pertemuan, 1) : 0,
      )
    );
  }, 0n);
  const targetFinancialRows = await target.$queryRaw<
    Array<{
      grossSalesRp: Prisma.Decimal;
      revenueRp: Prisma.Decimal;
      projectionRp: Prisma.Decimal;
      missingFacts: bigint;
      snapshotMismatch: bigint;
    }>
  >(Prisma.sql`
    SELECT
      COALESCE(SUM(p.snapshot_harga_rp), 0) AS grossSalesRp,
      COALESCE(SUM(cp.harga_jual_rp), 0) AS revenueRp,
      COALESCE(SUM(cp.rate_proyeksi_rp * cp.snapshot_jumlah_sesi), 0) AS projectionRp,
      SUM(CASE WHEN cp.id IS NULL THEN 1 ELSE 0 END) AS missingFacts,
      SUM(CASE WHEN cp.id IS NOT NULL AND (
        cp.harga_jual_rp <> COALESCE(p.snapshot_harga_setelah_diskon_rp, p.snapshot_harga_rp)
        OR cp.snapshot_jumlah_sesi <> p.sessionCountSnapshot
      ) THEN 1 ELSE 0 END) AS snapshotMismatch
    FROM Pembelian p
    LEFT JOIN PaketPelanggan cp ON cp.pembelian_id = p.id
    WHERE p.status = 'APPROVED'
  `);
  const [targetInstructorHourLogCount, targetInstructorHourLogSourceCount, invalidInstructorFacts] =
    await Promise.all([
      target.rekapJamInstruktur.count(),
      target.migrationSourceKey.count({
        where: {
          batchId: { in: runBatchIds },
          sourceTable: 'kelas_activities',
          targetType: 'InstructorHourLog',
        },
      }),
      target.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT COUNT(*) AS count FROM RekapJamInstruktur
        WHERE matchedUnits <> 1 OR amountRp <> feeRpSnapshot OR amountRp < 0
      `),
    ]);
  const [
    sourceOrderDimensions,
    targetOrderDimensions,
    sourceOperationalOrderStatuses,
    targetOperationalOrderStatuses,
    sourceBookingStatuses,
    targetBookingStatuses,
    sourceReservationStatuses,
    targetReservationStatuses,
    sourceSlotStatuses,
    targetSlotStatuses,
    sourceAttendanceOutcomes,
    targetAttendanceOutcomes,
  ] = await Promise.all([
    reconciliationQuery('SOURCE_ORDER_DIMENSIONS', () =>
      source.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CONCAT(
        'branch=', COALESCE(CAST(id_location AS CHAR), 'NULL'),
        '|package=', COALESCE(CAST(id_paket AS CHAR), 'NULL'),
        '|status=', COALESCE(CAST(status AS CHAR), 'NULL'),
        '|date=', DATE_FORMAT(created_at, '%Y-%m-%d')
      ) AS dimensionKey,
      COUNT(*) AS count,
      COALESCE(SUM(harga), 0) AS amount
      FROM order_pakets
      GROUP BY CONCAT(
        'branch=', COALESCE(CAST(id_location AS CHAR), 'NULL'),
        '|package=', COALESCE(CAST(id_paket AS CHAR), 'NULL'),
        '|status=', COALESCE(CAST(status AS CHAR), 'NULL'),
        '|date=', DATE_FORMAT(created_at, '%Y-%m-%d')
      )
    `),
    ),
    reconciliationQuery('TARGET_ORDER_DIMENSIONS', () =>
      target.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CONCAT(
        'branch=', COALESCE(branchKey.sourceId, 'NULL'),
        '|package=', COALESCE(packageKey.sourceId, 'NULL'),
        '|status=', COALESCE(p.sourceStatusCode, 'NULL'),
        '|date=', DATE_FORMAT(p.diajukan_pada, '%Y-%m-%d')
      ) AS dimensionKey,
      COUNT(*) AS count,
      COALESCE(SUM(p.snapshot_harga_rp), 0) AS amount
      FROM Pembelian p
      LEFT JOIN MigrationSourceKey branchKey
        ON branchKey.sourceSystem = ${SOURCE_SYSTEM}
        AND branchKey.sourceTable = 'locations'
        AND branchKey.targetType = 'Branch'
        AND branchKey.targetId = p.cabang_id
      LEFT JOIN MigrationSourceKey packageKey
        ON packageKey.sourceSystem = ${SOURCE_SYSTEM}
        AND packageKey.sourceTable = 'pakets'
        AND packageKey.targetType = 'Package'
        AND packageKey.targetId = p.paket_id
      GROUP BY CONCAT(
        'branch=', COALESCE(branchKey.sourceId, 'NULL'),
        '|package=', COALESCE(packageKey.sourceId, 'NULL'),
        '|status=', COALESCE(p.sourceStatusCode, 'NULL'),
        '|date=', DATE_FORMAT(p.diajukan_pada, '%Y-%m-%d')
      )
    `),
    ),
    source.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CONCAT('status=', status, '|active=', is_active) AS dimensionKey,
        COUNT(*) AS count
      FROM order_pakets
      GROUP BY CONCAT('status=', status, '|active=', is_active)
    `),
    target.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CONCAT('status=', sourceStatusCode, '|active=', sourceActiveFlag) AS dimensionKey,
        COUNT(*) AS count
      FROM Pembelian
      GROUP BY CONCAT('status=', sourceStatusCode, '|active=', sourceActiveFlag)
    `),
    source.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CASE
        WHEN deleted_at IS NOT NULL THEN 'CANCELLED'
        WHEN status_kehadiran = 1 THEN 'ATTENDED'
        WHEN status_kehadiran = 3 THEN 'NO_SHOW'
        ELSE 'BOOKED'
      END AS dimensionKey, COUNT(*) AS count
      FROM booking_kelas
      GROUP BY CASE
        WHEN deleted_at IS NOT NULL THEN 'CANCELLED'
        WHEN status_kehadiran = 1 THEN 'ATTENDED'
        WHEN status_kehadiran = 3 THEN 'NO_SHOW'
        ELSE 'BOOKED'
      END
    `),
    target.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT status AS dimensionKey, COUNT(*) AS count
      FROM PemesananKelas
      GROUP BY status
    `),
    source.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CASE
        WHEN deleted_at IS NULL AND COALESCE(status_kehadiran, 0) = 0 THEN 'ACTIVE'
        WHEN deleted_at IS NULL AND status_kehadiran = 1 THEN 'CONSUMED'
        ELSE 'RELEASED'
      END AS dimensionKey, COUNT(*) AS count, COUNT(*) AS amount
      FROM booking_kelas
      GROUP BY CASE
        WHEN deleted_at IS NULL AND COALESCE(status_kehadiran, 0) = 0 THEN 'ACTIVE'
        WHEN deleted_at IS NULL AND status_kehadiran = 1 THEN 'CONSUMED'
        ELSE 'RELEASED'
      END
    `),
    target.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT status AS dimensionKey, COUNT(*) AS count, COALESCE(SUM(quantity), 0) AS amount
      FROM ReservasiSesi
      GROUP BY status
    `),
    source.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT slotStatus.dimensionKey, COUNT(*) AS count
      FROM (
        SELECT CASE activity.status
          WHEN 1 THEN 'PUBLISHED'
          WHEN 2 THEN 'CONFIRMED'
          WHEN 3 THEN 'COMPLETED'
          WHEN 4 THEN 'CANCELLED'
          ELSE CONCAT('UNKNOWN:', COALESCE(CAST(activity.status AS CHAR), 'NULL'))
        END AS dimensionKey
        FROM kelas_activities activity
        UNION ALL
        SELECT CASE meeting.status
          WHEN 1 THEN 'PUBLISHED'
          WHEN 2 THEN 'CONFIRMED'
          WHEN 3 THEN 'COMPLETED'
          WHEN 4 THEN 'CANCELLED'
          ELSE CONCAT('UNKNOWN:', COALESCE(CAST(meeting.status AS CHAR), 'NULL'))
        END AS dimensionKey
        FROM kelas_pertamuans meeting
        WHERE NOT EXISTS (
          SELECT 1
          FROM kelas_activities activity
          WHERE activity.id_kelas = meeting.id_kelas
            AND TIMESTAMP(DATE(activity.tanggal), TIME(activity.jam_mulai)) = meeting.datetime_avaiable
        )
      ) slotStatus
      GROUP BY slotStatus.dimensionKey
    `),
    target.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT status AS dimensionKey, COUNT(*) AS count FROM SlotKelas GROUP BY status
    `),
    source.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT CASE status_kehadiran
        WHEN 1 THEN 'ATTENDED'
        WHEN 2 THEN 'EXCUSED'
        WHEN 3 THEN 'NO_SHOW'
        ELSE 'UNKNOWN_HISTORICAL'
      END AS dimensionKey, COUNT(*) AS count
      FROM booking_kelas
      GROUP BY CASE status_kehadiran
        WHEN 1 THEN 'ATTENDED'
        WHEN 2 THEN 'EXCUSED'
        WHEN 3 THEN 'NO_SHOW'
        ELSE 'UNKNOWN_HISTORICAL'
      END
    `),
    target.$queryRaw<DimensionalControlRow[]>(Prisma.sql`
      SELECT outcome AS dimensionKey, COUNT(*) AS count
      FROM HasilKehadiranPemesanan GROUP BY outcome
    `),
  ]);
  const sourceOrderCount = sourceCounts.order_pakets ?? 0;
  const [
    openRejects,
    openResolutions,
    orphanCounts,
    deferredMediaActual,
    activeMediaRows,
    targetCustomerPackageCount,
    targetOpeningLedgerCount,
    duplicateOpeningLedgerRows,
  ] = await Promise.all([
    target.migrationReject.count({ where: { batchId: { in: runBatchIds }, status: 'OPEN' } }),
    target.migrationResolution.count({ where: { batchId: { in: runBatchIds }, status: 'OPEN' } }),
    target.$queryRaw<Array<{ kind: string; count: bigint }>>(Prisma.sql`
      SELECT 'PACKAGE_BRANCH_SCOPE' AS kind, COUNT(*) AS count
      FROM CakupanCabangPaket scopeRow LEFT JOIN Cabang branchRow ON branchRow.id = scopeRow.branchId
      WHERE branchRow.id IS NULL
      UNION ALL
      SELECT 'CLASS_TYPE_BRANCH_SCOPE', COUNT(*)
      FROM CakupanCabangJenisKelas scopeRow LEFT JOIN Cabang branchRow ON branchRow.id = scopeRow.branchId
      WHERE branchRow.id IS NULL
      UNION ALL
      SELECT 'CLASS_SLOT_STUDIO', COUNT(*)
      FROM SlotKelas slotRow LEFT JOIN Studio studioRow ON studioRow.id = slotRow.studio_id
      WHERE studioRow.id IS NULL OR studioRow.branchId <> slotRow.cabang_id
      UNION ALL
      SELECT 'PURCHASE_USER', COUNT(*)
      FROM \`Pembelian\` purchaseRow LEFT JOIN \`User\` userRow ON userRow.id = purchaseRow.pengguna_id
      WHERE userRow.id IS NULL
      UNION ALL
      SELECT 'BOOKING_PACKAGE', COUNT(*)
      FROM \`PemesananKelas\` bookingRow LEFT JOIN \`PaketPelanggan\` customerPackageRow ON customerPackageRow.id = bookingRow.paket_pelanggan_id
      WHERE customerPackageRow.id IS NULL
      UNION ALL
      SELECT 'LEGACY_FINANCE_PURCHASE', COUNT(*)
      FROM EntriKeuanganHistoris financeRow LEFT JOIN Pembelian purchaseRow ON purchaseRow.id = financeRow.purchaseId
      WHERE financeRow.purchaseId IS NOT NULL AND purchaseRow.id IS NULL
      UNION ALL
      SELECT 'INSTRUCTOR_COMPENSATION_RELATION', COUNT(*)
      FROM RekapJamInstruktur hourLog
      LEFT JOIN SlotKelas slotRow ON slotRow.id = hourLog.classSlotId
      LEFT JOIN User instructorRow ON instructorRow.id = hourLog.instructorUserId
      LEFT JOIN KonfigurasiEfektif configRow ON configRow.id = hourLog.effectiveConfigurationId
      WHERE slotRow.id IS NULL OR instructorRow.id IS NULL OR configRow.id IS NULL
    `),
    target.migrationDeferredMediaReference.count({ where: { batchId: { in: runBatchIds } } }),
    target.$queryRaw<Array<{ kind: string; count: bigint }>>(Prisma.sql`
      SELECT 'IDENTITY_DOCUMENT' AS kind, COUNT(*) AS count FROM DokumenVerifikasiIdentitas
      UNION ALL SELECT 'PAYMENT_PROOF', COUNT(*) FROM BuktiPembayaran
      UNION ALL SELECT 'MEDIA_ASSET', COUNT(*) FROM AsetMedia
    `),
    target.paketPelanggan.count(),
    target.entriBukuBesar.count({ where: { type: 'MIGRATION_OPENING' } }),
    target.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM (
        SELECT paket_pelanggan_id
        FROM EntriBukuBesar
        WHERE tipe = 'MIGRATION_OPENING'
        GROUP BY paket_pelanggan_id
        HAVING COUNT(*) > 1
      ) duplicateOpening
    `),
  ]);
  const [
    sourceAssignmentRows,
    targetUserCount,
    targetUserRoleCount,
    targetAssignmentCount,
    targetCapabilitySourceCount,
    targetBookingCount,
    targetReservationCount,
    targetAttendanceCount,
    targetVoucherEntitlementCount,
    targetVoucherRedemptionCount,
    targetCoaSourceCount,
    targetJournalCount,
    targetPackageBranchScopeCount,
    targetPackageClassScopeCount,
    targetClassTypeBranchScopeCount,
    targetSlotVenueCount,
    targetBookingOutcomeCount,
    targetLegacyPayloadCount,
    targetVerifiedEmailCount,
    targetAuditSourceCount,
    targetNotificationSourceCount,
    sourceVoucherRedemptionRows,
    sourceAttendanceRows,
    sourcePackageBranchScopeRows,
    sourcePackageClassScopeRows,
    sourceClassTypeBranchScopeRows,
    sourceSlotVenueRows,
    sourceVerifiedEmailRows,
    sourceJournalRelationRows,
    targetJournalRelationRows,
  ] = await Promise.all([
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM model_has_roles WHERE role_id IN (2, 5)
    `),
    target.user.count(),
    target.userRole.count(),
    target.penugasan.count(),
    target.migrationSourceKey.count({
      where: {
        batchId: { in: runBatchIds },
        sourceTable: 'permissions',
        targetType: 'CapabilityDefinition',
      },
    }),
    target.pemesananKelas.count(),
    target.reservasiSesi.count(),
    target.kehadiranPelanggan.count(),
    target.hakVoucherPelanggan.count(),
    target.penukaranVoucher.count(),
    target.migrationSourceKey.count({
      where: {
        batchId: { in: runBatchIds },
        sourceTable: 'coas',
        targetType: 'AccountingAccount',
      },
    }),
    target.entriKeuanganHistoris.count(),
    target.cakupanCabangPaket.count(),
    target.cakupanJenisKelasPaket.count(),
    target.cakupanCabangJenisKelas.count(),
    target.slotKelas.count({ where: { studioId: { not: '' } } }),
    target.hasilKehadiranPemesanan.count(),
    target.migrationLegacyPayload.count(),
    target.identitas.count({ where: { provider: 'EMAIL_PASSWORD', verifiedAt: { not: null } } }),
    target.auditLog.count({ where: { sourceSystem: SOURCE_SYSTEM, sourceTable: 'activity_log' } }),
    target.migrationSourceKey.count({
      where: {
        batchId: { in: runBatchIds },
        sourceTable: 'notifications',
        targetType: 'UserNotification',
      },
    }),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM voucher_customers WHERE status_digunakan = 1
    `),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT
        (SELECT COUNT(*) FROM check_in_outs) +
        (SELECT COUNT(*) FROM kelas_pertemuan_absensis) AS count
    `),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM (
        SELECT id_paket, id_location FROM paket_locations WHERE id_location IS NOT NULL
      ) packageBranches
    `),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM (
        SELECT id_paket, id_kelas FROM kelas_pakets WHERE id_kelas IS NOT NULL
        UNION
        SELECT id, id_kelas FROM pakets WHERE id_kelas IS NOT NULL
      ) packageClasses
    `),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM (
        SELECT id AS id_kelas, id_location FROM kelas WHERE id_location IS NOT NULL
        UNION
        SELECT activity.id_kelas, studio.id_location
        FROM kelas_activities activity
        JOIN location_studios studio ON studio.id = activity.id_location_studio
        WHERE studio.id_location IS NOT NULL
      ) classBranches
    `),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT
        (SELECT COUNT(*) FROM kelas_activities WHERE id_location_studio IS NOT NULL) +
        (SELECT COUNT(*)
          FROM kelas_pertamuans meeting
          WHERE NOT EXISTS (
            SELECT 1
            FROM kelas_activities activity
            WHERE activity.id_kelas = meeting.id_kelas
              AND TIMESTAMP(DATE(activity.tanggal), TIME(activity.jam_mulai)) = meeting.datetime_avaiable
          )
        ) AS count
    `),
    source.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM users WHERE email_verified_at IS NOT NULL
    `),
    source.$queryRaw<
      Array<{
        parentCount: bigint;
        orderCount: bigint;
        debitRp: Prisma.Decimal;
        creditRp: Prisma.Decimal;
      }>
    >(Prisma.sql`
      SELECT
        SUM(CASE WHEN id_parent IS NOT NULL THEN 1 ELSE 0 END) AS parentCount,
        SUM(CASE WHEN id_order_paket IS NOT NULL THEN 1 ELSE 0 END) AS orderCount,
        COALESCE(SUM(CASE WHEN tipe = 1 THEN jumlah_uang ELSE 0 END), 0) AS debitRp,
        COALESCE(SUM(CASE WHEN tipe = 0 THEN jumlah_uang ELSE 0 END), 0) AS creditRp
      FROM jurnals
    `),
    target.$queryRaw<
      Array<{
        parentCount: bigint;
        orderCount: bigint;
        debitRp: Prisma.Decimal;
        creditRp: Prisma.Decimal;
      }>
    >(Prisma.sql`
      SELECT
        SUM(CASE WHEN parentId IS NOT NULL THEN 1 ELSE 0 END) AS parentCount,
        SUM(CASE WHEN purchaseId IS NOT NULL THEN 1 ELSE 0 END) AS orderCount,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amountRp ELSE 0 END), 0) AS debitRp,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amountRp ELSE 0 END), 0) AS creditRp
      FROM EntriKeuanganHistoris
    `),
  ]);
  const checkedAt = new Date();
  await Promise.all(
    controls.map((control) => {
      const dimensions = { sourceTable: control.table };
      const dimensionHash = recordChecksum(dimensions);
      return target.migrationControlTotal.upsert({
        where: {
          batchId_controlKey_dimensionHash: {
            batchId,
            controlKey: 'SOURCE_RECORD_COUNT',
            dimensionHash,
          },
        },
        create: {
          batchId,
          controlKey: 'SOURCE_RECORD_COUNT',
          dimensionHash,
          dimensions,
          expectedValue: control.expected,
          actualValue: control.actual,
          status: control.match ? 'MATCH' : 'MISMATCH',
          checkedAt,
        },
        update: {
          expectedValue: control.expected,
          actualValue: control.actual,
          status: control.match ? 'MATCH' : 'MISMATCH',
          checkedAt,
        },
      });
    }),
  );
  const sessionExpected = integerText(sessionRows[0]?.count);
  const sessionActual = integerText(ledgerRows[0]?.count);
  const sessionDimensionHash = recordChecksum({ scope: 'ALL' });
  await target.migrationControlTotal.upsert({
    where: {
      batchId_controlKey_dimensionHash: {
        batchId,
        controlKey: 'SESSION_BALANCE_TOTAL',
        dimensionHash: sessionDimensionHash,
      },
    },
    create: {
      batchId,
      controlKey: 'SESSION_BALANCE_TOTAL',
      dimensionHash: sessionDimensionHash,
      dimensions: { scope: 'ALL' },
      expectedValue: sessionExpected,
      actualValue: sessionActual,
      status: sessionExpected === sessionActual ? 'MATCH' : 'MISMATCH',
      checkedAt,
    },
    update: {
      expectedValue: sessionExpected,
      actualValue: sessionActual,
      status: sessionExpected === sessionActual ? 'MATCH' : 'MISMATCH',
      checkedAt,
    },
  });
  const rupiahExpected = integerText(sourceRupiahRows[0]?.count);
  const rupiahActual = integerText(targetRupiahRows[0]?.count);
  const rupiahDimensionHash = recordChecksum({ scope: 'ALL', currency: 'IDR' });
  await target.migrationControlTotal.upsert({
    where: {
      batchId_controlKey_dimensionHash: {
        batchId,
        controlKey: 'PURCHASE_RUPIAH_TOTAL',
        dimensionHash: rupiahDimensionHash,
      },
    },
    create: {
      batchId,
      controlKey: 'PURCHASE_RUPIAH_TOTAL',
      dimensionHash: rupiahDimensionHash,
      dimensions: { scope: 'ALL', currency: 'IDR' },
      expectedValue: rupiahExpected,
      actualValue: rupiahActual,
      status: rupiahExpected === rupiahActual ? 'MATCH' : 'MISMATCH',
      checkedAt,
    },
    update: {
      expectedValue: rupiahExpected,
      actualValue: rupiahActual,
      status: rupiahExpected === rupiahActual ? 'MATCH' : 'MISMATCH',
      checkedAt,
    },
  });
  const deferredDimensionHash = recordChecksum({ scope: 'ALL', mode: 'metadata-only' });
  await target.migrationControlTotal.upsert({
    where: {
      batchId_controlKey_dimensionHash: {
        batchId,
        controlKey: 'DEFERRED_MEDIA_REFERENCE_COUNT',
        dimensionHash: deferredDimensionHash,
      },
    },
    create: {
      batchId,
      controlKey: 'DEFERRED_MEDIA_REFERENCE_COUNT',
      dimensionHash: deferredDimensionHash,
      dimensions: { scope: 'ALL', mode: 'metadata-only', blocking: false },
      expectedValue: deferredMediaExpected,
      actualValue: deferredMediaActual,
      status: deferredMediaExpected === deferredMediaActual ? 'MATCH' : 'MISMATCH',
      checkedAt,
    },
    update: {
      expectedValue: deferredMediaExpected,
      actualValue: deferredMediaActual,
      status: deferredMediaExpected === deferredMediaActual ? 'MATCH' : 'MISMATCH',
      checkedAt,
    },
  });
  const exactControls = [
    {
      controlKey: 'ORDER_CUSTOMER_PACKAGE_CARDINALITY',
      phase: 'package-order',
      expected: integerText(sourceOrderCount),
      actual: integerText(targetCustomerPackageCount),
    },
    {
      controlKey: 'ORDER_OPENING_LEDGER_CARDINALITY',
      phase: 'ledger',
      expected: integerText(sourceOrderCount),
      actual: integerText(targetOpeningLedgerCount),
    },
    {
      controlKey: 'JOURNAL_RUPIAH_TOTAL',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceJournalRupiahRows[0]?.count),
      actual: integerText(targetJournalRupiahRows[0]?.count),
    },
    {
      controlKey: 'FINANCE_APPROVED_GROSS_SALES_TOTAL',
      phase: 'package-order',
      expected: sourceApprovedRevenue.toString(),
      actual: integerText(targetFinancialRows[0]?.grossSalesRp),
    },
    {
      controlKey: 'FINANCE_APPROVED_REVENUE_TOTAL',
      phase: 'package-order',
      expected: sourceApprovedRevenue.toString(),
      actual: integerText(targetFinancialRows[0]?.revenueRp),
    },
    {
      controlKey: 'FINANCE_PROJECTION_TOTAL',
      phase: 'package-order',
      expected: sourceProjection.toString(),
      actual: integerText(targetFinancialRows[0]?.projectionRp),
    },
    {
      controlKey: 'FINANCE_APPROVED_FACT_MISSING',
      phase: 'package-order',
      expected: '0',
      actual: integerText(targetFinancialRows[0]?.missingFacts),
    },
    {
      controlKey: 'FINANCE_APPROVED_SNAPSHOT_MISMATCH',
      phase: 'package-order',
      expected: '0',
      actual: integerText(targetFinancialRows[0]?.snapshotMismatch),
    },
    {
      controlKey: 'INSTRUCTOR_COMPENSATION_SOURCE_KEY_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(targetInstructorHourLogSourceCount),
      actual: integerText(targetInstructorHourLogCount),
    },
    {
      controlKey: 'INSTRUCTOR_COMPENSATION_INVALID_FACTS',
      phase: 'slot-booking',
      expected: '0',
      actual: integerText(invalidInstructorFacts[0]?.count),
    },
  ];
  for (const control of exactControls) {
    const dimensionHash = recordChecksum({ scope: 'ALL', controlKey: control.controlKey });
    await target.migrationControlTotal.upsert({
      where: {
        batchId_controlKey_dimensionHash: {
          batchId,
          controlKey: control.controlKey,
          dimensionHash,
        },
      },
      create: {
        batchId,
        controlKey: control.controlKey,
        dimensionHash,
        dimensions: { scope: 'ALL', phase: control.phase },
        expectedValue: control.expected,
        actualValue: control.actual,
        status: control.expected === control.actual ? 'MATCH' : 'MISMATCH',
        checkedAt,
      },
      update: {
        expectedValue: control.expected,
        actualValue: control.actual,
        status: control.expected === control.actual ? 'MATCH' : 'MISMATCH',
        checkedAt,
      },
    });
  }
  const sourceJournalRelations = sourceJournalRelationRows[0];
  const targetJournalRelations = targetJournalRelationRows[0];
  const sourceReservationQuantities = dimensionalValues(sourceReservationStatuses, 'amount');
  const targetReservationQuantities = dimensionalValues(targetReservationStatuses, 'amount');
  const sourceActiveReserved = sourceReservationQuantities.get('ACTIVE') ?? '0';
  const targetActiveReserved = targetReservationQuantities.get('ACTIVE') ?? '0';
  const extendedExactControls = [
    {
      controlKey: 'USER_CARDINALITY',
      phase: 'user-role',
      expected: integerText(sourceCounts.users),
      actual: integerText(targetUserCount),
    },
    {
      controlKey: 'USER_ROLE_CARDINALITY',
      phase: 'user-role',
      expected: integerText(sourceCounts.model_has_roles),
      actual: integerText(targetUserRoleCount),
    },
    {
      controlKey: 'ASSIGNMENT_CARDINALITY',
      phase: 'user-role',
      expected: integerText(sourceAssignmentRows[0]?.count),
      actual: integerText(targetAssignmentCount),
    },
    {
      controlKey: 'CAPABILITY_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceCounts.permissions),
      actual: integerText(targetCapabilitySourceCount),
    },
    {
      controlKey: 'VERIFIED_EMAIL_CARDINALITY',
      phase: 'user-role',
      expected: integerText(sourceVerifiedEmailRows[0]?.count),
      actual: integerText(targetVerifiedEmailCount),
    },
    {
      controlKey: 'CLASS_TYPE_BRANCH_SCOPE_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(sourceClassTypeBranchScopeRows[0]?.count),
      actual: integerText(targetClassTypeBranchScopeCount),
    },
    {
      controlKey: 'PACKAGE_BRANCH_SCOPE_CARDINALITY',
      phase: 'package-order',
      expected: integerText(sourcePackageBranchScopeRows[0]?.count),
      actual: integerText(targetPackageBranchScopeCount),
    },
    {
      controlKey: 'PACKAGE_CLASS_SCOPE_CARDINALITY',
      phase: 'package-order',
      expected: integerText(sourcePackageClassScopeRows[0]?.count),
      actual: integerText(targetPackageClassScopeCount),
    },
    {
      controlKey: 'CLASS_SLOT_VENUE_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(sourceSlotVenueRows[0]?.count),
      actual: integerText(targetSlotVenueCount),
    },
    {
      controlKey: 'BOOKING_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(sourceCounts.booking_kelas),
      actual: integerText(targetBookingCount),
    },
    {
      controlKey: 'RESERVATION_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(sourceCounts.booking_kelas),
      actual: integerText(targetReservationCount),
    },
    {
      controlKey: 'BOOKING_ATTENDANCE_OUTCOME_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(sourceCounts.booking_kelas),
      actual: integerText(targetBookingOutcomeCount),
    },
    {
      controlKey: 'ATTENDANCE_CARDINALITY',
      phase: 'slot-booking',
      expected: integerText(sourceAttendanceRows[0]?.count),
      actual: integerText(targetAttendanceCount),
    },
    {
      controlKey: 'SESSION_ACTIVE_RESERVED_TOTAL',
      phase: 'slot-booking',
      expected: sourceActiveReserved,
      actual: targetActiveReserved,
    },
    {
      controlKey: 'SESSION_CONSUMED_TOTAL',
      phase: 'slot-booking',
      expected: sourceReservationQuantities.get('CONSUMED') ?? '0',
      actual: targetReservationQuantities.get('CONSUMED') ?? '0',
    },
    {
      controlKey: 'SESSION_RELEASED_TOTAL',
      phase: 'slot-booking',
      expected: sourceReservationQuantities.get('RELEASED') ?? '0',
      actual: targetReservationQuantities.get('RELEASED') ?? '0',
    },
    {
      controlKey: 'SESSION_AVAILABLE_TOTAL',
      phase: 'slot-booking',
      expected: (
        BigInt(integerText(sessionRows[0]?.count)) - BigInt(sourceActiveReserved)
      ).toString(),
      actual: (BigInt(integerText(ledgerRows[0]?.count)) - BigInt(targetActiveReserved)).toString(),
    },
    {
      controlKey: 'VOUCHER_ENTITLEMENT_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceCounts.voucher_customers),
      actual: integerText(targetVoucherEntitlementCount),
    },
    {
      controlKey: 'VOUCHER_REDEMPTION_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceVoucherRedemptionRows[0]?.count),
      actual: integerText(targetVoucherRedemptionCount),
    },
    {
      controlKey: 'COA_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceCounts.coas),
      actual: integerText(targetCoaSourceCount),
    },
    {
      controlKey: 'JOURNAL_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceCounts.jurnals),
      actual: integerText(targetJournalCount),
    },
    {
      controlKey: 'JOURNAL_PARENT_RELATION_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceJournalRelations?.parentCount),
      actual: integerText(targetJournalRelations?.parentCount),
    },
    {
      controlKey: 'JOURNAL_ORDER_RELATION_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceJournalRelations?.orderCount),
      actual: integerText(targetJournalRelations?.orderCount),
    },
    {
      controlKey: 'JOURNAL_DEBIT_RUPIAH_TOTAL',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceJournalRelations?.debitRp),
      actual: integerText(targetJournalRelations?.debitRp),
    },
    {
      controlKey: 'JOURNAL_CREDIT_RUPIAH_TOTAL',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceJournalRelations?.creditRp),
      actual: integerText(targetJournalRelations?.creditRp),
    },
    {
      controlKey: 'AUDIT_EVENT_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceCounts.activity_log),
      actual: integerText(targetAuditSourceCount),
    },
    {
      controlKey: 'NOTIFICATION_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: integerText(sourceCounts.notifications),
      actual: integerText(targetNotificationSourceCount),
    },
    {
      controlKey: 'ENCRYPTED_LEGACY_PAYLOAD_CARDINALITY',
      phase: 'voucher-finance-audit-media',
      expected: (
        BigInt(integerText(sourceCounts.activity_log)) +
        BigInt(integerText(sourceCounts.notifications))
      ).toString(),
      actual: integerText(targetLegacyPayloadCount),
    },
  ] as const;
  for (const control of extendedExactControls) {
    const dimensions = { scope: 'ALL', phase: control.phase };
    const dimensionHash = recordChecksum(dimensions);
    await target.migrationControlTotal.upsert({
      where: {
        batchId_controlKey_dimensionHash: {
          batchId,
          controlKey: control.controlKey,
          dimensionHash,
        },
      },
      create: {
        batchId,
        controlKey: control.controlKey,
        dimensionHash,
        dimensions,
        expectedValue: control.expected,
        actualValue: control.actual,
        status: control.expected === control.actual ? 'MATCH' : 'MISMATCH',
        checkedAt,
      },
      update: {
        expectedValue: control.expected,
        actualValue: control.actual,
        status: control.expected === control.actual ? 'MATCH' : 'MISMATCH',
        checkedAt,
      },
    });
  }
  const dimensionalControls = [
    {
      controlKey: 'ORDER_COUNT_BY_BRANCH_PACKAGE_STATUS_DATE',
      phase: 'package-order',
      expected: dimensionalValues(sourceOrderDimensions, 'count'),
      actual: dimensionalValues(targetOrderDimensions, 'count'),
    },
    {
      controlKey: 'ORDER_RUPIAH_BY_BRANCH_PACKAGE_STATUS_DATE',
      phase: 'package-order',
      expected: dimensionalValues(sourceOrderDimensions, 'amount'),
      actual: dimensionalValues(targetOrderDimensions, 'amount'),
    },
    {
      controlKey: 'PURCHASE_STATUS_CARDINALITY',
      phase: 'package-order',
      expected: dimensionalValues(sourceOperationalOrderStatuses, 'count'),
      actual: dimensionalValues(targetOperationalOrderStatuses, 'count'),
    },
    {
      controlKey: 'BOOKING_STATUS_CARDINALITY',
      phase: 'slot-booking',
      expected: dimensionalValues(sourceBookingStatuses, 'count'),
      actual: dimensionalValues(targetBookingStatuses, 'count'),
    },
    {
      controlKey: 'RESERVATION_STATUS_CARDINALITY',
      phase: 'slot-booking',
      expected: dimensionalValues(sourceReservationStatuses, 'amount'),
      actual: dimensionalValues(targetReservationStatuses, 'amount'),
    },
    {
      controlKey: 'CLASS_SLOT_STATUS_CARDINALITY',
      phase: 'slot-booking',
      expected: dimensionalValues(sourceSlotStatuses, 'count'),
      actual: dimensionalValues(targetSlotStatuses, 'count'),
    },
    {
      controlKey: 'BOOKING_ATTENDANCE_OUTCOME_DIMENSIONS',
      phase: 'slot-booking',
      expected: dimensionalValues(sourceAttendanceOutcomes, 'count'),
      actual: dimensionalValues(targetAttendanceOutcomes, 'count'),
    },
  ] as const;
  const dimensionalMismatches: Array<{ controlKey: string; phase: string; dimensionKey: string }> =
    [];
  for (const control of dimensionalControls) {
    const dimensionKeys = [
      ...new Set([...control.expected.keys(), ...control.actual.keys()]),
    ].sort();
    for (const dimensionKey of dimensionKeys) {
      const expected = control.expected.get(dimensionKey) ?? '0';
      const actual = control.actual.get(dimensionKey) ?? '0';
      const dimensions = { key: dimensionKey, phase: control.phase };
      const dimensionHash = recordChecksum(dimensions);
      await target.migrationControlTotal.upsert({
        where: {
          batchId_controlKey_dimensionHash: {
            batchId,
            controlKey: control.controlKey,
            dimensionHash,
          },
        },
        create: {
          batchId,
          controlKey: control.controlKey,
          dimensionHash,
          dimensions,
          expectedValue: expected,
          actualValue: actual,
          status: expected === actual ? 'MATCH' : 'MISMATCH',
          checkedAt,
        },
        update: {
          expectedValue: expected,
          actualValue: actual,
          status: expected === actual ? 'MATCH' : 'MISMATCH',
          checkedAt,
        },
      });
      if (expected !== actual)
        dimensionalMismatches.push({
          controlKey: control.controlKey,
          phase: control.phase,
          dimensionKey,
        });
    }
  }
  const orphanTotal = orphanCounts.reduce((sum, item) => sum + Number(item.count), 0);
  const activeMediaTotal = activeMediaRows.reduce((sum, item) => sum + Number(item.count), 0);
  const phaseDue = (phase: string) =>
    currentPhaseIndex >= PHASES.indexOf(phase as (typeof PHASES)[number]);
  return {
    batchId,
    tables: controls,
    sessions: {
      sourceTotal: jsonInteger(sessionExpected),
      sourceActive: jsonInteger(integerText(activeSessionRows[0]?.count)),
      targetLedgerNet: jsonInteger(sessionActual),
      activeReserved: {
        expected: jsonInteger(sourceActiveReserved),
        actual: jsonInteger(targetActiveReserved),
      },
      consumed: {
        expected: jsonInteger(sourceReservationQuantities.get('CONSUMED') ?? '0'),
        actual: jsonInteger(targetReservationQuantities.get('CONSUMED') ?? '0'),
      },
      released: {
        expected: jsonInteger(sourceReservationQuantities.get('RELEASED') ?? '0'),
        actual: jsonInteger(targetReservationQuantities.get('RELEASED') ?? '0'),
      },
      available: {
        expected: jsonInteger((BigInt(sessionExpected) - BigInt(sourceActiveReserved)).toString()),
        actual: jsonInteger((BigInt(sessionActual) - BigInt(targetActiveReserved)).toString()),
      },
    },
    rupiah: {
      sourceTotal: jsonInteger(rupiahExpected),
      targetPurchaseSnapshots: jsonInteger(rupiahActual),
    },
    financial: {
      grossSalesRp: {
        expected: jsonInteger(sourceApprovedRevenue.toString()),
        actual: jsonInteger(integerText(targetFinancialRows[0]?.grossSalesRp)),
      },
      revenueRp: {
        expected: jsonInteger(sourceApprovedRevenue.toString()),
        actual: jsonInteger(integerText(targetFinancialRows[0]?.revenueRp)),
      },
      projectionRp: {
        expected: jsonInteger(sourceProjection.toString()),
        actual: jsonInteger(integerText(targetFinancialRows[0]?.projectionRp)),
      },
      instructorCompensation: {
        sourceKeys: targetInstructorHourLogSourceCount,
        facts: targetInstructorHourLogCount,
        invalidFacts: Number(invalidInstructorFacts[0]?.count ?? 0),
      },
    },
    exact: {
      customerPackages: {
        expected: jsonInteger(integerText(sourceOrderCount)),
        actual: jsonInteger(integerText(targetCustomerPackageCount)),
      },
      openingLedgers: {
        expected: jsonInteger(integerText(sourceOrderCount)),
        actual: jsonInteger(integerText(targetOpeningLedgerCount)),
        duplicates: Number(duplicateOpeningLedgerRows[0]?.count ?? 0),
      },
      journalRupiah: {
        expected: jsonInteger(integerText(sourceJournalRupiahRows[0]?.count)),
        actual: jsonInteger(integerText(targetJournalRupiahRows[0]?.count)),
      },
      controls: Object.fromEntries(
        extendedExactControls.map((control) => [
          control.controlKey,
          {
            phase: control.phase,
            expected: jsonInteger(control.expected),
            actual: jsonInteger(control.actual),
            match: control.expected === control.actual,
          },
        ]),
      ),
    },
    dimensional: {
      controlCount: dimensionalControls.length,
      mismatchCount: dimensionalMismatches.length,
      mismatches: dimensionalMismatches,
    },
    unresolved: { openRejects, openResolutions },
    deferredMedia: {
      expected: deferredMediaExpected,
      actual: deferredMediaActual,
      match: deferredMediaExpected === deferredMediaActual,
      blocking: false,
      activeMediaRecords: Object.fromEntries(
        activeMediaRows.map((item) => [item.kind, Number(item.count)]),
      ),
    },
    orphans: Object.fromEntries(orphanCounts.map((item) => [item.kind, Number(item.count)])),
    blocking:
      controls.some((item) => item.due && !item.match) ||
      (currentPhaseIndex >= PHASES.indexOf('ledger') && sessionExpected !== sessionActual) ||
      (currentPhaseIndex >= PHASES.indexOf('package-order') && rupiahExpected !== rupiahActual) ||
      openRejects > 0 ||
      openResolutions > 0 ||
      orphanTotal > 0 ||
      activeMediaTotal > 0 ||
      exactControls.some(
        (control) => phaseDue(control.phase) && control.expected !== control.actual,
      ) ||
      extendedExactControls.some(
        (control) => phaseDue(control.phase) && control.expected !== control.actual,
      ) ||
      dimensionalMismatches.some((control) => phaseDue(control.phase)) ||
      Number(duplicateOpeningLedgerRows[0]?.count ?? 0) > 0,
  };
}

async function rollbackReport(target: PrismaClient, batchId: string) {
  const [batch, keys, rejects, resolutions] = await Promise.all([
    target.migrationBatch.findUnique({ where: { id: batchId } }),
    target.migrationSourceKey.groupBy({
      by: ['targetType'],
      where: { batchId },
      _count: { _all: true },
    }),
    target.migrationReject.count({ where: { batchId, status: 'OPEN' } }),
    target.migrationResolution.count({ where: { batchId, status: { in: ['OPEN', 'APPROVED'] } } }),
  ]);
  if (!batch) throw new Error('BATCH_NOT_FOUND');
  return {
    batchId,
    status: batch.status,
    destructiveActionPerformed: false,
    targetRecordsByType: Object.fromEntries(keys.map((row) => [row.targetType, row._count._all])),
    openRejects: rejects,
    pendingResolutions: resolutions,
  };
}

async function writeRehearsalEvidence(source: PrismaClient, target: PrismaClient, args: Args) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const batchId = required(
    typeof args.batch === 'string' ? args.batch : undefined,
    'BATCH_REQUIRED',
  );
  const outputDirectory = required(
    typeof args.output === 'string' ? args.output : undefined,
    'EVIDENCE_OUTPUT_REQUIRED',
  );
  if (!isAbsolute(outputDirectory)) throw new Error('EVIDENCE_OUTPUT_MUST_BE_ABSOLUTE');
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  if ((await readdir(outputDirectory)).length) throw new Error('EVIDENCE_OUTPUT_NOT_EMPTY');

  const [
    batch,
    reconciliation,
    rollback,
    sourceProfile,
    controlTotals,
    rejectGroups,
    resolutionGroups,
  ] = await Promise.all([
    target.migrationBatch.findUnique({ where: { id: batchId } }),
    reconcile(source, target, batchId),
    rollbackReport(target, batchId),
    profile(source),
    target.migrationControlTotal.findMany({
      where: { batchId },
      orderBy: [{ controlKey: 'asc' }, { dimensionHash: 'asc' }],
      select: {
        controlKey: true,
        dimensions: true,
        expectedValue: true,
        actualValue: true,
        status: true,
        checkedAt: true,
      },
    }),
    target.migrationReject.groupBy({
      by: ['reasonCode', 'status'],
      where: { batchId },
      _count: { _all: true },
    }),
    target.migrationResolution.groupBy({
      by: ['reasonCode', 'status'],
      where: { batchId },
      _count: { _all: true },
    }),
  ]);
  if (!batch) throw new Error('BATCH_NOT_FOUND');
  const evidenceId = `rehearsal-${batch.id}`;
  const generatedAt = new Date().toISOString();
  const summary = {
    evidenceId,
    generatedAt,
    sourceSystem: batch.sourceSystem,
    sourceSnapshotAt: batch.sourceSnapshotAt,
    sourceChecksum: batch.sourceChecksum,
    mappingVersion: batch.mappingVersion,
    phase: batch.phase,
    batchStatus: batch.status,
    mediaMode: migrationMediaMode(),
    blocking: reconciliation.blocking,
    controlTotals: {
      total: controlTotals.length,
      match: controlTotals.filter((item) => item.status === 'MATCH').length,
      mismatch: controlTotals.filter((item) => item.status === 'MISMATCH').length,
      pending: controlTotals.filter((item) => item.status === 'PENDING').length,
    },
    unresolved: reconciliation.unresolved,
    deferredMedia: reconciliation.deferredMedia,
    rollback,
  };
  const files = {
    'summary.json': `${JSON.stringify(summary, null, 2)}\n`,
    'reconciliation.json': `${JSON.stringify(reconciliation, null, 2)}\n`,
    'control-totals.json': `${JSON.stringify(controlTotals, null, 2)}\n`,
    'source-profile.json': `${JSON.stringify(sourceProfile, null, 2)}\n`,
    'resolution-summary.json': `${JSON.stringify(
      {
        rejects: rejectGroups.map((item) => ({
          reasonCode: item.reasonCode,
          status: item.status,
          count: item._count._all,
        })),
        resolutions: resolutionGroups.map((item) => ({
          reasonCode: item.reasonCode,
          status: item.status,
          count: item._count._all,
        })),
      },
      null,
      2,
    )}\n`,
    'summary.md': [
      '# Daily Dose v1 → v2 rehearsal evidence',
      '',
      `- Evidence ID: \`${evidenceId}\``,
      `- Generated: ${generatedAt}`,
      `- Phase: \`${batch.phase}\``,
      `- Batch status: \`${batch.status}\``,
      `- Mapping version: \`${batch.mappingVersion}\``,
      `- Media mode: \`metadata-only\``,
      `- Blocking: \`${reconciliation.blocking}\``,
      `- Controls: ${summary.controlTotals.match} match, ${summary.controlTotals.mismatch} mismatch, ${summary.controlTotals.pending} pending`,
      `- Open rejects: ${reconciliation.unresolved.openRejects}`,
      `- Open resolutions: ${reconciliation.unresolved.openResolutions}`,
      `- Deferred media: ${reconciliation.deferredMedia.actual} (nonblocking)`,
      '',
      'Evidence contains control totals and reason-code summaries only; it excludes credentials, raw PII, media references, and private paths.',
      '',
    ].join('\n'),
  };
  for (const [name, content] of Object.entries(files))
    await writeFile(join(outputDirectory, name), content, { mode: 0o600, flag: 'wx' });
  const manifest = {
    evidenceId,
    generatedAt,
    files: await Promise.all(
      Object.keys(files).map(async (name) => ({
        name,
        sha256: await sha256File(join(outputDirectory, name)),
      })),
    ),
  };
  await writeFile(
    join(outputDirectory, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    {
      mode: 0o600,
      flag: 'wx',
    },
  );
  return { evidenceId, blocking: reconciliation.blocking, fileCount: manifest.files.length + 1 };
}

async function readDeltaEvents(args: Args): Promise<CanonicalDeltaEvent[]> {
  const eventPath = required(
    typeof args.events === 'string' ? args.events : undefined,
    'DELTA_EVENTS_PATH_REQUIRED',
  );
  const lines = (await readFile(eventPath, 'utf8'))
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error('DELTA_EVENTS_EMPTY');
  const allowedTables = new Set<string>(SOURCE_TABLES);
  const events: CanonicalDeltaEvent[] = [];
  let previous: CanonicalDeltaEvent | null = null;
  for (const line of lines) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line) as unknown;
    } catch {
      throw new Error('INVALID_DELTA_NDJSON');
    }
    const event = parseCanonicalDeltaEvent(parsed, allowedTables);
    assertStrictDeltaOrder(previous, event);
    events.push(event);
    previous = event;
  }
  return events;
}

type BranchRow = { branchId: bigint | number | string | null };

async function sourceBranchForDecodedEvent(
  source: PrismaClient,
  event: Omit<CanonicalDeltaEvent, 'eventKey' | 'sourceBranchId' | 'correlationId'>,
): Promise<string | null> {
  const row = event.after ?? event.before ?? {};
  if (event.sourceTable === 'locations') return event.sourceId;
  if (row.id_location !== null && row.id_location !== undefined && String(row.id_location) !== '0')
    return String(row.id_location);
  if (DELTA_GLOBAL_TABLES.has(event.sourceTable)) return null;
  const scalar = async (sql: string, value: unknown) => {
    const result = await source.$queryRawUnsafe<BranchRow[]>(sql, value);
    const branch = result[0]?.branchId;
    return branch === null || branch === undefined || String(branch) === '0'
      ? null
      : String(branch);
  };
  if (event.sourceTable === 'ruangans' || event.sourceTable === 'kelas_activities')
    return scalar(
      'SELECT id_location AS branchId FROM location_studios WHERE id = ? LIMIT 1',
      row.id_location_studio,
    );
  if (
    ['kelas_images', 'kelas_pakets', 'pakets', 'kelas_pertamuans', 'customer_kelas'].includes(
      event.sourceTable,
    )
  )
    return scalar('SELECT id_location AS branchId FROM kelas WHERE id = ? LIMIT 1', row.id_kelas);
  if (['booking_kelas', 'kelas_ratings'].includes(event.sourceTable))
    return scalar(
      'SELECT s.id_location AS branchId FROM kelas_activities a JOIN location_studios s ON s.id = a.id_location_studio WHERE a.id = ? LIMIT 1',
      row.id_kelas_activity,
    );
  if (event.sourceTable === 'kelas_pertemuan_absensis')
    return scalar(
      'SELECT k.id_location AS branchId FROM kelas_pertamuans p JOIN kelas k ON k.id = p.id_kelas WHERE p.id = ? LIMIT 1',
      row.id_kelas_pertemuan,
    );
  if (event.sourceTable === 'customer_jadwal_statics')
    return scalar('SELECT id_location AS branchId FROM users WHERE id = ? LIMIT 1', row.id_user);
  if (event.sourceTable === 'voucher_customers' || event.sourceTable === 'jurnals') {
    if (row.id_order_paket)
      return scalar(
        'SELECT id_location AS branchId FROM order_pakets WHERE id = ? LIMIT 1',
        row.id_order_paket,
      );
    const userId = row.id_customer ?? row.id_user;
    if (userId)
      return scalar('SELECT id_location AS branchId FROM users WHERE id = ? LIMIT 1', userId);
  }
  return null;
}

async function captureSourceBinlog(source: PrismaClient, target: PrismaClient, args: Args) {
  const sourceUrl = new URL(required(process.env.V1_DATABASE_URL, 'V1_DATABASE_URL_REQUIRED'));
  if (sourceUrl.protocol !== 'mysql:') throw new Error('V1_DATABASE_URL_MUST_BE_MYSQL');
  const fromGtid = required(
    typeof args['from-gtid'] === 'string' ? args['from-gtid'] : process.env.V1_GTID_SET,
    'V1_GTID_SET_REQUIRED',
  );
  const spoolDir = required(
    typeof args['spool-dir'] === 'string' ? args['spool-dir'] : undefined,
    'BINLOG_SPOOL_DIR_REQUIRED',
  );
  const logs =
    await source.$queryRawUnsafe<Array<{ Log_name?: string; f0?: string }>>('SHOW BINARY LOGS');
  // Prisma maps SHOW result columns to f0/f1/f2 on MySQL 8.4, while older
  // clients preserve Log_name. Support both without relying on server locale.
  const firstLog = logs[0]?.Log_name ?? logs[0]?.f0;
  if (!firstLog) throw new Error('MYSQL_BINARY_LOG_NOT_AVAILABLE');
  const captureCheckpoint = await target.migrationGtidCheckpoint.findUnique({
    where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'CAPTURE' } },
  });
  const executable = process.env.MYSQLBINLOG_PATH?.trim() || 'mysqlbinlog';
  const mysqlbinlogHost = process.env.MYSQLBINLOG_HOST?.trim() || sourceUrl.hostname;
  const mysqlbinlogPort = process.env.MYSQLBINLOG_PORT?.trim() || sourceUrl.port || '3306';
  if (!/^\d{1,5}$/u.test(mysqlbinlogPort) || Number(mysqlbinlogPort) > 65_535)
    throw new Error('MYSQLBINLOG_PORT_INVALID');
  const database = decodeURIComponent(sourceUrl.pathname.replace(/^\//u, ''));
  const { stdout } = await execFileAsync(
    executable,
    [
      '--read-from-remote-server',
      `--host=${mysqlbinlogHost}`,
      `--port=${mysqlbinlogPort}`,
      `--user=${decodeURIComponent(sourceUrl.username)}`,
      '--base64-output=DECODE-ROWS',
      '--verbose',
      '--verbose',
      '--to-last-log',
      `--exclude-gtids=${fromGtid}`,
      `--database=${database}`,
      firstLog,
    ],
    {
      env: { ...process.env, MYSQL_PWD: decodeURIComponent(sourceUrl.password) },
      maxBuffer: 256 * 1024 * 1024,
      encoding: 'utf8',
    },
  );
  const decoded = decodeMysqlbinlogText(stdout, {
    transactionOrderStart: captureCheckpoint?.transactionOrder ?? 0n,
    binlogFile: firstLog,
  });
  const capturedGtids = assertMysqlbinlogGtidContinuity(stdout, fromGtid);
  if (!capturedGtids.length && decoded.length) throw new Error('BINLOG_GTID_REQUIRED');
  if (!decoded.length) return { captured: 0, replayed: 0, empty: true };
  const canonical = await canonicalizeDecodedBinlog(decoded, (event) =>
    sourceBranchForDecodedEvent(source, event),
  );
  const last = canonical.at(-1)!;
  const basename = `v1-binlog-${Date.now()}-${createHash('sha256').update(last.gtid).digest('hex').slice(0, 12)}`;
  await writeEncryptedSpool({
    spoolDir,
    basename,
    plaintext: stdout,
    key: deltaEncryptionKey(),
    manifest: {
      sourceSystem: SOURCE_SYSTEM,
      binlogFile: firstLog,
      gtidFromExclusive: fromGtid,
      gtidThrough: last.gtid,
      capturedAt: new Date().toISOString(),
      mappingVersion: required(process.env.V1_MAPPING_VERSION, 'V1_MAPPING_VERSION_REQUIRED'),
      eventCount: canonical.length,
    },
  });
  return deltaCapture(target, args, canonical, `${fromGtid},${last.gtid}`);
}

async function deltaCapture(
  target: PrismaClient,
  args: Args,
  providedEvents?: CanonicalDeltaEvent[],
  providedGtidSet?: string,
) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const events = providedEvents ?? (await readDeltaEvents(args));
  const key = deltaEncryptionKey();
  const operator = required(
    typeof args.operator === 'string' ? args.operator : undefined,
    'OPERATOR_REQUIRED',
  );
  const gtidSet = required(
    providedGtidSet ??
      (typeof args['gtid-set'] === 'string' ? args['gtid-set'] : process.env.V1_GTID_SET),
    'V1_GTID_SET_REQUIRED',
  );
  const batchId = typeof args.batch === 'string' ? args.batch : null;
  if (batchId && !(await target.migrationBatch.findUnique({ where: { id: batchId } })))
    throw new Error('BATCH_NOT_FOUND');
  const checkpoint = await target.migrationGtidCheckpoint.findUnique({
    where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'CAPTURE' } },
  });
  let captured = 0;
  let replayed = 0;
  let lastCaptured: CanonicalDeltaEvent | null = null;
  for (const event of events) {
    const existing = await target.migrationDeltaEvent.findUnique({
      where: { eventKey: event.eventKey },
    });
    if (existing) {
      if (
        existing.gtid !== event.gtid ||
        existing.eventOrder !== event.eventOrder ||
        existing.sourceTable !== event.sourceTable ||
        existing.sourceId !== event.sourceId ||
        existing.operation !== event.operation ||
        existing.beforeChecksum !== deltaChecksum(event.before) ||
        existing.afterChecksum !== deltaChecksum(event.after)
      )
        throw new Error('DELTA_REPLAY_MISMATCH');
      replayed += 1;
      continue;
    }
    if (checkpoint && BigInt(event.transactionOrder) < checkpoint.transactionOrder)
      throw new Error('DELTA_CAPTURE_BEFORE_CHECKPOINT');
    const branchId = event.sourceBranchId
      ? await targetIdFor(target, 'locations', event.sourceBranchId, 'Branch')
      : null;
    if (event.sourceBranchId && !branchId && event.sourceTable !== 'locations')
      throw new Error('DELTA_BRANCH_NOT_MAPPED');
    const encrypted = encryptDeltaPayload({ before: event.before, after: event.after }, key);
    await target.migrationDeltaEvent.create({
      data: {
        batchId,
        eventKey: event.eventKey,
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: event.sourceTable,
        sourceId: event.sourceId,
        operation: event.operation,
        gtid: event.gtid,
        transactionOrder: BigInt(event.transactionOrder),
        eventOrder: event.eventOrder,
        binlogFile: event.binlogFile,
        binlogPosition: event.binlogPosition ? BigInt(event.binlogPosition) : null,
        sourceBranchId: event.sourceBranchId,
        branchId,
        beforeChecksum: deltaChecksum(event.before),
        afterChecksum: deltaChecksum(event.after),
        payloadCiphertext: encrypted.ciphertext,
        payloadIv: encrypted.iv,
        payloadAuthTag: encrypted.authTag,
        payloadKeyVersion: encrypted.keyVersion,
        correlationId: event.correlationId,
        sourceOccurredAt: new Date(event.occurredAt),
      },
    });
    captured += 1;
    lastCaptured = event;
  }
  if (!lastCaptured)
    return {
      captured,
      replayed,
      lastGtid: checkpoint?.lastGtid ?? null,
      transactionOrder: checkpoint?.transactionOrder.toString() ?? null,
    };
  const last = lastCaptured;
  await target.migrationGtidCheckpoint.upsert({
    where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'CAPTURE' } },
    create: {
      sourceSystem: SOURCE_SYSTEM,
      kind: 'CAPTURE',
      gtidSet,
      lastGtid: last.gtid,
      transactionOrder: BigInt(last.transactionOrder),
      binlogFile: last.binlogFile,
      binlogPosition: last.binlogPosition ? BigInt(last.binlogPosition) : null,
      capturedThroughAt: new Date(last.occurredAt),
      updatedBy: operator,
    },
    update: {
      gtidSet,
      lastGtid: last.gtid,
      transactionOrder: BigInt(last.transactionOrder),
      binlogFile: last.binlogFile,
      binlogPosition: last.binlogPosition ? BigInt(last.binlogPosition) : null,
      capturedThroughAt: new Date(last.occurredAt),
      updatedBy: operator,
    },
  });
  return { captured, replayed, lastGtid: last.gtid, transactionOrder: last.transactionOrder };
}

async function deltaVerify(target: PrismaClient, args: Args) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const key = deltaEncryptionKey();
  const operator = required(
    typeof args.operator === 'string' ? args.operator : undefined,
    'OPERATOR_REQUIRED',
  );
  const events = await target.migrationDeltaEvent.findMany({
    where: { status: 'CAPTURED' },
    orderBy: [{ transactionOrder: 'asc' }, { eventOrder: 'asc' }],
  });
  let previous: CanonicalDeltaEvent | null = null;
  let verified = 0;
  let blocked = 0;
  for (const stored of events) {
    const payload = decryptDeltaPayload<{
      before: Record<string, unknown> | null;
      after: Record<string, unknown> | null;
    }>(
      {
        ciphertext: stored.payloadCiphertext,
        iv: stored.payloadIv,
        authTag: stored.payloadAuthTag,
        keyVersion: stored.payloadKeyVersion,
      },
      key,
    );
    if (
      deltaChecksum(payload.before) !== stored.beforeChecksum ||
      deltaChecksum(payload.after) !== stored.afterChecksum
    )
      throw new Error('DELTA_PAYLOAD_CHECKSUM_MISMATCH');
    const event: CanonicalDeltaEvent = {
      eventKey: stored.eventKey,
      gtid: stored.gtid,
      transactionOrder: stored.transactionOrder.toString(),
      eventOrder: stored.eventOrder,
      sourceTable: stored.sourceTable,
      sourceId: stored.sourceId,
      operation: stored.operation,
      before: payload.before,
      after: payload.after,
      sourceBranchId: stored.sourceBranchId,
      binlogFile: stored.binlogFile,
      binlogPosition: stored.binlogPosition?.toString(),
      occurredAt: stored.sourceOccurredAt.toISOString(),
      correlationId: stored.correlationId,
    };
    assertStrictDeltaOrder(previous, event);
    previous = event;
    const cutover = stored.branchId
      ? await target.migrationBranchCutover.findUnique({ where: { branchId: stored.branchId } })
      : null;
    if (!DELTA_GLOBAL_TABLES.has(stored.sourceTable) && !stored.sourceBranchId) {
      await target.migrationDeltaEvent.update({
        where: { id: stored.id },
        data: { status: 'BLOCKED', failureCode: 'DELTA_BRANCH_OWNERSHIP_UNRESOLVED' },
      });
      blocked += 1;
      continue;
    }
    if (
      cutover?.status === 'V2_ACTIVE' &&
      cutover.highWaterOrder !== null &&
      stored.transactionOrder > cutover.highWaterOrder
    ) {
      await target.migrationDeltaEvent.update({
        where: { id: stored.id },
        data: { status: 'BLOCKED', failureCode: 'SOURCE_EVENT_AFTER_CUTOVER' },
      });
      blocked += 1;
      continue;
    }
    await target.migrationDeltaEvent.update({
      where: { id: stored.id },
      data: { status: 'VERIFIED', verifiedAt: new Date(), failureCode: null },
    });
    verified += 1;
  }
  const capture = await target.migrationGtidCheckpoint.findUnique({
    where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'CAPTURE' } },
  });
  if (capture)
    await target.migrationGtidCheckpoint.upsert({
      where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'VERIFY' } },
      create: {
        sourceSystem: SOURCE_SYSTEM,
        kind: 'VERIFY',
        gtidSet: capture.gtidSet,
        lastGtid: capture.lastGtid,
        transactionOrder: capture.transactionOrder,
        binlogFile: capture.binlogFile,
        binlogPosition: capture.binlogPosition,
        capturedThroughAt: capture.capturedThroughAt,
        updatedBy: operator,
      },
      update: {
        gtidSet: capture.gtidSet,
        lastGtid: capture.lastGtid,
        transactionOrder: capture.transactionOrder,
        binlogFile: capture.binlogFile,
        binlogPosition: capture.binlogPosition,
        capturedThroughAt: capture.capturedThroughAt,
        updatedBy: operator,
      },
    });
  return { verified, blocked };
}

async function deltaStatus(target: PrismaClient) {
  const [events, checkpoints, branches, outbox] = await Promise.all([
    target.migrationDeltaEvent.groupBy({ by: ['status'], _count: { _all: true } }),
    target.migrationGtidCheckpoint.findMany({ orderBy: { kind: 'asc' } }),
    target.migrationBranchCutover.findMany({
      orderBy: { updatedAt: 'asc' },
      include: { branch: { select: { code: true, name: true } } },
    }),
    target.migrationPilotOutbox.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  return {
    events: Object.fromEntries(events.map((item) => [item.status, item._count._all])),
    checkpoints: checkpoints.map((item) => ({
      kind: item.kind,
      lastGtid: item.lastGtid,
      transactionOrder: item.transactionOrder.toString(),
      capturedThroughAt: item.capturedThroughAt,
      updatedAt: item.updatedAt,
    })),
    branches: branches.map((item) => ({
      branchId: item.branchId,
      sourceBranchId: item.sourceBranchId,
      code: item.branch.code,
      name: item.branch.name,
      status: item.status,
      highWaterGtid: item.highWaterGtid,
      highWaterOrder: item.highWaterOrder?.toString() ?? null,
    })),
    pilotOutbox: Object.fromEntries(outbox.map((item) => [item.status, item._count._all])),
  };
}

type StoredDeltaEvent = Prisma.MigrationDeltaEventGetPayload<Record<string, never>>;

async function deltaBatchContext(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
): Promise<{ batchId: string; mappingVersion: string }> {
  const existing = await tx.migrationSourceKey.findFirst({
    where: {
      sourceSystem: SOURCE_SYSTEM,
      sourceTable: event.sourceTable,
      sourceId: event.sourceId,
    },
    select: { batchId: true, mappingVersion: true },
  });
  if (existing) return existing;
  const phase = TABLE_PHASE[event.sourceTable as SourceTable];
  const batch = await tx.migrationBatch.findFirst({
    where: {
      sourceSystem: SOURCE_SYSTEM,
      phase,
      status: 'COMPLETED',
    },
    orderBy: { completedAt: 'desc' },
    select: { id: true, mappingVersion: true },
  });
  if (!batch) throw new Error(`DELTA_PHASE_BASELINE_REQUIRED:${phase}`);
  return { batchId: batch.id, mappingVersion: batch.mappingVersion };
}

async function assertDeltaBeforeState(tx: Prisma.TransactionClient, event: StoredDeltaEvent) {
  if (event.operation === 'INSERT') {
    const existing = await tx.migrationSourceKey.count({
      where: {
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: event.sourceTable,
        sourceId: event.sourceId,
      },
    });
    if (existing) throw new Error('DELTA_INSERT_SOURCE_KEY_EXISTS');
    return;
  }
  const checksums = await tx.migrationSourceKey.findMany({
    where: {
      sourceSystem: SOURCE_SYSTEM,
      sourceTable: event.sourceTable,
      sourceId: event.sourceId,
    },
    distinct: ['recordChecksum'],
    select: { recordChecksum: true },
  });
  if (!checksums.length) throw new Error('DELTA_SOURCE_KEY_NOT_FOUND');
  if (
    !event.beforeChecksum ||
    checksums.some((item) => item.recordChecksum !== event.beforeChecksum)
  )
    throw new Error('DELTA_BEFORE_CHECKSUM_MISMATCH');
}

async function upsertDeltaSourceKey(
  tx: Prisma.TransactionClient,
  context: { batchId: string; mappingVersion: string },
  event: StoredDeltaEvent,
  targetType: string,
  targetId: string,
  checksum: string,
) {
  await tx.migrationSourceKey.upsert({
    where: {
      sourceSystem_sourceTable_sourceId_targetType: {
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: event.sourceTable,
        sourceId: event.sourceId,
        targetType,
      },
    },
    create: {
      batchId: context.batchId,
      sourceSystem: SOURCE_SYSTEM,
      sourceTable: event.sourceTable,
      sourceId: event.sourceId,
      targetType,
      targetId,
      recordChecksum: checksum,
      mappingVersion: context.mappingVersion,
    },
    update: { recordChecksum: checksum, mappingVersion: context.mappingVersion },
  });
}

function deltaRow(
  event: StoredDeltaEvent,
  payload: { before: Record<string, unknown> | null; after: Record<string, unknown> | null },
): LegacyRow {
  const selected = event.operation === 'DELETE' ? payload.before : payload.after;
  if (!selected) throw new Error('DELTA_ROW_PAYLOAD_REQUIRED');
  return {
    ...selected,
    id: selected.id ?? event.sourceId,
    ...(event.operation === 'DELETE' ? { deleted_at: event.sourceOccurredAt } : {}),
  } as LegacyRow;
}

async function applyDeferredMediaDelta(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
  row: LegacyRow,
  context: { batchId: string; mappingVersion: string },
) {
  migrationMediaMode();
  const specs = DEFERRED_MEDIA_FIELDS.filter((item) => item.sourceTable === event.sourceTable);
  if (!specs.length) return;
  const encryptionKey = piiKey();
  const checksum = recordChecksum(row);
  for (const spec of specs) {
    const reference = textValue(row[spec.sourceField]).trim();
    const id = deterministicId(
      `${SOURCE_SYSTEM}:${event.sourceTable}:${event.sourceId}:DeferredMedia:${spec.sourceField}`,
    );
    const targetType = `DeferredMediaReference:${spec.sourceField}`;
    if (!reference) {
      await tx.migrationDeferredMediaReference.deleteMany({ where: { id } });
      await tx.migrationSourceKey.deleteMany({
        where: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: event.sourceTable,
          sourceId: event.sourceId,
          targetType,
        },
      });
      continue;
    }
    await tx.migrationDeferredMediaReference.upsert({
      where: { id },
      create: {
        id,
        batchId: context.batchId,
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: event.sourceTable,
        sourceId: event.sourceId,
        sourceField: spec.sourceField,
        mediaKind: spec.mediaKind,
        referenceEncrypted: encryptPii(reference, encryptionKey),
        referenceHash: piiHash(reference),
      },
      update: {
        batchId: context.batchId,
        mediaKind: spec.mediaKind,
        referenceEncrypted: encryptPii(reference, encryptionKey),
        referenceHash: piiHash(reference),
        status: 'DEFERRED',
        historical: true,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, targetType, id, checksum);
  }
}

async function applyBranchMasterDelta(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
  row: LegacyRow,
  context: { batchId: string; mappingVersion: string },
) {
  const checksum = recordChecksum(row);
  const deletedAt = asDate(row.deleted_at);
  if (event.sourceTable === 'locations') {
    const branchCodes = requiredJsonMap('V1_BRANCH_CODES');
    const branchTimezones = requiredJsonMap('V1_BRANCH_TIMEZONES');
    const id = deterministicId(`${SOURCE_SYSTEM}:locations:${event.sourceId}:Branch`);
    const code = required(branchCodes[event.sourceId], `BRANCH_CODE_REQUIRED:${event.sourceId}`);
    const timezone = required(
      branchTimezones[event.sourceId],
      `BRANCH_TIMEZONE_REQUIRED:${event.sourceId}`,
    );
    await tx.cabang.upsert({
      where: { id },
      create: {
        id,
        code,
        name: textValue(row.nama),
        timezone,
        supportWhatsappE164: normalizedIndonesianPhone(row.no_hp),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        name: textValue(row.nama),
        timezone,
        supportWhatsappE164: normalizedIndonesianPhone(row.no_hp),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await tx.profilPublikCabang.upsert({
      where: { branchId: id },
      create: {
        branchId: id,
        slug: `legacy-location-${event.sourceId}`,
        area: textValue(row.nama),
        city: textValue(row.nama),
        address: textValue(row.alamat),
        openingHours: { source: 'BranchOpeningHour' },
        description: textValue(row.deskripsi, textValue(row.nama)),
        arrivalInformation: textValue(row.url_location) || null,
        amenities: [],
        heroImageKey: '',
        galleryImageKeys: [],
      },
      update: {
        area: textValue(row.nama),
        city: textValue(row.nama),
        address: textValue(row.alamat),
        description: textValue(row.deskripsi, textValue(row.nama)),
        arrivalInformation: textValue(row.url_location) || null,
        heroImageKey: '',
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'Branch', id, checksum);
    return;
  }
  if (event.sourceTable === 'location_studios') {
    const branchId = await targetIdFor(
      tx as unknown as PrismaClient,
      'locations',
      row.id_location,
      'Branch',
    );
    if (!branchId) throw new Error('DELTA_STUDIO_BRANCH_UNRESOLVED');
    const id = deterministicId(`${SOURCE_SYSTEM}:location_studios:${event.sourceId}:Studio`);
    await tx.studio.upsert({
      where: { id },
      create: {
        id,
        branchId,
        code: `LEGACY-STUDIO-${event.sourceId}`,
        name: textValue(row.nama),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        branchId,
        name: textValue(row.nama),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'Studio', id, checksum);
    return;
  }
  if (event.sourceTable === 'ruangans') {
    const studioId = await targetIdFor(
      tx as unknown as PrismaClient,
      'location_studios',
      row.id_location_studio,
      'Studio',
    );
    if (!studioId) throw new Error('DELTA_ROOM_STUDIO_UNRESOLVED');
    const id = deterministicId(`${SOURCE_SYSTEM}:ruangans:${event.sourceId}:Room`);
    await tx.ruangan.upsert({
      where: { id },
      create: {
        id,
        studioId,
        code: `LEGACY-ROOM-${event.sourceId}`,
        name: textValue(row.nama_ruangan),
        capacity: intValue(row.max_peserta),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        studioId,
        name: textValue(row.nama_ruangan),
        capacity: intValue(row.max_peserta),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'Room', id, checksum);
    return;
  }
  if (event.sourceTable === 'location_openings') {
    const branchId = await targetIdFor(
      tx as unknown as PrismaClient,
      'locations',
      row.id_location,
      'Branch',
    );
    if (!branchId) throw new Error('DELTA_OPENING_BRANCH_UNRESOLVED');
    const weekdays = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ] as const;
    const weekday = weekdays[intValue(row.hari)];
    if (!weekday) throw new Error('DELTA_OPENING_WEEKDAY_INVALID');
    const minute = (value: unknown) => {
      const [hour = '0', part = '0'] = textValue(value).split(':');
      return Number(hour) * 60 + Number(part);
    };
    const id = deterministicId(
      `${SOURCE_SYSTEM}:location_openings:${event.sourceId}:BranchOpeningHour`,
    );
    await tx.jamOperasionalCabang.upsert({
      where: { id },
      create: {
        id,
        branchId,
        weekday,
        opensAtMinute: minute(row.jam_open),
        closesAtMinute: minute(row.jam_close),
        effectiveFrom: asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z'),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
      update: {
        branchId,
        weekday,
        opensAtMinute: minute(row.jam_open),
        closesAtMinute: minute(row.jam_close),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'BranchOpeningHour', id, checksum);
    return;
  }
  throw new Error('DELTA_BRANCH_MASTER_TABLE_UNSUPPORTED');
}

const LEGACY_APPLICATION_ROLES: Record<string, string> = {
  '1': 'SUPER_OWNER',
  '2': 'INSTRUCTOR',
  '3': 'CUSTOMER',
  '4': 'ADMIN',
  '5': 'OWNER',
  '6': 'FINANCE',
};

async function applyUserRoleDelta(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
  row: LegacyRow,
  context: { batchId: string; mappingVersion: string },
  payload: { before: Record<string, unknown> | null; after: Record<string, unknown> | null },
  resolutionDecision?: Record<string, unknown>,
) {
  const checksum = recordChecksum(row);
  const deletedAt = asDate(row.deleted_at);
  if (event.sourceTable === 'users') {
    const id = deterministicId(`${SOURCE_SYSTEM}:users:${event.sourceId}:User`);
    const email = textValue(row.email).trim().toLowerCase();
    if (!email || !email.includes('@')) throw new Error('DELTA_USER_EMAIL_INVALID');
    const branchId = row.id_location
      ? await targetIdFor(tx as unknown as PrismaClient, 'locations', row.id_location, 'Branch')
      : null;
    if (row.id_location && !branchId) throw new Error('DELTA_USER_BRANCH_UNRESOLVED');
    const rawPhone = textValue(row.no_hp).trim();
    const phone = normalizedIndonesianPhone(rawPhone);
    if (rawPhone && !phone) throw new Error('DELTA_INVALID_PHONE_RESOLUTION_REQUIRED');
    if (phone) {
      const duplicate = await tx.aliasKontakPengguna.findFirst({
        where: { normalizedHash: piiHash(phone), NOT: { userId: id } },
        select: { id: true },
      });
      if (duplicate) throw new Error('DELTA_DUPLICATE_PHONE_RESOLUTION_REQUIRED');
    }
    const createdAt = asDate(row.created_at) ?? event.sourceOccurredAt;
    const updatedAt = asDate(row.updated_at) ?? event.sourceOccurredAt;
    await tx.user.upsert({
      where: { id },
      create: {
        id,
        displayName: textValue(row.name, `Legacy user ${event.sourceId}`),
        email,
        phoneE164: phone,
        preferredBranchId: branchId,
        status: deletedAt ? 'INACTIVE' : Number(row.status) === 1 ? 'ACTIVE' : 'INACTIVE',
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt,
        updatedAt,
      },
      update: {
        displayName: textValue(row.name, `Legacy user ${event.sourceId}`),
        email,
        phoneE164: phone,
        preferredBranchId: branchId,
        status: deletedAt ? 'INACTIVE' : Number(row.status) === 1 ? 'ACTIVE' : 'INACTIVE',
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt,
      },
    });
    const nik = textValue(row.nik).trim();
    const country = textValue(row.negara).trim();
    await tx.profilPengguna.upsert({
      where: { userId: id },
      create: {
        userId: id,
        address: textValue(row.alamat) || null,
        genderCode: Number(row.jenis_kelamin) === 1 ? 'MALE' : 'FEMALE',
        countryCode: /^indonesia$/iu.test(country) ? 'ID' : null,
        birthDate: asDate(row.tanggal_lahir),
        nikEncrypted: nik ? encryptPii(nik, piiKey()) : null,
        nikHash: nik ? piiHash(nik) : null,
        barcode: textValue(row.barcode) || null,
        historicalMetadata:
          country && !/^indonesia$/iu.test(country) ? { sourceCountry: country } : undefined,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt,
        updatedAt,
      },
      update: {
        address: textValue(row.alamat) || null,
        genderCode: Number(row.jenis_kelamin) === 1 ? 'MALE' : 'FEMALE',
        countryCode: /^indonesia$/iu.test(country) ? 'ID' : null,
        birthDate: asDate(row.tanggal_lahir),
        nikEncrypted: nik ? encryptPii(nik, piiKey()) : null,
        nikHash: nik ? piiHash(nik) : null,
        barcode: textValue(row.barcode) || null,
        historicalMetadata:
          country && !/^indonesia$/iu.test(country) ? { sourceCountry: country } : undefined,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt,
      },
    });
    const passwordHash = textValue(row.password);
    if (!/^\$2[aby]\$/u.test(passwordHash)) throw new Error('DELTA_PASSWORD_HASH_UNSUPPORTED');
    const existingCredential = await tx.passwordCredential.findUnique({ where: { userId: id } });
    const sourcePasswordChanged = payload.before?.password !== payload.after?.password;
    if (
      existingCredential?.passwordHash.startsWith('$argon2') &&
      sourcePasswordChanged &&
      existingCredential.passwordHash !== passwordHash &&
      resolutionDecision?.retainArgon2id !== true
    )
      throw new Error('CREDENTIAL_DIVERGENCE');
    await tx.passwordCredential.upsert({
      where: { userId: id },
      create: {
        userId: id,
        emailHash: canonicalEmailHash(email),
        passwordHash,
        verifiedAt: asDate(row.email_verified_at),
        passwordChangedAt: updatedAt,
        createdAt,
        updatedAt,
      },
      update: {
        emailHash: canonicalEmailHash(email),
        ...(existingCredential?.passwordHash.startsWith('$argon2') ? {} : { passwordHash }),
        verifiedAt: asDate(row.email_verified_at),
        ...(sourcePasswordChanged ? { passwordChangedAt: updatedAt } : {}),
        updatedAt,
      },
    });
    const identityId = deterministicId(
      `${SOURCE_SYSTEM}:users:${event.sourceId}:Identity:EMAIL_PASSWORD`,
    );
    await tx.identitas.upsert({
      where: { id: identityId },
      create: {
        id: identityId,
        userId: id,
        provider: 'EMAIL_PASSWORD',
        subjectHash: canonicalEmailHash(email),
        verifiedAt: asDate(row.email_verified_at),
        createdAt,
      },
      update: {
        subjectHash: canonicalEmailHash(email),
        verifiedAt: asDate(row.email_verified_at),
      },
    });
    if (rawPhone) {
      const aliasId = deterministicId(
        `${SOURCE_SYSTEM}:users:${event.sourceId}:UserContactAlias:PHONE`,
      );
      await tx.aliasKontakPengguna.upsert({
        where: { id: aliasId },
        create: {
          id: aliasId,
          userId: id,
          kind: 'PHONE',
          normalizedHash: piiHash(phone!),
          valueEncrypted: encryptPii(rawPhone, piiKey()),
          canonical: true,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          createdAt,
          updatedAt,
        },
        update: {
          normalizedHash: piiHash(phone!),
          valueEncrypted: encryptPii(rawPhone, piiKey()),
          canonical: true,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          updatedAt,
        },
      });
    }
    for (const [targetType, targetId] of [
      ['User', id],
      ['UserProfile', id],
      ['PasswordCredential', id],
      ['Identity', identityId],
    ] as const)
      await upsertDeltaSourceKey(tx, context, event, targetType, targetId, checksum);
    return;
  }
  if (event.sourceTable === 'roles') {
    const role = LEGACY_APPLICATION_ROLES[event.sourceId];
    if (!role) throw new Error('DELTA_ROLE_MAPPING_RESOLUTION_REQUIRED');
    const roleDefinitionId = deterministicId(
      `${SOURCE_SYSTEM}:roles:${event.sourceId}:RoleDefinition`,
    );
    const active = event.operation !== 'DELETE' && !deletedAt;
    await tx.roleDefinition.upsert({
      where: { id: roleDefinitionId },
      create: {
        id: roleDefinitionId,
        code: `LEGACY_ROLE_${event.sourceId}`,
        displayName: textValue(row.name),
        description: 'Imported role Daily Dose v1; retained for audit only.',
        scope: 'GLOBAL',
        system: false,
        protected: true,
        active,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        displayName: textValue(row.name),
        active,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'ApplicationRole', role, checksum);
    await upsertDeltaSourceKey(tx, context, event, 'RoleDefinition', roleDefinitionId, checksum);
    return;
  }
  if (event.sourceTable === 'model_has_roles') {
    const role = LEGACY_APPLICATION_ROLES[textValue(row.role_id)];
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.model_id, 'User');
    if (!role || !userId) throw new Error('DELTA_ROLE_ASSIGNMENT_RESOLUTION_REQUIRED');
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { preferredBranchId: true },
    });
    const scoped = ['INSTRUCTOR', 'ADMIN', 'OWNER'].includes(role);
    if (scoped && !user?.preferredBranchId)
      throw new Error('DELTA_ROLE_BRANCH_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:model_has_roles:${event.sourceId}:UserRole`);
    const assignmentId = ['INSTRUCTOR', 'OWNER'].includes(role)
      ? deterministicId(`${SOURCE_SYSTEM}:model_has_roles:${event.sourceId}:Assignment`)
      : null;
    const activeUntil = event.operation === 'DELETE' ? event.sourceOccurredAt : null;
    if (assignmentId)
      await tx.penugasan.upsert({
        where: { id: assignmentId },
        create: {
          id: assignmentId,
          userId,
          branchId: user!.preferredBranchId!,
          type: role as 'INSTRUCTOR' | 'OWNER',
          activeFrom: event.sourceOccurredAt,
          activeUntil,
        },
        update: { branchId: user!.preferredBranchId!, activeUntil },
      });
    await tx.userRole.upsert({
      where: { id },
      create: {
        id,
        userId,
        role: role as never,
        branchId: scoped ? user!.preferredBranchId : null,
        activeFrom: event.sourceOccurredAt,
        activeUntil,
        sourceAssignmentId: assignmentId,
      },
      update: {
        role: role as never,
        branchId: scoped ? user!.preferredBranchId : null,
        activeUntil,
        sourceAssignmentId: assignmentId,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'UserRole', id, checksum);
    if (assignmentId)
      await upsertDeltaSourceKey(tx, context, event, 'Assignment', assignmentId, checksum);
    return;
  }
  throw new Error('DELTA_USER_ROLE_TABLE_UNSUPPORTED');
}

async function applyPackageOrderDelta(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
  row: LegacyRow,
  context: { batchId: string; mappingVersion: string },
) {
  const checksum = recordChecksum(row);
  const deletedAt = asDate(row.deleted_at);
  if (event.sourceTable === 'kelas') {
    const sourceBranchId = textValue(row.id_location);
    const branchId =
      sourceBranchId && sourceBranchId !== '0'
        ? await targetIdFor(tx as unknown as PrismaClient, 'locations', sourceBranchId, 'Branch')
        : null;
    if (sourceBranchId && sourceBranchId !== '0' && !branchId)
      throw new Error('DELTA_CLASS_BRANCH_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:kelas:${event.sourceId}:ClassType`);
    await tx.jenisKelas.upsert({
      where: { id },
      create: {
        id,
        branchId: null,
        code: `LEGACY-CLASS-${event.sourceId}`,
        name: textValue(row.nama_kelas, `Legacy class ${event.sourceId}`),
        description: textValue(row.keterangan) || null,
        modality: 'UNKNOWN_LEGACY',
        equipment: textValue(row.bawaan) ? [textValue(row.bawaan)] : [],
        defaultDurationMinutes: positiveInt(row.duration, 60),
        defaultMinimumQuota: positiveInt(row.min_anggota, 1),
        defaultCapacity: positiveInt(row.max_anggota, 1),
        active: !deletedAt && intValue(row.is_active, 1) === 1,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['type']),
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        name: textValue(row.nama_kelas, `Legacy class ${event.sourceId}`),
        description: textValue(row.keterangan) || null,
        modality: 'UNKNOWN_LEGACY',
        equipment: textValue(row.bawaan) ? [textValue(row.bawaan)] : [],
        defaultDurationMinutes: positiveInt(row.duration, 60),
        defaultMinimumQuota: positiveInt(row.min_anggota, 1),
        defaultCapacity: positiveInt(row.max_anggota, 1),
        active: !deletedAt && intValue(row.is_active, 1) === 1,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['type']),
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    if (branchId) {
      await tx.cakupanCabangJenisKelas.upsert({
        where: { classTypeId_branchId: { classTypeId: id, branchId } },
        create: {
          id: deterministicId(
            `${SOURCE_SYSTEM}:kelas:${event.sourceId}:ClassTypeBranchScope:${sourceBranchId}`,
          ),
          classTypeId: id,
          branchId,
          active: !deletedAt && intValue(row.is_active, 1) === 1,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
        },
        update: {
          active: !deletedAt && intValue(row.is_active, 1) === 1,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
        },
      });
      await tx.konfigurasiJenisKelasCabang.upsert({
        where: {
          id: deterministicId(
            `${SOURCE_SYSTEM}:kelas:${event.sourceId}:ClassTypeBranchConfiguration:${sourceBranchId}`,
          ),
        },
        create: {
          id: deterministicId(
            `${SOURCE_SYSTEM}:kelas:${event.sourceId}:ClassTypeBranchConfiguration:${sourceBranchId}`,
          ),
          classTypeId: id,
          branchId,
          minimumQuota: positiveInt(row.min_anggota, 1),
          capacity: positiveInt(row.max_anggota, 1),
          honorRp: Math.max(0, intValue(row.honor)),
          feeRp: Math.max(0, intValue(row.fee)),
          effectiveFrom: asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z'),
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
        },
        update: {
          minimumQuota: positiveInt(row.min_anggota, 1),
          capacity: positiveInt(row.max_anggota, 1),
          honorRp: Math.max(0, intValue(row.honor)),
          feeRp: Math.max(0, intValue(row.fee)),
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
        },
      });
    }
    await upsertDeltaSourceKey(tx, context, event, 'ClassType', id, checksum);
    return;
  }
  if (event.sourceTable === 'pakets') {
    const classTypeId = await targetIdFor(
      tx as unknown as PrismaClient,
      'kelas',
      row.id_kelas,
      'ClassType',
    );
    if (!classTypeId) throw new Error('DELTA_PACKAGE_CLASS_RESOLUTION_REQUIRED');
    const packageId = deterministicId(`${SOURCE_SYSTEM}:pakets:${event.sourceId}:Package`);
    const existing = await tx.paket.findUnique({ where: { id: packageId } });
    const branchId = existing?.branchId ?? null;
    const effectiveFrom = asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z');
    await tx.paket.upsert({
      where: { id: packageId },
      create: {
        id: packageId,
        branchId,
        classTypeId,
        businessKey: `LEGACY-PACKAGE-${event.sourceId}`,
        name: textValue(row.nama, `Legacy package ${event.sourceId}`),
        sessionCount: positiveInt(row.jumlah_pertemuan),
        durationDays: positiveInt(row.valid_day, 30),
        priceRp: Math.max(0, intValue(row.harga)),
        effectiveFrom: asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z'),
        effectiveUntil: deletedAt,
        status: deletedAt || intValue(row.is_show_public, 1) !== 1 ? 'INACTIVE' : 'ACTIVE',
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, []),
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        branchId,
        classTypeId,
        name: textValue(row.nama, `Legacy package ${event.sourceId}`),
        sessionCount: positiveInt(row.jumlah_pertemuan),
        durationDays: positiveInt(row.valid_day, 30),
        priceRp: Math.max(0, intValue(row.harga)),
        effectiveUntil: deletedAt,
        status: deletedAt || intValue(row.is_show_public, 1) !== 1 ? 'INACTIVE' : 'ACTIVE',
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, []),
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await tx.revisiPaket.upsert({
      where: { packageId_revisionNumber: { packageId, revisionNumber: 1 } },
      create: {
        id: deterministicId(`${SOURCE_SYSTEM}:pakets:${event.sourceId}:PackageRevision:1`),
        packageId,
        revisionNumber: 1,
        sessionCount: positiveInt(row.jumlah_pertemuan),
        durationDays: positiveInt(row.valid_day, 30),
        priceRp: Math.max(0, intValue(row.harga)),
        promoteCode: textValue(row.promote_code) || null,
        discountRp: row.diskon === null ? null : Math.max(0, intValue(row.diskon)),
        manyTimesAllowed: intValue(row.is_many_times) === 1,
        visible: intValue(row.is_show_public, 1) === 1,
        effectiveFrom,
        effectiveUntil: deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
      update: {
        sessionCount: positiveInt(row.jumlah_pertemuan),
        durationDays: positiveInt(row.valid_day, 30),
        priceRp: Math.max(0, intValue(row.harga)),
        promoteCode: textValue(row.promote_code) || null,
        discountRp: row.diskon === null ? null : Math.max(0, intValue(row.diskon)),
        manyTimesAllowed: intValue(row.is_many_times) === 1,
        visible: intValue(row.is_show_public, 1) === 1,
        effectiveUntil: deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
    });
    await tx.cakupanJenisKelasPaket.upsert({
      where: { packageId_classTypeId: { packageId, classTypeId } },
      create: {
        id: deterministicId(
          `${SOURCE_SYSTEM}:pakets:${event.sourceId}:PackageClassTypeScope:${textValue(row.id_kelas)}`,
        ),
        packageId,
        classTypeId,
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
      update: { active: !deletedAt, historical: Boolean(deletedAt), sourceDeletedAt: deletedAt },
    });
    await tx.profilPublikPaket.upsert({
      where: { packageId },
      create: {
        packageId,
        summary: textValue(row.nama, `Legacy package ${event.sourceId}`),
        description: textValue(row.nama, `Legacy package ${event.sourceId}`),
        highlights: [],
        usageGuidance: 'Ketentuan historis mengikuti transaksi Daily Dose v1.',
        terms: { sourceSystem: SOURCE_SYSTEM, sourcePackageId: event.sourceId },
      },
      update: {
        summary: textValue(row.nama, `Legacy package ${event.sourceId}`),
        description: textValue(row.nama, `Legacy package ${event.sourceId}`),
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'Package', packageId, checksum);
    return;
  }
  if (event.sourceTable === 'paket_locations') {
    const branchSourceId = textValue(row.id_location);
    const branchId = await targetIdFor(
      tx as unknown as PrismaClient,
      'locations',
      branchSourceId,
      'Branch',
    );
    const packageId = await targetIdFor(
      tx as unknown as PrismaClient,
      'pakets',
      row.id_paket,
      'Package',
    );
    if (!branchId) throw new Error('DELTA_PACKAGE_SCOPE_BRANCH_RESOLUTION_REQUIRED');
    if (!packageId) throw new Error('DELTA_PACKAGE_ROW_DEPENDENCY_PENDING');
    const scopeId = deterministicId(
      `${SOURCE_SYSTEM}:paket_locations:${event.sourceId}:PackageBranchScope`,
    );
    const active = event.operation !== 'DELETE' && !deletedAt;
    await tx.cakupanCabangPaket.upsert({
      where: { packageId_branchId: { packageId, branchId } },
      create: {
        id: scopeId,
        packageId,
        branchId,
        active,
        historical: !active,
        sourceDeletedAt: active ? null : (deletedAt ?? event.sourceOccurredAt),
      },
      update: {
        active,
        historical: !active,
        sourceDeletedAt: active ? null : (deletedAt ?? event.sourceOccurredAt),
      },
    });
    await tx.paket.updateMany({
      where: { id: packageId, branchId: null },
      data: { branchId },
    });
    await upsertDeltaSourceKey(tx, context, event, 'PackageBranchScope', scopeId, checksum);
    return;
  }
  if (event.sourceTable === 'kelas_pakets') {
    const packageId = await targetIdFor(
      tx as unknown as PrismaClient,
      'pakets',
      row.id_paket,
      'Package',
    );
    const classTypeId = await targetIdFor(
      tx as unknown as PrismaClient,
      'kelas',
      row.id_kelas,
      'ClassType',
    );
    if (!packageId || !classTypeId) throw new Error('DELTA_PACKAGE_CLASS_SCOPE_DEPENDENCY_PENDING');
    const scopeId = deterministicId(
      `${SOURCE_SYSTEM}:kelas_pakets:${event.sourceId}:PackageClassTypeScope`,
    );
    const active = event.operation !== 'DELETE' && !deletedAt;
    await tx.cakupanJenisKelasPaket.upsert({
      where: { packageId_classTypeId: { packageId, classTypeId } },
      create: {
        id: scopeId,
        packageId,
        classTypeId,
        active,
        historical: !active,
        sourceDeletedAt: active ? null : (deletedAt ?? event.sourceOccurredAt),
      },
      update: {
        active,
        historical: !active,
        sourceDeletedAt: active ? null : (deletedAt ?? event.sourceOccurredAt),
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'PackageClassTypeScope', scopeId, checksum);
    return;
  }
  if (event.sourceTable === 'order_pakets') {
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User');
    const branchSourceId = textValue(row.id_location);
    const branchId = await targetIdFor(
      tx as unknown as PrismaClient,
      'locations',
      branchSourceId,
      'Branch',
    );
    const packageId = await targetIdFor(
      tx as unknown as PrismaClient,
      'pakets',
      row.id_paket,
      'Package',
    );
    if (!userId || !branchId || !packageId)
      throw new Error('DELTA_ORDER_REFERENCE_RESOLUTION_REQUIRED');
    const pkg = await tx.paket.findUniqueOrThrow({ where: { id: packageId } });
    const packageClassScope = await tx.cakupanJenisKelasPaket.findFirst({
      where: { packageId, active: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    if (!packageClassScope) throw new Error('DELTA_PACKAGE_CLASS_SCOPE_DEPENDENCY_PENDING');
    const sourceBalance = intValue(row.sisa);
    const sessions = positiveInt(row.jumlah_pertemuan, pkg.sessionCount);
    if (sourceBalance < 0 || sourceBalance > sessions)
      throw new Error('DELTA_ORDER_BALANCE_RESOLUTION_REQUIRED');
    const purchaseId = deterministicId(`${SOURCE_SYSTEM}:order_pakets:${event.sourceId}:Purchase`);
    const customerPackageId = deterministicId(
      `${SOURCE_SYSTEM}:order_pakets:${event.sourceId}:CustomerPackage`,
    );
    const createdAt = asDate(row.created_at) ?? event.sourceOccurredAt;
    const activationDate = asDate(row.tanggal_pembayaran) ?? createdAt;
    const expiryAt =
      asDate(row.expired_date) ??
      new Date(activationDate.getTime() + pkg.durationDays * 86_400_000);
    const price = Math.max(0, intValue(row.harga, pkg.priceRp));
    const isActive = !deletedAt && intValue(row.is_active) === 1;
    const statusMapping = mapV1PurchaseStatus({ status: row.status, active: row.is_active });
    if (statusMapping.conflict)
      throw new Error('DELTA_ORDER_STATUS_ACTIVE_CONFLICT_RESOLUTION_REQUIRED');
    const purchaseStatus = statusMapping.status;
    const rawUniqueCode = textValue(row.unix_code).trim();
    if (rawUniqueCode && !/^\d+$/u.test(rawUniqueCode))
      throw new Error('DELTA_ORDER_UNIQUE_CODE_INVALID');
    const uniqueCode = Math.max(0, intValue(rawUniqueCode));
    if (uniqueCode > 0 && price % 1000 !== uniqueCode)
      throw new Error('DELTA_ORDER_UNIQUE_CODE_MISMATCH_RESOLUTION_REQUIRED');
    const existingPurchase = await tx.pembelian.findUnique({ where: { id: purchaseId } });
    if (
      existingPurchase?.timelineComplete &&
      (existingPurchase.priceRpSnapshot !== price ||
        existingPurchase.sessionCountSnapshot !== sessions ||
        existingPurchase.packageId !== packageId)
    )
      throw new Error('DELTA_FINAL_PURCHASE_SNAPSHOT_RESOLUTION_REQUIRED');
    const configuredProjectionRates = optionalJsonMap('V1_PROJECTION_RATES');
    const projectionRateRp = Number(
      configuredProjectionRates[`${textValue(row.id_paket)}:${branchSourceId}`],
    );
    if (
      !Number.isSafeInteger(projectionRateRp) ||
      projectionRateRp < 0 ||
      !process.env.V1_PROJECTION_RATE_EVIDENCE?.trim()
    )
      throw new Error('DELTA_PROJECTION_RATE_MAPPING_REQUIRED');
    await tx.pembelian.upsert({
      where: { id: purchaseId },
      create: {
        id: purchaseId,
        userId,
        branchId,
        packageId,
        classTypeId: packageClassScope.classTypeId,
        packageNameSnapshot: pkg.name,
        priceRpSnapshot: price,
        priceAfterDiscountRpSnapshot: price,
        finalAmountBeforeUniqueCodeRpSnapshot: uniqueCode > 0 ? price - uniqueCode : null,
        paymentUniqueCode: uniqueCode || null,
        payableAmountRpSnapshot: price,
        amountPaidRpSnapshot: asDate(row.tanggal_pembayaran) ? price : null,
        paymentMethodCode: textValue(row.metode_pembayaran) || null,
        sourceStatusCode: textValue(row.status),
        sourceActiveFlag: intValue(row.is_active) === 1,
        snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
        sessionCountSnapshot: sessions,
        durationDaysSnapshot: pkg.durationDays,
        status: purchaseStatus,
        idempotencyKeyHash: recordChecksum({
          source: SOURCE_SYSTEM,
          table: 'order_pakets',
          id: event.sourceId,
        }),
        submittedAt: createdAt,
        decidedAt: purchaseStatus === 'APPROVED' ? activationDate : null,
        timelineComplete: true,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, [
          'status',
          'is_active',
          'unix_code',
          'metode_pembayaran',
        ]),
      },
      update: {
        classTypeId: packageClassScope.classTypeId,
        status: purchaseStatus,
        amountPaidRpSnapshot: asDate(row.tanggal_pembayaran) ? price : null,
        paymentMethodCode: textValue(row.metode_pembayaran) || null,
        sourceStatusCode: textValue(row.status),
        sourceActiveFlag: intValue(row.is_active) === 1,
        decidedAt: purchaseStatus === 'APPROVED' ? activationDate : null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, [
          'status',
          'is_active',
          'unix_code',
          'metode_pembayaran',
        ]),
      },
    });
    await tx.paketPelanggan.upsert({
      where: { id: customerPackageId },
      create: {
        id: customerPackageId,
        purchaseId,
        customerUserId: userId,
        branchId,
        packageId,
        classTypeId: packageClassScope.classTypeId,
        activationDate,
        expiryAt,
        salePriceRp: price,
        sessionCountSnapshot: sessions,
        durationDaysSnapshot: pkg.durationDays,
        projectionRateRp,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceBalance,
        createdAt,
      },
      update: {
        expiryAt,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceBalance,
      },
    });
    const balance =
      (
        await tx.entriBukuBesar.aggregate({
          where: { customerPackageId },
          _sum: { quantity: true },
        })
      )._sum.quantity ?? 0;
    const adjustment = sourceBalance - balance;
    if (adjustment !== 0)
      await tx.entriBukuBesar.create({
        data: {
          id: deterministicId(`${SOURCE_SYSTEM}:delta:${event.eventKey}:LedgerEntry`),
          customerPackageId,
          type: existingPurchase ? 'ADJUST_MANUAL' : 'PURCHASE',
          quantity: adjustment,
          referenceType: 'MigrationDeltaEvent',
          referenceId: event.eventKey,
          occurredAt: event.sourceOccurredAt,
        },
      });
    await upsertDeltaSourceKey(tx, context, event, 'Purchase', purchaseId, checksum);
    await upsertDeltaSourceKey(tx, context, event, 'CustomerPackage', customerPackageId, checksum);
    return;
  }
  throw new Error('DELTA_PACKAGE_ORDER_TABLE_UNSUPPORTED');
}

async function applySlotBookingDelta(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
  row: LegacyRow,
  context: { batchId: string; mappingVersion: string },
) {
  const checksum = recordChecksum(row);
  const deletedAt = asDate(row.deleted_at);
  const weekdays = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ] as const;
  if (event.sourceTable === 'kelas_activities' || event.sourceTable === 'kelas_pertamuans') {
    const activity = event.sourceTable === 'kelas_activities';
    const classTypeId = await targetIdFor(
      tx as unknown as PrismaClient,
      'kelas',
      row.id_kelas,
      'ClassType',
    );
    if (!classTypeId) throw new Error('DELTA_SLOT_CLASS_RESOLUTION_REQUIRED');
    const classType = await tx.jenisKelas.findUniqueOrThrow({
      where: { id: classTypeId },
      include: {
        branchScopes: {
          where: { active: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
    const studioId = activity
      ? await targetIdFor(
          tx as unknown as PrismaClient,
          'location_studios',
          row.id_location_studio,
          'Studio',
        )
      : null;
    const studio = studioId ? await tx.studio.findUnique({ where: { id: studioId } }) : null;
    if (activity && !studio) throw new Error('DELTA_SLOT_STUDIO_RESOLUTION_REQUIRED');
    const branchId = studio?.branchId ?? classType.branchScopes[0]?.branchId;
    const effectiveStudio =
      studio ??
      (branchId
        ? await tx.studio.findFirst({
            where: { branchId, active: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          })
        : null);
    if (!branchId || !effectiveStudio) throw new Error('DELTA_SLOT_VENUE_RESOLUTION_REQUIRED');
    await tx.cakupanCabangJenisKelas.upsert({
      where: { classTypeId_branchId: { classTypeId, branchId } },
      create: {
        id: deterministicId(
          `${SOURCE_SYSTEM}:kelas_activities:${event.sourceId}:ClassTypeBranchScope:${branchId}`,
        ),
        classTypeId,
        branchId,
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
      update: {},
    });
    const startAt = activity
      ? legacyJakartaDateTime(row.tanggal, row.jam_mulai)
      : legacyJakartaDateTime(row.datetime_avaiable);
    if (!startAt) throw new Error('DELTA_SLOT_TIME_INVALID');
    const duration = classType.defaultDurationMinutes;
    const existingSourceKey = await tx.migrationSourceKey.findUnique({
      where: {
        sourceSystem_sourceTable_sourceId_targetType: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: event.sourceTable,
          sourceId: event.sourceId,
          targetType: 'ClassSlot',
        },
      },
      select: { targetId: true },
    });
    const existingSlot = existingSourceKey
      ? await tx.slotKelas.findUnique({
          where: { id: existingSourceKey.targetId },
          select: { id: true, sourceMetadata: true },
        })
      : null;
    const matchingSlot =
      existingSlot ??
      (await tx.slotKelas.findFirst({
        where: { classTypeId, startAt },
        orderBy: [{ historical: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        select: { id: true, sourceMetadata: true },
      }));
    const matchingSourceKeys = matchingSlot
      ? await tx.migrationSourceKey.findMany({
          where: { targetType: 'ClassSlot', targetId: matchingSlot.id },
          select: { sourceTable: true, sourceId: true },
        })
      : [];
    const hasOtherSameProjection = matchingSourceKeys.some(
      (key) => key.sourceTable === event.sourceTable && key.sourceId !== event.sourceId,
    );
    if (!existingSourceKey && matchingSlot && hasOtherSameProjection && !deletedAt)
      throw new Error('DELTA_DUPLICATE_ACTIVE_SLOT_RESOLUTION_REQUIRED');
    const id =
      existingSourceKey?.targetId ??
      (matchingSlot && !hasOtherSameProjection
        ? matchingSlot.id
        : deterministicId(`${SOURCE_SYSTEM}:${event.sourceTable}:${event.sourceId}:ClassSlot`));
    const sourceStatus = intValue(row.status, 1);
    const projectionSharesSlot =
      !activity && matchingSourceKeys.some((key) => key.sourceTable === 'kelas_activities');
    const hardDeletedAt = event.operation === 'DELETE' ? event.sourceOccurredAt : deletedAt;
    await tx.slotKelas.upsert({
      where: { id },
      create: {
        id,
        branchId,
        classTypeId,
        studioId: effectiveStudio.id,
        instructorUserId: activity
          ? await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User')
          : null,
        startAt,
        endAt: new Date(startAt.getTime() + duration * 60_000),
        timezone: 'Asia/Jakarta',
        minimumQuota: classType.defaultMinimumQuota,
        capacity: classType.defaultCapacity,
        status: mapV1ClassSlotStatus(sourceStatus),
        historical: Boolean(hardDeletedAt),
        sourceDeletedAt: hardDeletedAt,
        sourceMetadata: sourceMetadata(
          row,
          activity
            ? ['status', 'nama_latihan', 'level', 'user_update', 'rating', 'id_location_studio']
            : ['status', 'keterangan'],
        ),
        createdAt: asDate(row.created_at) ?? startAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: projectionSharesSlot
        ? {
            sourceMetadata: {
              ...jsonObject(matchingSlot?.sourceMetadata),
              legacyMeetingProjection: sourceMetadata(row, ['status', 'keterangan']),
            },
          }
        : {
            branchId,
            studioId: effectiveStudio.id,
            instructorUserId: activity
              ? await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User')
              : null,
            startAt,
            endAt: new Date(startAt.getTime() + duration * 60_000),
            status: mapV1ClassSlotStatus(sourceStatus),
            historical: Boolean(hardDeletedAt),
            sourceDeletedAt: hardDeletedAt,
            sourceMetadata: sourceMetadata(
              row,
              activity
                ? ['status', 'nama_latihan', 'level', 'user_update', 'rating', 'id_location_studio']
                : ['status', 'keterangan'],
            ),
            updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
          },
    });
    await upsertDeltaSourceKey(tx, context, event, 'ClassSlot', id, checksum);
    if (activity) {
      const hourLogId = deterministicId(
        `${SOURCE_SYSTEM}:kelas_activities:${event.sourceId}:InstructorHourLog`,
      );
      const existingHourLog = await tx.rekapJamInstruktur.findUnique({
        where: { classSlotId: id },
      });
      const completed = mapV1ClassSlotStatus(sourceStatus) === 'COMPLETED' && !hardDeletedAt;
      if (existingHourLog && !completed)
        throw new Error('DELTA_INSTRUCTOR_COMPENSATION_REVERSAL_REQUIRED');
      if (completed && !existingHourLog) {
        const instructorUserId = await targetIdFor(
          tx as unknown as PrismaClient,
          'users',
          row.id_user,
          'User',
        );
        if (!instructorUserId) throw new Error('DELTA_INSTRUCTOR_COMPENSATION_MAPPING_REQUIRED');
        const effectiveDate = new Date(
          `${dateInTimeZone(new Date(startAt.getTime() + duration * 60_000), 'Asia/Jakarta')}T00:00:00.000Z`,
        );
        const feeCandidates = await tx.konfigurasiEfektif.findMany({
          where: {
            kind: 'INSTRUCTOR_FEE',
            branchId,
            classTypeId,
            effectiveFrom: { lte: effectiveDate },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveDate } }],
          },
          select: { id: true, value: true },
        });
        const fees = feeCandidates.flatMap((candidate) => {
          const value = jsonObject(candidate.value);
          const feeRp = Number(value.feeRp);
          return value.instructorUserId === instructorUserId &&
            Number.isSafeInteger(feeRp) &&
            feeRp >= 0
            ? [{ id: candidate.id, feeRp }]
            : [];
        });
        if (fees.length !== 1) throw new Error('DELTA_INSTRUCTOR_COMPENSATION_MAPPING_REQUIRED');
        const fee = fees[0]!;
        const occurredAt = new Date(startAt.getTime() + duration * 60_000);
        await tx.rekapJamInstruktur.create({
          data: {
            id: hourLogId,
            classSlotId: id,
            instructorUserId,
            branchId,
            classTypeId,
            effectiveConfigurationId: fee.id,
            matchedUnits: 1,
            feeRpSnapshot: fee.feeRp,
            amountRp: fee.feeRp,
            period: dateInTimeZone(occurredAt, 'Asia/Jakarta').slice(0, 7),
            occurredAt,
          },
        });
      }
      if (completed)
        await upsertDeltaSourceKey(tx, context, event, 'InstructorHourLog', hourLogId, checksum);
    }
    return;
  }
  if (event.sourceTable === 'customer_kelas') {
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User');
    const classTypeId = await targetIdFor(
      tx as unknown as PrismaClient,
      'kelas',
      row.id_kelas,
      'ClassType',
    );
    if (!userId || !classTypeId) throw new Error('DELTA_ENROLLMENT_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:customer_kelas:${event.sourceId}:Enrollment`);
    await tx.pendaftaranKelasPelanggan.upsert({
      where: { id },
      create: {
        id,
        customerUserId: userId,
        classTypeId,
        statusCode: textValue(row.status, 'UNKNOWN'),
        paidAt: asDate(row.tanggal_bayar),
        sessionCount: Math.max(0, intValue(row.jumlah_pertemuan)),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        statusCode: textValue(row.status, 'UNKNOWN'),
        paidAt: asDate(row.tanggal_bayar),
        sessionCount: Math.max(0, intValue(row.jumlah_pertemuan)),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'CustomerClassEnrollment', id, checksum);
    return;
  }
  if (event.sourceTable === 'customer_jadwal_statics') {
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User');
    const user = userId
      ? await tx.user.findUnique({ where: { id: userId }, select: { preferredBranchId: true } })
      : null;
    const weekday = weekdays[intValue(row.hari)];
    if (!userId || !weekday) throw new Error('DELTA_SCHEDULE_RESOLUTION_REQUIRED');
    const id = deterministicId(
      `${SOURCE_SYSTEM}:customer_jadwal_statics:${event.sourceId}:Schedule`,
    );
    await tx.jadwalRutinPelanggan.upsert({
      where: { id },
      create: {
        id,
        customerUserId: userId,
        branchId: user?.preferredBranchId ?? null,
        weekday,
        startMinute: minuteOfDay(row.jam),
        timezone: 'Asia/Jakarta',
        note: textValue(row.keterangan) || null,
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        branchId: user?.preferredBranchId ?? null,
        weekday,
        startMinute: minuteOfDay(row.jam),
        note: textValue(row.keterangan) || null,
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'CustomerRecurringSchedule', id, checksum);
    return;
  }
  if (event.sourceTable === 'booking_kelas') {
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User');
    const classSlotId = await targetIdFor(
      tx as unknown as PrismaClient,
      'kelas_activities',
      row.id_kelas_activity,
      'ClassSlot',
    );
    const slot = classSlotId ? await tx.slotKelas.findUnique({ where: { id: classSlotId } }) : null;
    if (!userId || !slot) throw new Error('DELTA_BOOKING_REFERENCE_RESOLUTION_REQUIRED');
    const bookingId = deterministicId(`${SOURCE_SYSTEM}:booking_kelas:${event.sourceId}:Booking`);
    const existing = await tx.pemesananKelas.findUnique({ where: { id: bookingId } });
    let customerPackageId = existing?.customerPackageId ?? null;
    if (!customerPackageId) {
      const candidates = await tx.paketPelanggan.findMany({
        where: {
          customerUserId: userId,
          branchId: slot.branchId,
          classTypeId: slot.classTypeId,
          activationDate: { lte: slot.startAt },
          expiryAt: { gte: slot.startAt },
        },
        select: { id: true },
      });
      if (candidates.length !== 1) throw new Error('DELTA_BOOKING_PACKAGE_RESOLUTION_REQUIRED');
      customerPackageId = candidates[0]!.id;
    }
    const duplicate = await tx.pemesananKelas.findFirst({
      where: {
        id: { not: bookingId },
        customerUserId: userId,
        classSlotId: slot.id,
        status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
        historical: false,
      },
      select: { id: true },
    });
    if (duplicate && !deletedAt)
      throw new Error('DELTA_DUPLICATE_ACTIVE_BOOKING_RESOLUTION_REQUIRED');
    const attendance = mapV1BookingAttendance(row.status_kehadiran);
    const status = deletedAt ? 'CANCELLED' : attendance.bookingStatus;
    const reservationStatus =
      deletedAt || attendance.outcome === 'EXCUSED'
        ? 'RELEASED'
        : attendance.outcome === 'ATTENDED' || attendance.outcome === 'NO_SHOW'
          ? 'CONSUMED'
          : 'ACTIVE';
    const reservationId = deterministicId(
      `${SOURCE_SYSTEM}:booking_kelas:${event.sourceId}:SessionReservation`,
    );
    const createdAt = asDate(row.created_at) ?? slot.startAt;
    await tx.reservasiSesi.upsert({
      where: { id: reservationId },
      create: {
        id: reservationId,
        customerPackageId,
        classSlotId: slot.id,
        referenceHash: recordChecksum({
          source: SOURCE_SYSTEM,
          table: 'booking_kelas',
          id: event.sourceId,
        }),
        status: reservationStatus,
        createdAt,
        releasedAt: reservationStatus === 'RELEASED' ? event.sourceOccurredAt : null,
        consumedAt: reservationStatus === 'CONSUMED' ? event.sourceOccurredAt : null,
      },
      update: {
        customerPackageId,
        classSlotId: slot.id,
        status: reservationStatus,
        releasedAt: reservationStatus === 'RELEASED' ? event.sourceOccurredAt : null,
        consumedAt: reservationStatus === 'CONSUMED' ? event.sourceOccurredAt : null,
      },
    });
    await tx.pemesananKelas.upsert({
      where: { id: bookingId },
      create: {
        id: bookingId,
        branchId: slot.branchId,
        classSlotId: slot.id,
        customerUserId: userId,
        customerPackageId,
        reservationId,
        createdById: userId,
        source: 'SELF',
        status,
        cancellationReasonCode: status === 'CANCELLED' ? 'OTHER' : null,
        cancelledAt: status === 'CANCELLED' ? (deletedAt ?? event.sourceOccurredAt) : null,
        cancelledById: status === 'CANCELLED' ? userId : null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['is_send_email', 'status_kehadiran', 'keterangan']),
        createdAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        status,
        cancellationReasonCode: status === 'CANCELLED' ? 'OTHER' : null,
        cancelledAt: status === 'CANCELLED' ? (deletedAt ?? event.sourceOccurredAt) : null,
        cancelledById: status === 'CANCELLED' ? userId : null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['is_send_email', 'status_kehadiran', 'keterangan']),
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    const outcomeId = deterministicId(
      `${SOURCE_SYSTEM}:booking_kelas:${event.sourceId}:BookingAttendanceOutcome`,
    );
    await tx.hasilKehadiranPemesanan.upsert({
      where: { bookingId },
      create: {
        id: outcomeId,
        bookingId,
        outcome: attendance.outcome,
        sourceStatusCode:
          row.status_kehadiran === null || row.status_kehadiran === undefined
            ? null
            : textValue(row.status_kehadiran),
        note: textValue(row.keterangan) || null,
        occurredAt:
          attendance.outcome === 'UNKNOWN_HISTORICAL'
            ? null
            : (asDate(row.updated_at) ?? slot.startAt),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        outcome: attendance.outcome,
        sourceStatusCode:
          row.status_kehadiran === null || row.status_kehadiran === undefined
            ? null
            : textValue(row.status_kehadiran),
        note: textValue(row.keterangan) || null,
        occurredAt:
          attendance.outcome === 'UNKNOWN_HISTORICAL'
            ? null
            : (asDate(row.updated_at) ?? slot.startAt),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    if (row.review || row.rating)
      await tx.ulasanPemesanan.upsert({
        where: { bookingId },
        create: {
          id: deterministicId(`${SOURCE_SYSTEM}:booking_kelas:${event.sourceId}:Feedback`),
          bookingId,
          customerUserId: userId,
          rating: row.rating === null ? null : intValue(row.rating),
          feedback: textValue(row.review) || null,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          submittedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
          createdAt,
          updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
        },
        update: {
          rating: row.rating === null ? null : intValue(row.rating),
          feedback: textValue(row.review) || null,
          historical: Boolean(deletedAt),
          sourceDeletedAt: deletedAt,
          submittedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
          updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
        },
      });
    await upsertDeltaSourceKey(tx, context, event, 'Booking', bookingId, checksum);
    await upsertDeltaSourceKey(tx, context, event, 'SessionReservation', reservationId, checksum);
    await upsertDeltaSourceKey(tx, context, event, 'BookingAttendanceOutcome', outcomeId, checksum);
    return;
  }
  if (event.sourceTable === 'kelas_ratings') {
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.id_user, 'User');
    const slotId = await targetIdFor(
      tx as unknown as PrismaClient,
      'kelas_activities',
      row.id_kelas_activity,
      'ClassSlot',
    );
    const booking =
      userId && slotId
        ? await tx.pemesananKelas.findFirst({ where: { customerUserId: userId, classSlotId: slotId } })
        : null;
    if (!booking) throw new Error('DELTA_RATING_BOOKING_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:kelas_ratings:${event.sourceId}:Feedback`);
    await tx.ulasanPemesanan.upsert({
      where: { bookingId: booking.id },
      create: {
        id,
        bookingId: booking.id,
        customerUserId: booking.customerUserId,
        rating: row.rating === null ? null : intValue(row.rating),
        feedback: textValue(row.comment) || null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        submittedAt: asDate(row.created_at),
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        rating: row.rating === null ? null : intValue(row.rating),
        feedback: textValue(row.comment) || null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'BookingFeedback', id, checksum);
    return;
  }
  if (event.sourceTable === 'check_in_outs' || event.sourceTable === 'kelas_pertemuan_absensis') {
    const bookingSourceId = event.sourceTable === 'check_in_outs' ? row.id_booking_kelas : null;
    const bookingId = bookingSourceId
      ? await targetIdFor(
          tx as unknown as PrismaClient,
          'booking_kelas',
          bookingSourceId,
          'Booking',
        )
      : null;
    if (!bookingId) throw new Error('DELTA_ATTENDANCE_BOOKING_RESOLUTION_REQUIRED');
    const booking = await tx.pemesananKelas.findUniqueOrThrow({ where: { id: bookingId } });
    const checkedInAt =
      asDate(row.jadwal) ??
      asDate(row.waktu_masuk) ??
      asDate(row.created_at) ??
      event.sourceOccurredAt;
    const id = deterministicId(
      `${SOURCE_SYSTEM}:${event.sourceTable}:${event.sourceId}:Attendance`,
    );
    const auditLogId = deterministicId(
      `${SOURCE_SYSTEM}:${event.sourceTable}:${event.sourceId}:AuditLog`,
    );
    if (!deletedAt) {
      await tx.auditLog.upsert({
        where: { id: auditLogId },
        create: {
          id: auditLogId,
          occurredAt: checkedInAt,
          actorType: 'MIGRATION',
          actorId: booking.customerUserId,
          branchId: booking.branchId,
          action: 'attendance.delta_migrated',
          objectType: 'Booking',
          objectId: booking.id,
          targetUserId: booking.customerUserId,
          correlationId: event.correlationId,
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: event.sourceTable,
          sourceId: event.sourceId,
        },
        update: { occurredAt: checkedInAt },
      });
      await tx.kehadiranPelanggan.upsert({
        where: { id },
        create: {
          id,
          bookingId: booking.id,
          branchId: booking.branchId,
          classSlotId: booking.classSlotId,
          recordedById: booking.customerUserId,
          source: 'MIGRATION',
          checkedInAt,
          auditLogId,
          createdAt: asDate(row.created_at) ?? checkedInAt,
        },
        update: { checkedInAt },
      });
      await tx.pemesananKelas.update({ where: { id: booking.id }, data: { status: 'ATTENDED' } });
      await tx.reservasiSesi.update({
        where: { id: booking.reservationId },
        data: { status: 'CONSUMED', consumedAt: checkedInAt, releasedAt: null },
      });
      await tx.entriBukuBesar.upsert({
        where: {
          type_referenceType_referenceId: {
            type: 'ATTEND',
            referenceType: 'MigrationDeltaEvent',
            referenceId: event.eventKey,
          },
        },
        create: {
          id: deterministicId(`${SOURCE_SYSTEM}:delta:${event.eventKey}:AttendanceLedger`),
          customerPackageId: booking.customerPackageId,
          type: 'ATTEND',
          quantity: -1,
          referenceType: 'MigrationDeltaEvent',
          referenceId: event.eventKey,
          occurredAt: checkedInAt,
        },
        update: {},
      });
    } else {
      const existingAttendance = await tx.kehadiranPelanggan.findUnique({ where: { id } });
      if (existingAttendance)
        throw new Error('DELTA_ATTENDANCE_DELETE_REVERSAL_RESOLUTION_REQUIRED');
    }
    await upsertDeltaSourceKey(tx, context, event, 'CustomerAttendance', id, checksum);
    return;
  }
  throw new Error('DELTA_SLOT_BOOKING_TABLE_UNSUPPORTED');
}

async function applyVoucherFinanceAuditMediaDelta(
  tx: Prisma.TransactionClient,
  event: StoredDeltaEvent,
  row: LegacyRow,
  context: { batchId: string; mappingVersion: string },
) {
  const checksum = recordChecksum(row);
  const deletedAt = asDate(row.deleted_at);
  if (event.sourceTable === 'kelas_images') {
    migrationMediaMode();
    return;
  }
  if (event.sourceTable === 'vouchers') {
    const actorSourceId = required(
      process.env.V1_MIGRATION_ACTOR_SOURCE_USER_ID,
      'V1_MIGRATION_ACTOR_SOURCE_USER_ID_REQUIRED',
    );
    const actorId = await targetIdFor(
      tx as unknown as PrismaClient,
      'users',
      actorSourceId,
      'User',
    );
    if (!actorId) throw new Error('DELTA_MIGRATION_ACTOR_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:vouchers:${event.sourceId}:Voucher`);
    const sourceCode = textValue(row.kode_voucher, `LEGACY-${event.sourceId}`).trim().toUpperCase();
    const duplicate = await tx.aliasKodeVoucher.findFirst({
      where: { code: sourceCode, voucherId: { not: id }, canonical: true },
      select: { id: true },
    });
    if (duplicate) throw new Error('DELTA_DUPLICATE_VOUCHER_CODE_RESOLUTION_REQUIRED');
    const fixed = row.disc_harga !== null && row.disc_harga !== undefined;
    const activeFrom =
      asDate(row.tanggal_aktif) ?? asDate(row.created_at) ?? new Date('1970-01-01T00:00:00.000Z');
    const activeUntil = asDate(row.expired);
    const status = deletedAt
      ? 'ARCHIVED'
      : intValue(row.status, 1) !== 1
        ? 'PAUSED'
        : activeUntil && activeUntil < new Date()
          ? 'EXPIRED'
          : 'ACTIVE';
    await tx.voucher.upsert({
      where: { id },
      create: {
        id,
        code: sourceCode,
        name: textValue(row.nama, `Legacy voucher ${event.sourceId}`),
        description: textValue(row.deskripsi) || null,
        status,
        discountType: fixed ? 'FIXED_AMOUNT' : 'PERCENTAGE',
        discountValue: Math.max(0, intValue(fixed ? row.disc_harga : row.disc_percent)),
        activeFrom,
        activeUntil,
        perCustomerUsageLimit: intValue(row.sekali_gunakan) === 1 ? 1 : null,
        legacyEntitlementDurationDays:
          row.lama_aktif === null ? null : Math.max(0, intValue(row.lama_aktif)),
        createdById: actorId,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['id_paket', 'status']),
        createdAt: asDate(row.created_at) ?? activeFrom,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        code: sourceCode,
        name: textValue(row.nama, `Legacy voucher ${event.sourceId}`),
        description: textValue(row.deskripsi) || null,
        status,
        discountType: fixed ? 'FIXED_AMOUNT' : 'PERCENTAGE',
        discountValue: Math.max(0, intValue(fixed ? row.disc_harga : row.disc_percent)),
        activeFrom,
        activeUntil,
        perCustomerUsageLimit: intValue(row.sekali_gunakan) === 1 ? 1 : null,
        legacyEntitlementDurationDays:
          row.lama_aktif === null ? null : Math.max(0, intValue(row.lama_aktif)),
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['id_paket', 'status']),
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    const aliasId = deterministicId(`${SOURCE_SYSTEM}:vouchers:${event.sourceId}:VoucherCodeAlias`);
    await tx.aliasKodeVoucher.upsert({
      where: { id: aliasId },
      create: {
        id: aliasId,
        voucherId: id,
        code: sourceCode,
        canonical: true,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? activeFrom,
      },
      update: {
        code: sourceCode,
        canonical: true,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
      },
    });
    const packageIds = jsonStringArray(row.id_paket);
    const desiredPackages: string[] = [];
    for (const sourcePackageId of packageIds) {
      const keys = await tx.migrationSourceKey.findMany({
        where: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: 'pakets',
          sourceId: sourcePackageId,
          targetType: 'Package',
        },
      });
      desiredPackages.push(...keys.map((key) => key.targetId));
    }
    await tx.cakupanPaketVoucher.deleteMany({
      where: { voucherId: id, packageId: { notIn: desiredPackages } },
    });
    for (const packageId of desiredPackages)
      await tx.cakupanPaketVoucher.upsert({
        where: { voucherId_packageId: { voucherId: id, packageId } },
        create: {
          id: deterministicId(`${SOURCE_SYSTEM}:vouchers:${event.sourceId}:scope:${packageId}`),
          voucherId: id,
          packageId,
        },
        update: {},
      });
    await upsertDeltaSourceKey(tx, context, event, 'Voucher', id, checksum);
    return;
  }
  if (event.sourceTable === 'voucher_customers') {
    const voucherId = await targetIdFor(
      tx as unknown as PrismaClient,
      'vouchers',
      row.id_voucher,
      'Voucher',
    );
    const customerUserId = await targetIdFor(
      tx as unknown as PrismaClient,
      'users',
      row.id_customer,
      'User',
    );
    const purchaseId = row.id_order_paket
      ? await targetIdFor(
          tx as unknown as PrismaClient,
          'order_pakets',
          row.id_order_paket,
          'Purchase',
        )
      : null;
    const used = intValue(row.status_digunakan) === 1;
    if (!voucherId || !customerUserId || (used && !purchaseId))
      throw new Error('DELTA_VOUCHER_REDEMPTION_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:voucher_customers:${event.sourceId}:Entitlement`);
    await tx.hakVoucherPelanggan.upsert({
      where: { id },
      create: {
        id,
        voucherId,
        purchaseId,
        customerUserId,
        sourceStatusCode: textValue(row.status),
        active: !used && !deletedAt && intValue(row.status) === 1,
        expiresAt: asDate(row.expired),
        usedAt: used ? asDate(row.tanggal_digunakan) : null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        purchaseId,
        sourceStatusCode: textValue(row.status),
        active: !used && !deletedAt && intValue(row.status) === 1,
        expiresAt: asDate(row.expired),
        usedAt: used ? asDate(row.tanggal_digunakan) : null,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'CustomerVoucherEntitlement', id, checksum);
    if (used && purchaseId) {
      const [voucher, purchase] = await Promise.all([
        tx.voucher.findUniqueOrThrow({ where: { id: voucherId } }),
        tx.pembelian.findUniqueOrThrow({ where: { id: purchaseId } }),
      ]);
      const discountRp = purchase.voucherDiscountRpSnapshot ?? 0;
      const redemptionId = deterministicId(
        `${SOURCE_SYSTEM}:voucher_customers:${event.sourceId}:Redemption`,
      );
      await tx.penukaranVoucher.upsert({
        where: { purchaseId },
        create: {
          id: redemptionId,
          voucherId,
          purchaseId,
          customerUserId,
          discountRp,
          snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
          redeemedAt: asDate(row.tanggal_digunakan) ?? event.sourceOccurredAt,
        },
        update: {
          voucherId,
          customerUserId,
          discountRp,
          snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
          redeemedAt: asDate(row.tanggal_digunakan) ?? event.sourceOccurredAt,
          releasedAt: deletedAt,
        },
      });
      await tx.pembelian.update({
        where: { id: purchaseId },
        data: {
          voucherId,
          voucherCodeSnapshot: voucher.code,
          priceAfterDiscountRpSnapshot: purchase.priceRpSnapshot,
          snapshotCompleteness: 'LEGACY_FINAL_AMOUNT_ONLY',
        },
      });
      await upsertDeltaSourceKey(tx, context, event, 'VoucherRedemption', redemptionId, checksum);
    }
    return;
  }
  if (event.sourceTable === 'coas') {
    const id = deterministicId(`${SOURCE_SYSTEM}:coas:${event.sourceId}:AccountingAccount`);
    await tx.akunAkuntansi.upsert({
      where: { id },
      create: {
        id,
        code: textValue(row.nomor, `LEGACY-${event.sourceId}`),
        name: textValue(row.nama, `Legacy account ${event.sourceId}`),
        accountType: 'LEGACY',
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        code: textValue(row.nomor, `LEGACY-${event.sourceId}`),
        name: textValue(row.nama, `Legacy account ${event.sourceId}`),
        active: !deletedAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'AccountingAccount', id, checksum);
    return;
  }
  if (event.sourceTable === 'jurnals') {
    const purchaseId = row.id_order_paket
      ? await targetIdFor(
          tx as unknown as PrismaClient,
          'order_pakets',
          row.id_order_paket,
          'Purchase',
        )
      : null;
    const migrationActorSourceId = required(
      process.env.V1_MIGRATION_ACTOR_SOURCE_USER_ID,
      'V1_MIGRATION_ACTOR_SOURCE_USER_ID_REQUIRED',
    );
    const actorSourceId = textValue(row.id_user) === '0' ? migrationActorSourceId : row.id_user;
    const actorUserId = actorSourceId
      ? await targetIdFor(tx as unknown as PrismaClient, 'users', actorSourceId, 'User')
      : null;
    const parentId = row.id_parent
      ? await targetIdFor(
          tx as unknown as PrismaClient,
          'jurnals',
          row.id_parent,
          'LegacyFinancialEntry',
        )
      : null;
    if (
      (row.id_order_paket && !purchaseId) ||
      (row.id_user && !actorUserId) ||
      (row.id_parent && !parentId)
    )
      throw new Error('DELTA_JOURNAL_REFERENCE_RESOLUTION_REQUIRED');
    const purchase = purchaseId
      ? await tx.pembelian.findUnique({ where: { id: purchaseId }, select: { branchId: true } })
      : null;
    const id = deterministicId(`${SOURCE_SYSTEM}:jurnals:${event.sourceId}:LegacyFinancialEntry`);
    const amount = Math.max(0, intValue(row.jumlah_uang));
    await tx.entriKeuanganHistoris.upsert({
      where: { id },
      create: {
        id,
        branchId: purchase?.branchId ?? null,
        purchaseId,
        actorUserId,
        parentId,
        type: intValue(row.tipe) === 1 ? 'INCOME' : 'EXPENSE',
        amountRp: amount,
        sourceTypeCode: textValue(row.tipe),
        description: textValue(row.nama),
        occurredAt: asDate(row.tanggal) ?? event.sourceOccurredAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['tipe']),
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        branchId: purchase?.branchId ?? null,
        purchaseId,
        actorUserId,
        parentId,
        type: intValue(row.tipe) === 1 ? 'INCOME' : 'EXPENSE',
        amountRp: amount,
        sourceTypeCode: textValue(row.tipe),
        description: textValue(row.nama),
        occurredAt: asDate(row.tanggal) ?? event.sourceOccurredAt,
        historical: Boolean(deletedAt),
        sourceDeletedAt: deletedAt,
        sourceMetadata: sourceMetadata(row, ['tipe']),
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'LegacyFinancialEntry', id, checksum);
    return;
  }
  if (event.sourceTable === 'activity_log') {
    const id = deterministicId(`${SOURCE_SYSTEM}:activity_log:${event.sourceId}:AuditLog`);
    const actorId = row.causer_id
      ? await targetIdFor(tx as unknown as PrismaClient, 'users', row.causer_id, 'User')
      : null;
    const activityPayload = jsonObject(row.properties);
    await tx.auditLog.upsert({
      where: { id },
      create: {
        id,
        occurredAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        actorType: textValue(row.causer_type, 'SYSTEM').slice(0, 191),
        actorId,
        action: textValue(row.event, textValue(row.description, 'legacy.event')).slice(0, 191),
        objectType: textValue(row.subject_type, 'LegacyObject').slice(0, 191),
        objectId: textValue(row.subject_id, event.sourceId),
        afterMasked: {
          logName: textValue(row.log_name),
          description: textValue(row.description).slice(0, 500),
          propertiesChecksum: recordChecksum(jsonObject(row.properties)),
          batchUuid: textValue(row.batch_uuid) || null,
        },
        correlationId: textValue(row.batch_uuid, event.correlationId),
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: 'activity_log',
        sourceId: event.sourceId,
        historical: true,
      },
      update: {
        occurredAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        afterMasked: {
          logName: textValue(row.log_name),
          description: textValue(row.description).slice(0, 500),
          propertiesChecksum: recordChecksum(activityPayload),
          batchUuid: textValue(row.batch_uuid) || null,
        },
      },
    });
    const payloadId = deterministicId(
      `${SOURCE_SYSTEM}:activity_log:${event.sourceId}:MigrationLegacyPayload`,
    );
    await tx.migrationLegacyPayload.upsert({
      where: { auditLogId: id },
      create: {
        id: payloadId,
        kind: 'ACTIVITY_LOG',
        auditLogId: id,
        payloadEncrypted: encryptPii(stableJson(activityPayload), piiKey()),
        payloadChecksum: recordChecksum(activityPayload),
        encryptionVersion: 'aes-256-gcm:v1',
      },
      update: {
        payloadEncrypted: encryptPii(stableJson(activityPayload), piiKey()),
        payloadChecksum: recordChecksum(activityPayload),
        encryptionVersion: 'aes-256-gcm:v1',
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'AuditLog', id, checksum);
    await upsertDeltaSourceKey(tx, context, event, 'MigrationLegacyPayload', payloadId, checksum);
    return;
  }
  if (event.sourceTable === 'notifications') {
    const userId = await targetIdFor(
      tx as unknown as PrismaClient,
      'users',
      row.notifiable_id,
      'User',
    );
    if (!userId) throw new Error('DELTA_NOTIFICATION_USER_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:notifications:${event.sourceId}:UserNotification`);
    const data = jsonObject(row.data);
    await tx.userNotification.upsert({
      where: { id },
      create: {
        id,
        userId,
        eventKey: `legacy:${event.sourceId}`,
        category: 'SYSTEM',
        tone: 'INFO',
        title: textValue(data.title, textValue(row.type, 'Daily Dose v1')).slice(0, 191),
        message: textValue(data.message, 'Notifikasi historis Daily Dose v1').slice(0, 1000),
        metadataMasked: {
          sourceType: textValue(row.type),
          payloadChecksum: recordChecksum(data),
        },
        readAt: asDate(row.read_at),
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
      },
      update: {
        title: textValue(data.title, textValue(row.type, 'Daily Dose v1')).slice(0, 191),
        message: textValue(data.message, 'Notifikasi historis Daily Dose v1').slice(0, 1000),
        metadataMasked: { sourceType: textValue(row.type), payloadChecksum: recordChecksum(data) },
        readAt: asDate(row.read_at),
      },
    });
    const payloadId = deterministicId(
      `${SOURCE_SYSTEM}:notifications:${event.sourceId}:MigrationLegacyPayload`,
    );
    await tx.migrationLegacyPayload.upsert({
      where: { userNotificationId: id },
      create: {
        id: payloadId,
        kind: 'NOTIFICATION',
        userNotificationId: id,
        payloadEncrypted: encryptPii(stableJson(data), piiKey()),
        payloadChecksum: recordChecksum(data),
        encryptionVersion: 'aes-256-gcm:v1',
      },
      update: {
        payloadEncrypted: encryptPii(stableJson(data), piiKey()),
        payloadChecksum: recordChecksum(data),
        encryptionVersion: 'aes-256-gcm:v1',
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'UserNotification', id, checksum);
    await upsertDeltaSourceKey(tx, context, event, 'MigrationLegacyPayload', payloadId, checksum);
    return;
  }
  if (event.sourceTable === 'permissions') {
    const key = `legacy:${textValue(row.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9:_-]+/gu, '-')}`.slice(0, 96);
    await tx.capabilityDefinition.upsert({
      where: { key },
      create: {
        key,
        label: textValue(row.name),
        description: `Imported permission Daily Dose v1 (${textValue(row.guard_name)})`,
        category: 'LEGACY',
        active: false,
        systemOnly: true,
        createdAt: asDate(row.created_at) ?? event.sourceOccurredAt,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
      update: {
        label: textValue(row.name),
        description: `Imported permission Daily Dose v1 (${textValue(row.guard_name)})`,
        updatedAt: asDate(row.updated_at) ?? event.sourceOccurredAt,
      },
    });
    await upsertDeltaSourceKey(tx, context, event, 'CapabilityDefinition', key, checksum);
    return;
  }
  if (event.sourceTable === 'role_has_permissions') {
    const capabilityKey = await targetIdFor(
      tx as unknown as PrismaClient,
      'permissions',
      row.permission_id,
      'CapabilityDefinition',
    );
    const roleId = deterministicId(
      `${SOURCE_SYSTEM}:roles:${textValue(row.role_id)}:RoleDefinition`,
    );
    const role = await tx.roleDefinition.findUnique({ where: { id: roleId } });
    if (!capabilityKey || !role) throw new Error('DELTA_ROLE_PERMISSION_RESOLUTION_REQUIRED');
    if (event.operation === 'DELETE')
      await tx.roleCapability.deleteMany({ where: { roleId, capabilityKey } });
    else
      await tx.roleCapability.upsert({
        where: { roleId_capabilityKey: { roleId, capabilityKey } },
        create: { roleId, capabilityKey },
        update: {},
      });
    await upsertDeltaSourceKey(
      tx,
      context,
      event,
      'RoleCapability',
      `${roleId}:${capabilityKey}`,
      checksum,
    );
    return;
  }
  if (event.sourceTable === 'model_has_permissions') {
    const capabilityKey = await targetIdFor(
      tx as unknown as PrismaClient,
      'permissions',
      row.permission_id,
      'CapabilityDefinition',
    );
    const userId = await targetIdFor(tx as unknown as PrismaClient, 'users', row.model_id, 'User');
    const actorSourceId = required(
      process.env.V1_MIGRATION_ACTOR_SOURCE_USER_ID,
      'V1_MIGRATION_ACTOR_SOURCE_USER_ID_REQUIRED',
    );
    const actorId = await targetIdFor(
      tx as unknown as PrismaClient,
      'users',
      actorSourceId,
      'User',
    );
    if (!capabilityKey || !userId || !actorId)
      throw new Error('DELTA_USER_PERMISSION_RESOLUTION_REQUIRED');
    const id = deterministicId(`${SOURCE_SYSTEM}:model_has_permissions:${event.sourceId}:Override`);
    if (event.operation === 'DELETE') await tx.userCapabilityOverride.deleteMany({ where: { id } });
    else
      await tx.userCapabilityOverride.upsert({
        where: { id },
        create: {
          id,
          userId,
          capabilityKey,
          effect: 'GRANT',
          reasonCode: 'V1_MIGRATION',
          note: 'Historical v1 permission; inactive capability retained for audit.',
          createdById: actorId,
        },
        update: { userId, capabilityKey },
      });
    await upsertDeltaSourceKey(tx, context, event, 'UserCapabilityOverride', id, checksum);
    return;
  }
  throw new Error('DELTA_VOUCHER_FINANCE_TABLE_UNSUPPORTED');
}

async function applyMappedDeltaEvent(target: PrismaClient, event: StoredDeltaEvent) {
  const payload = decryptDeltaPayload<{
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  }>(
    {
      ciphertext: event.payloadCiphertext,
      iv: event.payloadIv,
      authTag: event.payloadAuthTag,
      keyVersion: event.payloadKeyVersion,
    },
    deltaEncryptionKey(),
  );
  await target.$transaction(
    async (tx) => {
      const locked = await tx.migrationDeltaEvent.findUnique({ where: { id: event.id } });
      if (!locked || !['VERIFIED', 'BLOCKED'].includes(locked.status))
        throw new Error('DELTA_EVENT_NOT_READY');
      const resolution = await tx.migrationResolution.findFirst({
        where: {
          batchId: locked.batchId ?? undefined,
          resolutionKey: { startsWith: `delta:${locked.eventKey}:` },
          status: 'APPROVED',
        },
        include: { reject: true },
      });
      if (locked.status === 'BLOCKED' && !resolution)
        throw new Error('DELTA_EVENT_RESOLUTION_NOT_APPROVED');
      const decision = jsonObject(resolution?.decision);
      await assertDeltaBeforeState(tx, locked);
      const context = await deltaBatchContext(tx, locked);
      const overrides = jsonObject(decision.sourceOverrides);
      const allowedColumns = new Set(
        schemaContract.tables[locked.sourceTable as SourceTable]?.columns ?? [],
      );
      if (Object.keys(overrides).some((column) => !allowedColumns.has(column)))
        throw new Error('DELTA_RESOLUTION_OVERRIDE_NOT_ALLOWED');
      const row = { ...deltaRow(locked, payload), ...overrides };
      const phase = TABLE_PHASE[locked.sourceTable as SourceTable];
      if (phase === 'branch-master') await applyBranchMasterDelta(tx, locked, row, context);
      else if (phase === 'user-role')
        await applyUserRoleDelta(tx, locked, row, context, payload, decision);
      else if (phase === 'package-order') await applyPackageOrderDelta(tx, locked, row, context);
      else if (phase === 'slot-booking') await applySlotBookingDelta(tx, locked, row, context);
      else if (phase === 'voucher-finance-audit-media')
        await applyVoucherFinanceAuditMediaDelta(tx, locked, row, context);
      else throw new Error(`DELTA_PHASE_APPLIER_REQUIRED:${phase}`);
      await applyDeferredMediaDelta(tx, locked, row, context);
      await tx.migrationSourceKey.updateMany({
        where: {
          sourceSystem: SOURCE_SYSTEM,
          sourceTable: locked.sourceTable,
          sourceId: locked.sourceId,
        },
        data: { recordChecksum: recordChecksum(row), mappingVersion: context.mappingVersion },
      });
      await tx.migrationDeltaEvent.update({
        where: { id: locked.id },
        data: { status: 'APPLIED', appliedAt: new Date(), failureCode: null },
      });
      if (resolution) {
        await tx.migrationResolution.update({
          where: { id: resolution.id },
          data: { status: 'APPLIED', appliedAt: new Date() },
        });
        if (resolution.reject)
          await tx.migrationReject.update({
            where: { id: resolution.reject.id },
            data: { status: 'RESOLVED', resolvedAt: new Date() },
          });
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

async function queueDeltaEventResolution(
  target: PrismaClient,
  event: StoredDeltaEvent,
  reasonCode: string,
) {
  await target.$transaction(async (tx) => {
    const context = await deltaBatchContext(tx, event);
    const resolutionKey = `delta:${event.eventKey}:${reasonCode}`;
    const resolution = await tx.migrationResolution.upsert({
      where: { batchId_resolutionKey: { batchId: context.batchId, resolutionKey } },
      create: {
        batchId: context.batchId,
        resolutionKey,
        reasonCode,
        proposal: {
          action: 'RESOLVE_DELTA_EVENT',
          eventKey: event.eventKey,
          sourceTable: event.sourceTable,
          sourceId: event.sourceId,
          operation: event.operation,
        },
      },
      update: {},
    });
    await tx.migrationReject.upsert({
      where: {
        batchId_sourceTable_sourceId_reasonCode: {
          batchId: context.batchId,
          sourceTable: event.sourceTable,
          sourceId: `delta:${event.sourceId}:${event.eventKey.slice(0, 16)}`,
          reasonCode,
        },
      },
      create: {
        batchId: context.batchId,
        sourceTable: event.sourceTable,
        sourceId: `delta:${event.sourceId}:${event.eventKey.slice(0, 16)}`,
        reasonCode,
        recordChecksum: event.afterChecksum ?? event.beforeChecksum,
        resolutionId: resolution.id,
      },
      update: {},
    });
  });
}

async function deltaImport(target: PrismaClient, args: Args) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const operator = required(
    typeof args.operator === 'string' ? args.operator : undefined,
    'OPERATOR_REQUIRED',
  );
  const events = await target.migrationDeltaEvent.findMany({
    where: { status: { in: ['VERIFIED', 'BLOCKED'] } },
    orderBy: [{ transactionOrder: 'asc' }, { eventOrder: 'asc' }],
  });
  let applied = 0;
  let blocked = 0;
  for (const event of events) {
    if (event.status === 'BLOCKED') {
      const approved = await target.migrationResolution.findFirst({
        where: {
          batchId: event.batchId ?? undefined,
          resolutionKey: { startsWith: `delta:${event.eventKey}:` },
          status: 'APPROVED',
        },
        select: { id: true },
      });
      if (!approved) {
        blocked += 1;
        continue;
      }
    }
    const policy = TABLE_POLICIES[event.sourceTable as SourceTable];
    if (!policy) throw new Error('DELTA_SOURCE_TABLE_NOT_ALLOWED');
    if (policy.disposition === 'IGNORE') {
      await target.migrationDeltaEvent.update({
        where: { id: event.id },
        data: { status: 'APPLIED', appliedAt: new Date(), failureCode: null },
      });
      applied += 1;
      continue;
    }
    try {
      await applyMappedDeltaEvent(target, event);
      applied += 1;
    } catch (error) {
      const code = safeFailureCode(error, 'DELTA_APPLIER_FAILED');
      const dependencyPending = code.endsWith('_DEPENDENCY_PENDING');
      const resolutionRequired =
        code.includes('_RESOLUTION_REQUIRED') ||
        code === 'CREDENTIAL_DIVERGENCE' ||
        code === 'DELTA_MEDIA_MANIFEST_REQUIRED';
      await target.migrationDeltaEvent.update({
        where: { id: event.id },
        data: {
          status: dependencyPending ? 'VERIFIED' : resolutionRequired ? 'BLOCKED' : 'FAILED',
          failureCode: code.slice(0, 64),
        },
      });
      if (resolutionRequired) await queueDeltaEventResolution(target, event, code.slice(0, 64));
      blocked += 1;
    }
  }
  const verify = await target.migrationGtidCheckpoint.findUnique({
    where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'VERIFY' } },
  });
  if (verify && blocked === 0)
    await target.migrationGtidCheckpoint.upsert({
      where: { sourceSystem_kind: { sourceSystem: SOURCE_SYSTEM, kind: 'APPLY' } },
      create: {
        sourceSystem: SOURCE_SYSTEM,
        kind: 'APPLY',
        gtidSet: verify.gtidSet,
        lastGtid: verify.lastGtid,
        transactionOrder: verify.transactionOrder,
        binlogFile: verify.binlogFile,
        binlogPosition: verify.binlogPosition,
        capturedThroughAt: verify.capturedThroughAt,
        updatedBy: operator,
      },
      update: {
        gtidSet: verify.gtidSet,
        lastGtid: verify.lastGtid,
        transactionOrder: verify.transactionOrder,
        binlogFile: verify.binlogFile,
        binlogPosition: verify.binlogPosition,
        capturedThroughAt: verify.capturedThroughAt,
        updatedBy: operator,
      },
    });
  return { applied, blocked, readyForCutover: blocked === 0 };
}

async function deltaDrain(target: PrismaClient, args: Args) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const sourceBranchId = required(
    typeof args['source-branch'] === 'string' ? args['source-branch'] : undefined,
    'SOURCE_BRANCH_REQUIRED',
  );
  const highWaterGtid = required(
    typeof args['high-water-gtid'] === 'string' ? args['high-water-gtid'] : undefined,
    'HIGH_WATER_GTID_REQUIRED',
  );
  const highWaterOrder = BigInt(
    required(
      typeof args['high-water-order'] === 'string' ? args['high-water-order'] : undefined,
      'HIGH_WATER_ORDER_REQUIRED',
    ),
  );
  const branchId = await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
  if (!branchId) throw new Error('DELTA_BRANCH_NOT_MAPPED');
  const pending = await target.migrationDeltaEvent.count({
    where: {
      branchId,
      transactionOrder: { lte: highWaterOrder },
      status: { in: ['CAPTURED', 'VERIFIED', 'FAILED', 'BLOCKED'] },
    },
  });
  if (pending) throw new Error(`DELTA_DRAIN_BLOCKED:${pending}`);
  return target.migrationBranchCutover.upsert({
    where: { branchId },
    create: {
      branchId,
      sourceBranchId,
      status: 'DRAINING',
      highWaterGtid,
      highWaterOrder,
      v1WritesFrozenAt: new Date(),
      deltaDrainedAt: new Date(),
    },
    update: {
      status: 'DRAINING',
      highWaterGtid,
      highWaterOrder,
      v1WritesFrozenAt: new Date(),
      deltaDrainedAt: new Date(),
      version: { increment: 1 },
    },
  });
}

async function transitionBranchCutover(target: PrismaClient, args: Args) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const sourceBranchId = required(
    typeof args['source-branch'] === 'string' ? args['source-branch'] : undefined,
    'SOURCE_BRANCH_REQUIRED',
  );
  const action = required(
    typeof args.action === 'string' ? args.action : undefined,
    'CUTOVER_ACTION_REQUIRED',
  );
  const actorId = required(
    typeof args.actor === 'string' ? args.actor : undefined,
    'CUTOVER_ACTOR_REQUIRED',
  );
  const expectedVersion = Number(
    required(
      typeof args['expected-version'] === 'string' ? args['expected-version'] : undefined,
      'EXPECTED_VERSION_REQUIRED',
    ),
  );
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0)
    throw new Error('INVALID_EXPECTED_VERSION');
  const [branchId, actor] = await Promise.all([
    targetIdFor(target, 'locations', sourceBranchId, 'Branch'),
    target.user.findUnique({ where: { id: actorId }, select: { id: true } }),
  ]);
  if (!branchId) throw new Error('DELTA_BRANCH_NOT_MAPPED');
  if (!actor) throw new Error('CUTOVER_ACTOR_NOT_FOUND');
  const existing = await target.migrationBranchCutover.findUnique({ where: { branchId } });
  if (!existing) {
    if (action !== 'freeze' || expectedVersion !== 0)
      throw new Error('CUTOVER_STATE_NOT_INITIALIZED');
    return target.$transaction(async (tx) => {
      const created = await tx.migrationBranchCutover.create({
        data: {
          branchId,
          sourceBranchId,
          status: 'FREEZING',
          v1WritesFrozenAt: new Date(),
          version: 1,
        },
      });
      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          actorType: 'USER',
          actorId,
          branchId,
          action: 'migration.branch_cutover_freezing',
          objectType: 'MigrationBranchCutover',
          objectId: created.id,
          correlationId: `migration-cutover:${created.id}:1`,
          afterMasked: { status: created.status, version: created.version },
        },
      });
      return created;
    });
  }
  if (existing.version !== expectedVersion) throw new Error('STALE_CUTOVER_VERSION');
  const allowed: Record<string, { from: string; to: string }> = {
    freeze: { from: 'V1_ACTIVE', to: 'FREEZING' },
    activate: { from: 'DRAINING', to: 'V2_ACTIVE' },
    'rollback-start': { from: 'V2_ACTIVE', to: 'ROLLING_BACK' },
    'rollback-complete': { from: 'ROLLING_BACK', to: 'ROLLED_BACK' },
  };
  const transition = allowed[action];
  if (!transition || existing.status !== transition.from)
    throw new Error('INVALID_CUTOVER_TRANSITION');
  if (action === 'activate') {
    if (!existing.highWaterGtid || existing.highWaterOrder === null || !existing.deltaDrainedAt)
      throw new Error('CUTOVER_DELTA_NOT_DRAINED');
    const [pendingDelta, openRejects, openResolutions] = await Promise.all([
      target.migrationDeltaEvent.count({
        where: {
          branchId,
          transactionOrder: { lte: existing.highWaterOrder },
          status: { not: 'APPLIED' },
        },
      }),
      target.migrationReject.count({ where: { status: 'OPEN' } }),
      target.migrationResolution.count({ where: { status: { in: ['OPEN', 'APPROVED'] } } }),
    ]);
    if (pendingDelta || openRejects || openResolutions) throw new Error('CUTOVER_GATE_BLOCKED');
  }
  if (action === 'rollback-complete') {
    const pendingOutbox = await target.migrationPilotOutbox.count({
      where: { branchId, status: { in: ['PENDING', 'FAILED'] } },
    });
    if (pendingOutbox) throw new Error(`ROLLBACK_OUTBOX_NOT_DRAINED:${pendingOutbox}`);
  }
  return target.$transaction(async (tx) => {
    const claimed = await tx.migrationBranchCutover.updateMany({
      where: { id: existing.id, version: expectedVersion, status: existing.status },
      data: {
        status: transition.to as never,
        version: { increment: 1 },
        ...(action === 'freeze' ? { v1WritesFrozenAt: new Date() } : {}),
        ...(action === 'activate' ? { v2ActivatedAt: new Date() } : {}),
        ...(action === 'rollback-start' ? { rollbackStartedAt: new Date() } : {}),
        ...(action === 'rollback-complete' ? { rollbackCompletedAt: new Date() } : {}),
      },
    });
    if (claimed.count !== 1) throw new Error('CUTOVER_CONFLICT');
    const updated = await tx.migrationBranchCutover.findUniqueOrThrow({
      where: { id: existing.id },
    });
    await tx.auditLog.create({
      data: {
        id: randomUUID(),
        actorType: 'USER',
        actorId,
        branchId,
        action: `migration.branch_cutover_${action.replaceAll('-', '_')}`,
        objectType: 'MigrationBranchCutover',
        objectId: existing.id,
        correlationId: `migration-cutover:${existing.id}:${updated.version}`,
        beforeMasked: { status: existing.status, version: existing.version },
        afterMasked: { status: updated.status, version: updated.version },
      },
    });
    return updated;
  });
}

type ReplayReceiptRow = {
  event_key: string;
  payload_checksum: string;
  status: string;
  source_table: string | null;
  source_id: string | null;
};

async function pilotAdapter<T>(
  target: PrismaClient,
  callback: (v1: PrismaClient) => Promise<T>,
): Promise<T> {
  const targetUrl = required(process.env.DATABASE_URL, 'DATABASE_URL_REQUIRED');
  const v1Url = required(process.env.V1_ROLLBACK_DATABASE_URL, 'V1_ROLLBACK_DATABASE_URL_REQUIRED');
  assertSeparateDatabases(v1Url, targetUrl);
  const v1 = new PrismaClient({ datasourceUrl: v1Url });
  try {
    return await callback(v1);
  } finally {
    await v1.$disconnect();
  }
}

async function preparePilotAdapter(target: PrismaClient) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  return pilotAdapter(target, async (v1) => {
    const sql = await readFile(
      join(process.cwd(), 'apps/api/prisma/v1-control/migration_pilot_replay_receipts.sql'),
      'utf8',
    );
    await v1.$executeRawUnsafe(sql);
    return { prepared: true };
  });
}

async function sourceIdForTarget(
  target: PrismaClient | Prisma.TransactionClient,
  sourceTable: string,
  targetType: string,
  targetId: string,
) {
  const key = await target.migrationSourceKey.findFirst({
    where: { sourceSystem: SOURCE_SYSTEM, sourceTable, targetType, targetId },
    orderBy: { createdAt: 'desc' },
    select: { sourceId: true },
  });
  return key?.sourceId ?? null;
}

async function recordPilotTargetSourceKey(
  target: PrismaClient,
  input: {
    sourceTable: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    checksum: string;
  },
) {
  const phase = TABLE_PHASE[input.sourceTable as SourceTable];
  const batch = await target.migrationBatch.findFirst({
    where: { sourceSystem: SOURCE_SYSTEM, phase, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });
  if (!batch) throw new Error(`PILOT_BASELINE_BATCH_REQUIRED:${phase}`);
  await target.migrationSourceKey.upsert({
    where: {
      sourceSystem_sourceTable_sourceId_targetType: {
        sourceSystem: SOURCE_SYSTEM,
        sourceTable: input.sourceTable,
        sourceId: input.sourceId,
        targetType: input.targetType,
      },
    },
    create: {
      batchId: batch.id,
      sourceSystem: SOURCE_SYSTEM,
      sourceTable: input.sourceTable,
      sourceId: input.sourceId,
      targetType: input.targetType,
      targetId: input.targetId,
      recordChecksum: input.checksum,
      mappingVersion: batch.mappingVersion,
    },
    update: { targetId: input.targetId, recordChecksum: input.checksum },
  });
}

async function applyPurchaseToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  payload: Record<string, unknown>,
) {
  const purchase = await target.pembelian.findUnique({
    where: { id: aggregateId },
    include: { customerPackage: true },
  });
  if (!purchase) throw new Error('PILOT_PURCHASE_NOT_FOUND');
  const [userId, packageId, branchId] = await Promise.all([
    sourceIdForTarget(target, 'users', 'User', purchase.userId),
    sourceIdForTarget(target, 'pakets', 'Package', purchase.packageId),
    sourceIdForTarget(target, 'locations', 'Branch', purchase.branchId),
  ]);
  if (!userId || !packageId || !branchId) throw new Error('PILOT_PURCHASE_MAPPING_REQUIRED');
  const expiry =
    purchase.customerPackage?.expiryAt ??
    new Date(purchase.submittedAt.getTime() + purchase.durationDaysSnapshot * 86_400_000);
  if (textValue(payload.status) !== 'AWAITING_PAYMENT')
    throw new Error('PILOT_PURCHASE_CREATE_FACT_INVALID');
  await v1tx.$executeRawUnsafe(
    'INSERT INTO order_pakets (id_user,id_paket,harga,status,is_active,expired_date,created_at,updated_at,deleted_at,tanggal_pembayaran,bukti_pembayaran,jumlah_pertemuan,sisa,id_location,unix_code,metode_pembayaran) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    Number(userId),
    Number(packageId),
    purchase.priceAfterDiscountRpSnapshot ?? purchase.priceRpSnapshot,
    0,
    0,
    expiry,
    purchase.submittedAt,
    purchase.decidedAt ?? purchase.submittedAt,
    purchase.historical ? (purchase.sourceDeletedAt ?? new Date()) : null,
    purchase.decidedAt,
    null,
    purchase.sessionCountSnapshot,
    0,
    Number(branchId),
    purchase.paymentUniqueCode?.toString() ?? null,
    'migration-pilot-v2',
  );
  const id = await v1tx.$queryRawUnsafe<Array<{ id: bigint | number }>>(
    'SELECT LAST_INSERT_ID() AS id',
  );
  return { sourceTable: 'order_pakets', sourceId: String(id[0]!.id), targetType: 'Purchase' };
}

async function syncPurchaseDecisionToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  payload: Record<string, unknown>,
) {
  const purchase = await target.pembelian.findUnique({
    where: { id: aggregateId },
    include: { customerPackage: true },
  });
  if (!purchase) throw new Error('PILOT_PURCHASE_NOT_FOUND');
  const sourceId = await sourceIdForTarget(target, 'order_pakets', 'Purchase', aggregateId);
  if (!sourceId) throw new Error('PILOT_PURCHASE_SOURCE_MAPPING_REQUIRED');
  const factStatus = textValue(payload.status);
  const status = factStatus === 'APPROVED' ? 1 : factStatus === 'REJECTED' ? 2 : 0;
  const active = factStatus === 'APPROVED' ? 1 : 0;
  const openingBalance = factStatus === 'APPROVED' ? intValue(payload.sessionCount, -1) : 0;
  if (openingBalance < 0) throw new Error('PILOT_PURCHASE_DECISION_FACT_INVALID');
  const changed = await v1tx.$executeRawUnsafe(
    'UPDATE order_pakets SET status = ?, is_active = ?, sisa = ?, expired_date = COALESCE(?, expired_date), tanggal_pembayaran = ?, updated_at = ? WHERE id = ?',
    status,
    active,
    openingBalance,
    purchase.customerPackage?.expiryAt ?? null,
    purchase.decidedAt,
    purchase.decidedAt ?? new Date(),
    Number(sourceId),
  );
  if (changed !== 1) throw new Error('PILOT_PURCHASE_UPDATE_MISMATCH');
  return { sourceTable: 'order_pakets', sourceId, targetType: 'Purchase' };
}

async function applyBookingCreateToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
) {
  const booking = await target.pemesananKelas.findUnique({ where: { id: aggregateId } });
  if (!booking) throw new Error('PILOT_BOOKING_NOT_FOUND');
  const [userId, activityId] = await Promise.all([
    sourceIdForTarget(target, 'users', 'User', booking.customerUserId),
    sourceIdForTarget(target, 'kelas_activities', 'ClassSlot', booking.classSlotId),
  ]);
  if (!userId || !activityId) throw new Error('PILOT_BOOKING_MAPPING_REQUIRED');
  await v1tx.$executeRawUnsafe(
    'INSERT INTO booking_kelas (id_user,id_kelas_activity,is_send_email,status_kehadiran,created_at,updated_at,deleted_at,keterangan,review,rating) VALUES (?,?,?,?,?,?,?,?,?,?)',
    Number(userId),
    Number(activityId),
    0,
    null,
    booking.createdAt,
    booking.updatedAt,
    null,
    'migration-pilot-v2',
    null,
    null,
  );
  const id = await v1tx.$queryRawUnsafe<Array<{ id: bigint | number }>>(
    'SELECT LAST_INSERT_ID() AS id',
  );
  return { sourceTable: 'booking_kelas', sourceId: String(id[0]!.id), targetType: 'Booking' };
}

async function applyBookingCancelToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
) {
  const sourceId = await sourceIdForTarget(target, 'booking_kelas', 'Booking', aggregateId);
  if (!sourceId) throw new Error('PILOT_BOOKING_SOURCE_MAPPING_REQUIRED');
  const changed = await v1tx.$executeRawUnsafe(
    'UPDATE booking_kelas SET deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP, keterangan = COALESCE(keterangan, ?) WHERE id = ?',
    'migration-pilot-v2-cancel',
    Number(sourceId),
  );
  if (changed !== 1) throw new Error('PILOT_BOOKING_UPDATE_MISMATCH');
  return { sourceTable: 'booking_kelas', sourceId, targetType: 'Booking' };
}

async function syncBookingRescheduleToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  operation: string,
) {
  const bookingSourceId = await sourceIdForTarget(target, 'booking_kelas', 'Booking', aggregateId);
  if (!bookingSourceId) throw new Error('PILOT_BOOKING_SOURCE_MAPPING_REQUIRED');
  if (operation === 'RESCHEDULE_APPROVE') {
    const booking = await target.pemesananKelas.findUnique({ where: { id: aggregateId } });
    if (!booking) throw new Error('PILOT_BOOKING_NOT_FOUND');
    const slotSourceId = await sourceIdForTarget(
      target,
      'kelas_activities',
      'ClassSlot',
      booking.classSlotId,
    );
    if (!slotSourceId) throw new Error('PILOT_RESCHEDULE_SLOT_MAPPING_REQUIRED');
    const changed = await v1tx.$executeRawUnsafe(
      'UPDATE booking_kelas SET id_kelas_activity = ?, updated_at = CURRENT_TIMESTAMP, keterangan = COALESCE(keterangan, ?) WHERE id = ?',
      Number(slotSourceId),
      'migration-pilot-v2-reschedule',
      Number(bookingSourceId),
    );
    if (changed !== 1) throw new Error('PILOT_RESCHEDULE_UPDATE_MISMATCH');
  }
  return { sourceTable: 'booking_kelas', sourceId: bookingSourceId, targetType: 'Booking' };
}

async function applySessionAdjustmentToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  operation: string,
  payload: Record<string, unknown>,
) {
  const adjustment = await target.penyesuaianSesi.findUnique({
    where: { id: aggregateId },
    include: { customerPackage: true },
  });
  if (!adjustment) throw new Error('PILOT_SESSION_ADJUSTMENT_NOT_FOUND');
  const orderSourceId = await sourceIdForTarget(
    target,
    'order_pakets',
    'Purchase',
    adjustment.customerPackage.purchaseId,
  );
  if (!orderSourceId) throw new Error('PILOT_SESSION_ADJUSTMENT_MAPPING_REQUIRED');
  if (operation === 'POST') {
    const quantity = intValue(payload.quantity);
    if (!quantity) throw new Error('PILOT_SESSION_ADJUSTMENT_FACT_INVALID');
    const changed = await v1tx.$executeRawUnsafe(
      'UPDATE order_pakets SET sisa = sisa + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND sisa + ? >= 0',
      quantity,
      Number(orderSourceId),
      quantity,
    );
    if (changed !== 1) throw new Error('PILOT_SESSION_ADJUSTMENT_UPDATE_MISMATCH');
  }
  return { sourceTable: 'order_pakets', sourceId: orderSourceId, targetType: 'Purchase' };
}

async function applyVoucherRedemptionToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
) {
  const redemption = await target.penukaranVoucher.findUnique({
    where: { id: aggregateId },
    include: { voucher: true },
  });
  if (!redemption) throw new Error('PILOT_VOUCHER_REDEMPTION_NOT_FOUND');
  const [voucherSourceId, customerSourceId, orderSourceId] = await Promise.all([
    sourceIdForTarget(target, 'vouchers', 'Voucher', redemption.voucherId),
    sourceIdForTarget(target, 'users', 'User', redemption.customerUserId),
    sourceIdForTarget(target, 'order_pakets', 'Purchase', redemption.purchaseId),
  ]);
  if (!voucherSourceId || !customerSourceId || !orderSourceId)
    throw new Error('PILOT_VOUCHER_REDEMPTION_MAPPING_REQUIRED');
  await v1tx.$executeRawUnsafe(
    'INSERT INTO voucher_customers (id_voucher,id_customer,status,expired,status_digunakan,tanggal_digunakan,created_at,updated_at,deleted_at,id_order_paket) VALUES (?,?,?,?,?,?,?,?,?,?)',
    Number(voucherSourceId),
    Number(customerSourceId),
    1,
    redemption.voucher.activeUntil ?? new Date('2099-12-31T00:00:00.000Z'),
    redemption.releasedAt ? 0 : 1,
    redemption.releasedAt ? null : redemption.redeemedAt,
    redemption.redeemedAt,
    redemption.releasedAt ?? redemption.redeemedAt,
    redemption.releasedAt,
    Number(orderSourceId),
  );
  const id = await v1tx.$queryRawUnsafe<Array<{ id: bigint | number }>>(
    'SELECT LAST_INSERT_ID() AS id',
  );
  return {
    sourceTable: 'voucher_customers',
    sourceId: String(id[0]!.id),
    targetType: 'VoucherRedemption',
  };
}

async function applyAttendanceToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
) {
  const attendance = await target.kehadiranPelanggan.findUnique({
    where: { id: aggregateId },
    include: { booking: true },
  });
  if (!attendance) throw new Error('PILOT_ATTENDANCE_NOT_FOUND');
  const [bookingSourceId, userId, branchId, orderId] = await Promise.all([
    sourceIdForTarget(target, 'booking_kelas', 'Booking', attendance.bookingId),
    sourceIdForTarget(target, 'users', 'User', attendance.booking.customerUserId),
    sourceIdForTarget(target, 'locations', 'Branch', attendance.booking.branchId),
    target.paketPelanggan
      .findUnique({
        where: { id: attendance.booking.customerPackageId },
        select: { purchaseId: true },
      })
      .then((item) =>
        item ? sourceIdForTarget(target, 'order_pakets', 'Purchase', item.purchaseId) : null,
      ),
  ]);
  if (!bookingSourceId || !userId || !branchId || !orderId)
    throw new Error('PILOT_ATTENDANCE_MAPPING_REQUIRED');
  const bookingChanged = await v1tx.$executeRawUnsafe(
    'UPDATE booking_kelas SET status_kehadiran = 1, updated_at = ? WHERE id = ?',
    attendance.checkedInAt,
    Number(bookingSourceId),
  );
  if (bookingChanged !== 1) throw new Error('PILOT_ATTENDANCE_BOOKING_MISMATCH');
  const balanceChanged = await v1tx.$executeRawUnsafe(
    'UPDATE order_pakets SET sisa = sisa - 1, updated_at = ? WHERE id = ? AND sisa > 0',
    attendance.checkedInAt,
    Number(orderId),
  );
  if (balanceChanged !== 1) throw new Error('PILOT_ATTENDANCE_BALANCE_MISMATCH');
  await v1tx.$executeRawUnsafe(
    'INSERT INTO check_in_outs (id_user,jadwal,status,id_location,id_order_paket,created_at,updated_at,deleted_at,id_booking_kelas) VALUES (?,?,?,?,?,?,?,?,?)',
    Number(userId),
    attendance.checkedInAt,
    1,
    Number(branchId),
    Number(orderId),
    attendance.checkedInAt,
    attendance.checkedInAt,
    null,
    Number(bookingSourceId),
  );
  const id = await v1tx.$queryRawUnsafe<Array<{ id: bigint | number }>>(
    'SELECT LAST_INSERT_ID() AS id',
  );
  return {
    sourceTable: 'check_in_outs',
    sourceId: String(id[0]!.id),
    targetType: 'CustomerAttendance',
  };
}

function pilotMediaPrefix(): string {
  const prefix = required(process.env.V1_SHARED_MEDIA_PREFIX, 'V1_SHARED_MEDIA_PREFIX_REQUIRED');
  if (prefix.startsWith('/') || prefix.includes('..') || !/^[a-zA-Z0-9/_-]+$/u.test(prefix))
    throw new Error('V1_SHARED_MEDIA_PREFIX_INVALID');
  return prefix.replace(/\/+$/u, '');
}

function pilotMediaExtension(mimeType: string): string {
  const extension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  };
  const value = extension[mimeType];
  if (!value) throw new Error('PILOT_MEDIA_MIME_UNSUPPORTED');
  return value;
}

function mediaPayload(payload: Record<string, unknown>) {
  const checksum = typeof payload.checksum === 'string' ? payload.checksum.toLowerCase() : '';
  const mimeType = typeof payload.mimeType === 'string' ? payload.mimeType : '';
  const sizeBytes = Number(payload.sizeBytes);
  const kind = typeof payload.kind === 'string' ? payload.kind : '';
  if (!/^[a-f0-9]{64}$/u.test(checksum) || !Number.isInteger(sizeBytes) || sizeBytes < 1 || !kind)
    throw new Error('PILOT_MEDIA_PAYLOAD_INVALID');
  return { checksum, mimeType, sizeBytes, kind };
}

async function preparePilotMediaAlias(
  target: PrismaClient,
  event: {
    eventKey: string;
    branchId: string;
    aggregateType: string;
    aggregateId: string;
    operation: string;
  },
  payload: Record<string, unknown>,
) {
  if (event.aggregateType === 'PaymentProof' && event.operation === 'ATTACH_TO_PURCHASE') {
    const existing = await target.migrationPilotMediaAlias.findFirst({
      where: {
        branchId: event.branchId,
        targetType: 'PaymentProof',
        targetId: event.aggregateId,
        status: { in: ['PREPARED', 'ACTIVE'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!existing) throw new Error('PILOT_MEDIA_ALIAS_REQUIRED');
    return existing;
  }
  const supported =
    (event.aggregateType === 'PaymentProof' && event.operation === 'FINALIZE') ||
    (event.aggregateType === 'IdentityDocument' &&
      ['FINALIZE_REPLACEMENT', 'APPROVE'].includes(event.operation));
  if (!supported) return null;
  const metadata = mediaPayload(payload);
  const targetMedia =
    event.aggregateType === 'PaymentProof'
      ? await target.buktiPembayaran.findUnique({
          where: { id: event.aggregateId },
          select: {
            id: true,
            branchId: true,
            objectKey: true,
            mimeType: true,
            sizeBytes: true,
            uploadStatus: true,
            scanStatus: true,
          },
        })
      : await target.dokumenVerifikasiIdentitas.findUnique({
          where: { id: event.aggregateId },
          select: {
            id: true,
            objectKey: true,
            mimeType: true,
            sizeBytes: true,
            uploadStatus: true,
            scanStatus: true,
          },
        });
  if (!targetMedia?.objectKey) throw new Error('PILOT_MEDIA_OBJECT_MISSING');
  if (targetMedia.uploadStatus !== 'FINALIZED' || targetMedia.scanStatus !== 'CLEAN')
    throw new Error('PILOT_MEDIA_NOT_READY');
  if (targetMedia.mimeType !== metadata.mimeType) throw new Error('PILOT_MEDIA_MIME_MISMATCH');
  if (targetMedia.sizeBytes !== metadata.sizeBytes) throw new Error('PILOT_MEDIA_SIZE_MISMATCH');
  if ('branchId' in targetMedia && targetMedia.branchId !== event.branchId)
    throw new Error('PILOT_MEDIA_BRANCH_MISMATCH');
  const aliasReference = `rb_${event.eventKey.slice(0, 32)}.${pilotMediaExtension(metadata.mimeType)}`;
  const prefix = pilotMediaPrefix();
  const aliasKey = `${prefix}/${aliasReference}`;
  const root = resolvePrivateUploadRoot(
    required(process.env.PRIVATE_UPLOAD_ROOT, 'PRIVATE_UPLOAD_ROOT_REQUIRED'),
  );
  const alias = await target.migrationPilotMediaAlias.upsert({
    where: { eventKey: event.eventKey },
    create: {
      eventKey: event.eventKey,
      branchId: event.branchId,
      targetType: event.aggregateType,
      targetId: event.aggregateId,
      mediaKind: metadata.kind,
      aliasReference,
      checksum: metadata.checksum,
      mimeType: metadata.mimeType,
      sizeBytes: metadata.sizeBytes,
      status: 'PREPARED',
      attempts: 1,
    },
    update: { status: 'PREPARED', attempts: { increment: 1 }, failureCode: null },
  });
  if (
    alias.targetType !== event.aggregateType ||
    alias.targetId !== event.aggregateId ||
    alias.aliasReference !== aliasReference ||
    alias.checksum !== metadata.checksum ||
    alias.mimeType !== metadata.mimeType ||
    alias.sizeBytes !== metadata.sizeBytes
  )
    throw new Error('PILOT_MEDIA_ALIAS_MISMATCH');
  await createPrivateFileAlias(root, {
    sourceKey: targetMedia.objectKey,
    aliasKey,
    expectedChecksum: metadata.checksum,
    expectedSizeBytes: metadata.sizeBytes,
  });
  return alias;
}

async function applyPaymentProofReferenceToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  payload: Record<string, unknown>,
) {
  const purchaseId = typeof payload.purchaseId === 'string' ? payload.purchaseId : '';
  const sourceOrderId = await sourceIdForTarget(target, 'order_pakets', 'Purchase', purchaseId);
  const alias = await target.migrationPilotMediaAlias.findFirst({
    where: {
      targetType: 'PaymentProof',
      targetId: aggregateId,
      status: { in: ['PREPARED', 'ACTIVE'] },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!sourceOrderId || !alias) throw new Error('PILOT_MEDIA_MAPPING_REQUIRED');
  const changed = await v1tx.$executeRawUnsafe(
    'UPDATE order_pakets SET bukti_pembayaran = ?, updated_at = ? WHERE id = ?',
    alias.aliasReference,
    new Date(),
    Number(sourceOrderId),
  );
  if (changed !== 1) throw new Error('PILOT_PAYMENT_PROOF_UPDATE_MISMATCH');
  return { sourceTable: 'order_pakets', sourceId: sourceOrderId, targetType: 'PaymentProof' };
}

async function applyIdentityDocumentReferenceToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  payload: Record<string, unknown>,
) {
  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  const kind = payload.kind;
  const sourceUserId = await sourceIdForTarget(target, 'users', 'User', userId);
  const alias = await target.migrationPilotMediaAlias.findFirst({
    where: {
      targetType: 'IdentityDocument',
      targetId: aggregateId,
      status: { in: ['PREPARED', 'ACTIVE'] },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!sourceUserId || !alias || !['KTP_FRONT', 'SELFIE'].includes(String(kind)))
    throw new Error('PILOT_IDENTITY_MEDIA_MAPPING_REQUIRED');
  const column = kind === 'KTP_FRONT' ? 'ktp' : 'selfie';
  const changed = await v1tx.$executeRawUnsafe(
    `UPDATE users SET ${column} = ?, updated_at = ? WHERE id = ?`,
    alias.aliasReference,
    new Date(),
    Number(sourceUserId),
  );
  if (changed !== 1) throw new Error('PILOT_IDENTITY_MEDIA_UPDATE_MISMATCH');
  return { sourceTable: 'users', sourceId: sourceUserId, targetType: 'IdentityDocument' };
}

async function applyCustomerProfileToV1(
  v1tx: Prisma.TransactionClient,
  target: PrismaClient,
  aggregateId: string,
  payload: Record<string, unknown>,
) {
  const displayName = typeof payload.displayName === 'string' ? payload.displayName.trim() : '';
  const preferredBranchId =
    typeof payload.preferredBranchId === 'string' ? payload.preferredBranchId : '';
  const [sourceUserId, sourceBranchId] = await Promise.all([
    sourceIdForTarget(target, 'users', 'User', aggregateId),
    sourceIdForTarget(target, 'locations', 'Branch', preferredBranchId),
  ]);
  if (!displayName || !sourceUserId || !sourceBranchId)
    throw new Error('PILOT_PROFILE_MAPPING_REQUIRED');
  const changed = await v1tx.$executeRawUnsafe(
    'UPDATE users SET name = ?, id_location = ?, updated_at = ? WHERE id = ?',
    displayName,
    Number(sourceBranchId),
    new Date(),
    Number(sourceUserId),
  );
  if (changed !== 1) throw new Error('PILOT_PROFILE_UPDATE_MISMATCH');
  return { sourceTable: 'users', sourceId: sourceUserId, targetType: 'User' };
}

async function pilotOutboxStatus(target: PrismaClient, args: Args) {
  const sourceBranchId = required(
    typeof args['source-branch'] === 'string' ? args['source-branch'] : undefined,
    'SOURCE_BRANCH_REQUIRED',
  );
  const branchId = await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
  if (!branchId) throw new Error('DELTA_BRANCH_NOT_MAPPED');
  const [counts, firstPending, last, aliasCounts] = await Promise.all([
    target.migrationPilotOutbox.groupBy({
      by: ['status'],
      where: { branchId },
      _count: { _all: true },
    }),
    target.migrationPilotOutbox.findFirst({
      where: { branchId, status: { in: ['PENDING', 'FAILED'] } },
      orderBy: { sequence: 'asc' },
      select: { sequence: true, occurredAt: true },
    }),
    target.migrationPilotOutbox.findFirst({
      where: { branchId },
      orderBy: { sequence: 'desc' },
      select: { sequence: true },
    }),
    target.migrationPilotMediaAlias.groupBy({
      by: ['status'],
      where: { branchId },
      _count: { _all: true },
    }),
  ]);
  return {
    sourceBranchId,
    counts: Object.fromEntries(counts.map((item) => [item.status, item._count._all])),
    firstPendingSequence: firstPending?.sequence.toString() ?? null,
    firstPendingAt: firstPending?.occurredAt ?? null,
    highWaterSequence: last?.sequence.toString() ?? null,
    mediaAliases: Object.fromEntries(aliasCounts.map((item) => [item.status, item._count._all])),
  };
}

async function applyPilotOutbox(target: PrismaClient, args: Args) {
  if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
    throw new Error('MIGRATION_WRITES_NOT_ENABLED');
  const sourceBranchId = required(
    typeof args['source-branch'] === 'string' ? args['source-branch'] : undefined,
    'SOURCE_BRANCH_REQUIRED',
  );
  const branchId = await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
  if (!branchId) throw new Error('DELTA_BRANCH_NOT_MAPPED');
  const highWater =
    typeof args['high-water-order'] === 'string' ? BigInt(args['high-water-order']) : null;
  const events = await target.migrationPilotOutbox.findMany({
    where: {
      branchId,
      status: { in: ['PENDING', 'FAILED'] },
      ...(highWater === null ? {} : { sequence: { lte: highWater } }),
    },
    orderBy: { sequence: 'asc' },
  });
  return pilotAdapter(target, async (v1) => {
    let applied = 0;
    let replayed = 0;
    for (const event of events) {
      let mediaAliasId: string | null = null;
      try {
        if (event.attempts >= 5) throw new Error('PILOT_OUTBOX_RETRY_EXHAUSTED');
        const payload = decryptDeltaPayload<Record<string, unknown>>(
          {
            ciphertext: event.payloadCiphertext,
            iv: event.payloadIv,
            authTag: event.payloadAuthTag,
            keyVersion: event.payloadKeyVersion,
          },
          deltaEncryptionKey(),
        );
        if (recordChecksum(payload) !== event.payloadChecksum)
          throw new Error('PILOT_OUTBOX_PAYLOAD_CHECKSUM_MISMATCH');
        const mediaAlias = await preparePilotMediaAlias(target, event, payload);
        mediaAliasId = mediaAlias?.id ?? null;
        if (
          mediaAlias &&
          process.env.MIGRATION_INTEGRATION_TEST === 'true' &&
          process.env.MIGRATION_TEST_CRASH_AFTER_MEDIA_ALIAS === 'true'
        )
          throw new Error('PILOT_TEST_CRASH_AFTER_MEDIA_ALIAS');
        const receipt = await v1.$queryRawUnsafe<ReplayReceiptRow[]>(
          'SELECT event_key,payload_checksum,status,source_table,source_id FROM migration_pilot_replay_receipts WHERE event_key = ? LIMIT 1',
          event.eventKey,
        );
        let mapping: { sourceTable: string; sourceId: string; targetType: string } | null = null;
        if (receipt[0]) {
          if (receipt[0].payload_checksum !== event.payloadChecksum)
            throw new Error('PILOT_OUTBOX_REPLAY_MISMATCH');
          if (receipt[0].status !== 'APPLIED') throw new Error('PILOT_OUTBOX_RECEIPT_NOT_APPLIED');
          if (receipt[0].source_table && receipt[0].source_id)
            mapping = {
              sourceTable: receipt[0].source_table,
              sourceId: receipt[0].source_id,
              targetType: event.aggregateType,
            };
          replayed += 1;
        } else {
          mapping = await v1.$transaction(async (v1tx) => {
            let result: { sourceTable: string; sourceId: string; targetType: string } | null;
            if (event.aggregateType === 'Purchase' && event.operation === 'CREATE')
              result = await applyPurchaseToV1(v1tx, target, event.aggregateId, payload);
            else if (event.aggregateType === 'Purchase' && event.operation === 'DECIDE')
              result = await syncPurchaseDecisionToV1(v1tx, target, event.aggregateId, payload);
            else if (event.aggregateType === 'Booking' && event.operation === 'CREATE')
              result = await applyBookingCreateToV1(v1tx, target, event.aggregateId);
            else if (event.aggregateType === 'Booking' && event.operation === 'CANCEL')
              result = await applyBookingCancelToV1(v1tx, target, event.aggregateId);
            else if (
              event.aggregateType === 'Booking' &&
              ['RESCHEDULE_REQUEST', 'RESCHEDULE_REJECT', 'RESCHEDULE_APPROVE'].includes(
                event.operation,
              )
            )
              result = await syncBookingRescheduleToV1(
                v1tx,
                target,
                event.aggregateId,
                event.operation,
              );
            else if (event.aggregateType === 'CustomerAttendance' && event.operation === 'CHECK_IN')
              result = await applyAttendanceToV1(v1tx, target, event.aggregateId);
            else if (
              event.aggregateType === 'SessionAdjustment' &&
              ['REQUEST', 'POST', 'REJECT'].includes(event.operation)
            )
              result = await applySessionAdjustmentToV1(
                v1tx,
                target,
                event.aggregateId,
                event.operation,
                payload,
              );
            else if (event.aggregateType === 'VoucherRedemption' && event.operation === 'REDEEM')
              result = await applyVoucherRedemptionToV1(v1tx, target, event.aggregateId);
            else if (
              event.aggregateType === 'PaymentProof' &&
              event.operation === 'ATTACH_TO_PURCHASE'
            )
              result = await applyPaymentProofReferenceToV1(
                v1tx,
                target,
                event.aggregateId,
                payload,
              );
            else if (event.aggregateType === 'IdentityDocument' && event.operation === 'APPROVE')
              result = await applyIdentityDocumentReferenceToV1(
                v1tx,
                target,
                event.aggregateId,
                payload,
              );
            else if (
              (event.aggregateType === 'PaymentProof' && event.operation === 'FINALIZE') ||
              (event.aggregateType === 'IdentityDocument' &&
                event.operation === 'FINALIZE_REPLACEMENT')
            )
              result = null;
            else if (event.aggregateType === 'CustomerProfile' && event.operation === 'UPDATE')
              result = await applyCustomerProfileToV1(v1tx, target, event.aggregateId, payload);
            else throw new Error('PILOT_OUTBOX_HANDLER_REQUIRED');
            await v1tx.$executeRawUnsafe(
              'INSERT INTO migration_pilot_replay_receipts (event_key,aggregate_type,aggregate_id,operation,payload_checksum,source_table,source_id,status,attempts,correlation_id,applied_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
              event.eventKey,
              event.aggregateType,
              event.aggregateId,
              event.operation,
              event.payloadChecksum,
              result?.sourceTable ?? null,
              result?.sourceId ?? null,
              'APPLIED',
              event.attempts + 1,
              event.correlationId,
              new Date(),
              new Date(),
              new Date(),
            );
            return result;
          });
          applied += 1;
        }
        if (
          process.env.MIGRATION_INTEGRATION_TEST === 'true' &&
          process.env.MIGRATION_TEST_CRASH_AFTER_V1_RECEIPT === 'true'
        )
          throw new Error('PILOT_TEST_CRASH_AFTER_V1_RECEIPT');
        if (mapping && !['PaymentProof', 'IdentityDocument'].includes(mapping.targetType))
          await recordPilotTargetSourceKey(target, {
            ...mapping,
            targetId: event.aggregateId,
            checksum: event.payloadChecksum,
          });
        await target.migrationPilotOutbox.update({
          where: { id: event.id },
          data: {
            status: 'APPLIED_TO_V1',
            attempts: { increment: 1 },
            appliedToV1At: new Date(),
            failureCode: null,
          },
        });
        if (mediaAliasId)
          await target.migrationPilotMediaAlias.update({
            where: { id: mediaAliasId },
            data: {
              status: 'ACTIVE',
              activatedAt: new Date(),
              failureCode: null,
            },
          });
      } catch (error) {
        const failureCode = safeFailureCode(error, 'PILOT_OUTBOX_APPLY_FAILED');
        if (mediaAliasId)
          await target.migrationPilotMediaAlias.update({
            where: { id: mediaAliasId },
            data: { status: 'FAILED', failureCode },
          });
        await target.migrationPilotOutbox.update({
          where: { id: event.id },
          data: { status: 'FAILED', attempts: { increment: 1 }, failureCode },
        });
        throw new Error(failureCode);
      }
    }
    return { applied, replayed, highWaterSequence: highWater?.toString() ?? null };
  });
}

async function verifyPilotOutbox(target: PrismaClient, args: Args) {
  const status = await pilotOutboxStatus(target, args);
  const pending = Number(status.counts.PENDING ?? 0) + Number(status.counts.FAILED ?? 0);
  const sourceBranchId = required(
    typeof args['source-branch'] === 'string' ? args['source-branch'] : undefined,
    'SOURCE_BRANCH_REQUIRED',
  );
  const branchId = await targetIdFor(target, 'locations', sourceBranchId, 'Branch');
  if (!branchId) throw new Error('DELTA_BRANCH_NOT_MAPPED');
  const appliedEvents = await target.migrationPilotOutbox.findMany({
    where: { branchId, status: 'APPLIED_TO_V1' },
    select: { eventKey: true, payloadChecksum: true },
    orderBy: { sequence: 'asc' },
  });
  const receiptVerification = await pilotAdapter(target, async (v1) => {
    let missing = 0;
    let mismatched = 0;
    for (const event of appliedEvents) {
      const receipts = await v1.$queryRawUnsafe<ReplayReceiptRow[]>(
        'SELECT event_key,payload_checksum,status,source_table,source_id FROM migration_pilot_replay_receipts WHERE event_key = ? LIMIT 1',
        event.eventKey,
      );
      if (!receipts[0]) missing += 1;
      else if (
        receipts[0].payload_checksum !== event.payloadChecksum ||
        receipts[0].status !== 'APPLIED'
      )
        mismatched += 1;
    }
    return { checked: appliedEvents.length, missing, mismatched };
  });
  const aliases = await target.migrationPilotMediaAlias.findMany({
    where: { branchId },
    select: {
      status: true,
      aliasReference: true,
      checksum: true,
      sizeBytes: true,
    },
  });
  let missingObjects = 0;
  let checksumMismatches = 0;
  const root = resolvePrivateUploadRoot(
    required(process.env.PRIVATE_UPLOAD_ROOT, 'PRIVATE_UPLOAD_ROOT_REQUIRED'),
  );
  const prefix = pilotMediaPrefix();
  for (const alias of aliases) {
    try {
      const inspected = await inspectPrivateFile(root, `${prefix}/${alias.aliasReference}`);
      if (inspected.checksum !== alias.checksum || inspected.sizeBytes !== alias.sizeBytes)
        checksumMismatches += 1;
    } catch {
      missingObjects += 1;
    }
  }
  const failedAliases = aliases.filter((alias) => alias.status === 'FAILED').length;
  const pendingAliases = aliases.filter((alias) => alias.status === 'PREPARED').length;
  return {
    ...status,
    receipts: receiptVerification,
    aliases: {
      checked: aliases.length,
      pending: pendingAliases,
      failed: failedAliases,
      missingObjects,
      checksumMismatches,
    },
    verified:
      pending === 0 &&
      pendingAliases === 0 &&
      failedAliases === 0 &&
      missingObjects === 0 &&
      checksumMismatches === 0 &&
      receiptVerification.missing === 0 &&
      receiptVerification.mismatched === 0,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'help';
  if (command === 'help') {
    console.log(
      'Commands: profile, rehearsal-preflight, gate, prepare --phase PHASE --dump FILE, import --batch ID --dump FILE, reconcile --batch ID, evidence --batch ID --output ABSOLUTE_DIR, resume --batch ID, rollback-report --batch ID, delta-capture --events FILE --gtid-set GTID --operator ID, delta-capture --source-binlog --from-gtid GTID_SET --spool-dir DIR --operator ID, delta-verify --operator ID, delta-import --operator ID, delta-status, delta-drain --source-branch ID --high-water-gtid GTID --high-water-order N, branch-cutover --source-branch ID --action ACTION --actor USER_ID --expected-version N, pilot-outbox-prepare, pilot-outbox-status --source-branch ID, pilot-outbox-verify --source-branch ID, pilot-outbox-apply --source-branch ID [--high-water-order N], pilot-outbox-drain --source-branch ID --high-water-order N',
    );
    return;
  }
  const targetUrl = required(process.env.DATABASE_URL, 'DATABASE_URL_REQUIRED');
  const needsSource =
    ['profile', 'rehearsal-preflight', 'gate', 'import', 'reconcile', 'evidence'].includes(
      command,
    ) ||
    (command === 'delta-capture' && args['source-binlog'] === true);
  const sourceUrl = needsSource
    ? required(process.env.V1_DATABASE_URL, 'V1_DATABASE_URL_REQUIRED')
    : process.env.V1_DATABASE_URL;
  if (sourceUrl) assertSeparateDatabases(sourceUrl, targetUrl);
  const source = sourceUrl ? new PrismaClient({ datasourceUrl: sourceUrl }) : null;
  const target = new PrismaClient({ datasourceUrl: targetUrl });
  try {
    if (command === 'profile') console.log(JSON.stringify(await profile(source!), null, 2));
    else if (command === 'rehearsal-preflight')
      console.log(JSON.stringify(await rehearsalPreflight(source!), null, 2));
    else if (command === 'gate') {
      migrationMediaMode();
      await assertTargetEmpty(target);
      const checksum = await verifyDump(args);
      const sourceProfile = await profile(source!);
      assertV1ColumnRegistry();
      if (
        required(process.env.V1_MAPPING_VERSION, 'V1_MAPPING_VERSION_REQUIRED') !==
        V1_MAPPING_VERSION
      )
        throw new Error('MAPPING_VERSION_CONTRACT_MISMATCH');
      if (
        sourceProfile.schema.missingTables.length ||
        sourceProfile.schema.unexpectedTables.length ||
        sourceProfile.schema.columnMismatches.length
      )
        throw new Error('SOURCE_SCHEMA_MISMATCH');
      console.log(
        JSON.stringify(
          {
            ok: true,
            checksum,
            sourceSchema: sourceProfile.schema,
            targetEmpty: true,
            mappingVersion: V1_MAPPING_VERSION,
            columnRegistry: {
              total: V1_COLUMN_REGISTRY.length,
              dispositions: summarizeV1ColumnRegistry(),
            },
          },
          null,
          2,
        ),
      );
    } else if (command === 'prepare') {
      if (process.env.MIGRATION_ALLOW_WRITES !== 'true')
        throw new Error('MIGRATION_WRITES_NOT_ENABLED');
      const checksum = await verifyDump(args);
      console.log(JSON.stringify(await prepareBatch(target, args, checksum), null, 2));
    } else if (command === 'import') {
      console.log(
        JSON.stringify(
          await runImport(
            source!,
            target,
            required(typeof args.batch === 'string' ? args.batch : undefined, 'BATCH_REQUIRED'),
            args,
          ),
          null,
          2,
        ),
      );
    } else if (command === 'reconcile') {
      console.log(
        JSON.stringify(
          await reconcile(
            source!,
            target,
            required(typeof args.batch === 'string' ? args.batch : undefined, 'BATCH_REQUIRED'),
          ),
          null,
          2,
        ),
      );
    } else if (command === 'resume') {
      const batch = await target.migrationBatch.findUnique({
        where: {
          id: required(typeof args.batch === 'string' ? args.batch : undefined, 'BATCH_REQUIRED'),
        },
        include: {
          _count: {
            select: { sourceKeys: true, rejects: true, controlTotals: true, resolutions: true },
          },
        },
      });
      if (!batch) throw new Error('BATCH_NOT_FOUND');
      console.log(JSON.stringify(batch, null, 2));
    } else if (command === 'rollback-report') {
      console.log(
        JSON.stringify(
          await rollbackReport(
            target,
            required(typeof args.batch === 'string' ? args.batch : undefined, 'BATCH_REQUIRED'),
          ),
          null,
          2,
        ),
      );
    } else if (command === 'evidence') {
      console.log(JSON.stringify(await writeRehearsalEvidence(source!, target, args), null, 2));
    } else if (command === 'delta-capture')
      console.log(
        JSON.stringify(
          args['source-binlog'] === true
            ? await captureSourceBinlog(source!, target, args)
            : await deltaCapture(target, args),
          null,
          2,
        ),
      );
    else if (command === 'delta-verify')
      console.log(JSON.stringify(await deltaVerify(target, args), null, 2));
    else if (command === 'delta-status')
      console.log(JSON.stringify(await deltaStatus(target), null, 2));
    else if (command === 'delta-import')
      console.log(JSON.stringify(await deltaImport(target, args), null, 2));
    else if (command === 'delta-drain')
      console.log(
        JSON.stringify(
          await deltaDrain(target, args),
          (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
          2,
        ),
      );
    else if (command === 'branch-cutover')
      console.log(
        JSON.stringify(
          await transitionBranchCutover(target, args),
          (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
          2,
        ),
      );
    else if (command === 'pilot-outbox-prepare')
      console.log(JSON.stringify(await preparePilotAdapter(target), null, 2));
    else if (command === 'pilot-outbox-status')
      console.log(JSON.stringify(await pilotOutboxStatus(target, args), null, 2));
    else if (command === 'pilot-outbox-verify')
      console.log(JSON.stringify(await verifyPilotOutbox(target, args), null, 2));
    else if (command === 'pilot-outbox-apply' || command === 'pilot-outbox-drain')
      console.log(JSON.stringify(await applyPilotOutbox(target, args), null, 2));
    else throw new Error('UNKNOWN_COMMAND');
  } finally {
    await Promise.all([source?.$disconnect(), target.$disconnect()]);
  }
}

export const migrationTestables = {
  safeFailureCode,
  stableJson,
  recordChecksum,
  deterministicId,
  normalizedIndonesianPhone,
  legacyJakartaDateTime,
  minuteOfDay,
  integerText,
  jsonInteger,
};

if (require.main === module)
  main().catch((error: unknown) => {
    const code = safeFailureCode(error, 'MIGRATION_COMMAND_FAILED');
    console.error(
      JSON.stringify({ ok: false, code, diagnostic: safeIntegrationDiagnostic(error) }),
    );
    process.exitCode = 1;
  });

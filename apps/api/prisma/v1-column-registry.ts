import schemaContract from './v1-schema-contract.json';

export const V1_MAPPING_VERSION = '2.0.0' as const;
export const V1_EXPECTED_TABLE_COUNT = 34;
export const V1_EXPECTED_COLUMN_COUNT = 309;

export type V1ColumnDisposition =
  | 'FIRST_CLASS'
  | 'ENCRYPTED_ARCHIVE'
  | 'DEFERRED_MEDIA'
  | 'EXPLICIT_IGNORE';

export type V1ColumnRegistryEntry = {
  sourceTable: string;
  sourceColumn: string;
  disposition: V1ColumnDisposition;
  target: string;
  reason: string;
};

const TABLE_TARGETS: Record<string, string> = {
  activity_log: 'AuditLog + MigrationLegacyPayload',
  booking_kelas: 'Booking + SessionReservation + BookingAttendanceOutcome + BookingFeedback',
  check_in_outs: 'CustomerAttendance',
  coas: 'AccountingAccount',
  customer_jadwal_statics: 'CustomerRecurringSchedule',
  customer_kelas: 'CustomerClassEnrollment',
  failed_jobs: 'none',
  jurnals: 'LegacyFinancialEntry',
  kelas: 'ClassType + ClassTypeBranchScope + ClassTypeBranchConfiguration',
  kelas_activities: 'ClassSlot',
  kelas_images: 'MigrationDeferredMediaReference',
  kelas_pakets: 'PackageClassTypeScope',
  kelas_pertamuans: 'legacy class-meeting projection',
  kelas_pertemuan_absensis: 'legacy class-meeting attendance projection',
  kelas_ratings: 'BookingFeedback',
  location_openings: 'BranchOpeningHour',
  location_studios: 'Studio',
  locations: 'Branch + BranchPublicProfile + PaymentAccount',
  migrations: 'none',
  model_has_permissions: 'AccessRoleCapability or UserCapabilityOverride',
  model_has_roles: 'UserRole + Assignment',
  notifications: 'UserNotification + MigrationLegacyPayload',
  order_pakets: 'Purchase + CustomerPackage + LedgerEntry',
  paket_locations: 'PackageBranchScope',
  pakets: 'Package + PackageRevision + PackageClassTypeScope',
  password_reset_tokens: 'none',
  permissions: 'Capability mapping',
  personal_access_tokens: 'none',
  roles: 'AccessRole mapping',
  role_has_permissions: 'AccessRoleCapability',
  ruangans: 'Room',
  users: 'User + UserProfile + Identity + PasswordCredential + UserContactAlias',
  voucher_customers: 'CustomerVoucherEntitlement + VoucherRedemption',
  voucher_pakets: 'VoucherPackageScope',
  vouchers: 'Voucher',
};

const IGNORED_TABLES = new Set([
  'failed_jobs',
  'migrations',
  'password_reset_tokens',
  'personal_access_tokens',
]);

const DEFERRED_MEDIA_COLUMNS = new Set([
  'customer_kelas.bukti_bayar',
  'jurnals.struk',
  'kelas_images.image',
  'location_studios.image',
  'locations.image',
  'order_pakets.bukti_pembayaran',
  'users.foto',
  'users.ktp',
  'users.selfie',
  'vouchers.image',
]);

const ENCRYPTED_ARCHIVE_COLUMNS = new Set([
  'activity_log.properties',
  'notifications.data',
]);

const EXPLICIT_IGNORES: Record<string, string> = {
  'users.remember_token': 'Session/token v1 tidak boleh dipindahkan.',
};

function dispositionFor(table: string, column: string): V1ColumnDisposition {
  const key = `${table}.${column}`;
  if (DEFERRED_MEDIA_COLUMNS.has(key)) return 'DEFERRED_MEDIA';
  if (ENCRYPTED_ARCHIVE_COLUMNS.has(key)) return 'ENCRYPTED_ARCHIVE';
  if (IGNORED_TABLES.has(table) || key in EXPLICIT_IGNORES) {
    return 'EXPLICIT_IGNORE';
  }
  return 'FIRST_CLASS';
}

function reasonFor(table: string, column: string, disposition: V1ColumnDisposition): string {
  const key = `${table}.${column}`;
  if (disposition === 'DEFERRED_MEDIA') {
    return 'Mode database-only: referensi legacy dienkripsi dan file tidak dibaca atau diaktifkan.';
  }
  if (disposition === 'ENCRYPTED_ARCHIVE') {
    return 'Payload sumber wajib dipertahankan terenkripsi; projection aman tetap dapat dicari.';
  }
  if (disposition === 'EXPLICIT_IGNORE') {
    return EXPLICIT_IGNORES[key] ?? 'Data framework/runtime v1 tidak mempunyai arti bisnis di v2.';
  }
  return 'Dipetakan sebagai data bisnis first-class; mapper wajib mempertahankan nilai atau membuat resolution.';
}

export const V1_COLUMN_REGISTRY: readonly V1ColumnRegistryEntry[] = Object.entries(
  schemaContract.tables,
).flatMap(([sourceTable, definition]) =>
  definition.columns.map((sourceColumn) => {
    const disposition = dispositionFor(sourceTable, sourceColumn);
    return {
      sourceTable,
      sourceColumn,
      disposition,
      target:
        disposition === 'EXPLICIT_IGNORE'
          ? 'none'
          : disposition === 'DEFERRED_MEDIA'
            ? 'MigrationDeferredMediaReference'
            : TABLE_TARGETS[sourceTable] ?? 'UNMAPPED_TABLE',
      reason: reasonFor(sourceTable, sourceColumn, disposition),
    };
  }),
);

export function assertV1ColumnRegistry(): void {
  const sourceTables = Object.keys(schemaContract.tables);
  if (sourceTables.length !== V1_EXPECTED_TABLE_COUNT) {
    throw new Error(
      `V1_COLUMN_REGISTRY_TABLE_COUNT_MISMATCH:${sourceTables.length}:${V1_EXPECTED_TABLE_COUNT}`,
    );
  }
  if (V1_COLUMN_REGISTRY.length !== V1_EXPECTED_COLUMN_COUNT) {
    throw new Error(
      `V1_COLUMN_REGISTRY_COLUMN_COUNT_MISMATCH:${V1_COLUMN_REGISTRY.length}:${V1_EXPECTED_COLUMN_COUNT}`,
    );
  }

  const keys = new Set<string>();
  for (const entry of V1_COLUMN_REGISTRY) {
    const key = `${entry.sourceTable}.${entry.sourceColumn}`;
    if (keys.has(key)) throw new Error(`V1_COLUMN_REGISTRY_DUPLICATE:${key}`);
    if (entry.target === 'UNMAPPED_TABLE') throw new Error(`V1_COLUMN_REGISTRY_UNMAPPED:${key}`);
    keys.add(key);
  }
}

export function summarizeV1ColumnRegistry(): Record<V1ColumnDisposition, number> {
  return V1_COLUMN_REGISTRY.reduce<Record<V1ColumnDisposition, number>>(
    (summary, entry) => {
      summary[entry.disposition] += 1;
      return summary;
    },
    { FIRST_CLASS: 0, ENCRYPTED_ARCHIVE: 0, DEFERRED_MEDIA: 0, EXPLICIT_IGNORE: 0 },
  );
}

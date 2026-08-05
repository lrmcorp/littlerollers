import type { ApplicationRole } from '@prisma/client';
import { ROLE_CAPABILITIES } from '../../src/identity/role-capabilities';
import type { SeedContext } from './context';

type CapabilitySeed = {
  key: string;
  label: string;
  category: string;
  sensitive?: boolean;
  systemOnly?: boolean;
  globalOnly?: boolean;
};

const capabilities: CapabilitySeed[] = [
  ['assignment:manage', 'Kelola assignment', 'ASSIGNMENT', true],
  ['assignment:read', 'Lihat assignment', 'ASSIGNMENT'],
  ['attendance:manage', 'Kelola attendance', 'ATTENDANCE', true],
  ['attendance:read', 'Lihat attendance', 'ATTENDANCE'],
  ['attendance:self', 'Attendance sendiri', 'ATTENDANCE'],
  ['audit:read', 'Lihat audit', 'AUDIT', true],
  ['availability:self:create', 'Buat availability sendiri', 'CLASS'],
  ['availability:self:read', 'Lihat availability sendiri', 'CLASS'],
  ['booking:create:assisted', 'Buat booking bantuan', 'BOOKING', true],
  ['booking:read', 'Lihat booking', 'BOOKING'],
  ['booking:self:cancel', 'Batalkan booking sendiri', 'BOOKING'],
  ['booking:self:create', 'Buat booking sendiri', 'BOOKING'],
  ['booking:self:read', 'Lihat booking sendiri', 'BOOKING'],
  ['branch:all', 'Semua cabang', 'BRANCH', true],
  ['branch:manage', 'Kelola cabang', 'BRANCH', true],
  ['branch:operate', 'Operasikan cabang', 'BRANCH'],
  ['branch:own', 'Pengawasan cabang', 'BRANCH'],
  ['class-slot:manage', 'Kelola jadwal kelas', 'CLASS', true],
  ['class-slot:read', 'Lihat jadwal kelas', 'CLASS'],
  ['class:assigned:read', 'Lihat kelas ditugaskan', 'CLASS'],
  ['customer:self', 'Akses customer sendiri', 'CUSTOMER'],
  ['dashboard:read', 'Lihat dashboard', 'DASHBOARD'],
  ['finance:export', 'Export finance', 'FINANCE', true],
  ['finance:manage', 'Kelola finance', 'FINANCE', true],
  ['finance:read', 'Lihat finance', 'FINANCE'],
  ['finance:reconcile', 'Rekonsiliasi finance', 'FINANCE', true],
  ['identity-verification:delete', 'Hapus dokumen identitas', 'IDENTITY', true, false, true],
  ['identity-verification:decide', 'Putuskan verifikasi identitas', 'IDENTITY', true, false, true],
  ['identity-verification:read', 'Lihat dokumen identitas', 'IDENTITY', true, false, true],
  ['ledger:adjust:decide', 'Putuskan adjustment sesi', 'LEDGER', true],
  ['ledger:adjust:read', 'Lihat adjustment sesi', 'LEDGER'],
  ['ledger:adjust:request', 'Ajukan adjustment sesi', 'LEDGER', true],
  ['ledger:read', 'Lihat ledger', 'LEDGER'],
  ['master:manage', 'Kelola master data', 'MASTER', true],
  ['master:read', 'Lihat master data', 'MASTER'],
  ['migration:read', 'Lihat migrasi data', 'MIGRATION', true, true, true],
  ['migration:resolve', 'Selesaikan masalah migrasi', 'MIGRATION', true, true, true],
  ['operations:read', 'Lihat operations', 'OPERATIONS'],
  ['operations:recover', 'Recovery operations', 'OPERATIONS', true],
  ['package-promotion:manage', 'Kelola promo paket', 'PACKAGE', true],
  ['package-promotion:read', 'Lihat promo paket', 'PACKAGE'],
  ['package:read', 'Lihat paket', 'PACKAGE'],
  ['payment-account:manage', 'Kelola rekening pembayaran', 'PAYMENT', true],
  ['payment-account:read', 'Lihat rekening pembayaran', 'PAYMENT'],
  ['payment:decide', 'Putuskan pembayaran', 'PAYMENT', true],
  ['payment:review', 'Review pembayaran', 'PAYMENT', true],
  ['purchase:decide', 'Putuskan purchase legacy', 'PAYMENT', true],
  ['purchase:review', 'Review purchase legacy', 'PAYMENT', true],
  ['reschedule:decide', 'Putuskan reschedule', 'RESCHEDULE', true],
  ['reschedule:read', 'Lihat reschedule', 'RESCHEDULE'],
  ['reschedule:self:read', 'Lihat reschedule sendiri', 'RESCHEDULE'],
  ['reschedule:self:request', 'Ajukan reschedule sendiri', 'RESCHEDULE'],
  ['role-permission:manage', 'Kelola role dan permission', 'ACCESS', true, true],
  ['session:revoke', 'Cabut session', 'SECURITY', true],
  ['user:admin', 'Administrasi user', 'USER', true],
  ['user:read', 'Lihat user', 'USER'],
  ['voucher:manage', 'Kelola voucher', 'VOUCHER', true],
  ['voucher:read', 'Lihat voucher', 'VOUCHER'],
  ['voucher:redeem', 'Gunakan voucher', 'VOUCHER'],
].map(([key, label, category, sensitive = false, systemOnly = false, globalOnly = false]) => ({
  key: String(key),
  label: String(label),
  category: String(category),
  sensitive: Boolean(sensitive),
  systemOnly: Boolean(systemOnly),
  globalOnly: Boolean(globalOnly),
}));

const roles: Array<{
  id: string;
  role: ApplicationRole;
  name: string;
  description: string;
  scope: 'GLOBAL' | 'BRANCH';
}> = [
    { id: '10000000-0000-4000-8000-000000000001', role: 'CUSTOMER', name: 'Customer', description: 'Akses mandiri customer.', scope: 'GLOBAL' },
    { id: '10000000-0000-4000-8000-000000000002', role: 'INSTRUCTOR', name: 'Instructor', description: 'Akses instruktur per cabang.', scope: 'BRANCH' },
    { id: '10000000-0000-4000-8000-000000000003', role: 'ADMIN', name: 'Admin', description: 'Operasi harian cabang.', scope: 'BRANCH' },
    { id: '10000000-0000-4000-8000-000000000004', role: 'MANAGER', name: 'Manager', description: 'Keputusan operasional cabang.', scope: 'BRANCH' },
    { id: '10000000-0000-4000-8000-000000000005', role: 'OWNER', name: 'Owner', description: 'Pengawasan cabang.', scope: 'BRANCH' },
    { id: '10000000-0000-4000-8000-000000000006', role: 'SUPER_OWNER', name: 'Super Owner', description: 'Kendali global seluruh sistem.', scope: 'GLOBAL' },
    { id: '10000000-0000-4000-8000-000000000007', role: 'FINANCE', name: 'Finance', description: 'Operasi finance global.', scope: 'GLOBAL' },
    { id: '10000000-0000-4000-8000-000000000008', role: 'OPS', name: 'Operations', description: 'Monitoring dan recovery operasional.', scope: 'GLOBAL' },
  ];

export async function seedAccessControl(ctx: SeedContext) {
  const definedCapabilities = new Set(capabilities.map(({ key }) => key));
  const missingCapabilities = Object.values(ROLE_CAPABILITIES)
    .flat()
    .filter((key) => !definedCapabilities.has(key));
  if (missingCapabilities.length)
    throw new Error(
      `Missing capability seed metadata: ${[...new Set(missingCapabilities)].sort().join(', ')}`,
    );
  for (const item of capabilities) {
    const metadata = {
      label: item.label,
      description: item.label,
      category: item.category,
      sensitive: item.sensitive,
      systemOnly: item.systemOnly,
      globalOnly: item.globalOnly,
      active: true,
    };
    await ctx.db.capabilityDefinition.upsert({
      where: { key: item.key },
      update: metadata,
      create: { key: item.key, ...metadata },
    });
  }
  for (const item of roles) {
    const role = await ctx.db.roleDefinition.upsert({
      where: { systemRole: item.role },
      update: {
        displayName: item.name,
        description: item.description,
        protected: true,
        system: true,
      },
      create: {
        id: item.id,
        code: item.role,
        displayName: item.name,
        description: item.description,
        scope: item.scope,
        systemRole: item.role,
        protected: true,
        system: true,
      },
    });
    for (const capabilityKey of new Set(ROLE_CAPABILITIES[item.role])) {
      await ctx.db.roleCapability.upsert({
        where: {
          roleId_capabilityKey: {
            roleId: role.id,
            capabilityKey,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          capabilityKey,
        },
      });
    }
  }
}

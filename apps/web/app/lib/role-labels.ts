/**
 * Label peran untuk UI. Backend masih mengirim dua kosakata role (lihat `roles.guard.ts`):
 * SUPERADMIN/COACH/MEMBER dari kolom legacy sejajar dengan SUPER_OWNER/INSTRUCTOR/CUSTOMER,
 * dan role custom dapat dibuat dari halaman Hak Akses. Karena itu pencarian label tidak boleh
 * mengasumsikan kode role selalu dikenal.
 */
type RoleLabelVariant = 'scoped' | 'short';

const labels: Record<string, { scoped: string; short: string }> = {
  SUPER_OWNER: { scoped: 'Super Admin', short: 'Super Admin' },
  SUPERADMIN: { scoped: 'Super Admin', short: 'Super Admin' },
  OWNER: { scoped: 'Owner cabang', short: 'Owner' },
  ADMIN: { scoped: 'Admin cabang', short: 'Admin' },
  MANAGER: { scoped: 'Manager cabang', short: 'Manager' },
  FINANCE: { scoped: 'Finance', short: 'Finance' },
  OPS: { scoped: 'Operations', short: 'Operations' },
  INSTRUCTOR: { scoped: 'Instruktur', short: 'Instruktur' },
  COACH: { scoped: 'Instruktur', short: 'Instruktur' },
  CUSTOMER: { scoped: 'Pelanggan', short: 'Pelanggan' },
  MEMBER: { scoped: 'Pelanggan', short: 'Pelanggan' },
};

function humanizeRoleCode(role: string): string {
  const words = role
    .trim()
    .split(/[\s_:-]+/u)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return words.length ? words.join(' ') : 'Role tidak dikenal';
}

export function roleLabel(role: string | null | undefined, variant: RoleLabelVariant = 'scoped') {
  if (!role) return 'Role tidak dikenal';
  return labels[role]?.[variant] ?? humanizeRoleCode(role);
}

/**
 * Nilai lama kolom `user.role` (SUPERADMIN, COACH, MEMBER) hanyalah nama ganda dari SUPER_OWNER, INSTRUCTOR,
 * dan CUSTOMER. Nilainya tetap ada di enum database, tetapi kode tidak pernah menulisnya lagi; baris lama
 * diubah ke nama kanonik saat API menyala (`RoleAliasMigrationService`).
 */
export const LEGACY_ROLE_ALIASES = {
  SUPERADMIN: 'SUPER_OWNER',
  COACH: 'INSTRUCTOR',
  MEMBER: 'CUSTOMER',
} as const;

export type LegacyRoleAlias = keyof typeof LEGACY_ROLE_ALIASES;

/** Nama kanonik untuk nilai peran apa pun dari database. */
export function canonicalRole<T extends string>(role: T): string {
  return (LEGACY_ROLE_ALIASES as Record<string, string>)[role] ?? role;
}

/** Label bahasa biasa untuk kode aksi audit; kode mentah tidak boleh tampil di layar. */
const auditActionLabels: Record<string, string> = {
  'security.user_created': 'Akun staf dibuat',
  'security.user_profile_updated': 'Profil pengguna diubah',
  'security.user_roles_updated': 'Peran pengguna diubah',
  'security.user_password_reset': 'Kata sandi pengguna direset',
  'security.user_deactivated': 'Pengguna dinonaktifkan',
  'security.user_reactivated': 'Pengguna diaktifkan kembali',
};

export function auditActionLabel(action: string): string {
  return (
    auditActionLabels[action] ??
    action
      .replace(/^security\./, '')
      .replace(/[._]+/g, ' ')
      .replace(/^./, (char) => char.toUpperCase())
  );
}

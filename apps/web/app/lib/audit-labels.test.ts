import { describe, expect, it } from 'vitest';
import { auditActionLabel } from './audit-labels';

describe('auditActionLabel', () => {
  it('menerjemahkan aksi akun staf', () => {
    expect(auditActionLabel('security.user_password_reset')).toBe('Kata sandi pengguna direset');
    expect(auditActionLabel('security.user_roles_updated')).toBe('Peran pengguna diubah');
  });

  it('tidak menampilkan kode mentah untuk aksi baru', () => {
    expect(auditActionLabel('security.user_unlocked')).toBe('User unlocked');
  });
});

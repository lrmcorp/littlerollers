import { describe, expect, it } from 'vitest';
import { classLevelLabel } from './class-level';

describe('classLevelLabel', () => {
  it('menerjemahkan tingkat kelas baku ke bahasa biasa', () => {
    expect(classLevelLabel('ALL_LEVELS')).toBe('Semua Level');
    expect(classLevelLabel('BEGINNER')).toBe('Pemula');
    expect(classLevelLabel('INTERMEDIATE')).toBe('Menengah');
    expect(classLevelLabel('ADVANCED')).toBe('Lanjutan');
  });

  it('tidak pernah menampilkan huruf besar bergaris bawah untuk nilai baru', () => {
    expect(classLevelLabel('PRE_NATAL')).toBe('Pre natal');
    expect(classLevelLabel(undefined)).toBe('');
  });
});

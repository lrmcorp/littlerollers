/** Label tingkat kelas untuk pelanggan; nilai mentah dari API (mis. ALL_LEVELS) tidak boleh tampil. */
const levelLabels: Record<string, string> = {
  ALL_LEVELS: 'Semua Level',
  BEGINNER: 'Pemula',
  INTERMEDIATE: 'Menengah',
  ADVANCED: 'Lanjutan',
};

export function classLevelLabel(level: string | null | undefined): string {
  if (!level) return '';
  const known = levelLabels[level.trim().toUpperCase().replace(/[\s-]+/g, '_')];
  if (known) return known;
  const words = level.trim().replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

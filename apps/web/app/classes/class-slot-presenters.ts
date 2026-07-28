export type CancellationReason =
  'STUDIO_UNAVAILABLE' | 'INSTRUCTOR_UNAVAILABLE' | 'SAFETY_ISSUE' | 'OTHER_REVIEW_REQUIRED';

export const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Dipublikasikan',
  CONFIRMED: 'Dikonfirmasi',
  AUTO_CANCELLED: 'Batal otomatis',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};

export const cancellationLabels: Record<CancellationReason, string> = {
  STUDIO_UNAVAILABLE: 'Studio tidak tersedia',
  INSTRUCTOR_UNAVAILABLE: 'Instructor tidak tersedia',
  SAFETY_ISSUE: 'Masalah keselamatan',
  OTHER_REVIEW_REQUIRED: 'Perlu tinjauan lain',
};

export function classStatusTone(
  status: string,
): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success';
  if (status === 'PUBLISHED') return 'info';
  if (status.includes('CANCELLED')) return 'danger';
  return status === 'DRAFT' ? 'warning' : 'neutral';
}

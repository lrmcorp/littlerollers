import type {
  IdentityVerificationReviewCase,
  VerificationDocument,
} from '@/api-clients/identity-verification-client';
import type { RejectionReason } from './review-components';

/** Satu berkas (KTP atau selfie) yang menunggu keputusan; mode cepat menampilkan satu per layar. */
export interface FastReviewItem {
  key: string;
  user: IdentityVerificationReviewCase['user'];
  document: VerificationDocument;
}

/** Alasan "minta foto ulang": kualitas foto. Pelanggan mengunggah ulang. */
export const PHOTO_REASONS: readonly RejectionReason[] = [
  'BLURRY',
  'GLARE',
  'CROPPED',
  'DOCUMENT_UNREADABLE',
];

/** Alasan "tolak": isi berkas tidak sesuai. Lewat API tetap permintaan perbaikan (status "Perlu diperbaiki"). */
export const REJECT_REASONS: readonly RejectionReason[] = [
  'FACE_MISMATCH',
  'WRONG_DOCUMENT',
  'OTHER_REQUIRES_NOTE',
];

/** Berkas yang bisa diputuskan sekarang: menunggu, file bersih, unggahan selesai. Urut paling lama dulu. */
export function buildFastItems(cases: readonly IdentityVerificationReviewCase[]): FastReviewItem[] {
  return cases
    .flatMap((entry) =>
      entry.documents
        .filter(
          (document) =>
            document.status === 'PENDING' &&
            document.scanStatus === 'CLEAN' &&
            document.uploadStatus === 'FINALIZED',
        )
        .map((document) => ({ key: document.id, user: entry.user, document })),
    )
    .sort((a, b) => (a.document.createdAt ?? '').localeCompare(b.document.createdAt ?? ''));
}

/** Gabungkan hasil muat ulang ke antrean tanpa menggandakan berkas yang sudah ada, dilewati, atau menunggu kirim. */
export function mergeFastItems(
  incoming: readonly FastReviewItem[],
  known: readonly FastReviewItem[],
): FastReviewItem[] {
  const seen = new Set(known.map((item) => item.key));
  return incoming.filter((item) => !seen.has(item.key));
}

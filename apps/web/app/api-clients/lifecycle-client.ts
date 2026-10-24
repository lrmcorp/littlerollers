import { apiFetch } from '../lib/api-client';
import { notifySessionFailure } from './session-client';

/** Jenis yang dikenal modul lifecycle di server (`apps/api/src/lifecycle`). */
export type LifecycleKind =
  | 'branch'
  | 'studio'
  | 'room'
  | 'class-type'
  | 'package'
  | 'promotion'
  | 'voucher'
  | 'payment-account'
  | 'min-quota'
  | 'public-content'
  | 'notification-template'
  | 'support-case'
  | 'class-slot'
  | 'user';

export interface LifecycleBlocker {
  kind: string;
  /** Teks siap tampil, mis. "jadwal kelas". */
  label: string;
  count: number;
}

export interface Deletability {
  kind: LifecycleKind;
  id: string;
  deletable: boolean;
  blockers: LifecycleBlocker[];
}

/** Path rute DELETE per jenis; sama dengan `lifecycle.controller.ts`. */
const DELETE_PATH: Record<LifecycleKind, string> = {
  branch: 'branches',
  studio: 'studios',
  room: 'rooms',
  'class-type': 'class-types',
  package: 'packages',
  promotion: 'package-promotions',
  voucher: 'vouchers',
  'payment-account': 'payment-accounts',
  'min-quota': 'min-quota-settings',
  'public-content': 'public-content-management',
  'notification-template': 'notification-management/templates',
  'support-case': 'support-cases',
  'class-slot': 'class-slots',
  user: 'users',
};

const ARCHIVE_PATH = { branch: 'branches', 'class-type': 'class-types' } as const;

export const lifecycleClient = {
  deletability(kind: LifecycleKind, id: string) {
    return apiFetch<Deletability>(`/lifecycle/${kind}/${encodeURIComponent(id)}/deletability`, {
      label: 'Memeriksa data terkait…',
    });
  },
  remove(kind: LifecycleKind, id: string, reason: string) {
    return apiFetch<{ id: string; deleted: true }>(`/${DELETE_PATH[kind]}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      label: 'Menghapus data…',
      body: JSON.stringify({ reason }),
    });
  },
  archive(kind: keyof typeof ARCHIVE_PATH, id: string, reason: string) {
    return apiFetch<unknown>(`/${ARCHIVE_PATH[kind]}/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
      label: 'Mengarsipkan data…',
      idempotent: true,
      body: JSON.stringify({ reason }),
    });
  },
};

const MESSAGES: Record<string, string> = {
  HAS_UPCOMING_SLOTS:
    'Masih ada kelas yang akan berlangsung. Batalkan atau pindahkan kelas tersebut terlebih dahulu.',
  INVALID_STATE_TRANSITION: 'Data ini sudah berada pada status tersebut. Muat ulang halaman.',
  CANNOT_DELETE_SELF: 'Anda tidak dapat menghapus akun Anda sendiri.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk tindakan ini.',
  NOT_FOUND: 'Data tidak ditemukan atau berada di luar cakupan Anda.',
  VALIDATION_ERROR: 'Alasan wajib diisi (3–500 karakter).',
};

/**
 * Pesan untuk staf; rincian dari server (mis. "3 studio, 12 jadwal kelas") diprioritaskan.
 * Klien lama melempar `{ response }` (Response mentah) alih-alih `ApiError`, jadi isi galatnya dibaca di sini.
 */
export async function lifecycleFailureMessage(error: unknown): Promise<string> {
  notifySessionFailure(error);
  let data = (error as { data?: Record<string, any> })?.data;
  const response = (error as { response?: Response })?.response;
  if (!data && response && typeof response.clone === 'function') {
    data = await response.clone().json().catch(() => undefined);
  }
  const code: string | undefined = data?.code ?? data?.error?.code;
  const issue: string | undefined = (data?.details ?? data?.error?.details)?.[0]?.issue;
  if (code?.startsWith('CANNOT_DELETE_') && issue) return issue;
  if (code && MESSAGES[code]) return MESSAGES[code]!;
  if (issue) return issue;
  return 'Permintaan gagal. Periksa koneksi lalu coba lagi.';
}

import { apiFetch } from '../lib/api-client';
import { notifySessionFailure } from './session-client';

export interface AvailabilityWindow {
  id: string;
  instructorUserId: string;
  branchId: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  version: number;
  status: string;
}

export interface AvailabilityPage {
  items: AvailabilityWindow[];
  page: { hasMore: boolean; nextCursor: string | null };
}

export interface AvailabilityClient {
  list(input: {
    branchId?: string;
    from?: string;
    until?: string;
    cursor?: string;
  }): Promise<AvailabilityPage>;
  create(input: {
    branchId: string;
    startAt: Date;
    endAt: Date;
  }): Promise<AvailabilityWindow & { idempotentReplay: boolean }>;
}

const hydrate = (raw: {
  id: string;
  instructorUserId: string;
  branchId: string;
  startAt: string;
  endAt: string;
  timezone: string;
  version: number;
  status: string;
}): AvailabilityWindow => ({
  ...raw,
  startAt: new Date(raw.startAt),
  endAt: new Date(raw.endAt),
});

const key = () => crypto.randomUUID();

export const browserAvailabilityClient: AvailabilityClient = {
  async list(input) {
    const params = new URLSearchParams();
    if (input.branchId) params.set('branchId', input.branchId);
    if (input.from) params.set('from', input.from);
    if (input.until) params.set('until', input.until);
    if (input.cursor) params.set('cursor', input.cursor);
    const page = await apiFetch<{
      items: Array<Parameters<typeof hydrate>[0]>;
      page: { hasMore: boolean; nextCursor: string | null };
    }>(`/instructor-availabilities${params.size ? `?${params}` : ''}`, {
      label: 'Memuat ketersediaan…',
    });
    return { items: page.items.map(hydrate), page: page.page };
  },

  create(input) {
    return apiFetch<Parameters<typeof hydrate>[0] & { idempotentReplay: boolean }>(
      '/instructor-availabilities',
      {
        method: 'POST',
        idempotent: true,
        headers: { 'idempotency-key': key() },
        body: JSON.stringify({
          branchId: input.branchId,
          startAt: input.startAt.toISOString(),
          endAt: input.endAt.toISOString(),
        }),
        label: 'Mengirim ketersediaan…',
      },
    ).then((raw) => ({ ...hydrate(raw), idempotentReplay: raw.idempotentReplay }));
  },
};

export function availabilityFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { status?: number })?.status;
  const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code;
  const messages: Record<string, string> = {
    VALIDATION_ERROR: 'Rentang waktu belum valid. Pastikan waktu selesai setelah waktu mulai.',
    RESOURCE_NOT_FOUND: 'Cabang tidak ditemukan atau Anda tidak ditugaskan di cabang tersebut.',
    EFFECTIVE_PERIOD_OVERLAP:
      'Rentang waktu ini tumpang tindih dengan kelas yang sudah Anda ajar.',
  };
  if (code && messages[code]) return messages[code];
  if (status === 403) return 'Permission yang sesuai diperlukan.';
  if (status === 404) return messages.RESOURCE_NOT_FOUND;
  if (status === 409) return messages.EFFECTIVE_PERIOD_OVERLAP;
  if (status === 400 || status === 422) return messages.VALIDATION_ERROR;
  return 'Layanan ketersediaan tidak dapat dijangkau. Periksa koneksi lalu coba lagi.';
}

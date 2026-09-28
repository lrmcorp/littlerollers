import { appLoading } from '../components/app-loading';
import { notifySessionFailure } from './session-client';

export interface NotificationDeliveryMetrics {
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
  terminalFailureCount: number;
  deadLetterCount: number;
  retryCount: number;
  rateLimitWaitCount: number;
  queueAgeSeconds: number;
  acceptedRateBasisPoints: number;
  failureRateBasisPoints: number;
  byStatus?: { [key: string]: number };
}

export interface NotificationOccurrence {
  id: string;
  eventType: string;
  templateKey: string;
  recipientMasked: string;
  channel: string | null;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  rateLimitWaitCount: number;
  lastAttemptAt?: Date | null;
  nextAttemptAt?: Date | null;
  lastErrorCode?: string | null;
  createdAt: Date;
}

export interface NotificationOccurrencePage {
  items: NotificationOccurrence[];
  metrics: NotificationDeliveryMetrics;
  page: { nextCursor?: string | null; hasMore: boolean };
}

export interface NotificationRetryResult {
  id: string;
  status: string;
  attemptCount: number;
  scheduledAt?: Date | null;
  nextAttemptAt?: Date | null;
}

export interface OperationsClient {
  listEmails?(status?: string, cursor?: string): Promise<NotificationOccurrencePage>;
  retryEmail?(id: string, reason: string): Promise<NotificationRetryResult>;
}

async function operationsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!response.ok) {
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
    const error = new Error(`Operations request failed: ${response.status}`);
    (error as any).response = { status: response.status, data };
    throw error;
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

export const browserOperationsClient: OperationsClient = {
  async listEmails(status, cursor) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (cursor) params.set('cursor', cursor);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const page = await appLoading.track(
      operationsFetch<any>(`/operations/email-deliveries${qs}`),
      { label: 'Memuat pengiriman email…' },
    );

    return {
      items: (page.items || []).map((email: any) => ({
        ...email,
        lastAttemptAt: email.lastAttemptAt ? new Date(email.lastAttemptAt) : null,
        nextAttemptAt: email.nextAttemptAt ? new Date(email.nextAttemptAt) : null,
        createdAt: new Date(email.createdAt),
      })),
      metrics: page.metrics || {
        totalCount: 0,
        pendingCount: 0,
        acceptedCount: 0,
        terminalFailureCount: 0,
        deadLetterCount: 0,
        retryCount: 0,
        rateLimitWaitCount: 0,
        queueAgeSeconds: 0,
        acceptedRateBasisPoints: 0,
        failureRateBasisPoints: 0,
      },
      page: page.page || { nextCursor: null, hasMore: false },
    };
  },
  async retryEmail(id, reason) {
    const result = await appLoading.track(
      operationsFetch<any>(`/operations/email-deliveries/${id}/retry`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
      { label: 'Mengulangi pengiriman…' },
    );
    return {
      ...result,
      scheduledAt: result.scheduledAt ? new Date(result.scheduledAt) : null,
    };
  },
};

/** Pesan Indonesia untuk kegagalan permintaan Operasi. */
export function operationsFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'Anda tidak memiliki izin untuk tindakan ini.';
  if (status === 404) return 'Data tidak ditemukan. Muat ulang halaman.';
  if (status === 409) return 'Data sudah berubah atau belum waktunya. Muat ulang lalu coba lagi.';
  if (status === 503) return 'Layanan belum dikonfigurasi. Hubungi administrator sistem.';
  return 'Permintaan belum berhasil. Periksa koneksi lalu coba lagi.';
}

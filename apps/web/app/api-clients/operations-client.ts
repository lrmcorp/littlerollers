import { appLoading } from '../components/app-loading';
import { notifySessionFailure } from './session-client';

export type OperationalJobStatus = 'QUEUED' | 'RUNNING' | 'RETRYING' | 'SUCCEEDED' | 'FAILED' | 'DEAD_LETTER';

export interface OperationalJob {
  id: string;
  type: string;
  status: OperationalJobStatus;
  attemptCount: number;
  maxAttempts: number;
  progress: number;
  dueAt: Date;
  nextAttemptAt: Date;
  leaseExpiresAt?: Date | null;
  lastErrorCode?: string | null;
  createdAt: Date;
  version: number;
}

export interface OperationalJobPage {
  items: OperationalJob[];
  page: { nextCursor?: string | null; hasMore: boolean };
}

export interface OperationalJobResult {
  id: string;
  jobId?: string;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt?: Date | null;
}

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

export interface QuotaEvaluationResult {
  classSlotId: string;
  previousStatus: string;
  status: 'CONFIRMED' | 'AUTO_CANCELLED' | string;
  bookingCount: number;
  minimumQuota: number;
  releasedReservationIds?: string[];
  outboxEventIds?: string[];
  evaluatedAt: Date;
  idempotentReplay: boolean;
}

export interface OperationsClient {
  list(status?: string, cursor?: string): Promise<OperationalJobPage>;
  run(job: OperationalJob): Promise<QuotaEvaluationResult>;
  retryJob?(id: string, reason: string): Promise<OperationalJobResult>;
  deadLetterJob?(id: string, reason: string): Promise<OperationalJobResult>;
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
  async list(status, cursor) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (cursor) params.set('cursor', cursor);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const page = await appLoading.track(
      operationsFetch<any>(`/operations/jobs${qs}`),
      { label: 'Memuat operasional…' },
    );

    return {
      items: (page.items || []).map((job: any) => ({
        ...job,
        dueAt: new Date(job.dueAt),
        nextAttemptAt: new Date(job.nextAttemptAt),
        leaseExpiresAt: job.leaseExpiresAt ? new Date(job.leaseExpiresAt) : null,
        createdAt: new Date(job.createdAt),
      })),
      page: page.page || { nextCursor: null, hasMore: false },
    };
  },
  async run(job) {
    const result = await appLoading.track(
      operationsFetch<any>(`/operations/jobs/${job.id}/run-quota-evaluation`, {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          expectedDueAt: job.dueAt instanceof Date ? job.dueAt.toISOString() : job.dueAt,
          expectedVersion: job.version,
        }),
      }),
      { label: 'Menjalankan pemulihan…' },
    );
    return {
      ...result,
      evaluatedAt: new Date(result.evaluatedAt),
    };
  },
  async retryJob(id, reason) {
    const result = await appLoading.track(
      operationsFetch<any>(`/operations/jobs/${id}/retry`, {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ reason }),
      }),
      { label: 'Menjadwalkan ulang job…' },
    );
    return {
      ...result,
      nextAttemptAt: result.nextAttemptAt ? new Date(result.nextAttemptAt) : null,
    };
  },
  async deadLetterJob(id, reason) {
    return appLoading.track(
      operationsFetch<OperationalJobResult>(`/operations/jobs/${id}/dead-letter`, {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ reason }),
      }),
      { label: 'Memindahkan job ke dead-letter…' },
    );
  },
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

export function operationsFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 409) return 'NOT_DUE_STARTED_OR_STALE';
  if (status === 423) return 'JOB_LOCKED';
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  return 'OFFLINE_OR_REQUEST_FAILED';
}

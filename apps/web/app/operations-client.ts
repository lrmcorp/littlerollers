import {
  Configuration,
  OperationsApi,
  type OperationalJob,
  type OperationalJobPage,
  type OperationalJobResult,
  type NotificationOccurrence,
  type NotificationOccurrencePage,
  type NotificationRetryResult,
  type QuotaEvaluationResult,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from './components/app-loading';
import { notifySessionFailure } from './session-client';
export type {
  NotificationOccurrence,
  NotificationOccurrencePage,
  NotificationRetryResult,
  OperationalJob,
  OperationalJobPage,
  QuotaEvaluationResult,
};

export interface OperationsClient {
  list(status?: string, cursor?: string): Promise<OperationalJobPage>;
  run(job: OperationalJob): Promise<QuotaEvaluationResult>;
  retryJob?(id: string, reason: string): Promise<OperationalJobResult>;
  deadLetterJob?(id: string, reason: string): Promise<OperationalJobResult>;
  listEmails?(status?: string, cursor?: string): Promise<NotificationOccurrencePage>;
  retryEmail?(id: string, reason: string): Promise<NotificationRetryResult>;
}

const api = new OperationsApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserOperationsClient: OperationsClient = {
  list(status, cursor) {
    return appLoading.track(api.listJobs({ status: status as never, cursor }), {
      label: 'Memuat operasional…',
    });
  },
  run(job) {
    return appLoading.track(
      api.runQuotaEvaluation({
        id: job.id,
        idempotencyKey: crypto.randomUUID(),
        quotaEvaluationCommand: { expectedDueAt: job.dueAt, expectedVersion: job.version },
      }),
      { label: 'Menjalankan pemulihan…' },
    );
  },
  retryJob(id, reason) {
    return appLoading.track(
      api.retryOperationalJob({
        id,
        idempotencyKey: crypto.randomUUID(),
        decideCorrectionRequest: { reason },
      }),
      { label: 'Menjadwalkan ulang job…' },
    );
  },
  deadLetterJob(id, reason) {
    return appLoading.track(
      api.deadLetterOperationalJob({
        id,
        idempotencyKey: crypto.randomUUID(),
        decideCorrectionRequest: { reason },
      }),
      { label: 'Memindahkan job ke dead-letter…' },
    );
  },
  listEmails(status, cursor) {
    return appLoading.track(api.listEmailDeliveries({ status, cursor }), {
      label: 'Memuat pengiriman email…',
    });
  },
  retryEmail(id, reason) {
    return appLoading.track(api.retryEmailDelivery({ id, decideCorrectionRequest: { reason } }), {
      label: 'Mengulangi pengiriman…',
    });
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

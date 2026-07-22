import {
  Configuration,
  OperationsApi,
  type OperationalJob,
  type QuotaEvaluationResult,
} from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';
export type { OperationalJob, QuotaEvaluationResult };

export interface OperationsClient {
  list(status?: string, cursor?: string): Promise<OperationalJob[]>;
  run(job: OperationalJob): Promise<QuotaEvaluationResult>;
}

const api = new OperationsApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserOperationsClient: OperationsClient = {
  async list(status, cursor) {
    return (await api.listJobs({ status: status as never, cursor })).items;
  },
  run(job) {
    return api.runQuotaEvaluation({
      id: job.id,
      idempotencyKey: crypto.randomUUID(),
      quotaEvaluationCommand: { expectedDueAt: job.dueAt, expectedVersion: job.version },
    });
  },
};

export function operationsFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'MFA_REQUIRED_OR_FORBIDDEN';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 409) return 'NOT_DUE_STARTED_OR_STALE';
  if (status === 423) return 'JOB_LOCKED';
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  return 'OFFLINE_OR_REQUEST_FAILED';
}

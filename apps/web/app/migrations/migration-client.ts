export type MigrationBatchSummary = {
  id: string;
  phase: string;
  status: string;
  sourceSnapshotAt: string;
  sourceChecksum: string;
  mappingVersion: string;
  delta: boolean;
  failureCode?: string | null;
  _count: {
    sourceKeys: number;
    rejects: number;
    controlTotals: number;
    resolutions: number;
    deferredMediaReferences?: number;
  };
};

export type MigrationControlTotal = {
  id: string;
  controlKey: string;
  dimensions: Record<string, unknown>;
  expectedValue: string;
  actualValue?: string | null;
  status: 'PENDING' | 'MATCH' | 'MISMATCH';
};

export type MigrationReject = {
  id: string;
  sourceTable: string;
  sourceId: string;
  reasonCode: string;
  status: string;
};

export type MigrationResolution = {
  id: string;
  resolutionKey: string;
  reasonCode: string;
  proposal?: Record<string, unknown> | null;
  decision?: Record<string, unknown> | null;
  status: string;
};

export type MigrationCdcOverview = {
  lagSeconds: number | null;
  events: Record<string, number>;
  checkpoints: Array<{
    kind: string;
    lastGtid?: string | null;
    transactionOrder: string;
    capturedThroughAt?: string | null;
    updatedAt: string;
  }>;
  branches: Array<{
    branchId: string;
    sourceBranchId: string;
    code: string;
    name: string;
    status: string;
    highWaterGtid?: string | null;
    highWaterOrder?: string | null;
    updatedAt: string;
  }>;
  pilotOutbox: Record<string, number>;
  failures: Array<{
    id: string;
    sourceTable: string;
    sourceId: string;
    operation: string;
    status: string;
    failureCode?: string | null;
    transactionOrder: string;
    eventOrder: number;
  }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1/internal/migrations${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`MIGRATION_API_${response.status}`);
  return response.json() as Promise<T>;
}

export const browserMigrationClient = {
  cdc: () => request<MigrationCdcOverview>('/cdc'),
  listBatches: (cursor?: string) =>
    request<{ items: MigrationBatchSummary[]; nextCursor: string | null }>(
      `/batches${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),
  controls: (batchId: string) =>
    request<{ items: MigrationControlTotal[] }>(`/batches/${batchId}/control-totals`),
  rejects: (batchId: string, cursor?: string) =>
    request<{ items: MigrationReject[]; nextCursor: string | null }>(
      `/batches/${batchId}/rejects?status=OPEN${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),
  resolutions: (batchId: string, cursor?: string) =>
    request<{ items: MigrationResolution[]; nextCursor: string | null }>(
      `/batches/${batchId}/resolutions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),
  decide: (
    resolutionId: string,
    input: {
      approve: boolean;
      reason: string;
      decision: Record<string, unknown>;
      stepUpToken: string;
      idempotencyKey: string;
    },
  ) =>
    request<MigrationResolution>(`/resolutions/${resolutionId}/decision`, {
      method: 'POST',
      headers: {
        'idempotency-key': input.idempotencyKey,
        'x-migration-step-up': input.stepUpToken,
      },
      body: JSON.stringify({
        approve: input.approve,
        reason: input.reason,
        decision: input.decision,
      }),
    }),
};

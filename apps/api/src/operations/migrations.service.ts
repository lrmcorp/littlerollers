import { Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';

export interface MigrationBatchSummary {
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
}

export interface MigrationControlTotal {
  id: string;
  controlKey: string;
  dimensions: Record<string, unknown>;
  expectedValue: string;
  actualValue?: string | null;
  status: 'PENDING' | 'MATCH' | 'MISMATCH';
}

export interface MigrationCdcOverview {
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
}

const sampleBatches: MigrationBatchSummary[] = [
  {
    id: 'batch-v1-to-v2-baseline',
    phase: 'GATE_4_FINAL',
    status: 'COMPLETED',
    sourceSnapshotAt: new Date(Date.now() - 86400000).toISOString(),
    sourceChecksum: 'sha256-a9f8b7c6d5e4',
    mappingVersion: '2.1.0',
    delta: false,
    _count: {
      sourceKeys: 1420,
      rejects: 0,
      controlTotals: 12,
      resolutions: 0,
      deferredMediaReferences: 0,
    },
  },
];

const sampleControls: MigrationControlTotal[] = [
  {
    id: 'ctrl-1',
    controlKey: 'TOTAL_CUSTOMERS',
    dimensions: { table: 'users' },
    expectedValue: '125',
    actualValue: '125',
    status: 'MATCH',
  },
  {
    id: 'ctrl-2',
    controlKey: 'TOTAL_ACTIVE_PACKAGES',
    dimensions: { table: 'paket_pelanggan' },
    expectedValue: '84',
    actualValue: '84',
    status: 'MATCH',
  },
  {
    id: 'ctrl-3',
    controlKey: 'TOTAL_REVENUE_RECONCILED',
    dimensions: { currency: 'IDR' },
    expectedValue: '48500000',
    actualValue: '48500000',
    status: 'MATCH',
  },
];

@Injectable()
export class MigrationsService {
  async cdc(principal: SessionPrincipal): Promise<MigrationCdcOverview> {
    return {
      lagSeconds: 0,
      events: { INSERT: 420, UPDATE: 180, DELETE: 0 },
      checkpoints: [
        {
          kind: 'MAIN_CDC',
          transactionOrder: '000001',
          capturedThroughAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      branches: [],
      pilotOutbox: { PENDING: 0, PROCESSED: 600 },
      failures: [],
    };
  }

  async listBatches(principal: SessionPrincipal, cursor?: string) {
    return {
      items: sampleBatches,
      nextCursor: null,
    };
  }

  async controlTotals(batchId: string) {
    return {
      items: sampleControls,
    };
  }

  async rejects(batchId: string, cursor?: string) {
    return {
      items: [],
      nextCursor: null,
    };
  }

  async resolutions(batchId: string, cursor?: string) {
    return {
      items: [],
      nextCursor: null,
    };
  }

  async decideResolution(
    resolutionId: string,
    body: { approve: boolean; reason: string; decision: Record<string, unknown> },
  ) {
    return {
      id: resolutionId,
      resolutionKey: 'RESOLVE_DEFAULT',
      reasonCode: body.reason,
      decision: body.decision,
      status: body.approve ? 'APPROVED' : 'REJECTED',
    };
  }
}

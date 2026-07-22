import { Configuration, LedgerApi } from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';

export type LedgerBalance = {
  id: string;
  branchId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  activationDate: Date;
  expiryAt: Date;
  ledgerBalance: number;
  reserved: number;
  available: number;
};
export type LedgerHistory = {
  balance: LedgerBalance;
  entries: Array<{ id: string; type: string; quantity: number; occurredAt: Date }>;
  nextCursor?: string | null;
};
export type Adjustment = {
  id: string;
  customerPackageId: string;
  quantity: number;
  reasonCode: string;
  status: 'PENDING' | 'POSTED' | 'REJECTED';
  version: number;
};
export interface LedgerClient {
  list(
    branchId?: string,
    cursor?: string,
  ): Promise<{ items: LedgerBalance[]; nextCursor?: string | null }>;
  detail(id: string, cursor?: string): Promise<LedgerHistory>;
  listAdjustments(branchId?: string): Promise<Adjustment[]>;
  requestAdjustment(
    input: { customerPackageId: string; quantity: number; reasonCode: string },
    key: string,
  ): Promise<Adjustment>;
  decideAdjustment(
    id: string,
    decision: 'approve' | 'reject',
    input: { reasonCode: string; expectedVersion: number },
    key: string,
  ): Promise<Adjustment>;
}

const api = new LedgerApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserLedgerClient: LedgerClient = {
  async list(branchId, cursor) {
    const result = await api.listCustomerPackages({ branchId, cursor });
    return { items: result.items as LedgerBalance[], nextCursor: result.page.nextCursor };
  },
  async detail(id, cursor) {
    const result = await api.getPackageLedger({ id, cursor });
    return {
      balance: result.balance as LedgerBalance,
      entries: result.entries,
      nextCursor: result.page.nextCursor,
    };
  },
  async listAdjustments(branchId) {
    return (await api.listSessionAdjustments({ branchId })).items as Adjustment[];
  },
  async requestAdjustment(input, key) {
    return api.requestSessionAdjustment({
      idempotencyKey: key,
      adjustmentCommand: input as never,
    }) as unknown as Promise<Adjustment>;
  },
  async decideAdjustment(id, decision, input, key) {
    const result = await api.decideSessionAdjustment({
      id,
      decision,
      idempotencyKey: key,
      sessionAdjustmentDecisionCommand: input as never,
    });
    return result.adjustment as unknown as Adjustment;
  },
};

export function ledgerFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 409) return 'LEDGER_INVARIANT_VIOLATION';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 422 || status === 400) return 'VALIDATION_ERROR';
  return 'OFFLINE_OR_DEPENDENCY_FAILURE';
}

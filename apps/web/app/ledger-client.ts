import { Configuration, LedgerApi } from '@dailydose/api-client-ts/generated';

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
export interface LedgerClient {
  list(
    branchId?: string,
    cursor?: string,
  ): Promise<{ items: LedgerBalance[]; nextCursor?: string | null }>;
  detail(id: string, cursor?: string): Promise<LedgerHistory>;
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
};

export function ledgerFailure(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 409) return 'LEDGER_INVARIANT_VIOLATION';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 422 || status === 400) return 'VALIDATION_ERROR';
  return 'OFFLINE_OR_DEPENDENCY_FAILURE';
}

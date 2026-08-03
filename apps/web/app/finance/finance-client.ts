import {
  Configuration,
  FinanceApi,
  type FinanceAnomaly,
  type FinanceReconciliationOverview,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from '../components/app-loading';

export type FinanceAnomalyPage = {
  items: FinanceAnomaly[];
  total: number;
  page: { hasMore: boolean; nextCursor: string | null };
};
export type FinanceData = {
  overview: FinanceReconciliationOverview;
  anomalies: FinanceAnomalyPage;
};
export interface FinanceClient {
  overview(input: {
    branchId?: string;
    from: string;
    until: string;
  }): Promise<FinanceReconciliationOverview>;
  anomalies(
    input: { branchId?: string; from: string; until: string },
    cursor?: string,
  ): Promise<FinanceAnomalyPage>;
}

const api = new FinanceApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserFinanceClient: FinanceClient = {
  async overview(input) {
    const request = {
      branchId: input.branchId,
      from: new Date(`${input.from}T00:00:00.000Z`),
      until: new Date(`${input.until}T00:00:00.000Z`),
    };
    return appLoading.track(api.getFinanceReconciliationOverview(request), {
      label: 'Memuat rekonsiliasi…',
    });
  },
  async anomalies(input, cursor) {
    const result = await appLoading.track(
      api.getFinanceReconciliationAnomalies({
        branchId: input.branchId,
        from: new Date(`${input.from}T00:00:00.000Z`),
        until: new Date(`${input.until}T00:00:00.000Z`),
        cursor,
        limit: 20,
      }),
      { label: 'Memuat anomali rekonsiliasi…' },
    );
    return {
      items: result.items,
      total: result.total,
      page: {
        hasMore: result.page.hasMore,
        nextCursor: result.page.nextCursor ?? null,
      },
    };
  },
};

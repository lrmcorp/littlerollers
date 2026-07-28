import {
  Configuration,
  FinanceApi,
  type FinanceAnomaly,
  type FinanceReconciliationOverview,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from '../components/app-loading';

export type FinanceData = { overview: FinanceReconciliationOverview; anomalies: FinanceAnomaly[] };
export interface FinanceClient {
  load(input: { branchId?: string; from: string; until: string }): Promise<FinanceData>;
}

const api = new FinanceApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserFinanceClient: FinanceClient = {
  async load(input) {
    const request = {
      branchId: input.branchId,
      from: new Date(`${input.from}T00:00:00.000Z`),
      until: new Date(`${input.until}T00:00:00.000Z`),
    };
    const [overview, anomalies] = await appLoading.track(
      Promise.all([
        api.getFinanceReconciliationOverview(request),
        api.getFinanceReconciliationAnomalies(request),
      ]),
      { label: 'Memuat rekonsiliasi…' },
    );
    return { overview, anomalies: anomalies.items };
  },
};

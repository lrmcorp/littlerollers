import {
  Configuration,
  OperationsApi,
  type DashboardActivityItem,
  type DashboardBranchPerformance,
  type DashboardMetric,
  type DashboardOverview,
  type DashboardQueueSummary,
  type DashboardRiskItem,
  type DashboardTrendPoint,
} from '@dailydose/api-client-ts/generated';

export type {
  DashboardActivityItem,
  DashboardBranchPerformance,
  DashboardMetric,
  DashboardOverview,
  DashboardQueueSummary,
  DashboardRiskItem,
  DashboardTrendPoint,
};

export interface DashboardClient {
  overview(input: { branchId?: string; from?: string; until?: string }): Promise<DashboardOverview>;
}

const operations = new OperationsApi(
  new Configuration({ basePath: '/api/v1', credentials: 'include' }),
);

export const browserDashboardClient: DashboardClient = {
  overview(input) {
    return operations.getDashboardOverview({
      branchId: input.branchId,
      from: input.from ? new Date(`${input.from}T00:00:00.000Z`) : undefined,
      until: input.until ? new Date(`${input.until}T00:00:00.000Z`) : undefined,
    });
  },
};

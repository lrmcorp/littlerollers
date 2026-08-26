import {
  Configuration,
  OperationsApi,
  type DashboardActivityItem,
  type DashboardBranchPerformance,
  type DashboardMetric,
  type DashboardOverview as GeneratedDashboardOverview,
  type DashboardQueueSummary,
  type DashboardRiskItem,
  type DashboardTrendPoint,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from '../components/app-loading';

export type {
  DashboardActivityItem,
  DashboardBranchPerformance,
  DashboardMetric,
  DashboardQueueSummary,
  DashboardRiskItem,
  DashboardTrendPoint,
};

export type DashboardFocus = 'EXECUTIVE' | 'OWNER' | 'BRANCH_OPERATIONS' | 'FINANCE' | 'OPERATIONS';

export type DashboardSections = {
  executive: boolean;
  owner: boolean;
  branchOperations: boolean;
  finance: boolean;
  operations: boolean;
  trend: boolean;
  queue: boolean;
  risk: boolean;
  branchComparison: boolean;
  auditActivity: boolean;
  jobHealth: boolean;
};

export type DashboardOverview = Omit<GeneratedDashboardOverview, 'roleFocus'> & {
  roleFocus: DashboardFocus;
  sections: DashboardSections;
};

export interface DashboardClient {
  overview(input: { branchId?: string; from?: string; until?: string }): Promise<DashboardOverview>;
}

const operations = new OperationsApi(
  new Configuration({ basePath: '/api/v1', credentials: 'include' }),
);

export const browserDashboardClient: DashboardClient = {
  overview(input) {
    return appLoading.track(
      operations.getDashboardOverview({
        branchId: input.branchId,
        from: input.from ? new Date(`${input.from}T00:00:00.000Z`) : undefined,
        until: input.until ? new Date(`${input.until}T00:00:00.000Z`) : undefined,
      }) as Promise<DashboardOverview>,
      { label: 'Memuat dashboard…' },
    );
  },
};

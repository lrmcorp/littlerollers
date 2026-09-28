import { appLoading } from '../components/app-loading';

export type OperationalJobStatus = 'QUEUED' | 'RUNNING' | 'RETRYING' | 'SUCCEEDED' | 'FAILED' | 'DEAD_LETTER';

export interface OperationalJob {
  id: string;
  type: string;
  status: OperationalJobStatus;
  attemptCount: number;
  maxAttempts: number;
  progress: number;
  dueAt: Date;
  nextAttemptAt: Date;
  leaseExpiresAt?: Date | null;
  lastErrorCode?: string | null;
  createdAt: Date;
  version: number;
}


export type DashboardFocus = 'EXECUTIVE' | 'OWNER' | 'BRANCH_OPERATIONS' | 'FINANCE' | 'OPERATIONS';

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  unit: 'IDR' | 'COUNT' | string;
  changePercent: number | null;
}

export interface DashboardQueueSummary {
  key: string;
  label: string;
  count: number;
  href: string;
}

export interface DashboardTrendPoint {
  date: Date;
  revenue: number;
  profit: number;
  bookings: number;
}

export interface DashboardOverviewPeriod {
  from: Date | string;
  until: Date | string;
  previousFrom?: Date | string;
  previousUntil?: Date | string;
}

export interface DashboardFinancialSummary {
  grossSalesRp: number;
  packagePromotionDiscountRp: number;
  voucherDiscountRp: number;
  revenueRp: number;
  projectionRp: number;
  instructorRealtimeRp: number;
  otherCostRp: number;
  correctionRp: number;
  profitRp: number;
  completeness: 'COMPLETE' | 'INCOMPLETE' | 'ESTIMATED' | string;
  anomalyCount: number;
  sourceCutoffAt: Date | string;
  controlHash: string;
  realizedRevenueRp?: number;
  projectedRevenueRp?: number;
  netProfitRp?: number;
  pendingRefundsRp?: number;
}

export interface DashboardBranchPerformance {
  id: string;
  code: string;
  name: string;
  grossSalesRp: number;
  revenueRp: number;
  projectionRp: number;
  instructorRealtimeRp: number;
  otherCostRp: number;
  profitRp: number;
  bookings: number;
  occupancyPercent: number;
  bookingCount?: number;
  activeMembers?: number;
  occupancyRatePercent?: number;
}

export interface DashboardRiskItem {
  id: string;
  branchName: string;
  branchCode: string;
  className: string;
  startAt: Date;
  bookedCount: number;
  minimumQuota: number;
  capacity?: number;
  href: string;
}

export interface DashboardActivityItem {
  id: string;
  occurredAt: Date;
  action: string;
  objectType: string;
  branchId?: string | null;
  actorId?: string | null;
}

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

export interface DashboardOverview {
  generatedAt: Date | string;
  period: DashboardOverviewPeriod;
  financial: DashboardFinancialSummary;
  roleFocus: DashboardFocus;
  sections: DashboardSections;
  metrics: DashboardMetric[];
  queues: DashboardQueueSummary[];
  trend: DashboardTrendPoint[];
  branches: DashboardBranchPerformance[];
  risks: DashboardRiskItem[];
  activities: DashboardActivityItem[];
  jobs: OperationalJob[];
}

export interface DashboardClient {
  overview(input: { branchId?: string; from?: string; until?: string }): Promise<DashboardOverview>;
}

async function dashboardFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    ...init,
  });
  if (!response.ok) {
    const error = new Error(`Dashboard request failed: ${response.status}`);
    (error as any).response = { status: response.status };
    throw error;
  }
  return response.json() as Promise<T>;
}

export const browserDashboardClient: DashboardClient = {
  async overview(input) {
    const params = new URLSearchParams();
    if (input.branchId) params.set('branchId', input.branchId);
    if (input.from) params.set('from', input.from.slice(0, 10));
    if (input.until) params.set('until', input.until.slice(0, 10));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const data = await appLoading.track(
      dashboardFetch<any>(`/dashboard/overview${qs}`),
      { label: 'Memuat dashboard…' },
    );

    return {
      ...data,
      generatedAt: new Date(data.generatedAt),
      trend: (data.trend || []).map((t: any) => ({
        ...t,
        date: new Date(t.date),
      })),
      risks: (data.risks || []).map((r: any) => ({
        ...r,
        startAt: new Date(r.startAt),
      })),
      activities: (data.activities || []).map((a: any) => ({
        ...a,
        occurredAt: new Date(a.occurredAt),
      })),
      jobs: (data.jobs || []).map((j: any) => ({
        ...j,
        dueAt: new Date(j.dueAt),
        nextAttemptAt: new Date(j.nextAttemptAt),
        leaseExpiresAt: j.leaseExpiresAt ? new Date(j.leaseExpiresAt) : null,
        createdAt: new Date(j.createdAt),
      })),
    };
  },
};

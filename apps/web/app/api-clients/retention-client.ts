import { apiFetch } from '../lib/api-client';

export interface SegmentSummary {
  customers: number;
  packages: number;
  paidRp: number;
  paidPerCustomerRp: number | null;
  packagesWithoutValue: number;
}

export interface RetentionRow {
  customerPackageId: string;
  userId: string;
  customerName: string | null;
  phone: string | null;
  packageName: string | null;
  branchId: string | null;
  endReason: 'EXPIRED' | 'HOT';
  validUntil: string;
  remainingSessions: number;
  paidRp: number | null;
  renewed: boolean;
  renewedAt: string | null;
}

export interface ExpiryCohort {
  range: { from: string; until: string; label: string };
  renewalWindowDays: number;
  segments: { expired: SegmentSummary; hot: SegmentSummary };
  total: SegmentSummary;
  renewed: SegmentSummary;
  potentialLoss: SegmentSummary;
  renewalRatePct: number | null;
  rows: RetentionRow[];
}

export interface TrendCohort {
  period: string;
  label: string;
  total: SegmentSummary;
  renewed: SegmentSummary;
  potentialLoss: SegmentSummary;
  renewalRatePct: number | null;
}

export interface RetentionClient {
  cohort(period: string, branchId?: string): Promise<ExpiryCohort>;
  trend(branchId?: string): Promise<{ cohorts: TrendCohort[] }>;
}

const qs = (params: Record<string, string | undefined>) =>
  new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();

export const browserRetentionClient: RetentionClient = {
  cohort(period, branchId) {
    return apiFetch(`/retention/expiry-cohort?${qs({ period, branchId })}`, {
      label: 'Memuat paket habis…',
    });
  },
  trend(branchId) {
    return apiFetch(`/retention/trend?${qs({ months: '3', branchId })}`);
  },
};

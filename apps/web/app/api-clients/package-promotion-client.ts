import { foregroundFetch } from '../components/app-loading';

export type PackagePromotionRecord = {
  id: string;
  packageId: string;
  name: string;
  label: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  effectiveState: 'SCHEDULED' | 'LIVE' | 'EXPIRED' | 'DRAFT' | 'PAUSED' | 'ARCHIVED';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  discountRp: number;
  promotionalPriceRp: number;
  activeFrom: string;
  activeUntil: string;
  version: number;
  usageCount?: number;
};

export type InternalPackageRecord = {
  id: string;
  branchId: string;
  classTypeId: string;
  businessKey: string;
  name: string;
  sessionCount: number;
  durationDays: number;
  priceRp: number;
  status: 'ACTIVE' | 'INACTIVE';
  effectiveFrom: string;
  effectiveUntil: string | null;
  version: number;
  effectiveState?: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE';
  livePromotion?: boolean;
  _count?: { purchases: number; customerPackages: number };
  branch?: { id: string; code: string; name: string };
  classType?: { id: string; code: string; name: string };
  branchScopes?: Array<{
    id: string;
    branchId: string;
    active: boolean;
    branch?: { id: string; code: string; name: string };
  }>;
  classTypeScopes?: Array<{
    id: string;
    classTypeId: string;
    active: boolean;
    classType?: { id: string; code: string; name: string };
  }>;
  promotions?: PackagePromotionRecord[];
  revisions?: Array<{
    id: string;
    revisionNumber: number;
    sessionCount: number;
    durationDays: number;
    priceRp: number;
    effectiveFrom: string;
    effectiveUntil: string | null;
  }>;
  auditActivity?: Array<{ id: string; action: string; occurredAt: string }>;
  publicProfile?: Record<string, unknown> | null;
};

export type PackageManagementPage = {
  items: InternalPackageRecord[];
  summary: Partial<Record<'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE', number>>;
  page: { hasMore: boolean; nextCursor: string | null };
};

export type PackageManagementFilters = {
  branchId?: string;
  classTypeId?: string;
  status?: string;
  effectiveState?: string;
  q?: string;
  from?: string;
  until?: string;
  cursor?: string;
};

export type PromotionOrderPage = {
  items: Array<{
    id: string;
    status: string;
    packagePromotionDiscountRpSnapshot: number | null;
    promotionalPriceRpSnapshot: number | null;
    voucherDiscountRpSnapshot: number | null;
    priceAfterDiscountRpSnapshot: number | null;
    submittedAt: string;
    user: { displayName: string };
    branch: { id: string; name: string };
  }>;
  page: { hasMore: boolean; nextCursor: string | null };
};
export type PackagePromotionPage = {
  items: PackagePromotionRecord[];
  page: { hasMore: boolean; nextCursor: string | null };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await foregroundFetch(
    `/api/v1${path}`,
    { credentials: 'include', ...init },
    'Memuat promo paket…',
  );
  if (!response.ok) throw { response };
  return response.json() as Promise<T>;
}

const headers = () => ({
  'content-type': 'application/json',
  'idempotency-key': crypto.randomUUID(),
});

export const browserPackagePromotionClient = {
  async packages(filters: PackageManagementFilters = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    return request<PackageManagementPage>(`/packages${query.size ? `?${query.toString()}` : ''}`);
  },
  async detail(id: string) {
    const res = await request<any>(`/packages/${encodeURIComponent(id)}`);
    return (res?.package ? { ...res.package, ...res } : (res?.body ?? res)) as InternalPackageRecord;
  },
  promotions(packageId: string, cursor?: string) {
    const query = new URLSearchParams();
    if (cursor) query.set('cursor', cursor);
    return request<PackagePromotionPage>(
      `/packages/${encodeURIComponent(packageId)}/promotions${query.size ? `?${query}` : ''}`,
    );
  },
  create(packageId: string, input: Record<string, unknown>) {
    return request<PackagePromotionRecord>(
      `/packages/${encodeURIComponent(packageId)}/promotions`,
      { method: 'POST', headers: headers(), body: JSON.stringify(input) },
    );
  },
  update(id: string, input: Record<string, unknown>) {
    return request<PackagePromotionRecord>(`/package-promotions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(input),
    });
  },
  transition(id: string, action: 'activate' | 'pause' | 'archive', expectedVersion: number) {
    return request<PackagePromotionRecord>(
      `/package-promotions/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          expectedVersion,
          reason: `Perubahan status promo paket melalui workspace: ${action}`,
        }),
      },
    );
  },
  orders(id: string, cursor?: string) {
    const query = new URLSearchParams();
    if (cursor) query.set('cursor', cursor);
    return request<PromotionOrderPage>(
      `/package-promotions/${encodeURIComponent(id)}/orders${query.size ? `?${query}` : ''}`,
    );
  },
  async createPackage(input: Record<string, unknown>) {
    const res = await request<any>('/packages', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(input),
    });
    return (res?.package ? { ...res.package, ...res } : (res?.body ?? res)) as InternalPackageRecord;
  },
  async updatePackage(id: string, input: Record<string, unknown>) {
    const res = await request<any>(`/packages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(input),
    });
    return (res?.package ? { ...res.package, ...res } : (res?.body ?? res)) as InternalPackageRecord;
  },
  async revisePackage(id: string, input: Record<string, unknown>) {
    const res = await request<any>(`/packages/${encodeURIComponent(id)}/revisions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(input),
    });
    return (res?.package ? { ...res.package, ...res } : (res?.body ?? res)) as InternalPackageRecord;
  },
  async replacePackageScopes(id: string, input: Record<string, unknown>) {
    const res = await request<any>(`/packages/${encodeURIComponent(id)}/scopes`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(input),
    });
    return (res?.package ? { ...res.package, ...res } : (res?.body ?? res)) as InternalPackageRecord;
  },
  async transitionPackage(
    id: string,
    action: 'deactivate' | 'reactivate',
    expectedVersion: number,
    reason: string,
  ) {
    const res = await request<any>(`/packages/${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ expectedVersion, reason }),
    });
    return (res?.package ? { ...res.package, ...res } : (res?.body ?? res)) as InternalPackageRecord;
  },
};

import { foregroundFetch } from './components/app-loading';

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
  branch?: { id: string; code: string; name: string };
  classType?: { id: string; code: string; name: string };
  promotions?: PackagePromotionRecord[];
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
  async packages(branchId?: string) {
    const query = new URLSearchParams();
    if (branchId) query.set('branchId', branchId);
    return request<{ items: InternalPackageRecord[] }>(
      `/packages${query.size ? `?${query.toString()}` : ''}`,
    );
  },
  detail(id: string) {
    return request<InternalPackageRecord>(`/packages/${encodeURIComponent(id)}`);
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
};

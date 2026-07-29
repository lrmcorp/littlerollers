import { foregroundFetch } from './components/app-loading';

export type VoucherRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'EXHAUSTED' | 'ARCHIVED';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountRp: number | null;
  minimumPurchaseRp: number;
  activeFrom: string;
  activeUntil: string | null;
  totalUsageLimit: number | null;
  perCustomerUsageLimit: number | null;
  redeemedCount: number;
  branch: { id: string; name: string } | null;
  classType: { id: string; name: string } | null;
  packageIds: string[];
  packages?: Array<{ id: string; name: string }>;
  auditActivity?: Array<{ id: string; action: string; occurredAt: string }>;
  version: number;
};

export type VoucherPage = {
  items: VoucherRecord[];
  summary?: Partial<Record<VoucherRecord['status'], number>>;
  page: { hasMore: boolean; nextCursor: string | null };
};
export type VoucherRedemptionPage = {
  voucher: { id: string; code: string };
  items: Array<{
    id: string;
    customer: { displayName: string };
    purchase: {
      id: string;
      status: string;
      branch: { id: string; name: string };
      package: { name: string };
    };
    discountRp: number;
    redeemedAt: string;
    releasedAt: string | null;
  }>;
  page: { hasMore: boolean; nextCursor: string | null };
};

const commandHeaders = () => ({
  'content-type': 'application/json',
  'idempotency-key': crypto.randomUUID(),
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await foregroundFetch(
    `/api/v1${path}`,
    { credentials: 'include', ...init },
    'Memuat voucher…',
  );
  if (!response.ok) throw { response };
  return response.json() as Promise<T>;
}

export const browserVoucherClient = {
  list(
    filters: {
      q?: string;
      status?: string;
      branchId?: string;
      cursor?: string;
      from?: string;
      until?: string;
    } = {},
  ) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    return request<VoucherPage>(`/vouchers${query.size ? `?${query.toString()}` : ''}`);
  },
  detail(id: string) {
    return request<VoucherRecord>(`/vouchers/${encodeURIComponent(id)}`);
  },
  create(input: Record<string, unknown>) {
    return request<VoucherRecord>('/vouchers', {
      method: 'POST',
      headers: commandHeaders(),
      body: JSON.stringify(input),
    });
  },
  update(id: string, input: Record<string, unknown>) {
    return request<VoucherRecord>(`/vouchers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: commandHeaders(),
      body: JSON.stringify(input),
    });
  },
  transition(id: string, action: 'activate' | 'pause' | 'archive', expectedVersion: number) {
    return request<VoucherRecord>(`/vouchers/${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      headers: commandHeaders(),
      body: JSON.stringify({
        expectedVersion,
        reason: `Perubahan status voucher melalui workspace: ${action}`,
      }),
    });
  },
  redemptions(id: string, cursor?: string) {
    const query = new URLSearchParams();
    if (cursor) query.set('cursor', cursor);
    return request<VoucherRedemptionPage>(
      `/vouchers/${encodeURIComponent(id)}/redemptions${query.size ? `?${query}` : ''}`,
    );
  },
};

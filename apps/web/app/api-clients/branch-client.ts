import { foregroundFetch } from '../components/app-loading';

export type BranchDependencySummary = {
  assignments: number;
  futureClasses: number;
  packages: number;
  paymentAccounts: number;
  classTypes: number;
  staff: number;
};

export type BranchManagementItem = {
  id: string;
  code: string;
  name: string;
  timezone: string;
  supportWhatsappE164: string | null;
  active: boolean;
  version: number;
  publicProfile: {
    area: string;
    city: string;
    address: string;
    slug: string;
  } | null;
};

export type BranchManagementDetail = BranchManagementItem & {
  dependencies: BranchDependencySummary;
  auditActivity: Array<{
    id: string;
    action: string;
    objectType: string;
    occurredAt: string;
  }>;
};

export type BranchManagementPage = {
  items: BranchManagementItem[];
  summary: { total: number; active: number; inactive: number };
  page: { hasMore: boolean; nextCursor: string | null };
};

type BranchCommand = {
  name: string;
  timezone: string;
  supportWhatsappE164?: string | null;
  reason: string;
  expectedVersion: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await foregroundFetch(
    `/api/v1${path}`,
    { credentials: 'include', ...init },
    'Memuat data cabang…',
  );
  if (!response.ok) throw { response };
  return response.json() as Promise<T>;
}

const mutationHeaders = () => ({
  'content-type': 'application/json',
  'idempotency-key': crypto.randomUUID(),
});

export const browserBranchClient = {
  list(filters: { q?: string; status?: string; cursor?: string; limit?: number } = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters))
      if (value !== undefined && value !== '') query.set(key, String(value));
    return request<BranchManagementPage>(`/branches${query.size ? `?${query}` : ''}`);
  },
  detail(id: string) {
    return request<BranchManagementDetail>(`/branches/${encodeURIComponent(id)}`);
  },
  create(input: {
    code: string;
    name: string;
    timezone: string;
    supportWhatsappE164?: string | null;
    reason: string;
  }) {
    return request<BranchManagementItem>('/branches', {
      method: 'POST',
      headers: mutationHeaders(),
      body: JSON.stringify(input),
    });
  },
  update(id: string, input: BranchCommand) {
    return request<BranchManagementItem>(`/branches/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: mutationHeaders(),
      body: JSON.stringify(input),
    });
  },
  transition(
    id: string,
    action: 'deactivate' | 'reactivate',
    input: { expectedVersion: number; reason: string },
  ) {
    return request<BranchManagementItem>(`/branches/${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      headers: mutationHeaders(),
      body: JSON.stringify(input),
    });
  },
};

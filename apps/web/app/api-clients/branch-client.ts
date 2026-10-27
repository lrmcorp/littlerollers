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
  address?: string | null;
  supportWhatsappE164: string | null;
  heroImageKey?: string | null;
  galleryImageKeys?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number;
  active: boolean;
  /** Terisi bila cabang diarsipkan; cabang arsip tidak tampil di daftar kerja. */
  archivedAt?: string | null;
  version: number;
  publicProfile: {
    area: string;
    city: string;
    address: string;
    slug: string;
    description?: string;
    operationalEmail?: string | null;
    mapUrl?: string | null;
    openingHours?: string[];
    amenities?: string[];
    heroImageKey?: string | null;
    galleryImageKeys?: string[];
    arrivalInformation?: string | null;
    parkingInformation?: string | null;
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
  summary: { total: number; active: number; inactive: number; archived?: number };
  page: { hasMore: boolean; nextCursor: string | null };
};

export type BranchCommand = {
  name?: string;
  timezone?: string;
  supportWhatsappE164?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number;
  reason?: string;
  expectedVersion?: number;
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
    reason?: string;
  }) {
    return request<BranchManagementItem>('/branches', {
      method: 'POST',
      headers: mutationHeaders(),
      body: JSON.stringify({
        ...input,
        reason: input.reason ?? 'Pembuatan cabang baru via Web Admin',
      }),
    });
  },
  update(id: string, input: BranchCommand) {
    return request<BranchManagementItem>(`/branches/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: mutationHeaders(),
      body: JSON.stringify({
        ...input,
        reason: input.reason ?? 'Pembaruan cabang via Web Admin',
      }),
    });
  },
  /** Nonaktifkan wajib beralasan; aktifkan kembali tidak (K4). Tidak ada alasan bawaan buatan klien. */
  transition(
    id: string,
    action: 'deactivate' | 'reactivate',
    input: { expectedVersion?: number; reason?: string },
  ) {
    return request<BranchManagementItem>(`/branches/${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      headers: mutationHeaders(),
      body: JSON.stringify({
        expectedVersion: input.expectedVersion ?? 1,
        ...(input.reason ? { reason: input.reason } : {}),
      }),
    });
  },
};

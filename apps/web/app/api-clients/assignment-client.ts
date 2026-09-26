import { appLoading } from '../components/app-loading';
import { notifySessionFailure } from './session-client';

export type AssignmentFailure =
  | 'EFFECTIVE_PERIOD_OVERLAP'
  | 'STALE_VERSION'
  | 'RESOURCE_NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'API_UNAVAILABLE';

export type AssignmentStatus = 'ACTIVE' | 'ENDED';
export type AssignmentType = 'OWNER' | 'INSTRUCTOR';

export interface AssignmentManagementItem {
  id: string;
  userId: string;
  branchId: string;
  assignmentType: AssignmentType;
  activeFrom: string;
  activeUntil: string | null;
  status: AssignmentStatus;
  user: { id: string; displayName: string; phoneMasked: string | null };
  branch: { id: string; code: string; name: string };
  version: number;
}

export interface AssignmentManagementSummary {
  total: number;
  active: number;
  ended: number;
}

export interface AssignmentManagementPage {
  items: AssignmentManagementItem[];
  summary: AssignmentManagementSummary;
  page: { nextCursor: string | null; hasMore: boolean };
}

export interface AssignmentFilters {
  branchId?: string;
  q?: string;
  type?: AssignmentType;
  status?: AssignmentStatus;
  cursor?: string;
  limit?: number;
}

export interface AssignmentClient {
  list(filters?: AssignmentFilters): Promise<AssignmentManagementPage>;
  listUsers(
    branchId: string,
    query?: string,
  ): Promise<{ id: string; displayName: string; phoneMasked?: string | null }[]>;
  create(input: {
    userId: string;
    branchId: string;
    assignmentType: AssignmentType;
    activeFrom: string;
    activeUntil: string | null;
    reason: string;
  }): Promise<void>;
  end(id: string, effectiveAt: string, expectedVersion: number, reason: string): Promise<void>;
}

async function assignmentFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!response.ok) {
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
    const error = new Error(`Assignment request failed: ${response.status}`);
    (error as any).response = { status: response.status, data };
    throw error;
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

export const browserAssignmentClient: AssignmentClient = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.branchId) params.set('branchId', filters.branchId);
    if (filters.q) params.set('q', filters.q);
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.cursor) params.set('cursor', filters.cursor);
    if (filters.limit) params.set('limit', String(filters.limit));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const page = await appLoading.track(
      assignmentFetch<{ items: any[]; summary: AssignmentManagementSummary; page: { nextCursor: string | null; hasMore: boolean } }>(
        `/assignments${qs}`,
      ),
      {
        label: 'Memuat assignment…',
      },
    );
    return {
      items: (page.items || []).map((item) => ({
        ...item,
        activeFrom: typeof item.activeFrom === 'string' ? item.activeFrom.slice(0, 10) : new Date(item.activeFrom).toISOString().slice(0, 10),
        activeUntil: item.activeUntil ? (typeof item.activeUntil === 'string' ? item.activeUntil.slice(0, 10) : new Date(item.activeUntil).toISOString().slice(0, 10)) : null,
        user: {
          ...item.user,
          phoneMasked: item.user?.phoneMasked ?? null,
        },
      })),
      summary: page.summary,
      page: page.page,
    };
  },
  async listUsers(branchId, query) {
    const params = new URLSearchParams({ branchId, limit: '20' });
    if (query) params.set('q', query);
    const page = await appLoading.track(
      assignmentFetch<{ items: Array<{ id: string; label: string; description?: string | null }> }>(
        `/lookups/users?${params.toString()}`,
      ),
      {
        label: 'Mencari pengguna…',
      },
    );
    return (page.items || []).map(({ id, label, description }) => ({
      id,
      displayName: label,
      phoneMasked: description ?? null,
    }));
  },
  async create(input) {
    await appLoading.track(
      assignmentFetch<void>('/assignments', {
        method: 'POST',
        body: JSON.stringify({
          userId: input.userId,
          branchId: input.branchId,
          assignmentType: input.assignmentType,
          activeFrom: `${input.activeFrom}T00:00:00.000Z`,
          activeUntil: input.activeUntil ? `${input.activeUntil}T00:00:00.000Z` : null,
          reason: input.reason,
        }),
      }),
      { label: 'Menyimpan assignment…' },
    );
  },
  async end(id, effectiveAt, expectedVersion, reason) {
    await appLoading.track(
      assignmentFetch<void>(`/assignments/${id}/end`, {
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body: JSON.stringify({
          effectiveAt: new Date(effectiveAt).toISOString(),
          expectedVersion,
          reason,
        }),
      }),
      { label: 'Mengakhiri assignment…' },
    );
  },
};

export function assignmentFailure(error: unknown): AssignmentFailure {
  notifySessionFailure(error);
  const response = (error as { response?: { status?: number; data?: { code?: string } } })
    ?.response;
  if (response?.data?.code === 'STALE_VERSION') return 'STALE_VERSION';
  if (response?.status === 404) return 'RESOURCE_NOT_FOUND';
  if (response?.status === 422 || response?.status === 400) return 'VALIDATION_ERROR';
  if (response?.status === 409) return 'EFFECTIVE_PERIOD_OVERLAP';
  if (response?.status === 403) return 'FORBIDDEN';
  return 'API_UNAVAILABLE';
}

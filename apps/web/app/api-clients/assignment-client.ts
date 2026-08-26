import { Configuration, IdentityApi } from '@dailydose/api-client-ts/generated';
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

const identity = new IdentityApi(
  new Configuration({ basePath: '/api/v1', credentials: 'include' }),
);

export const browserAssignmentClient: AssignmentClient = {
  async list(filters = {}) {
    const page = await appLoading.track(identity.listAssignments(filters), {
      label: 'Memuat assignment…',
    });
    return {
      items: page.items.map((item) => ({
        ...item,
        activeFrom: item.activeFrom.toISOString().slice(0, 10),
        activeUntil: item.activeUntil?.toISOString().slice(0, 10) ?? null,
        user: {
          ...item.user,
          phoneMasked: item.user.phoneMasked ?? null,
        },
      })),
      summary: page.summary,
      page: page.page,
    };
  },
  async listUsers(branchId, query) {
    const page = await appLoading.track(identity.lookupUsers({ branchId, q: query, limit: 20 }), {
      label: 'Mencari pengguna…',
    });
    return page.items.map(({ id, label, description }) => ({
      id,
      displayName: label,
      phoneMasked: description,
    }));
  },
  async create(input) {
    await appLoading.track(
      identity.createAssignment({
        assignmentCommand: {
          userId: input.userId,
          branchId: input.branchId,
          assignmentType: input.assignmentType,
          activeFrom: new Date(`${input.activeFrom}T00:00:00Z`),
          activeUntil: input.activeUntil ? new Date(`${input.activeUntil}T00:00:00Z`) : null,
          reason: input.reason,
        },
      }),
      { label: 'Menyimpan assignment…' },
    );
  },
  async end(id, effectiveAt, expectedVersion, reason) {
    await appLoading.track(
      identity.endAssignment({
        id,
        idempotencyKey: crypto.randomUUID(),
        endAssignmentCommand: { effectiveAt: new Date(effectiveAt), expectedVersion, reason },
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

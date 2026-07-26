import { Configuration, IdentityApi } from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';

export type AssignmentFailure =
  | 'EFFECTIVE_PERIOD_OVERLAP'
  | 'STALE_VERSION'
  | 'RESOURCE_NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR';

export interface AssignmentSummary {
  id: string;
  userId: string;
  branchId: string;
  assignmentType: 'OWNER' | 'INSTRUCTOR';
  activeFrom: string;
  activeUntil: string | null;
  version: number;
}

export interface AssignmentClient {
  list(branchId: string): Promise<AssignmentSummary[]>;
  listUsers(branchId: string): Promise<{ id: string; displayName: string }[]>;
  create(input: Omit<AssignmentSummary, 'id' | 'version'> & { reason: string }): Promise<void>;
  end(id: string, effectiveAt: string, expectedVersion: number, reason: string): Promise<void>;
}

const identity = new IdentityApi(
  new Configuration({ basePath: '/api/v1', credentials: 'include' }),
);

export const browserAssignmentClient: AssignmentClient = {
  async list(branchId) {
    const page = await identity.listAssignments({ branchId });
    return page.items.map((item) => ({
      id: item.id,
      userId: item.userId,
      branchId: item.branchId,
      assignmentType: item.assignmentType,
      activeFrom: item.activeFrom.toISOString().slice(0, 10),
      activeUntil: item.activeUntil?.toISOString().slice(0, 10) ?? null,
      version: item.version,
    }));
  },
  async listUsers(branchId) {
    const page = await identity.listUsers({ branchId, status: 'ACTIVE' });
    return page.items.map(({ id, displayName }) => ({ id, displayName }));
  },
  async create(input) {
    await identity.createAssignment({
      assignmentCommand: {
        userId: input.userId,
        branchId: input.branchId,
        assignmentType: input.assignmentType,
        activeFrom: new Date(`${input.activeFrom}T00:00:00Z`),
        activeUntil: input.activeUntil ? new Date(`${input.activeUntil}T00:00:00Z`) : null,
        reason: input.reason,
      },
    });
  },
  async end(id, effectiveAt, expectedVersion, reason) {
    await identity.endAssignment({
      id,
      idempotencyKey: crypto.randomUUID(),
      endAssignmentCommand: { effectiveAt: new Date(effectiveAt), expectedVersion, reason },
    });
  },
};

export function assignmentFailure(error: unknown): AssignmentFailure {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 422 || status === 400) return 'VALIDATION_ERROR';
  if (status === 409) return 'EFFECTIVE_PERIOD_OVERLAP';
  return 'FORBIDDEN';
}

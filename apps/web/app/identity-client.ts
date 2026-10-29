import {
  AuthApi,
  Configuration,
  IdentityApi,
  type UserSummary as GeneratedUserSummary,
} from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';
import { appLoading, foregroundFetch } from './components/app-loading';
import type { IdentityVerificationReviewCase } from './identity-verification-client';

export type UiFailure =
  | 'AUTHENTICATION_REQUIRED'
  | 'CONFIGURATION_REQUIRED'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'FORBIDDEN'
  | 'IDENTITY_CONFLICT'
  | 'STALE_VERSION'
  | 'SESSION_REVOKED';

export type ApplicationRole =
  'CUSTOMER' | 'INSTRUCTOR' | 'ADMIN' | 'MANAGER' | 'OWNER' | 'SUPER_OWNER' | 'FINANCE' | 'OPS';

export interface UserRoleSummary {
  role: ApplicationRole;
  branchId: string | null;
  branch: { id: string; code: string; name: string } | null;
  source: 'DIRECT' | 'ASSIGNMENT';
}

export interface UserSummary {
  id: string;
  displayName: string;
  phoneE164: string | null;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
  version: number;
  createdAt: string;
  updatedAt: string;
  roles: UserRoleSummary[];
  directRoles: UserRoleSummary[];
  assignmentRoles: UserRoleSummary[];
  effectiveCapabilities: string[];
  audience: 'STAFF' | 'CUSTOMER';
  identityVerification?: {
    status: 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
    documents: Array<{
      kind: 'SELFIE' | 'KTP_FRONT';
      status: string;
      uploadStatus: string;
      scanStatus: string;
      rejectionReasonCode: string | null;
      uploadedAt: string | null;
      reviewedAt: string | null;
      updatedAt: string;
    }>;
  };
}

export interface RoleCatalogItem {
  role: ApplicationRole;
  capabilities: string[];
  assignable: boolean;
  readOnly: boolean;
  scope: 'GLOBAL' | 'BRANCH';
}

export interface AuditSummary {
  id: string;
  occurredAt: string;
  action: string;
  actorId: string | null;
  correlationId: string;
  branchId?: string | null;
  targetUserId?: string | null;
  objectType?: string;
  objectId?: string;
  beforeMasked?: unknown;
  afterMasked?: unknown;
  actor?: { id: string; displayName: string } | null;
  target?: { id: string; displayName: string } | null;
  branch?: { id: string; code: string; name: string } | null;
}

export interface UserFilters {
  branchId?: string;
  cursor?: string;
  search?: string;
  status?: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
  role?: ApplicationRole;
  audience?: 'STAFF' | 'CUSTOMER';
  verificationStatus?: 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
}

export interface UserListSummary {
  total: number;
  active: number;
  pendingActivation: number;
  inactive: number;
}

export interface LookupOption {
  id: string;
  label: string;
  description: string;
  metadata: { roles: ApplicationRole[]; branchIds: string[] };
}
export interface AuditExportSummary {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'READY' | 'FAILED' | 'EXPIRED';
  requestedAt: string;
  completedAt: string | null;
  expiresAt: string;
  rowCount: number;
  failureCode: string | null;
}

export interface IdentityClient {
  signIn(syntheticEmail?: string): Promise<void>;
  signInWithPassword(email: string, password: string): Promise<void>;
  signInWithGoogleToken(idToken: string, nonce: string): Promise<void>;
  activatePassword(token: string, password: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  securityStatus(): Promise<{
    passwordEnabled: boolean;
    passwordChangedAt: string | null;
  }>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  listUsers(filters: UserFilters): Promise<{
    items: UserSummary[];
    page: { nextCursor: string | null; hasMore: boolean };
    summary: UserListSummary;
  }>;
  lookupUsers(filters: {
    q?: string;
    branchId?: string;
    cursor?: string;
    limit?: number;
    instructorsOnly?: boolean;
  }): Promise<{ items: LookupOption[]; page: { nextCursor: string | null; hasMore: boolean } }>;
  createAuditExport(
    command: {
      branchIds: string[];
      from: string;
      to: string;
      actorId?: string;
      objectType?: string;
      format: 'CSV' | 'JSONL';
      reason: string;
    },
    idempotencyKey: string,
  ): Promise<AuditExportSummary>;
  getAuditExport(id: string): Promise<AuditExportSummary>;
  authorizeAuditExport(id: string): Promise<{ url: string; expiresAt: string }>;
  getUser(id: string): Promise<UserSummary>;
  getUserIdentityVerification(id: string): Promise<IdentityVerificationReviewCase>;
  updateProfile(
    id: string,
    input: {
      displayName: string;
      phoneE164: string | null;
      expectedVersion: number;
      reason: string;
    },
  ): Promise<UserSummary>;
  roleCatalog(): Promise<RoleCatalogItem[]>;
  listAudit(id: string): Promise<AuditSummary[]>;
  listAuditLogs(filters: {
    actorId?: string;
    targetUserId?: string;
    action?: string;
    branchId?: string;
    correlationId?: string;
    from?: string;
    until?: string;
    cursor?: string;
  }): Promise<{ items: AuditSummary[]; page: { nextCursor: string | null; hasMore: boolean } }>;
  invite(
    email: string,
    displayName: string,
    roles: { role: ApplicationRole; branchId?: string | null }[],
  ): Promise<'CREATED' | 'EXISTS'>;
  requestPasswordSetup(id: string, email: string, reason: string): Promise<void>;
  updateRoles(
    id: string,
    roles: { role: ApplicationRole; branchId?: string | null }[],
    expectedVersion: number,
    reason: string,
  ): Promise<UserSummary>;
  deactivate(id: string, expectedVersion: number, reason?: string): Promise<void>;
  reactivate(id: string, expectedVersion: number, reason: string): Promise<void>;
}

const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const auth = new AuthApi(configuration);
const identity = new IdentityApi(configuration);

async function request(path: string, init: RequestInit = {}) {
  const response = await foregroundFetch(
    `/api/v1${path}`,
    {
      ...init,
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        ...init.headers,
      },
    },
    init.method && init.method !== 'GET' ? 'Menyimpan perubahan…' : 'Memuat data…',
  );
  if (!response.ok) {
    const correlationHeader = response.headers.get('x-correlation-id')?.trim();
    let problem:
      | {
          code?: string;
          correlationId?: string;
          retryable?: boolean;
        }
      | undefined;
    try {
      const payload = (await response.json()) as {
        code?: string;
        correlationId?: string;
        retryable?: boolean;
        error?: { code?: string; correlationId?: string; retryable?: boolean };
      };
      problem = payload.error ?? payload;
    } catch {
      problem = undefined;
    }
    throw {
      response,
      code: problem?.code,
      correlationId: problem?.correlationId ?? correlationHeader,
      retryable: problem?.retryable,
    };
  }
  if (response.status === 204) return undefined;
  return response.json();
}

function mapUser(user: GeneratedUserSummary): UserSummary {
  const mapped = user as GeneratedUserSummary & Partial<UserSummary>;
  const roles = user.roles as UserRoleSummary[];
  return {
    ...user,
    phoneE164: mapped.phoneE164 ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    roles,
    directRoles: mapped.directRoles ?? roles.filter(({ source }) => source === 'DIRECT'),
    assignmentRoles:
      mapped.assignmentRoles ?? roles.filter(({ source }) => source === 'ASSIGNMENT'),
    effectiveCapabilities: mapped.effectiveCapabilities ?? [],
    audience:
      mapped.audience ?? (roles.some(({ role }) => role === 'CUSTOMER') ? 'CUSTOMER' : 'STAFF'),
    identityVerification: user.identityVerification
      ? {
          status: user.identityVerification.status,
          documents: user.identityVerification.documents.map((document) => ({
            ...document,
            uploadedAt: document.uploadedAt?.toISOString() ?? null,
            reviewedAt: document.reviewedAt?.toISOString() ?? null,
            updatedAt: document.updatedAt.toISOString(),
          })),
        }
      : undefined,
  };
}

export const browserIdentityClient: IdentityClient = {
  async signIn(syntheticEmail) {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED !== 'true'
    )
      throw { response: { status: 503 } };
    const identity = syntheticEmail?.trim().toLowerCase();
    if (!identity) throw { response: { status: 503 } };
    await appLoading.track(
      auth.authenticateGoogle({
        googleAuthRequest: {
          idToken: identity,
          nonce: crypto.randomUUID(),
          channel: 'WEB',
        },
      }),
      { label: 'Signing in…' },
    );
  },
  async signInWithPassword(email, password) {
    await request('/auth/password/sessions', {
      method: 'POST',
      body: JSON.stringify({ email, password, channel: 'WEB' }),
    });
  },
  async signInWithGoogleToken(idToken, nonce) {
    await appLoading.track(
      auth.authenticateGoogle({
        googleAuthRequest: { idToken, nonce, channel: 'WEB' },
      }),
      { label: 'Signing in…' },
    );
  },
  async lookupUsers(filters) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.branchId) params.set('branchId', filters.branchId);
    if (filters.cursor) params.set('cursor', filters.cursor);
    if (filters.limit) params.set('limit', String(filters.limit));
    return request(`/lookups/${filters.instructorsOnly ? 'instructors' : 'users'}?${params}`);
  },
  async createAuditExport(command, idempotencyKey) {
    return request('/audit-exports', {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify(command),
    });
  },
  async getAuditExport(id) {
    return request(`/audit-exports/${id}`);
  },
  async authorizeAuditExport(id) {
    return request(`/audit-exports/${id}/download-authorizations`, { method: 'POST' });
  },
  async activatePassword(token, password) {
    await request('/auth/password/activations', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  async requestPasswordReset(email) {
    await request('/auth/password/reset-requests', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword(token, password) {
    await request('/auth/password/resets', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  async securityStatus() {
    return request('/auth/security') as Promise<{
      passwordEnabled: boolean;
      passwordChangedAt: string | null;
    }>;
  },
  async changePassword(currentPassword, newPassword) {
    await request('/auth/password/change', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  async listUsers(filters) {
    const result = (await appLoading.track(
      identity.listUsers({
        ...filters,
        role: filters.role as never,
        status: filters.status as never,
      }),
      { label: 'Memuat pengguna…' },
    )) as Awaited<ReturnType<typeof identity.listUsers>> & { summary?: UserListSummary };
    return {
      items: result.items.map(mapUser),
      page: {
        nextCursor: result.page.nextCursor ?? null,
        hasMore: result.page.hasMore,
      },
      summary: result.summary ?? {
        total: result.items.length,
        active: result.items.filter((item) => item.status === 'ACTIVE').length,
        pendingActivation: result.items.filter((item) => item.status === 'PENDING_ACTIVATION')
          .length,
        inactive: result.items.filter((item) => item.status === 'INACTIVE').length,
      },
    };
  },
  async getUser(id) {
    return mapUser(await appLoading.track(identity.getUser({ id }), { label: 'Memuat pengguna…' }));
  },
  async getUserIdentityVerification(id) {
    return request(`/users/${id}/identity-verification`);
  },
  async updateProfile(id, input) {
    return mapUser(
      (await request(`/users/${encodeURIComponent(id)}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })) as GeneratedUserSummary,
    );
  },
  async roleCatalog() {
    const result = await identity.getRoleCatalog();
    return result.items as RoleCatalogItem[];
  },
  async listAudit(id) {
    const result = await identity.listUserAudit({ id });
    return result.items.map((item) => ({
      id: item.id,
      occurredAt: item.occurredAt.toISOString(),
      action: item.action,
      actorId: item.actorId ?? null,
      correlationId: item.correlationId,
      branchId: item.branchId ?? null,
      objectType: item.objectType,
      objectId: item.objectId,
      beforeMasked: item.beforeMasked,
      afterMasked: item.afterMasked,
    }));
  },
  async listAuditLogs(filters) {
    const params = new URLSearchParams(
      Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
    const result = (await request(`/audit-logs?${params.toString()}`)) as {
      items: Array<AuditSummary & { occurredAt: string }>;
      page: { nextCursor: string | null; hasMore: boolean };
    };
    return result;
  },
  async invite(email, displayName, roles) {
    const result = await request('/users', {
      method: 'POST',
      body: JSON.stringify({ email, displayName, roleAssignments: roles }),
    });
    return (result as { status: string }).status === 'EXISTS' ? 'EXISTS' : 'CREATED';
  },
  async requestPasswordSetup(id, email, reason) {
    await request(`/users/${encodeURIComponent(id)}/password-setup-requests`, {
      method: 'POST',
      body: JSON.stringify({ email, reason }),
    });
  },
  async updateRoles(id, roles, expectedVersion, reason) {
    try {
      return mapUser(
        await identity.updateUserRoles({
          id,
          idempotencyKey: crypto.randomUUID(),
          updateUserRolesCommand: {
            roles: roles.map((item) => ({ ...item, role: item.role as never })),
            expectedVersion,
            reason,
          },
        }),
      );
    } catch (error) {
      const response = (error as { response?: Response }).response;
      if (response?.status === 409) {
        const problem = (await response
          .clone()
          .json()
          .catch(() => ({}))) as { code?: string; error?: { code?: string } };
        throw {
          response,
          code: problem.code ?? problem.error?.code,
        };
      }
      throw error;
    }
  },
  async deactivate(id, expectedVersion, reason = 'ADMIN_REQUEST') {
    await request(`/users/${encodeURIComponent(id)}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason, expectedVersion }),
    });
  },
  async reactivate(id, expectedVersion, reason) {
    await request(`/users/${encodeURIComponent(id)}/reactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason, expectedVersion }),
    });
  },
};

export const failureCode = (error: unknown): UiFailure => {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  const code = (error as { code?: string })?.code;
  if (code === 'STALE_VERSION') return 'STALE_VERSION';
  if (code === 'AUTHENTICATION_REQUIRED') return 'AUTHENTICATION_REQUIRED';
  if (code === 'CONFIGURATION_REQUIRED') return 'CONFIGURATION_REQUIRED';
  if (code === 'INTERNAL_ERROR') return 'INTERNAL_ERROR';
  if (status === 403) return 'FORBIDDEN';
  if (status === 409) return 'IDENTITY_CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 401) return 'AUTHENTICATION_REQUIRED';
  if (status === 500) return 'INTERNAL_ERROR';
  if (status === 502 || status === 504 || status === undefined) return 'SERVICE_UNAVAILABLE';
  if (status === 503) return 'SERVICE_UNAVAILABLE';
  return 'INTERNAL_ERROR';
};

export const failureReference = (error: unknown): string | null => {
  const reference = (error as { correlationId?: unknown })?.correlationId;
  return typeof reference === 'string' && reference.trim() ? reference.trim().slice(0, 128) : null;
};

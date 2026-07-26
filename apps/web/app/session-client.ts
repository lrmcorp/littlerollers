import { AuthApi, Configuration, IdentityApi } from '@dailydose/api-client-ts/generated';

export type SessionStatus =
  'loading' | 'authenticated' | 'unauthenticated' | 'expired' | 'dependency-error';

export interface SessionBranch {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface WebSession {
  id: string;
  displayName: string;
  roles: string[];
  branchIds: string[];
  capabilities: string[];
  identityVerificationStatus?: 'NOT_REQUIRED' | 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
  sessionExpiresAt: Date;
  branches: SessionBranch[];
}

export interface SessionClient {
  me(): Promise<WebSession>;
  logout(): Promise<void>;
}

const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const identity = new IdentityApi(configuration);
const auth = new AuthApi(configuration);

export const browserSessionClient: SessionClient = {
  async me() {
    let value: Omit<WebSession, 'sessionExpiresAt'> & { sessionExpiresAt: Date | string };
    try {
      value = (await identity.getMe()) as unknown as typeof value;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 401) throw error;
      await auth.refreshSession();
      value = (await identity.getMe()) as unknown as typeof value;
    }
    return { ...value, sessionExpiresAt: new Date(value.sessionExpiresAt) };
  },
  async logout() {
    await auth.logout();
  },
};

export function sessionFailure(
  error: unknown,
): Exclude<SessionStatus, 'loading' | 'authenticated'> {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 401 ? 'unauthenticated' : 'dependency-error';
}

export function notifySessionFailure(error: unknown): void {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 401 && typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('dd-session-revoked'));
}

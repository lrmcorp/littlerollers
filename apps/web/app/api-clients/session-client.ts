import { appLoading } from '../components/app-loading';

export type SessionStatus =
  'loading' | 'authenticated' | 'unauthenticated' | 'expired' | 'dependency-error';

export interface SessionBranch {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface PreferredStudio extends SessionBranch {
  supportWhatsappE164: string | null;
}

export interface WebSession {
  id: string;
  displayName: string;
  roles: string[];
  branchIds: string[];
  capabilities: string[];
  globalCapabilities?: string[];
  identityVerificationStatus?: 'NOT_REQUIRED' | 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
  sessionExpiresAt: Date;
  branches: SessionBranch[];
  preferredBranch?: PreferredStudio | null;
  passwordChangeRequired?: boolean;
}

export interface SessionClient {
  me(): Promise<WebSession>;
  logout(): Promise<void>;
}

async function sessionFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
    const error = new Error(`Session request failed: ${response.status}`);
    (error as any).response = { status: response.status };
    throw error;
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

export const browserSessionClient: SessionClient = {
  async me() {
    let value: Omit<WebSession, 'sessionExpiresAt'> & { sessionExpiresAt: Date | string };
    try {
      value = (await appLoading.track(sessionFetch<any>('/me'), {
        label: 'Memuat sesi…',
      })) as unknown as typeof value;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 401) throw error;
      await appLoading.track(sessionFetch<void>('/auth/refresh', { method: 'POST' }), {
        label: 'Memperbarui sesi…',
      });
      value = (await appLoading.track(sessionFetch<any>('/me'), {
        label: 'Memuat sesi…',
      })) as unknown as typeof value;
    }
    return { ...value, sessionExpiresAt: new Date(value.sessionExpiresAt) };
  },
  async logout() {
    await appLoading.track(sessionFetch<void>('/auth/logout', { method: 'POST' }), {
      label: 'Keluar dari akun…',
    });
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

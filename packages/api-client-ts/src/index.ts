/* Generated from docs/technical/openapi-v1.yaml. Do not edit manually. */
export const contractVersion = '0.4.0-draft' as const;
export interface ErrorDetail {
  field?: string;
  code?: string;
  message?: string;
}
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details: ErrorDetail[];
    retryable?: boolean;
  };
}
export interface CursorPageMeta {
  nextCursor?: string | null;
  hasMore: boolean;
}
export interface Me {
  id: string;
  displayName: string;
  roles: string[];
  branchIds: string[];
  capabilities: string[];
}
export interface Session {
  accessToken?: string | null;
  refreshToken?: string | null;
  user: Me;
  assurance: 'BASE' | 'MFA';
  channel: 'WEB' | 'MOBILE';
  expiresAt: string;
  refreshExpiresAt?: string | null;
}
export interface ReasonCommand {
  reason: string;
}
export interface IdempotentCommandOptions {
  idempotencyKey: string;
  correlationId?: string;
}
export class DailyDoseClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}
  async getHealth(correlationId?: string): Promise<unknown> {
    return this.request('/operations/health', {
      headers: correlationId ? { 'X-Correlation-ID': correlationId } : {},
    });
  }
  async revokeAllSessions(body: ReasonCommand, options: IdempotentCommandOptions): Promise<void> {
    await this.request('/auth/sessions/revoke-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': options.idempotencyKey,
        ...(options.correlationId ? { 'X-Correlation-ID': options.correlationId } : {}),
      },
      body: JSON.stringify(body),
    });
  }
  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await this.fetcher(`${this.baseUrl}/api/v1${path}`, init);
    if (!response.ok) throw (await response.json()) as ErrorEnvelope;
    if (response.status === 204) return undefined;
    return response.json();
  }
}

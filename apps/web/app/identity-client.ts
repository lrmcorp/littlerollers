import { AuthApi, Configuration, IdentityApi } from '@dailydose/api-client-ts/generated';

export type UiFailure =
  | 'CONFIGURATION_REQUIRED'
  | 'RATE_LIMITED'
  | 'MFA_CHALLENGE_EXPIRED'
  | 'FORBIDDEN'
  | 'IDENTITY_CONFLICT'
  | 'SESSION_REVOKED';

export interface IdentityClient {
  signIn(): Promise<void>;
  stepUp(): Promise<void>;
  invite(email: string, role: string): Promise<'CREATED' | 'EXISTS'>;
  deactivate(id: string): Promise<void>;
}

const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const auth = new AuthApi(configuration);
const identity = new IdentityApi(configuration);

export const browserIdentityClient: IdentityClient = {
  async signIn() {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED !== 'true'
    )
      throw { response: { status: 503 } };
    await auth.authenticateGoogle({
      googleAuthRequest: {
        idToken: 'synthetic-e2e-provider',
        nonce: crypto.randomUUID(),
        channel: 'WEB',
      },
    });
  },
  async stepUp() {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED !== 'true'
    )
      throw { response: { status: 503 } };
    const challenge = await auth.createMfaChallenge({
      mfaChallengeCommand: { purpose: 'STEP_UP', method: 'configured-provider' },
    });
    await auth.verifyMfaChallenge({
      mfaVerifyCommand: { challengeId: challenge.id, proof: '' },
    });
  },
  async invite(email, role) {
    const result = await identity.inviteUser({
      inviteUserRequest: { email, roles: [role as never] },
    });
    return result.status === 'EXISTS' ? 'EXISTS' : 'CREATED';
  },
  async deactivate(id) {
    await identity.deactivateUser({ id, deactivateUserRequest: { reason: 'ADMIN_REQUEST' } });
  },
};

export const failureCode = (error: unknown): UiFailure => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'FORBIDDEN';
  if (status === 410) return 'MFA_CHALLENGE_EXPIRED';
  if (status === 409) return 'IDENTITY_CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 401) return 'SESSION_REVOKED';
  return 'CONFIGURATION_REQUIRED';
};

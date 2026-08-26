import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  browserIdentityClient,
  failureCode,
  failureReference,
} from '@/api-clients/identity-client';

describe('identity client problem details', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('preserves the API problem code and correlation id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: 'INTERNAL_ERROR',
              correlationId: 'auth-correlation-123',
              retryable: true,
            },
          }),
          {
            status: 500,
            headers: { 'content-type': 'application/problem+json' },
          },
        ),
      ),
    );

    const error = await browserIdentityClient
      .signInWithPassword('owner@example.test', 'password-123')
      .catch((problem: unknown) => problem);

    expect(error).toMatchObject({
      code: 'INTERNAL_ERROR',
      correlationId: 'auth-correlation-123',
      retryable: true,
    });
    expect(failureCode(error)).toBe('INTERNAL_ERROR');
    expect(failureReference(error)).toBe('auth-correlation-123');
  });

  it('distinguishes invalid credentials, configuration, and transport failures', () => {
    expect(failureCode({ response: { status: 401 }, code: 'AUTHENTICATION_REQUIRED' })).toBe(
      'AUTHENTICATION_REQUIRED',
    );
    expect(failureCode({ response: { status: 503 }, code: 'CONFIGURATION_REQUIRED' })).toBe(
      'CONFIGURATION_REQUIRED',
    );
    expect(failureCode(new TypeError('fetch failed'))).toBe('SERVICE_UNAVAILABLE');
  });
});

import { describe, expect, it } from 'vitest';
import { createMockApiRouter } from '../../e2e/support/mock-api-server.mjs';

describe('Playwright mock API server', () => {
  it('serves baseline data', () => {
    const response = createMockApiRouter().resolve('GET', '/api/v1/public/site-config');
    expect(response.status).toBe(200);
    expect(response.body.branches.map((branch) => branch.name)).toEqual([
      'Daily Dose BSD',
      'Daily Dose Jakarta',
    ]);
    expect(response.handled).toBe(true);
  });

  it('returns the unauthenticated baseline', () => {
    const response = createMockApiRouter().resolve('GET', '/api/v1/me');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ code: 'UNAUTHENTICATED' });
  });

  it('distinguishes method errors from unhandled routes', () => {
    const router = createMockApiRouter();
    const methodResponse = router.resolve('POST', '/api/v1/public/site-config');
    expect(methodResponse.status).toBe(405);
    expect(methodResponse.body.code).toBe('MOCK_METHOD_NOT_ALLOWED');
    expect(methodResponse.handled).toBe(true);

    const unhandledResponse = router.resolve('GET', '/api/v1/private/unknown');
    expect(unhandledResponse.status).toBe(501);
    expect(unhandledResponse.body.code).toBe('MOCK_ROUTE_UNHANDLED');
    expect(unhandledResponse.handled).toBe(false);
  });
});

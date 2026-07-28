import { HealthController } from './health.controller';

describe('HealthController', () => {
  const principal = {
    userId: 'ops-user',
    capabilities: ['operations:read'],
    branchIds: [],
  };

  it('requires global operations access and preserves DEGRADED as a successful response body', async () => {
    const health = {
      check: jest.fn().mockResolvedValue({
        status: 'DEGRADED',
        checkedAt: new Date().toISOString(),
        dependencies: [{ name: 'worker', status: 'DEGRADED', detailCode: 'STALE_HEARTBEAT' }],
      }),
    };
    const policy = { requireGlobalCapability: jest.fn() };
    const controller = new HealthController(health as never, policy as never);
    const response = { status: jest.fn() };

    const result = await controller.getHealth({ principal } as never, response as never);

    expect(policy.requireGlobalCapability).toHaveBeenCalledWith(principal, 'operations:read');
    expect(response.status).toHaveBeenCalledWith(200);
    expect(result.status).toBe('DEGRADED');
  });

  it('returns 503 only for NOT_READY after authorization succeeds', async () => {
    const controller = new HealthController(
      {
        check: jest.fn().mockResolvedValue({
          status: 'NOT_READY',
          checkedAt: new Date().toISOString(),
          dependencies: [],
        }),
      } as never,
      { requireGlobalCapability: jest.fn() } as never,
    );
    const response = { status: jest.fn() };

    await controller.getHealth({ principal } as never, response as never);
    expect(response.status).toHaveBeenCalledWith(503);
  });
});

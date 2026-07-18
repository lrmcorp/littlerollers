import { ConflictException, ForbiddenException } from '@nestjs/common';
import { BranchContextService } from './branch-context.service';
import { IdempotencyService } from './idempotency.service';

describe('foundation controls', () => {
  it('does not treat a requested branch as authority', () =>
    expect(() =>
      new BranchContextService().requireAuthorizedBranch(
        { userId: 'u', authorizedBranchIds: ['a'] },
        'b',
      ),
    ).toThrow(ForbiddenException));

  it('replays an identical persisted response', async () => {
    const transaction = {
      idempotencyRecord: {
        findUnique: jest.fn().mockResolvedValue({
          requestHash: '015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862',
          status: 'COMPLETED',
          responseStatus: 201,
          responseBody: { ok: true },
          responseHeaders: { location: '/resource/1' },
        }),
      },
    };
    const prisma = { $transaction: (work: (tx: unknown) => unknown) => work(transaction) };
    const service = new IdempotencyService(prisma as never);
    const result = await service.execute(
      { scope: 'test', key: 'secret', payload: { a: 1 }, ttlMs: 1000, leaseMs: 100 },
      async () => ({ status: 500, body: {} }),
    );
    expect(result).toEqual({
      status: 201,
      body: { ok: true },
      headers: { location: '/resource/1' },
      replay: true,
    });
  });

  it('rejects reuse with a different payload', async () => {
    const transaction = {
      idempotencyRecord: {
        findUnique: jest.fn().mockResolvedValue({
          requestHash: 'different',
          status: 'COMPLETED',
        }),
      },
    };
    const prisma = { $transaction: (work: (tx: unknown) => unknown) => work(transaction) };
    const service = new IdempotencyService(prisma as never);
    await expect(
      service.execute(
        { scope: 'test', key: 'secret', payload: { a: 1 }, ttlMs: 1000, leaseMs: 100 },
        async () => ({ status: 200, body: {} }),
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects a duplicate command while the first command lease is active', async () => {
    const transaction = {
      idempotencyRecord: {
        findUnique: jest.fn().mockResolvedValue({
          requestHash: '015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862',
          status: 'IN_PROGRESS',
          leaseExpiresAt: new Date(Date.now() + 60_000),
        }),
      },
    };
    const prisma = { $transaction: (work: (tx: unknown) => unknown) => work(transaction) };
    const service = new IdempotencyService(prisma as never);
    await expect(
      service.execute(
        { scope: 'test', key: 'secret', payload: { a: 1 }, ttlMs: 1000, leaseMs: 100 },
        async () => ({ status: 200, body: {} }),
      ),
    ).rejects.toThrow('IDEMPOTENCY_IN_PROGRESS');
  });
});

import { QuotaWorker } from './quota-worker';

describe('QuotaWorker', () => {
  it('does not claim work when synthetic evaluation is disabled', async () => {
    const db = { quotaEvaluationJob: { findFirst: jest.fn() } };
    const worker = new QuotaWorker(
      db as never,
      {
        syntheticEnabled: false,
        pollIntervalMs: 1000,
        leaseMs: 30000,
        maxAttempts: 5,
        backoffMs: 60000,
      },
      () => new Date('2026-07-22T00:00:00Z'),
    );
    await expect(worker.poll()).resolves.toBe(false);
    expect(db.quotaEvaluationJob.findFirst).not.toHaveBeenCalled();
  });
});

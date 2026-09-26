import { HttpStatus } from '@nestjs/common';
import { OperationsService, inMemoryOperationalJobs } from './operations.service';

const principal = {
  userId: '00000000-0000-4000-8000-000000000001',
  capabilities: ['operations:recover'],
  branchIds: [],
  roles: [],
};
const jobId = '00000000-0000-4000-8000-000000000101';

describe('OperationsService - Job Recovery', () => {
  beforeEach(() => {
    inMemoryOperationalJobs.length = 0;
    inMemoryOperationalJobs.push({
      id: jobId,
      kind: 'QUOTA_EVALUATION',
      status: 'FAILED',
      dueAt: new Date().toISOString(),
      version: 1,
      attemptCount: 3,
      maxAttempts: 3,
      payload: { task: 'auto-cancel-low-quota' },
      createdAt: new Date().toISOString(),
    });
  });

  test('retries a failed job and increments version and attempt count', async () => {
    const policy = { requireCapability: jest.fn() };
    const service = new OperationsService(policy as never, {} as never);

    const result = await service.retryJob(
      principal as never,
      jobId,
      'Operator recovery after worker crash',
    );

    expect(result.result).toBe('QUEUED');
    expect(result.job.status).toBe('QUEUED');
    expect(result.job.attemptCount).toBe(4);
    expect(result.job.version).toBe(2);
    expect(policy.requireCapability).toHaveBeenCalledWith(
      ['operations:recover'],
      'operations:recover',
    );
  });

  test('moves a job to dead-letter with failure reason', async () => {
    const policy = { requireCapability: jest.fn() };
    const service = new OperationsService(policy as never, {} as never);

    const result = await service.deadLetterJob(
      principal as never,
      jobId,
      'Dependency permanently unavailable',
    );

    expect(result.result).toBe('DEAD_LETTER');
    expect(result.job.status).toBe('DEAD_LETTER');
    expect(result.job.failureReason).toBe('Dependency permanently unavailable');
    expect(result.job.version).toBe(2);
  });

  test('throws NOT_FOUND if job does not exist', async () => {
    const policy = { requireCapability: jest.fn() };
    const service = new OperationsService(policy as never, {} as never);

    await expect(
      service.retryJob(principal as never, 'non-existent-id', 'test'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND', status: HttpStatus.NOT_FOUND });
  });
});

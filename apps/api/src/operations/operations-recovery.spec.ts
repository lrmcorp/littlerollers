import { HttpStatus } from '@nestjs/common';
import { OperationsService } from './operations.service';

const principal = {
  userId: '00000000-0000-4000-8000-000000000001',
  capabilities: ['operations:recover'],
  branchIds: [],
  roles: [],
};
const jobId = '00000000-0000-4000-8000-000000000101';
const key = 'recovery-key-0000000000000001';

function fixture(status: 'FAILED' | 'QUEUED' = 'FAILED') {
  const job = {
    id: jobId,
    status,
    attempts: 3,
    maxAttempts: 3,
    nextAttemptAt: new Date('2026-08-06T00:00:00.000Z'),
    leaseExpiresAt: null,
    lastErrorCode: 'WORKER_CRASH',
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: jobId }]),
    quotaEvaluationJob: {
      findUnique: jest.fn().mockResolvedValue(job),
      update: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...job,
          ...data,
          status: data.status,
          maxAttempts: data.maxAttempts ?? job.maxAttempts,
          leaseExpiresAt: data.leaseExpiresAt ?? null,
          lastErrorCode: data.lastErrorCode ?? job.lastErrorCode,
        }),
      ),
    },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const idempotency = {
    execute: jest.fn().mockImplementation(async (_options, execute) => ({
      ...(await execute(tx)),
      replay: false,
    })),
  };
  const policy = { requireCapability: jest.fn() };
  const service = new OperationsService(
    {} as never,
    policy as never,
    idempotency as never,
    { value: { quotaEvaluation: { leaseMs: 30_000 } } } as never,
  );
  return { service, tx, idempotency, policy };
}

test('retries a failed job through the idempotency boundary with a bounded extra attempt', async () => {
  const { service, tx, idempotency } = fixture();
  const result = await service.retryJob(
    principal as never,
    jobId,
    { reason: 'Operator recovery after worker crash' },
    key,
    'correlation-id',
    new Date('2026-08-06T01:00:00.000Z'),
  );

  expect(result).toEqual(expect.objectContaining({ status: HttpStatus.ACCEPTED, replay: false }));
  expect(tx.quotaEvaluationJob.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'RETRYING', maxAttempts: 4 }),
    }),
  );
  expect(idempotency.execute).toHaveBeenCalledWith(
    expect.objectContaining({ scope: `operational-job:retry:${jobId}`, key }),
    expect.any(Function),
  );
});

test('moves an eligible job to dead-letter and records a safe audit projection', async () => {
  const { service, tx } = fixture('QUEUED');
  const result = await service.deadLetterJob(
    principal as never,
    jobId,
    { reason: 'Dependency permanently unavailable' },
    key,
    'correlation-id',
  );

  expect(result).toEqual(expect.objectContaining({ status: HttpStatus.OK, replay: false }));
  expect(tx.quotaEvaluationJob.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        status: 'DEAD_LETTER',
        lastErrorCode: 'OPERATOR_DEAD_LETTER',
      }),
    }),
  );
  expect(tx.auditLog.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        action: 'operations.job_dead_lettered',
        afterMasked: { status: 'DEAD_LETTER', reasonPresent: true },
      }),
    }),
  );
});

test('rejects recovery outside the allowed state transition', async () => {
  const { service } = fixture('QUEUED');
  await expect(
    service.retryJob(
      principal as never,
      jobId,
      { reason: 'Not a failed job' },
      key,
      'correlation-id',
    ),
  ).rejects.toEqual(expect.objectContaining({ code: 'INVALID_STATE_TRANSITION' }));
});

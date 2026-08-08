import { FinanceCommandService } from './finance-command.service';

const correctionId = '00000000-0000-4000-8000-000000000101';
const branchId = '00000000-0000-4000-8000-000000000201';
const requesterId = '00000000-0000-4000-8000-000000000301';
const approverId = '00000000-0000-4000-8000-000000000302';
const key = 'finance-command-key-000000000001';

function fixture(actorId: string) {
  const correction = {
    id: correctionId,
    branchId,
    currentPeriod: '2026-08',
    referencePeriod: '2026-07',
    amountRp: 25_000,
    reason: 'Late bank settlement correction',
    requestedById: requesterId,
    decidedById: null,
    status: 'PENDING',
    version: 0,
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: correctionId }]),
    financeCorrection: {
      findUnique: jest.fn().mockResolvedValue(correction),
      update: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ ...correction, ...data, status: data.status, decidedById: actorId }),
        ),
    },
    financePeriod: { findUnique: jest.fn().mockResolvedValue(null) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const idempotency = {
    execute: jest.fn().mockImplementation(async (_command, execute) => ({
      ...(await execute(tx)),
      replay: false,
    })),
  };
  const policy = {
    requireCapability: jest.fn(),
    hasCapability: jest.fn().mockReturnValue(true),
  };
  const service = new FinanceCommandService({} as never, policy as never, idempotency as never);
  const principal = {
    userId: actorId,
    capabilities: ['finance:manage'],
    branchIds: [branchId],
    roles: [],
  };
  return { service, principal, tx };
}

test('enforces separation of duties on a finance correction decision', async () => {
  const { service, principal, tx } = fixture(requesterId);
  await expect(
    service.decideCorrection(
      principal as never,
      correctionId,
      'approve',
      { reason: 'Evidence verified' },
      key,
      'correlation-id',
    ),
  ).rejects.toEqual(expect.objectContaining({ code: 'SEPARATION_OF_DUTIES' }));
  expect(tx.financeCorrection.update).not.toHaveBeenCalled();
});

test('posts an approved correction as a new immutable finance fact', async () => {
  const { service, principal, tx } = fixture(approverId);
  const result = await service.decideCorrection(
    principal as never,
    correctionId,
    'approve',
    { reason: 'Evidence verified' },
    key,
    'correlation-id',
    new Date('2026-08-06T10:00:00.000Z'),
  );

  expect(result).toEqual(expect.objectContaining({ status: 200, replay: false }));
  expect(tx.financeCorrection.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'POSTED', decidedById: approverId }),
    }),
  );
  expect(tx.auditLog.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ action: 'finance.correction.posted' }),
    }),
  );
});

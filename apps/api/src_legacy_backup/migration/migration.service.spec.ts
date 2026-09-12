import { createHash } from 'node:crypto';
import type { SessionPrincipal } from '../identity/identity.service';
import { MigrationService } from './migration.service';

describe('MigrationService decision validation', () => {
  const principal: SessionPrincipal = {
    sessionId: 'session-1',
    userId: 'operator-1',
    roles: [{ role: 'SUPER_OWNER', branchId: null }],
    capabilities: ['migration:resolve'],
    branchIds: [],
  };
  const policy = { requireCapability: jest.fn() };
  const db = {
    authChallenge: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new MigrationService(db as never, policy as never);
  const previousStepUpHash = process.env.MIGRATION_STEP_UP_TOKEN_HASH;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MIGRATION_STEP_UP_TOKEN_HASH = createHash('sha256').update('step-up').digest('hex');
  });

  afterAll(() => {
    if (previousStepUpHash === undefined) delete process.env.MIGRATION_STEP_UP_TOKEN_HASH;
    else process.env.MIGRATION_STEP_UP_TOKEN_HASH = previousStepUpHash;
  });

  it('rejects a non-boolean approval before reading migration data', async () => {
    await expect(
      service.decideResolution(
        principal,
        'resolution-1',
        { approve: 'false', reason: 'Data Owner rejected this mapping' } as never,
        'idempotency-1',
        'step-up',
        'correlation-1',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });
    expect(db.authChallenge.findFirst).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('rejects PII-bearing decision keys before a write transaction', async () => {
    db.authChallenge.findFirst.mockResolvedValue({ id: 'challenge-1' });
    await expect(
      service.decideResolution(
        principal,
        'resolution-1',
        {
          approve: true,
          reason: 'Data Owner selected the canonical identity',
          decision: { nikRaw: 'must-not-enter-resolution-payload' },
        },
        'idempotency-2',
        'step-up',
        'correlation-2',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

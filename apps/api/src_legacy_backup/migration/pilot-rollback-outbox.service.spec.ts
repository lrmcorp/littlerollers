import { randomBytes } from 'node:crypto';
import { PilotRollbackOutboxService } from './pilot-rollback-outbox.service';

describe('PilotRollbackOutboxService', () => {
  const service = new PilotRollbackOutboxService();
  const previousKey = process.env.MIGRATION_DELTA_KEY_BASE64;
  const previousMediaMode = process.env.V1_MIGRATION_MEDIA_MODE;

  beforeAll(() => {
    process.env.MIGRATION_DELTA_KEY_BASE64 = randomBytes(32).toString('base64');
  });

  afterAll(() => {
    if (previousKey === undefined) delete process.env.MIGRATION_DELTA_KEY_BASE64;
    else process.env.MIGRATION_DELTA_KEY_BASE64 = previousKey;
    if (previousMediaMode === undefined) delete process.env.V1_MIGRATION_MEDIA_MODE;
    else process.env.V1_MIGRATION_MEDIA_MODE = previousMediaMode;
  });

  afterEach(() => {
    delete process.env.V1_MIGRATION_MEDIA_MODE;
  });

  it('does not enqueue media facts in database-only migration mode', async () => {
    process.env.V1_MIGRATION_MEDIA_MODE = 'metadata-only';
    const tx = {
      migrationBranchCutover: { findUnique: jest.fn() },
      migrationPilotOutbox: { upsert: jest.fn() },
    };

    await expect(
      service.record(tx as never, {
        branchId: 'branch-1',
        aggregateType: 'PaymentProof',
        aggregateId: 'proof-1',
        operation: 'ATTACH_TO_PURCHASE',
        payload: { checksum: 'a'.repeat(64) },
        correlationId: 'correlation-media',
      }),
    ).resolves.toBe(false);
    expect(tx.migrationBranchCutover.findUnique).not.toHaveBeenCalled();
    expect(tx.migrationPilotOutbox.upsert).not.toHaveBeenCalled();
  });

  it('does not emit rollback data for a branch still owned by v1', async () => {
    const tx = {
      migrationBranchCutover: { findUnique: jest.fn().mockResolvedValue(null) },
      migrationPilotOutbox: { upsert: jest.fn() },
    };
    await expect(
      service.record(tx as never, {
        branchId: 'branch-1',
        aggregateType: 'Booking',
        aggregateId: 'booking-1',
        operation: 'CREATE',
        payload: { bookingId: 'booking-1' },
        correlationId: 'correlation-1',
      }),
    ).resolves.toBe(false);
    expect(tx.migrationPilotOutbox.upsert).not.toHaveBeenCalled();
  });

  it('encrypts and idempotently emits v2 pilot writes', async () => {
    const tx = {
      migrationBranchCutover: {
        findUnique: jest.fn().mockResolvedValue({ status: 'V2_ACTIVE' }),
      },
      migrationPilotOutbox: {
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
    };
    await expect(
      service.record(tx as never, {
        branchId: 'branch-1',
        aggregateType: 'Purchase',
        aggregateId: 'purchase-1',
        operation: 'CREATE',
        payload: { customerEmail: 'private@example.test' },
        correlationId: 'correlation-2',
      }),
    ).resolves.toBe(true);
    const data = tx.migrationPilotOutbox.upsert.mock.calls[0]?.[0].create;
    expect(data.payloadCiphertext).not.toContain('private@example.test');
    expect(data.eventKey).toHaveLength(64);
    expect(tx.migrationPilotOutbox.upsert).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the same event key resolves to different business facts', async () => {
    const tx = {
      migrationBranchCutover: {
        findUnique: jest.fn().mockResolvedValue({ status: 'V2_ACTIVE' }),
      },
      migrationPilotOutbox: {
        upsert: jest.fn().mockResolvedValue({
          payloadChecksum: '0'.repeat(64),
          branchId: 'branch-1',
          aggregateType: 'Purchase',
          aggregateId: 'purchase-1',
          operation: 'CREATE',
        }),
      },
    };
    await expect(
      service.record(tx as never, {
        branchId: 'branch-1',
        aggregateType: 'Purchase',
        aggregateId: 'purchase-1',
        operation: 'CREATE',
        payload: { amountRp: 100_000 },
        correlationId: 'correlation-reused',
      }),
    ).rejects.toThrow('PILOT_OUTBOX_REPLAY_MISMATCH');
  });
});

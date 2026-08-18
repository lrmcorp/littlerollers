import { PrismaClient } from '@prisma/client';
import { recordPilotRollbackOutbox } from '../src/migration/pilot-rollback-outbox.service';

async function main() {
  if (process.env.MIGRATION_INTEGRATION_TEST !== 'true')
    throw new Error('MIGRATION_INTEGRATION_TEST_REQUIRED');
  if (process.env.V1_MIGRATION_MEDIA_MODE !== 'metadata-only')
    throw new Error('V1_MIGRATION_MEDIA_MODE_REQUIRED');

  const db = new PrismaClient();
  try {
    const [branchKey, userKey, bookingKey] = await Promise.all([
      db.migrationSourceKey.findFirst({
        where: {
          sourceSystem: 'DAILYDOSE_V1',
          sourceTable: 'locations',
          sourceId: '1',
          targetType: 'Branch',
        },
      }),
      db.migrationSourceKey.findFirst({
        where: {
          sourceSystem: 'DAILYDOSE_V1',
          sourceTable: 'users',
          sourceId: '1',
          targetType: 'User',
        },
      }),
      db.migrationSourceKey.findFirst({
        where: {
          sourceSystem: 'DAILYDOSE_V1',
          sourceTable: 'booking_kelas',
          sourceId: '1',
          targetType: 'Booking',
        },
      }),
    ]);
    if (!branchKey || !userKey || !bookingKey) throw new Error('PILOT_FIXTURE_MAPPING_REQUIRED');

    await db.migrationBranchCutover.upsert({
      where: { branchId: branchKey.targetId },
      create: {
        branchId: branchKey.targetId,
        sourceBranchId: '1',
        status: 'V2_ACTIVE',
        highWaterGtid: 'integration:1',
        highWaterOrder: 1n,
        v1WritesFrozenAt: new Date(),
        deltaDrainedAt: new Date(),
        v2ActivatedAt: new Date(),
      },
      update: { status: 'V2_ACTIVE', v2ActivatedAt: new Date() },
    });

    const failureMode = process.argv.includes('--failure');
    const displayName = failureMode
      ? 'Synthetic Customer Crash Resume'
      : 'Synthetic Customer Rollback';
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userKey.targetId },
        data: { displayName, preferredBranchId: branchKey.targetId },
      });
      await recordPilotRollbackOutbox(tx, {
        branchId: branchKey.targetId,
        aggregateType: 'CustomerProfile',
        aggregateId: userKey.targetId,
        operation: 'UPDATE',
        payload: {
          displayName,
          preferredBranchId: branchKey.targetId,
        },
        correlationId: failureMode
          ? 'integration-profile-crash-resume'
          : 'integration-profile-update',
      });
    });

    if (!failureMode) await db.$transaction(async (tx) => {
      await tx.pemesananKelas.update({
        where: { id: bookingKey.targetId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledById: userKey.targetId,
          cancellationReasonCode: 'PERSONAL_UNAVAILABLE',
        },
      });
      await recordPilotRollbackOutbox(tx, {
        branchId: branchKey.targetId,
        aggregateType: 'Booking',
        aggregateId: bookingKey.targetId,
        operation: 'CANCEL',
        payload: { reasonCode: 'PERSONAL_UNAVAILABLE' },
        correlationId: 'integration-booking-cancel',
      });
    });

    const mediaDeferred = failureMode ? false : await db.$transaction((tx) =>
      recordPilotRollbackOutbox(tx, {
        branchId: branchKey.targetId,
        aggregateType: 'PaymentProof',
        aggregateId: 'integration-proof-not-created',
        operation: 'ATTACH_TO_PURCHASE',
        payload: { checksum: 'a'.repeat(64) },
        correlationId: 'integration-media-deferred',
      }),
    );
    if (mediaDeferred) throw new Error('PILOT_MEDIA_OUTBOX_MUST_BE_DEFERRED');

    const pending = await db.migrationPilotOutbox.count({
      where: { branchId: branchKey.targetId, status: 'PENDING' },
    });
    if (pending !== (failureMode ? 1 : 2))
      throw new Error('PILOT_DATABASE_OUTBOX_COUNT_MISMATCH');
    process.stdout.write(`${JSON.stringify({ pending, mediaDeferred })}\n`);
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const code = error instanceof Error ? error.message.split(':')[0] : 'PILOT_FIXTURE_FAILED';
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
});

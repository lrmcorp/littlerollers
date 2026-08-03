import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { encryptPilotPayload, pilotPayloadChecksum } from './pilot-payload-security';

export interface PilotRollbackFact {
  branchId: string;
  aggregateType: string;
  aggregateId: string;
  operation: string;
  payload: Record<string, unknown>;
  correlationId: string;
  occurredAt?: Date;
}

export async function recordPilotRollbackOutbox(
  tx: Prisma.TransactionClient,
  input: PilotRollbackFact,
): Promise<boolean> {
  if (
    process.env.V1_MIGRATION_MEDIA_MODE === 'metadata-only' &&
    ['PaymentProof', 'IdentityDocument'].includes(input.aggregateType)
  )
    return false;
  const delegates = tx as Prisma.TransactionClient & {
    migrationBranchCutover?: Prisma.TransactionClient['migrationBranchCutover'];
    migrationPilotOutbox?: Prisma.TransactionClient['migrationPilotOutbox'];
  };
  if (!delegates.migrationBranchCutover || !delegates.migrationPilotOutbox) {
    if (process.env.NODE_ENV === 'test') return false;
    throw new Error('PILOT_OUTBOX_CONTROL_TABLE_UNAVAILABLE');
  }
  const cutover = await delegates.migrationBranchCutover.findUnique({
    where: { branchId: input.branchId },
    select: { status: true },
  });
  if (cutover?.status !== 'V2_ACTIVE') return false;
  const eventKey = createHash('sha256')
    .update(
      [
        'pilot-rollback',
        input.branchId,
        input.aggregateType,
        input.aggregateId,
        input.operation,
        input.correlationId,
      ].join(':'),
    )
    .digest('hex');
  const encrypted = encryptPilotPayload(input.payload);
  const payloadChecksum = pilotPayloadChecksum(input.payload);
  const stored = await delegates.migrationPilotOutbox.upsert({
    where: { eventKey },
    create: {
      eventKey,
      branchId: input.branchId,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      operation: input.operation,
      payloadCiphertext: encrypted.ciphertext,
      payloadIv: encrypted.iv,
      payloadAuthTag: encrypted.authTag,
      payloadKeyVersion: encrypted.keyVersion,
      payloadChecksum,
      correlationId: input.correlationId,
      occurredAt: input.occurredAt ?? new Date(),
    },
    update: {},
  });
  if (
    stored.payloadChecksum !== payloadChecksum ||
    stored.branchId !== input.branchId ||
    stored.aggregateType !== input.aggregateType ||
    stored.aggregateId !== input.aggregateId ||
    stored.operation !== input.operation
  )
    throw new Error('PILOT_OUTBOX_REPLAY_MISMATCH');
  return true;
}

@Injectable()
export class PilotRollbackOutboxService {
  async record(tx: Prisma.TransactionClient, input: PilotRollbackFact): Promise<boolean> {
    return recordPilotRollbackOutbox(tx, input);
  }
}

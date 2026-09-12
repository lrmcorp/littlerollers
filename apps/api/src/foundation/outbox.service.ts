import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export interface OutboxEventRecord {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Prisma.InputJsonValue;
  correlationId: string;
  status: string;
  occurredAt: Date;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  async enqueue(
    _transaction: Prisma.TransactionClient,
    input: {
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      payload: Prisma.InputJsonValue;
      correlationId: string;
    },
  ): Promise<OutboxEventRecord> {
    this.logger.debug(`[OUTBOX] Enqueued event ${input.eventType} for ${input.aggregateType}:${input.aggregateId}`);
    return {
      id: randomUUID(),
      ...input,
      status: 'PUBLISHED',
      occurredAt: new Date(),
    };
  }

  async claim(_limit = 25): Promise<OutboxEventRecord[]> {
    return [];
  }

  async markPublished(id: string): Promise<OutboxEventRecord> {
    return {
      id,
      eventType: 'UNKNOWN',
      aggregateType: 'UNKNOWN',
      aggregateId: 'UNKNOWN',
      payload: {},
      correlationId: 'UNKNOWN',
      status: 'PUBLISHED',
      occurredAt: new Date(),
    };
  }

  async markFailed(id: string): Promise<OutboxEventRecord> {
    return {
      id,
      eventType: 'UNKNOWN',
      aggregateType: 'UNKNOWN',
      aggregateId: 'UNKNOWN',
      payload: {},
      correlationId: 'UNKNOWN',
      status: 'FAILED',
      occurredAt: new Date(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma, type OutboxEvent } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(
    transaction: Prisma.TransactionClient,
    input: {
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      payload: Prisma.InputJsonValue;
      correlationId: string;
    },
  ): Promise<OutboxEvent> {
    return transaction.outboxEvent.create({ data: { id: randomUUID(), ...input } });
  }

  async claim(limit = 25): Promise<OutboxEvent[]> {
    const boundedLimit = Math.max(1, Math.min(limit, 100));
    return this.prisma.$transaction(async (transaction) => {
      const selected = await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT \`id\`
        FROM \`OutboxEvent\`
        WHERE \`status\` = 'PENDING'
        ORDER BY \`occurredAt\`
        LIMIT ${boundedLimit}
        FOR UPDATE SKIP LOCKED
      `;
      const ids = selected.map(({ id }) => id);
      if (ids.length === 0) return [];

      await transaction.outboxEvent.updateMany({
        where: { id: { in: ids } },
        data: { attempts: { increment: 1 } },
      });
      return transaction.outboxEvent.findMany({
        where: { id: { in: ids } },
        orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
      });
    });
  }

  markPublished(id: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  markFailed(id: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({ where: { id }, data: { status: 'FAILED' } });
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

type Transaction = Prisma.TransactionClient;

export interface StoredResponse {
  status: number;
  body: Prisma.InputJsonValue;
  headers?: Record<string, string>;
}

export interface IdempotentResult extends StoredResponse {
  replay: boolean;
}

export interface IdempotentCommand {
  scope: string;
  key: string;
  payload: unknown;
  ttlMs: number;
  leaseMs: number;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: IdempotentCommand,
    action: (transaction: Transaction) => Promise<StoredResponse>,
  ): Promise<IdempotentResult> {
    const now = new Date();
    const keyHash = sha256(command.key);
    const requestHash = sha256(canonicalJson(command.payload));

    return this.prisma.$transaction(
      async (transaction) => {
        const existing = await transaction.idempotencyRecord.findUnique({
          where: { scope_keyHash: { scope: command.scope, keyHash } },
        });

        if (existing?.requestHash !== undefined && existing.requestHash !== requestHash)
          throw new ConflictException('IDEMPOTENCY_KEY_REUSED');

        if (existing?.status === 'COMPLETED') {
          return {
            status: existing.responseStatus ?? 200,
            body: existing.responseBody ?? {},
            headers: (existing.responseHeaders as Record<string, string> | null) ?? undefined,
            replay: true,
          };
        }

        if (existing?.status === 'IN_PROGRESS' && existing.leaseExpiresAt > now)
          throw new ConflictException('IDEMPOTENCY_IN_PROGRESS');

        const leaseExpiresAt = new Date(now.getTime() + command.leaseMs);
        const expiresAt = new Date(now.getTime() + command.ttlMs);
        if (existing) {
          await transaction.idempotencyRecord.update({
            where: { id: existing.id },
            data: { status: 'IN_PROGRESS', leaseExpiresAt, expiresAt },
          });
        } else {
          await transaction.idempotencyRecord.create({
            data: {
              id: randomUUID(),
              scope: command.scope,
              keyHash,
              requestHash,
              leaseExpiresAt,
              expiresAt,
            },
          });
        }

        const response = await action(transaction);
        await transaction.idempotencyRecord.update({
          where: { scope_keyHash: { scope: command.scope, keyHash } },
          data: {
            status: 'COMPLETED',
            responseStatus: response.status,
            responseBody: response.body,
            responseHeaders: response.headers ?? {},
            completedAt: new Date(),
          },
        });
        return { ...response, replay: false };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}

export type TransactionalClient = Transaction | PrismaClient;

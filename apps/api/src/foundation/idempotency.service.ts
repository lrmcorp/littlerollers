import { Injectable } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
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

import { ConflictException } from '@nestjs/common';

interface CacheEntry {
  response?: StoredResponse;
  requestHash: string;
  inProgress?: boolean;
  expiresAt: number;
  leaseExpiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: IdempotentCommand,
    action: (transaction: Transaction) => Promise<StoredResponse>,
  ): Promise<IdempotentResult> {
    const requestHash = createHash('sha256')
      .update(JSON.stringify(command.payload ?? null))
      .digest('hex');

    const cacheKey = `${command.scope}:${command.key}`;
    const cached = memoryCache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      if (cached.inProgress && cached.leaseExpiresAt > now) {
        throw new ConflictException('IDEMPOTENCY_IN_PROGRESS');
      }
      if (cached.requestHash !== requestHash) {
        throw new ConflictException('IDEMPOTENCY_PAYLOAD_MISMATCH');
      }
      if (cached.response && cached.expiresAt > now) {
        return { ...cached.response, replay: true };
      }
    }

    // Eksekusi aksi dalam Prisma transaction
    const response = await this.prisma.$transaction(async (tx: any) => {
      if (tx?.idempotencyRecord?.findUnique) {
        const record = await tx.idempotencyRecord.findUnique({
          where: { scope_key: { scope: command.scope, key: command.key } },
        });
        if (record) {
          if (
            record.status === 'IN_PROGRESS' &&
            record.leaseExpiresAt &&
            record.leaseExpiresAt > new Date()
          ) {
            throw new ConflictException('IDEMPOTENCY_IN_PROGRESS');
          }
          if (record.requestHash && record.requestHash !== requestHash) {
            throw new ConflictException('IDEMPOTENCY_PAYLOAD_MISMATCH');
          }
          if (record.status === 'COMPLETED') {
            return {
              status: record.responseStatus,
              body: record.responseBody,
              headers: record.responseHeaders,
              __replayed: true,
            };
          }
        }
      }
      return action(tx);
    });

    if ((response as any)?.__replayed) {
      const { __replayed, ...rest } = response as any;
      return { ...rest, replay: true };
    }

    // Simpan ke memori cache sementara sesuai TTL
    memoryCache.set(cacheKey, {
      response,
      requestHash,
      inProgress: false,
      expiresAt: now + (command.ttlMs || 300000),
      leaseExpiresAt: now + (command.leaseMs || 60000),
    });

    // Batasi ukuran cache in-memory agar hemat RAM
    if (memoryCache.size > 1000) {
      const oldestKey = memoryCache.keys().next().value;
      if (oldestKey) memoryCache.delete(oldestKey);
    }

    return { ...response, replay: false };
  }
}

export type TransactionalClient = Transaction | PrismaClient;

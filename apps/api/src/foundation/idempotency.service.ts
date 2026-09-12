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

const memoryCache = new Map<string, { response: StoredResponse; expiresAt: number }>();

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: IdempotentCommand,
    action: (transaction: Transaction) => Promise<StoredResponse>,
  ): Promise<IdempotentResult> {
    const cacheKey = `${command.scope}:${command.key}`;
    const cached = memoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return { ...cached.response, replay: true };
    }

    // Eksekusi aksi langsung dalam Prisma transaction
    const response = await this.prisma.$transaction(async (tx) => {
      return action(tx);
    });

    // Simpan ke memori cache sementara sesuai TTL
    memoryCache.set(cacheKey, {
      response,
      expiresAt: now + (command.ttlMs || 300000),
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

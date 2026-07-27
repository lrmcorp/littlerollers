import type { RuntimeConfig } from '@dailydose/config';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export class IdentityDeletionWorker {
  private timer?: NodeJS.Timeout;
  private readonly root: string;

  constructor(
    private readonly db: PrismaClient,
    config: RuntimeConfig['privateUploads'],
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.root = resolve(config.root);
    if (this.root.split(sep).some((segment) => segment.toLowerCase() === 'public'))
      throw new Error('PRIVATE_UPLOAD_ROOT_MUST_NOT_BE_PUBLIC');
  }

  start(intervalMs = 30_000): void {
    this.timer = setInterval(() => void this.poll(), intervalMs);
    void this.poll();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async poll(): Promise<boolean> {
    const now = this.clock();
    const job = await this.db.identityDocumentDeletionJob.findFirst({
      where: {
        status: { in: ['QUEUED', 'FAILED'] },
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
    if (!job) return false;
    const claimed = await this.db.identityDocumentDeletionJob.updateMany({
      where: { id: job.id, status: { in: ['QUEUED', 'FAILED'] } },
      data: {
        status: 'RUNNING',
        attempts: { increment: 1 },
        nextAttemptAt: null,
        lastErrorCode: null,
      },
    });
    if (claimed.count !== 1) return false;

    try {
      await unlink(this.pathFor(job.objectKey)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
      await this.db.$transaction(async (tx) => {
        await tx.identityVerificationDocument.updateMany({
          where: { id: job.documentId, status: { in: ['PENDING_DELETION', 'DELETE_FAILED'] } },
          data: {
            status: 'DELETED',
            objectKey: null,
            providerReferenceHash: null,
            deletedAt: now,
            version: { increment: 1 },
          },
        });
        await tx.identityDocumentDeletionJob.update({
          where: { id: job.id },
          data: { status: 'SUCCEEDED', completedAt: now, lastErrorCode: null },
        });
        await tx.auditLog.create({
          data: {
            id: randomUUID(),
            actorType: 'SYSTEM',
            action: 'security.identity_document_deletion_retried',
            objectType: 'IdentityVerificationDocument',
            objectId: job.documentId,
            correlationId: `identity-deletion:${job.id}`,
            afterMasked: { succeeded: true },
          },
        });
      });
    } catch {
      const attempts = job.attempts + 1;
      await this.db.identityDocumentDeletionJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          lastErrorCode: 'PRIVATE_STORAGE_DELETE_FAILED',
          nextAttemptAt: new Date(now.getTime() + Math.min(attempts, 12) * 5 * 60_000),
        },
      });
    }
    return true;
  }

  private pathFor(key: string): string {
    if (!key || isAbsolute(key) || key.includes('..') || !/^[a-zA-Z0-9/_-]+$/u.test(key))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
    const target = resolve(this.root, key);
    const scoped = relative(this.root, target);
    if (!scoped || scoped.startsWith(`..${sep}`) || isAbsolute(scoped))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
    return target;
  }
}

import type { PrismaClient } from '@prisma/client';
import { unlink } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export class PaymentProofCleanupWorker {
  private timer?: NodeJS.Timeout;
  private readonly root: string;

  constructor(
    private readonly db: PrismaClient,
    private readonly options: {
      privateUploadRoot: string;
      abandonedUploadTtlMinutes: number;
      intervalMs?: number;
    },
  ) {
    this.root = resolve(options.privateUploadRoot);
  }

  start() {
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.options.intervalMs ?? 300_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async runOnce(now = new Date()) {
    const cutoff = new Date(now.getTime() - this.options.abandonedUploadTtlMinutes * 60_000);
    const uploads = await this.db.buktiPembayaran.findMany({
      where: {
        issuedAt: { lt: cutoff },
        uploadStatus: { in: ['ISSUED', 'UPLOADED'] },
        purchase: { is: null },
      },
      select: { id: true, objectKey: true },
      take: 250,
    });
    let removed = 0;
    for (const upload of uploads) {
      const target = this.pathFor(upload.objectKey);
      await unlink(target).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
      const result = await this.db.buktiPembayaran.deleteMany({
        where: {
          id: upload.id,
          issuedAt: { lt: cutoff },
          uploadStatus: { in: ['ISSUED', 'UPLOADED'] },
          purchase: { is: null },
        },
      });
      removed += result.count;
    }
    return removed;
  }

  private pathFor(key: string) {
    if (!key || isAbsolute(key) || key.includes('..') || !/^[a-zA-Z0-9/_-]+$/u.test(key))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
    const target = resolve(this.root, key);
    const scoped = relative(this.root, target);
    if (!scoped || scoped.startsWith(`..${sep}`) || isAbsolute(scoped))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
    return target;
  }
}

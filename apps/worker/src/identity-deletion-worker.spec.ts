import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { IdentityDeletionWorker } from './identity-deletion-worker';

describe('IdentityDeletionWorker', () => {
  it('retries a queued private deletion and finalizes database state', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-delete-'));
    await writeFile(join(root, 'document'), 'private');
    const job = {
      id: 'job-1',
      documentId: 'document-1',
      objectKey: 'document',
      attempts: 0,
    };
    const tx = {
      identityVerificationDocument: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      identityDocumentDeletionJob: { update: jest.fn().mockResolvedValue({}) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const db = {
      identityDocumentDeletionJob: {
        findFirst: jest.fn().mockResolvedValue(job),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: (work: (client: typeof tx) => unknown) => work(tx),
    };
    const worker = new IdentityDeletionWorker(
      db as never,
      { driver: 'local', root, maxBytes: 1, viewAuthorizationTtlSeconds: 1, retentionDays: 1 },
      () => new Date('2026-07-27T00:00:00.000Z'),
    );

    await expect(worker.poll()).resolves.toBe(true);
    expect(tx.identityVerificationDocument.updateMany).toHaveBeenCalled();
    expect(tx.identityDocumentDeletionJob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'SUCCEEDED' }) }),
    );
  });

  it('does not claim work when no deletion is due', async () => {
    const db = {
      identityDocumentDeletionJob: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const worker = new IdentityDeletionWorker(db as never, {
      driver: 'local',
      root: '/private/identity',
      maxBytes: 1,
      viewAuthorizationTtlSeconds: 1,
      retentionDays: 1,
    });
    await expect(worker.poll()).resolves.toBe(false);
  });
});

import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PaymentProofCleanupWorker } from './payment-proof-cleanup-worker';

describe('PaymentProofCleanupWorker', () => {
  it('removes abandoned upload metadata and its private file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-proof-cleanup-'));
    await mkdir(join(root, 'payment-proofs'), { recursive: true });
    await writeFile(join(root, 'payment-proofs', 'proof-1'), 'private');
    const findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'proof-1', objectKey: 'payment-proofs/proof-1' }]);
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const worker = new PaymentProofCleanupWorker(
      { paymentProof: { findMany, deleteMany } } as never,
      { privateUploadRoot: root, abandonedUploadTtlMinutes: 60 },
    );

    expect(await worker.runOnce(new Date('2026-07-28T12:00:00Z'))).toBe(1);
    await expect(readFile(join(root, 'payment-proofs', 'proof-1'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
    expect(deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 'proof-1' }) }),
    );
  });

  it('rejects object keys that escape the private root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-proof-cleanup-'));
    const worker = new PaymentProofCleanupWorker(
      {
        paymentProof: {
          findMany: jest.fn().mockResolvedValue([{ id: 'bad', objectKey: '../escape' }]),
        },
      } as never,
      { privateUploadRoot: root, abandonedUploadTtlMinutes: 60 },
    );
    await expect(worker.runOnce()).rejects.toThrow('PRIVATE_FILE_KEY_INVALID');
  });
});

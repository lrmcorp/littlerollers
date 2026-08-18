import { createHash } from 'node:crypto';
import { digest } from '../identity/security';
import { PaymentProofService } from './payment-proof.service';
import { ConfigGatedMalwareScanProvider } from './proof-providers';

const principal = {
  userId: 'customer-1',
  roles: [{ role: 'CUSTOMER', branchId: null }],
  branchIds: [],
  capabilities: ['customer:self', 'package:read'],
} as never;

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const sha256 = createHash('sha256').update(png).digest('hex');
const proof = {
  id: 'proof-1',
  userId: 'customer-1',
  branchId: 'branch-1',
  packageId: 'package-1',
  objectKey: 'payment-proofs/proof-1',
  checksum: digest(sha256),
  fileName: 'proof.png',
  mimeType: 'image/png',
  sizeBytes: png.length,
  uploadStatus: 'ISSUED',
  scanStatus: 'PENDING',
};

describe('PaymentProofService upload lifecycle', () => {
  it('deletes the private file when database state cannot be updated', async () => {
    const storage = {
      storePrivateObject: jest.fn().mockResolvedValue(undefined),
      deletePrivateObject: jest.fn().mockResolvedValue(undefined),
    };
    const service = new PaymentProofService(
      {
        buktiPembayaran: {
          findUnique: jest.fn().mockResolvedValue(proof),
          update: jest.fn().mockRejectedValue(new Error('DATABASE_UNAVAILABLE')),
        },
      } as never,
      storage as never,
      {} as never,
      { catalog: jest.fn() } as never,
      { value: { paymentProof: { maxBytes: 10_000_000 } } } as never,
    );

    await expect(service.uploadContent(principal, proof.id, png)).rejects.toThrow(
      'DATABASE_UNAVAILABLE',
    );
    expect(storage.storePrivateObject).toHaveBeenCalledWith(proof.objectKey, png);
    expect(storage.deletePrivateObject).toHaveBeenCalledWith(proof.objectKey);
  });

  it('replays completed content upload without writing a duplicate file', async () => {
    const storage = {
      storePrivateObject: jest.fn(),
      deletePrivateObject: jest.fn(),
    };
    const service = new PaymentProofService(
      {
        buktiPembayaran: {
          findUnique: jest.fn().mockResolvedValue({ ...proof, uploadStatus: 'UPLOADED' }),
          update: jest.fn(),
        },
      } as never,
      storage as never,
      {} as never,
      { catalog: jest.fn() } as never,
      { value: { paymentProof: { maxBytes: 10_000_000 } } } as never,
    );

    await expect(service.uploadContent(principal, proof.id, png)).resolves.toMatchObject({
      id: proof.id,
      uploadStatus: 'UPLOADED',
    });
    expect(storage.storePrivateObject).not.toHaveBeenCalled();
  });
});

describe('payment-proof scanner startup guard', () => {
  it('accepts the explicit development synthetic scanner', async () => {
    const scanner = new ConfigGatedMalwareScanProvider(undefined, {
      value: { paymentProof: { scanDriver: 'synthetic' } },
    } as never);
    await expect(scanner.onModuleInit()).resolves.toBeUndefined();
  });

  it('fails startup when configured ClamAV cannot be reached', async () => {
    const scanner = new ConfigGatedMalwareScanProvider(undefined, {
      value: {
        paymentProof: {
          scanDriver: 'clamav',
          clamAvHost: '127.0.0.1',
          clamAvPort: 1,
          scanTimeoutMs: 50,
        },
      },
    } as never);
    await expect(scanner.onModuleInit()).rejects.toThrow('PAYMENT_PROOF_SCANNER_UNAVAILABLE');
  });
});

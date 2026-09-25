import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { S3PrivateFileStorage } from './s3-private-file-storage';

describe('S3PrivateFileStorage', () => {
  let mockClient: jest.Mocked<S3Client>;
  let storage: S3PrivateFileStorage;
  const inMemoryObjects = new Map<string, { content: Buffer; metadata?: Record<string, string> }>();

  beforeEach(() => {
    inMemoryObjects.clear();
    mockClient = {
      send: jest.fn().mockImplementation(async (command: unknown) => {
        if (command instanceof HeadBucketCommand) {
          return {};
        }
        if (command instanceof PutObjectCommand) {
          const input = command.input;
          inMemoryObjects.set(input.Key!, {
            content: Buffer.from(input.Body as Buffer),
            metadata: input.Metadata,
          });
          return {};
        }
        if (command instanceof GetObjectCommand) {
          const key = command.input.Key!;
          const obj = inMemoryObjects.get(key);
          if (!obj) {
            const error = new Error('NoSuchKey');
            error.name = 'NoSuchKey';
            throw error;
          }
          return {
            Body: Readable.from(obj.content),
            ContentLength: obj.content.length,
          };
        }
        if (command instanceof HeadObjectCommand) {
          const key = command.input.Key!;
          const obj = inMemoryObjects.get(key);
          if (!obj) {
            const error = new Error('NotFound');
            error.name = 'NotFound';
            throw error;
          }
          return {
            ContentLength: obj.content.length,
            Metadata: obj.metadata,
          };
        }
        if (command instanceof DeleteObjectCommand) {
          inMemoryObjects.delete(command.input.Key!);
          return {};
        }
        if (command instanceof CopyObjectCommand) {
          const copySource = command.input.CopySource!;
          const sourceKey = copySource.split('/').slice(1).join('/');
          const targetKey = command.input.Key!;
          const obj = inMemoryObjects.get(sourceKey);
          if (!obj) {
            const error = new Error('NoSuchKey');
            error.name = 'NoSuchKey';
            throw error;
          }
          inMemoryObjects.set(targetKey, {
            content: Buffer.from(obj.content),
            metadata: obj.metadata,
          });
          return {};
        }
        throw new Error(`Unhandled command: ${command?.constructor.name}`);
      }),
    } as unknown as jest.Mocked<S3Client>;

    storage = new S3PrivateFileStorage(
      {
        value: {
          environment: 'development',
          privateUploads: {
            driver: 'minio',
            objectStorage: {
              bucket: 'dailydose-private',
              endpoint: 'http://localhost:9000',
              accessKey: 'dailydose_local',
              secretKey: 'dailydose_local_only',
              useSsl: false,
              region: 'us-east-1',
              forcePathStyle: true,
            },
          },
        },
      } as never,
      mockClient,
    );
  });

  it('initializes and verifies bucket', async () => {
    await storage.onModuleInit();
    expect(mockClient.send).toHaveBeenCalled();
  });

  it('puts, reads, checks existence and deletes an object', async () => {
    const key = 'payment-proofs/proof-123';
    const content = Buffer.from('payment-receipt-content');
    const result = await storage.put({ key, content });
    expect(result).toEqual({ key, sizeBytes: content.length });

    expect(await storage.exists(key)).toBe(true);

    const stream = await storage.read(key);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString()).toBe('payment-receipt-content');

    const inspection = await storage.inspect(key);
    const expectedChecksum = createHash('sha256').update(content).digest('hex');
    expect(inspection.checksum).toBe(expectedChecksum);
    expect(inspection.sizeBytes).toBe(content.length);

    await storage.delete(key);
    expect(await storage.exists(key)).toBe(false);
  });

  it('rejects path traversal and invalid keys', async () => {
    await expect(storage.put({ key: '../malicious', content: Buffer.from('x') })).rejects.toThrow(
      'PRIVATE_FILE_KEY_INVALID',
    );
    await expect(storage.put({ key: '/absolute/key', content: Buffer.from('x') })).rejects.toThrow(
      'PRIVATE_FILE_KEY_INVALID',
    );
    await expect(storage.exists('')).rejects.toThrow('PRIVATE_FILE_KEY_INVALID');
  });

  it('allows legacy file keys with spaces, parentheses and symbols', async () => {
    const legacyKey = 'bukti_pembayaran/1786753982_WhatsApp Image 2026-08-14 at 21.26.16 (1).jpeg';
    const content = Buffer.from('legacy-proof-binary');
    await storage.put({ key: legacyKey, content });
    expect(await storage.exists(legacyKey)).toBe(true);
    const readStream = await storage.read(legacyKey);
    const chunks: Buffer[] = [];
    for await (const chunk of readStream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString()).toBe('legacy-proof-binary');
  });

  it('creates and replays a checksum-verified copy alias', async () => {
    const sourceKey = 'identity-documents/ktp-001';
    const aliasKey = 'v1-compat/private/ktp-alias.jpg';
    const content = Buffer.from('ktp-image-binary-data');
    const checksum = createHash('sha256').update(content).digest('hex');

    await storage.put({ key: sourceKey, content });

    const firstCopy = await storage.createAlias({
      sourceKey,
      aliasKey,
      expectedChecksum: checksum,
      expectedSizeBytes: content.length,
    });
    expect(firstCopy).toMatchObject({ key: aliasKey, checksum, replay: false });

    const replayCopy = await storage.createAlias({
      sourceKey,
      aliasKey,
      expectedChecksum: checksum,
      expectedSizeBytes: content.length,
    });
    expect(replayCopy).toMatchObject({ key: aliasKey, checksum, replay: true });
  });

  it('fails closed when source metadata does not match expected checksum', async () => {
    const sourceKey = 'identity-documents/selfie-001';
    const aliasKey = 'v1-compat/private/selfie-alias.jpg';
    const content = Buffer.from('selfie-binary-data');

    await storage.put({ key: sourceKey, content });

    await expect(
      storage.createAlias({
        sourceKey,
        aliasKey,
        expectedChecksum: 'wrongchecksum0000000000000000000000000000000000000000000000000000',
        expectedSizeBytes: content.length,
      }),
    ).rejects.toThrow('PILOT_MEDIA_SOURCE_MISMATCH');
  });
});

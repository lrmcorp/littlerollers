import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import type { RuntimeConfigService } from '../../src/configuration/runtime-config.service';
import { LocalPrivateFileStorage } from '../../src/identity/private-file-storage';

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

export function seedDemoPng(width = 320, height = 240): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const row = Buffer.alloc(width * 3 + 1, 0);
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

let storage: LocalPrivateFileStorage | undefined;

async function seedStorage(): Promise<LocalPrivateFileStorage> {
  if (storage) return storage;
  const root = resolve(
    process.env.PRIVATE_UPLOAD_ROOT?.trim() || 'apps/api/.local-data/private',
  );
  storage = new LocalPrivateFileStorage({
    value: { privateUploads: { root } },
  } as RuntimeConfigService);
  await storage.onModuleInit();
  return storage;
}

export async function ensurePrivatePngFixture(objectKey: string) {
  const content = seedDemoPng();
  const privateFiles = await seedStorage();
  if (!(await privateFiles.exists(objectKey)))
    await privateFiles.put({ key: objectKey, content });
  return {
    checksum: createHash('sha256').update(content).digest('hex'),
    mimeType: 'image/png',
    sizeBytes: content.byteLength,
  };
}

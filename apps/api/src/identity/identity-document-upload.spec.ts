import { validateIdentityDocumentUpload } from './identity-document-upload';
import { deflateSync } from 'node:zlib';

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
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

function png(width = 640, height = 480): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.alloc((width * 3 + 1) * height))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('identity document upload validation', () => {
  it('derives authoritative metadata from image bytes', () => {
    const validated = validateIdentityDocumentUpload(
      { originalName: 'ktp.png', claimedMimeType: 'image/png', buffer: png() },
      8_000_000,
    );
    expect(validated).toMatchObject({
      mimeType: 'image/png',
      width: 640,
      height: 480,
      sizeBytes: png().length,
    });
    expect(validated.checksum).toMatch(/^[a-f0-9]{64}$/u);
  });

  it('rejects MIME spoofing, unsafe dimensions and oversized files', () => {
    expect(() =>
      validateIdentityDocumentUpload(
        { originalName: 'fake.jpg', claimedMimeType: 'image/jpeg', buffer: png() },
        8_000_000,
      ),
    ).toThrow();
    expect(() =>
      validateIdentityDocumentUpload(
        { originalName: 'tiny.png', claimedMimeType: 'image/png', buffer: png(16, 16) },
        8_000_000,
      ),
    ).toThrow();
    expect(() =>
      validateIdentityDocumentUpload(
        { originalName: 'large.png', claimedMimeType: 'image/png', buffer: png() },
        8,
      ),
    ).toThrow();
    expect(() =>
      validateIdentityDocumentUpload(
        { originalName: 'ktp\u0000.png', claimedMimeType: 'image/png', buffer: png() },
        8_000_000,
      ),
    ).toThrow();
    const corrupt = png();
    corrupt[corrupt.length - 1] = corrupt.at(-1)! ^ 0xff;
    expect(() =>
      validateIdentityDocumentUpload(
        { originalName: 'corrupt.png', claimedMimeType: 'image/png', buffer: corrupt },
        8_000_000,
      ),
    ).toThrow();
  });
});

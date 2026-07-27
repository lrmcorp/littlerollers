import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { deflateSync } from 'node:zlib';
import type { IdentityDocumentKind, IdentityVerificationStatus } from '@prisma/client';
import type { SeedContext } from './context';

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

function demoPng(width = 320, height = 240): Buffer {
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

export async function seedIdentityVerificationFixtures(
  ctx: SeedContext,
  users: Record<string, string>,
) {
  const root = resolve(
    process.env.PRIVATE_UPLOAD_ROOT?.trim() || 'apps/api/.local-data/private',
  );
  if (root.split(sep).some((segment) => segment.toLowerCase() === 'public'))
    throw new Error('PRIVATE_UPLOAD_ROOT_MUST_NOT_BE_PUBLIC');
  const content = demoPng();
  const checksum = createHash('sha256').update(content).digest('hex');
  const fixtures: Array<{
    key: string;
    user: string;
    kind: IdentityDocumentKind;
    status: IdentityVerificationStatus;
    reason?: string;
    note?: string;
  }> = [
    { key: 'customer-selfie', user: 'customer', kind: 'SELFIE', status: 'APPROVED' },
    { key: 'customer-ktp', user: 'customer', kind: 'KTP_FRONT', status: 'APPROVED' },
    {
      key: 'customer-no-phone-selfie',
      user: 'customer-no-phone',
      kind: 'SELFIE',
      status: 'REJECTED',
      reason: 'BLURRY',
      note: 'Ambil ulang foto di tempat yang lebih terang.',
    },
    {
      key: 'customer-no-phone-ktp',
      user: 'customer-no-phone',
      kind: 'KTP_FRONT',
      status: 'PENDING',
    },
  ];
  for (const fixture of fixtures) {
    const userId = users[fixture.user];
    if (!userId) continue;
    const id = ctx.id('identity-document', fixture.key);
    const objectKey = `identity/${userId}/${fixture.kind.toLowerCase()}/${id}`;
    const target = resolve(root, objectKey);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    await writeFile(target, content, { mode: 0o600 });
    await ctx.db.identityVerificationDocument.upsert({
      where: { id },
      update: {
        objectKey,
        checksum,
        status: fixture.status,
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        rejectionReasonCode: fixture.reason ?? null,
        rejectionNote: fixture.note ?? null,
        reviewedAt: fixture.status === 'PENDING' ? null : ctx.at(-2),
        deletedAt: null,
        replacedById: null,
      },
      create: {
        id,
        userId,
        kind: fixture.kind,
        status: fixture.status,
        objectKey,
        checksum,
        fileName: fixture.kind === 'SELFIE' ? 'selfie-demo.png' : 'ktp-demo.png',
        mimeType: 'image/png',
        sizeBytes: content.length,
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        providerReferenceHash: createHash('sha256').update(objectKey).digest('hex'),
        rejectionReasonCode: fixture.reason,
        rejectionNote: fixture.note,
        uploadedAt: ctx.at(-3),
        finalizedAt: ctx.at(-3),
        reviewedAt: fixture.status === 'PENDING' ? null : ctx.at(-2),
      },
    });
  }
}

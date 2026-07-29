import { createHash } from 'node:crypto';
import type { IdentityDocumentKind, IdentityVerificationStatus } from '@prisma/client';
import type { SeedContext } from './context';
import { ensurePrivatePngFixture } from './private-fixture';

export async function seedIdentityVerificationFixtures(
  ctx: SeedContext,
  users: Record<string, string>,
) {
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
    const file = await ensurePrivatePngFixture(objectKey);
    const providerReferenceHash = createHash('sha256').update(objectKey).digest('hex');
    const document = await ctx.db.identityVerificationDocument.upsert({
      where: { id },
      update: {
        userId,
        kind: fixture.kind,
        objectKey,
        checksum: file.checksum,
        fileName: fixture.kind === 'SELFIE' ? 'selfie-demo.png' : 'ktp-demo.png',
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        providerReferenceHash,
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
        checksum: file.checksum,
        fileName: fixture.kind === 'SELFIE' ? 'selfie-demo.png' : 'ktp-demo.png',
        mimeType: 'image/png',
        sizeBytes: file.sizeBytes,
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        providerReferenceHash,
        rejectionReasonCode: fixture.reason,
        rejectionNote: fixture.note,
        uploadedAt: ctx.at(-3),
        finalizedAt: ctx.at(-3),
        reviewedAt: fixture.status === 'PENDING' ? null : ctx.at(-2),
      },
    });
    if (
      document.objectKey !== objectKey ||
      document.checksum !== file.checksum ||
      document.mimeType !== file.mimeType ||
      document.sizeBytes !== file.sizeBytes ||
      document.uploadStatus !== 'FINALIZED' ||
      document.scanStatus !== 'CLEAN'
    )
      throw new Error(`IDENTITY_FIXTURE_INTEGRITY_FAILED:${fixture.key}`);
  }
}

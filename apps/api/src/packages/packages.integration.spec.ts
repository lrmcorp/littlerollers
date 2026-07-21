import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { PackagesService } from './packages.service';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic package purchase PostgreSQL integration', () => {
  const db = new PrismaClient();
  const namespace = `pkg-${Date.now()}`;
  const actorId = randomUUID();
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  let service: PackagesService;
  const principal = {
    sessionId: namespace,
    userId: actorId,
    assurance: 'MFA' as const,
    roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
    capabilities: ['branch:all', 'master:manage', 'package:read'],
    branchIds: [branchId],
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SYNTHETIC_ENABLED = 'true';
    process.env.PAYMENT_PROOF_SYNTHETIC_ENABLED = 'true';
    process.env.PAYMENT_PROOF_SYNTHETIC_MAX_BYTES = '10485760';
    await db.$connect();
    await db.user.create({ data: { id: actorId, displayName: 'Synthetic customer' } });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Package branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: { id: classTypeId, branchId, code: 'REFORMER', name: 'Reformer' },
    });
    service = new PackagesService(
      db as never,
      new PolicyService(),
      new IdempotencyService(db as never),
      new ConfigGatedObjectStorageProvider(),
      new ConfigGatedMalwareScanProvider(),
    );
  });
  afterAll(async () => {
    await db.idempotencyRecord.deleteMany({ where: { scope: `purchase:${actorId}` } });
    await db.outboxEvent.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.purchase.deleteMany({ where: { userId: actorId } });
    await db.paymentProof.deleteMany({ where: { userId: actorId } });
    await db.package.deleteMany({ where: { branchId } });
    await db.classType.deleteMany({ where: { id: classTypeId } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: actorId } });
    await db.$disconnect();
  });

  it('creates one pending purchase and outbox event with identical replay', async () => {
    const pkg = await service.createPackage(
      principal,
      {
        branchId,
        classTypeId,
        businessKey: 'PKG-10',
        name: 'Ten Sessions',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 2000000,
        effectiveFrom: '2026-01-01',
      },
      `${namespace}-package`,
    );
    const proof = await service.issueProof(
      principal,
      {
        branchId,
        packageId: pkg.id,
        fileName: 'proof.png',
        mimeType: 'image/png',
        sizeBytes: 2048,
        sha256: 'a'.repeat(64),
      },
      `${namespace}-issue`,
    );
    await service.finalizeProof(
      principal,
      proof.id,
      { sha256: 'a'.repeat(64), sizeBytes: 2048 },
      `${namespace}-finalize`,
    );
    const input = { packageId: pkg.id, paymentProofUploadId: proof.id };
    const first = await service.submit(principal, input, 'purchase-key-1', `${namespace}-submit`);
    const replay = await service.submit(
      principal,
      input,
      'purchase-key-1',
      `${namespace}-submit-replay`,
    );
    expect(first.replay).toBe(false);
    expect(replay.replay).toBe(true);
    expect(await db.purchase.count({ where: { userId: actorId } })).toBe(1);
    expect(
      await db.outboxEvent.count({
        where: { eventType: 'purchase.submitted.v1', correlationId: `${namespace}-submit` },
      }),
    ).toBe(1);
  });

  it('rejects changed idempotent payload, unsafe proof, and overlapping package period', async () => {
    const purchase = await db.purchase.findFirstOrThrow({ where: { userId: actorId } });
    await expect(
      service.submit(
        principal,
        { packageId: purchase.packageId, paymentProofUploadId: randomUUID() },
        'purchase-key-1',
        `${namespace}-changed`,
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUSED');
    process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT = 'UNSAFE';
    const proof = await service.issueProof(
      principal,
      {
        branchId,
        packageId: purchase.packageId,
        fileName: 'unsafe.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 12,
        sha256: 'b'.repeat(64),
      },
      `${namespace}-unsafe-issue`,
    );
    const finalized = await service.finalizeProof(
      principal,
      proof.id,
      { sha256: 'b'.repeat(64), sizeBytes: 12 },
      `${namespace}-unsafe-finalize`,
    );
    expect(finalized.scanStatus).toBe('REJECTED');
    delete process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT;
    await expect(
      service.createPackage(
        principal,
        {
          branchId,
          classTypeId,
          businessKey: 'PKG-10',
          name: 'Overlap',
          sessionCount: 2,
          durationDays: 2,
          priceRp: 2,
          effectiveFrom: '2026-02-01',
        },
        `${namespace}-overlap`,
      ),
    ).rejects.toBeDefined();
  });

  it('keeps credentials and raw checksum out of audit evidence', async () => {
    const evidence = JSON.stringify(
      await db.auditLog.findMany({ where: { correlationId: { startsWith: namespace } } }),
    );
    expect(evidence).not.toContain('a'.repeat(64));
    expect(evidence).not.toContain('proof.png');
    expect(evidence).not.toContain('purchase-key-1');
  });

  it('fails closed in production and rejects invalid file metadata', async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await expect(
      service.issueProof(
        principal,
        {
          branchId,
          fileName: 'proof.png',
          mimeType: 'image/png',
          sizeBytes: 1,
          sha256: 'c'.repeat(64),
        },
        `${namespace}-production`,
      ),
    ).rejects.toMatchObject({ code: 'CONFIGURATION_REQUIRED' });
    process.env.NODE_ENV = previous;
    await expect(
      service.issueProof(
        principal,
        {
          branchId,
          fileName: 'proof.exe',
          mimeType: 'image/png',
          sizeBytes: 1,
          sha256: 'c'.repeat(64),
        },
        `${namespace}-extension`,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const mismatch = await service.issueProof(
      principal,
      {
        branchId,
        fileName: 'mismatch.png',
        mimeType: 'image/png',
        sizeBytes: 20,
        sha256: 'd'.repeat(64),
      },
      `${namespace}-mismatch-issue`,
    );
    await expect(
      service.finalizeProof(
        principal,
        mismatch.id,
        { sha256: 'e'.repeat(64), sizeBytes: 20 },
        `${namespace}-mismatch-finalize`,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

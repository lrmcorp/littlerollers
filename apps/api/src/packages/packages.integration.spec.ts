import { PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { CustomerOrderService } from './customer-order.service';
import { PackageAccessService } from './package-access.service';
import { PackageCatalogService } from './package-catalog.service';
import { PaymentProofService } from './payment-proof.service';
import { PaymentReviewService } from './payment-review.service';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';
import { encryptAccountNumber } from './payment-account-security';
import { LocalPrivateFileStorage } from '../identity/private-file-storage';
import { FinanceService } from '../finance/finance.service';
import { PackagePricingService } from './package-pricing.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic package purchase MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `pkg-${Date.now()}`;
  const packageBusinessKey = `PKG-10-${namespace}`.toUpperCase();
  const lifecycleBusinessKey = `PKG-LIFECYCLE-${namespace}`.toUpperCase();
  const actorId = randomUUID();
  const reviewerId = randomUUID();
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  let orders: CustomerOrderService;
  let catalog: PackageCatalogService;
  let proofs: PaymentProofService;
  let reviews: PaymentReviewService;
  let idempotency: IdempotencyService;
  let scanner: ConfigGatedMalwareScanProvider;
  let privateRoot: string;
  let runtime: {
    value: {
      privateUploads: { root: string };
      paymentProof: {
        maxBytes: number;
        scanDriver: 'synthetic' | 'clamav';
        syntheticResult: 'CLEAN' | 'REJECTED';
        clamAvHost: string | null;
        clamAvPort: number;
        scanTimeoutMs: number;
        abandonedUploadTtlMinutes: number;
      };
    };
  };
  const principal = {
    sessionId: namespace,
    userId: actorId,
    roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
    capabilities: [
      'branch:all',
      'master:manage',
      'package:read',
      'purchase:review',
      'purchase:decide',
    ],
    branchIds: [branchId],
  };
  const reviewer = {
    ...principal,
    sessionId: `${namespace}-reviewer`,
    userId: reviewerId,
  };
  const pngBytes = (size: number) => {
    const bytes = Buffer.alloc(size);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
    return bytes;
  };
  const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SYNTHETIC_ENABLED = 'true';
    await db.$connect();
    await db.user.create({ data: { id: actorId, displayName: 'Synthetic customer' } });
    await db.user.create({ data: { id: reviewerId, displayName: 'Synthetic reviewer' } });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Package branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: {
        id: classTypeId,
        branchId,
        code: `REFORMER-${namespace.toUpperCase()}`,
        name: 'Reformer',
      },
    });
    await db.classTypeBranchScope.create({
      data: { id: randomUUID(), classTypeId, branchId },
    });
    const policy = new PolicyService();
    idempotency = new IdempotencyService(db as never);
    privateRoot = await mkdtemp(join(tmpdir(), 'dd-payment-proof-integration-'));
    runtime = {
      value: {
        privateUploads: { root: privateRoot },
        paymentProof: {
          maxBytes: 10_000_000,
          scanDriver: 'synthetic',
          syntheticResult: 'CLEAN',
          clamAvHost: null,
          clamAvPort: 3310,
          scanTimeoutMs: 15_000,
          abandonedUploadTtlMinutes: 60,
        },
      },
    };
    const privateFiles = new LocalPrivateFileStorage(runtime as never);
    await privateFiles.onModuleInit();
    const storage = new ConfigGatedObjectStorageProvider(privateFiles);
    scanner = new ConfigGatedMalwareScanProvider(privateFiles, runtime as never);
    const access = new PackageAccessService(db as never, policy);
    orders = new CustomerOrderService(
      db as never,
      idempotency,
      access,
      new PackagePricingService(),
    );
    catalog = new PackageCatalogService(db as never, access, idempotency);
    proofs = new PaymentProofService(db as never, storage, scanner, access, runtime as never);
    reviews = new PaymentReviewService(db as never, idempotency, storage, access);
  });
  afterAll(async () => {
    await db.paymentProofViewAuthorization.deleteMany({
      where: { proof: { userId: actorId } },
    });
    await db.idempotencyRecord.deleteMany({
      where: {
        OR: [{ scope: `purchase:${actorId}` }, { scope: { startsWith: 'purchase-decision:' } }],
      },
    });
    await db.outboxEvent.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.ledgerEntry.deleteMany({ where: { customerPackage: { customerUserId: actorId } } });
    await db.customerPackage.deleteMany({ where: { customerUserId: actorId } });
    await db.paymentUniqueCodeReservation.deleteMany({
      where: { purchase: { userId: actorId } },
    });
    await db.purchase.deleteMany({ where: { userId: actorId } });
    await db.paymentAccount.deleteMany({ where: { branchId } });
    await db.paymentProof.deleteMany({ where: { userId: actorId } });

    const packageIds = (
      await db.package.findMany({
        where: { branchId },
        select: { id: true },
      })
    ).map((pkg) => pkg.id);

    await db.packageBranchScope.deleteMany({
      where: { packageId: { in: packageIds } },
    });
    await db.packageClassTypeScope.deleteMany({
      where: { packageId: { in: packageIds } },
    });
    await db.packageRevision.deleteMany({
      where: { packageId: { in: packageIds } },
    });
    await db.package.deleteMany({ where: { id: { in: packageIds } } });
    await db.effectiveConfiguration.deleteMany({ where: { branchId } });
    await db.classTypeBranchScope.deleteMany({ where: { classTypeId } });
    await db.classType.deleteMany({ where: { id: classTypeId } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [actorId, reviewerId] } } });
    await db.$disconnect();
    await rm(privateRoot, { recursive: true, force: true });
  });

  it('creates one pending purchase and outbox event with identical replay', async () => {
    const pkg = await catalog.create(
      principal,
      {
        branchId,
        classTypeId,
        businessKey: packageBusinessKey,
        name: 'Ten Sessions',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 2000000,
        effectiveFrom: '2026-01-01',
        reason: 'integration package',
      },
      `${namespace}-package-key`,
      `${namespace}-package`,
    );
    const cleanBytes = pngBytes(2048);
    const proof = await proofs.issue(
      principal,
      {
        branchId,
        packageId: pkg.id,
        fileName: 'proof.png',
        mimeType: 'image/png',
        sizeBytes: 2048,
        sha256: sha256(cleanBytes),
      },
      `${namespace}-issue`,
    );
    await proofs.uploadContent(principal, proof.id, cleanBytes);
    await proofs.finalize(
      principal,
      proof.id,
      { sha256: sha256(cleanBytes), sizeBytes: 2048 },
      `${namespace}-finalize`,
    );
    await expect(
      orders.submit(
        principal,
        { packageId: pkg.id, paymentProofUploadId: proof.id },
        'purchase-missing-scope-key',
        `${namespace}-submit-missing-scope`,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });

    const input = {
      packageId: pkg.id,
      branchId,
      classTypeId,
      paymentProofUploadId: proof.id,
    };
    const first = await orders.submit(principal, input, 'purchase-key-1', `${namespace}-submit`);
    const replay = await orders.submit(
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

  it('lists a global reviewer queue with real filters, summary, masking and cursor scope', async () => {
    const pkg = await db.package.findFirstOrThrow({ where: { branchId } });
    const queueCustomerId = randomUUID();
    const secondBranchId = randomUUID();
    const pendingId = randomUUID();
    const actionRequiredId = randomUUID();
    const queuePhone = `+628${Date.now().toString().slice(-10)}`;
    await db.user.create({
      data: {
        id: queueCustomerId,
        displayName: 'Queue Customer',
        phoneE164: queuePhone,
      },
    });
    await db.branch.create({
      data: {
        id: secondBranchId,
        code: `${namespace}-queue`,
        name: 'Queue second branch',
        timezone: 'Asia/Jakarta',
      },
    });
    await db.purchase.createMany({
      data: [
        {
          id: pendingId,
          userId: queueCustomerId,
          branchId,
          packageId: pkg.id,
          classTypeId: pkg.classTypeId,
          packageNameSnapshot: pkg.name,
          priceRpSnapshot: pkg.priceRp,
          payableAmountRpSnapshot: pkg.priceRp + 101,
          paymentUniqueCode: 101,
          sessionCountSnapshot: pkg.sessionCount,
          durationDaysSnapshot: pkg.durationDays,
          status: 'PENDING',
          idempotencyKeyHash: `${namespace}-queue-pending`,
          submittedAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
        },
        {
          id: actionRequiredId,
          userId: queueCustomerId,
          branchId: secondBranchId,
          packageId: pkg.id,
          classTypeId: pkg.classTypeId,
          packageNameSnapshot: pkg.name,
          priceRpSnapshot: pkg.priceRp,
          sessionCountSnapshot: pkg.sessionCount,
          durationDaysSnapshot: pkg.durationDays,
          status: 'ACTION_REQUIRED',
          idempotencyKeyHash: `${namespace}-queue-action`,
        },
      ],
    });
    try {
      const global = await reviews.list(reviewer, { q: 'Queue Customer', limit: 1 });
      expect(global.items).toHaveLength(1);
      expect(global.items[0]!.id).toBe(actionRequiredId);
      expect(global.page).toMatchObject({ hasMore: true });
      expect(global.items[0]).toMatchObject({
        customer: {
          id: queueCustomerId,
          displayName: 'Queue Customer',
          phoneMasked: expect.stringMatching(new RegExp(`${queuePhone.slice(-4)}$`)),
        },
        branch: { id: expect.any(String), name: expect.any(String) },
      });
      expect(global.summary).toMatchObject({
        pending: 1,
        actionRequired: 1,
        agingOver24Hours: 1,
      });
      const detail = await reviews.get(reviewer, pendingId);
      expect(detail).toMatchObject({
        purchase: {
          id: pendingId,
          customer: { displayName: 'Queue Customer' },
          branch: { id: branchId },
        },
        timeline: { submittedAt: expect.any(Date), decidedAt: null },
        activation: null,
      });

      const secondPage = await reviews.list(reviewer, {
        q: 'Queue Customer',
        limit: 1,
        cursor: global.page.nextCursor!,
      });
      expect(secondPage.items).toHaveLength(1);
      expect(secondPage.items[0]!.id).not.toBe(global.items[0]!.id);

      const filtered = await reviews.list(reviewer, {
        status: 'ACTION_REQUIRED',
        purchaseId: actionRequiredId,
      });
      expect(filtered.items.map(({ id }) => id)).toEqual([actionRequiredId]);
      expect(filtered.summary.pending).toBeGreaterThanOrEqual(1);

      const branchReviewer = {
        ...reviewer,
        capabilities: ['payment:review'],
        branchIds: [branchId],
      };
      const scoped = await reviews.list(branchReviewer, { q: 'Queue Customer' });
      expect(scoped.items.map(({ branch }) => branch.id)).toEqual([branchId]);
      await expect(
        reviews.list(branchReviewer, { branchId: secondBranchId }),
      ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
      await expect(reviews.get(branchReviewer, actionRequiredId)).rejects.toMatchObject({
        code: 'RESOURCE_NOT_FOUND',
      });
      await expect(
        reviews.list({ ...reviewer, capabilities: ['package:read'], branchIds: [branchId] }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await db.purchase.deleteMany({ where: { id: { in: [pendingId, actionRequiredId] } } });
      await db.branch.delete({ where: { id: secondBranchId } });
      await db.user.delete({ where: { id: queueCustomerId } });
    }
  });

  it('issues reviewer-bound one-time proof preview and audits authorization and consumption', async () => {
    const purchase = await db.purchase.findFirstOrThrow({
      where: { userId: actorId, paymentProofId: { not: null } },
      include: { paymentProof: true },
    });
    const proof = purchase.paymentProof!;
    const authorization = await reviews.authorizeProofDownload(
      reviewer,
      proof.id,
      `${namespace}-proof-authorized`,
    );
    expect(authorization.url).toMatch(/view-authorizations\/[^/]+\/content$/u);
    const authorizationId = authorization.url.split('/').at(-2)!;
    await expect(
      reviews.viewProofContent(principal, authorizationId, `${namespace}-wrong-viewer`),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    const viewed = await reviews.viewProofContent(
      reviewer,
      authorizationId,
      `${namespace}-proof-viewed`,
    );
    expect(viewed.mimeType).toBe(proof.mimeType);
    expect(viewed.bytes.byteLength).toBe(proof.sizeBytes);
    await expect(
      reviews.viewProofContent(reviewer, authorizationId, `${namespace}-proof-replay`),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(
      await db.auditLog.count({
        where: {
          objectType: 'PaymentProof',
          objectId: proof.id,
          action: { in: ['payment-proof.view-authorized', 'payment-proof.viewed'] },
        },
      }),
    ).toBe(2);
  });

  it('allows only the customer owner to preview the CLEAN proof attached to their order', async () => {
    const purchase = await db.purchase.findFirstOrThrow({
      where: { userId: actorId, paymentProofId: { not: null } },
      include: { paymentProof: true },
    });
    const proof = purchase.paymentProof!;

    await expect(
      reviews.authorizeOwnOrderProof(
        reviewer,
        purchase.id,
        `${namespace}-customer-proof-wrong-owner`,
      ),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const expiredAuthorization = await reviews.authorizeOwnOrderProof(
      principal,
      purchase.id,
      `${namespace}-customer-proof-expiring`,
    );
    const expiredAuthorizationId = expiredAuthorization.url.split('/').at(-2)!;
    await db.paymentProofViewAuthorization.update({
      where: { id: expiredAuthorizationId },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    await expect(
      reviews.viewProofContent(
        principal,
        expiredAuthorizationId,
        `${namespace}-customer-proof-expired`,
      ),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const authorization = await reviews.authorizeOwnOrderProof(
      principal,
      purchase.id,
      `${namespace}-customer-proof-authorized`,
    );
    const authorizationId = authorization.url.split('/').at(-2)!;
    await expect(
      reviews.viewProofContent(
        reviewer,
        authorizationId,
        `${namespace}-customer-proof-other-viewer`,
      ),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const viewed = await reviews.viewProofContent(
      principal,
      authorizationId,
      `${namespace}-customer-proof-viewed`,
    );
    expect(viewed).toMatchObject({ mimeType: proof.mimeType });
    expect(viewed.bytes.byteLength).toBe(proof.sizeBytes);
    await expect(
      reviews.viewProofContent(principal, authorizationId, `${namespace}-customer-proof-replayed`),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    expect(
      await db.auditLog.count({
        where: {
          objectType: 'PaymentProof',
          objectId: proof.id,
          action: { in: ['payment-proof.view-authorized', 'payment-proof.viewed'] },
          afterMasked: { path: '$.purpose', equals: 'CUSTOMER_SELF' },
        },
      }),
    ).toBe(3);
  });

  it('rejects changed idempotent payload, unsafe proof, and overlapping package period', async () => {
    const purchase = await db.purchase.findFirstOrThrow({ where: { userId: actorId } });
    await expect(
      orders.submit(
        principal,
        {
          packageId: purchase.packageId,
          branchId: purchase.branchId,
          classTypeId: purchase.classTypeId,
          paymentProofUploadId: randomUUID(),
        },
        'purchase-key-1',
        `${namespace}-changed`,
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUSED');
    runtime.value.paymentProof.syntheticResult = 'REJECTED';
    const unsafeBytes = Buffer.from('%PDF-unsafe!');
    const proof = await proofs.issue(
      principal,
      {
        branchId,
        packageId: purchase.packageId,
        fileName: 'unsafe.pdf',
        mimeType: 'application/pdf',
        sizeBytes: unsafeBytes.length,
        sha256: sha256(unsafeBytes),
      },
      `${namespace}-unsafe-issue`,
    );
    await proofs.uploadContent(principal, proof.id, unsafeBytes);
    const finalized = await proofs.finalize(
      principal,
      proof.id,
      { sha256: sha256(unsafeBytes), sizeBytes: unsafeBytes.length },
      `${namespace}-unsafe-finalize`,
    );
    expect(finalized.scanStatus).toBe('REJECTED');
    runtime.value.paymentProof.syntheticResult = 'CLEAN';
    await expect(
      catalog.create(
        principal,
        {
          branchId,
          classTypeId,
          businessKey: packageBusinessKey,
          name: 'Overlap',
          sessionCount: 2,
          durationDays: 2,
          priceRp: 2,
          effectiveFrom: '2026-02-01',
          reason: 'overlap validation',
        },
        `${namespace}-overlap-key`,
        `${namespace}-overlap`,
      ),
    ).rejects.toBeDefined();
  });

  it('updates future metadata and preserves effective history through revision lifecycle', async () => {
    const created = await catalog.create(
      principal,
      {
        branchId,
        classTypeId,
        businessKey: lifecycleBusinessKey,
        name: 'Lifecycle Package',
        sessionCount: 4,
        durationDays: 30,
        priceRp: 800000,
        effectiveFrom: '2030-01-01',
        reason: 'create lifecycle fixture',
      },
      `${namespace}-lifecycle-create-key`,
      `${namespace}-lifecycle-create`,
    );
    const updated = await catalog.update(
      principal,
      created.id,
      {
        name: 'Lifecycle Package Updated',
        expectedVersion: created.version,
        reason: 'correct package display name',
      },
      `${namespace}-lifecycle-update-key`,
      `${namespace}-lifecycle-update`,
    );
    expect(updated).toMatchObject({
      id: created.id,
      name: 'Lifecycle Package Updated',
      version: created.version + 1,
    });

    const revision = await catalog.revise(
      principal,
      updated.id,
      {
        name: 'Lifecycle Package 2031',
        sessionCount: 6,
        durationDays: 45,
        priceRp: 1100000,
        effectiveFrom: '2031-01-01',
        expectedVersion: updated.version,
        reason: 'scheduled commercial revision',
      },
      `${namespace}-lifecycle-revision-key`,
      `${namespace}-lifecycle-revision`,
    );
    const previous = await db.packageRevision.findUniqueOrThrow({
      where: {
        packageId_revisionNumber: {
          packageId: updated.id,
          revisionNumber: 1,
        },
      },
    });
    expect(revision).toMatchObject({
      businessKey: created.businessKey,
      branchId,
      classTypeId,
      sessionCount: 6,
      priceRp: 1100000,
    });
    expect(previous.effectiveUntil?.toISOString()).toBe('2031-01-01T00:00:00.000Z');

    const deactivated = await catalog.transition(
      principal,
      revision.id,
      'INACTIVE',
      { expectedVersion: revision.version, reason: 'pause scheduled revision' },
      `${namespace}-lifecycle-deactivate-key`,
      `${namespace}-lifecycle-deactivate`,
    );
    const reactivated = await catalog.transition(
      principal,
      revision.id,
      'ACTIVE',
      { expectedVersion: deactivated.version, reason: 'restore scheduled revision' },
      `${namespace}-lifecycle-reactivate-key`,
      `${namespace}-lifecycle-reactivate`,
    );
    expect(reactivated.status).toBe('ACTIVE');
    await expect(
      catalog.transition(
        principal,
        revision.id,
        'INACTIVE',
        { expectedVersion: deactivated.version, reason: 'stale lifecycle request' },
        `${namespace}-lifecycle-stale-key`,
        `${namespace}-lifecycle-stale`,
      ),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
    expect(
      await db.auditLog.count({
        where: {
          correlationId: {
            in: [
              `${namespace}-lifecycle-create`,
              `${namespace}-lifecycle-update`,
              `${namespace}-lifecycle-revision`,
              `${namespace}-lifecycle-deactivate`,
              `${namespace}-lifecycle-reactivate`,
            ],
          },
        },
      }),
    ).toBe(5);
  });

  it('keeps credentials and raw checksum out of audit evidence', async () => {
    const evidence = JSON.stringify(
      await db.auditLog.findMany({ where: { correlationId: { startsWith: namespace } } }),
    );
    expect(evidence).not.toContain('a'.repeat(64));
    expect(evidence).not.toContain('proof.png');
    expect(evidence).not.toContain('purchase-key-1');
  });

  it('allocates one collision-safe three digit payment code and replays it unchanged', async () => {
    const pkg = await db.package.findFirstOrThrow({ where: { branchId } });
    const account = await db.paymentAccount.create({
      data: {
        id: randomUUID(),
        branchId,
        activeBranchKey: branchId,
        bankCode: 'BCA',
        bankName: 'Bank Central Asia',
        accountNumberEncrypted: encryptAccountNumber('1234567890'),
        accountNumberLast4: '7890',
        accountHolderName: 'Daily Dose Test',
        paymentWindowHours: 24,
      },
    });
    const input = { packageId: pkg.id, branchId, classTypeId };
    const first = await orders.createOrder(
      principal,
      input,
      'order-code-key',
      `${namespace}-order-code`,
    );
    const replay = await orders.createOrder(
      principal,
      input,
      'order-code-key',
      `${namespace}-order-code-replay`,
    );
    const firstBody = first.body as unknown as {
      id: string;
      paymentUniqueCode: number;
      baseAmountRp: number;
      payableAmountRp: number;
    };
    const replayBody = replay.body as typeof firstBody;
    expect(firstBody.paymentUniqueCode).toBeGreaterThanOrEqual(1);
    expect(firstBody.paymentUniqueCode).toBeLessThanOrEqual(999);
    expect(firstBody.payableAmountRp).toBe(firstBody.baseAmountRp + firstBody.paymentUniqueCode);
    expect(replayBody).toMatchObject({
      id: firstBody.id,
      paymentUniqueCode: firstBody.paymentUniqueCode,
      payableAmountRp: firstBody.payableAmountRp,
    });
    expect(
      await db.paymentUniqueCodeReservation.count({
        where: { purchaseId: firstBody.id, paymentAccountId: account.id },
      }),
    ).toBe(1);
    await db.paymentUniqueCodeReservation.deleteMany({ where: { purchaseId: firstBody.id } });
    await db.purchase.delete({ where: { id: firstBody.id } });
    await db.idempotencyRecord.deleteMany({ where: { scope: `order:${actorId}` } });
    await db.paymentAccount.delete({ where: { id: account.id } });
  });

  it('fails closed in production and rejects invalid file metadata', async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await expect(scanner.scanPrivateObject('payment-proofs/not-used')).rejects.toMatchObject({
      code: 'CONFIGURATION_REQUIRED',
    });
    process.env.NODE_ENV = previous;
    await expect(
      proofs.issue(
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
    const mismatchBytes = pngBytes(20);
    const mismatch = await proofs.issue(
      principal,
      {
        branchId,
        fileName: 'mismatch.png',
        mimeType: 'image/png',
        sizeBytes: 20,
        sha256: sha256(mismatchBytes),
      },
      `${namespace}-mismatch-issue`,
    );
    await proofs.uploadContent(principal, mismatch.id, mismatchBytes);
    await expect(
      proofs.finalize(
        principal,
        mismatch.id,
        { sha256: 'e'.repeat(64), sizeBytes: 20 },
        `${namespace}-mismatch-finalize`,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('approves atomically with immutable snapshots, ledger, audit, outbox and replay', async () => {
    const purchase = await db.purchase.findFirstOrThrow({ where: { userId: actorId } });
    const pkg = await db.package.findUniqueOrThrow({ where: { id: purchase.packageId } });
    await db.effectiveConfiguration.create({
      data: {
        id: randomUUID(),
        kind: 'PROJECTION_RATE',
        businessKey: `${branchId}:${classTypeId}`,
        branchId,
        classTypeId,
        value: { rateRp: 125000, currency: 'IDR', unit: 'SOLD_SESSION' },
        effectiveFrom: new Date('2020-01-01T00:00:00Z'),
        approvedEvidence: 'SYNTHETIC_NON_PRODUCTION',
      },
    });
    const command = { reasonCode: 'PAYMENT_VERIFIED', expectedVersion: purchase.version };
    const first = await reviews.decide(
      reviewer,
      purchase.id,
      'APPROVED',
      command,
      'decision-key-0001',
      `${namespace}-approve`,
    );
    const replay = await reviews.decide(
      reviewer,
      purchase.id,
      'APPROVED',
      command,
      'decision-key-0001',
      `${namespace}-approve-replay`,
    );
    expect(first.replay).toBe(false);
    expect(replay.replay).toBe(true);
    const customerPackage = await db.customerPackage.findUniqueOrThrow({
      where: { purchaseId: purchase.id },
    });
    expect(customerPackage.salePriceRp).toBe(purchase.priceRpSnapshot);
    expect(customerPackage.projectionRateRp).toBe(125000);
    expect(customerPackage.expiryAt.getTime()).toBeGreaterThan(
      customerPackage.activationDate.getTime(),
    );
    expect(
      await db.ledgerEntry.count({
        where: { type: 'PURCHASE', referenceType: 'PURCHASE', referenceId: purchase.id },
      }),
    ).toBe(1);
    expect(
      await db.outboxEvent.count({
        where: { eventType: 'purchase.approved.v1', aggregateId: purchase.id },
      }),
    ).toBe(1);
    expect(pkg.sessionCount).toBe(customerPackage.sessionCountSnapshot);
    const detail = await reviews.get(reviewer, purchase.id);
    expect(detail).toMatchObject({
      purchase: { status: 'APPROVED', auditReference: expect.any(String) },
      timeline: { submittedAt: expect.any(Date), decidedAt: expect.any(Date) },
      decisionActorMasked: expect.stringMatching(/^Staf •/),
      activation: {
        customerPackageId: customerPackage.id,
        packageId: purchase.packageId,
        sessionCount: purchase.sessionCountSnapshot,
        ledgerEntryId: expect.any(String),
        ledgerQuantity: purchase.sessionCountSnapshot,
      },
      balance: {
        ledgerBalance: purchase.sessionCountSnapshot,
        reserved: 0,
        available: purchase.sessionCountSnapshot,
      },
      usageHistory: {
        items: [
          {
            label: 'Paket diaktifkan',
            quantity: purchase.sessionCountSnapshot,
            balanceAfter: purchase.sessionCountSnapshot,
          },
        ],
      },
    });
  });

  it('completes order, private binary upload, synthetic scan, attach, Finance approval and reconciliation', async () => {
    const pkg = await db.package.findFirstOrThrow({ where: { branchId } });
    await db.paymentAccount.create({
      data: {
        id: randomUUID(),
        branchId,
        activeBranchKey: branchId,
        bankCode: 'MANDIRI',
        bankName: 'Bank Mandiri',
        accountNumberEncrypted: encryptAccountNumber('100023456789'),
        accountNumberLast4: '6789',
        accountHolderName: 'Daily Dose Integration',
        paymentWindowHours: 24,
      },
    });
    const created = await orders.createOrder(
      principal,
      { packageId: pkg.id, branchId, classTypeId },
      'full-order-key',
      `${namespace}-full-order`,
    );
    const order = created.body as unknown as {
      id: string;
      version: number;
      baseAmountRp: number;
      paymentUniqueCode: number;
      payableAmountRp: number;
    };
    expect(order.payableAmountRp).toBe(order.baseAmountRp + order.paymentUniqueCode);

    const bytes = pngBytes(4096);
    const proof = await proofs.issue(
      principal,
      {
        orderId: order.id,
        branchId,
        packageId: pkg.id,
        fileName: 'full-flow.png',
        mimeType: 'image/png',
        sizeBytes: bytes.length,
        sha256: sha256(bytes),
      },
      `${namespace}-full-proof-issue`,
    );
    await proofs.uploadContent(principal, proof.id, bytes);
    await expect(proofs.uploadContent(principal, proof.id, bytes)).resolves.toMatchObject({
      uploadStatus: 'UPLOADED',
    });
    await proofs.finalize(
      principal,
      proof.id,
      { sha256: sha256(bytes), sizeBytes: bytes.length },
      `${namespace}-full-proof-finalize`,
    );
    await expect(
      proofs.finalize(
        principal,
        proof.id,
        { sha256: sha256(bytes), sizeBytes: bytes.length },
        `${namespace}-full-proof-finalize-replay`,
      ),
    ).resolves.toMatchObject({ uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' });

    const attached = (await orders.attachOrderProof(
      principal,
      order.id,
      { paymentProofId: proof.id, expectedVersion: order.version },
      `${namespace}-full-attach`,
    )) as { status: string; version: number };
    expect(attached.status).toBe('PENDING');
    await expect(
      orders.attachOrderProof(
        principal,
        order.id,
        { paymentProofId: proof.id, expectedVersion: order.version },
        `${namespace}-full-attach-replay`,
      ),
    ).resolves.toMatchObject({ status: 'PENDING', version: attached.version });

    await reviews.decide(
      reviewer,
      order.id,
      'APPROVED',
      { reasonCode: 'PAYMENT_VERIFIED', expectedVersion: attached.version },
      'full-decision-key',
      `${namespace}-full-approve`,
    );
    const activated = await db.customerPackage.findUniqueOrThrow({
      where: { purchaseId: order.id },
    });
    expect(activated.salePriceRp).toBe(order.baseAmountRp);
    expect(await db.ledgerEntry.count({ where: { referenceId: order.id } })).toBe(1);

    const reconciliation = await new FinanceService(db as never).overview(
      {
        ...reviewer,
        capabilities: [...reviewer.capabilities, 'finance:reconcile'],
      } as never,
      { branchId },
    );
    expect(reconciliation.metrics.identificationAmountRp).toBeGreaterThanOrEqual(
      order.paymentUniqueCode,
    );
    expect(reconciliation.metrics.approvedRp).toBeGreaterThanOrEqual(order.baseAmountRp);

    const customerDetail = await orders.orderDetail(principal, order.id);
    expect(customerDetail).toMatchObject({
      status: 'APPROVED',
      timelineComplete: true,
      activation: {
        customerPackageId: activated.id,
        sessionCount: activated.sessionCountSnapshot,
      },
    });
    expect((customerDetail as any).timeline.items.map((item: any) => item.type)).toEqual(
      expect.arrayContaining([
        'ORDER_CREATED',
        'PAYMENT_DEADLINE_SET',
        'PROOF_SUBMITTED',
        'PROOF_SCAN_COMPLETED',
        'PAYMENT_APPROVED',
        'PACKAGE_ACTIVATED',
      ]),
    );
    const customerPage = await orders.listOrders(principal, {
      q: 'Package branch',
      status: 'APPROVED',
      limit: '1',
    });
    expect(customerPage.summary.total).toBeGreaterThan(0);
    expect(customerPage.summary.approved).toBeGreaterThan(0);
    expect(customerPage.items).toHaveLength(1);
  });

  it('persists selected second class type from order through activated customer package', async () => {
    const secondClassTypeId = randomUUID();
    let multiPackageId: string | null = null;
    let orderId: string | null = null;
    let proofId: string | null = null;
    let createdPaymentAccountId: string | null = null;

    try {
      // Jenis kelas kedua sengaja berbeda dari compatibility
      // Package.classTypeId agar test membuktikan pilihan customer
      // benar-benar menjadi sumber transaksi.
      await db.classType.create({
        data: {
          id: secondClassTypeId,
          branchId,
          code: `CADILLAC-${namespace.toUpperCase()}`,
          name: 'Cadillac',
        },
      });

      await db.classTypeBranchScope.create({
        data: {
          id: randomUUID(),
          classTypeId: secondClassTypeId,
          branchId,
          active: true,
        },
      });

      const pkg = await catalog.create(
        principal,
        {
          branchId,
          classTypeId,
          businessKey: `PKG-MULTI-${namespace}`.toUpperCase(),
          name: 'Multi Class Package',
          sessionCount: 8,
          durationDays: 45,
          priceRp: 1750000,
          effectiveFrom: '2026-01-01',
          reason: 'multi class integration fixture',
        },
        `${namespace}-multi-package-key`,
        `${namespace}-multi-package`,
      );

      multiPackageId = pkg.id;

      await db.packageClassTypeScope.upsert({
        where: {
          packageId_classTypeId: {
            packageId: pkg.id,
            classTypeId: secondClassTypeId,
          },
        },
        update: { active: true },
        create: {
          id: randomUUID(),
          packageId: pkg.id,
          classTypeId: secondClassTypeId,
          active: true,
        },
      });

      const compatibilityPackage = await db.package.findUniqueOrThrow({
        where: { id: pkg.id },
        select: { classTypeId: true },
      });

      // Compatibility projection tetap jenis kelas pertama.
      expect(compatibilityPackage.classTypeId).toBe(classTypeId);
      expect(compatibilityPackage.classTypeId).not.toBe(secondClassTypeId);

      const projectionRateRp = 234567;

      await db.effectiveConfiguration.create({
        data: {
          id: randomUUID(),
          kind: 'PROJECTION_RATE',
          businessKey: `${branchId}:${secondClassTypeId}:MULTI:${namespace}`,
          branchId,
          classTypeId: secondClassTypeId,
          value: {
            rateRp: projectionRateRp,
            currency: 'IDR',
            unit: 'SOLD_SESSION',
          },
          effectiveFrom: new Date('2020-01-01T00:00:00Z'),
          approvedEvidence: 'SYNTHETIC_MULTI_CLASS',
        },
      });

      let account = await db.paymentAccount.findFirst({
        where: {
          branchId,
          active: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!account) {
        account = await db.paymentAccount.create({
          data: {
            id: randomUUID(),
            branchId,
            activeBranchKey: branchId,
            bankCode: 'BCA',
            bankName: 'Bank Central Asia',
            accountNumberEncrypted: encryptAccountNumber('9876543210'),
            accountNumberLast4: '3210',
            accountHolderName: 'Daily Dose Multi Class',
            paymentWindowHours: 24,
          },
        });

        createdPaymentAccountId = account.id;
      }

      await expect(
        orders.createOrder(
          principal,
          {
            packageId: pkg.id,
            branchId,
          },
          `${namespace}-multi-missing-class-key`,
          `${namespace}-multi-missing-class`,
        ),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });

      const checkout = await orders.checkoutOptions(principal, pkg.id, branchId);

      expect(checkout.package.classTypes.map((item) => item.id)).toEqual(
        expect.arrayContaining([classTypeId, secondClassTypeId]),
      );
      expect(checkout.package).not.toHaveProperty('classTypeId');
      expect(checkout.package).not.toHaveProperty('classTypeName');

      const created = await orders.createOrder(
        principal,
        {
          packageId: pkg.id,
          branchId,
          classTypeId: secondClassTypeId,
        },
        `${namespace}-multi-order-key`,
        `${namespace}-multi-order`,
      );

      const order = created.body as unknown as {
        id: string;
        version: number;
        baseAmountRp: number;
      };

      orderId = order.id;

      const storedPurchase = await db.purchase.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          package: {
            select: {
              classTypeId: true,
            },
          },
        },
      });

      expect(storedPurchase.classTypeId).toBe(secondClassTypeId);
      expect(storedPurchase.package.classTypeId).toBe(classTypeId);
      expect(storedPurchase.classTypeId).not.toBe(storedPurchase.package.classTypeId);

      const bytes = pngBytes(3072);

      const proof = await proofs.issue(
        principal,
        {
          orderId: order.id,
          branchId,
          packageId: pkg.id,
          fileName: 'multi-class-flow.png',
          mimeType: 'image/png',
          sizeBytes: bytes.length,
          sha256: sha256(bytes),
        },
        `${namespace}-multi-proof-issue`,
      );

      proofId = proof.id;

      await proofs.uploadContent(principal, proof.id, bytes);

      await proofs.finalize(
        principal,
        proof.id,
        {
          sha256: sha256(bytes),
          sizeBytes: bytes.length,
        },
        `${namespace}-multi-proof-finalize`,
      );

      const attached = (await orders.attachOrderProof(
        principal,
        order.id,
        {
          paymentProofId: proof.id,
          expectedVersion: order.version,
        },
        `${namespace}-multi-attach`,
      )) as {
        status: string;
        version: number;
      };

      expect(attached.status).toBe('PENDING');

      await reviews.decide(
        reviewer,
        order.id,
        'APPROVED',
        {
          reasonCode: 'PAYMENT_VERIFIED',
          expectedVersion: attached.version,
        },
        `${namespace}-multi-decision-key`,
        `${namespace}-multi-approve`,
      );

      const activated = await db.customerPackage.findUniqueOrThrow({
        where: { purchaseId: order.id },
      });

      const approvedPurchase = await db.purchase.findUniqueOrThrow({
        where: { id: order.id },
      });

      expect(approvedPurchase.classTypeId).toBe(secondClassTypeId);
      expect(activated.classTypeId).toBe(secondClassTypeId);
      expect(activated.classTypeId).toBe(approvedPurchase.classTypeId);
      expect(activated.projectionRateRp).toBe(projectionRateRp);
      expect(activated.salePriceRp).toBe(order.baseAmountRp);
    } finally {
      if (orderId) {
        await db.ledgerEntry.deleteMany({
          where: {
            referenceType: 'PURCHASE',
            referenceId: orderId,
          },
        });

        await db.customerPackage.deleteMany({
          where: { purchaseId: orderId },
        });

        await db.paymentUniqueCodeReservation.deleteMany({
          where: { purchaseId: orderId },
        });

        await db.purchase.deleteMany({
          where: { id: orderId },
        });

        await db.idempotencyRecord.deleteMany({
          where: {
            OR: [
              { scope: `order:${actorId}` },
              { scope: `purchase-decision:${orderId}` },
            ],
          },
        });
      }

      if (proofId) {
        await db.paymentProof.deleteMany({
          where: { id: proofId },
        });
      }

      await db.outboxEvent.deleteMany({
        where: {
          correlationId: {
            startsWith: `${namespace}-multi-`,
          },
        },
      });

      await db.auditLog.deleteMany({
        where: {
          correlationId: {
            startsWith: `${namespace}-multi-`,
          },
        },
      });

      if (multiPackageId) {
        await db.packageClassTypeScope.deleteMany({
          where: { packageId: multiPackageId },
        });

        await db.packageBranchScope.deleteMany({
          where: { packageId: multiPackageId },
        });

        await db.packageRevision.deleteMany({
          where: { packageId: multiPackageId },
        });

        await db.package.deleteMany({
          where: { id: multiPackageId },
        });
      }

      await db.effectiveConfiguration.deleteMany({
        where: {
          branchId,
          classTypeId: secondClassTypeId,
        },
      });

      await db.classTypeBranchScope.deleteMany({
        where: {
          classTypeId: secondClassTypeId,
        },
      });

      await db.classType.deleteMany({
        where: { id: secondClassTypeId },
      });

      if (createdPaymentAccountId) {
        await db.paymentAccount.deleteMany({
          where: { id: createdPaymentAccountId },
        });
      }
    }
  });

  it('enforces separation of duties, reason codes and decided state', async () => {
    const purchase = await db.purchase.findFirstOrThrow({ where: { userId: actorId } });
    await expect(
      reviews.decide(
        principal,
        purchase.id,
        'REJECTED',
        { reasonCode: 'PROOF_INVALID', expectedVersion: purchase.version },
        'decision-key-0003',
        `${namespace}-self`,
      ),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES_VIOLATION' });
    await expect(
      reviews.decide(
        reviewer,
        purchase.id,
        'REJECTED',
        { reasonCode: 'PAYMENT_VERIFIED', expectedVersion: purchase.version },
        'decision-key-0004',
        `${namespace}-reason`,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      reviews.decide(
        reviewer,
        purchase.id,
        'REJECTED',
        { reasonCode: 'PROOF_INVALID', expectedVersion: purchase.version },
        'decision-key-0005',
        `${namespace}-already`,
      ),
    ).rejects.toMatchObject({ code: 'PURCHASE_ALREADY_DECIDED' });
  });
});

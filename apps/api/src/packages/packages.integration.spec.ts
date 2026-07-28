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

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic package purchase MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `pkg-${Date.now()}`;
  const actorId = randomUUID();
  const reviewerId = randomUUID();
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  let orders: CustomerOrderService;
  let catalog: PackageCatalogService;
  let proofs: PaymentProofService;
  let reviews: PaymentReviewService;
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
      data: { id: classTypeId, branchId, code: 'REFORMER', name: 'Reformer' },
    });
    const policy = new PolicyService();
    const idempotency = new IdempotencyService(db as never);
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
    orders = new CustomerOrderService(db as never, idempotency, access);
    catalog = new PackageCatalogService(db as never, access);
    proofs = new PaymentProofService(db as never, storage, scanner, access, runtime as never);
    reviews = new PaymentReviewService(db as never, idempotency, storage, access);
  });
  afterAll(async () => {
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
    await db.package.deleteMany({ where: { branchId } });
    await db.effectiveConfiguration.deleteMany({ where: { branchId } });
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
        businessKey: 'PKG-10',
        name: 'Ten Sessions',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 2000000,
        effectiveFrom: '2026-01-01',
      },
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
    const input = { packageId: pkg.id, paymentProofUploadId: proof.id };
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

  it('rejects changed idempotent payload, unsafe proof, and overlapping package period', async () => {
    const purchase = await db.purchase.findFirstOrThrow({ where: { userId: actorId } });
    await expect(
      orders.submit(
        principal,
        { packageId: purchase.packageId, paymentProofUploadId: randomUUID() },
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
    const input = { packageId: pkg.id, branchId };
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
      { packageId: pkg.id, branchId },
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

import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, PurchaseStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { dateInTimeZone, startOfLocalDateUtc } from '../identity/assignment-boundary';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId, syntheticConfigSeconds } from '../identity/security';
import { PilotRollbackOutboxService } from '../migration/pilot-rollback-outbox.service';
import { PackageAccessService } from './package-access.service';
import { ConfigGatedObjectStorageProvider } from './proof-providers';
import { NotificationWriterService } from '../notifications/notification-writer.service';
import { EmailNotificationService } from '../email/email-notification.service';

@Injectable()
export class PaymentReviewService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly storage: ConfigGatedObjectStorageProvider,
    private readonly access: PackageAccessService,
    @Optional() private readonly pilotOutbox?: PilotRollbackOutboxService,
    @Optional() private readonly notificationWriter?: NotificationWriterService,
    @Optional() private readonly emails?: EmailNotificationService,
  ) {}

  async list(
    principal: SessionPrincipal,
    query: {
      branchId?: string;
      status?: string;
      cursor?: string;
      limit?: string | number;
      q?: string;
      from?: string;
      until?: string;
      purchaseId?: string;
      includeHistorical?: boolean;
    } = {},
  ) {
    const reviewer =
      principal.capabilities.includes('payment:review') ||
      principal.capabilities.includes('purchase:review');
    this.access.review(principal);
    if (query.includeHistorical && !principal.capabilities.includes('migration:read'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    if (query.branchId)
      this.access.scope(principal, query.branchId, ['payment:review', 'purchase:review']);

    const status = query.status?.trim().toUpperCase();
    if (status && !Object.values(PurchaseStatus).includes(status as PurchaseStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const limit = query.limit === undefined ? 20 : Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const from = this.parseDate(query.from);
    const until = this.parseDate(query.until);
    if (from && until && from >= until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const branchScope = this.access.branchScope(principal, 'payment:review');
    const scope: Prisma.PembelianWhereInput = {
      ...(query.branchId
        ? { branchId: query.branchId }
        : reviewer
          ? branchScope.all
            ? branchScope.excluded.length
              ? { branchId: { notIn: branchScope.excluded } }
              : {}
            : { branchId: { in: branchScope.included } }
          : {}),
    };
    const search = query.q?.trim();
    const summaryWhere: Prisma.PembelianWhereInput = {
      ...scope,
      ...(query.includeHistorical ? {} : { historical: false }),
      ...(search
        ? {
            OR: [
              { id: search },
              { userId: search },
              { user: { displayName: { contains: search } } },
              { user: { phoneE164: { contains: search } } },
            ],
          }
        : {}),
      ...(from || until
        ? { submittedAt: { ...(from ? { gte: from } : {}), ...(until ? { lt: until } : {}) } }
        : {}),
    };
    const baseWhere: Prisma.PembelianWhereInput = {
      ...summaryWhere,
      ...(query.purchaseId ? { id: query.purchaseId } : {}),
    };
    const itemWhere: Prisma.PembelianWhereInput = {
      ...baseWhere,
      ...(status ? { status: status as PurchaseStatus } : {}),
    };
    if (query.cursor) {
      const visibleCursor = await this.db.pembelian.findFirst({
        where: { ...itemWhere, id: query.cursor },
        select: { id: true },
      });
      if (!visibleCursor) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const [rows, grouped, payable, legacy, agingOver24Hours] = await Promise.all([
      this.db.pembelian.findMany({
        where: itemWhere,
        include: {
          user: { select: { id: true, displayName: true, phoneE164: true } },
          branch: { select: { id: true, code: true, name: true, timezone: true } },
          paymentProof: {
            select: {
              id: true,
              uploadStatus: true,
              scanStatus: true,
              mimeType: true,
              sizeBytes: true,
              finalizedAt: true,
            },
          },
          customerPackage: {
            include: {
              ledgerEntries: { select: { quantity: true } },
              reservations: {
                where: { status: 'ACTIVE' },
                select: { quantity: true },
              },
            },
          },
        },
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
        orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      }),
      this.db.pembelian.groupBy({
        by: ['status'],
        where: summaryWhere,
        _count: { _all: true },
      }),
      this.db.pembelian.aggregate({
        where: { ...summaryWhere, payableAmountRpSnapshot: { not: null } },
        _sum: { payableAmountRpSnapshot: true },
      }),
      this.db.pembelian.aggregate({
        where: { ...summaryWhere, payableAmountRpSnapshot: null },
        _sum: { priceRpSnapshot: true },
      }),
      this.db.pembelian.count({
        where: {
          ...summaryWhere,
          status: PurchaseStatus.PENDING,
          submittedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);
    const hasMore = rows.length > limit;
    const pageRows = rows.slice(0, limit);
    const auditRows = pageRows.length
      ? await this.db.auditLog.findMany({
          where: { objectType: 'Purchase', objectId: { in: pageRows.map(({ id }) => id) } },
          orderBy: { occurredAt: 'desc' },
          select: { id: true, objectId: true },
        })
      : [];
    const auditReferences = new Map<string, string>();
    for (const audit of auditRows)
      if (!auditReferences.has(audit.objectId)) auditReferences.set(audit.objectId, audit.id);
    const counts = new Map(grouped.map((item) => [item.status, item._count._all]));
    const generatedAt = new Date();
    return {
      items: pageRows.map(
        ({
          paymentAccountNumberSnapshotEncrypted,
          user,
          branch,
          paymentProof,
          customerPackage,
          ...item
        }) => {
          void paymentAccountNumberSnapshotEncrypted;
          return {
            ...item,
            customer: {
              id: user.id,
              displayName: user.displayName,
              phoneMasked: this.maskPhone(user.phoneE164),
            },
            branch,
            paymentProof,
            activationSummary: this.activationSummary(customerPackage),
            auditReference: auditReferences.get(item.id) ?? null,
          };
        },
      ),
      summary: {
        pending: counts.get(PurchaseStatus.PENDING) ?? 0,
        actionRequired: counts.get(PurchaseStatus.ACTION_REQUIRED) ?? 0,
        approved: counts.get(PurchaseStatus.APPROVED) ?? 0,
        rejected: counts.get(PurchaseStatus.REJECTED) ?? 0,
        expired: counts.get(PurchaseStatus.EXPIRED) ?? 0,
        totalAmountRp:
          (payable._sum.payableAmountRpSnapshot ?? 0) + (legacy._sum.priceRpSnapshot ?? 0),
        agingOver24Hours,
      },
      generatedAt,
      page: {
        nextCursor: hasMore ? (pageRows.at(-1)?.id ?? null) : null,
        hasMore,
      },
    };
  }

  private parseDate(value?: string) {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return parsed;
  }

  private maskPhone(value: string | null) {
    if (!value) return null;
    const visible = value.slice(-4);
    return `${value.slice(0, Math.min(3, value.length - visible.length))}${'•'.repeat(
      Math.max(3, value.length - visible.length - 3),
    )}${visible}`;
  }

  private activationSummary(
    customerPackage: {
      id: string;
      status: string;
      activationDate: Date;
      expiryAt: Date;
      sessionCountSnapshot: number;
      ledgerEntries: { quantity: number }[];
      reservations: { quantity: number }[];
    } | null,
  ) {
    if (!customerPackage) return null;
    const ledgerBalance = customerPackage.ledgerEntries.reduce(
      (sum, entry) => sum + entry.quantity,
      0,
    );
    const reserved = customerPackage.reservations.reduce(
      (sum, reservation) => sum + reservation.quantity,
      0,
    );
    const status =
      customerPackage.status === 'INACTIVE'
        ? 'INACTIVE'
        : customerPackage.expiryAt.getTime() <= Date.now()
          ? 'EXPIRED'
          : 'ACTIVE';
    return {
      customerPackageId: customerPackage.id,
      status,
      activationDate: customerPackage.activationDate,
      expiryAt: customerPackage.expiryAt,
      sessionCount: customerPackage.sessionCountSnapshot,
      ledgerBalance,
      reserved,
      available: status === 'ACTIVE' ? Math.max(0, ledgerBalance - reserved) : 0,
      used: Math.max(0, customerPackage.sessionCountSnapshot - ledgerBalance),
    };
  }

  private usageLabel(type: string) {
    return (
      (
        {
          PURCHASE: 'Paket diaktifkan',
          ATTEND: 'Digunakan untuk kehadiran',
          REVERSAL: 'Sesi dikembalikan',
          ADJUST_MANUAL: 'Penyesuaian manual',
          MIGRATION_OPENING: 'Saldo awal migrasi',
        } as Record<string, string>
      )[type] ?? 'Perubahan saldo sesi'
    );
  }

  async get(principal: SessionPrincipal, id: string, usageCursor?: string) {
    this.access.review(principal);
    const scopedBranchIds =
      principal.capabilities.includes('branch:all') ||
      principal.capabilities.includes('finance:reconcile')
        ? undefined
        : principal.branchIds;
    const purchase = await this.db.pembelian.findFirst({
      where: {
        id,
        ...(scopedBranchIds ? { branchId: { in: scopedBranchIds } } : {}),
      },
      include: {
        user: { select: { id: true, displayName: true, phoneE164: true } },
        branch: { select: { id: true, code: true, name: true, timezone: true } },
        paymentProof: {
          select: {
            id: true,
            uploadStatus: true,
            scanStatus: true,
            mimeType: true,
            sizeBytes: true,
            finalizedAt: true,
          },
        },
        customerPackage: {
          include: {
            ledgerEntries: { select: { quantity: true } },
            reservations: {
              where: { status: 'ACTIVE' },
              select: { quantity: true },
            },
          },
        },
      },
    });
    if (!purchase) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const audit = await this.db.auditLog.findFirst({
      where: { objectType: 'Purchase', objectId: purchase.id },
      orderBy: { occurredAt: 'desc' },
      select: { id: true },
    });
    const {
      paymentAccountNumberSnapshotEncrypted,
      user,
      branch,
      paymentProof,
      customerPackage,
      ...item
    } = purchase;
    void paymentAccountNumberSnapshotEncrypted;
    let usageCursorEntry: { id: string; occurredAt: Date } | null = null;
    if (usageCursor && customerPackage) {
      usageCursorEntry = await this.db.entriBukuBesar.findFirst({
        where: { id: usageCursor, customerPackageId: customerPackage.id },
        select: { id: true, occurredAt: true },
      });
      if (!usageCursorEntry)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const [usageRows, purchaseLedger] = customerPackage
      ? await Promise.all([
          this.db.entriBukuBesar.findMany({
            where: { customerPackageId: customerPackage.id },
            ...(usageCursor ? { cursor: { id: usageCursor }, skip: 1 } : {}),
            orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
            take: 21,
          }),
          this.db.entriBukuBesar.findFirst({
            where: {
              customerPackageId: customerPackage.id,
              type: 'PURCHASE',
              referenceId: id,
            },
            orderBy: { occurredAt: 'asc' },
          }),
        ])
      : [[], null];
    const usageItems = usageRows.slice(0, 20);
    const activationSummary = this.activationSummary(customerPackage);
    const newerQuantity =
      customerPackage && usageCursorEntry
        ? ((
            await this.db.entriBukuBesar.aggregate({
              where: {
                customerPackageId: customerPackage.id,
                OR: [
                  { occurredAt: { gt: usageCursorEntry.occurredAt } },
                  { occurredAt: usageCursorEntry.occurredAt, id: { gte: usageCursorEntry.id } },
                ],
              },
              _sum: { quantity: true },
            })
          )._sum.quantity ?? 0)
        : 0;
    let runningBalance = (activationSummary?.ledgerBalance ?? 0) - newerQuantity;
    return {
      purchase: {
        ...item,
        customer: {
          id: user.id,
          displayName: user.displayName,
          phoneMasked: this.maskPhone(user.phoneE164),
        },
        branch,
        paymentProof,
        activationSummary,
        auditReference: audit?.id ?? null,
      },
      timeline: {
        submittedAt: item.submittedAt,
        proofFinalizedAt: paymentProof?.finalizedAt ?? null,
        decidedAt: item.decidedAt ?? null,
      },
      decisionActorMasked: item.decidedById ? `Staf •${item.decidedById.slice(-6)}` : null,
      activation: customerPackage
        ? {
            customerPackageId: customerPackage.id,
            packageId: customerPackage.packageId,
            packageName: item.packageNameSnapshot,
            status: customerPackage.status,
            sessionCount: customerPackage.sessionCountSnapshot,
            activationDate: customerPackage.activationDate,
            expiryAt: customerPackage.expiryAt,
            ledgerEntryId: purchaseLedger?.id ?? null,
            ledgerQuantity: purchaseLedger?.quantity ?? null,
            ledgerOccurredAt: purchaseLedger?.occurredAt ?? null,
          }
        : null,
      balance: activationSummary,
      usageHistory: {
        items: usageItems.map((entry) => {
          const balanceAfter = runningBalance;
          runningBalance -= entry.quantity;
          return {
            id: entry.id,
            type: entry.type,
            label: this.usageLabel(entry.type),
            quantity: entry.quantity,
            balanceAfter,
            occurredAt: entry.occurredAt,
            referenceType: entry.referenceType,
            referenceId: entry.referenceId,
          };
        }),
        page: {
          hasMore: usageRows.length > 20,
          nextCursor: usageRows.length > 20 ? (usageItems.at(-1)?.id ?? null) : null,
        },
      },
    };
  }

  async authorizeProofDownload(principal: SessionPrincipal, id: string, correlationId: string) {
    this.access.review(principal);
    const proof = await this.db.buktiPembayaran.findUnique({ where: { id } });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.scope(principal, proof.branchId, ['payment:review', 'purchase:review']);
    return this.createProofViewAuthorization(principal, proof, 'REVIEW', correlationId);
  }

  async authorizeOwnOrderProof(
    principal: SessionPrincipal,
    orderId: string,
    correlationId: string,
  ) {
    this.access.catalog(principal);
    const order = await this.db.pembelian.findFirst({
      where: { id: orderId, userId: principal.userId, paymentProofId: { not: null } },
      include: { paymentProof: true },
    });
    if (!order?.paymentProof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (order.paymentProof.userId !== principal.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.createProofViewAuthorization(
      principal,
      order.paymentProof,
      'CUSTOMER_SELF',
      correlationId,
    );
  }

  private async createProofViewAuthorization(
    principal: SessionPrincipal,
    proof: {
      id: string;
      userId: string;
      branchId: string;
      objectKey: string;
      uploadStatus: string;
      scanStatus: string;
    },
    purpose: 'REVIEW' | 'CUSTOMER_SELF',
    correlationId: string,
  ) {
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    if (!(await this.storage.existsPrivateObject(proof.objectKey)))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const ttl = syntheticConfigSeconds('PAYMENT_PROOF_TTL_SECONDS', 900);
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const authorization = await this.db.otorisasiLihatBuktiPembayaran.create({
      data: {
        id: newId(),
        proofId: proof.id,
        viewerId: principal.userId,
        purpose,
        expiresAt,
      },
    });
    await this.db.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId: proof.branchId,
        action: 'payment-proof.view-authorized',
        objectType: 'PaymentProof',
        objectId: proof.id,
        targetUserId: proof.userId,
        afterMasked: { purpose, expiresAt },
        correlationId,
      },
    });
    return {
      url: `/api/v1/uploads/payment-proofs/view-authorizations/${authorization.id}/content`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async viewProofContent(principal: SessionPrincipal, id: string, correlationId: string) {
    const authorization = await this.db.otorisasiLihatBuktiPembayaran.findUnique({
      where: { id },
      include: { proof: true },
    });
    if (
      !authorization ||
      authorization.viewerId !== principal.userId ||
      authorization.consumedAt ||
      authorization.expiresAt <= new Date()
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const proof = authorization.proof;
    if (authorization.purpose === 'REVIEW') {
      this.access.review(principal);
      this.access.scope(principal, proof.branchId, ['payment:review', 'purchase:review']);
    } else if (authorization.purpose === 'CUSTOMER_SELF') {
      this.access.catalog(principal);
      if (proof.userId !== principal.userId)
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      const attachedOrder = await this.db.pembelian.findFirst({
        where: { userId: principal.userId, paymentProofId: proof.id },
        select: { id: true },
      });
      if (!attachedOrder) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    const claimed = await this.db.otorisasiLihatBuktiPembayaran.updateMany({
      where: { id, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    await this.db.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId: proof.branchId,
        action: 'payment-proof.viewed',
        objectType: 'PaymentProof',
        objectId: proof.id,
        targetUserId: proof.userId,
        afterMasked: { purpose: authorization.purpose },
        correlationId,
      },
    });
    return {
      bytes: await this.storage.readPrivateObject(proof.objectKey),
      mimeType: proof.mimeType,
    };
  }

  async decide(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { reasonCode?: string; expectedVersion?: number; note?: string },
    key: string,
    correlationId: string,
  ) {
    this.access.review(principal, true);
    if (!key || !Number.isInteger(input?.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const allowedReasons =
      decision === 'APPROVED'
        ? ['PAYMENT_VERIFIED']
        : ['PROOF_INVALID', 'AMOUNT_MISMATCH', 'DUPLICATE_PURCHASE', 'OTHER_REVIEW_REQUIRED'];
    if (!allowedReasons.includes(input.reasonCode!))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const note = input.note?.trim();
    if (input.reasonCode === 'OTHER_REVIEW_REQUIRED' && (!note || note.length < 3))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (note && note.length > 500)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    syntheticConfigSeconds('PURCHASE_DECISION_IDEMPOTENCY_TTL_SECONDS', 86400);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result!: any;
    try {
      result = await this.idempotency.execute(
        {
          scope: `purchase-decision:${id}`,
          key,
          payload: {
            decision,
            reasonCode: input.reasonCode,
            expectedVersion: input.expectedVersion,
            notePresent: Boolean(note),
          },
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          const purchase = await tx.pembelian.findUnique({
            where: { id },
            include: { paymentProof: true, package: true, branch: true },
          });
          if (!purchase) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.access.scope(principal, purchase.branchId, ['payment:decide', 'purchase:decide']);
          if (purchase.userId === principal.userId)
            throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.FORBIDDEN);
          if (purchase.status !== 'PENDING')
            throw new ApiProblem('PURCHASE_ALREADY_DECIDED', HttpStatus.CONFLICT);
          if (purchase.version !== input.expectedVersion)
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          if (
            !purchase.paymentProof ||
            purchase.paymentProof.uploadStatus !== 'FINALIZED' ||
            purchase.paymentProof.scanStatus !== 'CLEAN'
          )
            throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);

          const decidedAt = new Date();
          if (decision === 'APPROVED') {
            await tx.$queryRaw`SELECT \`id\` FROM \`Cabang\` WHERE \`id\` = ${purchase.branchId} FOR UPDATE`;
            const approvalPeriod = dateInTimeZone(decidedAt, purchase.branch.timezone).slice(0, 7);
            const financePeriod = await tx.periodeKeuangan.findUnique({
              where: {
                branchId_period: { branchId: purchase.branchId, period: approvalPeriod },
              },
              select: { status: true },
            });
            if (financePeriod?.status === 'CLOSED')
              throw new ApiProblem('FINANCE_PERIOD_CLOSED', HttpStatus.LOCKED);
          }
          const nextStatus =
            decision === 'REJECTED' && input.reasonCode !== 'DUPLICATE_PURCHASE'
              ? ('ACTION_REQUIRED' as const)
              : decision;
          const updated = await tx.pembelian.update({
            where: { id, status: 'PENDING', version: input.expectedVersion },
            data: {
              status: nextStatus,
              decidedAt,
              decidedById: principal.userId,
              decisionReasonCode: input.reasonCode!,
              version: { increment: 1 },
            },
          });
          if (nextStatus === 'APPROVED' || nextStatus === 'REJECTED') {
            await tx.reservasiKodeUnikPembayaran.deleteMany({
              where: { purchaseId: purchase.id },
            });
          }
          if (nextStatus === 'REJECTED') {
            await tx.penukaranVoucher.updateMany({
              where: { purchaseId: purchase.id, releasedAt: null },
              data: { releasedAt: decidedAt },
            });
          }

          let customerPackage = null;
          let ledgerEntry = null;
          if (decision === 'APPROVED') {
            const activationDate = dateInTimeZone(decidedAt, purchase.branch.timezone);
            const [year, month, day] = activationDate.split('-').map(Number);
            const expiryDate = new Date(
              Date.UTC(year!, month! - 1, day! + purchase.durationDaysSnapshot),
            )
              .toISOString()
              .slice(0, 10);
            const effectiveDate = new Date(`${activationDate}T00:00:00Z`);

            // Purchase.classTypeId adalah snapshot jenis kelas yang dipilih
            // customer saat transaksi dan menjadi sumber otoritatif entitlement.
            const purchasedClassTypeId = purchase.classTypeId;

            const projections = await tx.konfigurasiEfektif.findMany({
              where: {
                kind: 'PROJECTION_RATE',
                branchId: purchase.branchId,
                classTypeId: purchasedClassTypeId,
                effectiveFrom: { lte: effectiveDate },
                OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveDate } }],
              },
              orderBy: { effectiveFrom: 'desc' },
              take: 2,
            });
            let rate = Math.round(
              (purchase.priceRpSnapshot || 4_000_000) / (purchase.sessionCountSnapshot || 24),
            );
            if (projections.length >= 1) {
              const configuredRate = (projections[0]?.value as { rateRp?: unknown } | undefined)
                ?.rateRp;
              if (Number.isSafeInteger(configuredRate) && Number(configuredRate) >= 0) {
                rate = Number(configuredRate);
              }
            }
            customerPackage = await tx.paketPelanggan.create({
              data: {
                id: newId(),
                purchaseId: purchase.id,
                customerUserId: purchase.userId,
                branchId: purchase.branchId,
                packageId: purchase.packageId,
                classTypeId: purchasedClassTypeId,
                activationDate: effectiveDate,
                expiryAt: startOfLocalDateUtc(expiryDate, purchase.branch.timezone),
                salePriceRp: purchase.priceAfterDiscountRpSnapshot ?? purchase.priceRpSnapshot,
                sessionCountSnapshot: purchase.sessionCountSnapshot,
                durationDaysSnapshot: purchase.durationDaysSnapshot,
                projectionRateRp: Number(rate),
              },
            });
            ledgerEntry = await tx.entriBukuBesar.create({
              data: {
                id: newId(),
                customerPackageId: customerPackage.id,
                type: 'PURCHASE',
                quantity: purchase.sessionCountSnapshot,
                referenceType: 'PURCHASE',
                referenceId: purchase.id,
              },
            });
          }

          await tx.peristiwaLinimasaPembelian.createMany({
            data: [
              {
                id: newId(),
                purchaseId: purchase.id,
                eventType:
                  nextStatus === 'APPROVED'
                    ? 'PAYMENT_APPROVED'
                    : nextStatus === 'ACTION_REQUIRED'
                      ? 'ACTION_REQUIRED'
                      : 'PAYMENT_REJECTED',
                reasonCode: input.reasonCode!,
                sourceKey: `${purchase.id}:decision:${updated.version}:${nextStatus}`,
                occurredAt: decidedAt,
              },
              ...(customerPackage
                ? [
                    {
                      id: newId(),
                      purchaseId: purchase.id,
                      eventType: 'PACKAGE_ACTIVATED' as const,
                      sourceKey: `${purchase.id}:activation:${customerPackage.id}`,
                      occurredAt: customerPackage.createdAt,
                    },
                  ]
                : []),
            ],
            skipDuplicates: true,
          });

          await tx.outboxEvent.create({
            data: {
              id: newId(),
              eventType:
                nextStatus === 'APPROVED'
                  ? 'purchase.approved.v1'
                  : nextStatus === 'ACTION_REQUIRED'
                    ? 'order.action-required.v1'
                    : 'purchase.rejected.v1',
              aggregateType: 'Purchase',
              aggregateId: purchase.id,
              payload: {
                purchaseId: purchase.id,
                status: nextStatus,
                reasonCode: input.reasonCode!,
              },
              correlationId,
            },
          });
          const audit = await this.access.audit(
            tx,
            principal,
            nextStatus === 'APPROVED'
              ? 'PURCHASE_APPROVED'
              : nextStatus === 'ACTION_REQUIRED'
                ? 'ORDER_ACTION_REQUIRED'
                : 'PURCHASE_REJECTED',
            'Purchase',
            purchase.id,
            purchase.branchId,
            correlationId,
            { reasonCode: input.reasonCode!, notePresent: Boolean(note) },
          );
          const purchaseWithAudit = { ...updated, auditReference: audit.id };
          await this.pilotOutbox?.record(tx, {
            branchId: purchase.branchId,
            aggregateType: 'Purchase',
            aggregateId: purchase.id,
            operation: 'DECIDE',
            correlationId,
            occurredAt: decidedAt,
            payload: {
              purchaseId: purchase.id,
              status: nextStatus,
              reasonCode: input.reasonCode!,
              customerPackageId: customerPackage?.id ?? null,
              sessionCount: customerPackage?.sessionCountSnapshot ?? null,
            },
          });
          // Notifikasi in-app ke customer: hasil keputusan pembayaran
          if (this.notificationWriter) {
            const { randomUUID } = await import('crypto');
            await tx.userNotification.createMany({
              data: [
                {
                  id: randomUUID(),
                  userId: purchase.userId,
                  eventKey: `payment.${nextStatus.toLowerCase()}:${purchase.id}:v${updated.version ?? 1}`,
                  category: 'PAYMENT' as const,
                  tone:
                    nextStatus === 'APPROVED'
                      ? ('SUCCESS' as const)
                      : nextStatus === 'ACTION_REQUIRED'
                        ? ('WARNING' as const)
                        : ('DANGER' as const),
                  title:
                    nextStatus === 'APPROVED'
                      ? `Pembayaran paket ${purchase.packageNameSnapshot} disetujui!`
                      : nextStatus === 'ACTION_REQUIRED'
                        ? 'Pembayaran perlu diperbaiki'
                        : 'Pembayaran ditolak',
                  message:
                    nextStatus === 'APPROVED'
                      ? `Paket ${purchase.packageNameSnapshot} telah aktif. Selamat berolahraga!`
                      : nextStatus === 'ACTION_REQUIRED'
                        ? `Bukti pembayaran Anda memerlukan perbaikan (${input.reasonCode}). Silakan unggah ulang.`
                        : `Pembayaran Anda ditolak (${input.reasonCode}). Hubungi cabang untuk informasi lebih lanjut.`,
                  href: nextStatus === 'APPROVED' ? '/packages' : `/orders/${purchase.id}`,
                  branchId: purchase.branchId,
                  expiresAt: new Date(Date.now() + 30 * 86_400_000),
                },
              ],
              skipDuplicates: true,
            });
          }
          return {
            status: 200,
            body: (decision === 'APPROVED'
              ? {
                  purchase: purchaseWithAudit,
                  customerPackage: customerPackage
                    ? {
                        ...customerPackage,
                        packageName: purchase.packageNameSnapshot,
                        branchName: purchase.branch.name,
                        ledgerBalance: purchase.sessionCountSnapshot,
                        reserved: 0,
                        available: purchase.sessionCountSnapshot,
                      }
                    : null,
                  ledgerEntry,
                  idempotentReplay: false,
                }
              : purchaseWithAudit) as unknown as Prisma.InputJsonValue,
          };
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
        throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
    // Kirim email notifikasi ke customer (fire-and-forget, tidak memblokir response)
    void this.sendPaymentEmail(id, decision, input, correlationId);
    return result;
  }

  private async sendPaymentEmail(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { reasonCode?: string; note?: string },
    correlationId: string,
  ): Promise<void> {
    if (!this.emails) return;
    try {
      const purchase = await this.db.pembelian.findUnique({
        where: { id },
        select: { userId: true, packageNameSnapshot: true },
      });
      if (!purchase) return;
      const user = await this.db.user.findUnique({
        where: { id: purchase.userId },
        select: { email: true },
      });
      const publicBaseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
      if (!user?.email || !publicBaseUrl) return;
      const nextStatus: 'APPROVED' | 'ACTION_REQUIRED' | 'REJECTED' =
        decision === 'REJECTED' && input.reasonCode !== 'DUPLICATE_PURCHASE'
          ? 'ACTION_REQUIRED'
          : decision;
      const templateMap = {
        APPROVED: 'ORDER_APPROVED_V1',
        ACTION_REQUIRED: 'ORDER_ACTION_REQUIRED_V1',
        REJECTED: 'ORDER_REJECTED_V1',
      } as const;
      await this.emails.enqueue({
        eventType: `purchase.${nextStatus.toLowerCase().replace('_', '-')}.v1`,
        templateKey: templateMap[nextStatus],
        recipient: user.email,
        variables: {
          packageName: purchase.packageNameSnapshot,
          href:
            nextStatus === 'APPROVED'
              ? `${publicBaseUrl}/packages`
              : `${publicBaseUrl}/orders/${id}`,
          detail:
            nextStatus === 'APPROVED'
              ? 'Paket Anda kini aktif dan siap digunakan.'
              : `Alasan: ${input.reasonCode ?? 'lihat aplikasi'}${input.note ? ` — ${input.note}` : ''}`,
        },
        correlationId,
        occurrenceParts: ['payment-decide', id, decision],
        userId: purchase.userId,
      });
    } catch {
      // Jangan gagalkan response utama jika email gagal
    }
  }

  // --- Indonesian Domain Aliases ---
  async daftarVerifikasi(
    principal: SessionPrincipal,
    query: Parameters<PaymentReviewService['list']>[1],
  ) {
    return this.list(principal, query);
  }

  async detailVerifikasi(principal: SessionPrincipal, id: string) {
    return this.get(principal, id);
  }

  async putuskanPembayaran(
    principal: SessionPrincipal,
    id: string,
    decision: Parameters<PaymentReviewService['decide']>[2],
    input: Parameters<PaymentReviewService['decide']>[3],
    key: string,
    correlationId: string,
  ) {
    return this.decide(principal, id, decision, input, key, correlationId);
  }

  async otorisasiUnduhBukti(principal: SessionPrincipal, proofId: string, correlationId: string) {
    return this.authorizeProofDownload(principal, proofId, correlationId);
  }

  async otorisasiLihatBuktiSendiri(
    principal: SessionPrincipal,
    orderId: string,
    correlationId: string,
  ) {
    return this.authorizeOwnOrderProof(principal, orderId, correlationId);
  }

  async lihatKontenBukti(principal: SessionPrincipal, id: string, correlationId: string) {
    return this.viewProofContent(principal, id, correlationId);
  }
}

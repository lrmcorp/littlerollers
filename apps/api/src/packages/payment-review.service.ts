import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, PurchaseStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { dateInTimeZone, startOfLocalDateUtc } from '../identity/assignment-boundary';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId, syntheticConfigSeconds } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import { ConfigGatedObjectStorageProvider } from './proof-providers';

@Injectable()
export class PaymentReviewService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly storage: ConfigGatedObjectStorageProvider,
    private readonly access: PackageAccessService,
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
    } = {},
  ) {
    const reviewer =
      principal.capabilities.includes('payment:review') ||
      principal.capabilities.includes('purchase:review');
    this.access.review(principal);
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
    const scope: Prisma.PurchaseWhereInput = {
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
    const summaryWhere: Prisma.PurchaseWhereInput = {
      ...scope,
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
    const baseWhere: Prisma.PurchaseWhereInput = {
      ...summaryWhere,
      ...(query.purchaseId ? { id: query.purchaseId } : {}),
    };
    const itemWhere: Prisma.PurchaseWhereInput = {
      ...baseWhere,
      ...(status ? { status: status as PurchaseStatus } : {}),
    };
    if (query.cursor) {
      const visibleCursor = await this.db.purchase.findFirst({
        where: { ...itemWhere, id: query.cursor },
        select: { id: true },
      });
      if (!visibleCursor) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const [rows, grouped, payable, legacy, agingOver24Hours] = await Promise.all([
      this.db.purchase.findMany({
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
      this.db.purchase.groupBy({
        by: ['status'],
        where: summaryWhere,
        _count: { _all: true },
      }),
      this.db.purchase.aggregate({
        where: { ...summaryWhere, payableAmountRpSnapshot: { not: null } },
        _sum: { payableAmountRpSnapshot: true },
      }),
      this.db.purchase.aggregate({
        where: { ...summaryWhere, payableAmountRpSnapshot: null },
        _sum: { priceRpSnapshot: true },
      }),
      this.db.purchase.count({
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
    const purchase = await this.db.purchase.findFirst({
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
      usageCursorEntry = await this.db.ledgerEntry.findFirst({
        where: { id: usageCursor, customerPackageId: customerPackage.id },
        select: { id: true, occurredAt: true },
      });
      if (!usageCursorEntry)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const [usageRows, purchaseLedger] = customerPackage
      ? await Promise.all([
          this.db.ledgerEntry.findMany({
            where: { customerPackageId: customerPackage.id },
            ...(usageCursor ? { cursor: { id: usageCursor }, skip: 1 } : {}),
            orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
            take: 21,
          }),
          this.db.ledgerEntry.findFirst({
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
            await this.db.ledgerEntry.aggregate({
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
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
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
    const order = await this.db.purchase.findFirst({
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
    const authorization = await this.db.paymentProofViewAuthorization.create({
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
    const authorization = await this.db.paymentProofViewAuthorization.findUnique({
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
      const attachedOrder = await this.db.purchase.findFirst({
        where: { userId: principal.userId, paymentProofId: proof.id },
        select: { id: true },
      });
      if (!attachedOrder) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    const claimed = await this.db.paymentProofViewAuthorization.updateMany({
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
    try {
      return await this.idempotency.execute(
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
          const purchase = await tx.purchase.findUnique({
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
          const nextStatus =
            decision === 'REJECTED' && input.reasonCode !== 'DUPLICATE_PURCHASE'
              ? ('ACTION_REQUIRED' as const)
              : decision;
          const updated = await tx.purchase.update({
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
            await tx.paymentUniqueCodeReservation.deleteMany({
              where: { purchaseId: purchase.id },
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
            const projection = await tx.effectiveConfiguration.findFirst({
              where: {
                kind: 'PROJECTION_RATE',
                branchId: purchase.branchId,
                classTypeId: purchase.package.classTypeId,
                effectiveFrom: { lte: effectiveDate },
                OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveDate } }],
              },
              orderBy: { effectiveFrom: 'desc' },
            });
            const rate = (projection?.value as { rateRp?: unknown } | undefined)?.rateRp;
            if (!Number.isSafeInteger(rate) || Number(rate) < 0)
              throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
            customerPackage = await tx.customerPackage.create({
              data: {
                id: newId(),
                purchaseId: purchase.id,
                customerUserId: purchase.userId,
                branchId: purchase.branchId,
                packageId: purchase.packageId,
                classTypeId: purchase.package.classTypeId,
                activationDate: effectiveDate,
                expiryAt: startOfLocalDateUtc(expiryDate, purchase.branch.timezone),
                salePriceRp: purchase.priceRpSnapshot,
                sessionCountSnapshot: purchase.sessionCountSnapshot,
                durationDaysSnapshot: purchase.durationDaysSnapshot,
                projectionRateRp: Number(rate),
              },
            });
            ledgerEntry = await tx.ledgerEntry.create({
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

          await tx.purchaseTimelineEvent.createMany({
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
  }
}

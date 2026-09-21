import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, PurchaseStatus, SessionMutationType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import { NotificationWriterService } from '../notifications/notification-writer.service';
import { EmailNotificationService } from '../email/email-notification.service';

@Injectable()
export class PaymentReviewService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly access: PackageAccessService,
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

    const statusParam = query.status?.trim().toUpperCase();
    let statusFilter: PurchaseStatus | undefined = undefined;
    if (statusParam) {
      if (statusParam === 'APPROVED' || statusParam === 'VERIFIED' || statusParam === 'PAID') {
        statusFilter = PurchaseStatus.PAID;
      } else if (statusParam === 'REJECTED') {
        statusFilter = PurchaseStatus.REJECTED;
      } else if (statusParam === 'PENDING') {
        statusFilter = PurchaseStatus.PENDING;
      } else if (statusParam === 'WAITING_VERIFICATION' || statusParam === 'PAYMENT_SUBMITTED') {
        statusFilter = PurchaseStatus.WAITING_VERIFICATION;
      } else if (statusParam === 'CANCELLED' || statusParam === 'EXPIRED') {
        statusFilter = PurchaseStatus.CANCELLED;
      } else if (Object.values(PurchaseStatus).includes(statusParam as PurchaseStatus)) {
        statusFilter = statusParam as PurchaseStatus;
      } else {
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }

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
      ...(search
        ? {
            OR: [
              { id: search },
              { invoiceNumber: { contains: search } },
              { userId: search },
              { user: { displayName: { contains: search } } },
              { user: { phone: { contains: search } } },
            ],
          }
        : {}),
      ...(from || until
        ? { createdAt: { ...(from ? { gte: from } : {}), ...(until ? { lt: until } : {}) } }
        : {}),
    };

    const baseWhere: Prisma.PembelianWhereInput = {
      ...summaryWhere,
      ...(query.purchaseId ? { id: query.purchaseId } : {}),
    };

    const itemWhere: Prisma.PembelianWhereInput = {
      ...baseWhere,
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    if (query.cursor) {
      const visibleCursor = await this.db.pembelian.findFirst({
        where: { ...itemWhere, id: query.cursor },
        select: { id: true },
      });
      if (!visibleCursor) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const [rows, grouped, totalAmountAgg, agingOver24Hours] = await Promise.all([
      this.db.pembelian.findMany({
        where: itemWhere,
        include: {
          user: { select: { id: true, displayName: true, phone: true } },
          branch: { select: { id: true, code: true, name: true, timezone: true } },
          package: true,
          paymentProof: true,
          customerPackage: true,
        },
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      }),
      this.db.pembelian.groupBy({
        by: ['status'],
        where: summaryWhere,
        _count: { _all: true },
      }),
      this.db.pembelian.aggregate({
        where: summaryWhere,
        _sum: { totalAmountRp: true },
      }),
      this.db.pembelian.count({
        where: {
          ...summaryWhere,
          status: PurchaseStatus.PENDING,
          createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const hasMore = rows.length > limit;
    const pageRows = rows.slice(0, limit);
    const counts = new Map(grouped.map((item) => [item.status, item._count._all]));
    const generatedAt = new Date();

    return {
      items: pageRows.map(
        ({
          user,
          branch,
          package: pkg,
          paymentProof,
          customerPackage,
          ...item
        }) => {
          return {
            ...item,
            packageNameSnapshot: pkg?.name ?? null,
            sessionCountSnapshot: pkg?.sessionCount ?? null,
            durationDaysSnapshot: pkg?.validityDays ?? null,
            priceRpSnapshot: item.subtotalRp,
            payableAmountRpSnapshot: item.totalAmountRp,
            submittedAt: item.createdAt,
            decidedAt: item.verifiedAt,
            decidedById: item.verifiedById,
            decisionReasonCode: item.rejectionReason,
            customer: {
              id: user.id,
              displayName: user.displayName,
              phoneMasked: this.maskPhone(user.phone),
            },
            branch,
            package: pkg,
            paymentProof: paymentProof
              ? {
                  id: paymentProof.id,
                  fileUrl: paymentProof.fileUrl,
                  bankName: paymentProof.bankName,
                  accountHolder: paymentProof.accountHolder,
                  notes: paymentProof.notes,
                  uploadedAt: paymentProof.uploadedAt,
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                  finalizedAt: paymentProof.uploadedAt,
                }
              : null,
            activationSummary: this.activationSummary(customerPackage),
            auditReference: null,
          };
        },
      ),
      summary: {
        pending: (counts.get(PurchaseStatus.PENDING) ?? 0) + (counts.get(PurchaseStatus.WAITING_VERIFICATION) ?? 0),
        actionRequired: 0,
        approved: counts.get(PurchaseStatus.PAID) ?? 0,
        rejected: counts.get(PurchaseStatus.REJECTED) ?? 0,
        expired: counts.get(PurchaseStatus.CANCELLED) ?? 0,
        totalAmountRp: totalAmountAgg._sum.totalAmountRp ?? 0,
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
      validFrom: Date;
      validUntil: Date;
      totalSessions: number;
      remainingSessions: number;
      usedSessions: number;
    } | null,
  ) {
    if (!customerPackage) return null;
    const status =
      customerPackage.validUntil.getTime() <= Date.now()
        ? 'EXPIRED'
        : customerPackage.status;
    return {
      customerPackageId: customerPackage.id,
      status,
      activationDate: customerPackage.validFrom,
      expiryAt: customerPackage.validUntil,
      sessionCount: customerPackage.totalSessions,
      ledgerBalance: customerPackage.remainingSessions,
      reserved: 0,
      available: status === 'ACTIVE' ? customerPackage.remainingSessions : 0,
      used: customerPackage.usedSessions,
    };
  }

  async get(principal: SessionPrincipal, id: string, _usageCursor?: string) {
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
        user: { select: { id: true, displayName: true, phone: true } },
        branch: { select: { id: true, code: true, name: true, timezone: true } },
        package: true,
        voucher: true,
        paymentProof: true,
        customerPackage: {
          include: {
            bookings: {
              include: {
                classSlot: {
                  include: {
                    classType: true,
                  },
                },
              },
              orderBy: { bookedAt: 'desc' },
              take: 20,
            },
          },
        },
      },
    });
    if (!purchase) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const {
      user,
      branch,
      package: pkg,
      paymentProof,
      customerPackage,
      ...item
    } = purchase;

    const activationSummary = this.activationSummary(customerPackage);
    const bookingItems = customerPackage?.bookings ?? [];

    return {
      purchase: {
        ...item,
        packageNameSnapshot: pkg?.name ?? null,
        sessionCountSnapshot: pkg?.sessionCount ?? null,
        durationDaysSnapshot: pkg?.validityDays ?? null,
        priceRpSnapshot: item.subtotalRp,
        payableAmountRpSnapshot: item.totalAmountRp,
        submittedAt: item.createdAt,
        decidedAt: item.verifiedAt,
        decidedById: item.verifiedById,
        decisionReasonCode: item.rejectionReason,
        customer: {
          id: user.id,
          displayName: user.displayName,
          phoneMasked: this.maskPhone(user.phone),
        },
        branch,
        paymentProof: paymentProof
          ? {
              id: paymentProof.id,
              fileUrl: paymentProof.fileUrl,
              bankName: paymentProof.bankName,
              accountHolder: paymentProof.accountHolder,
              notes: paymentProof.notes,
              uploadedAt: paymentProof.uploadedAt,
              uploadStatus: 'FINALIZED',
              scanStatus: 'CLEAN',
              finalizedAt: paymentProof.uploadedAt,
            }
          : null,
        activationSummary,
        auditReference: null,
      },
      timeline: {
        submittedAt: item.createdAt,
        proofFinalizedAt: paymentProof?.uploadedAt ?? null,
        decidedAt: item.verifiedAt ?? null,
      },
      decisionActorMasked: item.verifiedById ? `Staf •${item.verifiedById.slice(-6)}` : null,
      activation: customerPackage
        ? {
            customerPackageId: customerPackage.id,
            packageId: customerPackage.packageId,
            packageName: pkg?.name ?? null,
            status: customerPackage.status,
            sessionCount: customerPackage.totalSessions,
            activationDate: customerPackage.validFrom,
            expiryAt: customerPackage.validUntil,
            ledgerEntryId: null,
            ledgerQuantity: customerPackage.remainingSessions,
            ledgerOccurredAt: customerPackage.createdAt,
          }
        : null,
      balance: activationSummary,
      usageHistory: {
        items: bookingItems.map((b) => ({
          id: b.id,
          type: 'ATTEND',
          label: `Booking: ${b.classSlot?.classType?.name ?? 'Kelas'}`,
          quantity: -1,
          balanceAfter: 0,
          occurredAt: b.bookedAt,
          referenceType: 'BOOKING',
          referenceId: b.id,
        })),
        page: {
          hasMore: false,
          nextCursor: null,
        },
      },
    };
  }

  async authorizeProofDownload(principal: SessionPrincipal, id: string, _correlationId: string) {
    this.access.review(principal);
    const proof = await this.db.buktiPembayaran.findUnique({
      where: { id },
      include: { purchase: true },
    });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.scope(principal, proof.purchase.branchId, ['payment:review', 'purchase:review']);
    return {
      url: proof.fileUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  async authorizeOwnOrderProof(
    principal: SessionPrincipal,
    orderId: string,
    _correlationId: string,
  ) {
    this.access.catalog(principal);
    const order = await this.db.pembelian.findFirst({
      where: { id: orderId, userId: principal.userId },
      include: { paymentProof: true },
    });
    if (!order?.paymentProof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      url: order.paymentProof.fileUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  async viewProofContent(principal: SessionPrincipal, id: string, _correlationId: string) {
    const proof = await this.db.buktiPembayaran.findUnique({
      where: { id },
      include: { purchase: true },
    });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (proof.fileUrl.startsWith('data:')) {
      const parts = proof.fileUrl.split(',');
      const mime = parts[0]?.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(parts[1] || '', 'base64');
      return { bytes: buffer, mimeType: mime };
    }
    return {
      bytes: Buffer.from(proof.fileUrl, 'utf-8'),
      mimeType: 'image/jpeg',
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
    if (!key)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const allowedReasons =
      decision === 'APPROVED'
        ? ['PAYMENT_VERIFIED']
        : ['PROOF_INVALID', 'AMOUNT_MISMATCH', 'DUPLICATE_PURCHASE', 'OTHER_REVIEW_REQUIRED'];
    if (input.reasonCode && !allowedReasons.includes(input.reasonCode))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const note = input.note?.trim();
    if (input.reasonCode === 'OTHER_REVIEW_REQUIRED' && (!note || note.length < 3))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (note && note.length > 500)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    let result!: { status: number; body: Prisma.InputJsonValue; replay: boolean };
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
          if (purchase.status !== 'PENDING' && purchase.status !== 'WAITING_VERIFICATION')
            throw new ApiProblem('PURCHASE_ALREADY_DECIDED', HttpStatus.CONFLICT);

          const decidedAt = new Date();
          const nextStatus = decision === 'APPROVED' ? PurchaseStatus.PAID : PurchaseStatus.REJECTED;

          const updated = await tx.pembelian.update({
            where: { id },
            data: {
              status: nextStatus,
              paidAt: decision === 'APPROVED' ? decidedAt : undefined,
              verifiedAt: decidedAt,
              verifiedById: principal.userId,
              rejectionReason: decision === 'REJECTED' ? (input.note || input.reasonCode || 'REJECTED') : null,
            },
          });

          let customerPackage = null;
          if (decision === 'APPROVED') {
            const validUntil = new Date(
              decidedAt.getTime() + (purchase.package.validityDays || 30) * 24 * 60 * 60 * 1000,
            );

            customerPackage = await tx.paketPelanggan.create({
              data: {
                userId: purchase.userId,
                packageId: purchase.packageId,
                purchaseId: purchase.id,
                totalSessions: purchase.package.sessionCount,
                remainingSessions: purchase.package.sessionCount,
                usedSessions: 0,
                validFrom: decidedAt,
                validUntil,
                status: 'ACTIVE',
              },
            });

            // Catat mutasi awal kuota sesi di SessionLedger (Spesifikasi v1.0)
            await tx.sessionLedger.create({
              data: {
                customerPackageId: customerPackage.id,
                type: SessionMutationType.PURCHASE,
                amount: purchase.package.sessionCount,
                balanceAfter: purchase.package.sessionCount,
                referenceId: purchase.id,
                notes: `Saldo awal pembelian paket #${purchase.invoiceNumber}`,
                createdById: principal.userId,
              },
            });
          }

          const purchaseWithAudit = { ...updated, auditReference: null };

          return {
            status: 200,
            body: (decision === 'APPROVED'
              ? {
                  purchase: purchaseWithAudit,
                  customerPackage: customerPackage
                    ? {
                        ...customerPackage,
                        packageName: purchase.package.name,
                        branchName: purchase.branch.name,
                        ledgerBalance: customerPackage.remainingSessions,
                        reserved: 0,
                        available: customerPackage.remainingSessions,
                      }
                    : null,
                  ledgerEntry: null,
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
        include: { package: true },
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
          packageName: purchase.package.name,
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
      // ignore email error
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

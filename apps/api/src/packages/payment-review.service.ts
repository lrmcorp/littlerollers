import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async list(principal: SessionPrincipal, branchId?: string) {
    const reviewer =
      principal.capabilities.includes('payment:review') ||
      principal.capabilities.includes('purchase:review');
    if (reviewer) this.access.review(principal);
    else this.access.catalog(principal);
    if (branchId) this.access.scope(principal, branchId);
    const items = await this.db.purchase.findMany({
      where: {
        ...(!reviewer ? { userId: principal.userId } : {}),
        ...(branchId
          ? { branchId }
          : reviewer &&
              !principal.capabilities.includes('branch:all') &&
              !principal.capabilities.includes('finance:reconcile')
            ? { branchId: { in: principal.branchIds } }
            : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
    return {
      items: items.map(({ paymentAccountNumberSnapshotEncrypted, ...item }) => {
        void paymentAccountNumberSnapshotEncrypted;
        return item;
      }),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async authorizeProofDownload(principal: SessionPrincipal, id: string) {
    this.access.review(principal);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.scope(principal, proof.branchId);
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    const ttl = syntheticConfigSeconds('PAYMENT_PROOF_TTL_SECONDS', 900);
    return {
      url: `/api/v1/uploads/payment-proofs/${id}/content-view`,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };
  }

  async viewProofContent(principal: SessionPrincipal, id: string) {
    this.access.review(principal);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.scope(principal, proof.branchId);
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    return {
      bytes: await this.storage.readPrivateObject(proof.objectKey),
      mimeType: proof.mimeType,
    };
  }

  async decide(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { reasonCode?: string; expectedVersion?: number },
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
          this.access.scope(principal, purchase.branchId);
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
          await this.access.audit(
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
          );
          return {
            status: 200,
            body: (decision === 'APPROVED'
              ? { purchase: updated, customerPackage, ledgerEntry, idempotentReplay: false }
              : updated) as unknown as Prisma.InputJsonValue,
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

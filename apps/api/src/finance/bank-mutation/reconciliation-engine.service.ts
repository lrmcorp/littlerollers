import { Injectable, Logger, Optional } from '@nestjs/common';
import { PurchaseStatus, SessionMutationType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../foundation/audit.service';
import type { ReconciliationOutcome } from './bank-mutation.types';

@Injectable()
export class ReconciliationEngineService {
  private readonly logger = new Logger(ReconciliationEngineService.name);

  constructor(
    private readonly db: PrismaService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  /**
   * Run automated reconciliation across given mutation IDs or all UNMATCHED bank mutations
   */
  async reconcile(options: {
    mutationIds?: string[];
    dateToleranceDays?: number;
    /** Pengguna yang memicu rekonsiliasi; kosong bila dijalankan sistem. */
    actorId?: string;
    correlationId?: string;
  } = {}): Promise<ReconciliationOutcome> {
    const toleranceDays = options.dateToleranceDays ?? 3;
    const toleranceMs = toleranceDays * 24 * 60 * 60 * 1000;

    const whereClause: any = {
      status: 'UNMATCHED',
    };
    if (options.mutationIds && options.mutationIds.length > 0) {
      whereClause.id = { in: options.mutationIds };
    }

    const mutations = await this.db.mutasiBank.findMany({
      where: whereClause,
      orderBy: [{ transactionDate: 'asc' }, { createdAt: 'asc' }],
    });

    const outcome: ReconciliationOutcome = {
      totalProcessed: mutations.length,
      matchedCount: 0,
      manualReviewCount: 0,
      unmatchedCount: 0,
      details: [],
    };

    for (const mutation of mutations) {
      const txDate = new Date(mutation.transactionDate);
      const minDate = new Date(txDate.getTime() - toleranceMs);
      const maxDate = new Date(txDate.getTime() + toleranceMs);

      // Find candidate purchases matching exact totalAmountRp in +/- tolerance window
      const candidates = await this.db.pembelian.findMany({
        where: {
          status: { in: [PurchaseStatus.PENDING, PurchaseStatus.WAITING_VERIFICATION] },
          totalAmountRp: mutation.amountRp,
          createdAt: {
            gte: minDate,
            lte: maxDate,
          },
        },
        include: {
          package: true,
          user: { select: { id: true, displayName: true } },
          customerPackage: true,
        },
      });

      const candidate = candidates[0];
      if (candidates.length === 1 && candidate) {
        // Exactly one match found! Safely execute auto-reconcile in transaction
        const now = new Date();
        const validityDays = candidate.package.validityDays || 30;
        const validUntil = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

        try {
          await this.db.$transaction(async (tx) => {
            // 1. Update purchase to PAID
            await tx.pembelian.update({
              where: { id: candidate.id },
              data: {
                status: PurchaseStatus.PAID,
                paidAt: mutation.transactionDate,
                verifiedAt: now,
                rejectionReason: null,
                recordNote: `SYSTEM_AUTO_RECONCILE (Mutasi: ${mutation.bankName} Ref: ${mutation.referenceNumber})`,
              },
            });

            // 2. Create customer package (PaketPelanggan)
            const customerPkg = await tx.paketPelanggan.create({
              data: {
                userId: candidate.userId,
                packageId: candidate.packageId,
                purchaseId: candidate.id,
                totalSessions: candidate.package.sessionCount,
                remainingSessions: candidate.package.sessionCount,
                usedSessions: 0,
                validFrom: now,
                validUntil,
                status: 'ACTIVE',
              },
            });

            // 3. Record session mutation ledger
            await tx.sessionLedger.create({
              data: {
                customerPackageId: customerPkg.id,
                type: SessionMutationType.PURCHASE,
                amount: candidate.package.sessionCount,
                balanceAfter: candidate.package.sessionCount,
                referenceId: candidate.id,
                notes: `Saldo awal pembelian paket #${candidate.invoiceNumber} (Auto-Reconcile Mutasi ${mutation.bankName})`,
              },
            });

            // 4. Update mutasi_bank status to MATCHED
            await tx.mutasiBank.update({
              where: { id: mutation.id },
              data: {
                status: 'MATCHED',
                matchedPurchaseId: candidate.id,
                matchedAt: now,
                notes: `Otomatis dicocokkan dengan invoice #${candidate.invoiceNumber} (${candidate.user?.displayName})`,
              },
            });

            // 5. Pembayaran dinyatakan lunas oleh sistem: wajib punya jejak permanen.
            await this.audit?.catat(tx, {
              actorId: options.actorId,
              branchId: candidate.branchId ?? undefined,
              correlationId: options.correlationId,
              action: 'finance.purchase_auto_reconciled',
              objectType: 'Purchase',
              objectId: candidate.id,
              targetUserId: candidate.userId,
              reason: 'Nominal cocok dengan satu mutasi bank',
              beforeMasked: { status: candidate.status },
              afterMasked: {
                status: PurchaseStatus.PAID,
                mutationId: mutation.id,
                bankName: mutation.bankName,
                amountRp: mutation.amountRp,
                customerPackageId: customerPkg.id,
              },
            });
          });

          outcome.matchedCount++;
          outcome.details.push({
            mutationId: mutation.id,
            amountRp: mutation.amountRp,
            status: 'MATCHED',
            matchedPurchaseId: candidate.id,
            invoiceNumber: candidate.invoiceNumber,
            customerName: candidate.user?.displayName,
            reason: `Cocok 100% dengan nominal invoice #${candidate.invoiceNumber}`,
          });

          this.logger.log(
            `Auto-reconciled mutation ${mutation.referenceNumber} to invoice ${candidate.invoiceNumber}`,
          );
        } catch (err: any) {
          this.logger.error(
            `Failed to commit auto-reconciliation for mutation ${mutation.id}: ${err.message}`,
          );
          outcome.unmatchedCount++;
          outcome.details.push({
            mutationId: mutation.id,
            amountRp: mutation.amountRp,
            status: 'UNMATCHED',
            reason: `Transaksi gagal: ${err.message}`,
          });
        }
      } else if (candidates.length > 1) {
        // Multiple candidate purchases match the exact amount on the same window: Ambiguous!
        const invoiceList = candidates.map((c) => c.invoiceNumber).join(', ');
        const reason = `Ditemukan ${candidates.length} tagihan nominal kembar (${invoiceList}). Perlu verifikasi manual kasir.`;

        await this.db.mutasiBank.update({
          where: { id: mutation.id },
          data: {
            status: 'MANUAL_REVIEW',
            notes: reason,
          },
        });

        outcome.manualReviewCount++;
        outcome.details.push({
          mutationId: mutation.id,
          amountRp: mutation.amountRp,
          status: 'MANUAL_REVIEW',
          reason,
        });

        this.logger.warn(`Mutation ${mutation.referenceNumber} flagged for MANUAL_REVIEW: ${reason}`);
      } else {
        // 0 candidate found
        const reason = `Tidak ditemukan tagihan PENDING/WAITING_VERIFICATION dengan nominal Rp ${mutation.amountRp.toLocaleString('id-ID')} (+/- ${toleranceDays} hari).`;

        await this.db.mutasiBank.update({
          where: { id: mutation.id },
          data: {
            status: 'UNMATCHED',
            notes: reason,
          },
        });

        outcome.unmatchedCount++;
        outcome.details.push({
          mutationId: mutation.id,
          amountRp: mutation.amountRp,
          status: 'UNMATCHED',
          reason,
        });
      }
    }

    return outcome;
  }
}

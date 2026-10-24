
import { BankMutationService } from './bank-mutation.service';
import { ReconciliationEngineService } from './reconciliation-engine.service';
import { PaymentExpirationWorkerService } from '../../packages/payment-expiration-worker';
import { PurchaseStatus, SessionMutationType } from '@prisma/client';

describe('Bank Mutation & Auto-Reconciliation Engine (Poin 4)', () => {
  let mockDb: any;
  let bankMutationService: BankMutationService;
  let reconciliationService: ReconciliationEngineService;
  let expirationWorker: PaymentExpirationWorkerService;

  beforeEach(() => {
    mockDb = {
      mutasiBank: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      pembelian: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      paketPelanggan: {
        create: jest.fn(),
      },
      sessionLedger: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    bankMutationService = new BankMutationService(mockDb);
    reconciliationService = new ReconciliationEngineService(mockDb);
    expirationWorker = new PaymentExpirationWorkerService(mockDb);
  });

  describe('1. Bank Statement Parsing & Deduplication', () => {
    it('mengurai mutasi BCA format CSV dengan tanda CR (Credit) dan tanggal Indonesia', () => {
      const bcaCsv = `
Tanggal,Keterangan,Cabang,Jumlah,Saldo
13/10/2026,TRSF E-BANKING CR 1310 LUSIANNA,0000,1.900.844,00 CR,50.000.000,00
13/10/2026,TARIK TUNAI DB,0000,500.000,00 DB,49.500.000,00
      `.trim();

      const parsed = bankMutationService.parseInput({
        format: 'BCA',
        bankName: 'BCA',
        csvText: bcaCsv,
      });

      expect(parsed).toHaveLength(1); // Debit diabaikan
      expect(parsed[0]!.bankName).toBe('BCA');
      expect(parsed[0]!.amountRp).toBe(1900844);
      expect(parsed[0]!.description).toContain('LUSIANNA');
    });

    it('mengurai mutasi format JSON terstruktur', () => {
      const items = [
        {
          bankName: 'MANDIRI',
          transactionDate: '2026-10-13T10:00:00.000Z',
          amountRp: 2500123,
          description: 'TRANSFER DARI BUDI',
          referenceNumber: 'MDR-20261013-001',
        },
      ];

      const parsed = bankMutationService.parseInput({ items });
      expect(parsed).toHaveLength(1);
      expect(parsed[0]!.amountRp).toBe(2500123);
      expect(parsed[0]!.referenceNumber).toBe('MDR-20261013-001');
    });

    it('mendeduplikasi nomor referensi yang sudah tersimpan di database', async () => {
      mockDb.mutasiBank.findUnique.mockResolvedValueOnce({
        id: 'mut-existing-1',
        bankName: 'BCA',
        transactionDate: new Date('2026-10-13'),
        amountRp: 1900844,
        description: 'TRSF LUSIANNA',
        referenceNumber: 'REF-123',
        status: 'UNMATCHED',
      });

      const result = await bankMutationService.ingestMutations([
        {
          bankName: 'BCA',
          transactionDate: new Date('2026-10-13'),
          amountRp: 1900844,
          description: 'TRSF LUSIANNA',
          referenceNumber: 'REF-123',
        },
      ]);

      expect(result.insertedCount).toBe(0);
      expect(result.duplicateCount).toBe(1);
      expect(mockDb.mutasiBank.create).not.toHaveBeenCalled();
    });
  });

  describe('2. Automated Reconciliation Engine', () => {
    it('Skenario Tepat 1 Cocok: Otomatis PAID, buat PaketPelanggan ACTIVE & SessionLedger', async () => {
      const mutationDate = new Date('2026-10-13T08:00:00.000Z');
      const mutation = {
        id: 'mut-101',
        bankName: 'BCA',
        transactionDate: mutationDate,
        amountRp: 1900844,
        description: 'TRSF E-BANKING CR LUSIANNA',
        referenceNumber: 'REF-BCA-844',
        status: 'UNMATCHED',
      };

      mockDb.mutasiBank.findMany.mockResolvedValueOnce([mutation]);

      const candidatePurchase = {
        id: 'purch-844',
        invoiceNumber: 'INV/20261013/00844',
        userId: 'user-lusianna',
        packageId: 'pkg-pvg-8',
        totalAmountRp: 1900844,
        status: PurchaseStatus.WAITING_VERIFICATION,
        createdAt: new Date('2026-10-13T07:30:00.000Z'),
        package: {
          id: 'pkg-pvg-8',
          name: '8 Sessions PVG',
          sessionCount: 8,
          validityDays: 60,
        },
        user: { id: 'user-lusianna', displayName: 'Lusianna' },
      };

      mockDb.pembelian.findMany.mockResolvedValueOnce([candidatePurchase]);
      mockDb.paketPelanggan.create.mockResolvedValueOnce({ id: 'cpkg-844' });

      const outcome = await reconciliationService.reconcile({
        mutationIds: ['mut-101'],
      });

      expect(outcome.matchedCount).toBe(1);
      expect(outcome.manualReviewCount).toBe(0);
      expect(outcome.unmatchedCount).toBe(0);

      // Verifikasi update pembelian menjadi PAID
      expect(mockDb.pembelian.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'purch-844' },
          data: expect.objectContaining({
            status: PurchaseStatus.PAID,
            paidAt: mutationDate,
            recordNote: expect.stringContaining('SYSTEM_AUTO_RECONCILE'),
          }),
        }),
      );

      // Verifikasi pembuatan paket pelanggan ACTIVE
      expect(mockDb.paketPelanggan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-lusianna',
            packageId: 'pkg-pvg-8',
            purchaseId: 'purch-844',
            totalSessions: 8,
            remainingSessions: 8,
            status: 'ACTIVE',
          }),
        }),
      );

      // Verifikasi pencatatan session ledger
      expect(mockDb.sessionLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerPackageId: 'cpkg-844',
            type: SessionMutationType.PURCHASE,
            amount: 8,
            balanceAfter: 8,
          }),
        }),
      );

      // Verifikasi mutasi ditandai MATCHED
      expect(mockDb.mutasiBank.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mut-101' },
          data: expect.objectContaining({
            status: 'MATCHED',
            matchedPurchaseId: 'purch-844',
          }),
        }),
      );
    });

    it('Pencocokan otomatis meninggalkan jejak audit permanen dalam transaksi yang sama', async () => {
      const audit = { catat: jest.fn().mockResolvedValue(undefined) };
      const service = new ReconciliationEngineService(mockDb, audit as never);
      mockDb.mutasiBank.findMany.mockResolvedValueOnce([
        { id: 'mut-1', bankName: 'BCA', transactionDate: new Date('2026-10-13T08:00:00Z'), amountRp: 500000, referenceNumber: 'REF-1', status: 'UNMATCHED' },
      ]);
      mockDb.pembelian.findMany.mockResolvedValueOnce([
        {
          id: 'purch-1', invoiceNumber: 'INV-1', userId: 'user-1', packageId: 'pkg-1', branchId: 'branch-1',
          totalAmountRp: 500000, status: PurchaseStatus.WAITING_VERIFICATION, createdAt: new Date('2026-10-13T07:00:00Z'),
          package: { id: 'pkg-1', name: 'Paket', sessionCount: 4, validityDays: 30 }, user: { id: 'user-1', displayName: 'Rina' },
        },
      ]);
      mockDb.paketPelanggan.create.mockResolvedValueOnce({ id: 'cpkg-1' });
      await service.reconcile({ mutationIds: ['mut-1'], actorId: 'staff-1', correlationId: 'corr-9' });
      expect(audit.catat).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          actorId: 'staff-1',
          branchId: 'branch-1',
          action: 'finance.purchase_auto_reconciled',
          objectType: 'Purchase',
          objectId: 'purch-1',
          targetUserId: 'user-1',
          beforeMasked: { status: PurchaseStatus.WAITING_VERIFICATION },
          afterMasked: expect.objectContaining({ status: PurchaseStatus.PAID, mutationId: 'mut-1', customerPackageId: 'cpkg-1' }),
        }),
      );
    });

    it('Skenario Nominal Kembar: Tandai MANUAL_REVIEW dan tolak auto-approval buta', async () => {
      const mutation = {
        id: 'mut-duplicate-nominal',
        bankName: 'BCA',
        transactionDate: new Date('2026-10-13T09:00:00.000Z'),
        amountRp: 1900500,
        description: 'TRSF DARI CUSTOMER',
        referenceNumber: 'REF-DUP-500',
        status: 'UNMATCHED',
      };

      mockDb.mutasiBank.findMany.mockResolvedValueOnce([mutation]);

      // Dua tagihan dengan nominal yang sama persis
      const candidate1 = {
        id: 'purch-dup-1',
        invoiceNumber: 'INV/001',
        totalAmountRp: 1900500,
        status: PurchaseStatus.WAITING_VERIFICATION,
        createdAt: new Date('2026-10-13T08:00:00.000Z'),
        package: { sessionCount: 8, validityDays: 30 },
      };
      const candidate2 = {
        id: 'purch-dup-2',
        invoiceNumber: 'INV/002',
        totalAmountRp: 1900500,
        status: PurchaseStatus.WAITING_VERIFICATION,
        createdAt: new Date('2026-10-13T08:30:00.000Z'),
        package: { sessionCount: 8, validityDays: 30 },
      };

      mockDb.pembelian.findMany.mockResolvedValueOnce([candidate1, candidate2]);

      const outcome = await reconciliationService.reconcile({
        mutationIds: ['mut-duplicate-nominal'],
      });

      expect(outcome.matchedCount).toBe(0);
      expect(outcome.manualReviewCount).toBe(1);
      expect(mockDb.pembelian.update).not.toHaveBeenCalled();
      expect(mockDb.paketPelanggan.create).not.toHaveBeenCalled();

      // Mutasi bank dialihkan ke MANUAL_REVIEW
      expect(mockDb.mutasiBank.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mut-duplicate-nominal' },
          data: expect.objectContaining({
            status: 'MANUAL_REVIEW',
            notes: expect.stringContaining('nominal kembar'),
          }),
        }),
      );
    });

    it('Skenario Tidak Ada Tagihan Cocok: Tetap UNMATCHED dengan alasan jelas', async () => {
      const mutation = {
        id: 'mut-unknown',
        bankName: 'BCA',
        transactionDate: new Date('2026-10-13T10:00:00.000Z'),
        amountRp: 9999999,
        description: 'SALDO MISTERIUS',
        referenceNumber: 'REF-UNK',
        status: 'UNMATCHED',
      };

      mockDb.mutasiBank.findMany.mockResolvedValueOnce([mutation]);
      mockDb.pembelian.findMany.mockResolvedValueOnce([]); // 0 calon

      const outcome = await reconciliationService.reconcile({
        mutationIds: ['mut-unknown'],
      });

      expect(outcome.unmatchedCount).toBe(1);
      expect(outcome.matchedCount).toBe(0);
      expect(mockDb.mutasiBank.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mut-unknown' },
          data: expect.objectContaining({
            status: 'UNMATCHED',
            notes: expect.stringContaining('Tidak ditemukan tagihan'),
          }),
        }),
      );
    });
  });

  describe('3. Payment Expiration Worker', () => {
    it('membatalkan tagihan PENDING tanpa bukti bayar yang kedaluwarsa > 24 jam', async () => {
      mockDb.pembelian.findMany.mockResolvedValueOnce([
        { id: 'purch-stale-1', invoiceNumber: 'INV/STALE/1', createdAt: new Date('2026-10-01') },
        { id: 'purch-stale-2', invoiceNumber: 'INV/STALE/2', createdAt: new Date('2026-10-02') },
      ]);
      mockDb.pembelian.updateMany.mockResolvedValueOnce({ count: 2 });

      const result = await expirationWorker.expirePendingOrders(24);

      expect(result.expiredCount).toBe(2);
      expect(result.cancelledIds).toEqual(['purch-stale-1', 'purch-stale-2']);
      expect(mockDb.pembelian.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['purch-stale-1', 'purch-stale-2'] } },
          data: expect.objectContaining({
            status: PurchaseStatus.CANCELLED,
          }),
        }),
      );
    });

    it('tidak membatalkan apapun jika tidak ada tagihan PENDING kedaluwarsa', async () => {
      mockDb.pembelian.findMany.mockResolvedValueOnce([]);

      const result = await expirationWorker.expirePendingOrders(24);

      expect(result.expiredCount).toBe(0);
      expect(mockDb.pembelian.updateMany).not.toHaveBeenCalled();
    });
  });
});

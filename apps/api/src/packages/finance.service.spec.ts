import { createHash } from 'node:crypto';
import { PolicyService } from '../identity/policy.service';
import { FinanceService } from './finance.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);
const journalId = id(30);

const principal = (
  capabilities: string[],
  role: string,
  userId: string,
  branchIds: string[] = [],
) => ({
  sessionId: 's',
  userId,
  roles: [{ role, branchId: null }] as never,
  capabilities,
  branchIds,
});

const finance = principal(
  ['finance:read', 'finance:manage', 'finance:export', 'branch:all'],
  'FINANCE',
  id(100),
);
const superOwner = principal(
  ['finance:read', 'finance:manage', 'finance:export', 'branch:all'],
  'SUPER_OWNER',
  id(101),
);

const journal = (overrides: Record<string, unknown> = {}) => ({
  id: journalId,
  branchId: branchA,
  period: '2026-09',
  targetPeriod: '2026-08',
  amountRp: 150_000,
  reason: 'Salah input biaya',
  status: 'PENDING' as const,
  requestedById: finance.userId,
  approvedById: null,
  decisionReason: null,
  version: 1,
  ...overrides,
});

function setup() {
  const db = {
    correctionJournal: {
      create: jest.fn().mockImplementation(async ({ data }) =>
        journal({
          branchId: data.branchId,
          period: data.period,
          targetPeriod: data.targetPeriod,
          amountRp: data.amountRp,
          reason: data.reason,
          requestedById: data.requestedById,
        }),
      ),
      findUnique: jest.fn().mockResolvedValue(journal()),
      findUniqueOrThrow: jest
        .fn()
        .mockResolvedValue(
          journal({ status: 'APPROVED', approvedById: superOwner.userId, version: 2 }),
        ),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findMany: jest.fn().mockResolvedValue([journal()]),
    },
    pembelian: { findMany: jest.fn().mockResolvedValue([]) },
    otherCost: { findMany: jest.fn().mockResolvedValue([]) },
    cabang: { findUnique: jest.fn().mockResolvedValue({ code: 'DD-GG' }) },
  };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  const service = new FinanceService(db as never, new PolicyService(), audit as never);
  return { service, db, audit };
}

const request = {
  branchId: branchA,
  currentPeriod: '2026-09',
  referencePeriod: '2026-08',
  amountRp: 150_000,
  reason: 'Salah input biaya',
};

describe('FinanceService corrections follow the generated-client contract', () => {
  it('maps the contract field names onto the journal and returns the Correction view', async () => {
    const { service, db } = setup();
    const created = await service.createCorrection(finance, request);
    expect(db.correctionJournal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        period: '2026-09',
        targetPeriod: '2026-08',
        amountRp: 150_000,
        requestedById: finance.userId,
        status: 'PENDING',
      }),
    });
    expect(created).toMatchObject({
      currentPeriod: '2026-09',
      referencePeriod: '2026-08',
      amount: { amountMinor: 15_000_000, currency: 'IDR' },
      requestedBy: finance.userId,
      status: 'PENDING',
      version: 1,
    });
  });

  it('still accepts the legacy field names', async () => {
    const { service, db } = setup();
    await service.createCorrection(finance, {
      branchId: branchA,
      period: '2026-09',
      targetPeriod: '2026-07',
      amountRp: -5000,
      reason: 'Koreksi lama',
    });
    expect(db.correctionJournal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ period: '2026-09', targetPeriod: '2026-07', amountRp: -5000 }),
    });
  });

  it.each([
    [{ currentPeriod: '2026-13' }],
    [{ referencePeriod: '2026-09' }],
    [{ referencePeriod: '2026-10' }],
    [{ amountRp: 0 }],
    [{ amountRp: 1.5 }],
    [{ reason: 'ab' }],
    [{ branchId: '' }],
  ])('rejects invalid request %j before persistence', async (patch) => {
    const { service, db } = setup();
    await expect(service.createCorrection(finance, { ...request, ...patch })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(db.correctionJournal.create).not.toHaveBeenCalled();
  });

  it('requires finance:manage to request and a branch the requester can access', async () => {
    const { service } = setup();
    await expect(
      service.createCorrection(principal(['finance:read'], 'FINANCE', id(102)), request),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const branchOwner = principal(['finance:read', 'finance:manage'], 'OWNER', id(103), [branchB]);
    await expect(service.createCorrection(branchOwner, request)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('lets only Super Owner decide, never the requester (separation of duties)', async () => {
    const { service, db } = setup();
    await expect(
      service.decideCorrection(finance, journalId, 'approve', { reason: 'Setuju' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    db.correctionJournal.findUnique.mockResolvedValue(journal({ requestedById: superOwner.userId }));
    await expect(
      service.decideCorrection(superOwner, journalId, 'approve', { reason: 'Setuju' }),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES' });
    expect(db.correctionJournal.updateMany).not.toHaveBeenCalled();
  });

  it('approves a pending correction from another user with the contract result', async () => {
    const { service, db, audit } = setup();
    const result = await service.decideCorrection(superOwner, journalId, 'approve', {
      reason: 'Bukti valid',
    });
    expect(db.correctionJournal.updateMany).toHaveBeenCalledWith({
      where: { id: journalId, status: 'PENDING', version: 1 },
      data: expect.objectContaining({
        status: 'APPROVED',
        approvedById: superOwner.userId,
        decisionReason: 'Bukti valid',
        version: { increment: 1 },
      }),
    });
    expect(result).toMatchObject({
      correction: { status: 'APPROVED', decidedBy: superOwner.userId, version: 2 },
      auditLogId: null,
      idempotentReplay: false,
    });
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'FINANCE_CORRECTION_APPROVED' }),
    );
  });

  it('rejects, validates the decision and reason, and refuses double decisions', async () => {
    const { service, db } = setup();
    await service.decideCorrection(superOwner, journalId, 'reject', { reason: 'Tidak cukup bukti' });
    expect(db.correctionJournal.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED' }) }),
    );
    await expect(
      service.decideCorrection(superOwner, journalId, 'maybe', { reason: 'Setuju' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.decideCorrection(superOwner, journalId, 'approve', {}),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    db.correctionJournal.findUnique.mockResolvedValue(journal({ status: 'APPROVED' }));
    await expect(
      service.decideCorrection(superOwner, journalId, 'approve', { reason: 'Setuju' }),
    ).rejects.toMatchObject({ code: 'CORRECTION_ALREADY_DECIDED' });
    db.correctionJournal.findUnique.mockResolvedValue(journal());
    db.correctionJournal.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.decideCorrection(superOwner, journalId, 'approve', { reason: 'Setuju' }),
    ).rejects.toMatchObject({ code: 'CORRECTION_ALREADY_DECIDED' });
  });

  it('lists corrections as contract views', async () => {
    const { service } = setup();
    const list = await service.listCorrections(finance, { status: 'PENDING' });
    expect(list.items[0]).toMatchObject({
      currentPeriod: '2026-09',
      referencePeriod: '2026-08',
      amount: { amountMinor: 15_000_000 },
    });
    expect(list.summary).toMatchObject({ total: 1, pending: 1 });
  });
});

describe('FinanceService.exportReport', () => {
  const range = { from: '2026-08-01T00:00:00.000Z', until: '2026-08-31T00:00:00.000Z' };
  const purchase = (n: number, name: string, amount: number, paidAt: string) => ({
    id: id(200 + n),
    invoiceNumber: `INV-${n}`,
    totalAmountRp: amount,
    paidAt: new Date(paidAt),
    createdAt: new Date(paidAt),
    branch: { code: 'DD-GG' },
    package: { name },
  });

  it('requires finance:export and a valid, bounded range', async () => {
    const { service } = setup();
    await expect(
      service.exportReport(principal(['finance:read'], 'FINANCE', id(104)), range),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.exportReport(finance, { from: 'x', until: 'y' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(
      service.exportReport(finance, { from: range.until, until: range.from }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.exportReport(finance, { from: '2025-01-01', until: '2026-08-31' }),
    ).rejects.toMatchObject({ code: 'EXPORT_RANGE_TOO_LARGE' });
  });

  it('respects branch access for non-global principals', async () => {
    const { service } = setup();
    const owner = principal(['finance:read', 'finance:export'], 'OWNER', id(105), [branchA]);
    await expect(
      service.exportReport(owner, { ...range, branchId: branchB }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('builds a CSV with totals, a control hash, no personal data and neutralised formulas', async () => {
    const { service, db, audit } = setup();
    db.pembelian.findMany.mockResolvedValue([
      purchase(1, 'Paket 4 Sesi', 1_000_000, '2026-08-05T03:00:00Z'),
      purchase(2, '=HYPERLINK("http://x","a")', 500_000, '2026-08-06T03:00:00Z'),
      purchase(3, 'Paket, dengan koma', 250_000, '2026-08-07T03:00:00Z'),
    ]);
    db.otherCost.findMany.mockResolvedValue([
      {
        id: id(300),
        period: '2026-08',
        category: 'SEWA',
        description: 'Sewa studio',
        amountRp: 400_000,
        branch: { code: 'DD-GG' },
      },
    ]);
    const result = await service.exportReport(superOwner, { ...range, branchId: branchA });

    expect(db.pembelian.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          branchId: branchA,
          status: 'PAID',
          paidAt: { gte: new Date(range.from), lt: new Date('2026-09-01T00:00:00.000Z') },
        }),
      }),
    );
    expect(result).toMatchObject({
      fileName: 'finance-DD-GG-2026-08-01-2026-08-31.csv',
      mimeType: 'text/csv;charset=utf-8',
      completeness: 'COMPLETE',
      auditLogId: null,
    });
    const rows = result.content.replace('﻿', '').trim().split('\r\n');
    expect(rows[0]).toBe('tanggal,cabang,jenis,referensi,keterangan,jumlah_rp');
    expect(rows[1]).toBe('2026-08-05,DD-GG,PENJUALAN_PAKET,INV-1,Paket 4 Sesi,1000000');
    expect(rows[2]).toContain(`'=HYPERLINK("http://x","a")`.replace(/"/g, '""'));
    expect(rows[3]).toContain('"Paket, dengan koma"');
    expect(rows.slice(-3)).toEqual([
      ',,TOTAL_PENJUALAN,,Penjualan paket lunas,1750000',
      ',,TOTAL_BIAYA_LAIN,,Biaya lain dihitung per bulan periode,400000',
      ',,SELISIH,,Penjualan dikurangi biaya lain,1350000',
    ]);
    expect(result.content).not.toMatch(/@|displayName|email|phone/i);
    expect(result.controlHash).toBe(createHash('sha256').update(result.content).digest('hex'));
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'FINANCE_EXPORT' }),
    );
  });

  it('flags an export cut at the row limit as INCOMPLETE', async () => {
    const { service, db } = setup();
    db.pembelian.findMany.mockResolvedValue(
      Array.from({ length: 50_001 }, (_, n) => purchase(n, 'P', 1000, '2026-08-05T03:00:00Z')),
    );
    const result = await service.exportReport(superOwner, range);
    expect(result.completeness).toBe('INCOMPLETE');
  });
});

describe('FinanceService.realtimeInstructorCostReport instructor attendance', () => {
  const instructor = { id: id(200), displayName: 'Coach Sarah' };
  const slot = (n: number, attended: boolean) => ({
    id: id(300 + n),
    branchId: branchA,
    classTypeId: id(400),
    startAt: new Date('2026-09-10T02:00:00.000Z'),
    endAt: new Date('2026-09-10T03:00:00.000Z'),
    instructor,
    classType: { name: 'Group Class' },
    branch: { id: branchA },
    instructorAttendance: attended ? { id: id(500 + n) } : null,
  });

  function build(slots: unknown[]) {
    const db = {
      slotKelas: { findMany: jest.fn().mockResolvedValue(slots) },
      instructorFee: {
        findMany: jest.fn().mockResolvedValue([
          {
            instructorId: instructor.id,
            branchId: branchA,
            classTypeId: id(400),
            effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
            feePerJamRp: 200_000,
          },
        ]),
      },
    };
    return {
      db,
      service: new FinanceService(db as never, new PolicyService(), { catat: jest.fn() } as never),
    };
  }

  it('keeps unverified classes in the total but reports them separately', async () => {
    const { service } = build([slot(1, true), slot(2, false)]);
    const report = await service.realtimeInstructorCostReport(finance, {
      branchId: branchA,
      period: '2026-09',
    });
    expect(report.totalInstructorCostRp).toBe(400_000);
    expect(report.totalVerifiedFeeRp).toBe(200_000);
    expect(report.totalUnverifiedFeeRp).toBe(200_000);
    expect(report.unverifiedClassCount).toBe(1);
    expect(report.instructors[0]).toMatchObject({
      totalFeeRp: 400_000,
      verifiedFeeRp: 200_000,
      unverifiedFeeRp: 200_000,
      unverifiedClassCount: 1,
    });
  });

  it('asks the database for the attendance relation so the split is real', async () => {
    const { db, service } = build([]);
    await service.realtimeInstructorCostReport(finance, { branchId: branchA, period: '2026-09' });
    expect(db.slotKelas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ instructorAttendance: expect.anything() }),
      }),
    );
  });

  it('reports zero unverified when every completed class has recorded attendance', async () => {
    const { service } = build([slot(1, true), slot(2, true)]);
    const report = await service.realtimeInstructorCostReport(finance, {
      branchId: branchA,
      period: '2026-09',
    });
    expect(report.totalUnverifiedFeeRp).toBe(0);
    expect(report.unverifiedClassCount).toBe(0);
    expect(report.totalVerifiedFeeRp).toBe(report.totalInstructorCostRp);
  });
});

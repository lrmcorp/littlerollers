import { PolicyService } from '../identity/policy.service';
import { TargetService } from './target.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const cabangA = id(1);
const cabangB = id(2);

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

const superOwner = principal(
  ['finance:read', 'finance:manage', 'branch:all'],
  'SUPER_OWNER',
  id(100),
);
const ownerA = principal(['finance:read', 'finance:manage'], 'OWNER', id(101), [cabangA]);
const manajer = principal(['finance:read', 'finance:manage'], 'MANAGER', id(102), [cabangA]);

const NOW = new Date('2026-10-28T10:00:00.000Z');

/** Membaca klausa `where` dari pemanggilan pertama sebuah mock, dengan bentuk yang sudah ditentukan. */
function whereDari(mock: jest.Mock): {
  status?: string;
  paidAt?: { gte: Date; lt: Date };
  branchId?: string;
} {
  return (mock.mock.calls[0]?.[0] as { where: Record<string, never> }).where;
}

function setup(opts: { target?: unknown; semua?: unknown[]; omzet?: number } = {}) {
  const db = {
    targetOmzet: {
      findFirst: jest.fn().mockResolvedValue(opts.target ?? null),
      create: jest.fn((arg: { data: Record<string, unknown> }) => Promise.resolve(arg.data)),
      update: jest.fn((arg: { data: Record<string, unknown> }) => Promise.resolve(arg.data)),
      findMany: jest.fn().mockResolvedValue(opts.semua ?? []),
    },
    pembelian: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmountRp: opts.omzet ?? 0 } }),
    },
  };
  return { service: new TargetService(db as never, new PolicyService()), db };
}

const target = (over: Record<string, unknown> = {}) => ({
  branchId: cabangA,
  period: '2026-10',
  targetRp: 1_000_000,
  note: null,
  branch: { name: 'Green Garden' },
  ...over,
});

describe('TargetService.setTarget', () => {
  it('memperbarui target yang sudah ada alih-alih membuat baris kedua', async () => {
    const { service, db } = setup({ target: { id: id(7) } });

    await service.setTarget(superOwner, {
      branchId: cabangA,
      period: '2026-10',
      targetRp: 2_000_000,
    });

    expect(db.targetOmzet.update).toHaveBeenCalled();
    expect(db.targetOmzet.create).not.toHaveBeenCalled();
  });

  it('menyimpan target yang dipasang Super Owner', async () => {
    const { service, db } = setup();

    await service.setTarget(superOwner, {
      branchId: cabangA,
      period: '2026-10',
      targetRp: 1_000_000,
    });

    expect(db.targetOmzet.create).toHaveBeenCalled();
    const data = db.targetOmzet.create.mock.calls[0]![0].data;
    expect(data.targetRp).toBe(1_000_000);
    expect(data.setById).toBe(superOwner.userId);
  });

  it('menolak pemanggil tanpa kapabilitas keuangan, sekalipun Super Owner', async () => {
    const { service } = setup();
    const tanpaKapabilitas = principal(['branch:all'], 'SUPER_OWNER', id(103));

    await expect(
      service.setTarget(tanpaKapabilitas, { branchId: cabangA, period: '2026-10', targetRp: 1 }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak Owner cabang memasang targetnya sendiri', async () => {
    const { service } = setup();

    await expect(
      service.setTarget(ownerA, { branchId: cabangA, period: '2026-10', targetRp: 1_000_000 }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak Manager memasang target', async () => {
    const { service } = setup();

    await expect(
      service.setTarget(manajer, { branchId: cabangA, period: '2026-10', targetRp: 500_000 }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menyimpan target gabungan ketika cabang tidak disebut', async () => {
    const { service, db } = setup();

    await service.setTarget(superOwner, { period: '2026-10', targetRp: 5_000_000 });

    expect(db.targetOmzet.create.mock.calls[0]![0].data.branchId).toBeNull();
  });

  it('menolak periode yang tidak sah', async () => {
    const { service } = setup();

    for (const period of ['2026-13', '2026', 'Oktober']) {
      await expect(
        service.setTarget(superOwner, { branchId: cabangA, period, targetRp: 1 }),
      ).rejects.toMatchObject({ status: 422 });
    }
  });

  it('menolak target negatif atau pecahan', async () => {
    const { service } = setup();

    for (const targetRp of [-1, 1.5]) {
      await expect(
        service.setTarget(superOwner, { branchId: cabangA, period: '2026-10', targetRp }),
      ).rejects.toMatchObject({ status: 422 });
    }
  });
});

describe('TargetService.paceUntuk', () => {
  it('menggabungkan target dengan omzet yang benar-benar masuk', async () => {
    const { service } = setup({ target: target(), omzet: 500_000 });

    const hasil = await service.paceUntuk(
      superOwner,
      { branchId: cabangA, period: '2026-10' },
      NOW,
    );

    expect(hasil?.targetRp).toBe(1_000_000);
    expect(hasil?.pace.tercapaiRp).toBe(500_000);
    expect(hasil?.pace.tercapaiPersen).toBe(50);
    expect(hasil?.pace.status).toBe('PERLU_NAIK');
  });

  it('menghitung omzet dari pembelian PAID pada rentang bulan itu', async () => {
    const { service, db } = setup({ target: target(), omzet: 500_000 });

    await service.paceUntuk(superOwner, { branchId: cabangA, period: '2026-10' }, NOW);

    const where = whereDari(db.pembelian.aggregate);
    expect(where.status).toBe('PAID');
    expect(where.paidAt!.gte.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(where.paidAt!.lt.toISOString()).toBe('2026-11-01T00:00:00.000Z');
    expect(where.branchId).toBe(cabangA);
  });

  it('tidak menyaring cabang untuk target gabungan', async () => {
    const { service, db } = setup({ target: target({ branchId: null, branch: null }), omzet: 100 });

    await service.paceUntuk(superOwner, { branchId: null, period: '2026-10' }, NOW);

    expect(whereDari(db.pembelian.aggregate).branchId).toBeUndefined();
  });

  it('mengembalikan null ketika targetnya belum dipasang', async () => {
    const { service } = setup({ target: null });

    const hasil = await service.paceUntuk(
      superOwner,
      { branchId: cabangA, period: '2026-10' },
      NOW,
    );

    expect(hasil).toBeNull();
  });

  it('mengizinkan Owner membaca target cabangnya sendiri', async () => {
    const { service } = setup({ target: target(), omzet: 900_000 });

    const hasil = await service.paceUntuk(ownerA, { branchId: cabangA, period: '2026-10' }, NOW);

    expect(hasil?.branchName).toBe('Green Garden');
  });

  it('menolak Owner membaca target cabang lain', async () => {
    const { service } = setup({ target: target() });

    await expect(
      service.paceUntuk(ownerA, { branchId: cabangB, period: '2026-10' }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak Owner membaca target gabungan semua cabang', async () => {
    const { service } = setup({ target: target({ branchId: null }) });

    await expect(
      service.paceUntuk(ownerA, { branchId: null, period: '2026-10' }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('TargetService.semuaPace', () => {
  const semua = [
    target({ branchId: cabangA }),
    target({ branchId: cabangB, branch: { name: 'Muara Karang' } }),
  ];

  it('memberi Super Owner seluruh cabang', async () => {
    const { service } = setup({ semua, omzet: 400_000 });

    const hasil = await service.semuaPace(superOwner, '2026-10', NOW);

    expect(hasil).toHaveLength(2);
    expect(hasil.map((h) => h.branchName)).toEqual(['Green Garden', 'Muara Karang']);
  });

  it('menyaring sampai cabang milik Owner saja', async () => {
    const { service } = setup({ semua, omzet: 400_000 });

    const hasil = await service.semuaPace(ownerA, '2026-10', NOW);

    expect(hasil).toHaveLength(1);
    expect(hasil[0]?.branchId).toBe(cabangA);
  });

  it('menyembunyikan target gabungan dari Owner cabang', async () => {
    const { service } = setup({ semua: [target({ branchId: null })], omzet: 0 });

    const hasil = await service.semuaPace(ownerA, '2026-10', NOW);

    expect(hasil).toEqual([]);
  });
});

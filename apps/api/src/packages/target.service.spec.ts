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

const superOwner = principal(['finance:read', 'branch:all'], 'SUPER_OWNER', id(100));
const ownerA = principal(['finance:read'], 'OWNER', id(101), [cabangA]);

const NOW = new Date('2026-10-28T10:00:00.000Z');

function setup(omzet = 0) {
  const db = {
    pembelian: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmountRp: omzet } }),
    },
  };
  return { service: new TargetService(db as never, new PolicyService()), db };
}

function whereDari(mock: jest.Mock): {
  status?: string;
  paidAt?: { gte: Date; lt: Date };
  branchId?: string | { in: string[] };
} {
  return (mock.mock.calls[0]?.[0] as { where: Record<string, never> }).where;
}

describe('TargetService tidak menyentuh basis data selain membaca pembelian', () => {
  it('hanya memanggil agregasi pembelian, tidak ada operasi tulis', async () => {
    const { service, db } = setup(500_000);

    await service.pace(
      superOwner,
      { branchId: cabangA, period: '2026-10', targetRp: 1_000_000 },
      NOW,
    );

    expect(Object.keys(db)).toEqual(['pembelian']);
    expect(Object.keys(db.pembelian)).toEqual(['aggregate']);
  });
});

describe('TargetService.pace', () => {
  it('menggabungkan target dari pemanggil dengan omzet yang benar-benar masuk', async () => {
    const { service } = setup(500_000);

    const hasil = await service.pace(
      superOwner,
      { branchId: cabangA, period: '2026-10', targetRp: 1_000_000 },
      NOW,
    );

    expect(hasil.pace.tercapaiRp).toBe(500_000);
    expect(hasil.pace.tercapaiPersen).toBe(50);
    expect(hasil.pace.status).toBe('PERLU_NAIK');
  });

  it('memberi kalimat siap tempel yang menyebut angka harian', async () => {
    const { service } = setup(500_000);

    const hasil = await service.pace(
      superOwner,
      { branchId: cabangA, period: '2026-10', targetRp: 1_000_000 },
      NOW,
    );

    expect(hasil.ringkasan).toContain('per hari');
    expect(hasil.ringkasan).toContain('Rp');
  });

  it('menghitung omzet dari pembelian PAID pada rentang bulan itu', async () => {
    const { service, db } = setup(500_000);

    await service.pace(superOwner, { branchId: cabangA, period: '2026-10', targetRp: 1 }, NOW);

    const where = whereDari(db.pembelian.aggregate);
    expect(where.status).toBe('PAID');
    expect(where.paidAt!.gte.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(where.paidAt!.lt.toISOString()).toBe('2026-11-01T00:00:00.000Z');
    expect(where.branchId).toBe(cabangA);
  });

  it('memakai bulan berjalan ketika periode tidak diisi', async () => {
    const { service } = setup(0);

    const hasil = await service.pace(superOwner, { targetRp: 1_000_000 }, NOW);

    expect(hasil.period).toBe('2026-10');
  });

  it('tidak menyaring cabang untuk Super Owner pada target gabungan', async () => {
    const { service, db } = setup(0);

    await service.pace(superOwner, { branchId: null, period: '2026-10', targetRp: 1 }, NOW);

    expect(whereDari(db.pembelian.aggregate).branchId).toBeUndefined();
  });

  it('membatasi target gabungan pada cabang milik pemanggil, tidak pernah membocorkan cabang lain', async () => {
    const { service, db } = setup(0);
    const ownerDuaCabang = principal(['finance:read'], 'OWNER', id(103), [cabangA, cabangB]);

    await service.pace(ownerDuaCabang, { branchId: cabangA, period: '2026-10', targetRp: 1 }, NOW);

    expect(whereDari(db.pembelian.aggregate).branchId).toBe(cabangA);
  });

  it('mengizinkan Owner membaca cabangnya sendiri', async () => {
    const { service } = setup(900_000);

    const hasil = await service.pace(
      ownerA,
      { branchId: cabangA, period: '2026-10', targetRp: 1_000_000 },
      NOW,
    );

    expect(hasil.branchId).toBe(cabangA);
  });

  it('menolak Owner membaca cabang lain', async () => {
    const { service } = setup();

    await expect(
      service.pace(ownerA, { branchId: cabangB, period: '2026-10', targetRp: 1 }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak Owner meminta gabungan semua cabang', async () => {
    const { service } = setup();

    await expect(
      service.pace(ownerA, { branchId: null, period: '2026-10', targetRp: 1 }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak pemanggil tanpa kapabilitas keuangan', async () => {
    const { service } = setup();
    const tanpa = principal(['branch:all'], 'SUPER_OWNER', id(104));

    await expect(
      service.pace(tanpa, { branchId: cabangA, period: '2026-10', targetRp: 1 }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak periode yang tidak sah', async () => {
    const { service } = setup();

    for (const period of ['2026-13', '2026', 'Oktober']) {
      await expect(
        service.pace(superOwner, { branchId: cabangA, period, targetRp: 1 }, NOW),
      ).rejects.toMatchObject({ status: 422 });
    }
  });

  it('menolak target negatif atau pecahan', async () => {
    const { service } = setup();

    for (const targetRp of [-1, 1.5]) {
      await expect(
        service.pace(superOwner, { branchId: cabangA, period: '2026-10', targetRp }, NOW),
      ).rejects.toMatchObject({ status: 422 });
    }
  });
});

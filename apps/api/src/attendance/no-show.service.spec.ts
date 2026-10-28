import { PolicyService } from '../identity/policy.service';
import { NoShowService } from './no-show.service';

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

const superOwner = principal(['attendance:read', 'branch:all'], 'SUPER_OWNER', id(100));
const adminA = principal(['attendance:read'], 'ADMIN', id(101), [cabangA]);

const NOW = new Date('2026-10-28T00:00:00.000Z');

function booking(over: {
  id: string;
  userId: string;
  branchId?: string;
  sisaSesi?: number | null;
  nama?: string;
}) {
  return {
    id: over.id,
    userId: over.userId,
    customerPackageId: id(70),
    user: { displayName: over.nama ?? 'Member', phone: '0812' },
    customerPackage: over.sisaSesi === null ? null : { remainingSessions: over.sisaSesi ?? 3 },
    classSlot: {
      id: id(90),
      branchId: over.branchId ?? cabangA,
      startAt: new Date('2026-10-14T02:00:00.000Z'),
      classType: { name: 'Semi Private Reformer' },
    },
  };
}

function setup(bookings: unknown[] = [], koreksi: unknown[] = []) {
  const db = {
    pemesananKelas: { findMany: jest.fn().mockResolvedValue(bookings) },
    sessionAdjustRequest: { findMany: jest.fn().mockResolvedValue(koreksi) },
  };
  return { service: new NoShowService(db as never, new PolicyService()), db };
}

describe('NoShowService.report', () => {
  it('hanya mengambil booking berstatus NO_SHOW', async () => {
    const { service, db } = setup();

    await service.report(superOwner, { period: '2026-10' }, NOW);

    expect(db.pemesananKelas.findMany.mock.calls[0]![0].where.status).toBe('NO_SHOW');
  });

  it('melaporkan jumlah kejadian dan jumlah member secara terpisah', async () => {
    const { service } = setup([
      booking({ id: id(10), userId: id(50) }),
      booking({ id: id(11), userId: id(50) }),
      booking({ id: id(12), userId: id(51) }),
    ]);

    const hasil = await service.report(superOwner, { period: '2026-10' }, NOW);

    expect(hasil.total).toBe(3);
    expect(hasil.totalMember).toBe(2);
  });

  it('membawa sisa sesi agar staf tahu dampaknya ke member', async () => {
    const { service } = setup([booking({ id: id(10), userId: id(50), sisaSesi: 2 })]);

    const hasil = await service.report(superOwner, { period: '2026-10' }, NOW);

    expect(hasil.rows[0]?.sisaSesi).toBe(2);
  });

  it('tidak pecah ketika booking tidak terkait paket mana pun', async () => {
    const { service } = setup([booking({ id: id(10), userId: id(50), sisaSesi: null })]);

    const hasil = await service.report(superOwner, { period: '2026-10' }, NOW);

    expect(hasil.rows[0]?.sisaSesi).toBeNull();
  });

  it('menandai sesi yang sudah dikembalikan lewat penyesuaian manual', async () => {
    const { service } = setup(
      [booking({ id: id(10), userId: id(50) }), booking({ id: id(11), userId: id(51) })],
      [{ bookingId: id(10) }],
    );

    const hasil = await service.report(superOwner, { period: '2026-10' }, NOW);

    expect(hasil.sudahDikoreksi).toBe(1);
    expect(hasil.rows.find((r) => r.bookingId === id(10))?.sudahDikoreksi).toBe(true);
    expect(hasil.rows.find((r) => r.bookingId === id(11))?.sudahDikoreksi).toBe(false);
  });

  it('hanya menghitung penyesuaian disetujui yang mengembalikan sesi untuk booking itu', async () => {
    const { service, db } = setup([booking({ id: id(10), userId: id(50) })]);

    await service.report(superOwner, { period: '2026-10' }, NOW);

    const where = db.sessionAdjustRequest.findMany.mock.calls[0]![0].where;
    expect(where.bookingId).toEqual({ in: [id(10)] });
    expect(where.status).toBe('APPROVED');
    expect(where.sessionCount).toEqual({ gt: 0 });
  });

  it('tidak menanyakan koreksi sama sekali ketika tidak ada yang mangkir', async () => {
    const { service, db } = setup([]);

    const hasil = await service.report(superOwner, { period: '2026-10' }, NOW);

    expect(hasil.total).toBe(0);
    expect(db.sessionAdjustRequest.findMany).not.toHaveBeenCalled();
  });

  it('menyembunyikan cabang lain dari admin cabang', async () => {
    const { service } = setup([
      booking({ id: id(10), userId: id(50), branchId: cabangA }),
      booking({ id: id(11), userId: id(51), branchId: cabangB }),
    ]);

    const hasil = await service.report(adminA, { branchId: cabangA, period: '2026-10' }, NOW);

    expect(hasil.total).toBe(1);
    expect(hasil.rows[0]?.branchId).toBe(cabangA);
  });

  it('menolak admin cabang yang meminta cabang lain', async () => {
    const { service } = setup();

    await expect(
      service.report(adminA, { branchId: cabangB, period: '2026-10' }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('menolak pemanggil tanpa kapabilitas presensi', async () => {
    const { service } = setup();
    const tanpa = principal(['branch:all'], 'ADMIN', id(102));

    await expect(service.report(tanpa, { period: '2026-10' }, NOW)).rejects.toMatchObject({
      status: 403,
    });
  });
});

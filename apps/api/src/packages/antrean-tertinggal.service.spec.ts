import { AntreanTertinggalService } from './antrean-tertinggal.service';

const NOW = new Date('2026-10-28T02:00:00.000Z');
const jamLalu = (jam: number) => new Date(NOW.getTime() - jam * 3_600_000);

const principal = (capabilities: string[], branchIds: string[] = ['gg']) =>
  ({
    sessionId: 's',
    userId: 'u-1',
    roles: [{ role: 'ADMIN', branchId: branchIds[0] ?? null }],
    capabilities,
    branchIds,
  }) as never;

const SEMUA = [
  'package:read',
  'identity-verification:read',
  'payment:review',
  'class-slot:read',
  'reschedule:read',
];

function setup() {
  const db = {
    user: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { profile: { updatedAt: jamLalu(96) } },
          { profile: { updatedAt: jamLalu(5) } },
        ]),
    },
    pembelian: {
      findMany: jest.fn().mockResolvedValue([
        { totalAmountRp: 1_850_000, paymentProof: { uploadedAt: jamLalu(30) } },
        { totalAmountRp: 950_000, paymentProof: { uploadedAt: jamLalu(3) } },
      ]),
    },
    slotKelas: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 's-1',
          startAt: new Date('2026-10-28T10:30:00.000Z'),
          bookedCount: 1,
          minQuota: 4,
          classType: { name: 'Group Reformer' },
        },
        {
          id: 's-2',
          startAt: new Date('2026-10-28T12:00:00.000Z'),
          bookedCount: 5,
          minQuota: 4,
          classType: { name: 'Group' },
        },
      ]),
    },
    ubahJadwal: {
      findMany: jest.fn().mockResolvedValue([{ requestedAt: jamLalu(3), reason: 'Darurat medis' }]),
    },
  };
  const retention = {
    expiryCohort: jest.fn().mockResolvedValue({
      potentialLoss: { paidRp: 5_550_000 },
      rows: [
        {
          userId: 'm-1',
          endReason: 'HOT',
          validUntil: jamLalu(26 * 24).toISOString(),
          renewed: false,
        },
        {
          userId: 'm-2',
          endReason: 'EXPIRED',
          validUntil: jamLalu(48).toISOString(),
          renewed: false,
        },
        {
          userId: 'm-3',
          endReason: 'EXPIRED',
          validUntil: jamLalu(72).toISOString(),
          renewed: true,
        },
      ],
    }),
  };
  return { db, retention, service: new AntreanTertinggalService(db as never, retention as never) };
}

describe('AntreanTertinggalService', () => {
  it('mengurutkan antrean yang telat lebih dulu, lalu yang bertenggat, lalu yang masih wajar', async () => {
    const { service } = setup();
    const hasil = await service.antrean(principal(SEMUA), { branchId: 'gg' }, NOW);

    expect(hasil.items.map((i) => [i.key, i.nada])).toEqual([
      ['renewal', 'TELAT'],
      ['verifikasi', 'TELAT'],
      ['kuota', 'TENGGAT'],
      ['bukti', 'MENUNGGU'],
      ['ubahJadwal', 'MENUNGGU'],
    ]);
    expect(hasil.gagal).toEqual([]);
  });

  it('menghitung orang, nilai, dan kelas yang benar per antrean', async () => {
    const { service } = setup();
    const hasil = await service.antrean(principal(SEMUA), { branchId: 'gg' }, NOW);
    const per = Object.fromEntries(hasil.items.map((i) => [i.key, i]));

    expect(per.renewal).toMatchObject({ jumlah: 2, hot: 1, nilaiRp: 5_550_000, umurJam: 624 });
    expect(per.verifikasi).toMatchObject({ jumlah: 2, umurJam: 96 });
    expect(per.bukti).toMatchObject({ jumlah: 2, nilaiRp: 2_800_000, umurJam: 30 });
    // Kelas yang sudah memenuhi kuota tidak ikut.
    expect(per.kuota!.kelas).toEqual([
      expect.objectContaining({ nama: 'Group Reformer', terisi: 1, minimum: 4 }),
    ]);
    expect(per.ubahJadwal).toMatchObject({ jumlah: 1, alasan: 'Darurat medis' });
  });

  it('hanya menampilkan antrean yang boleh ditangani peran itu', async () => {
    const { service, db } = setup();
    const hasil = await service.antrean(principal(['payment:review']), { branchId: 'gg' }, NOW);
    expect(hasil.items.map((i) => i.key)).toEqual(['bukti']);
    expect(db.user.findMany).not.toHaveBeenCalled();
  });

  it('melaporkan antrean yang gagal dimuat alih-alih menghitungnya nol', async () => {
    const { service, db } = setup();
    db.pembelian.findMany.mockRejectedValue(new Error('db'));
    const hasil = await service.antrean(principal(SEMUA), { branchId: 'gg' }, NOW);
    expect(hasil.gagal).toEqual(['bukti']);
    expect(hasil.items.find((i) => i.key === 'bukti')).toBeUndefined();
  });

  it('menolak cabang di luar cakupan dan peran tanpa antrean apa pun', async () => {
    const { service } = setup();
    await expect(service.antrean(principal(SEMUA), { branchId: 'mk' }, NOW)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.antrean(principal(['attendance:self']), {}, NOW)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

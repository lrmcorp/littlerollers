import { Prisma } from '@prisma/client';
import { StudioCheckInService } from './studio-check-in.service';
import type { ScanResult } from './studio-scan.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const cabang = id(1);
const NOW = new Date('2026-10-28T02:10:00.000Z');

const diterimaMember: ScanResult = {
  diterima: true,
  orang: { userId: id(50), nama: 'Sari Dewi', peran: 'MEMBER', fotoUrl: '/s.jpg' },
  kelas: {
    classSlotId: id(90),
    bookingId: id(70),
    namaKelas: 'Private Group Reformer',
    studio: 'Studio 2',
    mulai: '2026-10-28T02:00:00.000Z',
    selesai: '2026-10-28T02:55:00.000Z',
  },
};

const diterimaInstruktur: ScanResult = {
  diterima: true,
  orang: { userId: id(60), nama: 'Asrida', peran: 'INSTRUKTUR', fotoUrl: null },
  kelas: { ...diterimaMember.kelas!, bookingId: null },
};

function setup(
  opts: {
    hasil?: ScanResult;
    slotStatus?: string;
    booking?: { status: string; attendance: { id: string } | null } | null;
    hadirInstruktur?: { id: string } | null;
    gagalTulis?: unknown;
    kunci?: boolean;
  } = {},
) {
  const tx = {
    slotKelas: {
      findUnique: jest.fn().mockResolvedValue({ status: opts.slotStatus ?? 'CONFIRMED' }),
    },
    pemesananKelas: {
      findUnique: jest
        .fn()
        .mockResolvedValue(
          opts.booking === undefined ? { status: 'BOOKED', attendance: null } : opts.booking,
        ),
      update: jest.fn().mockResolvedValue({}),
    },
    kehadiranPelanggan: { create: jest.fn().mockResolvedValue({}) },
    kehadiranInstruktur: {
      findUnique: jest.fn().mockResolvedValue(opts.hadirInstruktur ?? null),
      create: jest.fn().mockResolvedValue({}),
    },
  };
  const db = {
    cabang: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: cabang, name: 'Green Garden', timezone: 'Asia/Jakarta' }),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => {
      if (opts.gagalTulis) throw opts.gagalTulis;
      return fn(tx);
    }),
    kehadiranPelanggan: {
      findMany: jest.fn().mockResolvedValue([
        {
          checkedInAt: new Date('2026-10-28T02:05:00.000Z'),
          booking: { user: { displayName: 'Sari Dewi' } },
        },
      ]),
    },
    kehadiranInstruktur: {
      findMany: jest.fn().mockResolvedValue([
        {
          checkedInAt: new Date('2026-10-28T01:50:00.000Z'),
          instructor: { displayName: 'Asrida' },
        },
      ]),
    },
  };
  const scan = { resolve: jest.fn().mockResolvedValue(opts.hasil ?? diterimaMember) };
  const kiosk = {
    requireAccess: jest.fn(async () => {
      if (opts.kunci) throw Object.assign(new Error('KIOSK_LOCKED'), { status: 401 });
      return { id: cabang, code: 'GG', name: 'Green Garden' };
    }),
  };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  return {
    service: new StudioCheckInService(db as never, scan as never, kiosk as never, audit as never),
    db,
    tx,
    scan,
    audit,
  };
}

describe('StudioCheckInService.pindai', () => {
  it('mencatat kehadiran member dan menandai booking hadir', async () => {
    const { service, tx, audit } = setup();

    const hasil = await service.pindai('gg', 'token', 'dd-pass:v1:x', NOW);

    expect(hasil.tercatat).toBe(true);
    expect(tx.kehadiranPelanggan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ bookingId: id(70), method: 'QR_SCAN', checkedInAt: NOW }),
    });
    expect(tx.pemesananKelas.update).toHaveBeenCalledWith({
      where: { id: id(70) },
      data: { status: 'ATTENDED' },
    });
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'attendance.studio_scan', actorType: 'KIOSK' }),
    );
  });

  it('mencatat presensi instruktur dari perangkat studio, tanpa perlu geofence ponsel', async () => {
    const { service, tx } = setup({ hasil: diterimaInstruktur });

    await service.pindai('gg', 'token', 'pass', NOW);

    expect(tx.kehadiranInstruktur.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        classSlotId: id(90),
        instructorId: id(60),
        method: 'QR_SCAN',
        isWithinGeofence: true,
      }),
    });
  });

  it('menjawab sudah tercatat, bukan galat, bila pindaian lain menang lebih dulu', async () => {
    const { service, tx } = setup({ booking: { status: 'ATTENDED', attendance: { id: 'a' } } });

    const hasil = await service.pindai('gg', 'token', 'pass', NOW);

    expect(hasil.tercatat).toBe(false);
    expect(hasil.alasan).toBe('SUDAH_TERCATAT');
    expect(tx.kehadiranPelanggan.create).not.toHaveBeenCalled();
  });

  it('memperlakukan bentrok baris unik sebagai sudah tercatat', async () => {
    const bentrok = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: 'test',
    });
    const { service } = setup({ gagalTulis: bentrok });

    const hasil = await service.pindai('gg', 'token', 'pass', NOW);

    expect(hasil.alasan).toBe('SUDAH_TERCATAT');
  });

  it('menolak kelas yang sudah dibatalkan di antara pemeriksaan dan penulisan', async () => {
    const { service } = setup({ slotStatus: 'CANCELLED' });

    await expect(service.pindai('gg', 'token', 'pass', NOW)).rejects.toMatchObject({
      status: 409,
    });
  });

  it('mencatat pindaian yang ditolak ke audit agar bisa dilaporkan', async () => {
    const ditolak: ScanResult = {
      diterima: false,
      alasan: 'TIDAK_ADA_KELAS',
      orang: diterimaMember.orang,
    };
    const { service, tx, audit } = setup({ hasil: ditolak });

    const hasil = await service.pindai('gg', 'token', 'pass', NOW);

    expect(hasil.tercatat).toBe(false);
    expect(tx.kehadiranPelanggan.create).not.toHaveBeenCalled();
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        action: 'attendance.studio_scan_rejected',
        reason: 'TIDAK_ADA_KELAS',
        targetUserId: id(50),
      }),
    );
  });

  it('tidak bisa dipakai tanpa tablet yang dibuka dengan PIN cabang', async () => {
    const { service, scan } = setup({ kunci: true });

    await expect(service.pindai('gg', undefined, 'pass', NOW)).rejects.toMatchObject({
      status: 401,
    });
    expect(scan.resolve).not.toHaveBeenCalled();
  });

  it('memeriksa pass terhadap cabang tablet itu, bukan cabang yang dikirim pemanggil', async () => {
    const { service, scan } = setup();

    await service.pindai('gg', 'token', 'pass', NOW);

    expect(scan.resolve).toHaveBeenCalledWith('pass', cabang, NOW);
  });

  it('memperlakukan isi yang bukan teks sebagai pass tak dikenal', async () => {
    const { service, scan } = setup();

    await service.pindai('gg', 'token', { bukan: 'teks' }, NOW);

    expect(scan.resolve).toHaveBeenCalledWith('', cabang, NOW);
  });
});

describe('StudioCheckInService.hariIni', () => {
  it('hanya membawa nama, peran, dan jam untuk layar yang terlihat publik', async () => {
    const { service } = setup();

    const daftar = await service.hariIni('gg', 'token', NOW);

    expect(daftar).toEqual([
      { nama: 'Sari Dewi', peran: 'MEMBER', tercatatPada: '2026-10-28T02:05:00.000Z' },
      { nama: 'Asrida', peran: 'INSTRUKTUR', tercatatPada: '2026-10-28T01:50:00.000Z' },
    ]);
  });
});

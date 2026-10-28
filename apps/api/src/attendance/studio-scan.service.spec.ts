import { buildPass } from './check-in-pass';
import { StudioScanService } from './studio-scan.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const cabangA = id(1);
const cabangB = id(2);
const member = id(50);
const instruktur = id(60);

const NOW = new Date('2026-10-28T09:10:00.000Z');
const MULAI = new Date('2026-10-28T09:00:00.000Z');
const SELESAI = new Date('2026-10-28T09:55:00.000Z');

function slot(over: Record<string, unknown> = {}) {
  return {
    id: id(90),
    startAt: MULAI,
    endAt: SELESAI,
    classType: { name: 'Private Group Reformer' },
    studio: { name: 'Studio 2' },
    ...over,
  };
}

function setup(
  opts: {
    pengguna?: Array<{
      id: string;
      displayName?: string;
      role?: string;
      stoppedAt?: Date | null;
      selfieUrl?: string | null;
    }>;
    slotInstruktur?: unknown;
    booking?: unknown;
    /** Beberapa kelas sekaligus; menimpa slotInstruktur/booking. */
    slots?: unknown[];
    bookings?: unknown[];
    hadirInstruktur?: unknown;
    hadirMember?: unknown;
    /** Id kelas atau booking yang sudah tercatat, untuk skenario banyak kelas. */
    tercatat?: string[];
  } = {},
) {
  const pengguna = opts.pengguna ?? [
    { id: member, displayName: 'Member Satu', role: 'CUSTOMER' },
    { id: instruktur, displayName: 'Instruktur Satu', role: 'INSTRUCTOR' },
  ];

  const db = {
    user: {
      findMany: jest.fn().mockResolvedValue(pengguna.map((u) => ({ id: u.id }))),
      findUnique: jest.fn(({ where }: { where: { id: string } }) => {
        const u = pengguna.find((p) => p.id === where.id);
        if (!u) return Promise.resolve(null);
        return Promise.resolve({
          id: u.id,
          displayName: u.displayName ?? 'Tanpa Nama',
          role: u.role ?? 'CUSTOMER',
          stoppedAt: u.stoppedAt ?? null,
          profile: { selfieUrl: u.selfieUrl ?? null },
        });
      }),
    },
    slotKelas: {
      findMany: jest
        .fn()
        .mockResolvedValue(opts.slots ?? (opts.slotInstruktur ? [opts.slotInstruktur] : [])),
    },
    pemesananKelas: {
      findMany: jest.fn().mockResolvedValue(opts.bookings ?? (opts.booking ? [opts.booking] : [])),
    },
    kehadiranInstruktur: {
      findMany: jest.fn(({ where }: { where: { classSlotId: { in: string[] } } }) =>
        Promise.resolve(
          where.classSlotId.in
            .filter((k) => opts.tercatat?.includes(k) || (opts.hadirInstruktur && !opts.tercatat))
            .map((classSlotId) => ({ classSlotId })),
        ),
      ),
    },
    kehadiranPelanggan: {
      findMany: jest.fn(({ where }: { where: { bookingId: { in: string[] } } }) =>
        Promise.resolve(
          where.bookingId.in
            .filter((k) => opts.tercatat?.includes(k) || (opts.hadirMember && !opts.tercatat))
            .map((bookingId) => ({ bookingId })),
        ),
      ),
    },
  };
  return { service: new StudioScanService(db as never), db };
}

describe('StudioScanService, member', () => {
  const booking = { id: id(70), classSlot: slot() };

  it('menerima member yang punya kelas di cabang ini pada jam itu', async () => {
    const { service } = setup({ booking });

    const hasil = await service.resolve(buildPass(member), cabangA, NOW);

    expect(hasil.diterima).toBe(true);
    expect(hasil.orang?.nama).toBe('Member Satu');
    expect(hasil.orang?.peran).toBe('MEMBER');
    expect(hasil.kelas?.bookingId).toBe(id(70));
  });

  it('membawa foto selfie supaya staf bisa mencocokkan wajah', async () => {
    const { service } = setup({
      booking,
      pengguna: [
        { id: member, displayName: 'Member Satu', role: 'CUSTOMER', selfieUrl: '/foto/a.jpg' },
      ],
    });

    const hasil = await service.resolve(buildPass(member), cabangA, NOW);

    expect(hasil.orang?.fotoUrl).toBe('/foto/a.jpg');
  });

  it('menolak QR yang bukan pass Daily Dose', async () => {
    const { service } = setup({ booking });

    const hasil = await service.resolve('https://contoh.id/bukan-pass', cabangA, NOW);

    expect(hasil).toEqual({ diterima: false, alasan: 'PASS_TIDAK_DIKENALI' });
  });

  it('menolak pass yang bentuknya benar tetapi tidak ada pemiliknya', async () => {
    const { service } = setup({ booking });

    const hasil = await service.resolve(buildPass(id(999)), cabangA, NOW);

    expect(hasil.alasan).toBe('PASS_TIDAK_DIKENALI');
  });

  it('menyebut nama orangnya walau pindaiannya ditolak karena tidak ada kelas', async () => {
    const { service } = setup({ booking: null });

    const hasil = await service.resolve(buildPass(member), cabangA, NOW);

    expect(hasil.diterima).toBe(false);
    expect(hasil.alasan).toBe('TIDAK_ADA_KELAS');
    expect(hasil.orang?.nama).toBe('Member Satu');
  });

  it('mencari kelas hanya di cabang tempat perangkat pemindai berada', async () => {
    const { service, db } = setup({ booking });

    await service.resolve(buildPass(member), cabangB, NOW);

    expect(db.pemesananKelas.findMany.mock.calls[0][0].where.classSlot.branchId).toBe(cabangB);
  });

  it('tidak mencari booking yang sudah batal', async () => {
    const { service, db } = setup({ booking });

    await service.resolve(buildPass(member), cabangA, NOW);

    expect(db.pemesananKelas.findMany.mock.calls[0][0].where.status).toEqual({
      in: ['BOOKED', 'ATTENDED'],
    });
  });

  it('memilih kelas 09.00 untuk member yang baru selesai kelas 07.00', async () => {
    const pagi = {
      id: id(71),
      classSlot: slot({
        id: id(91),
        startAt: new Date('2026-10-28T07:00:00.000Z'),
        endAt: new Date('2026-10-28T07:55:00.000Z'),
      }),
    };
    const { service } = setup({ bookings: [pagi, booking], tercatat: [id(71)] });

    const hasil = await service.resolve(buildPass(member), cabangA, NOW);

    expect(hasil.diterima).toBe(true);
    expect(hasil.kelas?.bookingId).toBe(id(70));
  });

  it('menolak bila kelas masih terlalu jauh dari jam pindai', async () => {
    const jauh = new Date(MULAI.getTime() - 120 * 60_000);
    const { service } = setup({ booking });

    const hasil = await service.resolve(buildPass(member), cabangA, jauh);

    expect(hasil.alasan).toBe('BELUM_WAKTUNYA');
    expect(hasil.bukaPadaMenitSebelum).toBe(45);
  });

  it('menolak bila kelas sudah selesai', async () => {
    const lewat = new Date(SELESAI.getTime() + 60_000);
    const { service } = setup({ booking });

    const hasil = await service.resolve(buildPass(member), cabangA, lewat);

    expect(hasil.alasan).toBe('KELAS_SUDAH_LEWAT');
  });

  it('menolak pindaian kedua pada kelas yang sama', async () => {
    const { service } = setup({ booking, hadirMember: { id: id(80) } });

    const hasil = await service.resolve(buildPass(member), cabangA, NOW);

    expect(hasil.alasan).toBe('SUDAH_TERCATAT');
  });

  it('menolak akun yang sudah berhenti tanpa menyentuh jadwal', async () => {
    const { service, db } = setup({
      booking,
      pengguna: [
        {
          id: member,
          displayName: 'Member Satu',
          role: 'CUSTOMER',
          stoppedAt: new Date('2026-09-01'),
        },
      ],
    });

    const hasil = await service.resolve(buildPass(member), cabangA, NOW);

    expect(hasil.alasan).toBe('AKUN_BERHENTI');
    expect(db.pemesananKelas.findMany).not.toHaveBeenCalled();
  });
});

describe('StudioScanService, instruktur', () => {
  it('memilih kelas kedua bila kelas pertama sudah tercatat dan keduanya terbuka', async () => {
    const pertama = slot({
      id: id(91),
      startAt: new Date('2026-10-28T08:20:00.000Z'),
      endAt: new Date('2026-10-28T09:15:00.000Z'),
    });
    const kedua = slot({ id: id(92) });
    const { service } = setup({ slots: [pertama, kedua], tercatat: [id(91)] });

    const hasil = await service.resolve(buildPass(instruktur), cabangA, NOW);

    expect(hasil.diterima).toBe(true);
    expect(hasil.kelas?.classSlotId).toBe(id(92));
  });

  it('menerima instruktur yang mengajar kelas itu', async () => {
    const { service } = setup({ slotInstruktur: slot() });

    const hasil = await service.resolve(buildPass(instruktur), cabangA, NOW);

    expect(hasil.diterima).toBe(true);
    expect(hasil.orang?.peran).toBe('INSTRUKTUR');
    expect(hasil.kelas?.bookingId).toBeNull();
  });

  it('mencari dari slot yang diampunya, bukan dari booking', async () => {
    const { service, db } = setup({ slotInstruktur: slot() });

    await service.resolve(buildPass(instruktur), cabangA, NOW);

    expect(db.slotKelas.findMany.mock.calls[0][0].where.instructorId).toBe(instruktur);
    expect(db.pemesananKelas.findMany).not.toHaveBeenCalled();
  });

  it('menolak instruktur yang tidak mengajar di cabang itu hari itu', async () => {
    const { service } = setup({ slotInstruktur: null });

    const hasil = await service.resolve(buildPass(instruktur), cabangA, NOW);

    expect(hasil.alasan).toBe('TIDAK_ADA_KELAS');
    expect(hasil.orang?.peran).toBe('INSTRUKTUR');
  });

  it('menolak pindaian kedua instruktur pada kelas yang sama', async () => {
    const { service } = setup({ slotInstruktur: slot(), hadirInstruktur: { id: id(81) } });

    const hasil = await service.resolve(buildPass(instruktur), cabangA, NOW);

    expect(hasil.alasan).toBe('SUDAH_TERCATAT');
  });
});

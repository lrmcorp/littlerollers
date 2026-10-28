import { PolicyService } from '../identity/policy.service';
import { AKSI_PINDAI_DITOLAK, LaporanOwnerService } from './laporan-owner.service';

const principal = (capabilities: string[], branchIds: string[] = []) =>
  ({
    sessionId: 's',
    userId: 'u-owner',
    roles: [{ role: 'OWNER', branchId: branchIds[0] ?? null }],
    capabilities,
    branchIds,
  }) as never;

const superOwner = principal(['dashboard:read', 'branch:all']);
const ownerA = principal(['dashboard:read'], ['cabang-a']);
const NOW = new Date('2026-10-28T03:00:00.000Z');

function database() {
  return {
    auditLog: {
      findMany: jest.fn().mockResolvedValue([
        {
          objectId: 'slot-1',
          branchId: 'cabang-a',
          actorId: 'u-admin',
          reason: 'Peserta sudah datang jauh-jauh, kelas tetap jalan.',
          detail: { after: { hadir: 2, minimum: 4, selisihBebanRp: 150000 } },
          createdAt: new Date('2026-10-20T11:05:00.000Z'),
        },
        {
          objectId: 'slot-2',
          branchId: 'cabang-a',
          actorId: null,
          reason: null,
          detail: null,
          createdAt: new Date('2026-10-12T11:05:00.000Z'),
        },
      ]),
      groupBy: jest.fn().mockResolvedValue([
        { reason: 'TIDAK_ADA_KELAS', _count: { _all: 2 } },
        { reason: 'BELUM_WAKTUNYA', _count: { _all: 5 } },
      ]),
    },
    slotKelas: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'slot-1',
          startAt: new Date('2026-10-20T11:00:00.000Z'),
          classType: { name: 'Reformer Flow' },
          instructor: { displayName: 'Dewi' },
        },
      ]),
    },
    user: { findMany: jest.fn().mockResolvedValue([{ id: 'u-admin', displayName: 'Sari' }]) },
  };
}

const service = (db: ReturnType<typeof database>) =>
  new LaporanOwnerService(db as never, new PolicyService());

describe('LaporanOwnerService', () => {
  it('menggabungkan keputusan tetap jalan dengan kelas, instruktur, dan penanggung jawabnya', async () => {
    const db = database();
    const hasil = await service(db).laporan(superOwner, { period: '2026-10' }, NOW);

    expect(hasil.dibawahKuota.total).toBe(2);
    expect(hasil.dibawahKuota.totalBebanRp).toBe(150000);
    expect(hasil.dibawahKuota.rows[0]).toMatchObject({
      classSlotId: 'slot-1',
      namaKelas: 'Reformer Flow',
      namaInstruktur: 'Dewi',
      hadir: 2,
      minimum: 4,
      selisihBebanRp: 150000,
      diputuskanOleh: 'Sari',
    });
    // Catatan tanpa detail tetap tampil, dengan angka kosong, bukan nol palsu.
    expect(hasil.dibawahKuota.rows[1]).toMatchObject({ hadir: null, selisihBebanRp: null });
  });

  it('mengurutkan alasan pindaian ditolak dari yang paling sering', async () => {
    const hasil = await service(database()).laporan(superOwner, { period: '2026-10' }, NOW);
    expect(hasil.pindaiDitolak).toEqual({
      total: 7,
      perAlasan: [
        { alasan: 'BELUM_WAKTUNYA', jumlah: 5 },
        { alasan: 'TIDAK_ADA_KELAS', jumlah: 2 },
      ],
    });
  });

  it('membatasi owner cabang pada cabangnya bila cabang tidak dipilih', async () => {
    const db = database();
    await service(db).laporan(ownerA, { period: '2026-10' }, NOW);
    expect(db.auditLog.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          action: AKSI_PINDAI_DITOLAK,
          branchId: { in: ['cabang-a'] },
        }),
      }),
    );
  });

  it('menolak cabang di luar cakupan dan peran tanpa akses ringkasan', async () => {
    const db = database();
    await expect(
      service(db).laporan(ownerA, { branchId: 'cabang-b', period: '2026-10' }, NOW),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service(db).laporan(principal(['attendance:read'], ['cabang-a']), {}, NOW),
    ).rejects.toBeDefined();
    expect(db.auditLog.findMany).not.toHaveBeenCalled();
  });
});

import { PolicyService } from '../identity/policy.service';
import { ReschedulesService } from './ubah-jadwal.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchId = id(1);
const sourceSlotId = id(20);
const targetSlotId = id(21);

const admin = {
  sessionId: 's',
  userId: id(100),
  roles: [] as never,
  capabilities: ['reschedule:decide'],
  branchIds: [branchId],
};

function setup(
  options: { targetBookedCount?: number; rescheduleStatus?: string; bookingStatus?: string } = {},
) {
  const { targetBookedCount = 2, rescheduleStatus = 'PENDING', bookingStatus = 'BOOKED' } = options;
  const calls: string[] = [];
  const tx = {
    $queryRaw: jest.fn(async (strings: TemplateStringsArray) => {
      const sql = strings.join('?');
      calls.push(`lock:${sql.replace(/\s+/g, ' ').trim()}`);
      return sql.includes('FROM ubah_jadwal') ? [{ sourceSlotId, targetSlotId }] : [];
    }),
    ubahJadwal: {
      findUnique: jest.fn(async () => {
        calls.push('read-reschedule');
        return {
          id: id(30),
          status: rescheduleStatus,
          reason: null,
          bookingId: id(10),
          sourceSlotId,
          targetSlotId,
          booking: {
            id: id(10),
            userId: id(300),
            status: bookingStatus,
            classSlotId: sourceSlotId,
          },
        };
      }),
      update: jest.fn(async ({ data }) => ({ id: id(30), ...data })),
    },
    slotKelas: {
      findUnique: jest.fn(async () => {
        calls.push('read-target-slot');
        return { id: targetSlotId, bookedCount: targetBookedCount, capacity: 4 };
      }),
      update: jest.fn(async () => ({})),
    },
    pemesananKelas: {
      findFirst: jest.fn(async () => null),
      update: jest.fn(async () => ({})),
    },
  };
  const idempotency = {
    execute: jest.fn(async (_c: unknown, action: (t: typeof tx) => Promise<unknown>) => action(tx)),
  };
  const service = new ReschedulesService({} as never, idempotency as never, new PolicyService(), {
    value: { booking: { enabled: true, cutoffHours: 2 } },
  } as never);
  return { service, tx, calls };
}

const approve = (service: ReschedulesService) =>
  service.decide(admin, id(30), 'approve', {} as never, 'key-1', 'corr-1');

describe('persetujuan ubah jadwal menjaga kuota slot tujuan', () => {
  it('mengunci permintaan lalu slot sumber dan tujuan sebelum pembacaan biasa pertama', async () => {
    const { service, calls } = setup();
    await approve(service);
    const requestLock = calls.findIndex((c) => c.includes('FROM ubah_jadwal'));
    const slotLock = calls.findIndex((c) => c.includes('FROM slot_kelas'));
    expect(requestLock).toBe(0);
    expect(slotLock).toBe(1);
    expect(calls[requestLock]).toContain('FOR UPDATE');
    expect(calls[slotLock]).toContain('FOR UPDATE');
    expect(calls[slotLock]).toContain('ORDER BY id');
    expect(calls.indexOf('read-reschedule')).toBeGreaterThan(slotLock);
    expect(calls.indexOf('read-target-slot')).toBeGreaterThan(slotLock);
  });

  it('penolakan hanya mengunci permintaan, tidak mengunci slot', async () => {
    const { service, calls } = setup();
    await service.decide(admin, id(30), 'reject', {} as never, 'key-2', 'corr-2');
    expect(calls.filter((c) => c.includes('FROM slot_kelas'))).toHaveLength(0);
    expect(calls[0]).toContain('FROM ubah_jadwal');
  });

  it('menolak bila slot tujuan sudah penuh dan tidak memindahkan booking', async () => {
    const { service, tx } = setup({ targetBookedCount: 4 });
    await expect(approve(service)).rejects.toMatchObject({ code: 'CLASS_CAPACITY_FULL' });
    expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
    expect(tx.slotKelas.update).not.toHaveBeenCalled();
  });

  it('tidak memindahkan booking dua kali bila permintaan sudah diputuskan', async () => {
    const { service, tx } = setup({ rescheduleStatus: 'APPROVED' });
    await expect(approve(service)).rejects.toMatchObject({ code: 'RESCHEDULE_ALREADY_DECIDED' });
    expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
    expect(tx.slotKelas.update).not.toHaveBeenCalled();
  });

  it('tidak memindahkan booking yang sudah dibatalkan atau bukan di slot sumber', async () => {
    const { service, tx } = setup({ bookingStatus: 'CANCELLED' });
    await expect(approve(service)).rejects.toMatchObject({ code: 'RESCHEDULE_ALREADY_DECIDED' });
    expect(tx.slotKelas.update).not.toHaveBeenCalled();
  });
});

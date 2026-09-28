import { AutoCancelService } from './auto-cancel.service';

const now = new Date('2026-10-12T08:00:00Z');
const startsInTwelveHours = new Date(now.getTime() + 12 * 3_600_000);

const slot = (overrides: Record<string, unknown> = {}) => ({
  id: 'slot-1',
  branchId: 'branch-1',
  classTypeId: 'type-1',
  status: 'PUBLISHED',
  startAt: startsInTwelveHours,
  branch: { name: 'Green Garden', timezone: 'Asia/Jakarta' },
  classType: { name: 'Reformer' },
  instructor: { phone: null, displayName: 'Ayu' },
  bookings: [] as Array<Record<string, unknown>>,
  ...overrides,
});

const booking = (id: string) => ({
  id,
  customerPackageId: null,
  user: { phone: `+62812000${id}`, displayName: `Peserta ${id}` },
});

function build(slots: Array<ReturnType<typeof slot>>, opts: { claimCount?: number; minQuota?: number } = {}) {
  const tx = {
    slotKelas: { updateMany: jest.fn(async () => ({ count: opts.claimCount ?? 1 })) },
    pemesananKelas: { update: jest.fn(async () => ({})) },
    paketPelanggan: { findUnique: jest.fn(async () => null) },
    sessionLedger: { create: jest.fn(async () => ({})) },
  };
  const db = {
    slotKelas: {
      findMany: jest.fn(async () => slots),
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
    minQuotaSetting: {
      findUnique: jest.fn(async () =>
        opts.minQuota === undefined ? null : { active: true, minQuota: opts.minQuota, cutoffHours: 24 },
      ),
    },
    user: { findMany: jest.fn(async () => []) },
    $transaction: jest.fn(async (action: (t: typeof tx) => Promise<unknown>) => action(tx)),
  };
  const whatsapp = { sendMessage: jest.fn(async () => ({ success: true })) };
  const service = new AutoCancelService(db as never, whatsapp as never);
  return { service, db, tx, whatsapp };
}

describe('AutoCancelService', () => {
  const original = process.env.ENABLE_AUTO_CANCEL;
  afterEach(() => {
    if (original === undefined) delete process.env.ENABLE_AUTO_CANCEL;
    else process.env.ENABLE_AUTO_CANCEL = original;
  });

  it('says it was skipped, instead of reporting an empty run, when disabled in this environment', async () => {
    delete process.env.ENABLE_AUTO_CANCEL;
    const { service, db } = build([slot()]);
    const result = await service.evaluateClasses(now);
    expect(result).toMatchObject({
      skipped: true,
      skippedReason: 'AUTO_CANCEL_DISABLED',
      evaluatedSlotsCount: 0,
      cancelledSlotsCount: 0,
    });
    expect(db.slotKelas.findMany).not.toHaveBeenCalled();
  });

  describe('when enabled', () => {
    beforeEach(() => {
      process.env.ENABLE_AUTO_CANCEL = 'true';
    });

    it('confirms a published class that met its quota, guarded on status and bumping the version', async () => {
      const { service, db, whatsapp } = build([slot({ bookings: [booking('1')] })]);
      const result = await service.evaluateClasses(now);
      expect(result.skipped).toBeUndefined();
      expect(result).toMatchObject({ evaluatedSlotsCount: 1, confirmedSlotsCount: 1, cancelledSlotsCount: 0 });
      expect(db.slotKelas.updateMany).toHaveBeenCalledWith({
        where: { id: 'slot-1', status: 'PUBLISHED' },
        data: { status: 'CONFIRMED', version: { increment: 1 } },
      });
      expect(whatsapp.sendMessage).not.toHaveBeenCalled();
    });

    it('cancels a class below its quota, releases the bookings, bumps the version and notifies attendees', async () => {
      const { service, tx, whatsapp } = build([slot({ bookings: [booking('1')] })], { minQuota: 3 });
      const result = await service.evaluateClasses(now);
      expect(result).toMatchObject({ cancelledSlotsCount: 1, confirmedSlotsCount: 0 });
      expect(result.cancelledSlots[0]).toMatchObject({ slotId: 'slot-1', bookedCount: 1, minQuota: 3 });
      expect(tx.slotKelas.updateMany).toHaveBeenCalledWith({
        where: { id: 'slot-1', status: { in: ['PUBLISHED', 'DRAFT'] } },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'AUTO_CANCEL_MIN_QUOTA',
          bookedCount: 0,
          version: { increment: 1 },
        },
      });
      expect(tx.pemesananKelas.update).toHaveBeenCalledTimes(1);
      expect(whatsapp.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ to: '+628120001', reminderType: 'CLASS_AUTO_CANCELLED' }),
      );
    });

    it('leaves a class alone, without notifying anyone, when staff changed it during the run', async () => {
      const { service, tx, whatsapp } = build([slot({ bookings: [booking('1')] })], {
        minQuota: 3,
        claimCount: 0,
      });
      const result = await service.evaluateClasses(now);
      expect(result).toMatchObject({ cancelledSlotsCount: 0, evaluatedSlotsCount: 1 });
      expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
      expect(whatsapp.sendMessage).not.toHaveBeenCalled();
    });

    it('ignores classes that have not reached their confirmation cutoff yet', async () => {
      const farAway = slot({ startAt: new Date(now.getTime() + 40 * 3_600_000) });
      const { service, db, tx } = build([farAway]);
      const result = await service.evaluateClasses(now);
      expect(result).toMatchObject({ confirmedSlotsCount: 0, cancelledSlotsCount: 0 });
      expect(db.slotKelas.updateMany).not.toHaveBeenCalled();
      expect(tx.slotKelas.updateMany).not.toHaveBeenCalled();
    });
  });
});

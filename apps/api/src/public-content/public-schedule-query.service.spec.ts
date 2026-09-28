import { PublicScheduleQueryService } from './public-schedule-query.service';
import { ApiProblem } from '../identity/security';

const branch = {
  id: 'branch-1',
  code: 'GG',
  name: 'Green Garden',
  timezone: 'Asia/Jakarta',
  address: 'Green Garden Blok Z No. 1',
  supportWhatsappE164: '+628123456789',
};

const baseSlot = {
  id: 'slot-0000001',
  branchId: 'branch-1',
  status: 'PUBLISHED',
  capacity: 10,
  bookedCount: 0,
  classType: { id: 'type-1', code: 'GROUP_CLASS', name: 'Group Class' },
  instructor: { displayName: 'Coach Sarah' },
};

describe('PublicScheduleQueryService.canBook', () => {
  const db = {
    cabang: { findMany: jest.fn().mockResolvedValue([branch]) },
    slotKelas: { findMany: jest.fn(), findFirst: jest.fn() },
  };
  const config = { value: { booking: { enabled: true, cutoffHours: 2 } } };
  const service = new PublicScheduleQueryService(db as never, config as never);

  beforeEach(() => {
    jest.clearAllMocks();
    db.cabang.findMany.mockResolvedValue([branch]);
    config.value.booking.enabled = true;
    config.value.booking.cutoffHours = 2;
  });

  it('marks a slot with open capacity well before cutoff as bookable', async () => {
    db.slotKelas.findMany.mockResolvedValue([
      { ...baseSlot, startAt: new Date(Date.now() + 6 * 3_600_000), endAt: new Date(Date.now() + 7 * 3_600_000) },
    ]);
    const result = await service.list({ branchId: 'branch-1' });
    expect(result.items[0]!.canBook).toBe(true);
  });

  it('marks a full slot as not bookable even though it is well before cutoff', async () => {
    db.slotKelas.findMany.mockResolvedValue([
      {
        ...baseSlot,
        bookedCount: 10,
        startAt: new Date(Date.now() + 6 * 3_600_000),
        endAt: new Date(Date.now() + 7 * 3_600_000),
      },
    ]);
    const result = await service.list({ branchId: 'branch-1' });
    expect(result.items[0]!.available).toBe(0);
    expect(result.items[0]!.canBook).toBe(false);
  });

  it('marks a slot inside the booking cutoff window as not bookable even with open capacity', async () => {
    db.slotKelas.findMany.mockResolvedValue([
      {
        ...baseSlot,
        startAt: new Date(Date.now() + 30 * 60_000),
        endAt: new Date(Date.now() + 90 * 60_000),
      },
    ]);
    const result = await service.list({ branchId: 'branch-1' });
    expect(result.items[0]!.available).toBeGreaterThan(0);
    expect(result.items[0]!.canBook).toBe(false);
  });

  it('marks every slot as not bookable when booking is globally disabled', async () => {
    config.value.booking.enabled = false;
    db.slotKelas.findMany.mockResolvedValue([
      { ...baseSlot, startAt: new Date(Date.now() + 6 * 3_600_000), endAt: new Date(Date.now() + 7 * 3_600_000) },
    ]);
    const result = await service.list({ branchId: 'branch-1' });
    expect(result.items[0]!.canBook).toBe(false);
  });

  it('applies the same canBook logic to the single-slot detail endpoint', async () => {
    db.slotKelas.findFirst.mockResolvedValue({
      ...baseSlot,
      startAt: new Date(Date.now() + 30 * 60_000),
      endAt: new Date(Date.now() + 90 * 60_000),
      studio: { id: 'studio-1', name: 'Studio A' },
      room: null,
      branch,
    });
    const result = await service.detail('slot-0000001');
    expect(result.canBook).toBe(false);
  });

  it('throws RESOURCE_NOT_FOUND for an unknown slot detail', async () => {
    db.slotKelas.findFirst.mockResolvedValue(null);
    await expect(service.detail('missing-slot')).rejects.toThrow(ApiProblem);
  });
});

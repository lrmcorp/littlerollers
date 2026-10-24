import { PolicyService } from '../identity/policy.service';
import { MasterAccessService } from './master-access.service';
import { MasterCatalogService } from './master-catalog.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const studioId = id(10);
const roomId = id(20);

const superOwner = {
  sessionId: 's',
  userId: id(100),
  roles: [] as never,
  capabilities: ['master:manage', 'master:read', 'branch:all'],
  branchIds: [] as string[],
};

function setup(studio: Record<string, unknown> = {}, upcoming = 0) {
  const studioRow = { id: studioId, branchId: branchA, name: 'Studio 1', description: 'Reformer', active: true, ...studio };
  const roomRow = { id: roomId, studioId, studio: studioRow, name: 'Ruang A', capacityBed: 5, active: true };
  const tx = {
    studio: {
      findUnique: jest.fn().mockResolvedValue(studioRow),
      update: jest.fn().mockImplementation(async ({ data }) => ({ ...studioRow, ...data })),
    },
    ruangan: {
      findUnique: jest.fn().mockResolvedValue(roomRow),
      update: jest.fn().mockImplementation(async ({ data }) => ({ ...roomRow, ...data })),
    },
    slotKelas: { count: jest.fn().mockResolvedValue(upcoming) },
  };
  const db = {
    ...tx,
    cabang: { findFirst: jest.fn().mockResolvedValue({ id: branchA }) },
    studio: { ...tx.studio, findMany: jest.fn().mockResolvedValue([]) },
    ruangan: { ...tx.ruangan, findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new MasterCatalogService(
    db as never,
    new MasterAccessService(new PolicyService()),
  );
  return { service, tx, db };
}

describe('studio and room listings', () => {
  it('lists only active studios and rooms by default, everything on request', async () => {
    const { service, db } = setup();
    await service.listStudios(superOwner, branchA);
    expect(db.studio.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { branchId: branchA, active: true },
        include: { rooms: expect.objectContaining({ where: { active: true } }) },
      }),
    );
    await service.listStudios(superOwner, branchA, true);
    expect(db.studio.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { branchId: branchA },
        include: { rooms: expect.objectContaining({ where: {} }) },
      }),
    );
    await service.listRooms(superOwner, studioId, true);
    expect(db.ruangan.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { studioId } }),
    );
  });
});

describe('deactivating a studio', () => {
  it('is refused while unfinished classes still use it', async () => {
    const { service, tx } = setup({}, 3);
    await expect(
      service.updateStudio(superOwner, studioId, { name: 'Studio 1', active: false, reason: 'Renovasi' }, 'c'),
    ).rejects.toMatchObject({ code: 'HAS_UPCOMING_SLOTS' });
    expect(tx.studio.update).not.toHaveBeenCalled();
    expect(tx.slotKelas.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        studioId,
        status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
        endAt: { gt: expect.any(Date) },
      }),
    });
  });

  it('succeeds with no upcoming classes and reactivating never needs the check', async () => {
    const { service, tx } = setup();
    await service.updateStudio(superOwner, studioId, { name: 'Studio 1', active: false, reason: 'Renovasi' }, 'c');
    expect(tx.studio.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ active: false }) }),
    );
    const inactive = setup({ active: false }, 5);
    await inactive.service.updateStudio(superOwner, studioId, { name: 'Studio 1', active: true }, 'c');
    expect(inactive.tx.slotKelas.count).not.toHaveBeenCalled();
    expect(inactive.tx.studio.update).toHaveBeenCalled();
  });

  it('keeps the description when a toggle does not send equipment text', async () => {
    const { service, tx } = setup();
    await service.updateStudio(superOwner, studioId, { name: 'Studio 1', active: true }, 'c');
    const data = tx.studio.update.mock.calls[0]![0].data;
    expect('description' in data).toBe(false);
    await service.updateStudio(superOwner, studioId, { name: 'Studio 1', equipmentText: '  ' }, 'c');
    expect(tx.studio.update.mock.calls[1]![0].data.description).toBeNull();
  });

  it('rejects a name that is too short', async () => {
    const { service } = setup();
    await expect(
      service.updateStudio(superOwner, studioId, { name: 'x' }, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('deactivating a room', () => {
  it('is refused while unfinished classes are booked into it', async () => {
    const { service, tx } = setup({}, 2);
    await expect(
      service.updateRoom(superOwner, roomId, { name: 'Ruang A', active: false, reason: 'Renovasi' }, 'c'),
    ).rejects.toMatchObject({ code: 'HAS_UPCOMING_SLOTS' });
    expect(tx.ruangan.update).not.toHaveBeenCalled();
    expect(tx.slotKelas.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ roomId }),
    });
  });

  it('validates the capacity and lets an unused room be deactivated', async () => {
    const { service, tx } = setup();
    for (const capacity of [0, 1.5, 101])
      await expect(
        service.updateRoom(superOwner, roomId, { name: 'Ruang A', capacity }, 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await service.updateRoom(superOwner, roomId, { name: 'Ruang A', capacity: 8, active: false, reason: 'Renovasi' }, 'c');
    expect(tx.ruangan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ capacityBed: 8, active: false }) }),
    );
  });
});

describe('deactivating takes an optional reason (3-500 characters when given)', () => {
  it.each([
    ['studio', (s: ReturnType<typeof setup>, reason?: string) => s.service.updateStudio(superOwner, studioId, { name: 'Studio 1', active: false, reason }, 'c')],
    ['room', (s: ReturnType<typeof setup>, reason?: string) => s.service.updateRoom(superOwner, roomId, { name: 'Ruang A', active: false, reason }, 'c')],
  ] as const)('deactivates a %s without a reason, but rejects one that is too short', async (_kind, call) => {
    const tooShort = setup();
    await expect(call(tooShort, 'ab')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(tooShort.tx.studio.update).not.toHaveBeenCalled();
    expect(tooShort.tx.ruangan.update).not.toHaveBeenCalled();
    for (const reason of [undefined, '', '  ']) {
      const state = setup();
      await call(state, reason);
      expect(state.tx.studio.update.mock.calls.length + state.tx.ruangan.update.mock.calls.length).toBeGreaterThan(0);
    }
  });

  it('reactivating an inactive studio needs no reason', async () => {
    const { service, tx } = setup({ active: false });
    await service.updateStudio(superOwner, studioId, { name: 'Studio 1', active: true }, 'c');
    expect(tx.studio.update).toHaveBeenCalled();
  });
});

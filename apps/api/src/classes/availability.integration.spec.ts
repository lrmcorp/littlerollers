import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { AvailabilityService } from './ketersediaan-instruktur.service';

// Integration test berjalan dengan koneksi MySQL nyata.
// DATABASE_URL dimuat otomatis dari root .env oleh jest.setup.cjs.
const databaseDescribe = describe;

databaseDescribe('synthetic instructor availability MySQL integration', () => {
  const db = new PrismaClient();
  const service = new AvailabilityService(
    db as never,
    new PolicyService(),
    new IdempotencyService(db as never),
  );
  const namespace = `availability-${Date.now()}`;
  const instructorId = randomUUID();
  const branchId = randomUUID();
  const otherBranchId = randomUUID();
  const assignmentId = randomUUID();
  const otherAssignmentId = randomUUID();
  const principal = {
    sessionId: namespace,
    userId: instructorId,
    roles: [{ role: 'INSTRUCTOR' as const, branchId }],
    capabilities: ['availability:self:read', 'availability:self:create'],
    branchIds: [branchId, otherBranchId],
  };

  beforeAll(async () => {
    await db.$connect();
    await db.user.create({ data: { id: instructorId, displayName: 'Synthetic instructor', role: 'COACH' } });
    await db.cabang.createMany({
      data: [
        { id: branchId, code: `${namespace}-a`, name: 'Jakarta', timezone: 'Asia/Jakarta' },
        { id: otherBranchId, code: `${namespace}-b`, name: 'Bali', timezone: 'Asia/Makassar' },
      ],
    });
    await db.penugasanInstruktur.createMany({
      data: [
        {
          id: assignmentId,
          coachId: instructorId,
          branchId,
          active: true,
        },
        {
          id: otherAssignmentId,
          coachId: instructorId,
          branchId: otherBranchId,
          active: true,
        },
      ],
    });
  });

  afterAll(async () => {
    await db.instructorAvailability.deleteMany({ where: { instructorId } });
    await db.penugasanInstruktur.deleteMany({ where: { id: { in: [assignmentId, otherAssignmentId] } } });
    await db.cabang.deleteMany({ where: { id: { in: [branchId, otherBranchId] } } });
    await db.user.delete({ where: { id: instructorId } });
    await db.$disconnect();
  });

  it('creates, replays and lists an authoritative UTC interval', async () => {
    const input = {
      branchId,
      startAt: '2026-08-01T09:00:00+07:00',
      endAt: '2026-08-01T11:00:00+07:00',
    };
    const first = await service.create(principal, input, `${namespace}-1-abcdefghijkl`, namespace);
    const replay = await service.create(principal, input, `${namespace}-1-abcdefghijkl`, namespace);
    expect(first.replay).toBe(false);
    expect(replay.replay).toBe(true);
    expect(
      await db.instructorAvailability.count({ where: { instructorId } }),
    ).toBe(1);
    const page = await service.list(
      principal,
      branchId,
      '2026-08-01T00:00:00Z',
      '2026-08-02T00:00:00Z',
    );
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      instructorUserId: instructorId,
      branchId,
      timezone: 'Asia/Jakarta',
      status: 'ENDED',
    });
    expect(page.items[0]!.startAt.toISOString()).toBe('2026-08-01T02:00:00.000Z');
    expect(page.items[0]!.endAt.toISOString()).toBe('2026-08-01T04:00:00.000Z');
  });

  it('rejects offset-less, reversed and hidden branch inputs', async () => {
    await expect(
      service.create(
        principal,
        { branchId, startAt: '2026-08-02T09:00:00', endAt: '2026-08-02T10:00:00Z' },
        `${namespace}-5-abcdefghijkl`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(
        principal,
        { branchId, startAt: '2026-08-02T11:00:00Z', endAt: '2026-08-02T10:00:00Z' },
        `${namespace}-6-abcdefghijkl`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.list({ ...principal, branchIds: [] }, branchId)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });
});

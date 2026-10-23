import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { AuditService } from '../foundation/audit.service';
import { PolicyService } from '../identity/policy.service';
import { LifecycleService } from './lifecycle.service';

// Berjalan di MySQL nyata (DATABASE_URL dari .env). Inti yang diuji: pemindaian foreign key lewat
// information_schema dan aturan hapus RESTRICT / SET NULL / CASCADE yang sebenarnya berlaku di database.
describe('lifecycle deletability on a real MySQL', () => {
  const db = new PrismaClient();
  const ns = `lc-${Date.now()}`;
  const actorId = randomUUID();
  const branchId = randomUUID();
  const studioId = randomUUID();
  const roomId = randomUUID();
  const memberId = randomUUID();
  const ownerLinkedId = randomUUID();
  const caseId = randomUUID();
  const voucherId = randomUUID();
  const service = new LifecycleService(db as never, new PolicyService(), new AuditService(db as never));
  const principal = {
    sessionId: randomUUID(),
    userId: actorId,
    roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
    capabilities: ['branch:all', 'master:manage', 'user:admin', 'voucher:manage'],
    branchIds: [] as string[],
  };

  const blockerKinds = async (kind: Parameters<LifecycleService['inspect']>[1], id: string) =>
    (await service.inspect(principal as never, kind, id)).blockers.map((b) => `${b.kind}:${b.count}`).sort();

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: actorId, displayName: `Actor ${ns}`, role: 'SUPERADMIN' },
        { id: memberId, displayName: `Member ${ns}`, role: 'MEMBER' },
        { id: ownerLinkedId, displayName: `Owner ${ns}`, role: 'OWNER' },
      ],
    });
    await db.cabang.create({ data: { id: branchId, code: ns, name: `Cabang ${ns}`, timezone: 'Asia/Jakarta' } });
    await db.studio.create({ data: { id: studioId, branchId, code: `S-${ns}`.slice(0, 32), name: 'Studio uji' } });
    await db.ruangan.create({ data: { id: roomId, studioId, code: `R-${ns}`.slice(0, 32), name: 'Ruang uji' } });
  });

  afterAll(async () => {
    await db.supportCase.deleteMany({ where: { id: caseId } });
    await db.voucher.deleteMany({ where: { id: voucherId } });
    await db.ownerCabang.deleteMany({ where: { ownerId: ownerLinkedId } });
    await db.userSession.deleteMany({ where: { userId: memberId } });
    await db.ruangan.deleteMany({ where: { id: roomId } });
    await db.studio.deleteMany({ where: { id: studioId } });
    await db.cabang.deleteMany({ where: { id: branchId } });
    await db.auditLog.deleteMany({ where: { OR: [{ actorId }, { objectId: { in: [branchId, studioId, roomId, memberId, voucherId] } }] } });
    await db.user.deleteMany({ where: { id: { in: [actorId, memberId, ownerLinkedId] } } });
    await db.$disconnect();
  });

  it('reads RESTRICT children through the real foreign keys, one level at a time', async () => {
    expect(await blockerKinds('branch', branchId)).toEqual(['studio:1']);
    expect(await blockerKinds('studio', studioId)).toEqual(['ruangan:1']);
    expect(await blockerKinds('room', roomId)).toEqual([]);
  });

  it('counts SET NULL children too, because they carry history (a support case keeps its branch)', async () => {
    await db.supportCase.create({
      data: { id: caseId, subject: `Kasus ${ns}`, customerId: memberId, branchId, tags: [] },
    });
    expect(await blockerKinds('branch', branchId)).toEqual(['studio:1', 'support_case:1']);
    // Yang menjadi penghalang akun adalah kasus (RESTRICT pada customerId).
    expect(await blockerKinds('user', memberId)).toEqual(['support_case:1']);
    await db.supportCase.delete({ where: { id: caseId } });
  });

  it('ignores CASCADE children: a user with only sessions is clean and the sessions go with it', async () => {
    await db.userSession.create({
      data: {
        userId: memberId,
        tokenFamilyHash: `f-${ns}`.padEnd(64, '0').slice(0, 64),
        accessTokenHash: `a-${ns}`.padEnd(64, '0').slice(0, 64),
        refreshTokenHash: `r-${ns}`.padEnd(64, '0').slice(0, 64),
        expiresAt: new Date(Date.now() + 3_600_000),
        refreshExpiresAt: new Date(Date.now() + 86_400_000),
      },
    });
    expect(await blockerKinds('user', memberId)).toEqual([]);
  });

  it('protects the owner link: an owner assigned to a branch cannot be deleted, and neither can the branch', async () => {
    await db.ownerCabang.create({ data: { ownerId: ownerLinkedId, branchId } });
    expect(await blockerKinds('user', ownerLinkedId)).toEqual(['owner_cabang:1']);
    expect(await blockerKinds('branch', branchId)).toEqual(['owner_cabang:1', 'studio:1']);
    await db.ownerCabang.deleteMany({ where: { ownerId: ownerLinkedId } });
  });

  it('applies the non-FK rule for vouchers: a redeemed voucher is blocked, an unused one is deletable', async () => {
    await db.voucher.create({
      data: { id: voucherId, code: ns.toUpperCase().slice(0, 32), name: 'Uji', discountValue: 1000, usedCount: 2 },
    });
    expect(await blockerKinds('voucher', voucherId)).toEqual(['voucher_used:2']);
    await db.voucher.update({ where: { id: voucherId }, data: { usedCount: 0 } });
    expect(await blockerKinds('voucher', voucherId)).toEqual([]);
  });

  it('deletes bottom-up for real, refuses out of order with the legacy code, and leaves a permanent audit trail', async () => {
    // Urutan salah: cabang masih punya studio.
    await expect(service.remove(principal as never, 'branch', branchId, undefined, 'corr-1')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
      status: 409,
    });
    expect(await db.cabang.count({ where: { id: branchId } })).toBe(1);

    await service.remove(principal as never, 'room', roomId, 'Ruangan salah input', 'corr-2');
    await service.remove(principal as never, 'studio', studioId, 'Studio salah input', 'corr-3');
    await service.remove(principal as never, 'branch', branchId, undefined, 'corr-4');
    expect(await db.cabang.count({ where: { id: branchId } })).toBe(0);
    expect(await db.studio.count({ where: { id: studioId } })).toBe(0);

    const trail = await db.auditLog.findMany({
      where: { objectId: { in: [roomId, studioId, branchId] }, action: { startsWith: 'lifecycle.' } },
      orderBy: { createdAt: 'asc' },
    });
    expect(trail.map((row) => [row.action, row.objectType, row.reason])).toEqual(
      expect.arrayContaining([
        ['lifecycle.room_deleted', 'Room', 'Ruangan salah input'],
        ['lifecycle.studio_deleted', 'Studio', 'Studio salah input'],
        ['lifecycle.branch_deleted', 'Branch', null],
      ]),
    );
    const branchEntry = trail.find((row) => row.objectId === branchId)!;
    expect(branchEntry.detail).toMatchObject({ before: { code: ns, name: `Cabang ${ns}` } });
  });

  it('deletes a clean account together with its sessions, writes a masked snapshot, and refuses your own', async () => {
    await expect(service.remove(principal as never, 'user', actorId, 'coba hapus diri', 'c')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_SELF',
    });
    await service.remove(principal as never, 'user', memberId, 'Undangan salah ketik', 'corr-5');
    expect(await db.user.count({ where: { id: memberId } })).toBe(0);
    expect(await db.userSession.count({ where: { userId: memberId } })).toBe(0);
    const entry = await db.auditLog.findFirst({ where: { objectId: memberId, action: 'lifecycle.user_deleted' } });
    expect(entry).toMatchObject({ reason: 'Undangan salah ketik', targetUserId: memberId, objectType: 'User' });
  });
});

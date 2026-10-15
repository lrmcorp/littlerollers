import { PolicyService } from './policy.service';
import { UserAdministrationService } from './user-administration.service';

const principal = {
  sessionId: 's',
  userId: 'actor-1',
  roles: [] as never,
  capabilities: ['user:admin', 'audit:read'],
  branchIds: [] as string[],
};

function setup() {
  const created: Array<Record<string, any>> = [];
  const rows: Array<Record<string, any>> = [];
  const db: any = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'target-1', displayName: 'Rina', status: 'ACTIVE', role: 'ADMIN', createdAt: new Date('2026-10-01T00:00:00Z'), updatedAt: new Date('2026-10-02T00:00:00Z') }),
      update: jest.fn().mockImplementation(async ({ data }) => ({
        id: 'target-1',
        displayName: 'Rina',
        status: 'ACTIVE',
        role: 'ADMIN',
        email: 'rina@x.test',
        createdAt: new Date('2026-10-01T00:00:00Z'),
        updatedAt: new Date('2026-10-02T00:00:00Z'),
        ...data,
      })),
      findMany: jest.fn().mockResolvedValue([
        { id: 'actor-1', displayName: 'Super Admin' },
        { id: 'target-1', displayName: 'Rina' },
      ]),
    },
    userSession: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    auditLog: {
      create: jest.fn().mockImplementation(async ({ data }) => {
        created.push(data);
        return { id: `audit-${created.length}`, createdAt: new Date('2026-10-13T05:00:00Z'), ...data };
      }),
      findMany: jest.fn().mockImplementation(async () => rows),
      count: jest.fn().mockImplementation(async () => rows.length),
    },
    $transaction: jest.fn().mockImplementation(async (fn: (tx: any) => unknown) => fn(db)),
  };
  const service = new UserAdministrationService(db, new PolicyService(), {} as never);
  return { service, db, created, rows };
}

describe('riwayat audit akun staf', () => {
  it('mencatat reset kata sandi tanpa menyimpan kata sandinya', async () => {
    const { service, created } = setup();
    await service.resetPasswordDirect(principal, 'target-1', 'RahasiaBaru-123', 'corr-1');
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      action: 'security.user_password_reset',
      actorId: 'actor-1',
      targetUserId: 'target-1',
      correlationId: 'corr-1',
    });
    expect(JSON.stringify(created[0])).not.toContain('RahasiaBaru-123');
  });

  it('mencatat perubahan peran, nonaktif, dan aktif kembali', async () => {
    const { service, created } = setup();
    await service.updateUserRoles(principal, 'target-1', { roles: [{ role: 'MANAGER', branchId: null }] }, 'corr-2');
    await service.deactivate(principal, 'target-1', 'cuti', undefined, 'corr-3');
    await service.reactivate(principal, 'target-1', 'kembali', undefined, 'corr-4');
    expect(created.map((entry) => entry.action)).toEqual([
      'security.user_roles_updated',
      'security.user_deactivated',
      'security.user_reactivated',
    ]);
    expect(created[1]).toMatchObject({ reason: 'cuti', correlationId: 'corr-3' });
  });

  it('mencatat perubahan profil', async () => {
    const { service, created } = setup();
    await service.updateUserProfile(principal, 'target-1', { displayName: 'Rina Baru' } as never, 'corr-5');
    expect(created.map((entry) => entry.action)).toContain('security.user_profile_updated');
  });

  it('menampilkan riwayat dari penyimpanan, lengkap dengan nama pelaku dan target', async () => {
    const { service, rows, db } = setup();
    rows.push({
      id: 'audit-9',
      action: 'security.user_password_reset',
      actorId: 'actor-1',
      targetUserId: 'target-1',
      branchId: null,
      correlationId: 'corr-9',
      reason: null,
      createdAt: new Date('2026-10-13T05:00:00Z'),
    });
    const result = await service.listUserAudit(principal, 'target-1');
    expect(db.auditLog.findMany.mock.calls[0][0].where).toMatchObject({ targetUserId: 'target-1' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'audit-9',
      action: 'security.user_password_reset',
      correlationId: 'corr-9',
      actor: { displayName: 'Super Admin' },
      target: { displayName: 'Rina' },
    });
    expect(new Date(result.items[0]!.occurredAt).toISOString()).toBe('2026-10-13T05:00:00.000Z');
  });
});

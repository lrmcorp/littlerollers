import { AccessManagementService } from './access-management.service';
import { PolicyService } from './policy.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branch = id(1);

const superOwner = {
  sessionId: 's',
  userId: id(100),
  roles: [{ role: 'SUPER_OWNER', branchId: null }] as never,
  capabilities: ['role-permission:manage', 'branch:all'],
  branchIds: [],
};
const admin = { ...superOwner, userId: id(101), capabilities: ['booking:read'] };

function setup(targetRole = 'ADMIN') {
  const tx = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: id(200), role: targetRole, preferredBranchId: branch }),
      update: jest.fn().mockImplementation(async ({ data }) => ({ id: id(200), ...data })),
    },
    userSession: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
  };
  const db = {
    user: {
      groupBy: jest.fn().mockResolvedValue([
        { role: 'ADMIN', _count: { _all: 3 } },
        { role: 'SUPERADMIN', _count: { _all: 1 } },
        { role: 'SUPER_OWNER', _count: { _all: 1 } },
        { role: 'MEMBER', _count: { _all: 9 } },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: id(200),
        displayName: 'Rina',
        status: 'ACTIVE',
        role: 'ADMIN',
        preferredBranchId: branch,
        ownedBranches: [],
      }),
    },
    cabang: {
      findUnique: jest.fn().mockResolvedValue({ id: branch }),
      findMany: jest.fn().mockResolvedValue([{ id: branch, code: 'DD-GG', name: 'Green Garden' }]),
    },
  };
  const idempotency = {
    execute: jest.fn(async (_command: unknown, action: (t: typeof tx) => Promise<{ body: unknown }>) => ({
      ...(await action(tx)),
      replay: false,
    })),
  };
  const service = new AccessManagementService(db as never, new PolicyService(), idempotency as never);
  return { service, db, tx };
}

const replace = (roleId: string, extra: Record<string, unknown> = {}) => ({
  roles: [{ roleId, branchId: branch, ...extra }],
  reasonCode: 'ROLE_REPLACEMENT',
});

describe('AccessManagementService is honest about what exists', () => {
  it('requires role-permission:manage for everything', async () => {
    const { service } = setup();
    await expect(service.listRoles(admin)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.listCapabilities(admin)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.getUserAccess(admin, id(200))).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lists the eight built-in roles in the shape the web reads, with user counts', async () => {
    const { service } = setup();
    const { items } = await service.listRoles(superOwner);
    expect(items.map((role) => role.code)).toEqual([
      'SUPER_OWNER',
      'OWNER',
      'MANAGER',
      'ADMIN',
      'FINANCE',
      'OPS',
      'INSTRUCTOR',
      'CUSTOMER',
    ]);
    const owner = items.find((role) => role.code === 'SUPER_OWNER')!;
    expect(owner).toMatchObject({ system: true, protected: true, scope: 'GLOBAL', affectedUsers: 2 });
    expect(owner.capabilities[0]).toEqual(
      expect.objectContaining({ key: expect.any(String), label: expect.any(String), category: expect.any(String) }),
    );
    expect(items.find((role) => role.code === 'CUSTOMER')!.affectedUsers).toBe(9);
    expect(items.find((role) => role.code === 'ADMIN')!.scope).toBe('BRANCH');
  });

  it('lists capabilities as the web CapabilityDefinition', async () => {
    const { service } = setup();
    const { items } = await service.listCapabilities(superOwner);
    expect(items.find((item) => item.key === 'finance:manage')).toMatchObject({
      label: 'Finance Manage',
      category: 'finance',
      sensitive: true,
      active: true,
    });
    expect(items.find((item) => item.key === 'branch:all')).toMatchObject({ globalOnly: true });
  });

  it('returns 404 for an unknown role and resolves aliases to the canonical one', async () => {
    const { service } = setup();
    await expect(service.getRole(superOwner, 'NOPE')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.getRole(superOwner, 'superadmin')).resolves.toMatchObject({ code: 'SUPER_OWNER' });
  });

  it('shows the effective access of a user in the web UserAccess shape', async () => {
    const { service } = setup();
    const access = await service.getUserAccess(superOwner, id(200));
    expect(access).toMatchObject({
      user: { id: id(200), displayName: 'Rina', status: 'ACTIVE' },
      overrides: [],
      roleAssignments: [
        { roleCode: 'ADMIN', displayName: 'Admin cabang', branchId: branch, branch: { code: 'DD-GG' } },
      ],
    });
    expect(access.effective.capabilities).toContain('ledger:adjust:request');
    expect(access.effective.grants[0]).toMatchObject({ source: 'SYSTEM_ROLE' });
  });
});

describe('AccessManagementService.replaceUserRoles', () => {
  it('refuses to change the caller own account', async () => {
    const { service, tx } = setup();
    await expect(
      service.replaceUserRoles(superOwner, superOwner.userId, replace('ADMIN'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'CANNOT_MODIFY_OWN_ACCESS' });
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('accepts exactly one assignable role', async () => {
    const { service } = setup();
    await expect(
      service.replaceUserRoles(
        superOwner,
        id(200),
        { roles: [], reasonCode: 'X' },
        'k',
        'c',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.replaceUserRoles(
        superOwner,
        id(200),
        { roles: [{ roleId: 'ADMIN', branchId: branch }, { roleId: 'FINANCE' }], reasonCode: 'X' },
        'k',
        'c',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    for (const roleId of ['SUPER_OWNER', 'SUPERADMIN', 'OWNER', 'CUSTOMER', 'NOPE'])
      await expect(
        service.replaceUserRoles(superOwner, id(200), replace(roleId), 'k', 'c'),
      ).rejects.toMatchObject({ code: 'ROLE_NOT_ASSIGNABLE' });
  });

  it('requires a valid branch for branch-scoped roles', async () => {
    const { service, db } = setup();
    db.user.findUnique.mockResolvedValueOnce({ preferredBranchId: null });
    await expect(
      service.replaceUserRoles(
        superOwner,
        id(200),
        { roles: [{ roleId: 'MANAGER' }], reasonCode: 'X' },
        'k',
        'c',
      ),
    ).rejects.toMatchObject({ code: 'BRANCH_REQUIRED' });
    db.cabang.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.replaceUserRoles(superOwner, id(200), replace('MANAGER'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'BRANCH_NOT_FOUND' });
  });

  it('never touches a Super Owner account', async () => {
    const { service, tx } = setup('SUPER_OWNER');
    await expect(
      service.replaceUserRoles(superOwner, id(200), replace('ADMIN'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'PROTECTED_ACCOUNT' });
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('changes the role and revokes the sessions that carry the old permissions', async () => {
    const { service, tx } = setup();
    const result = await service.replaceUserRoles(superOwner, id(200), replace('manager'), 'k', 'c');
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: id(200) },
      data: { role: 'MANAGER', preferredBranchId: branch },
    });
    expect(tx.userSession.updateMany).toHaveBeenCalledWith({
      where: { userId: id(200), revokedAt: null },
      data: expect.objectContaining({ revocationReason: 'ROLE_CHANGED' }),
    });
    expect(result.body).toMatchObject({ role: 'MANAGER', status: 'UPDATED' });
  });
});

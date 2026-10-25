import { RoleAliasMigrationService } from './role-alias-migration.service';
import { canonicalRole } from './role-aliases';
import { mapUserToEffectiveRoles } from './identity.service';

describe('RoleAliasMigrationService', () => {
  it('rewrites each legacy role to its canonical name and reports only what changed', async () => {
    const updateMany = jest
      .fn()
      .mockImplementation(async ({ where }) => ({ count: where.role === 'MEMBER' ? 38 : where.role === 'COACH' ? 1 : 0 }));
    const service = new RoleAliasMigrationService({ user: { updateMany } } as never);
    await expect(service.normalize()).resolves.toEqual({ COACH: 1, MEMBER: 38 });
    expect(updateMany).toHaveBeenCalledWith({ where: { role: 'SUPERADMIN' }, data: { role: 'SUPER_OWNER' } });
    expect(updateMany).toHaveBeenCalledWith({ where: { role: 'COACH' }, data: { role: 'INSTRUCTOR' } });
    expect(updateMany).toHaveBeenCalledWith({ where: { role: 'MEMBER' }, data: { role: 'CUSTOMER' } });
  });

  it('never blocks boot when the database is not reachable', async () => {
    const service = new RoleAliasMigrationService({
      user: { updateMany: jest.fn().mockRejectedValue(new Error('db down')) },
    } as never);
    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
  });
});

describe('canonical roles', () => {
  it('translates legacy names and leaves canonical ones alone', () => {
    expect(['SUPERADMIN', 'COACH', 'MEMBER', 'ADMIN', 'OWNER'].map(canonicalRole)).toEqual([
      'SUPER_OWNER',
      'INSTRUCTOR',
      'CUSTOMER',
      'ADMIN',
      'OWNER',
    ]);
  });

  it('gives a principal one effective role, never both the canonical and the legacy name', () => {
    for (const [stored, expected] of [
      ['SUPERADMIN', 'SUPER_OWNER'],
      ['SUPER_OWNER', 'SUPER_OWNER'],
      ['COACH', 'INSTRUCTOR'],
      ['MEMBER', 'CUSTOMER'],
      ['CUSTOMER', 'CUSTOMER'],
    ] as const)
      expect(mapUserToEffectiveRoles({ role: stored }).map((r) => r.role)).toEqual([expected]);
  });
});

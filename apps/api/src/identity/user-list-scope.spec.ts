import { PolicyService } from './policy.service';
import { ROLE_CAPABILITIES } from './role-capabilities';
import { UserAdministrationService } from './user-administration.service';

const branchA = '00000000-0000-4000-8000-000000000001';

const principal = (role: keyof typeof ROLE_CAPABILITIES, capabilities: readonly string[], branchIds: string[] = [branchA]) =>
  ({
    sessionId: 's',
    userId: '00000000-0000-4000-8000-0000000000f1',
    roles: [{ role, branchId: null }] as never,
    capabilities: [...capabilities],
    branchIds,
  }) as never;

function setup() {
  const db = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
    },
  };
  const service = new UserAdministrationService(db as never, new PolicyService(), {} as never);
  return { service, db };
}

describe('role capabilities: payment decision', () => {
  it('lets Finance, Manager and Super Owner decide payments but not the front desk', () => {
    for (const role of ['SUPER_OWNER', 'FINANCE', 'MANAGER'] as const) {
      const caps = ROLE_CAPABILITIES[role];
      expect(caps.some((c) => c === 'payment:decide' || c === 'purchase:decide')).toBe(true);
    }
    expect(ROLE_CAPABILITIES.ADMIN).toContain('payment:review');
    expect(ROLE_CAPABILITIES.ADMIN).not.toContain('payment:decide');
    expect(ROLE_CAPABILITIES.ADMIN).not.toContain('purchase:decide');
    expect(ROLE_CAPABILITIES.ADMIN).toContain('purchase:record');
  });
});

describe('UserAdministrationService.listUsers scope', () => {
  const unwrap = (call: unknown[]) => JSON.stringify((call[0] as { where: unknown }).where);

  it('limits a branch role to branch staff: no Super Owner, no customers', async () => {
    for (const role of ['ADMIN', 'MANAGER', 'OWNER'] as const) {
      const { service, db } = setup();
      await service.listUsers(principal(role, ROLE_CAPABILITIES[role]), {});
      const where = unwrap(db.user.findMany.mock.calls[0]!);
      expect(where).toContain('"OWNER","MANAGER","FINANCE","ADMIN","INSTRUCTOR"');
      expect(where).not.toContain('SUPER_OWNER');
      expect(where).not.toContain('"CUSTOMER"');
      // Hitungan ringkasan juga dibatasi, supaya jumlah pelanggan tidak bocor.
      const counts = JSON.stringify((db.user.groupBy.mock.calls[0]![0] as { where: unknown }).where);
      expect(counts).toContain('"OWNER","MANAGER","FINANCE","ADMIN","INSTRUCTOR"');
      expect(counts).toContain(branchA);
    }
  });

  it('keeps the asking branch role away from customers even when it asks for them', async () => {
    const { service, db } = setup();
    await service.listUsers(principal('MANAGER', ROLE_CAPABILITIES.MANAGER), { audience: 'CUSTOMER' });
    const where = (db.user.findMany.mock.calls[0]![0] as { where: Record<string, unknown> }).where;
    // Syarat peran dari izin tetap ada di AND, jadi pelanggan tidak mungkin lolos.
    expect(JSON.stringify(where.AND)).toContain('"OWNER","MANAGER","FINANCE","ADMIN","INSTRUCTOR"');
    expect(where.role).toBe('CUSTOMER'); // Hasil irisan dengan AND adalah kosong.
  });

  it('does not limit Super Owner (user:admin)', async () => {
    const { service, db } = setup();
    await service.listUsers(principal('SUPER_OWNER', ROLE_CAPABILITIES.SUPER_OWNER, []), {});
    const where = (db.user.findMany.mock.calls[0]![0] as { where: Record<string, unknown> }).where;
    expect(where.AND).toBeUndefined();
  });
});

describe('UserAdministrationService.getUser scope', () => {
  const row = (role: string) => ({
    id: '00000000-0000-4000-8000-0000000000aa',
    role,
    status: 'ACTIVE',
    email: 'x@dailydose.test',
    name: 'X',
    preferredBranchId: null,
    profile: null,
    createdAt: new Date('2026-10-01T00:00:00Z'),
    updatedAt: new Date('2026-10-01T00:00:00Z'),
    stoppedAt: null,
  });

  it.each(['SUPER_OWNER', 'CUSTOMER'])('answers 404 for a %s account to a branch role', async (role) => {
    const { service, db } = setup();
    db.user.findUnique.mockResolvedValue(row(role));
    await expect(
      service.getUser(principal('MANAGER', ROLE_CAPABILITIES.MANAGER), 'x'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('lets a branch role open a staff account and Super Owner open any account', async () => {
    const { service, db } = setup();
    db.user.findUnique.mockResolvedValue(row('INSTRUCTOR'));
    await expect(
      service.getUser(principal('MANAGER', ROLE_CAPABILITIES.MANAGER), 'x'),
    ).resolves.toBeDefined();
    db.user.findUnique.mockResolvedValue(row('SUPER_OWNER'));
    await expect(
      service.getUser(principal('SUPER_OWNER', ROLE_CAPABILITIES.SUPER_OWNER, []), 'x'),
    ).resolves.toBeDefined();
  });
});

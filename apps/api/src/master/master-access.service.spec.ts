import { ROLE_CAPABILITIES } from '../identity/role-capabilities';
import { PolicyService } from '../identity/policy.service';
import { MasterAccessService } from './master-access.service';

const branchId = '00000000-0000-4000-8000-000000000002';
const otherBranchId = '00000000-0000-4000-8000-000000000099';

const principal = (role: keyof typeof ROLE_CAPABILITIES) => ({
  sessionId: 's',
  userId: '00000000-0000-4000-8000-000000000001',
  roles: [{ role, branchId }] as never,
  capabilities: [...ROLE_CAPABILITIES[role]],
  branchIds: [branchId],
});

describe('MasterAccessService catalog read for scheduling', () => {
  const access = new MasterAccessService(new PolicyService());

  it('lets scheduling staff (class-slot:manage) read class types and studios without master:read', () => {
    for (const role of ['ADMIN', 'MANAGER'] as const) {
      expect(ROLE_CAPABILITIES[role]).not.toContain('master:read');
      expect(() => access.authorizeCatalogRead(principal(role))).not.toThrow();
      expect(() => access.ensureCatalogBranchScope(principal(role), branchId)).not.toThrow();
    }
  });

  it('keeps the catalog scoped to the staff member\'s own branch', () => {
    expect(() => access.ensureCatalogBranchScope(principal('ADMIN'), otherBranchId)).toThrow();
  });

  it('does not open the catalog to read-only or customer sessions', () => {
    for (const role of ['INSTRUCTOR', 'CUSTOMER', 'FINANCE'] as const) {
      expect(() => access.authorizeCatalogRead(principal(role))).toThrow();
    }
  });

  it('still lets master:read holders (Super Owner) through, across branches', () => {
    expect(() => access.authorizeCatalogRead(principal('SUPER_OWNER'))).not.toThrow();
    expect(() => access.ensureCatalogBranchScope(principal('SUPER_OWNER'), otherBranchId)).not.toThrow();
  });

  it('does not widen the mutating master policy', () => {
    expect(() => access.authorize(principal('ADMIN'), true)).toThrow();
    expect(() => access.authorize(principal('MANAGER'), true)).toThrow();
  });
});

describe('scheduling roles hold the reads the class form needs, and nothing more', () => {
  it('gives ADMIN and MANAGER the instructor-option reads', () => {
    for (const role of ['ADMIN', 'MANAGER'] as const) {
      expect(ROLE_CAPABILITIES[role]).toEqual(
        expect.arrayContaining(['user:read', 'assignment:read', 'class-slot:manage']),
      );
    }
  });

  it('never grants them assignment management or the master/fee data', () => {
    for (const role of ['ADMIN', 'MANAGER'] as const) {
      for (const forbidden of ['assignment:manage', 'master:read', 'master:manage', 'instructor:fee:read']) {
        expect(ROLE_CAPABILITIES[role]).not.toContain(forbidden);
      }
    }
  });
});

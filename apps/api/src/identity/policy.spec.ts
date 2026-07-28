import { PolicyService } from './policy.service';

describe('PolicyService role catalog', () => {
  it('derives read-only metadata from mutation capabilities', () => {
    const catalog = new PolicyService().roleCatalog();
    expect(catalog.find(({ role }) => role === 'SUPER_OWNER')?.readOnly).toBe(false);
    expect(catalog.find(({ role }) => role === 'ADMIN')?.readOnly).toBe(false);
    expect(catalog.find(({ role }) => role === 'OWNER')?.readOnly).toBe(true);
    expect(catalog.find(({ role }) => role === 'CUSTOMER')?.readOnly).toBe(false);
  });

  it('keeps capability and branch bound together and applies matching deny first', () => {
    const policy = new PolicyService();
    const principal = {
      capabilities: ['booking:read', 'ledger:read'],
      branchIds: ['branch-a', 'branch-b'],
      capabilityGrants: [
        {
          capability: 'booking:read',
          branchId: 'branch-a',
          source: 'CUSTOM_ROLE' as const,
          sourceId: 'role-a',
        },
        {
          capability: 'ledger:read',
          branchId: 'branch-b',
          source: 'CUSTOM_ROLE' as const,
          sourceId: 'role-b',
        },
      ],
      capabilityDenials: [{ capability: 'booking:read', branchId: 'branch-b', sourceId: 'deny-b' }],
    };
    expect(policy.hasCapability(principal, 'booking:read', 'branch-a')).toBe(true);
    expect(policy.hasCapability(principal, 'booking:read', 'branch-b')).toBe(false);
    expect(policy.hasCapability(principal, 'ledger:read', 'branch-b')).toBe(true);
    expect(policy.capabilityBranchScope(principal, 'booking:read')).toEqual({
      all: false,
      included: ['branch-a'],
      excluded: [],
    });
  });

  it('represents global grant with branch-specific exclusions for list queries', () => {
    const policy = new PolicyService();
    expect(
      policy.capabilityBranchScope(
        {
          capabilities: ['attendance:read'],
          branchIds: ['branch-b'],
          capabilityGrants: [
            {
              capability: 'attendance:read',
              branchId: null,
              source: 'USER_OVERRIDE',
              sourceId: 'grant-global',
            },
          ],
          capabilityDenials: [
            { capability: 'attendance:read', branchId: 'branch-b', sourceId: 'deny-b' },
          ],
        },
        'attendance:read',
      ),
    ).toEqual({ all: true, included: [], excluded: ['branch-b'] });
  });

  it('requires a true global grant for identity verification capabilities', () => {
    const policy = new PolicyService();
    const branchReviewer = {
      capabilities: ['identity-verification:read'],
      branchIds: ['branch-a'],
      capabilityGrants: [
        {
          capability: 'identity-verification:read',
          branchId: 'branch-a',
          source: 'CUSTOM_ROLE' as const,
          sourceId: 'branch-reviewer',
        },
      ],
    };
    expect(policy.hasGlobalCapability(branchReviewer, 'identity-verification:read')).toBe(false);
    expect(() =>
      policy.requireGlobalCapability(branchReviewer, 'identity-verification:read'),
    ).toThrow('FORBIDDEN');

    expect(
      policy.hasGlobalCapability(
        {
          ...branchReviewer,
          capabilityGrants: [
            {
              capability: 'identity-verification:read',
              branchId: null,
              source: 'CUSTOM_ROLE',
              sourceId: 'global-reviewer',
            },
          ],
        },
        'identity-verification:read',
      ),
    ).toBe(true);
  });
});

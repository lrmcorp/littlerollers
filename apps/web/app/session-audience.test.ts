import { describe, expect, it } from 'vitest';
import {
  isCustomerCatalogPath,
  isPublicExperiencePath,
  packageAudienceState,
} from './session-audience';
import type { WebSession } from './session-client';

const session = (
  roles: string[],
  identityVerificationStatus: WebSession['identityVerificationStatus'],
): WebSession => ({
  id: 'session',
  displayName: 'Test',
  roles,
  capabilities: [],
  branchIds: [],
  branches: [],
  preferredBranch: null,
  identityVerificationStatus,
  sessionExpiresAt: new Date(Date.now() + 60_000),
});

describe('public detail routing and audience', () => {
  it.each([
    '/classes/movers',
    '/packages/package-id',
    '/schedule/slot-id',
    '/locations/jakarta',
  ])('treats %s as a public and customer-catalog route', (pathname) => {
    expect(isPublicExperiencePath(pathname)).toBe(true);
    expect(isCustomerCatalogPath(pathname)).toBe(true);
  });

  it('keeps staff and multi-role accounts out of customer purchase flow', () => {
    expect(packageAudienceState(session(['SUPER_OWNER'], 'NOT_REQUIRED'))).toBe('STAFF');
    expect(packageAudienceState(session(['CUSTOMER', 'ADMIN'], 'APPROVED'))).toBe('STAFF');
  });

  it('distinguishes pending and approved customer sessions', () => {
    expect(packageAudienceState(session(['CUSTOMER'], 'PENDING'))).toBe('CUSTOMER_UNVERIFIED');
    expect(packageAudienceState(session(['CUSTOMER'], 'APPROVED'))).toBe('CUSTOMER_APPROVED');
  });
});

import type { WebSession } from './session-client';

export type PackageAudienceState = 'GUEST' | 'CUSTOMER_UNVERIFIED' | 'CUSTOMER_APPROVED' | 'STAFF';

const publicRoutePrefixes = ['/classes', '/packages', '/schedule', '/locations'] as const;

export function isPublicExperiencePath(pathname: string) {
  return (
    [
      '/',
      '/contact',
      '/sign-in',
      '/register',
      '/activate-account',
      '/forgot-password',
      '/reset-password',
      '/check-in-pass',
      '/health',
    ].includes(pathname) ||
    publicRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

export function isCustomerCatalogPath(pathname: string) {
  return publicRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isCustomerOnlySession(session: WebSession | null | undefined) {
  return Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );
}

export function packageAudienceState(session: WebSession | null | undefined): PackageAudienceState {
  if (!session) return 'GUEST';
  if (!isCustomerOnlySession(session)) return 'STAFF';
  return session.identityVerificationStatus === 'APPROVED'
    ? 'CUSTOMER_APPROVED'
    : 'CUSTOMER_UNVERIFIED';
}

import type { DocumentKind } from '../../identity-verification-client';

const STORAGE_KEY = 'dd_verification_return_to';
const allowedPaths = ['/checkout', '/bookings/new', '/packages', '/classes'] as const;

export function safeVerificationContinuation(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  try {
    const url = new URL(value, 'https://littlerollers.invalid');
    if (url.origin !== 'https://littlerollers.invalid') return null;
    const allowed = allowedPaths.some(
      (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
    );
    return allowed ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}

export function verificationDocumentTarget(value: string | null): DocumentKind | null {
  return value === 'SELFIE' || value === 'KTP_FRONT' ? value : null;
}

export function rememberVerificationContinuation(value: string | null): string | null {
  const safe = safeVerificationContinuation(value);
  if (safe) sessionStorage.setItem(STORAGE_KEY, safe);
  return safe;
}

export function storedVerificationContinuation(): string | null {
  const safe = safeVerificationContinuation(sessionStorage.getItem(STORAGE_KEY));
  if (!safe) sessionStorage.removeItem(STORAGE_KEY);
  return safe;
}

export function clearVerificationContinuation() {
  sessionStorage.removeItem(STORAGE_KEY);
}

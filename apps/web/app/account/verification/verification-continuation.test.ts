import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearVerificationContinuation,
  rememberVerificationContinuation,
  safeVerificationContinuation,
  storedVerificationContinuation,
  verificationDocumentTarget,
} from './verification-continuation';

describe('verification continuation', () => {
  beforeEach(() => sessionStorage.clear());

  it('accepts only customer destinations and preserves their query and hash', () => {
    expect(
      safeVerificationContinuation('/checkout?package=package-1&branch=branch-1#payment'),
    ).toBe('/checkout?package=package-1&branch=branch-1#payment');
    expect(safeVerificationContinuation('/classes/reformer?slot=slot-1')).toBe(
      '/classes/reformer?slot=slot-1',
    );
    expect(safeVerificationContinuation('/workspace')).toBeNull();
    expect(safeVerificationContinuation('/sign-in')).toBeNull();
    expect(safeVerificationContinuation('//evil.example/path')).toBeNull();
    expect(safeVerificationContinuation('https://evil.example/path')).toBeNull();
  });

  it('stores valid continuations and clears invalid or completed state', () => {
    expect(rememberVerificationContinuation('/bookings/new?slot=slot-1')).toBe(
      '/bookings/new?slot=slot-1',
    );
    expect(storedVerificationContinuation()).toBe('/bookings/new?slot=slot-1');
    clearVerificationContinuation();
    expect(storedVerificationContinuation()).toBeNull();
  });

  it('accepts only known document deep-link targets', () => {
    expect(verificationDocumentTarget('SELFIE')).toBe('SELFIE');
    expect(verificationDocumentTarget('KTP_FRONT')).toBe('KTP_FRONT');
    expect(verificationDocumentTarget('KTP_BACK')).toBeNull();
  });
});

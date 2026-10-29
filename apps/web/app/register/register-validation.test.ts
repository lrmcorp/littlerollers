import { describe, expect, it } from 'vitest';
import {
  MAX_IDENTITY_FILE_BYTES,
  normalizeRegistrationPhone,
  registrationRequestErrorMessage,
  type RegisterValues,
  validateRegistration,
} from './register-validation';

const validValues = (overrides: Partial<RegisterValues> = {}): RegisterValues => ({
  displayName: 'Nadia Putri',
  phone: '0812 3456 7890',
  email: 'nadia@example.com',
  password: 'aman-sekali',
  confirmation: 'aman-sekali',
  selfie: new File(['selfie'], 'selfie.webp', { type: 'image/webp' }),
  ktp: new File(['ktp'], 'ktp.png', { type: 'image/png' }),
  consent: true,
  ...overrides,
});

describe('registration validation', () => {
  it('normalizes supported Indonesian and E.164 phone formatting', () => {
    expect(normalizeRegistrationPhone('0812 3456-7890')).toBe('+6281234567890');
    expect(normalizeRegistrationPhone('+62 (812) 3456.7890')).toBe('+6281234567890');
  });

  it('accepts values that match the backend contract', () => {
    expect(validateRegistration(validValues())).toEqual({});
  });

  it('returns English field errors for invalid identity values', () => {
    expect(
      validateRegistration(
        validValues({
          displayName: ' ',
          phone: 'bukan-nomor',
          email: 'email-salah',
          password: 'pendek',
          confirmation: 'berbeda',
          consent: false,
        }),
      ),
    ).toMatchObject({
      displayName: 'Please enter your full name.',
      phone: 'Enter a valid WhatsApp number, for example 0812 3456 7890.',
      email: 'Enter a valid email address.',
      password: 'Use at least 8 characters.',
      confirmation: 'The passwords do not match.',
      consent: 'Please agree to the identity check to continue.',
    });
  });

  it('accepts exactly 8,000,000 bytes and rejects a larger identity image', () => {
    const atLimit = new File([new Uint8Array(MAX_IDENTITY_FILE_BYTES)], 'selfie.jpg', {
      type: 'image/jpeg',
    });
    const overLimit = new File([new Uint8Array(MAX_IDENTITY_FILE_BYTES + 1)], 'ktp.png', {
      type: 'image/png',
    });
    const errors = validateRegistration(validValues({ selfie: atLimit, ktp: overLimit }));
    expect(errors.selfie).toBeUndefined();
    expect(errors.ktp).toBe('The KTP photo must be 8 MB or smaller.');
  });

  it('rejects unsupported and missing identity images', () => {
    const errors = validateRegistration(
      validValues({
        selfie: new File(['selfie'], 'selfie.gif', { type: 'image/gif' }),
        ktp: null,
      }),
    );
    expect(errors.selfie).toBe('The selfie photo must be a JPG, PNG or WebP image.');
    expect(errors.ktp).toBe('Please choose a KTP photo.');
  });

  it('maps conflict, validation and dependency failures to safe customer messages', () => {
    expect(registrationRequestErrorMessage(409)).toBe(
      'That email or WhatsApp number already has an account.',
    );
    expect(registrationRequestErrorMessage(422)).toBe(
      'Check your details and the photo formats, then try again.',
    );
    expect(registrationRequestErrorMessage(503)).toBe(
      'We could not create your account. Please try again.',
    );
  });
});

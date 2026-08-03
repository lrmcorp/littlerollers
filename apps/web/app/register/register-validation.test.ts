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

  it('returns Indonesian field errors for invalid identity values', () => {
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
      displayName: 'Nama lengkap wajib diisi.',
      phone: 'Masukkan nomor WhatsApp yang valid, misalnya 0812 3456 7890.',
      email: 'Masukkan alamat email yang valid.',
      password: 'Password minimal 8 karakter.',
      confirmation: 'Konfirmasi password tidak sama.',
      consent: 'Persetujuan verifikasi identitas wajib diberikan.',
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
    expect(errors.ktp).toBe('Foto KTP maksimal berukuran 8 MB.');
  });

  it('rejects unsupported and missing identity images', () => {
    const errors = validateRegistration(
      validValues({
        selfie: new File(['selfie'], 'selfie.gif', { type: 'image/gif' }),
        ktp: null,
      }),
    );
    expect(errors.selfie).toBe('Foto selfie harus berformat JPG, PNG, atau WebP.');
    expect(errors.ktp).toBe('Foto KTP wajib dipilih.');
  });

  it('maps conflict, validation and dependency failures to safe customer messages', () => {
    expect(registrationRequestErrorMessage(409)).toBe('Email atau nomor WhatsApp sudah digunakan.');
    expect(registrationRequestErrorMessage(422)).toBe(
      'Periksa kembali data dan format foto yang dipilih.',
    );
    expect(registrationRequestErrorMessage(503)).toBe(
      'Registrasi belum dapat diproses. Coba kembali.',
    );
  });
});

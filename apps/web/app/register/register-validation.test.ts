import { describe, expect, it } from 'vitest';
import {
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
          consent: false,
        }),
      ),
    ).toMatchObject({
      displayName: 'Nama lengkap wajib diisi.',
      phone: 'Masukkan nomor WhatsApp yang valid (awalan 08 atau +62), misalnya 0812 3456 7890.',
      email: 'Masukkan alamat email yang valid.',
      password: 'Password minimal 8 karakter.',
      consent: 'Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi Daily Dose.',
    });
  });

  it('rejects a WhatsApp number in the wrong format and names the correct format', () => {
    for (const phone of ['12345', '0212345678', '+1 415 555 0100', 'bukan-nomor']) {
      expect(validateRegistration(validValues({ phone })).phone).toBe(
        'Masukkan nomor WhatsApp yang valid (awalan 08 atau +62), misalnya 0812 3456 7890.',
      );
    }
    for (const phone of ['08123456789', '0812 3456 7890', '+6281234567890', '6281234567890']) {
      expect(validateRegistration(validValues({ phone })).phone).toBeUndefined();
    }
  });

  it('no longer validates identity photos or a password confirmation at registration', () => {
    const errors = validateRegistration(validValues());
    expect(Object.keys(errors)).toEqual([]);
    expect(Object.keys(validValues())).not.toContain('selfie');
    expect(Object.keys(validValues())).not.toContain('ktp');
    expect(Object.keys(validValues())).not.toContain('confirmation');
  });

  it('maps conflict, validation and dependency failures to safe customer messages', () => {
    expect(registrationRequestErrorMessage(409)).toBe('Email atau nomor WhatsApp sudah digunakan.');
    expect(registrationRequestErrorMessage(422)).toBe('Periksa kembali data yang diisi.');
    expect(registrationRequestErrorMessage(503)).toBe(
      'Registrasi belum dapat diproses. Coba kembali.',
    );
  });
});

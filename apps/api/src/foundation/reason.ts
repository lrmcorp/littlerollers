import { HttpStatus } from '@nestjs/common';
import { ApiProblem } from '../identity/security';

/**
 * Alasan wajib (3–500 karakter setelah dirapikan) untuk aksi staf yang menonaktifkan, membatalkan, menolak,
 * mengubah peran, atau mengakhiri sesuatu. Tidak ada alasan bawaan buatan server.
 */
export function requireReason(value: unknown, field = 'reason'): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < 3 || text.length > 500)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
      { field, issue: text.length === 0 ? 'REQUIRED' : text.length < 3 ? 'TOO_SHORT' : 'TOO_LONG' },
    ]);
  return text;
}

/**
 * Alasan opsional untuk aksi atas data master biasa (nonaktifkan/arsip/aktifkan): boleh kosong, tetapi bila
 * diisi tetap harus 3–500 karakter. Alasan tetap WAJIB (`requireReason`) untuk uang, saldo sesi, akun pengguna,
 * dan hapus permanen.
 */
export function optionalReason(value: unknown, field = 'reason'): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length === 0) return undefined;
  return requireReason(text, field);
}

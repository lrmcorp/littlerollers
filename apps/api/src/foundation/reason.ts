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

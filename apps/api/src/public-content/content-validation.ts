import { HttpStatus } from '@nestjs/common';
import { ApiProblem } from '../identity/security';

/** Galat validasi payload konten publik: 422 dengan nama kolom dan alasan. */
export const invalid = (field: string, issue = 'INVALID') =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);

/** Teks pendek: string, dipangkas, dengan batas panjang; kosong hanya boleh bila tidak wajib. */
export function text(
  value: unknown,
  field: string,
  max: number,
  required = false,
): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) throw invalid(field, 'REQUIRED');
    return undefined;
  }
  if (typeof value !== 'string') throw invalid(field);
  const trimmed = value.trim();
  if (required && trimmed.length === 0) throw invalid(field, 'REQUIRED');
  if (trimmed.length > max) throw invalid(field, 'TOO_LONG');
  return trimmed || undefined;
}

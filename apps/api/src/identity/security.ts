import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { HttpException, HttpStatus } from '@nestjs/common';

export const digest = (value: string): string => createHash('sha256').update(value).digest('hex');
export const opaqueToken = (): string => randomBytes(32).toString('base64url');
export const newId = (): string => randomUUID();

export const safeEqual = (left: string, right: string): boolean => {
  const a = Buffer.from(digest(left));
  const b = Buffer.from(digest(right));
  return a.length === b.length && timingSafeEqual(a, b);
};

export class ApiProblem extends HttpException {
  constructor(
    readonly code: string,
    status: HttpStatus,
    readonly retryable = false,
  ) {
    super(code, status);
  }
}

export const configurationRequired = (): never => {
  throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
};

export const positiveConfigSeconds = (key: string): number => {
  const raw = process.env[key]?.trim();
  if (!raw) configurationRequired();
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) configurationRequired();
  return value;
};

export const syntheticConfigSeconds = (key: string, fallback: number): number => {
  if (process.env[key]?.trim()) return positiveConfigSeconds(key);
  if (process.env.NODE_ENV !== 'production' && process.env.AUTH_SYNTHETIC_ENABLED === 'true')
    return fallback;
  return configurationRequired();
};

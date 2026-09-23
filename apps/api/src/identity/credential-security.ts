import { createHash, randomBytes } from 'node:crypto';
import { hash, verify, argon2id } from 'argon2';
import { compare as compareBcrypt } from 'bcryptjs';
import { HttpStatus } from '@nestjs/common';
import { ApiProblem } from './security';

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/u;

export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  return EMAIL_REGEX.test(email.trim());
};

export const canonicalEmailHash = (email: string): string =>
  createHash('sha256')
    .update(`email:${normalizeEmail(email)}`)
    .digest('hex');

export function validatePassword(password: string): void {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
}

export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  return hash(password, {
    type: argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
    salt: randomBytes(16),
  });
}

export async function verifyPassword(hashValue: string, password: string): Promise<boolean> {
  if (password.length > PASSWORD_MAX) return false;
  try {
    if (/^\$2[aby]\$/u.test(hashValue)) return await compareBcrypt(password, hashValue);
    if (!hashValue.startsWith('$argon2id$')) return false;
    return await verify(hashValue, password);
  } catch {
    return false;
  }
}

export const passwordHashNeedsUpgrade = (hashValue: string): boolean =>
  /^\$2[aby]\$/u.test(hashValue);

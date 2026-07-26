import { createHash } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

export type SeedProfile = 'minimal' | 'demo' | 'volume';

export interface SeedContext {
  db: PrismaClient;
  profile: SeedProfile;
  anchor: Date;
  id(namespace: string, key: string | number): string;
  at(days: number, hours?: number): Date;
}

export function deterministicId(namespace: string, key: string | number) {
  const hex = createHash('sha256').update(`dailydose:${namespace}:${key}`).digest('hex').slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ['8', '9', 'a', 'b'][Number.parseInt(hex[16]!, 16) % 4]!;
  const value = hex.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export function resolveProfile(value = process.env.SEED_PROFILE): SeedProfile {
  const profile = value || 'demo';
  if (!['minimal', 'demo', 'volume'].includes(profile)) throw new Error(`Unsupported SEED_PROFILE: ${profile}`);
  return profile as SeedProfile;
}

export function assertSeedAllowed(profile: SeedProfile, env = process.env) {
  if (env.NODE_ENV === 'production') throw new Error(`Seed profile ${profile} is forbidden in production.`);
}

export function createSeedContext(db: PrismaClient, profile: SeedProfile, now = new Date()): SeedContext {
  const source = process.env.SEED_ANCHOR_DATE ? new Date(`${process.env.SEED_ANCHOR_DATE}T02:00:00.000Z`) : now;
  if (Number.isNaN(source.getTime())) throw new Error('SEED_ANCHOR_DATE must be YYYY-MM-DD.');
  const anchor = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate(), 2));
  return { db, profile, anchor, id: deterministicId, at: (days, hours = 0) => new Date(anchor.getTime() + (days * 24 + hours) * 3_600_000) };
}

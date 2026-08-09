import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

export const pilotPayloadChecksum = (value: unknown): string =>
  createHash('sha256').update(stableJson(value)).digest('hex');

export function encryptPilotPayload(value: unknown) {
  const encoded = process.env.MIGRATION_DELTA_KEY_BASE64?.trim();
  if (!encoded) throw new Error('MIGRATION_DELTA_KEY_BASE64_REQUIRED');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('INVALID_MIGRATION_DELTA_KEY_BASE64');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(stableJson(value), 'utf8'),
    cipher.final(),
  ]).toString('base64url');
  return {
    ciphertext,
    iv: iv.toString('base64url'),
    authTag: cipher.getAuthTag().toString('base64url'),
    keyVersion: process.env.MIGRATION_DELTA_KEY_VERSION?.trim() || 'v1',
  };
}

export function decryptPilotPayload<T>(payload: {
  ciphertext: string;
  iv: string;
  authTag: string;
}): T {
  const encoded = process.env.MIGRATION_DELTA_KEY_BASE64?.trim();
  if (!encoded) throw new Error('MIGRATION_DELTA_KEY_BASE64_REQUIRED');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('INVALID_MIGRATION_DELTA_KEY_BASE64');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64url'));
  const cleartext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(cleartext) as T;
}

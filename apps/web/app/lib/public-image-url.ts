/**
 * Resolves public media and studio/class hero images to a valid URL.
 * Supports:
 * 1. Absolute URLs (http/https)
 * 2. Static web public images (/images/public/...)
 * 3. Relative keys like "branches/green-garden.png" -> /images/public/branches/green-garden.png
 * 4. Object storage keys (MinIO production bucket) -> https://storage.dailydosepilates.com/dailydose/<key>
 */
export function resolvePublicImageUrl(
  imageKey?: string | null,
  fallback: string = '/images/public/studios/studio-reception.png',
): string {
  if (!imageKey || typeof imageKey !== 'string') {
    return fallback;
  }
  const trimmed = imageKey.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return fallback;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // If local static image asset
  if (
    trimmed.startsWith('branches/') ||
    trimmed.startsWith('classes/') ||
    trimmed.startsWith('studios/') ||
    trimmed.startsWith('landing/')
  ) {
    return `/images/public/${trimmed}`;
  }

  // Fallback to MinIO Object Storage
  const bucket =
    process.env.NEXT_PUBLIC_OBJECT_STORAGE_BUCKET ||
    process.env.OBJECT_STORAGE_BUCKET ||
    'dailydose-testing';
  const endpoint =
    process.env.NEXT_PUBLIC_OBJECT_STORAGE_ENDPOINT ||
    process.env.OBJECT_STORAGE_ENDPOINT ||
    'https://storage.dailydosepilates.com';
  const objectStorageBase =
    process.env.NEXT_PUBLIC_OBJECT_STORAGE_URL ||
    `${endpoint.replace(/\/+$/, '')}/${bucket.replace(/^\/+/, '')}`;
  return `${objectStorageBase.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`;
}

export const resolveImageUrl = resolvePublicImageUrl;

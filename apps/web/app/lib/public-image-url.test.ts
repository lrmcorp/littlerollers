import { describe, expect, it } from 'vitest';
import { resolvePublicImageUrl } from './public-image-url';

describe('resolvePublicImageUrl', () => {
  it('returns fallback for null, undefined, empty, or literal "null"', () => {
    expect(resolvePublicImageUrl(null)).toBe('/images/public/studios/studio-reception.png');
    expect(resolvePublicImageUrl(undefined)).toBe('/images/public/studios/studio-reception.png');
    expect(resolvePublicImageUrl('')).toBe('/images/public/studios/studio-reception.png');
    expect(resolvePublicImageUrl('null')).toBe('/images/public/studios/studio-reception.png');
    expect(resolvePublicImageUrl('   ')).toBe('/images/public/studios/studio-reception.png');
  });

  it('preserves absolute URLs', () => {
    expect(resolvePublicImageUrl('https://storage.dailydosepilates.com/dailydose/test.png')).toBe(
      'https://storage.dailydosepilates.com/dailydose/test.png',
    );
    expect(resolvePublicImageUrl('http://localhost:32120/test.png')).toBe(
      'http://localhost:32120/test.png',
    );
    expect(resolvePublicImageUrl('/custom/path.png')).toBe('/custom/path.png');
  });

  it('prefixes local static public images', () => {
    expect(resolvePublicImageUrl('branches/green-garden.png')).toBe(
      '/images/public/branches/green-garden.png',
    );
    expect(resolvePublicImageUrl('classes/reformer-pilates.png')).toBe(
      '/images/public/classes/reformer-pilates.png',
    );
    expect(resolvePublicImageUrl('studios/studio-reception.png')).toBe(
      '/images/public/studios/studio-reception.png',
    );
  });

  it('resolves MinIO object storage keys', () => {
    const bucket = process.env.OBJECT_STORAGE_BUCKET || 'dailydose-testing';
    expect(
      resolvePublicImageUrl(
        'SdQmwuNnsmEG7hYWOiKskJDkTe9WdO-metaV2hhdHNBcHAgSW1hZ2UgMjAyNi0wMi0xNiBhdCAxNC4yNi4zNyAoMSkuanBlZw==-.jpeg',
      ),
    ).toBe(
      `https://storage.dailydosepilates.com/${bucket}/SdQmwuNnsmEG7hYWOiKskJDkTe9WdO-metaV2hhdHNBcHAgSW1hZ2UgMjAyNi0wMi0xNiBhdCAxNC4yNi4zNyAoMSkuanBlZw==-.jpeg`,
    );
  });
});

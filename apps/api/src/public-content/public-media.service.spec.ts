import { PublicMediaService } from './public-media.service';

describe('PublicMediaService', () => {
  let service: PublicMediaService;

  beforeEach(() => {
    service = new PublicMediaService();
  });

  it('saves valid base64 image and allows retrieval', async () => {
    // 1x1 transparent PNG base64
    const validPngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await service.savePublicImage({
      filename: 'custom-banner.png',
      mimeType: 'image/png',
      contentBase64: validPngBase64,
    });

    expect(result.url).toMatch(/^\/api\/v1\/public-media\/media-.+\.png$/);
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(result.mimeType).toBe('image/png');

    // Retrieve
    const retrieved = await service.getPublicImage(result.filename);
    expect(retrieved.mimeType).toBe('image/png');
    expect(retrieved.buffer.length).toBe(result.sizeBytes);
  });

  it('rejects invalid mime types', async () => {
    await expect(
      service.savePublicImage({
        filename: 'script.js',
        mimeType: 'application/javascript',
        contentBase64: 'Y29uc29sZS5sb2coMSk7',
      }),
    ).rejects.toThrow();
  });
});

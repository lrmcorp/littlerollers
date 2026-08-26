import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verificationClient } from '@/api-clients/identity-verification-client';

describe('identity verification multipart client', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) }),
    );
  });

  it('sends real registration binaries without overriding the multipart boundary', async () => {
    const selfie = new File(['selfie'], 'selfie.png', { type: 'image/png' });
    const ktp = new File(['ktp'], 'ktp.jpg', { type: 'image/jpeg' });
    await verificationClient.register({
      displayName: 'Customer Test',
      phone: '08123456789',
      email: 'customer@example.test',
      password: 'secure-password',
      consent: true,
      selfie,
      ktp,
    });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get('selfie')).toBe(selfie);
    expect(new Headers(init?.headers).has('Content-Type')).toBe(false);
  });

  it('sends replacement binary and optimistic version as multipart fields', async () => {
    const replacement = new File(['replacement'], 'replacement.webp', { type: 'image/webp' });
    await verificationClient.replace('SELFIE', { file: replacement, expectedVersion: 4 });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const form = init?.body as FormData;
    expect(form.get('replacement')).toBe(replacement);
    expect(form.get('expectedVersion')).toBe('4');
    expect(new Headers(init?.headers).has('Content-Type')).toBe(false);
  });
});

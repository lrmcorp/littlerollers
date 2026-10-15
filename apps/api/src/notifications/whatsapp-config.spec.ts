import { resolveWhatsAppConfig } from './whatsapp-gateway.service';

describe('konfigurasi penyedia WhatsApp', () => {
  it('mengenali nama variabel yang tertulis di panduan produksi', () => {
    expect(
      resolveWhatsAppConfig({
        WHATSAPP_PROVIDER: 'official',
        WHATSAPP_ACCESS_TOKEN: 'token-meta',
        WHATSAPP_PHONE_NUMBER_ID: '123',
        WHATSAPP_API_VERSION: 'v22.0',
      } as never),
    ).toEqual({
      token: 'token-meta',
      phoneNumberId: '123',
      apiUrl: 'https://graph.facebook.com/v22.0',
    });
  });

  it('tetap menerima WHATSAPP_API_TOKEN lama', () => {
    expect(
      resolveWhatsAppConfig({ WHATSAPP_API_TOKEN: 'lama', WHATSAPP_PHONE_NUMBER_ID: '9' } as never)?.token,
    ).toBe('lama');
  });

  it('tetap mode uji bila belum lengkap atau dipaksa mock', () => {
    expect(resolveWhatsAppConfig({} as never)).toBeNull();
    expect(resolveWhatsAppConfig({ WHATSAPP_ACCESS_TOKEN: 'x' } as never)).toBeNull();
    expect(
      resolveWhatsAppConfig({
        WHATSAPP_PROVIDER: 'mock',
        WHATSAPP_ACCESS_TOKEN: 'x',
        WHATSAPP_PHONE_NUMBER_ID: '1',
      } as never),
    ).toBeNull();
  });
});

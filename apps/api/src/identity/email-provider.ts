import { Injectable } from '@nestjs/common';
import { configurationRequired } from './security';

export type PasswordEmailKind = 'ACTIVATION' | 'RESET' | 'SETUP';

const syntheticEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.AUTH_SYNTHETIC_ENABLED === 'true';

@Injectable()
export class ResendPasswordEmailProvider {
  assertConfigured(): { apiKey: string; from: string; baseUrl: string } | null {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    if (syntheticEnabled()) return null;
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.AUTH_EMAIL_FROM?.trim();
    const baseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
    if (!apiKey || !from || !baseUrl) return configurationRequired();
    const url = new URL(baseUrl);
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') configurationRequired();
    return { apiKey, from, baseUrl };
  }

  async send(kind: PasswordEmailKind, email: string, token: string): Promise<void> {
    const configuration = this.assertConfigured();
    if (!configuration) return;
    const { apiKey, from, baseUrl } = configuration;
    const url = new URL(kind === 'RESET' ? '/reset-password' : '/activate-account', baseUrl);
    url.searchParams.set('token', token);
    const subject =
      kind === 'RESET' ? 'Reset password Daily Dose Pilates' : 'Aktifkan akses Daily Dose Pilates';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html: `<p>Gunakan tautan berikut untuk melanjutkan:</p><p><a href="${url.toString()}">${url.toString()}</a></p><p>Tautan berlaku selama 15 menit dan hanya dapat digunakan sekali.</p>`,
      }),
    });
    if (!response.ok) configurationRequired();
  }
}

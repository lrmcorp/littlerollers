import { Injectable } from '@nestjs/common';
import { configurationRequired } from './security';
import { deterministicKey } from '@dailydose/notification-core';
import { EmailNotificationService } from '../email/email-notification.service';

export type PasswordEmailKind = 'ACTIVATION' | 'RESET' | 'SETUP';

const syntheticEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.AUTH_SYNTHETIC_ENABLED === 'true';

@Injectable()
export class QueuedPasswordEmailProvider {
  constructor(private readonly emailNotifications?: EmailNotificationService) {}

  assertConfigured(): { baseUrl: string } | null {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    if (syntheticEnabled()) return null;
    const baseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
    if (!baseUrl || !this.emailNotifications) return configurationRequired();
    const url = new URL(baseUrl);
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') configurationRequired();
    return { baseUrl };
  }

  async send(kind: PasswordEmailKind, email: string, token: string): Promise<void> {
    const configuration = this.assertConfigured();
    if (!configuration) return;
    const { baseUrl } = configuration;
    const url = new URL(kind === 'RESET' ? '/reset-password' : '/activate-account', baseUrl);
    url.searchParams.set('token', token);
    const templateKey =
      kind === 'RESET'
        ? 'AUTH_PASSWORD_RESET_V1'
        : kind === 'SETUP'
          ? 'AUTH_PASSWORD_SETUP_V1'
          : 'AUTH_ACCOUNT_ACTIVATION_V1';
    await this.emailNotifications!.enqueue({
      eventType: `auth.password.${kind.toLowerCase()}.v1`,
      templateKey,
      recipient: email,
      variables: {
        href: url.toString(),
        detail: 'Tautan berlaku selama 15 menit dan hanya dapat digunakan sekali.',
      },
      correlationId: `auth-email:${deterministicKey(kind, email, token).slice(0, 24)}`,
      occurrenceParts: [kind, email, token],
      expiresAt: new Date(Date.now() + 15 * 60_000),
    });
  }
}

// Compatibility export for older tests/consumers. Delivery selection now belongs to EmailDeliveryWorker.
export { QueuedPasswordEmailProvider as ResendPasswordEmailProvider };

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const EMAIL_TEMPLATE_KEYS = [
  'AUTH_ACCOUNT_ACTIVATION_V1',
  'AUTH_PASSWORD_SETUP_V1',
  'AUTH_PASSWORD_RESET_V1',
  'ORDER_CREATED_V1',
  'ORDER_ACTION_REQUIRED_V1',
  'ORDER_APPROVED_V1',
  'ORDER_REJECTED_V1',
  'BOOKING_CONFIRMED_V1',
  'BOOKING_CANCELLED_V1',
  'RESCHEDULE_APPROVED_V1',
  'RESCHEDULE_REJECTED_V1',
  'CLASS_CANCELLED_V1',
  'IDENTITY_APPROVED_V1',
  'IDENTITY_ACTION_REQUIRED_V1',
  'SESSION_ADJUSTMENT_POSTED_V1',
  'SESSION_ADJUSTMENT_REJECTED_V1',
  'PACKAGE_LOW_BALANCE_V1',
  'PACKAGE_EXPIRY_REMINDER_V1',
  'AUDIT_EXPORT_READY_V1',
  'OPERATIONS_JOB_FAILED_V1',
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export interface EmailEnvelope {
  to: string;
  variables: Record<string, string>;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

// Parent-facing templates are in English like the customer site. Staff-only
// templates (audit export, operations) stay in Indonesian like the admin panel.
const templateCopy: Record<EmailTemplateKey, { subject: string; intro: string; action?: string }> =
  {
    AUTH_ACCOUNT_ACTIVATION_V1: {
      subject: 'Activate your Little Rollers account',
      intro: 'Your Little Rollers account is ready. Activate it to start booking sessions.',
      action: 'Activate account',
    },
    AUTH_PASSWORD_SETUP_V1: {
      subject: 'Set your Little Rollers password',
      intro: 'You have been invited to set a password for your Little Rollers account.',
      action: 'Set password',
    },
    AUTH_PASSWORD_RESET_V1: {
      subject: 'Reset your Little Rollers password',
      intro: 'We received a request to reset the password on your account.',
      action: 'Reset password',
    },
    ORDER_CREATED_V1: {
      subject: 'Your Little Rollers order is placed',
      intro: 'Your order is placed. Please finish the payment before the deadline.',
      action: 'View order',
    },
    ORDER_ACTION_REQUIRED_V1: {
      subject: 'Your payment needs a fix',
      intro: 'We could not accept your proof of payment yet. Please check your order.',
      action: 'Check order',
    },
    ORDER_APPROVED_V1: {
      subject: 'Payment approved, your package is active',
      intro: 'Your payment is approved. The package is active and ready to book.',
      action: 'View package',
    },
    ORDER_REJECTED_V1: {
      subject: 'About your payment',
      intro: 'We could not approve your payment. Open the order to see why.',
      action: 'View order',
    },
    BOOKING_CONFIRMED_V1: {
      subject: 'Little Rollers session booked',
      intro: 'A new session has been added to your bookings.',
      action: 'View booking',
    },
    BOOKING_CANCELLED_V1: {
      subject: 'Little Rollers booking cancelled',
      intro: 'Your booking is cancelled and the place has been released.',
      action: 'View booking',
    },
    RESCHEDULE_APPROVED_V1: {
      subject: 'Reschedule approved',
      intro: 'Your booking has moved to the new session.',
      action: 'View booking',
    },
    RESCHEDULE_REJECTED_V1: {
      subject: 'Reschedule not approved',
      intro: 'We could not approve your request to change the session.',
      action: 'View booking',
    },
    CLASS_CANCELLED_V1: {
      subject: 'A Little Rollers session was cancelled',
      intro: 'One of the sessions you booked has been cancelled.',
      action: 'View booking',
    },
    IDENTITY_APPROVED_V1: {
      subject: 'Identity documents approved',
      intro: 'Your identity documents are approved.',
      action: 'View verification',
    },
    IDENTITY_ACTION_REQUIRED_V1: {
      subject: 'Identity documents need a fix',
      intro: 'Your identity documents need another look before we can approve them.',
      action: 'Check verification',
    },
    SESSION_ADJUSTMENT_POSTED_V1: {
      subject: 'Session balance updated',
      intro: 'A change to your session balance has been recorded.',
      action: 'View package',
    },
    SESSION_ADJUSTMENT_REJECTED_V1: {
      subject: 'Session adjustment not approved',
      intro: 'The requested change to your session balance was not approved.',
      action: 'View history',
    },
    PACKAGE_LOW_BALANCE_V1: {
      subject: 'Your package is running low',
      intro: 'Only a few sessions are left on your package.',
      action: 'View package',
    },
    PACKAGE_EXPIRY_REMINDER_V1: {
      subject: 'Your Little Rollers package expires soon',
      intro: 'Your package is about to expire.',
      action: 'View package',
    },
    AUDIT_EXPORT_READY_V1: {
      subject: 'Export audit telah siap',
      intro:
        'Export audit yang Anda minta telah siap. Gunakan halaman audit untuk membuat tautan unduhan berotorisasi.',
      action: 'Buka audit',
    },
    OPERATIONS_JOB_FAILED_V1: {
      subject: 'Peringatan operasional Little Rollers',
      intro: 'Satu job operasional membutuhkan pemeriksaan atau recovery.',
      action: 'Buka operasi',
    },
  };

export function renderEmail(
  templateKey: EmailTemplateKey,
  variables: Record<string, string>,
): RenderedEmail {
  const copy = templateCopy[templateKey];
  if (!copy) throw new Error('EMAIL_TEMPLATE_UNSUPPORTED');
  const href = variables.href?.trim();
  if (href && !href.startsWith('https://')) throw new Error('EMAIL_TEMPLATE_INVALID_HREF');
  const detail = variables.detail?.trim();
  const text = [copy.intro, detail, href ? `${copy.action ?? 'Open'}: ${href}` : undefined]
    .filter(Boolean)
    .join('\n\n');
  const html = [
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#073228">',
    `<p>${escapeHtml(copy.intro)}</p>`,
    detail ? `<p>${escapeHtml(detail)}</p>` : '',
    href
      ? `<p><a href="${escapeHtml(href)}" style="display:inline-block;padding:10px 16px;background:#073228;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(copy.action ?? 'Open')}</a></p>`
      : '',
    '<p style="font-size:12px;color:#6b7280">Automatic message from Little Rollers Kids Movement Club. Please do not reply to this email.</p>',
    '</div>',
  ].join('');
  return { subject: copy.subject, html, text };
}

const keyFrom = (encoded: string): Buffer => {
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('NOTIFICATION_ENCRYPTION_KEY_INVALID');
  return key;
};

export function encryptEnvelope(envelope: EmailEnvelope, encodedKey: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(encodedKey), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(envelope), 'utf8'),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decryptEnvelope(value: string, encodedKey: string): EmailEnvelope {
  const parts = value.split('.');
  if (parts.length !== 3) throw new Error('EMAIL_ENVELOPE_INVALID');
  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', keyFrom(encodedKey), iv!);
  decipher.setAuthTag(tag!);
  const parsed = JSON.parse(
    Buffer.concat([decipher.update(ciphertext!), decipher.final()]).toString('utf8'),
  ) as EmailEnvelope;
  if (!parsed.to || !parsed.variables || typeof parsed.variables !== 'object')
    throw new Error('EMAIL_ENVELOPE_INVALID');
  return parsed;
}

export const hashEmail = (email: string) =>
  createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

export const maskEmail = (email: string) => {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!local || !domain) return '***';
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`;
};

export const deterministicKey = (...parts: Array<string | number | null | undefined>) =>
  createHash('sha256')
    .update(parts.map((part) => String(part ?? '')).join(':'))
    .digest('hex');

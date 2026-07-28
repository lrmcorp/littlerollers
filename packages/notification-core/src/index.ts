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

const templateCopy: Record<EmailTemplateKey, { subject: string; intro: string; action?: string }> =
  {
    AUTH_ACCOUNT_ACTIVATION_V1: {
      subject: 'Aktifkan akun Daily Dose Pilates',
      intro: 'Akun Daily Dose Pilates Anda siap diaktifkan.',
      action: 'Aktifkan akun',
    },
    AUTH_PASSWORD_SETUP_V1: {
      subject: 'Atur password Daily Dose Pilates',
      intro: 'Anda diundang untuk mengatur password akun Daily Dose Pilates.',
      action: 'Atur password',
    },
    AUTH_PASSWORD_RESET_V1: {
      subject: 'Reset password Daily Dose Pilates',
      intro: 'Kami menerima permintaan reset password untuk akun Anda.',
      action: 'Reset password',
    },
    ORDER_CREATED_V1: {
      subject: 'Pesanan Daily Dose Pilates telah dibuat',
      intro: 'Pesanan Anda telah dibuat. Selesaikan pembayaran sebelum batas waktunya.',
      action: 'Lihat pesanan',
    },
    ORDER_ACTION_REQUIRED_V1: {
      subject: 'Pembayaran perlu diperbaiki',
      intro: 'Bukti pembayaran Anda memerlukan tindakan lebih lanjut.',
      action: 'Periksa pesanan',
    },
    ORDER_APPROVED_V1: {
      subject: 'Pembayaran disetujui dan paket aktif',
      intro: 'Pembayaran Anda telah disetujui. Paket sudah aktif dan siap digunakan.',
      action: 'Lihat paket',
    },
    ORDER_REJECTED_V1: {
      subject: 'Hasil pemeriksaan pembayaran',
      intro: 'Pembayaran Anda belum dapat disetujui. Buka pesanan untuk melihat hasil pemeriksaan.',
      action: 'Lihat pesanan',
    },
    BOOKING_CONFIRMED_V1: {
      subject: 'Booking Daily Dose Pilates berhasil',
      intro: 'Jadwal baru telah ditambahkan ke booking Anda.',
      action: 'Lihat booking',
    },
    RESCHEDULE_APPROVED_V1: {
      subject: 'Reschedule booking disetujui',
      intro: 'Booking Anda telah dipindahkan ke jadwal baru.',
      action: 'Lihat booking',
    },
    RESCHEDULE_REJECTED_V1: {
      subject: 'Reschedule booking belum disetujui',
      intro: 'Permintaan perubahan jadwal Anda belum dapat disetujui.',
      action: 'Lihat booking',
    },
    CLASS_CANCELLED_V1: {
      subject: 'Kelas Daily Dose Pilates dibatalkan',
      intro: 'Salah satu kelas pada jadwal Anda telah dibatalkan.',
      action: 'Lihat booking',
    },
    IDENTITY_APPROVED_V1: {
      subject: 'Dokumen identitas disetujui',
      intro: 'Dokumen identitas Anda telah disetujui.',
      action: 'Lihat verifikasi',
    },
    IDENTITY_ACTION_REQUIRED_V1: {
      subject: 'Dokumen identitas perlu diperbaiki',
      intro: 'Dokumen identitas Anda memerlukan tindakan lebih lanjut.',
      action: 'Periksa verifikasi',
    },
    SESSION_ADJUSTMENT_POSTED_V1: {
      subject: 'Saldo sesi diperbarui',
      intro: 'Perubahan saldo sesi telah diposting ke ledger Anda.',
      action: 'Lihat paket',
    },
    SESSION_ADJUSTMENT_REJECTED_V1: {
      subject: 'Adjustment sesi ditolak',
      intro: 'Permintaan perubahan saldo sesi belum dapat disetujui.',
      action: 'Lihat ledger',
    },
    PACKAGE_LOW_BALANCE_V1: {
      subject: 'Sisa sesi paket Anda perlu diperhatikan',
      intro: 'Sisa sesi tersedia pada paket Anda telah mencapai batas pengingat.',
      action: 'Lihat paket',
    },
    PACKAGE_EXPIRY_REMINDER_V1: {
      subject: 'Paket Daily Dose Pilates akan berakhir',
      intro: 'Masa berlaku paket Anda akan segera berakhir.',
      action: 'Lihat paket',
    },
    AUDIT_EXPORT_READY_V1: {
      subject: 'Export audit telah siap',
      intro:
        'Export audit yang Anda minta telah siap. Gunakan halaman audit untuk membuat tautan unduhan berotorisasi.',
      action: 'Buka audit',
    },
    OPERATIONS_JOB_FAILED_V1: {
      subject: 'Peringatan operasional Daily Dose Pilates',
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
  const text = [copy.intro, detail, href ? `${copy.action ?? 'Buka'}: ${href}` : undefined]
    .filter(Boolean)
    .join('\n\n');
  const html = [
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">',
    `<p>${escapeHtml(copy.intro)}</p>`,
    detail ? `<p>${escapeHtml(detail)}</p>` : '',
    href
      ? `<p><a href="${escapeHtml(href)}" style="display:inline-block;padding:10px 16px;background:#1f2937;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(copy.action ?? 'Buka')}</a></p>`
      : '',
    '<p style="font-size:12px;color:#6b7280">Pesan otomatis dari Daily Dose Pilates. Jangan membalas email ini.</p>',
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

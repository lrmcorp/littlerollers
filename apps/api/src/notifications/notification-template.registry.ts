import { HttpStatus } from '@nestjs/common';
import { defaultEmailCopy, type EmailTemplateKey } from '@dailydose/notification-core';
import { ApiProblem } from '../identity/security';

export const WHATSAPP_CHANNEL = 'WHATSAPP';
export const EMAIL_CHANNEL = 'EMAIL';
export const MAX_TEMPLATE_BODY = 1000;
export const MAX_EMAIL_SUBJECT = 200;
export const MAX_EMAIL_INTRO = 800;

export interface TemplateDefinition {
  label: string;
  eventType: string;
  description: string;
  variables: readonly string[];
  /** Teks bawaan; dipakai pengirim bila belum ada versi terbit. */
  defaultBody: string;
}

const EXPIRY_VARIABLES = ['nama', 'paket', 'berlaku_sampai', 'sisa_sesi'] as const;

/** Satu-satunya template yang benar-benar dikirim sistem saat ini (pengingat WhatsApp pelanggan). */
export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  WA_REMINDER_EXPIRY_H7: {
    label: 'Pengingat masa berlaku H-7',
    eventType: 'reminder.expiry.h7',
    description: 'Dikirim ke pelanggan 7 hari sebelum paket berakhir.',
    variables: EXPIRY_VARIABLES,
    defaultBody:
      'Halo {{nama}},\n\n' +
      'Pengingat ramah: Masa berlaku *{{paket}}* Anda tersisa *7 hari lagi* (*{{berlaku_sampai}}*) ' +
      'dengan sisa *{{sisa_sesi}} sesi*.\n\n' +
      'Pesan jadwal kelas Pilates Anda sekarang agar sesi tidak kedaluwarsa.\n\n' +
      '_Daily Dose Pilates_',
  },
  WA_REMINDER_EXPIRY_H3: {
    label: 'Pengingat masa berlaku H-3',
    eventType: 'reminder.expiry.h3',
    description: 'Dikirim ke pelanggan 3 hari sebelum paket berakhir.',
    variables: EXPIRY_VARIABLES,
    defaultBody:
      'Halo {{nama}},\n\n' +
      'Masa berlaku *{{paket}}* Anda tersisa *3 hari lagi* (*{{berlaku_sampai}}*) ' +
      'dengan sisa *{{sisa_sesi}} sesi*.\n\n' +
      'Yuk manfaatkan sisa sesi Anda untuk berolahraga bersama instruktur Daily Dose Pilates.\n\n' +
      '_Daily Dose Pilates_',
  },
  WA_REMINDER_EXPIRY_H1: {
    label: 'Pengingat masa berlaku H-1',
    eventType: 'reminder.expiry.h1',
    description: 'Dikirim ke pelanggan sehari sebelum paket berakhir.',
    variables: EXPIRY_VARIABLES,
    defaultBody:
      'Halo {{nama}},\n\n' +
      'Masa berlaku *{{paket}}* Anda akan berakhir *BESOK* (*{{berlaku_sampai}}*) ' +
      'dengan sisa *{{sisa_sesi}} sesi*.\n\n' +
      'Jangan sampai sesi Anda hangus! Segera reservasi jadwal kelas Pilates favorit Anda hari ini.\n\n' +
      '_Daily Dose Pilates_',
  },
  WA_REMINDER_EXPIRED_RENEWAL: {
    label: 'Ajakan perpanjang setelah paket berakhir',
    eventType: 'reminder.expired.renewal',
    description: 'Dikirim tiap 3 hari (maks. 5 kali) ke pelanggan yang paketnya sudah berakhir.',
    variables: ['nama', 'tautan_paket'],
    defaultBody:
      'Halo {{nama}},\n\n' +
      'Paket Pilates Anda di Daily Dose telah berakhir. Tetap jaga kebugaran dan rutinitas sehat Anda!\n\n' +
      'Dapatkan penawaran paket terbaru kami melalui tautan berikut:\n' +
      '{{tautan_paket}}\n\n' +
      'Atau balas pesan ini untuk terhubung langsung dengan tim kami.\n' +
      '_Daily Dose Pilates_',
  },
};

export const SAMPLE_VALUES: Record<string, string> = {
  nama: 'Maya',
  paket: 'Paket 8 Sesi',
  berlaku_sampai: '30 September 2026',
  sisa_sesi: '3',
  tautan_paket: 'https://dailydosepilates.com/packages',
};

/** `href`/`detail` yang dipakai pratinjau email; sama dengan yang benar-benar dikirim pemanggil nyata. */
export const EMAIL_SAMPLE_VARIABLES: Record<string, string> = {
  href: 'https://dailydosepilates.com/preview',
  detail: 'Contoh keterangan tambahan yang menyertai email ini.',
};

export interface EmailTemplateDefinition {
  label: string;
  eventType: string;
  description: string;
}

/**
 * Enam email yang benar-benar terkirim sistem saat ini (lihat `identity/email-provider.ts` dan
 * `packages/verifikasi-pembayaran.service.ts`). Subjek dan paragraf pembuka bisa diedit staf; tombol
 * aksi dan tautannya tetap dirender terstruktur oleh `renderEmail` dan tidak bisa dihapus/diubah.
 */
export const EMAIL_TEMPLATE_REGISTRY: Partial<Record<EmailTemplateKey, EmailTemplateDefinition>> = {
  AUTH_ACCOUNT_ACTIVATION_V1: {
    label: 'Aktivasi akun',
    eventType: 'auth.password.activation.v1',
    description: 'Dikirim saat staf mengundang pengguna baru mengaktifkan akun dengan password.',
  },
  AUTH_PASSWORD_SETUP_V1: {
    label: 'Atur password awal',
    eventType: 'auth.password.setup.v1',
    description: 'Dikirim saat pengguna perlu mengatur password pertama kalinya.',
  },
  AUTH_PASSWORD_RESET_V1: {
    label: 'Reset password',
    eventType: 'auth.password.reset.v1',
    description: 'Dikirim saat pengguna meminta reset password lewat halaman masuk.',
  },
  ORDER_APPROVED_V1: {
    label: 'Pembayaran disetujui',
    eventType: 'purchase.approved.v1',
    description: 'Dikirim ke pelanggan saat penyetuju menyetujui pembayaran paketnya.',
  },
  ORDER_ACTION_REQUIRED_V1: {
    label: 'Pembayaran perlu tindakan',
    eventType: 'purchase.action-required.v1',
    description: 'Dikirim saat bukti pembayaran ditolak dan pelanggan diminta mengunggah ulang.',
  },
  ORDER_REJECTED_V1: {
    label: 'Pembayaran ditolak',
    eventType: 'purchase.rejected.v1',
    description: 'Dikirim saat pembayaran ditolak tanpa jalur perbaikan (mis. duplikat).',
  },
};

const invalidEmail = (field: string, issue: string) =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);

/** Subjek dan paragraf pembuka email; berbeda dari body WhatsApp — teks statis tanpa `{{variabel}}`. */
export function validateEmailTemplateCopy(
  templateKey: string,
  input: unknown,
): { subject: string; intro: string } {
  if (!EMAIL_TEMPLATE_REGISTRY[templateKey as EmailTemplateKey])
    throw invalidEmail('templateKey', 'UNSUPPORTED_TEMPLATE');
  if (!input || typeof input !== 'object') throw invalidEmail('subject', 'REQUIRED');
  const { subject, intro } = input as Record<string, unknown>;
  if (typeof subject !== 'string' || typeof intro !== 'string')
    throw invalidEmail(typeof subject !== 'string' ? 'subject' : 'intro', 'REQUIRED');
  const cleanSubject = subject.replace(/\s+/gu, ' ').trim();
  const cleanIntro = intro.replace(/\r\n/gu, '\n').trim();
  if (cleanSubject.length === 0) throw invalidEmail('subject', 'REQUIRED');
  if (cleanIntro.length === 0) throw invalidEmail('intro', 'REQUIRED');
  if (cleanSubject.length > MAX_EMAIL_SUBJECT) throw invalidEmail('subject', 'TOO_LONG');
  if (cleanIntro.length > MAX_EMAIL_INTRO) throw invalidEmail('intro', 'TOO_LONG');
  return { subject: cleanSubject, intro: cleanIntro };
}

export function defaultEmailTemplateCopy(templateKey: string) {
  if (!EMAIL_TEMPLATE_REGISTRY[templateKey as EmailTemplateKey])
    throw invalidEmail('templateKey', 'UNSUPPORTED_TEMPLATE');
  return defaultEmailCopy(templateKey as EmailTemplateKey);
}

const PLACEHOLDER = /\{\{\s*([a-z_]+)\s*\}\}/gu;

const invalid = (issue: string, field = 'body') =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);

/** Pastikan isi template aman: panjang wajar, hanya variabel yang dikenal, tanpa kurung ganda yatim. */
export function validateTemplateBody(templateKey: string, body: unknown): string {
  const definition = TEMPLATE_REGISTRY[templateKey];
  if (!definition) throw invalid('UNSUPPORTED_TEMPLATE', 'templateKey');
  if (typeof body !== 'string') throw invalid('REQUIRED');
  const text = body.replace(/\r\n/gu, '\n').trim();
  if (text.length === 0) throw invalid('REQUIRED');
  if (text.length > MAX_TEMPLATE_BODY) throw invalid('TOO_LONG');
  for (const match of text.matchAll(PLACEHOLDER))
    if (!definition.variables.includes(match[1]!)) throw invalid(`UNKNOWN_VARIABLE:${match[1]}`);
  if (text.replace(PLACEHOLDER, '').match(/\{\{|\}\}/u)) throw invalid('MALFORMED_PLACEHOLDER');
  return text;
}

/** Ganti `{{variabel}}`; variabel yang tidak diberikan menjadi kosong dan nilai tidak dievaluasi ulang. */
export function renderTemplate(body: string, values: Record<string, string | number | undefined>) {
  return body.replace(PLACEHOLDER, (_match, name: string) => String(values[name] ?? ''));
}

export function defaultText(templateKey: string, values: Record<string, string | number | undefined>) {
  return renderTemplate(TEMPLATE_REGISTRY[templateKey]!.defaultBody, values);
}

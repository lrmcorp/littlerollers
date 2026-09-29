import { Injectable } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { RuntimeConfigService } from '../configuration/runtime-config.service';

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Kegagalan kirim yang sudah disaring: `code` aman ditampilkan/disimpan (tanpa pesan mentah server,
 * alamat, atau kredensial) dan `retryable` menentukan apakah masih layak dicoba lagi.
 */
export class EmailDeliveryError extends Error {
  constructor(
    readonly code: string,
    readonly retryable: boolean,
  ) {
    super(code);
  }
}

/** Titik masuk pengiriman; tes memakai pengganti sehingga tidak ada jaringan yang tersentuh. */
export abstract class EmailSender {
  abstract send(message: OutgoingEmail): Promise<void>;
}

const NETWORK_CODES = new Set([
  'ETIMEDOUT',
  'ECONNECTION',
  'ECONNREFUSED',
  'ECONNRESET',
  'ESOCKET',
  'EDNS',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

/** Ubah galat nodemailer menjadi kode aman + keputusan retry. */
export function classifySmtpError(error: unknown): EmailDeliveryError {
  const failure = error as { code?: string; responseCode?: number };
  if (failure?.code === 'EAUTH') return new EmailDeliveryError('SMTP_AUTH_FAILED', false);
  if (failure?.code === 'EENVELOPE') return new EmailDeliveryError('SMTP_RECIPIENT_REJECTED', false);
  if (failure?.code && NETWORK_CODES.has(failure.code))
    return new EmailDeliveryError('SMTP_UNREACHABLE', true);
  const response = failure?.responseCode;
  if (typeof response === 'number') {
    if (response >= 500) return new EmailDeliveryError('SMTP_REJECTED', false);
    if (response >= 400) return new EmailDeliveryError('SMTP_TEMPORARY_FAILURE', true);
  }
  return new EmailDeliveryError('SMTP_ERROR', true);
}

@Injectable()
export class SmtpEmailSender extends EmailSender {
  private transport?: Transporter;

  constructor(private readonly config: RuntimeConfigService) {
    super();
  }

  private transporter(): Transporter {
    const email = this.config.value.email;
    if (email.driver !== 'smtp') throw new EmailDeliveryError('EMAIL_DRIVER_UNSUPPORTED', false);
    if (!email.smtpHost || !email.smtpUser || !email.smtpPassword || !email.fromEmail)
      throw new EmailDeliveryError('EMAIL_NOT_CONFIGURED', false);
    this.transport ??= createTransport({
      host: email.smtpHost,
      port: email.smtpPort,
      secure: email.smtpSecure,
      auth: { user: email.smtpUser, pass: email.smtpPassword },
      connectionTimeout: email.connectionTimeoutMs,
      greetingTimeout: email.connectionTimeoutMs,
      socketTimeout: email.connectionTimeoutMs * 2,
    });
    return this.transport;
  }

  async send(message: OutgoingEmail): Promise<void> {
    const email = this.config.value.email;
    const transporter = this.transporter();
    try {
      await transporter.sendMail({
        from: { name: email.fromName, address: email.fromEmail! },
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      throw classifySmtpError(error);
    }
  }
}

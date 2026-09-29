import { classifySmtpError, EmailDeliveryError, SmtpEmailSender } from './email-sender';

const baseConfig = {
  value: {
    email: {
      driver: 'smtp' as const,
      smtpHost: 'smtp.example.test',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: 'user',
      smtpPassword: 'pass',
      fromName: 'Daily Dose Pilates',
      fromEmail: 'noreply@example.test',
      connectionTimeoutMs: 15_000,
    },
  },
};

describe('classifySmtpError', () => {
  it('marks auth and envelope (bad recipient) failures as terminal', () => {
    expect(classifySmtpError({ code: 'EAUTH' })).toMatchObject({ code: 'SMTP_AUTH_FAILED', retryable: false });
    expect(classifySmtpError({ code: 'EENVELOPE' })).toMatchObject({
      code: 'SMTP_RECIPIENT_REJECTED',
      retryable: false,
    });
  });

  it('marks network failures and 4xx SMTP responses as retryable', () => {
    expect(classifySmtpError({ code: 'ETIMEDOUT' })).toMatchObject({ code: 'SMTP_UNREACHABLE', retryable: true });
    expect(classifySmtpError({ code: 'ECONNREFUSED' })).toMatchObject({ retryable: true });
    expect(classifySmtpError({ responseCode: 450 })).toMatchObject({
      code: 'SMTP_TEMPORARY_FAILURE',
      retryable: true,
    });
  });

  it('marks 5xx SMTP responses as terminal, and anything unrecognized as retryable', () => {
    expect(classifySmtpError({ responseCode: 550 })).toMatchObject({ code: 'SMTP_REJECTED', retryable: false });
    expect(classifySmtpError(new Error('boom'))).toMatchObject({ code: 'SMTP_ERROR', retryable: true });
  });

  it('never repeats the raw server message or credentials in the safe code', () => {
    const failure = classifySmtpError({ responseCode: 550, message: 'user pass user@x smtp.example.test' });
    expect(failure.code).not.toMatch(/pass|smtp\.example\.test/);
  });
});

describe('SmtpEmailSender', () => {
  it('refuses to send when SMTP is not fully configured, without importing nodemailer state', async () => {
    const sender = new SmtpEmailSender({
      value: { email: { ...baseConfig.value.email, smtpPassword: null } },
    } as never);
    await expect(
      sender.send({ to: 'a@b.test', subject: 's', text: 't', html: '<p>t</p>' }),
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_CONFIGURED' });
  });

  it('refuses a driver other than smtp instead of silently doing nothing', async () => {
    const sender = new SmtpEmailSender({
      value: { email: { ...baseConfig.value.email, driver: 'resend' } },
    } as never);
    await expect(
      sender.send({ to: 'a@b.test', subject: 's', text: 't', html: '<p>t</p>' }),
    ).rejects.toMatchObject({ code: 'EMAIL_DRIVER_UNSUPPORTED' });
  });

  it('is an EmailDeliveryError instance so callers can branch on retryable without knowing SMTP internals', () => {
    const failure = classifySmtpError({ code: 'EAUTH' });
    expect(failure).toBeInstanceOf(EmailDeliveryError);
  });
});

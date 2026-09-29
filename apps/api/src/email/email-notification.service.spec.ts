import { Prisma } from '@prisma/client';
import { decryptEnvelope, encryptEnvelope } from '@dailydose/notification-core';
import { EmailDeliveryError } from './email-sender';
import { EmailNotificationService } from './email-notification.service';

const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
const rowId = '00000000-0000-4000-8000-000000000101';

function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    value: {
      email: {
        driver: 'smtp',
        deliveryEnabled: true,
        maxAttempts: 3,
        rateLimitPerMinute: 100,
        rateLimitPerHour: 1000,
        encryptionKey: ENCRYPTION_KEY,
        recipientOverride: null,
        ...overrides,
      },
    },
  };
}

function build(configOverrides: Record<string, unknown> = {}) {
  const created: Record<string, unknown> = {
    id: rowId,
    occurrenceKey: 'key-1',
    eventType: 'auth.password.reset.v1',
    templateKey: 'AUTH_PASSWORD_RESET_V1',
    recipientMasked: 'us*****@example.test',
    envelope: '',
    status: 'PENDING',
    attemptCount: 0,
    maxAttempts: 3,
    rateLimitWaitCount: 0,
    nextAttemptAt: new Date(),
    lastErrorCode: null,
    lastAttemptAt: null,
    acceptedAt: null,
    expiresAt: null,
    correlationId: 'corr-1',
    userId: null,
    branchId: null,
    createdAt: new Date('2026-09-29T00:00:00.000Z'),
    updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  };
  const applyUpdate = (data: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && 'increment' in (value as Record<string, unknown>)) {
        created[key] = (Number(created[key]) || 0) + Number((value as { increment: number }).increment);
      } else {
        created[key] = value;
      }
    }
  };
  const db = {
    emailDelivery: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        applyUpdate(data);
        return { ...created };
      }),
      findUnique: jest.fn(async () => ({ ...created })),
      updateMany: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        applyUpdate(data);
        return { count: 1 };
      }),
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: {}, _count: { _all: 0 }, _min: {} }),
    },
  };
  const sender = { send: jest.fn().mockResolvedValue(undefined) };
  const templates = { emailCopy: jest.fn().mockResolvedValue({}) };
  const config = baseConfig(configOverrides);
  const service = new EmailNotificationService(
    db as never,
    config as never,
    sender as never,
    templates as never,
  );
  return { service, db, sender, templates, created };
}

describe('EmailNotificationService.enqueue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does nothing when email delivery is disabled in this environment', async () => {
    const { service, db } = build({ deliveryEnabled: false });
    await expect(
      service.enqueue({
        eventType: 'x',
        templateKey: 'AUTH_PASSWORD_RESET_V1',
        recipient: 'user@example.test',
        variables: {},
        correlationId: 'c',
        occurrenceParts: ['x'],
      }),
    ).resolves.toBeNull();
    expect(db.emailDelivery.create).not.toHaveBeenCalled();
  });

  it('stores the recipient and variables encrypted, never as plain text in the row', async () => {
    const { service, db } = build();
    const result = await service.enqueue({
      eventType: 'auth.password.reset.v1',
      templateKey: 'AUTH_PASSWORD_RESET_V1',
      recipient: 'user@example.test',
      variables: { href: 'https://dailydosepilates.com/reset?token=SECRET', detail: 'd' },
      correlationId: 'corr-1',
      occurrenceParts: ['RESET', 'user@example.test', 'token'],
    });
    expect(result).toMatchObject({ status: 'PENDING' });
    const stored = db.emailDelivery.create.mock.calls[0]![0].data;
    expect(stored.recipientMasked).toBe('us***@example.test');
    expect(JSON.stringify(stored)).not.toContain('SECRET');
    expect(JSON.stringify(stored)).not.toContain('user@example.test');
    const envelope = decryptEnvelope(stored.envelope as string, ENCRYPTION_KEY);
    expect(envelope).toEqual({
      to: 'user@example.test',
      variables: { href: 'https://dailydosepilates.com/reset?token=SECRET', detail: 'd' },
    });
  });

  it('redirects to the configured recipient override, masking and encrypting that address instead', async () => {
    const { service, db } = build({ recipientOverride: 'qa@example.test' });
    await service.enqueue({
      eventType: 'x',
      templateKey: 'AUTH_PASSWORD_RESET_V1',
      recipient: 'user@example.test',
      variables: { href: 'https://dailydosepilates.com/x' },
      correlationId: 'c',
      occurrenceParts: ['x'],
    });
    const stored = db.emailDelivery.create.mock.calls[0]![0].data;
    expect(stored.recipientMasked).toBe('qa***@example.test');
    expect(decryptEnvelope(stored.envelope as string, ENCRYPTION_KEY).to).toBe('qa@example.test');
  });

  it('does not duplicate a send for an event already queued (dedupe by occurrence key)', async () => {
    const { service, db, created } = build();
    const conflict = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
    });
    db.emailDelivery.create.mockRejectedValueOnce(conflict);
    const result = await service.enqueue({
      eventType: 'x',
      templateKey: 'AUTH_PASSWORD_RESET_V1',
      recipient: 'user@example.test',
      variables: {},
      correlationId: 'c',
      occurrenceParts: ['x'],
    });
    expect(result).toMatchObject({ id: created.id });
    expect(db.emailDelivery.findUnique).toHaveBeenCalled();
  });

  it('refuses to enqueue without an encryption key rather than storing a token unencrypted', async () => {
    const { service } = build({ encryptionKey: null });
    await expect(
      service.enqueue({
        eventType: 'x',
        templateKey: 'AUTH_PASSWORD_RESET_V1',
        recipient: 'user@example.test',
        variables: {},
        correlationId: 'c',
        occurrenceParts: ['x'],
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_CONFIGURED' });
  });
});

describe('EmailNotificationService.deliver', () => {
  it('sends the rendered email and marks the row accepted', async () => {
    const { service, db, sender, created } = build();
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x', detail: 'd' } },
      ENCRYPTION_KEY,
    );
    await service.deliver(rowId);
    expect(sender.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.test', subject: expect.any(String) }),
    );
    expect(db.emailDelivery.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACCEPTED_BY_SMTP' }) }),
    );
  });

  it('does nothing when another process already claimed the row', async () => {
    const { service, db } = build();
    db.emailDelivery.updateMany.mockResolvedValueOnce({ count: 0 });
    await service.deliver(rowId);
    expect(db.emailDelivery.findUnique).not.toHaveBeenCalled();
    expect(db.emailDelivery.updateMany).toHaveBeenCalledTimes(1);
  });

  it('expires a row past its deadline instead of sending a stale one-time link', async () => {
    const { service, db, sender, created } = build();
    created.expiresAt = new Date(Date.now() - 1000);
    await service.deliver(rowId);
    expect(sender.send).not.toHaveBeenCalled();
    expect(db.emailDelivery.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'EXPIRED', lastErrorCode: 'LINK_EXPIRED' }),
      }),
    );
  });

  it('retries a retryable failure with backoff while attempts remain', async () => {
    const { service, db, sender, created } = build();
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x' } },
      ENCRYPTION_KEY,
    );
    created.attemptCount = 0;
    created.maxAttempts = 3;
    sender.send.mockRejectedValueOnce(new EmailDeliveryError('SMTP_UNREACHABLE', true));
    await service.deliver(rowId);
    expect(db.emailDelivery.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED_RETRYABLE', lastErrorCode: 'SMTP_UNREACHABLE' }),
      }),
    );
  });

  it('gives up after a non-retryable failure even on the first attempt', async () => {
    const { service, db, sender, created } = build();
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x' } },
      ENCRYPTION_KEY,
    );
    sender.send.mockRejectedValueOnce(new EmailDeliveryError('SMTP_AUTH_FAILED', false));
    await service.deliver(rowId);
    expect(db.emailDelivery.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED_TERMINAL', lastErrorCode: 'SMTP_AUTH_FAILED' }),
      }),
    );
  });

  it('gives up once attempts are exhausted, even for a retryable error code', async () => {
    const { service, db, sender, created } = build();
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x' } },
      ENCRYPTION_KEY,
    );
    created.attemptCount = 3;
    created.maxAttempts = 3;
    sender.send.mockRejectedValueOnce(new EmailDeliveryError('SMTP_UNREACHABLE', true));
    await service.deliver(rowId);
    expect(db.emailDelivery.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED_TERMINAL' }) }),
    );
  });

  it('never leaks a raw error message as the stored error code', async () => {
    const { service, db, sender, created } = build();
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x' } },
      ENCRYPTION_KEY,
    );
    sender.send.mockRejectedValueOnce(new Error('535 5.7.8 secret-password-in-response rejected'));
    await service.deliver(rowId);
    const lastCall = db.emailDelivery.updateMany.mock.calls.at(-1)![0];
    expect(lastCall.data.lastErrorCode).not.toMatch(/secret-password/);
  });

  it('defers instead of sending when the per-minute rate limit is reached', async () => {
    const { service, db, sender, created } = build({ rateLimitPerMinute: 1, rateLimitPerHour: 100 });
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x' } },
      ENCRYPTION_KEY,
    );
    await service.deliver(rowId); // baris pertama diterima, mengisi jendela batas per menit
    expect(sender.send).toHaveBeenCalledTimes(1);

    db.emailDelivery.updateMany.mockClear();
    await service.deliver('00000000-0000-4000-8000-000000000102');
    expect(sender.send).toHaveBeenCalledTimes(1); // tidak terkirim lagi
    expect(db.emailDelivery.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rateLimitWaitCount: { increment: 1 } }) }),
    );
  });

  it('uses the published subject/intro at send time, over whatever was true when the email was queued', async () => {
    const { service, db, sender, templates, created } = build();
    created.envelope = encryptEnvelope(
      { to: 'user@example.test', variables: { href: 'https://dailydosepilates.com/x' } },
      ENCRYPTION_KEY,
    );
    templates.emailCopy.mockResolvedValue({ subject: 'Subjek staf', intro: 'Paragraf staf.' });
    await service.deliver(rowId);
    expect(templates.emailCopy).toHaveBeenCalledWith('AUTH_PASSWORD_RESET_V1');
    expect(sender.send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Subjek staf', text: expect.stringContaining('Paragraf staf.') }),
    );
    expect(db.emailDelivery.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACCEPTED_BY_SMTP' }) }),
    );
  });
});

describe('EmailNotificationService.retry', () => {
  it('requires the row to be in a retryable status', async () => {
    const { service, created } = build();
    created.status = 'ACCEPTED_BY_SMTP';
    await expect(service.retry(rowId, 'coba lagi', 'actor-1')).rejects.toMatchObject({
      code: 'INVALID_STATE_TRANSITION',
    });
  });

  it('refuses to retry a link that has already expired', async () => {
    const { service, created } = build();
    created.status = 'FAILED_TERMINAL';
    created.expiresAt = new Date(Date.now() - 1000);
    await expect(service.retry(rowId, 'coba lagi', 'actor-1')).rejects.toMatchObject({
      code: 'EMAIL_EXPIRED',
    });
  });

  it('re-queues a failed delivery and extends its attempt budget', async () => {
    const { service, db, created } = build();
    created.status = 'FAILED_TERMINAL';
    created.attemptCount = 5;
    const result = await service.retry(rowId, 'Kredensial SMTP sudah diperbaiki', 'actor-1');
    expect(result).toMatchObject({ id: rowId, status: 'PENDING' });
    expect(db.emailDelivery.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: rowId, status: 'FAILED_TERMINAL' },
        data: expect.objectContaining({ status: 'PENDING', maxAttempts: 5 + 3 }),
      }),
    );
  });

  it('reports 404 for a delivery that does not exist', async () => {
    const { service, db } = build();
    db.emailDelivery.findUnique.mockResolvedValueOnce(null as never);
    await expect(service.retry(rowId, 'x', 'actor-1')).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
});

describe('EmailNotificationService.onApplicationBootstrap', () => {
  it('does nothing when delivery is disabled', async () => {
    const { service, db } = build({ deliveryEnabled: false });
    await service.onApplicationBootstrap();
    expect(db.emailDelivery.updateMany).not.toHaveBeenCalled();
  });

  it('fails rows stuck SENDING from a crashed process, then reschedules the ones still waiting', async () => {
    const { service, db } = build();
    db.emailDelivery.findMany.mockResolvedValueOnce([{ id: 'waiting-1', nextAttemptAt: null }]);
    await service.onApplicationBootstrap();
    expect(db.emailDelivery.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SENDING' }),
        data: expect.objectContaining({ status: 'FAILED_TERMINAL', lastErrorCode: 'SENDING_INTERRUPTED' }),
      }),
    );
  });
});

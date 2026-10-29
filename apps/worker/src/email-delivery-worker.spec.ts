import nodemailer from 'nodemailer';
import { encryptEnvelope } from '@dailydose/notification-core';
import { EmailDeliveryWorker } from './email-delivery-worker';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

const key = Buffer.alloc(32, 9).toString('base64');
const config = {
  driver: 'smtp' as const,
  deliveryEnabled: true,
  smtpHost: 'smtp.hostinger.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'noreply@littlerollers.example',
  smtpPassword: 'not-logged',
  fromName: 'Little Rollers',
  fromEmail: 'noreply@littlerollers.example',
  connectionTimeoutMs: 15_000,
  maxAttempts: 5,
  rateLimitPerMinute: 3,
  rateLimitPerHour: 150,
  encryptionKey: key,
  resendApiKey: null,
  recipientOverride: null,
};

const occurrence = {
  id: 'occurrence-1',
  templateKey: 'ORDER_APPROVED_V1',
  envelopeEncrypted: encryptEnvelope(
    {
      to: 'customer@example.test',
      variables: { href: 'https://app.example.test/account/packages' },
    },
    key,
  ),
  attemptCount: 1,
  maxAttempts: 5,
  expiresAt: null,
  userId: 'user-1',
  branchId: 'branch-1',
  correlationId: 'correlation-1',
};

test('marks an SMTP-accepted message without exposing its envelope', async () => {
  const sendMail = jest.fn().mockResolvedValue({ response: '250 accepted' });
  (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail, close: jest.fn() });
  const db = {
    notificationAttempt: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
      update: jest.fn().mockReturnValue(Promise.resolve({})),
    },
    notificationOccurrence: {
      findFirst: jest.fn().mockResolvedValue({ ...occurrence, status: 'PENDING' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(occurrence),
      update: jest.fn().mockReturnValue(Promise.resolve({})),
    },
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  };
  await expect(new EmailDeliveryWorker(db as never, config).poll()).resolves.toBe(true);
  expect(nodemailer.createTransport).toHaveBeenCalledWith(
    expect.objectContaining({
      secure: true,
      tls: { rejectUnauthorized: true },
      connectionTimeout: 15_000,
    }),
  );
  expect(sendMail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: 'customer@example.test',
      subject: 'Payment approved, your package is active',
    }),
  );
  expect(db.notificationOccurrence.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'ACCEPTED_BY_SMTP', envelopeEncrypted: null }),
    }),
  );
});

test('creates in-app fallback after a terminal SMTP failure', async () => {
  const failure = Object.assign(new Error('authentication failed'), {
    code: 'EAUTH',
    responseCode: 535,
  });
  (nodemailer.createTransport as jest.Mock).mockReturnValue({
    sendMail: jest.fn().mockRejectedValue(failure),
    close: jest.fn(),
  });
  const tx = {
    notificationAttempt: { update: jest.fn().mockResolvedValue({}) },
    notificationOccurrence: { update: jest.fn().mockResolvedValue({}) },
    userNotification: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
    userRole: { findMany: jest.fn().mockResolvedValue([{ userId: 'ops-1', branchId: null }]) },
  };
  const db = {
    notificationAttempt: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
    },
    notificationOccurrence: {
      findFirst: jest.fn().mockResolvedValue({ ...occurrence, status: 'PENDING' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ ...occurrence, attemptCount: 5 }),
    },
    $transaction: jest.fn((callback: (value: typeof tx) => unknown) => callback(tx)),
  };
  await expect(new EmailDeliveryWorker(db as never, config).poll()).resolves.toBe(true);
  expect(tx.notificationOccurrence.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'FALLBACK_IN_APP', lastErrorCode: 'SMTP_TERMINAL' }),
    }),
  );
  expect(tx.userNotification.createMany).toHaveBeenCalled();
  expect(tx.userNotification.createMany).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 'ops-1', title: 'Pengiriman email gagal terminal' }),
      ]),
    }),
  );
});

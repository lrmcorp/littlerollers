import { PackageReminderWorker } from './package-reminder-worker';

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
  encryptionKey: Buffer.alloc(32, 7).toString('base64'),
  resendApiKey: null,
  recipientOverride: null,
};

test('creates deterministic once-per-package balance and branch-timezone expiry reminders', async () => {
  const previousBaseUrl = process.env.PUBLIC_WEB_BASE_URL;
  process.env.PUBLIC_WEB_BASE_URL = 'https://littlerollers.example';
  const now = new Date('2026-07-28T01:00:00.000Z');
  const item = {
    id: 'package-1',
    customerUserId: 'customer-1',
    branchId: 'branch-1',
    expiryAt: new Date('2026-08-04T14:00:00.000Z'),
    customer: { email: 'customer@example.test' },
    branch: { timezone: 'Asia/Jakarta' },
  };
  const upsert = jest.fn().mockResolvedValue({});
  const createMany = jest.fn().mockResolvedValue({ count: 1 });
  const tx = {
    notificationOccurrence: { upsert },
    userNotification: { createMany },
  };
  const db = {
    customerPackage: {
      findMany: jest
        .fn()
        .mockResolvedValueOnce([item])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([item])
        .mockResolvedValueOnce([]),
    },
    ledgerEntry: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 4 } }) },
    sessionReservation: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 1 } }) },
    $transaction: jest.fn((callback: (value: typeof tx) => unknown) => callback(tx)),
  };

  const worker = new PackageReminderWorker(db as never, config);
  await worker.runOnce(now);
  await worker.runOnce(now);

  expect(upsert).toHaveBeenCalledTimes(4);
  expect(upsert.mock.calls[0]![0].where.occurrenceKey).toBe(
    upsert.mock.calls[2]![0].where.occurrenceKey,
  );
  expect(upsert.mock.calls[1]![0].where.occurrenceKey).toBe(
    upsert.mock.calls[3]![0].where.occurrenceKey,
  );
  expect(upsert.mock.calls.map(([input]) => input.create.templateKey)).toEqual([
    'PACKAGE_LOW_BALANCE_V1',
    'PACKAGE_EXPIRY_REMINDER_V1',
    'PACKAGE_LOW_BALANCE_V1',
    'PACKAGE_EXPIRY_REMINDER_V1',
  ]);
  expect(createMany).toHaveBeenCalledTimes(4);
  if (previousBaseUrl === undefined) delete process.env.PUBLIC_WEB_BASE_URL;
  else process.env.PUBLIC_WEB_BASE_URL = previousBaseUrl;
});

test('creates in-app reminders when email delivery is not configured', async () => {
  const previousBaseUrl = process.env.PUBLIC_WEB_BASE_URL;
  delete process.env.PUBLIC_WEB_BASE_URL;
  const createMany = jest.fn().mockResolvedValue({ count: 1 });
  const upsert = jest.fn();
  const tx = {
    notificationOccurrence: { upsert },
    userNotification: { createMany },
  };
  const db = {
    customerPackage: {
      findMany: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: 'package-1',
            customerUserId: 'customer-1',
            branchId: 'branch-1',
            expiryAt: new Date('2026-08-20T00:00:00.000Z'),
            customer: { email: 'customer@example.test' },
            branch: { timezone: 'Asia/Jakarta' },
          },
        ])
        .mockResolvedValueOnce([]),
    },
    ledgerEntry: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 1 } }) },
    sessionReservation: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 0 } }) },
    $transaction: jest.fn((callback: (value: typeof tx) => unknown) => callback(tx)),
  };
  const noEmail = { ...config, deliveryEnabled: false, encryptionKey: null };
  try {
    await expect(
      new PackageReminderWorker(db as never, noEmail).runOnce(new Date('2026-08-06T00:00:00.000Z')),
    ).resolves.toBe(1);
    expect(createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ title: 'Your package is running low' })],
      }),
    );
    expect(upsert).not.toHaveBeenCalled();
  } finally {
    if (previousBaseUrl === undefined) delete process.env.PUBLIC_WEB_BASE_URL;
    else process.env.PUBLIC_WEB_BASE_URL = previousBaseUrl;
  }
});

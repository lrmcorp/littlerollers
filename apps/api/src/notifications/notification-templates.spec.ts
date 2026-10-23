import { PolicyService } from '../identity/policy.service';
import { NotificationManagementService } from './notification-management.service';
import {
  EMAIL_TEMPLATE_REGISTRY,
  SAMPLE_VALUES,
  TEMPLATE_REGISTRY,
  defaultText,
  renderTemplate,
  validateTemplateBody,
} from './notification-template.registry';
import { NotificationTemplateService } from './notification-template.service';
import { ReminderScheduleService } from './reminder-schedule.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const templateId = id(10);
const DAY = 86_400_000;

describe('template registry', () => {
  it('renders the default bodies to exactly the messages that were hard-coded before', () => {
    const values = { nama: 'Maya', paket: 'Paket 8', berlaku_sampai: '30 September 2026', sisa_sesi: 3 };
    expect(defaultText('WA_REMINDER_EXPIRY_H1', values)).toBe(
      'Halo Maya,\n\nMasa berlaku *Paket 8* Anda akan berakhir *BESOK* (*30 September 2026*) dengan sisa *3 sesi*.\n\nJangan sampai sesi Anda hangus! Segera reservasi jadwal kelas Pilates favorit Anda hari ini.\n\n_Daily Dose Pilates_',
    );
    expect(defaultText('WA_REMINDER_EXPIRY_H3', values)).toBe(
      'Halo Maya,\n\nMasa berlaku *Paket 8* Anda tersisa *3 hari lagi* (*30 September 2026*) dengan sisa *3 sesi*.\n\nYuk manfaatkan sisa sesi Anda untuk berolahraga bersama instruktur Daily Dose Pilates.\n\n_Daily Dose Pilates_',
    );
    expect(defaultText('WA_REMINDER_EXPIRY_H7', values)).toBe(
      'Halo Maya,\n\nPengingat ramah: Masa berlaku *Paket 8* Anda tersisa *7 hari lagi* (*30 September 2026*) dengan sisa *3 sesi*.\n\nPesan jadwal kelas Pilates Anda sekarang agar sesi tidak kedaluwarsa.\n\n_Daily Dose Pilates_',
    );
    expect(
      defaultText('WA_REMINDER_EXPIRED_RENEWAL', { nama: 'Maya', tautan_paket: 'https://x.test/packages' }),
    ).toBe(
      'Halo Maya,\n\nPaket Pilates Anda di Daily Dose telah berakhir. Tetap jaga kebugaran dan rutinitas sehat Anda!\n\nDapatkan penawaran paket terbaru kami melalui tautan berikut:\nhttps://x.test/packages\n\nAtau balas pesan ini untuk terhubung langsung dengan tim kami.\n_Daily Dose Pilates_',
    );
  });

  it('accepts every default body as valid', () => {
    for (const [key, definition] of Object.entries(TEMPLATE_REGISTRY))
      expect(() => validateTemplateBody(key, definition.defaultBody)).not.toThrow();
  });

  it('rejects unknown templates and variables, malformed placeholders, empty and oversized bodies', () => {
    const key = 'WA_REMINDER_EXPIRED_RENEWAL';
    for (const body of [
      'Halo {{nama}} sisa {{sisa_sesi}}',
      'Halo {{nama}} {{',
      'Halo {{ nama }} }}',
      '   ',
      undefined,
      'x'.repeat(1001),
    ])
      expect(() => validateTemplateBody(key, body)).toThrow(
        expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      );
    expect(() => validateTemplateBody('BOOKING_CONFIRMED', 'Halo')).toThrow(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
    expect(validateTemplateBody(key, '  Halo {{ nama }} \r\n{{tautan_paket}}  ')).toBe(
      'Halo {{ nama }} \n{{tautan_paket}}',
    );
  });

  it('substitutes in a single pass, so a value that looks like a placeholder is not expanded', () => {
    expect(renderTemplate('Hai {{nama}}', { nama: '{{paket}}', paket: 'RAHASIA' })).toBe('Hai {{paket}}');
    expect(renderTemplate('Sisa {{sisa_sesi}} / {{hilang}}', { sisa_sesi: 0 })).toBe('Sisa 0 / ');
    expect(renderTemplate('{{nama}}', SAMPLE_VALUES)).toBe('Maya');
  });
});

describe('NotificationTemplateService', () => {
  it('uses the published version, and falls back to the default when none exists or the read fails', async () => {
    const findFirst = jest.fn().mockResolvedValue({ body: 'Custom {{nama}}!' });
    const service = new NotificationTemplateService({ notificationTemplate: { findFirst } } as never);
    await expect(service.whatsappText('WA_REMINDER_EXPIRY_H7', { nama: 'Maya' })).resolves.toBe('Custom Maya!');
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { templateKey: 'WA_REMINDER_EXPIRY_H7', channel: 'WHATSAPP', status: 'PUBLISHED' },
        orderBy: { version: 'desc' },
      }),
    );
    findFirst.mockResolvedValue(null);
    await expect(service.whatsappText('WA_REMINDER_EXPIRY_H7', { nama: 'Maya', paket: 'P', berlaku_sampai: 'x', sisa_sesi: 1 })).resolves.toMatch(/^Halo Maya/);
    findFirst.mockRejectedValue(new Error('db down'));
    await expect(service.whatsappText('WA_REMINDER_EXPIRY_H7', { nama: 'Maya' })).resolves.toMatch(/^Halo Maya/);
  });
});

describe('WhatsApp expiry reminders use the published template', () => {
  function setup(published: string | null) {
    const now = new Date('2026-09-28T02:00:00Z');
    const sent: Array<{ text: string; reminderType: string }> = [];
    const db = {
      paketPelanggan: {
        findMany: jest.fn().mockImplementation(async ({ where }: { where: { status?: string } }) =>
          where.status === 'ACTIVE'
            ? [
                {
                  id: 'cp1',
                  validUntil: new Date(now.getTime() + 3 * DAY - 1000),
                  remainingSessions: 4,
                  package: { name: 'Paket 8' },
                  user: { displayName: 'Maya', phone: '+62811', stoppedAt: null },
                },
                {
                  id: 'cp2',
                  validUntil: new Date(now.getTime() + 3 * DAY - 1000),
                  remainingSessions: 4,
                  package: { name: 'Paket 8' },
                  user: { displayName: 'Berhenti', phone: '+62822', stoppedAt: new Date() },
                },
              ]
            : [],
        ),
      },
      notificationTemplate: {
        findFirst: jest.fn().mockResolvedValue(published ? { body: published } : null),
      },
    };
    const whatsapp = {
      sendMessage: jest.fn().mockImplementation(async (message) => {
        sent.push(message);
        return { status: 'SENT' };
      }),
    };
    const templates = new NotificationTemplateService(db as never);
    const service = new ReminderScheduleService(db as never, whatsapp as never, templates);
    return { service, sent, now };
  }

  it('sends the published H-3 template with the customer values, and skips stopped customers', async () => {
    const { service, sent, now } = setup('Hi {{nama}}, {{paket}} habis {{berlaku_sampai}}; sisa {{sisa_sesi}}.');
    const result = await service.runCustomerExpiryReminders(now);
    expect(result.h3Count).toBe(1);
    expect(result.stoppedProtectedCount).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ reminderType: 'EXPIRY_H3', to: '+62811' });
    expect(sent[0]!.text).toMatch(/^Hi Maya, Paket 8 habis .+; sisa 4\.$/);
  });

  it('keeps the original wording when no template is published', async () => {
    const { service, sent, now } = setup(null);
    await service.runCustomerExpiryReminders(now);
    expect(sent[0]!.text).toContain('tersisa *3 hari lagi*');
    expect(sent[0]!.text).toContain('Yuk manfaatkan sisa sesi Anda');
  });
});

function managementSetup(row: Record<string, unknown> | null = null) {
  const stored = {
    id: templateId,
    templateKey: 'WA_REMINDER_EXPIRY_H7',
    channel: 'WHATSAPP',
    version: 2,
    eventType: 'reminder.expiry.h7',
    audience: null,
    subject: null,
    title: 'Pengingat masa berlaku H-7',
    body: 'Halo {{nama}}',
    status: 'DRAFT',
    createdById: id(100),
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    updatedAt: new Date('2026-09-01T00:00:00Z'),
    ...row,
  };
  const tx = { notificationTemplate: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) } };
  const db = {
    notificationTemplate: {
      findMany: jest.fn().mockResolvedValue([stored]),
      findUnique: jest.fn().mockResolvedValue(stored),
      aggregate: jest.fn().mockResolvedValue({ _max: { version: 2 } }),
      create: jest.fn().mockImplementation(async ({ data }) => ({ ...stored, ...data, id: id(11) })),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    reminderLog: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'l1', reminderType: 'EXPIRY_H3', recipientPhone: '+6281234567890', status: 'SENT', sentAt: new Date('2026-09-02T00:00:00Z') },
      ]),
      groupBy: jest.fn().mockResolvedValue([
        { status: 'SENT', _count: { _all: 5 } },
        { status: 'FAILED', _count: { _all: 1 } },
      ]),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new NotificationManagementService(db as never, new PolicyService());
  return { service, db, tx };
}

const admin = (capabilities: string[]) => ({
  sessionId: 's',
  userId: id(100),
  roles: [{ role: 'SUPER_OWNER', branchId: null }] as never,
  capabilities,
  branchIds: [] as string[],
});
const owner = admin(['notification:manage', 'branch:all']);

describe('NotificationManagementService', () => {
  it('needs the global notification:manage capability', async () => {
    const { service } = managementSetup();
    const nobody = admin([]);
    await expect(service.overview(nobody)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.create(nobody, { templateKey: 'WA_REMINDER_EXPIRY_H7', body: 'x' }, 'c')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.preview(nobody, { templateKey: 'WA_REMINDER_EXPIRY_H7', body: 'x' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('exposes the catalog of supported templates (WhatsApp and email) and real delivery history', async () => {
    const { service } = managementSetup();
    const result = await service.overview(owner);
    expect(result.catalog.map((item) => item.templateKey)).toEqual([
      ...Object.keys(TEMPLATE_REGISTRY),
      ...Object.keys(EMAIL_TEMPLATE_REGISTRY),
    ]);
    expect(result.catalog[0]).toMatchObject({ channel: 'WHATSAPP', variables: expect.any(Array), defaultBody: expect.any(String) });
    const emailEntry = result.catalog.find((item) => item.templateKey === 'AUTH_PASSWORD_RESET_V1');
    expect(emailEntry).toMatchObject({
      channel: 'EMAIL',
      subject: 'Reset password Daily Dose Pilates',
      intro: 'Kami menerima permintaan reset password untuk akun Anda.',
    });
    expect(result.deliveries[0]).toMatchObject({ eventType: 'EXPIRY_H3', status: 'SENT', attemptCount: 1 });
    expect(result.deliveries[0]!.recipientMasked).not.toContain('1234567');
    expect(result.metrics).toEqual({ DELIVERED: 5, PENDING: 0, FAILED: 1 });
    expect(result.deferredChannels).toEqual([]);
  });

  it('previews with sample data and rejects unknown variables', async () => {
    const { service } = managementSetup();
    await expect(
      service.preview(owner, { templateKey: 'WA_REMINDER_EXPIRY_H7', body: 'Halo {{nama}}, sisa {{sisa_sesi}}' }),
    ).resolves.toMatchObject({ text: 'Halo Maya, sisa 3' });
    await expect(
      service.preview(owner, { templateKey: 'WA_REMINDER_EXPIRY_H7', body: 'Halo {{email}}' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('creates the next draft version of a supported template only', async () => {
    const { service, db } = managementSetup();
    await expect(service.create(owner, { templateKey: 'ORDER_CREATED_V1', body: 'x' }, 'c')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const created = await service.create(owner, { templateKey: 'wa_reminder_expiry_h7', body: 'Halo {{nama}}!' }, 'c');
    expect(db.notificationTemplate.create.mock.calls[0]![0].data).toMatchObject({
      templateKey: 'WA_REMINDER_EXPIRY_H7',
      channel: 'WHATSAPP',
      version: 3,
      status: 'DRAFT',
      body: 'Halo {{nama}}!',
    });
    expect(created).toMatchObject({ version: 3, status: 'DRAFT' });
  });

  it('edits drafts only, duplicates any version, and publishing archives the previous published one atomically', async () => {
    const { service, db, tx } = managementSetup();
    await service.updateDraft(owner, templateId, { body: 'Baru {{nama}}' }, 'c');
    expect(db.notificationTemplate.updateMany.mock.calls[0]![0].where).toEqual({ id: templateId, status: 'DRAFT' });
    db.notificationTemplate.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.updateDraft(owner, templateId, { body: 'Baru' }, 'c')).rejects.toMatchObject({ code: 'INVALID_STATE' });
    await service.duplicate(owner, templateId, 'c');
    expect(db.notificationTemplate.create.mock.calls[0]![0].data).toMatchObject({ body: 'Halo {{nama}}', status: 'DRAFT' });
    await service.transition(owner, templateId, 'PUBLISHED', 'c');
    expect(tx.notificationTemplate.updateMany).toHaveBeenNthCalledWith(2, {
      where: { templateKey: 'WA_REMINDER_EXPIRY_H7', channel: 'WHATSAPP', status: 'PUBLISHED', id: { not: templateId } },
      data: { status: 'ARCHIVED', archivedAt: expect.any(Date) },
    });
    tx.notificationTemplate.updateMany.mockReset().mockResolvedValueOnce({ count: 0 });
    await expect(service.transition(owner, templateId, 'PUBLISHED', 'c')).rejects.toMatchObject({ code: 'INVALID_STATE' });
    await expect(service.transition(owner, templateId, 'DELETED' as never, 'c')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('archiving a version needs a typed reason and changes nothing without it', async () => {
    const { service, db } = managementSetup({ status: 'PUBLISHED' });
    for (const reason of [undefined, '', '  ', 'ab'])
      await expect(service.transition(owner, templateId, 'ARCHIVED', 'c', reason)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    expect(db.notificationTemplate.updateMany).not.toHaveBeenCalled();
    await service.transition(owner, templateId, 'ARCHIVED', 'c', 'Kembali ke teks bawaan');
    expect(db.notificationTemplate.updateMany).toHaveBeenCalledTimes(1);
  });

  describe('email templates (subject + intro; the action button always keeps its default label and link)', () => {
    const emailRow = (overrides: Record<string, unknown> = {}) => ({
      id: templateId,
      templateKey: 'AUTH_PASSWORD_RESET_V1',
      channel: 'EMAIL',
      version: 1,
      eventType: 'auth.password.reset.v1',
      audience: null,
      subject: 'Reset password Daily Dose Pilates',
      title: 'Reset password',
      body: 'Kami menerima permintaan reset password untuk akun Anda.',
      status: 'DRAFT',
      createdById: id(100),
      publishedAt: null,
      archivedAt: null,
      createdAt: new Date('2026-09-01T00:00:00Z'),
      updatedAt: new Date('2026-09-01T00:00:00Z'),
      ...overrides,
    });

    it('previews the rendered subject, text and html with sample data, and rejects a missing field', async () => {
      const { service } = managementSetup(emailRow());
      const preview = await service.preview(owner, {
        templateKey: 'AUTH_PASSWORD_RESET_V1',
        body: { subject: 'Judul uji', intro: 'Paragraf uji.' },
      });
      expect(preview).toMatchObject({ channel: 'EMAIL', subject: 'Judul uji' });
      expect((preview as { text: string }).text).toContain('Paragraf uji.');
      expect((preview as { html: string }).html).toContain('Paragraf uji.');
      await expect(
        service.preview(owner, { templateKey: 'AUTH_PASSWORD_RESET_V1', body: { subject: '', intro: 'x' } }),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });

    it('creates the next draft version, storing subject and intro in their own columns', async () => {
      const { service, db } = managementSetup(emailRow());
      await expect(
        service.create(owner, { templateKey: 'AUTH_PASSWORD_RESET_V1', body: { subject: '', intro: 'x' } }, 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
      const created = await service.create(
        owner,
        { templateKey: 'auth_password_reset_v1', body: { subject: 'Judul baru', intro: 'Paragraf baru.' } },
        'c',
      );
      expect(db.notificationTemplate.create.mock.calls[0]![0].data).toMatchObject({
        templateKey: 'AUTH_PASSWORD_RESET_V1',
        channel: 'EMAIL',
        version: 3,
        status: 'DRAFT',
        subject: 'Judul baru',
        body: 'Paragraf baru.',
      });
      expect(created).toMatchObject({ channel: 'EMAIL', version: 3 });
    });

    it('edits an email draft, duplicates it under the email channel (not WhatsApp), and publishing re-validates', async () => {
      const { service, db, tx } = managementSetup(emailRow());
      await service.updateDraft(owner, templateId, { body: { subject: 'S', intro: 'I' } }, 'c');
      expect(db.notificationTemplate.updateMany.mock.calls[0]![0].data).toEqual({ subject: 'S', body: 'I' });

      await service.duplicate(owner, templateId, 'c');
      expect(db.notificationTemplate.aggregate.mock.calls[0]![0].where).toEqual({
        templateKey: 'AUTH_PASSWORD_RESET_V1',
        channel: 'EMAIL',
      });
      expect(db.notificationTemplate.create.mock.calls[0]![0].data).toMatchObject({
        channel: 'EMAIL',
        subject: 'Reset password Daily Dose Pilates',
        body: 'Kami menerima permintaan reset password untuk akun Anda.',
      });

      await service.transition(owner, templateId, 'PUBLISHED', 'c');
      expect(tx.notificationTemplate.updateMany).toHaveBeenNthCalledWith(2, {
        where: { templateKey: 'AUTH_PASSWORD_RESET_V1', channel: 'EMAIL', status: 'PUBLISHED', id: { not: templateId } },
        data: { status: 'ARCHIVED', archivedAt: expect.any(Date) },
      });
    });

    it('refuses to publish an email draft whose subject was cleared out from under it', async () => {
      const { service } = managementSetup(emailRow({ subject: '' }));
      await expect(service.transition(owner, templateId, 'PUBLISHED', 'c')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });
  });
});

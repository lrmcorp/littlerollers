import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationManagementView } from './notification-management-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const catalog = [
  {
    templateKey: 'WA_REMINDER_EXPIRY_H7',
    label: 'Pengingat masa berlaku H-7',
    description: 'Dikirim 7 hari sebelum paket berakhir.',
    eventType: 'reminder.expiry.h7',
    channel: 'WHATSAPP',
    variables: ['nama', 'paket'],
    defaultBody: 'Halo {{nama}}, {{paket}} segera berakhir.',
  },
  {
    templateKey: 'WA_REMINDER_EXPIRED_RENEWAL',
    label: 'Ajakan perpanjang setelah paket berakhir',
    description: 'Dikirim tiap 3 hari.',
    eventType: 'reminder.expired.renewal',
    channel: 'WHATSAPP',
    variables: ['nama'],
    defaultBody: 'Halo {{nama}}, paket Anda berakhir.',
  },
];

const emailCatalog = {
  templateKey: 'AUTH_PASSWORD_RESET_V1',
  label: 'Reset password',
  description: 'Dikirim saat pengguna meminta reset password lewat halaman masuk.',
  eventType: 'auth.password.reset.v1',
  channel: 'EMAIL',
  subject: 'Reset password Daily Dose Pilates',
  intro: 'Kami menerima permintaan reset password untuk akun Anda.',
};

const emailVersion = (overrides: Record<string, unknown>) => ({
  id: 'e1',
  templateKey: 'AUTH_PASSWORD_RESET_V1',
  version: 1,
  status: 'PUBLISHED',
  channel: 'EMAIL',
  subject: 'Subjek terbit',
  body: 'Paragraf terbit.',
  updatedAt: '2026-09-01T00:00:00Z',
  ...overrides,
});

const version = (overrides: Record<string, unknown>) => ({
  id: 't1',
  templateKey: 'WA_REMINDER_EXPIRY_H7',
  version: 1,
  status: 'PUBLISHED',
  channel: 'WHATSAPP',
  body: 'Versi terbit {{nama}}',
  updatedAt: '2026-09-01T00:00:00Z',
  ...overrides,
});

describe('NotificationManagementView', () => {
  const fetchMock = vi.fn();
  let templates: unknown[];
  let failure: { status: number; body: unknown } | null;
  const overview = () => ({
    catalog,
    templates,
    metrics: { DELIVERED: 3, PENDING: 0, FAILED: 1 },
    deliveries: [
      { id: 'd1', eventType: 'EXPIRY_H3', recipientMasked: '+628***890', status: 'SENT', attemptCount: 1 },
      { id: 'd2', eventType: 'EXPIRY_H1', recipientMasked: '+628***111', status: 'FAILED', attemptCount: 1 },
    ],
  });

  beforeEach(() => {
    fetchMock.mockReset();
    templates = [];
    failure = null;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method && init.method !== 'GET' && failure)
        return { ok: false, status: failure.status, json: async () => failure!.body };
      if (String(url).endsWith('/templates/preview')) {
        const sent = init?.body ? JSON.parse(String(init.body)) : {};
        if (sent.templateKey === 'AUTH_PASSWORD_RESET_V1')
          return {
            ok: true,
            status: 200,
            json: async () => ({
              channel: 'EMAIL',
              subject: sent.body?.subject,
              text: `${sent.body?.intro}`,
              html: `<p>${sent.body?.intro}</p>`,
            }),
          };
        return { ok: true, status: 200, json: async () => ({ text: 'Halo Maya, Paket 8 segera berakhir.' }) };
      }
      if (init?.method === 'POST' || init?.method === 'PATCH')
        return { ok: true, status: 201, json: async () => ({ id: 'new-1' }) };
      return { ok: true, status: 200, json: async () => overview() };
    });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const writes = () => fetchMock.mock.calls.filter(([, init]) => init?.method && init.method !== 'GET');

  it('lists the supported messages, marks which use the default text, and shows real deliveries', async () => {
    templates = [version({})];
    render(<NotificationManagementView />);
    expect(await screen.findByText('Pengingat masa berlaku H-7')).toBeVisible();
    expect(screen.getByText('Memakai versi 1')).toBeVisible();
    expect(screen.getByText('Memakai teks bawaan')).toBeVisible();
    expect(screen.getByText(/Terkirim 3 · Gagal 1/)).toBeVisible();
    expect(screen.getByText(/\+628\*\*\*890 · Terkirim/)).toBeVisible();
    expect(screen.queryByText('SENT')).toBeNull();
    expect(screen.queryByText('PUBLISHED')).toBeNull();
  });

  it('prefills the default text, previews it, then saves and publishes a draft', async () => {
    const user = userEvent.setup();
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Pengingat masa berlaku H-7')).closest('li')!;
    await user.click(within(card).getByRole('button', { name: 'Ubah teks pesan' }));
    expect(within(card).getByLabelText('Isi pesan')).toHaveValue(catalog[0]!.defaultBody);
    await user.click(within(card).getByRole('button', { name: 'Pratinjau' }));
    expect(await within(card).findByText('Halo Maya, Paket 8 segera berakhir.')).toBeVisible();
    await user.click(within(card).getByRole('button', { name: 'Simpan & terbitkan' }));
    await waitFor(() => expect(writes()).toHaveLength(3));
    expect(writes().map(([url, init]) => `${init.method} ${url}`)).toEqual([
      'POST /api/v1/notification-management/templates/preview',
      'POST /api/v1/notification-management/templates',
      'POST /api/v1/notification-management/templates/new-1/PUBLISHED',
    ]);
    expect(JSON.parse(writes()[1]![1].body)).toEqual({
      templateKey: 'WA_REMINDER_EXPIRY_H7',
      body: catalog[0]!.defaultBody,
    });
    expect(
      await screen.findByText('Template diterbitkan dan dipakai pada pengiriman berikutnya.'),
    ).toBeVisible();
  });

  it('continues an existing draft with PATCH and can go back to the default text', async () => {
    templates = [
      version({ id: 't2', version: 2, status: 'DRAFT', body: 'Draf saya {{nama}}' }),
      version({}),
    ];
    const user = userEvent.setup();
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Pengingat masa berlaku H-7')).closest('li')!;
    expect(within(card).getByText('Ada draf versi 2 yang belum diterbitkan.')).toBeVisible();
    await user.click(within(card).getByRole('button', { name: 'Lanjutkan draf' }));
    expect(within(card).getByLabelText('Isi pesan')).toHaveValue('Draf saya {{nama}}');
    await user.click(within(card).getByRole('button', { name: 'Simpan draf' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0]![0]).toBe('/api/v1/notification-management/templates/t2');
    expect(writes()[0]![1].method).toBe('PATCH');
    await user.click(within(card).getByRole('button', { name: 'Kembali ke teks bawaan' }));
    await waitFor(() => expect(writes()).toHaveLength(2));
    expect(writes()[1]![0]).toBe('/api/v1/notification-management/templates/t1/ARCHIVED');
  });

  it('explains an unknown variable instead of a generic failure', async () => {
    failure = {
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', details: [{ field: 'body', issue: 'UNKNOWN_VARIABLE:email' }] } },
    };
    const user = userEvent.setup();
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Pengingat masa berlaku H-7')).closest('li')!;
    await user.click(within(card).getByRole('button', { name: 'Ubah teks pesan' }));
    await user.click(within(card).getByRole('button', { name: 'Simpan draf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Variabel {{email}} tidak dikenal');
  });

  it('shows an empty state for deliveries and lists history in Indonesian', async () => {
    templates = [version({}), version({ id: 't0', version: 0, status: 'ARCHIVED', body: 'Lama' })];
    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ...overview(), deliveries: [] }),
    }));
    const { container } = render(<NotificationManagementView />);
    expect(await screen.findByText('Belum ada pengiriman')).toBeVisible();
    expect(container).toHaveTextContent('Diarsipkan');
    expect(container).not.toHaveTextContent('ARCHIVED');
  });
});

describe('NotificationManagementView email templates', () => {
  const fetchMock = vi.fn();
  let emailTemplates: unknown[];
  let failure: { status: number; body: unknown } | null;
  const overview = () => ({
    catalog: [emailCatalog],
    templates: emailTemplates,
    metrics: { DELIVERED: 0, PENDING: 0, FAILED: 0 },
    deliveries: [],
  });

  beforeEach(() => {
    fetchMock.mockReset();
    emailTemplates = [];
    failure = null;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method && init.method !== 'GET' && failure)
        return { ok: false, status: failure.status, json: async () => failure!.body };
      if (String(url).endsWith('/templates/preview')) {
        const sent = JSON.parse(String(init!.body));
        return {
          ok: true,
          status: 200,
          json: async () => ({ channel: 'EMAIL', subject: sent.body.subject, text: sent.body.intro }),
        };
      }
      if (init?.method === 'POST' || init?.method === 'PATCH')
        return { ok: true, status: 201, json: async () => ({ id: 'new-1' }) };
      return { ok: true, status: 200, json: async () => overview() };
    });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const writes = () => fetchMock.mock.calls.filter(([, init]) => init?.method && init.method !== 'GET');

  it('labels the entry as Email and shows whether a version is published', async () => {
    emailTemplates = [emailVersion({})];
    render(<NotificationManagementView />);
    expect(await screen.findByText('Reset password')).toBeVisible();
    expect(screen.getByText('Email')).toBeVisible();
    expect(screen.getByText('Memakai versi 1')).toBeVisible();
  });

  it('prefills the default subject and intro, previews, then saves and publishes a draft', async () => {
    const user = userEvent.setup();
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Reset password')).closest('li')!;
    await user.click(within(card).getByRole('button', { name: 'Ubah subjek & isi' }));
    expect(within(card).getByLabelText('Subjek email')).toHaveValue(emailCatalog.subject);
    expect(within(card).getByLabelText('Paragraf pembuka')).toHaveValue(emailCatalog.intro);
    await user.click(within(card).getByRole('button', { name: 'Pratinjau' }));
    expect(await within(card).findByText(emailCatalog.subject)).toBeVisible();

    await user.click(within(card).getByRole('button', { name: 'Simpan & terbitkan' }));
    await waitFor(() => expect(writes()).toHaveLength(3));
    expect(JSON.parse(writes()[1]![1].body)).toEqual({
      templateKey: 'AUTH_PASSWORD_RESET_V1',
      body: { subject: emailCatalog.subject, intro: emailCatalog.intro },
    });
    expect(writes()[2]![0]).toBe('/api/v1/notification-management/templates/new-1/PUBLISHED');
  });

  it('keeps saving disabled until both subject and intro are filled', async () => {
    const user = userEvent.setup();
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Reset password')).closest('li')!;
    await user.click(within(card).getByRole('button', { name: 'Ubah subjek & isi' }));
    await user.clear(within(card).getByLabelText('Subjek email'));
    expect(within(card).getByRole('button', { name: 'Simpan & terbitkan' })).toBeDisabled();
    expect(within(card).getByRole('button', { name: 'Simpan draf' })).toBeDisabled();
  });

  it('explains a subject that is too long instead of a generic failure', async () => {
    failure = {
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', details: [{ field: 'subject', issue: 'TOO_LONG' }] } },
    };
    const user = userEvent.setup();
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Reset password')).closest('li')!;
    await user.click(within(card).getByRole('button', { name: 'Ubah subjek & isi' }));
    await user.click(within(card).getByRole('button', { name: 'Simpan draf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Subjek email terlalu panjang');
  });

  it('never offers a WhatsApp-style body field for an email template', async () => {
    emailTemplates = [emailVersion({})];
    render(<NotificationManagementView />);
    const card = (await screen.findByText('Reset password')).closest('li')!;
    await userEvent.click(within(card).getByRole('button', { name: 'Ubah subjek & isi' }));
    expect(within(card).queryByLabelText('Isi pesan')).toBeNull();
  });
});

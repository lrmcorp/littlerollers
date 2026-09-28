import { render as rtlRender, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import { PublicContentManagementView } from './public-content-management-view';
import { FaqEditor } from './faq-editor';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
vi.mock('../session-context', () => ({
  useSessionContext: () => ({ session: { branches: [] } }),
}));

const render = (view: React.ReactNode) =>
  rtlRender(<AppFeedbackProvider>{view}</AppFeedbackProvider>);

const faqRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'f1',
  contentKey: 'CLASS_DETAIL_FAQ',
  kind: 'FAQ',
  status: 'PUBLISHED',
  version: 1,
  updatedAt: '2026-09-01T00:00:00Z',
  payload: {
    items: [
      { id: 'faq-1', question: 'Apakah cocok untuk pemula?', answer: 'Ya, cocok untuk pemula.' },
      { id: 'faq-2', question: 'Apa yang perlu dibawa?', answer: 'Grip socks dan handuk kecil.' },
    ],
  },
  ...overrides,
});

describe('FaqEditor', () => {
  const fetchMock = vi.fn();
  let failure: { status: number; body: unknown } | null;
  const props = () => ({
    onChanged: vi.fn().mockResolvedValue(undefined),
    onMessage: vi.fn(),
    onError: vi.fn(),
  });
  const writes = () => fetchMock.mock.calls.filter(([, init]) => init?.method);

  beforeEach(() => {
    fetchMock.mockReset();
    failure = null;
    fetchMock.mockImplementation(async () =>
      failure
        ? { ok: false, status: failure.status, json: async () => failure!.body }
        : { ok: true, status: 200, json: async () => ({ id: 'new-1' }) },
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  it('says the site uses the built-in questions when nothing is published, and keeps saving disabled until filled', async () => {
    render(<FaqEditor items={[]} {...props()} />);
    const user = userEvent.setup();
    expect(screen.getByText(/memakai 3 pertanyaan bawaan/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Publikasikan FAQ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Simpan Draf FAQ' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Tambah pertanyaan/ }));
    await user.type(screen.getByRole('textbox', { name: 'Pertanyaan 1' }), 'Apa?');
    await user.type(screen.getByRole('textbox', { name: 'Jawaban 1' }), 'Jawaban panjang cukup.');
    expect(screen.getByRole('button', { name: 'Publikasikan FAQ' })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent(/minimal 5 karakter/);
    await user.type(screen.getByRole('textbox', { name: 'Pertanyaan 1' }), 'k');
    expect(screen.getByRole('button', { name: 'Publikasikan FAQ' })).toBeEnabled();
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('creates a draft and publishes it, sending normalized text in the entered order', async () => {
    const handlers = props();
    render(<FaqEditor items={[]} {...handlers} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Tambah pertanyaan/ }));
    await user.type(screen.getByRole('textbox', { name: 'Pertanyaan 1' }), '  Apakah ada parkir?  ');
    await user.type(screen.getByRole('textbox', { name: 'Jawaban 1' }), 'Ya, parkir tersedia.');
    await user.click(screen.getByRole('button', { name: 'Publikasikan FAQ' }));

    await waitFor(() => expect(writes()).toHaveLength(2));
    const [createUrl, createInit] = writes()[0]!;
    expect(createUrl).toBe('/api/v1/public-content-management');
    expect(createInit.method).toBe('POST');
    expect(JSON.parse(createInit.body)).toEqual({
      contentKey: 'CLASS_DETAIL_FAQ',
      kind: 'FAQ',
      payload: { items: [{ question: 'Apakah ada parkir?', answer: 'Ya, parkir tersedia.' }] },
    });
    expect(writes()[1]![0]).toBe('/api/v1/public-content-management/new-1/PUBLISHED');
    expect(handlers.onMessage).toHaveBeenCalledWith(expect.stringMatching(/FAQ berhasil dipublikasikan/));
    expect(handlers.onChanged).toHaveBeenCalled();
  });

  it('edits a published FAQ into a new draft, and updates an existing draft in place', async () => {
    const first = render(<FaqEditor items={[faqRow()]} {...props()} />);
    const user = userEvent.setup();
    expect(screen.getByDisplayValue('Apakah cocok untuk pemula?')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Simpan Draf FAQ' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0]![0]).toBe('/api/v1/public-content-management');
    expect(writes()[0]![1].method).toBe('POST');
    expect(JSON.parse(writes()[0]![1].body).payload.items[0]).toMatchObject({ id: 'faq-1' });
    first.unmount();

    fetchMock.mockClear();
    render(
      <FaqEditor
        items={[faqRow({ id: 'd1', status: 'DRAFT', version: 2 }), faqRow()]}
        {...props()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Simpan Draf FAQ' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0]![0]).toBe('/api/v1/public-content-management/d1');
    expect(writes()[0]![1].method).toBe('PATCH');
  });

  it('reorders and removes questions before saving', async () => {
    render(<FaqEditor items={[faqRow()]} {...props()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Geser pertanyaan 1 ke bawah' }));
    expect(screen.getByRole('textbox', { name: 'Pertanyaan 1' })).toHaveValue('Apa yang perlu dibawa?');
    await user.click(screen.getByRole('button', { name: 'Hapus pertanyaan 1' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Hapus pertanyaan 1?' })).getByRole('button', {
        name: 'Hapus',
      }),
    );
    expect(screen.getAllByRole('textbox', { name: /Pertanyaan \d/ })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Simpan Draf FAQ' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(JSON.parse(writes()[0]![1].body).payload.items).toEqual([
      { id: 'faq-1', question: 'Apakah cocok untuk pemula?', answer: 'Ya, cocok untuk pemula.' },
    ]);
  });

  it('explains a server rejection in Indonesian', async () => {
    failure = {
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', details: [{ field: 'items[0].answer', issue: 'TOO_LONG' }] } },
    };
    const handlers = props();
    render(<FaqEditor items={[faqRow()]} {...handlers} />);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Draf FAQ' }));
    await waitFor(() =>
      expect(handlers.onError).toHaveBeenCalledWith(expect.stringMatching(/jawaban \(maks\. 1500 karakter\)/)),
    );
  });
});

describe('PublicContentManagementView FAQ tab', () => {
  it('opens the FAQ editor from its tab and labels FAQ versions in the history', async () => {
    const rows = [
      faqRow(),
      {
        id: 'h1',
        contentKey: 'HOME_HERO_CAROUSEL',
        kind: 'HERO_CAROUSEL',
        version: 1,
        status: 'PUBLISHED',
        payload: { autoplay: true, intervalMs: 6000, slides: [] },
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => rows })),
    );
    render(<PublicContentManagementView />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /FAQ Halaman Kelas/ }));
    expect(screen.getByRole('heading', { name: 'FAQ Halaman Detail Kelas' })).toBeVisible();
    expect(screen.getByDisplayValue('Apa yang perlu dibawa?')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Riwayat Versi Konten/ }));
    expect(screen.getByText(/FAQ halaman kelas/)).toBeVisible();
    expect(screen.getByText(/2 pertanyaan/)).toBeVisible();
    expect(screen.getByText(/Slider beranda/)).toBeVisible();
  });
});

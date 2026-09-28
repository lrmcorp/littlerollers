import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicContentManagementView } from './public-content-management-view';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
vi.mock('../session-context', () => ({
  useSessionContext: () => ({ session: { branches: [] } }),
}));

const slide = (id: string, title: string) => ({
  id,
  title,
  description: 'Deskripsi',
  imageSrc: '/images/public/landing/hero-pilates.png',
  active: true,
  order: 1,
});
const item = (overrides: Record<string, unknown>) => ({
  id: 'c1',
  contentKey: 'HOME_HERO_CAROUSEL',
  kind: 'HERO_CAROUSEL',
  branchId: null,
  version: 1,
  status: 'PUBLISHED',
  payload: { autoplay: true, intervalMs: 6000, slides: [slide('s1', 'Slide Terbit')] },
  updatedAt: '2026-09-01T00:00:00Z',
  ...overrides,
});

describe('PublicContentManagementView', () => {
  const fetchMock = vi.fn();
  let items: unknown[];
  let failure: { status: number; body: unknown } | null;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
    failure = null;
    items = [item({})];
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init?.method && init.method !== 'GET' && failure)
        return { ok: false, status: failure.status, json: async () => failure!.body };
      return {
        ok: true,
        status: 200,
        json: async () => (init?.method === 'POST' ? { id: 'new-1' } : init?.method === 'PATCH' ? { id: 'd1' } : items),
      };
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  const writes = () => fetchMock.mock.calls.filter(([, init]) => init?.method && init.method !== 'GET');

  it('creates a new draft version when only a published version exists', async () => {
    render(<PublicContentManagementView />);
    await screen.findByText(/Hero Carousel Beranda \(1 Slide\)/);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Draft' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    const [url, init] = writes()[0]!;
    expect(url).toBe('/api/v1/public-content-management');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({
      contentKey: 'HOME_HERO_CAROUSEL',
      kind: 'HERO_CAROUSEL',
      payload: { slides: [expect.objectContaining({ title: 'Slide Terbit' })] },
    });
    expect(await screen.findByText('Draft slider berhasil disimpan.')).toBeVisible();
  });

  it('updates the existing draft in place, and publishes that same draft', async () => {
    items = [
      item({ id: 'd1', status: 'DRAFT', version: 2, payload: { autoplay: true, intervalMs: 6000, slides: [slide('s9', 'Slide Draf'), slide('s10', 'Slide Dua')] } }),
      item({}),
    ];
    render(<PublicContentManagementView />);
    await screen.findByText(/Hero Carousel Beranda \(2 Slide\)/);
    await userEvent.click(screen.getByRole('button', { name: 'Publikasikan ke Website' }));
    await waitFor(() => expect(writes()).toHaveLength(2));
    expect(writes()[0]![0]).toBe('/api/v1/public-content-management/d1');
    expect(writes()[0]![1].method).toBe('PATCH');
    expect(writes()[1]![0]).toBe('/api/v1/public-content-management/d1/PUBLISHED');
    expect(await screen.findByText(/berhasil dipublikasikan/)).toBeVisible();
  });

  it('explains an unsafe link instead of a generic failure', async () => {
    failure = {
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', details: [{ field: 'slides[0].imageSrc', issue: 'UNSAFE_URL' }] } },
    };
    render(<PublicContentManagementView />);
    await screen.findByText(/Hero Carousel Beranda/);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Draft' }));
    expect(await screen.findByText(/tidak aman/)).toBeVisible();
  });

  it('lists versions in Indonesian and can duplicate one into a new draft', async () => {
    items = [item({ id: 'd1', status: 'DRAFT', version: 2 }), item({ id: 'c1', version: 1 })];
    render(<PublicContentManagementView />);
    await screen.findByText(/Riwayat Versi Konten \(2\)/);
    await userEvent.click(screen.getByRole('button', { name: /Riwayat Versi Konten/ }));
    expect(screen.getByText('Terbit')).toBeVisible();
    expect(screen.getByText('Draf')).toBeVisible();
    expect(screen.queryByText('PUBLISHED')).toBeNull();
    await userEvent.click(screen.getAllByRole('button', { name: 'Salin jadi draf' })[1]!);
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0]![0]).toBe('/api/v1/public-content-management/c1/duplicate');
  });
});

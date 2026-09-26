import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { frontendPages } from '@/lib/frontend-pages';
import { AdminPageHeader } from './admin-page-header';
import { PageMetaProvider } from './page-meta';

const payments = frontendPages.find((page) => page.href === '/workspace/payments')!;

describe('AdminPageHeader', () => {
  it('uses the menu group of the current page as eyebrow', () => {
    render(
      <PageMetaProvider value={payments}>
        <AdminPageHeader title="Antrean Pembayaran" description="Periksa bukti transfer." />
      </PageMetaProvider>,
    );
    expect(screen.getByText('Penjualan & Keuangan')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: 'Antrean Pembayaran' })).toBeVisible();
    expect(screen.getByText('Periksa bukti transfer.')).toBeVisible();
  });

  it('lets a page override the eyebrow and renders badges and actions', () => {
    render(
      <PageMetaProvider value={payments}>
        <AdminPageHeader
          title="Detail"
          eyebrow="Kustom"
          badges={<span>Aktif</span>}
          actions={<button type="button">Segarkan</button>}
        />
      </PageMetaProvider>,
    );
    expect(screen.getByText('Kustom')).toBeVisible();
    expect(screen.queryByText('Penjualan & Keuangan')).not.toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Segarkan' })).toBeVisible();
  });

  it('renders without a shell (no page meta) and without an eyebrow', () => {
    const { container } = render(<AdminPageHeader title="Tanpa shell" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tanpa shell' })).toBeVisible();
    expect(container.querySelector('p')).toBeNull();
  });

  it('lets actions wrap under the text instead of squeezing the title', () => {
    const { container } = render(<AdminPageHeader title="Judul" actions={<span>Aksi</span>} />);
    const header = container.querySelector('header')!;
    expect(header.className).toMatch(/flex-col/);
    expect(header.className).toMatch(/xl:flex-row/);
  });

  it('flags preview pages with a badge and the explanation of what is not persisted', () => {
    const support = frontendPages.find((page) => page.href === '/support-cases')!;
    const { container } = render(
      <PageMetaProvider value={support}>
        <AdminPageHeader title="Bantuan Pelanggan" />
      </PageMetaProvider>,
    );
    expect(container.querySelector('[data-preview-badge]')).toHaveTextContent('Pratinjau');
    expect(screen.getByRole('note')).toHaveTextContent(/hilang saat API dimulai ulang/);
  });

  it('shows no preview markers on regular pages', () => {
    const { container } = render(
      <PageMetaProvider value={payments}>
        <AdminPageHeader title="Antrean Pembayaran" />
      </PageMetaProvider>,
    );
    expect(container.querySelector('[data-preview-badge]')).toBeNull();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});

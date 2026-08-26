import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataImportView } from './data-import-view';

describe('DataImportView Component', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders all table target selectors and initial steps', () => {
    render(<DataImportView />);

    expect(screen.getByText('Import Data')).toBeInTheDocument();
    expect(screen.getByText('Langkah 1 — Pilih Tabel Target')).toBeInTheDocument();
    expect(screen.getAllByText('Users / Pelanggan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Paket Kelas')).toBeInTheDocument();
    expect(screen.getByText('Kuota Member')).toBeInTheDocument();
    expect(screen.getByText('Voucher')).toBeInTheDocument();
    expect(screen.getByText('Cabang / Studio')).toBeInTheDocument();
    expect(screen.getByText('Langkah 2 — Unduh Template')).toBeInTheDocument();
    expect(screen.getByText('Langkah 3 — Unggah File')).toBeInTheDocument();
  });

  it('switches active table target when clicked', async () => {
    render(<DataImportView />);

    const packageBtn = screen.getByText('Paket Kelas').closest('button');
    expect(packageBtn).not.toBeNull();
    await userEvent.click(packageBtn!);

    expect(screen.getByText(/Template untuk:/)).toHaveTextContent('Paket Kelas');
    expect(screen.getByText(/Kolom:/)).toHaveTextContent('sessionCount');
  });

  it('handles template download click', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/data-import/templates/USERS')) {
        return new Response(new Blob(['fake-content']), {
          status: 200,
          headers: {
            'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'content-disposition': 'attachment; filename="template_import_users.xlsx"',
          },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    // Mock URL.createObjectURL / revokeObjectURL
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });

    render(<DataImportView />);

    const downloadXlsxBtn = screen.getByRole('button', { name: /Excel \(\.xlsx\)/i });
    await userEvent.click(downloadXlsxBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/data-import/templates/USERS?format=xlsx'),
        expect.anything(),
      );
    });
  });
});

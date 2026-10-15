import { fireEvent, render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { DestructiveDialog } from '../app-feedback';
import { AdminPageState, DataTable, Pagination } from './admin-ui';

describe('admin UI primitives', () => {
  it('renders semantic desktop rows and mobile cards', async () => {
    const onRowClick = vi.fn();
    const { container, getAllByText } = render(
      <DataTable
        items={[{ id: 'one', name: 'Jakarta' }]}
        rowKey={(item) => item.id}
        columns={[{ id: 'name', header: 'Cabang', cell: (item) => item.name }]}
        mobileCard={(item) => <strong>{item.name}</strong>}
        onRowClick={onRowClick}
        rowClassName={() => 'bg-emerald-50'}
        mobileCardClassName={() => 'border-l-4'}
        rowDescription={(item) => `${item.name}, aktif`}
      />,
    );
    expect(getAllByText('Jakarta')).toHaveLength(2);
    fireEvent.click(getAllByText('Jakarta')[0]!);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(container.querySelector('tbody tr')).toHaveClass('bg-emerald-50');
    expect(container.querySelector('tbody tr')).toHaveAttribute('aria-label', 'Jakarta, aktif');
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('exposes pagination and protected destructive impact accessibly', async () => {
    const previous = vi.fn();
    const { container, getByRole } = render(
      <main>
        <Pagination hasPrevious={false} hasNext onPrevious={previous} onNext={() => undefined} />
        <AdminPageState kind="stale" />
        <DestructiveDialog
          open
          title="Batalkan kelas"
          impact="Booking aktif akan dibatalkan."
          scope="Jakarta"
          onClose={() => undefined}
        >
          <button>Konfirmasi</button>
        </DestructiveDialog>
      </main>,
    );
    expect(getByRole('button', { name: /sebelumnya/i })).toBeDisabled();
    expect(getByRole('dialog', { name: 'Batalkan kelas' })).toBeTruthy();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('renders row numbering with configurable offset and toggle in DataTable', async () => {
    const { container, getByText, queryByText, rerender } = render(
      <DataTable
        items={[
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ]}
        rowKey={(item) => item.id}
        columns={[{ id: 'name', header: 'Nama', cell: (item) => item.name }]}
        rowNumberOffset={20}
      />,
    );

    expect(getByText('No.')).toBeTruthy();
    expect(getByText('21')).toBeTruthy();
    expect(getByText('22')).toBeTruthy();
    expect((await axe(container)).violations).toHaveLength(0);

    rerender(
      <DataTable
        items={[{ id: '1', name: 'Item 1' }]}
        rowKey={(item) => item.id}
        columns={[{ id: 'name', header: 'Nama', cell: (item) => item.name }]}
        showRowNumbers={false}
      />,
    );

    expect(queryByText('No.')).toBeNull();
    expect(queryByText('1')).toBeNull();
  });

  it('renders numbered pagination with active state and page change callbacks', async () => {
    const onPageChange = vi.fn();
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    const { container, getByRole, getByText } = render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={100}
        pageSize={20}
        hasPrevious={true}
        hasNext={true}
        onPrevious={onPrevious}
        onNext={onNext}
        onPageChange={onPageChange}
      />,
    );

    expect(getByText('Menampilkan 21–40 dari 100 data')).toBeTruthy();
    const activeBtn = getByRole('button', { name: 'Halaman 2' });
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
    expect(activeBtn).toBeDisabled();

    const page3Btn = getByRole('button', { name: 'Halaman 3' });
    fireEvent.click(page3Btn);
    expect(onPageChange).toHaveBeenCalledWith(3);

    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('does not repeat "dari" when the label already says "X dari Y paket"', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={20}
        pageSize={20}
        totalLabel="20 dari 20 paket"
        hasPrevious={false}
        hasNext={false}
        onPrevious={() => undefined}
        onNext={() => undefined}
      />,
    );
    const text = container.textContent ?? '';
    expect(text).toContain('20 dari 20 paket');
    expect(text).not.toMatch(/dari 20 dari/);
  });

  it('omits page buttons and formats displayLabel cleanly for cursor-based pagination', async () => {
    const { getByText, queryByRole } = render(
      <Pagination
        currentPage={3}
        totalPages={10}
        totalLabel="50 data pelanggan"
        hasPrevious={true}
        hasNext={true}
        onPrevious={() => undefined}
        onNext={() => undefined}
      />,
    );

    // Numbered buttons should NOT be rendered when onPageChange is omitted
    expect(queryByRole('button', { name: 'Halaman 1' })).toBeNull();
    expect(queryByRole('button', { name: 'Halaman 2' })).toBeNull();
    expect(queryByRole('button', { name: 'Halaman 3' })).toBeNull();

    // displayLabel should automatically include active page and totalLabel
    expect(getByText(/Halaman 3/)).toBeTruthy();
    expect(getByText('50 data pelanggan')).toBeTruthy();
  });
});


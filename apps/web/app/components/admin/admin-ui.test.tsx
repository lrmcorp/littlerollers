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
});

import { fireEvent, render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { AdminPageState, DataTable, DestructiveActionDialog, Pagination } from './admin-ui';

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
      />,
    );
    expect(getAllByText('Jakarta')).toHaveLength(2);
    fireEvent.click(getAllByText('Jakarta')[0]!);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('exposes pagination and protected destructive impact accessibly', async () => {
    const previous = vi.fn();
    const { container, getByRole } = render(
      <main>
        <Pagination hasPrevious={false} hasNext onPrevious={previous} onNext={() => undefined} />
        <AdminPageState kind="stale" />
        <DestructiveActionDialog
          open
          title="Batalkan kelas"
          impact="Booking aktif akan dibatalkan."
          scope="Jakarta"
          onClose={() => undefined}
        >
          <button>Konfirmasi</button>
        </DestructiveActionDialog>
      </main>,
    );
    expect(getByRole('button', { name: /sebelumnya/i })).toBeDisabled();
    expect(getByRole('dialog', { name: 'Batalkan kelas' })).toBeTruthy();
    expect((await axe(container)).violations).toHaveLength(0);
  });
});

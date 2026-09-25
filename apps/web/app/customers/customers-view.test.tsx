import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerClient } from './customer-client';
import { CustomersView } from './customers-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: {
      globalCapabilities: ['customer:credential:initialize'],
      branches: [{ id: 'b1', name: 'Gading Serpong', code: 'DD-GG' }],
    },
  }),
}));

describe('CustomersView create form', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(customerClient, 'list').mockResolvedValue({
      items: [],
      summary: { total: 0 },
      page: { hasMore: false, nextCursor: null },
    } as never);
  });

  it('does not ask staff for a step-up token or a mandatory reason', async () => {
    const create = vi.spyOn(customerClient, 'create').mockResolvedValue({} as never);
    render(<CustomersView />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Buat pelanggan aktif' }));

    expect(screen.queryByLabelText(/Step-up/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Catatan \(opsional\)/)).not.toBeRequired();

    await user.type(screen.getByLabelText('Nama'), 'Budi Santoso');
    await user.type(screen.getByLabelText('Email'), 'budi@example.test');
    await user.type(screen.getByLabelText('Telepon'), '+628123456789');
    await user.type(screen.getByLabelText('Password awal'), 'Rahasia-12345');
    await user.type(screen.getByLabelText('Ulangi password'), 'Rahasia-12345');
    await user.click(screen.getByRole('button', { name: 'Simpan pelanggan' }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const [payload, options] = create.mock.calls[0]!;
    expect(payload).toMatchObject({ displayName: 'Budi Santoso', email: 'budi@example.test' });
    expect(payload.reason).toBeUndefined();
    expect(options.stepUpToken).toBeUndefined();
  });

  it('lists customers in the shared table with a consistent detail action', async () => {
    (customerClient.list as unknown as { mockResolvedValue(v: unknown): void }).mockResolvedValue({
      items: [
        {
          id: 'c-1',
          displayName: 'Amanda',
          email: 'amanda@example.test',
          phoneE164: '+62811',
          status: 'PENDING_ACTIVATION',
          verificationStatus: 'ACTION_REQUIRED',
          activePackageCount: 2,
          purchasedSessions: 20,
          _count: { purchases: 3, customerBookings: 5 },
        },
      ],
      summary: { total: 1 },
      page: { hasMore: false, nextCursor: null },
    });
    render(<CustomersView />);
    expect((await screen.findAllByText('Amanda'))[0]).toBeVisible();
    const detail = screen.getAllByRole('link', { name: 'Lihat detail' })[0]!;
    expect(detail).toHaveAttribute('href', '/customers/c-1');
    expect(screen.queryByText('Buka profil')).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'No.' })).toBeVisible();
  });
});

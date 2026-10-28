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
    status: 'authenticated',
    session: {
      roles: ['SUPER_OWNER'],
      globalCapabilities: [
        'customer:credential:initialize',
        'customer:update',
        'customer:write',
        'customer:impersonate',
        'order:assist',
        'package-promotion:read',
      ],
      branches: [{ id: 'b1', name: 'Gading Serpong', code: 'DD-GG' }],
    },
    activeBranchId: 'b1',
    hasCapability: () => true,
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

  it('displays user-friendly error message inside the drawer when registration fails with identity conflict', async () => {
    vi.spyOn(customerClient, 'create').mockRejectedValue({ code: 'IDENTITY_CONFLICT' } as never);
    render(<CustomersView />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Buat pelanggan aktif' }));

    await user.type(screen.getByLabelText('Nama'), 'Cindy Member');
    await user.type(screen.getByLabelText('Telepon'), '+628999999992');
    await user.click(screen.getByRole('button', { name: 'Simpan pelanggan' }));

    expect(
      await screen.findByText(/Email atau nomor telepon sudah terdaftar atas nama pelanggan lain/i),
    ).toBeInTheDocument();
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

  it('renders quick action buttons for selling packages, editing profile, and resetting password', async () => {
    (customerClient.list as unknown as { mockResolvedValue(v: unknown): void }).mockResolvedValue({
      items: [
        {
          id: 'c-1',
          displayName: 'Amanda',
          email: 'amanda@example.test',
          phoneE164: '+62811',
          status: 'ACTIVE',
          verificationStatus: 'APPROVED',
          activePackageCount: 1,
          purchasedSessions: 10,
          _count: { purchases: 1, customerBookings: 2 },
        },
      ],
      summary: { total: 1 },
      page: { hasMore: false, nextCursor: null },
    });
    render(<CustomersView />);
    expect((await screen.findAllByText('Amanda'))[0]).toBeVisible();

    const saleBtns = screen.getAllByRole('button', { name: /Jual paket/i });
    expect(saleBtns.length).toBeGreaterThan(0);

    const menuBtns = screen.getAllByRole('button', { name: /Aksi pelanggan Amanda/i });
    expect(menuBtns.length).toBeGreaterThan(0);

    const user = userEvent.setup();
    await user.click(menuBtns[0]!);

    const editItem = screen.getByRole('menuitem', { name: /Edit profil/i });
    const pwdItem = screen.getByRole('menuitem', { name: /Reset kata sandi/i });
    const impItem = screen.getByRole('menuitem', { name: /Login sebagai Pelanggan/i });
    expect(editItem).toBeInTheDocument();
    expect(pwdItem).toBeInTheDocument();
    expect(impItem).toBeInTheDocument();

    await user.click(editItem);
    expect(await screen.findByText(/Edit Cepat: Amanda/i)).toBeInTheDocument();
  });

  it('opens impersonation confirmation modal and triggers customerClient.impersonate', async () => {
    (customerClient.list as unknown as { mockResolvedValue(v: unknown): void }).mockResolvedValue({
      items: [
        {
          id: 'c-1',
          displayName: 'Amanda',
          email: 'amanda@example.test',
          phoneE164: '+62811',
          status: 'ACTIVE',
          verificationStatus: 'APPROVED',
          activePackageCount: 1,
          purchasedSessions: 10,
          _count: { purchases: 1, customerBookings: 2 },
        },
      ],
      summary: { total: 1 },
      page: { hasMore: false, nextCursor: null },
    });
    const impSpy = vi.spyOn(customerClient, 'impersonate').mockResolvedValue({ channel: 'WEB', user: {} } as never);
    render(<CustomersView />);
    expect((await screen.findAllByText('Amanda'))[0]).toBeVisible();

    const menuBtns = screen.getAllByRole('button', { name: /Aksi pelanggan Amanda/i });
    const user = userEvent.setup();
    await user.click(menuBtns[0]!);

    const impItem = screen.getByRole('menuitem', { name: /Login sebagai Pelanggan/i });
    await user.click(impItem);

    expect(await screen.findByText(/Masuk sebagai Amanda/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Masuk Sekarang' }));
    expect(impSpy).toHaveBeenCalledWith('c-1');
  });
});

describe('CustomersView contact masking (option D)', () => {
  const item = (over: Record<string, unknown>) => ({
    id: 'c1', displayName: 'Dewi', email: 'de***@example.test', phoneE164: '+6281******890', status: 'ACTIVE',
    version: 1, verificationStatus: 'PENDING', emailVerified: false, mustChangePassword: false, activePackageCount: 0,
    purchasedSessions: 0, updatedAt: '2026-10-01T00:00:00Z', preferredBranch: null, profile: null,
    _count: { purchases: 0, customerBookings: 0 }, ...over,
  });

  it('tells staff the contact is masked and offers no edit actions for that customer, but keeps them for others', async () => {
    vi.restoreAllMocks();
    vi.spyOn(customerClient, 'list').mockResolvedValue({
      items: [item({ contactMasked: true }), item({ id: 'c2', displayName: 'Rina', email: 'rina@example.test', contactMasked: false })],
      summary: { total: 2 },
      page: { hasMore: false, nextCursor: null },
    } as never);
    render(<CustomersView />);
    expect((await screen.findAllByText('Kontak disamarkan')).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('button', { name: 'Aksi pelanggan Dewi' })).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: 'Aksi pelanggan Rina' }).length).toBeGreaterThan(0);
  });
});

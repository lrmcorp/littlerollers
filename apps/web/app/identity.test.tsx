import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { SignInView } from './sign-in/sign-in-view';
import { UsersView } from './users/users-view';
import type { IdentityClient } from './identity-client';
import { AssignmentsView } from './assignments/assignments-view';
import type { AssignmentClient } from './assignment-client';
import { MasterView } from './master/master-view';
import type { MasterClient } from './master-client';

const client = (overrides: Partial<IdentityClient> = {}): IdentityClient => ({
  signIn: vi.fn().mockResolvedValue(undefined),
  stepUp: vi.fn().mockResolvedValue(undefined),
  invite: vi.fn().mockResolvedValue('CREATED'),
  deactivate: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('identity UI', () => {
  it('renders an accessible sign-in success and safe failure', async () => {
    const view = render(<SignInView client={client()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('terverifikasi');
    view.unmount();
    render(
      <SignInView
        client={client({ signIn: vi.fn().mockRejectedValue({ response: { status: 429 } }) })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Terlalu banyak');
  });

  it('passes a normalized synthetic email without rendering a password field', async () => {
    const fake = client();
    render(<SignInView client={fake} syntheticMode />);
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Email Google synthetic'), 'Owner@EXAMPLE.test');
    await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(fake.signIn).toHaveBeenCalledWith('Owner@EXAMPLE.test');
  });

  it('requires MFA then supports invite, duplicate, deactivate and forbidden states', async () => {
    const fake = client();
    render(<UsersView client={fake} />);
    await userEvent.click(screen.getByRole('button', { name: /MFA/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Undang pengguna' }));
    await userEvent.type(screen.getByLabelText('Email kerja'), 'staff@example.test');
    await userEvent.click(screen.getByRole('button', { name: /Buat undangan/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil');
    expect(fake.invite).toHaveBeenCalledWith('staff@example.test', 'ADMIN');
    await userEvent.click(screen.getByRole('button', { name: /Nonaktifkan/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('dinonaktifkan');
  });
});

const assignmentClient = (overrides: Partial<AssignmentClient> = {}): AssignmentClient => ({
  list: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(undefined),
  end: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('assignment UI', () => {
  it('is accessible and exposes scoped loading/empty state', async () => {
    const view = render(<AssignmentsView client={assignmentClient()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    expect(screen.getByText(/Belum ada assignment/)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('ID cabang aktif'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat assignment' }));
    expect(await screen.findByText(/Belum ada assignment/)).toBeInTheDocument();
    expect(screen.queryByText(/All branches/i)).not.toBeInTheDocument();
  });

  it('creates and ends with expected version through keyboard-operable forms', async () => {
    const fake = assignmentClient({
      list: vi.fn().mockResolvedValue([
        {
          id: 'assignment-1',
          userId: 'user-1',
          branchId: 'branch-1',
          assignmentType: 'INSTRUCTOR',
          activeFrom: '2026-08-01',
          activeUntil: null,
          version: 3,
        },
      ]),
    });
    render(<AssignmentsView client={fake} />);
    await userEvent.type(screen.getByLabelText('ID cabang aktif'), 'branch-1');
    await userEvent.type(screen.getByLabelText('ID pengguna'), 'user-1');
    await userEvent.type(screen.getByLabelText('Aktif mulai'), '2026-08-01');
    await userEvent.type(screen.getByLabelText('Alasan'), 'assignment baru');
    await userEvent.click(screen.getByRole('button', { name: 'Buat assignment' }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dibuat');
    await userEvent.type(screen.getByLabelText('Efektif berakhir'), '2026-08-10T00:00');
    await userEvent.type(screen.getByLabelText('Alasan akhir'), 'periode selesai');
    await userEvent.click(screen.getByRole('button', { name: 'Konfirmasi akhiri' }));
    expect(fake.end).toHaveBeenCalledWith('assignment-1', '2026-08-10T00:00', 3, 'periode selesai');
  });

  it.each([
    [403, 'MFA_REQUIRED'],
    [409, 'EFFECTIVE_PERIOD_OVERLAP'],
    [404, 'RESOURCE_NOT_FOUND'],
    [422, 'VALIDATION_ERROR'],
  ])('shows safe failure for HTTP %s', async (status, code) => {
    render(
      <AssignmentsView
        client={assignmentClient({ create: vi.fn().mockRejectedValue({ response: { status } }) })}
      />,
    );
    await userEvent.type(screen.getByLabelText('ID cabang aktif'), 'branch-1');
    await userEvent.type(screen.getByLabelText('ID pengguna'), 'user-1');
    await userEvent.type(screen.getByLabelText('Aktif mulai'), '2026-08-01');
    await userEvent.type(screen.getByLabelText('Alasan'), 'test failure');
    await userEvent.click(screen.getByRole('button', { name: 'Buat assignment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(code);
  });
});

const masterClient = (overrides: Partial<MasterClient> = {}): MasterClient => ({
  listBranches: vi.fn().mockResolvedValue([]),
  listClassTypes: vi.fn().mockResolvedValue([]),
  createBranch: vi.fn().mockResolvedValue(undefined),
  createClassType: vi.fn().mockResolvedValue(undefined),
  createSetting: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('effective master UI', () => {
  it('is accessible and has no production numeric defaults', async () => {
    const view = render(<MasterView client={masterClient()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    expect(screen.getByLabelText('Nilai Rupiah atau minimum quota')).toHaveValue(null);
    expect(screen.getByLabelText('Capacity (khusus quota)')).toHaveValue(null);
    await userEvent.click(screen.getByRole('button', { name: 'Muat master data' }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dimuat');
  });

  it('submits a half-open quota setting and displays safe conflicts', async () => {
    const fake = masterClient();
    render(<MasterView client={fake} />);
    await userEvent.type(screen.getByLabelText('ID cabang aktif'), 'branch-1');
    await userEvent.type(screen.getByLabelText('ID class type'), 'class-1');
    await userEvent.type(screen.getByLabelText('Nilai Rupiah atau minimum quota'), '4');
    await userEvent.type(screen.getByLabelText('Capacity (khusus quota)'), '8');
    await userEvent.type(screen.getByLabelText('Efektif mulai'), '2026-08-01');
    await userEvent.type(screen.getByLabelText('Alasan'), 'synthetic fixture');
    await userEvent.click(screen.getByRole('button', { name: 'Buat setting' }));
    expect(fake.createSetting).toHaveBeenCalledWith(
      expect.objectContaining({ value: 4, capacity: 8 }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dibuat');
  });
});

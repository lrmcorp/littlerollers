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
import { ActivateAccountView } from './activate-account/activate-account-view';
import { ForgotPasswordView } from './forgot-password/forgot-password-view';
import { ResetPasswordView } from './reset-password/reset-password-view';
import { SecurityView } from './account/security/security-view';
import { AuditView } from './audit/audit-view';

const client = (overrides: Partial<IdentityClient> = {}): IdentityClient => ({
  signIn: vi.fn().mockResolvedValue(undefined),
  signInWithPassword: vi.fn().mockResolvedValue(undefined),
  signInWithGoogleToken: vi.fn().mockResolvedValue(undefined),
  activatePassword: vi.fn().mockResolvedValue(undefined),
  requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue(undefined),
  securityStatus: vi.fn().mockResolvedValue({
    passwordEnabled: true,
    passwordChangedAt: null,
  }),
  changePassword: vi.fn().mockResolvedValue(undefined),
  listUsers: vi.fn().mockResolvedValue({ items: [], page: { nextCursor: null, hasMore: false } }),
  lookupUsers: vi.fn().mockResolvedValue({ items: [], page: { nextCursor: null, hasMore: false } }),
  createAuditExport: vi.fn(),
  getAuditExport: vi.fn(),
  authorizeAuditExport: vi.fn(),
  getUser: vi.fn(),
  roleCatalog: vi.fn().mockResolvedValue([
    {
      role: 'FINANCE',
      capabilities: ['user:read'],
      assignable: true,
      readOnly: false,
      scope: 'GLOBAL',
    },
  ]),
  listAudit: vi.fn().mockResolvedValue([]),
  listAuditLogs: vi.fn().mockResolvedValue({
    items: [],
    page: { nextCursor: null, hasMore: false },
  }),
  invite: vi.fn().mockResolvedValue('CREATED'),
  requestPasswordSetup: vi.fn().mockResolvedValue(undefined),
  updateRoles: vi.fn(),
  deactivate: vi.fn().mockResolvedValue(undefined),
  reactivate: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('identity UI', () => {
  it('renders an accessible sign-in success and safe failure', async () => {
    const view = render(<SignInView client={client()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await userEvent.type(screen.getByLabelText('Email'), 'owner@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-password-123');
    await userEvent.click(screen.getByRole('button', { name: /Masuk dengan email/ }));
    expect(await screen.findByText('Identitas terverifikasi.')).toBeVisible();
    view.unmount();
    render(
      <SignInView
        client={client({
          signInWithPassword: vi.fn().mockRejectedValue({ response: { status: 429 } }),
        })}
      />,
    );
    await userEvent.type(screen.getByLabelText('Email'), 'owner@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'incorrect-password');
    await userEvent.click(screen.getByRole('button', { name: /Masuk dengan email/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Terlalu banyak');
  });

  it('supports password visibility without exposing synthetic environment controls', async () => {
    const fake = client();
    render(<SignInView client={fake} />);
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Lihat' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.queryByText(/synthetic non-production/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Email Google synthetic/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Login Google menunggu konfigurasi/i)).toBeVisible();
  });

  it('supports authoritative invite, detail and deactivate states', async () => {
    const user = {
      id: 'user-1',
      displayName: 'Staff Finance',
      status: 'ACTIVE' as const,
      version: 1,
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
      roles: [],
      directRoles: [],
      assignmentRoles: [],
      effectiveCapabilities: [],
    };
    const fake = client({
      listUsers: vi
        .fn()
        .mockResolvedValue({ items: [user], page: { nextCursor: null, hasMore: false } }),
      getUser: vi.fn().mockResolvedValue(user),
    });
    render(<UsersView client={fake} />);
    expect((await screen.findAllByText('Staff Finance'))[0]).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Buat pengguna internal' }));
    await userEvent.type(screen.getByLabelText('Nama tampilan'), 'Staff Baru');
    await userEvent.type(screen.getByLabelText('Email kerja'), 'staff@example.test');
    await userEvent.click(screen.getByRole('checkbox', { name: /Finance/ }));
    await userEvent.click(screen.getByRole('button', { name: /Buat pengguna dan kirim aktivasi/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil');
    expect(fake.invite).toHaveBeenCalledWith('staff@example.test', 'Staff Baru', [
      { role: 'FINANCE', branchId: null },
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Lihat detail' }));
    await userEvent.type(screen.getByLabelText('Alasan deaktivasi'), 'akses selesai');
    await userEvent.click(screen.getByRole('button', { name: /Konfirmasi nonaktifkan/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('dinonaktifkan');
  });

  it('filters the masked global access audit without exposing credential data', async () => {
    const fake = client({
      listAuditLogs: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'audit-1',
            occurredAt: '2026-07-26T08:00:00.000Z',
            action: 'security.user_roles_changed',
            actorId: 'actor-1',
            targetUserId: 'target-1',
            branchId: 'branch-1',
            objectType: 'User',
            objectId: 'target-1',
            correlationId: 'correlation-1',
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    });
    const view = render(<AuditView client={fake} />);
    await userEvent.type(screen.getByLabelText('Tindakan'), 'security.user');
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan filter' }));
    expect((await screen.findAllByText('security.user_roles_changed'))[0]).toBeVisible();
    expect(fake.listAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'security.user' }),
    );
    expect(view.container).not.toHaveTextContent('super-secret-value');
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('keeps password recovery enumeration-safe and validates matching reset values', async () => {
    const fake = client();
    const forgot = render(<ForgotPasswordView client={fake} />);
    expect((await axe(forgot.container)).violations).toHaveLength(0);
    await userEvent.type(screen.getByLabelText('Email'), 'member@example.test');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim tautan reset' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Jika akun cocok');
    forgot.unmount();

    window.history.replaceState({}, '', '/reset-password?token=one-time-token');
    render(<ResetPasswordView client={fake} />);
    await userEvent.type(screen.getByLabelText('Password baru'), 'a-new-secure-password');
    await userEvent.type(screen.getByLabelText('Ulangi password baru'), 'different-password');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan password baru' }));
    expect(fake.resetPassword).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Password harus sama');
  });

  it('activates an invitation and exposes password security management', async () => {
    const fake = client();
    window.history.replaceState({}, '', '/activate-account?token=activation-token');
    const activation = render(<ActivateAccountView client={fake} />);
    await userEvent.type(screen.getByLabelText('Password'), 'a-secure-invite-password');
    await userEvent.type(screen.getByLabelText('Ulangi password'), 'a-secure-invite-password');
    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan akun' }));
    expect(fake.activatePassword).toHaveBeenCalledWith(
      'activation-token',
      'a-secure-invite-password',
    );
    activation.unmount();

    const security = render(<SecurityView client={fake} />);
    expect(await screen.findByText('Password aktif')).toBeVisible();
    expect((await axe(security.container)).violations).toHaveLength(0);
  });
});

const assignmentClient = (overrides: Partial<AssignmentClient> = {}): AssignmentClient => ({
  list: vi.fn().mockResolvedValue([]),
  listUsers: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(undefined),
  end: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('assignment UI', () => {
  const branches = [{ id: 'branch-1', code: 'GG', name: 'Green Garden' }];
  it('is accessible and exposes scoped loading/empty state', async () => {
    const view = render(<AssignmentsView client={assignmentClient()} branchOptions={branches} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    expect(screen.getByText(/Belum ada assignment/)).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Cabang aktif'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat assignment' }));
    expect(await screen.findByText(/Belum ada assignment/)).toBeInTheDocument();
    expect(screen.queryByText(/All branches/i)).not.toBeInTheDocument();
  });

  it('creates and ends with expected version through keyboard-operable forms', async () => {
    const fake = assignmentClient({
      listUsers: vi.fn().mockResolvedValue([{ id: 'user-1', displayName: 'Instructor Satu' }]),
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
    render(<AssignmentsView client={fake} branchOptions={branches} />);
    await userEvent.selectOptions(screen.getByLabelText('Cabang aktif'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat assignment' }));
    await userEvent.selectOptions(screen.getByLabelText('Pengguna'), 'user-1');
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
    [403, 'FORBIDDEN'],
    [409, 'EFFECTIVE_PERIOD_OVERLAP'],
    [404, 'RESOURCE_NOT_FOUND'],
    [422, 'VALIDATION_ERROR'],
  ])('shows safe failure for HTTP %s', async (status, code) => {
    render(
      <AssignmentsView
        branchOptions={branches}
        client={assignmentClient({
          listUsers: vi.fn().mockResolvedValue([{ id: 'user-1', displayName: 'Instructor Satu' }]),
          create: vi.fn().mockRejectedValue({ response: { status } }),
        })}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Cabang aktif'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat assignment' }));
    await userEvent.selectOptions(screen.getByLabelText('Pengguna'), 'user-1');
    await userEvent.type(screen.getByLabelText('Aktif mulai'), '2026-08-01');
    await userEvent.type(screen.getByLabelText('Alasan'), 'test failure');
    await userEvent.click(screen.getByRole('button', { name: 'Buat assignment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(code);
  });
});

const masterClient = (overrides: Partial<MasterClient> = {}): MasterClient => ({
  listBranches: vi.fn().mockResolvedValue([]),
  listClassTypes: vi.fn().mockResolvedValue([]),
  listSettings: vi.fn().mockResolvedValue([]),
  createBranch: vi.fn().mockResolvedValue(undefined),
  createClassType: vi.fn().mockResolvedValue(undefined),
  deactivateBranch: vi.fn().mockResolvedValue(undefined),
  deactivateClassType: vi.fn().mockResolvedValue(undefined),
  createSetting: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('effective master UI', () => {
  it('is accessible and has no production numeric defaults', async () => {
    const view = render(<MasterView client={masterClient()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    expect(screen.getByLabelText('Minimum peserta')).toHaveValue(null);
    expect(screen.getByLabelText('Kapasitas maksimum')).toHaveValue(null);
    await userEvent.click(screen.getByRole('button', { name: 'Muat master data' }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dimuat');
  });

  it('submits a half-open quota setting and displays safe conflicts', async () => {
    const fake = masterClient({
      listBranches: vi.fn().mockResolvedValue([
        {
          id: 'branch-1',
          code: 'DD-JKT',
          name: 'Daily Dose Jakarta',
          timezone: 'Asia/Jakarta',
          active: true,
          version: 0,
        },
      ]),
      listClassTypes: vi
        .fn()
        .mockResolvedValue([
          { id: 'class-1', code: 'REFORMER', name: 'Reformer Pilates', active: true, version: 0 },
        ]),
    });
    render(<MasterView client={fake} />);
    await userEvent.click(screen.getByRole('button', { name: 'Muat master data' }));
    await screen.findByText('Daily Dose Jakarta');
    await userEvent.type(screen.getByLabelText('Minimum peserta'), '4');
    await userEvent.type(screen.getByLabelText('Kapasitas maksimum'), '8');
    await userEvent.type(screen.getByLabelText('Efektif mulai'), '2026-08-01');
    await userEvent.type(screen.getByLabelText('Alasan perubahan'), 'Penyesuaian operasional');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan konfigurasi' }));
    expect(fake.createSetting).toHaveBeenCalledWith(
      expect.objectContaining({ value: 4, capacity: 8 }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dibuat');
  });
});

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerClient } from './customer-client';
import { CustomerDetailView } from './[id]/customer-detail-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/customers/c1',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: { branches: [] },
    hasCapability: () => false,
    activeBranch: null,
  }),
}));

const detail = {
  id: 'c1',
  displayName: 'Dewi',
  email: 'dewi@example.test',
  phoneE164: '+628123456789',
  status: 'ACTIVE',
  stoppedAt: null,
  preferredBranch: null,
  profile: null,
  verificationStatus: 'ACTION_REQUIRED',
  createdAt: '2026-10-01T00:00:00.000Z',
  identities: [],
  identityDocuments: [],
  passwordCredential: null,
  purchases: [],
  customerBookings: [],
  voucherRedemptions: [],
  notifications: [],
  customerPackages: [
    { id: 'p1', status: 'EXPIRED', remainingSessions: 0, usedSessions: 4, package: { name: 'Paket lama' } },
    { id: 'p2', status: 'FROZEN', remainingSessions: 6, usedSessions: 2, package: { name: 'Belum dibayar' } },
  ],
  _count: { purchases: 0, customerBookings: 0, customerPackages: 2, voucherRedemptions: 0, notifications: 0 },
};

describe('CustomerDetailView konsistensi status', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(customerClient, 'detail').mockResolvedValue(detail as never);
  });

  it('menghitung hanya paket yang benar-benar aktif pada tab paket', async () => {
    render(<CustomerDetailView id="c1" />);
    expect(await screen.findByRole('button', { name: /Paket & Sesi \(0 aktif\)/ })).toBeVisible();
    expect(screen.getByText('Pelanggan belum memiliki paket aktif saat ini.')).toBeVisible();
  });

  it('memberi label jelas pada status akun dan status verifikasi', async () => {
    render(<CustomerDetailView id="c1" />);
    expect(await screen.findByText(/Status Akun:\s*AKTIF/i)).toBeVisible();
    expect(screen.getAllByText(/Verifikasi Identitas:\s*PERLU PERBAIKAN/i).length).toBeGreaterThan(0);
  });

  it('tidak menghitung paket dengan status ACTIVE jika remainingSessions 0', async () => {
    vi.spyOn(customerClient, 'detail').mockResolvedValue({
      ...detail,
      customerPackages: [
        { id: 'p3', status: 'ACTIVE', remainingSessions: 0, usedSessions: 8, package: { name: 'Paket Habis' } },
      ],
    } as never);
    render(<CustomerDetailView id="c1" />);
    expect(await screen.findByRole('button', { name: /Paket & Sesi \(0 aktif\)/ })).toBeVisible();
    expect(screen.getByText('Pelanggan belum memiliki paket aktif saat ini.')).toBeVisible();
  });
});

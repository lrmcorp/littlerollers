import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuideView } from './guide-view';

let mockSession: any = null;

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: mockSession,
  }),
}));

describe('GuideView', () => {
  beforeEach(() => {
    mockSession = null;
  });

  it('renders guide page title and customer guide role for public visitors without exposing staff tabs', () => {
    render(<GuideView />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Panduan Penggunaan Aplikasi Daily Dose',
    );
    expect(screen.getByText('Pelanggan / Member')).toBeVisible();
    expect(
      screen.queryByRole('navigation', { name: 'Pilih Peran Pengguna' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('2. Front Desk & Cabang')).not.toBeInTheDocument();
    expect(screen.queryByText('3. Finance & Kasir')).not.toBeInTheDocument();
    expect(screen.queryByText('4. Super Owner & Eksekutif')).not.toBeInTheDocument();
  });

  it('exposes internal role tabs and switches content for authenticated staff', () => {
    mockSession = {
      user: { id: 'staff-1', displayName: 'Staff Daily Dose', role: 'ADMIN' },
      roles: [{ role: 'ADMIN', branchId: null }],
    };

    render(<GuideView />);

    expect(screen.getByText('1. Pelanggan / Member')).toBeVisible();
    expect(screen.getByText('2. Front Desk & Cabang')).toBeVisible();
    expect(screen.getByText('3. Finance & Kasir')).toBeVisible();
    expect(screen.getByText('4. Super Owner & Eksekutif')).toBeVisible();

    // Click Front Desk Tab
    fireEvent.click(screen.getByText('2. Front Desk & Cabang'));
    expect(screen.getByRole('heading', { name: 'Front Desk & Operasional Cabang' })).toBeVisible();
    expect(screen.getByText('1. Scanner QR Code Kehadiran Member')).toBeVisible();

    // Click Finance Tab
    fireEvent.click(screen.getByText('3. Finance & Kasir'));
    expect(screen.getByRole('heading', { name: 'Finance & Accounting' })).toBeVisible();
    expect(screen.getByText('1. Verifikasi & Approval Pembayaran')).toBeVisible();

    // Click Super Owner Tab
    fireEvent.click(screen.getByText('4. Super Owner & Eksekutif'));
    expect(
      screen.getByRole('heading', { name: 'Super Owner & Manajemen Eksekutif' }),
    ).toBeVisible();
    expect(screen.getByText('1. Executive Multi-Branch Command Center')).toBeVisible();
  });

  it('filters sections dynamically via search input', () => {
    render(<GuideView />);

    const searchInput = screen.getByPlaceholderText(/Cari panduan/i);
    fireEvent.change(searchInput, { target: { value: 'Reschedule' } });

    expect(screen.getByText('4. Reschedule & Check-in QR di Studio')).toBeVisible();
    expect(
      screen.queryByText('1. Registrasi & Verifikasi Identitas (KYC)'),
    ).not.toBeInTheDocument();
  });
});

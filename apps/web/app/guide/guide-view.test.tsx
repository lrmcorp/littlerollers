import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuideView } from './guide-view';

describe('GuideView', () => {
  it('renders guide page title and role switcher tabs', () => {
    render(<GuideView />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Panduan Penggunaan Aplikasi Daily Dose',
    );
    expect(screen.getByText('1. Pelanggan / Member')).toBeVisible();
    expect(screen.getByText('2. Front Desk & Cabang')).toBeVisible();
    expect(screen.getByText('3. Finance & Kasir')).toBeVisible();
    expect(screen.getByText('4. Super Owner & Eksekutif')).toBeVisible();
  });

  it('switches content when clicking role tabs', () => {
    render(<GuideView />);

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

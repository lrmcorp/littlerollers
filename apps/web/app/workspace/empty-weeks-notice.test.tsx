import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ClassSlotClient } from '../api-clients/class-slot-client';
import { EmptyWeeksNotice } from './empty-weeks-notice';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const now = new Date('2026-10-26T03:00:00Z'); // Senin 26 Okt 2026
const slot = (id: string, isoStart: string, status = 'PUBLISHED') => ({
  id,
  startAt: new Date(isoStart),
  endAt: new Date(new Date(isoStart).getTime() + 3600_000),
  status,
});
const clientWith = (slots: unknown[]) =>
  ({ discover: vi.fn().mockResolvedValue({ slots, classTypes: [], instructors: [], studios: [] }) }) as unknown as ClassSlotClient;

describe('EmptyWeeksNotice', () => {
  it('shows a count per week and warns about every empty week with a link to fill it', async () => {
    const client = clientWith([
      slot('a', '2026-10-27T02:00:00Z'),
      slot('b', '2026-10-28T02:00:00Z'),
      slot('c', '2026-11-10T02:00:00Z'), // minggu 3
      slot('x', '2026-11-03T02:00:00Z', 'CANCELLED'), // dibatalkan tidak dihitung
    ]);
    render(<EmptyWeeksNotice branchId="b1" timezone="Asia/Jakarta" client={client} initialNow={now} />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/2 minggu dalam empat minggu ke depan belum punya kelas/);
    expect(within(alert).getByRole('link', { name: 'Isi pakai jadwal rutin' })).toHaveAttribute('href', '/workspace/classes/rutin');
    expect(within(alert).getByRole('link', { name: 'Isi pakai salin jadwal' })).toHaveAttribute('href', '/workspace/classes/salin');
    expect(screen.getAllByText(/: Kosong/)).toHaveLength(2);
    expect(screen.getByText(/2 kelas/)).toBeVisible();
  });

  it('shows no warning when every week has classes', async () => {
    const client = clientWith([
      slot('a', '2026-10-27T02:00:00Z'),
      slot('b', '2026-11-03T02:00:00Z'),
      slot('c', '2026-11-10T02:00:00Z'),
      slot('d', '2026-11-17T02:00:00Z'),
    ]);
    render(<EmptyWeeksNotice branchId="b1" timezone="Asia/Jakarta" client={client} initialNow={now} />);
    await screen.findByRole('region', { name: 'Jadwal empat minggu ke depan' });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Kosong')).toBeNull();
  });

  it('hides the fill link without permission to manage classes', async () => {
    render(<EmptyWeeksNotice branchId="b1" timezone="Asia/Jakarta" client={clientWith([])} initialNow={now} canFill={false} />);
    await screen.findByRole('alert');
    expect(screen.queryByRole('link', { name: 'Isi pakai salin jadwal' })).toBeNull();
  });
});

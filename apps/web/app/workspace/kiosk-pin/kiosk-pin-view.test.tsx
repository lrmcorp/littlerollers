import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../../components/app-feedback';
import { KioskPinView } from './kiosk-pin-view';
import type { KioskPinClient } from './kiosk-pin-client';

const branches = [
  { branchId: 'b1', code: 'DD-GG', name: 'Daily Dose Green Garden', configured: false, updatedAt: null },
  { branchId: 'b2', code: 'DD-MK', name: 'Daily Dose Muara Karang', configured: true, updatedAt: '2026-10-20T03:00:00Z' },
];

const clientWith = (overrides: Partial<KioskPinClient> = {}): KioskPinClient => ({
  list: vi.fn().mockResolvedValue({ items: branches }),
  rotate: vi.fn().mockResolvedValue({ branchId: 'b1', code: 'DD-GG', pin: '482913', updatedAt: '2026-10-27T03:00:00Z' }),
  ...overrides,
});

const renderView = (client: KioskPinClient) =>
  render(
    <AppFeedbackProvider>
      <KioskPinView client={client} />
    </AppFeedbackProvider>,
  );

describe('KioskPinView', () => {
  it('lists each branch with whether its tablet is locked, never a PIN', async () => {
    renderView(clientWith());
    expect(await screen.findByText('Daily Dose Green Garden')).toBeVisible();
    expect(screen.getByText(/Belum ada PIN/)).toBeVisible();
    expect(screen.getByText('Terkunci')).toBeVisible();
    expect(screen.getByText('PIN aktif')).toBeVisible();
    expect(document.body.textContent).not.toMatch(/\b\d{6}\b/);
  });

  it('asks before creating a PIN, then shows it once with a copy button', async () => {
    const user = userEvent.setup();
    const client = clientWith();
    renderView(client);
    await screen.findByText('Daily Dose Green Garden');

    await user.click(screen.getByRole('button', { name: 'Buat PIN' }));
    const dialog = await screen.findByRole('dialog', { name: /Buat PIN kiosk Daily Dose Green Garden/ });
    expect(client.rotate).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Buat PIN' }));

    await waitFor(() => expect(client.rotate).toHaveBeenCalledWith('b1'));
    const card = await screen.findByRole('status', { name: 'PIN baru' });
    expect(within(card).getByText('482913')).toBeVisible();
    expect(within(card).getByText(/tidak akan ditampilkan lagi/)).toBeVisible();

    await user.click(within(card).getByRole('button', { name: 'Tutup' }));
    expect(screen.queryByText('482913')).toBeNull();
  });

  it('warns that changing a PIN locks every tablet already open, and can be cancelled', async () => {
    const user = userEvent.setup();
    const client = clientWith();
    renderView(client);
    await screen.findByText('Daily Dose Muara Karang');
    await user.click(screen.getByRole('button', { name: 'Ganti PIN' }));
    const dialog = await screen.findByRole('dialog', { name: /Ganti PIN kiosk Daily Dose Muara Karang/ });
    expect(within(dialog).getByText(/langsung terkunci/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));
    expect(client.rotate).not.toHaveBeenCalled();
  });

  it('explains a failure to load instead of showing an empty list', async () => {
    renderView(clientWith({ list: vi.fn().mockRejectedValue(new Error('403')) }));
    expect(await screen.findByText(/izin kelola cabang/)).toBeVisible();
  });
});

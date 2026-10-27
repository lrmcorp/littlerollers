import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicClassesView } from '@/classes/public-classes-view';
import type { PublicClassCatalogClient } from '@/api-clients/public-class-catalog-client';

const branch = { id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' };

describe('public class catalog', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    if (typeof window.localStorage === 'undefined') {
      const storage: Record<string, string> = {};
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => storage[key] ?? null,
          setItem: (key: string, val: string) => {
            storage[key] = val;
          },
          removeItem: (key: string) => {
            delete storage[key];
          },
          clear: () => {
            Object.keys(storage).forEach((k) => delete storage[k]);
          },
        },
        configurable: true,
        writable: true,
      });
    } else {
      window.localStorage.clear();
    }
  });

  it('requires an explicit studio and renders authoritative availability accessibly', async () => {
    const client: PublicClassCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [], range: { from: '', until: '' } })
        .mockResolvedValueOnce({
          branches: [branch],
          range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
          items: [
            {
              id: 'slot-1',
              branchId: branch.id,
              classType: { id: 'type-1', code: 'PRIVATE', name: 'Private Class' },
              startAt: '2026-07-25T03:00:00.000Z',
              endAt: '2026-07-25T03:50:00.000Z',
              timezone: branch.timezone,
              status: 'PUBLISHED',
              capacity: 4,
              available: 2,
              canBook: true,
            },
          ],
        }),
    };
    const view = render(<PublicClassesView client={client} />);
    expect(await screen.findByText('Pilih studio untuk melihat kelas')).toBeInTheDocument();
    expect(screen.queryByText('Private Class')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: /Studio/ }));
    await userEvent.click(await screen.findByRole('option', { name: /Green Garden/ }));
    expect(await screen.findByRole('heading', { name: 'Private Class' })).toBeVisible();
    expect(screen.getByText('Sisa 2 tempat')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Masuk untuk booking' })).toHaveAttribute(
      'href',
      '/sign-in?returnTo=%2Fbookings%2Fnew%3Fslot%3Dslot-1',
    );
    await waitFor(() => expect(client.list).toHaveBeenCalledTimes(2));
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('disables the booking action for slots that are full or past the booking cutoff, and only those', async () => {
    const slot = (id: string, over: { available: number; canBook: boolean }) => ({
      id,
      branchId: branch.id,
      classType: { id: 'type-1', code: 'PRIVATE', name: 'Private Class' },
      startAt: '2026-07-25T03:00:00.000Z',
      endAt: '2026-07-25T03:50:00.000Z',
      timezone: branch.timezone,
      status: 'PUBLISHED',
      capacity: 4,
      ...over,
    });
    const client: PublicClassCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [], range: { from: '', until: '' } })
        .mockResolvedValueOnce({
          branches: [branch],
          range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
          items: [
            slot('slot-open', { available: 2, canBook: true }),
            slot('slot-closed', { available: 2, canBook: false }),
            slot('slot-full', { available: 0, canBook: false }),
          ],
        }),
    };
    render(<PublicClassesView client={client} />);
    expect(await screen.findByText('Pilih studio untuk melihat kelas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: /Studio/ }));
    await userEvent.click(await screen.findByRole('option', { name: /Green Garden/ }));
    await screen.findAllByRole('heading', { name: 'Private Class' });

    const enabled = screen.getAllByRole('link', { name: 'Masuk untuk booking' });
    expect(enabled).toHaveLength(1);
    expect(enabled[0]).toHaveAttribute('href', expect.stringContaining('slot-open'));

    const closed = screen.getByText('Pemesanan ditutup');
    expect(closed).toHaveAttribute('aria-disabled', 'true');
    expect(closed).not.toHaveAttribute('href');

    const full = screen.getAllByText('Penuh, 0 slot');
    expect(full.length).toBeGreaterThanOrEqual(1);
    expect(full[0]).toHaveAttribute('aria-disabled', 'true');
    expect(full[0]).not.toHaveAttribute('href');
  }, 30_000);

  it('shows a safe dependency state without exposing backend details', async () => {
    const client: PublicClassCatalogClient = {
      list: vi.fn().mockRejectedValue({ response: { status: 503 } }),
    };
    render(<PublicClassesView client={client} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Jadwal sedang tidak tersedia');
  });

  it('supports quick studio selection, remembers choice in localStorage, and shows 14-day calendar navigation', async () => {
    const client: PublicClassCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [], range: { from: '', until: '' } })
        .mockResolvedValueOnce({
          branches: [branch],
          range: { from: '2026-07-25T00:00:00.000Z', until: '2026-08-08T00:00:00.000Z' },
          items: [
            {
              id: 'slot-1',
              branchId: branch.id,
              classType: { id: 'type-1', code: 'REFORMER', name: 'Reformer Flow' },
              startAt: '2026-07-25T03:00:00.000Z',
              endAt: '2026-07-25T03:50:00.000Z',
              timezone: branch.timezone,
              status: 'PUBLISHED',
              capacity: 4,
              available: 3,
              canBook: true,
            },
          ],
        }),
    };

    render(<PublicClassesView client={client} />);
    expect(await screen.findByText('Pilih studio untuk melihat kelas')).toBeInTheDocument();

    // Select studio using Quick Button (UAT #23)
    const quickStudioBtn = await screen.findByRole('button', { name: /Green Garden/ });
    await userEvent.click(quickStudioBtn);

    // Schedule loads
    expect(await screen.findByRole('heading', { name: 'Reformer Flow' })).toBeVisible();
    expect(window.localStorage.getItem('dd_last_selected_branch')).toBe('branch-1');

    // 7-Day horizontal calendar strip is rendered
    expect(screen.getByRole('group', { name: 'Pilih tanggal cepat' })).toBeVisible();
  });
});


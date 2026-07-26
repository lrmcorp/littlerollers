import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { PublicPackageCatalogClient } from './public-package-catalog-client';
import { PublicPackagesView } from './packages/public-packages-view';

const branch = { id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' };

describe('public package catalog', () => {
  it('requires an explicit studio and renders authoritative commercial values', async () => {
    const client: PublicPackageCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [] })
        .mockResolvedValueOnce({
          branches: [branch],
          items: [
            {
              id: 'package-1',
              branchId: branch.id,
              name: 'Pilates Starter',
              sessionCount: 4,
              durationDays: 30,
              priceRp: 1200000,
              effectiveUntil: null,
              classType: { id: 'type-1', code: 'PRIVATE', name: 'Private Class' },
            },
          ],
        }),
    };
    const view = render(<PublicPackagesView client={client} />);
    expect(await screen.findByText('Pilih studio untuk melihat paket')).toBeVisible();
    expect(screen.queryByText('Pilates Starter')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Green Garden/ }));
    expect(await screen.findByRole('heading', { name: 'Pilates Starter' })).toBeVisible();
    expect(screen.getByText(/Rp\s*1\.200\.000/)).toBeVisible();
    expect(screen.getByText('4 sesi')).toBeVisible();
    expect(screen.getByText('30 hari')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Pilih paket' })).toHaveAttribute(
      'href',
      '/sign-in?returnTo=%2Fcheckout%3Fpackage%3Dpackage-1%26branch%3Dbranch-1',
    );
    await waitFor(() => expect(client.list).toHaveBeenCalledTimes(2));
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('uses a safe message when the catalog dependency is unavailable', async () => {
    const client: PublicPackageCatalogClient = {
      list: vi.fn().mockRejectedValue({ response: { status: 503 } }),
    };
    render(<PublicPackagesView client={client} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Paket sedang tidak tersedia');
  });
});

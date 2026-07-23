import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { PublicClassesView } from './classes/public-classes-view';
import type { PublicClassCatalogClient } from './public-class-catalog-client';

const branch = { id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' };

describe('public class catalog', () => {
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
            },
          ],
        }),
    };
    const view = render(<PublicClassesView client={client} />);
    expect(await screen.findByText('Pilih studio untuk melihat kelas')).toBeInTheDocument();
    expect(screen.queryByText('Private Class')).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Studio'), branch.id);
    expect(await screen.findByRole('heading', { name: 'Private Class' })).toBeVisible();
    expect(screen.getByText('2 tempat')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Pilih kelas' })).toHaveAttribute(
      'href',
      '/sign-in?returnTo=%2Fclasses%3Fslot%3Dslot-1',
    );
    await waitFor(() => expect(client.list).toHaveBeenCalledTimes(2));
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('shows a safe dependency state without exposing backend details', async () => {
    const client: PublicClassCatalogClient = {
      list: vi.fn().mockRejectedValue({ response: { status: 503 } }),
    };
    render(<PublicClassesView client={client} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Jadwal sedang tidak tersedia');
  });
});

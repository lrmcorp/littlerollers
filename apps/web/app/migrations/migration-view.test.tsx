import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MigrationView } from './migration-view';

const json = (value: unknown) =>
  new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

describe('migration console pagination', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses independent cursors for batch, reject, and resolution pages', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/cdc'))
        return json({
          lagSeconds: null,
          events: {},
          checkpoints: [],
          branches: [],
          pilotOutbox: {},
          failures: [],
        });
      if (url.includes('/control-totals')) return json({ items: [] });
      if (url.includes('/rejects'))
        return json({
          items: [
            {
              id: url.includes('cursor=reject-next') ? 'reject-2' : 'reject-1',
              sourceTable: 'users',
              sourceId: 'source-1',
              reasonCode: 'INVALID_PHONE',
              status: 'OPEN',
            },
          ],
          nextCursor: url.includes('cursor=reject-next') ? null : 'reject-next',
        });
      if (url.includes('/resolutions'))
        return json({
          items: [],
          nextCursor: url.includes('cursor=resolution-next') ? null : 'resolution-next',
        });
      if (url.includes('/batches'))
        return json({
          items: [
            {
              id: 'batch-1',
              phase: 'user-role',
              status: 'COMPLETED',
              sourceSnapshotAt: '2026-08-03T00:00:00.000Z',
              sourceChecksum: 'checksum',
              mappingVersion: 'v1.0.0',
              delta: false,
              _count: {
                sourceKeys: 1,
                rejects: 1,
                controlTotals: 0,
                resolutions: 0,
                deferredMediaReferences: 0,
              },
            },
          ],
          nextCursor: url.includes('cursor=batch-next') ? null : 'batch-next',
        });
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MigrationView />);
    // Urutan navigasi di halaman: batch, reject, resolution.
    const paginations = () => screen.getAllByRole('navigation', { name: 'Paginasi data' });
    await waitFor(() => expect(paginations()).toHaveLength(3));
    const rejectPagination = () => paginations()[1]!;
    expect(within(rejectPagination()).getByText('Halaman 1')).toBeVisible();
    await userEvent.click(within(rejectPagination()).getByRole('button', { name: 'Berikutnya' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('rejects?status=OPEN&cursor=reject-next'),
        expect.anything(),
      ),
    );
    await waitFor(() => expect(within(rejectPagination()).getByText('Halaman 2')).toBeVisible());
    expect(within(paginations()[0]!).getByText('Halaman 1')).toBeVisible();
  });
});

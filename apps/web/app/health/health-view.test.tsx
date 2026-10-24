import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { HealthView, type HealthResult } from './health-view';

const result = (status: HealthResult['status']): HealthResult => ({
  status,
  checkedAt: '2026-07-29T01:00:00.000Z',
  dependencies: [
    { name: 'api', status: 'READY', detailCode: null },
    {
      name: 'scheduler',
      status: status === 'DEGRADED' ? 'DEGRADED' : status,
      detailCode: status === 'DEGRADED' ? 'STALE_HEARTBEAT' : null,
    },
  ],
});

describe('HealthView', () => {
  it.each([
    ['READY', 'Normal'],
    ['DEGRADED', 'Perlu perhatian'],
    ['NOT_READY', 'Tidak siap'],
  ] as const)('maps %s from the response body', async (status, label) => {
    render(<HealthView loadHealth={vi.fn().mockResolvedValue(result(status))} />);
    expect(await screen.findAllByText(label)).not.toHaveLength(0);
  });

  it('shows a stalled scheduler as degraded and refreshes only on user action', async () => {
    const load = vi.fn().mockResolvedValue(result('DEGRADED'));
    const view = render(<HealthView loadHealth={load} />);
    expect(await screen.findByText(/pekerjaan terjadwal/i)).toBeVisible();
    expect(load).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(load).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Segarkan' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('does not invent a timestamp when the request fails', async () => {
    render(<HealthView loadHealth={vi.fn().mockRejectedValue(new Error('offline'))} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('tidak dapat diperiksa');
    expect(screen.queryByText(/Pemeriksaan terakhir/)).not.toBeInTheDocument();
  });
});

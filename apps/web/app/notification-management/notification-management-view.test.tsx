import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationManagementView } from './notification-management-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const stubFetch = (data: { templates: unknown[]; deliveries: unknown[] }) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ deferredChannels: [], ...data }) }),
  );

describe('NotificationManagementView', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('explains empty template and delivery panels instead of leaving them blank', async () => {
    stubFetch({ templates: [], deliveries: [] });
    render(<NotificationManagementView />);
    expect(await screen.findByText('Belum ada template')).toBeVisible();
    expect(screen.getByText('Belum ada pengiriman')).toBeVisible();
  });

  it('uses Indonesian labels and never shows raw status enums', async () => {
    stubFetch({
      templates: [
        {
          id: 't1',
          templateKey: 'BOOKING_CONFIRMED',
          version: 2,
          status: 'DRAFT',
          channel: 'EMAIL',
          eventType: 'booking.created',
        },
      ],
      deliveries: [
        {
          id: 'd1',
          eventType: 'booking.created',
          recipientMasked: 'a***@example.test',
          status: 'FAILED_RETRYABLE',
          attemptCount: 2,
        },
      ],
    });
    const { container } = render(<NotificationManagementView />);
    expect(await screen.findByText('Draf')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Terbitkan' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Arsipkan' })).toBeVisible();
    expect(screen.getByLabelText('Kunci template')).toBeVisible();
    expect(container).toHaveTextContent('Gagal (dapat dicoba lagi)');
    expect(container).not.toHaveTextContent('FAILED_RETRYABLE');
    expect(container).not.toHaveTextContent('DRAFT');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { OperationsView } from './operations/operations-view';

const job = {
  id: '00000000-0000-4000-8000-000000000101',
  type: 'H24_QUOTA_EVALUATION' as const,
  status: 'RETRYING' as const,
  attemptCount: 1,
  maxAttempts: 5,
  progress: 0,
  dueAt: new Date('2026-07-22T00:00:00Z'),
  nextAttemptAt: new Date('2026-07-22T00:01:00Z'),
  createdAt: new Date('2026-07-21T00:00:00Z'),
  version: 1,
};

describe('OperationsView', () => {
  it('lists retry state and provides an accessible recovery control', async () => {
    const client = {
      list: vi.fn().mockResolvedValue([job]),
      run: vi.fn().mockResolvedValue({
        classSlotId: '00000000-0000-4000-8000-000000000102',
        previousStatus: 'PUBLISHED',
        status: 'CONFIRMED',
        bookingCount: 2,
        minimumQuota: 2,
        evaluatedAt: new Date(),
        idempotentReplay: false,
      }),
    };
    const view = render(<OperationsView client={client} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Muat job' }));
    expect((await screen.findAllByText('RETRYING'))[0]).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
    await user.click(screen.getAllByRole('button', { name: 'Jalankan recovery' })[0]!);
    expect(client.run).toHaveBeenCalledWith(job);
    expect(await screen.findByText('Evaluasi selesai.')).toBeInTheDocument();
  });

  it('shows masked SMTP metrics and requires a reason for manual retry', async () => {
    const delivery = {
      id: '00000000-0000-4000-8000-000000000201',
      eventType: 'purchase.approved.v1',
      templateKey: 'ORDER_APPROVED_V1',
      recipientMasked: 'cu*****@example.test',
      channel: 'EMAIL',
      status: 'FAILED_TERMINAL' as const,
      attemptCount: 5,
      rateLimitWaitCount: 1,
      maxAttempts: 5,
      correlationId: 'correlation-safe',
      createdAt: new Date('2026-07-28T00:00:00Z'),
    };
    const client = {
      list: vi.fn().mockResolvedValue([]),
      run: vi.fn(),
      listEmails: vi.fn().mockResolvedValue({
        items: [delivery],
        metrics: {
          totalCount: 1,
          pendingCount: 0,
          acceptedCount: 0,
          terminalFailureCount: 1,
          deadLetterCount: 1,
          retryCount: 4,
          rateLimitWaitCount: 1,
          queueAgeSeconds: 0,
          acceptedRateBasisPoints: 0,
          failureRateBasisPoints: 10_000,
          byStatus: { FAILED_TERMINAL: 1 },
        },
        page: { hasMore: false, nextCursor: null },
      }),
      retryEmail: vi.fn().mockResolvedValue({
        id: delivery.id,
        status: 'PENDING',
        nextAttemptAt: new Date('2026-07-28T01:00:00Z'),
      }),
    };
    render(<OperationsView client={client} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Muat email' }));
    expect((await screen.findAllByText('cu*****@example.test'))[0]).toBeVisible();
    expect(screen.queryByText('customer@example.test')).not.toBeInTheDocument();
    const retry = screen.getAllByRole('button', { name: 'Retry email' })[0]!;
    expect(retry).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', { name: 'Alasan retry email' }),
      'Credential SMTP sudah diperbaiki',
    );
    expect(retry).toBeEnabled();
    await user.click(retry);
    expect(client.retryEmail).toHaveBeenCalledWith(delivery.id, 'Credential SMTP sudah diperbaiki');
  });
});

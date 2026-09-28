import { render as rtlRender, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { OperationsView } from '@/operations/operations-view';
import { AppFeedbackProvider } from '@/components/app-feedback';
import type { AutoCancelResult } from '@/api-clients/reminder-client';

const render = (view: React.ReactNode) =>
  rtlRender(<AppFeedbackProvider>{view}</AppFeedbackProvider>);

const emptyEmails = {
  items: [],
  metrics: {
    totalCount: 0,
    pendingCount: 0,
    acceptedCount: 0,
    terminalFailureCount: 0,
    deadLetterCount: 0,
    retryCount: 0,
    rateLimitWaitCount: 0,
    queueAgeSeconds: 0,
    acceptedRateBasisPoints: 0,
    failureRateBasisPoints: 0,
  },
  page: { hasMore: false, nextCursor: null },
};
const client = { listEmails: vi.fn().mockResolvedValue(emptyEmails) };

const result = (overrides: Partial<AutoCancelResult> = {}): AutoCancelResult => ({
  evaluatedAt: '2026-10-12T08:00:00Z',
  evaluatedSlotsCount: 4,
  confirmedSlotsCount: 3,
  cancelledSlotsCount: 1,
  cancelledSlots: [
    {
      slotId: 'slot-1',
      branchId: 'branch-1',
      branchName: 'Green Garden',
      className: 'Reformer',
      startAt: '2026-10-13T02:00:00Z',
      bookedCount: 1,
      minQuota: 3,
      refundedBookingsCount: 1,
    },
  ],
  ...overrides,
});

describe('OperationsView quota evaluation', () => {
  it('runs the H-24 evaluation after confirmation and summarises what changed', async () => {
    const evaluator = { triggerAutoCancel: vi.fn().mockResolvedValue(result()) };
    const view = render(
      <OperationsView client={client} evaluator={evaluator} access={{ canRunEvaluation: true }} />,
    );
    const user = userEvent.setup();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Evaluasi kuota H-24' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Pengiriman email' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Jalankan evaluasi sekarang' }));
    // Tanpa konfirmasi tidak ada yang berjalan.
    expect(evaluator.triggerAutoCancel).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('dialog', { name: 'Jalankan evaluasi kuota H-24?' })).getByRole(
        'button',
        { name: 'Jalankan evaluasi' },
      ),
    );

    expect(evaluator.triggerAutoCancel).toHaveBeenCalledTimes(1);
    const summary = await screen.findByRole('status');
    expect(within(summary).getByText('Kelas diperiksa')).toBeVisible();
    expect(within(summary).getByText('Reformer', { exact: false })).toBeVisible();
    expect(summary).toHaveTextContent('1 dari minimum 3 peserta');
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('tells the operator the evaluation was disabled instead of reporting an empty run', async () => {
    const evaluator = {
      triggerAutoCancel: vi.fn().mockResolvedValue(
        result({ skipped: true, skippedReason: 'AUTO_CANCEL_DISABLED', evaluatedSlotsCount: 0 }),
      ),
    };
    render(<OperationsView client={client} evaluator={evaluator} access={{ canRunEvaluation: true }} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Jalankan evaluasi sekarang' }));
    await user.click(screen.getByRole('button', { name: 'Jalankan evaluasi' }));
    expect(await screen.findByText(/dinonaktifkan di lingkungan ini/)).toBeVisible();
    expect(screen.queryByText('Kelas diperiksa')).toBeNull();
  });

  it('explains a failed run in Indonesian without technical codes', async () => {
    const evaluator = {
      triggerAutoCancel: () => Promise.reject({ response: { status: 403 } }),
    };
    render(<OperationsView client={client} evaluator={evaluator} access={{ canRunEvaluation: true }} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Jalankan evaluasi sekarang' }));
    await user.click(screen.getByRole('button', { name: 'Jalankan evaluasi' }));
    expect(await screen.findByText('Anda tidak memiliki izin untuk tindakan ini.')).toBeVisible();
  });

  it('offers no run button without the automation permission', () => {
    const evaluator = { triggerAutoCancel: vi.fn() };
    render(<OperationsView client={client} evaluator={evaluator} access={{ canRunEvaluation: false }} />);
    expect(screen.queryByRole('button', { name: 'Jalankan evaluasi sekarang' })).toBeNull();
    expect(screen.getByText(/memerlukan izin otomasi/)).toBeVisible();
  });

  it('no longer shows sample jobs or recovery controls', () => {
    render(<OperationsView client={client} access={{ canRunEvaluation: true }} />);
    expect(screen.queryByText(/Data contoh/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Jalankan pemulihan' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Tandai gagal' })).toBeNull();
  });
});

describe('OperationsView email deliveries', () => {
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
    const emailClient = {
      listEmails: vi.fn().mockResolvedValue({
        ...emptyEmails,
        items: [delivery],
        metrics: {
          ...emptyEmails.metrics,
          totalCount: 1,
          terminalFailureCount: 1,
          deadLetterCount: 1,
          retryCount: 4,
          rateLimitWaitCount: 1,
          failureRateBasisPoints: 10_000,
          byStatus: { FAILED_TERMINAL: 1 },
        },
      }),
      retryEmail: vi.fn().mockResolvedValue({
        id: delivery.id,
        status: 'PENDING',
        nextAttemptAt: new Date('2026-07-28T01:00:00Z'),
      }),
    };
    render(<OperationsView client={emailClient} access={{ canRecover: true }} />);
    const user = userEvent.setup();
    expect((await screen.findAllByText('cu*****@example.test'))[0]).toBeVisible();
    expect(screen.queryByText('customer@example.test')).not.toBeInTheDocument();
    const retry = screen.getAllByRole('button', { name: 'Coba kirim kembali' })[0]!;
    expect(retry).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', { name: 'Alasan mencoba kembali pengiriman email' }),
      'Credential SMTP sudah diperbaiki',
    );
    expect(retry).toBeEnabled();
    await user.click(retry);
    expect(emailClient.retryEmail).toHaveBeenCalledWith(
      delivery.id,
      'Credential SMTP sudah diperbaiki',
    );
  });
});

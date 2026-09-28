import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserOrderClient, type CustomerOrder } from '@/api-clients/order-client';
import { AppFeedbackProvider } from '../app-feedback';
import { CustomerPaymentFlow } from './customer-payment-flow';

const order: CustomerOrder = {
  id: 'order-1',
  branchId: 'branch-1',
  branchName: 'Daily Dose BSD',
  packageId: 'package-1',
  packageName: 'Reformer Pilates 10',
  priceRp: 1_730_000,
  baseAmountRp: 1_730_000,
  paymentUniqueCode: 377,
  payableAmountRp: 1_730_377,
  sessionCount: 10,
  durationDays: 90,
  status: 'PENDING',
  submittedAt: new Date('2026-07-28T00:00:00Z'),
  decidedAt: null,
  expiresAt: new Date('2026-07-29T00:00:00Z'),
  continuationSlotId: null,
  paymentProofId: 'proof-1',
  paymentProofStatus: { uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' },
  decisionReasonCode: null,
  timelineComplete: true,
  version: 1,
  activation: null,
  paymentAccount: null,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('customer payment proof preview', () => {
  it('loads, renders, closes, and revokes the customer-owned image preview', async () => {
    vi.spyOn(browserOrderClient, 'loadProof').mockResolvedValue(
      new Blob(['proof'], { type: 'image/png' }),
    );
    const createObjectURL = vi.fn().mockReturnValue('blob:customer-proof');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    render(
      <AppFeedbackProvider>
        <CustomerPaymentFlow order={order} onUpdated={vi.fn()} />
      </AppFeedbackProvider>,
    );
    const user = userEvent.setup();

    expect(screen.getByText('Bukti pembayaran yang dikirim')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Lihat bukti pembayaran' }));

    expect(browserOrderClient.loadProof).toHaveBeenCalledWith('order-1');
    expect(await screen.findByRole('img', { name: 'Bukti pembayaran yang dikirim' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Tutup preview' }));
    expect(screen.queryByRole('img', { name: 'Bukti pembayaran yang dikirim' })).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:customer-proof');
  });

  it('keeps preview disabled while the proof scan is pending', () => {
    render(
      <AppFeedbackProvider>
        <CustomerPaymentFlow
          order={{
            ...order,
            paymentProofStatus: { uploadStatus: 'FINALIZED', scanStatus: 'PENDING' },
          }}
          onUpdated={vi.fn()}
        />
      </AppFeedbackProvider>,
    );

    expect(screen.getByRole('button', { name: 'Lihat bukti pembayaran' })).toBeDisabled();
    expect(
      screen.getByText('Preview tersedia setelah pemeriksaan keamanan selesai.'),
    ).toBeVisible();
  });

  it('renders payment verification SLA and operational hours when payment is pending', () => {
    render(
      <AppFeedbackProvider>
        <CustomerPaymentFlow order={order} onUpdated={vi.fn()} />
      </AppFeedbackProvider>,
    );

    expect(screen.getByText('Pembayaran sedang diperiksa')).toBeVisible();
    expect(
      screen.getByText(/Pemeriksaan bukti pembayaran biasanya memakan waktu 15–30 menit/),
    ).toBeVisible();
    expect(screen.getByText('Estimasi verifikasi: 15–30 menit')).toBeVisible();
  });
});


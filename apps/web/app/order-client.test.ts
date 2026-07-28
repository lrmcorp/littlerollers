import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  browserOrderClient,
  OrderClientError,
  orderErrorDetails,
  type CustomerOrder,
  type PaymentProofUploadSession,
} from './order-client';

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
  status: 'AWAITING_PAYMENT',
  submittedAt: new Date('2026-07-28T00:00:00Z'),
  expiresAt: new Date('2026-07-29T00:00:00Z'),
  continuationSlotId: null,
  paymentProofId: null,
  paymentProofStatus: null,
  decisionReasonCode: null,
  version: 0,
  paymentAccount: null,
};

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

describe('payment-proof upload client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('resumes at attaching without issuing or uploading a duplicate proof', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ id: 'proof-1' }))
      .mockResolvedValueOnce(json({ uploadStatus: 'UPLOADED', scanStatus: 'PENDING' }))
      .mockResolvedValueOnce(json({ uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' }))
      .mockResolvedValueOnce(
        json(
          {
            error: {
              code: 'HTTP_503',
              correlationId: 'corr-attach',
              retryable: true,
            },
          },
          503,
        ),
      )
      .mockResolvedValueOnce(
        json(
          {
            ...order,
            status: 'PENDING',
            submittedAt: order.submittedAt.toISOString(),
            expiresAt: order.expiresAt?.toISOString(),
            paymentProofId: 'proof-1',
            version: 1,
          },
          200,
          { 'x-correlation-id': 'corr-success' },
        ),
      );
    const file = new File(['proof'], 'proof.png', { type: 'image/png' });
    let session: PaymentProofUploadSession | undefined;

    await expect(
      browserOrderClient.uploadProof(order, file, 'a'.repeat(64), session, (next) => {
        session = next;
      }),
    ).rejects.toMatchObject({
      code: 'HTTP_503',
      stage: 'ATTACHING',
      correlationReference: 'corr-attach',
    });
    expect(session).toMatchObject({ uploadId: 'proof-1', stage: 'ATTACHING' });

    const result = await browserOrderClient.uploadProof(
      order,
      file,
      'a'.repeat(64),
      session,
      (next) => {
        session = next;
      },
    );

    expect(result.status).toBe('PENDING');
    expect(result.correlationReference).toBe('corr-success');
    expect(session?.stage).toBe('COMPLETED');
    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      '/api/v1/uploads/payment-proofs',
      '/api/v1/uploads/payment-proofs/proof-1/content',
      '/api/v1/uploads/payment-proofs/proof-1/finalize',
      '/api/v1/orders/order-1/payment-proof',
      '/api/v1/orders/order-1/payment-proof',
    ]);
  });

  it('maps scanner failures to actionable safe feedback', () => {
    expect(
      orderErrorDetails(
        new OrderClientError('PAYMENT_PROOF_SCAN_UNAVAILABLE', 'corr-scan', true, 'SCANNING'),
      ),
    ).toMatchObject({
      stage: 'SCANNING',
      retryable: true,
      correlationReference: 'corr-scan',
      message: expect.stringContaining('Pemeriksaan keamanan file'),
    });
  });
});

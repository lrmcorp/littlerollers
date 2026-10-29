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
  branchName: 'Little Rollers BSD',
  packageId: 'package-1',
  packageName: 'Movers 10',
  priceRp: 1_730_000,
  baseAmountRp: 1_730_000,
  paymentUniqueCode: 377,
  payableAmountRp: 1_730_377,
  sessionCount: 10,
  durationDays: 90,
  status: 'AWAITING_PAYMENT',
  submittedAt: new Date('2026-07-28T00:00:00Z'),
  decidedAt: null,
  expiresAt: new Date('2026-07-29T00:00:00Z'),
  continuationSlotId: null,
  paymentProofId: null,
  paymentProofStatus: null,
  decisionReasonCode: null,
  timelineComplete: true,
  version: 0,
  activation: null,
  paymentAccount: null,
};

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

describe('payment-proof upload client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('preserves customer order filters and parses the authoritative history page', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      json({
        items: [
          {
            ...order,
            submittedAt: order.submittedAt.toISOString(),
            decidedAt: null,
            expiresAt: order.expiresAt?.toISOString(),
            activation: null,
          },
        ],
        summary: {
          total: 4,
          awaitingPayment: 1,
          pending: 1,
          actionRequired: 0,
          approved: 2,
          rejected: 0,
          expired: 0,
        },
        page: { hasMore: true, nextCursor: 'order-1' },
      }),
    );

    const page = await browserOrderClient.list({
      status: 'PENDING',
      q: 'reformer',
      from: '2026-07-01',
      until: '2026-07-28',
      cursor: 'cursor-1',
      limit: 20,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/orders?status=PENDING&q=reformer&from=2026-07-01&until=2026-07-28&cursor=cursor-1&limit=20',
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(page.summary.total).toBe(4);
    expect(page.page).toEqual({ hasMore: true, nextCursor: 'order-1' });
    expect(page.items[0]?.submittedAt).toBeInstanceOf(Date);
  });

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

  it('authorizes and loads the customer-owned payment proof as a private blob', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        json({
          url: '/api/v1/uploads/payment-proofs/view-authorizations/authorization-1/content',
          expiresAt: '2026-07-28T01:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        new Response('proof-bytes', { status: 200, headers: { 'Content-Type': 'image/png' } }),
      );

    const result = await browserOrderClient.loadProof('order/with unsafe characters');

    expect(result.type).toBe('image/png');
    expect(await result.text()).toBe('proof-bytes');
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/v1/orders/order%2Fwith%20unsafe%20characters/payment-proof/view-authorizations',
      expect.objectContaining({ credentials: 'include', method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/uploads/payment-proofs/view-authorizations/authorization-1/content',
      expect.objectContaining({
        credentials: 'include',
        headers: { Accept: 'image/jpeg,image/png,application/pdf' },
      }),
    );
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

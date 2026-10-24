import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserFinanceClient, financeFailureMessage } from './finance-client';

const correction = {
  id: '11111111-1111-4111-8111-111111111111',
  branchId: 'branch-1',
  currentPeriod: '2026-09',
  referencePeriod: '2026-08',
  amount: { amountMinor: 25_000_000, currency: 'IDR' },
  reason: 'Selisih setoran',
  requestedBy: 'user-1',
  decidedBy: null,
  status: 'PENDING',
  version: 1,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('finance corrections client', () => {
  it('requests a correction on the correction-journals route with a rupiah amount', async () => {
    const fetchMock = vi.fn(async () => json(correction, 201));
    vi.stubGlobal('fetch', fetchMock);

    const created = await browserFinanceClient.requestCorrection!({
      branchId: 'branch-1',
      currentPeriod: '2026-09',
      referencePeriod: '2026-08',
      amountRp: 250_000,
      reason: 'Selisih setoran',
    });

    expect(created.id).toBe(correction.id);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/v1/finance/correction-journals');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      branchId: 'branch-1',
      currentPeriod: '2026-09',
      referencePeriod: '2026-08',
      amountRp: 250_000,
      reason: 'Selisih setoran',
    });
  });

  it('puts the decision in the path and maps the API result to the decision result', async () => {
    const fetchMock = vi.fn(async () =>
      json({ correction: { ...correction, status: 'APPROVED' }, journalReferenceId: null }, 201),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await browserFinanceClient.decideCorrection!(correction.id, 'approve', 'Sudah dicek');

    expect(result).toMatchObject({ id: correction.id, status: 'APPROVED', decision: 'APPROVE' });
    expect(result.decidedAt).toBeInstanceOf(Date);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`/api/v1/finance/correction-journals/${correction.id}/approve`);
    expect(JSON.parse(String(init.body))).toEqual({ reason: 'Sudah dicek' });
  });

  it('keeps the response on the error so the panel can explain who may decide', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ error: { code: 'SEPARATION_OF_DUTIES' } }, 403)),
    );
    const failure = await browserFinanceClient
      .decideCorrection!(correction.id, 'reject', 'Tidak sesuai')
      .catch((error: unknown) => error);

    expect(financeFailureMessage(failure, 'correction')).toMatch(/tidak boleh memutus koreksinya sendiri/);
  });
});

describe('financeFailureMessage for corrections', () => {
  it('explains the correction-specific failures instead of the other-cost wording', () => {
    const failure = (status: number, code?: string) => ({
      response: { status, data: code ? { error: { code } } : undefined },
    });
    expect(financeFailureMessage(failure(409, 'CORRECTION_ALREADY_DECIDED'), 'correction')).toMatch(
      /sudah diputuskan/,
    );
    expect(financeFailureMessage(failure(403, 'FORBIDDEN'), 'correction')).toMatch(/hanya untuk Super Owner/);
    expect(financeFailureMessage(failure(422, 'VALIDATION_ERROR'), 'correction')).toMatch(/Periode referensi/);
    // Tanpa konteks, kode yang sama tetap memakai pesan biaya lain.
    expect(financeFailureMessage(failure(403, 'FORBIDDEN'))).toMatch(/mengelola biaya lain/);
  });
});

describe('finance other-cost delete client', () => {
  it('sends the typed reason in the DELETE body (the server refuses a delete without one)', async () => {
    const fetchMock = vi.fn(async () => json({ id: 'cost-1', deleted: true }));
    vi.stubGlobal('fetch', fetchMock);
    await browserFinanceClient.deleteOtherCost!('cost-1', 'Salah input');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/v1/finance/other-costs/cost-1');
    expect(init.method).toBe('DELETE');
    expect(JSON.parse(String(init.body))).toEqual({ reason: 'Salah input' });
  });
});

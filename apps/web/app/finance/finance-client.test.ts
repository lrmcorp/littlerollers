import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserFinanceClient } from './finance-client';

function mockFetch(body: unknown = {}) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('browserFinanceClient reports', () => {
  it.each([
    ['getProfit', '/api/v1/finance/reports/profit-summary'],
    ['getOmsetReport', '/api/v1/finance/reports/omset'],
    ['getInstructorCostRealtime', '/api/v1/finance/reports/instructor-cost-realtime'],
    ['getOtherCostReport', '/api/v1/finance/reports/other-costs'],
  ] as const)('%s sends from/until and never a month period', async (method, path) => {
    const fetchMock = mockFetch();
    await browserFinanceClient[method]!('branch-1', { from: '2026-09-10', until: '2026-09-20' });
    const url = new URL(String(fetchMock.mock.calls[0]![0]), 'http://localhost');
    expect(url.pathname).toBe(path);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      branchId: 'branch-1',
      from: '2026-09-10',
      until: '2026-09-20',
    });
  });

  it('omits branchId for all branches', async () => {
    const fetchMock = mockFetch();
    await browserFinanceClient.getProfit!(undefined, { from: '2026-10-01', until: '2026-10-31' });
    expect(String(fetchMock.mock.calls[0]![0])).not.toContain('branchId');
  });
});

describe('browserFinanceClient other costs', () => {
  it('creates a cost with its spending date and updates it with a new date', async () => {
    const fetchMock = mockFetch({ id: 'cost-1' });
    await browserFinanceClient.createOtherCost!({
      branchId: 'branch-1',
      incurredOn: '2026-10-05',
      categoryCode: 'SEWA',
      description: 'Sewa',
      amountRp: 1000,
    });
    const [createUrl, createInit] = fetchMock.mock.calls[0]!;
    expect(createUrl).toBe('/api/v1/other-costs');
    expect(JSON.parse(createInit.body)).toMatchObject({ incurredOn: '2026-10-05', categoryCode: 'SEWA' });

    await browserFinanceClient.updateOtherCost!('cost-1', { incurredOn: '2026-10-06' });
    const [updateUrl, updateInit] = fetchMock.mock.calls[1]!;
    expect(updateUrl).toBe('/api/v1/finance/other-costs/cost-1');
    expect(updateInit.method).toBe('PATCH');
    expect(JSON.parse(updateInit.body)).toEqual({ incurredOn: '2026-10-06' });
  });

  it('no longer exposes month-close or correction operations', () => {
    for (const removed of ['closeMonth', 'executeMonthlyClose', 'requestCorrection', 'decideCorrection', 'corrections', 'periods', 'financialReport'])
      expect(removed in browserFinanceClient).toBe(false);
  });
});

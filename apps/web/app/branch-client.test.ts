import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserBranchClient } from './branch-client';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('branch management client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('preserves search, status, cursor and limit in the list request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      json({
        items: [],
        summary: { total: 0, active: 0, inactive: 0 },
        page: { hasMore: false, nextCursor: null },
      }),
    );

    await browserBranchClient.list({
      q: 'BSD',
      status: 'ACTIVE',
      cursor: 'branch-cursor',
      limit: 20,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/branches?q=BSD&status=ACTIVE&cursor=branch-cursor&limit=20',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('uses versioned, reasoned and idempotent lifecycle commands', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      json({
        id: 'branch-1',
        code: 'LR-BSD',
        name: 'Little Rollers BSD',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: null,
        active: false,
        version: 2,
        publicProfile: null,
      }),
    );

    await browserBranchClient.transition('branch-1', 'deactivate', {
      expectedVersion: 1,
      reason: 'Menutup operasional cabang',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/branches/branch-1/deactivate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'idempotency-key': expect.any(String),
        }),
        body: JSON.stringify({
          expectedVersion: 1,
          reason: 'Menutup operasional cabang',
        }),
      }),
    );
  });
});

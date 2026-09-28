import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserAvailabilityClient } from './availability-client';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('browserAvailabilityClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('list hydrates startAt/endAt into Date instances', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: 'avail-1',
            instructorUserId: 'instructor-1',
            branchId: 'branch-1',
            startAt: '2026-11-21T08:00:00.000Z',
            endAt: '2026-11-21T09:00:00.000Z',
            timezone: 'Asia/Jakarta',
            version: 1,
            status: 'ACTIVE',
          },
        ],
        page: { hasMore: false, nextCursor: null },
      }),
    );

    const result = await browserAvailabilityClient.list({ branchId: 'branch-1' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.startAt).toBeInstanceOf(Date);
    expect(result.items[0]!.endAt).toBeInstanceOf(Date);
    expect(result.items[0]!.startAt.toISOString()).toBe('2026-11-21T08:00:00.000Z');
  });

  it('create sends the branch and ISO-formatted range, and hydrates the response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse(
        {
          id: 'avail-2',
          instructorUserId: 'instructor-1',
          branchId: 'branch-1',
          startAt: '2026-11-22T08:00:00.000Z',
          endAt: '2026-11-22T09:00:00.000Z',
          timezone: 'Asia/Jakarta',
          version: 1,
          status: 'ACTIVE',
          idempotentReplay: false,
        },
        201,
      ),
    );

    const result = await browserAvailabilityClient.create({
      branchId: 'branch-1',
      startAt: new Date('2026-11-22T08:00:00.000Z'),
      endAt: new Date('2026-11-22T09:00:00.000Z'),
    });

    expect(result.startAt).toBeInstanceOf(Date);
    expect(result.idempotentReplay).toBe(false);
    const [, init] = fetchSpy.mock.calls[0]!;
    expect(JSON.parse(String(init!.body))).toEqual({
      branchId: 'branch-1',
      startAt: '2026-11-22T08:00:00.000Z',
      endAt: '2026-11-22T09:00:00.000Z',
    });
  });

  it('list surfaces a rejection when the request fails (e.g. 403)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse({ error: { code: 'FORBIDDEN' } }, 403),
    );
    await expect(browserAvailabilityClient.list({})).rejects.toThrow();
  });
});

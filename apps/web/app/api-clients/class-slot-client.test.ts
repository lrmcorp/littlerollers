import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserClassSlotClient } from './class-slot-client';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const forbidden = () =>
  jsonResponse({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }, 403);

describe('browserClassSlotClient.discover', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps fetched class slots visible even when auxiliary lookups (class-types/users/assignments/studios) 403 for a capability-limited session', async () => {
    const slot = {
      id: 'slot-1',
      branchId: 'branch-1',
      classTypeId: 'type-1',
      studioId: 'studio-1',
      instructorUserId: 'instructor-1',
      startAt: '2026-10-07T04:57:31.073Z',
      endAt: '2026-10-07T05:57:31.073Z',
      timezone: 'Asia/Jakarta',
      capacity: 10,
      bookedCount: 3,
      minimumQuota: 2,
      status: 'CONFIRMED',
      version: 1,
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      // Only /class-slots succeeds; the auxiliary lookups 403 for an INSTRUCTOR/COACH session
      // that lacks master:read / user:read / assignment:read.
      if (url.includes('/class-slots?')) {
        return jsonResponse({ items: [slot], page: { nextCursor: null } });
      }
      return forbidden();
    });

    const workspace = await browserClassSlotClient.discover({
      branchId: 'branch-1',
      timezone: 'Asia/Jakarta',
      from: new Date('2026-10-05T00:00:00.000Z'),
      until: new Date('2026-10-11T23:59:59.000Z'),
    });

    expect(workspace.slots).toHaveLength(1);
    expect(workspace.slots[0]!.id).toBe('slot-1');
    expect(workspace.slots[0]!.startAt).toBeInstanceOf(Date);
    expect(workspace.classTypes).toEqual([]);
    expect(workspace.instructors).toEqual([]);
    expect(workspace.studios).toEqual([]);
  });

  it('still surfaces a failure when the primary /class-slots request itself fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => forbidden());

    await expect(
      browserClassSlotClient.discover({
        branchId: 'branch-1',
        timezone: 'Asia/Jakarta',
        from: new Date('2026-10-05T00:00:00.000Z'),
        until: new Date('2026-10-11T23:59:59.000Z'),
      }),
    ).rejects.toThrow();
  });
});

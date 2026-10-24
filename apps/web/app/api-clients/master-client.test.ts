import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserMasterClient, masterFailure, masterFailureMessage } from './master-client';

const mockResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Direct-Typed master client (Tahap 2)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists studios via direct apiFetch without OpenAPI wrapper', async () => {
    const mockStudios = [
      {
        id: 'studio-1',
        branchId: 'branch-1',
        code: 'ST-01',
        name: 'Main Pilates Studio',
        equipmentText: '10 Reformer Machines',
        imageKey: 'branches/studio-1.jpg',
        active: true,
        rooms: [],
      },
    ];

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockResponse({ items: mockStudios }),
    );

    const result = await browserMasterClient.listStudios('branch-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/branches/branch-1/studios',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Main Pilates Studio');
    expect(result[0]!.imageKey).toBe('branches/studio-1.jpg');
    expect(result[0]!.equipmentText).toBe('10 Reformer Machines');
  });

  it('creates studio via POST /branches/:branchId/studios', async () => {
    const newStudio = {
      id: 'studio-new',
      branchId: 'branch-1',
      code: 'ST-NEW',
      name: 'Studio Baru',
      imageKey: 'branches/new.jpg',
      active: true,
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockResponse(newStudio, 201),
    );

    const created = await browserMasterClient.createStudio('branch-1', {
      code: 'ST-NEW',
      name: 'Studio Baru',
      imageKey: 'branches/new.jpg',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/branches/branch-1/studios',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          code: 'ST-NEW',
          name: 'Studio Baru',
          imageKey: 'branches/new.jpg',
        }),
      }),
    );
    expect(created.id).toBe('studio-new');
  });

  it('updates studio via PATCH /studios/:id directly', async () => {
    const updatedStudio = {
      id: 'studio-1',
      branchId: 'branch-1',
      code: 'ST-01',
      name: 'Updated Studio Name',
      imageKey: 'branches/updated.jpg',
      active: true,
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      mockResponse(updatedStudio),
    );

    const result = await browserMasterClient.updateStudio('studio-1', {
      name: 'Updated Studio Name',
      imageKey: 'branches/updated.jpg',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/studios/studio-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Studio Name',
          imageKey: 'branches/updated.jpg',
        }),
      }),
    );
    expect(result.name).toBe('Updated Studio Name');
  });

  it('creates and updates rooms via direct endpoints', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockResponse({ id: 'room-1', studioId: 'studio-1', code: 'R1', name: 'Room 1', active: true }, 201))
      .mockResolvedValueOnce(mockResponse({ id: 'room-1', studioId: 'studio-1', code: 'R1', name: 'Room 1 Updated', active: true }));

    const room = await browserMasterClient.createRoom('studio-1', { code: 'R1', name: 'Room 1' });
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      '/api/v1/studios/studio-1/rooms',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(room.id).toBe('room-1');

    const updatedRoom = await browserMasterClient.updateRoom('room-1', { name: 'Room 1 Updated' });
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      '/api/v1/rooms/room-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(updatedRoom.name).toBe('Room 1 Updated');
  });

  it('maps failure statuses correctly via masterFailure', () => {
    expect(masterFailure({ status: 403 })).toBe('FORBIDDEN');
    expect(masterFailure({ status: 404 })).toBe('RESOURCE_NOT_FOUND');
    expect(masterFailure({ status: 409 })).toBe('EFFECTIVE_PERIOD_OVERLAP_OR_STALE_VERSION');
    expect(masterFailure({ status: 422 })).toBe('VALIDATION_ERROR');
    expect(masterFailure({ status: 503 })).toBe('CONFIGURATION_REQUIRED');
    expect(masterFailure({ status: 500 })).toBe('REQUEST_FAILED');
  });
});

describe('masterFailureMessage', () => {
  it('prefers the specific API code and always returns Indonesian text', () => {
    expect(masterFailureMessage({ status: 409, data: { code: 'HAS_UPCOMING_SLOTS' } })).toMatch(
      /kelas terjadwal/,
    );
    expect(masterFailureMessage({ status: 409, data: { error: { code: 'RATE_IN_EFFECT' } } })).toMatch(
      /tarif baru/,
    );
    expect(masterFailureMessage({ status: 409 })).toMatch(/Muat ulang/);
    expect(masterFailureMessage({ status: 403 })).toMatch(/izin/);
    expect(masterFailureMessage(new Error('offline'))).toMatch(/Periksa koneksi/);
  });
});

describe('tarif settings client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps the per-kind API rows to the shared setting shape', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockResponse({
          items: [
            {
              id: 'fee-1',
              branchId: 'branch-1',
              classTypeId: 'class-1',
              instructorName: 'Ayu',
              feePerJamRp: 180000,
              effectiveDate: '2027-01-01',
              deletable: true,
            },
          ],
        }),
      );
    const [fee] = await browserMasterClient.listSettings('INSTRUCTOR_FEE', 'branch-1');
    expect(fee).toMatchObject({
      id: 'fee-1',
      kind: 'INSTRUCTOR_FEE',
      value: { feeRp: 180000 },
      instructorName: 'Ayu',
      deletable: true,
    });
    expect(fee!.effectiveFrom.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('deletes by kind and never sends an end date when creating', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => mockResponse({}));
    await browserMasterClient.deleteSetting('INSTRUCTOR_FEE', 'fee-1', 'Salah input');
    expect(spy).toHaveBeenLastCalledWith(
      '/api/v1/instructor-fees/fee-1',
      expect.objectContaining({ method: 'DELETE', body: JSON.stringify({ reason: 'Salah input' }) }),
    );
    await browserMasterClient.createSetting({
      kind: 'INSTRUCTOR_FEE',
      branchId: 'branch-1',
      classTypeId: 'class-1',
      instructorUserId: 'instructor-1',
      value: 180000,
      effectiveFrom: '2027-01-01',
      reason: 'Naik',
    });
    const body = JSON.parse(String((spy.mock.lastCall![1] as RequestInit).body));
    expect(body).toMatchObject({ feeRp: 180000 });
    expect('effectiveUntil' in body).toBe(false);
  });
});

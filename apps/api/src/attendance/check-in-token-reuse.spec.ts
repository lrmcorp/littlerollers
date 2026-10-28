import { createHash } from 'node:crypto';
import { AttendanceService, deriveCheckInToken } from './kehadiran.service';
import { PolicyService } from '../identity/policy.service';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

describe('QR check-in pelanggan dipakai ulang selama masih berlaku', () => {
  const bookingId = '00000000-0000-4000-8000-000000000020';
  const customerId = '00000000-0000-4000-8000-000000000030';
  const branchId = '00000000-0000-4000-8000-000000000002';
  const endAt = new Date(Date.now() + 2 * 3_600_000);
  const principal = {
    sessionId: 'session-1',
    userId: customerId,
    roles: [{ role: 'CUSTOMER' as const, branchId: null }],
    capabilities: ['customer:self'],
    branchIds: [],
  };

  function setup(activeTokens: Array<Record<string, unknown>> = []) {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      pemesananKelas: {
        findUnique: jest.fn().mockResolvedValue({
          id: bookingId,
          userId: customerId,
          status: 'BOOKED',
          user: { displayName: 'Clara', phone: '081234567890' },
          classSlot: {
            branchId,
            status: 'CONFIRMED',
            startAt: new Date(endAt.getTime() - 3_600_000),
            endAt,
            classType: { name: 'Group Class' },
            branch: { id: branchId, code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' },
          },
        }),
      },
      checkInToken: {
        findMany: jest.fn().mockResolvedValue(activeTokens),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
          ...data,
          createdAt: new Date(),
          isUsed: false,
        })),
      },
    };
    const db = { $transaction: jest.fn(async (callback: (t: typeof tx) => Promise<unknown>) => callback(tx)) };
    const service = new AttendanceService(db as never, new PolicyService(), {} as never);
    return { tx, service };
  }

  const issue = (service: AttendanceService) =>
    service.issue(principal as never, bookingId, {}, 'idem', 'corr') as Promise<{
      id: string;
      token: string;
      qrPayload: string;
    }>;

  it('menerbitkan token baru yang cocok dengan hash tersimpan bila belum ada token aktif', async () => {
    const { tx, service } = setup([]);
    const result = await issue(service);

    expect(tx.checkInToken.create).toHaveBeenCalledTimes(1);
    const stored = tx.checkInToken.create.mock.calls[0]![0].data as { id: string; token: string };
    expect(result.token).toBe(deriveCheckInToken(stored.id));
    expect(stored.token).toBe(sha256(result.token));
    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(result.qrPayload).toBe(`dd-checkin:v1:${result.token}`);
    // Ringkasan kelas ikut dikirim supaya halaman QR tidak bergantung pada parameter alamat.
    expect(result).toMatchObject({
      className: 'Group Class',
      branchName: 'Green Garden',
      studioName: null,
      instructorName: null,
      timezone: 'Asia/Jakarta',
    });
    expect(typeof (result as unknown as { startAt: string }).startAt).toBe('string');
  });

  it('mengembalikan QR yang sama saat dibuka lagi, tanpa mencabut atau menerbitkan token baru', async () => {
    const rowId = '00000000-0000-4000-8000-0000000000aa';
    const { tx, service } = setup([
      { id: rowId, bookingId, token: sha256(deriveCheckInToken(rowId)), expiresAt: endAt, isUsed: false, createdAt: new Date() },
    ]);
    const result = await issue(service);

    expect(result.id).toBe(rowId);
    expect(result.token).toBe(deriveCheckInToken(rowId));
    expect(tx.checkInToken.create).not.toHaveBeenCalled();
    expect(tx.checkInToken.updateMany).not.toHaveBeenCalled();
  });

  it('mencabut token lama bentuk acak (tidak dapat diturunkan) lalu menerbitkan yang baru', async () => {
    const { tx, service } = setup([
      { id: '00000000-0000-4000-8000-0000000000bb', bookingId, token: sha256('x'.repeat(43)), expiresAt: endAt, isUsed: false, createdAt: new Date() },
    ]);
    const result = await issue(service);

    expect(tx.checkInToken.updateMany).toHaveBeenCalledWith({
      where: { bookingId, isUsed: false },
      data: { isUsed: true },
    });
    expect(tx.checkInToken.create).toHaveBeenCalledTimes(1);
    expect(result.id).not.toBe('00000000-0000-4000-8000-0000000000bb');
  });

  it('tidak memakai ulang token milik jadwal lama setelah booking dipindah (waktu berakhir berbeda)', async () => {
    const rowId = '00000000-0000-4000-8000-0000000000cc';
    const { tx, service } = setup([
      {
        id: rowId,
        bookingId,
        token: sha256(deriveCheckInToken(rowId)),
        expiresAt: new Date(endAt.getTime() - 86_400_000),
        isUsed: false,
        createdAt: new Date(),
      },
    ]);
    const result = await issue(service);

    expect(result.id).not.toBe(rowId);
    expect(tx.checkInToken.create).toHaveBeenCalledTimes(1);
  });

  it('hanya menyisakan satu token aktif bila ditemukan lebih dari satu', async () => {
    const newer = '00000000-0000-4000-8000-0000000000dd';
    const older = '00000000-0000-4000-8000-0000000000ee';
    const { tx, service } = setup([
      { id: newer, bookingId, token: sha256(deriveCheckInToken(newer)), expiresAt: endAt, isUsed: false, createdAt: new Date() },
      { id: older, bookingId, token: sha256(deriveCheckInToken(older)), expiresAt: endAt, isUsed: false, createdAt: new Date(0) },
    ]);
    const result = await issue(service);

    expect(result.id).toBe(newer);
    expect(tx.checkInToken.updateMany).toHaveBeenCalledWith({ where: { id: { in: [older] } }, data: { isUsed: true } });
  });
});

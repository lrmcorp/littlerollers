import { VoucherService } from './voucher.service';

const manager = {
  sessionId: 's',
  userId: '00000000-0000-4000-8000-000000000001',
  roles: [] as never,
  capabilities: ['voucher:manage'],
  branchIds: [] as string[],
};

function setup() {
  const row = {
    id: 'v1', code: 'HEMAT', name: 'Hemat', active: true, archivedAt: null, discountType: 'PERCENTAGE',
    discountValue: 10, usedCount: 0, quota: null, validFrom: new Date('2026-01-01'), validUntil: null,
  };
  const tx = {
    voucher: {
      findUnique: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockImplementation(async ({ data }) => ({ ...row, ...data })),
    },
  };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  const idempotency = { execute: jest.fn(async (_c: unknown, run: (t: typeof tx) => unknown) => run(tx)) };
  const service = new VoucherService({} as never, {} as never, {} as never, idempotency as never, audit as never);
  return { service, tx, audit };
}

describe('voucher pause / archive / activate', () => {
  it.each(['PAUSED', 'ARCHIVED'] as const)('refuses %s without a typed reason and changes nothing', async (status) => {
    const { service, tx, audit } = setup();
    for (const reason of [undefined, '', '  ', 'ab'])
      await expect(
        service.transition(manager as never, 'v1', status, { expectedVersion: 1, reason }, 'k-12345678', 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(tx.voucher.update).not.toHaveBeenCalled();
    expect(audit.catat).not.toHaveBeenCalled();
  });

  it('archives with a trimmed reason in the permanent audit, and activating needs none', async () => {
    const { service, audit, tx } = setup();
    await service.transition(manager as never, 'v1', 'ARCHIVED', { reason: ' Promo selesai ' }, 'k-12345678', 'c');
    expect(audit.catat).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'VOUCHER_ARCHIVED', reason: 'Promo selesai' }),
    );
    await service.transition(manager as never, 'v1', 'ACTIVE', {}, 'k-12345678', 'c');
    expect(tx.voucher.update).toHaveBeenLastCalledWith(expect.objectContaining({ data: { active: true, archivedAt: null } }));
  });
});

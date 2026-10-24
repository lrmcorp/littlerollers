import { PackageCatalogService } from './katalog-paket.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const principal = {
  sessionId: 's',
  userId: id(1),
  roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
  capabilities: ['master:manage', 'branch:all'],
  branchIds: [] as string[],
};

function setup() {
  const row = { id: id(5), branchId: id(2), name: 'Paket 10x', status: 'ACTIVE', classType: { id: id(9), code: 'R', name: 'R' } };
  const tx = {
    paket: {
      findUnique: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockImplementation(async ({ data }) => ({ ...row, ...data })),
    },
  };
  const audit = { catat: jest.fn().mockResolvedValue(undefined), record: jest.fn() };
  const idempotency = { execute: jest.fn(async (_c: unknown, run: (t: typeof tx) => unknown) => run(tx)) };
  const access = { catalog: jest.fn() };
  const service = new PackageCatalogService({} as never, access as never, idempotency as never, audit as never);
  return { service, tx, audit };
}

describe('package deactivate / reactivate', () => {
  it('refuses to deactivate without a reason and changes nothing', async () => {
    const { service, tx, audit } = setup();
    for (const reason of [undefined, '', '  ', 'ab'])
      await expect(
        service.transition(principal as never, id(5), 'INACTIVE', { expectedVersion: 1, reason }, 'k', 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(tx.paket.update).not.toHaveBeenCalled();
    expect(audit.catat).not.toHaveBeenCalled();
  });

  it('records the typed reason with before/after in the permanent audit', async () => {
    const { service, audit } = setup();
    await service.transition(principal as never, id(5), 'INACTIVE', { expectedVersion: 1, reason: ' Tidak dijual lagi ' }, 'k', 'c');
    expect(audit.catat).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'PACKAGE_INACTIVE',
        objectType: 'Package',
        objectId: id(5),
        branchId: id(2),
        reason: 'Tidak dijual lagi',
        beforeMasked: { status: 'ACTIVE' },
        afterMasked: { status: 'INACTIVE' },
      }),
    );
  });

  // Controller memanggil dengan status tujuan; dulu 'ACTIVE' salah dibaca sebagai nonaktifkan.
  it.each(['ACTIVE', 'activate'])('reactivating (%s) really activates and needs no reason', async (action) => {
    const { service, tx } = setup();
    await service.transition(principal as never, id(5), action, {}, 'k', 'c');
    expect(tx.paket.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'ACTIVE' } }));
  });

  it('deactivating via the status the controller sends (INACTIVE) deactivates', async () => {
    const { service, tx } = setup();
    await service.transition(principal as never, id(5), 'INACTIVE', { reason: 'Tidak dijual' }, 'k', 'c');
    expect(tx.paket.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'INACTIVE' } }));
  });
});

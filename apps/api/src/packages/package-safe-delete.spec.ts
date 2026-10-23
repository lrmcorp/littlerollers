import { HttpStatus } from '@nestjs/common';
import { PackageCatalogService } from './katalog-paket.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const packageId = id(1);

const principal = {
  sessionId: 's-admin',
  userId: id(100),
  roles: [] as never,
  capabilities: ['package:manage'],
  branchIds: [] as string[],
};

function setupPackage(relationsCount: { purchases?: number; customerPackages?: number } = {}) {
  const packageRow = {
    id: packageId,
    code: 'PKG-10X',
    name: '10x All Access Reformer',
    priceRp: 1_500_000,
    sessionCount: 10,
    validityDays: 60,
    status: 'ACTIVE',
    _count: {
      purchases: 0,
      customerPackages: 0,
      ...relationsCount,
    },
  };

  const tx = {
    paket: {
      delete: jest.fn().mockResolvedValue(packageRow),
    },
  };

  const db = {
    paket: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === packageId) return Promise.resolve(packageRow);
        return Promise.resolve(null);
      }),
      delete: tx.paket.delete,
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };

  const access = {
    catalog: jest.fn(),
  };

  const auditService = {
    record: jest.fn(),
  };

  const idempotency = {} as never;

  const service = new PackageCatalogService(
    db as never,
    access as never,
    idempotency,
    auditService as never,
  );

  return { service, db, tx, access, auditService, packageRow };
}

describe('PackageCatalogService - Safe Hard Delete (deletePackage)', () => {
  it('hard-deletes package cleanly when it has 0 dependencies', async () => {
    const { service, tx, auditService } = setupPackage();

    const result = await service.deletePackage(principal, packageId, 'corr-test');

    expect(result).toEqual({
      success: true,
      id: packageId,
      name: '10x All Access Reformer',
    });
    expect(tx.paket.delete).toHaveBeenCalledWith({ where: { id: packageId } });
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PACKAGE_DELETED',
        resourceType: 'Package',
        resourceId: packageId,
      }),
    );
  });

  it('rejects deletion with 409 Conflict when package has purchases', async () => {
    const { service, tx } = setupPackage({ purchases: 2 });

    await expect(service.deletePackage(principal, packageId, 'corr-test')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_PACKAGE_WITH_DEPENDENCIES',
      status: HttpStatus.CONFLICT,
    });
    expect(tx.paket.delete).not.toHaveBeenCalled();
  });

  it('rejects deletion with 409 Conflict when package has customer packages', async () => {
    const { service, tx } = setupPackage({ customerPackages: 5 });

    await expect(service.deletePackage(principal, packageId, 'corr-test')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_PACKAGE_WITH_DEPENDENCIES',
      status: HttpStatus.CONFLICT,
    });
    expect(tx.paket.delete).not.toHaveBeenCalled();
  });

  it('throws 404 RESOURCE_NOT_FOUND when package does not exist', async () => {
    const { service } = setupPackage();

    await expect(service.deletePackage(principal, id(999), 'corr-test')).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('enforces package:manage authorization', async () => {
    const { service, access } = setupPackage();
    access.catalog.mockImplementation(() => {
      throw { code: 'FORBIDDEN', status: HttpStatus.FORBIDDEN };
    });

    await expect(service.deletePackage(principal, packageId, 'corr-test')).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: HttpStatus.FORBIDDEN,
    });
  });
});

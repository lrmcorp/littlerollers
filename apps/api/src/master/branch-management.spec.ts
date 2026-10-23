import { HttpStatus } from '@nestjs/common';
import { PolicyService } from '../identity/policy.service';
import { MasterAccessService } from './master-access.service';
import { MasterCatalogService } from './master-catalog.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchId = id(1);

const superOwner = {
  sessionId: 's-owner',
  userId: id(100),
  roles: [] as never,
  capabilities: ['master:manage', 'master:read', 'branch:all'],
  branchIds: [] as string[],
};

const unauthorizedStaff = {
  sessionId: 's-staff',
  userId: id(200),
  roles: [] as never,
  capabilities: ['master:read'],
  branchIds: [branchId],
};

function setupBranch(relationsCount: Partial<Record<string, number>> = {}, preferredUsersCount = 0) {
  const branchRow = {
    id: branchId,
    code: 'DD-TEST',
    name: 'Daily Dose Test Studio',
    timezone: 'Asia/Jakarta',
    active: true,
    _count: {
      studios: 0,
      classSlots: 0,
      instructorAssignments: 0,
      purchases: 0,
      paymentAccounts: 0,
      supportCases: 0,
      ownerAssignments: 0,
      minQuotaSettings: 0,
      instructorFees: 0,
      projectionRates: 0,
      otherCosts: 0,
      monthlyCloses: 0,
      correctionJournals: 0,
      instructorAvailabilities: 0,
      packages: 0,
      bookings: 0,
      ...relationsCount,
    },
  };

  const tx = {
    cabang: {
      delete: jest.fn().mockResolvedValue(branchRow),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: id(999) }),
    },
  };

  const db = {
    cabang: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === branchId) return Promise.resolve(branchRow);
        return Promise.resolve(null);
      }),
      delete: tx.cabang.delete,
    },
    user: {
      count: jest.fn().mockResolvedValue(preferredUsersCount),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };

  const access = new MasterAccessService(new PolicyService());
  const service = new MasterCatalogService(db as never, access);

  return { service, db, tx, branchRow };
}

describe('MasterCatalogService - deleteBranch', () => {
  it('hard-deletes branch cleanly when it has 0 dependencies', async () => {
    const { service, tx } = setupBranch();

    const result = await service.deleteBranch(superOwner, branchId, 'corr-test');

    expect(result).toEqual({
      success: true,
      id: branchId,
      name: 'Daily Dose Test Studio',
    });
    expect(tx.cabang.delete).toHaveBeenCalledWith({ where: { id: branchId } });
  });

  it('rejects deletion with 409 Conflict when branch has child studios', async () => {
    const { service, tx } = setupBranch({ studios: 2 });

    await expect(service.deleteBranch(superOwner, branchId, 'corr-test')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
      status: HttpStatus.CONFLICT,
    });
    expect(tx.cabang.delete).not.toHaveBeenCalled();
  });

  it('rejects deletion with 409 Conflict when branch has operational class slots or bookings', async () => {
    const { service, tx } = setupBranch({ classSlots: 5, bookings: 12 });

    await expect(service.deleteBranch(superOwner, branchId, 'corr-test')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
      status: HttpStatus.CONFLICT,
    });
    expect(tx.cabang.delete).not.toHaveBeenCalled();
  });

  it('rejects deletion with 409 Conflict when members have preferredBranchId pointing to branch', async () => {
    const { service, tx } = setupBranch({}, 3);

    await expect(service.deleteBranch(superOwner, branchId, 'corr-test')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
      status: HttpStatus.CONFLICT,
    });
    expect(tx.cabang.delete).not.toHaveBeenCalled();
  });

  it('throws 404 NOT_FOUND when branch does not exist', async () => {
    const { service } = setupBranch();

    await expect(service.deleteBranch(superOwner, id(999), 'corr-test')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('enforces master:manage authorization for deleting a branch', async () => {
    const { service } = setupBranch();

    await expect(service.deleteBranch(unauthorizedStaff, branchId, 'corr-test')).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: HttpStatus.FORBIDDEN,
    });
  });
});

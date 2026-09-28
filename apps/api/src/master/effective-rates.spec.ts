import { PolicyService } from '../identity/policy.service';
import { EffectiveSettingsService } from './konfigurasi-efektif.service';
import { MasterAccessService } from './master-access.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const classType = id(2);
const instructor = id(3);
const rowId = id(50);

const principalFor = (capabilities: string[], branchIds = [branchA]) => ({
  sessionId: 's',
  userId: id(100),
  roles: [] as never,
  capabilities,
  branchIds,
});
const finance = principalFor(['master:manage', 'finance:manage']);

const dayFromToday = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return new Date(date.toISOString().slice(0, 10));
};

function setup(effectiveDate = dayFromToday(30)) {
  const feeRow = { id: rowId, branchId: branchA, effectiveDate };
  const tx = {
    instructorFee: {
      findUnique: jest.fn().mockResolvedValue(feeRow),
      delete: jest.fn().mockResolvedValue({}),
    },
    projectionRate: {
      findUnique: jest.fn().mockResolvedValue({ ...feeRow }),
      delete: jest.fn().mockResolvedValue({}),
    },
  };
  const created: Array<Record<string, any>> = [];
  const db = {
    ...tx,
    instructorFee: {
      ...tx.instructorFee,
      create: jest.fn().mockImplementation(async ({ data }) => {
        created.push(data);
        return { id: rowId, ...data, branch: null, classType: null, instructor: null, createdAt: new Date() };
      }),
    },
    projectionRate: {
      ...tx.projectionRate,
      create: jest.fn().mockImplementation(async ({ data }) => {
        created.push(data);
        return { id: rowId, ...data, branch: null, classType: null, createdAt: new Date() };
      }),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new EffectiveSettingsService(
    new MasterAccessService(new PolicyService()),
    db as never,
  );
  return { service, tx, db, created };
}

const feeInput = (overrides: Record<string, unknown> = {}) => ({
  kind: 'INSTRUCTOR_FEE' as const,
  branchId: branchA,
  classTypeId: classType,
  instructorUserId: instructor,
  feeRp: 180_000,
  effectiveFrom: '2026-10-01',
  reason: 'Kenaikan honor',
  ...overrides,
});

describe('creating a fee or rate', () => {
  it('requires an explicit amount instead of silently defaulting', async () => {
    const { service, db } = setup();
    for (const feeRp of [undefined, 0, -5, 1.5, 10_000_001])
      await expect(
        service.create(finance, feeInput({ feeRp }), 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(
        finance,
        { ...feeInput(), kind: 'PROJECTION_RATE', rateRp: undefined, feeRp: undefined },
        'c',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(db.instructorFee.create).not.toHaveBeenCalled();
    expect(db.projectionRate.create).not.toHaveBeenCalled();
  });

  it('requires an instructor for a fee (never the acting manager) and a valid date', async () => {
    const { service, db } = setup();
    await expect(
      service.create(finance, feeInput({ instructorUserId: undefined }), 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    for (const effectiveFrom of [undefined, '', 'bukan-tanggal'])
      await expect(
        service.create(finance, feeInput({ effectiveFrom }), 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(db.instructorFee.create).not.toHaveBeenCalled();
  });

  it('stores the given fee and rate', async () => {
    const { service, created } = setup();
    await service.create(finance, feeInput(), 'c');
    await service.create(
      finance,
      { ...feeInput(), kind: 'PROJECTION_RATE', feeRp: undefined, rateRp: 130_000 },
      'c',
    );
    expect(created[0]).toMatchObject({ instructorId: instructor, feePerJamRp: 180_000 });
    expect(created[1]).toMatchObject({ ratePerSesiRp: 130_000 });
  });
});

describe('deleting a fee or rate', () => {
  it('needs master:manage and finance:manage', async () => {
    const { service, tx } = setup();
    await expect(
      service.remove(principalFor(['master:manage']), 'INSTRUCTOR_FEE', rowId, 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.remove(principalFor(['finance:manage']), 'INSTRUCTOR_FEE', rowId, 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(tx.instructorFee.delete).not.toHaveBeenCalled();
  });

  it('removes a not-yet-effective fee and rate', async () => {
    const { service, tx } = setup();
    await expect(service.remove(finance, 'INSTRUCTOR_FEE', rowId, 'c')).resolves.toEqual({
      id: rowId,
      deleted: true,
    });
    await service.remove(finance, 'PROJECTION_RATE', rowId, 'c');
    expect(tx.instructorFee.delete).toHaveBeenCalledWith({ where: { id: rowId } });
    expect(tx.projectionRate.delete).toHaveBeenCalledWith({ where: { id: rowId } });
  });

  it('refuses a rate that already applies (today or earlier)', async () => {
    for (const days of [0, -1, -90]) {
      const { service, tx } = setup(dayFromToday(days));
      await expect(service.remove(finance, 'PROJECTION_RATE', rowId, 'c')).rejects.toMatchObject({
        code: 'RATE_IN_EFFECT',
      });
      expect(tx.projectionRate.delete).not.toHaveBeenCalled();
    }
  });

  it('hides rates of another branch and malformed ids', async () => {
    const { service } = setup();
    await expect(
      service.remove(principalFor(['master:manage', 'finance:manage'], [id(9)]), 'INSTRUCTOR_FEE', rowId, 'c'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.remove(finance, 'INSTRUCTOR_FEE', 'x', 'c')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

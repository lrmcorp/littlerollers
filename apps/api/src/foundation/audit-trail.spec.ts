import { PolicyService } from '../identity/policy.service';
import { OwnerBranchService } from '../identity/owner-branch.service';
import { AssignmentService } from '../identity/assignment.service';
import { MasterAccessService } from '../master/master-access.service';
import { PublicContentManagementService } from '../public-content/public-content-management.service';
import { AuditService, scrubAuditValue } from './audit.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const superOwner = {
  sessionId: 's',
  userId: id(1),
  roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
  capabilities: ['branch:all', 'public-content:read', 'public-content:manage', 'assignment:manage'],
  branchIds: [] as string[],
};

const dbWithAuditLog = (create = jest.fn().mockResolvedValue({})) => ({ auditLog: { create } });

describe('AuditService persists to audit_log', () => {
  it('writes the entry with object, actor, branch, reason and before/after', async () => {
    const db = dbWithAuditLog();
    await new AuditService(db as never).catat(null, {
      actorId: id(1),
      branchId: id(2),
      correlationId: 'corr-1',
      action: 'master.branch_updated',
      objectType: 'Branch',
      objectId: id(2),
      reason: '  salah ketik nama  ',
      targetUserId: id(3),
      beforeMasked: { name: 'Lama' },
      afterMasked: { name: 'Baru' },
    });
    expect(db.auditLog.create).toHaveBeenCalledTimes(1);
    expect(db.auditLog.create.mock.calls[0]![0].data).toMatchObject({
      action: 'master.branch_updated',
      actorId: id(1),
      branchId: id(2),
      correlationId: 'corr-1',
      reason: 'salah ketik nama',
      targetUserId: id(3),
      objectType: 'Branch',
      objectId: id(2),
      detail: { before: { name: 'Lama' }, after: { name: 'Baru' } },
    });
  });

  it('writes inside the caller transaction when one is given, so it rolls back with the change', async () => {
    const own = dbWithAuditLog();
    const tx = dbWithAuditLog();
    await new AuditService(own as never).catat(tx as never, {
      action: 'x.y',
      objectType: 'X',
      objectId: 'o1',
    });
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(own.auditLog.create).not.toHaveBeenCalled();
  });

  it('record() (legacy shape) persists too, and never throws even when the write fails', async () => {
    const db = dbWithAuditLog(jest.fn().mockRejectedValue(new Error('db down')));
    const audit = new AuditService(db as never);
    await expect(
      audit.record({ action: 'PACKAGE_CREATED', resourceType: 'Package', resourceId: 'p1', actorUserId: id(1) }),
    ).resolves.toBeUndefined();
    await expect(
      audit.catat(null, { action: 'PACKAGE_UPDATED', objectType: 'Package', objectId: 'p1' }),
    ).resolves.toBeUndefined();
    expect(db.auditLog.create).toHaveBeenCalledTimes(2);
  });

  it('keeps secrets and raw account numbers out of the stored detail', async () => {
    const db = dbWithAuditLog();
    await new AuditService(db as never).record({
      action: 'PAYMENT_ACCOUNT_CREATED',
      resourceType: 'PaymentAccount',
      resourceId: 'a1',
      details: {
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountNumberChanged: true,
        nested: { password: 'rahasia', token: 'abc', note: 'ok' },
      },
    });
    const detail = db.auditLog.create.mock.calls[0]![0].data.detail;
    expect(JSON.stringify(detail)).not.toMatch(/1234567890|rahasia|abc/);
    expect(detail.after).toMatchObject({ bankName: 'BCA', accountNumberChanged: true, nested: { note: 'ok' } });
  });

  it('truncates oversized text and arrays', () => {
    const value = scrubAuditValue({ text: 'x'.repeat(900), list: Array.from({ length: 80 }, (_, i) => i) }) as {
      text: string;
      list: unknown[];
    };
    expect(value.text.length).toBeLessThan(510);
    expect(value.list).toHaveLength(50);
  });
});

describe('master data audit is no longer a no-op', () => {
  it('delegates to AuditService inside the caller transaction with before/after', async () => {
    const audit = { catat: jest.fn().mockResolvedValue(undefined) };
    const access = new MasterAccessService(new PolicyService(), audit as never);
    const tx = {} as never;
    await access.audit(tx, superOwner as never, 'corr', 'master.branch_deactivated', 'Branch', id(2), id(2), { active: true }, { active: false });
    expect(audit.catat).toHaveBeenCalledWith(tx, {
      actorId: id(1),
      branchId: id(2),
      correlationId: 'corr',
      action: 'master.branch_deactivated',
      objectType: 'Branch',
      objectId: id(2),
      beforeMasked: { active: true },
      afterMasked: { active: false },
    });
  });

  it('still works (silently) when constructed without an audit service, as older specs do', async () => {
    const access = new MasterAccessService(new PolicyService());
    await expect(
      access.audit({} as never, superOwner as never, 'c', 'a', 'T', 'o', null),
    ).resolves.toBeUndefined();
  });
});

describe('modules that had no audit now record their mutations', () => {
  it('records an owner–branch unassignment with what was removed', async () => {
    const audit = { catat: jest.fn().mockResolvedValue(undefined) };
    const db = {
      ownerCabang: {
        findUnique: jest.fn().mockResolvedValue({ id: id(9), ownerId: id(4), branchId: id(2) }),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    await new OwnerBranchService(db as never, audit as never).unassignOwner(superOwner as never, id(9));
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        action: 'owner_branch.unassigned',
        objectType: 'OwnerBranch',
        objectId: id(9),
        branchId: id(2),
        beforeMasked: { ownerId: id(4), branchId: id(2) },
      }),
    );
  });

  it('records the reason when an instructor assignment ends', async () => {
    const audit = { catat: jest.fn().mockResolvedValue(undefined) };
    const db = {
      ownerCabang: { findUnique: jest.fn().mockResolvedValue(null) },
      penugasanInstruktur: {
        findUnique: jest.fn().mockResolvedValue({ id: id(8), branchId: id(2), coachId: id(5) }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    await new AssignmentService(db as never, new PolicyService(), audit as never).end(
      superOwner as never,
      id(8),
      { effectiveAt: '2026-10-24T00:00:00Z', reason: 'Pindah studio' },
      'corr-9',
    );
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        action: 'assignment.ended',
        reason: 'Pindah studio',
        correlationId: 'corr-9',
        beforeMasked: { type: 'INSTRUCTOR', userId: id(5), branchId: id(2) },
      }),
    );
  });

  it('records publishing public content without copying its payload', async () => {
    const audit = { catat: jest.fn().mockResolvedValue(undefined) };
    const row = {
      id: id(10),
      contentKey: 'HOME_HERO_CAROUSEL',
      branchId: null,
      scopeKey: 'GLOBAL',
      kind: 'HERO_CAROUSEL',
      locale: 'id-ID',
      version: 4,
      status: 'DRAFT',
      payload: { slides: [{ title: 'sangat panjang' }] },
      createdById: id(1),
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      archivedAt: null,
    };
    const tx = { publicContent: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) } };
    const db = {
      publicContent: { findUnique: jest.fn().mockResolvedValue(row) },
      $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    };
    const service = new PublicContentManagementService(db as never, new PolicyService(), audit as never);
    await service.transition(superOwner as never, id(10), 'PUBLISHED', 'corr-1');
    const entry = audit.catat.mock.calls[0]![1];
    expect(entry).toMatchObject({
      action: 'public_content.published',
      objectType: 'PublicContent',
      objectId: id(10),
      beforeMasked: { status: 'DRAFT' },
    });
    expect(JSON.stringify(entry)).not.toContain('sangat panjang');
  });
});

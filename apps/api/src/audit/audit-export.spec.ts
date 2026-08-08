import { AuditExportService } from './audit-export.service';
import { PolicyService } from '../identity/policy.service';

const principal = {
  sessionId: 'session',
  userId: 'owner',
  roles: [{ role: 'OWNER' as const, branchId: 'branch-a' }],
  capabilities: ['audit:read'],
  branchIds: ['branch-a'],
};

describe('secure audit export', () => {
  it('hides foreign branch scope and validates reason before persistence', async () => {
    const db = { auditExport: {}, auditLog: {} };
    const service = new AuditExportService(db as never, new PolicyService());
    await expect(
      service.create(
        principal,
        {
          branchIds: ['branch-b'],
          from: '2026-01-01T00:00:00Z',
          to: '2026-01-02T00:00:00Z',
          format: 'CSV',
          reason: 'review',
        },
        'key',
        'correlation',
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.create(
        principal,
        {
          branchIds: ['branch-a'],
          from: '2026-01-01T00:00:00Z',
          to: '2026-01-02T00:00:00Z',
          format: 'CSV',
          reason: '',
        },
        'key',
        'correlation',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('makes private download authorization single use', async () => {
    const record = {
      id: 'export',
      status: 'READY',
      content: 'safe,data',
      format: 'CSV',
      downloadTokenHash: '',
      downloadExpiresAt: new Date(Date.now() + 60_000),
    };
    const db = {
      auditExport: {
        findUnique: jest.fn().mockResolvedValue(record),
        update: jest.fn().mockImplementation(({ data }) => {
          Object.assign(record, data);
          return record;
        }),
      },
    };
    const service = new AuditExportService(db as never, new PolicyService());
    const crypto = await import('node:crypto');
    const token = 'private-token';
    record.downloadTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await expect(service.download('export', token)).resolves.toMatchObject({
      content: 'safe,data',
      format: 'CSV',
    });
    expect(record.downloadTokenHash).toBeNull();
    await expect(service.download('export', token)).rejects.toMatchObject({
      code: 'RESOURCE_GONE',
    });
  });

  it('creates an idempotent in-app notification when an export becomes ready', async () => {
    const expiresAt = new Date('2026-08-07T00:00:00.000Z');
    const createMany = jest.fn().mockResolvedValue({ count: 1 });
    const tx = {
      auditExport: {
        update: jest.fn().mockResolvedValue({
          id: 'export-1',
          requestedById: 'owner',
          rowCount: 0,
          version: 2,
          expiresAt,
        }),
      },
      userNotification: { createMany },
    };
    const db = {
      auditExport: {
        update: jest.fn().mockResolvedValue({
          id: 'export-1',
          requestedById: 'owner',
          branchIds: ['branch-a'],
          from: new Date('2026-08-01T00:00:00.000Z'),
          until: new Date('2026-08-02T00:00:00.000Z'),
          actorId: null,
          objectType: null,
          format: 'CSV',
          expiresAt,
        }),
      },
      auditLog: { findMany: jest.fn().mockResolvedValue([]) },
      user: { findUnique: jest.fn().mockResolvedValue({ email: null }) },
      $transaction: jest.fn((callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    const service = new AuditExportService(db as never, new PolicyService());
    await (service as unknown as { process(id: string): Promise<void> }).process('export-1');
    expect(createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'owner',
          eventKey: 'audit-export-ready:export-1:2',
          title: 'Export audit telah siap',
          expiresAt,
        }),
      ],
      skipDuplicates: true,
    });
  });
});

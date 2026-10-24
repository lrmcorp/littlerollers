import { PolicyService } from '../identity/policy.service';
import { LifecycleService } from './lifecycle.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(2);

const superOwner = {
  sessionId: 's',
  userId: id(1),
  roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
  capabilities: [
    'branch:all',
    'master:manage',
    'voucher:manage',
    'payment-account:manage',
    'package-promotion:manage',
    'public-content:manage',
    'notification:manage',
    'support:manage',
    'class-slot:manage',
    'user:admin',
  ],
  branchIds: [] as string[],
};
const branchAdmin = {
  ...superOwner,
  roles: [{ role: 'ADMIN' as const, branchId: branchA }],
  capabilities: ['master:manage', 'payment-account:manage', 'user:admin'],
  branchIds: [branchA],
};

/** Daftar FK ala information_schema: voucher<-pembelian (SetNull), cabang<-studio (Restrict), user<-session (Cascade). */
const fkRows = [
  { t: 'pembelian', c: 'voucherId', rt: 'voucher', d: 'SET NULL' },
  { t: 'studio', c: 'branchId', rt: 'cabang', d: 'RESTRICT' },
  { t: 'slot_kelas', c: 'branchId', rt: 'cabang', d: 'RESTRICT' },
  { t: 'user_session', c: 'userId', rt: 'user', d: 'CASCADE' },
  { t: 'pembelian', c: 'userId', rt: 'user', d: 'RESTRICT' },
  { t: 'bad; DROP TABLE x', c: 'id', rt: 'user', d: 'RESTRICT' },
  { t: 'ruangan', c: 'studioId', rt: 'studio', d: 'RESTRICT' },
  { t: 'slot_kelas', c: 'roomId', rt: 'ruangan', d: 'SET NULL' },
  { t: 'paket', c: 'classTypeId', rt: 'jenis_kelas', d: 'RESTRICT' },
  { t: 'pembelian', c: 'packageId', rt: 'paket', d: 'RESTRICT' },
  { t: 'pemesanan_kelas', c: 'classSlotId', rt: 'slot_kelas', d: 'RESTRICT' },
  { t: 'projection_rate', c: 'branchId', rt: 'cabang', d: 'RESTRICT' },
  { t: 'projection_rate', c: 'classTypeId', rt: 'jenis_kelas', d: 'RESTRICT' },
];

function build(opts: { counts?: Record<string, number>; row?: Record<string, unknown>; kind?: string } = {}) {
  const counts = opts.counts ?? {};
  const delegate = {
    findUnique: jest.fn().mockResolvedValue(opts.row ?? null),
    delete: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockImplementation(async ({ data }) => ({ ...(opts.row ?? {}), ...data })),
  };
  const queryRawUnsafe = jest.fn(async (sql: string, ..._args: unknown[]) => {
    if (sql.includes('information_schema')) return fkRows;
    const table = /FROM `([^`]+)`/u.exec(sql)?.[1] ?? '';
    return [{ c: BigInt(counts[table] ?? 0) }];
  });
  const db: any = {
    $queryRawUnsafe: queryRawUnsafe,
    voucher: delegate,
    cabang: delegate,
    user: { ...delegate, count: jest.fn().mockResolvedValue(counts.preferred ?? 0) },
    packagePromotion: delegate,
    studio: delegate,
    ruangan: delegate,
    jenisKelas: delegate,
    paket: {
      findUnique: jest.fn().mockImplementation(async () => ({ ...(opts.row ?? {}), branchId: null })),
      delete: delegate.delete,
    },
    pembelian: { count: jest.fn().mockResolvedValue(counts.promoPurchases ?? 0) },
    projectionRate: { deleteMany: jest.fn().mockResolvedValue({ count: counts.legacyProjectionRates ?? 0 }) },
    slotKelas: { ...delegate, count: jest.fn().mockResolvedValue(counts.upcomingSlots ?? 0) },
    rekeningPembayaran: delegate,
    publicContent: delegate,
    supportCase: delegate,
    supportCaseNote: { count: jest.fn().mockResolvedValue(counts.caseNotes ?? 0) },
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(db)),
  };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  const service = new LifecycleService(db, new PolicyService(), audit as never);
  return { service, db, delegate, audit, queryRawUnsafe };
}

describe('LifecycleService.inspect', () => {
  it('counts foreign-key children (except CASCADE ones), names them in Indonesian and ignores unsafe identifiers', async () => {
    const { service, queryRawUnsafe } = build({
      row: { id: branchA, code: 'GG', name: 'Green Garden' },
      counts: { studio: 3, slot_kelas: 12 },
    });
    const result = await service.inspect(superOwner as never, 'branch', branchA);
    expect(result).toMatchObject({ deletable: false });
    expect(result.blockers).toEqual([
      { kind: 'studio', label: 'studio', count: 3 },
      { kind: 'slot_kelas', label: 'jadwal kelas', count: 12 },
    ]);
    const sqls = queryRawUnsafe.mock.calls.map(([sql]) => String(sql));
    expect(sqls.some((sql) => sql.includes('DROP TABLE'))).toBe(false);
    // Anak CASCADE tidak dihitung untuk user; ini kind cabang, jadi hanya dua tabel yang diperiksa.
    expect(sqls.filter((sql) => sql.includes('SELECT COUNT'))).toHaveLength(2);
  });

  it('reports a clean entity as deletable', async () => {
    const { service } = build({ row: { id: branchA, code: 'GG', name: 'x' } });
    await expect(service.inspect(superOwner as never, 'branch', branchA)).resolves.toMatchObject({
      deletable: true,
      blockers: [],
    });
  });

  it('adds non-FK blockers: a used voucher, a protected Super Owner account, a published draft-only item', async () => {
    const voucher = build({ row: { id: id(5), code: 'HEMAT', name: 'Hemat', usedCount: 4 }, counts: { pembelian: 4 } });
    const v = await voucher.service.inspect(superOwner as never, 'voucher', id(5));
    expect(v.blockers.map((item) => item.kind)).toEqual(['pembelian', 'voucher_used']);

    const owner = build({ row: { id: id(6), role: 'SUPER_OWNER', displayName: 'Boss', status: 'ACTIVE' } });
    const o = await owner.service.inspect(superOwner as never, 'user', id(6));
    expect(o.blockers).toEqual([{ kind: 'protected_account', label: 'akun Super Owner (dilindungi)', count: 1 }]);

    const content = build({ row: { id: id(7), status: 'PUBLISHED', contentKey: 'K', kind: 'FAQ', version: 1 } });
    const c = await content.service.inspect(superOwner as never, 'public-content', id(7));
    expect(c.deletable).toBe(false);
    const draft = build({ row: { id: id(7), status: 'DRAFT', contentKey: 'K', kind: 'FAQ', version: 1 } });
    expect((await draft.service.inspect(superOwner as never, 'public-content', id(7))).deletable).toBe(true);
  });

  it('a promotion is blocked by the purchases that used it even though no FK points at it', async () => {
    const { service } = build({
      row: { id: id(8), packageId: id(9), name: 'Promo', status: 'ACTIVE' },
      counts: { promoPurchases: 2 },
    });
    const result = await service.inspect(superOwner as never, 'promotion', id(8));
    expect(result.blockers).toEqual([{ kind: 'pembelian', label: 'pembelian yang memakai promosi ini', count: 2 }]);
  });

  it('hides entities outside the caller scope and refuses callers without the capability', async () => {
    const other = build({ row: { id: branchA, code: 'GG', name: 'x' } });
    await expect(
      other.service.inspect({ ...branchAdmin, branchIds: [id(99)] } as never, 'branch', branchA),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      other.service.inspect({ ...branchAdmin, capabilities: [] } as never, 'branch', branchA),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(other.service.inspect(superOwner as never, 'branch', 'x')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('LifecycleService.remove', () => {
  it('requires a reason before touching anything', async () => {
    const { service, delegate } = build({ row: { id: id(5), code: 'X', name: 'x', usedCount: 0 } });
    for (const reason of [undefined, '', '  ', 'ab', 'x'.repeat(501)])
      await expect(service.remove(superOwner as never, 'voucher', id(5), reason, 'c')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    expect(delegate.delete).not.toHaveBeenCalled();
  });

  it('deletes a clean entity in one transaction and writes a permanent audit entry with a snapshot and the reason', async () => {
    const { service, delegate, audit, db } = build({ row: { id: id(5), code: 'HEMAT', name: 'Hemat', usedCount: 0 } });
    await expect(
      service.remove(superOwner as never, 'voucher', id(5), 'Salah buat, belum dipakai', 'corr-1'),
    ).resolves.toEqual({ id: id(5), kind: 'voucher', deleted: true, success: true });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: id(5) } });
    expect(audit.catat).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'lifecycle.voucher_deleted',
        objectType: 'Voucher',
        objectId: id(5),
        reason: 'Salah buat, belum dipakai',
        correlationId: 'corr-1',
        beforeMasked: { code: 'HEMAT', name: 'Hemat', usedCount: 0 },
      }),
    );
  });

  it('refuses with CANNOT_DELETE_WITH_DEPENDENCIES and a readable list when something still points at it', async () => {
    const { service, delegate, audit } = build({
      row: { id: id(5), code: 'HEMAT', name: 'Hemat', usedCount: 3 },
      counts: { pembelian: 3 },
    });
    await expect(
      service.remove(superOwner as never, 'voucher', id(5), 'Bersih-bersih', 'c'),
    ).rejects.toMatchObject({
      code: 'CANNOT_DELETE_WITH_DEPENDENCIES',
      status: 409,
      details: [
        {
          field: 'id',
          issue:
            'Voucher tidak dapat dihapus karena masih memiliki data terkait (3 pembelian, 3 pemakaian voucher). Gunakan Jeda, atau Arsipkan bila voucher tidak dipakai lagi.',
        },
        { field: 'pembelian', issue: '3 pembelian' },
        { field: 'voucher_used', issue: '3 pemakaian voucher' },
      ],
    });
    expect(delegate.delete).not.toHaveBeenCalled();
    expect(audit.catat).not.toHaveBeenCalled();
  });

  it('turns a database FK rejection (P2003) into the same dependency error', async () => {
    const { Prisma } = await import('@prisma/client');
    const { service, delegate } = build({ row: { id: id(5), code: 'X', name: 'x', usedCount: 0 } });
    delegate.delete.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('fk', { code: 'P2003', clientVersion: 'test' }),
    );
    await expect(service.remove(superOwner as never, 'voucher', id(5), 'alasan', 'c')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_WITH_DEPENDENCIES',
    });
  });

  it('only a Super Owner may delete an account, never their own, and the audit shows the person masked', async () => {
    const row = { id: id(6), role: 'MEMBER', displayName: 'Rina', status: 'INACTIVE', email: 'rina@example.test' };
    const admin = build({ row });
    await expect(
      admin.service.remove({ ...superOwner, roles: [{ role: 'ADMIN', branchId: null }] } as never, 'user', id(6), 'salah undang', 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const self = build({ row: { ...row, id: superOwner.userId } });
    await expect(
      self.service.remove(superOwner as never, 'user', superOwner.userId, 'coba hapus diri', 'c'),
    ).rejects.toMatchObject({ code: 'CANNOT_DELETE_SELF' });

    const ok = build({ row });
    await ok.service.remove(superOwner as never, 'user', id(6), 'undangan salah ketik', 'c');
    const entry = ok.audit.catat.mock.calls[0]![1];
    expect(entry).toMatchObject({ action: 'lifecycle.user_deleted', targetUserId: id(6) });
    expect(entry.beforeMasked).toMatchObject({ displayName: 'Rina', email: 'ri***@example.test' });
    expect(JSON.stringify(entry)).not.toContain('rina@example.test');
  });

  it('refuses a kind that has no delete in this module (rates keep their own date rule)', async () => {
    const { service } = build({ row: { id: branchA } });
    await expect(service.remove(superOwner as never, 'unknown' as never, branchA, 'alasan', 'c')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('LifecycleService.archive', () => {
  it('takes an optional reason (too short is rejected), hides the entity (inactive + archivedAt) and audits the change', async () => {
    const { service, delegate, audit } = build({ row: { id: branchA, active: true, archivedAt: null } });
    await expect(service.archive(superOwner as never, 'branch', branchA, 'ab', 'c')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(delegate.update).not.toHaveBeenCalled();
    await service.archive(superOwner as never, 'branch', branchA, 'Cabang ditutup permanen', 'c');
    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: branchA },
      data: { active: false, archivedAt: expect.any(Date) },
    });
    expect(audit.catat).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'lifecycle.branch_archived',
        reason: 'Cabang ditutup permanen',
        beforeMasked: { active: true, archived: false },
        afterMasked: { active: false, archived: true },
      }),
    );
  });

  it.each([['branch', 'branchId'], ['class-type', 'classTypeId']] as const)(
    'refuses to archive a %s that still has upcoming classes, and changes nothing',
    async (kind, column) => {
      const { service, delegate, db, audit } = build({
        row: { id: branchA, active: true, archivedAt: null },
        counts: { upcomingSlots: 2 },
      });
      await expect(service.archive(superOwner as never, kind, branchA, 'ditutup', 'c')).rejects.toMatchObject({
        code: 'HAS_UPCOMING_SLOTS',
        status: 409,
      });
      expect(db.slotKelas.count.mock.calls[0][0].where).toMatchObject({
        [column]: branchA,
        status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
      });
      expect(delegate.update).not.toHaveBeenCalled();
      expect(audit.catat).not.toHaveBeenCalled();
    },
  );

  it('refuses to archive something already archived', async () => {
    const { service } = build({ row: { id: branchA, active: false, archivedAt: new Date() } });
    await expect(
      service.archive(superOwner as never, 'branch', branchA, 'ulang', 'c'),
    ).rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION' });
  });
});

describe('the delete routes that existed before (branch, studio, room, class type, package)', () => {
  const cases = [
    ['branch', 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES', 'Cabang'],
    ['studio', 'CANNOT_DELETE_STUDIO_WITH_DEPENDENCIES', 'Studio'],
    ['room', 'CANNOT_DELETE_ROOM_WITH_DEPENDENCIES', 'Ruangan'],
    ['class-type', 'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES', 'Tipe kelas'],
    ['package', 'CANNOT_DELETE_PACKAGE_WITH_DEPENDENCIES', 'Paket'],
  ] as const;

  it('branch: keeps its legacy error code and a full sentence the current UI already shows', async () => {
    const { service, delegate } = build({ row: { id: branchA }, counts: { studio: 2, slot_kelas: 5 } });
    await expect(service.remove(superOwner as never, 'branch', branchA, 'Alasan uji', 'c')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
      status: 409,
      details: [
        {
          field: 'id',
          issue:
            'Cabang tidak dapat dihapus karena masih memiliki data terkait (2 studio, 5 jadwal kelas). Gunakan Nonaktifkan, atau Arsipkan bila cabang tidak dipakai lagi.',
        },
        { field: 'studio', issue: '2 studio' },
        { field: 'slot_kelas', issue: '5 jadwal kelas' },
      ],
    });
    expect(delegate.delete).not.toHaveBeenCalled();
  });

  // Tabel anak per jenis pada daftar FK tiruan di atas.
  const child: Record<string, string> = {
    studio: 'ruangan',
    room: 'slot_kelas',
    'class-type': 'paket',
    package: 'pembelian',
  };

  it.each(cases.filter(([kind]) => kind !== 'branch'))(
    '%s: refused with its legacy error code when something still points at it, deleted through the same checker when clean',
    async (kind, code, label) => {
      const blocked = build({ row: { id: branchA }, counts: { [child[kind]!]: 2 } });
      await expect(blocked.service.remove(superOwner as never, kind, branchA, 'Alasan uji', 'c')).rejects.toMatchObject({
        code,
        status: 409,
        details: [{ field: 'id', issue: expect.stringContaining(`${label} tidak dapat dihapus karena masih memiliki data terkait (2 `) }, expect.anything()],
      });
      expect(blocked.delegate.delete).not.toHaveBeenCalled();

      const clean = build({ row: { id: branchA } });
      await expect(clean.service.remove(superOwner as never, kind, branchA, 'Alasan uji', 'c')).resolves.toMatchObject({
        kind,
        deleted: true,
        success: true,
      });
      expect(clean.audit.catat.mock.calls[0]![1]).toMatchObject({ action: `lifecycle.${kind.replace('-', '_')}_deleted` });
    },
  );

  it('demands a reason like every other delete, for all five old kinds', async () => {
    for (const [kind] of cases) {
      const { service, delegate } = build({ row: { id: branchA, code: 'GG', name: 'Green' } });
      for (const reason of [undefined, '', '  ', 'ab'])
        await expect(service.remove(superOwner as never, kind, branchA, reason, 'c')).rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
      expect(delegate.delete).not.toHaveBeenCalled();
    }
  });

  it('respects branch scope like the old routes did', async () => {
    const { service, delegate } = build({ row: { id: branchA, code: 'GG', name: 'Green' } });
    await expect(
      service.remove({ ...branchAdmin, branchIds: [id(99)] } as never, 'branch', branchA, 'Alasan uji', 'c'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.remove({ ...branchAdmin, capabilities: [] } as never, 'branch', branchA, 'Alasan uji', 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(delegate.delete).not.toHaveBeenCalled();
  });
});

describe('LifecycleService foreign-key cache', () => {
  it('does not remember a failed read: the next check tries again', async () => {
    const { service, db } = build({ row: { id: branchA, code: 'GG', name: 'x' } });
    const original = db.$queryRawUnsafe.getMockImplementation()!;
    db.$queryRawUnsafe.mockImplementationOnce(async () => {
      throw new Error('db down');
    });
    await expect(service.inspect(superOwner as never, 'branch', branchA)).rejects.toThrow('db down');
    db.$queryRawUnsafe.mockImplementation(original);
    await expect(service.inspect(superOwner as never, 'branch', branchA)).resolves.toMatchObject({ deletable: true });
  });
});

describe('support cases: delete only an untouched case', () => {
  const openCase = { id: id(5), branchId: branchA, customerId: id(7), status: 'OPEN', priority: 'NORMAL', subject: 'Rahasia' };

  it('is clean when it is still OPEN and has no notes', async () => {
    const { service } = build({ row: openCase });
    await expect(service.inspect(superOwner as never, 'support-case', id(5))).resolves.toMatchObject({ deletable: true });
  });

  it('is blocked once it was handled or has notes, and says why', async () => {
    const handled = build({ row: { ...openCase, status: 'IN_PROGRESS' }, counts: { caseNotes: 2 } });
    const result = await handled.service.inspect(superOwner as never, 'support-case', id(5));
    expect(result.blockers.map((b) => `${b.kind}:${b.count}`)).toEqual(['status:1', 'support_case_note:2']);
    await expect(
      handled.service.remove(superOwner as never, 'support-case', id(5), 'Kasus ganda', 'c'),
    ).rejects.toMatchObject({ code: 'CANNOT_DELETE_WITH_DEPENDENCIES' });
    expect(handled.delegate.delete).not.toHaveBeenCalled();
  });

  it('deletes a clean case with a reason and keeps neither subject nor notes in the audit', async () => {
    const { service, audit, delegate } = build({ row: openCase });
    await service.remove(superOwner as never, 'support-case', id(5), 'Dibuat dobel', 'c');
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: id(5) } });
    const entry = audit.catat.mock.calls[0]![1];
    expect(entry).toMatchObject({ action: 'lifecycle.support_case_deleted', objectType: 'SupportCase', reason: 'Dibuat dobel' });
    expect(JSON.stringify(entry)).not.toContain('Rahasia');
  });

  it('a case without a branch needs cross-branch support:manage', async () => {
    const { service } = build({ row: { ...openCase, branchId: null } });
    const scoped = { ...superOwner, roles: [{ role: 'ADMIN' as const, branchId: branchA }], capabilities: ['support:manage'], branchIds: [branchA] };
    await expect(service.inspect(scoped as never, 'support-case', id(5))).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('class slots: delete only a draft or cancelled class nobody booked', () => {
  const slot = (status: string) => ({
    id: id(8),
    branchId: branchA,
    classTypeId: id(9),
    instructorId: null,
    startAt: new Date('2026-11-02T01:00:00Z'),
    endAt: new Date('2026-11-02T02:00:00Z'),
    status,
  });

  it.each(['DRAFT', 'CANCELLED'])('a %s class without bookings is clean', async (status) => {
    const { service } = build({ row: slot(status) });
    await expect(service.inspect(superOwner as never, 'class-slot', id(8))).resolves.toMatchObject({
      deletable: true,
    });
  });

  it.each(['PUBLISHED', 'CONFIRMED', 'COMPLETED'])('a %s class is history and must be cancelled instead', async (status) => {
    const { service, delegate } = build({ row: slot(status) });
    const result = await service.inspect(superOwner as never, 'class-slot', id(8));
    expect(result.blockers.map((b) => b.kind)).toEqual(['status']);
    await expect(service.remove(superOwner as never, 'class-slot', id(8), 'Salah buat', 'c')).rejects.toMatchObject({
      code: 'CANNOT_DELETE_WITH_DEPENDENCIES',
    });
    expect(delegate.delete).not.toHaveBeenCalled();
  });

  it('a cancelled class that still has bookings stays as history', async () => {
    const { service } = build({ row: slot('CANCELLED'), counts: { pemesanan_kelas: 3 } });
    const result = await service.inspect(superOwner as never, 'class-slot', id(8));
    expect(result.blockers).toEqual([{ kind: 'pemesanan_kelas', label: 'booking', count: 3 }]);
  });

  it('deletes a clean draft with a reason and a permanent audit entry', async () => {
    const { service, audit, delegate } = build({ row: slot('DRAFT') });
    await service.remove(superOwner as never, 'class-slot', id(8), 'Dibuat di tanggal yang salah', 'c');
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: id(8) } });
    expect(audit.catat.mock.calls[0]![1]).toMatchObject({
      action: 'lifecycle.class_slot_deleted',
      objectType: 'ClassSlot',
      branchId: branchA,
      reason: 'Dibuat di tanggal yang salah',
    });
  });

  it('needs a reason and the class-slot:manage capability for the class branch', async () => {
    const { service } = build({ row: slot('DRAFT') });
    await expect(service.remove(superOwner as never, 'class-slot', id(8), '  ', 'c')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const other = { ...superOwner, roles: [{ role: 'ADMIN' as const, branchId: id(77) }], capabilities: ['class-slot:manage'], branchIds: [id(77)] };
    await expect(service.inspect(other as never, 'class-slot', id(8))).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('legacy projection rates never block a delete and are cleaned with their parent', () => {
  const branchRow = { id: id(2), code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' };

  it('a branch is clean even though projection_rate rows still point at it (the table is only scanned via the FK graph)', async () => {
    const { service, queryRawUnsafe } = build({ row: branchRow, counts: { projection_rate: 25 } });
    await expect(service.inspect(superOwner as never, 'branch', id(2))).resolves.toMatchObject({
      deletable: true,
      blockers: [],
    });
    const countedTables = queryRawUnsafe.mock.calls
      .map(([sql]) => /FROM `([^`]+)`/u.exec(String(sql))?.[1])
      .filter(Boolean);
    expect(countedTables).not.toContain('projection_rate');
  });

  it('deleting a branch removes its legacy rates in the same transaction and records how many in the audit', async () => {
    const { service, db, audit, delegate } = build({ row: branchRow, counts: { legacyProjectionRates: 3 } });
    await service.remove(superOwner as never, 'branch', id(2), 'Cabang ditutup', 'c');
    expect(db.projectionRate.deleteMany).toHaveBeenCalledWith({ where: { branchId: id(2) } });
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: id(2) } });
    expect(audit.catat.mock.calls[0]![1].beforeMasked).toMatchObject({ legacyProjectionRatesRemoved: 3 });
  });

  it('a class type cleans legacy rates by class type, and a blocked delete cleans nothing', async () => {
    const clean = build({ row: { id: id(9), code: 'REF', name: 'Reformer' } });
    await clean.service.remove(superOwner as never, 'class-type', id(9), 'Tidak dipakai', 'c');
    expect(clean.db.projectionRate.deleteMany).toHaveBeenCalledWith({ where: { classTypeId: id(9) } });

    const blocked = build({ row: { id: id(9), code: 'REF', name: 'Reformer' }, counts: { paket: 1 } });
    await expect(
      blocked.service.remove(superOwner as never, 'class-type', id(9), 'Tidak dipakai', 'c'),
    ).rejects.toMatchObject({ code: 'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES' });
    expect(blocked.db.projectionRate.deleteMany).not.toHaveBeenCalled();
  });
});

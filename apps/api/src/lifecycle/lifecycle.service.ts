import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
import { optionalReason } from '../foundation/reason';


export type LifecycleKind =
  | 'branch'
  | 'studio'
  | 'room'
  | 'class-type'
  | 'package'
  | 'promotion'
  | 'voucher'
  | 'payment-account'
  | 'min-quota'
  | 'public-content'
  | 'notification-template'
  | 'support-case'
  | 'class-slot'
  | 'user';

export interface Blocker {
  /** Nama tabel yang merujuk entitas ini, atau kode alasan non-relasi. */
  kind: string;
  /** Teks yang dapat langsung ditampilkan ke staf. */
  label: string;
  count: number;
}

export interface Deletability {
  kind: LifecycleKind;
  id: string;
  deletable: boolean;
  blockers: Blocker[];
}

type Db = PrismaService | Prisma.TransactionClient;

interface Spec {
  table: string;
  delegate: string;
  /** Nama teknis objek di jejak audit; sama dengan yang dipakai modul lain (mis. `Branch`, `Voucher`). */
  objectType: string;
  label: string;
  capability: string;
  /** Tanpa cabang → wajib pemegang izin lintas cabang (selain yang katalog bersama). */
  globalOnly?: boolean;
  branchOf?: (db: Db, row: any) => Promise<string | null>;
  extra?: (db: Db, row: any) => Promise<Blocker[]>;
  /** Baris warisan yang ikut dibersihkan saat entitas dihapus (bukan penghalang); mengembalikan jumlah yang dihapus. */
  cleanup?: (db: Db, row: any) => Promise<number>;
  snapshot: (row: any) => Record<string, unknown>;
}

/** Nama yang ramah untuk tabel yang bisa menjadi penghalang. Tabel yang belum terdaftar tampil apa adanya. */
const TABLE_LABELS: Record<string, string> = {
  cabang: 'cabang',
  studio: 'studio',
  ruangan: 'ruangan',
  jenis_kelas: 'tipe kelas',
  paket: 'paket',
  paket_pelanggan: 'paket milik pelanggan',
  pembelian: 'pembelian',
  slot_kelas: 'jadwal kelas',
  pemesanan_kelas: 'booking',
  penugasan_instruktur: 'penugasan instruktur',
  owner_cabang: 'penugasan owner',
  rekening_pembayaran: 'rekening pembayaran',
  min_quota_setting: 'pengaturan kuota',
  instructor_fee: 'tarif honor',
  other_cost: 'biaya operasional',
  monthly_close: 'tutup buku',
  correction_journal: 'koreksi keuangan',
  instructor_availability: 'ketersediaan instruktur',
  support_case: 'kasus bantuan',
  support_case_note: 'catatan kasus bantuan',
  session_ledger: 'catatan saldo sesi',
  session_adjust_request: 'penyesuaian sesi',
  kehadiran_pelanggan: 'catatan kehadiran',
  kehadiran_instruktur: 'catatan kehadiran instruktur',
  instructor_check_in_token: 'token check-in instruktur',
  ubah_jadwal: 'permintaan reschedule',
  bukti_pembayaran: 'bukti pembayaran',
  mutasi_bank: 'mutasi bank',
  package_promotion: 'promosi paket',
  user: 'pengguna',
};

const labelOf = (table: string) => TABLE_LABELS[table] ?? table.replace(/_/gu, ' ');
const SAFE_IDENT = /^[A-Za-z0-9_]+$/u;

/**
 * Tabel warisan yang tidak lagi dikelola dari UI sehingga barisnya tidak boleh menghalangi hapus.
 * `projection_rate`: fitur proyeksi biaya dihapus; barisnya dibersihkan lewat `cleanup` entitas induk.
 */
const LEGACY_TABLES: ReadonlySet<string> = new Set(['projection_rate']);

interface Edge {
  table: string;
  column: string;
  deleteRule: string;
  /** Tabel yang dirujuk. */
  parent: string;
}

const maskEmail = (email?: string | null) => {
  if (!email) return null;
  const [local, domain] = email.split('@');
  return local && domain ? `${local.slice(0, 2)}***@${domain}` : '***';
};

const draftOnly = (noun: string) => async (_db: Db, row: { status: string }): Promise<Blocker[]> =>
  row.status === 'DRAFT'
    ? []
    : [{ kind: 'status', label: `${noun} yang sudah pernah terbit atau diarsipkan`, count: 1 }];

const SPECS: Record<LifecycleKind, Spec> = {
  branch: {
    objectType: 'Branch',
    table: 'cabang',
    delegate: 'cabang',
    label: 'Cabang',
    capability: 'master:manage',
    branchOf: async (_db, row) => row.id,
    cleanup: async (db, row) =>
      (await (db as any).projectionRate.deleteMany({ where: { branchId: row.id } })).count,
    extra: async (db, row) => {
      const count = await (db as any).user.count({ where: { preferredBranchId: row.id } });
      return count ? [{ kind: 'user_preferred_branch', label: 'member/user yang memilih cabang ini', count }] : [];
    },
    snapshot: (row) => ({ code: row.code, name: row.name, timezone: row.timezone }),
  },
  studio: {
    objectType: 'Studio',
    table: 'studio',
    delegate: 'studio',
    label: 'Studio',
    capability: 'master:manage',
    branchOf: async (_db, row) => row.branchId,
    snapshot: (row) => ({ code: row.code, name: row.name, branchId: row.branchId }),
  },
  room: {
    objectType: 'Room',
    table: 'ruangan',
    delegate: 'ruangan',
    label: 'Ruangan',
    capability: 'master:manage',
    branchOf: async (db, row) =>
      (await (db as any).studio.findUnique({ where: { id: row.studioId }, select: { branchId: true } }))?.branchId ?? null,
    snapshot: (row) => ({ name: row.name, studioId: row.studioId }),
  },
  'class-type': {
    objectType: 'ClassType',
    table: 'jenis_kelas',
    delegate: 'jenisKelas',
    label: 'Tipe kelas',
    capability: 'master:manage',
    cleanup: async (db, row) =>
      (await (db as any).projectionRate.deleteMany({ where: { classTypeId: row.id } })).count,
    snapshot: (row) => ({ code: row.code, name: row.name }),
  },
  package: {
    objectType: 'Package',
    table: 'paket',
    delegate: 'paket',
    label: 'Paket',
    capability: 'master:manage',
    branchOf: async (_db, row) => row.branchId ?? null,
    snapshot: (row) => ({ name: row.name, branchId: row.branchId ?? null, status: row.status }),
  },
  promotion: {
    objectType: 'PackagePromotion',
    table: 'package_promotion',
    delegate: 'packagePromotion',
    label: 'Promosi paket',
    capability: 'package-promotion:manage',
    branchOf: async (db, row) =>
      (await (db as any).paket.findUnique({ where: { id: row.packageId }, select: { branchId: true } }))?.branchId ?? null,
    // `pembelian.promotionId` hanya snapshot tanpa FK; tetap menjadi riwayat transaksi.
    extra: async (db, row) => {
      const count = await (db as any).pembelian.count({ where: { promotionId: row.id } });
      return count ? [{ kind: 'pembelian', label: 'pembelian yang memakai promosi ini', count }] : [];
    },
    snapshot: (row) => ({ name: row.name, packageId: row.packageId, status: row.status }),
  },
  voucher: {
    objectType: 'Voucher',
    table: 'voucher',
    delegate: 'voucher',
    label: 'Voucher',
    capability: 'voucher:manage',
    // Pembelian.voucherId bersifat SetNull: menghapus voucher bekas pakai menghapus jejaknya dari pembelian.
    extra: async (_db, row) =>
      row.usedCount > 0 ? [{ kind: 'voucher_used', label: 'pemakaian voucher', count: row.usedCount }] : [],
    snapshot: (row) => ({ code: row.code, name: row.name, usedCount: row.usedCount }),
  },
  'payment-account': {
    objectType: 'PaymentAccount',
    table: 'rekening_pembayaran',
    delegate: 'rekeningPembayaran',
    label: 'Rekening pembayaran',
    capability: 'payment-account:manage',
    globalOnly: true,
    branchOf: async (_db, row) => row.branchId ?? null,
    // Pembelian tidak menyimpan rujukan rekening, jadi rekening selalu "bersih" secara data.
    snapshot: (row) => ({ bankName: row.bankName, holder: row.accountHolder, branchId: row.branchId ?? null }),
  },
  'min-quota': {
    objectType: 'MinQuotaSetting',
    table: 'min_quota_setting',
    delegate: 'minQuotaSetting',
    label: 'Pengaturan kuota minimum',
    capability: 'master:manage',
    branchOf: async (_db, row) => row.branchId,
    snapshot: (row) => ({
      branchId: row.branchId,
      classTypeId: row.classTypeId,
      minQuota: row.minQuota,
      cutoffHours: row.cutoffHours,
    }),
  },
  'public-content': {
    objectType: 'PublicContent',
    table: 'public_content',
    delegate: 'publicContent',
    label: 'Konten publik',
    capability: 'public-content:manage',
    globalOnly: true,
    extra: draftOnly('konten'),
    snapshot: (row) => ({ contentKey: row.contentKey, kind: row.kind, version: row.version, status: row.status }),
  },
  'notification-template': {
    objectType: 'NotificationTemplate',
    table: 'notification_template',
    delegate: 'notificationTemplate',
    label: 'Template notifikasi',
    capability: 'notification:manage',
    globalOnly: true,
    extra: draftOnly('template'),
    snapshot: (row) => ({ templateKey: row.templateKey, channel: row.channel, version: row.version, status: row.status }),
  },
  'support-case': {
    objectType: 'SupportCase',
    table: 'support_case',
    delegate: 'supportCase',
    label: 'Kasus bantuan',
    capability: 'support:manage',
    // Kasus tanpa cabang hanya boleh dikelola staf lintas cabang (sama seperti SupportCasesService).
    globalOnly: true,
    branchOf: async (_db, row) => row.branchId ?? null,
    // Catatan ikut terhapus (CASCADE) sehingga tidak terlihat oleh pemindaian FK; padahal itu riwayat penanganan.
    extra: async (db, row) => {
      const blockers: Blocker[] = [];
      if (row.status !== 'OPEN')
        blockers.push({ kind: 'status', label: 'kasus yang sudah ditangani atau ditutup', count: 1 });
      const notes = await (db as any).supportCaseNote.count({ where: { caseId: row.id } });
      if (notes > 0) blockers.push({ kind: 'support_case_note', label: 'catatan penanganan', count: notes });
      return blockers;
    },
    // Subjek dan isi catatan tidak disalin ke audit.
    snapshot: (row) => ({ customerId: row.customerId, status: row.status, priority: row.priority }),
  },
  'class-slot': {
    objectType: 'ClassSlot',
    table: 'slot_kelas',
    delegate: 'slotKelas',
    label: 'Jadwal kelas',
    capability: 'class-slot:manage',
    branchOf: async (_db, row) => row.branchId,
    // Booking, kehadiran, dan reschedule yang merujuk kelas ditangkap pemindaian FK; di sini hanya
    // status: kelas yang sudah terbit/berjalan/selesai adalah riwayat dan harus dibatalkan, bukan dihapus.
    extra: async (_db, row) =>
      ['DRAFT', 'CANCELLED'].includes(row.status)
        ? []
        : [{ kind: 'status', label: 'kelas yang sudah terbit, berjalan, atau selesai', count: 1 }],
    snapshot: (row) => ({
      branchId: row.branchId,
      classTypeId: row.classTypeId,
      instructorId: row.instructorId ?? null,
      startAt: row.startAt,
      endAt: row.endAt,
      status: row.status,
    }),
  },
  user: {
    objectType: 'User',
    table: 'user',
    delegate: 'user',
    label: 'Akun pengguna',
    capability: 'user:admin',
    globalOnly: true,
    extra: async (_db, row) =>
      ['SUPER_OWNER', 'SUPERADMIN'].includes(row.role)
        ? [{ kind: 'protected_account', label: 'akun Super Owner (dilindungi)', count: 1 }]
        : [],
    snapshot: (row) => ({
      displayName: row.displayName,
      role: row.role,
      status: row.status,
      email: maskEmail(row.email),
    }),
  },
};

/** Jenis yang bisa dihapus lewat modul ini. Tarif honor/proyeksi punya aturan tanggal sendiri (`konfigurasi-efektif`). */
export const GENERIC_REMOVABLE: readonly LifecycleKind[] = [
  'branch',
  'studio',
  'room',
  'class-type',
  'package',
  'voucher',
  'promotion',
  'payment-account',
  'min-quota',
  'public-content',
  'notification-template',
  'support-case',
  'class-slot',
  'user',
];

/** Kode galat yang dibaca klien web untuk rute hapus lama. */
const LEGACY_CODES: Partial<Record<LifecycleKind, string>> = {
  branch: 'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
  studio: 'CANNOT_DELETE_STUDIO_WITH_DEPENDENCIES',
  room: 'CANNOT_DELETE_ROOM_WITH_DEPENDENCIES',
  'class-type': 'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES',
  package: 'CANNOT_DELETE_PACKAGE_WITH_DEPENDENCIES',
};

/** Petunjuk jalan keluar yang benar untuk tiap jenis; jenis tanpa jalan keluar tidak diberi petunjuk. */
const NONACTIVATE_HINT: Partial<Record<LifecycleKind, string>> = {
  branch: 'Gunakan Nonaktifkan, atau Arsipkan bila cabang tidak dipakai lagi.',
  'class-type': 'Gunakan Nonaktifkan, atau Arsipkan bila tipe kelas tidak dipakai lagi.',
  package: 'Gunakan Nonaktifkan, atau Arsipkan bila paket tidak dijual lagi.',
  promotion: 'Gunakan Jeda, atau Arsipkan bila promo sudah selesai.',
  voucher: 'Gunakan Jeda, atau Arsipkan bila voucher tidak dipakai lagi.',
  studio: 'Gunakan Nonaktifkan.',
  room: 'Gunakan Nonaktifkan.',
  'payment-account': 'Gunakan Nonaktifkan.',
  'support-case': 'Tutup kasus ini bila sudah selesai.',
  'class-slot': 'Batalkan kelas bila sudah terbit.',
  user: 'Gunakan Nonaktifkan.',
};

export const isLifecycleKind = (value: string): value is LifecycleKind => value in SPECS;

const reasonOf = (reason: unknown) => {
  const text = typeof reason === 'string' ? reason.trim() : '';
  if (text.length < 3 || text.length > 500)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
      { field: 'reason', issue: text.length === 0 ? 'REQUIRED' : text.length < 3 ? 'TOO_SHORT' : 'TOO_LONG' },
    ]);
  return text;
};

@Injectable()
export class LifecycleService {
  private edges?: Promise<Edge[]>;

  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly audit: AuditService,
  ) {}

  /** Semua FK di database; skema tidak berubah selama proses hidup, jadi cukup dibaca sekali. */
  private foreignKeys(): Promise<Edge[]> {
    this.edges ??= this.db
      .$queryRawUnsafe<Array<{ t: string; c: string; rt: string; d: string }>>(
        `SELECT k.TABLE_NAME AS t, k.COLUMN_NAME AS c, k.REFERENCED_TABLE_NAME AS rt, r.DELETE_RULE AS d
           FROM information_schema.KEY_COLUMN_USAGE k
           JOIN information_schema.REFERENTIAL_CONSTRAINTS r
             ON r.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
          WHERE k.TABLE_SCHEMA = DATABASE() AND k.REFERENCED_TABLE_NAME IS NOT NULL`,
      )
      .then((rows) =>
        rows
          .filter((row) => SAFE_IDENT.test(row.t) && SAFE_IDENT.test(row.c) && SAFE_IDENT.test(row.rt))
          .map((row): Edge => ({ table: row.t, column: row.c, deleteRule: row.d, parent: row.rt })),
      )
      .catch((error: unknown) => {
        // Jangan menyimpan kegagalan: pemeriksaan berikutnya harus mencoba membaca lagi.
        this.edges = undefined;
        throw error;
      });
    return this.edges;
  }

  private async authorize(principal: SessionPrincipal, kind: LifecycleKind, branchId: string | null) {
    const spec = SPECS[kind];
    this.policy.requireCapability(principal.capabilities, spec.capability);
    if (branchId) {
      if (
        !this.policy.hasCapability(principal, 'branch:all', branchId) &&
        !this.policy.hasCapability(principal, spec.capability, branchId)
      )
        throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    } else if (spec.globalOnly && !this.policy.hasGlobalCapability(principal, spec.capability)) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (kind === 'user' && !principal.roles.some(({ role }) => ['SUPER_OWNER', 'SUPERADMIN'].includes(role as string)))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private async load(db: Db, kind: LifecycleKind, id: string) {
    if (!ENTITY_ID_REGEX.test(id)) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const row = await (db as any)[SPECS[kind].delegate].findUnique({ where: { id } });
    if (!row) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return row;
  }

  /** Penghalang hapus: baris yang masih merujuk entitas lewat FK (selain yang ikut terhapus) + aturan khusus. */
  async blockers(db: Db, kind: LifecycleKind, row: { id: string }): Promise<Blocker[]> {
    const spec = SPECS[kind];
    const edges = (await this.foreignKeys()).filter(
      (edge) =>
        edge.parent === spec.table && edge.deleteRule !== 'CASCADE' && !LEGACY_TABLES.has(edge.table),
    );
    const found: Blocker[] = [];
    for (const edge of edges) {
      const [{ c }] = await (db as any).$queryRawUnsafe(
        `SELECT COUNT(*) AS c FROM \`${edge.table}\` WHERE \`${edge.column}\` = ?`,
        row.id,
      );
      const count = Number(c);
      if (count > 0) {
        const existing = found.find((item) => item.kind === edge.table);
        if (existing) existing.count += count;
        else found.push({ kind: edge.table, label: labelOf(edge.table), count });
      }
    }
    if (spec.extra) found.push(...(await spec.extra(db, row)));
    return found;
  }

  async inspect(principal: SessionPrincipal, kind: LifecycleKind, id: string): Promise<Deletability> {
    const row = await this.load(this.db, kind, id);
    const branchId = (await SPECS[kind].branchOf?.(this.db, row)) ?? null;
    await this.authorize(principal, kind, branchId);
    const blockers = await this.blockers(this.db, kind, row);
    return { kind, id, deletable: blockers.length === 0, blockers };
  }

  /**
   * 409 dengan rincian. Jenis yang sudah punya rute hapus sebelumnya tetap memakai kode galat lamanya
   * dan kalimat lengkap di `details[0]`, karena klien web membaca pesan dari sana.
   */
  private blocked(kind: LifecycleKind | null, blockers: Blocker[]) {
    const list = blockers.map((item) => `${item.count} ${item.label}`).join(', ');
    const spec = kind ? SPECS[kind] : null;
    const hint = kind && NONACTIVATE_HINT[kind] ? ` ${NONACTIVATE_HINT[kind]}` : '';
    return new ApiProblem(
      (kind && LEGACY_CODES[kind]) || 'CANNOT_DELETE_WITH_DEPENDENCIES',
      HttpStatus.CONFLICT,
      false,
      [
        {
          field: 'id',
          issue: `${spec?.label ?? 'Data'} tidak dapat dihapus karena masih memiliki data terkait (${list}).${hint}`,
        },
        ...blockers.map((item) => ({ field: item.kind, issue: `${item.count} ${item.label}` })),
      ],
    );
  }

  /** Hapus permanen satu entitas yang bersih; dihitung ulang di dalam transaksi untuk menutup balapan. */
  async remove(principal: SessionPrincipal, kind: LifecycleKind, id: string, reasonInput: unknown, correlationId: string) {
    if (!GENERIC_REMOVABLE.includes(kind)) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const reason = reasonOf(reasonInput);
    const spec = SPECS[kind];
    try {
      return await this.db.$transaction(async (tx) => {
        const row = await this.load(tx, kind, id);
        const branchId = (await spec.branchOf?.(tx, row)) ?? null;
        await this.authorize(principal, kind, branchId);
        if (kind === 'user' && id === principal.userId)
          throw new ApiProblem('CANNOT_DELETE_SELF', HttpStatus.FORBIDDEN);
        const blockers = await this.blockers(tx, kind, row);
        if (blockers.length > 0) throw this.blocked(kind, blockers);

        const legacyRemoved = (await spec.cleanup?.(tx, row)) ?? 0;
        await (tx as any)[spec.delegate].delete({ where: { id } });
        await this.audit.catat(tx, {
          actorId: principal.userId,
          branchId,
          correlationId,
          action: `lifecycle.${kind.replace(/-/gu, '_')}_deleted`,
          targetUserId: kind === 'user' ? id : undefined,
          objectType: spec.objectType,
          objectId: id,
          reason,
          beforeMasked: {
            ...spec.snapshot(row),
            ...(legacyRemoved > 0 ? { legacyProjectionRatesRemoved: legacyRemoved } : {}),
          } as Prisma.InputJsonValue,
        });
        return { id, kind, deleted: true as const, success: true as const };
      });
    } catch (error) {
      // FK yang tidak terdeteksi pemindaian (mis. dibuat setelah pembacaan) tetap ditolak database.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003')
        throw this.blocked(kind, [{ kind: 'relasi', label: 'data terkait lain', count: 1 }]);
      throw error;
    }
  }

  /** Arsipkan: nonaktif permanen yang disembunyikan dari daftar kerja; riwayat dan relasi tetap utuh. */
  async archive(
    principal: SessionPrincipal,
    kind: 'branch' | 'class-type',
    id: string,
    reasonInput: unknown,
    correlationId: string,
  ) {
    // Arsip data master: alasan opsional (wajib hanya untuk hapus permanen).
    const reason = optionalReason(reasonInput);
    const spec = SPECS[kind];
    return this.db.$transaction(async (tx) => {
      const row = await this.load(tx, kind, id);
      const branchId = (await spec.branchOf?.(tx, row)) ?? null;
      await this.authorize(principal, kind, branchId);
      if (row.archivedAt) throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
      // Kelas yang masih akan berlangsung harus dibatalkan atau dipindah dulu (sama seperti studio).
      const upcoming = await (tx as any).slotKelas.count({
        where: {
          [kind === 'branch' ? 'branchId' : 'classTypeId']: id,
          status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
          endAt: { gt: new Date() },
        },
      });
      if (upcoming > 0) throw new ApiProblem('HAS_UPCOMING_SLOTS', HttpStatus.CONFLICT);
      const updated = await (tx as any)[spec.delegate].update({
        where: { id },
        data: { active: false, archivedAt: new Date() },
      });
      await this.audit.catat(tx, {
        actorId: principal.userId,
        branchId,
        correlationId,
        action: `lifecycle.${kind.replace(/-/gu, '_')}_archived`,
        objectType: spec.objectType,
        objectId: id,
        reason,
        beforeMasked: { active: row.active, archived: false },
        afterMasked: { active: false, archived: true },
      });
      return updated;
    });
  }
}

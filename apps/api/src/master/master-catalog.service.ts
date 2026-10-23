import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type Cabang, type JenisKelas } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { MasterAccessService } from './master-access.service';
import type { PublicProfileInput } from './public-profile-admin.service';
import { branchPublicLocation } from './branch-location';

function isUnique(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002';
}

const BRANCH_METADATA: Record<string, { city: string; area: string; email?: string; mapUrl?: string }> = {
  'DD-GG': {
    city: 'Jakarta Barat',
    area: 'Kedoya Utara, Kebon Jeruk',
    email: 'dailydosepilates@gmail.com',
    mapUrl: 'https://goo.gl/maps/hQGG9dUKHd8L73AR8',
  },
  'DD-MK': {
    city: 'Jakarta Utara',
    area: 'Pluit, Penjaringan',
    email: 'dailydosepilatesmk@gmail.com',
    mapUrl: 'https://maps.app.goo.gl/QeAXRpoDcH8bXbDVA',
  },
  'DD-SBY': {
    city: 'Surabaya',
    area: 'Dukuhpakis, Surabaya Barat',
    email: 'ddosesby@lrmcorporation.com',
    mapUrl: 'https://maps.app.goo.gl/XVUaQ1zEPpMyW3aJ8',
  },
  'DD-UNTAR': {
    city: 'Jakarta Barat',
    area: 'Tanjung Duren, Grogol Petamburan',
    email: 'ddpuntar@lrmcorporation.com',
    mapUrl: 'https://maps.app.goo.gl/yLp3CuQP7TTWvHxx9',
  },
  'DD-PIK2': {
    city: 'Tangerang',
    area: 'PIK 2, Kosambi',
    email: 'ogddose@lrmcorporation.com',
    mapUrl: 'https://maps.app.goo.gl/5s86jgTXbiWnsW6a9',
  },
};

@Injectable()
export class MasterCatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: MasterAccessService,
    private readonly idempotency?: IdempotencyService,
  ) {}

  /**
   * Helper ringkas untuk mutasi dengan dukungan idempotensi transaksional.
   */
  private async executeMutation<T>(
    scope: string,
    key: string | undefined,
    payload: unknown,
    action: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    if (!key || !this.idempotency) {
      return this.db.$transaction(action);
    }
    const result = await this.idempotency.execute(
      { scope, key, payload, ttlMs: 86_400_000, leaseMs: 30_000 },
      async (tx) => {
        const body = await action(tx);
        return { status: 200, body: body as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as T;
  }

  // ============================================================================
  // CABANG (BRANCHES)
  // ============================================================================

  async listBranches(
    principal: SessionPrincipal,
    query: { q?: string; status?: string; cursor?: string; limit?: string } = {},
  ) {
    this.access.authorize(principal);
    const scope = this.access.branchScope(principal);
    if (query.status && !['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(query.status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const branchScope = scope.all
      ? scope.excluded.length
        ? { id: { notIn: scope.excluded } }
        : {}
      : { id: { in: scope.included } };

    // Cabang yang diarsipkan tidak tampil di daftar kerja; hanya lewat filter status ARCHIVED.
    const where: Prisma.CabangWhereInput = {
      ...branchScope,
      archivedAt: query.status === 'ARCHIVED' ? { not: null } : null,
      active: query.status === 'ACTIVE' ? true : query.status === 'INACTIVE' ? false : undefined,
      OR: query.q?.trim()
        ? [
            { code: { contains: query.q.trim() } },
            { name: { contains: query.q.trim() } },
          ]
        : undefined,
    };

    const [rows, active, inactive, archived] = await Promise.all([
      this.db.cabang.findMany({
        where,
        orderBy: [{ code: 'asc' }, { id: 'asc' }],
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : undefined,
        take: limit + 1,
      }),
      this.db.cabang.count({ where: { ...where, active: true } }),
      this.db.cabang.count({ where: { ...where, active: false } }),
      this.db.cabang.count({ where: { ...branchScope, archivedAt: { not: null } } }),
    ]);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((b) => {
      return {
        ...b,
        publicProfile: {
          slug: b.code.toLowerCase(),
          ...branchPublicLocation(b.code, b.name, b.address),
          address: b.address ?? null,
        },
      };
    });
    return {
      items,
      summary: { total: active + inactive, active, inactive, archived },
      page: { nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  async branchDetail(principal: SessionPrincipal, idOrCode: string) {
    this.access.authorize(principal);
    const branch = await this.db.cabang.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode.toUpperCase() }, { code: idOrCode }],
      },
    });
    if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const id = branch.id;
    this.access.ensureBranchScope(principal, id);

    const now = new Date();
    const [assignments, futureClasses, packages, paymentAccounts, classTypes, staff] =
      await Promise.all([
        this.db.penugasanInstruktur.count({ where: { branchId: id, active: true } }),
        this.db.slotKelas.count({
          where: {
            branchId: id,
            endAt: { gt: now },
            status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
          },
        }),
        this.db.paket.count({ where: { status: 'ACTIVE' } }),
        this.db.rekeningPembayaran.count({ where: { branchId: id, active: true } }),
        this.db.jenisKelas.count({ where: { active: true } }),
        this.db.user.count({ where: { preferredBranchId: id, status: 'ACTIVE' } }),
      ]);

    const meta = BRANCH_METADATA[branch.code];
    const publicProfile = {
      slug: branch.code.toLowerCase(),
      ...branchPublicLocation(branch.code, branch.name, branch.address),
      address: branch.address ?? '',
      description: `${branch.name} Studio Pilates`,
      arrivalInformation: 'Silakan datang 10-15 menit sebelum sesi kelas dimulai.',
      parkingInformation: 'Tersedia tempat parkir kendaraan.',
      openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      amenities: ['Locker', 'Shower', 'Water Refill', 'Towel'],
      heroImageKey: branch.heroImageKey ?? null,
      galleryImageKeys: (branch.galleryImageKeys as string[]) ?? [],
      operationalEmail: meta?.email ?? 'dailydosepilates@gmail.com',
      mapUrl: meta?.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(branch.name + ' ' + (branch.address ?? ''))}`,
      version: 1,
    };

    return {
      ...branch,
      publicProfile,
      version: 1,
      dependencies: { assignments, futureClasses, packages, paymentAccounts, classTypes, staff },
      auditActivity: [],
    };
  }

  async createBranch(
    principal: SessionPrincipal,
    input: {
      code: string;
      name: string;
      timezone: string;
      supportWhatsappE164?: string | null;
      reason?: string;
    },
    correlationId: string,
    key?: string,
  ): Promise<Cabang> {
    this.access.authorize(principal, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    if (input.supportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(input.supportWhatsappE164.trim()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      return await this.executeMutation(
        `branch-create:${code}`,
        key,
        input,
        async (tx) => {
          const branch = await tx.cabang.create({
            data: {
              id: newId(),
              code,
              name,
              timezone: input.timezone,
              supportWhatsappE164: input.supportWhatsappE164?.trim() || null,
              active: true,
            },
          });

          await this.access.audit(
            tx,
            principal,
            correlationId,
            'master.branch_created',
            'Branch',
            branch.id,
            branch.id,
            undefined,
            { code: branch.code, name: branch.name, timezone: branch.timezone },
          );
          return branch;
        },
      );
    } catch (error) {
      if (isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async updateBranch(
    principal: SessionPrincipal,
    id: string,
    input: {
      name?: string;
      timezone?: string;
      supportWhatsappE164?: string | null;
      geofenceRadiusMeters?: number;
      expectedVersion?: number;
      reason?: string;
    },
    key: string | undefined,
    correlationId: string,
  ): Promise<Cabang> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);

    if (input.geofenceRadiusMeters !== undefined) {
      if (typeof input.geofenceRadiusMeters !== 'number' || input.geofenceRadiusMeters < 10) {
        throw new ApiProblem(
          'VALIDATION_ERROR',
          HttpStatus.BAD_REQUEST,
          false,
          [{ field: 'geofenceRadiusMeters', issue: 'Radius geofence harus bernilai positif minimal 10 meter' }],
        );
      }
    }

    const name = input.name !== undefined ? input.name.trim() : undefined;
    if (name !== undefined && name.length < 2)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    if (input.timezone !== undefined) {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
      } catch {
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      }
    }
    if (input.supportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(input.supportWhatsappE164.trim()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.executeMutation(
      `branch-update:${id}`,
      key,
      input,
      async (tx) => {
        const current = await tx.cabang.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        const updated = await tx.cabang.update({
          where: { id },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
            ...(input.supportWhatsappE164 !== undefined ? { supportWhatsappE164: input.supportWhatsappE164?.trim() || null } : {}),
            ...(input.geofenceRadiusMeters !== undefined ? { geofenceRadiusMeters: input.geofenceRadiusMeters } : {}),
          },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.branch_updated',
          'Branch',
          id,
          id,
          { name: current.name, timezone: current.timezone },
          { name: updated.name, timezone: updated.timezone },
        );
        return updated;
      },
    );
  }

  async transitionBranch(
    principal: SessionPrincipal,
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    input: { expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<Cabang> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);

    return this.executeMutation(
      `branch-transition:${id}`,
      key,
      { status, ...input },
      async (tx) => {
        const current = await tx.cabang.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        // Mengaktifkan kembali juga membuka arsip.
        const updated = await tx.cabang.update({
          where: { id },
          data: status === 'ACTIVE' ? { active: true, archivedAt: null } : { active: false },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          status === 'ACTIVE' ? 'master.branch_activated' : 'master.branch_deactivated',
          'Branch',
          id,
          id,
          { active: current.active, archived: Boolean(current.archivedAt) },
          { active: updated.active, archived: Boolean(updated.archivedAt) },
          input.reason,
        );
        return updated;
      },
    );
  }

  async deactivateBranch(
    principal: SessionPrincipal,
    id: string,
    expectedVersion?: number,
    correlationId: string = 'unknown',
    reason?: string,
  ) {
    return this.transitionBranch(
      principal,
      id,
      'INACTIVE',
      { expectedVersion: expectedVersion ?? 1, reason },
      undefined,
      correlationId,
    );
  }

  async deleteBranch(
    principal: SessionPrincipal,
    id: string,
    correlationId: string = 'unknown',
  ): Promise<{ success: boolean; id: string; name: string }> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);

    const branch = await this.db.cabang.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            studios: true,
            classSlots: true,
            instructorAssignments: true,
            purchases: true,
            paymentAccounts: true,
            supportCases: true,
            ownerAssignments: true,
            minQuotaSettings: true,
            instructorFees: true,
            projectionRates: true,
            otherCosts: true,
            monthlyCloses: true,
            correctionJournals: true,
            instructorAvailabilities: true,
            packages: true,
            bookings: true,
          },
        },
      },
    });

    if (!branch) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const preferredUsersCount = await this.db.user.count({
      where: { preferredBranchId: id },
    });

    const counts = branch._count;
    const totalRelations =
      counts.studios +
      counts.classSlots +
      counts.instructorAssignments +
      counts.purchases +
      counts.paymentAccounts +
      counts.supportCases +
      counts.ownerAssignments +
      counts.minQuotaSettings +
      counts.instructorFees +
      counts.projectionRates +
      counts.otherCosts +
      counts.monthlyCloses +
      counts.correctionJournals +
      counts.instructorAvailabilities +
      counts.packages +
      counts.bookings +
      preferredUsersCount;

    if (totalRelations > 0) {
      const activeRelations: string[] = [];
      if (counts.studios > 0) activeRelations.push(`${counts.studios} studio`);
      if (counts.classSlots > 0) activeRelations.push(`${counts.classSlots} slot kelas`);
      if (counts.bookings > 0) activeRelations.push(`${counts.bookings} booking`);
      if (counts.purchases > 0) activeRelations.push(`${counts.purchases} transaksi`);
      if (counts.packages > 0) activeRelations.push(`${counts.packages} paket`);
      if (counts.paymentAccounts > 0) activeRelations.push(`${counts.paymentAccounts} rekening pembayaran`);
      if (counts.ownerAssignments > 0) activeRelations.push(`${counts.ownerAssignments} penugasan owner`);
      if (counts.instructorAssignments > 0) activeRelations.push(`${counts.instructorAssignments} penugasan instruktur`);
      if (preferredUsersCount > 0) activeRelations.push(`${preferredUsersCount} member/user`);

      throw new ApiProblem(
        'CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES',
        HttpStatus.CONFLICT,
        false,
        [
          {
            field: 'id',
            issue: `Cabang tidak dapat dihapus karena masih memiliki data terkait (${activeRelations.join(', ')}). Gunakan fitur Nonaktifkan untuk mengarsipkan cabang ini.`,
          },
        ],
      );
    }

    await this.db.$transaction(async (tx) => {
      await tx.cabang.delete({ where: { id } });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.branch_deleted',
        'Branch',
        id,
        id,
        { code: branch.code, name: branch.name },
        undefined,
      );
    });

    return { success: true, id: branch.id, name: branch.name };
  }

  // ============================================================================
  // STUDIO & RUANGAN (STUDIOS & ROOMS)
  // ============================================================================

  /** Kelas terjadwal (belum selesai/dibatalkan) yang masih memakai studio/ruangan; menghalangi penonaktifan. */
  private async upcomingSlotCount(
    tx: Prisma.TransactionClient,
    where: { studioId?: string; roomId?: string },
  ) {
    return tx.slotKelas.count({
      where: {
        ...where,
        status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
        endAt: { gt: new Date() },
      },
    });
  }

  async listStudios(principal: SessionPrincipal, branchIdOrCode: string, includeInactive = false) {
    this.access.authorizeCatalogRead(principal);
    const branch = await this.db.cabang.findFirst({
      where: { OR: [{ id: branchIdOrCode }, { code: branchIdOrCode.toUpperCase() }, { code: branchIdOrCode }] },
    });
    const branchId = branch?.id ?? branchIdOrCode;
    this.access.ensureCatalogBranchScope(principal, branchId);
    const items = await this.db.studio.findMany({
      where: { branchId, ...(includeInactive ? {} : { active: true }) },
      include: {
        rooms: { where: includeInactive ? {} : { active: true }, orderBy: { code: 'asc' } },
      },
      orderBy: [{ code: 'asc' }, { id: 'asc' }],
    });
    return { items, page: { hasMore: false, nextCursor: null } };
  }

  async createStudio(
    principal: SessionPrincipal,
    branchId: string,
    input: {
      code: string;
      name: string;
      equipmentText?: string | null;
      contactPhoneE164?: string | null;
      imageKey?: string | null;
    },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, branchId, true);
    const code = input.code?.trim().toUpperCase();
    const name = input.name?.trim();
    if (!/^[A-Z0-9_-]{2,64}$/u.test(code) || name.length < 2)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.db.$transaction(async (tx) => {
      const branch = await tx.cabang.findUnique({ where: { id: branchId } });
      if (!branch?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const studio = await tx.studio.create({
        data: {
          id: newId(),
          branchId,
          code,
          name,
          description: input.equipmentText?.trim() || null,
          imageKey: input.imageKey?.trim() || null,
          active: true,
        },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.studio_created',
        'Studio',
        studio.id,
        branchId,
      );
      return studio;
    });
  }

  async updateStudio(
    principal: SessionPrincipal,
    id: string,
    input: {
      name: string;
      equipmentText?: string | null;
      contactPhoneE164?: string | null;
      imageKey?: string | null;
      active?: boolean;
    },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.studio.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, current.branchId, true);

      if (input.name !== undefined && input.name.trim().length < 2)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      if (input.active === false && current.active) {
        const upcoming = await this.upcomingSlotCount(tx, { studioId: id });
        if (upcoming > 0) throw new ApiProblem('HAS_UPCOMING_SLOTS', HttpStatus.CONFLICT);
      }

      const dataToUpdate: Record<string, unknown> = {
        name: input.name?.trim(),
        active: input.active,
      };
      if (input.equipmentText !== undefined) {
        dataToUpdate.description = input.equipmentText?.trim() || null;
      }
      if (input.imageKey !== undefined) {
        dataToUpdate.imageKey = input.imageKey?.trim() || null;
      }

      const updated = await tx.studio.update({
        where: { id },
        data: dataToUpdate,
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.studio_updated',
        'Studio',
        id,
        current.branchId,
      );
      return updated;
    });
  }

  async deleteStudio(
    principal: SessionPrincipal,
    id: string,
    correlationId: string = 'unknown',
  ): Promise<{ success: boolean; id: string; name: string }> {
    this.access.authorize(principal, true);

    const studio = await this.db.studio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
            classSlots: true,
          },
        },
      },
    });

    if (!studio) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    this.access.ensureBranchScope(principal, studio.branchId, true);

    const counts = studio._count;
    const totalRelations = counts.rooms + counts.classSlots;
    if (totalRelations > 0) {
      const activeRelations: string[] = [];
      if (counts.rooms > 0) activeRelations.push(`${counts.rooms} ruangan`);
      if (counts.classSlots > 0) activeRelations.push(`${counts.classSlots} slot kelas`);

      throw new ApiProblem(
        'CANNOT_DELETE_STUDIO_WITH_DEPENDENCIES',
        HttpStatus.CONFLICT,
        false,
        [
          {
            field: 'id',
            issue: `Studio tidak dapat dihapus karena masih memiliki data terkait (${activeRelations.join(', ')}). Gunakan fitur Nonaktifkan untuk mengarsipkan studio ini.`,
          },
        ],
      );
    }

    await this.db.$transaction(async (tx) => {
      await tx.studio.delete({ where: { id } });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.studio_deleted',
        'Studio',
        id,
        studio.branchId,
        { code: studio.code, name: studio.name },
        undefined,
      );
    });

    return { success: true, id: studio.id, name: studio.name };
  }

  async listRooms(principal: SessionPrincipal, studioId: string, includeInactive = false) {
    this.access.authorize(principal);
    const studio = await this.db.studio.findUnique({ where: { id: studioId } });
    if (!studio) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.ensureBranchScope(principal, studio.branchId);
    const items = await this.db.ruangan.findMany({
      where: { studioId, ...(includeInactive ? {} : { active: true }) },
      orderBy: { code: 'asc' },
    });
    return { items };
  }

  async createRoom(
    principal: SessionPrincipal,
    studioId: string,
    input: { code: string; name: string; capacity?: number | null },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const studio = await this.db.studio.findUnique({ where: { id: studioId } });
    if (!studio) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.ensureBranchScope(principal, studio.branchId, true);

    const code = input.code?.trim().toUpperCase();
    const name = input.name?.trim();
    if (!/^[A-Z0-9_-]{1,64}$/u.test(code) || name.length < 1)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.db.$transaction(async (tx) => {
      const room = await tx.ruangan.create({
        data: {
          id: newId(),
          studioId,
          code,
          name,
          capacityBed: input.capacity ?? 1,
          active: true,
        },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.room_created',
        'Room',
        room.id,
        studio.branchId,
      );
      return room;
    });
  }

  async updateRoom(
    principal: SessionPrincipal,
    id: string,
    input: { name: string; capacity?: number | null; active?: boolean },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.ruangan.findUnique({
        where: { id },
        include: { studio: true },
      });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, current.studio.branchId, true);
      if (input.name !== undefined && input.name.trim().length < 1)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      if (input.capacity !== undefined && input.capacity !== null && (!Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 100))
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      if (input.active === false && current.active) {
        const upcoming = await this.upcomingSlotCount(tx, { roomId: id });
        if (upcoming > 0) throw new ApiProblem('HAS_UPCOMING_SLOTS', HttpStatus.CONFLICT);
      }

      const updated = await tx.ruangan.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          capacityBed: input.capacity ?? undefined,
          active: input.active,
        },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.room_updated',
        'Room',
        id,
        current.studio.branchId,
      );
      return updated;
    });
  }

  async deleteRoom(
    principal: SessionPrincipal,
    id: string,
    correlationId: string = 'unknown',
  ): Promise<{ success: boolean; id: string; name: string }> {
    this.access.authorize(principal, true);

    const room = await this.db.ruangan.findUnique({
      where: { id },
      include: {
        studio: true,
        _count: {
          select: {
            classSlots: true,
          },
        },
      },
    });

    if (!room) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    this.access.ensureBranchScope(principal, room.studio.branchId, true);

    const counts = room._count;
    if (counts.classSlots > 0) {
      throw new ApiProblem(
        'CANNOT_DELETE_ROOM_WITH_DEPENDENCIES',
        HttpStatus.CONFLICT,
        false,
        [
          {
            field: 'id',
            issue: `Ruangan tidak dapat dihapus karena masih memiliki data terkait (${counts.classSlots} slot kelas). Gunakan fitur Nonaktifkan untuk mengarsipkan ruangan ini.`,
          },
        ],
      );
    }

    await this.db.$transaction(async (tx) => {
      await tx.ruangan.delete({ where: { id } });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.room_deleted',
        'Room',
        id,
        room.studio.branchId,
        { code: room.code, name: room.name, studioId: room.studioId },
        undefined,
      );
    });

    return { success: true, id: room.id, name: room.name };
  }

  // ============================================================================
  // JENIS KELAS (CLASS TYPES)
  // ============================================================================

  async listClassTypes(
    principal: SessionPrincipal,
    branchId?: string,
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'ALL' = 'ACTIVE',
  ) {
    this.access.authorizeCatalogRead(principal);
    if (branchId) this.access.ensureCatalogBranchScope(principal, branchId);
    if (!['ACTIVE', 'INACTIVE', 'ARCHIVED', 'ALL'].includes(status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const branches = await this.db.cabang.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true, active: true },
    });

    // Bawaan hanya yang aktif (form jadwal/paket); status lain untuk halaman Master.
    const items = await this.db.jenisKelas.findMany({
      where:
        status === 'ACTIVE'
          ? { active: true, archivedAt: null }
          : status === 'INACTIVE'
            ? { active: false, archivedAt: null }
            : status === 'ARCHIVED'
              ? { archivedAt: { not: null } }
              : { archivedAt: null },
      orderBy: { code: 'asc' },
    });

    const mapped = items.map((item) => ({
      ...item,
      version: 1,
      branchScopes: branches.map((b) => ({
        branchId: b.id,
        active: true,
        branch: b,
      })),
    }));

    return { items: mapped, page: { nextCursor: null, hasMore: false } };
  }

  async createClassType(
    principal: SessionPrincipal,
    input: {
      code: string;
      name: string;
      description?: string | null;
      modality?: string;
      defaultDurationMinutes?: number;
      defaultMinimumQuota?: number;
      defaultCapacity?: number;
      branchIds?: string[];
    },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      return await this.db.$transaction(async (tx) => {
        const item = await tx.jenisKelas.create({
          data: {
            id: newId(),
            code,
            name,
            description: input.description?.trim() || null,
            modality: (input.modality as any) ?? 'GROUP',
            durationMinutes: input.defaultDurationMinutes ?? 50,
            defaultCapacity: input.defaultCapacity ?? 8,
            active: true,
          },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_created',
          'ClassType',
          item.id,
          null,
        );
        return item;
      });
    } catch (error) {
      if (isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateClassType(
    principal: SessionPrincipal,
    id: string,
    expectedVersion?: number,
    correlationId: string = 'unknown',
  ) {
    return this.deactivateClassTypeIdempotent(
      principal,
      id,
      { expectedVersion },
      undefined,
      correlationId,
    );
  }

  async deactivateClassTypeIdempotent(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<JenisKelas> {
    this.access.authorize(principal, true);
    return this.executeMutation(
      `class-type-deactivate:${id}`,
      key,
      input,
      async (tx) => {
        const current = await tx.jenisKelas.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        const updated = await tx.jenisKelas.update({
          where: { id },
          data: { active: false },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_deactivated',
          'ClassType',
          id,
          null,
          { active: current.active },
          { active: false },
          input.reason,
        );
        return updated;
      },
    );
  }

  async updateClassType(
    principal: SessionPrincipal,
    id: string,
    input: { name: string; expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<JenisKelas> {
    this.access.authorize(principal, true);
    const name = input.name?.trim();
    if (!name || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.executeMutation(
      `class-type-update:${id}`,
      key,
      input,
      async (tx) => {
        const current = await tx.jenisKelas.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        const updated = await tx.jenisKelas.update({
          where: { id },
          data: { name },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_updated',
          'ClassType',
          id,
          null,
        );
        return updated;
      },
    );
  }

  async reactivateClassType(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<JenisKelas> {
    this.access.authorize(principal, true);
    return this.executeMutation(
      `class-type-reactivate:${id}`,
      key,
      input,
      async (tx) => {
        const current = await tx.jenisKelas.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        // Mengaktifkan kembali juga membuka arsip.
        const updated = await tx.jenisKelas.update({
          where: { id },
          data: { active: true, archivedAt: null },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_reactivated',
          'ClassType',
          id,
          null,
          { active: current.active, archived: Boolean(current.archivedAt) },
          { active: true, archived: false },
          input.reason,
        );
        return updated;
      },
    );
  }

  async replaceClassTypeScopes(
    principal: SessionPrincipal,
    id: string,
    _input: { branchIds: string[]; expectedVersion?: number; reason?: string },
    _correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.jenisKelas.findUniqueOrThrow({
      where: { id },
    });
  }

  async deleteClassType(
    principal: SessionPrincipal,
    id: string,
    correlationId: string = 'unknown',
  ): Promise<{ success: boolean; id: string; name: string }> {
    this.access.authorize(principal, true);

    const classType = await this.db.jenisKelas.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            packages: true,
            classSlots: true,
            minQuotaSettings: true,
            instructorFees: true,
            projectionRates: true,
          },
        },
      },
    });

    if (!classType) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const counts = classType._count;
    const totalRelations =
      counts.packages +
      counts.classSlots +
      counts.minQuotaSettings +
      counts.instructorFees +
      counts.projectionRates;

    if (totalRelations > 0) {
      const activeRelations: string[] = [];
      if (counts.packages > 0) activeRelations.push(`${counts.packages} paket`);
      if (counts.classSlots > 0) activeRelations.push(`${counts.classSlots} slot kelas`);
      if (counts.minQuotaSettings > 0) activeRelations.push(`${counts.minQuotaSettings} pengaturan kuota`);
      if (counts.instructorFees > 0) activeRelations.push(`${counts.instructorFees} tarif honor`);
      if (counts.projectionRates > 0) activeRelations.push(`${counts.projectionRates} tarif proyeksi`);

      throw new ApiProblem(
        'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES',
        HttpStatus.CONFLICT,
        false,
        [
          {
            field: 'id',
            issue: `Tipe kelas tidak dapat dihapus karena masih memiliki data terkait (${activeRelations.join(', ')}). Gunakan fitur Nonaktifkan untuk mengarsipkan tipe kelas ini.`,
          },
        ],
      );
    }

    await this.db.$transaction(async (tx) => {
      await tx.jenisKelas.delete({ where: { id } });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_deleted',
        'ClassType',
        id,
        null,
        { code: classType.code, name: classType.name },
        undefined,
      );
    });

    return { success: true, id: classType.id, name: classType.name };
  }

  // ============================================================================
  // PROFIL PUBLIK (PUBLIC PROFILES)
  // ============================================================================

  async listPublicProfiles(principal: SessionPrincipal, branchId: string) {
    this.access.authorize(principal);
    this.access.ensureBranchScope(principal, branchId);
    const branch = await this.db.cabang.findUnique({
      where: { id: branchId },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        heroImageKey: true,
        galleryImageKeys: true,
      },
    });
    if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const meta = BRANCH_METADATA[branch.code];
    const publicProfile = {
      slug: branch.code.toLowerCase(),
      ...branchPublicLocation(branch.code, branch.name, branch.address),
      address: branch.address ?? '',
      description: `${branch.name} Studio Pilates`,
      arrivalInformation: 'Silakan datang 10-15 menit sebelum sesi kelas dimulai.',
      parkingInformation: 'Tersedia tempat parkir kendaraan.',
      openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      amenities: ['Locker', 'Shower', 'Water Refill', 'Towel'],
      heroImageKey: branch.heroImageKey,
      galleryImageKeys: (branch.galleryImageKeys as string[]) ?? [],
      version: 1,
    };

    // Dynamically discover all unique image keys registered in database
    const [allBranches, allStudios, allClasses] = await Promise.all([
      this.db.cabang.findMany({ select: { heroImageKey: true, galleryImageKeys: true } }),
      this.db.studio.findMany({ select: { imageKey: true } }),
      this.db.jenisKelas.findMany({ select: { heroImageKey: true, galleryImageKeys: true } }),
    ]);

    const dynamicKeys = new Set<string>();
    for (const b of allBranches) {
      if (b.heroImageKey) dynamicKeys.add(b.heroImageKey);
      if (Array.isArray(b.galleryImageKeys)) {
        for (const k of b.galleryImageKeys as string[]) {
          if (typeof k === 'string' && k.trim()) dynamicKeys.add(k.trim());
        }
      }
    }
    for (const s of allStudios) {
      if (s.imageKey) dynamicKeys.add(s.imageKey);
    }
    for (const c of allClasses) {
      if (c.heroImageKey) dynamicKeys.add(c.heroImageKey);
      if (Array.isArray(c.galleryImageKeys)) {
        for (const k of c.galleryImageKeys as string[]) {
          if (typeof k === 'string' && k.trim()) dynamicKeys.add(k.trim());
        }
      }
    }

    return {
      branch: { ...branch, publicProfile, classTypes: [] },
      classProfiles: [],
      assetKeys: Array.from(dynamicKeys).sort(),
    };
  }

  async updatePublicProfile(
    principal: SessionPrincipal,
    kind: 'branch' | 'class' | 'package',
    id: string,
    input: PublicProfileInput,
    _correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const version = Number.isInteger(input.expectedVersion) ? (input.expectedVersion as number) : 1;

    if (kind === 'branch') {
      const dataToUpdate: Record<string, unknown> = {};
      if (typeof input.heroImageKey === 'string') {
        dataToUpdate.heroImageKey = input.heroImageKey.trim() || null;
      }
      if (Array.isArray(input.galleryImageKeys)) {
        dataToUpdate.galleryImageKeys = input.galleryImageKeys;
      }
      if (typeof input.address === 'string') {
        dataToUpdate.address = input.address.trim() || null;
      }

      if (Object.keys(dataToUpdate).length > 0) {
        await this.db.cabang.update({
          where: { id },
          data: dataToUpdate,
        });
      }
    } else if (kind === 'class') {
      const dataToUpdate: Record<string, unknown> = {};
      if (typeof input.heroImageKey === 'string') {
        dataToUpdate.heroImageKey = input.heroImageKey.trim() || null;
      }
      if (Array.isArray(input.galleryImageKeys)) {
        dataToUpdate.galleryImageKeys = input.galleryImageKeys;
      }
      if (typeof input.description === 'string') {
        dataToUpdate.description = input.description.trim() || null;
      }
      if (Object.keys(dataToUpdate).length > 0) {
        await this.db.jenisKelas.update({
          where: { id },
          data: dataToUpdate,
        });
      }
    }

    return {
      kind,
      id,
      version: version + 1,
      updated: true,
    };
  }
}

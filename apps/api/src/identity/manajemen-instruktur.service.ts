import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem } from './security';

@Injectable()
export class InstructorManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private scope(principal: SessionPrincipal, branchId?: string): Prisma.UserWhereInput {
    this.policy.requireCapability(principal.capabilities, 'assignment:read');
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const branchIds = branchId ? [branchId] : principal.branchIds;
    return {
      role: 'COACH',
      ...(principal.capabilities.includes('branch:all') && !branchId
        ? {}
        : {
            instructorAssignments: {
              some: { branchId: { in: branchIds }, active: true },
            },
          }),
    };
  }

  async list(
    principal: SessionPrincipal,
    filters: { q?: string; branchId?: string; cursor?: string },
  ) {
    const visibleBranchIds = filters.branchId
      ? [filters.branchId]
      : principal.capabilities.includes('branch:all')
        ? null
        : principal.branchIds;

    const where: Prisma.UserWhereInput = {
      ...this.scope(principal, filters.branchId),
      ...(filters.q?.trim()
        ? {
            OR: [
              { displayName: { contains: filters.q.trim() } },
              { email: { contains: filters.q.trim() } },
              { phone: { contains: filters.q.trim() } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.db.user.findMany({
        where: { ...where, ...(filters.cursor ? { id: { gt: filters.cursor } } : {}) },
        orderBy: { id: 'asc' },
        take: 21,
        select: {
          id: true,
          displayName: true,
          email: true,
          phone: true,
          status: true,
          instructorAssignments: {
            where: {
              active: true,
              ...(visibleBranchIds ? { branchId: { in: visibleBranchIds } } : {}),
            },
            select: {
              id: true,
              branch: { select: { id: true, code: true, name: true } },
              active: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              instructedClassSlots: true,
              instructorAttendances: true,
            },
          },
        },
      }),
      this.db.user.count({ where }),
    ]);

    const hasMore = rows.length > 20;
    const page = rows.slice(0, 20);

    return {
      items: page.map((row) => ({
        id: row.id,
        displayName: row.displayName,
        email: row.email,
        phoneE164: row.phone,
        status: row.status,
        assignments: row.instructorAssignments.map((a) => ({
          id: a.id,
          branch: a.branch,
          activeFrom: a.createdAt,
          activeUntil: null,
        })),
        _count: row._count,
        compensationRp: 0,
      })),
      summary: { total },
      page: { hasMore, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null },
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    const scoped = this.scope(principal);
    const visibleBranches = principal.capabilities.includes('branch:all')
      ? {}
      : { branchId: { in: principal.branchIds } };

    const instructor = await this.db.user.findFirst({
      where: { id, ...scoped },
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        status: true,
        instructorAssignments: {
          where: { active: true, ...visibleBranches },
          select: {
            id: true,
            branch: { select: { id: true, code: true, name: true } },
            active: true,
            createdAt: true,
          },
        },
        instructedClassSlots: {
          where: visibleBranches,
          orderBy: { startAt: 'desc' },
          take: 20,
          select: {
            id: true,
            startAt: true,
            endAt: true,
            status: true,
            classType: { select: { code: true, name: true } },
            branch: { select: { id: true, name: true } },
            instructorAttendance: { select: { checkedInAt: true, method: true } },
          },
        },
      },
    });

    if (!instructor) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const completedWithoutCheckIn = await this.db.slotKelas.count({
      where: {
        instructorId: id,
        status: 'COMPLETED',
        instructorAttendance: null,
        ...visibleBranches,
      },
    });

    return {
      id: instructor.id,
      displayName: instructor.displayName,
      email: instructor.email,
      phoneE164: instructor.phone,
      status: instructor.status,
      version: 1,
      assignments: instructor.instructorAssignments.map((a) => ({
        id: a.id,
        branch: a.branch,
        activeFrom: a.createdAt,
        activeUntil: null,
      })),
      instructedClassSlots: instructor.instructedClassSlots.map(({ instructorAttendance, ...slot }) => ({
        ...slot,
        instructorAttendances: instructorAttendance ? [instructorAttendance] : [],
        instructorHourLog: null,
      })),
      instructorAvailabilities: [],
      instructorAttendances: instructor.instructedClassSlots.flatMap((slot) =>
        slot.instructorAttendance ? [slot.instructorAttendance] : [],
      ),
      instructorHourLogs: [],
      compensationRp: 0,
      blockers: { completedWithoutCheckIn, completedWithoutFee: 0 },
    };
  }

  // --- Indonesian Domain Aliases ---
  async daftarInstruktur(
    principal: SessionPrincipal,
    filters: Parameters<InstructorManagementService['list']>[1],
  ) {
    return this.list(principal, filters);
  }

  async detailInstruktur(principal: SessionPrincipal, id: string) {
    return this.detail(principal, id);
  }
}

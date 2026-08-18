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
      roles: {
        some: {
          role: 'INSTRUCTOR',
          activeFrom: { lte: new Date() },
          OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }],
          ...(principal.capabilities.includes('branch:all') && !branchId
            ? {}
            : { branchId: { in: branchIds } }),
        },
      },
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
      historical: false,
      ...(filters.q?.trim()
        ? {
            OR: [
              { displayName: { contains: filters.q.trim() } },
              { email: { contains: filters.q.trim() } },
              { phoneE164: { contains: filters.q.trim() } },
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
          phoneE164: true,
          status: true,
          assignments: {
            where: {
              type: 'INSTRUCTOR',
              ...(visibleBranchIds ? { branchId: { in: visibleBranchIds } } : {}),
              activeFrom: { lte: new Date() },
              OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }],
            },
            select: {
              id: true,
              branch: { select: { id: true, code: true, name: true } },
              activeFrom: true,
              activeUntil: true,
            },
          },
          _count: {
            select: {
              instructedClassSlots: true,
              instructorAttendances: true,
              instructorHourLogs: true,
            },
          },
          instructorHourLogs: {
            where: visibleBranchIds ? { branchId: { in: visibleBranchIds } } : {},
            select: { amountRp: true },
          },
        },
      }),
      this.db.user.count({ where }),
    ]);
    const hasMore = rows.length > 20;
    const page = rows.slice(0, 20);
    return {
      items: page.map((row) => ({
        ...row,
        compensationRp: row.instructorHourLogs.reduce((sum, item) => sum + item.amountRp, 0),
        instructorHourLogs: undefined,
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
        phoneE164: true,
        status: true,
        version: true,
        assignments: {
          where: { type: 'INSTRUCTOR', ...visibleBranches },
          orderBy: { activeFrom: 'desc' },
          select: {
            id: true,
            activeFrom: true,
            activeUntil: true,
            branch: { select: { id: true, code: true, name: true } },
          },
        },
        instructorAvailabilities: {
          where: visibleBranches,
          orderBy: { startAt: 'desc' },
          take: 20,
          select: {
            id: true,
            startAt: true,
            endAt: true,
            timezone: true,
            branch: { select: { id: true, name: true } },
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
            instructorAttendances: { take: 1, select: { checkedInAt: true } },
            instructorHourLog: {
              select: { matchedUnits: true, feeRpSnapshot: true, amountRp: true, period: true },
            },
          },
        },
        instructorAttendances: {
          where: visibleBranches,
          orderBy: { checkedInAt: 'desc' },
          take: 20,
          select: {
            id: true,
            classSlotId: true,
            checkedInAt: true,
            branch: { select: { id: true, name: true } },
          },
        },
        instructorHourLogs: {
          where: visibleBranches,
          orderBy: { occurredAt: 'desc' },
          take: 50,
          select: {
            id: true,
            classSlotId: true,
            matchedUnits: true,
            feeRpSnapshot: true,
            amountRp: true,
            period: true,
            occurredAt: true,
            branch: { select: { id: true, name: true } },
            classType: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!instructor) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const compensationRp = instructor.instructorHourLogs.reduce(
      (sum, item) => sum + item.amountRp,
      0,
    );
    const completedWithoutCheckIn = instructor.instructedClassSlots.filter(
      (slot) => slot.status === 'COMPLETED' && !slot.instructorAttendances.length,
    ).length;
    const completedWithoutFee = instructor.instructedClassSlots.filter(
      (slot) =>
        slot.status === 'COMPLETED' && slot.instructorAttendances.length && !slot.instructorHourLog,
    ).length;
    return {
      ...instructor,
      compensationRp,
      blockers: { completedWithoutCheckIn, completedWithoutFee },
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

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

export interface InMemoryAdjustment {
  id: string;
  customerPackageId: string;
  quantity: number;
  reasonCode: string;
  status: 'PENDING' | 'POSTED' | 'REJECTED';
  version: number;
  createdAt: string;
  decidedAt?: string | null;
  ledgerBalanceAtRequest?: number | null;
  reservedAtRequest?: number | null;
  customer?: { id: string; displayName: string; phoneMasked: string | null };
  branch?: { id: string; name: string };
  package?: { id: string; name: string };
  classType?: { id: string; name: string };
  requestedBy?: { id: string; displayName: string };
  decidedBy?: { id: string; displayName: string } | null;
  currentBalance?: number;
  currentReserved?: number;
  currentAvailable?: number;
  projectedLedgerBalance?: number;
  projectedAvailable?: number;
  eligibleForApproval?: boolean;
  eligibilityReason?: string | null;
  decisionCode?: string | null;
  decisionNote?: string | null;
}

const inMemoryAdjustments: InMemoryAdjustment[] = [];

@Injectable()
export class LedgerService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async listCustomerPackages(
    principal: SessionPrincipal,
    filters: {
      branchId?: string;
      cursor?: string;
      search?: string;
      status?: string;
      customerUserId?: string;
    },
  ) {
    const where: any = {};
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters.customerUserId) {
      where.userId = filters.customerUserId;
    }
    if (filters.search) {
      where.OR = [
        { user: { displayName: { contains: filters.search } } },
        { user: { email: { contains: filters.search } } },
        { user: { phone: { contains: filters.search } } },
        { package: { name: { contains: filters.search } } },
      ];
    }
    if (filters.cursor) {
      where.id = { gt: filters.cursor };
    }

    const branch = filters.branchId
      ? await this.db.cabang.findUnique({ where: { id: filters.branchId } })
      : await this.db.cabang.findFirst();

    const items = await this.db.paketPelanggan.findMany({
      where,
      include: {
        user: { include: { profile: true } },
        package: { include: { classType: true } },
        bookings: { where: { status: 'BOOKED' } },
      },
      take: 21,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > 20;
    const pageItems = hasMore ? items.slice(0, 20) : items;

    const mapped = pageItems.map((cp) => {
      const reserved = cp.bookings.length;
      const ledgerBalance = cp.remainingSessions;
      const available = Math.max(0, ledgerBalance - reserved);

      return {
        id: cp.id,
        branchId: branch?.id ?? 'global',
        status: cp.status,
        activationDate: cp.validFrom.toISOString(),
        expiryAt: cp.validUntil.toISOString(),
        ledgerBalance,
        reserved,
        available,
        sessionCountSnapshot: cp.totalSessions,
        packageName: cp.package?.name ?? 'Paket',
        branchName: branch?.name ?? 'Cabang',
        classTypeName: cp.package?.classType?.name ?? 'Pilates',
        customer: {
          id: cp.user.id,
          displayName: cp.user.displayName,
          phoneMasked: cp.user.phone ? cp.user.phone.slice(0, 4) + '****' : null,
        },
        usage: {
          initialSessions: cp.totalSessions,
          usedSessions: cp.usedSessions,
          reversedSessions: 0,
          adjustmentDelta: 0,
        },
      };
    });

    return {
      items: mapped,
      summary: {
        packageCount: mapped.length,
        activePackageCount: mapped.filter((x) => x.status === 'ACTIVE').length,
        ledgerBalance: mapped.reduce((acc, x) => acc + x.ledgerBalance, 0),
        reserved: mapped.reduce((acc, x) => acc + x.reserved, 0),
        available: mapped.reduce((acc, x) => acc + x.available, 0),
        usedSessions: mapped.reduce((acc, x) => acc + (x.usage?.usedSessions ?? 0), 0),
        reversedSessions: 0,
        adjustmentDelta: 0,
        expiringSoon: 0,
      },
      page: {
        hasMore,
        nextCursor: hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null,
      },
    };
  }

  async getPackageLedger(principal: SessionPrincipal, id: string) {
    const cp = await this.db.paketPelanggan.findUnique({
      where: { id },
      include: {
        user: true,
        package: { include: { classType: true } },
        bookings: {
          include: {
            classSlot: { include: { classType: true, branch: true } },
          },
          orderBy: { bookedAt: 'desc' },
        },
      },
    });

    if (!cp) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const activeReservations = cp.bookings.filter((b) => b.status === 'BOOKED');
    const branch = await this.db.cabang.findFirst();

    const balance = {
      id: cp.id,
      branchId: branch?.id ?? 'global',
      status: cp.status,
      activationDate: cp.validFrom.toISOString(),
      expiryAt: cp.validUntil.toISOString(),
      ledgerBalance: cp.remainingSessions,
      reserved: activeReservations.length,
      available: Math.max(0, cp.remainingSessions - activeReservations.length),
      packageName: cp.package?.name ?? 'Paket',
      branchName: branch?.name ?? 'Cabang',
      classTypeName: cp.package?.classType?.name ?? 'Pilates',
      customer: {
        id: cp.user.id,
        displayName: cp.user.displayName,
        phoneMasked: cp.user.phone ? cp.user.phone.slice(0, 4) + '****' : null,
      },
    };

    const reservations = {
      activeQuantity: activeReservations.length,
      items: activeReservations.map((b) => ({
        id: b.id,
        quantity: 1,
        createdAt: b.bookedAt.toISOString(),
        bookingId: b.id,
        bookingStatus: b.status,
        className: b.classSlot?.classType?.name ?? 'Kelas',
        branchName: b.classSlot?.branch?.name ?? 'Cabang',
        startsAt: b.classSlot?.startAt.toISOString(),
      })),
    };

    const entries = cp.bookings.map((b) => ({
      id: b.id,
      type: 'BOOKING_RESERVED',
      quantity: -1,
      occurredAt: b.bookedAt.toISOString(),
      referenceType: 'BOOKING',
      referenceId: b.id,
      referenceLabel: b.classSlot?.classType?.name ?? 'Kelas',
      bookingId: b.id,
      balanceAfter: cp.remainingSessions,
    }));

    return {
      balance,
      reservations,
      entries,
      nextCursor: null,
      previousCursor: null,
    };
  }

  async listAdjustments(
    principal: SessionPrincipal,
    filters: {
      branchId?: string;
      status?: string;
      cursor?: string;
      q?: string;
    },
  ) {
    let filtered = [...inMemoryAdjustments];
    if (filters.status && filters.status !== 'HISTORY') {
      filtered = filtered.filter((x) => x.status === filters.status);
    }
    if (filters.q) {
      const qLower = filters.q.toLowerCase();
      filtered = filtered.filter(
        (x) =>
          x.customer?.displayName.toLowerCase().includes(qLower) ||
          x.reasonCode.toLowerCase().includes(qLower),
      );
    }

    return {
      items: filtered,
      summary: {
        total: inMemoryAdjustments.length,
        pending: inMemoryAdjustments.filter((x) => x.status === 'PENDING').length,
        posted: inMemoryAdjustments.filter((x) => x.status === 'POSTED').length,
        rejected: inMemoryAdjustments.filter((x) => x.status === 'REJECTED').length,
      },
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async getAdjustment(id: string) {
    const item = inMemoryAdjustments.find((x) => x.id === id);
    if (!item) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return item;
  }

  async requestAdjustment(
    principal: SessionPrincipal,
    body: { customerPackageId: string; quantity: number; reasonCode: string },
  ) {
    const cp = await this.db.paketPelanggan.findUnique({
      where: { id: body.customerPackageId },
      include: { user: true, package: true },
    });
    if (!cp) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const branch = await this.db.cabang.findFirst();

    const adj: InMemoryAdjustment = {
      id: newId(),
      customerPackageId: cp.id,
      quantity: body.quantity,
      reasonCode: body.reasonCode,
      status: 'PENDING',
      version: 1,
      createdAt: new Date().toISOString(),
      customer: {
        id: cp.user.id,
        displayName: cp.user.displayName,
        phoneMasked: cp.user.phone ? cp.user.phone.slice(0, 4) + '****' : null,
      },
      branch: { id: branch?.id ?? 'global', name: branch?.name ?? 'Cabang' },
      package: { id: cp.package.id, name: cp.package.name },
      requestedBy: { id: principal.userId, displayName: 'Staff' },
      currentBalance: cp.remainingSessions,
      currentReserved: 0,
      currentAvailable: cp.remainingSessions,
      projectedLedgerBalance: cp.remainingSessions + body.quantity,
      projectedAvailable: cp.remainingSessions + body.quantity,
      eligibleForApproval: true,
    };

    inMemoryAdjustments.unshift(adj);
    return adj;
  }

  async decideAdjustment(
    principal: SessionPrincipal,
    id: string,
    decision: 'approve' | 'reject',
    body: { reasonCode: string; note?: string; expectedVersion: number },
  ) {
    const adj = inMemoryAdjustments.find((x) => x.id === id);
    if (!adj) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    adj.status = decision === 'approve' ? 'POSTED' : 'REJECTED';
    adj.decidedAt = new Date().toISOString();
    adj.decidedBy = { id: principal.userId, displayName: 'Manager' };
    adj.decisionCode = body.reasonCode;
    adj.decisionNote = body.note;
    adj.version += 1;

    if (decision === 'approve') {
      await this.db.paketPelanggan.update({
        where: { id: adj.customerPackageId },
        data: {
          remainingSessions: { increment: adj.quantity },
        },
      });
    }

    return adj;
  }
}

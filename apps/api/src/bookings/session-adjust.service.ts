import { HttpStatus, Injectable } from '@nestjs/common';
import { AdjustRequestStatus, Prisma, SessionMutationType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CreateAdjustRequestCommand = {
  customerPackageId: string;
  bookingId?: string;
  reason: string;
  sessionCount?: number;
};

export type DecideAdjustRequestCommand = {
  decision: 'APPROVED' | 'REJECTED';
  decisionReason?: string;
};

@Injectable()
export class SessionAdjustService {
  constructor(private readonly db: PrismaService) {}

  private isManagerOrAbove(principal: SessionPrincipal): boolean {
    return principal.roles.some((r) =>
      ['SUPER_OWNER', 'SUPERADMIN', 'MANAGER'].includes(r.role as string),
    );
  }

  async createRequest(principal: SessionPrincipal, input: CreateAdjustRequestCommand) {
    if (!UUID.test(input.customerPackageId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (!input.reason?.trim() || input.reason.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const sessionCount = Math.max(1, input.sessionCount ?? 1);

    const customerPackage = await this.db.paketPelanggan.findUnique({
      where: { id: input.customerPackageId },
      include: { user: true, package: true },
    });
    if (!customerPackage) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (input.bookingId && !UUID.test(input.bookingId)) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const request = await this.db.sessionAdjustRequest.create({
      data: {
        id: randomUUID(),
        customerPackageId: customerPackage.id,
        bookingId: input.bookingId ?? null,
        reason: input.reason.trim(),
        sessionCount,
        status: AdjustRequestStatus.PENDING,
        requestedById: principal.userId,
      },
      include: {
        customerPackage: {
          include: {
            user: { select: { id: true, displayName: true, email: true, phone: true } },
            package: { select: { id: true, name: true } },
          },
        },
        requestedBy: { select: { id: true, displayName: true, email: true } },
      },
    });

    return {
      status: HttpStatus.CREATED,
      data: request,
    };
  }

  async listRequests(
    principal: SessionPrincipal,
    query: { status?: AdjustRequestStatus; customerPackageId?: string } = {},
  ) {
    const where: Prisma.SessionAdjustRequestWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.customerPackageId ? { customerPackageId: query.customerPackageId } : {}),
    };

    const items = await this.db.sessionAdjustRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customerPackage: {
          include: {
            user: { select: { id: true, displayName: true, email: true, phone: true } },
            package: { select: { id: true, name: true } },
          },
        },
        requestedBy: { select: { id: true, displayName: true, email: true } },
        approvedBy: { select: { id: true, displayName: true, email: true } },
      },
    });

    return {
      items,
      count: items.length,
    };
  }

  async decideRequest(principal: SessionPrincipal, id: string, input: DecideAdjustRequestCommand) {
    if (!UUID.test(id)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (!this.isManagerOrAbove(principal)) {
      throw new ApiProblem('AUTHORIZATION_REQUIRED', HttpStatus.FORBIDDEN);
    }
    if (!['APPROVED', 'REJECTED'].includes(input.decision)) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }

    return this.db.$transaction(
      async (tx) => {
        const req = await tx.sessionAdjustRequest.findUnique({
          where: { id },
          include: {
            customerPackage: true,
          },
        });
        if (!req) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (req.status !== AdjustRequestStatus.PENDING) {
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        }

        const newStatus =
          input.decision === 'APPROVED'
            ? AdjustRequestStatus.APPROVED
            : AdjustRequestStatus.REJECTED;

        if (newStatus === AdjustRequestStatus.APPROVED) {
          const pkg = req.customerPackage;
          const remainingAfter = pkg.remainingSessions + req.sessionCount;

          // Catat mutasi penyesuaian sesi manual di SessionLedger
          await tx.sessionLedger.create({
            data: {
              customerPackageId: pkg.id,
              type: SessionMutationType.ADJUST_MANUAL,
              amount: req.sessionCount,
              balanceAfter: remainingAfter,
              referenceId: req.id,
              notes: `Manual adjustment approved by Manager: ${req.reason}${input.decisionReason ? ` (Note: ${input.decisionReason})` : ''}`,
              createdById: principal.userId,
            },
          });

          // Pulihkan saldo sesi di PaketPelanggan
          await tx.paketPelanggan.update({
            where: { id: pkg.id },
            data: {
              remainingSessions: { increment: req.sessionCount },
              status: 'ACTIVE',
            },
          });
        }

        const updated = await tx.sessionAdjustRequest.update({
          where: { id },
          data: {
            status: newStatus,
            approvedById: principal.userId,
            decisionReason: input.decisionReason?.trim() ?? null,
            decidedAt: new Date(),
          },
          include: {
            customerPackage: {
              include: {
                user: { select: { id: true, displayName: true, email: true } },
                package: { select: { id: true, name: true } },
              },
            },
            requestedBy: { select: { id: true, displayName: true, email: true } },
            approvedBy: { select: { id: true, displayName: true, email: true } },
          },
        });

        return {
          status: HttpStatus.OK,
          data: updated,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}

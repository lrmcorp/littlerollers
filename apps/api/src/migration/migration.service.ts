import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type MigrationRejectStatus, type MigrationResolutionStatus } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId, safeEqual } from '../identity/security';

const PAGE_SIZE = 100;
const FORBIDDEN_DECISION_KEY = /(password|token|secret|nik|file.?bytes|private.?path)/iu;

const hashJson = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
const hashText = (value: string): string => createHash('sha256').update(value).digest('hex');

function assertSafeDecision(value: unknown, depth = 0): void {
  if (depth > 8) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  if (typeof value === 'string' && value.length > 1000)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  if (Array.isArray(value)) {
    for (const item of value) assertSafeDecision(item, depth + 1);
    return;
  }
  if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) {
      if (FORBIDDEN_DECISION_KEY.test(key))
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
      assertSafeDecision(item, depth + 1);
    }
}

@Injectable()
export class MigrationService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private requireRead(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'migration:read');
  }

  private encodeDecimal<T>(value: T): T {
    return JSON.parse(
      JSON.stringify(value, (_key, item) =>
        Prisma.Decimal.isDecimal(item) ? item.toFixed(0) : item,
      ),
    ) as T;
  }

  async listBatches(principal: SessionPrincipal, cursor?: string) {
    this.requireRead(principal);
    const items = await this.db.migrationBatch.findMany({
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        _count: {
          select: {
            sourceKeys: true,
            rejects: true,
            controlTotals: true,
            resolutions: true,
            deferredMediaReferences: true,
          },
        },
      },
    });
    const nextCursor = items.length > PAGE_SIZE ? (items[PAGE_SIZE - 1]?.id ?? null) : null;
    return { items: items.slice(0, PAGE_SIZE), nextCursor };
  }

  async getBatch(principal: SessionPrincipal, id: string) {
    this.requireRead(principal);
    const batch = await this.db.migrationBatch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sourceKeys: true,
            rejects: true,
            controlTotals: true,
            resolutions: true,
            deferredMediaReferences: true,
          },
        },
      },
    });
    if (!batch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return batch;
  }

  async listControlTotals(principal: SessionPrincipal, batchId: string) {
    this.requireRead(principal);
    return {
      items: this.encodeDecimal(
        await this.db.migrationControlTotal.findMany({
          where: { batchId },
          orderBy: [{ controlKey: 'asc' }, { dimensionHash: 'asc' }],
        }),
      ),
    };
  }

  async cdcOverview(principal: SessionPrincipal) {
    this.requireRead(principal);
    const [eventCounts, checkpoints, branches, outboxCounts, failures] = await Promise.all([
      this.db.migrationDeltaEvent.groupBy({ by: ['status'], _count: { _all: true } }),
      this.db.migrationGtidCheckpoint.findMany({ orderBy: { kind: 'asc' } }),
      this.db.migrationBranchCutover.findMany({
        orderBy: { updatedAt: 'asc' },
        include: { branch: { select: { code: true, name: true } } },
      }),
      this.db.migrationPilotOutbox.groupBy({ by: ['status'], _count: { _all: true } }),
      this.db.migrationDeltaEvent.findMany({
        where: { status: { in: ['BLOCKED', 'FAILED'] } },
        take: 100,
        orderBy: [{ transactionOrder: 'asc' }, { eventOrder: 'asc' }],
        select: {
          id: true,
          eventKey: true,
          sourceTable: true,
          sourceId: true,
          operation: true,
          gtid: true,
          transactionOrder: true,
          eventOrder: true,
          branchId: true,
          status: true,
          failureCode: true,
          sourceOccurredAt: true,
        },
      }),
    ]);
    const capture = checkpoints.find((item) => item.kind === 'CAPTURE');
    return {
      lagSeconds: capture?.capturedThroughAt
        ? Math.max(0, Math.trunc((Date.now() - capture.capturedThroughAt.getTime()) / 1000))
        : null,
      events: Object.fromEntries(eventCounts.map((item) => [item.status, item._count._all])),
      checkpoints: checkpoints.map((item) => ({
        kind: item.kind,
        lastGtid: item.lastGtid,
        transactionOrder: item.transactionOrder.toString(),
        capturedThroughAt: item.capturedThroughAt,
        updatedAt: item.updatedAt,
      })),
      branches: branches.map((item) => ({
        branchId: item.branchId,
        sourceBranchId: item.sourceBranchId,
        code: item.branch.code,
        name: item.branch.name,
        status: item.status,
        highWaterGtid: item.highWaterGtid,
        highWaterOrder: item.highWaterOrder?.toString() ?? null,
        updatedAt: item.updatedAt,
      })),
      pilotOutbox: Object.fromEntries(outboxCounts.map((item) => [item.status, item._count._all])),
      failures: failures.map((item) => ({
        ...item,
        transactionOrder: item.transactionOrder.toString(),
      })),
    };
  }

  async listRejects(
    principal: SessionPrincipal,
    batchId: string,
    status?: string,
    cursor?: string,
  ) {
    this.requireRead(principal);
    const normalized = status?.toUpperCase();
    if (normalized && !['OPEN', 'RESOLVED', 'WAIVED'].includes(normalized))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const items = await this.db.migrationReject.findMany({
      where: { batchId, ...(normalized ? { status: normalized as MigrationRejectStatus } : {}) },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    const nextCursor = items.length > PAGE_SIZE ? (items[PAGE_SIZE - 1]?.id ?? null) : null;
    return { items: items.slice(0, PAGE_SIZE), nextCursor };
  }

  async listResolutions(
    principal: SessionPrincipal,
    batchId: string,
    status?: string,
    cursor?: string,
  ) {
    this.requireRead(principal);
    const normalized = status?.toUpperCase();
    if (normalized && !['OPEN', 'APPROVED', 'REJECTED', 'APPLIED'].includes(normalized))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const items = await this.db.migrationResolution.findMany({
      where: {
        batchId,
        ...(normalized ? { status: normalized as MigrationResolutionStatus } : {}),
      },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    const nextCursor = items.length > PAGE_SIZE ? (items[PAGE_SIZE - 1]?.id ?? null) : null;
    return { items: items.slice(0, PAGE_SIZE), nextCursor };
  }

  async decideResolution(
    principal: SessionPrincipal,
    id: string,
    body: { approve: boolean; reason: string; decision?: Record<string, unknown> },
    idempotencyKey: string,
    stepUpToken: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'migration:resolve');
    if (
      !body ||
      typeof body.approve !== 'boolean' ||
      typeof body.reason !== 'string' ||
      (body.decision !== undefined &&
        (!body.decision || Array.isArray(body.decision) || typeof body.decision !== 'object'))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const mfaMaxAgeSeconds = Number(process.env.MIGRATION_MFA_MAX_AGE_SECONDS ?? 900);
    if (!Number.isInteger(mfaMaxAgeSeconds) || mfaMaxAgeSeconds < 60 || mfaMaxAgeSeconds > 3600)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    const recentMfa = await this.db.authChallenge.findFirst({
      where: {
        userId: principal.userId,
        kind: 'OTP',
        status: 'VERIFIED',
        verifiedAt: { gte: new Date(Date.now() - mfaMaxAgeSeconds * 1000) },
      },
      select: { id: true },
    });
    if (!recentMfa) throw new ApiProblem('MFA_REQUIRED', HttpStatus.UNAUTHORIZED);
    const expectedStepUpHash = process.env.MIGRATION_STEP_UP_TOKEN_HASH ?? '';
    if (!expectedStepUpHash || !safeEqual(hashText(stepUpToken ?? ''), expectedStepUpHash))
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    if (!idempotencyKey?.trim() || !body.reason?.trim() || body.reason.length > 500)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    assertSafeDecision(body.decision);
    const requestHash = hashJson({ id, idempotencyKey, body });
    return this.db.$transaction(async (tx) => {
      const resolution = await tx.migrationResolution.findUnique({ where: { id } });
      if (!resolution) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (resolution.decisionRequestHash) {
        if (safeEqual(resolution.decisionRequestHash, requestHash)) return resolution;
        if (resolution.status !== 'REJECTED')
          throw new ApiProblem('IDEMPOTENCY_CONFLICT', HttpStatus.CONFLICT);
      }
      const status: MigrationResolutionStatus = body.approve ? 'APPROVED' : 'REJECTED';
      const decidedAt = new Date();
      const claimed = await tx.migrationResolution.updateMany({
        where: {
          id,
          status: resolution.status === 'REJECTED' ? 'REJECTED' : 'OPEN',
          decisionRequestHash: resolution.decisionRequestHash,
        },
        data: {
          status,
          decision: (body.decision ?? {}) as Prisma.InputJsonValue,
          decisionRequestHash: requestHash,
          decisionReason: body.reason.trim(),
          decidedById: principal.userId,
          decidedAt,
        },
      });
      if (claimed.count !== 1) throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
      // Approval is only a decision. The importer must apply it transactionally before
      // the reject can be marked RESOLVED; otherwise a cutover gate could pass while
      // the business record is still missing. A rejected proposal remains OPEN until
      // an operator submits an explicit replacement decision.
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'migration.resolution_decided',
          objectType: 'MigrationResolution',
          objectId: id,
          correlationId,
          afterMasked: { status, reasonCode: resolution.reasonCode },
        },
      });
      return tx.migrationResolution.findUniqueOrThrow({ where: { id } });
    });
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { assertIsoDate } from '../identity/assignment-boundary';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { MasterAccessService } from './master-access.service';

export type SettingKind = 'INSTRUCTOR_FEE' | 'PROJECTION_RATE' | 'QUOTA_CAPACITY';
export type SettingInput = {
  kind: SettingKind;
  branchId: string;
  classTypeId: string;
  instructorUserId?: string;
  feeRp?: number;
  rateRp?: number;
  minimumQuota?: number;
  defaultCapacity?: number;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  reason: string;
};

@Injectable()
export class EffectiveSettingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: MasterAccessService,
  ) {}

  async list(principal: SessionPrincipal, kind: SettingKind, branchId?: string) {
    this.access.authorize(principal);
    if (branchId) this.access.ensureBranchScope(principal, branchId);
    const branchIds = principal.capabilities.includes('branch:all')
      ? undefined
      : principal.branchIds;
    const items = await this.db.effectiveConfiguration.findMany({
      where: { kind, branchId: branchId ?? (branchIds ? { in: branchIds } : undefined) },
      orderBy: [{ effectiveFrom: 'desc' }, { businessKey: 'asc' }],
    });
    return { items: items.map(settingView), page: { nextCursor: null, hasMore: false } };
  }

  async create(principal: SessionPrincipal, input: SettingInput, correlationId: string) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, input.branchId);
    if (
      (input.kind === 'INSTRUCTOR_FEE' || input.kind === 'PROJECTION_RATE') &&
      !principal.capabilities.includes('finance:manage')
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const from = assertIsoDate(input.effectiveFrom);
    const until = input.effectiveUntil ? assertIsoDate(input.effectiveUntil) : null;
    if (until && until <= from) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const value = validateValue(input);
    const key = [input.branchId, input.classTypeId, input.instructorUserId]
      .filter(Boolean)
      .join(':');
    try {
      return await this.db.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT \`id\`
            FROM \`ClassType\`
            WHERE \`id\` = ${input.classTypeId}
            FOR UPDATE
          `;
          const [branch, classType] = await Promise.all([
            tx.branch.findUnique({ where: { id: input.branchId } }),
            tx.classType.findUnique({ where: { id: input.classTypeId } }),
          ]);
          if (!branch?.active || !classType?.active || classType.branchId !== input.branchId)
            throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          if (input.kind === 'INSTRUCTOR_FEE') {
            const user = await tx.user.findUnique({ where: { id: input.instructorUserId! } });
            if (!user || user.status !== 'ACTIVE')
              throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          }
          const effectiveFrom = new Date(`${from}T00:00:00Z`);
          const effectiveUntil = until ? new Date(`${until}T00:00:00Z`) : null;
          const overlap = await tx.effectiveConfiguration.findFirst({
            where: {
              kind: input.kind,
              businessKey: key,
              effectiveFrom: effectiveUntil ? { lt: effectiveUntil } : undefined,
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveFrom } }],
            },
          });
          if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
          const item = await tx.effectiveConfiguration.create({
            data: {
              id: newId(),
              kind: input.kind,
              businessKey: key,
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              value,
              effectiveFrom,
              effectiveUntil,
              approvedEvidence: 'SYNTHETIC_NON_PRODUCTION',
            },
          });
          await this.access.audit(
            tx,
            principal,
            correlationId,
            'master.effective_setting_created',
            'EffectiveConfiguration',
            item.id,
            input.branchId,
            undefined,
            {
              kind: input.kind,
              businessKey: key,
              effectiveFrom: from,
              effectiveUntil: until,
              value,
              reasonPresent: Boolean(input.reason),
              version: 0,
            },
          );
          return settingView(item);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isOverlap(error)) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
      throw error;
    }
  }
}

function validateValue(input: SettingInput): Prisma.InputJsonValue {
  if (input.kind === 'INSTRUCTOR_FEE') {
    if (!input.instructorUserId || !Number.isSafeInteger(input.feeRp) || input.feeRp! < 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return {
      feeRp: input.feeRp!,
      currency: 'IDR',
      unit: 'MATCHED_HOUR',
      instructorUserId: input.instructorUserId,
    };
  }
  if (input.kind === 'PROJECTION_RATE') {
    if (!Number.isSafeInteger(input.rateRp) || input.rateRp! < 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return { rateRp: input.rateRp!, currency: 'IDR', unit: 'SOLD_SESSION' };
  }
  if (
    !Number.isSafeInteger(input.minimumQuota) ||
    input.minimumQuota! < 1 ||
    !Number.isSafeInteger(input.defaultCapacity) ||
    input.defaultCapacity! < input.minimumQuota!
  )
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  return { minimumQuota: input.minimumQuota!, defaultCapacity: input.defaultCapacity! };
}

function settingView(item: {
  id: string;
  kind: string;
  businessKey: string;
  branchId: string | null;
  classTypeId: string | null;
  value: Prisma.JsonValue;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  version: number;
}) {
  return {
    id: item.id,
    kind: item.kind,
    businessKey: item.businessKey,
    branchId: item.branchId,
    classTypeId: item.classTypeId,
    value: item.value,
    effectiveFrom: item.effectiveFrom.toISOString().slice(0, 10),
    effectiveUntil: item.effectiveUntil?.toISOString().slice(0, 10) ?? null,
    version: item.version,
  };
}

function isOverlap(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('EffectiveConfiguration_no_overlap') ||
    message.includes('23P01') ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2034' || error.code === 'P2002'))
  );
}

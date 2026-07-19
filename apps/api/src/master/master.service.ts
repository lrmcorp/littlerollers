import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { assertIsoDate } from '../identity/assignment-boundary';
import { ApiProblem, newId } from '../identity/security';

type SettingKind = 'INSTRUCTOR_FEE' | 'PROJECTION_RATE' | 'QUOTA_CAPACITY';
type SettingInput = {
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
export class MasterService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private authorize(principal: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(
      principal.capabilities,
      mutation ? 'master:manage' : 'master:read',
    );
    if (mutation) this.policy.requireMfa(principal.assurance);
  }

  private ensureBranchScope(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private audit(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    objectType: string,
    objectId: string,
    branchId: string,
    before?: Prisma.InputJsonValue,
    after?: Prisma.InputJsonValue,
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId,
        action,
        objectType,
        objectId,
        beforeMasked: before,
        afterMasked: after,
        correlationId,
      },
    });
  }

  async listBranches(principal: SessionPrincipal) {
    this.authorize(principal);
    const items = await this.db.branch.findMany({
      where: principal.capabilities.includes('branch:all')
        ? {}
        : { id: { in: principal.branchIds } },
      orderBy: { code: 'asc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async createBranch(
    principal: SessionPrincipal,
    input: { code: string; name: string; timezone: string },
    correlationId: string,
  ) {
    this.authorize(principal, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.db.$transaction(async (tx) => {
        const branch = await tx.branch.create({
          data: { id: newId(), code, name, timezone: input.timezone },
        });
        await this.audit(
          tx,
          principal,
          correlationId,
          'master.branch_created',
          'Branch',
          branch.id,
          branch.id,
          undefined,
          { code, timezone: input.timezone, active: true, version: 0 },
        );
        return branch;
      });
    } catch (error) {
      if (this.isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateBranch(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.authorize(principal, true);
    this.ensureBranchScope(principal, id);
    return this.db.$transaction(async (tx) => {
      const current = await tx.branch.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (!current.active || current.version !== expectedVersion)
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const dependencies = await tx.assignment.count({
        where: { branchId: id, activeUntil: null },
      });
      if (dependencies) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
      const result = await tx.branch.update({
        where: { id },
        data: { active: false, version: { increment: 1 } },
      });
      await this.audit(
        tx,
        principal,
        correlationId,
        'master.branch_deactivated',
        'Branch',
        id,
        id,
        { active: true, version: expectedVersion },
        { active: false, version: expectedVersion + 1 },
      );
      return result;
    });
  }

  async listClassTypes(principal: SessionPrincipal, branchId?: string) {
    this.authorize(principal);
    if (branchId) this.ensureBranchScope(principal, branchId);
    const branchIds = principal.capabilities.includes('branch:all')
      ? undefined
      : principal.branchIds;
    const items = await this.db.classType.findMany({
      where: { branchId: branchId ?? (branchIds ? { in: branchIds } : undefined) },
      orderBy: { code: 'asc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async createClassType(
    principal: SessionPrincipal,
    input: { branchId: string; code: string; name: string },
    correlationId: string,
  ) {
    this.authorize(principal, true);
    this.ensureBranchScope(principal, input.branchId);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      return await this.db.$transaction(async (tx) => {
        const branch = await tx.branch.findUnique({ where: { id: input.branchId } });
        if (!branch?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        const item = await tx.classType.create({
          data: { id: newId(), branchId: input.branchId, code, name },
        });
        await this.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_created',
          'ClassType',
          item.id,
          input.branchId,
          undefined,
          { code, active: true, version: 0 },
        );
        return item;
      });
    } catch (error) {
      if (this.isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateClassType(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const item = await tx.classType.findUnique({ where: { id } });
      if (!item) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.ensureBranchScope(principal, item.branchId);
      if (!item.active || item.version !== expectedVersion)
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const activeSettings = await tx.effectiveConfiguration.count({
        where: { classTypeId: id, effectiveUntil: null },
      });
      if (activeSettings) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
      const result = await tx.classType.update({
        where: { id },
        data: { active: false, version: { increment: 1 } },
      });
      await this.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_deactivated',
        'ClassType',
        id,
        item.branchId,
        { active: true, version: expectedVersion },
        { active: false, version: expectedVersion + 1 },
      );
      return result;
    });
  }

  async listSettings(principal: SessionPrincipal, kind: SettingKind, branchId?: string) {
    this.authorize(principal);
    if (branchId) this.ensureBranchScope(principal, branchId);
    const branchIds = principal.capabilities.includes('branch:all')
      ? undefined
      : principal.branchIds;
    const items = await this.db.effectiveConfiguration.findMany({
      where: { kind, branchId: branchId ?? (branchIds ? { in: branchIds } : undefined) },
      orderBy: [{ effectiveFrom: 'desc' }, { businessKey: 'asc' }],
    });
    return {
      items: items.map((item) => this.settingView(item)),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async createSetting(principal: SessionPrincipal, input: SettingInput, correlationId: string) {
    this.authorize(principal, true);
    this.ensureBranchScope(principal, input.branchId);
    if (
      (input.kind === 'INSTRUCTOR_FEE' || input.kind === 'PROJECTION_RATE') &&
      !principal.capabilities.includes('finance:manage')
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const from = assertIsoDate(input.effectiveFrom);
    const until = input.effectiveUntil ? assertIsoDate(input.effectiveUntil) : null;
    if (until && until <= from) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const value = this.validateValue(input);
    const key = [input.branchId, input.classTypeId, input.instructorUserId]
      .filter(Boolean)
      .join(':');
    try {
      return await this.db.$transaction(
        async (tx) => {
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
          const item = await tx.effectiveConfiguration.create({
            data: {
              id: newId(),
              kind: input.kind,
              businessKey: key,
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              value,
              effectiveFrom: new Date(`${from}T00:00:00Z`),
              effectiveUntil: until ? new Date(`${until}T00:00:00Z`) : null,
              approvedEvidence: 'SYNTHETIC_NON_PRODUCTION',
            },
          });
          await this.audit(
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
          return this.settingView(item);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (this.isOverlap(error))
        throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
      throw error;
    }
  }

  private validateValue(input: SettingInput): Prisma.InputJsonValue {
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

  private settingView(item: {
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

  private isUnique(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
  private isOverlap(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('EffectiveConfiguration_no_overlap') ||
      message.includes('23P01') ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2034' || error.code === 'P2002'))
    );
  }
}

import { Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
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
  constructor(private readonly access: MasterAccessService) {}

  async list(principal: SessionPrincipal, _kind: SettingKind, branchId?: string) {
    this.access.authorize(principal);
    if (branchId) this.access.ensureBranchScope(principal, branchId);
    return { items: [], page: { nextCursor: null, hasMore: false } };
  }

  async create(principal: SessionPrincipal, input: SettingInput, _correlationId: string) {
    this.access.authorize(principal, true);
    return {
      id: `setting-${Date.now()}`,
      ...input,
      effectiveUntil: input.effectiveUntil ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  async deactivate(principal: SessionPrincipal, id: string, _correlationId: string) {
    this.access.authorize(principal, true);
    return { id, deactivated: true };
  }

  // --- Indonesian Domain Aliases ---
  async ambilPengaturanEfektif(
    principal: SessionPrincipal,
    kind: Parameters<EffectiveSettingsService['list']>[1],
    branchId?: string,
  ) {
    return this.list(principal, kind, branchId);
  }

  async buatPengaturanEfektif(
    principal: SessionPrincipal,
    input: Parameters<EffectiveSettingsService['create']>[1],
    correlationId: string,
  ) {
    return this.create(principal, input, correlationId);
  }

  async nonaktifkanPengaturanEfektif(
    principal: SessionPrincipal,
    id: string,
    correlationId: string,
  ) {
    return this.deactivate(principal, id, correlationId);
  }
}

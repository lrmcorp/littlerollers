import { Configuration, MasterApi } from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';

export type MasterKind = 'INSTRUCTOR_FEE' | 'PROJECTION_RATE' | 'QUOTA_CAPACITY';
export interface MasterSetting {
  id: string;
  kind: MasterKind;
  businessKey: string;
  branchId: string;
  classTypeId: string;
  value: object;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  version: number;
}
export interface MasterSettingInput {
  kind: MasterKind;
  branchId: string;
  classTypeId: string;
  instructorUserId?: string;
  value: number;
  capacity?: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  reason: string;
}
export interface MasterClient {
  listBranches(): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      timezone: string;
      active: boolean;
      version: number;
    }>
  >;
  listClassTypes(
    branchId: string,
  ): Promise<Array<{ id: string; code: string; name: string; active: boolean; version: number }>>;
  createBranch(input: { code: string; name: string; timezone: string }): Promise<void>;
  createClassType(input: { branchId: string; code: string; name: string }): Promise<void>;
  deactivateBranch(id: string, expectedVersion: number): Promise<void>;
  deactivateClassType(id: string, expectedVersion: number): Promise<void>;
  listSettings(kind: MasterKind, branchId?: string): Promise<MasterSetting[]>;
  createSetting(input: MasterSettingInput): Promise<void>;
}

const api = new MasterApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
const date = (value?: string) => (value ? new Date(`${value}T00:00:00Z`) : undefined);
export const browserMasterClient: MasterClient = {
  async listBranches() {
    return (await api.listBranches()).items;
  },
  async listClassTypes(branchId) {
    return (await api.listClassTypes({ branchId })).items;
  },
  async createBranch(input) {
    await api.createBranch({ branchCommand: input });
  },
  async createClassType(input) {
    await api.createClassType({ classTypeCommand: input });
  },
  async deactivateBranch(id, expectedVersion) {
    await api.deactivateBranch({ id, versionCommand: { expectedVersion } });
  },
  async deactivateClassType(id, expectedVersion) {
    await api.deactivateClassType({ id, versionCommand: { expectedVersion } });
  },
  async listSettings(kind, branchId) {
    if (kind === 'INSTRUCTOR_FEE')
      return (await api.listInstructorFees({ branchId })).items as MasterSetting[];
    if (kind === 'PROJECTION_RATE')
      return (await api.listProjectionRates({ branchId })).items as MasterSetting[];
    return (await api.listQuotaCapacitySettings({ branchId })).items as MasterSetting[];
  },
  async createSetting(input) {
    const period = {
      effectiveFrom: date(input.effectiveFrom)!,
      effectiveUntil: date(input.effectiveUntil),
    };
    if (input.kind === 'INSTRUCTOR_FEE') {
      await api.createInstructorFee({
        instructorFeeCommand: {
          ...period,
          kind: 'INSTRUCTOR_FEE',
          branchId: input.branchId,
          classTypeId: input.classTypeId,
          instructorUserId: input.instructorUserId!,
          feeRp: input.value,
          reason: input.reason,
        },
      });
    } else if (input.kind === 'PROJECTION_RATE') {
      await api.createProjectionRate({
        projectionRateCommand: {
          ...period,
          kind: 'PROJECTION_RATE',
          branchId: input.branchId,
          classTypeId: input.classTypeId,
          rateRp: input.value,
          reason: input.reason,
        },
      });
    } else {
      await api.createQuotaCapacitySetting({
        quotaCapacityCommand: {
          ...period,
          kind: 'QUOTA_CAPACITY',
          branchId: input.branchId,
          classTypeId: input.classTypeId,
          minimumQuota: input.value,
          defaultCapacity: input.capacity!,
          reason: input.reason,
        },
      });
    }
  },
};

export function masterFailure(error: unknown): string {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 409) return 'EFFECTIVE_PERIOD_OVERLAP_OR_STALE_VERSION';
  if (status === 422 || status === 400) return 'VALIDATION_ERROR';
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  return 'REQUEST_FAILED';
}

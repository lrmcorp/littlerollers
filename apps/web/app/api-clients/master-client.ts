import {
  Configuration,
  MasterApi,
  type Room,
  type Studio,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from '../components/app-loading';
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
export type MasterBranch = {
  id: string;
  code: string;
  name: string;
  timezone: string;
  active: boolean;
  version: number;
};
export type MasterBranchPage = {
  items: MasterBranch[];
  summary: { total: number; active: number; inactive: number };
  page: { hasMore: boolean; nextCursor: string | null };
};
export interface MasterClient {
  listBranches(input?: {
    q?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    cursor?: string;
    limit?: number;
  }): Promise<MasterBranchPage>;
  listClassTypes(branchId?: string): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      active: boolean;
      version: number;
      branchScopes: Array<{ branchId: string; active: boolean; branch?: { name: string } }>;
    }>
  >;
  createBranch(input: {
    code: string;
    name: string;
    timezone: string;
    reason?: string;
  }): Promise<void>;
  createClassType(input: { code: string; name: string; branchIds?: string[] }): Promise<void>;
  listStudios(branchId: string): Promise<Studio[]>;
  createStudio(
    branchId: string,
    input: { code: string; name: string; equipmentText?: string; contactPhoneE164?: string },
  ): Promise<Studio>;
  updateStudio(
    id: string,
    input: { name: string; equipmentText?: string; contactPhoneE164?: string; active?: boolean },
  ): Promise<Studio>;
  createRoom(
    studioId: string,
    input: { code: string; name: string; capacity?: number },
  ): Promise<Room>;
  updateRoom(
    id: string,
    input: { name: string; capacity?: number; active?: boolean },
  ): Promise<Room>;
  replaceClassTypeScopes(
    id: string,
    input: { branchIds: string[]; expectedVersion: number; reason: string },
  ): Promise<void>;
  updateClassType(
    id: string,
    input: { name: string; expectedVersion: number; reason: string },
  ): Promise<void>;
  deactivateBranch(id: string, expectedVersion: number): Promise<void>;
  deactivateClassType(id: string, expectedVersion: number): Promise<void>;
  reactivateClassType(
    id: string,
    input: { expectedVersion: number; reason: string },
  ): Promise<void>;
  listSettings(kind: MasterKind, branchId?: string): Promise<MasterSetting[]>;
  createSetting(input: MasterSettingInput): Promise<void>;
}

const api = new MasterApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
const date = (value?: string) => (value ? new Date(`${value}T00:00:00Z`) : undefined);
export const browserMasterClient: MasterClient = {
  async listBranches(input = {}) {
    const result = await appLoading.track(api.listBranches(input), { label: 'Memuat cabang…' });
    return {
      items: result.items,
      summary: result.summary,
      page: {
        hasMore: result.page.hasMore,
        nextCursor: result.page.nextCursor ?? null,
      },
    };
  },
  async listClassTypes(branchId) {
    return (
      await appLoading.track(api.listClassTypes({ branchId }), {
        label: 'Memuat tipe kelas…',
      })
    ).items;
  },
  async createBranch(input) {
    await appLoading.track(
      api.createBranch({
        idempotencyKey: crypto.randomUUID(),
        branchCommand: {
          ...input,
          reason: input.reason ?? 'Membuat cabang melalui Master Data.',
        },
      }),
      {
        label: 'Membuat cabang…',
      },
    );
  },
  async createClassType(input) {
    await appLoading.track(
      api.createClassType({
        classTypeCommand: {
          code: input.code,
          name: input.name,
          branchIds: input.branchIds ? new Set(input.branchIds) : undefined,
        },
      }),
      {
        label: 'Membuat tipe kelas…',
      },
    );
  },
  async listStudios(branchId) {
    return (
      await appLoading.track(api.listBranchStudios({ id: branchId }), {
        label: 'Memuat area studio…',
      })
    ).items;
  },
  createStudio(branchId, input) {
    return appLoading.track(api.createBranchStudio({ id: branchId, studioCommand: input }), {
      label: 'Menyimpan area studio…',
    });
  },
  updateStudio(id, input) {
    return appLoading.track(api.updateStudio({ id, studioUpdateCommand: input }), {
      label: 'Memperbarui area studio…',
    });
  },
  createRoom(studioId, input) {
    return appLoading.track(api.createStudioRoom({ id: studioId, roomCommand: input }), {
      label: 'Menyimpan ruangan…',
    });
  },
  updateRoom(id, input) {
    return appLoading.track(api.updateRoom({ id, roomUpdateCommand: input }), {
      label: 'Memperbarui ruangan…',
    });
  },
  async replaceClassTypeScopes(id, input) {
    await appLoading.track(
      api.replaceClassTypeBranchScopes({
        id,
        classTypeScopeCommand: {
          branchIds: new Set(input.branchIds),
          expectedVersion: input.expectedVersion,
          reason: input.reason,
        },
      }),
      { label: 'Memperbarui cakupan tipe kelas…' },
    );
  },
  async updateClassType(id, input) {
    await appLoading.track(
      api.updateClassType({
        id,
        idempotencyKey: crypto.randomUUID(),
        classTypeUpdateCommand: input,
      }),
      { label: 'Memperbarui tipe kelas…' },
    );
  },
  async deactivateBranch(id, expectedVersion) {
    await appLoading.track(
      api.deactivateBranch({
        id,
        idempotencyKey: crypto.randomUUID(),
        body: {
          expectedVersion,
          reason: 'Menonaktifkan cabang melalui Master Data.',
        },
      }),
      { label: 'Menonaktifkan cabang…' },
    );
  },
  async deactivateClassType(id, expectedVersion) {
    await appLoading.track(
      api.deactivateClassType({
        id,
        idempotencyKey: crypto.randomUUID(),
        reasonedVersionCommand: {
          expectedVersion,
          reason: 'Menonaktifkan tipe kelas melalui Master Data.',
        },
      }),
      {
        label: 'Menonaktifkan tipe kelas…',
      },
    );
  },
  async reactivateClassType(id, input) {
    await appLoading.track(
      api.reactivateClassType({
        id,
        idempotencyKey: crypto.randomUUID(),
        reasonedVersionCommand: input,
      }),
      { label: 'Mengaktifkan tipe kelas…' },
    );
  },
  async listSettings(kind, branchId) {
    if (kind === 'INSTRUCTOR_FEE')
      return (
        await appLoading.track(api.listInstructorFees({ branchId }), {
          label: 'Memuat honor instruktur…',
        })
      ).items as MasterSetting[];
    if (kind === 'PROJECTION_RATE')
      return (
        await appLoading.track(api.listProjectionRates({ branchId }), {
          label: 'Memuat proyeksi…',
        })
      ).items as MasterSetting[];
    return (
      await appLoading.track(api.listQuotaCapacitySettings({ branchId }), {
        label: 'Memuat kuota dan kapasitas…',
      })
    ).items as MasterSetting[];
  },
  async createSetting(input) {
    const period = {
      effectiveFrom: date(input.effectiveFrom)!,
      effectiveUntil: date(input.effectiveUntil),
    };
    if (input.kind === 'INSTRUCTOR_FEE') {
      await appLoading.track(
        api.createInstructorFee({
          instructorFeeCommand: {
            ...period,
            kind: 'INSTRUCTOR_FEE',
            branchId: input.branchId,
            classTypeId: input.classTypeId,
            instructorUserId: input.instructorUserId!,
            feeRp: input.value,
            reason: input.reason,
          },
        }),
        { label: 'Menyimpan honor instruktur…' },
      );
    } else if (input.kind === 'PROJECTION_RATE') {
      await appLoading.track(
        api.createProjectionRate({
          projectionRateCommand: {
            ...period,
            kind: 'PROJECTION_RATE',
            branchId: input.branchId,
            classTypeId: input.classTypeId,
            rateRp: input.value,
            reason: input.reason,
          },
        }),
        { label: 'Menyimpan proyeksi…' },
      );
    } else {
      await appLoading.track(
        api.createQuotaCapacitySetting({
          quotaCapacityCommand: {
            ...period,
            kind: 'QUOTA_CAPACITY',
            branchId: input.branchId,
            classTypeId: input.classTypeId,
            minimumQuota: input.value,
            defaultCapacity: input.capacity!,
            reason: input.reason,
          },
        }),
        { label: 'Menyimpan kuota dan kapasitas…' },
      );
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

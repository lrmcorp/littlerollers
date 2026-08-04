import {
  ClassesApi,
  Configuration,
  IdentityApi,
  MasterApi,
  type ClassSlot,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from './components/app-loading';
import { notifySessionFailure } from './session-client';
export type { ClassSlot };
export interface ClassTypeOption {
  id: string;
  code: string;
  name: string;
  branchId?: string;
}
export interface InstructorOption {
  id: string;
  displayName: string;
  branchId?: string;
}
export interface RoomOption {
  id: string;
  studioId: string;
  code: string;
  name: string;
  capacity?: number | null;
}
export interface StudioOption {
  id: string;
  branchId: string;
  code: string;
  name: string;
  rooms: RoomOption[];
}
export interface ClassWorkspace {
  slots: ClassSlot[];
  classTypes: ClassTypeOption[];
  instructors: InstructorOption[];
  studios: StudioOption[];
  nextCursor?: string | null;
}
export interface ClassSlotClient {
  discover(input: {
    branchId?: string;
    branches?: { id: string; timezone: string }[];
    timezone: string;
    from: Date;
    until: Date;
    status?: string;
  }): Promise<ClassWorkspace>;
  create(input: {
    branchId: string;
    classTypeId: string;
    studioId: string;
    roomId?: string;
    instructorUserId?: string;
    startAt: Date;
    endAt: Date;
  }): Promise<ClassSlot>;
  update(
    id: string,
    input: {
      classTypeId: string;
      instructorUserId?: string | null;
      startAt: Date;
      endAt: Date;
      expectedVersion: number;
      reason: string;
    },
  ): Promise<ClassSlot>;
  assign(id: string, instructorUserId: string, expectedVersion: number): Promise<ClassSlot>;
  publish(id: string, expectedVersion: number): Promise<ClassSlot>;
  cancel(
    id: string,
    reasonCode:
      'STUDIO_UNAVAILABLE' | 'INSTRUCTOR_UNAVAILABLE' | 'SAFETY_ISSUE' | 'OTHER_REVIEW_REQUIRED',
    expectedVersion: number,
  ): Promise<ClassSlot>;
}
const api = new ClassesApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const identity = new IdentityApi(configuration);
const master = new MasterApi(configuration);
const key = () => crypto.randomUUID();
export const browserClassSlotClient: ClassSlotClient = {
  async discover(input) {
    const scopedBranches = input.branchId
      ? [{ id: input.branchId, timezone: input.timezone }]
      : (input.branches ?? []);
    const [slots, branchWorkspaces] = await appLoading.track(
      Promise.all([
        api.listClassSlots({
          branchId: input.branchId,
          from: input.from,
          until: input.until,
          status: input.status,
        }),
        Promise.all(
          scopedBranches.map(async (branch) => {
            const [classTypes, users, assignments, studios] = await Promise.all([
              master.listClassTypes({ branchId: branch.id }),
              identity.listUsers({ branchId: branch.id }),
              identity.listAssignments({ branchId: branch.id }),
              master.listBranchStudios({ id: branch.id }),
            ]);
            return { branch, classTypes, users, assignments, studios };
          }),
        ),
      ]),
      { label: 'Memuat jadwal kelas…' },
    );
    const branchDate = (value: Date) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: input.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(value);
    const weekStart = branchDate(input.from);
    const weekEnd = branchDate(input.until);
    const classTypeOptions = branchWorkspaces.flatMap(({ branch, classTypes }) =>
      classTypes.items
        .filter((item) => item.active)
        .map(({ id, code, name }) => ({ id, code, name, branchId: branch.id })),
    );
    const instructorOptions = branchWorkspaces.flatMap(({ branch, users, assignments }) => {
      const instructorIds = new Set(
        assignments.items
          .filter(
            (assignment) =>
              assignment.assignmentType === 'INSTRUCTOR' &&
              assignment.branchId === branch.id &&
              assignment.activeFrom.toISOString().slice(0, 10) < weekEnd &&
              (!assignment.activeUntil ||
                assignment.activeUntil.toISOString().slice(0, 10) > weekStart),
          )
          .map((assignment) => assignment.userId),
      );
      return users.items
        .filter((user) => user.status === 'ACTIVE' && instructorIds.has(user.id))
        .map((user) => ({
          id: user.id,
          branchId: branch.id,
          displayName: user.displayName || `Instructor ${user.id.slice(0, 8)}`,
        }));
    });
    return {
      slots: slots.items,
      nextCursor: slots.page.nextCursor,
      classTypes: classTypeOptions,
      instructors: [...new Map(instructorOptions.map((item) => [item.id, item])).values()],
      studios: branchWorkspaces.flatMap(({ branch, studios }) =>
        studios.items
          .filter((studio) => studio.active)
          .map((studio) => ({
            id: studio.id,
            branchId: branch.id,
            code: studio.code,
            name: studio.name,
            rooms: (studio.rooms ?? [])
              .filter((room) => room.active)
              .map(({ id, studioId, code, name, capacity }) => ({
                id,
                studioId,
                code,
                name,
                capacity,
              })),
          })),
      ),
    };
  },
  create(input) {
    return appLoading.track(
      api.createClassSlot({ idempotencyKey: key(), classSlotCommand: input }),
      { label: 'Membuat kelas…' },
    );
  },
  update(id, input) {
    return appLoading.track(
      api.updateDraftClassSlot({
        id,
        idempotencyKey: key(),
        classSlotUpdateCommand: input,
      }),
      { label: 'Menyimpan perubahan kelas…' },
    );
  },
  assign(id, instructorUserId, expectedVersion) {
    return appLoading.track(
      api.assignClassSlotInstructor({
        id,
        idempotencyKey: key(),
        assignInstructorCommand: { instructorUserId, expectedVersion },
      }),
      { label: 'Menetapkan instruktur…' },
    );
  },
  publish(id, expectedVersion) {
    return appLoading.track(
      api.publishClassSlot({
        id,
        idempotencyKey: key(),
        classSlotVersionCommand: { expectedVersion },
      }),
      { label: 'Menerbitkan kelas…' },
    );
  },
  cancel(id, reasonCode, expectedVersion) {
    return appLoading.track(
      api.cancelClassSlot({
        id,
        idempotencyKey: key(),
        classSlotCancellationCommand: { reasonCode, expectedVersion },
      }),
      { label: 'Membatalkan kelas…' },
    );
  },
};
export function classSlotFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  const code = (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data
    ?.error?.code;
  const messages: Record<string, string> = {
    CONFIGURATION_REQUIRED: 'Konfigurasi quota atau capacity belum tersedia untuk waktu tersebut.',
    AVAILABILITY_REQUIRED: 'Availability instructor belum mencakup seluruh waktu kelas.',
    SCHEDULE_CONFLICT: 'Jadwal instructor bertabrakan dengan kelas lain.',
    STALE_VERSION: 'Data kelas berubah. Muat ulang sebelum melanjutkan.',
    RESOURCE_NOT_FOUND: 'Data tidak tersedia dalam cabang yang dipilih.',
    INVALID_STATE_TRANSITION: 'Status kelas tidak mendukung tindakan tersebut.',
    VALIDATION_ERROR: 'Tanggal, waktu, atau pilihan kelas belum valid.',
  };
  if (code && messages[code]) return messages[code];
  if (status === 403) return 'Permission yang sesuai diperlukan.';
  if (status === 404) return messages.RESOURCE_NOT_FOUND;
  if (status === 409)
    return 'Jadwal atau versi kelas mengalami konflik. Muat ulang lalu coba lagi.';
  if (status === 503) return messages.CONFIGURATION_REQUIRED;
  if (status === 400 || status === 422) return messages.VALIDATION_ERROR;
  return 'Layanan kelas tidak dapat dijangkau. Periksa koneksi lalu coba lagi.';
}

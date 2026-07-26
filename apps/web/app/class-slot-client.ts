import {
  ClassesApi,
  Configuration,
  IdentityApi,
  MasterApi,
  type ClassSlot,
} from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';
export type { ClassSlot };
export interface ClassTypeOption {
  id: string;
  code: string;
  name: string;
}
export interface InstructorOption {
  id: string;
  displayName: string;
}
export interface ClassWorkspace {
  slots: ClassSlot[];
  classTypes: ClassTypeOption[];
  instructors: InstructorOption[];
  nextCursor?: string | null;
}
export interface ClassSlotClient {
  discover(input: {
    branchId: string;
    timezone: string;
    from: Date;
    until: Date;
    status?: string;
  }): Promise<ClassWorkspace>;
  create(input: {
    branchId: string;
    classTypeId: string;
    instructorUserId?: string;
    startAt: Date;
    endAt: Date;
  }): Promise<ClassSlot>;
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
    const [slots, classTypes, users, assignments] = await Promise.all([
      api.listClassSlots(input),
      master.listClassTypes({ branchId: input.branchId }),
      identity.listUsers({ branchId: input.branchId }),
      identity.listAssignments({ branchId: input.branchId }),
    ]);
    const branchDate = (value: Date) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: input.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(value);
    const weekStart = branchDate(input.from);
    const weekEnd = branchDate(input.until);
    const instructorIds = new Set(
      assignments.items
        .filter(
          (assignment) =>
            assignment.assignmentType === 'INSTRUCTOR' &&
            assignment.branchId === input.branchId &&
            assignment.activeFrom.toISOString().slice(0, 10) < weekEnd &&
            (!assignment.activeUntil ||
              assignment.activeUntil.toISOString().slice(0, 10) > weekStart),
        )
        .map((assignment) => assignment.userId),
    );
    return {
      slots: slots.items,
      nextCursor: slots.page.nextCursor,
      classTypes: classTypes.items
        .filter((item) => item.active)
        .map(({ id, code, name }) => ({ id, code, name })),
      instructors: users.items
        .filter((user) => user.status === 'ACTIVE' && instructorIds.has(user.id))
        .map((user) => ({
          id: user.id,
          displayName: user.displayName || `Instructor ${user.id.slice(0, 8)}`,
        })),
    };
  },
  create(input) {
    return api.createClassSlot({ idempotencyKey: key(), classSlotCommand: input });
  },
  assign(id, instructorUserId, expectedVersion) {
    return api.assignClassSlotInstructor({
      id,
      idempotencyKey: key(),
      assignInstructorCommand: { instructorUserId, expectedVersion },
    });
  },
  publish(id, expectedVersion) {
    return api.publishClassSlot({
      id,
      idempotencyKey: key(),
      classSlotVersionCommand: { expectedVersion },
    });
  },
  cancel(id, reasonCode, expectedVersion) {
    return api.cancelClassSlot({
      id,
      idempotencyKey: key(),
      classSlotCancellationCommand: { reasonCode, expectedVersion },
    });
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

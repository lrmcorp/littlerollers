import { apiFetch } from '../lib/api-client';
import { appLoading } from '../components/app-loading';
import { notifySessionFailure } from './session-client';

export type ClassSlotStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CONFIRMED'
  | 'AUTO_CANCELLED'
  | 'CANCELLED'
  | 'COMPLETED'
  | string;

export type ClassSlotCancellationReason =
  | 'STUDIO_UNAVAILABLE'
  | 'INSTRUCTOR_UNAVAILABLE'
  | 'SAFETY_ISSUE'
  | 'OTHER_REVIEW_REQUIRED'
  | string;

export interface ClassSlot {
  id: string;
  branchId: string;
  classTypeId: string;
  studioId: string;
  roomId?: string | null;
  instructorUserId?: string | null;
  startAt: Date;
  endAt: Date;
  timezone: string;
  status: ClassSlotStatus;
  minimumQuota: number;
  capacity: number;
  bookedCount: number;
  cancellationReasonCode?: ClassSlotCancellationReason | null;
  version: number;
  idempotentReplay?: boolean;
  /** Presensi instruktur yang sudah tercatat (QR atau verifikasi manual); null bila belum. */
  instructorAttendance?: { checkedInAt: Date | string; method: string } | null;
}

export interface InstructorAttendanceResult {
  classSlotId: string;
  checkedInAt: string;
  method: string;
  alreadyRecorded: boolean;
}

export interface CompletionResult {
  classSlotId: string;
  status: any;
  attendanceCount: number;
  noShowCount?: number;
  releasedReservationIds?: Array<string>;
  ledgerEntryIds: Array<string>;
  idempotentReplay?: boolean;
  [key: string]: any;
}

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
      | 'STUDIO_UNAVAILABLE'
      | 'INSTRUCTOR_UNAVAILABLE'
      | 'SAFETY_ISSUE'
      | 'OTHER_REVIEW_REQUIRED',
    expectedVersion: number,
  ): Promise<ClassSlot>;
  completionControl(id: string): Promise<{
    classSlotId: string;
    expectedVersion: number;
    controlHash: string;
    attendanceCount: number;
    noShowCount: number;
    activeReservationCount: number;
  }>;
  complete(
    id: string,
    expectedVersion: number,
    controlHash: string,
    reason: string,
  ): Promise<CompletionResult>;
  verifyInstructorAttendance?(id: string, notes?: string): Promise<InstructorAttendanceResult>;
}

const key = () => crypto.randomUUID();

/**
 * Beberapa akun (mis. INSTRUCTOR/COACH) hanya punya `class-slot:read` dan tidak punya
 * `master:read`/`user:read`/`assignment:read`. Panggilan pelengkap ini hanya untuk opsi filter dan
 * form buat kelas, jadi 403 di sini tidak boleh menggagalkan jadwal utama yang sudah berhasil dimuat.
 */
const safeItems = async <T>(promise: Promise<{ items: T[] }>): Promise<{ items: T[] }> => {
  try {
    return await promise;
  } catch {
    return { items: [] };
  }
};

export const browserClassSlotClient: ClassSlotClient = {
  async discover(input) {
    const scopedBranches = input.branchId
      ? [{ id: input.branchId, timezone: input.timezone }]
      : (input.branches ?? []);

    const params = new URLSearchParams();
    if (input.branchId) params.set('branchId', input.branchId);
    if (input.from) params.set('from', input.from.toISOString());
    if (input.until) params.set('until', input.until.toISOString());
    if (input.status) params.set('status', input.status);
    params.set('limit', '500');

    const [slots, branchWorkspaces] = await appLoading.track(
      Promise.all([
        apiFetch<{ items: ClassSlot[]; page: { nextCursor?: string | null } }>(
          `/class-slots?${params.toString()}`,
          { label: 'Memuat jadwal kelas…' },
        ),
        Promise.all(
          scopedBranches.map(async (branch) => {
            const [classTypes, users, assignments, studios] = await Promise.all([
              safeItems(
                apiFetch<{ items: Array<{ id: string; code: string; name: string; active?: boolean }> }>(
                  `/class-types?branchId=${encodeURIComponent(branch.id)}`,
                ),
              ),
              safeItems(
                apiFetch<{ items: Array<{ id: string; displayName: string; status: string }> }>(
                  `/users?branchId=${encodeURIComponent(branch.id)}`,
                ),
              ),
              safeItems(
                apiFetch<{
                  items: Array<{
                    id: string;
                    userId: string;
                    branchId: string;
                    assignmentType: string;
                    activeFrom: string | Date;
                    activeUntil?: string | Date | null;
                  }>;
                }>(`/assignments?branchId=${encodeURIComponent(branch.id)}`),
              ),
              safeItems(
                apiFetch<{
                  items: Array<{
                    id: string;
                    branchId: string;
                    code: string;
                    name: string;
                    active?: boolean;
                    rooms?: Array<{
                      id: string;
                      studioId: string;
                      code: string;
                      name: string;
                      capacity?: number | null;
                      active?: boolean;
                    }>;
                  }>;
                }>(`/branches/${encodeURIComponent(branch.id)}/studios`),
              ),
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
      (classTypes.items ?? [])
        .filter((item) => item.active !== false)
        .map(({ id, code, name }) => ({ id, code, name, branchId: branch.id })),
    );

    const instructorOptions = branchWorkspaces.flatMap(({ branch, users, assignments }) => {
      const instructorIds = new Set(
        (assignments.items ?? [])
          .filter(
            (assignment) =>
              assignment.assignmentType === 'INSTRUCTOR' &&
              assignment.branchId === branch.id &&
              new Date(assignment.activeFrom).toISOString().slice(0, 10) < weekEnd &&
              (!assignment.activeUntil ||
                new Date(assignment.activeUntil).toISOString().slice(0, 10) > weekStart),
          )
          .map((assignment) => assignment.userId),
      );

      return (users.items ?? [])
        .filter((user) => user.status === 'ACTIVE' && instructorIds.has(user.id))
        .map((user) => ({
          id: user.id,
          branchId: branch.id,
          displayName: user.displayName || `Instructor ${user.id.slice(0, 8)}`,
        }));
    });

    const parsedSlots = (slots.items ?? []).map((slot) => ({
      ...slot,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    }));

    return {
      slots: parsedSlots,
      nextCursor: slots.page?.nextCursor ?? null,
      classTypes: classTypeOptions,
      instructors: [...new Map(instructorOptions.map((item) => [item.id, item])).values()],
      studios: branchWorkspaces.flatMap(({ branch, studios }) =>
        (studios.items ?? [])
          .filter((studio) => studio.active !== false)
          .map((studio) => ({
            id: studio.id,
            branchId: branch.id,
            code: studio.code,
            name: studio.name,
            rooms: (studio.rooms ?? [])
              .filter((room) => room.active !== false)
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
    return apiFetch<ClassSlot>('/class-slots', {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': key() },
      body: JSON.stringify({
        branchId: input.branchId,
        classTypeId: input.classTypeId,
        studioId: input.studioId,
        roomId: input.roomId,
        instructorUserId: input.instructorUserId,
        startAt: input.startAt.toISOString(),
        endAt: input.endAt.toISOString(),
      }),
      label: 'Membuat kelas…',
    }).then((slot) => ({
      ...slot,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    }));
  },

  update(id, input) {
    return apiFetch<ClassSlot>(`/class-slots/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      idempotent: true,
      headers: { 'idempotency-key': key() },
      body: JSON.stringify({
        classTypeId: input.classTypeId,
        instructorUserId: input.instructorUserId,
        startAt: input.startAt.toISOString(),
        endAt: input.endAt.toISOString(),
        expectedVersion: input.expectedVersion,
        reason: input.reason,
      }),
      label: 'Menyimpan perubahan kelas…',
    }).then((slot) => ({
      ...slot,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    }));
  },

  assign(id, instructorUserId, expectedVersion) {
    return apiFetch<ClassSlot>(`/class-slots/${encodeURIComponent(id)}/assign-instructor`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': key() },
      body: JSON.stringify({ instructorUserId, expectedVersion }),
      label: 'Menetapkan instruktur…',
    }).then((slot) => ({
      ...slot,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    }));
  },

  publish(id, expectedVersion) {
    return apiFetch<ClassSlot>(`/class-slots/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': key() },
      body: JSON.stringify({ expectedVersion }),
      label: 'Menerbitkan kelas…',
    }).then((slot) => ({
      ...slot,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    }));
  },

  cancel(id, reasonCode, expectedVersion) {
    return apiFetch<ClassSlot>(`/class-slots/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': key() },
      body: JSON.stringify({ reasonCode, expectedVersion }),
      label: 'Membatalkan kelas…',
    }).then((slot) => ({
      ...slot,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    }));
  },

  completionControl(id) {
    return apiFetch<{
      classSlotId: string;
      expectedVersion: number;
      controlHash: string;
      attendanceCount: number;
      noShowCount: number;
      activeReservationCount: number;
    }>(`/class-slots/${encodeURIComponent(id)}/completion-control`, {
      label: 'Memverifikasi roster kelas…',
    });
  },

  complete(id, expectedVersion, controlHash, reason) {
    return apiFetch<CompletionResult>(`/class-slots/${encodeURIComponent(id)}/complete`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': key() },
      body: JSON.stringify({ expectedVersion, controlHash, reason }),
      label: 'Menyelesaikan kelas…',
    });
  },

  verifyInstructorAttendance(id, notes) {
    return apiFetch<InstructorAttendanceResult>(
      `/class-slots/${encodeURIComponent(id)}/instructor-attendance`,
      {
        method: 'POST',
        body: JSON.stringify({ notes: notes?.trim() || undefined }),
        label: 'Mencatat presensi instruktur…',
      },
    );
  },
};

export function classSlotFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number }; status?: number })?.response?.status ?? (error as { status?: number })?.status;
  const code = (error as { response?: { data?: { error?: { code?: string } } }; data?: { error?: { code?: string } } })?.response?.data
    ?.error?.code ?? (error as { data?: { error?: { code?: string } } })?.data?.error?.code;
  const messages: Record<string, string> = {
    CONFIGURATION_REQUIRED: 'Konfigurasi quota atau capacity belum tersedia untuk waktu tersebut.',
    AVAILABILITY_REQUIRED: 'Availability instructor belum mencakup seluruh waktu kelas.',
    SCHEDULE_CONFLICT: 'Jadwal instructor bertabrakan dengan kelas lain.',
    STALE_VERSION: 'Data kelas berubah. Muat ulang sebelum melanjutkan.',
    RESOURCE_NOT_FOUND: 'Data tidak tersedia dalam cabang yang dipilih.',
    INVALID_STATE_TRANSITION: 'Status kelas tidak mendukung tindakan tersebut.',
    INSTRUCTOR_REQUIRED: 'Tetapkan instruktur terlebih dahulu sebelum mempublikasikan kelas.',
    VALIDATION_ERROR: 'Tanggal, waktu, atau pilihan kelas belum valid.',
    CHECK_IN_TOO_EARLY: 'Presensi baru dapat dicatat mulai 30 menit sebelum kelas dimulai.',
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

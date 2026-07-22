import { ClassesApi, Configuration, type ClassSlot } from '@dailydose/api-client-ts/generated';
export type { ClassSlot };
export interface ClassSlotClient {
  list(input: { branchId?: string; status?: string }): Promise<ClassSlot[]>;
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
const key = () => crypto.randomUUID();
export const browserClassSlotClient: ClassSlotClient = {
  async list(input) {
    return (await api.listClassSlots(input)).items;
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
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'MFA_REQUIRED_OR_FORBIDDEN';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 409) return 'SCHEDULE_OR_STATE_CONFLICT';
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  return 'OFFLINE_OR_REQUEST_FAILED';
}

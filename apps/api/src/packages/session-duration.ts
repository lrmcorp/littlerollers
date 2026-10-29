/** Session lengths a package can sell, in minutes. Timetable slots are 2-hour blocks. */
export const SESSION_DURATION_MINUTES = [60, 120] as const;
export type SessionDurationMinutes = (typeof SESSION_DURATION_MINUTES)[number];
export const DEFAULT_SESSION_DURATION_MINUTES: SessionDurationMinutes = 60;

export function validSessionDuration(value: unknown): value is SessionDurationMinutes {
  return SESSION_DURATION_MINUTES.includes(value as SessionDurationMinutes);
}

/** A session fits a slot when it ends no later than the slot does. */
export function sessionFitsSlot(
  durationMinutes: number,
  slot: { startAt: Date; endAt: Date },
): boolean {
  return slot.startAt.getTime() + durationMinutes * 60_000 <= slot.endAt.getTime();
}

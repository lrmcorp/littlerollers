import type { SeedContext } from './context';

export const instructorKeysByBranch = {
  'LR-JKT': ['instructor', 'instructor-jkt-2'],
  'LR-BSD': ['instructor', 'instructor-bsd-2'],
} as const;

export function resolveInstructorIdsByBranch(
  users: Record<string, string>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(instructorKeysByBranch).map(([branchCode, keys]) => [
      branchCode,
      keys.map((key) => users[key]).filter((id): id is string => Boolean(id)),
    ]),
  );
}

export function validateAvailabilityPeriods(
  periods: { instructorUserId: string; branchId: string; startAt: Date; endAt: Date }[],
) {
  for (const period of periods) {
    if (period.startAt >= period.endAt) throw new Error('Instructor availability must start before it ends.');
  }
  const ordered = [...periods].sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
  for (let index = 1; index < ordered.length; index++) {
    const previous = ordered[index - 1]!;
    const current = ordered[index]!;
    if (
      previous.instructorUserId === current.instructorUserId &&
      previous.endAt > current.startAt
    )
      throw new Error('Instructor availability periods cannot overlap.');
  }
}

export async function seedInstructorAvailability(
  ctx: SeedContext,
  users: Record<string, string>,
  branches: Record<string, string>,
) {
  const fixtures = Object.entries(instructorKeysByBranch).flatMap(([branchCode, keys]) =>
    keys.flatMap((userKey, instructorIndex) =>
      [1, 2, 3].map((day, periodIndex) => ({
        key: `${branchCode}:${userKey}:${day}`,
        instructorUserId: users[userKey]!,
        branchId: branches[branchCode]!,
        sourceAssignmentId: ctx.id(
          'assignment',
          userKey === 'instructor' ? `instructor-${branchCode === 'LR-JKT' ? 'jkt' : 'bsd'}` : userKey,
        ),
        startAt: ctx.at(
          day,
          6 + instructorIndex * 4 + periodIndex + (branchCode === 'LR-BSD' ? 8 : 0),
        ),
        endAt: ctx.at(
          day,
          9 + instructorIndex * 4 + periodIndex + (branchCode === 'LR-BSD' ? 8 : 0),
        ),
      })),
    ),
  );
  if (fixtures.some((item) => !item.instructorUserId || !item.branchId))
    throw new Error('Instructor availability requires seeded users and branches.');
  validateAvailabilityPeriods(fixtures);
  for (const fixture of fixtures) {
    await ctx.db.instructorAvailability.upsert({
      where: { id: ctx.id('instructor-availability', fixture.key) },
      update: {
        instructorUserId: fixture.instructorUserId,
        branchId: fixture.branchId,
        sourceAssignmentId: fixture.sourceAssignmentId,
        startAt: fixture.startAt,
        endAt: fixture.endAt,
        timezone: 'Asia/Jakarta',
      },
      create: {
        id: ctx.id('instructor-availability', fixture.key),
        instructorUserId: fixture.instructorUserId,
        branchId: fixture.branchId,
        sourceAssignmentId: fixture.sourceAssignmentId,
        startAt: fixture.startAt,
        endAt: fixture.endAt,
        timezone: 'Asia/Jakarta',
      },
    });
  }
}

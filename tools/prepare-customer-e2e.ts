import { createHash } from 'node:crypto';
import { PrismaClient } from '../apps/api/node_modules/@prisma/client';

const runId = process.env.DD_CUSTOMER_E2E_RUN_ID?.trim();
if (!runId) throw new Error('DD_CUSTOMER_E2E_RUN_ID wajib tersedia.');

const database = new PrismaClient();
function deterministicId(suffix: string) {
  const digest = createHash('sha256')
    .update(`customer-e2e:${runId}:${suffix}`)
    .digest('hex')
    .slice(0, 32);
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20)}`;
}

const slotId = deterministicId('reschedule-source');
const targetSlotId = deterministicId('reschedule-target');
const checkInSlotId = deterministicId('check-in');
const cleanup = process.env.DD_CUSTOMER_E2E_CLEANUP === 'true';
const openCheckIn = process.env.DD_CUSTOMER_E2E_OPEN_CHECK_IN === 'true';

async function main() {
  try {
    if (cleanup) {
      const customerEmail = `e2e.customer+${runId
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .slice(0, 42)}@littlerollers.local`;
      const customer = await database.user.findUnique({ where: { email: customerEmail } });
      if (customer) {
        await database.$transaction([
          database.userSession.updateMany({
            where: { userId: customer.id, revokedAt: null },
            data: { revokedAt: new Date(), revocationReason: 'E2E_RUN_COMPLETED' },
          }),
          database.user.update({
            where: { id: customer.id },
            data: { status: 'INACTIVE', version: { increment: 1 } },
          }),
        ]);
      }
      await database.classSlot.updateMany({
        where: { id: { in: [slotId, targetSlotId, checkInSlotId] } },
        data: { status: 'CANCELLED', cancellationReasonCode: 'OTHER_REVIEW_REQUIRED' },
      });
      process.stdout.write(
        JSON.stringify({
          slotId,
          targetSlotId,
          checkInSlotId,
          customerId: customer?.id,
          cleaned: true,
        }),
      );
      process.exitCode = 0;
    } else if (openCheckIn) {
      const startAt = new Date(Date.now() + 15 * 60_000);
      await database.classSlot.update({
        where: { id: targetSlotId },
        data: { startAt, endAt: new Date(startAt.getTime() + 50 * 60_000) },
      });
      process.stdout.write(JSON.stringify({ targetSlotId, startAt: startAt.toISOString() }));
    } else {
      const actorSubjectHashes = [
        'ralamzah@gmail.com',
        'finance@littlerollers.local',
        'manager@littlerollers.local',
        'customer@littlerollers.local',
      ].map((email) => createHash('sha256').update(`email:${email}`).digest('hex'));
      await database.rateLimitCounter.deleteMany({
        where: { scope: 'PASSWORD_LOGIN_SUBJECT', subjectHash: { in: actorSubjectHashes } },
      });
      const branch = await database.branch.findFirstOrThrow({
        where: { code: 'LR-JKT', active: true },
        include: {
          studios: {
            where: { code: 'MAIN', active: true, historical: false },
            orderBy: { id: 'asc' },
            take: 1,
          },
        },
      });
      const studio = branch.studios[0];
      if (!studio) throw new Error('CUSTOMER_E2E_STUDIO_REQUIRED');
      const classType = await database.classType.findFirstOrThrow({
        where: {
          code: 'MOVERS',
          active: true,
          historical: false,
          branchScopes: {
            some: { branchId: branch.id, active: true, historical: false },
          },
        },
      });
      const instructor = await database.assignment.findFirstOrThrow({
        where: {
          branchId: branch.id,
          type: 'INSTRUCTOR',
          activeFrom: { lte: new Date() },
          OR: [{ activeUntil: null }, { activeUntil: { gte: new Date() } }],
        },
        orderBy: [{ activeFrom: 'asc' }, { id: 'asc' }],
      });
      const startAt = new Date(Date.now() + 72 * 60 * 60_000);
      const endAt = new Date(startAt.getTime() + 50 * 60_000);
      const slot = await database.classSlot.upsert({
        where: { id: slotId },
        update: {
          branchId: branch.id,
          classTypeId: classType.id,
          studioId: studio.id,
          instructorUserId: instructor.userId,
          startAt,
          endAt,
          timezone: branch.timezone,
          minimumQuota: 1,
          capacity: 10,
          bookedCount: 0,
          status: 'CONFIRMED',
          cancellationReasonCode: null,
        },
        create: {
          id: slotId,
          branchId: branch.id,
          classTypeId: classType.id,
          studioId: studio.id,
          instructorUserId: instructor.userId,
          startAt,
          endAt,
          timezone: branch.timezone,
          minimumQuota: 1,
          capacity: 10,
          status: 'CONFIRMED',
        },
      });
      const targetStartAt = new Date(Date.now() + 73 * 60 * 60_000);
      const targetEndAt = new Date(targetStartAt.getTime() + 50 * 60_000);
      const targetSlot = await database.classSlot.upsert({
        where: { id: targetSlotId },
        update: {
          branchId: branch.id,
          classTypeId: classType.id,
          studioId: studio.id,
          instructorUserId: instructor.userId,
          startAt: targetStartAt,
          endAt: targetEndAt,
          timezone: branch.timezone,
          minimumQuota: 1,
          capacity: 10,
          bookedCount: 0,
          status: 'CONFIRMED',
          cancellationReasonCode: null,
        },
        create: {
          id: targetSlotId,
          branchId: branch.id,
          classTypeId: classType.id,
          studioId: studio.id,
          instructorUserId: instructor.userId,
          startAt: targetStartAt,
          endAt: targetEndAt,
          timezone: branch.timezone,
          minimumQuota: 1,
          capacity: 10,
          status: 'CONFIRMED',
        },
      });
      const checkInStartAt = new Date(Date.now() + 15 * 60_000);
      const checkInEndAt = new Date(checkInStartAt.getTime() + 50 * 60_000);
      const checkInSlot = await database.classSlot.upsert({
        where: { id: checkInSlotId },
        update: {
          branchId: branch.id,
          classTypeId: classType.id,
          studioId: studio.id,
          instructorUserId: instructor.userId,
          startAt: checkInStartAt,
          endAt: checkInEndAt,
          timezone: branch.timezone,
          minimumQuota: 1,
          capacity: 10,
          bookedCount: 0,
          status: 'CONFIRMED',
          cancellationReasonCode: null,
        },
        create: {
          id: checkInSlotId,
          branchId: branch.id,
          classTypeId: classType.id,
          studioId: studio.id,
          instructorUserId: instructor.userId,
          startAt: checkInStartAt,
          endAt: checkInEndAt,
          timezone: branch.timezone,
          minimumQuota: 1,
          capacity: 10,
          status: 'CONFIRMED',
        },
      });
      process.stdout.write(
        JSON.stringify({
          slotId: slot.id,
          targetSlotId: targetSlot.id,
          checkInSlotId: checkInSlot.id,
          branchId: branch.id,
          branchName: branch.name,
          classTypeId: classType.id,
          startAt: startAt.toISOString(),
          targetStartAt: targetStartAt.toISOString(),
          checkInStartAt: checkInStartAt.toISOString(),
        }),
      );
    }
  } finally {
    await database.$disconnect();
  }
}

void main();

import { PrismaClient, ClassSlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding authentic V1 upcoming class schedules across all branches...');

  const branches = await prisma.cabang.findMany({
    where: { active: true },
    include: {
      studios: {
        include: { rooms: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Fetch authentic instructors (COACH or INSTRUCTOR role)
  const instructors = await prisma.user.findMany({
    where: {
      role: { in: ['COACH', 'INSTRUCTOR'] },
      status: 'ACTIVE',
    },
    select: { id: true, displayName: true },
    orderBy: { displayName: 'asc' },
  });

  if (instructors.length === 0) {
    throw new Error('No active instructors found in database');
  }

  console.log(`Found ${instructors.length} instructors: ${instructors.map((i) => i.displayName).join(', ')}`);

  // Fetch the 4 authentic V1 class types
  const groupClass = await prisma.jenisKelas.findUnique({ where: { id: 'c1000000-0000-4000-8000-000000000001' } });
  const privateClass = await prisma.jenisKelas.findUnique({ where: { id: 'c1000000-0000-4000-8000-000000000002' } });
  const semiPrivate = await prisma.jenisKelas.findUnique({ where: { id: 'c1000000-0000-4000-8000-000000000003' } });
  const privateGroup = await prisma.jenisKelas.findUnique({ where: { id: 'c1000000-0000-4000-8000-000000000004' } });

  if (!groupClass || !privateClass || !semiPrivate || !privateGroup) {
    throw new Error('Authentic V1 class types missing in database');
  }

  const scheduleTemplate = [
    { hour: 8, minute: 0, classType: groupClass, capacity: groupClass.defaultCapacity || 5 },
    { hour: 10, minute: 0, classType: privateClass, capacity: privateClass.defaultCapacity || 1 },
    { hour: 15, minute: 0, classType: semiPrivate, capacity: semiPrivate.defaultCapacity || 2 },
    { hour: 17, minute: 30, classType: groupClass, capacity: groupClass.defaultCapacity || 5 },
    { hour: 19, minute: 0, classType: privateGroup, capacity: privateGroup.defaultCapacity || 5 },
  ];

  const now = new Date();
  let createdCount = 0;
  let instructorIdx = 0;

  for (const branch of branches) {
    const studio = branch.studios[0];
    const room = studio?.rooms[0];

    if (!studio || !room) {
      console.log(`Skipping branch ${branch.name} (no studio/room configured)`);
      continue;
    }

    // Schedule 5 classes per day for the next 14 days (days 1 to 14)
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      for (let i = 0; i < scheduleTemplate.length; i++) {
        const item = scheduleTemplate[i]!;
        const startAt = new Date(now);
        startAt.setDate(now.getDate() + dayOffset);
        startAt.setHours(item.hour, item.minute, 0, 0);

        const endAt = new Date(startAt);
        endAt.setMinutes(startAt.getMinutes() + 50);

        const coach = instructors[instructorIdx % instructors.length]!;
        instructorIdx++;

        // Deterministic UUID based on branch code, dayOffset, and time index
        const branchCodeClean = branch.code.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toLowerCase().padEnd(6, '0');
        const dayStr = String(dayOffset).padStart(2, '0');
        const idxStr = String(i).padStart(2, '0');
        const customId = `f1000000-${branchCodeClean}-4000-8000-0000${dayStr}${idxStr}01`;

        await prisma.slotKelas.upsert({
          where: { id: customId },
          update: {
            classTypeId: item.classType.id,
            instructorId: coach.id,
            startAt,
            endAt,
            status: ClassSlotStatus.PUBLISHED,
            capacity: item.capacity,
            bookedCount: 0,
          },
          create: {
            id: customId,
            branchId: branch.id,
            studioId: studio.id,
            roomId: room.id,
            classTypeId: item.classType.id,
            instructorId: coach.id,
            startAt,
            endAt,
            capacity: item.capacity,
            bookedCount: 0,
            status: ClassSlotStatus.PUBLISHED,
          },
        });
        createdCount++;
      }
    }
    console.log(`Populated authentic classes for ${branch.name} (${branch.code})`);
  }

  console.log(`Successfully generated ${createdCount} authentic class slots across all 5 branches!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

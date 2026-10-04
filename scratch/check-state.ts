import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat',
    },
  },
});

async function main() {
  const ggBranchId = 'a1000000-0000-4000-8000-000000000001';
  const slots = await prisma.slotKelas.findMany({
    where: { branchId: ggBranchId },
    include: { classType: true, instructor: true, studio: true },
    orderBy: { startAt: 'asc' },
  });
  console.log(`Found ${slots.length} slots in Green Garden:`);
  for (const s of slots) {
    console.log(`- ID: ${s.id} | ${s.classType.name} | Status: ${s.status} | Time: ${s.startAt.toISOString()} - ${s.endAt.toISOString()} | Capacity: ${s.bookedCount}/${s.capacity} | Studio: ${s.studio?.name} | Instructor: ${s.instructor?.name}`);
  }
}

main().finally(() => prisma.$disconnect());

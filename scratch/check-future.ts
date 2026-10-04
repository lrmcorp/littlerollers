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
  const now = new Date();
  const futureSlots = await prisma.slotKelas.findMany({
    where: {
      branchId: ggBranchId,
      startAt: { gte: now },
      classType: { name: 'Group Class' },
    },
    include: { classType: true, instructor: true, studio: true },
    orderBy: { startAt: 'asc' },
    take: 10,
  });
  console.log(`Found ${futureSlots.length} future Group Class slots in Green Garden:`);
  for (const s of futureSlots) {
    console.log(`- ID: ${s.id} | Status: ${s.status} | Start: ${s.startAt.toISOString()} | Capacity: ${s.bookedCount}/${s.capacity} | Studio: ${s.studio?.name} | Coach: ${s.instructor?.name}`);
  }
}

main().finally(() => prisma.$disconnect());

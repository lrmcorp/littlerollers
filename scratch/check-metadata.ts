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
  const studios = await prisma.studio.findMany({ where: { branchId: ggBranchId } });
  console.log('Studios:', JSON.stringify(studios, null, 2));

  const classTypes = await prisma.jenisKelas.findMany();
  console.log('Class Types:', JSON.stringify(classTypes.map(c => ({ id: c.id, name: c.name })), null, 2));

  const clara = await prisma.user.findFirst({
    where: { email: { contains: 'clara' } },
  });
  console.log('Clara User:', clara?.id, clara?.fullName, clara?.email);
}

main().finally(() => prisma.$disconnect());

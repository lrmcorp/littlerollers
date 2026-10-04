import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat',
    },
  },
});

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'jessica.uat@gmail.com' },
  });
  console.log('Jessica Role:', user?.role, 'Status:', user?.status);
}

main().finally(() => prisma.$disconnect());

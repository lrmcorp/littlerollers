import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const branchId='00000000-0000-4000-8000-000000000001';
  const userId='00000000-0000-4000-8000-000000000002';
  await prisma.branch.upsert({where:{code:'SYNTHETIC'},update:{},create:{id:branchId,code:'SYNTHETIC',name:'Synthetic Local Branch',timezone:'Asia/Jakarta'}});
  await prisma.user.upsert({where:{id:userId},update:{},create:{id:userId,displayName:'Synthetic Owner'}});
  const existing=await prisma.assignment.findFirst({where:{userId,branchId,type:'OWNER'}});
  if(!existing) await prisma.assignment.create({data:{id:'00000000-0000-4000-8000-000000000003',userId,branchId,type:'OWNER',activeFrom:new Date('2026-01-01T00:00:00Z')}});
}
main().finally(()=>prisma.$disconnect());

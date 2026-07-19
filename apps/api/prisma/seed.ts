import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { syntheticBootstrapIdentity } from '../src/identity/synthetic-bootstrap';

const prisma = new PrismaClient();
async function main() {
  const branchId = '00000000-0000-4000-8000-000000000001';
  const userId = '00000000-0000-4000-8000-000000000002';
  const assignmentId = '00000000-0000-4000-8000-000000000003';
  const superOwnerRoleId = '00000000-0000-4000-8000-000000000004';
  const financeRoleId = '00000000-0000-4000-8000-000000000005';
  const classTypeId = '00000000-0000-4000-8000-000000000006';
  await prisma.branch.upsert({
    where: { code: 'SYNTHETIC' },
    update: {},
    create: {
      id: branchId,
      code: 'SYNTHETIC',
      name: 'Synthetic Local Branch',
      timezone: 'Asia/Jakarta',
    },
  });
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, displayName: 'Synthetic Owner' },
  });
  await prisma.classType.upsert({
    where: { branchId_code: { branchId, code: 'PILATES' } },
    update: {},
    create: { id: classTypeId, branchId, code: 'PILATES', name: 'Synthetic Pilates' },
  });
  await prisma.$transaction(async (tx) => {
    const existing = await tx.assignment.findUnique({ where: { id: assignmentId } });
    if (!existing)
      await tx.assignment.create({
        data: {
          id: assignmentId,
          userId,
          branchId,
          type: 'OWNER',
          activeFrom: new Date('2026-01-01T00:00:00Z'),
        },
      });
    await tx.userRole.upsert({
      where: { sourceAssignmentId: assignmentId },
      update: {},
      create: {
        id: randomUUID(),
        userId,
        branchId,
        role: 'OWNER',
        activeFrom: new Date('2025-12-31T17:00:00Z'),
        sourceAssignmentId: assignmentId,
      },
    });
    const bootstrap = syntheticBootstrapIdentity(process.env);
    if (bootstrap) {
      await tx.identity.upsert({
        where: {
          provider_subjectHash: { provider: 'GOOGLE', subjectHash: bootstrap.subjectHash },
        },
        update: {},
        create: {
          id: randomUUID(),
          userId,
          provider: 'GOOGLE',
          subjectHash: bootstrap.subjectHash,
          verifiedAt: new Date(),
        },
      });
      await tx.userRole.upsert({
        where: { id: superOwnerRoleId },
        update: { role: 'SUPER_OWNER', branchId: null, activeUntil: null },
        create: {
          id: superOwnerRoleId,
          userId,
          role: 'SUPER_OWNER',
          branchId: null,
          activeFrom: new Date('2026-01-01T00:00:00Z'),
        },
      });
      await tx.userRole.upsert({
        where: { id: financeRoleId },
        update: { role: 'FINANCE', branchId: null, activeUntil: null },
        create: {
          id: financeRoleId,
          userId,
          role: 'FINANCE',
          branchId: null,
          activeFrom: new Date('2026-01-01T00:00:00Z'),
        },
      });
    }
  });
}
main().finally(() => prisma.$disconnect());

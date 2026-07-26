import type { ApplicationRole, AssignmentType } from '@prisma/client';
import { canonicalEmailHash, hashPassword } from '../../src/identity/credential-security';
import type { SeedContext } from './context';

interface DemoUser {
  key: string;
  name: string;
  email: string;
  role: ApplicationRole;
  branch?: string;
  password?: string;
  phoneE164?: string;
}

export const demoUsers = [
  {
    key: 'ralamzah-super-owner',
    name: 'Ralamzah Super Owner',
    email: 'ralamzah@gmail.com',
    role: 'SUPER_OWNER',
    password: 'ridho123',
  },
  { key: 'super-owner', name: 'Super Owner Daily Dose', email: 'owner@dailydose.local', role: 'SUPER_OWNER' as ApplicationRole },
  { key: 'owner-jkt', name: 'Owner Cabang Jakarta', email: 'branch.owner@dailydose.local', role: 'OWNER' as ApplicationRole, branch: 'DD-JKT' },
  { key: 'owner-bsd', name: 'Owner Cabang BSD', email: 'bsd.owner@dailydose.local', role: 'OWNER' as ApplicationRole, branch: 'DD-BSD' },
  { key: 'admin', name: 'Admin Cabang Jakarta', email: 'admin@dailydose.local', role: 'ADMIN' as ApplicationRole, branch: 'DD-JKT' },
  { key: 'manager', name: 'Manager Cabang Jakarta', email: 'manager@dailydose.local', role: 'MANAGER' as ApplicationRole, branch: 'DD-JKT' },
  { key: 'instructor', name: 'Instructor Daily Dose', email: 'instructor@dailydose.local', role: 'INSTRUCTOR' as ApplicationRole, branch: 'DD-JKT' },
  { key: 'finance', name: 'Finance Daily Dose', email: 'finance@dailydose.local', role: 'FINANCE' as ApplicationRole },
  { key: 'ops', name: 'Operations Daily Dose', email: 'ops@dailydose.local', role: 'OPS' as ApplicationRole },
  {
    key: 'customer',
    name: 'Customer Demo',
    email: 'customer@dailydose.local',
    role: 'CUSTOMER' as ApplicationRole,
    phoneE164: '+6281234567890',
  },
  {
    key: 'customer-no-phone',
    name: 'Customer Tanpa WhatsApp',
    email: 'customer.no.phone@dailydose.local',
    role: 'CUSTOMER' as ApplicationRole,
  },
] satisfies readonly DemoUser[];

export async function seedIdentities(ctx: SeedContext, branchIds: Record<string, string>) {
  const selected =
    ctx.profile === 'minimal'
      ? demoUsers.filter((item) =>
          ['ralamzah-super-owner', 'super-owner', 'owner-jkt', 'owner-bsd', 'instructor'].includes(
            item.key,
          ),
        )
      : demoUsers;
  const ids: Record<string, string> = {};
  for (const user of selected) {
    const userId = ctx.id('user', user.key); ids[user.key] = userId;
    await ctx.db.user.upsert({
      where: { id: userId },
      update: {
        displayName: user.name,
        phoneE164: user.phoneE164 ?? null,
        status: 'ACTIVE',
      },
      create: {
        id: userId,
        displayName: user.name,
        phoneE164: user.phoneE164,
        status: 'ACTIVE',
      },
    });
    const emailHash = canonicalEmailHash(user.email);
    await ctx.db.identity.upsert({ where: { provider_subjectHash: { provider: 'EMAIL_PASSWORD', subjectHash: emailHash } }, update: { userId }, create: { id: ctx.id('identity', user.key), userId, provider: 'EMAIL_PASSWORD', subjectHash: emailHash, verifiedAt: new Date('2026-01-01') } });
    const password =
      user.password ?? (user.key === 'customer' ? 'Customer#2026' : 'DailyDose#2026');
    const passwordHash = await hashPassword(password);
    await ctx.db.passwordCredential.upsert({ where: { emailHash }, update: { userId, passwordHash, verifiedAt: new Date('2026-01-01'), passwordChangedAt: new Date('2026-01-01') }, create: { id: ctx.id('password', user.key), userId, emailHash, passwordHash, verifiedAt: new Date('2026-01-01'), passwordChangedAt: new Date('2026-01-01') } });
    if (user.role !== 'OWNER' && user.role !== 'INSTRUCTOR') {
      const branchId = 'branch' in user && user.branch ? branchIds[user.branch] : null;
      await ctx.db.userRole.upsert({ where: { id: ctx.id('role', user.key) }, update: { userId, role: user.role, branchId, activeUntil: null }, create: { id: ctx.id('role', user.key), userId, role: user.role, branchId, activeFrom: new Date('2026-01-01') } });
    }
  }
  const assignments: { key: string; user: string; branch: string; type: AssignmentType; role: ApplicationRole }[] = [
    { key: 'owner-jkt', user: 'owner-jkt', branch: 'DD-JKT', type: 'OWNER', role: 'OWNER' },
    { key: 'owner-bsd', user: 'owner-bsd', branch: 'DD-BSD', type: 'OWNER', role: 'OWNER' },
    { key: 'instructor-jkt', user: 'instructor', branch: 'DD-JKT', type: 'INSTRUCTOR', role: 'INSTRUCTOR' },
    { key: 'instructor-bsd', user: 'instructor', branch: 'DD-BSD', type: 'INSTRUCTOR', role: 'INSTRUCTOR' },
  ];
  for (const item of assignments) {
    if (!ids[item.user]) continue;
    const assignmentId = ctx.id('assignment', item.key);
    await ctx.db.assignment.upsert({ where: { id: assignmentId }, update: { userId: ids[item.user], branchId: branchIds[item.branch]!, type: item.type, activeUntil: null }, create: { id: assignmentId, userId: ids[item.user]!, branchId: branchIds[item.branch]!, type: item.type, activeFrom: new Date('2026-01-01') } });
    await ctx.db.userRole.upsert({ where: { sourceAssignmentId: assignmentId }, update: { userId: ids[item.user], branchId: branchIds[item.branch], role: item.role, activeUntil: null }, create: { id: ctx.id('assignment-role', item.key), userId: ids[item.user]!, branchId: branchIds[item.branch]!, role: item.role, activeFrom: new Date('2026-01-01'), sourceAssignmentId: assignmentId } });
  }
  return ids;
}

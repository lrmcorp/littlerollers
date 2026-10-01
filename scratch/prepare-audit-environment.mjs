import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const prismaPkg = require('../apps/api/node_modules/@prisma/client');
const { PrismaClient } = prismaPkg;
const argon2 = require('../apps/api/node_modules/argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Menyiapkan kredensial akun uji resmi...');

  // Hash passwords
  const superOwnerHash = await argon2.hash('SuperOwner123!');
  const ownerHash = await argon2.hash('Owner123!');
  const managerHash = await argon2.hash('Manager123!');
  const financeHash = await argon2.hash('Finance123!');
  const adminHash = await argon2.hash('Admin123!');
  const instructorHash = await argon2.hash('Instructor123!');
  const customerHash = await argon2.hash('Customer123!');

  // 1. Super Owner
  await prisma.user.upsert({
    where: { email: 'superowner@dailydose.test' },
    update: { passwordHash: superOwnerHash, role: 'SUPER_OWNER', status: 'ACTIVE' },
    create: {
      email: 'superowner@dailydose.test',
      displayName: 'Super Owner',
      passwordHash: superOwnerHash,
      role: 'SUPER_OWNER',
      status: 'ACTIVE',
      phone: '+628111111101',
    },
  });

  // 2. Owner Green Garden
  const ggBranch = await prisma.cabang.findFirst({ where: { code: 'DD-GG' } });
  const mkBranch = await prisma.cabang.findFirst({ where: { code: 'DD-MK' } });

  const owner = await prisma.user.upsert({
    where: { email: 'owner.gg@dailydose.test' },
    update: { passwordHash: ownerHash, role: 'OWNER', status: 'ACTIVE', preferredBranchId: ggBranch?.id },
    create: {
      email: 'owner.gg@dailydose.test',
      displayName: 'Owner Green Garden',
      passwordHash: ownerHash,
      role: 'OWNER',
      status: 'ACTIVE',
      preferredBranchId: ggBranch?.id,
      phone: '+628111111102',
    },
  });

  if (ggBranch) {
    await prisma.ownerCabang.upsert({
      where: {
        ownerId_branchId: { ownerId: owner.id, branchId: ggBranch.id },
      },
      update: {},
      create: {
        ownerId: owner.id,
        branchId: ggBranch.id,
      },
    });
  }

  // 3. Manager Green Garden
  await prisma.user.upsert({
    where: { email: 'manager.gg@dailydose.test' },
    update: { passwordHash: managerHash, role: 'MANAGER', status: 'ACTIVE', preferredBranchId: ggBranch?.id },
    create: {
      email: 'manager.gg@dailydose.test',
      displayName: 'Manager Green Garden',
      passwordHash: managerHash,
      role: 'MANAGER',
      status: 'ACTIVE',
      preferredBranchId: ggBranch?.id,
      phone: '+628111111104',
    },
  });

  // 4. Finance
  await prisma.user.upsert({
    where: { email: 'finance@dailydose.test' },
    update: { passwordHash: financeHash, role: 'FINANCE', status: 'ACTIVE' },
    create: {
      email: 'finance@dailydose.test',
      displayName: 'Finance Corporate',
      passwordHash: financeHash,
      role: 'FINANCE',
      status: 'ACTIVE',
      phone: '+628111111105',
    },
  });

  // 5. Admin Muara Karang & Admin Green Garden
  await prisma.user.upsert({
    where: { email: 'adminmk@ddose.com' },
    update: { passwordHash: adminHash, role: 'ADMIN', status: 'ACTIVE', preferredBranchId: mkBranch?.id },
    create: {
      email: 'adminmk@ddose.com',
      displayName: 'Admin Muara Karang',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      preferredBranchId: mkBranch?.id,
      phone: '+6287862151824',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@ddose.com' },
    update: { passwordHash: adminHash, role: 'ADMIN', status: 'ACTIVE', preferredBranchId: ggBranch?.id },
    create: {
      email: 'admin@ddose.com',
      displayName: 'Admin Green Garden',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      preferredBranchId: ggBranch?.id,
      phone: '+6287862151825',
    },
  });

  // 6. Instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'coach.sarah@dailydose.test' },
    update: { passwordHash: instructorHash, role: 'INSTRUCTOR', status: 'ACTIVE', preferredBranchId: ggBranch?.id },
    create: {
      email: 'coach.sarah@dailydose.test',
      displayName: 'Sarah Jenkins',
      passwordHash: instructorHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      preferredBranchId: ggBranch?.id,
      phone: '+628111111106',
    },
  });

  await prisma.user.upsert({
    where: { email: 'instdevi@ddose.com' },
    update: { passwordHash: instructorHash, role: 'COACH', status: 'ACTIVE', preferredBranchId: ggBranch?.id },
    create: {
      email: 'instdevi@ddose.com',
      displayName: 'Devi',
      passwordHash: instructorHash,
      role: 'COACH',
      status: 'ACTIVE',
      preferredBranchId: ggBranch?.id,
      phone: '+6287825588055',
    },
  });

  if (ggBranch) {
    await prisma.penugasanInstruktur.upsert({
      where: { coachId_branchId: { coachId: instructor.id, branchId: ggBranch.id } },
      update: { active: true },
      create: { coachId: instructor.id, branchId: ggBranch.id, active: true },
    });
  }

  // 7. Active Customer Amanda
  const amanda = await prisma.user.upsert({
    where: { email: 'amanda.member@dailydose.test' },
    update: { passwordHash: customerHash, role: 'CUSTOMER', status: 'ACTIVE', stoppedAt: null },
    create: {
      email: 'amanda.member@dailydose.test',
      displayName: 'Amanda Member',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      phone: '+6281899990001',
    },
  });

  // Ensure Amanda has active package with 10 sessions
  let pkg = await prisma.paketPelanggan.findFirst({
    where: { userId: amanda.id, status: 'ACTIVE' },
  });
  if (!pkg) {
    const masterPkg = await prisma.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
    pkg = await prisma.paketPelanggan.create({
      data: {
        userId: amanda.id,
        packageId: masterPkg.id,
        totalSessions: 10,
        remainingSessions: 10,
        usedSessions: 0,
        validUntil: new Date(Date.now() + 30 * 86400000),
        status: 'ACTIVE',
      },
    });
  } else {
    await prisma.paketPelanggan.update({
      where: { id: pkg.id },
      data: { remainingSessions: 10, usedSessions: 0 },
    });
  }

  // 8. Stopped Customer Hendra
  await prisma.user.upsert({
    where: { email: 'hendra.stopped@dailydose.test' },
    update: {
      passwordHash: customerHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      stoppedAt: new Date('2026-08-01T00:00:00.000Z'),
    },
    create: {
      email: 'hendra.stopped@dailydose.test',
      displayName: 'Hendra Gunawan (Stopped)',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      stoppedAt: new Date('2026-08-01T00:00:00.000Z'),
      phone: '+6281899990003',
    },
  });

  // 9. Clean up Clara if exists to allow fresh registration test
  const existingClara = await prisma.user.findFirst({ where: { email: 'clara.new@dailydose.test' } });
  if (existingClara) {
    await prisma.profilPengguna.deleteMany({ where: { userId: existingClara.id } });
    await prisma.userSession.deleteMany({ where: { userId: existingClara.id } });
    await prisma.paketPelanggan.deleteMany({ where: { userId: existingClara.id } });
    await prisma.pembelian.deleteMany({ where: { userId: existingClara.id } });
    await prisma.pemesananKelas.deleteMany({ where: { userId: existingClara.id } });
    await prisma.user.delete({ where: { id: existingClara.id } });
    console.log('🧹 Clara lama dibersihkan untuk registrasi baru.');
  }

  console.log('✅ SEMUA AKUN UJI RESMI BERHASIL DISIAPKAN DENGAN PASSWORD OTENTIK!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal setup:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

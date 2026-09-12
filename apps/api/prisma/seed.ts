import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  const db = new PrismaClient();
  try {
    console.info('Seeding database with lean schema v2 data...');
    const defaultPasswordHash = await argon2.hash('ridho123');

    // 1. Superadmin User
    await db.user.upsert({
      where: { email: 'ralamzah@gmail.com' },
      update: { role: Role.SUPERADMIN, status: UserStatus.ACTIVE },
      create: {
        email: 'ralamzah@gmail.com',
        displayName: 'Ridho Alamzah',
        phone: '081234567890',
        passwordHash: defaultPasswordHash,
        role: Role.SUPERADMIN,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            fullName: 'Ridho Alamzah',
          },
        },
      },
    });

    // 2. Cabang Master Data
    const jkt = await db.cabang.upsert({
      where: { code: 'DD-JKT' },
      update: { active: true },
      create: {
        code: 'DD-JKT',
        name: 'Daily Dose Jakarta',
        address: 'Jl. Senopati No. 45, Jakarta Selatan',
        supportWhatsappE164: '+628111222333',
        active: true,
      },
    });

    const bsd = await db.cabang.upsert({
      where: { code: 'DD-BSD' },
      update: { active: true },
      create: {
        code: 'DD-BSD',
        name: 'Daily Dose BSD',
        address: 'Ruko Foresta 2, BSD City, Tangerang Selatan',
        supportWhatsappE164: '+628111222444',
        active: true,
      },
    });

    // 3. Studio & Ruangan
    await db.studio.upsert({
      where: { id: '00000000-0000-4000-8000-000000000010' },
      update: { active: true },
      create: {
        id: '00000000-0000-4000-8000-000000000010',
        branchId: jkt.id,
        code: 'ST-JKT-1',
        name: 'Studio Reformer Jakarta',
        active: true,
      },
    });

    await db.studio.upsert({
      where: { id: '00000000-0000-4000-8000-000000000020' },
      update: { active: true },
      create: {
        id: '00000000-0000-4000-8000-000000000020',
        branchId: bsd.id,
        code: 'ST-BSD-1',
        name: 'Studio Reformer BSD',
        active: true,
      },
    });

    // 4. Rekening Pembayaran
    const existingAccount = await db.rekeningPembayaran.findFirst({
      where: { accountNumber: '1234567890' },
    });
    if (!existingAccount) {
      await db.rekeningPembayaran.create({
        data: {
          bankName: 'BCA',
          accountNumber: '1234567890',
          accountHolder: 'PT DAILY DOSE PILATES',
          active: true,
        },
      });
    }

    console.info('Lean V2 Seed completed successfully.');
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed.');
  process.exitCode = 1;
});

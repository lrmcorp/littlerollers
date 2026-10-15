import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = !isApply;

  console.log(`[Pembersihan Akun Testing Dummy] Mode: ${isDryRun ? 'DRY RUN (Simulasi Tanpa Perubahan)' : 'APPLY (Mutasi Database Nyata)'}`);

  // Kriteria deteksi akun testing dummy sesuai laporan UAT 13 Okt 2026:
  // - Email @example.com
  // - Email dummy@...
  // - admin_test
  // - DisplayName '-' / 'admin_test' / 'Test'
  const dummyUsers = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { email: { in: ['dummy@example.com', 'admin_test', 'test@example.com'] } },
            { email: { endsWith: '@example.com' } },
            { email: { startsWith: 'dummy@' } },
            { email: { contains: 'admin_test' } },
            { displayName: { in: ['-', 'admin_test', 'Test'] } },
          ],
        },
        // Pastikan tidak menyentuh service account resmi bila ada
        {
          email: { notIn: ['superowner@dailydose.test', 'superadmin@dailydose.test'] },
        },
      ],
    },
    include: {
      instructedClassSlots: {
        where: {
          status: { in: ['DRAFT', 'PUBLISHED'] },
        },
        include: {
          bookings: {
            where: { status: { in: ['BOOKED', 'ATTENDED'] } },
          },
        },
      },
      instructorAssignments: true,
      _count: {
        select: {
          purchases: true,
          bookings: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nTerdeteksi ${dummyUsers.length} akun testing dummy:`);
  
  const reportItems = dummyUsers.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    role: u.role,
    status: u.status,
    totalPurchases: u._count.purchases,
    totalBookings: u._count.bookings,
    emptySlotsTaught: u.instructedClassSlots.filter((s) => s.bookings.length === 0).length,
    activeSlotsTaught: u.instructedClassSlots.filter((s) => s.bookings.length > 0).length,
    activeAssignments: u.instructorAssignments.filter((a) => a.active).length,
  }));

  for (const item of reportItems) {
    console.log(` - [${item.id}] "${item.displayName}" (${item.email || '-'}) Role: ${item.role}, Status: ${item.status}, Slot: ${item.emptySlotsTaught} kosong / ${item.activeSlotsTaught} ada murid`);
  }

  let deactivatedUsersCount = 0;
  let cancelledSlotsCount = 0;
  let deactivatedAssignmentsCount = 0;

  if (isApply && dummyUsers.length > 0) {
    const userIds = dummyUsers.map((u) => u.id);

    // 1. Nonaktifkan akun dummy
    const updateResult = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: {
        status: 'INACTIVE',
        stoppedAt: new Date(),
      },
    });
    deactivatedUsersCount = updateResult.count;

    // 2. Nonaktifkan penugasan instruktur dummy
    const assignmentResult = await prisma.penugasanInstruktur.updateMany({
      where: { instructorId: { in: userIds }, active: true },
      data: { active: false },
    });
    deactivatedAssignmentsCount = assignmentResult.count;

    // 3. Batalkan slot kosong yang diajar instruktur dummy
    for (const u of dummyUsers) {
      for (const slot of u.instructedClassSlots) {
        if (slot.bookings.length === 0) {
          await prisma.slotKelas.update({
            where: { id: slot.id },
            data: { status: 'CANCELLED' },
          });
          cancelledSlotsCount++;
        }
      }
    }

    console.log(`\n[APPLY SELESAI]:`);
    console.log(` - ${deactivatedUsersCount} akun berhasil dinonaktifkan (INACTIVE)`);
    console.log(` - ${deactivatedAssignmentsCount} penugasan instruktur dinonaktifkan`);
    console.log(` - ${cancelledSlotsCount} slot kelas kosong tanpa peserta dibatalkan`);
  }

  // Simpan bukti audit ke docs/uat/bukti/dummy_users_audit.json
  const auditReport = {
    executedAt: new Date().toISOString(),
    mode: isApply ? 'APPLY' : 'DRY_RUN',
    totalDummyUsersFound: dummyUsers.length,
    deactivatedUsersCount,
    deactivatedAssignmentsCount,
    cancelledSlotsCount,
    items: reportItems,
  };

  const outputDir = resolve(process.cwd(), 'docs/uat/bukti');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, 'dummy_users_audit.json');
  writeFileSync(outputPath, JSON.stringify(auditReport, null, 2), 'utf-8');
  console.log(`\nBukti audit tersimpan di: ${outputPath}`);
}

main()
  .catch((err) => {
    console.error('Eksekusi gagal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

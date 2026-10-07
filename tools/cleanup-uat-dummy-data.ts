import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== MEMULAI PEMBERSIHAN AKUN TESTING DUMMY UAT ===\n');

  // 1. Cari user testing dummy yang dilaporkan di UAT:
  // - Instruktur '-' (dummy@example.com)
  // - admin_test
  // - Customer 'Test'
  const dummyUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: ['dummy@example.com', 'admin_test', 'test@example.com'] } },
        { email: { startsWith: 'dummy@' } },
        { email: { contains: 'admin_test' } },
        { displayName: { in: ['-', 'admin_test', 'Test'] } },
      ],
    },
    include: {
      instructedClassSlots: {
        where: {
          status: { in: ['DRAFT', 'PUBLISHED'] },
        },
        include: {
          bookings: true,
        },
      },
    },
  });

  console.log(`Ditemukan ${dummyUsers.length} akun uji coba:`);
  for (const user of dummyUsers) {
    console.log(
      `- [${user.id}] ${user.displayName} (${user.email || 'tanpa email'}) - Role: ${user.role}, Status: ${user.status}`,
    );
  }

  // 2. Nonaktifkan akun uji coba
  if (dummyUsers.length > 0) {
    const userIds = dummyUsers.map((u) => u.id);
    const updated = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: {
        status: 'INACTIVE',
        stoppedAt: new Date(),
      },
    });
    console.log(`\nBerhasil menonaktifkan ${updated.count} akun pengguna.`);

    // 3. Batalkan / batalkan publikasi slot kelas kosong yang diajar oleh instruktur dummy
    for (const user of dummyUsers) {
      for (const slot of user.instructedClassSlots) {
        if (slot.bookings.length === 0) {
          await prisma.slotKelas.update({
            where: { id: slot.id },
            data: { status: 'CANCELLED' },
          });
          console.log(
            `  * Membatalkan slot kelas kosong ${slot.id} yang diajar oleh ${user.displayName}`,
          );
        } else {
          console.log(
            `  ! Slot kelas ${slot.id} memiliki ${slot.bookings.length} booking aktif, tidak dibatalkan otomatis.`,
          );
        }
      }
    }
  } else {
    console.log('Tidak ditemukan akun uji coba dengan kriteria tersebut.');
  }

  console.log('\n=== PEMBERSIHAN SELESAI ===');
}

main()
  .catch((err) => {
    console.error('Pembersihan gagal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

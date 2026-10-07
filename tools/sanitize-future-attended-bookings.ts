import { PrismaClient } from '../apps/api/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  console.log(`[Sanitasi] Mulai sanitasi booking masa depan per ${now.toISOString()}...`);

  const futureAttended = await prisma.pemesananKelas.findMany({
    where: {
      status: 'ATTENDED',
      classSlot: {
        startAt: { gt: now },
      },
    },
    include: {
      classSlot: { select: { id: true, startAt: true, branchId: true } },
      user: { select: { id: true, displayName: true } },
    },
  });

  console.log(`[Sanitasi] Ditemukan ${futureAttended.length} booking masa depan berstatus ATTENDED:`);

  for (const b of futureAttended) {
    console.log(
      ` - Booking ${b.bookingNumber} (${b.user.displayName}) kelas pada ${b.classSlot.startAt.toISOString()} -> reset ke BOOKED`,
    );

    // Hapus kehadiran prematur jika ada
    await prisma.kehadiranPelanggan.deleteMany({
      where: { bookingId: b.id },
    });

    // Reset status booking menjadi BOOKED
    await prisma.pemesananKelas.update({
      where: { id: b.id },
      data: { status: 'BOOKED' },
    });
  }

  console.log(`[Sanitasi] Berhasil menormalkan ${futureAttended.length} booking masa depan.`);
}

main()
  .catch((err) => {
    console.error('[Sanitasi] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

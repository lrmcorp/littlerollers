import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== MEMULAI PEMBERSIHAN TOTAL TIPE KELAS FIKTIF V2 ===\n');

  const fakeCodes = ['REFORMER', 'MAT', 'BARRE', 'REFORMER_PRIV'];

  // 1. Temukan ID tipe kelas fiktif
  const fakeClassTypes = await prisma.jenisKelas.findMany({
    where: { code: { in: fakeCodes } },
  });
  const fakeIds = fakeClassTypes.map((t) => t.id);
  console.log(`1. Tipe kelas fiktif yang akan dibersihkan (${fakeIds.length}):`, fakeClassTypes.map((t) => `${t.name} (${t.code})`));

  if (fakeIds.length === 0) {
    console.log('Tidak ada tipe kelas fiktif ditemukan. Database sudah bersih!');
    return;
  }

  // 2. Alihkan paket uji coba ke PRIVATE_CLASS jika ada yang mengacu ke fakeIds
  const remappedPackages = await prisma.paket.updateMany({
    where: { classTypeId: { in: fakeIds } },
    data: { classTypeId: 'c1000000-0000-4000-8000-000000000002' }, // PRIVATE_CLASS
  });
  console.log(`2. Paket yang dialihkan ke Private Class: ${remappedPackages.count}`);

  // 3. Hapus reservasi uji coba pada slot fiktif
  const fakeSlots = await prisma.slotKelas.findMany({
    where: { classTypeId: { in: fakeIds } },
    select: { id: true },
  });
  const fakeSlotIds = fakeSlots.map((s) => s.id);
  console.log(`3. Slot fiktif ditemukan: ${fakeSlotIds.length}`);

  if (fakeSlotIds.length > 0) {
    const deletedBookings = await prisma.pemesananKelas.deleteMany({
      where: { classSlotId: { in: fakeSlotIds } },
    });
    console.log(`   - Dihapus ${deletedBookings.count} pemesanan uji coba pada slot fiktif.`);

    const deletedSlots = await prisma.slotKelas.deleteMany({
      where: { id: { in: fakeSlotIds } },
    });
    console.log(`   - Dihapus ${deletedSlots.count} slot kelas fiktif.`);
  }

  // 4. Hapus relasi konfigurasi lainnya
  const deletedFees = await prisma.instructorFee.deleteMany({
    where: { classTypeId: { in: fakeIds } },
  });
  console.log(`4. Dihapus ${deletedFees.count} konfigurasi fee instruktur fiktif.`);

  const deletedQuotas = await prisma.minQuotaSetting.deleteMany({
    where: { classTypeId: { in: fakeIds } },
  });
  console.log(`   - Dihapus ${deletedQuotas.count} konfigurasi kuota minimum fiktif.`);

  const deletedProjections = await prisma.projectionRate.deleteMany({
    where: { classTypeId: { in: fakeIds } },
  });
  console.log(`   - Dihapus ${deletedProjections.count} konfigurasi rate proyeksi fiktif.`);

  // 5. Hapus 4 tipe kelas fiktif dari jenis_kelas
  const deletedTypes = await prisma.jenisKelas.deleteMany({
    where: { id: { in: fakeIds } },
  });
  console.log(`\n5. HASIL: Dihapus ${deletedTypes.count} tipe kelas fiktif dari tabel jenis_kelas!`);

  // 6. Verifikasi sisa tipe kelas di database
  const remaining = await prisma.jenisKelas.findMany({
    select: { id: true, code: true, name: true, active: true },
    orderBy: { name: 'asc' },
  });
  console.log('\n=== TIPE KELAS RESMI YANG TERSISA DI DATABASE: ===');
  for (const item of remaining) {
    console.log(` - ${item.name} (${item.code}) | Aktif: ${item.active}`);
  }
}

main()
  .catch((err) => {
    console.error('Pembersihan gagal:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

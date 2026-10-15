import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';
import * as path from 'node:path';
import * as fs from 'node:fs';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = !process.argv.includes('--apply');
  console.log(`=======================================================`);
  console.log(`[DATA REPAIR] Audit & Deduplikasi Booking Kembar (Poin 8)`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulasi / Audit saja)' : 'APPLY (Mutasi Data Aktif)'}`);
  console.log(`=======================================================\n`);

  // Cari seluruh kombinasi classSlotId + userId yang memiliki > 1 booking aktif
  const duplicateGroups = await prisma.$queryRaw<
    Array<{
      classSlotId: string;
      userId: string;
      cnt: bigint;
    }>
  >`
    SELECT classSlotId, userId, COUNT(id) AS cnt
    FROM pemesanan_kelas
    WHERE status IN ('BOOKED', 'ATTENDED')
    GROUP BY classSlotId, userId
    HAVING COUNT(id) > 1
    ORDER BY cnt DESC;
  `;

  console.log(`Ditemukan ${duplicateGroups.length} kelompok booking kembar aktif di database.\n`);

  const reportItems: any[] = [];

  for (const group of duplicateGroups) {
    const bookings = await prisma.pemesananKelas.findMany({
      where: {
        classSlotId: group.classSlotId,
        userId: group.userId,
        status: { in: ['BOOKED', 'ATTENDED'] },
      },
      include: {
        user: { select: { id: true, displayName: true, email: true, phone: true } },
        classSlot: {
          include: {
            branch: { select: { name: true } },
            classType: { select: { name: true } },
          },
        },
        customerPackage: {
          select: {
            id: true,
            remainingSessions: true,
            package: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (bookings.length < 2) continue;

    const primaryBooking = bookings[0]!;
    const redundantBookings = bookings.slice(1);

    const slotInfo = primaryBooking.classSlot;
    const wibStart = new Date(new Date(slotInfo.startAt).getTime() + 7 * 3600 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 16);

    reportItems.push({
      classSlotId: group.classSlotId,
      userId: group.userId,
      customerName: primaryBooking.user?.displayName,
      customerEmail: primaryBooking.user?.email,
      customerPhone: primaryBooking.user?.phone,
      branchName: slotInfo.branch.name,
      classTypeName: slotInfo.classType.name,
      scheduleWib: wibStart,
      totalDuplicates: bookings.length,
      primaryBookingNumber: primaryBooking.bookingNumber,
      primaryBookingStatus: primaryBooking.status,
      redundantBookings: redundantBookings.map((b) => ({
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
        customerPackageId: b.customerPackageId,
      })),
    });
  }

  // Tampilkan ringkasan temuan
  for (const item of reportItems) {
    console.log(`[MEMBER] ${item.customerName} (${item.customerPhone ?? item.customerEmail})`);
    console.log(`  Kelas    : ${item.branchName} · ${item.classTypeName} pada ${item.scheduleWib} WIB`);
    console.log(`  Duplikasi: ${item.totalDuplicates} booking aktif ditemukan`);
    console.log(`  Utama    : [${item.primaryBookingNumber}] (${item.primaryBookingStatus}) - DIPERTAHANKAN`);
    item.redundantBookings.forEach((r: any, idx: number) => {
      console.log(`    Duplikat ${idx + 1}: [${r.bookingNumber}] (${r.status}) dibuat ${r.createdAt} ==> [AKAN DIBATALKAN]`);
    });
    console.log('');
  }

  // Simpan log audit ke docs/uat/bukti
  const buktiDir = path.resolve(__dirname, '../../docs/uat/bukti');
  if (!fs.existsSync(buktiDir)) {
    fs.mkdirSync(buktiDir, { recursive: true });
  }

  const outputPath = path.join(buktiDir, 'duplicate_bookings_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(reportItems, null, 2), 'utf-8');
  console.log(`[AUDIT LOG] Laporan deduplikasi berhasil disimpan di: ${outputPath}`);

  if (isDryRun) {
    console.log(`\n[SELESAI DRY-RUN] Tidak ada data yang diubah di database.`);
    console.log(`Jalankan dengan flag '--apply' untuk membatalkan booking duplikat dan menyelaraskan kuota slot.`);
  } else {
    console.log(`\n[APPLY MODE] Membatalkan ${reportItems.reduce((acc, i) => acc + i.redundantBookings.length, 0)} booking duplikat...`);
    for (const item of reportItems) {
      for (const redundant of item.redundantBookings) {
        await prisma.pemesananKelas.update({
          where: { id: redundant.bookingId },
          data: {
            status: 'CANCELLED',
          },
        });
        console.log(`  Dibatalkan booking ${redundant.bookingNumber} (${redundant.bookingId})`);
      }

      // Hitung ulang sisa booking aktif pada slot dan perbarui slot.bookedCount
      const activeCount = await prisma.pemesananKelas.count({
        where: {
          classSlotId: item.classSlotId,
          status: 'BOOKED',
        },
      });

      await prisma.slotKelas.update({
        where: { id: item.classSlotId },
        data: { bookedCount: activeCount },
      });
      console.log(`  Slot ${item.classSlotId} bookedCount diperbarui ke: ${activeCount}`);
    }
    console.log(`\n[APPLY SELESAI] Seluruh booking duplikat berhasil dinonaktifkan.`);
  }
}

main()
  .catch((err) => {
    console.error('[ERROR]', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

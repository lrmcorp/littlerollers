import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';
import * as path from 'node:path';
import * as fs from 'node:fs';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = !process.argv.includes('--apply');
  console.log(`=======================================================`);
  console.log(`[DATA REPAIR] Audit & Remediasi Slot Overcapacity (Poin 2)`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulasi / Audit saja)' : 'APPLY (Mutasi Data Aktif)'}`);
  console.log(`=======================================================\n`);

  // Query langsung slot yang aktifitas bookingnya atau bookedCount-nya melebihi kapasitas
  const candidateSlots = await prisma.$queryRaw<
    Array<{
      id: string;
      startAt: Date;
      capacity: number;
      bookedCount: number;
      activeBookingsCount: bigint;
      branchName: string;
      roomName: string | null;
      capacityBed: number | null;
      classTypeName: string;
    }>
  >`
    SELECT 
      s.id, 
      s.startAt, 
      s.capacity, 
      s.bookedCount, 
      COUNT(b.id) AS activeBookingsCount,
      cb.name AS branchName,
      r.name AS roomName, 
      r.capacityBed AS capacityBed, 
      c.name AS classTypeName
    FROM slot_kelas s
    JOIN cabang cb ON s.branchId = cb.id
    JOIN jenis_kelas c ON s.classTypeId = c.id
    LEFT JOIN ruangan r ON s.roomId = r.id
    JOIN pemesanan_kelas b ON b.classSlotId = s.id AND b.status IN ('BOOKED', 'ATTENDED')
    GROUP BY s.id, s.startAt, s.capacity, s.bookedCount, cb.name, r.name, r.capacityBed, c.name
    HAVING COUNT(b.id) > s.capacity OR s.bookedCount > s.capacity
    ORDER BY s.startAt ASC;
  `;

  console.log(`Ditemukan ${candidateSlots.length} slot yang overcapacity / bookedCount melebihi kuota.\n`);

  const overcapacitySlots: any[] = [];

  for (const slot of candidateSlots) {
    const activeBookings = await prisma.pemesananKelas.findMany({
      where: {
        classSlotId: slot.id,
        status: { in: ['BOOKED', 'ATTENDED'] },
      },
      include: {
        user: { select: { id: true, displayName: true, email: true, phone: true } },
        customerPackage: { include: { package: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const activeBookingCount = activeBookings.length;
    const isExceedingCapacity = slot.bookedCount > slot.capacity || activeBookingCount > slot.capacity;
    const isExceedingPhysicalRoom = Boolean(
      slot.capacityBed && slot.capacityBed > 0 && slot.capacity > slot.capacityBed,
    );

    const wibStart = new Date(new Date(slot.startAt).getTime() + 7 * 3600 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 16);

    overcapacitySlots.push({
      slotId: slot.id,
      wibStart,
      branch: slot.branchName,
      classType: slot.classTypeName,
      room: slot.roomName ?? 'Tanpa Ruangan',
      roomCapacityBed: slot.capacityBed,
      slotCapacity: slot.capacity,
      bookedCountInSlot: slot.bookedCount,
      actualActiveBookings: activeBookingCount,
      isExceedingCapacity,
      isExceedingPhysicalRoom,
      activeBookings: activeBookings.map((b) => ({
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        source: b.source,
        customerName: b.user?.displayName,
        customerEmail: b.user?.email,
        customerPhone: b.user?.phone,
        packageName: b.customerPackage?.package?.name ?? 'Tanpa Paket',
        createdAt: b.createdAt.toISOString(),
      })),
    });
  }

  for (const item of overcapacitySlots) {
    console.log(`[SLOT] ${item.slotId}`);
    console.log(`  Jadwal   : ${item.wibStart} WIB | Cabang: ${item.branch} | Kelas: ${item.classType}`);
    console.log(`  Ruangan  : ${item.room} (Ranjang fisik: ${item.roomCapacityBed ?? '-'})`);
    console.log(`  Kapasitas: Slot=${item.slotCapacity} | bookedCount=${item.bookedCountInSlot} | Active=${item.actualActiveBookings}`);
    console.log(`  Masalah  : ${item.isExceedingPhysicalRoom ? '[KAPASITAS MELEBIHI RANJANG FISIK] ' : ''}${item.isExceedingCapacity ? '[BOOKING MELEBIHI KAPASITAS]' : ''}`);
    console.log(`  Daftar Peserta Aktif (${item.activeBookings.length}):`);
    item.activeBookings.forEach((b: any, idx: number) => {
      const limit = item.roomCapacityBed ?? item.slotCapacity;
      const isExcess = idx >= limit;
      console.log(`    ${idx + 1}. [${b.bookingNumber}] ${b.customerName} (${b.customerPhone ?? b.customerEmail}) - ${b.status} ${isExcess ? '==> [KELEBIHAN KUOTA]' : ''}`);
    });
    console.log('');
  }

  // Tulis laporan audit ke file
  const buktiDir = path.resolve(__dirname, '../../docs/arsip/uat/bukti');
  if (!fs.existsSync(buktiDir)) {
    fs.mkdirSync(buktiDir, { recursive: true });
  }

  const outputPath = path.join(buktiDir, 'overcapacity_audit.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      overcapacitySlots,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      2,
    ),
    'utf-8',
  );
  console.log(`[AUDIT LOG] Laporan audit berhasil disimpan di: ${outputPath}`);

  if (isDryRun) {
    console.log(`\n[SELESAI DRY-RUN] Tidak ada data yang diubah di database.`);
    console.log(`Rekomendasi Operasional:`);
    console.log(`1. Hubungi peserta pada daftar 'KELEBIHAN KUOTA' untuk pemindahan jadwal (reschedule).`);
    console.log(`2. Jalankan koreksi sinkronisasi bookedCount dengan flag '--apply' bila sinkronisasi dibutuhkan.`);
  } else {
    console.log(`\n[APPLY MODE] Memperbarui bookedCount slot agar sesuai dengan hitungan aktual booking aktif...`);
    for (const item of overcapacitySlots) {
      await prisma.slotKelas.update({
        where: { id: item.slotId },
        data: {
          bookedCount: item.actualActiveBookings,
        },
      });
      console.log(`  Updated slot ${item.slotId}: bookedCount disinkronkan ke ${item.actualActiveBookings}`);
    }
    console.log(`[APPLY SELESAI] Data slot berhasil disinkronkan.`);
  }
}

main()
  .catch((err) => {
    console.error('[ERROR]', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

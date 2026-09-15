import {
  PrismaClient,
  ClassSlotStatus,
  BookingStatus,
  CheckInMethod,
  CustomerPackageStatus,
} from '@prisma/client';
import * as fs from 'node:fs';

const prisma = new PrismaClient();
const v1SqlPath =
  '/Users/lrmcorporation/.gemini/antigravity-ide/brain/0c5035f9-29c3-48dc-a307-93774adbc341/scratch/dailydose_v1.sql';

function parseSqlRow(rowStr: string): string[] {
  const values: string[] = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (escape) {
      current += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === "'") {
      inString = !inString;
      continue;
    }
    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function extractAllTableRows(content: string, tableName: string): string[] {
  const marker = `INSERT INTO \`${tableName}\``;
  let pos = 0;
  const allRows: string[] = [];
  while (true) {
    const start = content.indexOf(marker, pos);
    if (start === -1) break;
    const end = content.indexOf(';\n', start);
    const sql = content.substring(start, end !== -1 ? end : start + 5000);
    const valuesPart = sql.substring(sql.indexOf('VALUES (') + 8, sql.lastIndexOf(')'));
    const rows = valuesPart.split(/\),\s*\(/);
    allRows.push(...rows);
    pos = end !== -1 ? end + 2 : start + marker.length;
  }
  return allRows;
}

function cleanStr(val: string | null | undefined): string {
  if (!val || val === 'NULL') return '';
  return val.replace(/^'|'$/g, '').trim();
}

function cleanNum(val: string | null | undefined, def = 0): number {
  if (!val || val === 'NULL') return def;
  const n = Number(val);
  return isNaN(n) ? def : n;
}

function parseDate(val: string | null | undefined): Date | null {
  if (!val || val === 'NULL') return null;
  const str = cleanStr(val);
  if (!str) return null;
  const d = new Date(str.replace(' ', 'T') + '+07:00');
  return isNaN(d.getTime()) ? null : d;
}

async function chunkInsert<T>(
  items: T[],
  chunkSize: number,
  insertFn: (chunk: T[]) => Promise<any>,
  label: string,
) {
  const total = items.length;
  let inserted = 0;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await insertFn(chunk);
    inserted += chunk.length;
    process.stdout.write(
      `\r   ... Ingesting ${label}: ${inserted}/${total} (${Math.round((inserted / total) * 100)}%)`,
    );
  }
  console.log(`\n   ✓ Selesai ingesting ${total} ${label}.`);
}

async function main() {
  console.log('================================================================================');
  console.log('🚀 EKSEKUSI TAHAP 4: JADWAL KELAS, RESERVASI BOOKING & PRESENSI (ZERO DUMMY)');
  console.log('================================================================================\n');

  if (!fs.existsSync(v1SqlPath)) {
    throw new Error(`File V1 SQL tidak ditemukan di ${v1SqlPath}`);
  }
  console.log('📖 [1/6] Membaca dump data V1 SQL...');
  const content = fs.readFileSync(v1SqlPath, 'utf8');

  // --------------------------------------------------------------------------
  // STEP 1: Pembersihan Slot Demo Awal
  // --------------------------------------------------------------------------
  console.log('🧹 [2/6] Membersihkan seluruh slot demo seed awal di v2_slot_kelas...');
  const deletedDemo = await prisma.slotKelas.deleteMany({
    where: { id: { startsWith: '00000000-' } },
  });
  console.log(`   ✓ Berhasil menghapus ${deletedDemo.count} slot demo awal.`);

  // --------------------------------------------------------------------------
  // STEP 2: Cache Master Data untuk Kecepatan Eksekusi
  // --------------------------------------------------------------------------
  console.log('\n🔍 [3/6] Memuat cache relasi master data (Studio, Cabang, Kelas, User, Paket)...');
  const studios = await prisma.studio.findMany({
    select: { id: true, branchId: true },
  });
  const studioBranchMap = new Map<string, string>();
  studios.forEach((s) => studioBranchMap.set(s.id, s.branchId));

  const defaultBranchId = 'a1000000-0000-4000-8000-000000000001'; // DD-GG
  const defaultStudioId = 'b1000000-0000-4000-8000-000000000001'; // Studio 1 GG
  const defaultClassTypeId = 'c1000000-0000-4000-8000-000000000001'; // Group Class

  const classTypeMap: Record<number, string> = {
    1: 'c1000000-0000-4000-8000-000000000001', // GROUP_CLASS
    2: 'c1000000-0000-4000-8000-000000000002', // PRIVATE_CLASS
    3: 'c1000000-0000-4000-8000-000000000003', // SEMI_PRIVATE
    4: 'c1000000-0000-4000-8000-000000000004', // PRIVATE_GROUP
    5: 'c1000000-0000-4000-8000-000000000005', // MEGAFORMER
  };

  const defaultCapacities: Record<number, number> = {
    1: 10,
    2: 1,
    3: 2,
    4: 5,
    5: 10,
  };

  // Muat customer packages per user untuk FIFO matching
  const allCustomerPackages = await prisma.paketPelanggan.findMany({
    select: { id: true, userId: true, validFrom: true, validUntil: true },
    orderBy: { validFrom: 'asc' },
  });
  const packagesByUser = new Map<string, typeof allCustomerPackages>();
  allCustomerPackages.forEach((cp) => {
    if (!packagesByUser.has(cp.userId)) packagesByUser.set(cp.userId, []);
    packagesByUser.get(cp.userId)!.push(cp);
  });

  // Siapkan paket komplementer untuk 6 user historis tanpa pesanan sebelumnya
  const usersNeedingDefaultCP = [
    '10000000-0000-4000-8000-000000001900',
    '10000000-0000-4000-8000-000000001903',
    '10000000-0000-4000-8000-000000001902',
    '10000000-0000-4000-8000-000000004128',
    '10000000-0000-4000-8000-000000007371',
    '10000000-0000-4000-8000-000000001247',
  ];

  for (const uId of usersNeedingDefaultCP) {
    const cpId = `50000000-0000-4000-9000-${uId.slice(-12)}`;
    await prisma.paketPelanggan.upsert({
      where: { id: cpId },
      create: {
        id: cpId,
        userId: uId,
        packageId: '20000000-0000-4000-8000-000000000001',
        totalSessions: 1,
        remainingSessions: 0,
        usedSessions: 1,
        validFrom: new Date('2023-08-01T00:00:00+07:00'),
        validUntil: new Date('2026-12-31T23:59:59+07:00'),
        status: CustomerPackageStatus.DEPLETED,
      },
      update: {},
    });
    packagesByUser.set(uId, [
      {
        id: cpId,
        userId: uId,
        validFrom: new Date('2023-08-01T00:00:00+07:00'),
        validUntil: new Date('2026-12-31T23:59:59+07:00'),
      },
    ]);
  }
  console.log(`   ✓ Cache siap: ${studios.length} studio, ${packagesByUser.size} pengguna berpaket.`);

  // --------------------------------------------------------------------------
  // STEP 3: Parsing booking_kelas untuk Menghitung Booked Count per Aktivitas
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [4/6] Menghitung agregasi peserta booking per jadwal kelas...');
  const rawBookings = extractAllTableRows(content, 'booking_kelas');
  console.log(`   ✓ Ditemukan ${rawBookings.length} rekaman booking pada V1.`);

  const bookedCountByActivity = new Map<number, number>();
  rawBookings.forEach((r) => {
    const p = parseSqlRow(r);
    // id, id_user, id_kelas_activity, is_send_email, status_kehadiran, created_at, updated_at, deleted_at
    const actId = cleanNum(p[2]);
    const deletedAt = p[7];
    if (deletedAt === 'NULL' || !deletedAt) {
      bookedCountByActivity.set(actId, (bookedCountByActivity.get(actId) || 0) + 1);
    }
  });

  // --------------------------------------------------------------------------
  // STEP 4: Menyiapkan dan Mengimpor SlotKelas (75.768 rekaman)
  // --------------------------------------------------------------------------
  console.log('\n📅 [5/6] Memproses 75.768 rekaman jadwal kelas (v2_slot_kelas)...');
  const rawActivities = extractAllTableRows(content, 'kelas_activities');
  console.log(`   ✓ Ditemukan ${rawActivities.length} rekaman jadwal kelas pada V1.`);

  const now = new Date('2026-09-14T23:00:00+07:00');
  const slotsToInsert: any[] = [];
  const slotEndAtMap = new Map<string, Date>();

  for (const r of rawActivities) {
    const p = parseSqlRow(r);
    // Columns:
    // 0: id
    // 1: id_kelas
    // 2: id_location_studio
    // 3: jam_mulai (e.g. 07:00:00)
    // 4: id_user (instructor)
    // 5: status
    // 6: created_at
    // 7: updated_at
    // 8: deleted_at
    // 9: nama_latihan
    // 10: level
    // 11: tanggal (e.g. 2024-05-15)
    // 12: user_update
    // 13: rating

    const actId = cleanNum(p[0]);
    const classIdNum = cleanNum(p[1]);
    const studioIdNum = cleanNum(p[2]);
    const jamMulai = cleanStr(p[3]) || '08:00:00';
    const coachIdNum = cleanNum(p[4]);
    const v1Status = cleanNum(p[5]);
    const createdAt = parseDate(p[6]) ?? new Date();
    const updatedAt = parseDate(p[7]) ?? createdAt;
    const deletedAt = parseDate(p[8]);
    const namaLatihan = cleanStr(p[9]);
    const tanggalStr = cleanStr(p[11]);

    const slotId = `70000000-0000-4000-8000-${String(actId).padStart(12, '0')}`;
    const studioUuid = `b1000000-0000-4000-8000-${String(studioIdNum === 0 ? 1 : studioIdNum).padStart(12, '0')}`;
    const studioId = studioBranchMap.has(studioUuid) ? studioUuid : defaultStudioId;
    const branchId = studioBranchMap.get(studioId) ?? defaultBranchId;

    const classTypeId = classTypeMap[classIdNum] ?? defaultClassTypeId;

    const instructorId =
      coachIdNum === 1
        ? '00000000-0000-4000-8000-000000000100'
        : `10000000-0000-4000-8000-${String(coachIdNum).padStart(12, '0')}`;

    // Parsing startAt dan endAt
    let startAt: Date;
    if (tanggalStr) {
      startAt = new Date(`${tanggalStr}T${jamMulai}+07:00`);
      if (isNaN(startAt.getTime())) {
        startAt = createdAt;
      }
    } else {
      startAt = createdAt;
    }
    const endAt = new Date(startAt.getTime() + 50 * 60 * 1000); // 50 menit
    slotEndAtMap.set(slotId, endAt);

    const bookedCount = bookedCountByActivity.get(actId) || 0;
    const defaultCap = defaultCapacities[classIdNum] ?? 10;
    const capacity = Math.max(bookedCount, defaultCap);

    let status: ClassSlotStatus = ClassSlotStatus.COMPLETED;
    if (deletedAt || v1Status === 4) {
      status = ClassSlotStatus.CANCELLED;
    } else if (startAt > now) {
      status = ClassSlotStatus.PUBLISHED;
    } else {
      status = ClassSlotStatus.COMPLETED;
    }

    slotsToInsert.push({
      id: slotId,
      branchId,
      studioId,
      classTypeId,
      instructorId,
      startAt,
      endAt,
      capacity,
      bookedCount,
      status,
      notes: namaLatihan ? `Nama Latihan: ${namaLatihan}` : null,
      createdAt,
      updatedAt,
    });
  }

  // Resolusi integritas aktivitas 381 yang terhapus permanen di V1 namun memiliki 2 booking
  slotsToInsert.push({
    id: '70000000-0000-4000-8000-000000000381',
    branchId: defaultBranchId,
    studioId: defaultStudioId,
    classTypeId: defaultClassTypeId,
    instructorId: '00000000-0000-4000-8000-000000000100',
    startAt: new Date('2023-08-18T16:00:00+07:00'),
    endAt: new Date('2023-08-18T16:50:00+07:00'),
    capacity: 10,
    bookedCount: 2,
    status: ClassSlotStatus.CANCELLED,
    notes: 'Jadwal Historis V1 #381 (Telah Dihapus di V1)',
    createdAt: new Date('2023-08-18T16:00:00+07:00'),
    updatedAt: new Date('2023-08-18T16:00:00+07:00'),
  });

  // Batch Ingest v2_slot_kelas
  console.log(`   -> Menyimpan ${slotsToInsert.length} rekaman ke v2_slot_kelas...`);
  await chunkInsert(
    slotsToInsert,
    2500,
    async (chunk) => {
      await prisma.slotKelas.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    },
    'SlotKelas',
  );

  // --------------------------------------------------------------------------
  // STEP 5: Menyiapkan dan Mengimpor PemesananKelas & KehadiranPelanggan
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [6/6] Memproses 132.488 rekaman reservasi booking & presensi kehadiran...');
  const bookingsToInsert: any[] = [];
  const attendancesToInsert: any[] = [];

  for (const r of rawBookings) {
    const p = parseSqlRow(r);
    // Columns:
    // 0: id
    // 1: id_user
    // 2: id_kelas_activity
    // 3: is_send_email
    // 4: status_kehadiran (1=hadir, 2=izin, null=belum/tidak)
    // 5: created_at
    // 6: updated_at
    // 7: deleted_at
    // 8: keterangan
    // 9: review
    // 10: rating

    const bookingIdNum = cleanNum(p[0]);
    const userIdNum = cleanNum(p[1]);
    const actIdNum = cleanNum(p[2]);
    const kehadiranStatus = cleanStr(p[4]);
    const createdAt = parseDate(p[5]) ?? new Date();
    const updatedAt = parseDate(p[6]) ?? createdAt;
    const deletedAt = parseDate(p[7]);
    const keterangan = cleanStr(p[8]);
    const review = cleanStr(p[9]);
    const rating = cleanStr(p[10]);

    const bookingId = `80000000-0000-4000-8000-${String(bookingIdNum).padStart(12, '0')}`;
    const bookingNumber = `BKG-V1-${String(bookingIdNum).padStart(8, '0')}`;
    const classSlotId = `70000000-0000-4000-8000-${String(actIdNum).padStart(12, '0')}`;
    const userId =
      userIdNum === 1
        ? '00000000-0000-4000-8000-000000000100'
        : `10000000-0000-4000-8000-${String(userIdNum).padStart(12, '0')}`;

    // FIFO Matching Paket Pelanggan
    const userPackages = packagesByUser.get(userId) || [];
    let customerPackageId = userPackages[0]?.id;
    if (userPackages.length > 1) {
      // Cari paket yang valid saat booking dibuat
      const match = userPackages.find(
        (cp) => cp.validFrom <= createdAt && cp.validUntil >= createdAt,
      );
      if (match) {
        customerPackageId = match.id;
      }
    }

    let bookingStatus: BookingStatus = BookingStatus.BOOKED;
    if (kehadiranStatus === '1') {
      bookingStatus = BookingStatus.ATTENDED;
    } else if (deletedAt) {
      bookingStatus = BookingStatus.CANCELLED;
    } else {
      const slotEnd = slotEndAtMap.get(classSlotId);
      if (slotEnd && slotEnd < now) {
        bookingStatus = BookingStatus.NO_SHOW;
      } else {
        bookingStatus = BookingStatus.BOOKED;
      }
    }

    bookingsToInsert.push({
      id: bookingId,
      bookingNumber,
      classSlotId,
      userId,
      customerPackageId,
      status: bookingStatus,
      bookedAt: createdAt,
      cancelledAt: deletedAt,
      cancellationReason: deletedAt ? (keterangan || 'Dibatalkan di V1') : null,
      createdAt,
      updatedAt,
    });

    // Buat rekaman kehadiran jika hadir
    if (kehadiranStatus === '1') {
      const attendanceId = `90000000-0000-4000-8000-${String(bookingIdNum).padStart(12, '0')}`;
      let notesParts: string[] = [];
      if (keterangan) notesParts.push(`Keterangan: ${keterangan}`);
      if (review) notesParts.push(`Review: ${review}`);
      if (rating) notesParts.push(`Rating: ${rating}/5`);

      attendancesToInsert.push({
        id: attendanceId,
        bookingId,
        method: CheckInMethod.MANUAL_FRONTDESK,
        checkedInAt: createdAt,
        notes: notesParts.length > 0 ? notesParts.join(' | ') : null,
      });
    }
  }

  // Batch Ingest v2_pemesanan_kelas
  console.log(`   -> Menyimpan ${bookingsToInsert.length} rekaman ke v2_pemesanan_kelas...`);
  await chunkInsert(
    bookingsToInsert,
    2500,
    async (chunk) => {
      await prisma.pemesananKelas.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    },
    'PemesananKelas',
  );

  // Batch Ingest v2_kehadiran_pelanggan
  console.log(`   -> Menyimpan ${attendancesToInsert.length} rekaman ke v2_kehadiran_pelanggan...`);
  await chunkInsert(
    attendancesToInsert,
    2500,
    async (chunk) => {
      await prisma.kehadiranPelanggan.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    },
    'KehadiranPelanggan',
  );

  // --------------------------------------------------------------------------
  // REKAPITULASI KONTROL TOTAL TAHAP 4
  // --------------------------------------------------------------------------
  const finalSlotCount = await prisma.slotKelas.count();
  const finalBookingCount = await prisma.pemesananKelas.count();
  const finalAttendanceCount = await prisma.kehadiranPelanggan.count();

  console.log('\n================================================================================');
  console.log('📊 REKAPITULASI KONTROL TOTAL TAHAP 4');
  console.log('================================================================================');
  console.log(`Total Slot Jadwal Kelas (v2_slot_kelas)       : ${finalSlotCount} (Target: 75.768)`);
  console.log(`Total Pemesanan Booking (v2_pemesanan_kelas)  : ${finalBookingCount} (Target: 132.488)`);
  console.log(`Total Presensi Kehadiran (v2_kehadiran_pelanggan): ${finalAttendanceCount} (Target: 103.801)`);
  console.log('================================================================================\n');
}

main()
  .catch((err) => {
    console.error('❌ Terjadi kesalahan fatal pada migrasi Tahap 4:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

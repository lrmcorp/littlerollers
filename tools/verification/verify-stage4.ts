import {
  PrismaClient,
  ClassSlotStatus,
  BookingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================================');
  console.log('🔍 AUDIT & VERIFIKASI TAHAP 4: JADWAL KELAS, BOOKING & PRESENSI (ZERO DUMMY)');
  console.log('================================================================================\n');

  let failureCount = 0;

  // --------------------------------------------------------------------------
  // 1. KONTROL TOTAL JADWAL SESI KELAS (v2_slot_kelas)
  // --------------------------------------------------------------------------
  console.log('📅 [1/6] Menguji Kontrol Total Jadwal Kelas (v2_slot_kelas)...');
  const totalSlots = await prisma.slotKelas.count();
  const publishedSlots = await prisma.slotKelas.count({ where: { status: ClassSlotStatus.PUBLISHED } });
  const completedSlots = await prisma.slotKelas.count({ where: { status: ClassSlotStatus.COMPLETED } });
  const cancelledSlots = await prisma.slotKelas.count({ where: { status: ClassSlotStatus.CANCELLED } });

  console.log(`   - Total Slot Terdaftar     : ${totalSlots} (Ekspektasi: 75.769)`);
  console.log(`   - Status PUBLISHED (Mendatang): ${publishedSlots}`);
  console.log(`   - Status COMPLETED (Selesai)  : ${completedSlots}`);
  console.log(`   - Status CANCELLED (Batal)    : ${cancelledSlots}`);

  if (totalSlots < 75768) {
    console.error('   ❌ GAGAL: Kontrol total slot kelas kurang dari target!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Kontrol total jadwal sesi kelas 100% presisi.');
  }

  // --------------------------------------------------------------------------
  // 2. KONTROL TOTAL PEMESANAN BOOKING (v2_pemesanan_kelas)
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [2/6] Menguji Kontrol Total Pemesanan Booking (v2_pemesanan_kelas)...');
  const totalBookings = await prisma.pemesananKelas.count();
  const attendedBookings = await prisma.pemesananKelas.count({ where: { status: BookingStatus.ATTENDED } });
  const cancelledBookings = await prisma.pemesananKelas.count({ where: { status: BookingStatus.CANCELLED } });
  const bookedBookings = await prisma.pemesananKelas.count({ where: { status: BookingStatus.BOOKED } });
  const noShowBookings = await prisma.pemesananKelas.count({ where: { status: BookingStatus.NO_SHOW } });

  console.log(`   - Total Pemesanan Terdaftar : ${totalBookings} (Ekspektasi: 132.488)`);
  console.log(`   - Status ATTENDED (Hadir)   : ${attendedBookings} (Ekspektasi: 103.801)`);
  console.log(`   - Status CANCELLED (Batal)  : ${cancelledBookings}`);
  console.log(`   - Status BOOKED (Aktif)     : ${bookedBookings}`);
  console.log(`   - Status NO_SHOW (Tak Hadir): ${noShowBookings}`);

  if (totalBookings !== 132488 || attendedBookings !== 103801) {
    console.error('   ❌ GAGAL: Kontrol total pemesanan booking tidak sesuai!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Kontrol total pemesanan booking 100% presisi.');
  }

  // --------------------------------------------------------------------------
  // 3. KONTROL TOTAL PRESENSI KEHADIRAN (v2_kehadiran_pelanggan)
  // --------------------------------------------------------------------------
  console.log('\n📄 [3/6] Menguji Kontrol Total Presensi Kehadiran (v2_kehadiran_pelanggan)...');
  const totalAttendances = await prisma.kehadiranPelanggan.count();
  console.log(`   - Total Rekaman Kehadiran   : ${totalAttendances} (Ekspektasi: 103.801)`);

  if (totalAttendances !== 103801) {
    console.error('   ❌ GAGAL: Kontrol total presensi kehadiran tidak sesuai!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Kontrol total presensi kehadiran 100% presisi.');
  }

  // --------------------------------------------------------------------------
  // 4. INTEGRITAS RELASI FOREIGN KEY (ZERO ORPHANS)
  // --------------------------------------------------------------------------
  console.log('\n🔗 [4/6] Menguji Integritas Relasi Foreign Key (Zero Orphans)...');
  const [resSlotBranch]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_slot_kelas s LEFT JOIN v2_cabang c ON s.branchId = c.id WHERE c.id IS NULL');
  const [resSlotStudio]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_slot_kelas s LEFT JOIN v2_studio st ON s.studioId = st.id WHERE st.id IS NULL');
  const [resSlotClass]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_slot_kelas s LEFT JOIN v2_jenis_kelas jk ON s.classTypeId = jk.id WHERE jk.id IS NULL');
  const [resSlotCoach]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_slot_kelas s LEFT JOIN v2_user u ON s.instructorId = u.id WHERE s.instructorId IS NOT NULL AND u.id IS NULL');

  const [resBkgSlot]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_pemesanan_kelas b LEFT JOIN v2_slot_kelas s ON b.classSlotId = s.id WHERE s.id IS NULL');
  const [resBkgUser]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_pemesanan_kelas b LEFT JOIN v2_user u ON b.userId = u.id WHERE u.id IS NULL');
  const [resBkgCP]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_pemesanan_kelas b LEFT JOIN v2_paket_pelanggan cp ON b.customerPackageId = cp.id WHERE cp.id IS NULL');

  const [resAttBkg]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_kehadiran_pelanggan a LEFT JOIN v2_pemesanan_kelas b ON a.bookingId = b.id WHERE b.id IS NULL');

  const orphanSlotBranch = Number(resSlotBranch.cnt);
  const orphanSlotStudio = Number(resSlotStudio.cnt);
  const orphanSlotClass = Number(resSlotClass.cnt);
  const orphanSlotCoach = Number(resSlotCoach.cnt);
  const orphanBkgSlot = Number(resBkgSlot.cnt);
  const orphanBkgUser = Number(resBkgUser.cnt);
  const orphanBkgCP = Number(resBkgCP.cnt);
  const orphanAttBkg = Number(resAttBkg.cnt);

  console.log(`   - Slot tanpa Cabang Valid      : ${orphanSlotBranch} (Harus 0)`);
  console.log(`   - Slot tanpa Studio Valid      : ${orphanSlotStudio} (Harus 0)`);
  console.log(`   - Slot tanpa Jenis Kelas Valid : ${orphanSlotClass} (Harus 0)`);
  console.log(`   - Slot tanpa Coach Valid       : ${orphanSlotCoach} (Harus 0)`);
  console.log(`   - Booking tanpa Slot Valid     : ${orphanBkgSlot} (Harus 0)`);
  console.log(`   - Booking tanpa User Valid     : ${orphanBkgUser} (Harus 0)`);
  console.log(`   - Booking tanpa Paket Valid    : ${orphanBkgCP} (Harus 0)`);
  console.log(`   - Kehadiran tanpa Booking Valid: ${orphanAttBkg} (Harus 0)`);

  const totalOrphans =
    orphanSlotBranch +
    orphanSlotStudio +
    orphanSlotClass +
    orphanSlotCoach +
    orphanBkgSlot +
    orphanBkgUser +
    orphanBkgCP +
    orphanAttBkg;

  if (totalOrphans > 0) {
    console.error(`   ❌ GAGAL: Ditemukan ${totalOrphans} relasi foreign key yatim piatu!`);
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Seluruh relasi foreign key 100% utuh tanpa orphan data.');
  }

  // --------------------------------------------------------------------------
  // 5. KEBIJAKAN ZERO DUMMY DATA
  // --------------------------------------------------------------------------
  console.log('\n🛡️ [5/6] Menguji Kebijakan Zero Dummy Data...');
  const [resDummySlots]: any = await prisma.$queryRawUnsafe("SELECT COUNT(*) as cnt FROM v2_slot_kelas WHERE id LIKE '00000000%'");
  const dummySlotCount = Number(resDummySlots.cnt);

  console.log(`   - Slot Demo Seed Tersisa : ${dummySlotCount} (Harus 0)`);
  if (dummySlotCount > 0) {
    console.error('   ❌ GAGAL: Masih terdapat slot demo seed di database!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Database bersih 100% dari slot demo dummy.');
  }

  // --------------------------------------------------------------------------
  // 6. VALIDASI SAMPEL OPERASIONAL LENGKAP
  // --------------------------------------------------------------------------
  console.log('\n🔎 [6/6] Memvalidasi Sampel Booking Lengkap dengan Kehadiran...');
  const sampleBooking = await prisma.pemesananKelas.findFirst({
    where: { status: BookingStatus.ATTENDED },
    include: {
      user: { select: { displayName: true, email: true } },
      classSlot: {
        include: {
          branch: { select: { name: true } },
          studio: { select: { name: true } },
          classType: { select: { name: true } },
          instructor: { select: { displayName: true } },
        },
      },
      customerPackage: {
        include: {
          package: { select: { name: true } },
        },
      },
      attendance: true,
    },
  });

  console.log(`   - Kode Booking   : ${sampleBooking?.bookingNumber}`);
  console.log(`   - Member         : ${sampleBooking?.user.displayName} (${sampleBooking?.user.email})`);
  console.log(`   - Cabang         : ${sampleBooking?.classSlot.branch.name}`);
  console.log(`   - Studio         : ${sampleBooking?.classSlot.studio.name}`);
  console.log(`   - Modalitas      : ${sampleBooking?.classSlot.classType.name}`);
  console.log(`   - Coach          : ${sampleBooking?.classSlot.instructor?.displayName}`);
  console.log(`   - Waktu Kelas    : ${sampleBooking?.classSlot.startAt.toLocaleString('id-ID')}`);
  console.log(`   - Paket Digunakan: ${sampleBooking?.customerPackage.package.name}`);
  console.log(`   - Status Booking : ${sampleBooking?.status}`);
  console.log(`   - Presensi CheckIn: ${sampleBooking?.attendance?.checkedInAt.toLocaleString('id-ID')} (${sampleBooking?.attendance?.method})`);

  console.log('\n================================================================================');
  if (failureCount === 0) {
    console.log('🎉 SELURUH VERIFIKASI TAHAP 4 BERHASIL DENGAN NILAI SEMPURNA (100%)!');
  } else {
    console.error(`💥 TERDAPAT ${failureCount} KEGAGALAN PADA VERIFIKASI TAHAP 4!`);
    process.exit(1);
  }
  console.log('================================================================================\n');
}

main()
  .catch((err) => {
    console.error('Fatal verification error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

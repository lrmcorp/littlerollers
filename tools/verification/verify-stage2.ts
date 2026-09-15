import { PrismaClient, PackageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('🔍 VERIFIKASI TAHAP 2: MASTER PAKET & VOUCHER (ZERO DUMMY DATA)');
  console.log('================================================================');

  let failureCount = 0;

  // 1. Verifikasi Jumlah Paket
  const totalPackages = await prisma.paket.count();
  const activePackages = await prisma.paket.count({ where: { status: PackageStatus.ACTIVE } });
  const archivedPackages = await prisma.paket.count({ where: { status: PackageStatus.ARCHIVED } });
  console.log(`\n📦 [1] Verifikasi Paket:`);
  console.log(`   - Total Paket       : ${totalPackages} (Harus 126)`);
  console.log(`   - Paket Aktif       : ${activePackages}`);
  console.log(`   - Paket Arsip/Hapus : ${archivedPackages}`);
  if (totalPackages !== 126) {
    console.error(`   ❌ GAGAL: Total paket (${totalPackages}) tidak sesuai target (126)!`);
    failureCount++;
  } else {
    console.log(`   ✅ LULUS: Total paket tepat 126.`);
  }

  // 2. Verifikasi Relasi Foreign Key Paket -> JenisKelas
  const orphanPackages = await prisma.paket.count({
    where: { classType: { is: null } },
  });
  console.log(`\n🔗 [2] Verifikasi Relasi Jenis Kelas:`);
  console.log(`   - Paket Tanpa Jenis Kelas (Orphan) : ${orphanPackages} (Harus 0)`);
  if (orphanPackages > 0) {
    console.error(`   ❌ GAGAL: Ditemukan ${orphanPackages} paket yatim piatu tanpa jenis kelas!`);
    failureCount++;
  } else {
    console.log(`   ✅ LULUS: Seluruh paket terhubung 100% ke JenisKelas.`);
  }

  // 3. Verifikasi Jumlah Voucher
  const totalVouchers = await prisma.voucher.count();
  const percentVouchers = await prisma.voucher.count({ where: { discountType: 'PERCENTAGE' } });
  const nominalVouchers = await prisma.voucher.count({ where: { discountType: 'NOMINAL' } });
  const activeVouchers = await prisma.voucher.count({ where: { active: true } });
  const inactiveVouchers = await prisma.voucher.count({ where: { active: false } });
  console.log(`\n🎟️ [3] Verifikasi Voucher:`);
  console.log(`   - Total Voucher     : ${totalVouchers} (Harus 312)`);
  console.log(`   - Tipe Persentase   : ${percentVouchers} (Harus 290)`);
  console.log(`   - Tipe Nominal      : ${nominalVouchers} (Harus 22)`);
  console.log(`   - Voucher Aktif     : ${activeVouchers}`);
  console.log(`   - Voucher Nonaktif  : ${inactiveVouchers}`);
  if (totalVouchers !== 312 || percentVouchers !== 290 || nominalVouchers !== 22) {
    console.error(`   ❌ GAGAL: Distribusi voucher tidak cocok!`);
    failureCount++;
  } else {
    console.log(`   ✅ LULUS: Distribusi voucher tepat 312 (290 persentase + 22 nominal).`);
  }

  // 4. Verifikasi Keunikan & Riwayat Penggunaan Voucher
  const topUsedVouchers = await prisma.voucher.findMany({
    where: { usedCount: { gt: 0 } },
    orderBy: { usedCount: 'desc' },
    take: 5,
    select: { id: true, code: true, name: true, discountType: true, discountValue: true, usedCount: true },
  });
  console.log(`\n📊 [4] 5 Voucher Terbanyak Digunakan (dari V1 voucher_customers):`);
  topUsedVouchers.forEach((v, i) => {
    console.log(`   ${i + 1}. [${v.code}] ${v.name}: ${v.usedCount}x pakai (${v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `Rp${v.discountValue.toLocaleString('id-ID')}`})`);
  });

  // Pastikan voucher ID 33 memiliki 1747 kali pemakaian sesuai kalkulasi V1
  const voucher33 = await prisma.voucher.findUnique({
    where: { id: '30000000-0000-4000-8000-000000000033' },
  });
  if (voucher33?.usedCount === 1747) {
    console.log(`   ✅ LULUS: Riwayat pemakaian voucher 33 presisi 1.747 transaksi.`);
  } else {
    console.error(`   ❌ GAGAL: usedCount voucher 33 tidak cocok (${voucher33?.usedCount} vs 1747)!`);
    failureCount++;
  }

  // 5. Verifikasi Zero Dummy Data
  const dummyPackageCodes = ['MAT-8', 'REFORMER-10', 'BARRE-8', 'REFORMER-5'];
  const dummyVoucherCodes = ['BSDPILATES', 'MATCLASS', 'HEMAT100', 'WELCOME10'];

  const foundDummyPackages = await prisma.paket.count({
    where: { code: { in: dummyPackageCodes } },
  });
  const foundDummyVouchers = await prisma.voucher.count({
    where: { code: { in: dummyVoucherCodes } },
  });

  console.log(`\n🛡️ [5] Verifikasi Kebersihan Data (Zero Dummy Policy):`);
  console.log(`   - Paket Dummy Tertinggal   : ${foundDummyPackages} (Harus 0)`);
  console.log(`   - Voucher Dummy Tertinggal : ${foundDummyVouchers} (Harus 0)`);
  if (foundDummyPackages > 0 || foundDummyVouchers > 0) {
    console.error(`   ❌ GAGAL: Masih ditemukan data dummy di basis data!`);
    failureCount++;
  } else {
    console.log(`   ✅ LULUS: Basis data 100% bersih dari paket dan voucher dummy.`);
  }

  // 6. Verifikasi Sample Data
  const samplePackage = await prisma.paket.findFirst({
    where: { code: 'PK-V1-1' },
    include: { classType: true },
  });
  console.log(`\n🔎 [6] Sampel Paket Otentik (PK-V1-1):`);
  console.log(`   - Nama         : ${samplePackage?.name}`);
  console.log(`   - Sesi         : ${samplePackage?.sessionCount}`);
  console.log(`   - Masa Berlaku : ${samplePackage?.validityDays} hari`);
  console.log(`   - Harga        : Rp${samplePackage?.priceRp.toLocaleString('id-ID')}`);
  console.log(`   - Jenis Kelas  : ${samplePackage?.classType?.name} (${samplePackage?.classType?.modality})`);
  console.log(`   - Keterangan   : ${samplePackage?.description}`);

  console.log('\n================================================================');
  if (failureCount === 0) {
    console.log('🎉 SELURUH VERIFIKASI TAHAP 2 BERHASIL DENGAN NILAI SEMPURNA (100%)!');
  } else {
    console.error(`💥 TERDAPAT ${failureCount} KEGAGALAN PADA VERIFIKASI TAHAP 2!`);
    process.exit(1);
  }
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error verifikasi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

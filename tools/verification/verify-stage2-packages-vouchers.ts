import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('🔍 AUDIT & VERIFIKASI TAHAP 2: MASTER PAKET & VOUCHER (V1 -> V2)');
  console.log('================================================================\n');

  let hasError = false;

  // 1. Audit Master Paket
  const totalPaket = await prisma.paket.count();
  console.log(`📦 [1/6] Total Master Paket di paket: ${totalPaket}`);
  if (totalPaket !== 126) {
    console.error(`   ❌ ERROR: Diharapkan 126 paket otentik, ditemukan ${totalPaket}`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: Tepat 126 paket otentik terverifikasi.`);
  }

  // 2. Audit Master Voucher
  const totalVoucher = await prisma.voucher.count();
  console.log(`\n🎟️ [2/6] Total Master Voucher di voucher: ${totalVoucher}`);
  if (totalVoucher !== 312) {
    console.error(`   ❌ ERROR: Diharapkan 312 voucher otentik, ditemukan ${totalVoucher}`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: Tepat 312 voucher otentik terverifikasi.`);
  }

  // 3. Audit Zero Dummy Data
  console.log(`\n🧹 [3/6] Audit Zero Dummy Data...`);
  const dummyPackages = await prisma.paket.findMany({
    where: {
      code: { in: ['MAT-8', 'REFORMER-10', 'BARRE-8', 'REFORMER-5', 'PK-REF-10'] },
    },
  });
  if (dummyPackages.length > 0) {
    console.error(`   ❌ ERROR: Ditemukan ${dummyPackages.length} paket dummy!`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: 0 paket dummy tersisa di tabel paket.`);
  }

  const dummyVouchers = await prisma.voucher.findMany({
    where: {
      code: { in: ['BSDPILATES', 'MATCLASS', 'HEMAT100', 'WELCOME10'] },
    },
  });
  if (dummyVouchers.length > 0) {
    console.error(`   ❌ ERROR: Ditemukan ${dummyVouchers.length} voucher dummy!`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: 0 voucher dummy tersisa di tabel voucher.`);
  }

  // 4. Audit Integritas Relasi Paket -> Jenis Kelas (Foreign Key Integrity)
  console.log(`\n🧘 [4/6] Audit Integritas Jenis Kelas pada Paket...`);
  const allPakets = await prisma.paket.findMany({
    select: { id: true, code: true, name: true, classTypeId: true, classType: { select: { id: true, name: true } } },
  });
  const orphanPackages = allPakets.filter((p) => !p.classType);
  if (orphanPackages.length > 0) {
    console.error(`   ❌ ERROR: Ditemukan ${orphanPackages.length} paket dengan foreign key classTypeId tidak valid!`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: 100% paket (${allPakets.length}/${allPakets.length}) memiliki classTypeId valid (0 orphan).`);
  }

  // 5. Audit Pola Deterministic UUID
  console.log(`\n🔑 [5/6] Audit Pola Deterministic UUID...`);
  const countDetPaket = await prisma.paket.count({
    where: { id: { startsWith: '20000000-0000-4000-8000-' } },
  });
  console.log(`   - Paket dengan UUID deterministik (2000...): ${countDetPaket}/126`);
  if (countDetPaket !== 126) {
    console.error(`   ❌ ERROR: Tidak semua paket menggunakan UUID deterministik.`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: 100% paket (126/126) menggunakan UUID deterministik.`);
  }

  const countDetVoucher = await prisma.voucher.count({
    where: { id: { startsWith: '30000000-0000-4000-8000-' } },
  });
  console.log(`   - Voucher dengan UUID deterministik (3000...): ${countDetVoucher}/312`);
  if (countDetVoucher !== 312) {
    console.error(`   ❌ ERROR: Tidak semua voucher menggunakan UUID deterministik.`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: 100% voucher (312/312) menggunakan UUID deterministik.`);
  }

  // 6. Audit Anomali & Rekonsiliasi Penggunaan Voucher
  console.log(`\n📊 [6/6] Audit Validitas Data & Rekonsiliasi...`);
  const negativePrice = await prisma.paket.count({ where: { priceRp: { lt: 0 } } });
  const zeroSession = await prisma.paket.count({ where: { sessionCount: { lt: 1 } } });
  const negativeValidity = await prisma.paket.count({ where: { validityDays: { lt: 0 } } });
  const zeroValidity = await prisma.paket.count({ where: { validityDays: 0 } });
  const negativeDiscount = await prisma.voucher.count({ where: { discountValue: { lt: 0 } } });

  console.log(`   - Paket dengan harga minus: ${negativePrice}`);
  console.log(`   - Paket dengan sesi < 1: ${zeroSession}`);
  console.log(`   - Paket dengan masa berlaku minus (< 0): ${negativeValidity}`);
  console.log(`   - Paket dengan masa berlaku = 0 (otentik V1 PK-V1-123): ${zeroValidity}`);
  console.log(`   - Voucher dengan diskon < 0: ${negativeDiscount}`);

  if (negativePrice > 0 || zeroSession > 0 || negativeValidity > 0 || negativeDiscount > 0) {
    console.error(`   ❌ ERROR: Ditemukan nilai data anomali pada paket atau voucher!`);
    hasError = true;
  } else {
    console.log(`   ✅ PASS: Seluruh paket dan voucher memiliki nilai numerik valid (otentik V1).`);
  }

  const voucherAgg = await prisma.voucher.aggregate({
    _sum: { usedCount: true },
  });
  const totalUsage = voucherAgg._sum.usedCount ?? 0;
  console.log(`   - Total pemakaian voucher teragregasi (usedCount): ${totalUsage} kali pemakaian.`);

  console.log('\n================================================================');
  if (hasError) {
    console.error('❌ HASIL AUDIT TAHAP 2: GAGAL - TERDAPAT KETIDAKSESUAIAN DATA!');
    process.exit(1);
  } else {
    console.log('✨ HASIL AUDIT TAHAP 2: 100% SUKSES DAN TERVERIFIKASI!');
    console.log('   Semua 126 paket & 312 voucher otentik V1 telah termigrasi dengan sempurna.');
    console.log('================================================================\n');
  }
}

main()
  .catch((err) => {
    console.error('Fatal error during Stage 2 verification:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

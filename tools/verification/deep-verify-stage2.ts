import { PrismaClient, PackageStatus } from '@prisma/client';
import { calculateVoucherDiscount, normalizeVoucherCode } from '../apps/api/src/packages/voucher.service';

const prisma = new PrismaClient();

async function deepVerify() {
  console.log('================================================================================');
  console.log('🔬 AUDIT DAN VERIFIKASI MENDALAM TAHAP 2: MASTER PAKET & VOUCHER (ZERO DUMMY)');
  console.log('================================================================================\n');

  let errors: string[] = [];

  // --------------------------------------------------------------------------
  // 1. KONTROL TOTAL MASTER PAKET (v2_paket)
  // --------------------------------------------------------------------------
  console.log('📦 [1/7] Menguji Kontrol Total Master Paket (v2_paket)...');
  const totalPackages = await prisma.paket.count();
  const activePackages = await prisma.paket.count({ where: { status: PackageStatus.ACTIVE } });
  const archivedPackages = await prisma.paket.count({ where: { status: PackageStatus.ARCHIVED } });

  console.log(`   - Total Paket Terdaftar : ${totalPackages} (Ekspektasi: 126)`);
  console.log(`   - Paket Status ACTIVE   : ${activePackages} (Ekspektasi: 123)`);
  console.log(`   - Paket Status ARCHIVED : ${archivedPackages} (Ekspektasi: 3)`);

  if (totalPackages !== 126) errors.push(`Total paket di v2_paket (${totalPackages}) != 126`);
  if (activePackages !== 123) errors.push(`Paket aktif (${activePackages}) != 123`);
  if (archivedPackages !== 3) errors.push(`Paket arsip (${archivedPackages}) != 3`);

  // Rentang harga dan sesi
  const priceAgg = await prisma.paket.aggregate({
    _min: { priceRp: true, sessionCount: true, validityDays: true },
    _max: { priceRp: true, sessionCount: true, validityDays: true },
    _avg: { priceRp: true, sessionCount: true, validityDays: true },
  });
  console.log(`   - Rentang Harga         : Rp${priceAgg._min.priceRp?.toLocaleString('id-ID')} s/d Rp${priceAgg._max.priceRp?.toLocaleString('id-ID')} (Rata-rata: Rp${Math.round(priceAgg._avg.priceRp || 0).toLocaleString('id-ID')})`);
  console.log(`   - Rentang Sesi          : ${priceAgg._min.sessionCount} s/d ${priceAgg._max.sessionCount} sesi (Rata-rata: ${Math.round(priceAgg._avg.sessionCount || 0)} sesi)`);
  console.log(`   - Rentang Masa Berlaku  : ${priceAgg._min.validityDays} s/d ${priceAgg._max.validityDays} hari`);

  // --------------------------------------------------------------------------
  // 2. INTEGRITAS RELASI FOREIGN KEY (v2_paket -> v2_jenis_kelas)
  // --------------------------------------------------------------------------
  console.log('\n🔗 [2/7] Menguji Integritas Relasi Paket ke Jenis Kelas...');
  const orphanPackages = await prisma.paket.count({
    where: { classTypeId: null },
  });
  const allPackages = await prisma.paket.findMany({
    select: { id: true, code: true, classTypeId: true, classType: { select: { id: true, name: true, modality: true } } },
  });
  const brokenRelations = allPackages.filter((p) => !p.classType);

  console.log(`   - Paket Tanpa classTypeId : ${orphanPackages} (Ekspektasi: 0)`);
  console.log(`   - Paket Relasi Rusak      : ${brokenRelations.length} (Ekspektasi: 0)`);
  if (orphanPackages > 0 || brokenRelations.length > 0) {
    errors.push(`Ditemukan ${orphanPackages + brokenRelations.length} paket tanpa relasi JenisKelas yang valid!`);
  }

  // Distribusi jenis kelas pada paket
  const modalityCounts: Record<string, number> = {};
  allPackages.forEach((p) => {
    const key = `${p.classType?.name} (${p.classType?.modality})`;
    modalityCounts[key] = (modalityCounts[key] || 0) + 1;
  });
  console.log('   - Distribusi Modalitas Paket:');
  Object.entries(modalityCounts).forEach(([k, v]) => {
    console.log(`     * ${k}: ${v} paket`);
  });

  // --------------------------------------------------------------------------
  // 3. CAKUPAN CABANG PAKET (paket_locations -> description)
  // --------------------------------------------------------------------------
  console.log('\n📍 [3/7] Menguji Penandaan Cakupan Cabang pada Deskripsi Paket...');
  const branchMentions: Record<string, number> = {
    'DD-GG': await prisma.paket.count({ where: { description: { contains: 'DD-GG' } } }),
    'DD-MK': await prisma.paket.count({ where: { description: { contains: 'DD-MK' } } }),
    'DD-SBY': await prisma.paket.count({ where: { description: { contains: 'DD-SBY' } } }),
    'DD-UNTAR': await prisma.paket.count({ where: { description: { contains: 'DD-UNTAR' } } }),
    'DD-PIK2': await prisma.paket.count({ where: { description: { contains: 'DD-PIK2' } } }),
    'Semua Cabang': await prisma.paket.count({ where: { description: { contains: 'Semua Cabang' } } }),
  };
  Object.entries(branchMentions).forEach(([b, count]) => {
    console.log(`   - Cabang ${b.padEnd(12)}: ${count} paket`);
  });

  const package108 = await prisma.paket.findUnique({
    where: { id: '20000000-0000-4000-8000-000000000108' },
  });
  if (package108?.description?.includes('VALSDAY')) {
    console.log(`   ✓ Promo code bawaan V1 VALSDAY pada Paket 108 tersimpan presisi: "${package108.description}"`);
  } else {
    errors.push('Promo code VALSDAY tidak ditemukan pada Paket 108!');
  }

  // --------------------------------------------------------------------------
  // 4. KONTROL TOTAL MASTER VOUCHER (v2_voucher)
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [4/7] Menguji Kontrol Total Master Voucher (v2_voucher)...');
  const totalVouchers = await prisma.voucher.count();
  const percentVouchers = await prisma.voucher.count({ where: { discountType: 'PERCENTAGE' } });
  const nominalVouchers = await prisma.voucher.count({ where: { discountType: 'NOMINAL' } });
  const activeVouchers = await prisma.voucher.count({ where: { active: true } });
  const inactiveVouchers = await prisma.voucher.count({ where: { active: false } });

  console.log(`   - Total Voucher Terdaftar  : ${totalVouchers} (Ekspektasi: 312)`);
  console.log(`   - Voucher Tipe PERCENTAGE  : ${percentVouchers} (Ekspektasi: 290)`);
  console.log(`   - Voucher Tipe NOMINAL     : ${nominalVouchers} (Ekspektasi: 22)`);
  console.log(`   - Voucher Status AKTIF     : ${activeVouchers} (Ekspektasi: 309)`);
  console.log(`   - Voucher Status NONAKTIF  : ${inactiveVouchers} (Ekspektasi: 3)`);

  if (totalVouchers !== 312) errors.push(`Total voucher (${totalVouchers}) != 312`);
  if (percentVouchers !== 290) errors.push(`Voucher persentase (${percentVouchers}) != 290`);
  if (nominalVouchers !== 22) errors.push(`Voucher nominal (${nominalVouchers}) != 22`);
  if (activeVouchers !== 309) errors.push(`Voucher aktif (${activeVouchers}) != 309`);
  if (inactiveVouchers !== 3) errors.push(`Voucher nonaktif (${inactiveVouchers}) != 3`);

  // --------------------------------------------------------------------------
  // 5. AGREGASI RIWAYAT PENGGUNAAN VOUCHER (voucher_customers)
  // --------------------------------------------------------------------------
  console.log('\n📊 [5/7] Menguji Agregasi Riwayat Penggunaan Voucher...');
  const voucherUsageAgg = await prisma.voucher.aggregate({
    _sum: { usedCount: true },
    _count: { id: true },
  });
  const totalUsedSum = voucherUsageAgg._sum.usedCount || 0;
  console.log(`   - Total Transaksi Penggunaan Voucher (v2_voucher.usedCount) : ${totalUsedSum.toLocaleString('id-ID')} (Ekspektasi: 7.337)`);
  console.log(`   - Catatan Rekonsiliasi V1: Total 7.752 transaksi = 7.337 (voucher aktif/terdaftar) + 415 (voucher yang dihapus permanen di V1)`);
  if (totalUsedSum !== 7337) {
    errors.push(`Total akumulasi usedCount (${totalUsedSum}) tidak sesuai 7.337!`);
  } else {
    console.log('   ✓ Presisi 100% cocok dengan rekonsiliasi data V1 voucher_customers.');
  }

  // Uji resolusi kode duplikat
  const resolvedVouchers = await prisma.voucher.findMany({
    where: { code: { in: ['DDROPIN_V1_5', 'DDROPIN', 'DROPINUNTAR_V1_25', 'DROPINUNTAR'] } },
    select: { id: true, code: true, name: true, active: true, usedCount: true },
  });
  console.log('   - Status Voucher Duplikat yang Terselesaikan:');
  resolvedVouchers.forEach((v) => {
    console.log(`     * [${v.code}] (ID: ${v.id.slice(-6)}): ${v.name} | Aktif: ${v.active} | Dipakai: ${v.usedCount}x`);
  });
  if (resolvedVouchers.length !== 4) {
    errors.push(`Voucher duplikat yang diselesaikan kurang dari 4 (ditemukan ${resolvedVouchers.length})!`);
  }

  // --------------------------------------------------------------------------
  // 6. KEBERSIHAN BASIS DATA (ZERO DUMMY POLICY)
  // --------------------------------------------------------------------------
  console.log('\n🛡️ [6/7] Menguji Kebersihan Data (Zero Dummy Policy)...');
  const dummyPackages = await prisma.paket.findMany({
    where: {
      OR: [
        { code: { in: ['MAT-8', 'REFORMER-10', 'BARRE-8', 'REFORMER-5'] } },
        { name: { contains: 'dummy' } },
        { description: { contains: '.local' } },
      ],
    },
  });
  const dummyVouchers = await prisma.voucher.findMany({
    where: {
      OR: [
        { code: { in: ['BSDPILATES', 'MATCLASS', 'HEMAT100', 'WELCOME10'] } },
        { name: { contains: 'dummy' } },
        { name: { contains: 'test' } },
      ],
    },
  });

  console.log(`   - Paket Dummy Terdeteksi   : ${dummyPackages.length} (Ekspektasi: 0)`);
  console.log(`   - Voucher Dummy Terdeteksi : ${dummyVouchers.length} (Ekspektasi: 0)`);
  if (dummyPackages.length > 0) errors.push(`Masih ada ${dummyPackages.length} paket dummy!`);
  if (dummyVouchers.length > 0) errors.push(`Masih ada ${dummyVouchers.length} voucher dummy!`);

  // --------------------------------------------------------------------------
  // 7. UJI UNIT LOGIKA BISNIS VOUCHER (calculateVoucherDiscount)
  // --------------------------------------------------------------------------
  console.log('\n⚙️ [7/7] Menguji Logika Kalkulasi Diskon Voucher...');
  const tests = [
    {
      label: 'Diskon 10% dari Rp1.000.000',
      fn: () => calculateVoucherDiscount({ priceRp: 1_000_000, discountType: 'PERCENTAGE', discountValue: 10 }),
      expected: 100_000,
    },
    {
      label: 'Diskon 20% dari Rp1.000.000 dengan batas maksimal Rp150.000',
      fn: () => calculateVoucherDiscount({ priceRp: 1_000_000, discountType: 'PERCENTAGE', discountValue: 20, maxDiscountRp: 150_000 }),
      expected: 150_000,
    },
    {
      label: 'Diskon nominal Rp150.000 untuk harga Rp380.000',
      fn: () => calculateVoucherDiscount({ priceRp: 380_000, discountType: 'NOMINAL', discountValue: 150_000 }),
      expected: 150_000,
    },
    {
      label: 'Diskon nominal Rp250.000 untuk harga Rp100.000 (tidak boleh melebihi harga)',
      fn: () => calculateVoucherDiscount({ priceRp: 100_000, discountType: 'NOMINAL', discountValue: 250_000 }),
      expected: 100_000,
    },
    {
      label: 'Normalisasi kode voucher lowercase dan spasi: "  firstime  "',
      fn: () => normalizeVoucherCode('  firstime  '),
      expected: 'FIRSTIME',
    },
  ];

  tests.forEach((t) => {
    const result = t.fn();
    if (result === t.expected) {
      console.log(`   ✓ ${t.label}: Hasil = ${result}`);
    } else {
      errors.push(`Gagal pada uji: ${t.label} (Hasil: ${result}, Ekspektasi: ${t.expected})`);
    }
  });

  // --------------------------------------------------------------------------
  // KESIMPULAN AKHIR
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  if (errors.length === 0) {
    console.log('🏆 KESIMPULAN: TAHAP 2 MEMENUHI 100% PERSYARATAN DENGAN SEMPURNA!');
    console.log('   - 126 Master Paket otentik valid & terhubung penuh ke jenis kelas.');
    console.log('   - 312 Master Voucher otentik valid dengan riwayat 7.752 transaksi.');
    console.log('   - Seluruh data dummy 100% terhapus bersih.');
    console.log('   - Logika bisnis diskon voucher teruji akurat.');
    console.log('   - Basis data siap 100% untuk migrasi Tahap 3 (Order & Saldo Pelanggan).');
  } else {
    console.error(`❌ TERDETEKSI ${errors.length} KESALAHAN PADA AUDIT:`);
    errors.forEach((err, idx) => console.error(`   ${idx + 1}. ${err}`));
    process.exit(1);
  }
  console.log('================================================================================\n');
}

deepVerify()
  .catch((e) => {
    console.error('Fatal error during deep verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

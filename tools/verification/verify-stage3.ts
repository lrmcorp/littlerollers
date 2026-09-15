import {
  PrismaClient,
  PurchaseStatus,
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

async function main() {
  console.log('================================================================================');
  console.log('🔍 AUDIT & VERIFIKASI TAHAP 3: PESANAN PEMBELIAN & SALDO PELANGGAN (ZERO DUMMY)');
  console.log('================================================================================\n');

  let failureCount = 0;

  // --------------------------------------------------------------------------
  // 1. KONTROL TOTAL PEMBELIAN (v2_pembelian)
  // --------------------------------------------------------------------------
  console.log('💳 [1/6] Menguji Kontrol Total Transaksi Pembelian (v2_pembelian)...');
  const totalPurchases = await prisma.pembelian.count();
  const paidPurchases = await prisma.pembelian.count({ where: { status: PurchaseStatus.PAID } });
  const pendingPurchases = await prisma.pembelian.count({ where: { status: PurchaseStatus.PENDING } });
  const cancelledPurchases = await prisma.pembelian.count({ where: { status: PurchaseStatus.CANCELLED } });

  console.log(`   - Total Pembelian Terdaftar : ${totalPurchases} (Ekspektasi: 14.666)`);
  console.log(`   - Status PAID (Lunas)       : ${paidPurchases} (Ekspektasi: 13.781)`);
  console.log(`   - Status PENDING (Menunggu) : ${pendingPurchases} (Ekspektasi: 884)`);
  console.log(`   - Status CANCELLED (Batal)  : ${cancelledPurchases} (Ekspektasi: 1)`);

  if (totalPurchases !== 14666 || paidPurchases !== 13781 || pendingPurchases !== 884 || cancelledPurchases !== 1) {
    console.error('   ❌ GAGAL: Kontrol total pembelian tidak sesuai!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Kontrol total transaksi pembelian 100% presisi.');
  }

  // --------------------------------------------------------------------------
  // 2. KONTROL TOTAL SALDO PAKET PELANGGAN (v2_paket_pelanggan)
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [2/6] Menguji Kontrol Total Saldo Paket Pelanggan (v2_paket_pelanggan)...');
  const totalCustomerPackages = await prisma.paketPelanggan.count();
  const activePackages = await prisma.paketPelanggan.count({ where: { status: CustomerPackageStatus.ACTIVE } });
  const depletedPackages = await prisma.paketPelanggan.count({ where: { status: CustomerPackageStatus.DEPLETED } });
  const expiredPackages = await prisma.paketPelanggan.count({ where: { status: CustomerPackageStatus.EXPIRED } });

  console.log(`   - Total Saldo Terdaftar     : ${totalCustomerPackages} (Ekspektasi: 13.781)`);
  console.log(`   - Status ACTIVE (Sesi Aktif): ${activePackages} (Ekspektasi: 156)`);
  console.log(`   - Status DEPLETED (Habis)   : ${depletedPackages} (Ekspektasi: 8.271)`);
  console.log(`   - Status EXPIRED (Kedaluwarsa): ${expiredPackages} (Ekspektasi: 5.354)`);

  if (totalCustomerPackages !== 13781 || activePackages !== 156 || depletedPackages !== 8271 || expiredPackages !== 5354) {
    console.error('   ❌ GAGAL: Kontrol total paket pelanggan tidak sesuai!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Kontrol total saldo paket pelanggan 100% presisi.');
  }

  // --------------------------------------------------------------------------
  // 3. KONTROL TOTAL BUKTI PEMBAYARAN (v2_bukti_pembayaran)
  // --------------------------------------------------------------------------
  console.log('\n📄 [3/6] Menguji Kontrol Total Bukti Pembayaran (v2_bukti_pembayaran)...');
  const totalProofs = await prisma.buktiPembayaran.count();
  console.log(`   - Total Lampiran Bukti Bayar: ${totalProofs} (Ekspektasi: 11.466)`);
  if (totalProofs !== 11466) {
    console.error('   ❌ GAGAL: Kontrol total bukti bayar tidak sesuai!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Kontrol total bukti transfer bank 100% presisi.');
  }

  // --------------------------------------------------------------------------
  // 4. INTEGRITAS RELASI FOREIGN KEY (ZERO ORPHANS)
  // --------------------------------------------------------------------------
  console.log('\n🔗 [4/6] Menguji Integritas Relasi Foreign Key (Zero Orphans)...');
  const [resUserPurchases]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_pembelian p LEFT JOIN v2_user u ON p.userId = u.id WHERE u.id IS NULL');
  const [resBranchPurchases]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_pembelian p LEFT JOIN v2_cabang c ON p.branchId = c.id WHERE c.id IS NULL');
  const [resPackagePurchases]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_pembelian p LEFT JOIN v2_paket k ON p.packageId = k.id WHERE k.id IS NULL');

  const [resPurchaseCP]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_paket_pelanggan cp LEFT JOIN v2_pembelian p ON cp.purchaseId = p.id WHERE p.id IS NULL');
  const [resUserCP]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_paket_pelanggan cp LEFT JOIN v2_user u ON cp.userId = u.id WHERE u.id IS NULL');
  const [resPackageCP]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_paket_pelanggan cp LEFT JOIN v2_paket k ON cp.packageId = k.id WHERE k.id IS NULL');

  const [resPurchaseProof]: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM v2_bukti_pembayaran bp LEFT JOIN v2_pembelian p ON bp.purchaseId = p.id WHERE p.id IS NULL');

  const orphanUserPurchases = Number(resUserPurchases.cnt);
  const orphanBranchPurchases = Number(resBranchPurchases.cnt);
  const orphanPackagePurchases = Number(resPackagePurchases.cnt);
  const orphanPurchaseCP = Number(resPurchaseCP.cnt);
  const orphanUserCP = Number(resUserCP.cnt);
  const orphanPackageCP = Number(resPackageCP.cnt);
  const orphanPurchaseProof = Number(resPurchaseProof.cnt);

  console.log(`   - Pembelian tanpa User Valid   : ${orphanUserPurchases} (Harus 0)`);
  console.log(`   - Pembelian tanpa Cabang Valid : ${orphanBranchPurchases} (Harus 0)`);
  console.log(`   - Pembelian tanpa Paket Valid  : ${orphanPackagePurchases} (Harus 0)`);
  console.log(`   - Saldo tanpa Pembelian Valid  : ${orphanPurchaseCP} (Harus 0)`);
  console.log(`   - Saldo tanpa User Valid       : ${orphanUserCP} (Harus 0)`);
  console.log(`   - Saldo tanpa Paket Valid      : ${orphanPackageCP} (Harus 0)`);
  console.log(`   - Bukti tanpa Pembelian Valid  : ${orphanPurchaseProof} (Harus 0)`);

  const totalOrphans =
    orphanUserPurchases +
    orphanBranchPurchases +
    orphanPackagePurchases +
    orphanPurchaseCP +
    orphanUserCP +
    orphanPackageCP +
    orphanPurchaseProof;

  if (totalOrphans > 0) {
    console.error(`   ❌ GAGAL: Ditemukan ${totalOrphans} relasi asing yatim piatu!`);
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Seluruh relasi foreign key 100% utuh tanpa orphan data.');
  }

  // --------------------------------------------------------------------------
  // 5. REKONSILIASI KEUANGAN OMZET (V1 vs V2)
  // --------------------------------------------------------------------------
  console.log('\n💰 [5/6] Menguji Rekonsiliasi Keuangan Omzet Total (V1 vs V2)...');
  const content = fs.readFileSync(v1SqlPath, 'utf8');
  const v1Orders = extractAllTableRows(content, 'order_pakets');
  let v1PaidRevenue = BigInt(0);

  v1Orders.forEach((r) => {
    const p = parseSqlRow(r);
    const status = p[4];
    const harga = BigInt(p[3] || '0');
    if (status === '1') {
      v1PaidRevenue += harga;
    }
  });

  const v2RevenueAgg = await prisma.pembelian.aggregate({
    where: { status: PurchaseStatus.PAID },
    _sum: { totalAmountRp: true },
  });
  const v2PaidRevenue = BigInt(v2RevenueAgg._sum.totalAmountRp || 0);

  console.log(`   - Omzet Pesanan Lunas V1 (order_pakets) : Rp${v1PaidRevenue.toLocaleString('id-ID')}`);
  console.log(`   - Omzet Pesanan Lunas V2 (v2_pembelian)  : Rp${v2PaidRevenue.toLocaleString('id-ID')}`);
  console.log(`   - Selisih Omzet Keuangan              : Rp${(v1PaidRevenue - v2PaidRevenue).toString()}`);

  if (v1PaidRevenue !== v2PaidRevenue) {
    console.error('   ❌ GAGAL: Terdapat selisih pada omzet rekonsiliasi keuangan!');
    failureCount++;
  } else {
    console.log('   ✅ LULUS: Omzet keuangan V1 dan V2 100% identik tanpa selisih 1 Rupiah pun!');
  }

  // --------------------------------------------------------------------------
  // 6. VALIDASI SAMPEL SALDO AKTIF
  // --------------------------------------------------------------------------
  console.log('\n🔎 [6/6] Memvalidasi Sampel Saldo Paket Aktif Member...');
  const sampleActiveCP = await prisma.paketPelanggan.findFirst({
    where: { status: CustomerPackageStatus.ACTIVE },
    include: {
      user: { select: { id: true, displayName: true, email: true } },
      package: { select: { id: true, code: true, name: true } },
      purchase: { select: { id: true, invoiceNumber: true, totalAmountRp: true } },
    },
  });

  console.log(`   - Member          : ${sampleActiveCP?.user.displayName} (${sampleActiveCP?.user.email})`);
  console.log(`   - Paket           : ${sampleActiveCP?.package.name} (${sampleActiveCP?.package.code})`);
  console.log(`   - Invoice         : ${sampleActiveCP?.purchase?.invoiceNumber}`);
  console.log(`   - Total Sesi      : ${sampleActiveCP?.totalSessions} sesi`);
  console.log(`   - Sisa Sesi       : ${sampleActiveCP?.remainingSessions} sesi`);
  console.log(`   - Sesi Terpakai   : ${sampleActiveCP?.usedSessions} sesi`);
  console.log(`   - Berlaku Sampai  : ${sampleActiveCP?.validUntil.toLocaleDateString('id-ID')}`);
  console.log(`   - Status          : ${sampleActiveCP?.status}`);

  console.log('\n================================================================================');
  if (failureCount === 0) {
    console.log('🎉 SELURUH VERIFIKASI TAHAP 3 BERHASIL DENGAN NILAI SEMPURNA (100%)!');
  } else {
    console.error(`💥 TERDAPAT ${failureCount} KEGAGALAN PADA VERIFIKASI TAHAP 3!`);
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

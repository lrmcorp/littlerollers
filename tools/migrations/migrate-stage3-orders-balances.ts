import {
  PrismaClient,
  PurchaseStatus,
  PaymentMethod,
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
  console.log('🚀 EKSEKUSI TAHAP 3: MIGRASI PESANAN PEMBELIAN & SALDO PELANGGAN (ZERO DUMMY)');
  console.log('================================================================================\n');

  if (!fs.existsSync(v1SqlPath)) {
    throw new Error(`File V1 SQL tidak ditemukan di ${v1SqlPath}`);
  }
  console.log('📖 [1/5] Membaca dump data V1 SQL...');
  const content = fs.readFileSync(v1SqlPath, 'utf8');

  // --------------------------------------------------------------------------
  // STEP 1: Validasi Kesiapan Foreign Key Master Data
  // --------------------------------------------------------------------------
  console.log('🔍 [2/5] Memvalidasi kesiapan master data target (User, Paket, Cabang, Voucher)...');
  const userCount = await prisma.user.count();
  const packageCount = await prisma.paket.count();
  const branchCount = await prisma.cabang.count();
  const voucherCount = await prisma.voucher.count();
  console.log(`   - Master User Aktif       : ${userCount} pengguna`);
  console.log(`   - Master Paket Aktif      : ${packageCount} paket`);
  console.log(`   - Master Cabang Aktif     : ${branchCount} cabang`);
  console.log(`   - Master Voucher Aktif    : ${voucherCount} voucher`);

  const existingVouchers = await prisma.voucher.findMany({ select: { id: true } });
  const validVoucherIdSet = new Set(existingVouchers.map((v) => v.id));

  // --------------------------------------------------------------------------
  // STEP 2: Memetakan Relasi Penggunaan Voucher dari voucher_customers
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [3/5] Memetakan penggunaan voucher dari voucher_customers...');
  const vcRows = extractAllTableRows(content, 'voucher_customers');
  const voucherByOrderId: Record<string, string> = {};

  vcRows.forEach((r) => {
    const p = parseSqlRow(r);
    // Columns: id, id_voucher, id_customer, status, expired, status_digunakan, tanggal_digunakan, created_at, updated_at, deleted_at, id_order_paket
    const idVoucher = cleanNum(p[1]);
    const idOrder = cleanNum(p[10]);
    if (idOrder > 0 && idVoucher > 0) {
      const voucherUuid = `30000000-0000-4000-8000-${String(idVoucher).padStart(12, '0')}`;
      if (validVoucherIdSet.has(voucherUuid)) {
        voucherByOrderId[String(idOrder)] = voucherUuid;
      }
    }
  });
  console.log(`   ✓ Terpetakan ${Object.keys(voucherByOrderId).length} pesanan yang terhubung ke voucher otentik V2.`);

  // --------------------------------------------------------------------------
  // STEP 3: Parsing order_pakets dan Menyiapkan Model Transaksi & Saldo
  // --------------------------------------------------------------------------
  console.log('\n📦 [4/5] Memproses 14.666 baris order_pakets V1...');
  const rawOrders = extractAllTableRows(content, 'order_pakets');
  console.log(`   ✓ Ditemukan ${rawOrders.length} rekaman pesanan pada V1.`);

  const branchMap: Record<number, string> = {
    1: 'a1000000-0000-4000-8000-000000000001', // DD-GG
    2: 'a1000000-0000-4000-8000-000000000002', // DD-MK
    3: 'a1000000-0000-4000-8000-000000000003', // DD-SBY
    4: 'a1000000-0000-4000-8000-000000000004', // DD-UNTAR
    5: 'a1000000-0000-4000-8000-000000000005', // DD-PIK2
  };
  const defaultBranchId = 'a1000000-0000-4000-8000-000000000001'; // DD-GG

  const now = new Date('2026-09-14T22:00:00+07:00');

  const purchasesToInsert: any[] = [];
  const proofsToInsert: any[] = [];
  const customerPackagesToInsert: any[] = [];

  for (const r of rawOrders) {
    const p = parseSqlRow(r);
    // Columns:
    // 0: id
    // 1: id_user
    // 2: id_paket
    // 3: harga
    // 4: status (1=paid, 2=pending, 0=cancelled)
    // 5: is_active
    // 6: expired_date
    // 7: created_at
    // 8: updated_at
    // 9: deleted_at
    // 10: tanggal_pembayaran
    // 11: bukti_pembayaran
    // 12: jumlah_pertemuan
    // 13: sisa
    // 14: id_location
    // 15: unix_code
    // 16: metode_pembayaran

    const orderId = cleanNum(p[0]);
    const userIdNum = cleanNum(p[1]);
    const paketIdNum = cleanNum(p[2]);
    const priceRp = cleanNum(p[3]);
    const v1Status = cleanNum(p[4]);
    const isActive = cleanNum(p[5]);
    const expiredDate = parseDate(p[6]) ?? new Date('2025-12-31T23:59:59+07:00');
    const createdAt = parseDate(p[7]) ?? new Date();
    const updatedAt = parseDate(p[8]) ?? createdAt;
    const deletedAt = parseDate(p[9]);
    const paidAt = parseDate(p[10]);
    const proofFile = cleanStr(p[11]);
    const totalSessions = cleanNum(p[12]);
    const remainingSessions = cleanNum(p[13]);
    const locId = cleanNum(p[14]);

    const purchaseId = `40000000-0000-4000-8000-${String(orderId).padStart(12, '0')}`;
    const invoiceNumber = `INV-V1-${String(orderId).padStart(6, '0')}`;
    const userId =
      userIdNum === 1
        ? '00000000-0000-4000-8000-000000000100'
        : `10000000-0000-4000-8000-${String(userIdNum).padStart(12, '0')}`;
    const branchId = branchMap[locId] ?? defaultBranchId;

    // Resolusi paket 0 (24 pesanan awal dialokasikan ke Paket 1)
    const effectivePaketId = paketIdNum === 0 ? 1 : paketIdNum;
    const packageId = `20000000-0000-4000-8000-${String(effectivePaketId).padStart(12, '0')}`;

    const voucherId = voucherByOrderId[String(orderId)] ?? null;

    let purchaseStatus: PurchaseStatus = PurchaseStatus.PAID;
    if (v1Status === 2) {
      purchaseStatus = PurchaseStatus.PENDING;
    } else if (v1Status === 0) {
      purchaseStatus = PurchaseStatus.CANCELLED;
    }

    // 1. Siapkan Pembelian
    purchasesToInsert.push({
      id: purchaseId,
      invoiceNumber,
      userId,
      branchId,
      packageId,
      voucherId,
      subtotalRp: priceRp,
      discountRp: 0,
      totalAmountRp: priceRp,
      status: purchaseStatus,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentExpiresAt: purchaseStatus === PurchaseStatus.PENDING ? expiredDate : null,
      paidAt: purchaseStatus === PurchaseStatus.PAID ? (paidAt ?? createdAt) : null,
      createdAt,
      updatedAt,
    });

    // 2. Siapkan Bukti Pembayaran (jika ada lampiran file)
    if (proofFile && proofFile !== 'NULL' && proofFile.trim() !== '') {
      const proofId = `60000000-0000-4000-8000-${String(orderId).padStart(12, '0')}`;
      proofsToInsert.push({
        id: proofId,
        purchaseId,
        fileUrl: proofFile,
        uploadedAt: paidAt ?? createdAt,
      });
    }

    // 3. Siapkan PaketPelanggan (HANYA untuk pesanan yang lunas / PAID)
    if (purchaseStatus === PurchaseStatus.PAID) {
      const customerPackageId = `50000000-0000-4000-8000-${String(orderId).padStart(12, '0')}`;
      const usedSessions = Math.max(0, totalSessions - remainingSessions);

      let cpStatus: CustomerPackageStatus = CustomerPackageStatus.ACTIVE;
      if (remainingSessions <= 0) {
        cpStatus = CustomerPackageStatus.DEPLETED;
      } else if (expiredDate < now || isActive === 0 || deletedAt) {
        cpStatus = CustomerPackageStatus.EXPIRED;
      } else {
        cpStatus = CustomerPackageStatus.ACTIVE;
      }

      customerPackagesToInsert.push({
        id: customerPackageId,
        purchaseId,
        userId,
        packageId,
        totalSessions,
        remainingSessions,
        usedSessions,
        validFrom: paidAt ?? createdAt,
        validUntil: expiredDate,
        status: cpStatus,
        createdAt,
        updatedAt,
      });
    }
  }

  // --------------------------------------------------------------------------
  // STEP 4: Eksekusi Batch Ingestion ke Database v2
  // --------------------------------------------------------------------------
  console.log('\n💾 [5/5] Melakukan batch insert ke basis data v2...');

  // A. Ingest v2_pembelian
  console.log(`   -> Menyimpan ${purchasesToInsert.length} rekaman ke v2_pembelian...`);
  await chunkInsert(
    purchasesToInsert,
    1000,
    async (chunk) => {
      await prisma.pembelian.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    },
    'Pembelian',
  );

  // B. Ingest v2_bukti_pembayaran
  console.log(`   -> Menyimpan ${proofsToInsert.length} rekaman ke v2_bukti_pembayaran...`);
  await chunkInsert(
    proofsToInsert,
    1000,
    async (chunk) => {
      await prisma.buktiPembayaran.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    },
    'BuktiPembayaran',
  );

  // C. Ingest v2_paket_pelanggan
  console.log(`   -> Menyimpan ${customerPackagesToInsert.length} rekaman ke v2_paket_pelanggan...`);
  await chunkInsert(
    customerPackagesToInsert,
    1000,
    async (chunk) => {
      await prisma.paketPelanggan.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    },
    'PaketPelanggan',
  );

  // --------------------------------------------------------------------------
  // REKAPITULASI KONTROL TOTAL TAHAP 3
  // --------------------------------------------------------------------------
  const finalPurchasesCount = await prisma.pembelian.count();
  const finalPaidPurchases = await prisma.pembelian.count({ where: { status: PurchaseStatus.PAID } });
  const finalPendingPurchases = await prisma.pembelian.count({ where: { status: PurchaseStatus.PENDING } });
  const finalCancelledPurchases = await prisma.pembelian.count({ where: { status: PurchaseStatus.CANCELLED } });

  const finalCustomerPackages = await prisma.paketPelanggan.count();
  const finalActivePackages = await prisma.paketPelanggan.count({ where: { status: CustomerPackageStatus.ACTIVE } });
  const finalDepletedPackages = await prisma.paketPelanggan.count({ where: { status: CustomerPackageStatus.DEPLETED } });
  const finalExpiredPackages = await prisma.paketPelanggan.count({ where: { status: CustomerPackageStatus.EXPIRED } });

  const finalProofsCount = await prisma.buktiPembayaran.count();

  console.log('\n================================================================================');
  console.log('📊 REKAPITULASI KONTROL TOTAL TAHAP 3');
  console.log('================================================================================');
  console.log(`Total Pembelian (v2_pembelian)           : ${finalPurchasesCount} (Target: 14.666)`);
  console.log(`  - Status PAID                          : ${finalPaidPurchases} (Target: 13.781)`);
  console.log(`  - Status PENDING                       : ${finalPendingPurchases} (Target: 884)`);
  console.log(`  - Status CANCELLED                     : ${finalCancelledPurchases} (Target: 1)`);
  console.log(`Total Paket Pelanggan (v2_paket_pelanggan) : ${finalCustomerPackages} (Target: 13.781)`);
  console.log(`  - Status ACTIVE (Siap untuk Booking)   : ${finalActivePackages} (Target: 156)`);
  console.log(`  - Status DEPLETED (Sesi Habis)         : ${finalDepletedPackages} (Target: 8.271)`);
  console.log(`  - Status EXPIRED (Kedaluwarsa)         : ${finalExpiredPackages} (Target: 5.354)`);
  console.log(`Total Bukti Bayar (v2_bukti_pembayaran)  : ${finalProofsCount} (Target: 11.466)`);
  console.log('================================================================================\n');
}

main()
  .catch((err) => {
    console.error('❌ Terjadi kesalahan fatal pada migrasi Tahap 3:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

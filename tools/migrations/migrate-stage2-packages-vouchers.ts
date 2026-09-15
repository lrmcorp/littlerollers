import { PrismaClient, PackageStatus, ClassModality } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();
const v1SqlPath = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/0c5035f9-29c3-48dc-a307-93774adbc341/scratch/dailydose_v1.sql';

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

function extractTableRows(content: string, tableName: string): string[] {
  const marker = `INSERT INTO \`${tableName}\``;
  const start = content.indexOf(marker);
  if (start === -1) return [];
  const end = content.indexOf(';\n', start);
  const sql = content.substring(start, end !== -1 ? end : start + 5000);
  const valuesPart = sql.substring(sql.indexOf('VALUES (') + 8, sql.lastIndexOf(')'));
  return valuesPart.split(/\),\s*\(/);
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
  return new Date(str.replace(' ', 'T') + '+07:00');
}

async function main() {
  console.log('================================================================');
  console.log('🚀 EKSEKUSI TAHAP 2: MIGRASI MASTER PAKET & VOUCHER (ZERO DUMMY)');
  console.log('================================================================');

  if (!fs.existsSync(v1SqlPath)) {
    throw new Error(`File V1 SQL tidak ditemukan di ${v1SqlPath}`);
  }
  const content = fs.readFileSync(v1SqlPath, 'utf8');

  // --------------------------------------------------------------------------
  // STEP 1: Pembersihan Dummy Data di v2_paket dan v2_voucher
  // --------------------------------------------------------------------------
  console.log('\n🧹 [1/5] Membersihkan dummy data dari v2_paket dan v2_voucher...');
  const dummyPackageCodes = ['MAT-8', 'REFORMER-10', 'BARRE-8', 'REFORMER-5'];
  const dummyVoucherCodes = ['BSDPILATES', 'MATCLASS', 'HEMAT100', 'WELCOME10'];

  const deletedPkgs = await prisma.paket.deleteMany({
    where: { code: { in: dummyPackageCodes } },
  });
  console.log(`   ✓ Dihapus ${deletedPkgs.count} dummy paket: ${dummyPackageCodes.join(', ')}`);

  const deletedVouchers = await prisma.voucher.deleteMany({
    where: { code: { in: dummyVoucherCodes } },
  });
  console.log(`   ✓ Dihapus ${deletedVouchers.count} dummy voucher: ${dummyVoucherCodes.join(', ')}`);

  // --------------------------------------------------------------------------
  // STEP 2: Penyelarasan Master Jenis Kelas Otentik (V1 kelas ➔ v2_jenis_kelas)
  // --------------------------------------------------------------------------
  console.log('\n🧘 [2/5] Menyelaraskan Master Jenis Kelas Otentik V1 ke v2_jenis_kelas...');
  const authenticClasses = [
    {
      id: 'c1000000-0000-4000-8000-000000000001',
      code: 'GROUP_CLASS',
      name: 'Group Class',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 5,
      description: 'Group reformer classes with layer of resistance for muscle tone and metabolism.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000002',
      code: 'PRIVATE_CLASS',
      name: 'Private Class',
      modality: ClassModality.PRIVATE,
      durationMinutes: 50,
      defaultCapacity: 1,
      description: '1-on-1 private pilates session with individualized attention and injury care.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000003',
      code: 'SEMI_PRIVATE',
      name: 'Semi Private Class',
      modality: ClassModality.SEMI_PRIVATE,
      durationMinutes: 50,
      defaultCapacity: 2,
      description: 'Scheduled session for 2 to 4 people to workout together with dedicated coach.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000004',
      code: 'PRIVATE_GROUP',
      name: 'Private Group',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 5,
      description: 'Private group reformer pilates session for closed circle/group.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000005',
      code: 'MEGAFORMER',
      name: 'Megaformer Class',
      modality: ClassModality.GROUP,
      durationMinutes: 55,
      defaultCapacity: 5,
      description: 'Megaformer workout session (historical/archived).',
      active: false,
    },
  ];

  for (const cls of authenticClasses) {
    await prisma.jenisKelas.upsert({
      where: { id: cls.id },
      update: {
        code: cls.code,
        name: cls.name,
        modality: cls.modality,
        durationMinutes: cls.durationMinutes,
        defaultCapacity: cls.defaultCapacity,
        description: cls.description,
        active: cls.active,
      },
      create: cls,
    });
  }
  console.log(`   ✓ Dipastikan ${authenticClasses.length} jenis kelas otentik V1 aktif dan sinkron.`);

  // --------------------------------------------------------------------------
  // STEP 3: Parsing paket_locations (Relasi Lokasi Cabang Paket)
  // --------------------------------------------------------------------------
  console.log('\n📍 [3/5] Memetakan relasi paket_locations dari V1...');
  const locationCodeMap: Record<string, string> = {
    '1': 'DD-GG',
    '2': 'DD-MK',
    '3': 'DD-SBY',
    '4': 'DD-UNTAR',
    '5': 'DD-PIK2',
  };

  const rawLocations = extractTableRows(content, 'paket_locations');
  const packageBranches: Record<string, Set<string>> = {};

  rawLocations.forEach((r) => {
    const parts = parseSqlRow(r);
    // Columns: id, id_paket, id_location, created_at, updated_at, deleted_at
    const idPaket = parts[1];
    const idLoc = parts[2];
    const deletedAt = parts[5];
    if (deletedAt === 'NULL' || !deletedAt) {
      if (!packageBranches[idPaket]) {
        packageBranches[idPaket] = new Set();
      }
      const code = locationCodeMap[idLoc];
      if (code) {
        packageBranches[idPaket].add(code);
      }
    }
  });
  console.log(`   ✓ Terpetakan ${rawLocations.length} relasi paket_locations untuk ${Object.keys(packageBranches).length} paket.`);

  // --------------------------------------------------------------------------
  // STEP 4: Migrasi 126 Master Paket (pakets ➔ v2_paket)
  // --------------------------------------------------------------------------
  console.log('\n📦 [4/5] Memigrasikan 126 Master Paket ke v2_paket...');
  const rawPakets = extractTableRows(content, 'pakets');
  let migratedPackagesCount = 0;

  for (const r of rawPakets) {
    // Columns: id, nama, jumlah_pertemuan, harga, valid_day, promote_code, diskon, created_at, updated_at, deleted_at, id_kelas, is_many_times, is_show_public
    const parts = parseSqlRow(r);
    const v1Id = cleanNum(parts[0]);
    const name = cleanStr(parts[1]);
    const sessionCount = cleanNum(parts[2], 1);
    const priceRp = cleanNum(parts[3], 0);
    const validityDays = cleanNum(parts[4], 30);
    const promoCode = cleanStr(parts[5]);
    const createdAt = parseDate(parts[7]) ?? new Date();
    const updatedAt = parseDate(parts[8]) ?? createdAt;
    const deletedAt = parseDate(parts[9]);
    const idKelas = cleanNum(parts[10], 1);

    const uuid = `20000000-0000-4000-8000-${String(v1Id).padStart(12, '0')}`;
    const code = `PK-V1-${v1Id}`;
    const classTypeId = `c1000000-0000-4000-8000-${String(idKelas).padStart(12, '0')}`;
    const status: PackageStatus = deletedAt ? PackageStatus.ARCHIVED : PackageStatus.ACTIVE;

    // Susun deskripsi lengkap termasuk cabang berlaku dan promo code
    const branches = packageBranches[String(v1Id)]
      ? Array.from(packageBranches[String(v1Id)]).join(', ')
      : 'Semua Cabang';
    let description = `Cabang: ${branches}`;
    if (promoCode) {
      description += ` | Promo: ${promoCode}`;
    }

    await prisma.paket.upsert({
      where: { id: uuid },
      update: {
        code,
        name,
        classTypeId,
        sessionCount,
        validityDays,
        priceRp,
        description,
        status,
        updatedAt,
      },
      create: {
        id: uuid,
        code,
        name,
        classTypeId,
        sessionCount,
        validityDays,
        priceRp,
        description,
        status,
        createdAt,
        updatedAt,
      },
    });

    migratedPackagesCount++;
  }
  console.log(`   ✓ Berhasil memigrasikan ${migratedPackagesCount} paket otentik ke v2_paket.`);

  // --------------------------------------------------------------------------
  // STEP 5: Parsing voucher_customers untuk Agregat usedCount
  // --------------------------------------------------------------------------
  console.log('\n🎟️ [5/5] Mengagregasikan penggunaan voucher & memigrasikan 312 voucher...');
  const rawVc = extractTableRows(content, 'voucher_customers');
  const usedCountByVoucher: Record<string, number> = {};
  let totalRedemptions = 0;

  rawVc.forEach((r) => {
    const parts = parseSqlRow(r);
    // Columns: id, id_voucher, id_customer, status, expired, status_digunakan, tanggal_digunakan, created_at, updated_at, deleted_at, id_order_paket
    const idVoucher = parts[1];
    const statusDigunakan = parts[5];
    if (statusDigunakan === '1') {
      totalRedemptions++;
      usedCountByVoucher[idVoucher] = (usedCountByVoucher[idVoucher] || 0) + 1;
    }
  });
  console.log(`   ✓ Terdeteksi ${totalRedemptions} riwayat pemakaian voucher otentik pada ${Object.keys(usedCountByVoucher).length} voucher.`);

  // --------------------------------------------------------------------------
  // STEP 6: Migrasi 312 Master Voucher (vouchers ➔ v2_voucher)
  // --------------------------------------------------------------------------
  const rawVouchers = extractTableRows(content, 'vouchers');
  let migratedVouchersCount = 0;

  for (const r of rawVouchers) {
    // Columns: id, nama, deskripsi, expired, image, status, disc_harga, disc_percent, tanggal_aktif, lama_aktif, created_at, updated_at, deleted_at, id_paket, kode_voucher, sekali_gunakan
    const parts = parseSqlRow(r);
    const v1Id = cleanNum(parts[0]);
    const name = cleanStr(parts[1]);
    const expired = parseDate(parts[3]);
    const status = cleanNum(parts[5]);
    const discHarga = cleanNum(parts[6]);
    const discPercent = cleanNum(parts[7]);
    const createdAt = parseDate(parts[10]) ?? new Date();
    const rawKodeVoucher = cleanStr(parts[14]).toUpperCase();

    const uuid = `30000000-0000-4000-8000-${String(v1Id).padStart(12, '0')}`;

    // Resolusi duplikasi kode voucher untuk constraint @unique
    let code = rawKodeVoucher;
    if (v1Id === 5 && rawKodeVoucher === 'DDROPIN') {
      code = 'DDROPIN_V1_5';
    } else if (v1Id === 25 && rawKodeVoucher === 'DROPINUNTAR') {
      code = 'DROPINUNTAR_V1_25';
    }

    const discountType = discPercent > 0 ? 'PERCENTAGE' : 'NOMINAL';
    const discountValue = discPercent > 0 ? discPercent : discHarga;
    const usedCount = usedCountByVoucher[String(v1Id)] || 0;
    const quota = Math.max(100, usedCount + 50);
    const active = status === 1;

    await prisma.voucher.upsert({
      where: { id: uuid },
      update: {
        code,
        name,
        discountType,
        discountValue,
        minSpendRp: 0,
        maxDiscountRp: null,
        quota,
        usedCount,
        validUntil: expired,
        active,
      },
      create: {
        id: uuid,
        code,
        name,
        discountType,
        discountValue,
        minSpendRp: 0,
        maxDiscountRp: null,
        quota,
        usedCount,
        validUntil: expired,
        active,
        createdAt,
      },
    });

    migratedVouchersCount++;
  }
  console.log(`   ✓ Berhasil memigrasikan ${migratedVouchersCount} voucher otentik ke v2_voucher.`);

  // --------------------------------------------------------------------------
  // REKAPITULASI KONTROL TOTAL
  // --------------------------------------------------------------------------
  const finalPackagesCount = await prisma.paket.count();
  const finalVouchersCount = await prisma.voucher.count();
  const finalClassTypesCount = await prisma.jenisKelas.count();
  const remainingDummyPackages = await prisma.paket.count({
    where: { code: { in: dummyPackageCodes } },
  });
  const remainingDummyVouchers = await prisma.voucher.count({
    where: { code: { in: dummyVoucherCodes } },
  });

  console.log('\n================================================================');
  console.log('📊 REKAPITULASI KONTROL TOTAL TAHAP 2');
  console.log('================================================================');
  console.log(`Total Master Paket di v2_paket       : ${finalPackagesCount} (Target: 126)`);
  console.log(`Total Master Voucher di v2_voucher   : ${finalVouchersCount} (Target: 312)`);
  console.log(`Total Jenis Kelas di v2_jenis_kelas  : ${finalClassTypesCount}`);
  console.log(`Total Dummy Paket Tersisa            : ${remainingDummyPackages} (Target: 0)`);
  console.log(`Total Dummy Voucher Tersisa          : ${remainingDummyVouchers} (Target: 0)`);
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan pada migrasi Tahap 2:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

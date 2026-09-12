import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

async function ensureTablesCreated() {
  console.log('📦 Memeriksa & membuat struktur tabel skema baru (v2_*) di database...');
  const sqlFile = path.join(__dirname, 'init_tables.sql');
  if (!fs.existsSync(sqlFile)) {
    throw new Error(`File init_tables.sql tidak ditemukan di ${sqlFile}`);
  }
  const sql = fs.readFileSync(sqlFile, 'utf-8');
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let executedCount = 0;
  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      executedCount++;
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        !msg.includes('already exists') &&
        !msg.includes('Duplicate foreign key') &&
        !msg.includes('1050') &&
        !msg.includes('1826') &&
        !msg.includes('1061')
      ) {
        console.warn(`[DDL Warning] ${msg.split('\n')[0]}`);
      }
    }
  }
  console.log(`✓ Struktur tabel skema baru (v2_*) siap (${executedCount} pernyataan DDL diproses).\n`);
}

interface MigrationStats {
  entity: string;
  sourceCount: number;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
}

const stats: Record<string, MigrationStats> = {};

function initStat(entity: string): MigrationStats {
  stats[entity] = { entity, sourceCount: 0, migratedCount: 0, skippedCount: 0, errorCount: 0 };
  return stats[entity];
}

async function runDryRun() {
  console.log('🔍 [DRY RUN] Memeriksa jumlah data di tabel sumber...');

  const tablesToCheck = [
    { name: 'Cabang', table: 'Cabang' },
    { name: 'Studio', table: 'Studio' },
    { name: 'Ruangan', table: 'Ruangan' },
    { name: 'JenisKelas', table: 'JenisKelas' },
    { name: 'User', table: 'User' },
    { name: 'ProfilPengguna', table: 'ProfilPengguna' },
    { name: 'PasswordCredential', table: 'PasswordCredential' },
    { name: 'Paket', table: 'Paket' },
    { name: 'Pembelian', table: 'Pembelian' },
    { name: 'PaketPelanggan', table: 'PaketPelanggan' },
    { name: 'SlotKelas', table: 'SlotKelas' },
    { name: 'PemesananKelas', table: 'PemesananKelas' },
    { name: 'UbahJadwal', table: 'UbahJadwal' },
    { name: 'KehadiranPelanggan', table: 'KehadiranPelanggan' },
    { name: 'CheckInToken', table: 'CheckInToken' },
    { name: 'RekeningPembayaran', table: 'RekeningPembayaran' },
    { name: 'Voucher', table: 'Voucher' },
  ];

  for (const item of tablesToCheck) {
    try {
      const countRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \`${item.table}\``);
      const count = Number(countRes[0]?.count ?? 0);
      console.log(`  ✓ ${item.name.padEnd(22)} : ${count.toLocaleString()} baris`);
    } catch (e: any) {
      console.log(`  ⚠ ${item.name.padEnd(22)} : (Tabel belum ada atau kosong: ${e.message.split('\n')[0]})`);
    }
  }

  console.log('\n✅ Pemeriksaan data sumber selesai. Siap dieksekusi dengan flag --execute.');
}

async function migrateCabang(isDryRun: boolean) {
  const stat = initStat('v2_cabang');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, kode as code, nama as name, NULL as address, supportWhatsappE164 as phone,
           COALESCE(zona_waktu, 'Asia/Jakarta') as timezone, aktif as isActive,
           dibuat_pada as createdAt, diperbarui_pada as updatedAt
    FROM \`Cabang\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_cabang\` (id, code, name, address, phone, timezone, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), phone = VALUES(phone), timezone = VALUES(timezone),
          isActive = VALUES(isActive), updatedAt = VALUES(updatedAt)
      `, r.id, r.code, r.name, r.address, r.phone, r.timezone, Boolean(r.isActive), r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating cabang ${r.code}:`, err);
    }
  }
}

async function migrateStudio(isDryRun: boolean) {
  const stat = initStat('v2_studio');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, branchId, code, name, equipmentText as description,
           active as isActive, createdAt, updatedAt
    FROM \`Studio\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_studio\` (id, branchId, code, name, description, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), description = VALUES(description),
          isActive = VALUES(isActive), updatedAt = VALUES(updatedAt)
      `, r.id, r.branchId, r.code, r.name, r.description, Boolean(r.isActive), r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating studio ${r.code}:`, err);
    }
  }
}

async function migrateRuangan(isDryRun: boolean) {
  const stat = initStat('v2_ruangan');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, studio_id as studioId, kode as code, nama as name,
           COALESCE(kapasitas, 1) as capacityBed, aktif as isActive,
           createdAt, updatedAt
    FROM \`Ruangan\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_ruangan\` (id, studioId, code, name, capacityBed, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), capacityBed = VALUES(capacityBed),
          isActive = VALUES(isActive), updatedAt = VALUES(updatedAt)
      `, r.id, r.studioId, r.code, r.name, Number(r.capacityBed), Boolean(r.isActive), r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating ruangan ${r.code}:`, err);
    }
  }
}

async function migrateJenisKelas(isDryRun: boolean) {
  const stat = initStat('v2_jenis_kelas');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, kode as code, nama as name, description,
           COALESCE(defaultDurationMinutes, 50) as durationMinutes,
           COALESCE(defaultCapacity, 8) as defaultCapacity,
           aktif as isActive, dibuat_pada as createdAt, diperbarui_pada as updatedAt
    FROM \`JenisKelas\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      let modality = 'GROUP';
      const upperCode = (r.code || '').toUpperCase();
      if (upperCode.includes('PRIV')) modality = 'PRIVATE';
      else if (upperCode.includes('DUET')) modality = 'DUET';
      else if (upperCode.includes('SEMI')) modality = 'SEMI_PRIVATE';

      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_jenis_kelas\` (id, code, name, modality, description, durationMinutes, defaultCapacity, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), modality = VALUES(modality), description = VALUES(description),
          durationMinutes = VALUES(durationMinutes), defaultCapacity = VALUES(defaultCapacity),
          isActive = VALUES(isActive), updatedAt = VALUES(updatedAt)
      `, r.id, r.code, r.name, modality, r.description, Number(r.durationMinutes), Number(r.defaultCapacity), Boolean(r.isActive), r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating jenis_kelas ${r.code}:`, err);
    }
  }
}

async function migrateUser(isDryRun: boolean) {
  const stat = initStat('v2_user');
  
  // Ambil data user & password
  const users: any[] = await prisma.$queryRawUnsafe(`
    SELECT u.id, u.displayName as name, u.email, u.phoneE164 as phone,
           u.preferredBranchId, u.status, u.createdAt, u.updatedAt,
           pc.passwordHash
    FROM \`User\` u
    LEFT JOIN \`PasswordCredential\` pc ON pc.userId = u.id
  `);
  stat.sourceCount = users.length;

  // Ambil data roles
  const roles: any[] = await prisma.$queryRawUnsafe(`
    SELECT userId, role FROM \`UserRole\`
  `);

  const rolePriority = ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER', 'FINANCE', 'OPS', 'INSTRUCTOR', 'CUSTOMER'];
  const userRolesMap = new Map<string, string>();
  for (const r of roles) {
    const current = userRolesMap.get(r.userId);
    if (!current || rolePriority.indexOf(r.role) < rolePriority.indexOf(current)) {
      userRolesMap.set(r.userId, r.role);
    }
  }

  if (isDryRun) return;

  for (const r of users) {
    try {
      const oldRole = userRolesMap.get(r.id) || 'CUSTOMER';
      let role = 'MEMBER';
      if (['SUPER_OWNER', 'OWNER'].includes(oldRole)) role = 'SUPERADMIN';
      else if (['ADMIN', 'MANAGER', 'FINANCE', 'OPS'].includes(oldRole)) role = 'ADMIN';
      else if (oldRole === 'INSTRUCTOR') role = 'COACH';

      let status = 'ACTIVE';
      if (r.status === 'SUSPENDED') status = 'SUSPENDED';
      else if (r.status === 'INACTIVE') status = 'INACTIVE';

      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_user\` (id, email, phone, name, passwordHash, role, status, preferredBranchId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), passwordHash = COALESCE(VALUES(passwordHash), passwordHash),
          role = VALUES(role), status = VALUES(status), preferredBranchId = VALUES(preferredBranchId),
          updatedAt = VALUES(updatedAt)
      `, r.id, r.email, r.phone, r.name, r.passwordHash, role, status, r.preferredBranchId, r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating user ${r.email || r.id}:`, err);
    }
  }
}

async function migrateProfilPengguna(isDryRun: boolean) {
  const stat = initStat('v2_profil_pengguna');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT pengguna_id as userId, alamat as address, jenis_kelamin as gender,
           tanggal_lahir as birthDate, createdAt, updatedAt
    FROM \`ProfilPengguna\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_profil_pengguna\` (id, userId, fullName, gender, birthDate, avatarUrl, address, emergencyContactName, emergencyContactPhone, notes, createdAt, updatedAt)
        VALUES (?, ?, NULL, ?, ?, NULL, ?, NULL, NULL, NULL, ?, ?)
        ON DUPLICATE KEY UPDATE
          address = VALUES(address), gender = VALUES(gender), birthDate = VALUES(birthDate),
          updatedAt = VALUES(updatedAt)
      `, r.userId, r.userId, r.gender, r.birthDate, r.address, r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating profil_pengguna ${r.userId}:`, err);
    }
  }
}

async function migratePenugasanInstruktur(isDryRun: boolean) {
  const stat = initStat('v2_penugasan_instruktur');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT p.id, p.userId as coachId, p.branchId, p.activeUntil, p.activeFrom as createdAt
    FROM \`Penugasan\` p
    INNER JOIN \`UserRole\` ur ON ur.userId = p.userId AND ur.role = 'INSTRUCTOR'
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      const isActive = !r.activeUntil || new Date(r.activeUntil) >= new Date();
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_penugasan_instruktur\` (id, coachId, branchId, isActive, createdAt)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          isActive = VALUES(isActive)
      `, r.id, r.coachId, r.branchId, isActive, r.createdAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating penugasan_instruktur ${r.id}:`, err);
    }
  }
}

async function migratePaket(isDryRun: boolean) {
  const stat = initStat('v2_paket');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, classTypeId, kunci_bisnis as code, nama as name,
           jumlah_sesi as sessionCount, durasi_hari as validityDays,
           harga_rp as priceRp, status, createdAt, updatedAt
    FROM \`Paket\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  const usedCodes = new Set<string>();
  for (const r of rows) {
    try {
      let code = r.code || `PKG-${r.id.slice(0, 8)}`;
      if (usedCodes.has(code)) {
        code = `${code}-${r.id.slice(0, 4)}`;
      }
      usedCodes.add(code);

      const status = r.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_paket\` (id, classTypeId, code, name, sessionCount, validityDays, priceRp, description, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), sessionCount = VALUES(sessionCount), validityDays = VALUES(validityDays),
          priceRp = VALUES(priceRp), status = VALUES(status), updatedAt = VALUES(updatedAt)
      `, r.id, r.classTypeId, code, r.name, Number(r.sessionCount), Number(r.validityDays), Number(r.priceRp), status, r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating paket ${r.code}:`, err);
    }
  }
}

async function migrateRekeningPembayaran(isDryRun: boolean) {
  const stat = initStat('v2_rekening_pembayaran');
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, branchId, bankName, accountNumber, accountHolder, active as isActive, createdAt
      FROM \`RekeningPembayaran\`
    `);
    stat.sourceCount = rows.length;

    if (isDryRun) return;

    for (const r of rows) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_rekening_pembayaran\` (id, branchId, bankName, accountNumber, accountHolder, isActive, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          bankName = VALUES(bankName), accountNumber = VALUES(accountNumber),
          accountHolder = VALUES(accountHolder), isActive = VALUES(isActive)
      `, r.id, r.branchId, r.bankName, r.accountNumber, r.accountHolder, Boolean(r.isActive), r.createdAt);
      stat.migratedCount++;
    }
  } catch (err) {
    console.log('RekeningPembayaran table optional/empty.');
  }
}

async function migrateVoucher(isDryRun: boolean) {
  const stat = initStat('v2_voucher');
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT id,
             kode as code,
             nama as name,
             COALESCE(tipe_diskon, 'FIXED_AMOUNT') as discountType,
             COALESCE(nilai_diskon, 0) as discountValue,
             COALESCE(minimal_pembelian_rp, 0) as minSpendRp,
             maksimal_diskon_rp as maxDiscountRp,
             COALESCE(batas_total_penggunaan, 100) as quota,
             0 as usedCount,
             aktif_sampai as validUntil,
             (status = 'ACTIVE') as isActive,
             createdAt
      FROM \`Voucher\`
    `);
    stat.sourceCount = rows.length;

    if (isDryRun) return;

    for (const r of rows) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO \`v2_voucher\` (id, code, name, discountType, discountValue, minSpendRp, maxDiscountRp, quota, usedCount, validUntil, isActive, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name), quota = VALUES(quota), usedCount = VALUES(usedCount),
            validUntil = VALUES(validUntil), isActive = VALUES(isActive)
        `, r.id, r.code, r.name, r.discountType, Number(r.discountValue), Number(r.minSpendRp), r.maxDiscountRp ? Number(r.maxDiscountRp) : null, Number(r.quota), Number(r.usedCount), r.validUntil, Boolean(r.isActive), r.createdAt);
        stat.migratedCount++;
      } catch (err) {
        stat.errorCount++;
        console.error(`Error migrating voucher ${r.code}:`, err);
      }
    }
  } catch (err: any) {
    console.error('Voucher query error:', err.message);
  }
}

async function migratePembelian(isDryRun: boolean) {
  const stat = initStat('v2_pembelian');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, pengguna_id as userId, cabang_id as branchId, paket_id as packageId,
           voucher_id as voucherId, paymentProofId,
           COALESCE(snapshot_harga_rp, 0) as subtotalRp,
           COALESCE(snapshot_diskon_voucher_rp, 0) as discountRp,
           COALESCE(snapshot_jumlah_tagihan_rp, snapshot_harga_rp, 0) as totalAmountRp,
           status, batas_waktu_pembayaran as paymentExpiresAt,
           diajukan_pada as createdAt, COALESCE(diputuskan_pada, diajukan_pada) as updatedAt,
           diputuskan_pada as paidAt, diputuskan_oleh_id as verifiedById
    FROM \`Pembelian\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  const validVouchers = new Set((await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM \`v2_voucher\``)).map((v) => v.id));
  const validUsers = new Set((await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM \`v2_user\``)).map((u) => u.id));

  for (const r of rows) {
    try {
      let status = 'PENDING';
      if (['APPROVED', 'SETTLED', 'PAID'].includes(r.status)) {
        status = 'PAID';
      } else if (r.status === 'REJECTED') {
        status = 'REJECTED';
      } else if (['CANCELLED', 'EXPIRED'].includes(r.status)) {
        status = 'CANCELLED';
      } else if (r.paymentProofId) {
        status = 'WAITING_VERIFICATION';
      } else {
        status = 'PENDING';
      }

      const voucherId = r.voucherId && validVouchers.has(r.voucherId) ? r.voucherId : null;
      const verifiedById = r.verifiedById && validUsers.has(r.verifiedById) ? r.verifiedById : null;
      const verifiedAt = status === 'PAID' ? r.paidAt : null;

      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_pembelian\` (id, invoiceNumber, userId, branchId, packageId, voucherId, subtotalRp, discountRp, totalAmountRp, status, paymentMethod, paymentExpiresAt, paidAt, verifiedById, verifiedAt, rejectionReason, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BANK_TRANSFER', ?, ?, ?, ?, NULL, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status), totalAmountRp = VALUES(totalAmountRp),
          paidAt = VALUES(paidAt), verifiedById = VALUES(verifiedById), verifiedAt = VALUES(verifiedAt), updatedAt = VALUES(updatedAt)
      `, r.id, r.id, r.userId, r.branchId, r.packageId, voucherId, Number(r.subtotalRp), Number(r.discountRp), Number(r.totalAmountRp), status, r.paymentExpiresAt, r.paidAt, verifiedById, verifiedAt, r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating pembelian ${r.id}:`, err);
    }
  }
}

async function migrateBuktiPembayaran(isDryRun: boolean) {
  const stat = initStat('v2_bukti_pembayaran');
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT bp.id, p.id as purchaseId,
             COALESCE(bp.objectKey, bp.nama_file, 'proof.jpg') as fileUrl,
             COALESCE(bp.uploadedAt, p.diajukan_pada, NOW()) as uploadedAt
      FROM \`BuktiPembayaran\` bp
      INNER JOIN \`Pembelian\` p ON p.paymentProofId = bp.id
    `);
    stat.sourceCount = rows.length;

    if (isDryRun) return;

    for (const r of rows) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO \`v2_bukti_pembayaran\` (id, purchaseId, fileUrl, bankName, accountHolder, notes, uploadedAt)
          VALUES (?, ?, ?, NULL, NULL, NULL, ?)
          ON DUPLICATE KEY UPDATE
            fileUrl = VALUES(fileUrl), uploadedAt = VALUES(uploadedAt)
        `, r.id, r.purchaseId, r.fileUrl, r.uploadedAt);
        stat.migratedCount++;
      } catch (err) {
        stat.errorCount++;
        console.error(`Error migrating bukti_pembayaran ${r.id}:`, err);
      }
    }
  } catch (err: any) {
    console.error('BuktiPembayaran query error:', err.message);
  }
}

async function migratePaketPelanggan(isDryRun: boolean) {
  const stat = initStat('v2_paket_pelanggan');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT pp.id, pp.pembelian_id as purchaseId, pp.pengguna_pelanggan_id as userId,
           pp.paket_id as packageId, pp.snapshot_jumlah_sesi as totalSessions,
           COALESCE(pp.tanggal_aktivasi, pp.createdAt) as validFrom,
           pp.tanggal_kedaluwarsa as validUntil,
           pp.status, pp.createdAt, pp.sourceBalance,
           COALESCE(b.bookedCount, 0) as usedSessions
    FROM \`PaketPelanggan\` pp
    LEFT JOIN (
      SELECT paket_pelanggan_id, COUNT(*) as bookedCount
      FROM \`PemesananKelas\`
      WHERE status IN ('BOOKED', 'ATTENDED')
      GROUP BY paket_pelanggan_id
    ) b ON b.paket_pelanggan_id = pp.id
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  const validPurchases = new Set((await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM \`v2_pembelian\``)).map((p) => p.id));

  for (const r of rows) {
    try {
      const total = Number(r.totalSessions || 0);
      const used = Number(r.usedSessions || 0);
      const remaining = r.sourceBalance !== null && r.sourceBalance !== undefined
        ? Number(r.sourceBalance)
        : Math.max(0, total - used);

      let status = 'ACTIVE';
      if (new Date(r.validUntil) < new Date()) status = 'EXPIRED';
      else if (remaining <= 0) status = 'DEPLETED';

      const purchaseId = r.purchaseId && validPurchases.has(r.purchaseId) ? r.purchaseId : null;

      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_paket_pelanggan\` (id, purchaseId, userId, packageId, totalSessions, remainingSessions, usedSessions, validFrom, validUntil, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          totalSessions = VALUES(totalSessions), remainingSessions = VALUES(remainingSessions),
          usedSessions = VALUES(usedSessions), validUntil = VALUES(validUntil),
          status = VALUES(status), updatedAt = VALUES(updatedAt)
      `, r.id, purchaseId, r.userId, r.packageId, total, remaining, used, r.validFrom, r.validUntil, status, r.createdAt, r.createdAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating paket_pelanggan ${r.id}:`, err);
    }
  }
}

async function migrateSlotKelas(isDryRun: boolean) {
  const stat = initStat('v2_slot_kelas');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT sk.id, sk.cabang_id as branchId, sk.studio_id as studioId,
           sk.ruangan_id as roomId, sk.jenis_kelas_id as classTypeId,
           sk.pengguna_instruktur_id as instructorId, sk.waktu_mulai as startAt,
           sk.waktu_selesai as endAt, sk.kapasitas as capacity,
           COALESCE(b.bookedTotal, sk.bookedCount, 0) as bookedCount,
           sk.status, sk.createdAt, sk.updatedAt
    FROM \`SlotKelas\` sk
    LEFT JOIN (
      SELECT slot_kelas_id, COUNT(*) as bookedTotal
      FROM \`PemesananKelas\`
      WHERE status IN ('BOOKED', 'ATTENDED')
      GROUP BY slot_kelas_id
    ) b ON b.slot_kelas_id = sk.id
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      let status = 'SCHEDULED';
      if (r.status === 'CANCELLED') status = 'CANCELLED';
      else if (new Date(r.endAt) < new Date()) status = 'COMPLETED';

      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_slot_kelas\` (id, branchId, studioId, roomId, classTypeId, instructorId, startAt, endAt, capacity, bookedCount, status, notes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
        ON DUPLICATE KEY UPDATE
          capacity = VALUES(capacity), bookedCount = VALUES(bookedCount),
          status = VALUES(status), updatedAt = VALUES(updatedAt)
      `, r.id, r.branchId, r.studioId, r.roomId, r.classTypeId, r.instructorId, r.startAt, r.endAt, Number(r.capacity), Number(r.bookedCount), status, r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating slot_kelas ${r.id}:`, err);
    }
  }
}

async function migratePemesananKelas(isDryRun: boolean) {
  const stat = initStat('v2_pemesanan_kelas');
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, slot_kelas_id as classSlotId, pengguna_pelanggan_id as userId,
           paket_pelanggan_id as customerPackageId, status,
           createdAt as bookedAt, dibatalkan_pada as cancelledAt,
           kode_alasan_pembatalan as cancellationReason, createdAt, updatedAt
    FROM \`PemesananKelas\`
  `);
  stat.sourceCount = rows.length;

  if (isDryRun) return;

  for (const r of rows) {
    try {
      let status = 'BOOKED';
      if (['ATTENDED'].includes(r.status)) status = 'ATTENDED';
      else if (['CANCELLED'].includes(r.status)) status = 'CANCELLED';
      else if (['NO_SHOW'].includes(r.status)) status = 'NO_SHOW';

      await prisma.$executeRawUnsafe(`
        INSERT INTO \`v2_pemesanan_kelas\` (id, bookingNumber, classSlotId, userId, customerPackageId, status, bookedAt, cancelledAt, cancellationReason, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status), cancelledAt = VALUES(cancelledAt),
          cancellationReason = VALUES(cancellationReason), updatedAt = VALUES(updatedAt)
      `, r.id, r.id, r.classSlotId, r.userId, r.customerPackageId, status, r.bookedAt, r.cancelledAt, r.cancellationReason, r.createdAt, r.updatedAt);
      stat.migratedCount++;
    } catch (err) {
      stat.errorCount++;
      console.error(`Error migrating pemesanan_kelas ${r.id}:`, err);
    }
  }
}

async function migrateUbahJadwal(isDryRun: boolean) {
  const stat = initStat('v2_ubah_jadwal');
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, bookingId, sourceClassSlotId as sourceSlotId,
             targetClassSlotId as targetSlotId, requestedById,
             status, requestReasonCode as reason, requestedAt
      FROM \`UbahJadwal\`
    `);
    stat.sourceCount = rows.length;

    if (isDryRun) return;

    for (const r of rows) {
      try {
        let status = 'APPROVED';
        if (r.status === 'PENDING') status = 'PENDING';
        else if (r.status === 'REJECTED') status = 'REJECTED';
        else if (r.status === 'CANCELLED') status = 'CANCELLED';

        await prisma.$executeRawUnsafe(`
          INSERT INTO \`v2_ubah_jadwal\` (id, bookingId, sourceSlotId, targetSlotId, requestedById, status, reason, requestedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            status = VALUES(status)
        `, r.id, r.bookingId, r.sourceSlotId, r.targetSlotId, r.requestedById, status, r.reason, r.requestedAt);
        stat.migratedCount++;
      } catch (err) {
        stat.errorCount++;
        console.error(`Error migrating ubah_jadwal ${r.id}:`, err);
      }
    }
  } catch (err: any) {
    console.error('UbahJadwal query error:', err.message);
  }
}

async function migrateKehadiranPelanggan(isDryRun: boolean) {
  const stat = initStat('v2_kehadiran_pelanggan');
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, bookingId, source as method, checkedInAt, recordedById
      FROM \`KehadiranPelanggan\`
    `);
    stat.sourceCount = rows.length;

    if (isDryRun) return;

    for (const r of rows) {
      try {
        const method = r.method === 'QR' ? 'QR_SCAN' : 'MANUAL_FRONTDESK';
        await prisma.$executeRawUnsafe(`
          INSERT INTO \`v2_kehadiran_pelanggan\` (id, bookingId, method, checkedInAt, recordedById, notes)
          VALUES (?, ?, ?, ?, ?, NULL)
          ON DUPLICATE KEY UPDATE
            checkedInAt = VALUES(checkedInAt)
        `, r.id, r.bookingId, method, r.checkedInAt, r.recordedById);
        stat.migratedCount++;
      } catch (err) {
        stat.errorCount++;
        console.error(`Error migrating kehadiran_pelanggan ${r.id}:`, err);
      }
    }
  } catch (err: any) {
    console.error('KehadiranPelanggan query error:', err.message);
  }
}

async function migrateCheckInToken(isDryRun: boolean) {
  const stat = initStat('v2_check_in_token');
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, bookingId, tokenHash as token, expiresAt,
             (status = 'USED') as isUsed, createdAt
      FROM \`CheckInToken\`
    `);
    stat.sourceCount = rows.length;

    if (isDryRun) return;

    for (const r of rows) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO \`v2_check_in_token\` (id, bookingId, token, expiresAt, isUsed, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            isUsed = VALUES(isUsed)
        `, r.id, r.bookingId, r.token, r.expiresAt, Boolean(r.isUsed), r.createdAt);
        stat.migratedCount++;
      } catch (err) {
        stat.errorCount++;
        console.error(`Error migrating check_in_token ${r.id}:`, err);
      }
    }
  } catch (err: any) {
    console.error('CheckInToken query error:', err.message);
  }
}

async function main() {
  const isExecute = process.argv.includes('--execute');
  const isDryRun = !isExecute;

  console.log(`\n======================================================`);
  console.log(`🚀 DAILY DOSE V2 - DATA MIGRATION (LEAN ARCHITECTURE)`);
  console.log(`Mode: ${isExecute ? '🔥 EXECUTE (MENULIS DATA)' : '🔍 DRY RUN (SIMULASI/AUDIT)'}`);
  console.log(`======================================================\n`);

  if (isDryRun) {
    await runDryRun();
    console.log('\n💡 Untuk menjalankan migrasi data riil, jalankan:');
    console.log('   npm run migrate:lean:execute\n');
    return;
  }

  console.log('⏳ Memulai proses pemindahan data berurutan...\n');

  await ensureTablesCreated();

  // Gelombang 1: Fasilitas
  console.log('--- [Gelombang 1: Fasilitas & Cabang] ---');
  await migrateCabang(isDryRun);
  await migrateStudio(isDryRun);
  await migrateRuangan(isDryRun);
  await migrateJenisKelas(isDryRun);

  // Gelombang 2: User
  console.log('--- [Gelombang 2: Pengguna & Peran] ---');
  await migrateUser(isDryRun);
  await migrateProfilPengguna(isDryRun);
  await migratePenugasanInstruktur(isDryRun);

  // Gelombang 3: Paket & Billing
  console.log('--- [Gelombang 3: Paket & Penjualan] ---');
  await migratePaket(isDryRun);
  await migrateRekeningPembayaran(isDryRun);
  await migrateVoucher(isDryRun);
  await migratePembelian(isDryRun);
  await migrateBuktiPembayaran(isDryRun);
  await migratePaketPelanggan(isDryRun);

  // Gelombang 4: Jadwal & Booking
  console.log('--- [Gelombang 4: Jadwal & Pemesanan Kelas] ---');
  await migrateSlotKelas(isDryRun);
  await migratePemesananKelas(isDryRun);
  await migrateUbahJadwal(isDryRun);

  // Gelombang 5: Kehadiran
  console.log('--- [Gelombang 5: Presensi & Check-in] ---');
  await migrateKehadiranPelanggan(isDryRun);
  await migrateCheckInToken(isDryRun);

  console.log('\n======================================================');
  console.log('📊 REKAPITULASI HASIL MIGRASI DATA:');
  console.log('======================================================');
  console.table(stats);
  console.log('🎉 Migrasi data selesai!');
}

main()
  .catch((e) => {
    console.error('Fatal error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

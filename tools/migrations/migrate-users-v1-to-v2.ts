import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { PrismaClient, Role, UserStatus } from '@prisma/client';

const db = new PrismaClient();

const V1_SQL_PATH = path.resolve(
  process.env.HOME || '/Users/lrmcorporation',
  '.gemini/antigravity-ide/brain/0c5035f9-29c3-48dc-a307-93774adbc341/scratch/dailydose_v1.sql',
);

// Branch mapping will be resolved dynamically from database in main()
let BRANCH_MAP: Record<number, string> = {};
let ALL_BRANCH_IDS: string[] = [];

function v1UserUuid(v1Id: number): string {
  // Special case: preserve Ridho Alamzah's current seed UUID if already exists
  if (v1Id === 1) {
    return '00000000-0000-4000-8000-000000000100';
  }
  return `10000000-0000-4000-8000-${String(v1Id).padStart(12, '0')}`;
}

function parseSqlTuple(str: string): string[] {
  const values: string[] = [];
  let current = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (escape) {
      current += c;
      escape = false;
      continue;
    }
    if (c === '\\') {
      current += c;
      escape = true;
      continue;
    }
    if (c === "'") {
      inString = !inString;
      continue;
    }
    if (c === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += c;
  }
  values.push(current.trim());
  return values;
}

function normalizePhone(raw: string | null): string | null {
  if (!raw || raw === 'NULL') return null;
  let cleaned = raw.replace(/[^0-9+]/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('0')) cleaned = '+62' + cleaned.slice(1);
  else if (cleaned.startsWith('62')) cleaned = '+' + cleaned;
  else if (!cleaned.startsWith('+') && cleaned.length >= 8) cleaned = '+62' + cleaned;

  if (cleaned.length < 9 || cleaned.length > 20) return null;
  return cleaned;
}

function toMysqlDatetime(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === 'NULL') {
    const d = new Date();
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 19);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function escapeSql(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

interface ParsedV1User {
  v1Id: number;
  uuid: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  rawPhone: string | null;
  role: Role;
  status: UserStatus;
  preferredBranchId: string | null;
  createdAt: string;
  updatedAt: string;
  gender: string | null;
  birthDate: string | null;
  address: string | null;
  avatarUrl: string | null;
  notes: string | null;
}

async function main() {
  console.log('🚀 Memulai Migrasi Pengguna & Peran dari Daily Dose V1 ke V2...');
  if (!fs.existsSync(V1_SQL_PATH)) {
    throw new Error(`File V1 SQL tidak ditemukan di: ${V1_SQL_PATH}`);
  }

  // 0. Ambil Cabang Aktif dari Database
  const activeBranches = await db.cabang.findMany({ select: { id: true, code: true, name: true } });
  const branchByCode = new Map(activeBranches.map((b) => [b.code, b.id]));
  BRANCH_MAP = {
    1: branchByCode.get('DD-GG') || activeBranches[0]?.id,
    2: branchByCode.get('DD-MK') || activeBranches[1]?.id,
    3: branchByCode.get('DD-SBY') || activeBranches[2]?.id,
    4: branchByCode.get('DD-UNTAR') || activeBranches[3]?.id,
    5: branchByCode.get('DD-PIK2') || activeBranches[4]?.id,
  };
  ALL_BRANCH_IDS = activeBranches.map((b) => b.id);
  console.log(`📍 Terhubung ke ${activeBranches.length} cabang aktif:`, activeBranches.map((b) => b.code).join(', '));

  // 1. Baca Role Mappings dari V1
  console.log('📖 [1/5] Membaca pemetaan peran (model_has_roles) dari V1...');
  const userRoles = new Map<number, Set<number>>();

  const rl = readline.createInterface({
    input: fs.createReadStream(V1_SQL_PATH),
    crlfDelay: Infinity,
  });

  const rawUserTuples: string[] = [];

  for await (const line of rl) {
    if (line.includes('INSERT INTO `model_has_roles`')) {
      const matches = line.matchAll(/\((\d+),'App\\\\Models\\\\User',(\d+)\)/g);
      for (const m of matches) {
        const roleId = parseInt(m[1], 10);
        const userId = parseInt(m[2], 10);
        if (!userRoles.has(userId)) userRoles.set(userId, new Set());
        userRoles.get(userId)!.add(roleId);
      }
    }

    if (line.startsWith('INSERT INTO `users` VALUES ')) {
      const content = line.slice('INSERT INTO `users` VALUES '.length);
      let inTuple = false;
      let inString = false;
      let escape = false;
      let currentTuple = '';

      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (escape) {
          currentTuple += char;
          escape = false;
          continue;
        }
        if (char === '\\') {
          currentTuple += char;
          escape = true;
          continue;
        }
        if (char === "'") {
          inString = !inString;
          currentTuple += char;
          continue;
        }
        if (char === '(' && !inString) {
          inTuple = true;
          currentTuple = '';
          continue;
        }
        if (char === ')' && !inString && inTuple) {
          inTuple = false;
          rawUserTuples.push(currentTuple);
          currentTuple = '';
          continue;
        }
        if (inTuple) {
          currentTuple += char;
        }
      }
    }
  }

  console.log(`✅ Ditemukan ${rawUserTuples.length} baris pengguna dan ${userRoles.size} mapping peran.`);

  // 2. Transformasi Data Pengguna
  console.log('⚙️ [2/5] Mentransformasi data pengguna dan menyelesaikan nomor telepon...');
  const claimedPhones = new Set<string>();
  const claimedEmails = new Set<string>();
  const usersToInsert: ParsedV1User[] = [];
  const coachesList: ParsedV1User[] = [];

  for (const tupleStr of rawUserTuples) {
    const v = parseSqlTuple(tupleStr);
    const v1Id = parseInt(v[0], 10);
    const rawName = v[1];
    const rawEmail = v[2];
    const passwordHash = v[4];
    const createdAt = toMysqlDatetime(v[6]);
    const updatedAt = toMysqlDatetime(v[7]);
    const rawPhone = v[8] && v[8] !== 'NULL' ? v[8] : null;
    const rawAddress = v[9] && v[9] !== 'NULL' ? v[9] : null;
    const rawStatus = v[10];
    const rawAvatar = v[11] && v[11] !== 'NULL' ? v[11] : null;
    const rawDeletedAt = v[12] && v[12] !== 'NULL' ? v[12] : null;
    const rawGender = v[13];
    const rawBirthDate = v[15] && v[15] !== 'NULL' ? v[15] : null;
    const rawLocationId = v[16] && v[16] !== 'NULL' ? parseInt(v[16], 10) : null;
    const rawKtp = v[18] && v[18] !== 'NULL' ? v[18] : null;
    const rawSelfie = v[19] && v[19] !== 'NULL' ? v[19] : null;
    const rawNik = v[20] && v[20] !== 'NULL' ? v[20] : null;
    const rawBarcode = v[21] && v[21] !== 'NULL' ? v[21] : null;
    const rawGoogleId = v[22] && v[22] !== 'NULL' ? v[22] : null;

    if (!rawEmail || rawEmail === 'NULL') {
      continue;
    }

    const email = rawEmail.toLowerCase().trim();
    if (claimedEmails.has(email)) {
      continue;
    }
    claimedEmails.add(email);

    const name = rawName.trim() || 'Member Daily Dose';
    const uuid = v1UserUuid(v1Id);

    // Resolusi Telepon Unik
    const normalizedPhone = normalizePhone(rawPhone);
    let finalPhone: string | null = null;
    if (normalizedPhone && !claimedPhones.has(normalizedPhone)) {
      claimedPhones.add(normalizedPhone);
      finalPhone = normalizedPhone;
    }

    // Role mapping
    const roles = userRoles.get(v1Id) || new Set<number>();
    let role: Role = Role.MEMBER;
    if (roles.has(1)) {
      role = Role.SUPERADMIN;
    } else if (roles.has(4) || roles.has(5) || roles.has(6) || roles.has(7)) {
      role = Role.ADMIN;
    } else if (roles.has(2)) {
      role = Role.COACH;
    }

    // Status mapping
    let status: UserStatus = UserStatus.ACTIVE;
    if (rawDeletedAt) {
      status = UserStatus.INACTIVE;
    } else if (rawStatus === '0') {
      status = UserStatus.INACTIVE;
    }

    // Preferred Branch
    const preferredBranchId = rawLocationId && BRANCH_MAP[rawLocationId] ? BRANCH_MAP[rawLocationId] : null;

    // Gender
    let gender: string | null = null;
    if (rawGender === '1') gender = 'MALE';
    else if (rawGender === '0') gender = 'FEMALE';

    // BirthDate validation
    let birthDate: string | null = null;
    if (rawBirthDate && /^\d{4}-\d{2}-\d{2}$/.test(rawBirthDate) && !rawBirthDate.startsWith('0000')) {
      birthDate = rawBirthDate;
    }

    // Notes
    const noteParts: string[] = [];
    if (rawPhone && rawPhone !== finalPhone) noteParts.push(`No HP V1: ${rawPhone}`);
    if (rawNik) noteParts.push(`NIK: ${rawNik}`);
    if (rawBarcode) noteParts.push(`Barcode: ${rawBarcode}`);
    if (rawKtp) noteParts.push(`KTP File: ${rawKtp}`);
    if (rawSelfie) noteParts.push(`Selfie File: ${rawSelfie}`);
    if (rawGoogleId) noteParts.push(`Google ID: ${rawGoogleId}`);
    noteParts.push(`V1 User ID: ${v1Id}`);

    const parsed: ParsedV1User = {
      v1Id,
      uuid,
      name,
      email,
      passwordHash,
      phone: finalPhone,
      rawPhone,
      role,
      status,
      preferredBranchId,
      createdAt,
      updatedAt,
      gender,
      birthDate,
      address: rawAddress,
      avatarUrl: rawAvatar,
      notes: noteParts.length > 0 ? noteParts.join(' | ') : null,
    };

    usersToInsert.push(parsed);
    if (role === Role.COACH) {
      coachesList.push(parsed);
    }
  }

  console.log(`✅ Siap memproses ${usersToInsert.length} pengguna (termasuk ${coachesList.length} instruktur).`);

  // 3. Pembersihan Data Dummy TERLEBIH DAHULU (Sebelum Insert Pengguna V1)
  console.log('🧹 [3/5] Membersihkan seluruh data dummy dan menyiapkan instruktur utama...');
  // First authentic coach: Devi (ID 3 in V1)
  const primaryCoach = coachesList.find((c) => c.v1Id === 3) || coachesList[0];
  console.log(`   Instruktur Utama untuk slot fallback: ${primaryCoach.name} (${primaryCoach.email}) [${primaryCoach.uuid}]`);

  // Pastikan primary coach sudah ada di v2_user agar relasi slot tidak error
  await db.$executeRawUnsafe(`
    INSERT INTO v2_user (id, email, phone, name, passwordHash, role, status, preferredBranchId, createdAt, updatedAt)
    VALUES (${escapeSql(primaryCoach.uuid)}, ${escapeSql(primaryCoach.email)}, ${escapeSql(primaryCoach.phone)}, ${escapeSql(primaryCoach.name)}, ${escapeSql(primaryCoach.passwordHash)}, '${primaryCoach.role}', '${primaryCoach.status}', ${escapeSql(primaryCoach.preferredBranchId)}, ${escapeSql(primaryCoach.createdAt)}, ${escapeSql(primaryCoach.updatedAt)})
    ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), status = VALUES(status);
  `);

  const DUMMY_USER_EMAILS = [
    'admin@dailydose.local',
    'instructor@dailydose.local',
    'instructor.jakarta.2@dailydose.local',
    'instructor.bsd.2@dailydose.local',
    'customer@dailydose.local',
    'customer.no.phone@dailydose.local',
  ];

  const dummyUsers = await db.user.findMany({
    where: { email: { in: DUMMY_USER_EMAILS } },
    select: { id: true, email: true },
  });

  const dummyUserIds = dummyUsers.map((u) => u.id);

  if (dummyUserIds.length > 0) {
    console.log(`   Ditemukan ${dummyUserIds.length} user dummy untuk dibersihkan:`, dummyUsers.map((u) => u.email).join(', '));

    // Remap slot kelas dummy ke primary coach
    const remappedSlots = await db.slotKelas.updateMany({
      where: { instructorId: { in: dummyUserIds } },
      data: { instructorId: primaryCoach.uuid },
    });
    console.log(`   Mengalihkan ${remappedSlots.count} slot kelas dummy ke instruktur asli: ${primaryCoach.name}`);

    // Hapus transaksi dan booking dummy
    await db.pemesananKelas.deleteMany({
      where: { userId: { in: dummyUserIds } },
    });
    await db.pembelian.deleteMany({
      where: { userId: { in: dummyUserIds } },
    });
    await db.paketPelanggan.deleteMany({
      where: { userId: { in: dummyUserIds } },
    });

    // Hapus penugasan, sesi, profil dummy
    await db.penugasanInstruktur.deleteMany({
      where: { coachId: { in: dummyUserIds } },
    });
    await db.userSession.deleteMany({
      where: { userId: { in: dummyUserIds } },
    });
    await db.profilPengguna.deleteMany({
      where: { userId: { in: dummyUserIds } },
    });

    // Hapus user dummy
    const deleted = await db.user.deleteMany({
      where: { id: { in: dummyUserIds } },
    });
    console.log(`   ✅ Berhasil menghapus ${deleted.count} user dummy dari tabel v2_user.`);
  }

  // 4. Batch Insertion Pengguna V1
  console.log('💾 [4/5] Memasukkan data pengguna ke tabel v2_user dan v2_profil_pengguna...');
  const BATCH_SIZE = 250;

  for (let i = 0; i < usersToInsert.length; i += BATCH_SIZE) {
    const batch = usersToInsert.slice(i, i + BATCH_SIZE);

    // Multi-row insert untuk v2_user
    const userValues = batch.map((u) => {
      return `(${escapeSql(u.uuid)}, ${escapeSql(u.email)}, ${escapeSql(u.phone)}, ${escapeSql(u.name)}, ${escapeSql(u.passwordHash)}, '${u.role}', '${u.status}', ${escapeSql(u.preferredBranchId)}, ${escapeSql(u.createdAt)}, ${escapeSql(u.updatedAt)})`;
    });

    const userSql = `
      INSERT INTO v2_user (id, email, phone, name, passwordHash, role, status, preferredBranchId, createdAt, updatedAt)
      VALUES ${userValues.join(',\n')}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = COALESCE(VALUES(phone), phone),
        role = VALUES(role),
        status = VALUES(status),
        preferredBranchId = COALESCE(VALUES(preferredBranchId), preferredBranchId),
        passwordHash = COALESCE(VALUES(passwordHash), passwordHash);
    `;

    await db.$executeRawUnsafe(userSql);

    // Ambil UUID yang benar-benar ada di v2_user untuk batch ini
    const batchEmails = batch.map((u) => u.email);
    const existingUsersInDb = await db.user.findMany({
      where: { email: { in: batchEmails } },
      select: { id: true, email: true },
    });
    const emailToActualUuid = new Map(existingUsersInDb.map((eu) => [eu.email, eu.id]));

    // Multi-row insert untuk v2_profil_pengguna menggunakan actual UUID
    const validProfiles = batch
      .map((u) => {
        const actualUuid = emailToActualUuid.get(u.email);
        if (!actualUuid) return null;
        const profileId = actualUuid;
        const bDate = u.birthDate ? `'${u.birthDate}'` : 'NULL';
        return `(${escapeSql(profileId)}, ${escapeSql(actualUuid)}, ${escapeSql(u.name)}, ${escapeSql(u.gender)}, ${bDate}, ${escapeSql(u.avatarUrl)}, ${escapeSql(u.address)}, NULL, ${escapeSql(u.rawPhone)}, ${escapeSql(u.notes)}, ${escapeSql(u.createdAt)}, ${escapeSql(u.updatedAt)})`;
      })
      .filter((sql): sql is string => sql !== null);

    if (validProfiles.length > 0) {
      const profileSql = `
        INSERT INTO v2_profil_pengguna (id, userId, fullName, gender, birthDate, avatarUrl, address, emergencyContactName, emergencyContactPhone, notes, createdAt, updatedAt)
        VALUES ${validProfiles.join(',\n')}
        ON DUPLICATE KEY UPDATE
          fullName = VALUES(fullName),
          gender = VALUES(gender),
          birthDate = VALUES(birthDate),
          address = VALUES(address),
          emergencyContactPhone = VALUES(emergencyContactPhone),
          notes = VALUES(notes);
      `;

      await db.$executeRawUnsafe(profileSql);
    }

    if ((i + BATCH_SIZE) % 1000 < BATCH_SIZE || i + BATCH_SIZE >= usersToInsert.length) {
      console.log(`   Progress: ${Math.min(i + BATCH_SIZE, usersToInsert.length)} / ${usersToInsert.length} pengguna diproses.`);
    }
  }

  // 5. Penugasan Instruktur ke Cabang
  console.log('🥋 [5/5] Mengatur penugasan seluruh 70 instruktur ke cabang...');
  for (const coach of coachesList) {
    const targetBranches = coach.preferredBranchId ? [coach.preferredBranchId, ...ALL_BRANCH_IDS] : ALL_BRANCH_IDS;
    const uniqueBranches = Array.from(new Set(targetBranches));

    for (const branchId of uniqueBranches) {
      await db.penugasanInstruktur.upsert({
        where: {
          coachId_branchId: {
            coachId: coach.uuid,
            branchId,
          },
        },
        update: { active: true },
        create: {
          coachId: coach.uuid,
          branchId,
          active: true,
        },
      });
    }
  }

  // 6. Ringkasan & Verifikasi
  console.log('\n📊 === VERIFIKASI AKHIR MIGRASI PENGGUNA ===');
  const totalUsers = await db.user.count();
  const superAdmins = await db.user.count({ where: { role: Role.SUPERADMIN } });
  const admins = await db.user.count({ where: { role: Role.ADMIN } });
  const coaches = await db.user.count({ where: { role: Role.COACH } });
  const members = await db.user.count({ where: { role: Role.MEMBER } });
  const remainingDummies = await db.user.count({
    where: { email: { endsWith: '.local' } },
  });
  const totalAssignments = await db.penugasanInstruktur.count();

  console.log(`- Total Pengguna di v2_user: ${totalUsers}`);
  console.log(`  * Super Admin: ${superAdmins}`);
  console.log(`  * Admin Cabang & Staf: ${admins}`);
  console.log(`  * Instruktur / Coach: ${coaches}`);
  console.log(`  * Customer / Member: ${members}`);
  console.log(`- Penugasan Instruktur Aktif: ${totalAssignments}`);
  console.log(`- Pengguna Dummy Tersisa: ${remainingDummies}`);

  if (remainingDummies === 0 && totalUsers >= 9000) {
    console.log('\n🎉 MIGRASI PENGGUNA & PERAN SELESAI DENGAN SUKSES 100% TANPA DATA DUMMY!');
  } else {
    console.warn('\n⚠️ Perhatian: Mohon periksa kembali data di atas.');
  }
}

main()
  .catch((err) => {
    console.error('❌ Terjadi kesalahan saat migrasi:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

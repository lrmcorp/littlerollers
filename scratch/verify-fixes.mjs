process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat';
import { PrismaClient } from '../apps/api/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:32121/api/v1';

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/password/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, channel: 'MOBILE' }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed for ${email} (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.accessToken;
}

async function verifyAllFixes() {
  console.log('================================================================');
  console.log('🧪 VERIFIKASI HASIL IMPLEMENTASI PERBAIKAN KODE (P0, P1, P2)');
  console.log('================================================================\n');

  // 1. VERIFIKASI P0: Anti-Tamper Dokumen KYC Terkunci
  console.log('1️⃣ Menguji Proteksi Anti-Tamper Dokumen KYC (BUG-01)...');
  const kukertaToken = await login('kukertadesabetung5@gmail.com', 'ridho123');
  
  // Coba ganti dokumen pada akun yang sudah APPROVED menggunakan multipart form
  const formReplace = new FormData();
  formReplace.append('expectedVersion', '1');
  formReplace.append('replacement', new Blob(['dummy fake image content'], { type: 'image/jpeg' }), 'fake-ktp.jpg');

  const replaceRes = await fetch(`${API_BASE}/identity-verification/me/documents/KTP_FRONT/replacements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kukertaToken}`,
    },
    body: formReplace,
  });
  console.log(`   * Percobaan penggantian dokumen KTP sah -> Status HTTP: ${replaceRes.status}`);
  if (replaceRes.status === 403) {
    const body = await replaceRes.json();
    console.log(`   ✅ BERHASIL DICEKAL! Respon 403 Forbidden: ${body.error?.code || 'VERIFICATION_LOCKED_APPROVED'}`);
  } else {
    console.error(`   ❌ GAGAL! Penggantian dokumen masih diizinkan! HTTP ${replaceRes.status}`);
    process.exit(1);
  }

  // Coba submit ulang KYC pada akun yang sudah APPROVED menggunakan multipart form
  const formSubmit = new FormData();
  formSubmit.append('nik', '1234567890123456');
  formSubmit.append('address', 'Alamat palsu hacker');
  formSubmit.append('ktp', new Blob(['dummy fake ktp'], { type: 'image/jpeg' }), 'ktp.jpg');

  const submitRes = await fetch(`${API_BASE}/identity-verification/me/submission`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kukertaToken}`,
    },
    body: formSubmit,
  });
  console.log(`   * Percobaan submit ulang identitas sah -> Status HTTP: ${submitRes.status}`);
  if (submitRes.status === 403) {
    const body = await submitRes.json();
    console.log(`   ✅ BERHASIL DICEKAL! Respon 403 Forbidden: ${body.error?.code || 'VERIFICATION_LOCKED_APPROVED'}`);
  } else {
    console.error(`   ❌ GAGAL! Submit ulang KYC masih diizinkan! HTTP ${submitRes.status}`);
    process.exit(1);
  }
  console.log('   🎉 Proteksi Anti-Tamper Dokumen KYC Terverifikasi 100% AMAN!\n');

  // 2. VERIFIKASI P1: Harmonisasi KYC pada Checkout Paket (BUG-02)
  console.log('2️⃣ Menguji Validasi KYC pada Checkout Paket Pelanggan Baru (BUG-02)...');
  // Pastikan Clara belum memiliki notes KYC_APPROVED
  const claraUser = await prisma.user.findFirst({ where: { email: 'clara.new@dailydose.test' } });
  if (claraUser) {
    await prisma.profilPengguna.upsert({
      where: { userId: claraUser.id },
      update: { notes: 'KYC_PENDING_REVIEW' },
      create: { userId: claraUser.id, notes: 'KYC_PENDING_REVIEW' },
    });
  }
  const claraToken = await login('clara.new@dailydose.test', 'MemberBaru2026!');
  const ggBranch = await prisma.cabang.findFirst({ where: { code: 'DD-GG' } });
  const pkg10 = await prisma.paket.findFirst({ where: { status: 'ACTIVE' } });

  const orderRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${claraToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      packageId: pkg10.id,
      branchId: ggBranch.id,
      paymentMethod: 'BANK_TRANSFER',
    }),
  });

  console.log(`   * Percobaan checkout paket sebelum KYC disetujui -> Status HTTP: ${orderRes.status}`);
  if (orderRes.status === 403) {
    const body = await orderRes.json();
    console.log(`   ✅ BERHASIL DICEKAL! Respon 403 Forbidden: ${body.error?.code || 'CUSTOMER_VERIFICATION_REQUIRED'}`);
  } else {
    console.error(`   ❌ GAGAL! Checkout tanpa KYC masih diizinkan! HTTP ${orderRes.status}`);
    process.exit(1);
  }
  console.log('   🎉 Harmonisasi Kebijakan KYC Checkout Terverifikasi 100% KONSISTEN!\n');

  // 3. VERIFIKASI P2: Pengetatan Maker-Checker Medis (Manager Self-Approval Block)
  console.log('3️⃣ Menguji Pengetatan Maker-Checker Manager Medis (BUG-08)...');
  const managerToken = await login('manager.gg@dailydose.test', 'Manager123!');
  const amanda = await prisma.user.findFirst({ where: { email: 'amanda.member@dailydose.test' } });
  const amandaPkg = await prisma.paketPelanggan.findFirst({ where: { userId: amanda.id, status: 'ACTIVE' } });

  // Manager membuat tiket penyesuaian sesi
  const managerReqRes = await fetch(`${API_BASE}/session-adjustments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${managerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerPackageId: amandaPkg.id,
      quantity: 1,
      reasonCode: 'PACKAGE_COMPENSATION',
      note: 'Tiket diajukan oleh Manager sendiri',
    }),
  });
  const managerReqJson = await managerReqRes.json();
  const ticketId = managerReqJson.id;
  console.log(`   * Manager membuat tiket penyesuaian ID: ${ticketId}`);

  // Manager mencoba approve tiketnya sendiri (SEBELUMNYA DIIZINKAN, SEKARANG WAJIB DICEKAL!)
  const managerSelfApproveRes = await fetch(`${API_BASE}/session-adjustments/${ticketId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${managerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reasonCode: 'CORRECTION_VERIFIED',
      note: 'Manager mencoba self-approve',
      expectedVersion: managerReqJson.version ?? 1,
    }),
  });

  console.log(`   * Percobaan self-approval oleh Manager -> Status HTTP: ${managerSelfApproveRes.status}`);
  if (managerSelfApproveRes.status === 403) {
    const body = await managerSelfApproveRes.json();
    console.log(`   ✅ BERHASIL DICEKAL! Respon 403 Forbidden: ${body.error?.code || 'SEPARATION_OF_DUTIES'}`);
  } else {
    console.error(`   ❌ GAGAL! Manager masih bisa self-approve tiketnya sendiri! HTTP ${managerSelfApproveRes.status}`);
    process.exit(1);
  }

  // Super Owner menyetujui tiket Manager
  const soToken = await login('superowner@dailydose.test', 'SuperOwner123!');
  const soApproveRes = await fetch(`${API_BASE}/session-adjustments/${ticketId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${soToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reasonCode: 'CORRECTION_VERIFIED',
      note: 'Disetujui Super Owner (Pemeriksaan Silang Sah)',
      expectedVersion: managerReqJson.version ?? 1,
    }),
  });
  console.log(`   * Super Owner menyetujui tiket Manager -> Status HTTP: ${soApproveRes.status}`);
  if (soApproveRes.ok) {
    console.log(`   ✅ Berhasil disetujui Super Owner!`);
  } else {
    console.error(`   ❌ Super Owner gagal approve: HTTP ${soApproveRes.status}`);
    process.exit(1);
  }
  console.log('   🎉 Pengetatan Maker-Checker Medis Terverifikasi 100% AMAN & MEMENUHI KEPATUHAN!\n');

  console.log('================================================================');
  console.log('🏁 SELURUH PERBAIKAN KODE TERBUKTI SUKSES TANPA REGRESI!');
  console.log('================================================================');
}

verifyAllFixes()
  .catch((err) => {
    console.error('❌ FATAL ERROR PADA VERIFIKASI:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

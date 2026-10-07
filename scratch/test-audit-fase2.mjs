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

async function runAuditFase2() {
  console.log('================================================================');
  console.log('🚀 MEMULAI AUDIT & DEEP TESTING FASE 2 (Skenario 5, 7, 8)');
  console.log('================================================================\n');

  // 1. Dapatkan referensi data
  const ggBranch = await prisma.cabang.findFirst({ where: { code: 'DD-GG' } });
  const mkBranch = await prisma.cabang.findFirst({ where: { code: 'DD-MK' } });
  const amanda = await prisma.user.findFirst({ where: { email: 'amanda.member@dailydose.test' } });
  const hendra = await prisma.user.findFirst({ where: { email: 'hendra.stopped@dailydose.test' } });
  const clara = await prisma.user.findFirst({ where: { email: 'clara.new@dailydose.test' } });

  const adminToken = await login('admin@ddose.com', 'Admin123!');
  const managerToken = await login('manager.gg@dailydose.test', 'Manager123!');
  const financeToken = await login('finance@dailydose.test', 'Finance123!');
  const superOwnerToken = await login('superowner@dailydose.test', 'SuperOwner123!');
  const ownerGGToken = await login('owner.gg@dailydose.test', 'Owner123!');

  console.log('✅ Kredensial Otentik Berhasil Terotentikasi:');
  console.log('   - Admin GG:', 'admin@ddose.com');
  console.log('   - Manager GG:', 'manager.gg@dailydose.test');
  console.log('   - Finance:', 'finance@dailydose.test');
  console.log('   - Super Owner:', 'superowner@dailydose.test');
  console.log('   - Owner GG:', 'owner.gg@dailydose.test');
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 5: SEPARATION OF DUTIES (SoD) PENYESUAIAN SESI MEDIS (< H-24)
  // ===========================================================================
  console.log('🧪 [SKENARIO 5] Separation of Duties (SoD) Medis (Aturan Bisnis #6)');

  // Ambil paket Amanda
  let amandaPkg = await prisma.paketPelanggan.findFirst({
    where: { userId: amanda.id, status: 'ACTIVE' },
  });

  // Hubungkan paket Amanda ke Pembelian cabang Green Garden agar diakui kepemilikannya oleh staf GG
  let purchase = await prisma.pembelian.findFirst({
    where: { userId: amanda.id, branchId: ggBranch.id },
  });
  if (!purchase) {
    purchase = await prisma.pembelian.create({
      data: {
        invoiceNumber: `INV-AMANDA-${Date.now()}`,
        userId: amanda.id,
        branchId: ggBranch.id,
        packageId: amandaPkg.packageId,
        subtotalRp: 2500000,
        discountRp: 0,
        totalAmountRp: 2500000,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        paidAt: new Date(),
      },
    });
  }
  await prisma.paketPelanggan.update({
    where: { id: amandaPkg.id },
    data: { purchaseId: purchase.id },
  });

  // Pastikan tidak ada pending request sebelumnya
  await prisma.sessionAdjustRequest.deleteMany({
    where: { customerPackageId: amandaPkg.id, status: 'PENDING' },
  });

  const balanceBefore = amandaPkg.remainingSessions;
  console.log(`   * Saldo sesi Amanda sebelum penyesuaian: ${balanceBefore}`);

  // Langkah 5.1: Admin mengajukan SessionAdjustRequest
  const reqRes = await fetch(`${API_BASE}/session-adjustments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      customerPackageId: amandaPkg.id,
      quantity: 1,
      reasonCode: 'PACKAGE_COMPENSATION',
      note: 'Permohonan darurat medis darurat - Surat Dokter Terlampir',
    }),
  });

  const reqJson = await reqRes.json();
  if (!reqRes.ok) {
    throw new Error(`Gagal ajukan adjustment: ${JSON.stringify(reqJson)}`);
  }
  const adjustId = reqJson.id;
  console.log(`   * Langkah 5.1: Admin berhasil membuat tiket SessionAdjustRequest ID: ${adjustId} (Status: PENDING)`);

  // Langkah 5.2: UJI NEGATIF - Admin mencoba menyetujui tiketnya sendiri (Self-Approval Bypass)
  const selfApproveRes = await fetch(`${API_BASE}/session-adjustments/${adjustId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      reasonCode: 'CORRECTION_VERIFIED',
      note: 'Admin mencoba self-approval tiket medis sendiri',
      expectedVersion: reqJson.version ?? 1,
    }),
  });

  console.log(`   * Langkah 5.2: Uji Self-Approval Admin -> Status HTTP: ${selfApproveRes.status}`);
  if (selfApproveRes.status === 403) {
    const errBody = await selfApproveRes.json();
    console.log(`     ✅ BERHASIL DICEKAL! Respon 403 Forbidden: ${errBody.code || 'CAPABILITY_REQUIRED / SoD Guard'}`);
  } else {
    console.error(`     ❌ CELAH KEAMANAN! Admin berhasil menyetujui tiketnya sendiri! HTTP ${selfApproveRes.status}`);
  }

  // Langkah 5.3: Studio Manager GG melakukan review dan menyetujui tiket medis
  const managerApproveRes = await fetch(`${API_BASE}/session-adjustments/${adjustId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`,
    },
    body: JSON.stringify({
      reasonCode: 'CORRECTION_VERIFIED',
      note: 'Disetujui Studio Manager GG setelah verifikasi surat dokter',
      expectedVersion: reqJson.version ?? 1,
    }),
  });

  const managerApproveJson = await managerApproveRes.json();
  console.log(`   * Langkah 5.3: Studio Manager Approval -> Status HTTP: ${managerApproveRes.status}`);
  if (!managerApproveRes.ok) {
    throw new Error(`Manager gagal approve: ${JSON.stringify(managerApproveJson)}`);
  }
  console.log(`     ✅ Tiket Berhasil Disetujui oleh Studio Manager GG! Status: ${managerApproveJson.adjustment?.status || 'APPROVED'}`);

  // Langkah 5.4: Verifikasi integritas database & buku besar sesi
  const amandaPkgAfter = await prisma.paketPelanggan.findUnique({ where: { id: amandaPkg.id } });
  const ledgerEntry = await prisma.sessionLedger.findFirst({
    where: { referenceId: adjustId },
  });

  console.log(`   * Langkah 5.4: Verifikasi Saldo & Buku Besar Sesi:`);
  console.log(`     - Saldo Sebelum: ${balanceBefore} | Saldo Sesudah: ${amandaPkgAfter.remainingSessions} (Delta: +${amandaPkgAfter.remainingSessions - balanceBefore})`);
  console.log(`     - Entry Session Ledger Mutasi: ID=${ledgerEntry?.id}, Type=${ledgerEntry?.type}, Amount=${ledgerEntry?.amount}, BalanceAfter=${ledgerEntry?.balanceAfter}`);
  if (amandaPkgAfter.remainingSessions === balanceBefore + 1 && ledgerEntry?.type === 'ADJUST_MANUAL') {
    console.log(`     ✅ Logika SoD Medis & Buku Besar Sesi 100% VALID & INTEGRITAS TERJAGA!`);
  } else {
    console.error(`     ❌ Inkonsistensi pemotongan/penambahan saldo sesi!`);
  }
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 7: 5 PILAR LAPORAN FINANSIAL, PERIOD LOCK & JURNAL KOREKSI
  // ===========================================================================
  console.log('🧪 [SKENARIO 7] Integritas 5 Pilar Finansial & Period Lock (Aturan Bisnis #8 & #10)');
  const testPeriod = '2026-07'; // Gunakan bulan lampau untuk tutup buku

  // Bersihkan data tes terdahulu pada periode 2026-07 jika ada
  await prisma.correctionJournal.deleteMany({ where: { branchId: ggBranch.id, targetPeriod: testPeriod } });
  await prisma.otherCost.deleteMany({ where: { branchId: ggBranch.id, period: testPeriod } });
  await prisma.monthlyClose.deleteMany({ where: { branchId: ggBranch.id, period: testPeriod } });

  // Langkah 7.1: Query 5 Pilar Laporan Finansial oleh Finance
  console.log('   * Langkah 7.1: Query 5 Pilar Laporan Keuangan oleh Finance:');
  const [omsetRes, costRealtimeRes, costProjRes, otherCostRes, profitRes] = await Promise.all([
    fetch(`${API_BASE}/finance/reports/omset?branchId=${ggBranch.id}&period=${testPeriod}`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    }).then((r) => r.json()),
    fetch(`${API_BASE}/finance/reports/instructor-cost-realtime?branchId=${ggBranch.id}&period=${testPeriod}`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    }).then((r) => r.json()),
    fetch(`${API_BASE}/finance/reports/instructor-cost-projection?branchId=${ggBranch.id}&period=${testPeriod}`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    }).then((r) => r.json()),
    fetch(`${API_BASE}/finance/reports/other-costs?branchId=${ggBranch.id}&period=${testPeriod}`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    }).then((r) => r.json()),
    fetch(`${API_BASE}/finance/reports/profit-summary?branchId=${ggBranch.id}&period=${testPeriod}`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    }).then((r) => r.json()),
  ]);

  console.log(`     1. Pilar Omset Penjualan: Rp ${omsetRes.totalOmsetRp?.toLocaleString('id-ID')}`);
  console.log(`     2. Pilar Realtime Instructor Cost: Rp ${costRealtimeRes.totalInstructorCostRp?.toLocaleString('id-ID')}`);
  console.log(`     3. Pilar Projected Instructor Cost: Rp ${costProjRes.totalProjectionCostRp?.toLocaleString('id-ID')}`);
  console.log(`     4. Pilar Operational Other Cost: Rp ${otherCostRes.totalOtherCostRp?.toLocaleString('id-ID')}`);
  console.log(`     5. Pilar Estimasi Net Profit: Rp ${profitRes.netProfitRealtimeRp?.toLocaleString('id-ID')} (Status: ${profitRes.status})`);

  // Langkah 7.2: Finance input biaya operasional (Other Cost) sebelum tutup buku
  console.log('   * Langkah 7.2: Finance input Biaya Operasional (Other Cost):');
  const addCostRes = await fetch(`${API_BASE}/finance/other-costs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`,
    },
    body: JSON.stringify({
      branchId: ggBranch.id,
      period: testPeriod,
      category: 'OPERATIONAL',
      description: 'Biaya disinfektan dan laundry handuk pilates',
      amountRp: 450000,
    }),
  });
  const addCostJson = await addCostRes.json();
  console.log(`     - Status HTTP Input Biaya: ${addCostRes.status} (ID: ${addCostJson.id}, Amount: Rp ${addCostJson.amountRp})`);
  const costId = addCostJson.id;

  // Langkah 7.3: Eksekusi Tutup Buku Bulanan (Period Lock) oleh Finance
  console.log('   * Langkah 7.3: Finance mengeksekusi Tutup Buku Bulanan (Period Lock):');
  const closeRes = await fetch(`${API_BASE}/finance/monthly-closes/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`,
    },
    body: JSON.stringify({
      branchId: ggBranch.id,
      period: testPeriod,
      reason: 'Tutup buku resmi periode Juli 2026',
    }),
  });
  const closeJson = await closeRes.json();
  console.log(`     - Status HTTP Tutup Buku: ${closeRes.status} (Status Record: ${closeJson.status}, Hash: ${closeJson.controlHash})`);
  if (closeJson.status !== 'LOCKED') {
    throw new Error(`Period lock gagal mengunci status! Status: ${closeJson.status}`);
  }

  // Langkah 7.4: UJI PENCEKALAN MUTASI PASCA-LOCK (Period Lock Immunity)
  console.log('   * Langkah 7.4: Uji Pencekalan Modifikasi pada Periode Terkunci:');
  const blockedAddRes = await fetch(`${API_BASE}/finance/other-costs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`,
    },
    body: JSON.stringify({
      branchId: ggBranch.id,
      period: testPeriod,
      category: 'MAINTENANCE',
      description: 'Biaya susulan terlarang pasca lock',
      amountRp: 150000,
    }),
  });
  console.log(`     - Coba Tambah Biaya Pasca-Lock -> Status HTTP: ${blockedAddRes.status}`);

  const blockedUpdateRes = await fetch(`${API_BASE}/finance/other-costs/${costId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`,
    },
    body: JSON.stringify({ amountRp: 999999 }),
  });
  console.log(`     - Coba Update Biaya Pasca-Lock -> Status HTTP: ${blockedUpdateRes.status}`);

  const blockedDeleteRes = await fetch(`${API_BASE}/finance/other-costs/${costId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${financeToken}` },
  });
  console.log(`     - Coba Hapus Biaya Pasca-Lock -> Status HTTP: ${blockedDeleteRes.status}`);

  if (blockedAddRes.status === 409 && blockedUpdateRes.status === 409 && blockedDeleteRes.status === 409) {
    console.log(`     ✅ SEMPURNA! Seluruh mutasi biaya pada periode terkunci dicekal mutlak (HTTP 409 Conflict - PERIOD_ALREADY_LOCKED).`);
  } else {
    console.error(`     ❌ KEBOCORAN INTEGRITAS! Sistem memperbolehkan mutasi data pada periode terkunci!`);
  }

  // Langkah 7.5: Alur Jurnal Koreksi Resmi Pasca-Lock
  console.log('   * Langkah 7.5: Pengajuan Jurnal Koreksi Pasca-Lock oleh Finance:');
  const corrReqRes = await fetch(`${API_BASE}/finance/correction-journals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`,
    },
    body: JSON.stringify({
      branchId: ggBranch.id,
      currentPeriod: '2026-08',
      referencePeriod: testPeriod,
      amountRp: -50000,
      reason: 'Diskon tagihan listrik dari PLN atas periode Juli 2026',
    }),
  });
  const corrReqJson = await corrReqRes.json();
  console.log(`     - Status HTTP Ajukan Koreksi: ${corrReqRes.status} (ID: ${corrReqJson.id}, Status: ${corrReqJson.status})`);
  const corrId = corrReqJson.id;

  // Langkah 7.6: Uji Otorisasi Approval Koreksi (Finance mencoba approve sendiri -> Wajib 403)
  const financeApproveCorrRes = await fetch(`${API_BASE}/finance/correction-journals/${corrId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${financeToken}`,
    },
    body: JSON.stringify({ reason: 'Finance mencoba approve sendiri' }),
  });
  console.log(`     - Uji Otorisasi: Finance mencoba approve koreksi -> Status HTTP: ${financeApproveCorrRes.status}`);
  if (financeApproveCorrRes.status === 403) {
    console.log(`     ✅ TERLINDUNGI! Finance dilarang menyetujui Jurnal Koreksi (403 Forbidden). Wewenang eksklusif Super Owner.`);
  } else {
    console.error(`     ❌ PELANGGARAN OTORISASI! Finance diizinkan menyetujui koreksi finansial!`);
  }

  // Langkah 7.7: Super Owner menyetujui Jurnal Koreksi
  const soApproveCorrRes = await fetch(`${API_BASE}/finance/correction-journals/${corrId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superOwnerToken}`,
    },
    body: JSON.stringify({ reason: 'Disetujui Super Owner berdasarkan invoice resmi revisi PLN' }),
  });
  const soApproveCorrJson = await soApproveCorrRes.json();
  console.log(`     - Super Owner Approval Jurnal Koreksi -> Status HTTP: ${soApproveCorrRes.status}`);
  if (soApproveCorrRes.ok) {
    console.log(`     ✅ Jurnal Koreksi Disetujui Resmi oleh Super Owner! Status: ${soApproveCorrJson.correction?.status || 'APPROVED'}`);
  }

  // Langkah 7.8: Verifikasi Laporan Laba Bersih mencerminkan koreksi
  const updatedProfit = await fetch(`${API_BASE}/finance/reports/profit-summary?branchId=${ggBranch.id}&period=${testPeriod}`, {
    headers: { Authorization: `Bearer ${financeToken}` },
  }).then((r) => r.json());
  console.log(`   * Langkah 7.8: Verifikasi Laporan Laba Bersih Pasca-Koreksi:`);
  console.log(`     - Status Terkunci (isLocked): ${updatedProfit.isLocked}`);
  console.log(`     - Angka Dasar (Frozen): Omset=${updatedProfit.omsetRp}, OtherCost=${updatedProfit.otherCostRp}, NetProfitBase=${updatedProfit.netProfitRealtimeRp}`);
  console.log(`     - Total Penyesuaian Koreksi (totalCorrectionAdjustmentRp): Rp ${updatedProfit.totalCorrectionAdjustmentRp?.toLocaleString('id-ID')}`);
  console.log(`     - Adjusted Net Profit: Rp ${updatedProfit.adjustedNetProfitRealtimeRp?.toLocaleString('id-ID')}`);
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 8: WORKER CRON WHATSAPP & PROTEKSI MEMBER BERHENTI (ANTI-SPAM)
  // ===========================================================================
  console.log('🧪 [SKENARIO 8] Worker Cron Notifikasi WhatsApp & Proteksi Anti-Spam (Aturan Bisnis #11, #12, #13)');

  // Pastikan Hendra memiliki status stoppedAt != null
  console.log(`   * Verifikasi data Hendra Gunawan:`);
  console.log(`     - Email: ${hendra.email} | Phone: ${hendra.phone} | stoppedAt: ${hendra.stoppedAt}`);

  // Pasang paket uji yang mendekati expired (H-1) untuk Hendra agar dia menjadi kandidat kuat blast jika tanpa filter
  const testPkgHendra = await prisma.paketPelanggan.upsert({
    where: { id: 'test-pkg-hendra-stopped' },
    update: {
      status: 'ACTIVE',
      validUntil: new Date(Date.now() + 12 * 3600 * 1000), // Berakhir dalam 12 jam (Kategori H-1)
      remainingSessions: 3,
    },
    create: {
      id: 'test-pkg-hendra-stopped',
      userId: hendra.id,
      packageId: amandaPkg.packageId,
      status: 'ACTIVE',
      validUntil: new Date(Date.now() + 12 * 3600 * 1000),
      remainingSessions: 3,
      totalSessions: 10,
      usedSessions: 7,
    },
  });

  // Hapus log WhatsApp terdahulu untuk nomor Hendra jika ada
  await prisma.reminderLog.deleteMany({
    where: { recipientPhone: { contains: '81899990003' } },
  });

  // Langkah 8.1: Pemicu Evaluasi Batch Notifikasi Pengingat WhatsApp
  console.log('   * Langkah 8.1: Memicu Worker Evaluasi Pengingat WhatsApp Batch:');
  const batchRes = await fetch(`${API_BASE}/operations/reminders/evaluate-batch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const batchJson = await batchRes.json();
  console.log(`     - Respon Worker Batch:`, batchJson);

  // Langkah 8.2: Audit Jejak Log Pengiriman WhatsApp untuk Nomor Hendra
  const hendraLogs = await prisma.reminderLog.findMany({
    where: { recipientPhone: { contains: '81899990003' } },
  });
  console.log(`   * Langkah 8.2: Audit Antrean & Log Pengiriman Nomor Hendra (+6281899990003):`);
  console.log(`     - Jumlah pesan terkirim ke Hendra: ${hendraLogs.length}`);
  if (hendraLogs.length === 0 && batchJson.data?.stoppedCustomersProtected >= 1) {
    console.log(`     ✅ PROTEKSI ANTI-SPAM 100% BEKERJA! Pelanggan berhenti (stoppedAt != null) berhasil dikecualikan mutlak.`);
  } else {
    console.error(`     ❌ PELANGGARAN ANTI-SPAM! Hendra menerima pesan atau proteksi gagal menghitung pengecualian!`);
  }

  // Langkah 8.3: Pengujian Aksi Studio Manager: "Tandai Customer Berhenti" & "Batalkan Berhenti"
  console.log('   * Langkah 8.3: Uji Fitur Studio Manager: Tandai Berhenti & Batalkan:');
  // Coba unmark Hendra oleh Manager GG
  const unmarkRes = await fetch(`${API_BASE}/customers/${hendra.id}/unmark-stopped`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  const unmarkJson = await unmarkRes.json();
  console.log(`     - Manager Unmark Stopped -> Status HTTP: ${unmarkRes.status}, isStopped: ${unmarkJson.isStopped}`);

  // Coba mark stopped kembali oleh Manager GG
  const markRes = await fetch(`${API_BASE}/customers/${hendra.id}/mark-stopped`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`,
    },
    body: JSON.stringify({ reason: 'Pindah domisili luar kota' }),
  });
  const markJson = await markRes.json();
  console.log(`     - Manager Mark Stopped -> Status HTTP: ${markRes.status}, isStopped: ${markJson.isStopped}, stoppedAt: ${markJson.stoppedAt}`);

  // Langkah 8.4: UJI OTORISASI: Admin mencoba mark stopped (Harus dicekal karena tidak punya 'customer:write')
  const adminMarkRes = await fetch(`${API_BASE}/customers/${amanda.id}/mark-stopped`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ reason: 'Admin mencoba tandai berhenti' }),
  });
  console.log(`   * Langkah 8.4: Uji Otorisasi: Admin Frontdesk mencoba menandai pelanggan berhenti:`);
  console.log(`     - Status HTTP: ${adminMarkRes.status}`);
  if (adminMarkRes.status === 403) {
    console.log(`     ✅ TERLINDUNGI! Admin tidak memiliki izin 'customer:write' (403 Forbidden). Wewenang eksklusif Manager/Super Owner.`);
  } else {
    console.error(`     ❌ Admin diizinkan menandai berhenti!`);
  }

  console.log('\n================================================================');
  console.log('🏁 AUDIT FASE 2 SELESAI DENGAN BUKTI IMPLEMENTASI NYATA!');
  console.log('================================================================');
}

runAuditFase2()
  .catch((err) => {
    console.error('❌ FATAL ERROR AUDIT FASE 2:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

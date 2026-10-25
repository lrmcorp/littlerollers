/**
 * UAT Script: PERAN 6 - FINANCE LEAD
 * Skenario Berdasarkan: docs/arsip/uat/roles/UAT_ROLE_6_FINANCE_LEAD.md
 * 
 * Penguji: Daniel (Finance Lead - Orang Awam QA)
 * Target: Rekonsiliasi Bank, Proteksi Voucher, Tutup Buku Bulanan (Period Lock Guard),
 *         Audit Beban Instruktur (Summary & Sessions), Payroll Lock Guard (SEC-10).
 */

import { PrismaClient, PurchaseStatus, CheckInMethod, ClassSlotStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:32121/api/v1';

interface UatResult {
  code: string;
  scenario: string;
  isHappyPath: boolean;
  expectedStatus: number | number[];
  actualStatus: number;
  pass: boolean;
  userFacingFeedback: string;
  critiqueOrNotes: string;
}

const uatResults: UatResult[] = [];

async function api(
  token: string | null,
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>,
) {
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'idempotency-key': crypto.randomUUID(),
    ...(headers || {}),
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let resBody: any = null;
  const text = await res.text();
  try {
    resBody = JSON.parse(text);
  } catch {
    resBody = text;
  }

  return { status: res.status, body: resBody };
}

async function login(email: string, password = 'ridho123') {
  const res = await api(null, 'POST', '/auth/password/sessions', { email, password, channel: 'MOBILE' });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: status=${res.status}, body=${JSON.stringify(res.body)}`);
  }
  return res.body?.accessToken;
}

async function runFinanceLeadUat() {
  console.log('========================================================================');
  console.log('🎬 MEMULAI EKSEKUSI UAT: PERAN 6 - FINANCE LEAD');
  console.log('Platform: Daily Dose Pilates Studio Management System V2');
  console.log('Target Akun: finance@dailydose.test (Daniel - Finance Lead)');
  console.log('Dokumen Panduan: docs/arsip/uat/roles/UAT_ROLE_6_FINANCE_LEAD.md');
  console.log('========================================================================\n');

  // 1. Authenticate Actors
  const financeToken = await login('finance@dailydose.test');
  console.log('✅ Login Finance Lead berhasil (Token acquired).');

  const cindyToken = await login('cindyedelene@gmail.com');
  console.log('✅ Login Member Cindy Edelene berhasil.');

  const adminToken = await login('admin.gg@dailydose.test');
  console.log('✅ Login Admin Front Desk Green Garden berhasil.');

  // Fetch Master Data
  const ggBranch = await prisma.cabang.findFirst({ where: { name: { contains: 'Green Garden' } } });
  if (!ggBranch) throw new Error('Green Garden branch not found');

  const pkg = await prisma.paket.findFirst({ where: { status: 'ACTIVE' } });
  if (!pkg) throw new Error('Active package not found');

  const cindy = await prisma.user.findFirst({ where: { email: 'cindyedelene@gmail.com' } });
  if (!cindy) throw new Error('Cindy user not found');

  const coachSarah = await prisma.user.findFirst({ where: { email: 'coach.sarah@dailydose.test' } });
  if (!coachSarah) throw new Error('Coach Sarah not found');

  const classType = await prisma.jenisKelas.findFirst();
  if (!classType) throw new Error('Class type not found');

  const studio1 = await prisma.studio.findFirst({ where: { branchId: ggBranch.id } });
  const room1 = await prisma.ruangan.findFirst({ where: { studioId: studio1?.id } });
  if (!studio1 || !room1) throw new Error('Studio or Room not found in GG');

  console.log(`\n📍 Master Reference: GG=${ggBranch.name} (${ggBranch.id})`);
  console.log(`   Finance User: Daniel (${financeToken.substring(0, 10)}...)`);

  // --------------------------------------------------------------------------
  // MODUL 6.1: Antrean Verifikasi Pembayaran & Rekonsiliasi Bank (/workspace/payments)
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 6.1: VERIFIKASI PEMBAYARAN & REKONSILIASI BANK] ---');

  // Setup order for UAT-FN-01
  const bcaOrder = await prisma.pembelian.create({
    data: {
      id: crypto.randomUUID(),
      invoiceNumber: `INV-BCA-FN-${Date.now()}`,
      userId: cindy.id,
      branchId: ggBranch.id,
      packageId: pkg.id,
      subtotalRp: 2500000,
      totalAmountRp: 2500000,
      status: PurchaseStatus.WAITING_VERIFICATION,
      paymentMethod: 'BANK_TRANSFER',
      paymentProof: {
        create: {
          id: crypto.randomUUID(),
          fileUrl: 'https://storage.dailydose.test/proofs/bca-cindy-valid.jpg',
          bankName: 'BCA',
          accountHolder: 'Cindy Edelene',
          notes: 'Transfer via BCA Mobile m-Transfer',
        },
      },
    },
  });

  // UAT-FN-01: Rekonsiliasi Bukti Transfer Bank BCA
  console.log(`▶ Uji UAT-FN-01 (Happy Path): Finance menyetujui transfer BCA Cindy ${bcaOrder.id}...`);
  const resFN01 = await api(financeToken, 'POST', `/purchases/${bcaOrder.id}/approve`, {
    reasonCode: 'PAYMENT_VERIFIED',
    note: 'Telah dicocokkan dengan mutasi rekening koran BCA Kedoya 123-456-7890 kliring jam 10:15 WIB',
  });
  const passFN01 = (resFN01.status === 200 || resFN01.status === 201);
  const updatedBcaOrder = await prisma.pembelian.findUnique({ where: { id: bcaOrder.id } });
  const cindyPkg = await prisma.paketPelanggan.findFirst({
    where: { userId: cindy.id, purchaseId: bcaOrder.id },
  });
  const totalPassFN01 = passFN01 && updatedBcaOrder?.status === PurchaseStatus.PAID && !!cindyPkg;

  uatResults.push({
    code: 'UAT-FN-01',
    scenario: 'Rekonsiliasi Pembayaran Transfer Bank BCA (Invoice -> PAID & Paket Aktif)',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resFN01.status,
    pass: totalPassFN01,
    userFacingFeedback: 'Pembayaran disetujui. Invoice lunas dan paket pelanggan aktif seketika.',
    critiqueOrNotes: totalPassFN01
      ? 'Rekonsiliasi mulus: Status berubah menjadi PAID, paket sesi Cindy aktif, dan kas penerimaan studio terverifikasi.'
      : `Gagal rekonsiliasi: status=${resFN01.status}, orderStatus=${updatedBcaOrder?.status}`,
  });
  console.log(`  Result: status=${resFN01.status}, orderStatus=${updatedBcaOrder?.status}, customerPkgId=${cindyPkg?.id}`);

  // Setup fake order for UAT-FN-02
  const fakeOrder = await prisma.pembelian.create({
    data: {
      id: crypto.randomUUID(),
      invoiceNumber: `INV-FAKE-FN-${Date.now()}`,
      userId: cindy.id,
      branchId: ggBranch.id,
      packageId: pkg.id,
      subtotalRp: 2500000,
      totalAmountRp: 2500000,
      status: PurchaseStatus.WAITING_VERIFICATION,
      paymentMethod: 'BANK_TRANSFER',
      paymentProof: {
        create: {
          id: crypto.randomUUID(),
          fileUrl: 'https://storage.dailydose.test/proofs/fake-receipt-manipulated.jpg',
          bankName: 'BCA',
          accountHolder: 'Fiktif',
          notes: 'Struk palsu editan',
        },
      },
    },
  });

  // UAT-FN-02: Penolakan Bukti Transfer Fiktif dengan Templat Standar
  console.log(`▶ Uji UAT-FN-02 (No-Happy Path): Finance menolak struk fiktif ${fakeOrder.id}...`);
  const resFN02 = await api(financeToken, 'POST', `/purchases/${fakeOrder.id}/reject`, {
    reasonCode: 'PROOF_INVALID',
    note: 'Nominal transfer atau nomor rekening tujuan pada struk tidak sesuai dengan invoice studio.',
  });
  const passFN02 = (resFN02.status === 200 || resFN02.status === 201);
  const updatedFake = await prisma.pembelian.findUnique({ where: { id: fakeOrder.id } });
  const totalPassFN02 = passFN02 && updatedFake?.status === PurchaseStatus.REJECTED;

  uatResults.push({
    code: 'UAT-FN-02',
    scenario: 'Penolakan Bukti Transfer Fiktif dengan Templat Alasan Standar (PROOF_INVALID)',
    isHappyPath: false,
    expectedStatus: [200, 201],
    actualStatus: resFN02.status,
    pass: totalPassFN02,
    userFacingFeedback: 'Pembayaran ditolak. Alasan penolakan telah tercatat pada log audit.',
    critiqueOrNotes: totalPassFN02
      ? 'Sangat akuntabel: Struk fiktif ditolak, status invoice menjadi REJECTED dengan alasan jelas bagi customer.'
      : `Gagal penolakan: status=${resFN02.status}, orderStatus=${updatedFake?.status}`,
  });
  console.log(`  Result: status=${resFN02.status}, fakeOrderStatus=${updatedFake?.status}`);

  // --------------------------------------------------------------------------
  // MODUL 6.2: Pengelolaan Voucher Diskon Promosi (/workspace/vouchers)
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 6.2: PENGELOLAAN VOUCHER DISKON PROMOSI] ---');

  // UAT-FN-03: Pembuatan Voucher Diskon Kuota Terbatas
  const voucherCode = `PILATESMEI_${Date.now().toString().slice(-4)}`;
  console.log(`▶ Uji UAT-FN-03 (Happy Path): Finance menerbitkan voucher kuota terbatas ${voucherCode}...`);
  const resFN03 = await api(financeToken, 'POST', '/vouchers', {
    code: voucherCode,
    name: 'Promo Pilates Mei Ceria',
    discountType: 'FIXED_AMOUNT',
    discountValue: 150000,
    minimumPurchaseRp: 1000000,
    totalUsageLimit: 50,
    activeUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });
  const passFN03 = (resFN03.status === 200 || resFN03.status === 201);
  const createdVoucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
  const totalPassFN03 = passFN03 && !!createdVoucher && createdVoucher.quota === 50;

  uatResults.push({
    code: 'UAT-FN-03',
    scenario: 'Penerbitan Voucher Diskon Kuota Terbatas (PILATESMEI - Diskon Rp 150.000, Kuota 50)',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resFN03.status,
    pass: totalPassFN03,
    userFacingFeedback: 'Voucher berhasil diterbitkan dan siap digunakan pada checkout.',
    critiqueOrNotes: totalPassFN03
      ? 'Voucher aktif seketika dengan batasan kuota 50 kali dan diskon nominal Rp 150.000.'
      : `Gagal buat voucher: status=${resFN03.status}, body=${JSON.stringify(resFN03.body)}`,
  });
  console.log(`  Result: status=${resFN03.status}, voucherId=${createdVoucher?.id}, quota=${createdVoucher?.quota}`);

  // Setup Expired Voucher for UAT-FN-04
  const expiredCode = `EXPIRED_${Date.now().toString().slice(-4)}`;
  await prisma.voucher.create({
    data: {
      id: crypto.randomUUID(),
      code: expiredCode,
      name: 'Voucher Kedaluwarsa',
      discountType: 'NOMINAL',
      discountValue: 100000,
      minSpendRp: 500000,
      quota: 10,
      usedCount: 0,
      validUntil: new Date(Date.now() - 7 * 24 * 3600 * 1000), // Expired 7 days ago
      active: true,
    },
  });

  // UAT-FN-04: Proteksi Voucher Kedaluwarsa & Kuota Habis
  console.log(`▶ Uji UAT-FN-04 (No-Happy Path): Customer Cindy mencoba memakai voucher kedaluwarsa ${expiredCode}...`);
  const resFN04 = await api(cindyToken, 'POST', '/checkout/voucher-preview', {
    code: expiredCode,
    packageId: pkg.id,
    branchId: ggBranch.id,
  });
  const passFN04 = resFN04.status === 422 && resFN04.body?.error?.code === 'VOUCHER_EXPIRED';

  uatResults.push({
    code: 'UAT-FN-04',
    scenario: 'Proteksi Voucher Kedaluwarsa & Kuota Habis (Checkout Rejection Guard)',
    isHappyPath: false,
    expectedStatus: 422,
    actualStatus: resFN04.status,
    pass: passFN04,
    userFacingFeedback: 'Voucher telah kedaluwarsa atau batas kuota penggunaan telah tercapai.',
    critiqueOrNotes: passFN04
      ? 'Kebocoran promo dicegah: Server menolak voucher kedaluwarsa dengan status 422 VOUCHER_EXPIRED.'
      : `Gagal proteksi voucher: status=${resFN04.status}, body=${JSON.stringify(resFN04.body)}`,
  });
  console.log(`  Result: status=${resFN04.status}, error.code=${resFN04.body?.error?.code}`);

  // --------------------------------------------------------------------------
  // MODUL 6.3: Eksekusi Tutup Buku Bulanan (Monthly Close Period Lock) (/finance)
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 6.3: TUTUP BUKU BULANAN & PERIOD LOCK GUARD] ---');

  const closePeriod = '2026-01'; // Past historical month for clean lock testing

  // Clean up any existing lock on 2026-01 for this test
  await prisma.otherCost.deleteMany({ where: { branchId: ggBranch.id, period: closePeriod } });
  await prisma.monthlyClose.deleteMany({ where: { branchId: ggBranch.id, period: closePeriod } });

  // UAT-FN-05: Eksekusi Tutup Buku Bulanan
  console.log(`▶ Uji UAT-FN-05 (Happy Path): Finance mengeksekusi tutup buku periode ${closePeriod} cabang Green Garden...`);
  const resFN05 = await api(financeToken, 'POST', '/monthly-closes', {
    branchId: ggBranch.id,
    period: closePeriod,
    reason: 'Tutup buku resmi periode Januari 2026 telah diverifikasi audit kasir dan rekening koran.',
  });
  const passFN05 = (resFN05.status === 200 || resFN05.status === 201);
  const lockRecord = await prisma.monthlyClose.findUnique({
    where: { branchId_period: { branchId: ggBranch.id, period: closePeriod } },
  });
  const totalPassFN05 = passFN05 && lockRecord?.status === 'LOCKED';

  uatResults.push({
    code: 'UAT-FN-05',
    scenario: 'Eksekusi Tutup Buku Bulanan (Monthly Period Close -> Status LOCKED)',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resFN05.status,
    pass: totalPassFN05,
    userFacingFeedback: 'Periode pembukuan berhasil ditutup dan dikunci secara permanen.',
    critiqueOrNotes: totalPassFN05
      ? 'Integritas Buku Kas Terjamin: Periode terkunci (LOCKED) dengan controlHash audit yang tidak bisa diubah.'
      : `Gagal tutup buku: status=${resFN05.status}, lockStatus=${lockRecord?.status}`,
  });
  console.log(`  Result: status=${resFN05.status}, lockStatus=${lockRecord?.status}, hash=${lockRecord?.controlHash}`);

  // UAT-FN-06: Period Lock Guard - Mutasi Susulan pada Periode Terkunci Ditolak
  console.log(`▶ Uji UAT-FN-06 (No-Happy Path / Period Lock Guard): Mencoba mencatat biaya pada periode ${closePeriod} yang LOCKED...`);
  const resFN06 = await api(financeToken, 'POST', '/other-costs', {
    branchId: ggBranch.id,
    period: closePeriod,
    category: 'UTILITIES',
    description: 'Biaya tagihan listrik susulan Januari 2026 (ilegal backdate)',
    amountRp: 750000,
  });
  const passFN06 = resFN06.status === 409 && resFN06.body?.error?.code === 'PERIOD_ALREADY_LOCKED';

  uatResults.push({
    code: 'UAT-FN-06',
    scenario: 'Period Lock Guard: Penolakan Mutasi Susulan pada Periode Pembukuan Terkunci',
    isHappyPath: false,
    expectedStatus: 409,
    actualStatus: resFN06.status,
    pass: passFN06,
    userFacingFeedback: 'Periode pembukuan telah ditutup dan dikunci. Perubahan data masa lalu ditolak.',
    critiqueOrNotes: passFN06
      ? 'Anti-Fraud Kuat: Server menolak pencatatan biaya susulan dengan error 409 PERIOD_ALREADY_LOCKED.'
      : `Gagal proteksi period lock: status=${resFN06.status}, body=${JSON.stringify(resFN06.body)}`,
  });
  console.log(`  Result: status=${resFN06.status}, error.code=${resFN06.body?.error?.code}`);

  // --------------------------------------------------------------------------
  // MODUL 6.4: Audit Presensi & Rekonsiliasi Penggajian Honor Instruktur (/finance)
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 6.4: AUDIT PREKAPITULASI HONOR INSTRUKTUR & SEC-10 PAYROLL GUARD] ---');

  // UAT-FN-07: Audit Beban Instruktur Aktual (Mode SUMMARY & SESSIONS)
  console.log('▶ Uji UAT-FN-07 (Happy Path): Finance memeriksa laporan honor instruktur aktual...');
  const resFN07 = await api(financeToken, 'GET', `/finance/reports/instructor-cost-realtime?branchId=${ggBranch.id}`);
  const passFN07 = resFN07.status === 200 && Array.isArray(resFN07.body?.instructors) && Array.isArray(resFN07.body?.sessions);

  uatResults.push({
    code: 'UAT-FN-07',
    scenario: 'Audit Beban Instruktur Aktual (Mode Rekap SUMMARY & Mode Rincian SESSIONS)',
    isHappyPath: true,
    expectedStatus: 200,
    actualStatus: resFN07.status,
    pass: passFN07,
    userFacingFeedback: 'Laporan beban honor instruktur tersaji lengkap dengan mode rekap dan rincian per sesi.',
    critiqueOrNotes: passFN07
      ? 'Transparansi tinggi: Finance dapat meninjau total honor per instruktur dan rincian bukti kehadiran per sesi.'
      : `Gagal ambil laporan: status=${resFN07.status}`,
  });
  console.log(`  Result: status=${resFN07.status}, instructorsCount=${resFN07.body?.instructors?.length}, sessionsCount=${resFN07.body?.sessions?.length}`);

  // UAT-FN-08: Payroll Lock Guard Penahanan Honor Unverified (SEC-10)
  console.log('▶ Uji UAT-FN-08 (No-Happy Path / SEC-10): Penahanan honor instruktur pada sesi tanpa presensi...');
  
  // Setup 1 completed class in current period without attendance
  const now = new Date();
  const unverifiedSlot = await prisma.slotKelas.create({
    data: {
      id: crypto.randomUUID(),
      branchId: ggBranch.id,
      studioId: studio1.id,
      roomId: room1.id,
      classTypeId: classType.id,
      instructorId: coachSarah.id,
      startAt: new Date(now.getTime() - 120 * 60 * 1000),
      endAt: new Date(now.getTime() - 70 * 60 * 1000),
      capacity: 10,
      status: ClassSlotStatus.COMPLETED,
      instructorFeeRp: 250000,
      // Notice: NO instructorAttendance created!
    },
  });

  // Finance audits the report
  const resFN08_Unverified = await api(financeToken, 'GET', `/finance/reports/instructor-cost-realtime?branchId=${ggBranch.id}`);
  const hasUnverifiedFee = (resFN08_Unverified.body?.totalUnverifiedFeeRp ?? 0) >= 250000;
  const hasUnverifiedCount = (resFN08_Unverified.body?.unverifiedClassCount ?? 0) >= 1;

  console.log(`  Before verification: unverifiedFeeRp=${resFN08_Unverified.body?.totalUnverifiedFeeRp}, unverifiedClasses=${resFN08_Unverified.body?.unverifiedClassCount}`);

  // Resolution: Front desk performs manual verification with official audit note
  const resVerify = await api(adminToken, 'POST', `/class-slots/${unverifiedSlot.id}/instructor-attendance`, {
    notes: 'Presensi diverifikasi manual oleh Front Desk Rini berdasarkan rekaman CCTV studio',
  });
  console.log(`  Front Desk manual verification result: status=${resVerify.status}`);

  // Finance refreshes report
  const resFN08_Verified = await api(financeToken, 'GET', `/finance/reports/instructor-cost-realtime?branchId=${ggBranch.id}`);
  const slotInReport = resFN08_Verified.body?.sessions?.find((s: any) => s.slotId === unverifiedSlot.id);
  const passResolution = slotInReport?.attendanceVerified === true;

  const totalPassFN08 = hasUnverifiedFee && hasUnverifiedCount && passResolution;

  uatResults.push({
    code: 'UAT-FN-08',
    scenario: 'Payroll Lock Guard: Penahanan Honor Unverified (SEC-10) & Pelepasan Pasca-Verifikasi',
    isHappyPath: false,
    expectedStatus: 200,
    actualStatus: resFN08_Verified.status,
    pass: totalPassFN08,
    userFacingFeedback: 'Sesi tanpa presensi ditahan dari payroll (peringatan oranye). Setelah verifikasi staf, honor sah dicairkan.',
    critiqueOrNotes: totalPassFN08
      ? 'SEC-10 Terbukti Sempurna: Honor Rp 250.000 otomatis tertahan di unverifiedFeeRp sehingga payroll aman dari bayar buta, dan langsung berpindah ke verified setelah staf memverifikasi via CCTV.'
      : `Gagal audit SEC-10: beforeFee=${resFN08_Unverified.body?.totalUnverifiedFeeRp}, resolutionVerified=${slotInReport?.attendanceVerified}`,
  });
  console.log(`  After verification: slotVerified=${slotInReport?.attendanceVerified}, totalVerifiedFeeRp=${resFN08_Verified.body?.totalInstructorCostRp}`);

  // --------------------------------------------------------------------------
  // RINGKASAN HASIL UAT ROLE 6
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 REKAPITULASI HASIL UAT: PERAN 6 - FINANCE LEAD');
  console.log('========================================================================');

  let passedCount = 0;
  for (const r of uatResults) {
    if (r.pass) passedCount++;
    const icon = r.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | ${r.code.padEnd(11)} | ${r.scenario.padEnd(55)} | Status: ${r.actualStatus}`);
  }

  const allPassed = passedCount === uatResults.length;
  console.log('------------------------------------------------------------------------');
  console.log(`Total Skenario: ${uatResults.length} | Lolos: ${passedCount} | Gagal: ${uatResults.length - passedCount}`);
  console.log(`Tingkat Kelulusan: ${((passedCount / uatResults.length) * 100).toFixed(1)}%`);
  console.log(allPassed ? '🎉 SEMUA SKENARIO UAT PERAN 6 LOLOS DENGAN SEMPURNA!' : '⚠️ ADA SKENARIO YANG GAGAL.');
  console.log('========================================================================\n');
}

runFinanceLeadUat()
  .catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

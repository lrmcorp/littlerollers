process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat';
import { PrismaClient } from '../apps/api/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:32121/api/v1';

const GG = 'a1000000-0000-4000-8000-000000000001';
const MK = 'a1000000-0000-4000-8000-000000000002';
const STUDIO1_GG = 'b1000000-0000-4000-8000-000000000001';
const ROOM1_GG = 'c1000000-0000-4000-8000-000000000001';
const ROOM2_GG = 'c1000000-0000-4000-8000-000000000002';
const CLASSTYPE_GROUP = 'c1000000-0000-4000-8000-000000000001';
const COACH_SARAH = 'aa99d8cf-0517-4942-84e3-ebe9474b5b44';

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/password/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, channel: 'MOBILE' }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email} (${res.status}): ${await res.text()}`);
  return (await res.json()).accessToken;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

async function main() {
  console.log('================================================================');
  console.log('🚀 AUDIT FASE 1: RBAC, KYC, Collision Guard, Booking, Attendance');
  console.log('================================================================\n');

  const adminGGToken = await login('admin@ddose.com', 'Admin123!');
  const managerToken = await login('manager.gg@dailydose.test', 'Manager123!');
  const superOwnerToken = await login('superowner@dailydose.test', 'SuperOwner123!');
  const ownerGGToken = await login('owner.gg@dailydose.test', 'Owner123!');
  const coachToken = await login('coach.sarah@dailydose.test', 'Instructor123!');
  const amandaToken = await login('amanda.member@dailydose.test', 'Customer123!');
  const claraToken = await login('clara.new@dailydose.test', 'MemberBaru2026!');

  // ===========================================================================
  // SKENARIO 6: CROSS-BRANCH DATA ISOLATION
  // ===========================================================================
  console.log('🧪 [SKENARIO 6] Cross-Branch Data Isolation (Owner GG -> data Muara Karang)');
  const mkSlotsRes = await fetch(`${API_BASE}/class-slots?branchId=${MK}`, { headers: auth(ownerGGToken) });
  console.log(`   * Owner GG query class-slots branchId=MK -> HTTP ${mkSlotsRes.status}`);
  const mkSlotsBody = await mkSlotsRes.json();
  if (mkSlotsRes.status === 403) {
    console.log('     ✅ DICEKAL (403 Forbidden) sesuai ekspektasi.');
  } else {
    console.log(`     ⚠️  TIDAK 403. Body (ringkas): ${JSON.stringify(mkSlotsBody).slice(0, 300)}`);
  }

  const mkFinanceRes = await fetch(`${API_BASE}/finance/reports/omset?branchId=${MK}&period=2026-07`, { headers: auth(ownerGGToken) });
  console.log(`   * Owner GG query laporan omset branchId=MK -> HTTP ${mkFinanceRes.status}`);
  const mkFinanceBody = await mkFinanceRes.json();
  if (mkFinanceRes.status === 403) {
    console.log('     ✅ DICEKAL (403 Forbidden) sesuai ekspektasi.');
  } else {
    console.log(`     ⚠️  TIDAK 403. Body (ringkas): ${JSON.stringify(mkFinanceBody).slice(0, 300)}`);
  }
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 1: COLLISION GUARD
  // ===========================================================================
  console.log('🧪 [SKENARIO 1] Collision Guard (instruktur & ruangan bentrok)');
  const jitterMinutes = Math.floor(Math.random() * 500);
  const base = new Date();
  base.setDate(base.getDate() + 10);
  base.setHours(10, 0, 0, 0);
  base.setMinutes(base.getMinutes() + jitterMinutes);
  const startA = new Date(base);
  const endA = new Date(base.getTime() + 50 * 60000);

  const createA = await fetch(`${API_BASE}/class-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `collide-a-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({
      branchId: GG, classTypeId: CLASSTYPE_GROUP, studioId: STUDIO1_GG, roomId: ROOM1_GG,
      instructorUserId: COACH_SARAH, startAt: startA.toISOString(), endAt: endA.toISOString(),
    }),
  });
  const createAJson = await createA.json();
  console.log(`   * Kelas A dibuat: ${startA.toTimeString().slice(0,5)}-${endA.toTimeString().slice(0,5)}, Room1, Coach Sarah -> HTTP ${createA.status} (id=${createAJson.id})`);

  // Overlap: same instructor, different room, overlapping time
  const startB = new Date(base.getTime() + 20 * 60000);
  const endB = new Date(base.getTime() + 70 * 60000);
  const createB = await fetch(`${API_BASE}/class-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `collide-b-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({
      branchId: GG, classTypeId: CLASSTYPE_GROUP, studioId: STUDIO1_GG, roomId: ROOM2_GG,
      instructorUserId: COACH_SARAH, startAt: startB.toISOString(), endAt: endB.toISOString(),
    }),
  });
  const createBJson = await createB.json();
  console.log(`   * Kelas B (instruktur SAMA, room BEDA, waktu beririsan) -> HTTP ${createB.status}`);
  if (createB.status === 409 || createB.status === 422 || createB.status === 400) {
    console.log(`     ✅ DICEKAL sesuai ekspektasi. Error: ${createBJson.error?.code || createBJson.code}`);
  } else {
    console.error(`     ❌ CELAH! Kelas dengan instruktur bentrok berhasil dibuat! id=${createBJson.id}`);
  }

  // Overlap: same room, different instructor
  const createC = await fetch(`${API_BASE}/class-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `collide-c-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({
      branchId: GG, classTypeId: CLASSTYPE_GROUP, studioId: STUDIO1_GG, roomId: ROOM1_GG,
      startAt: startB.toISOString(), endAt: endB.toISOString(),
    }),
  });
  const createCJson = await createC.json();
  console.log(`   * Kelas C (ruangan SAMA, waktu beririsan, tanpa instruktur) -> HTTP ${createC.status}`);
  if (createC.status === 409 || createC.status === 422 || createC.status === 400) {
    console.log(`     ✅ DICEKAL sesuai ekspektasi. Error: ${createCJson.error?.code || createCJson.code}`);
  } else {
    console.error(`     ❌ CELAH! Kelas dengan ruangan bentrok berhasil dibuat! id=${createCJson.id}`);
  }
  console.log('----------------------------------------------------------------\n');

  // Publish Kelas A so it can be booked
  const publishARes = await fetch(`${API_BASE}/class-slots/${createAJson.id}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `pub-a-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({ expectedVersion: 1 }),
  });
  const publishAJson = await publishARes.json();
  console.log(`   * Publish Kelas A -> HTTP ${publishARes.status}: ${JSON.stringify(publishAJson).slice(0, 150)}`);

  const amandaUser = await prisma.user.findFirst({ where: { email: 'amanda.member@dailydose.test' } });
  const claraUser = await prisma.user.findFirst({ where: { email: 'clara.new@dailydose.test' } });
  const amandaPkg = await prisma.paketPelanggan.findFirst({ where: { userId: amandaUser.id, status: 'ACTIVE' } });
  const claraPkg = await prisma.paketPelanggan.findFirst({ where: { userId: claraUser.id, status: 'ACTIVE' } });

  // Ensure a 3rd booker with an active package exists (for minQuota=3 confirm test)
  let dedi = await prisma.user.findFirst({ where: { email: 'dedi.uat3@dailydose.test' } });
  if (!dedi) {
    const reg = await fetch(`${API_BASE}/auth/customer-registrations`, {
      method: 'POST',
      body: (() => { const fd = new FormData(); fd.append('displayName', 'Dedi UAT3'); fd.append('phone', '081233330003'); fd.append('email', 'dedi.uat3@dailydose.test'); fd.append('password', 'Customer123!'); fd.append('consent', 'true'); return fd; })(),
    });
    await reg.json();
    dedi = await prisma.user.findFirst({ where: { email: 'dedi.uat3@dailydose.test' } });
  }
  let dediPkg = await prisma.paketPelanggan.findFirst({ where: { userId: dedi.id, status: 'ACTIVE' } });
  if (!dediPkg) {
    dediPkg = await prisma.paketPelanggan.create({ data: { userId: dedi.id, packageId: amandaPkg.packageId, totalSessions: 10, remainingSessions: 10, usedSessions: 0, status: 'ACTIVE', validUntil: new Date(Date.now() + 30 * 86400000) } });
  }
  const dediToken = await login('dedi.uat3@dailydose.test', 'Customer123!');

  // Approve Clara's & Dedi's pending KYC up front so Skenario 3's self-booking isn't blocked by IDENTITY_VERIFICATION_REQUIRED
  console.log('🧪 [KYC pre-step] Super Owner menyetujui dokumen KYC Clara & Dedi (prasyarat self-booking)');
  const pendingPre = await fetch(`${API_BASE}/identity-verifications?status=PENDING`, { headers: auth(superOwnerToken) }).then(r => r.json());
  for (const name of ['Clara', 'Dedi']) {
    const c = pendingPre.items?.find(i => i.user?.displayName?.includes(name));
    if (c) {
      for (const doc of c.documents ?? []) {
        const ap = await fetch(`${API_BASE}/identity-verifications/${doc.id}/decisions/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth(superOwnerToken) }, body: JSON.stringify({ expectedVersion: doc.version ?? 1, note: 'UAT pre-approval' }) });
        console.log(`   * Approve dokumen ${doc.kind} (${name}) -> HTTP ${ap.status}`);
      }
    } else {
      console.log(`   * Case KYC ${name} tidak ditemukan di antrean PENDING (mungkin sudah tidak perlu verifikasi).`);
    }
  }
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 3: AUTO-CANCEL H-24 (under quota) & AUTO-CONFIRM (quota met)
  // ===========================================================================
  console.log('🧪 [SKENARIO 3] Auto-Cancel H-24 (kuota minimum) & Auto-Confirm');
  const near = new Date(Date.now() + (20 * 3600000) + jitterMinutes * 60000); // 20h+jitter from now, within 24h cutoff window
  const nearEnd = new Date(near.getTime() + 50 * 60000);

  async function createPublish(label, startAt, endAt, roomId) {
    const cr = await fetch(`${API_BASE}/class-slots`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${label}-${Date.now()}-${Math.random()}`, ...auth(adminGGToken) },
      body: JSON.stringify({ branchId: GG, classTypeId: CLASSTYPE_GROUP, studioId: STUDIO1_GG, roomId, instructorUserId: COACH_SARAH, startAt: startAt.toISOString(), endAt: endAt.toISOString() }),
    });
    const crJson = await cr.json();
    if (!crJson.id) { console.error(`     ❌ Gagal membuat Kelas ${label}: ${JSON.stringify(crJson)}`); return undefined; }
    const pub = await fetch(`${API_BASE}/class-slots/${crJson.id}/publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `pub-${label}-${Date.now()}-${Math.random()}`, ...auth(adminGGToken) },
      body: JSON.stringify({ expectedVersion: 1 }),
    });
    await pub.json();
    return crJson.id;
  }

  const slotUnderQuotaId = await createPublish('E', near, nearEnd, ROOM1_GG);
  const slotMeetsQuotaId = await createPublish('F', near, nearEnd, ROOM2_GG);
  console.log(`   * Kelas E (under-kuota) id=${slotUnderQuotaId}, Kelas F (kuota-cukup) id=${slotMeetsQuotaId}, minQuota GG/GroupClass=3, mulai dalam 20 jam`);

  const amandaBalBeforeE = (await prisma.paketPelanggan.findUnique({ where: { id: amandaPkg.id } })).remainingSessions;
  const bookE = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `bookE-${Date.now()}`, ...auth(amandaToken) }, body: JSON.stringify({ classSlotId: slotUnderQuotaId, customerPackageId: amandaPkg.id, source: 'SELF' }) });
  const bookEJson = await bookE.json();
  console.log(`   * Amanda booking Kelas E (1 peserta, < minQuota 3) -> HTTP ${bookE.status}`);

  if (!slotUnderQuotaId || !slotMeetsQuotaId) { console.error('     ❌ Gagal menyiapkan Kelas E/F, Skenario 3 & 2 dihentikan.'); await prisma.$disconnect(); process.exit(1); }
  const slotFBookingIds = {};
  for (const [tok, pkgId, label] of [[amandaToken, amandaPkg.id, 'Amanda'], [claraToken, claraPkg.id, 'Clara'], [dediToken, dediPkg.id, 'Dedi']]) {
    const r = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `bookF-${label}-${Date.now()}`, ...auth(tok) }, body: JSON.stringify({ classSlotId: slotMeetsQuotaId, customerPackageId: pkgId, source: 'SELF' }) });
    const rj = await r.json();
    console.log(`   * ${label} booking Kelas F -> HTTP ${r.status}${rj.id ? '' : ' :: ' + JSON.stringify(rj).slice(0,150)}`);
    slotFBookingIds[label] = rj.id;
  }

  const evalRes = await fetch(`${API_BASE}/operations/auto-cancel/evaluate`, { method: 'POST', headers: auth(superOwnerToken) });
  const evalJson = await evalRes.json();
  console.log(`   * Trigger evaluasi Auto-Cancel/Confirm -> HTTP ${evalRes.status}: ${JSON.stringify(evalJson).slice(0, 400)}`);

  const slotE = await prisma.slotKelas.findUnique({ where: { id: slotUnderQuotaId } });
  const slotF = await prisma.slotKelas.findUnique({ where: { id: slotMeetsQuotaId } });
  const amandaBalAfterE = (await prisma.paketPelanggan.findUnique({ where: { id: amandaPkg.id } })).remainingSessions;
  console.log(`   * Kelas E status setelah evaluasi (harus CANCELLED): ${slotE.status}`);
  console.log(`   * Saldo Amanda setelah auto-cancel Kelas E (harus balik ke ${amandaBalBeforeE}): ${amandaBalAfterE}`);
  const ledgerRefund = await prisma.sessionLedger.findFirst({ where: { customerPackageId: amandaPkg.id, type: 'REFUND_AUTOCANCEL' }, orderBy: { createdAt: 'desc' } });
  console.log(`   * Ledger entry REFUND_AUTOCANCEL: ${ledgerRefund ? `amount=${ledgerRefund.amount}` : 'TIDAK DITEMUKAN'}`);
  if (slotE.status === 'CANCELLED' && amandaBalAfterE === amandaBalBeforeE && ledgerRefund) {
    console.log('     ✅ Auto-cancel + refund instan 100% bekerja sesuai ekspektasi.');
  } else {
    console.error('     ❌ Auto-cancel/refund TIDAK sesuai ekspektasi!');
  }
  console.log(`   * Kelas F status setelah evaluasi (harus CONFIRMED, 3/3 kuota): ${slotF.status}`);
  if (slotF.status !== 'CONFIRMED') console.error('     ❌ Kelas dengan kuota cukup TIDAK dikonfirmasi otomatis!');
  else console.log('     ✅ Auto-confirm bekerja saat kuota minimum terpenuhi.');
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 2: RESERVATION VS DEDUCTION (pakai Kelas F yang sudah CONFIRMED)
  // ===========================================================================
  console.log('🧪 [SKENARIO 2] Reservation vs Deduction (booking tidak langsung potong saldo)');
  const slotFRef = { id: slotMeetsQuotaId };
  const balBeforeBooking = amandaBalAfterE;
  console.log(`   * Saldo Amanda saat ini (booking Kelas F sudah ada, masih berstatus Reserved): ${balBeforeBooking}`);
  if (balBeforeBooking === amandaBalBeforeE) {
    console.log('     ✅ Saldo tidak terpotong saat booking (Reserved only). Sesuai Aturan Bisnis #1.');
  } else {
    console.error('     ❌ Saldo berubah hanya karena booking! Pelanggaran Aturan Bisnis #1!');
  }

  // Dedi cancels her reservation on the now-CONFIRMED Kelas F (still >=H-24) -> balance must stay untouched (was never deducted)
  const dediBalBefore = (await prisma.paketPelanggan.findUnique({ where: { id: dediPkg.id } })).remainingSessions;
  const cancelRes = await fetch(`${API_BASE}/bookings/${slotFBookingIds['Dedi']}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth(dediToken) },
    body: JSON.stringify({ reasonCode: 'CUSTOMER_REQUEST', reason: 'Uji cancel mandiri >= H-24' }),
  });
  const cancelJson = await cancelRes.json();
  console.log(`   * Dedi cancel booking Kelas F (>=H-24, kelas sudah CONFIRMED) -> HTTP ${cancelRes.status} (status=${cancelJson.status})`);
  const dediBalAfter = (await prisma.paketPelanggan.findUnique({ where: { id: dediPkg.id } })).remainingSessions;
  console.log(`   * Saldo Dedi setelah cancel (harus tetap ${dediBalBefore}): ${dediBalAfter}`);

  // Backdate class F to the past so it can be completed, then complete + backfill-attend for Amanda
  await prisma.slotKelas.update({ where: { id: slotFRef.id }, data: { startAt: new Date(Date.now() - 2 * 3600000), endAt: new Date(Date.now() - 1 * 3600000) } });
  const completeRes = await fetch(`${API_BASE}/class-slots/${slotFRef.id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `complete-f-${Date.now()}`, ...auth(coachToken) }, body: JSON.stringify({}) });
  const completeJson = await completeRes.json();
  console.log(`   * Coach Sarah selesaikan Kelas F (mundur ke 1 jam lalu) -> HTTP ${completeRes.status}: ${JSON.stringify(completeJson).slice(0,200)}`);

  const bookingDetail = await prisma.pemesananKelas.findUnique({ where: { id: slotFBookingIds['Amanda'] } });
  const backfillRes = await fetch(`${API_BASE}/check-ins/customers/backfill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `backfill-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({ bookingId: slotFBookingIds['Amanda'], reason: 'Backfill UAT H+1jam', expectedVersion: bookingDetail?.version ?? 1 }),
  });
  const backfillJson = await backfillRes.json();
  console.log(`   * Admin backfill attendance (kelas selesai ~1 jam lalu, dalam batas H+2) -> HTTP ${backfillRes.status}: ${JSON.stringify(backfillJson).slice(0,200)}`);
  const pkgAfterAttend = await prisma.paketPelanggan.findUnique({ where: { id: amandaPkg.id } });
  console.log(`   * Saldo Amanda setelah COMPLETED + hadir (harus ${balBeforeBooking} - 1 = ${balBeforeBooking - 1}): ${pkgAfterAttend.remainingSessions}`);
  if (pkgAfterAttend.remainingSessions === balBeforeBooking - 1) {
    console.log('     ✅ Saldo terpotong TEPAT 1 saat kelas COMPLETED & hadir.');
  } else {
    console.error('     ❌ Pemotongan saldo tidak sesuai ekspektasi!');
  }
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO 4: BACKFILL H+2 LIMIT
  // ===========================================================================
  console.log('🧪 [SKENARIO 4] Batas Backfill Presensi H+2 Jam');
  const futureD = new Date(Date.now() + 5 * 86400000 + jitterMinutes * 60000); // 5 days out, clearly bookable
  const futureDEnd = new Date(futureD.getTime() + 50 * 60000);
  const createD = await fetch(`${API_BASE}/class-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `h2-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({ branchId: GG, classTypeId: CLASSTYPE_GROUP, studioId: STUDIO1_GG, roomId: ROOM1_GG, instructorUserId: COACH_SARAH, startAt: futureD.toISOString(), endAt: futureDEnd.toISOString() }),
  });
  const createDJson = await createD.json();
  const publishDRes = await fetch(`${API_BASE}/class-slots/${createDJson.id}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `pub-d-${Date.now()}`, ...auth(adminGGToken) },
    body: JSON.stringify({ expectedVersion: 1 }),
  });
  console.log(`   * Publish Kelas D (5 hari lagi, agar bisa dibooking) -> HTTP ${publishDRes.status}`);
  const claraPkgForD = await prisma.paketPelanggan.findFirst({ where: { userId: (await prisma.user.findFirst({ where: { email: 'clara.new@dailydose.test' } })).id, status: 'ACTIVE' } });
  console.log(`   * Clara punya paket aktif? ${!!claraPkgForD}`);

  if (claraPkgForD) {
    const bookD = await fetch(`${API_BASE}/bookings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `bookD-${Date.now()}`, ...auth(claraToken) },
      body: JSON.stringify({ classSlotId: createDJson.id, customerPackageId: claraPkgForD.id, source: 'SELF' }),
    });
    const bookDJson = await bookD.json();
    console.log(`   * Clara booking kelas D -> HTTP ${bookD.status}: ${JSON.stringify(bookDJson).slice(0,150)}`);
    if (!bookDJson.id) { console.log('     ⚠️  Booking D gagal, skenario H+2 dilewati.'); return; }
    // Fast-forward: mark CONFIRMED directly (auto-confirm mechanics already proven in Skenario 3) and move the class to 2h15m in the past
    await prisma.slotKelas.update({ where: { id: createDJson.id }, data: { status: 'CONFIRMED', startAt: new Date(Date.now() - (2 * 3600000 + 15 * 60000)), endAt: new Date(Date.now() - (2 * 3600000 + 10 * 60000)) } });
    const completeDRes = await fetch(`${API_BASE}/class-slots/${createDJson.id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `complete-d-${Date.now()}`, ...auth(coachToken) }, body: JSON.stringify({}) });
    const completeDJson = await completeDRes.json();
    console.log(`   * Complete kelas D (berakhir ~2 jam 10 menit lalu) -> HTTP ${completeDRes.status}: ${JSON.stringify(completeDJson).slice(0,150)}`);
    const bookingDetailD = await prisma.pemesananKelas.findUnique({ where: { id: bookDJson.id } });
    const backfillDRes = await fetch(`${API_BASE}/check-ins/customers/backfill`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `backfillD-${Date.now()}`, ...auth(adminGGToken) },
      body: JSON.stringify({ bookingId: bookDJson.id, reason: 'Backfill UAT lewat H+2', expectedVersion: bookingDetailD?.version ?? 1 }),
    });
    const backfillDJson = await backfillDRes.json();
    console.log(`   * Admin coba backfill (kelas selesai > H+2 lalu) -> HTTP ${backfillDRes.status}: ${JSON.stringify(backfillDJson).slice(0,250)}`);
    if (backfillDRes.status >= 400) {
      console.log('     ✅ DITOLAK sesuai ekspektasi (melewati batas H+2 jam).');
    } else {
      console.error('     ❌ CELAH! Backfill melewati H+2 jam berhasil!');
    }
  } else {
    console.log('     ⚠️  Clara belum punya paket aktif, skenario backfill H+2 dilewati (akan diuji manual).');
  }
  console.log('----------------------------------------------------------------\n');

  // ===========================================================================
  // SKENARIO KYC: ANTI-TAMPER LOCK (Clara sudah APPROVED di langkah awal)
  // ===========================================================================
  console.log('🧪 [KYC] Lock Anti-Tamper pasca APPROVED (Clara) & approval Kukerta');
  const resubmitRes = await fetch(`${API_BASE}/identity-verification/me/submission`, {
    method: 'POST', headers: auth(claraToken),
    body: (() => { const fd = new FormData(); fd.append('nik', '9999999999999999'); return fd; })(),
  });
  const resubmitJson = await resubmitRes.json().catch(() => ({}));
  console.log(`   * Clara (sudah APPROVED) coba submit ulang KYC -> HTTP ${resubmitRes.status}: ${JSON.stringify(resubmitJson).slice(0,200)}`);
  if (resubmitRes.status >= 400) {
    console.log('     ✅ Dokumen terkunci, resubmission ditolak sesuai ekspektasi anti-tamper.');
  } else {
    console.error('     ❌ CELAH! Member bisa mengubah dokumen KYC yang sudah APPROVED!');
  }

  const pendingKuker = await fetch(`${API_BASE}/identity-verifications?status=PENDING`, { headers: auth(superOwnerToken) }).then(r => r.json());
  const kukerCase = pendingKuker.items?.find(i => i.user?.displayName?.includes('Kukerta'));
  if (kukerCase) {
    for (const doc of kukerCase.documents ?? []) {
      const ap = await fetch(`${API_BASE}/identity-verifications/${doc.id}/decisions/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth(superOwnerToken) }, body: JSON.stringify({ expectedVersion: doc.version ?? 1, note: 'UAT approval' }) });
      console.log(`   * Super Owner approve dokumen ${doc.kind} (Kukerta) -> HTTP ${ap.status}`);
    }
  }
  console.log('----------------------------------------------------------------\n');

  console.log('🏁 AUDIT FASE 1 SELESAI.');
}

main()
  .catch((err) => { console.error('❌ FATAL ERROR AUDIT FASE 1:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());

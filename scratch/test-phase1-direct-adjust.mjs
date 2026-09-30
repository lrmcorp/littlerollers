const API_BASE = 'http://127.0.0.1:32121';

async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/v1/auth/password/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, channel: 'WEB' }),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  const setCookie = res.headers.get('set-cookie');
  let sessionCookie = '';
  if (setCookie) {
    const match = setCookie.match(/dd_session=([^;]+)/);
    if (match) {
      sessionCookie = `dd_session=${match[1]}`;
    }
  }
  const json = await res.json();
  return { sessionCookie, user: json.user || json.session?.user || { email } };
}

async function runTest() {
  console.log('=================================================================');
  console.log('🧪 PENGUJIAN NON-HAPPY PATH TAHAP 1: DIRECT ADJUSTMENT & WEWENANG');
  console.log('=================================================================');

  // 1. Login Akun-Akun Uji Resmi
  console.log('\n[1/7] Melakukan otentikasi peran...');
  const superOwner = await login('superowner@dailydose.test', 'ridho123');
  console.log('  ✅ Super Owner login sukses:', superOwner.user.displayName || 'Super Owner');
  const managerGG = await login('manager.gg@dailydose.test', 'ridho123');
  console.log('  ✅ Manager GG login sukses:', managerGG.user.displayName || 'Manager GG');
  const adminMK = await login('adminmk@ddose.com', 'ridho123');
  console.log('  ✅ Admin MK login sukses:', adminMK.user.displayName || 'Admin MK');
  const member = await login('customer.maya@dailydose.test', 'ridho123');
  console.log('  ✅ Member Maya login sukses:', member.user.displayName || 'Customer Maya');

  // Cari paket pelanggan aktif Amanda di Green Garden via API
  console.log('\n[2/7] Mengambil daftar paket via API...');
  const pkgResGG = await fetch(`${API_BASE}/api/v1/customer-packages?status=ACTIVE`, {
    headers: { Cookie: managerGG.sessionCookie },
  });
  const pkgDataGG = await pkgResGG.json();
  const targetPkgGG = (pkgDataGG.items || []).find(
    (p) => p.branchName?.includes('Green Garden'),
  ) || (pkgDataGG.items || [])[0];

  // Cari paket cabang lain via Super Owner
  const pkgResAll = await fetch(`${API_BASE}/api/v1/customer-packages?status=ACTIVE`, {
    headers: { Cookie: superOwner.sessionCookie },
  });
  const pkgDataAll = await pkgResAll.json();
  const targetPkgOther = (pkgDataAll.items || []).find(
    (p) => !p.branchName?.includes('Green Garden'),
  );

  if (!targetPkgGG) {
    throw new Error('Paket Green Garden tidak ditemukan di response API!');
  }
  const saldoAwal = targetPkgGG.ledgerBalance;
  console.log(`  📦 Target Paket GG: ID ${targetPkgGG.id} (Saldo Ledger: ${saldoAwal}, Tersedia: ${targetPkgGG.available})`);
  if (targetPkgOther) {
    console.log(`  📦 Target Paket Cabang Lain: ID ${targetPkgOther.id} (${targetPkgOther.branchName})`);
  }

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      testFailed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST-1.1: Unauthorized Role (Admin MK & Member mencoba menembak direct adjustment)
  // -------------------------------------------------------------------------
  console.log('\n[3/7] Menjalankan TEST-1.1: Otorisasi Role (Kasir & Member dilarang direct adjust)...');
  const res1_1 = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminMK.sessionCookie,
    },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: 1,
      reasonCode: 'PACKAGE_COMPENSATION',
      note: 'Kasir nakal mencoba bypass wewenang',
    }),
  });
  const data1_1 = await res1_1.json();
  assert(
    res1_1.status === 403,
    `Admin kasir ditolak dengan HTTP 403 Forbidden (Aktual: HTTP ${res1_1.status})`,
  );
  assert(
    data1_1.error?.code === 'FORBIDDEN',
    `Kode error kasir sesuai: FORBIDDEN (Aktual: ${data1_1.error?.code})`,
  );

  const res1_1b = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: member.sessionCookie,
    },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: 5,
      reasonCode: 'PACKAGE_COMPENSATION',
    }),
  });
  assert(
    res1_1b.status === 403,
    `Member customer ditolak dengan HTTP 403 Forbidden (Aktual: HTTP ${res1_1b.status})`,
  );

  // -------------------------------------------------------------------------
  // TEST-1.2: Isolasi Cabang (Manager GG mencoba ubah paket cabang lain)
  // -------------------------------------------------------------------------
  console.log('\n[4/7] Menjalankan TEST-1.2: Isolasi Cabang (Manager GG dilarang ubah paket non-GG)...');
  if (targetPkgOther) {
    const res1_2 = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: managerGG.sessionCookie,
      },
      body: JSON.stringify({
        customerPackageId: targetPkgOther.id,
        quantity: 1,
        reasonCode: 'PACKAGE_COMPENSATION',
        note: 'Manager GG mencoba ubah cabang lain',
      }),
    });
    assert(
      res1_2.status === 404 || res1_2.status === 403,
      `Manager GG dicekal dari paket cabang lain dengan HTTP ${res1_2.status}`,
    );
  } else {
    console.log('  ⚠️ Lewati TEST-1.2: Tidak ada paket cabang non-GG.');
  }

  // -------------------------------------------------------------------------
  // TEST-1.3: Insufficient Balance (Pengurangan melebihi saldo)
  // -------------------------------------------------------------------------
  console.log('\n[5/7] Menjalankan TEST-1.3: Validasi Saldo (Kurangi sesi lebih dari saldo)...');
  const res1_3 = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: managerGG.sessionCookie,
    },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: -20, // kuota max 50 tapi saldo hanya 10, sehingga melebih saldo
      reasonCode: 'ATTENDANCE_CORRECTION',
      note: 'Pengurangan melebihi saldo',
    }),
  });
  const data1_3 = await res1_3.json();
  assert(
    res1_3.status === 409,
    `Pengurangan melebihi saldo ditolak dengan HTTP 409 Conflict (Aktual: HTTP ${res1_3.status})`,
  );
  assert(
    data1_3.error?.code === 'INSUFFICIENT_SESSION_BALANCE',
    `Kode error sesuai: INSUFFICIENT_SESSION_BALANCE (Aktual: ${data1_3.error?.code})`,
  );

  // -------------------------------------------------------------------------
  // TEST-1.4: Input Cacat (Quantity 0, float, reasonCode salah, bad UUID)
  // -------------------------------------------------------------------------
  console.log('\n[6/7] Menjalankan TEST-1.4: Input Validasi Cacat...');
  const res1_4a = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: managerGG.sessionCookie },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: 0,
      reasonCode: 'PACKAGE_COMPENSATION',
    }),
  });
  assert(res1_4a.status === 422, `Delta 0 ditolak HTTP 422 (Aktual: ${res1_4a.status})`);

  const res1_4b = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: managerGG.sessionCookie },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: 1,
      reasonCode: 'KODE_PALSU_ASAL_ASALAN',
    }),
  });
  assert(res1_4b.status === 422, `ReasonCode palsu ditolak HTTP 422 (Aktual: ${res1_4b.status})`);

  // -------------------------------------------------------------------------
  // TEST-1.5: Eksekusi Langsung (Direct Adjustment) oleh Manager GG
  // -------------------------------------------------------------------------
  console.log('\n[7/7] Menjalankan TEST-1.5: Direct Adjustment 1-Klik oleh Manager GG (+2 Sesi)...');
  const res1_5 = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: managerGG.sessionCookie,
    },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: 2,
      reasonCode: 'PACKAGE_COMPENSATION',
      note: 'Kompensasi AC ruang reformer bocor pada kelas pagi',
    }),
  });
  const data1_5 = await res1_5.json();
  assert(res1_5.ok, `Direct adjustment Manager sukses HTTP ${res1_5.status}`);
  assert(
    data1_5.resultingBalance === saldoAwal + 2,
    `Saldo bertambah tepat 2 sesi: dari ${saldoAwal} menjadi ${data1_5.resultingBalance}`,
  );
  assert(
    data1_5.adjustment?.status === 'POSTED',
    `Status penyesuaian langsung POSTED tanpa PENDING (Aktual: ${data1_5.adjustment?.status})`,
  );

  // Verifikasi saldo paket ter-update di kueri selanjutnya
  const checkRes = await fetch(`${API_BASE}/api/v1/customer-packages?status=ACTIVE`, {
    headers: { Cookie: managerGG.sessionCookie },
  });
  const checkData = await checkRes.json();
  const updatedPkg = (checkData.items || []).find((p) => p.id === targetPkgGG.id);
  assert(
    updatedPkg?.ledgerBalance === saldoAwal + 2,
    `API customer-packages mengembalikan saldo baru: ledgerBalance = ${updatedPkg?.ledgerBalance}`,
  );

  // Rollback koreksi (-2) via Super Owner agar data kembali bersih
  console.log('\n  🧹 Membersihkan sesi uji: Super Owner mengembalikan -2 sesi...');
  const resRollback = await fetch(`${API_BASE}/api/v1/session-adjustments/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: superOwner.sessionCookie,
    },
    body: JSON.stringify({
      customerPackageId: targetPkgGG.id,
      quantity: -2,
      reasonCode: 'ATTENDANCE_CORRECTION',
      note: 'Rollback sesi uji coba selesai',
    }),
  });
  assert(resRollback.ok, `Rollback Super Owner sukses HTTP ${resRollback.status}`);

  console.log('\n=================================================================');
  console.log(`🏁 HASIL AKHIR PENGUJIAN TAHAP 1: ${testPassed} LULUS, ${testFailed} GAGAL`);
  console.log('=================================================================');

  if (testFailed > 0) process.exit(1);
}

runTest().catch((err) => {
  console.error('Crash pada test:', err);
  process.exit(1);
});

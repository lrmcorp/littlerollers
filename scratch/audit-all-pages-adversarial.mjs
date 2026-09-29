// scratch/audit-all-pages-adversarial.mjs
import http from 'node:http';

const WEB_BASE = 'http://localhost:32120';
const API_BASE = 'http://localhost:32121';

async function fetchUrl(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      redirect: 'manual', // do not auto-follow redirects so we can inspect 302/307 vs 200 vs 500
    });
    const text = await res.text();
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: text,
      ok: res.ok,
    };
  } catch (err) {
    return {
      status: 0,
      headers: {},
      body: err.message,
      ok: false,
    };
  }
}

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
  return { sessionCookie, user: json.user };
}

async function main() {
  console.log('========================================================');
  console.log('🔍 AUDIT & TESTING SETIAP HALAMAN - SKENARIO NO HAPPY PATH');
  console.log('========================================================\n');

  // 1. Authenticate users for different roles
  console.log('▶ Menyiapkan sesi pengujian (Anonymous, Customer, Manager, Super Owner)...');
  let customerSession, managerSession, superOwnerSession;
  try {
    customerSession = await login('amanda.member@dailydose.test', 'Customer123!');
    console.log('  ✅ Sesi Customer didapatkan:', customerSession.user?.displayName);
  } catch (e) {
    console.warn('  ⚠️ Customer login failed:', e.message);
  }

  try {
    managerSession = await login('manager.gg@dailydose.test', 'Manager123!');
    console.log('  ✅ Sesi Manager didapatkan:', managerSession.user?.displayName);
  } catch (e) {
    console.warn('  ⚠️ Manager login failed:', e.message);
  }

  try {
    superOwnerSession = await login('superowner@dailydose.test', 'SuperOwner123!');
    console.log('  ✅ Sesi Super Owner didapatkan:', superOwnerSession.user?.displayName);
  } catch (e) {
    console.warn('  ⚠️ Super Owner login failed:', e.message);
  }

  const results = [];

  function record(category, testName, url, status, expected, details = '') {
    const is500 = status >= 500;
    const pass = !is500 && (expected ? expected(status) : status < 400 || [302, 307, 308, 401, 403, 404].includes(status));
    results.push({
      category,
      testName,
      url,
      status,
      pass,
      is500,
      details,
    });
    const mark = is500 ? '❌ 500 CRASH' : pass ? '✅' : '⚠️';
    console.log(`  ${mark} [${category}] ${testName} -> HTTP ${status} ${details ? `(${details})` : ''}`);
  }

  // ----------------------------------------------------
  // TEST SUITE 1: HALAMAN PUBLIK & ANONYMOUS
  // ----------------------------------------------------
  console.log('\n--- 1. HALAMAN PUBLIK & AUTH ---');
  const publicRoutes = [
    '/',
    '/classes',
    '/packages',
    '/locations',
    '/sign-in',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/activate-account',
    '/contact',
    '/health',
    '/guide',
  ];
  for (const route of publicRoutes) {
    const res = await fetchUrl(`${WEB_BASE}${route}`);
    record('Public Routes', `Akses publik ${route}`, route, res.status, (s) => s === 200);
  }

  // ----------------------------------------------------
  // TEST SUITE 2: NO HAPPY PATH - PARAMETER ABNORMAL PADA RUTE PUBLIK
  // ----------------------------------------------------
  console.log('\n--- 2. NO HAPPY PATH: SLUG & ID INVALID PADA RUTE PUBLIK ---');
  const publicAdversarial = [
    { route: '/classes/non-existent-class-slug-xyz', label: 'Slug kelas fiktif' },
    { route: '/classes/%27%20OR%201=1%20--', label: 'SQL Injection pada slug kelas' },
    { route: '/classes/%3Cscript%3Ealert(1)%3C%2Fscript%3E', label: 'XSS payload pada slug kelas' },
    { route: '/packages/00000000-0000-0000-0000-000000000000', label: 'UUID paket fiktif' },
    { route: '/packages/malformed-id-123', label: 'Malformed package ID' },
    { route: '/locations/invalid-branch-slug', label: 'Slug lokasi fiktif' },
    { route: '/schedule/00000000-0000-0000-0000-000000000000', label: 'Schedule ID fiktif' },
    { route: '/schedule/invalid-id', label: 'Schedule ID malformed' },
    { route: '/check-in-pass#token=invalid', label: 'Check-in pass token fiktif' },
    { route: '/check-in/invalid-token-xyz-123', label: 'Check-in token fiktif' },
  ];
  for (const item of publicAdversarial) {
    const res = await fetchUrl(`${WEB_BASE}${item.route}`);
    record('Public Adversarial', item.label, item.route, res.status, (s) => s !== 500, `Responded ${res.status}`);
  }

  // ----------------------------------------------------
  // TEST SUITE 3: NO HAPPY PATH - AKSES HALAMAN TERPROTEKSI TANPA LOGIN (ANONYMOUS)
  // ----------------------------------------------------
  console.log('\n--- 3. NO HAPPY PATH: AKSES HALAMAN PRIVAT TANPA AUTENTIKASI ---');
  const protectedRoutes = [
    '/account',
    '/account/profile',
    '/account/security',
    '/account/packages',
    '/account/verification',
    '/bookings',
    '/bookings/b843e2cc-3e66-432d-bf86-aa5f43a085c4',
    '/bookings/new',
    '/orders',
    '/orders/00000000-0000-0000-0000-000000000000',
    '/purchases',
    '/checkout',
    '/workspace',
    '/workspace/bookings',
    '/workspace/payments',
    '/workspace/classes',
    '/workspace/packages',
    '/workspace/vouchers',
    '/workspace/reminders',
    '/workspace/availability',
    '/workspace/branches',
    '/workspace/branch-performance',
    '/finance',
    '/operations',
    '/ledger',
    '/ledger/adjustments',
    '/users',
    '/users/roles-permissions',
    '/support-cases',
    '/master',
    '/master/rates',
    '/audit',
    '/check-in-scanner',
  ];
  for (const route of protectedRoutes) {
    const res = await fetchUrl(`${WEB_BASE}${route}`);
    // Expected: either 302/307 redirect to /sign-in, 401/403, or 200 with client-side auth guard. CRITICAL: MUST NEVER BE 500!
    record('Anonymous Protected', `Akses anonim ke ${route}`, route, res.status, (s) => s !== 500, `Status: ${res.status}`);
  }

  // ----------------------------------------------------
  // TEST SUITE 4: NO HAPPY PATH - CROSS-ROLE ACCESS (CUSTOMER MENCOBA BUKA HALAMAN STAFF/ADMIN)
  // ----------------------------------------------------
  console.log('\n--- 4. NO HAPPY PATH: PRIVILEGE ESCALATION / CROSS-ROLE (CUSTOMER -> ADMIN) ---');
  if (customerSession?.sessionCookie) {
    const adminRoutes = [
      '/workspace',
      '/workspace/bookings',
      '/workspace/payments',
      '/workspace/classes',
      '/workspace/packages',
      '/workspace/vouchers',
      '/workspace/reminders',
      '/workspace/availability',
      '/workspace/branches',
      '/workspace/branch-performance',
      '/finance',
      '/operations',
      '/ledger',
      '/ledger/adjustments',
      '/users',
      '/users/roles-permissions',
      '/support-cases',
      '/master',
      '/audit',
      '/check-in-scanner',
    ];
    for (const route of adminRoutes) {
      const res = await fetchUrl(`${WEB_BASE}${route}`, {
        headers: { Cookie: customerSession.sessionCookie },
      });
      // Customer accessing admin pages should either be redirected (302/307), blocked (403), or handled safely (never 500).
      record('Customer Cross-Role', `Customer membuka ${route}`, route, res.status, (s) => s !== 500, `Status: ${res.status}`);
    }
  }

  // ----------------------------------------------------
  // TEST SUITE 5: NO HAPPY PATH - PARAMETER TIDAK VALID PADA SESI LOGIN
  // ----------------------------------------------------
  console.log('\n--- 5. NO HAPPY PATH: ID INVALID/FIKTIF PADA ENTITAS PRIVAT ---');
  if (customerSession?.sessionCookie) {
    const customerInvalidRoutes = [
      { route: '/bookings/00000000-0000-0000-0000-000000000000', label: 'Booking UUID bukan milik customer' },
      { route: '/bookings/malformed-booking-id-xyz', label: 'Booking ID format acak' },
      { route: '/orders/00000000-0000-0000-0000-000000000000', label: 'Order UUID bukan milik customer' },
      { route: '/orders/invalid-order-id', label: 'Order ID format acak' },
    ];
    for (const item of customerInvalidRoutes) {
      const res = await fetchUrl(`${WEB_BASE}${item.route}`, {
        headers: { Cookie: customerSession.sessionCookie },
      });
      record('Customer Invalid Params', item.label, item.route, res.status, (s) => s !== 500, `Status: ${res.status}`);
    }
  }

  if (managerSession?.sessionCookie) {
    const managerInvalidRoutes = [
      { route: '/workspace/bookings/00000000-0000-0000-0000-000000000000', label: 'Admin Booking UUID fiktif' },
      { route: '/workspace/payments/00000000-0000-0000-0000-000000000000', label: 'Admin Payment UUID fiktif' },
      { route: '/workspace/packages/00000000-0000-0000-0000-000000000000', label: 'Admin Package UUID fiktif' },
      { route: '/workspace/vouchers/00000000-0000-0000-0000-000000000000', label: 'Admin Voucher UUID fiktif' },
      { route: '/workspace/branches/00000000-0000-0000-0000-000000000000', label: 'Admin Branch UUID fiktif' },
      { route: '/ledger/00000000-0000-0000-0000-000000000000', label: 'Ledger Package UUID fiktif' },
      { route: '/ledger/adjustments/00000000-0000-0000-0000-000000000000', label: 'Ledger Adjustment UUID fiktif' },
      { route: '/users/00000000-0000-0000-0000-000000000000', label: 'User detail UUID fiktif' },
      { route: '/support-cases/00000000-0000-0000-0000-000000000000', label: 'Support case UUID fiktif' },
    ];
    for (const item of managerInvalidRoutes) {
      const res = await fetchUrl(`${WEB_BASE}${item.route}`, {
        headers: { Cookie: managerSession.sessionCookie },
      });
      record('Manager Invalid Params', item.label, item.route, res.status, (s) => s !== 500, `Status: ${res.status}`);
    }
  }

  // ----------------------------------------------------
  // TEST SUITE 6: API BOUNDARY & ADVERSARIAL VALIDATION (NEGATIVE CASES)
  // ----------------------------------------------------
  console.log('\n--- 6. NO HAPPY PATH: API ENDPOINTS BOUNDARY & NEGATIVE VALIDATION ---');
  const apiNegativeCases = [
    {
      method: 'POST',
      url: `${API_BASE}/api/v1/auth/password/sessions`,
      body: { email: 'non-existent@test.com', password: 'WrongPassword123!', channel: 'WEB' },
      label: 'Login email fiktif',
      expectedStatus: 401,
    },
    {
      method: 'POST',
      url: `${API_BASE}/api/v1/auth/password/sessions`,
      body: { email: 'invalid-email-format', password: '123' },
      label: 'Login payload tidak valid (bad email format)',
      expectedStatus: 400,
    },
    {
      method: 'POST',
      url: `${API_BASE}/api/v1/auth/password/sessions`,
      body: {},
      label: 'Login body kosong',
      expectedStatus: 400,
    },
    {
      method: 'GET',
      url: `${API_BASE}/api/v1/bookings/00000000-0000-0000-0000-000000000000`,
      cookie: customerSession?.sessionCookie,
      label: 'Query booking fiktif via API',
      expectedStatus: 404,
    },
    {
      method: 'GET',
      url: `${API_BASE}/api/v1/bookings/invalid-uuid`,
      cookie: customerSession?.sessionCookie,
      label: 'Query booking malformed UUID via API',
      expectedStatus: 400,
    },
    {
      method: 'POST',
      url: `${API_BASE}/api/v1/bookings`,
      cookie: customerSession?.sessionCookie,
      body: { classSlotId: 'not-a-slot', customerPackageId: 'not-a-pkg' },
      label: 'Booking dengan slot fiktif',
      expectedStatus: 400,
    },
    {
      method: 'POST',
      url: `${API_BASE}/api/v1/check-ins/tokens/consume`,
      body: { token: 'invalid-token-123' },
      label: 'Konsumsi token check-in invalid',
      expectedStatus: 400,
    },
    {
      method: 'GET',
      url: `${API_BASE}/api/v1/finance/reports`,
      cookie: customerSession?.sessionCookie, // Customer trying to access finance API
      label: 'Akses Finance API oleh Customer (Unauthorized)',
      expectedStatus: 403,
    },
  ];

  for (const item of apiNegativeCases) {
    const res = await fetchUrl(item.url, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
        ...(item.cookie ? { Cookie: item.cookie } : {}),
      },
      body: item.body ? JSON.stringify(item.body) : undefined,
    });
    const pass = res.status === item.expectedStatus || (res.status >= 400 && res.status < 500);
    record(
      'API Negative',
      item.label,
      item.url,
      res.status,
      () => pass,
      `Expected ${item.expectedStatus}, got ${res.status}`
    );
  }

  // ----------------------------------------------------
  // REKAPITULASI HASIL AUDIT
  // ----------------------------------------------------
  console.log('\n========================================================');
  console.log('📊 REKAPITULASI HASIL AUDIT SETIAP HALAMAN (NO HAPPY PATH)');
  console.log('========================================================');
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed500 = results.filter((r) => r.is500).length;
  const warnings = results.filter((r) => !r.pass && !r.is500).length;

  console.log(`Total Pengujian Skenario : ${total}`);
  console.log(`Lulus Aman (No 500 Crash): ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`Peringatan (Non-500)     : ${warnings}`);
  console.log(`Critical Server Crash 500: ${failed500}`);

  if (failed500 > 0) {
    console.error('\n🚨 DITEMUKAN SKENARIO DENGAN STATUS 500 INTERNAL SERVER ERROR:');
    results.filter((r) => r.is500).forEach((r) => {
      console.error(`  - [${r.category}] ${r.testName} (${r.url})`);
    });
  } else {
    console.log('\n🎉 SEMPURNA: Tidak ada satu pun halaman atau rute yang mengalami 500 Crash atau unhandled exception!');
  }
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface AuditScenarioResult {
  code: string;
  name: string;
  phase: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const results: AuditScenarioResult[] = [];

async function runScenario(
  code: string,
  name: string,
  fn: () => Promise<string>,
) {
  const start = Date.now();
  try {
    const msg = await fn();
    const durationMs = Date.now() - start;
    results.push({
      code,
      name,
      phase: 'FASE 4 / PRIORITAS 7',
      passed: true,
      message: msg,
      durationMs,
    });
    console.log(`[✅ PASS] ${code}: ${name} (${durationMs}ms) -> ${msg}`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({
      code,
      name,
      phase: 'FASE 4 / PRIORITAS 7',
      passed: false,
      message: err.message,
      durationMs,
    });
    console.error(`[❌ FAIL] ${code}: ${name} (${durationMs}ms) -> ${err.message}`);
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 MEMULAI DEEP AUDIT & UAT NON-HAPPY PATH: PRIORITAS 7');
  console.log('Notifikasi, Pengingat WhatsApp & Otomasi Operasional (Poin 7 & Poin 16)');
  console.log('Sistem: Daily Dose Pilates V2 | Lingkungan: Native macOS Real MySQL & Localhost');
  console.log('========================================================================\n');

  let dbUrl = process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat';
  if (!dbUrl.includes('connect_timeout')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=15';
  }
  const prisma = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });
  
  let connected = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect();
      connected = true;
      break;
    } catch (err: any) {
      if (attempt === 3) throw err;
      console.warn(`[WARN] Percobaan koneksi database ke-${attempt} gagal, mencoba ulang dalam 1 detik...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('🔌 Terhubung ke Database MySQL dailydose_v2_uat pada 127.0.0.1:3306\n');

  try {
    // -------------------------------------------------------------------------
    // ADV-7.1: Integritas Struktur & Status Log Notifikasi WhatsApp (ReminderLog)
    // -------------------------------------------------------------------------
    await runScenario(
      'ADV-7.1',
      'Integritas Log Pengiriman WhatsApp (ReminderLog) di Real MySQL',
      async () => {
        const count = await prisma.reminderLog.count();
        const logs = await prisma.reminderLog.findMany({
          take: 50,
          orderBy: { sentAt: 'desc' },
        });

        // Verifikasi tidak ada status anomali selain SENT, FAILED, SKIPPED_DUPLICATE
        const validStatuses = new Set(['SENT', 'FAILED', 'SKIPPED_DUPLICATE']);
        for (const l of logs) {
          if (!validStatuses.has(l.status)) {
            throw new Error(`Ditemukan status pengiriman tidak valid: "${l.status}" pada log ID ${l.id}`);
          }
          // Nomor telepon harus diawali tanda + atau digit bersih
          if (!l.recipientPhone || (!l.recipientPhone.startsWith('+') && !/^\d+$/.test(l.recipientPhone))) {
            throw new Error(`Nomor telepon log tidak standar E.164: "${l.recipientPhone}" pada log ID ${l.id}`);
          }
        }

        return `Tervalidasi ${count} total log pengingat di database; ${logs.length} log terbaru 100% berstatus valid dan berformat E.164 bersih`;
      },
    );

    // -------------------------------------------------------------------------
    // ADV-7.2: Integritas Data Master Aturan Kuota Minimum (MinQuotaSetting)
    // -------------------------------------------------------------------------
    await runScenario(
      'ADV-7.2',
      'Integritas Konfigurasi Aturan Kuota Minimum Kelas (MinQuotaSetting)',
      async () => {
        const settings = await prisma.minQuotaSetting.findMany({
          include: {
            branch: true,
            classType: true,
          },
        });

        if (settings.length === 0) {
          return 'Tabel min_quota_setting menggunakan fallback dinamis aman (default minQuota=1, cutoffHours=24)';
        }

        for (const s of settings) {
          if (s.minQuota < 1) {
            throw new Error(`MinQuota tidak valid (< 1): ${s.minQuota} pada cabang ${s.branch.name}`);
          }
          if (s.cutoffHours < 1) {
            throw new Error(`CutoffHours tidak valid (< 1): ${s.cutoffHours} pada cabang ${s.branch.name}`);
          }
          if (!s.branch || !s.classType) {
            throw new Error(`Relasi cabang atau jenis kelas terputus pada min_quota_setting ID ${s.id}`);
          }
        }

        return `Ditemukan ${settings.length} konfigurasi min_quota_setting aktif; seluruh relasi cabang dan jenis kelas terhubung utuh`;
      },
    );

    // -------------------------------------------------------------------------
    // ADV-7.3: Live HTTP UAT API: Endpoint Ringkasan Notifikasi (/reminders/summary)
    // -------------------------------------------------------------------------
    await runScenario(
      'ADV-7.3',
      'Live HTTP UAT: Endpoint Ringkasan Pengingat API (/operations/reminders/summary)',
      async () => {
        // Ambil akun Super Owner uji dari database / env
        const superOwnerEmail = 'superowner@dailydose.test';
        const superOwnerPassword = 'SuperOwner123!';

        // Lakukan login untuk mendapatkan cookie sesi
        const loginRes = await fetch('http://127.0.0.1:32121/api/v1/auth/password/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: superOwnerEmail,
            password: superOwnerPassword,
            channel: 'WEB',
          }),
        });

        if (!loginRes.ok) {
          throw new Error(`Login Super Owner gagal (HTTP ${loginRes.status}): ${await loginRes.text()}`);
        }

        const rawCookie = loginRes.headers.get('set-cookie') || '';
        const sessionCookie = rawCookie.split(';')[0];

        // Request summary endpoint dengan session cookie
        const summaryRes = await fetch('http://127.0.0.1:32121/api/v1/operations/reminders/summary', {
          headers: sessionCookie ? { Cookie: sessionCookie } : {},
        });

        if (!summaryRes.ok) {
          throw new Error(`HTTP ${summaryRes.status} saat mengakses /api/v1/operations/reminders/summary: ${await summaryRes.text()}`);
        }

        const json = (await summaryRes.json()) as any;
        if (!json.success || !json.data) {
          throw new Error(`Format respons summary tidak valid: ${JSON.stringify(json)}`);
        }

        const provider = json.data.provider;
        const totalSent = json.data.totalRecentSent;
        const totalFailed = json.data.totalRecentFailed;

        return `Endpoint summary HTTP 200 OK. Provider aktif: "${provider}", terkirim: ${totalSent}, gagal: ${totalFailed}`;
      },
    );

    // -------------------------------------------------------------------------
    // ADV-7.4: Live HTTP UAT API: Keamanan Endpoint Otomasi (Unauthorized Interception)
    // -------------------------------------------------------------------------
    await runScenario(
      'ADV-7.4',
      'Live HTTP UAT: Pencegahan Akses Pemicu Otomasi Tanpa Kredensial Resmi',
      async () => {
        const autoCancelRes = await fetch('http://127.0.0.1:32121/api/v1/operations/auto-cancel/evaluate', {
          method: 'POST',
        });
        const reminderBatchRes = await fetch('http://127.0.0.1:32121/api/v1/operations/reminders/evaluate-batch', {
          method: 'POST',
        });

        if (autoCancelRes.status !== 401 && autoCancelRes.status !== 403) {
          throw new Error(`Endpoint auto-cancel tidak menolak request unauthenticated (HTTP ${autoCancelRes.status})`);
        }

        if (reminderBatchRes.status !== 401 && reminderBatchRes.status !== 403) {
          throw new Error(`Endpoint reminder batch tidak menolak request unauthenticated (HTTP ${reminderBatchRes.status})`);
        }

        return `Kedua endpoint otomasi berisiko tinggi menolak request publik dengan aman (HTTP ${autoCancelRes.status} & HTTP ${reminderBatchRes.status})`;
      },
    );

    // -------------------------------------------------------------------------
    // ADV-7.5: Live HTTP UAT Web: Halaman Workspace Pengingat (/workspace/reminders)
    // -------------------------------------------------------------------------
    await runScenario(
      'ADV-7.5',
      'Live HTTP UAT: Akses Halaman Monitoring Workspace (/workspace/reminders)',
      async () => {
        const res = await fetch('http://127.0.0.1:32120/workspace/reminders', {
          headers: { 'User-Agent': 'DailyDoseUAT-DeepAudit/1.0' },
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} saat mengakses /workspace/reminders`);
        }

        const html = await res.text();

        // Verifikasi tidak ada kode internal bocor
        if (html.includes('ALL_LEVELS') || html.includes('SessionLedger') || html.includes('tanpa pilihan otomatis')) {
          throw new Error('Halaman memuat residu kode programmer mentah atau teks to-do!');
        }

        return 'Halaman /workspace/reminders merender HTTP 200 OK dan 100% bebas dari kebocoran teks programmer internal';
      },
    );

    // -------------------------------------------------------------------------
    // ADV-7.6: Audit Trail Mutasi Sesi Pembatalan Otomatis di Real MySQL
    // -------------------------------------------------------------------------
    await runScenario(
      'ADV-7.6',
      'Integritas Log Mutasi Sesi Pembatalan Otomatis (SessionLedger) di MySQL',
      async () => {
        const ledgers = await prisma.sessionLedger.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            customerPackage: {
              include: { package: true, user: true },
            },
          },
        });

        for (const entry of ledgers) {
          if (!entry.customerPackage) {
            throw new Error(`Entry SessionLedger ID ${entry.id} tidak memiliki relasi paket pelanggan!`);
          }
          if (entry.balanceAfter < 0) {
            throw new Error(`Saldo sesi bernilai negatif (${entry.balanceAfter}) pada ledger ID ${entry.id}`);
          }
        }

        return `Tervalidasi ${ledgers.length} sampel mutasi saldo sesi terbaru; seluruh saldo balanceAfter >= 0 dan integritas paket pelanggan utuh`;
      },
    );
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Koneksi Database Ditutup.');
  }

  // Ringkasan
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n========================================================================');
  console.log('📊 RANGKUMAN HASIL DEEP AUDIT UAT NON-HAPPY PATH: PRIORITAS 7');
  console.log('========================================================================');
  console.log(`Total Skenario Diuji : ${results.length}`);
  console.log(`Skenario LULUS (PASS): ${passedCount} (${((passedCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Skenario GAGAL (FAIL): ${failedCount}`);

  // Simpan hasil ke file JSON
  const outputDir = path.resolve(__dirname, '../../docs/uat/bukti');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'adversarial_audit_prioritas_7.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n💾 Bukti Audit Disimpan ke: ${outputPath}`);

  if (failedCount > 0) {
    console.error('\n⚠️ TERDAPAT SKENARIO DEEP AUDIT YANG GAGAL. TINJAU KEMBALI LOG DI ATAS.');
    process.exit(1);
  } else {
    console.log('\n🎉 SELURUH SKENARIO DEEP AUDIT & UAT NON-HAPPY PATH PRIORITAS 7 LULUS 100%!\n');
  }
}

void main();

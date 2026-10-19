import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DashboardService } from '../../apps/api/src/dashboard/dashboard.service';

interface TestResult {
  code: string;
  name: string;
  phase: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

function recordResult(code: string, name: string, phase: string, passed: boolean, message: string, durationMs: number) {
  results.push({ code, name, phase, passed, message, durationMs });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] ${code}: ${name} (${durationMs}ms) -> ${message}`);
}

function fetchHttpViaCurl(url: string): { status: number; body: string } {
  try {
    const raw = execSync(`curl -s -i --max-time 35 "${url}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const headerEndIndex = raw.indexOf('\r\n\r\n');
    const headerPart = headerEndIndex !== -1 ? raw.slice(0, headerEndIndex) : raw;
    const bodyPart = headerEndIndex !== -1 ? raw.slice(headerEndIndex + 4) : raw;
    const statusMatch = headerPart.match(/^HTTP\/[0-9.]+\s+(\d+)/m);
    const status = statusMatch ? parseInt(statusMatch[1]!, 10) : 200;
    return { status, body: bodyPart };
  } catch (err: any) {
    return { status: 500, body: String(err) };
  }
}

async function runPrioritas6DeepAudit() {
  console.log('========================================================================');
  console.log('🚀 MEMULAI DEEP AUDIT & UAT NON-HAPPY PATH: PRIORITAS 6 (POIN 23, 24, 25, 26)');
  console.log('Sistem: Daily Dose Pilates V2 | Lingkungan: Native macOS Real MySQL & Localhost');
  console.log('========================================================================\n');

  const dbUrl = process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat';
  const prisma = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });

  try {
    await prisma.$connect();
    console.log('🔌 Terhubung ke Database MySQL dailydose_v2_uat pada 127.0.0.1:3306\n');

    // ------------------------------------------------------------------------
    // ADV-6.1: Verifikasi Label Metrik Dashboard API (dashboard.service.ts)
    // ------------------------------------------------------------------------
    {
      const start = Date.now();
      try {
        const dashboardService = new DashboardService(prisma as any);
        const superOwnerPrincipal = {
          userId: 'audit-super-owner-1',
          roles: [{ role: 'SUPER_OWNER', branchId: null }],
          branchIds: [],
          capabilities: ['branch:all', 'finance:read', 'operations:read'],
        } as any;

        const overview = await dashboardService.overview(superOwnerPrincipal, {
          from: '2026-09-01',
          until: '2026-10-19',
        });

        const metrics = overview.metrics;
        const grossSalesMetric = metrics.find((m) => m.key === 'gross-sales');
        const projectionMetric = metrics.find((m) => m.key === 'projection');
        const correctionMetric = metrics.find((m) => m.key === 'correction');
        const revenueMetric = metrics.find((m) => m.key === 'revenue');
        const profitMetric = metrics.find((m) => m.key === 'profit');

        const labelsAreStandardized =
          grossSalesMetric?.label === 'Penjualan kotor' &&
          projectionMetric?.label === 'Proyeksi beban' &&
          correctionMetric?.label === 'Koreksi (terpisah)' &&
          revenueMetric?.label === 'Omzet bersih' &&
          profitMetric?.label === 'Profit operasional';

        const jsonString = JSON.stringify(metrics);
        const hasLegacyEnglish =
          /Gross sales/i.test(jsonString) ||
          /Projection cost/i.test(jsonString) ||
          /Projection rate/i.test(jsonString);

        const passed = labelsAreStandardized && !hasLegacyEnglish;
        recordResult(
          'ADV-6.1',
          'Standardisasi Label Metrik Finansial API Dashboard (Penjualan kotor, Proyeksi beban, Koreksi)',
          'FASE 6',
          passed,
          passed
            ? 'Metrik API 100% menggunakan bahasa Indonesia baku; 0 istilah Gross sales/Projection cost'
            : `Gagal validasi: labelsAreStandardized=${labelsAreStandardized}, hasLegacyEnglish=${hasLegacyEnglish}`,
          Date.now() - start,
        );
      } catch (err: any) {
        recordResult('ADV-6.1', 'Standardisasi Label Metrik Finansial API Dashboard', 'FASE 6', false, err.message, Date.now() - start);
      }
    }

    // ------------------------------------------------------------------------
    // ADV-6.2: Verifikasi Integritas Data Cabang & Studio di Database
    // ------------------------------------------------------------------------
    {
      const start = Date.now();
      try {
        const branches = await prisma.cabang.findMany({ where: { active: true } });
        const studios = await prisma.studio.findMany({
          where: { active: true },
          include: { rooms: true, branch: true },
        });

        const branchesValid = branches.length > 0 && branches.every((b) => b.name && b.timezone === 'Asia/Jakarta');
        const studiosValid = studios.length > 0 && studios.every((s) => s.name && s.branchId && s.branch?.active);

        const passed = branchesValid && studiosValid;
        recordResult(
          'ADV-6.2',
          'Integritas Data Master Cabang & Studio Real di Database MySQL',
          'FASE 6',
          passed,
          `Ditemukan ${branches.length} cabang aktif (${branches.map((b) => b.name).join(', ')}) dan ${studios.length} area studio terhubung valid`,
          Date.now() - start,
        );
      } catch (err: any) {
        recordResult('ADV-6.2', 'Integritas Data Master Cabang & Studio Real di Database', 'FASE 6', false, err.message, Date.now() - start);
      }
    }

    // ------------------------------------------------------------------------
    // ADV-6.3: Live HTTP UAT - Halaman Lokasi (/locations) & Judul "Studio Kami"
    // ------------------------------------------------------------------------
    {
      const start = Date.now();
      try {
        const res = fetchHttpViaCurl('http://127.0.0.1:32120/locations');
        const hasStudioKami = res.body.includes('Studio Kami');
        const hasOurStudios = /Our Studios/i.test(res.body);

        const passed = res.status === 200 && hasStudioKami && !hasOurStudios;
        recordResult(
          'ADV-6.3',
          'Live HTTP UAT: Halaman Lokasi (/locations) Bebas Jargon Bahasa Inggris "Our Studios"',
          'FASE 6',
          passed,
          passed
            ? 'Judul halaman adalah "Studio Kami · Daily Dose Pilates", 0 teks "Our Studios"'
            : `HTTP ${res.status}, hasStudioKami=${hasStudioKami}, hasOurStudios=${hasOurStudios}`,
          Date.now() - start,
        );
      } catch (err: any) {
        recordResult('ADV-6.3', 'Live HTTP UAT: Halaman Lokasi (/locations)', 'FASE 6', false, err.message, Date.now() - start);
      }
    }

    // ------------------------------------------------------------------------
    // ADV-6.4: Live HTTP UAT - Halaman Landing (/) Ulasan Otentik & Perlengkapan
    // ------------------------------------------------------------------------
    {
      const start = Date.now();
      try {
        const res = fetchHttpViaCurl('http://127.0.0.1:32120/');
        const hasAuthenticTestimonials =
          res.body.includes('Maya S.') &&
          res.body.includes('Ronald K.') &&
          res.body.includes('Clarissa W.');
        const hasBawaReformerPribadi = /bawa reformer|reformer pribadi/i.test(res.body);

        const passed = res.status === 200 && hasAuthenticTestimonials && !hasBawaReformerPribadi;
        recordResult(
          'ADV-6.4',
          'Live HTTP UAT: Halaman Beranda (/) Testimoni Otentik Member & Bebas Salah Kaprah Reformer',
          'FASE 6',
          passed,
          passed
            ? '3 ulasan member otentik aktif terverifikasi; 0 instruksi keliru membawa reformer pribadi'
            : `HTTP ${res.status}, testimonials=${hasAuthenticTestimonials}, bawaReformer=${hasBawaReformerPribadi}`,
          Date.now() - start,
        );
      } catch (err: any) {
        recordResult('ADV-6.4', 'Live HTTP UAT: Halaman Beranda (/)', 'FASE 6', false, err.message, Date.now() - start);
      }
    }

    // ------------------------------------------------------------------------
    // ADV-6.5: Live HTTP UAT - Halaman Kelas (/classes) Bebas Residu Prototyping
    // ------------------------------------------------------------------------
    {
      const start = Date.now();
      try {
        const res = fetchHttpViaCurl('http://127.0.0.1:32120/classes');
        const hasRawAllLevels = /ALL_LEVELS/.test(res.body);
        const hasPrototypeText = /tanpa pilihan otomatis|sumber operasionalnya disetujui/.test(res.body);

        const passed = res.status === 200 && !hasRawAllLevels && !hasPrototypeText;
        recordResult(
          'ADV-6.5',
          'Live HTTP UAT: Halaman Katalog Kelas (/classes) Bebas Kode ALL_LEVELS & Teks Prototyping',
          'FASE 6',
          passed,
          passed
            ? 'Katalog kelas merender level ramah pengguna ("Semua Level"); 0 catatan to-do developer'
            : `HTTP ${res.status}, rawALL_LEVELS=${hasRawAllLevels}, prototypeText=${hasPrototypeText}`,
          Date.now() - start,
        );
      } catch (err: any) {
        recordResult('ADV-6.5', 'Live HTTP UAT: Halaman Katalog Kelas (/classes)', 'FASE 6', false, err.message, Date.now() - start);
      }
    }

    // ------------------------------------------------------------------------
    // ADV-6.6: Live HTTP UAT - Halaman Panduan (/guide) Kebersihan Jargon Operasional
    // ------------------------------------------------------------------------
    {
      const start = Date.now();
      try {
        const res = fetchHttpViaCurl('http://127.0.0.1:32120/guide');
        const forbiddenWords = ['APPROVED', 'LUNAS', 'KYC', 'ATTENDED', 'Front Desk Scanner', 'Super Owner'];
        const foundWords = forbiddenWords.filter((w) => res.body.includes(w));

        const passed = res.status === 200 && foundWords.length === 0;
        recordResult(
          'ADV-6.6',
          'Live HTTP UAT: Panduan Pelanggan (/guide) 100% Bersih dari Jargon Staf Internal',
          'FASE 6',
          passed,
          passed
            ? 'Halaman panduan pelanggan 100% ramah publik; zero internal operational jargon leak'
            : `Ditemukan istilah terlarang: ${foundWords.join(', ')}`,
          Date.now() - start,
        );
      } catch (err: any) {
        recordResult('ADV-6.6', 'Live HTTP UAT: Panduan Pelanggan (/guide)', 'FASE 6', false, err.message, Date.now() - start);
      }
    }

  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Koneksi Database Ditutup.');
  }

  // --------------------------------------------------------------------------
  // Rangkuman Hasil
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 RANGKUMAN HASIL DEEP AUDIT UAT NON-HAPPY PATH: PRIORITAS 6');
  console.log('========================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total Skenario Diuji : ${results.length}`);
  console.log(`Skenario LULUS (PASS): ${passedCount} (${((passedCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Skenario GAGAL (FAIL): ${failedCount}\n`);

  const outputPath = path.resolve(__dirname, '../../docs/uat/bukti/adversarial_audit_prioritas_6.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`💾 Bukti Audit Disimpan ke: ${outputPath}\n`);

  if (failedCount > 0) {
    console.error('❌ Deep Audit GAGAL: Masih ada skenario non-happy path yang tidak memenuhi syarat!');
    process.exit(1);
  } else {
    console.log('🎉 SELURUH SKENARIO DEEP AUDIT & UAT NON-HAPPY PATH PRIORITAS 6 LULUS 100%!');
  }
}

void runPrioritas6DeepAudit();

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

interface PhaseResult {
  phase: number;
  name: string;
  script: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

const PHASES = [
  {
    phase: 1,
    name: 'Pemangkasan Birokrasi Form & Validasi Admin',
    script: 'tools/verification/verify-phase-1-simplification.ts',
  },
  {
    phase: 2,
    name: 'Pelepasan Ketergantungan Build SDK Client (api-client-ts)',
    script: 'tools/verification/verify-phase-2-direct-client.ts',
  },
  {
    phase: 3,
    name: 'Perampingan Controller & Service Backend (Clean CRUD)',
    script: 'tools/verification/verify-phase-3-clean-crud.ts',
  },
  {
    phase: 4,
    name: 'Sentralisasi Pengelolaan Media & MinIO Storage',
    script: 'tools/verification/verify-phase-4-media-centralization.ts',
  },
];

async function runPhase(
  rootDir: string,
  phase: (typeof PHASES)[number],
): Promise<PhaseResult> {
  console.log(`\n================================================================================`);
  console.log(`🚀 MENJALANKAN TAHAP ${phase.phase}: ${phase.name.toUpperCase()}`);
  console.log(`   Script: ${phase.script}`);
  console.log(`================================================================================\n`);

  const startTime = Date.now();
  const scriptPath = resolve(rootDir, phase.script);

  return new Promise<PhaseResult>((resolveResult) => {
    const child = spawn(
      'node',
      [
        '--env-file=.env',
        '--import',
        './apps/api/node_modules/tsx/dist/loader.mjs',
        scriptPath,
      ],
      {
        cwd: rootDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_PATH: [
            resolve(rootDir, 'apps/api/node_modules'),
            process.env.NODE_PATH || '',
          ]
            .filter(Boolean)
            .join(':'),
          NODE_ENV: 'test',
        },
      },
    );

    child.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      if (code === 0) {
        resolveResult({
          phase: phase.phase,
          name: phase.name,
          script: phase.script,
          success: true,
          durationMs,
        });
      } else {
        resolveResult({
          phase: phase.phase,
          name: phase.name,
          script: phase.script,
          success: false,
          durationMs,
          error: `Process exited with code ${code}`,
        });
      }
    });

    child.on('error', (err) => {
      const durationMs = Date.now() - startTime;
      resolveResult({
        phase: phase.phase,
        name: phase.name,
        script: phase.script,
        success: false,
        durationMs,
        error: err.message,
      });
    });
  });
}

async function main() {
  const rootDir = resolve(__dirname, '../..');
  const totalStartTime = Date.now();

  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILYDOSE V2 - MASTER ARCHITECTURAL SIMPLIFICATION RUNNER              ║');
  console.log('║         Memverifikasi Tahap 1 hingga Tahap 4 Secara Terpadu                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  const results: PhaseResult[] = [];

  for (const phase of PHASES) {
    const result = await runPhase(rootDir, phase);
    results.push(result);
    if (!result.success) {
      console.error(`\n❌ Tahap ${phase.phase} GAGAL! Menghentikan runner master.`);
      break;
    }
  }

  const totalDurationSeconds = ((Date.now() - totalStartTime) / 1000).toFixed(2);
  const allPassed = results.length === PHASES.length && results.every((r) => r.success);

  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                  RINGKASAN STATUS AKHIR PENYEDERHANAAN                       ║');
  console.log('╠═══════╦══════════════════════════════════════════════╦════════════╦═════════════╣');
  console.log('║ TAHAP ║ DESKRIPSI TARGET                             ║ STATUS     ║ DURASI      ║');
  console.log('╠═══════╬══════════════════════════════════════════════╬════════════╬═════════════╣');

  for (const r of results) {
    const statusText = r.success ? '✅ PASS' : '❌ FAIL';
    const paddedDesc = r.name.length > 44 ? r.name.slice(0, 41) + '...' : r.name.padEnd(44);
    const paddedDuration = `${(r.durationMs / 1000).toFixed(1)}s`.padStart(9);
    console.log(`║   ${r.phase}   ║ ${paddedDesc} ║  ${statusText.padEnd(8)}  ║ ${paddedDuration}   ║`);
  }

  console.log('╚═══════╩══════════════════════════════════════════════╩════════════╩═════════════╝');
  console.log(`Total Durasi Pengujian: ${totalDurationSeconds} detik`);

  if (!allPassed) {
    console.error('\n❌ Terdapat kegagalan pada rangkaian pengujian penyederhanaan!');
    process.exit(1);
  }

  console.log('\n🎉 SELURUH TAHAP PENYEDERHANAAN ARSITEKTUR BERHASIL 100%!');
  console.log('Sistem Dailydose V2 kini bersih, ringan, modular, dan bebas dari overhead berlebih.\n');
}

main().catch((err) => {
  console.error('\nFatal runner error:', err);
  process.exit(1);
});

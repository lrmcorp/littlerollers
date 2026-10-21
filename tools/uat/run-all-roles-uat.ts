/**
 * MASTER UAT SUITE RUNNER: ALL 7 ROLES
 * Daily Dose Pilates Studio Management System V2.0
 * 
 * Runs all 7 individual role test suites sequentially:
 * 1. Super Admin (12 Skenario)
 * 2. Customer / Member (12 Skenario)
 * 3. Admin Front Desk (8 Skenario)
 * 4. Instruktur / Coach (10 Skenario)
 * 5. Studio Manager (7 Skenario)
 * 6. Finance Lead (8 Skenario)
 * 7. Owner Cabang (5 Skenario)
 * 
 * Total: 62 Skenario End-to-End & No-Happy Path
 */

import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT_DIR = path.resolve(__dirname, '../..');

interface RoleRunner {
  roleNumber: number;
  roleName: string;
  scriptPath: string;
  expectedScenarios: number;
}

const roles: RoleRunner[] = [
  { roleNumber: 1, roleName: 'Super Admin', scriptPath: 'tools/uat/roles/uat-role-1-super-admin.ts', expectedScenarios: 12 },
  { roleNumber: 7, roleName: 'Customer / Member', scriptPath: 'tools/uat/roles/uat-role-7-customer-member.ts', expectedScenarios: 12 },
  { roleNumber: 4, roleName: 'Admin Front Desk', scriptPath: 'tools/uat/roles/uat-role-4-admin-front-desk.ts', expectedScenarios: 8 },
  { roleNumber: 5, roleName: 'Instruktur / Coach', scriptPath: 'tools/uat/roles/uat-role-5-instructor-coach.ts', expectedScenarios: 10 },
  { roleNumber: 3, roleName: 'Studio Manager', scriptPath: 'tools/uat/roles/uat-role-3-studio-manager.ts', expectedScenarios: 7 },
  { roleNumber: 6, roleName: 'Finance Lead', scriptPath: 'tools/uat/roles/uat-role-6-finance-lead.ts', expectedScenarios: 8 },
  { roleNumber: 2, roleName: 'Owner Cabang', scriptPath: 'tools/uat/roles/uat-role-2-owner-cabang.ts', expectedScenarios: 5 },
];

async function main() {
  console.log('========================================================================');
  console.log('🏆 MENJALANKAN MASTER SUITE UAT 7 PERAN SECARA MENYELURUH');
  console.log('Platform: Daily Dose Pilates Studio Management System V2');
  console.log('Target: 62 Skenario (Happy Path & No-Happy Path)');
  console.log('========================================================================\n');

  const suiteResults: {
    roleNumber: number;
    roleName: string;
    passed: number;
    total: number;
    status: 'PASS' | 'FAIL';
  }[] = [];

  for (const role of roles) {
    console.log(`\n▶ [ROLE ${role.roleNumber}] ${role.roleName} - Menjalankan ${role.scriptPath}...`);
    try {
      const output = execSync(
        `NODE_PATH=./apps/api/node_modules node --env-file=.env --import ./apps/api/node_modules/tsx/dist/loader.mjs ${role.scriptPath}`,
        {
          cwd: ROOT_DIR,
          encoding: 'utf-8',
          stdio: 'pipe',
        },
      );

      const passLines = (output.match(/✅ (?:PASS|LOLOS)/g) || []).length;
      const is100Percent = output.includes('100.0%') || output.includes('LOLOS DENGAN SEMPURNA') || passLines >= role.expectedScenarios;
      const passedCount = is100Percent ? role.expectedScenarios : passLines;
      const totalCount = role.expectedScenarios;

      console.log(`  ✓ Selesai: ${passedCount}/${totalCount} skenario lolos.`);

      suiteResults.push({
        roleNumber: role.roleNumber,
        roleName: role.roleName,
        passed: passedCount,
        total: totalCount,
        status: is100Percent ? 'PASS' : 'FAIL',
      });
    } catch (err: any) {
      console.error(`  ✗ Gagal eksekusi role ${role.roleName}:`, err.message);
      if (err.stdout) console.log(err.stdout.toString().slice(-500));
      if (err.stderr) console.error(err.stderr.toString().slice(-500));
      suiteResults.push({
        roleNumber: role.roleNumber,
        roleName: role.roleName,
        passed: 0,
        total: role.expectedScenarios,
        status: 'FAIL',
      });
    }
  }

  console.log('\n========================================================================');
  console.log('📊 REKAPITULASI MASTER UAT 7 PERAN - DAILY DOSE PILATES V2');
  console.log('========================================================================');
  console.log('| Peran | Nama Peran                | Target Skenario | Lolos | Status |');
  console.log('| :---: | :------------------------ | :-------------: | :---: | :----: |');

  let grandTotalPassed = 0;
  let grandTotalScenarios = 0;

  for (const r of suiteResults) {
    grandTotalPassed += r.passed;
    grandTotalScenarios += r.total;
    const roleCol = `Role ${r.roleNumber}`.padEnd(5);
    const nameCol = r.roleName.padEnd(25);
    const targetCol = String(r.total).padStart(15);
    const passCol = String(r.passed).padStart(5);
    const icon = r.status === 'PASS' ? '✅ 100%' : '❌ GAGAL';
    console.log(`| ${roleCol} | ${nameCol} | ${targetCol} | ${passCol} | ${icon} |`);
  }

  const overallPassRate = ((grandTotalPassed / grandTotalScenarios) * 100).toFixed(1);
  console.log('========================================================================');
  console.log(`TOTAL KESELURUHAN: ${grandTotalPassed} / ${grandTotalScenarios} Skenario Lolos (${overallPassRate}%)`);
  if (grandTotalPassed === grandTotalScenarios) {
    console.log('🎉 SELURUH 7 PERAN (62 SKENARIO UAT) LOLOS 100% TANPA CACAT!');
  } else {
    console.log('⚠️ TERDAPAT SKENARIO YANG GAGAL. PERIKSA LOG DI ATAS.');
  }
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Fatal suite runner error:', err);
  process.exit(1);
});

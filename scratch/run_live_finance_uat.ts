import { PrismaClient } from '../apps/api/node_modules/@prisma/client';
import { DashboardService } from '../apps/api/src/dashboard/dashboard.service';
import { FinanceService } from '../apps/api/src/packages/finance.service';
import { PolicyService } from '../apps/api/src/identity/policy.service';

const prisma = new PrismaClient();
const policy = new PolicyService();
const financeService = new FinanceService(prisma as any, policy, {} as any);
const dashboardService = new DashboardService(prisma as any, policy, financeService);

async function runLiveFinanceUat() {
  console.log('🚀 Memulai UAT Live: Dashboard Omset/Profit Breakdown & Modul Keuangan...\n');
  const results: Array<{ test: string; status: 'PASSED' | 'FAILED'; detail?: string }> = [];

  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_OWNER', 'OWNER'] } },
  });
  if (!adminUser) throw new Error('Tidak ada owner/super admin di database.');

  const superOwnerPrincipal = {
    sessionId: 'finance-uat-session',
    userId: adminUser.id,
    roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
    capabilities: [
      'branch:all',
      'finance:read',
      'class-slot:read',
      'booking:read',
      'payment:review',
    ],
    branchIds: [],
  };

  // 1. Uji Dashboard Overview & Breakdown Sumber Omset & Profit
  const dashboardData = await dashboardService.overview(superOwnerPrincipal, {
    period: 'month',
  });

  const { financial } = dashboardData;
  const hasOmsetBreakdown =
    financial.omsetBreakdown &&
    Array.isArray(financial.omsetBreakdown.byPackage) &&
    Array.isArray(financial.omsetBreakdown.byPaymentMethod) &&
    Array.isArray(financial.omsetBreakdown.byClassType);

  results.push({
    test: 'Dashboard: Struktur Breakdown Sumber Omset (Paket, Metode Bayar, Tipe Kelas)',
    status: hasOmsetBreakdown ? 'PASSED' : 'FAILED',
    detail: `Sumber Paket: ${financial.omsetBreakdown.byPackage.length}, Metode: ${financial.omsetBreakdown.byPaymentMethod.length}, Tipe Kelas: ${financial.omsetBreakdown.byClassType.length}`,
  });

  const { profitBreakdown } = financial;
  const isProfitMathValid =
    profitBreakdown.netRevenueRp === profitBreakdown.grossSalesRp - profitBreakdown.discountRp &&
    profitBreakdown.grossProfitRp === profitBreakdown.netRevenueRp - profitBreakdown.instructorCostRp &&
    profitBreakdown.netOperatingProfitRp === profitBreakdown.grossProfitRp - profitBreakdown.otherCostRp;

  results.push({
    test: 'Dashboard: Integritas Matematis Dekomposisi Waterfall Laba Rugi (P&L)',
    status: isProfitMathValid ? 'PASSED' : 'FAILED',
    detail: `Gross Sales: Rp ${profitBreakdown.grossSalesRp.toLocaleString()} -> Net Rev: Rp ${profitBreakdown.netRevenueRp.toLocaleString()} -> Gross Profit: Rp ${profitBreakdown.grossProfitRp.toLocaleString()} (Margin ${profitBreakdown.grossMarginPercent}%) -> Net Op: Rp ${profitBreakdown.netOperatingProfitRp.toLocaleString()} (Margin ${profitBreakdown.netMarginPercent}%)`,
  });

  // 2. Uji Modul Keuangan: Rincian Sesi Honor Instruktur (Session-level Audit Log)
  const branch = await prisma.cabang.findFirst({ where: { active: true } });
  const period = new Date().toISOString().slice(0, 7); // e.g. "2026-10"

  const instructorReport = await financeService.realtimeInstructorCostReport(
    superOwnerPrincipal,
    { branchId: branch?.id, period },
  );

  const hasSessions = Array.isArray(instructorReport.sessions);
  const sampleSession = instructorReport.sessions[0];

  results.push({
    test: 'Modul Keuangan: Rincian Sesi Honor Instruktur (Audit Log per Sesi)',
    status: hasSessions ? 'PASSED' : 'FAILED',
    detail: `Total Sesi Terbaca: ${instructorReport.sessions.length} sesi. Sample session: ${sampleSession ? `${sampleSession.classTypeName} by ${sampleSession.instructorName} (Rp ${sampleSession.feeRp.toLocaleString()}, Manual: ${sampleSession.isManualFee})` : 'Belum ada sesi di periode ini'}`,
  });

  // 3. Uji Modul Keuangan: Laporan Laba Rugi Berjenjang (Monthly Profit Report)
  const monthlyProfit = await financeService.monthlyProfitReport(
    superOwnerPrincipal,
    { branchId: branch?.id, period },
  );

  const hasMonthlyPnlFields =
    monthlyProfit.grossProfitRp !== undefined &&
    monthlyProfit.grossMarginPercent !== undefined &&
    monthlyProfit.netMarginPercent !== undefined;

  results.push({
    test: 'Modul Keuangan: Laporan Laba Rugi Bulanan dengan Gross Profit & Margin %',
    status: hasMonthlyPnlFields ? 'PASSED' : 'FAILED',
    detail: `Gross Profit: Rp ${monthlyProfit.grossProfitRp?.toLocaleString()} (${monthlyProfit.grossMarginPercent}%), Net Profit: Rp ${monthlyProfit.finalProfitRp?.toLocaleString()} (${monthlyProfit.netMarginPercent}%)`,
  });

  console.log('='.repeat(80));
  console.log('HASIL VERIFIKASI UAT LIVE: DASHBOARD & MODUL KEUANGAN');
  console.log('='.repeat(80));
  results.forEach((r, idx) => {
    const icon = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} [${idx + 1}] ${r.test}`);
    console.log(`    Status: ${r.status} | Detail: ${r.detail}`);
  });
  console.log('='.repeat(80));

  const allPassed = results.every((r) => r.status === 'PASSED');
  console.log(allPassed ? '\n🎉 SEMUA UJI DASHBOARD & KEUANGAN LIVE LOLOS 100%!' : '\n⚠️ ADA UJI YANG GAGAL.');

  await prisma.$disconnect();
}

runLiveFinanceUat().catch((e) => {
  console.error('Fatal error during finance UAT:', e);
  process.exit(1);
});

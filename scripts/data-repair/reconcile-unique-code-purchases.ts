import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
  console.log(`[Bank Reconciliation Audit] Mode: ${isDryRun ? 'DRY RUN (Simulasi)' : 'APPLY (Mutasi Nyata)'}`);

  const waitingPurchases = await prisma.pembelian.findMany({
    where: {
      status: { in: ['WAITING_VERIFICATION', 'PENDING'] },
    },
    select: {
      id: true,
      invoiceNumber: true,
      userId: true,
      branchId: true,
      packageId: true,
      totalAmountRp: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
      user: { select: { displayName: true, email: true } },
      package: { select: { name: true, sessionCount: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total tagihan PENDING / WAITING_VERIFICATION: ${waitingPurchases.length}`);

  const uniqueCodePurchases = waitingPurchases.filter((p) => p.totalAmountRp % 1000 !== 0);
  console.log(`Tagihan dengan kode unik (akhiran bukan 000): ${uniqueCodePurchases.length}`);

  const existingMutations = await prisma.mutasiBank.findMany({
    orderBy: { transactionDate: 'desc' },
  });
  console.log(`Total mutasi bank terdaftar di mutasi_bank: ${existingMutations.length}`);

  const auditData = {
    auditedAt: new Date().toISOString(),
    mode: isDryRun ? 'DRY_RUN' : 'APPLY',
    totalWaitingPurchases: waitingPurchases.length,
    totalWithUniqueCodes: uniqueCodePurchases.length,
    totalBankMutations: existingMutations.length,
    oldestPendingDate: uniqueCodePurchases[0]?.createdAt.toISOString() || null,
    sampleUniqueCodePurchases: uniqueCodePurchases.slice(0, 15).map((p) => ({
      id: p.id,
      invoiceNumber: p.invoiceNumber,
      customerName: p.user?.displayName,
      customerEmail: p.user?.email,
      packageName: p.package?.name,
      totalAmountRp: p.totalAmountRp,
      uniqueCodeEnding: p.totalAmountRp % 1000,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
  };

  const outputDir = resolve(process.cwd(), 'docs/uat/bukti');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, 'bank_reconciliation_audit.json');
  writeFileSync(outputPath, JSON.stringify(auditData, null, 2), 'utf-8');

  console.log(`Audit tersimpan di: ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

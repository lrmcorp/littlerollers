import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PackageAuditItem {
  id: string;
  code: string;
  oldName: string;
  newName: string;
  oldStatus: string;
  newStatus: string;
  purchasesCount: number;
  activeCustomerPackagesCount: number;
  reason: string;
}

export async function runPackagesSanitization(apply: boolean) {
  const packages = await prisma.paket.findMany({
    include: {
      _count: {
        select: {
          purchases: true,
          customerPackages: {
            where: { status: 'ACTIVE', remainingSessions: { gt: 0 } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`[PACKAGE CATALOG SANITIZATION] Mode: ${apply ? 'APPLY' : 'DRY_RUN'}`);
  console.log(`Total Paket di database: ${packages.length}`);

  const auditedItems: PackageAuditItem[] = [];

  for (const pkg of packages) {
    let newName = pkg.name.trim();
    let newStatus = pkg.status;
    const reasons: string[] = [];

    // 1. Perbaikan nama yang terpotong
    if (/FREE \d+ Ses$/i.test(newName)) {
      newName = newName.replace(/FREE (\d+) Ses$/i, 'FREE $1 Sessions');
      reasons.push('Memperbaiki nama promo FREE X Ses yang terpotong menjadi FREE X Sessions');
    } else if (/Free \d+ Ses$/i.test(newName)) {
      newName = newName.replace(/Free (\d+) Ses$/i, 'Free $1 Sessions');
      reasons.push('Memperbaiki nama promo Free X Ses yang terpotong menjadi Free X Sessions');
    } else if (/\bSes$/i.test(newName)) {
      newName = newName.replace(/\bSes$/i, 'Sessions');
      reasons.push('Memperbaiki singkatan/potongan kata "Ses" di akhir nama menjadi "Sessions"');
    }

    if (newName !== pkg.name) {
      // Name was cleaned
    }

    // 2. Arsipkan paket usang yang tidak lagi aktif & tidak ada pembelian/paket aktif
    const purchases = pkg._count.purchases;
    const activeCustomerPkgs = pkg._count.customerPackages;

    // Deteksi paket musiman lama (misal APRIL SHOWERS dengan 0 pembelian)
    const isOldSeasonalZeroPurchase =
      purchases === 0 &&
      activeCustomerPkgs === 0 &&
      (pkg.name.includes('[APRIL SHOWERS]') ||
        pkg.code.includes('APRILSHOWE') ||
        pkg.name.toLowerCase().includes('trial') && purchases === 0);

    if (isOldSeasonalZeroPurchase && pkg.status === 'ACTIVE') {
      newStatus = 'ARCHIVED';
      reasons.push('Mengarsipkan paket promo musiman lama dengan 0 pembelian');
    } else if (pkg.status === 'INACTIVE' && activeCustomerPkgs === 0) {
      newStatus = 'ARCHIVED';
      reasons.push('Mengarsipkan paket berstatus INACTIVE tanpa customer package aktif');
    }

    if (reasons.length > 0 || newName !== pkg.name || newStatus !== pkg.status) {
      auditedItems.push({
        id: pkg.id,
        code: pkg.code,
        oldName: pkg.name,
        newName,
        oldStatus: pkg.status,
        newStatus,
        purchasesCount: purchases,
        activeCustomerPackagesCount: activeCustomerPkgs,
        reason: reasons.join('; '),
      });
    }
  }

  const auditReport = {
    executedAt: new Date().toISOString(),
    mode: apply ? 'APPLY' : 'DRY_RUN',
    totalPackagesAudited: packages.length,
    totalPackagesModified: auditedItems.length,
    packages: auditedItems,
  };

  const outputDir = path.resolve(__dirname, '../../docs/arsip/uat/bukti');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'packages_catalog_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(auditReport, null, 2), 'utf-8');

  console.log(`Total Paket terflagged: ${auditedItems.length}`);
  console.log(`Laporan audit tersimpan di: ${outputPath}`);

  if (apply && auditedItems.length > 0) {
    for (const item of auditedItems) {
      await prisma.paket.update({
        where: { id: item.id },
        data: {
          name: item.newName,
          status: item.newStatus as any,
        },
      });
    }
    console.log(`[APPLY] Berhasil memperbarui ${auditedItems.length} paket di database.`);
  }

  return auditReport;
}

if (require.main === module) {
  const isApply = process.argv.includes('--apply');
  runPackagesSanitization(isApply)
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

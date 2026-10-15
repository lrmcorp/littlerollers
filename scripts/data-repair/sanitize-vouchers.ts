import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VoucherAuditItem {
  id: string;
  code: string;
  name: string;
  discountType: string;
  normalizedDiscountType: string;
  discountValue: number;
  active: boolean;
  shouldBeActive: boolean;
  validUntil: string | null;
  newValidUntil: string | null;
  reason: string;
}

export async function runVoucherSanitization(apply: boolean) {
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const items: VoucherAuditItem[] = [];

  for (const v of vouchers) {
    let reason = '';
    let shouldBeActive = v.active;
    let newValidUntil = v.validUntil ? v.validUntil.toISOString() : null;

    // Normalisasi discountType
    let normType = v.discountType;
    const t = (v.discountType || '').trim().toUpperCase();
    if (t === 'PERCENTAGE' || t === 'PERCENT' || t === '%') {
      normType = 'PERCENTAGE';
    } else {
      normType = 'NOMINAL';
    }

    // Khusus JULY2026: seharusnya berakhir 31 Juli 2026
    if (v.code === 'JULY2026') {
      newValidUntil = new Date('2026-07-31T23:59:59.999Z').toISOString();
      shouldBeActive = false;
      reason = 'Voucher bulan Juli 2026 dinonaktifkan di bulan Oktober 2026';
    } else if (v.validUntil && v.validUntil.getTime() < now.getTime() && v.active) {
      shouldBeActive = false;
      reason = 'Voucher sudah melewati masa berlaku (validUntil < now), dinonaktifkan';
    } else if (normType !== v.discountType) {
      reason = `Normalisasi tipe diskon dari ${v.discountType} ke ${normType}`;
    }

    if (reason || shouldBeActive !== v.active || newValidUntil !== (v.validUntil ? v.validUntil.toISOString() : null) || normType !== v.discountType) {
      items.push({
        id: v.id,
        code: v.code,
        name: v.name,
        discountType: v.discountType,
        normalizedDiscountType: normType,
        discountValue: v.discountValue,
        active: v.active,
        shouldBeActive,
        validUntil: v.validUntil ? v.validUntil.toISOString() : null,
        newValidUntil,
        reason: reason || 'Koreksi konsistensi data',
      });
    }
  }

  const auditReport = {
    executedAt: new Date().toISOString(),
    mode: apply ? 'APPLY' : 'DRY_RUN',
    totalAudited: vouchers.length,
    totalFlagged: items.length,
    flaggedVouchers: items,
  };

  const outputDir = path.resolve(__dirname, '../../docs/uat/bukti');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'vouchers_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(auditReport, null, 2), 'utf-8');

  console.log(`[VOUCHER SANITIZATION] Mode: ${apply ? 'APPLY' : 'DRY_RUN'}`);
  console.log(`Total Vouchers diperiksa: ${vouchers.length}`);
  console.log(`Total Vouchers diperbarui/dinonaktifkan: ${items.length}`);
  console.log(`Audit tersimpan di: ${outputPath}`);

  if (apply && items.length > 0) {
    for (const item of items) {
      await prisma.voucher.update({
        where: { id: item.id },
        data: {
          active: item.shouldBeActive,
          discountType: item.normalizedDiscountType,
          ...(item.newValidUntil ? { validUntil: new Date(item.newValidUntil) } : {}),
        },
      });
    }
    console.log(`[VOUCHER SANITIZATION] Berhasil memperbarui ${items.length} voucher di database.`);
  }

  return auditReport;
}

if (require.main === module) {
  const isApply = process.argv.includes('--apply');
  runVoucherSanitization(isApply)
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

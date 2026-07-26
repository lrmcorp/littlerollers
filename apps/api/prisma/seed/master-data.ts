import { encryptAccountNumber } from '../../src/packages/payment-account-security';
import type { SeedContext } from './context';

export interface BranchMasterTemplate {
  code: string; name: string; timezone: string;
  priceMultiplier: number; capacityOffset: number; projectionOffset: number; feeOffset: number;
  payment: { bankCode: string; bankName: string; accountNumber: string; holder: string; windowHours: number };
}

export const branchTemplates: BranchMasterTemplate[] = [
  { code: 'DD-JKT', name: 'Daily Dose Jakarta', timezone: 'Asia/Jakarta', priceMultiplier: 1, capacityOffset: 0, projectionOffset: 0, feeOffset: 0, payment: { bankCode: 'BCA', bankName: 'Bank Central Asia', accountNumber: '000012345678', holder: 'Daily Dose Pilates Jakarta', windowHours: 24 } },
  { code: 'DD-BSD', name: 'Daily Dose BSD', timezone: 'Asia/Jakarta', priceMultiplier: 1.08, capacityOffset: 2, projectionOffset: 10_000, feeOffset: 25_000, payment: { bankCode: 'MANDIRI', bankName: 'Bank Mandiri', accountNumber: '100023456789', holder: 'Daily Dose Pilates BSD', windowHours: 18 } },
];

const catalog = [
  { code: 'REFORMER', name: 'Reformer Pilates', quota: 3, capacity: 10, projection: 175_000, fee: 250_000, packages: [{ key: '5', sessions: 5, days: 45, price: 850_000 }, { key: '10', sessions: 10, days: 90, price: 1_600_000 }] },
  { code: 'MAT', name: 'Mat Pilates', quota: 3, capacity: 14, projection: 125_000, fee: 200_000, packages: [{ key: '8', sessions: 8, days: 60, price: 720_000 }] },
  { code: 'BARRE', name: 'Barre', quota: 3, capacity: 14, projection: 125_000, fee: 200_000, packages: [{ key: '8', sessions: 8, days: 60, price: 760_000 }] },
];

export interface SeedMasterResult { branches: Record<string, string>; classTypes: Record<string, string>; packages: Record<string, string>; }

export function validateMasterTemplates(templates = branchTemplates) {
  if (new Set(templates.map((item) => item.code)).size !== templates.length) throw new Error('Duplicate branch code in master templates.');
  for (const item of templates) {
    if (!item.payment.accountNumber || item.payment.windowHours < 1) throw new Error(`Invalid payment account template for ${item.code}.`);
    if (item.priceMultiplier <= 0 || item.capacityOffset < 0) throw new Error(`Invalid commercial override for ${item.code}.`);
  }
}

export async function seedMasterData(ctx: SeedContext, instructorId: string): Promise<SeedMasterResult> {
  validateMasterTemplates();
  const branches: Record<string, string> = {}; const classTypes: Record<string, string> = {}; const packages: Record<string, string> = {};
  for (const template of branchTemplates) {
    const deterministicBranchId = ctx.id('branch', template.code);
    const branch = await ctx.db.branch.upsert({
      // `code` is the business key. This also repairs databases seeded by an
      // older version that used a different ID for the same branch.
      where: { code: template.code },
      update: { name: template.name, timezone: template.timezone, active: true },
      create: { id: deterministicBranchId, code: template.code, name: template.name, timezone: template.timezone },
    });
    const branchId = branch.id; branches[template.code] = branchId;
    for (const item of catalog) {
      const deterministicClassTypeId = ctx.id('class-type', `${template.code}:${item.code}`);
      const classType = await ctx.db.classType.upsert({ where: { branchId_code: { branchId, code: item.code } }, update: { name: item.name, active: true }, create: { id: deterministicClassTypeId, branchId, code: item.code, name: item.name } });
      const classTypeId = classType.id;
      classTypes[`${template.code}:${item.code}`] = classTypeId;
      const configs = [
        { kind: 'QUOTA_CAPACITY', value: { minimumQuota: item.quota, defaultCapacity: item.capacity + template.capacityOffset } },
        { kind: 'PROJECTION_RATE', value: { rateRp: item.projection + template.projectionOffset, currency: 'IDR', unit: 'SOLD_SESSION' } },
        { kind: 'INSTRUCTOR_FEE', value: { feeRp: item.fee + template.feeOffset, currency: 'IDR', unit: 'MATCHED_HOUR', instructorUserId: instructorId } },
      ];
      for (const config of configs) {
        const businessKey = config.kind === 'INSTRUCTOR_FEE' ? `${branchId}:${classTypeId}:${instructorId}` : `${branchId}:${classTypeId}`;
        const id = ctx.id('configuration', `${template.code}:${item.code}:${config.kind}:active`);
        const effectiveUntil = config.kind === 'PROJECTION_RATE' ? new Date('2027-01-01') : null;
        await ctx.db.effectiveConfiguration.upsert({ where: { id }, update: { kind: config.kind, businessKey, branchId, classTypeId, value: config.value, effectiveFrom: new Date('2026-01-01'), effectiveUntil, approvedEvidence: 'SEED_MASTER_DATA' }, create: { id, kind: config.kind, businessKey, branchId, classTypeId, value: config.value, effectiveFrom: new Date('2026-01-01'), effectiveUntil, approvedEvidence: 'SEED_MASTER_DATA' } });
        if (config.kind === 'PROJECTION_RATE') {
          const futureId = ctx.id('configuration', `${template.code}:${item.code}:${config.kind}:future`);
          const futureValue = { ...(config.value as { rateRp: number }), rateRp: (config.value as { rateRp: number }).rateRp + 5_000 };
          await ctx.db.effectiveConfiguration.upsert({ where: { id: futureId }, update: { value: futureValue, effectiveFrom: new Date('2027-01-01'), effectiveUntil: null }, create: { id: futureId, kind: config.kind, businessKey, branchId, classTypeId, value: futureValue, effectiveFrom: new Date('2027-01-01'), approvedEvidence: 'SEED_FUTURE_MASTER_DATA' } });
        }
      }
      for (const pkg of item.packages) {
        const packageId = ctx.id('package', `${template.code}:${item.code}:${pkg.key}`); packages[`${template.code}:${item.code}:${pkg.key}`] = packageId;
        await ctx.db.package.upsert({ where: { id: packageId }, update: { branchId, classTypeId, businessKey: `${item.code}-${pkg.key}`, name: `${item.name} ${pkg.key}`, sessionCount: pkg.sessions, durationDays: pkg.days, priceRp: Math.round(pkg.price * template.priceMultiplier / 10_000) * 10_000, status: 'ACTIVE', effectiveUntil: null }, create: { id: packageId, branchId, classTypeId, businessKey: `${item.code}-${pkg.key}`, name: `${item.name} ${pkg.key}`, sessionCount: pkg.sessions, durationDays: pkg.days, priceRp: Math.round(pkg.price * template.priceMultiplier / 10_000) * 10_000, effectiveFrom: new Date('2026-01-01'), status: 'ACTIVE' } });
      }
      const inactiveId = ctx.id('package', `${template.code}:${item.code}:inactive`);
      await ctx.db.package.upsert({ where: { id: inactiveId }, update: { status: 'INACTIVE' }, create: { id: inactiveId, branchId, classTypeId, businessKey: `${item.code}-LEGACY`, name: `${item.name} Legacy`, sessionCount: 4, durationDays: 30, priceRp: 500_000, effectiveFrom: new Date('2025-01-01'), effectiveUntil: new Date('2025-12-31'), status: 'INACTIVE' } });
    }
    const accountId = ctx.id('payment-account', template.code); const number = template.payment.accountNumber;
    await ctx.db.paymentAccount.upsert({ where: { activeBranchKey: branchId }, update: { branchId, bankCode: template.payment.bankCode, bankName: template.payment.bankName, accountNumberEncrypted: encryptAccountNumber(number), accountNumberLast4: number.slice(-4), accountHolderName: template.payment.holder, paymentWindowHours: template.payment.windowHours, active: true }, create: { id: accountId, branchId, activeBranchKey: branchId, bankCode: template.payment.bankCode, bankName: template.payment.bankName, accountNumberEncrypted: encryptAccountNumber(number), accountNumberLast4: number.slice(-4), accountHolderName: template.payment.holder, paymentWindowHours: template.payment.windowHours, active: true } });
  }
  return { branches, classTypes, packages };
}

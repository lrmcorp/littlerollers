import { encryptAccountNumber } from '../../src/packages/payment-account-security';
import type { SeedContext } from './context';

export interface BranchMasterTemplate {
  code: string;
  name: string;
  timezone: string;
  supportWhatsappE164: string;
  priceMultiplier: number;
  capacityOffset: number;
  projectionOffset: number;
  feeOffset: number;
  payment: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    holder: string;
    windowHours: number;
  };
}

export const branchTemplates: BranchMasterTemplate[] = [
  {
    code: 'DD-JKT',
    name: 'Daily Dose Jakarta',
    timezone: 'Asia/Jakarta',
    supportWhatsappE164: '+628111000001',
    priceMultiplier: 1,
    capacityOffset: 0,
    projectionOffset: 0,
    feeOffset: 0,
    payment: {
      bankCode: 'BCA',
      bankName: 'Bank Central Asia',
      accountNumber: '000012345678',
      holder: 'Daily Dose Pilates Jakarta',
      windowHours: 24,
    },
  },
  {
    code: 'DD-BSD',
    name: 'Daily Dose BSD',
    timezone: 'Asia/Jakarta',
    supportWhatsappE164: '+628111000002',
    priceMultiplier: 1.08,
    capacityOffset: 2,
    projectionOffset: 10_000,
    feeOffset: 25_000,
    payment: {
      bankCode: 'MANDIRI',
      bankName: 'Bank Mandiri',
      accountNumber: '100023456789',
      holder: 'Daily Dose Pilates BSD',
      windowHours: 18,
    },
  },
];

export const masterCatalog = [
  {
    code: 'REFORMER',
    name: 'Reformer Pilates',
    quota: 3,
    capacity: 10,
    projection: 175_000,
    fee: 250_000,
    packages: [
      { key: '5', sessions: 5, days: 45, price: 850_000 },
      { key: '10', sessions: 10, days: 90, price: 1_600_000 },
    ],
  },
  {
    code: 'MAT',
    name: 'Mat Pilates',
    quota: 3,
    capacity: 14,
    projection: 125_000,
    fee: 200_000,
    packages: [{ key: '8', sessions: 8, days: 60, price: 720_000 }],
  },
  {
    code: 'BARRE',
    name: 'Barre',
    quota: 3,
    capacity: 14,
    projection: 125_000,
    fee: 200_000,
    packages: [{ key: '8', sessions: 8, days: 60, price: 760_000 }],
  },
];

export interface SeedCatalogResult {
  branches: Record<string, string>;
  classTypes: Record<string, string>;
}

export interface SeedMasterResult extends SeedCatalogResult {
  packages: Record<string, string>;
}

export function assertNonOverlappingPeriods(
  periods: { key: string; from: Date; until: Date | null }[],
) {
  const byKey = new Map<string, typeof periods>();
  for (const period of periods) byKey.set(period.key, [...(byKey.get(period.key) ?? []), period]);
  for (const entries of byKey.values()) {
    const ordered = [...entries].sort((left, right) => left.from.getTime() - right.from.getTime());
    for (let index = 1; index < ordered.length; index++) {
      const previous = ordered[index - 1]!;
      if (!previous.until || previous.until > ordered[index]!.from)
        throw new Error(`Overlapping effective period for ${previous.key}.`);
    }
  }
}

export function validateMasterTemplates(templates = branchTemplates) {
  if (new Set(templates.map((item) => item.code)).size !== templates.length)
    throw new Error('Duplicate branch code in master templates.');
  if (new Set(masterCatalog.map((item) => item.code)).size !== masterCatalog.length)
    throw new Error('Duplicate class type code in master catalog.');
  for (const item of templates) {
    if (!item.payment.accountNumber || item.payment.windowHours < 1)
      throw new Error(`Invalid payment account template for ${item.code}.`);
    if (item.priceMultiplier <= 0 || item.capacityOffset < 0)
      throw new Error(`Invalid commercial override for ${item.code}.`);
  }
  for (const item of masterCatalog) {
    if (item.quota < 1 || item.capacity < item.quota || item.projection < 1 || item.fee < 1)
      throw new Error(`Invalid effective configuration for ${item.code}.`);
    if (!item.packages.length || item.packages.some((pkg) => pkg.sessions < 1 || pkg.days < 1 || pkg.price < 1))
      throw new Error(`Class type ${item.code} requires valid package configuration.`);
  }
  assertNonOverlappingPeriods([
    { key: 'projection', from: new Date('2026-01-01'), until: new Date('2027-01-01') },
    { key: 'projection', from: new Date('2027-01-01'), until: null },
  ]);
}

export async function seedBranchCatalog(ctx: SeedContext): Promise<SeedCatalogResult> {
  validateMasterTemplates();
  const branches: Record<string, string> = {};
  const classTypes: Record<string, string> = {};
  for (const template of branchTemplates) {
    const branch = await ctx.db.branch.upsert({
      where: { code: template.code },
      update: {
        name: template.name,
        timezone: template.timezone,
        supportWhatsappE164: template.supportWhatsappE164,
        active: true,
      },
      create: {
        id: ctx.id('branch', template.code),
        code: template.code,
        name: template.name,
        timezone: template.timezone,
        supportWhatsappE164: template.supportWhatsappE164,
      },
    });
    branches[template.code] = branch.id;
    for (const item of masterCatalog) {
      const classType = await ctx.db.classType.upsert({
        where: { branchId_code: { branchId: branch.id, code: item.code } },
        update: { name: item.name, active: true },
        create: {
          id: ctx.id('class-type', `${template.code}:${item.code}`),
          branchId: branch.id,
          code: item.code,
          name: item.name,
        },
      });
      classTypes[`${template.code}:${item.code}`] = classType.id;
    }
  }
  return { branches, classTypes };
}

export async function seedCommercialMaster(
  ctx: SeedContext,
  catalog: SeedCatalogResult,
  instructorsByBranch: Record<string, string[]>,
): Promise<SeedMasterResult> {
  validateMasterTemplates();
  const packages: Record<string, string> = {};
  for (const template of branchTemplates) {
    const branchId = catalog.branches[template.code];
    if (!branchId) throw new Error(`Missing seeded branch ${template.code}.`);
    const instructorIds = instructorsByBranch[template.code] ?? [];
    if (instructorIds.length < 2)
      throw new Error(`Branch ${template.code} requires at least two seeded instructors.`);

    for (const item of masterCatalog) {
      const classTypeId = catalog.classTypes[`${template.code}:${item.code}`];
      if (!classTypeId) throw new Error(`Class type ${item.code} does not belong to ${template.code}.`);
      const commonConfigurations = [
        {
          kind: 'QUOTA_CAPACITY' as const,
          value: { minimumQuota: item.quota, defaultCapacity: item.capacity + template.capacityOffset },
        },
        {
          kind: 'PROJECTION_RATE' as const,
          value: {
            rateRp: item.projection + template.projectionOffset,
            currency: 'IDR',
            unit: 'SOLD_SESSION',
          },
        },
      ];
      for (const config of commonConfigurations) {
        const businessKey = `${branchId}:${classTypeId}`;
        const id = ctx.id('configuration', `${template.code}:${item.code}:${config.kind}:active`);
        const effectiveUntil = config.kind === 'PROJECTION_RATE' ? new Date('2027-01-01') : null;
        await ctx.db.effectiveConfiguration.upsert({
          where: { id },
          update: {
            kind: config.kind,
            businessKey,
            branchId,
            classTypeId,
            value: config.value,
            effectiveFrom: new Date('2026-01-01'),
            effectiveUntil,
            approvedEvidence: 'SEED_MASTER_DATA',
          },
          create: {
            id,
            kind: config.kind,
            businessKey,
            branchId,
            classTypeId,
            value: config.value,
            effectiveFrom: new Date('2026-01-01'),
            effectiveUntil,
            approvedEvidence: 'SEED_MASTER_DATA',
          },
        });
        if (config.kind === 'PROJECTION_RATE') {
          const futureId = ctx.id('configuration', `${template.code}:${item.code}:${config.kind}:future`);
          await ctx.db.effectiveConfiguration.upsert({
            where: { id: futureId },
            update: {
              value: { ...config.value, rateRp: config.value.rateRp + 5_000 },
              effectiveFrom: new Date('2027-01-01'),
              effectiveUntil: null,
            },
            create: {
              id: futureId,
              kind: config.kind,
              businessKey,
              branchId,
              classTypeId,
              value: { ...config.value, rateRp: config.value.rateRp + 5_000 },
              effectiveFrom: new Date('2027-01-01'),
              approvedEvidence: 'SEED_FUTURE_MASTER_DATA',
            },
          });
        }
      }

      for (const [instructorIndex, instructorId] of instructorIds.entries()) {
        const assignment = await ctx.db.assignment.findFirst({
          where: { userId: instructorId, branchId, type: 'INSTRUCTOR', activeUntil: null },
          select: { id: true },
        });
        if (!assignment)
          throw new Error(`Instructor fee requires an active assignment for ${instructorId}.`);
        const suffix = instructorIndex === 0 ? 'active' : `active:${instructorId}`;
        const id = ctx.id('configuration', `${template.code}:${item.code}:INSTRUCTOR_FEE:${suffix}`);
        await ctx.db.effectiveConfiguration.upsert({
          where: { id },
          update: {
            kind: 'INSTRUCTOR_FEE',
            businessKey: `${branchId}:${classTypeId}:${instructorId}`,
            branchId,
            classTypeId,
            value: {
              feeRp: item.fee + template.feeOffset + instructorIndex * 10_000,
              currency: 'IDR',
              unit: 'MATCHED_HOUR',
              instructorUserId: instructorId,
            },
            effectiveFrom: new Date('2026-01-01'),
            effectiveUntil: null,
            approvedEvidence: 'SEED_MASTER_DATA',
          },
          create: {
            id,
            kind: 'INSTRUCTOR_FEE',
            businessKey: `${branchId}:${classTypeId}:${instructorId}`,
            branchId,
            classTypeId,
            value: {
              feeRp: item.fee + template.feeOffset + instructorIndex * 10_000,
              currency: 'IDR',
              unit: 'MATCHED_HOUR',
              instructorUserId: instructorId,
            },
            effectiveFrom: new Date('2026-01-01'),
            approvedEvidence: 'SEED_MASTER_DATA',
          },
        });
      }

      for (const pkg of item.packages) {
        const packageId = ctx.id('package', `${template.code}:${item.code}:${pkg.key}`);
        packages[`${template.code}:${item.code}:${pkg.key}`] = packageId;
        await ctx.db.package.upsert({
          where: { id: packageId },
          update: {
            branchId,
            classTypeId,
            businessKey: `${item.code}-${pkg.key}`,
            name: `${item.name} ${pkg.key}`,
            sessionCount: pkg.sessions,
            durationDays: pkg.days,
            priceRp: Math.round((pkg.price * template.priceMultiplier) / 10_000) * 10_000,
            status: 'ACTIVE',
            effectiveUntil: null,
          },
          create: {
            id: packageId,
            branchId,
            classTypeId,
            businessKey: `${item.code}-${pkg.key}`,
            name: `${item.name} ${pkg.key}`,
            sessionCount: pkg.sessions,
            durationDays: pkg.days,
            priceRp: Math.round((pkg.price * template.priceMultiplier) / 10_000) * 10_000,
            effectiveFrom: new Date('2026-01-01'),
            status: 'ACTIVE',
          },
        });
      }
      const inactiveId = ctx.id('package', `${template.code}:${item.code}:inactive`);
      await ctx.db.package.upsert({
        where: { id: inactiveId },
        update: { status: 'INACTIVE' },
        create: {
          id: inactiveId,
          branchId,
          classTypeId,
          businessKey: `${item.code}-LEGACY`,
          name: `${item.name} Legacy`,
          sessionCount: 4,
          durationDays: 30,
          priceRp: 500_000,
          effectiveFrom: new Date('2025-01-01'),
          effectiveUntil: new Date('2025-12-31'),
          status: 'INACTIVE',
        },
      });
    }

    const number = template.payment.accountNumber;
    await ctx.db.paymentAccount.upsert({
      where: { activeBranchKey: branchId },
      update: {
        branchId,
        bankCode: template.payment.bankCode,
        bankName: template.payment.bankName,
        accountNumberEncrypted: encryptAccountNumber(number),
        accountNumberLast4: number.slice(-4),
        accountHolderName: template.payment.holder,
        paymentWindowHours: template.payment.windowHours,
        active: true,
      },
      create: {
        id: ctx.id('payment-account', template.code),
        branchId,
        activeBranchKey: branchId,
        bankCode: template.payment.bankCode,
        bankName: template.payment.bankName,
        accountNumberEncrypted: encryptAccountNumber(number),
        accountNumberLast4: number.slice(-4),
        accountHolderName: template.payment.holder,
        paymentWindowHours: template.payment.windowHours,
        active: true,
      },
    });
  }
  return { ...catalog, packages };
}

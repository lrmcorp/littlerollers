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
    code: 'LR-JKT',
    name: 'Little Rollers Jakarta',
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
      holder: 'Little Rollers Jakarta',
      windowHours: 24,
    },
  },
  {
    code: 'LR-BSD',
    name: 'Little Rollers BSD',
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
      holder: 'Little Rollers BSD',
      windowHours: 18,
    },
  },
];

// Demo content for local and staging databases. Replace with the club's real
// addresses, copy and photos before launch.
const branchPublicProfiles = {
  'LR-JKT': {
    slug: 'jakarta',
    area: 'South Jakarta',
    city: 'Jakarta',
    address: 'Jl. Wijaya II, Kebayoran Baru, South Jakarta',
    latitude: -6.2446,
    longitude: 106.8006,
    description:
      'Our Jakarta club room, with soft flooring, low equipment sized for small bodies and space for grown-ups to watch.',
    arrivalInformation:
      'Arrive 10 minutes early so your child can take off their shoes, use the toilet and meet the coach before the session starts.',
    parkingInformation:
      'Limited car and motorbike parking in the building. Drop-off by ride-hailing is easiest at peak hours.',
    heroImageKey: 'studios/jakarta.svg',
    galleryImageKeys: ['studios/jakarta.svg', 'studios/club-room.svg', 'studios/bsd.svg'],
  },
  'LR-BSD': {
    slug: 'bsd',
    area: 'BSD City',
    city: 'South Tangerang',
    address: 'BSD City, South Tangerang',
    latitude: -6.3017,
    longitude: 106.6527,
    description:
      'Our BSD club room for families in BSD and South Tangerang, with a separate waiting area for parents.',
    arrivalInformation:
      'Arrive 10 minutes early. A coach will check your child in and show first-timers around.',
    parkingInformation: 'Car and motorbike parking is available in the complex.',
    heroImageKey: 'studios/bsd.svg',
    galleryImageKeys: ['studios/bsd.svg', 'studios/club-room.svg', 'studios/jakarta.svg'],
  },
} as const;

const classPublicProfiles = {
  MOVERS: {
    slug: 'movers',
    summary: 'Running, jumping, rolling and balancing games for children who move on their own.',
    description:
      'Movers sessions build basic movement skills through games: running and stopping, jumping and landing, rolling, climbing and balancing. Children work in small groups with one coach.',
    level: 'Ages 4 to 6',
    durationMinutes: 120,
    equipment: ['Comfortable clothes', 'Grip socks', 'Water bottle'],
    benefits: [
      'Practises balance and coordination',
      'Builds confidence on climbing and rolling equipment',
      'Teaches taking turns in a small group',
    ],
    heroImageKey: 'classes/movers.svg',
  },
  PLAY: {
    slug: 'tiny-rollers',
    summary: 'Short, playful movement sessions where a grown-up joins in.',
    description:
      'Tiny Rollers is for the youngest members. A parent or carer stays on the mat and joins the songs, crawling tunnels and soft-play obstacles.',
    level: 'Ages 2 to 3, with a grown-up',
    durationMinutes: 60,
    equipment: ['Comfortable clothes for child and grown-up', 'Grip socks'],
    benefits: [
      'Crawling, climbing and rolling practice',
      'Time to play together with a grown-up',
      'A first taste of group sessions',
    ],
    heroImageKey: 'classes/tiny-rollers.svg',
  },
  CLUB: {
    slug: 'rollers-club',
    summary: 'Longer sessions with skill challenges and team games for older children.',
    description:
      'Rollers Club mixes skill stations (agility ladders, balance beams, ball skills) with team games. Each block ends with a cool-down.',
    level: 'Ages 7 to 10',
    durationMinutes: 120,
    equipment: ['Sports clothes', 'Trainers or grip socks', 'Water bottle'],
    benefits: [
      'Agility and ball skills practice',
      'Team games with clear rules',
      'Time to try harder skills at their own pace',
    ],
    heroImageKey: 'classes/rollers-club.svg',
  },
} as const;

export const masterCatalog = [
  {
    code: 'MOVERS',
    name: 'Movers',
    quota: 3,
    capacity: 10,
    projection: 175_000,
    fee: 250_000,
    packages: [
      { key: '5', sessions: 5, days: 45, price: 850_000, sessionMinutes: 60 },
      { key: '10', sessions: 10, days: 90, price: 1_600_000, sessionMinutes: 120 },
    ],
  },
  {
    code: 'PLAY',
    name: 'Tiny Rollers',
    quota: 3,
    capacity: 8,
    projection: 125_000,
    fee: 200_000,
    packages: [{ key: '8', sessions: 8, days: 60, price: 720_000, sessionMinutes: 60 }],
  },
  {
    code: 'CLUB',
    name: 'Rollers Club',
    quota: 3,
    capacity: 12,
    projection: 125_000,
    fee: 200_000,
    packages: [{ key: '8', sessions: 8, days: 60, price: 960_000, sessionMinutes: 120 }],
  },
];

export interface SeedCatalogResult {
  branches: Record<string, string>;
  studios: Record<string, string>;
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
    if (
      !item.packages.length ||
      item.packages.some((pkg) => pkg.sessions < 1 || pkg.days < 1 || pkg.price < 1)
    )
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
  const studios: Record<string, string> = {};
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
    await ctx.db.accountingAccount.upsert({
      where: { branchId_code: { branchId: branch.id, code: 'FINANCE_CORRECTION' } },
      update: { active: true, historical: false },
      create: {
        id: ctx.id('accounting-account', `${template.code}:FINANCE_CORRECTION`),
        branchId: branch.id,
        code: 'FINANCE_CORRECTION',
        name: 'Finance Correction',
        accountType: 'SYSTEM_CORRECTION',
      },
    });
    const studio = await ctx.db.studio.upsert({
      where: { branchId_code: { branchId: branch.id, code: 'MAIN' } },
      update: { name: `Area Studio ${template.name}`, active: true },
      create: {
        id: ctx.id('studio', template.code),
        branchId: branch.id,
        code: 'MAIN',
        name: `Area Studio ${template.name}`,
      },
    });
    studios[template.code] = studio.id;
  }
  for (const item of masterCatalog) {
    const classType = await ctx.db.classType.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        active: true,
        defaultMinimumQuota: item.quota,
        defaultCapacity: item.capacity,
      },
      create: {
        id: ctx.id('class-type', item.code),
        code: item.code,
        name: item.name,
        modality: 'GROUP',
        defaultDurationMinutes: 60,
        defaultMinimumQuota: item.quota,
        defaultCapacity: item.capacity,
      },
    });
    for (const template of branchTemplates) {
      const branchId = branches[template.code]!;
      await ctx.db.classTypeBranchScope.upsert({
        where: { classTypeId_branchId: { classTypeId: classType.id, branchId } },
        update: { active: true },
        create: {
          id: ctx.id('class-type-scope', `${item.code}:${template.code}`),
          classTypeId: classType.id,
          branchId,
        },
      });
      classTypes[`${template.code}:${item.code}`] = classType.id;
    }
  }
  return { branches, studios, classTypes };
}

export async function seedCommercialMaster(
  ctx: SeedContext,
  catalog: SeedCatalogResult,
  instructorsByBranch: Record<string, string[]>,
): Promise<SeedMasterResult> {
  validateMasterTemplates();
  const packages: Record<string, string> = {};
  const seedPackageStructure = async (input: {
    packageId: string;
    branchId: string;
    classTypeId: string;
    sessionCount: number;
    durationDays: number;
    priceRp: number;
    effectiveFrom: Date;
    effectiveUntil?: Date | null;
    active?: boolean;
  }) => {
    await ctx.db.packageBranchScope.upsert({
      where: {
        packageId_branchId: { packageId: input.packageId, branchId: input.branchId },
      },
      update: { active: input.active ?? true, historical: !(input.active ?? true) },
      create: {
        id: ctx.id('package-branch-scope', `${input.packageId}:${input.branchId}`),
        packageId: input.packageId,
        branchId: input.branchId,
        active: input.active ?? true,
        historical: !(input.active ?? true),
      },
    });
    await ctx.db.packageClassTypeScope.upsert({
      where: {
        packageId_classTypeId: {
          packageId: input.packageId,
          classTypeId: input.classTypeId,
        },
      },
      update: { active: input.active ?? true, historical: !(input.active ?? true) },
      create: {
        id: ctx.id('package-class-type-scope', `${input.packageId}:${input.classTypeId}`),
        packageId: input.packageId,
        classTypeId: input.classTypeId,
        active: input.active ?? true,
        historical: !(input.active ?? true),
      },
    });
    await ctx.db.packageRevision.upsert({
      where: { packageId_revisionNumber: { packageId: input.packageId, revisionNumber: 1 } },
      update: {
        sessionCount: input.sessionCount,
        durationDays: input.durationDays,
        priceRp: input.priceRp,
        visible: input.active ?? true,
        effectiveFrom: input.effectiveFrom,
        effectiveUntil: input.effectiveUntil ?? null,
        historical: !(input.active ?? true),
      },
      create: {
        id: ctx.id('package-revision', `${input.packageId}:1`),
        packageId: input.packageId,
        revisionNumber: 1,
        sessionCount: input.sessionCount,
        durationDays: input.durationDays,
        priceRp: input.priceRp,
        visible: input.active ?? true,
        effectiveFrom: input.effectiveFrom,
        effectiveUntil: input.effectiveUntil ?? null,
        historical: !(input.active ?? true),
      },
    });
  };
  for (const template of branchTemplates) {
    const branchId = catalog.branches[template.code];
    if (!branchId) throw new Error(`Missing seeded branch ${template.code}.`);
    const instructorIds = instructorsByBranch[template.code] ?? [];
    if (instructorIds.length < 2)
      throw new Error(`Branch ${template.code} requires at least two seeded instructors.`);
    const publicProfile = branchPublicProfiles[template.code as keyof typeof branchPublicProfiles];
    await ctx.db.branchPublicProfile.upsert({
      where: { branchId },
      update: {
        ...publicProfile,
        openingHours: [
          { days: 'Senin–Jumat', hours: '06.00–21.00' },
          { days: 'Sabtu–Minggu', hours: '07.00–18.00' },
        ],
        amenities: ['Ruang ganti', 'Loker', 'Air minum', 'Area tunggu'],
      },
      create: {
        branchId,
        ...publicProfile,
        openingHours: [
          { days: 'Senin–Jumat', hours: '06.00–21.00' },
          { days: 'Sabtu–Minggu', hours: '07.00–18.00' },
        ],
        amenities: ['Ruang ganti', 'Loker', 'Air minum', 'Area tunggu'],
      },
    });

    for (const item of masterCatalog) {
      const classTypeId = catalog.classTypes[`${template.code}:${item.code}`];
      if (!classTypeId)
        throw new Error(`Class type ${item.code} does not belong to ${template.code}.`);
      const commonConfigurations = [
        {
          kind: 'QUOTA_CAPACITY' as const,
          value: {
            minimumQuota: item.quota,
            defaultCapacity: item.capacity + template.capacityOffset,
          },
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
          const futureId = ctx.id(
            'configuration',
            `${template.code}:${item.code}:${config.kind}:future`,
          );
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
        const id = ctx.id(
          'configuration',
          `${template.code}:${item.code}:INSTRUCTOR_FEE:${suffix}`,
        );
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
              unit: 'MATCHED_CLASS',
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
              unit: 'MATCHED_CLASS',
              instructorUserId: instructorId,
            },
            effectiveFrom: new Date('2026-01-01'),
            approvedEvidence: 'SEED_MASTER_DATA',
          },
        });
      }

      for (const pkg of item.packages) {
        const packageId = ctx.id('package', `${template.code}:${item.code}:${pkg.key}`);
        const priceRp = Math.round((pkg.price * template.priceMultiplier) / 10_000) * 10_000;
        packages[`${template.code}:${item.code}:${pkg.key}`] = packageId;
        await ctx.db.package.upsert({
          where: { id: packageId },
          update: {
            branchId,
            classTypeId,
            businessKey: `${item.code}-${pkg.key}`,
            name: `${item.name} ${pkg.key} x ${pkg.sessionMinutes / 60}h`,
            sessionCount: pkg.sessions,
            sessionDurationMinutes: pkg.sessionMinutes,
            durationDays: pkg.days,
            priceRp,
            status: 'ACTIVE',
            effectiveUntil: null,
          },
          create: {
            id: packageId,
            branchId,
            classTypeId,
            businessKey: `${item.code}-${pkg.key}`,
            name: `${item.name} ${pkg.key} x ${pkg.sessionMinutes / 60}h`,
            sessionCount: pkg.sessions,
            sessionDurationMinutes: pkg.sessionMinutes,
            durationDays: pkg.days,
            priceRp,
            effectiveFrom: new Date('2026-01-01'),
            status: 'ACTIVE',
          },
        });
        await seedPackageStructure({
          packageId,
          branchId,
          classTypeId,
          sessionCount: pkg.sessions,
          durationDays: pkg.days,
          priceRp,
          effectiveFrom: new Date('2026-01-01'),
        });
        const hours = pkg.sessionMinutes / 60;
        const sessionsLabel = `${pkg.sessions} sessions of ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        const publicProfile = {
          summary: `${sessionsLabel} of ${item.name}.`,
          description: `A ${item.name} package with ${sessionsLabel}, to use at ${template.name} while the package is valid.`,
          highlights: [sessionsLabel, `Valid for ${pkg.days} days`, `${template.name} only`],
          usageGuidance:
            'Pick a session from the timetable once your payment is approved. Bookings and session history are in your account.',
          terms: [
            'The package is valid for the stated number of days from activation.',
            'Sessions can only be used at the club and class type of the package.',
            'Cancellation follows the Little Rollers booking policy.',
          ],
        };
        await ctx.db.packagePublicProfile.upsert({
          where: { packageId },
          update: publicProfile,
          create: { packageId, ...publicProfile },
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
      await seedPackageStructure({
        packageId: inactiveId,
        branchId,
        classTypeId,
        sessionCount: 4,
        durationDays: 30,
        priceRp: 500_000,
        effectiveFrom: new Date('2025-01-01'),
        effectiveUntil: new Date('2025-12-31'),
        active: false,
      });
    }

    const revisionClassTypeId = catalog.classTypes[`${template.code}:MOVERS`];
    if (revisionClassTypeId) {
      const revisionBusinessKey = 'MOVERS-REVISION-DEMO';
      const historicalId = ctx.id('package', `${template.code}:MOVERS:revision-history`);
      const scheduledId = ctx.id('package', `${template.code}:MOVERS:revision-scheduled`);
      await ctx.db.package.upsert({
        where: { id: historicalId },
        update: {
          status: 'ACTIVE',
          effectiveFrom: new Date('2025-01-01'),
          effectiveUntil: new Date('2026-01-01'),
        },
        create: {
          id: historicalId,
          branchId,
          classTypeId: revisionClassTypeId,
          businessKey: revisionBusinessKey,
          name: 'Reformer Revision History',
          sessionCount: 6,
          durationDays: 45,
          priceRp: Math.round((960_000 * template.priceMultiplier) / 10_000) * 10_000,
          effectiveFrom: new Date('2025-01-01'),
          effectiveUntil: new Date('2026-01-01'),
          status: 'ACTIVE',
        },
      });
      await seedPackageStructure({
        packageId: historicalId,
        branchId,
        classTypeId: revisionClassTypeId,
        sessionCount: 6,
        durationDays: 45,
        priceRp: Math.round((960_000 * template.priceMultiplier) / 10_000) * 10_000,
        effectiveFrom: new Date('2025-01-01'),
        effectiveUntil: new Date('2026-01-01'),
      });
      await ctx.db.package.upsert({
        where: { id: scheduledId },
        update: {
          status: 'ACTIVE',
          effectiveFrom: new Date('2027-01-01'),
          effectiveUntil: null,
        },
        create: {
          id: scheduledId,
          branchId,
          classTypeId: revisionClassTypeId,
          businessKey: revisionBusinessKey,
          name: 'Reformer Revision Scheduled',
          sessionCount: 6,
          durationDays: 60,
          priceRp: Math.round((1_080_000 * template.priceMultiplier) / 10_000) * 10_000,
          effectiveFrom: new Date('2027-01-01'),
          status: 'ACTIVE',
        },
      });
      await seedPackageStructure({
        packageId: scheduledId,
        branchId,
        classTypeId: revisionClassTypeId,
        sessionCount: 6,
        durationDays: 60,
        priceRp: Math.round((1_080_000 * template.priceMultiplier) / 10_000) * 10_000,
        effectiveFrom: new Date('2027-01-01'),
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
  for (const [code, profile] of Object.entries(classPublicProfiles)) {
    await ctx.db.publicClassProfile.upsert({
      where: { code },
      update: { ...profile, active: true },
      create: { code, ...profile },
    });
  }
  return { ...catalog, packages };
}

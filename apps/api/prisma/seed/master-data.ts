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

const branchPublicProfiles = {
  'DD-JKT': {
    slug: 'jakarta',
    area: 'Jakarta Selatan',
    city: 'Jakarta',
    address: 'Jl. Wijaya II, Kebayoran Baru, Jakarta Selatan',
    latitude: -6.2446,
    longitude: 106.8006,
    description:
      'Studio Daily Dose yang hangat dan tenang di Jakarta Selatan untuk latihan personal maupun kelompok kecil.',
    arrivalInformation:
      'Datang 15 menit sebelum kelas untuk registrasi, mengganti pakaian, dan menyiapkan perlengkapan.',
    parkingInformation:
      'Parkir mobil dan motor tersedia terbatas di area gedung. Transportasi daring disarankan pada jam sibuk.',
    heroImageKey: 'studios/studio-reception.png',
    galleryImageKeys: [
      'studios/studio-reception.png',
      'studios/studio-lobby-wide.png',
      'studios/studio-interior-reformer.png',
    ],
  },
  'DD-BSD': {
    slug: 'bsd',
    area: 'BSD City',
    city: 'Tangerang Selatan',
    address: 'Kawasan BSD City, Tangerang Selatan',
    latitude: -6.3017,
    longitude: 106.6527,
    description: 'Studio modern dengan suasana tenang untuk komunitas BSD dan Tangerang Selatan.',
    arrivalInformation:
      'Datang 15 menit sebelum kelas. Tim studio akan membantu proses check-in dan orientasi pertama.',
    parkingInformation: 'Area parkir mobil dan motor tersedia di kompleks studio.',
    heroImageKey: 'studios/studio-interior-reformer.png',
    galleryImageKeys: [
      'studios/studio-interior-reformer.png',
      'studios/studio-lobby-wide.png',
      'studios/studio-reception.png',
    ],
  },
} as const;

const classPublicProfiles = {
  REFORMER: {
    slug: 'reformer-pilates',
    summary:
      'Latihan seluruh tubuh dengan resistance terukur untuk membangun kekuatan, kontrol, dan mobilitas.',
    description:
      'Reformer Pilates memadukan gerak terkontrol, resistance, dan presisi untuk membantu memperbaiki postur, keseimbangan, dan kekuatan inti.',
    level: 'Semua level',
    durationMinutes: 50,
    equipment: ['Mesin reformer', 'Grip socks'],
    benefits: [
      'Memperbaiki postur dan alignment',
      'Membangun kekuatan inti',
      'Meningkatkan fleksibilitas dan mobilitas',
      'Mengembangkan kontrol tubuh',
    ],
    heroImageKey: 'classes/reformer-pilates.png',
  },
  MAT: {
    slug: 'mat-pilates',
    summary:
      'Gerak Pilates presisi di atas matras untuk memperkuat inti, stabilitas, dan kesadaran tubuh.',
    description:
      'Mat Pilates menggunakan berat tubuh dan gerak terkontrol untuk meningkatkan kekuatan, fleksibilitas, dan kualitas pola gerak.',
    level: 'Semua level',
    durationMinutes: 50,
    equipment: ['Matras Pilates', 'Grip socks'],
    benefits: [
      'Menguatkan otot inti',
      'Meningkatkan keseimbangan',
      'Memperkuat kesadaran tubuh',
      'Mendukung pola gerak yang sehat',
    ],
    heroImageKey: 'classes/mat-pilates.png',
  },
  BARRE: {
    slug: 'barre',
    summary:
      'Perpaduan Pilates dan gerak fungsional untuk membangun stabilitas, postur, dan daya tahan.',
    description:
      'Barre memadukan latihan terkontrol di barre dengan prinsip Pilates untuk menciptakan sesi yang seimbang dan energik.',
    level: 'Pemula–menengah',
    durationMinutes: 50,
    equipment: ['Ballet barre', 'Matras', 'Grip socks'],
    benefits: [
      'Memperbaiki postur',
      'Menguatkan tubuh bagian bawah',
      'Meningkatkan daya tahan',
      'Meningkatkan kesadaran tubuh',
    ],
    heroImageKey: 'landing/studio-showcase.png',
  },
} as const;

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
    const branch = await ctx.db.cabang.upsert({
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
    await ctx.db.akunAkuntansi.upsert({
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
    const classType = await ctx.db.jenisKelas.upsert({
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
      await ctx.db.cakupanCabangJenisKelas.upsert({
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
    await ctx.db.cakupanCabangPaket.upsert({
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
    await ctx.db.cakupanJenisKelasPaket.upsert({
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
    await ctx.db.revisiPaket.upsert({
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
    await ctx.db.profilPublikCabang.upsert({
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
        await ctx.db.konfigurasiEfektif.upsert({
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
          await ctx.db.konfigurasiEfektif.upsert({
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
        const assignment = await ctx.db.penugasan.findFirst({
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
        await ctx.db.konfigurasiEfektif.upsert({
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
        await ctx.db.paket.upsert({
          where: { id: packageId },
          update: {
            branchId,
            classTypeId,
            businessKey: `${item.code}-${pkg.key}`,
            name: `${item.name} ${pkg.key}`,
            sessionCount: pkg.sessions,
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
            name: `${item.name} ${pkg.key}`,
            sessionCount: pkg.sessions,
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
        const sessionsLabel = `${pkg.sessions} sesi`;
        await ctx.db.profilPublikPaket.upsert({
          where: { packageId },
          update: {
            summary: `${sessionsLabel} ${item.name} untuk membangun ritme latihan yang konsisten.`,
            description: `Paket ${item.name} dengan ${sessionsLabel} yang dapat digunakan di ${template.name} selama masa berlaku paket.`,
            highlights: [`${sessionsLabel}`, `Berlaku ${pkg.days} hari`, `Khusus ${template.name}`],
            usageGuidance:
              'Pilih jadwal yang tersedia setelah pembayaran disetujui. Reservasi dan riwayat sesi dapat dilihat dari akun.',
            terms: [
              'Paket berlaku sesuai periode yang tercantum sejak aktivasi.',
              'Sesi hanya dapat digunakan pada studio dan tipe kelas paket.',
              'Ketentuan pembatalan mengikuti kebijakan booking Daily Dose.',
            ],
          },
          create: {
            packageId,
            summary: `${sessionsLabel} ${item.name} untuk membangun ritme latihan yang konsisten.`,
            description: `Paket ${item.name} dengan ${sessionsLabel} yang dapat digunakan di ${template.name} selama masa berlaku paket.`,
            highlights: [`${sessionsLabel}`, `Berlaku ${pkg.days} hari`, `Khusus ${template.name}`],
            usageGuidance:
              'Pilih jadwal yang tersedia setelah pembayaran disetujui. Reservasi dan riwayat sesi dapat dilihat dari akun.',
            terms: [
              'Paket berlaku sesuai periode yang tercantum sejak aktivasi.',
              'Sesi hanya dapat digunakan pada studio dan tipe kelas paket.',
              'Ketentuan pembatalan mengikuti kebijakan booking Daily Dose.',
            ],
          },
        });
      }
      const inactiveId = ctx.id('package', `${template.code}:${item.code}:inactive`);
      await ctx.db.paket.upsert({
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

    const revisionClassTypeId = catalog.classTypes[`${template.code}:REFORMER`];
    if (revisionClassTypeId) {
      const revisionBusinessKey = 'REFORMER-REVISION-DEMO';
      const historicalId = ctx.id('package', `${template.code}:REFORMER:revision-history`);
      const scheduledId = ctx.id('package', `${template.code}:REFORMER:revision-scheduled`);
      await ctx.db.paket.upsert({
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
      await ctx.db.paket.upsert({
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
    await ctx.db.rekeningPembayaran.upsert({
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
    await ctx.db.profilPublikKelas.upsert({
      where: { code },
      update: { ...profile, active: true },
      create: { code, ...profile },
    });
  }
  return { ...catalog, packages };
}

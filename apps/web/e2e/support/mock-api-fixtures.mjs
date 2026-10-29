export const fixtureIds = {
  branch: '00000000-0000-4000-8000-000000000001',
  classType: '00000000-0000-4000-8000-000000000101',
  package: '6f6dca0c-74fe-4c6f-8982-33db678a0b7a',
  schedule: '4669d2c4-cc55-40ff-8759-10bd8369371c',
};

export const classProfile = {
  code: 'MOVERS',
  slug: 'movers',
  summary: 'Latihan seluruh tubuh menggunakan reformer.',
  description: 'Kelas terarah untuk kekuatan, kontrol, dan mobilitas.',
  level: 'Semua level',
  durationMinutes: 50,
  equipment: ['Reformer'],
  benefits: ['Kekuatan inti', 'Postur'],
  heroImageKey: 'classes/movers.svg',
};

export const branch = {
  id: fixtureIds.branch,
  code: 'LR-JKT',
  name: 'Little Rollers Jakarta',
  timezone: 'Asia/Jakarta',
  supportWhatsappE164: null,
  publicProfile: {
    slug: 'jakarta',
    area: 'Jakarta Selatan',
    city: 'Jakarta',
    address: 'Jakarta Selatan',
    openingHours: [{ days: 'Senin–Minggu', hours: '07.00–21.00' }],
    description: 'Studio Pilates yang tenang dan tertata.',
    arrivalInformation: 'Datang 15 menit sebelum kelas.',
    parkingInformation: 'Area parkir tersedia.',
    amenities: ['Ruang ganti', 'Loker'],
    heroImageKey: 'studios/jakarta.svg',
    galleryImageKeys: [],
  },
};

export const bsdBranch = {
  id: '00000000-0000-4000-8000-000000000002',
  code: 'LR-BSD',
  name: 'Little Rollers BSD',
  timezone: 'Asia/Jakarta',
  supportWhatsappE164: null,
  publicProfile: {
    slug: 'bsd',
    area: 'BSD',
    city: 'Tangerang Selatan',
    address: 'BSD',
    openingHours: [{ days: 'Senin–Minggu', hours: '07.00–21.00' }],
    description: 'Studio aktif BSD.',
    arrivalInformation: null,
    parkingInformation: null,
    amenities: ['Reformer'],
    heroImageKey: 'studios/bsd.svg',
    galleryImageKeys: [],
  },
};

export const classType = {
  id: fixtureIds.classType,
  code: 'MOVERS',
  name: 'Movers',
};

export const schedule = {
  id: fixtureIds.schedule,
  branchId: fixtureIds.branch,
  startAt: '2027-01-10T02:00:00.000Z',
  endAt: '2027-01-10T02:50:00.000Z',
  timezone: 'Asia/Jakarta',
  status: 'PUBLISHED',
  capacity: 12,
  available: 8,
  branch,
  classType,
  classProfile,
};

export const packageDetail = {
  id: fixtureIds.package,
  branchId: fixtureIds.branch,
  name: 'Movers 10',
  sessionCount: 10,
  durationDays: 60,
  priceRp: 2_500_000,
  effectivePriceRp: 2_500_000,
  promotion: null,
  effectiveUntil: null,
  classType,
  publicProfile: {
    summary: 'Sepuluh sesi Movers.',
    description: 'Paket latihan terarah untuk membangun kebiasaan bergerak.',
    highlights: ['10 sesi', 'Berlaku 60 hari'],
    usageGuidance: 'Reservasi jadwal sebelum datang.',
    terms: ['Mengikuti ketersediaan kelas.'],
  },
  branch,
  pricePerSessionRp: 250_000,
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  schedules: [schedule],
};

export const classDetail = {
  profile: classProfile,
  studios: [branch],
  packages: [packageDetail],
  schedules: [schedule],
};

export const studioDetail = {
  ...branch,
  classes: [
    { id: fixtureIds.classType, code: classType.code, name: classType.name, profile: classProfile },
  ],
  packages: [{ ...packageDetail, classType }],
  schedules: [schedule],
};

export const siteConfig = {
  branches: [bsdBranch, branch],
  classes: [
    {
      ...classProfile,
      code: 'CLUB',
      name: 'Barre',
      slug: 'barre',
      summary: 'Latihan stabilitas dan daya tahan.',
      description: 'Gerak fungsional.',
      level: 'Pemula–menengah',
      equipment: ['Barre'],
      benefits: ['Stabilitas'],
      heroImageKey: 'classes/rollers-club.svg',
    },
    {
      ...classProfile,
      code: 'PLAY',
      name: 'Tiny Rollers',
      slug: 'tiny-rollers',
      summary: 'Gerak presisi di atas mat.',
      description: 'Bangun kontrol tubuh.',
      equipment: ['Mat'],
      benefits: ['Kontrol'],
      heroImageKey: 'classes/tiny-rollers.svg',
    },
    { ...classProfile, name: classType.name },
  ],
  fallbackWhatsappE164: '+628111111111',
  mobileFeatures: {
    accountRecovery: true,
    revokeAllSessions: true,
    bookingCancellation: true,
    reschedule: true,
    customerCheckIn: true,
    instructorCheckIn: true,
  },
};

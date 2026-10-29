export const fixtureIds = {
  branch: '00000000-0000-4000-8000-000000000001',
  classType: '00000000-0000-4000-8000-000000000101',
  package: '6f6dca0c-74fe-4c6f-8982-33db678a0b7a',
  schedule: '4669d2c4-cc55-40ff-8759-10bd8369371c',
};

export const classProfile = {
  code: 'MOVERS',
  slug: 'movers',
  summary: 'Running, jumping, rolling and balancing games.',
  description: 'Small-group movement games with one coach.',
  level: 'Ages 4 to 6',
  durationMinutes: 120,
  equipment: ['Grip socks', 'Water bottle'],
  benefits: ['Balance and coordination', 'Taking turns'],
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
    area: 'South Jakarta',
    city: 'Jakarta',
    address: 'Jl. Wijaya II, South Jakarta',
    openingHours: [{ days: 'Monday to Sunday', hours: '08.00 to 18.00' }],
    description: 'Our Jakarta club room with soft flooring.',
    arrivalInformation: 'Arrive 10 minutes before the session.',
    parkingInformation: 'Parking is available.',
    amenities: ['Parent waiting area', 'Shoe racks'],
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
    city: 'South Tangerang',
    address: 'BSD City, South Tangerang',
    openingHours: [{ days: 'Monday to Sunday', hours: '08.00 to 18.00' }],
    description: 'Our BSD club room.',
    arrivalInformation: null,
    parkingInformation: null,
    amenities: ['Parent waiting area'],
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
  endAt: '2027-01-10T04:00:00.000Z',
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
  name: 'Movers 10 x 2h',
  sessionCount: 10,
  sessionDurationMinutes: 120,
  durationDays: 60,
  priceRp: 2_500_000,
  effectivePriceRp: 2_500_000,
  promotion: null,
  effectiveUntil: null,
  classType,
  publicProfile: {
    summary: '10 sessions of 2 hours of Movers.',
    description: 'A Movers package with 10 two-hour sessions.',
    highlights: ['10 sessions of 2 hours', 'Valid for 60 days'],
    usageGuidance: 'Book a session before you come.',
    terms: ['Subject to timetable availability.'],
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
      name: 'Rollers Club',
      slug: 'rollers-club',
      summary: 'Skill challenges and team games.',
      description: 'Skill stations and team games.',
      level: 'Ages 7 to 10',
      equipment: ['Trainers'],
      benefits: ['Agility'],
      heroImageKey: 'classes/rollers-club.svg',
    },
    {
      ...classProfile,
      code: 'PLAY',
      name: 'Tiny Rollers',
      slug: 'tiny-rollers',
      summary: 'Playful sessions where a grown-up joins in.',
      description: 'Songs, tunnels and soft play.',
      level: 'Ages 2 to 3, with a grown-up',
      durationMinutes: 60,
      equipment: ['Grip socks'],
      benefits: ['Crawling and climbing'],
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

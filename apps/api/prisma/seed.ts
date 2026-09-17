import {
  PrismaClient,
  Role,
  UserStatus,
  ClassModality,
  PackageStatus,
  PurchaseStatus,
  PaymentMethod,
  CustomerPackageStatus,
  ClassSlotStatus,
  BookingStatus,
  Cabang,
  User,
  JenisKelas,
  Studio,
  Ruangan,
  Paket,
} from '@prisma/client';
import * as argon2 from 'argon2';

// ----------------------------------------------------------------------------
// 1. Cabang Master Data
// ----------------------------------------------------------------------------
export async function seedCabangMaster(db: PrismaClient): Promise<{
  gg: Cabang;
  mk: Cabang;
  sby: Cabang;
  untar: Cabang;
  pik2: Cabang;
  jkt: Cabang;
  bsd: Cabang;
}> {
  console.info('📍 [1/6] Seeding Cabang master data (5 Authentic Branches from v1)...');
  const gg = await db.cabang.upsert({
    where: { id: 'a1000000-0000-4000-8000-000000000001' },
    update: {
      code: 'DD-GG',
      name: 'Daily Dose Green Garden',
      address:
        'Komp. Ruko Green Garden Blk. A, Jl. Panjang No.30, Kedoya Utara, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11520',
      supportWhatsappE164: '+6281212327038',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/green-garden.png',
      active: true,
    },
    create: {
      id: 'a1000000-0000-4000-8000-000000000001',
      code: 'DD-GG',
      name: 'Daily Dose Green Garden',
      address:
        'Komp. Ruko Green Garden Blk. A, Jl. Panjang No.30, Kedoya Utara, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11520',
      supportWhatsappE164: '+6281212327038',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/green-garden.png',
      active: true,
    },
  });

  const mk = await db.cabang.upsert({
    where: { id: 'a1000000-0000-4000-8000-000000000002' },
    update: {
      code: 'DD-MK',
      name: 'Daily Dose Muara Karang',
      address:
        'Jalan Pluit Karang Timur No. 30 (Muara Karang Blok E 5 Timur No. 30), Pluit, Penjaringan, Jakarta Utara 14450',
      supportWhatsappE164: '+6287862151824',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/muara-karang.png',
      active: true,
    },
    create: {
      id: 'a1000000-0000-4000-8000-000000000002',
      code: 'DD-MK',
      name: 'Daily Dose Muara Karang',
      address:
        'Jalan Pluit Karang Timur No. 30 (Muara Karang Blok E 5 Timur No. 30), Pluit, Penjaringan, Jakarta Utara 14450',
      supportWhatsappE164: '+6287862151824',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/muara-karang.png',
      active: true,
    },
  });

  const sby = await db.cabang.upsert({
    where: { id: 'a1000000-0000-4000-8000-000000000003' },
    update: {
      code: 'DD-SBY',
      name: 'Daily Dose Graha Family Surabaya',
      address:
        'Jl. Taman Perkantoran TP 19-20, Jl. Raya Graha Famili Utara, Pradahkalikendal, Dukuhpakis, Surabaya, Jawa Timur 60277',
      supportWhatsappE164: '+62895340133103',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/graha-family-surabaya.png',
      active: true,
    },
    create: {
      id: 'a1000000-0000-4000-8000-000000000003',
      code: 'DD-SBY',
      name: 'Daily Dose Graha Family Surabaya',
      address:
        'Jl. Taman Perkantoran TP 19-20, Jl. Raya Graha Famili Utara, Pradahkalikendal, Dukuhpakis, Surabaya, Jawa Timur 60277',
      supportWhatsappE164: '+62895340133103',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/graha-family-surabaya.png',
      active: true,
    },
  });

  const untar = await db.cabang.upsert({
    where: { id: 'a1000000-0000-4000-8000-000000000004' },
    update: {
      code: 'DD-UNTAR',
      name: 'Daily Dose Untar Kampus 2',
      address:
        'Parking lot, Jl. Universitas Tarumanagara Kampus II No.11, RT.11/RW.1, North Tanjung Duren, Grogol petamburan, Jakarta Barat 11470',
      supportWhatsappE164: '+6289506909801',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/untar-kampus-2.png',
      active: true,
    },
    create: {
      id: 'a1000000-0000-4000-8000-000000000004',
      code: 'DD-UNTAR',
      name: 'Daily Dose Untar Kampus 2',
      address:
        'Parking lot, Jl. Universitas Tarumanagara Kampus II No.11, RT.11/RW.1, North Tanjung Duren, Grogol petamburan, Jakarta Barat 11470',
      supportWhatsappE164: '+6289506909801',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/untar-kampus-2.png',
      active: true,
    },
  });

  const pik2 = await db.cabang.upsert({
    where: { id: 'a1000000-0000-4000-8000-000000000005' },
    update: {
      code: 'DD-PIK2',
      name: 'Daily Dose Orange Groves PIK 2',
      address: 'Orange Groves, PIK 2, Kabupaten Tangerang, Banten',
      supportWhatsappE164: '+62895329736127',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/orange-groves-pik2.png',
      active: true,
    },
    create: {
      id: 'a1000000-0000-4000-8000-000000000005',
      code: 'DD-PIK2',
      name: 'Daily Dose Orange Groves PIK 2',
      address: 'Orange Groves, PIK 2, Kabupaten Tangerang, Banten',
      supportWhatsappE164: '+62895329736127',
      timezone: 'Asia/Jakarta',
      heroImageKey: 'branches/orange-groves-pik2.png',
      active: true,
    },
  });

  return { gg, mk, sby, untar, pik2, jkt: gg, bsd: pik2 };
}

// ----------------------------------------------------------------------------
// 2. Users & Roles (Superadmin, Admin, Coaches, Customers)
// ----------------------------------------------------------------------------
export async function seedUsersAndRoles(
  db: PrismaClient,
  branches: { gg?: Cabang; mk?: Cabang; sby?: Cabang; untar?: Cabang; pik2?: Cabang; jkt: Cabang; bsd: Cabang },
  defaultPasswordHash: string,
): Promise<{
  superadmin: User;
  admin: User;
  coachSarah: User;
  coachBudi: User;
  coachJessica: User;
  customerAnisa: User;
  customerDimas: User;
}> {
  console.info('👥 [2/6] Seeding Users & Roles (Superadmin, Admin, Coaches, Customers)...');
  const gg = branches.gg ?? branches.jkt;
  const mk = branches.mk ?? branches.bsd;

  // Superadmin (Global access across all branches)
  const superadmin = await db.user.upsert({
    where: { email: 'ralamzah@gmail.com' },
    update: { role: Role.SUPERADMIN, status: UserStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000100',
      email: 'ralamzah@gmail.com',
      displayName: 'Ridho Alamzah',
      phone: '081234567890',
      passwordHash: defaultPasswordHash,
      role: Role.SUPERADMIN,
      status: UserStatus.ACTIVE,
      preferredBranchId: null, // Global multi-branch
      profile: {
        create: {
          fullName: 'Ridho Alamzah',
          gender: 'MALE',
          address: 'Senopati, Jakarta Selatan',
        },
      },
    },
  });

  // Admin
  const admin = await db.user.upsert({
    where: { email: 'adminmk@ddose.com' },
    update: { role: Role.ADMIN, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000001548',
      email: 'adminmk@ddose.com',
      displayName: 'Admin Muara Karang',
      phone: '+6287862151824',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      preferredBranchId: mk.id,
      profile: {
        create: {
          fullName: 'Admin Muara Karang',
          gender: 'FEMALE',
        },
      },
    },
  });

  // Coaches / Instructors (Authentic V1 Instructors)
  const coachSarah = await db.user.upsert({
    where: { email: 'instdevi@ddose.com' },
    update: { role: Role.COACH, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000000003',
      email: 'instdevi@ddose.com',
      displayName: 'Devi',
      phone: '+6287825588055',
      passwordHash: defaultPasswordHash,
      role: Role.COACH,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Coach Devi',
          gender: 'FEMALE',
        },
      },
    },
  });

  const coachBudi = await db.user.upsert({
    where: { email: 'inststephen@ddose.com' },
    update: { role: Role.COACH, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000001101',
      email: 'inststephen@ddose.com',
      displayName: 'Stephen',
      passwordHash: defaultPasswordHash,
      role: Role.COACH,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Coach Stephen',
          gender: 'MALE',
        },
      },
    },
  });

  const coachJessica = await db.user.upsert({
    where: { email: 'instangel@ddose.com' },
    update: { role: Role.COACH, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000001102',
      email: 'instangel@ddose.com',
      displayName: 'Angel',
      passwordHash: defaultPasswordHash,
      role: Role.COACH,
      status: UserStatus.ACTIVE,
      preferredBranchId: mk.id,
      profile: {
        create: {
          fullName: 'Coach Angel',
          gender: 'FEMALE',
        },
      },
    },
  });

  // Customer Members (Authentic V1 Customers)
  const customerAnisa = await db.user.upsert({
    where: { email: 'cindyedelene@gmail.com' },
    update: { role: Role.MEMBER, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000000012',
      email: 'cindyedelene@gmail.com',
      displayName: 'Cindy Edelene Arief',
      phone: '+628158159818',
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Cindy Edelene Arief',
          gender: 'FEMALE',
          address: 'Jakarta',
        },
      },
    },
  });

  const customerDimas = await db.user.upsert({
    where: { email: 'rynrliando@gmail.com' },
    update: { role: Role.MEMBER, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000000004',
      email: 'rynrliando@gmail.com',
      displayName: 'Gerald',
      phone: '+6287777287778',
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      preferredBranchId: mk.id,
      profile: {
        create: {
          fullName: 'Gerald Reyner Liando',
          gender: 'MALE',
        },
      },
    },
  });

  return {
    superadmin,
    admin,
    coachSarah,
    coachBudi,
    coachJessica,
    customerAnisa,
    customerDimas,
  };
}

// ----------------------------------------------------------------------------
// 3. Master Data (Studio, Ruangan, Jenis Kelas)
// ----------------------------------------------------------------------------
export async function seedMasterData(
  db: PrismaClient,
  branches: { jkt: Cabang; bsd: Cabang },
): Promise<{
  studioJktReformer: Studio;
  studioJktMat: Studio;
  studioBsdReformer: Studio;
  roomJkt1A: Ruangan;
  roomJkt2A: Ruangan;
  roomBsd1A: Ruangan;
  classTypeReformer: JenisKelas;
  classTypeMat: JenisKelas;
  classTypeBarre: JenisKelas;
  classTypePriv: JenisKelas;
}> {
  console.info('🏢 [3/6] Seeding Studio, Ruangan, and Jenis Kelas master data...');
  const { jkt, bsd } = branches;

  const studioJktReformer = await db.studio.upsert({
    where: { id: '00000000-0000-4000-8000-000000000010' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000010',
      branchId: jkt.id,
      code: 'ST-JKT-1',
      name: 'Studio Reformer Jakarta',
      description: 'Main reformer studio equipped with 10 Allegro 2 machines',
      active: true,
    },
  });

  const studioJktMat = await db.studio.upsert({
    where: { id: '00000000-0000-4000-8000-000000000011' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000011',
      branchId: jkt.id,
      code: 'ST-JKT-2',
      name: 'Studio Mat Jakarta',
      description: 'Spacious studio for Mat Pilates, Barre, and Yoga',
      active: true,
    },
  });

  const studioBsdReformer = await db.studio.upsert({
    where: { id: '00000000-0000-4000-8000-000000000020' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000020',
      branchId: bsd.id,
      code: 'ST-BSD-1',
      name: 'Studio Reformer BSD',
      description: 'Premium reformer studio at Foresta BSD City',
      active: true,
    },
  });

  const roomJkt1A = await db.ruangan.upsert({
    where: { id: '00000000-0000-4000-8000-000000000012' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000012',
      studioId: studioJktReformer.id,
      code: 'RM-JKT-1A',
      name: 'Reformer Room A',
      capacityBed: 10,
      active: true,
    },
  });

  const roomJkt2A = await db.ruangan.upsert({
    where: { id: '00000000-0000-4000-8000-000000000013' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000013',
      studioId: studioJktMat.id,
      code: 'RM-JKT-2A',
      name: 'Mat Room',
      capacityBed: 14,
      active: true,
    },
  });

  const roomBsd1A = await db.ruangan.upsert({
    where: { id: '00000000-0000-4000-8000-000000000021' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000021',
      studioId: studioBsdReformer.id,
      code: 'RM-BSD-1A',
      name: 'Reformer Room BSD',
      capacityBed: 12,
      active: true,
    },
  });

  const classTypeReformer = await db.jenisKelas.upsert({
    where: { id: 'd2349bc5-dde6-4fd8-ad58-d426ab33f936' },
    update: { active: true, heroImageKey: 'classes/reformer-pilates.png' },
    create: {
      id: 'd2349bc5-dde6-4fd8-ad58-d426ab33f936',
      code: 'REFORMER',
      name: 'Reformer Pilates',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 10,
      heroImageKey: 'classes/reformer-pilates.png',
      description: 'Full-body workout using state-of-the-art reformer machines',
      active: true,
    },
  });

  const classTypeMat = await db.jenisKelas.upsert({
    where: { id: '68c4c9a7-fb05-448f-8346-812e3df11c90' },
    update: { active: true, heroImageKey: 'classes/mat-pilates.png' },
    create: {
      id: '68c4c9a7-fb05-448f-8346-812e3df11c90',
      code: 'MAT',
      name: 'Mat Pilates',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 14,
      heroImageKey: 'classes/mat-pilates.png',
      description: 'Core-focused traditional Pilates on the mat with props',
      active: true,
    },
  });

  const classTypeBarre = await db.jenisKelas.upsert({
    where: { id: '6ea95b90-71f4-4916-8d76-37f07c92e08c' },
    update: { active: true },
    create: {
      id: '6ea95b90-71f4-4916-8d76-37f07c92e08c',
      code: 'BARRE',
      name: 'Barre Class',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 14,
      description: 'Dynamic ballet and pilates fusion for toning and posture',
      active: true,
    },
  });

  const classTypePriv = await db.jenisKelas.upsert({
    where: { id: '00000000-0000-4000-8000-000000000030' },
    update: { active: true },
    create: {
      id: '00000000-0000-4000-8000-000000000030',
      code: 'REFORMER_PRIV',
      name: 'Private Reformer 1-on-1',
      modality: ClassModality.PRIVATE,
      durationMinutes: 50,
      defaultCapacity: 1,
      description: 'Personalized 1-on-1 Pilates session with an expert instructor',
      active: true,
    },
  });

  // Authentic V1 Class Types
  const v1Classes = [
    {
      id: 'c1000000-0000-4000-8000-000000000001',
      code: 'GROUP_CLASS',
      name: 'Group Class',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 5,
      description: 'Group reformer classes with layer of resistance for muscle tone and metabolism.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000002',
      code: 'PRIVATE_CLASS',
      name: 'Private Class',
      modality: ClassModality.PRIVATE,
      durationMinutes: 50,
      defaultCapacity: 1,
      description: '1-on-1 private pilates session with individualized attention and injury care.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000003',
      code: 'SEMI_PRIVATE',
      name: 'Semi Private Class',
      modality: ClassModality.SEMI_PRIVATE,
      durationMinutes: 50,
      defaultCapacity: 2,
      description: 'Scheduled session for 2 to 4 people to workout together with dedicated coach.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000004',
      code: 'PRIVATE_GROUP',
      name: 'Private Group',
      modality: ClassModality.GROUP,
      durationMinutes: 50,
      defaultCapacity: 5,
      description: 'Private group reformer pilates session for closed circle/group.',
      active: true,
    },
    {
      id: 'c1000000-0000-4000-8000-000000000005',
      code: 'MEGAFORMER',
      name: 'Megaformer Class',
      modality: ClassModality.GROUP,
      durationMinutes: 55,
      defaultCapacity: 5,
      description: 'Megaformer workout session (historical/archived).',
      active: false,
    },
  ];

  for (const cls of v1Classes) {
    await db.jenisKelas.upsert({
      where: { id: cls.id },
      update: {
        code: cls.code,
        name: cls.name,
        modality: cls.modality,
        durationMinutes: cls.durationMinutes,
        defaultCapacity: cls.defaultCapacity,
        description: cls.description,
        active: cls.active,
      },
      create: cls,
    });
  }

  return {
    studioJktReformer,
    studioJktMat,
    studioBsdReformer,
    roomJkt1A,
    roomJkt2A,
    roomBsd1A,
    classTypeReformer,
    classTypeMat,
    classTypeBarre,
    classTypePriv,
  };
}

// ----------------------------------------------------------------------------
// 4. Packages, Vouchers & Payment Accounts
// ----------------------------------------------------------------------------
export async function seedPackagesAndPromotions(
  db: PrismaClient,
  branches: { jkt: Cabang; bsd: Cabang },
  classTypes: {
    classTypeReformer: JenisKelas;
    classTypeMat: JenisKelas;
    classTypeBarre: JenisKelas;
  },
): Promise<{
  pkgReformer10: Paket;
  pkgReformer5: Paket;
  pkgMat8: Paket;
  pkgBarre8: Paket;
}> {
  console.info('💳 [4/6] Seeding Payment Accounts, Packages, and Vouchers...');
  const { jkt, bsd } = branches;
  const { classTypeReformer, classTypeMat, classTypeBarre } = classTypes;

  // Rekening Pembayaran (5 Authentic BCA Accounts from v1)
  const bankAccounts = [
    {
      id: '00000000-0000-4000-8000-000000000040',
      branchId: jkt.id,
      bankName: 'Bank Central Asia',
      accountNumber: '6600482911',
      accountHolder: 'Gerald Reyner Liando',
    },
    {
      id: '00000000-0000-4000-8000-000000000041',
      branchId: bsd.id,
      bankName: 'BANK CENTRAL ASIA',
      accountNumber: '8651807777',
      accountHolder: 'CV SUKMEN SAMATA PRATAMA',
    },
  ];

  for (const acc of bankAccounts) {
    await db.rekeningPembayaran.upsert({
      where: { id: acc.id },
      update: { active: true, bankName: acc.bankName, accountNumber: acc.accountNumber, accountHolder: acc.accountHolder },
      create: {
        id: acc.id,
        branchId: acc.branchId,
        bankName: acc.bankName,
        accountNumber: acc.accountNumber,
        accountHolder: acc.accountHolder,
        active: true,
      },
    });
  }

  // Authentic Master Paket (V1 Authentic)
  const pkgReformer10 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000001' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000001',
      classTypeId: 'c1000000-0000-4000-8000-000000000001',
      code: 'PK-V1-1',
      name: 'Paket 8 Sesi Group Class',
      sessionCount: 8,
      validityDays: 60,
      priceRp: 2640000,
      description: 'Cabang: Semua Cabang',
      status: PackageStatus.ACTIVE,
    },
  });

  const pkgReformer5 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000002' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000002',
      classTypeId: 'c1000000-0000-4000-8000-000000000002',
      code: 'PK-V1-2',
      name: 'Paket 8 Sesi Private Class',
      sessionCount: 8,
      validityDays: 60,
      priceRp: 4600000,
      description: 'Cabang: DD-GG, DD-MK, DD-SBY, DD-UNTAR, DD-PIK2',
      status: PackageStatus.ACTIVE,
    },
  });

  const pkgMat8 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000003' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000003',
      classTypeId: 'c1000000-0000-4000-8000-000000000001',
      code: 'PK-V1-3',
      name: 'Paket 20 Sesi Group Class',
      sessionCount: 20,
      validityDays: 120,
      priceRp: 5600000,
      description: 'Cabang: DD-GG, DD-MK, DD-SBY, DD-UNTAR, DD-PIK2',
      status: PackageStatus.ACTIVE,
    },
  });

  const pkgBarre8 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000004' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000004',
      classTypeId: 'c1000000-0000-4000-8000-000000000004',
      code: 'PK-V1-4',
      name: 'Drop In Private Group Class',
      sessionCount: 1,
      validityDays: 30,
      priceRp: 380000,
      description: 'Cabang: DD-GG, DD-MK, DD-SBY, DD-UNTAR, DD-PIK2',
      status: PackageStatus.ACTIVE,
    },
  });

  // Authentic Vouchers (V1 Authentic)
  await db.voucher.upsert({
    where: { id: '30000000-0000-4000-8000-000000000033' },
    update: { active: true },
    create: {
      id: '30000000-0000-4000-8000-000000000033',
      code: 'FIRSTIME',
      name: 'DROP IN GENERAL NEW',
      discountType: 'NOMINAL',
      discountValue: 150000,
      minSpendRp: 0,
      quota: 2000,
      usedCount: 1747,
      active: true,
    },
  });

  await db.voucher.upsert({
    where: { id: '30000000-0000-4000-8000-000000000015' },
    update: { active: true },
    create: {
      id: '30000000-0000-4000-8000-000000000015',
      code: 'PRIVATE2026',
      name: 'Semi Private dan Private Session',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSpendRp: 0,
      quota: 1000,
      usedCount: 781,
      active: true,
    },
  });

  return {
    pkgReformer10,
    pkgReformer5,
    pkgMat8,
    pkgBarre8,
  };
}

// ----------------------------------------------------------------------------
// 5. Penugasan Instruktur
// ----------------------------------------------------------------------------
export async function seedInstructorAssignments(
  db: PrismaClient,
  coaches: { coachSarah: User; coachBudi: User; coachJessica: User },
  branches: { jkt: Cabang; bsd: Cabang },
): Promise<void> {
  console.info('📋 [5/6] Seeding Instructor assignments...');
  const { coachSarah, coachBudi, coachJessica } = coaches;
  const { jkt, bsd } = branches;

  await db.penugasanInstruktur.upsert({
    where: { coachId_branchId: { coachId: coachSarah.id, branchId: jkt.id } },
    update: { active: true },
    create: { coachId: coachSarah.id, branchId: jkt.id, active: true },
  });

  await db.penugasanInstruktur.upsert({
    where: { coachId_branchId: { coachId: coachSarah.id, branchId: bsd.id } },
    update: { active: true },
    create: { coachId: coachSarah.id, branchId: bsd.id, active: true },
  });

  await db.penugasanInstruktur.upsert({
    where: { coachId_branchId: { coachId: coachBudi.id, branchId: jkt.id } },
    update: { active: true },
    create: { coachId: coachBudi.id, branchId: jkt.id, active: true },
  });

  await db.penugasanInstruktur.upsert({
    where: { coachId_branchId: { coachId: coachJessica.id, branchId: bsd.id } },
    update: { active: true },
    create: { coachId: coachJessica.id, branchId: bsd.id, active: true },
  });
}

// ----------------------------------------------------------------------------
// 6. Timetable, Slot Kelas, Order Demo, & Booking
// ----------------------------------------------------------------------------
export async function seedTimetableAndOperationalData(
  db: PrismaClient,
  fixtures: {
    branches: { jkt: Cabang; bsd: Cabang };
    users: { admin: User; customerAnisa: User; coachSarah: User; coachBudi: User; coachJessica: User };
    packages: { pkgReformer10: Paket };
    masters: {
      studioJktReformer: Studio;
      studioJktMat: Studio;
      studioBsdReformer: Studio;
      roomJkt1A: Ruangan;
      roomJkt2A: Ruangan;
      roomBsd1A: Ruangan;
      classTypeReformer: JenisKelas;
      classTypeMat: JenisKelas;
      classTypeBarre: JenisKelas;
    };
  },
): Promise<void> {
  console.info('🗓️ [6/6] Seeding Timetable slots, Demo Customer Order & Booking...');
  const { jkt, bsd } = fixtures.branches;
  const { admin, customerAnisa, coachSarah, coachBudi, coachJessica } = fixtures.users;
  const { pkgReformer10 } = fixtures.packages;
  const {
    studioJktReformer,
    studioJktMat,
    studioBsdReformer,
    roomJkt1A,
    roomJkt2A,
    roomBsd1A,
    classTypeReformer,
    classTypeMat,
    classTypeBarre,
  } = fixtures.masters;

  // Paket Pelanggan & Pembelian Riil untuk Customer Demo
  const purchase = await db.pembelian.upsert({
    where: { invoiceNumber: 'INV-2026-0001' },
    update: { status: PurchaseStatus.PAID },
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      invoiceNumber: 'INV-2026-0001',
      userId: customerAnisa.id,
      branchId: jkt.id,
      packageId: pkgReformer10.id,
      subtotalRp: 1730000,
      discountRp: 0,
      totalAmountRp: 1730000,
      status: PurchaseStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paidAt: new Date(),
      verifiedById: admin.id,
      verifiedAt: new Date(),
    },
  });

  const customerPackage = await db.paketPelanggan.upsert({
    where: { id: '00000000-0000-4000-8000-000000000202' },
    update: { status: CustomerPackageStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000202',
      purchaseId: purchase.id,
      userId: customerAnisa.id,
      packageId: pkgReformer10.id,
      totalSessions: 10,
      remainingSessions: 9,
      usedSessions: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000),
      status: CustomerPackageStatus.ACTIVE,
    },
  });

  // Calculate Monday of current week
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const slotConfigs = [
    // Monday
    { dayOffset: 0, hour: 7, minute: 30, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    { dayOffset: 0, hour: 9, minute: 0, coach: coachBudi, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    { dayOffset: 0, hour: 17, minute: 30, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    // Tuesday
    { dayOffset: 1, hour: 8, minute: 0, coach: coachBudi, classType: classTypeMat, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 14 },
    { dayOffset: 1, hour: 10, minute: 0, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    { dayOffset: 1, hour: 18, minute: 30, coach: coachSarah, classType: classTypeBarre, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 14 },
    // Wednesday
    { dayOffset: 2, hour: 7, minute: 30, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    { dayOffset: 2, hour: 16, minute: 0, coach: coachBudi, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    // Thursday
    { dayOffset: 3, hour: 9, minute: 0, coach: coachBudi, classType: classTypeMat, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 14 },
    { dayOffset: 3, hour: 17, minute: 30, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    // Friday
    { dayOffset: 4, hour: 8, minute: 0, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    { dayOffset: 4, hour: 18, minute: 0, coach: coachBudi, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    // Saturday (Weekend Special)
    { dayOffset: 5, hour: 9, minute: 0, coach: coachSarah, classType: classTypeReformer, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 10 },
    { dayOffset: 5, hour: 11, minute: 0, coach: coachBudi, classType: classTypeBarre, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 14 },
    // Sunday (BSD Sessions)
    { dayOffset: 6, hour: 9, minute: 30, coach: coachJessica, classType: classTypeReformer, studio: studioBsdReformer, room: roomBsd1A, branch: bsd, capacity: 12 },
    { dayOffset: 6, hour: 11, minute: 0, coach: coachJessica, classType: classTypeReformer, studio: studioBsdReformer, room: roomBsd1A, branch: bsd, capacity: 12 },
  ];

  let firstSlotId: string | null = null;

  for (const weekOffset of [0, 1]) {
    for (let i = 0; i < slotConfigs.length; i++) {
      const cfg = slotConfigs[i];
      if (!cfg) continue;

      const slotStart = new Date(monday);
      slotStart.setDate(monday.getDate() + cfg.dayOffset + weekOffset * 7);
      slotStart.setHours(cfg.hour, cfg.minute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + 50);

      const slotId = `00000000-0000-4000-8000-${String(300 + weekOffset * 100 + i).padStart(12, '0')}`;
      if (weekOffset === 0 && i === 0) firstSlotId = slotId;

      await db.slotKelas.upsert({
        where: { id: slotId },
        update: {
          startAt: slotStart,
          endAt: slotEnd,
          status: ClassSlotStatus.PUBLISHED,
        },
        create: {
          id: slotId,
          branchId: cfg.branch.id,
          studioId: cfg.studio.id,
          roomId: cfg.room.id,
          classTypeId: cfg.classType.id,
          instructorId: cfg.coach.id,
          startAt: slotStart,
          endAt: slotEnd,
          capacity: cfg.capacity,
          bookedCount: weekOffset === 0 && i === 0 ? 1 : 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
    }
  }

  // Pemesanan Kelas & Presensi Customer Demo
  if (firstSlotId) {
    const booking = await db.pemesananKelas.upsert({
      where: { bookingNumber: 'BK-2026-0001' },
      update: { status: BookingStatus.BOOKED },
      create: {
        id: '00000000-0000-4000-8000-000000000401',
        bookingNumber: 'BK-2026-0001',
        classSlotId: firstSlotId,
        userId: customerAnisa.id,
        customerPackageId: customerPackage.id,
        status: BookingStatus.BOOKED,
        bookedAt: new Date(),
      },
    });

    await db.checkInToken.upsert({
      where: { token: 'TOKEN-DEMO-CHECKIN-001' },
      update: { isUsed: false },
      create: {
        id: '00000000-0000-4000-8000-000000000501',
        bookingId: booking.id,
        token: 'TOKEN-DEMO-CHECKIN-001',
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        isUsed: false,
      },
    });
  }
}

// ----------------------------------------------------------------------------
// Main Seeder Orchestration
// ----------------------------------------------------------------------------
export async function seedDatabase(profile?: string) {
  const db = new PrismaClient();
  const selectedProfile =
    profile ||
    process.env.SEED_PROFILE ||
    (process.argv.includes('--users-only') || process.argv.includes('--only=users') ? 'users' : 'full');

  try {
    const defaultPasswordHash = await argon2.hash('ridho123');

    if (selectedProfile === 'users') {
      console.info('🌱 [SEED:USERS] Seeding users and roles only...');
      const branches = await seedCabangMaster(db);
      await seedUsersAndRoles(db, branches, defaultPasswordHash);
      console.info('✅ [SEED:USERS] Superadmin, Admin, Coaches, and Customers seeded successfully.');
      return;
    }

    console.info('🌱 Seeding database with complete DailyDose V2 master and operational data...');
    const branches = await seedCabangMaster(db);
    const users = await seedUsersAndRoles(db, branches, defaultPasswordHash);
    const masters = await seedMasterData(db, branches);
    const packages = await seedPackagesAndPromotions(db, branches, masters);
    await seedInstructorAssignments(db, users, branches);
    await seedTimetableAndOperationalData(db, {
      branches,
      users,
      packages,
      masters,
    });

    console.info('✅ Complete DailyDose V2 master & operational seed finished successfully.');
  } finally {
    await db.$disconnect();
  }
}

// Allow direct CLI execution
if (require.main === module) {
  seedDatabase().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Seed failed.');
    process.exitCode = 1;
  });
}

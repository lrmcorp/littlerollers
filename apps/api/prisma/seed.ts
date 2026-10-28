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
  SessionMutationType,
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

export async function backfillUsernames(db: PrismaClient) {
  const usersWithoutUsername = await db.user.findMany({
    where: { username: null },
    select: { id: true, email: true, displayName: true },
  });

  for (const u of usersWithoutUsername) {
    let candidate = '';
    if (u.email && u.email.includes('@')) {
      candidate = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    } else if (u.displayName) {
      candidate = u.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '');
    }
    if (!candidate || candidate.length < 3) {
      candidate = `user_${u.id.slice(0, 6)}`;
    }

    let finalUsername = candidate;
    let counter = 1;
    while (await db.user.findFirst({ where: { username: finalUsername, NOT: { id: u.id } } })) {
      finalUsername = `${candidate}_${counter++}`;
    }

    await db.user.update({
      where: { id: u.id },
      data: { username: finalUsername },
    });
  }
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

  // Superadmin / Super Owner (Global access across all branches)
  const superadmin = await db.user.upsert({
    where: { email: 'ralamzah@gmail.com' },
    update: { role: Role.SUPER_OWNER, status: UserStatus.ACTIVE, username: 'ralamzah' },
    create: {
      id: '00000000-0000-4000-8000-000000000100',
      email: 'ralamzah@gmail.com',
      username: 'ralamzah',
      displayName: 'Ridho Alamzah',
      phone: '081234567890',
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_OWNER,
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

  // Dedicated Super Owner
  await db.user.upsert({
    where: { email: 'superowner@dailydose.test' },
    update: { role: Role.SUPER_OWNER, status: UserStatus.ACTIVE, username: 'superowner' },
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      email: 'superowner@dailydose.test',
      username: 'superowner',
      displayName: 'Super Owner',
      phone: '+628111111101',
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_OWNER,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          fullName: 'Super Owner Executive',
          gender: 'MALE',
        },
      },
    },
  });

  // Owner (Cabang Green Garden)
  const ownerGG = await db.user.upsert({
    where: { email: 'owner.gg@dailydose.test' },
    update: { role: Role.OWNER, status: UserStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000102',
      email: 'owner.gg@dailydose.test',
      displayName: 'Owner Green Garden',
      phone: '+628111111102',
      passwordHash: defaultPasswordHash,
      role: Role.OWNER,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Owner Cabang Green Garden',
          gender: 'FEMALE',
        },
      },
    },
  });

  // Penugasan Owner ke Cabang Green Garden (OwnerBranch)
  await db.ownerCabang.upsert({
    where: {
      ownerId_branchId: {
        ownerId: ownerGG.id,
        branchId: gg.id,
      },
    },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000103',
      ownerId: ownerGG.id,
      branchId: gg.id,
    },
  });

  // Manager (Cabang Green Garden)
  await db.user.upsert({
    where: { email: 'manager.gg@dailydose.test' },
    update: { role: Role.MANAGER, status: UserStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000104',
      email: 'manager.gg@dailydose.test',
      displayName: 'Manager Green Garden',
      phone: '+628111111104',
      passwordHash: defaultPasswordHash,
      role: Role.MANAGER,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Studio Manager Green Garden',
          gender: 'FEMALE',
        },
      },
    },
  });

  // Finance (Global / Multi-Cabang)
  await db.user.upsert({
    where: { email: 'finance@dailydose.test' },
    update: { role: Role.FINANCE, status: UserStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000105',
      email: 'finance@dailydose.test',
      displayName: 'Finance Corporate',
      phone: '+628111111105',
      passwordHash: defaultPasswordHash,
      role: Role.FINANCE,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          fullName: 'Corporate Finance Lead',
          gender: 'MALE',
        },
      },
    },
  });

  // Admin
  const admin = await db.user.upsert({
    where: { email: 'adminmk@ddose.com' },
    update: { role: Role.ADMIN, status: UserStatus.ACTIVE, username: 'adminmk' },
    create: {
      id: '10000000-0000-4000-8000-000000001548',
      email: 'adminmk@ddose.com',
      username: 'adminmk',
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
    update: { role: Role.INSTRUCTOR, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000000003',
      email: 'instdevi@ddose.com',
      displayName: 'Devi',
      phone: '+6287825588055',
      passwordHash: defaultPasswordHash,
      role: Role.INSTRUCTOR,
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
    update: { role: Role.INSTRUCTOR, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000001101',
      email: 'inststephen@ddose.com',
      displayName: 'Stephen',
      passwordHash: defaultPasswordHash,
      role: Role.INSTRUCTOR,
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
    update: { role: Role.INSTRUCTOR, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000001102',
      email: 'instangel@ddose.com',
      displayName: 'Angel',
      passwordHash: defaultPasswordHash,
      role: Role.INSTRUCTOR,
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

  // Dedicated Instructor (Role.INSTRUCTOR)
  await db.user.upsert({
    where: { email: 'coach.sarah@dailydose.test' },
    update: { role: Role.INSTRUCTOR, status: UserStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000106',
      email: 'coach.sarah@dailydose.test',
      displayName: 'Sarah Jenkins',
      phone: '+628111111106',
      passwordHash: defaultPasswordHash,
      role: Role.INSTRUCTOR,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Sarah Jenkins',
          gender: 'FEMALE',
        },
      },
    },
  });

  // Dedicated Customer (Role.CUSTOMER)
  await db.user.upsert({
    where: { email: 'customer.maya@dailydose.test' },
    update: { role: Role.CUSTOMER, status: UserStatus.ACTIVE },
    create: {
      id: '00000000-0000-4000-8000-000000000107',
      email: 'customer.maya@dailydose.test',
      displayName: 'Maya Putri',
      phone: '+628111111107',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      preferredBranchId: gg.id,
      profile: {
        create: {
          fullName: 'Maya Putri',
          gender: 'FEMALE',
        },
      },
    },
  });

  // Customer Members (Authentic V1 Customers)
  const customerAnisa = await db.user.upsert({
    where: { email: 'cindyedelene@gmail.com' },
    update: { role: Role.CUSTOMER, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000000012',
      email: 'cindyedelene@gmail.com',
      displayName: 'Cindy Edelene Arief',
      phone: '+628158159818',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
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
    update: { role: Role.CUSTOMER, status: UserStatus.ACTIVE },
    create: {
      id: '10000000-0000-4000-8000-000000000004',
      email: 'rynrliando@gmail.com',
      displayName: 'Gerald',
      phone: '+6287777287778',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
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

  await backfillUsernames(db);

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
  classTypeGroup: JenisKelas;
  classTypePrivate: JenisKelas;
  classTypeSemiPrivate: JenisKelas;
  classTypePrivateGroup: JenisKelas;
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
  ];

  const classTypeMap: Record<string, JenisKelas> = {};
  for (const cls of v1Classes) {
    classTypeMap[cls.code] = await db.jenisKelas.upsert({
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

  const classTypeGroup = classTypeMap['GROUP_CLASS']!;
  const classTypePrivate = classTypeMap['PRIVATE_CLASS']!;
  const classTypeSemiPrivate = classTypeMap['SEMI_PRIVATE']!;
  const classTypePrivateGroup = classTypeMap['PRIVATE_GROUP']!;

  return {
    studioJktReformer,
    studioJktMat,
    studioBsdReformer,
    roomJkt1A,
    roomJkt2A,
    roomBsd1A,
    classTypeGroup,
    classTypePrivate,
    classTypeSemiPrivate,
    classTypePrivateGroup,
  };
}

// ----------------------------------------------------------------------------
// 4. Packages, Vouchers & Payment Accounts
// ----------------------------------------------------------------------------
export async function seedPackagesAndPromotions(
  db: PrismaClient,
  branches: { jkt: Cabang; bsd: Cabang },
  classTypes: {
    classTypeGroup: JenisKelas;
    classTypePrivate: JenisKelas;
    classTypeSemiPrivate: JenisKelas;
    classTypePrivateGroup: JenisKelas;
  },
): Promise<{
  pkgGroup10: Paket;
  pkgPrivate8: Paket;
  pkgGroup20: Paket;
  pkgPrivateGroup1: Paket;
}> {
  console.info('💳 [4/6] Seeding Payment Accounts, Packages, and Vouchers...');
  const { jkt, bsd } = branches;
  const { classTypeGroup, classTypePrivate, classTypeSemiPrivate, classTypePrivateGroup } = classTypes;

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
  const pkgGroup10 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000001' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000001',
      classTypeId: classTypeGroup.id,
      code: 'PK-V1-1',
      name: 'Paket 8 Sesi Group Class',
      sessionCount: 8,
      validityDays: 60,
      priceRp: 2640000,
      description: 'Cabang: Semua Cabang',
      status: PackageStatus.ACTIVE,
    },
  });

  const pkgPrivate8 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000002' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000002',
      classTypeId: classTypePrivate.id,
      code: 'PK-V1-2',
      name: 'Paket 8 Sesi Private Class',
      sessionCount: 8,
      validityDays: 60,
      priceRp: 4600000,
      description: 'Cabang: DD-GG, DD-MK, DD-SBY, DD-UNTAR, DD-PIK2',
      status: PackageStatus.ACTIVE,
    },
  });

  const pkgGroup20 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000003' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000003',
      classTypeId: classTypeGroup.id,
      code: 'PK-V1-3',
      name: 'Paket 20 Sesi Group Class',
      sessionCount: 20,
      validityDays: 120,
      priceRp: 5600000,
      description: 'Cabang: DD-GG, DD-MK, DD-SBY, DD-UNTAR, DD-PIK2',
      status: PackageStatus.ACTIVE,
    },
  });

  const pkgPrivateGroup1 = await db.paket.upsert({
    where: { id: '20000000-0000-4000-8000-000000000004' },
    update: { status: PackageStatus.ACTIVE },
    create: {
      id: '20000000-0000-4000-8000-000000000004',
      classTypeId: classTypePrivateGroup.id,
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
    pkgGroup10,
    pkgPrivate8,
    pkgGroup20,
    pkgPrivateGroup1,
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
    packages: { pkgGroup10: Paket };
    masters: {
      studioJktReformer: Studio;
      studioJktMat: Studio;
      studioBsdReformer: Studio;
      roomJkt1A: Ruangan;
      roomJkt2A: Ruangan;
      roomBsd1A: Ruangan;
      classTypeGroup: JenisKelas;
      classTypePrivate: JenisKelas;
      classTypeSemiPrivate: JenisKelas;
      classTypePrivateGroup: JenisKelas;
    };
  },
): Promise<void> {
  console.info('🗓️ [6/6] Seeding Timetable slots, Demo Customer Order & Booking...');
  const { jkt, bsd } = fixtures.branches;
  const { admin, customerAnisa, coachSarah, coachBudi, coachJessica } = fixtures.users;
  const { pkgGroup10 } = fixtures.packages;
  const {
    studioJktReformer,
    studioJktMat,
    studioBsdReformer,
    roomJkt1A,
    roomJkt2A,
    roomBsd1A,
    classTypeGroup,
    classTypePrivate,
    classTypeSemiPrivate,
    classTypePrivateGroup,
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
      packageId: pkgGroup10.id,
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
      packageId: pkgGroup10.id,
      totalSessions: 10,
      remainingSessions: 9,
      usedSessions: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000),
      status: CustomerPackageStatus.ACTIVE,
    },
  });

  // Seed initial SessionLedger mutations (Single Source of Truth)
  await db.sessionLedger.upsert({
    where: { id: '00000000-0000-4000-8000-000000000203' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000203',
      customerPackageId: customerPackage.id,
      type: SessionMutationType.PURCHASE,
      amount: 10,
      balanceAfter: 10,
      referenceId: purchase.id,
      notes: 'Initial package purchase allocation',
    },
  });

  await db.sessionLedger.upsert({
    where: { id: '00000000-0000-4000-8000-000000000204' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000204',
      customerPackageId: customerPackage.id,
      type: SessionMutationType.ATTEND,
      amount: -1,
      balanceAfter: 9,
      notes: 'Class session completed',
    },
  });

  // Seed MinQuotaSetting and InstructorFee
  await db.minQuotaSetting.upsert({
    where: {
      branchId_classTypeId: {
        branchId: jkt.id,
        classTypeId: classTypeGroup.id,
      },
    },
    update: { minQuota: 3, cutoffHours: 24 },
    create: {
      id: '00000000-0000-4000-8000-000000000210',
      branchId: jkt.id,
      classTypeId: classTypeGroup.id,
      minQuota: 3,
      cutoffHours: 24,
      active: true,
    },
  });

  await db.instructorFee.upsert({
    where: { id: '00000000-0000-4000-8000-000000000211' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000211',
      instructorId: coachSarah.id,
      branchId: jkt.id,
      classTypeId: classTypeGroup.id,
      feePerJamRp: 150000,
      effectiveDate: new Date('2026-01-01'),
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
    { dayOffset: 0, hour: 7, minute: 30, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    { dayOffset: 0, hour: 9, minute: 0, coach: coachBudi, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    { dayOffset: 0, hour: 17, minute: 30, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    // Tuesday
    { dayOffset: 1, hour: 8, minute: 0, coach: coachBudi, classType: classTypePrivate, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 1 },
    { dayOffset: 1, hour: 10, minute: 0, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    { dayOffset: 1, hour: 18, minute: 30, coach: coachSarah, classType: classTypePrivateGroup, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 5 },
    // Wednesday
    { dayOffset: 2, hour: 7, minute: 30, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    { dayOffset: 2, hour: 16, minute: 0, coach: coachBudi, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    // Thursday
    { dayOffset: 3, hour: 9, minute: 0, coach: coachBudi, classType: classTypeSemiPrivate, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 2 },
    { dayOffset: 3, hour: 17, minute: 30, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    // Friday
    { dayOffset: 4, hour: 8, minute: 0, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    { dayOffset: 4, hour: 18, minute: 0, coach: coachBudi, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    // Saturday (Weekend Special)
    { dayOffset: 5, hour: 9, minute: 0, coach: coachSarah, classType: classTypeGroup, studio: studioJktReformer, room: roomJkt1A, branch: jkt, capacity: 5 },
    { dayOffset: 5, hour: 11, minute: 0, coach: coachBudi, classType: classTypePrivateGroup, studio: studioJktMat, room: roomJkt2A, branch: jkt, capacity: 5 },
    // Sunday (BSD Sessions)
    { dayOffset: 6, hour: 9, minute: 30, coach: coachJessica, classType: classTypeGroup, studio: studioBsdReformer, room: roomBsd1A, branch: bsd, capacity: 5 },
    { dayOffset: 6, hour: 11, minute: 0, coach: coachJessica, classType: classTypeGroup, studio: studioBsdReformer, room: roomBsd1A, branch: bsd, capacity: 5 },
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

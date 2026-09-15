import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface V1BranchDef {
  id: string;
  code: string;
  name: string;
  address: string;
  supportWhatsappE164: string;
  timezone: string;
  email: string;
  mapUrl: string;
  imageV1: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  studios: Array<{
    id: string;
    code: string;
    name: string;
    equipment?: string | null;
    imageV1: string;
    room: {
      id: string;
      code: string;
      name: string;
      capacityBed: number;
    };
  }>;
}

const v1Branches: V1BranchDef[] = [
  // 1. Green Garden, Jakarta Barat
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    code: 'DD-GG',
    name: 'Daily Dose Green Garden',
    address:
      'Komp. Ruko Green Garden Blk. A, Jl. Panjang No.30, Kedoya Utara, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11520',
    supportWhatsappE164: '+6281212327038',
    timezone: 'Asia/Jakarta',
    email: 'dailydosepilates@gmail.com',
    mapUrl: 'https://goo.gl/maps/hQGG9dUKHd8L73AR8',
    imageV1:
      'RHLVEg2qQWPuhdpR0zNESUZgkLwU0G-metaWXZScUpTUWpGbVpIdVVmZmN1ZFV1Mnp0bzJMNEk2LW1ldGFVMk55WldWdUlGTm9iM1FnTWpBeU15MHdPQzB4TmlCaGRDQXhOaTR6T0M0ek15NXdibWM9LS5wbmc=-.png',
    bankAccount: {
      bankName: 'Bank Central Asia',
      accountNumber: '6600482911',
      accountHolder: 'Gerald Reyner Liando',
    },
    studios: [
      {
        id: 'b1000000-0000-4000-8000-000000000001',
        code: 'ST-GG-1',
        name: 'Studio 1',
        equipment: 'Reformer',
        imageV1:
          'VKz75nC38UTBFSO1cgtM9Y0U0PAez8-metaU2NyZWVuIFNob3QgMjAyMy0wOC0xNiBhdCAxNi4yMS40MS5wbmc=-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000001',
          code: 'RM-GG-1',
          name: 'Studio 1',
          capacityBed: 5,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000002',
        code: 'ST-GG-2',
        name: 'Studio 2',
        equipment: null,
        imageV1:
          'L78Ccu72pJHdkvrTLbVoWeQKTm4DJy-metaU2NyZWVuIFNob3QgMjAyMy0wOC0xOSBhdCAxNi40Ni4yOS5wbmc=-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000002',
          code: 'RM-GG-2',
          name: 'Studio 2',
          capacityBed: 5,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000003',
        code: 'ST-GG-3',
        name: 'Private Studio',
        equipment: null,
        imageV1:
          'p1IKFHFCKH7nuw4Y1dcvBD40BkaPPu-metaU2NyZWVuIFNob3QgMjAyMy0wOC0xOSBhdCAyMS4wNi41Mi5wbmc=-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000003',
          code: 'RM-GG-3',
          name: 'Private Studio',
          capacityBed: 2,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000004',
        code: 'ST-GG-4',
        name: 'Private Studio - 2',
        equipment: null,
        imageV1:
          'VFZQTd6b1LrO8fubuqK6vqMpAL5ed3-metaU2NyZWVuIFNob3QgMjAyMy0wOC0yMSBhdCAwMC4wMi4xOC5wbmc=-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000004',
          code: 'RM-GG-4',
          name: 'Private Studio 2',
          capacityBed: 2,
        },
      },
    ],
  },

  // 2. Muara Karang, Jakarta Utara
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    code: 'DD-MK',
    name: 'Daily Dose Muara Karang',
    address:
      'Jalan Pluit Karang Timur No. 30 (Muara Karang Blok E 5 Timur No. 30), Pluit, Penjaringan, Jakarta Utara 14450',
    supportWhatsappE164: '+6287862151824',
    timezone: 'Asia/Jakarta',
    email: 'dailydosepilatesmk@gmail.com',
    mapUrl: 'https://maps.app.goo.gl/QeAXRpoDcH8bXbDVA',
    imageV1:
      'AQafOlAD9EIAKIHcMzJ3dHsgRXDqD4-metaYTQxMGZlYzgtYThiYS00ZTk0LTg0ODYtZDMyNzA4NzA5ODRiLkpQRw==-.jpg',
    bankAccount: {
      bankName: 'Bank Central Asia',
      accountNumber: '6600491511',
      accountHolder: 'Gerald Reyner Liando',
    },
    studios: [
      {
        id: 'b1000000-0000-4000-8000-000000000005',
        code: 'ST-MK-1',
        name: 'Group Class',
        equipment: null,
        imageV1:
          'RzrrkgBGIkra4nTAh2Nql8WxjQRxpZ-metaYTRkMjY2ZTAtMjdmMi00N2UwLTliOTMtNGI1NTVjYzFmNTEwLkpQRw==-.jpg',
        room: {
          id: 'c1000000-0000-4000-8000-000000000005',
          code: 'RM-MK-1',
          name: 'Group Class',
          capacityBed: 8,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000006',
        code: 'ST-MK-2',
        name: 'Private Studio',
        equipment: null,
        imageV1:
          'umyepmSZlfms5KnY13hcU0EfUOLxTQ-metaYTQxMGZlYzgtYThiYS00ZTk0LTg0ODYtZDMyNzA4NzA5ODRiLmpwZWc=-.jpg',
        room: {
          id: 'c1000000-0000-4000-8000-000000000006',
          code: 'RM-MK-2',
          name: 'Private Studio',
          capacityBed: 2,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000007',
        code: 'ST-MK-3',
        name: 'Semi Private Class',
        equipment: null,
        imageV1: 'QPIrVUlRqSgoLx4ZqVxvWeQ5yR7z27-metaSU1HXzM5NDcuanBn-.jpg',
        room: {
          id: 'c1000000-0000-4000-8000-000000000007',
          code: 'RM-MK-3',
          name: 'Semi Private Class',
          capacityBed: 4,
        },
      },
    ],
  },

  // 3. Graha Family - Surabaya Barat
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    code: 'DD-SBY',
    name: 'Daily Dose Graha Family Surabaya',
    address:
      'Jl. Taman Perkantoran TP 19-20, Jl. Raya Graha Famili Utara, Pradahkalikendal, Dukuhpakis, Surabaya, Jawa Timur 60277',
    supportWhatsappE164: '+62895340133103',
    timezone: 'Asia/Jakarta',
    email: 'ddosesby@lrmcorporation.com',
    mapUrl: 'https://maps.app.goo.gl/XVUaQ1zEPpMyW3aJ8',
    imageV1:
      'fX2FxgryH7RqQOqR0xKbEUpLkFC9Dn-metaV2hhdHNBcHAgSW1hZ2UgMjAyMy0xMi0wNyBhdCAxNS4xNS4wNS5qcGVn-.jpg',
    bankAccount: {
      bankName: 'Bank Central Asia',
      accountNumber: '8651765765',
      accountHolder: 'CV SUKMEN SURABAYA PRATAMA',
    },
    studios: [
      {
        id: 'b1000000-0000-4000-8000-000000000008',
        code: 'ST-SBY-1',
        name: 'Group Studio',
        equipment: null,
        imageV1: 'ieMzPmxLmDWGr7l8RMEbPSZuiU9s4i-metaSU1HXzkwNzcucG5n-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000008',
          code: 'RM-SBY-1',
          name: 'Group Studio',
          capacityBed: 8,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000009',
        code: 'ST-SBY-2',
        name: 'Private Studio',
        equipment: null,
        imageV1:
          'sov04jq7mkwSlgsc1y1EKyKLQQSteh-metaM2U5OTdlMTUtYTNhYi00MzEwLTg2ZTYtNGJhOWE3NDAwM2VlLmpwZWc=-.jpg',
        room: {
          id: 'c1000000-0000-4000-8000-000000000009',
          code: 'RM-SBY-2',
          name: 'Private Studio',
          capacityBed: 2,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000010',
        code: 'ST-SBY-3',
        name: 'Megaformer',
        equipment: null,
        imageV1:
          '5n6jRFlOkY06W3rwzjo5mvy41sRFMa-metaU2NyZWVuc2hvdCAyMDI2LTA4LTAzIGF0IDEzLjI0LjMzLnBuZw==-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000010',
          code: 'RM-SBY-3',
          name: 'Megaformer',
          capacityBed: 6,
        },
      },
    ],
  },

  // 4. Universitas Tarumanagara - Kampus 2
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    code: 'DD-UNTAR',
    name: 'Daily Dose Untar Kampus 2',
    address:
      'Parking lot, Jl. Universitas Tarumanagara Kampus II No.11, RT.11/RW.1, North Tanjung Duren, Grogol petamburan, Jakarta Barat 11470',
    supportWhatsappE164: '+6289506909801',
    timezone: 'Asia/Jakarta',
    email: 'ddpuntar@lrmcorporation.com',
    mapUrl: 'https://maps.app.goo.gl/yLp3CuQP7TTWvHxx9',
    imageV1:
      'SdQmwuNnsmEG7hYWOiKskJDkTe9WdO-metaV2hhdHNBcHAgSW1hZ2UgMjAyNi0wMi0xNiBhdCAxNC4yNi4zNyAoMSkuanBlZw==-.jpeg',
    bankAccount: {
      bankName: 'Bank Central Asia',
      accountNumber: '8998801218',
      accountHolder: 'CV SUKMEN SAMAYA PRATAMA',
    },
    studios: [
      {
        id: 'b1000000-0000-4000-8000-000000000011',
        code: 'ST-UNTAR-1',
        name: 'Group Class',
        equipment: 'Reformer',
        imageV1:
          'ibJHWCINRllmMkuBmbvZlRkCx4XpoB-metaU2NyZWVuc2hvdCAyMDI0LTAyLTIwIGF0IDIyLjQ2LjIzLnBuZw==-.png',
        room: {
          id: 'c1000000-0000-4000-8000-000000000011',
          code: 'RM-UNTAR-1',
          name: 'Group Class',
          capacityBed: 6,
        },
      },
    ],
  },

  // 5. Orange Groves PIK 2
  {
    id: 'a1000000-0000-4000-8000-000000000005',
    code: 'DD-PIK2',
    name: 'Daily Dose Orange Groves PIK 2',
    address: 'Orange Groves, PIK 2, Kabupaten Tangerang, Banten',
    supportWhatsappE164: '+62895329736127',
    timezone: 'Asia/Jakarta',
    email: 'ogddose@lrmcorporation.com',
    mapUrl: 'https://maps.app.goo.gl/5s86jgTXbiWnsW6a9',
    imageV1: 'z72h7klnsg7b2MIyyojVQ7AjM0grvG-metabG9nbyAxLnBuZw==-.png',
    bankAccount: {
      bankName: 'BANK CENTRAL ASIA',
      accountNumber: '8651807777',
      accountHolder: 'CV SUKMEN SAMATA PRATAMA',
    },
    studios: [
      {
        id: 'b1000000-0000-4000-8000-000000000012',
        code: 'ST-PIK2-1',
        name: 'Group Class',
        equipment: 'Reformer, Tower',
        imageV1: 'vTZ7c2t5VHSU4Mz7DKF0tZugmTMwfs-metaSU1HXzcwMDYuanBlZw==-.jpg',
        room: {
          id: 'c1000000-0000-4000-8000-000000000012',
          code: 'RM-PIK2-1',
          name: 'Group Class',
          capacityBed: 8,
        },
      },
      {
        id: 'b1000000-0000-4000-8000-000000000013',
        code: 'ST-PIK2-2',
        name: 'Private',
        equipment: null,
        imageV1: 'bXD9ihiiluzUZRZMGt6Qk0RDu4ZNHe-metaSU1HXzc1MjIuanBlZw==-.jpg',
        room: {
          id: 'c1000000-0000-4000-8000-000000000013',
          code: 'RM-PIK2-2',
          name: 'Private',
          capacityBed: 2,
        },
      },
    ],
  },
];

async function main() {
  console.info('🚀 Memulai migrasi data Cabang & Studio dari v1 ke v2...');

  // 1. Upsert all 5 authentic v1 branches
  for (const b of v1Branches) {
    console.info(`📌 Menambahkan cabang: ${b.name} (${b.code})`);
    await db.cabang.upsert({
      where: { id: b.id },
      update: {
        code: b.code,
        name: b.name,
        address: b.address,
        supportWhatsappE164: b.supportWhatsappE164,
        timezone: b.timezone,
        active: true,
      },
      create: {
        id: b.id,
        code: b.code,
        name: b.name,
        address: b.address,
        supportWhatsappE164: b.supportWhatsappE164,
        timezone: b.timezone,
        active: true,
      },
    });

    // Upsert payment account for this branch
    console.info(`   💳 Rekening: ${b.bankAccount.bankName} - ${b.bankAccount.accountNumber} (${b.bankAccount.accountHolder})`);
    const existingAccount = await db.rekeningPembayaran.findFirst({
      where: { branchId: b.id, accountNumber: b.bankAccount.accountNumber },
    });

    if (existingAccount) {
      await db.rekeningPembayaran.update({
        where: { id: existingAccount.id },
        data: {
          bankName: b.bankAccount.bankName,
          accountHolder: b.bankAccount.accountHolder,
          active: true,
        },
      });
    } else {
      await db.rekeningPembayaran.create({
        data: {
          branchId: b.id,
          bankName: b.bankAccount.bankName,
          accountNumber: b.bankAccount.accountNumber,
          accountHolder: b.bankAccount.accountHolder,
          active: true,
        },
      });
    }

    // Upsert all studios & rooms for this branch
    for (const s of b.studios) {
      console.info(`   🏢 Studio: ${s.name} (${s.code})`);
      const studio = await db.studio.upsert({
        where: { id: s.id },
        update: {
          code: s.code,
          name: s.name,
          description: s.equipment ? `Equipment: ${s.equipment}` : null,
          active: true,
        },
        create: {
          id: s.id,
          branchId: b.id,
          code: s.code,
          name: s.name,
          description: s.equipment ? `Equipment: ${s.equipment}` : null,
          active: true,
        },
      });

      console.info(`      🛏️ Ruangan: ${s.room.name} (${s.room.code}) - Kapasitas: ${s.room.capacityBed} bed`);
      await db.ruangan.upsert({
        where: { id: s.room.id },
        update: {
          code: s.room.code,
          name: s.room.name,
          capacityBed: s.room.capacityBed,
          active: true,
        },
        create: {
          id: s.room.id,
          studioId: studio.id,
          code: s.room.code,
          name: s.room.name,
          capacityBed: s.room.capacityBed,
          active: true,
        },
      });
    }
  }

  // 2. Re-point dummy branch references to Green Garden or Muara Karang
  const dummyBranchIds = [
    '6487b893-72f6-4b80-8bb8-0c2c4860eff6', // DD-JKT Senopati
    'fd3e61c6-3d75-4aa3-8623-f367fa2cfbab', // DD-BSD Foresta
  ];

  const primaryBranch = v1Branches[0]; // Green Garden
  const primaryStudio = primaryBranch.studios[0]; // Studio 1

  console.info('🔄 Mengalihkan dependensi dummy branch lama ke cabang resmi...');
  for (const dummyId of dummyBranchIds) {
    // Update Users preferredBranchId
    await db.user.updateMany({
      where: { preferredBranchId: dummyId },
      data: { preferredBranchId: primaryBranch.id },
    });

    // Update PenugasanInstruktur safely avoiding @@unique([coachId, branchId]) collision
    const dummyAssignments = await db.penugasanInstruktur.findMany({
      where: { branchId: dummyId },
    });
    for (const da of dummyAssignments) {
      const exists = await db.penugasanInstruktur.findUnique({
        where: { coachId_branchId: { coachId: da.coachId, branchId: primaryBranch.id } },
      });
      if (exists) {
        await db.penugasanInstruktur.delete({ where: { id: da.id } });
      } else {
        await db.penugasanInstruktur.update({
          where: { id: da.id },
          data: { branchId: primaryBranch.id },
        });
      }
    }

    // Update Pembelian
    await db.pembelian.updateMany({
      where: { branchId: dummyId },
      data: { branchId: primaryBranch.id },
    });

    // Update SlotKelas (and their studio/room)
    await db.slotKelas.updateMany({
      where: { branchId: dummyId },
      data: {
        branchId: primaryBranch.id,
        studioId: primaryStudio.id,
        roomId: primaryStudio.room.id,
      },
    });

    // Delete dummy payment accounts
    await db.rekeningPembayaran.deleteMany({
      where: { branchId: dummyId },
    });

    // Delete dummy rooms in dummy studios
    const dummyStudios = await db.studio.findMany({ where: { branchId: dummyId } });
    for (const ds of dummyStudios) {
      await db.ruangan.deleteMany({ where: { studioId: ds.id } });
    }

    // Delete dummy studios
    await db.studio.deleteMany({
      where: { branchId: dummyId },
    });

    // Delete dummy branch
    await db.cabang.deleteMany({
      where: { id: dummyId },
    });
  }

  // Also clean up any orphan dummy studio IDs if any
  const dummyStudioIds = [
    '00000000-0000-4000-8000-000000000010',
    '00000000-0000-4000-8000-000000000011',
    '00000000-0000-4000-8000-000000000020',
  ];
  for (const dsId of dummyStudioIds) {
    await db.ruangan.deleteMany({ where: { studioId: dsId } });
    await db.studio.deleteMany({ where: { id: dsId } });
  }

  console.info('✅ Migrasi cabang v1 ke v2 selesai dengan sukses!');
  const finalBranches = await db.cabang.findMany({
    include: {
      studios: { include: { rooms: true } },
      paymentAccounts: true,
    },
  });

  console.info(`📊 Total Cabang Aktif Sekarang: ${finalBranches.length}`);
  for (const b of finalBranches) {
    console.info(` - ${b.name} (${b.code}): ${b.studios.length} studios, ${b.paymentAccounts.length} rekening`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat migrasi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

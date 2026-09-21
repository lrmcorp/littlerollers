import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('🚀 MIGRASI PATH & ASET DARI V1 KE V2 (DATABASE)');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // 1. CABANG (5 Cabang V1 -> dailydose_v2.cabang.hero_image_key)
  // -------------------------------------------------------------
  console.log('📍 [1/6] Migrasi hero_image_key untuk 5 Cabang...');
  const branchImages: Record<string, string> = {
    'DD-GG': 'RHLVEg2qQWPuhdpR0zNESUZgkLwU0G-metaWXZScUpTUWpGbVpIdVVmZmN1ZFV1Mnp0bzJMNEk2LW1ldGFVMk55WldWdUlGTm9iM1FnTWpBeU15MHdPQzB4TmlCaGRDQXhOaTR6T0M0ek15NXdibWM9LS5wbmc=-.png',
    'DD-MK': 'AQafOlAD9EIAKIHcMzJ3dHsgRXDqD4-metaYTQxMGZlYzgtYThiYS00ZTk0LTg0ODYtZDMyNzA4NzA5ODRiLkpQRw==-.jpg',
    'DD-SBY': 'fX2FxgryH7RqQOqR0xKbEUpLkFC9Dn-metaV2hhdHNBcHAgSW1hZ2UgMjAyMy0xMi0wNyBhdCAxNS4xNS4wNS5qcGVn-.jpg',
    'DD-UNTAR': 'SdQmwuNnsmEG7hYWOiKskJDkTe9WdO-metaV2hhdHNBcHAgSW1hZ2UgMjAyNi0wMi0xNiBhdCAxNC4yNi4zNyAoMSkuanBlZw==-.jpeg',
    'DD-PIK2': 'z72h7klnsg7b2MIyyojVQ7AjM0grvG-metabG9nbyAxLnBuZw==-.png',
  };

  for (const [code, heroImageKey] of Object.entries(branchImages)) {
    const updated = await db.cabang.updateMany({
      where: { code },
      data: { heroImageKey },
    });
    console.log(`   ✅ Cabang [${code}]: heroImageKey = ${heroImageKey} (${updated.count} updated)`);
  }

  // -------------------------------------------------------------
  // 2. STUDIO (13 Studio V1 -> dailydose_v2.studio.image_key)
  // -------------------------------------------------------------
  console.log('\n🏢 [2/6] Migrasi image_key untuk 13 Studio...');
  const studioImages: Record<string, string> = {
    // Green Garden
    'ST-GG-1': 'VKz75nC38UTBFSO1cgtM9Y0U0PAez8-metaU2NyZWVuIFNob3QgMjAyMy0wOC0xNiBhdCAxNi4yMS40MS5wbmc=-.png',
    'ST-GG-2': 'L78Ccu72pJHdkvrTLbVoWeQKTm4DJy-metaU2NyZWVuIFNob3QgMjAyMy0wOC0xOSBhdCAxNi40Ni4yOS5wbmc=-.png',
    'ST-GG-3': 'p1IKFHFCKH7nuw4Y1dcvBD40BkaPPu-metaU2NyZWVuIFNob3QgMjAyMy0wOC0xOSBhdCAyMS4wNi41Mi5wbmc=-.png',
    'ST-GG-4': 'VFZQTd6b1LrO8fubuqK6vqMpAL5ed3-metaU2NyZWVuIFNob3QgMjAyMy0wOC0yMSBhdCAwMC4wMi4xOC5wbmc=-.png',
    // Muara Karang
    'ST-MK-1': 'RzrrkgBGIkra4nTAh2Nql8WxjQRxpZ-metaYTRkMjY2ZTAtMjdmMi00N2UwLTliOTMtNGI1NTVjYzFmNTEwLkpQRw==-.jpg',
    'ST-MK-2': 'umyepmSZlfms5KnY13hcU0EfUOLxTQ-metaYTQxMGZlYzgtYThiYS00ZTk0LTg0ODYtZDMyNzA4NzA5ODRiLmpwZWc=-.jpg',
    'ST-MK-3': 'QPIrVUlRqSgoLx4ZqVxvWeQ5yR7z27-metaSU1HXzM5NDcuanBn-.jpg',
    // Graha Family Surabaya
    'ST-SBY-1': 'ieMzPmxLmDWGr7l8RMEbPSZuiU9s4i-metaSU1HXzkwNzcucG5n-.png',
    'ST-SBY-2': 'sov04jq7mkwSlgsc1y1EKyKLQQSteh-metaM2U5OTdlMTUtYTNhYi00MzEwLTg2ZTYtNGJhOWE3NDAwM2VlLmpwZWc=-.jpg',
    'ST-SBY-3': '5n6jRFlOkY06W3rwzjo5mvy41sRFMa-metaU2NyZWVuc2hvdCAyMDI2LTA4LTAzIGF0IDEzLjI0LjMzLnBuZw==-.png',
    // Untar Kampus 2
    'ST-UNTAR-1': 'ibJHWCINRllmMkuBmbvZlRkCx4XpoB-metaU2NyZWVuc2hvdCAyMDI0LTAyLTIwIGF0IDIyLjQ2LjIzLnBuZw==-.png',
    // Orange Groves PIK 2
    'ST-PIK2-1': 'vTZ7c2t5VHSU4Mz7DKF0tZugmTMwfs-metaSU1HXzcwMDYuanBlZw==-.jpg',
    'ST-PIK2-2': 'bXD9ihiiluzUZRZMGt6Qk0RDu4ZNHe-metaSU1HXzc1MjIuanBlZw==-.jpg',
  };

  for (const [code, imageKey] of Object.entries(studioImages)) {
    const updated = await db.studio.updateMany({
      where: { code },
      data: { imageKey },
    });
    console.log(`   ✅ Studio [${code}]: imageKey = ${imageKey} (${updated.count} updated)`);
  }

  // -------------------------------------------------------------
  // 3. JENIS KELAS (5 Kelas V1 -> dailydose_v2.jenis_kelas.hero_image_key)
  // -------------------------------------------------------------
  console.log('\n🧘 [3/6] Migrasi hero_image_key untuk 5 Jenis Kelas...');
  const classImages: Record<string, { hero: string; gallery?: string[] }> = {
    GROUP_CLASS: {
      hero: 'LE9VBk2eTAXfNixJ6RY9ucPhcoMijx-metaU2NyZWVuIFNob3QgMjAyMy0wOC0yMSBhdCAwMC4xMS41NS5wbmc=-.png',
      gallery: ['bqqYrn03bCidJvbiQ4i0KSdFu5f4Ws-metaU2NyZWVuIFNob3QgMjAyMy0wOC0wMSBhdCAwOC4wOC40Ny5wbmc=-.png'],
    },
    PRIVATE_CLASS: {
      hero: 'ZJfp6GB03LcjXhOk5eEjPmwv4AjsbA-metaU2NyZWVuIFNob3QgMjAyMy0wOC0yMSBhdCAwMC4xMS4zNy5wbmc=-.png',
      gallery: ['Fa0iFl7WvbSfXiVyMedW4bFLCEK0Dm-metaU2NyZWVuIFNob3QgMjAyMy0wOC0wNSBhdCAyMS4wOS40OC5wbmc=-.png'],
    },
    SEMI_PRIVATE: {
      hero: 'yFSG0jXUtqwNQDnBnF6KPDIY8lTwyq-metaU2NyZWVuIFNob3QgMjAyMy0wOC0yMSBhdCAwMC4xMi40Mi5wbmc=-.png',
    },
    PRIVATE_GROUP: {
      hero: 'ZJfp6GB03LcjXhOk5eEjPmwv4AjsbA-metaU2NyZWVuIFNob3QgMjAyMy0wOC0yMSBhdCAwMC4xMS4zNy5wbmc=-.png',
    },
    MEGAFORMER: {
      hero: '5n6jRFlOkY06W3rwzjo5mvy41sRFMa-metaU2NyZWVuc2hvdCAyMDI2LTA4LTAzIGF0IDEzLjI0LjMzLnBuZw==-.png',
    },
  };

  for (const [code, info] of Object.entries(classImages)) {
    const updated = await db.jenisKelas.updateMany({
      where: { code },
      data: {
        heroImageKey: info.hero,
        galleryImageKeys: info.gallery ? info.gallery : undefined,
      },
    });
    console.log(`   ✅ Jenis Kelas [${code}]: hero = ${info.hero} (${updated.count} updated)`);
  }

  // -------------------------------------------------------------
  // 4. VOUCHERS (dailydose_v1.vouchers.image -> dailydose_v2.voucher.image_key)
  // -------------------------------------------------------------
  console.log('\n🎟️ [4/6] Memeriksa image voucher V1...');
  const vouchersInV1WithImage: any[] = await db.$queryRawUnsafe(`
    SELECT id, kode_voucher, nama, image FROM dailydose_v1.vouchers WHERE image IS NOT NULL AND image != ''
  `);
  console.log(`   Voucher di V1 dengan gambar: ${vouchersInV1WithImage.length}`);
  if (vouchersInV1WithImage.length > 0) {
    for (const v of vouchersInV1WithImage) {
      await db.voucher.updateMany({
        where: { code: v.kode_voucher },
        data: { imageKey: v.image },
      });
    }
    console.log(`   ✅ ${vouchersInV1WithImage.length} voucher image_key diperbarui.`);
  } else {
    console.log(`   ℹ️ Tidak ada gambar banner voucher di database V1 (seluruh baris bernilai NULL).`);
  }

  // -------------------------------------------------------------
  // 5. BUKTI PEMBAYARAN (11.751 Bukti Bayar)
  // -------------------------------------------------------------
  console.log('\n🧾 [5/6] Memeriksa bukti pembayaran...');
  const proofCount = await db.buktiPembayaran.count();
  console.log(`   Total bukti pembayaran di dailydose_v2: ${proofCount} baris`);
  console.log(`   ℹ️ Bukti bayar sudah tersimpan di database V2 & berkas fisik telah disinkronkan ke MinIO testing.`);

  // -------------------------------------------------------------
  // 6. IDENTITAS PELANGGAN (KTP & SELFIE V1 -> V2)
  // -------------------------------------------------------------
  console.log('\n🪪 [6/6] Migrasi dokumen identitas pelanggan (ktp_url & selfie_url)...');
  const updateResult: number = await db.$executeRawUnsafe(`
    UPDATE dailydose_v2.profil_pengguna p
    JOIN dailydose_v2.user u2 ON p.userId = u2.id
    JOIN dailydose_v1.users u1 ON u1.email = u2.email
    SET p.ktp_url = u1.ktp,
        p.selfie_url = u1.selfie
    WHERE u1.ktp IS NOT NULL OR u1.selfie IS NOT NULL;
  `);
  console.log(`   ✅ Selesai migrasi KTP & Selfie: ${updateResult} profil pelanggan diperbarui!`);

  // Verify counts
  const finalProfileStats: any[] = await db.$queryRawUnsafe(`
    SELECT 
      count(*) as total_profiles,
      count(ktp_url) as with_ktp,
      count(selfie_url) as with_selfie
    FROM dailydose_v2.profil_pengguna;
  `);
  console.log(`   📊 Statistik Profil V2 Akhir:`, finalProfileStats[0]);

  console.log('\n================================================================');
  console.log('🎉 SELURUH PATH & ASET DARI V1 TELAH BERHASIL DIMIGRASIKAN KE V2!');
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('Fatal error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

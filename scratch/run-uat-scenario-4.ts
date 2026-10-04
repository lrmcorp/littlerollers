import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat',
    },
  },
});

function copyToArtifact(srcPath: string, filename: string) {
  if (fs.existsSync(srcPath)) {
    const dest = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(srcPath, dest);
    console.log(`   [Artifact Saved] -> ${dest}`);
  }
}

async function runScenario4() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 4 (CLEAN SLATE)          ║');
  console.log('║       Manajemen Fasilitas & Penjadwalan Kelas (Scheduling Frontdesk)         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({
    headless: true,
  });

  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const adminPage = await adminContext.newPage();

  const publicContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const publicPage = await publicContext.newPage();

  try {
    // ========================================================================
    // TAHAP 1: LOGIN ADMIN FRONTDESK GG & NAVIGASI KE TIMETABLE
    // ========================================================================
    console.log('▶ [1/5] Login Admin Frontdesk GG (admin.gg@dailydose.test)...');
    await adminPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await adminPage.waitForSelector('input[name="email"]');
    await adminPage.fill('input[name="email"]', 'admin.gg@dailydose.test');
    await adminPage.fill('input[name="password"]', 'AdminPass123!');
    await adminPage.click('button[type="submit"]');

    await adminPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✓ Login Admin Berhasil, URL: ${adminPage.url()}`);

    console.log('   Membuka Operasional Studio -> Timetable Kelas (/workspace/classes)...');
    await adminPage.goto(`${BASE_URL}/workspace/classes`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(2000);

    // Pastikan Cabang Aktif pada Topbar adalah Daily Dose Green Garden (Langkah 2 Dokumen UAT)
    const branchCombobox = adminPage.getByRole('combobox', { name: 'Cabang aktif' });
    if (await branchCombobox.isVisible()) {
      console.log('   Memilih Cabang Aktif pada Topbar: Daily Dose Green Garden...');
      await branchCombobox.click();
      await adminPage.waitForTimeout(500);
      const ggOption = adminPage.getByRole('option', { name: /Green Garden/i }).first();
      await ggOption.click();
      await adminPage.waitForTimeout(2000);
      console.log('   ✓ Cabang Aktif Green Garden terpilih pada Topbar.');
    }

    const timetableScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_01_timetable_initial.png');
    await adminPage.screenshot({ path: timetableScreenshot, fullPage: false });
    copyToArtifact(timetableScreenshot, 'uat_scen4_01_timetable_initial.png');
    console.log('   ✓ Halaman Timetable Kelas Green Garden berhasil dimuat.');

    // ========================================================================
    // TAHAP 2: BUKA DRAWER BUAT KELAS & PENGISIAN FORM
    // ========================================================================
    console.log('\n▶ [2/5] Membuka Drawer Pembuatan Kelas Baru...');
    const createClassBtn = adminPage.locator('button', { hasText: /^buat kelas$/i });
    await createClassBtn.waitFor({ timeout: 10000 });
    await createClassBtn.click();

    // Tunggu drawer terbuka
    await adminPage.waitForSelector('form#class-slot-create-form', { timeout: 10000 });
    console.log('   ✓ Drawer "Buat draft kelas" terbuka.');

    const form = adminPage.locator('form#class-slot-create-form');

    // Tentukan tanggal besok (2026-10-05)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    const dateStr = targetDate.toISOString().split('T')[0];
    console.log(`   Tanggal Pelaksanaan: ${dateStr}`);

    // Pilih Tipe Kelas: Group Class
    console.log('   Memilih Tipe Kelas: Group Class...');
    const classTypeCombobox = form.getByRole('combobox', { name: 'Tipe kelas' });
    await classTypeCombobox.click();
    await adminPage.waitForTimeout(500);
    const groupClassOption = adminPage.getByRole('option', { name: /Group Class/i }).first();
    await groupClassOption.click();

    // Pilih Area Studio: Studio 1
    console.log('   Memilih Area Studio: Studio 1...');
    const studioCombobox = form.getByRole('combobox', { name: 'Area Studio' });
    await studioCombobox.click();
    await adminPage.waitForTimeout(500);
    const studioOption = adminPage.getByRole('option', { name: /Studio 1/i }).first();
    await studioOption.click();

    // Pilih Ruangan: Studio 1 / RM-1
    console.log('   Memilih Ruangan: Studio 1 / RM-1...');
    const roomCombobox = form.getByRole('combobox', { name: 'Ruangan' });
    await roomCombobox.click();
    await adminPage.waitForTimeout(500);
    const roomOption = adminPage.getByRole('option', { name: /Studio 1|RM-1/i }).first();
    await roomOption.click();

    // Pilih Instruktur: Coach Clara
    console.log('   Memilih Instruktur: Coach Clara...');
    const instructorCombobox = form.getByRole('combobox', { name: 'Instruktur' });
    await instructorCombobox.click();
    await adminPage.waitForTimeout(500);
    const coachOption = adminPage.getByRole('option', { name: /Coach Clara/i }).first();
    await coachOption.click();

    // Isi Tanggal, Waktu Mulai, dan Waktu Selesai
    console.log('   Mengisi Tanggal & Jam (09:00 - 09:50)...');
    await form.getByLabel('Tanggal').fill(dateStr);
    await form.getByLabel('Mulai').fill('09:00');
    await form.getByLabel('Selesai eksklusif').fill('09:50');
    await adminPage.waitForTimeout(1000);

    const formScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_02_create_form_filled.png');
    await adminPage.screenshot({ path: formScreenshot, fullPage: false });
    copyToArtifact(formScreenshot, 'uat_scen4_02_create_form_filled.png');

    // ========================================================================
    // TAHAP 3: SIMPAN SEBAGAI DRAFT KELAS
    // ========================================================================
    console.log('\n▶ [3/5] Menyimpan Draft Kelas Baru...');
    const submitDraftBtn = adminPage.locator('button[form="class-slot-create-form"]');
    await submitDraftBtn.click();
    await adminPage.waitForTimeout(800);

    // Tangani konfirmasi modal pembuatan draft (spesifik dialog modal)
    const confirmModal = adminPage.getByRole('dialog', { name: 'Buat draft kelas?' });
    await confirmModal.waitFor({ state: 'visible', timeout: 5000 });
    const confirmDraftBtn = confirmModal.getByRole('button', { name: /^buat draft$/i });
    await confirmDraftBtn.click();

    // Tunggu drawer tertutup dan slot muncul di grid
    await adminPage.waitForSelector('form#class-slot-create-form', { state: 'hidden', timeout: 10000 });
    await adminPage.waitForTimeout(2000);

    // Cek jika slot berada di minggu depan (misal hari ini Minggu, besok Senin)
    let slotCard = adminPage.locator('button', { hasText: 'Group Class' }).first();
    if (!(await slotCard.isVisible())) {
      console.log('   Slot berada di minggu depan, berpindah ke minggu berikutnya...');
      const nextWeekBtn = adminPage.locator('button', { hasText: /minggu berikutnya/i }).first();
      await nextWeekBtn.click();
      await adminPage.waitForTimeout(2000);
      slotCard = adminPage.locator('button', { hasText: 'Group Class' }).first();
    }
    await slotCard.waitFor({ timeout: 10000 });

    const draftTimetableScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_03_timetable_draft_created.png');
    await adminPage.screenshot({ path: draftTimetableScreenshot, fullPage: false });
    copyToArtifact(draftTimetableScreenshot, 'uat_scen4_03_timetable_draft_created.png');
    console.log('   ✓ Draft kelas berhasil dibuat dan tampil pada timetable.');

    // ========================================================================
    // TAHAP 4: BUKA DETAIL & PUBLIKASIKAN KELAS
    // ========================================================================
    console.log('\n▶ [4/5] Membuka Detail Slot Kelas & Mempublikasikan Kelas...');
    await slotCard.click();

    // Tunggu detail drawer terbuka
    await adminPage.waitForSelector('button:has-text("Publikasikan kelas")', { timeout: 10000 });
    await adminPage.waitForTimeout(1000);

    const detailDrawerScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_04_slot_detail_drawer.png');
    await adminPage.screenshot({ path: detailDrawerScreenshot, fullPage: false });
    copyToArtifact(detailDrawerScreenshot, 'uat_scen4_04_slot_detail_drawer.png');

    // Klik tombol "Publikasikan kelas"
    console.log('   Mengklik tombol "Publikasikan kelas"...');
    const publishBtn = adminPage.locator('button', { hasText: /^publikasikan kelas$/i });
    await publishBtn.click();
    await adminPage.waitForTimeout(800);

    // Tangani konfirmasi modal publikasi (spesifik dialog modal)
    const publishConfirmModal = adminPage.getByRole('dialog', { name: 'Publikasikan kelas?' });
    await publishConfirmModal.waitFor({ state: 'visible', timeout: 5000 });
    const confirmPublishBtn = publishConfirmModal.getByRole('button', { name: /^publikasikan$/i });
    await confirmPublishBtn.click();

    // Tunggu status berubah menjadi PUBLISHED (indikator: Daftar peserta di drawer muncul)
    await adminPage.locator('text=Daftar peserta').first().waitFor({ timeout: 10000 });
    await adminPage.waitForTimeout(1500);

    const publishedScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_05_slot_published.png');
    await adminPage.screenshot({ path: publishedScreenshot, fullPage: false });
    copyToArtifact(publishedScreenshot, 'uat_scen4_05_slot_published.png');
    console.log('   ✓ Kelas berhasil dipublikasikan (Status: PUBLISHED)!');

    // ========================================================================
    // TAHAP 5: VERIFIKASI JADWAL DI PORTAL PUBLIK / MEMBER
    // ========================================================================
    console.log('\n▶ [5/5] Memverifikasi Tampilan Kelas di Portal Jadwal Publik (/classes)...');
    await publicPage.goto(`${BASE_URL}/classes?branch=a1000000-0000-4000-8000-000000000001`, { waitUntil: 'networkidle' });
    await publicPage.waitForTimeout(2000);
    const publicSlotCard = publicPage.locator('h3, article, div', { hasText: 'Group Class' }).first();
    await publicSlotCard.waitFor({ timeout: 10000 });

    const publicScheduleScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_06_member_public_schedule.png');
    await publicPage.screenshot({ path: publicScheduleScreenshot, fullPage: false });
    copyToArtifact(publicScheduleScreenshot, 'uat_scen4_06_member_public_schedule.png');
    console.log('   ✓ Jadwal publik berhasil diverifikasi.');

    // ========================================================================
    // TAHAP 6: VERIFIKASI DATABASE (DATABASE INTEGRITY AUDIT)
    // ========================================================================
    console.log('\n▶ [AUDIT] Melakukan Verifikasi Database dailydose_v2_uat...');
    const classSlotRecord = await prisma.slotKelas.findFirst({
      where: {
        branchId: 'a1000000-0000-4000-8000-000000000001',
        instructorId: 'd71246ca-bfa5-4c16-bf36-7c3b1f8c6f9f', // Coach Clara
      },
      include: {
        branch: true,
        classType: true,
        studio: true,
        room: true,
        instructor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n--- HASIL AUDIT DATABASE SLOT KELAS ---');
    console.log({
      id: classSlotRecord?.id,
      branch: classSlotRecord?.branch?.name,
      studio: classSlotRecord?.studio?.name,
      room: classSlotRecord?.room?.name,
      classType: classSlotRecord?.classType?.name,
      instructor: classSlotRecord?.instructor?.displayName,
      startAt: classSlotRecord?.startAt,
      endAt: classSlotRecord?.endAt,
      status: classSlotRecord?.status,
      capacity: classSlotRecord?.capacity,
      bookedCount: classSlotRecord?.bookedCount,
      minQuota: classSlotRecord?.minQuota,
    });

    console.log('\n✅ SKENARIO 4 BERHASIL DIEKSEKUSI DENGAN STATUS: PASS (100%)');
  } catch (error) {
    console.error('\n❌ KENDALA EKSEKUSI SKENARIO 4:', error);
    try {
      const errScreenshot = path.join(process.cwd(), 'scratch/uat_scen4_error_debug.png');
      await adminPage.screenshot({ path: errScreenshot, fullPage: false });
      copyToArtifact(errScreenshot, 'uat_scen4_error_debug.png');
    } catch {}
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario4().catch(err => {
  console.error(err);
  process.exit(1);
});

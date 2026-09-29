import { chromium } from '../apps/web/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

function getBase64Image(filePath) {
  const fileData = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileData.toString('base64')}`;
}

async function generateManualBookPDF() {
  console.log('Memulai penyusunan PDF Buku Panduan Operasional...');

  const imgForm = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_01_customer_reschedule_form.png');
  const imgConfirm = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_02_customer_confirm_dialog.png');
  const imgSuccess = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_03_customer_reschedule_success.png');
  const imgCutoff = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_04_customer_cutoff_locked.png');
  const imgAdminQueue = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_05_admin_pending_queue.png');
  const imgManagerModal = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_06_manager_approval_modal.png');
  const imgManagerPosted = getBase64Image('/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/uat_07_manager_adjustment_posted.png');
  const imgReminders = getBase64Image('./scratch/reminders_workspace_page.png');
  const imgAdjustmentsPage = getBase64Image('./scratch/ledger_adjustments_page.png');

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Operasional Sistem Daily Dose Pilates v2.0</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
      @bottom-left {
        content: "Daily Dose Pilates — Buku Panduan Operasional v2.0";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover Page */
    .cover-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 20px;
      page-break-after: always;
    }

    .brand-badge {
      display: inline-block;
      background: #1e3a2f;
      color: #ffffff;
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 8px 18px;
      border-radius: 6px;
      width: fit-content;
    }

    .cover-title-area {
      margin-top: 60px;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      margin: 0 0 15px 0;
      letter-spacing: -0.02em;
    }

    .cover-subtitle {
      font-size: 14pt;
      color: #475569;
      font-weight: 500;
      margin: 0 0 25px 0;
      line-height: 1.4;
    }

    .cover-divider {
      width: 100px;
      height: 5px;
      background: #c5a880;
      margin-bottom: 25px;
      border-radius: 3px;
    }

    .cover-tags {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .cover-tag {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
      color: #334155;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #64748b;
    }

    /* Headings */
    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #1e3a2f;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 16px;
      letter-spacing: -0.01em;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e3a2f;
      margin-top: 22px;
      margin-bottom: 10px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    p {
      margin: 0 0 10px 0;
      color: #334155;
    }

    /* Table of contents */
    .toc-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .toc-table tr td {
      padding: 10px 0;
      border-bottom: 1px dashed #cbd5e1;
      font-size: 10.5pt;
    }

    .toc-title {
      font-weight: 600;
      color: #0f172a;
    }

    .toc-dots {
      color: #94a3b8;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 20px 0;
      font-size: 9pt;
    }

    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }

    table.data-table th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 700;
    }

    table.data-table tr:nth-child(even) {
      background: #fdfdfd;
    }

    /* Callout & Alerts */
    .callout {
      border-radius: 8px;
      padding: 12px 16px;
      margin: 14px 0;
      font-size: 9.5pt;
      border-left: 4px solid;
    }

    .callout-info {
      background: #f0fdf4;
      border-color: #16a34a;
      color: #166534;
    }

    .callout-warning {
      background: #fffbeb;
      border-color: #d97706;
      color: #92400e;
    }

    .callout-danger {
      background: #fef2f2;
      border-color: #dc2626;
      color: #991b1b;
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Screenshot Box */
    .screenshot-figure {
      margin: 16px 0 22px 0;
      text-align: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
    }

    .screenshot-img {
      max-width: 100%;
      height: auto;
      max-height: 380px;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      display: block;
      margin: 0 auto;
    }

    .screenshot-caption {
      margin-top: 8px;
      font-size: 8.5pt;
      color: #64748b;
      font-style: italic;
      font-weight: 500;
    }

    /* Step lists */
    ol.step-list {
      margin: 8px 0 16px 0;
      padding-left: 20px;
    }

    ol.step-list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    ol.step-list li strong {
      color: #0f172a;
    }

    /* Badge */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #e0f2fe; color: #0369a1; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-red { background: #fee2e2; color: #b91c1c; }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #0f172a;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-container">
    <div>
      <div class="brand-badge">DAILY DOSE PILATES</div>
      <div class="cover-title-area">
        <h1 class="cover-title">MANUAL BOOK &<br>PANDUAN OPERASIONAL</h1>
        <div class="cover-divider"></div>
        <p class="cover-subtitle">
          Panduan Lengkap Tata Kelola Reschedule Kelas, Penyesuaian Sesi (Dual-Control), dan Monitoring Otomasi WhatsApp
        </p>
        <div class="cover-tags">
          <span class="cover-tag">Versi Sistem: 2.0</span>
          <span class="cover-tag">Arsitektur RBAC Multi-Role</span>
          <span class="cover-tag">Audit Trail & Buku Besar Ledger</span>
          <span class="cover-tag">Dukungan Multi-Cabang</span>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <strong>Penyusun:</strong> Tim Pengembangan Platform Daily Dose Pilates<br>
        <strong>Dokumen:</strong> Panduan Staf, Admin Cabang & Manajemen Studio
      </div>
      <div style="text-align: right;">
        <strong>Tanggal Pembaruan:</strong> September 2026<br>
        <strong>Status:</strong> Terverifikasi UAT Browser Nyata (100% Passed)
      </div>
    </div>
  </div>

  <!-- ==================== DAFTAR ISI ==================== -->
  <div class="page-break">
    <h1>DAFTAR ISI</h1>
    <table class="toc-table">
      <tr>
        <td class="toc-title">1. Pendahuluan & Matriks Hak Akses Peran (RBAC)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 3</td>
      </tr>
      <tr>
        <td class="toc-title">2. Modul Reschedule (Ubah Jadwal Kelas) & Aturan H-24</td>
        <td style="text-align: right;" class="toc-dots">Halaman 4</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">2.1 Alur Reschedule Mandiri oleh Member (&ge; H-24)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 4</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">2.2 Proteksi Batas Waktu H-24 Terkunci (&lt; H-24)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 5</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">2.3 Tata Cara Reschedule Berbantuan Staf (Front Desk)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 6</td>
      </tr>
      <tr>
        <td class="toc-title">3. Modul Penyesuaian Sesi (Session Adjustment & Ledger)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 7</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">3.1 Prinsip Pemisahan Tugas (Maker-Checker / Dual Control)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 7</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">3.2 Panduan Pengajuan oleh Admin Cabang (Maker)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 8</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">3.3 Panduan Persetujuan oleh Studio Manager (Checker)</td>
        <td style="text-align: right;" class="toc-dots">Halaman 9</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">3.4 Pencatatan Mutasi Buku Besar (Session Ledger) & Audit Trail</td>
        <td style="text-align: right;" class="toc-dots">Halaman 10</td>
      </tr>
      <tr>
        <td class="toc-title">4. Modul Monitoring Otomasi WhatsApp & Paginasi Konsisten</td>
        <td style="text-align: right;" class="toc-dots">Halaman 11</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">4.1 Evaluasi Auto-Cancel Kelas H-24 & Pengiriman Batch</td>
        <td style="text-align: right;" class="toc-dots">Halaman 11</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; color: #475569;">4.2 Paginasi Data Konsisten & Riwayat Idempotensi</td>
        <td style="text-align: right;" class="toc-dots">Halaman 12</td>
      </tr>
      <tr>
        <td class="toc-title">5. Standar Operasional Prosedur (SOP) Lapangan & Troubleshooting</td>
        <td style="text-align: right;" class="toc-dots">Halaman 13</td>
      </tr>
    </table>

    <div class="callout callout-info" style="margin-top: 30px;">
      <div class="callout-title">📌 Informasi Penting untuk Staf & Manajemen</div>
      Buku panduan ini disusun berdasarkan implementasi sistem produksi Daily Dose Pilates v2.0 yang telah melewati seluruh rangkaian pengujian unit, integrasi, dan User Acceptance Testing (UAT) di browser nyata. Seluruh mekanisme penguncian kuota dan buku besar dibuat untuk menjamin nol selisih sesi (*zero session discrepancy*) dan kepatuhan audit.
    </div>
  </div>

  <!-- ==================== BAB 1 ==================== -->
  <div class="page-break">
    <h1>1. PENDAHULUAN & MATRIKS HAK AKSES PERAN (RBAC)</h1>
    <p>
      Daily Dose Pilates Studio Management Platform v2.0 mengadopsi arsitektur berbasis izin <em>Role-Based Access Control (RBAC)</em> dengan pemisahan tegas antara pengguna mandiri (pelanggan), staf operasional cabang, dan manajerial studio.
    </p>

    <h2>Matriks Peran & Wewenang Terkait Operasional</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Peran (Role)</th>
          <th>Cakupan Akses</th>
          <th>Izin Utama Terkait Reschedule & Sesi</th>
          <th>Tanggung Jawab Operasional</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>CUSTOMER / MEMBER</strong></td>
          <td>Self-service (data pribadi)</td>
          <td>
            <code>booking:self:create</code><br>
            <code>booking:self:cancel</code><br>
            <code>reschedule:self:request</code>
          </td>
          <td>Melakukan booking mandiri dan mengajukan reschedule kelas sebelum batas H-24.</td>
        </tr>
        <tr>
          <td><strong>ADMIN CABANG</strong></td>
          <td>Cabang aktif yang ditugaskan</td>
          <td>
            <code>booking:create:assisted</code><br>
            <code>booking:cancel:assisted</code><br>
            <code>reschedule:read</code><br>
            <code>reschedule:decide</code><br>
            <code>ledger:adjust:request</code>
          </td>
          <td>
            Melayani front-desk, membantu booking/pembatalan manual, dan <strong>mengajukan penyesuaian sesi darurat</strong> (Maker).
          </td>
        </tr>
        <tr>
          <td><strong>STUDIO MANAGER</strong></td>
          <td>Cabang di bawah pengawasannya</td>
          <td>
            Seluruh izin Admin, ditambah:<br>
            <code>ledger:adjust:decide</code><br>
            <code>customer-package:manage</code>
          </td>
          <td>
            Memverifikasi bukti medis/kendala dan <strong>menyetujui permohonan penyesuaian sesi</strong> (Checker).
          </td>
        </tr>
        <tr>
          <td><strong>SUPER OWNER / OWNER</strong></td>
          <td>Lintas seluruh cabang (Global)</td>
          <td>
            <code>branch:all</code><br>
            <code>ledger:adjust:decide</code><br>
            <code>finance:reconcile</code>
          </td>
          <td>Pengawasan bisnis, rekonsiliasi keuangan studio, dan audit transaksi buku besar.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-tip avoid-break">
      <div class="callout-title">💡 Tata Kelola Otoritas & Eksekusi Langsung (Direct Authority)</div>
      Untuk menjamin kelincahan operasional studio, <strong>Super Owner dan Superadmin memiliki wewenang penuh (Direct Execution)</strong> untuk menyetujui penyesuaian sesi, transaksi kasir, dan koreksi keuangan tanpa hambatan birokrasi semu, di mana seluruh tindakan tercatat permanen di <strong>Audit Trail</strong>.<br><br>
      Prinsip pemisahan tugas (<em>Maker-Checker</em>) hanya diberlakukan bagi <strong>staf cabang biasa</strong>: staf kasir/admin cabang tidak dapat memutus penyesuaian kuota sesi pelanggan secara sepihak tanpa persetujuan dari Super Owner atau Manajer.
    </div>
  </div>

  <!-- ==================== BAB 2 ==================== -->
  <div class="page-break">
    <h1>2. MODUL RESCHEDULE (UBAH JADWAL KELAS)</h1>
    <p>
      Aturan baku studio menetapkan bahwa ubah jadwal kelas hanya diperkenankan bila dilakukan <strong>minimal 24 jam sebelum jadwal kelas dimulai (&ge; H-24)</strong>. Hal ini untuk melindungi kepastian kuota instruktur dan peserta studio lainnya.
    </p>

    <h2>2.1 Alur Reschedule Mandiri oleh Member (&ge; H-24)</h2>
    <p>
      Ketika member masih berada di luar jendela H-24, member dapat memindahkan kelasnya secara instan ke jadwal lain yang sejenis tanpa memotong kuota sesi baru.
    </p>

    <ol class="step-list">
      <li>Member masuk ke akun web dan membuka halaman tiket booking di <code>/bookings/[id]</code>.</li>
      <li>Pada kartu <strong>"Perlu mengganti jadwal?"</strong>, member mengklik tombol <strong>"Ajukan reschedule"</strong>.</li>
      <li>Form modal 2-langkah akan tampil. Member memilih jadwal kelas alternatif melalui dropdown yang menampilkan kuota sisa yang valid.</li>
    </ol>

    <div class="screenshot-figure avoid-break">
      <img src="${imgForm}" class="screenshot-img" alt="Form Pemilihan Jadwal Reschedule">
      <div class="screenshot-caption">Gambar 2.1: Form Pengajuan Reschedule Mandiri dengan Validasi Sisa Kuota Kelas.</div>
    </div>

    <ol class="step-list" start="4">
      <li>Member mengklik <strong>"Tinjau permintaan"</strong>. Dialog konfirmasi keselamatan (*safety guard*) akan muncul mengonfirmasi jadwal lama dan jadwal baru.</li>
    </ol>

    <div class="screenshot-figure avoid-break">
      <img src="${imgConfirm}" class="screenshot-img" alt="Konfirmasi 2-Langkah Reschedule">
      <div class="screenshot-caption">Gambar 2.2: Dialog Konfirmasi 2-Langkah untuk Mencegah Salah Klik oleh Member.</div>
    </div>

    <ol class="step-list" start="5">
      <li>Member mengklik <strong>"Kirim permintaan"</strong>. Sistem secara otomatis memindahkan booking, mengurangi peserta slot lama, menambah peserta slot baru, dan menampilkan notifikasi sukses.</li>
    </ol>

    <div class="screenshot-figure avoid-break">
      <img src="${imgSuccess}" class="screenshot-img" alt="Notifikasi Sukses Reschedule">
      <div class="screenshot-caption">Gambar 2.3: Konfirmasi Sukses Reschedule dan Pembaruan Tiket Booking Instan.</div>
    </div>

    <div class="page-break"></div>

    <h2>2.2 Proteksi Batas Waktu H-24 Terkunci (&lt; H-24)</h2>
    <p>
      Jika jadwal kelas berjarak kurang dari 24 jam dari waktu saat ini, sistem secara deterministik mengunci jalur reschedule mandiri:
    </p>
    <ul>
      <li>Tombol <strong>"Ajukan reschedule"</strong> ditiadakan dari tampilan.</li>
      <li>Spanduk informasi tegas muncul: <code>Batas reschedule telah lewat</code>.</li>
      <li>Pesan penenang member tampil: <em>"Kursi Anda pada jadwal ini tetap aman."</em> (mencegah member mengira tiketnya hangus).</li>
      <li>Disediakan tombol tindakan <strong>"Hubungi studio"</strong> untuk eskalasi bila ada kondisi darurat medis atau kendala khusus.</li>
    </ul>

    <div class="screenshot-figure avoid-break">
      <img src="${imgCutoff}" class="screenshot-img" alt="Proteksi Batas Cutoff H-24 Terkunci">
      <div class="screenshot-caption">Gambar 2.4: Tampilan Proteksi Batas Cutoff H-24 — Form Terkunci dengan Panduan Hubungi Studio.</div>
    </div>

    <h2>2.3 Tata Cara Reschedule Berbantuan Staf (Front Desk)</h2>
    <p>
      Bila member mendatangi meja resepsionis atau menghubungi WhatsApp admin cabang:
    </p>
    <ol class="step-list">
      <li>Admin memeriksa jadwal kelas di panel staf <code>/workspace/bookings</code>.</li>
      <li>Bila jadwal masih <strong>&gt; H-24</strong>: Admin dapat membatalkan booking lama dengan pengembalian sesi otomatis, lalu membuatkan booking baru di slot yang diinginkan member.</li>
      <li>Bila jadwal sudah <strong>&le; H-24</strong>: Sistem tidak mengizinkan pembatalan/reschedule normal. Admin diarahkan untuk menggunakan prosedur <strong>Penyesuaian Sesi (Bab 3)</strong> jika kasus tersebut disetujui manajemen studio.</li>
    </ol>
  </div>

  <!-- ==================== BAB 3 ==================== -->
  <div class="page-break">
    <h1>3. MODUL PENYESUAIAN SESI (SESSION ADJUSTMENT & LEDGER)</h1>
    <p>
      Modul Penyesuaian Sesi (<code>/ledger/adjustments</code>) dirancang khusus untuk menangani situasi di mana saldo kuota pelanggan perlu disesuaikan di luar alur booking normal, seperti kompensasi pembatalan sepihak, salah absensi, atau izin sakit mendadak dengan surat dokter.
    </p>

    <h2>3.1 Prinsip Pemisahan Tugas (Maker-Checker)</h2>
    <p>
      Setiap perubahan sesi melewati siklus 2 mata rantai:
    </p>
    <div style="display: flex; gap: 15px; margin: 15px 0;" class="avoid-break">
      <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
        <span class="badge badge-blue">TAHAP 1: PENGAJUAN (MAKER)</span>
        <h3 style="margin-top: 8px;">Admin Cabang</h3>
        <p style="font-size: 8.5pt; color: #475569;">
          Menerima bukti dokumen dari member, memeriksa paket pelanggan, dan mendaftarkan permohonan (kuota & reason) ke sistem. Status awal: <strong>PENDING</strong>.
        </p>
      </div>
      <div style="flex: 1; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px;">
        <span class="badge badge-green">TAHAP 2: PERSETUJUAN (CHECKER)</span>
        <h3 style="margin-top: 8px;">Studio Manager</h3>
        <p style="font-size: 8.5pt; color: #475569;">
          Meneliti keabsahan bukti dan alasan audit. Memutuskan Setujui (Approve) atau Tolak (Reject). Saldo kuota bertambah secara otomatis ke buku besar saat disetujui. Status akhir: <strong>POSTED</strong>.
        </p>
      </div>
    </div>

    <h2>3.2 Panduan Pengajuan oleh Admin Cabang (Maker)</h2>
    <ol class="step-list">
      <li>Login sebagai Admin Cabang dan buka menu <strong>Penyesuaian Sesi</strong> di <code>/ledger/adjustments</code>.</li>
      <li>Klik tombol <strong>"Ajukan penyesuaian"</strong>.</li>
      <li>Cari pelanggan berdasarkan nama/nomor HP, lalu pilih paket pelanggan aktif yang bersangkutan.</li>
      <li>Masukkan jumlah sesi yang disesuaikan (misal <code>+1</code> untuk kompensasi pembatalan darurat).</li>
      <li>Pilih kode alasan resmi (misal: <code>PACKAGE_COMPENSATION</code>) dan sertakan keterangan kronologi.</li>
      <li>Kirim pengajuan. Permohonan akan masuk ke antrean dengan status <strong>Menunggu keputusan (PENDING)</strong>.</li>
    </ol>

    <div class="screenshot-figure avoid-break">
      <img src="${imgAdminQueue}" class="screenshot-img" alt="Antrean Penyesuaian Sesi Status PENDING">
      <div class="screenshot-caption">Gambar 3.1: Antrean Penyesuaian Sesi di Layar Admin Cabang — Menunggu Keputusan Manager.</div>
    </div>

    <div class="page-break"></div>

    <h2>3.3 Panduan Persetujuan oleh Studio Manager (Checker)</h2>
    <ol class="step-list">
      <li>Login sebagai Studio Manager dan buka halaman <code>/ledger/adjustments</code>.</li>
      <li>Pada tab <strong>Menunggu persetujuan</strong>, pilih item permohonan yang diajukan oleh staf cabang.</li>
      <li>Klik tombol <strong>"Setujui"</strong> untuk membuka modal verifikasi keputusan.</li>
      <li>Pilih kode verifikasi <code>CORRECTION_VERIFIED</code> dan cantumkan catatan audit resmi (misal: <em>"Disetujui berdasarkan surat dokter resmi"</em>).</li>
      <li>Klik <strong>"Konfirmasi Persetujuan"</strong>.</li>
    </ol>

    <div class="screenshot-figure avoid-break">
      <img src="${imgManagerModal}" class="screenshot-img" alt="Modal Persetujuan Penyesuaian Sesi Manager">
      <div class="screenshot-caption">Gambar 3.2: Modal Verifikasi & Persetujuan Penyesuaian Sesi oleh Studio Manager.</div>
    </div>

    <h2>3.4 Pencatatan Mutasi Buku Besar (Session Ledger) & Audit Trail</h2>
    <p>
      Saat disetujui oleh Manager, sistem mengeksekusi transaksi tingkat database (Serializable Isolation):
    </p>
    <ul>
      <li>Status permohonan berubah menjadi <strong>POSTED</strong> dan berpindah ke tab Riwayat.</li>
      <li>Entri mutasi baru bertipe <code>ADJUST_MANUAL</code> dicatat pada tabel <code>SessionLedger</code>.</li>
      <li>Saldo sesi pada <code>PaketPelanggan</code> langsung bertambah secara *atomic* dan siap digunakan pelanggan untuk memesan kelas kembali.</li>
    </ul>

    <div class="screenshot-figure avoid-break">
      <img src="${imgManagerPosted}" class="screenshot-img" alt="Riwayat Penyesuaian Sesi Berstatus POSTED">
      <div class="screenshot-caption">Gambar 3.3: Riwayat Penyesuaian Sesi Berstatus POSTED — Saldo Kuota Member Berhasil Ditambahkan.</div>
    </div>
  </div>

  <!-- ==================== BAB 4 ==================== -->
  <div class="page-break">
    <h1>4. MODUL MONITORING OTOMASI WHATSAPP & PAGINASI KONSISTEN</h1>
    <p>
      Halaman <strong>Otomasi & Log Pengingat WhatsApp</strong> (<code>/workspace/reminders</code>) digunakan oleh manajemen dan staf untuk memantau siklus perpesanan otomatis, kepatuhan batas pembatalan H-24, dan audit log anti-duplikasi (*idempotency*).
    </p>

    <h2>4.1 Fitur Monitoring & Eksekusi Batch</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Komponen</th>
          <th>Fungsi Operasional</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>4 StatCards Ringkasan</strong></td>
          <td>Memantau jumlah pesan terkirim, pesan gagal, waktu pengiriman terakhir, dan status proteksi idempotensi.</td>
        </tr>
        <tr>
          <td><strong>Auto-Cancel H-24</strong></td>
          <td>Mengevaluasi seluruh kelas pada batas H-24. Kelas dengan peserta di bawah kuota minimum dibatalkan otomatis dan mengirim notifikasi pembatalan ke seluruh peserta dan instruktur.</td>
        </tr>
        <tr>
          <td><strong>Reminder Batch WhatsApp</strong></td>
          <td>Menjalankan antrean pengingat berkala: H-7, H-3, H-1 masa kedaluwarsa paket, follow-up paket expired (max 5x), digest staf 3 jam, dan rekap owner 3 hari.</td>
        </tr>
      </tbody>
    </table>

    <h2>4.2 Paginasi Konsisten & Filter Audit Log</h2>
    <p>
      Daftar riwayat pesan WhatsApp telah dilengkapi sistem paginasi standar studio (20 baris per halaman):
    </p>
    <ul>
      <li><strong>Filter Real-Time</strong>: Pencarian nomor HP penerima, pemilihan tipe pengingat (Auto-cancel, H-7, H-3, dll.), dan status pengiriman (SENT / FAILED).</li>
      <li><strong>Paginasi Fleksibel</strong>: Navigasi tombol *Sebelumnya*, nomor halaman dinamis (1, 2, 3...), dan *Berikutnya*.</li>
      <li><strong>Penomoran Baris Presisi</strong>: Baris nomor otomatis berlanjut (halaman 1: nomor 1–20, halaman 2: nomor 21–40, dst.) via <code>rowNumberOffset</code>.</li>
    </ul>

    <div class="screenshot-figure avoid-break">
      <img src="${imgReminders}" class="screenshot-img" alt="Halaman Otomasi WhatsApp dengan Paginasi Konsisten">
      <div class="screenshot-caption">Gambar 4.1: Tampilan Halaman Otomasi WhatsApp dengan Paginasi Data Konsisten dan Kartu Ringkasan.</div>
    </div>
  </div>

  <!-- ==================== BAB 5 ==================== -->
  <div class="page-break">
    <h1>5. STANDAR OPERASIONAL PROSEDUR (SOP) & PANDUAN TROUBLESHOOTING</h1>

    <h2>SOP Skenario Lapangan</h2>

    <h3>Kasus 1: Member Mendadak Sakit / Emergency Kurang dari 24 Jam (&lt; H-24)</h3>
    <ol class="step-list">
      <li>Member menghubungi studio mengabarkan tidak dapat hadir karena sakit mendadak.</li>
      <li>Staf menjelaskan aturan bahwa sistem mengunci reschedule mandiri karena &lt; H-24 demi kepastian instruktur.</li>
      <li>Staf meminta member mengirimkan foto surat keterangan dokter resmi via WhatsApp.</li>
      <li>Admin Cabang membuka menu <code>/ledger/adjustments</code>, memilih paket member, memasukkan penyesuaian <code>+1</code> sesi, memilih alasan <code>PACKAGE_COMPENSATION</code>, dan mencatat nomor surat dokter.</li>
      <li>Studio Manager memeriksa dokumen di dashboard dan menyetujui (Approve). Sesi kuota kembali ke saldo member.</li>
    </ol>

    <h3>Kasus 2: Salah Absensi (Member Hadir Tapi Dicatat Tidak Hadir)</h3>
    <ol class="step-list">
      <li>Member komplain bahwa status booking tercatat NO_SHOW padahal hadir di kelas.</li>
      <li>Admin mengonfirmasi rekaman absensi fisik atau instruktur kelas.</li>
      <li>Admin Cabang mengajukan penyesuaian sesi dengan kode <code>ATTENDANCE_CORRECTION</code>.</li>
      <li>Manager menyetujui pengajuan, saldo sesi dikoreksi, dan status audit tercatat rapi.</li>
    </ol>

    <h2>Tabel Resolusi Kode Error Sistem</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Kode Galat (Error)</th>
          <th>Arti & Penyebab</th>
          <th>Tindakan Pemecahan Masalah</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>RESCHEDULE_CUTOFF_PASSED</code></td>
          <td>Jadwal kelas berjarak &le; 24 jam sebelum mulai.</td>
          <td>Jadwal terkunci. Jika force majeure, eskalasikan via Penyesuaian Sesi.</td>
        </tr>
        <tr>
          <td><code>SEPARATION_OF_DUTIES</code></td>
          <td>Staf biasa mencoba memutus permohonan yang diajukannya sendiri.</td>
          <td>Permohonan staf cabang wajib ditinjau dan diputus oleh Super Owner / Manajer. (Super Owner &amp; Superadmin bebas memutus langsung).</td>
        </tr>
        <tr>
          <td><code>ADJUSTMENT_ALREADY_PENDING</code></td>
          <td>Masih ada permohonan PENDING aktif pada paket ini.</td>
          <td>Selesaikan atau tolak terlebih dahulu permohonan yang sedang berjalan.</td>
        </tr>
        <tr>
          <td><code>INSUFFICIENT_SESSION_BALANCE</code></td>
          <td>Pengurangan sesi melebihi kuota sisa yang belum dipesan.</td>
          <td>Periksa kursi yang sedang di-booking oleh member sebelum mengurangi kuota.</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 8.5pt;">
      &copy; 2026 Daily Dose Pilates. Dokumen rahasia untuk keperluan internal operasional studio dan panduan staf.
    </div>
  </div>

</body>
</html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  const outputPdfPath = path.resolve('./Buku_Panduan_Operasional_Daily_Dose_Pilates.pdf');
  const artifactPdfPath = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/3cc666fa-d4bb-4c74-8161-76f64b6e87fb/Buku_Panduan_Operasional_Daily_Dose_Pilates.pdf';

  console.log('Mencetak dokumen ke format PDF...');
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '18mm',
      left: '12mm',
      right: '12mm'
    }
  });

  // Salin juga ke direktori artifact agar bisa diakses langsung dari antarmuka
  fs.copyFileSync(outputPdfPath, artifactPdfPath);

  console.log(`✅ PDF Berhasil Dibuat:`);
  console.log(`   - File Utama: ${outputPdfPath}`);
  console.log(`   - File Artifact: ${artifactPdfPath}`);

  await browser.close();
}

generateManualBookPDF().catch(console.error);

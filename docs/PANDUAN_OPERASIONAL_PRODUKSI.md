# 📘 Panduan Operasional Produksi & Standar Prosedur (SOP)
## Daily Dose Pilates v1.0 Management System

* **Dokumen Acuan:** *Spesifikasi Sistem Manajemen Daily Dose Pilates v1.0* (Reyner - HR Group)
* **Kepatuhan Sistem:** 100% Sesuai dengan 13 Keputusan Bisnis Mutlak
* **Komponen Sistem:**
  - `@dailydose/web` (Next.js 15 App Router Standalone)
  - `@dailydose/api` (NestJS Core API)
  - Penjadwal otomatis (berjalan di dalam proses API; aktif dengan `SCHEDULER_ENABLED=true`)
  - MySQL 8.0 & Prisma ORM

---

## 1. Arsitektur Komponen Produksi

Sistem Daily Dose Pilates v1.0 beroperasi dalam arsitektur terdistribusi monorepo yang efisien:

```
                  ┌─────────────────────────────────┐
                  │   Reverse Proxy (Nginx / Cloud) │
                  └──────────────┬──────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │ (Port 3000)                                   │ (Port 3001)
┌────────▼──────────────┐                       ┌────────▼──────────────┐
│   @dailydose/web      │                       │   @dailydose/api      │
│  Next.js Standalone   │                       │   NestJS Core API     │
└───────────────────────┘                       └───────┬───────┬───────┘
                                                        │       │
                                 ┌──────────────────────┘       │
                                 │ (Prisma Client)              │ (Meta Graph API)
                        ┌────────▼──────────────┐      ┌────────▼──────────────┐
                        │   MySQL 8.0 Database  │      │ WhatsApp Cloud API    │
                        │ (dailydose_v2 schema) │      │ (Graph API v21.0)     │
                        └────────▲──────────────┘      └───────────────────────┘
```

### Port & Alokasi Komponen
| Komponen | Runtime | Port Standar | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Node.js (Next.js Standalone) | `3000` | UI Pelanggan, Portal Instruktur, Workspace Internal (Admin/Finance/Manager/Owner) |
| **Backend API** | Node.js (NestJS) | `3001` | Autentikasi JWT, Identity RBAC, Bookings, Presensi, Finansial, WhatsApp Gateway |
| **Penjadwal otomatis** | Di dalam proses API | — | Batalkan pesanan lewat batas bayar (15 mnt), tandai paket kedaluwarsa (1 jam), evaluasi kuota H-24 (30 mnt, perlu `ENABLE_AUTO_CANCEL=true`), pengingat WA berjenjang (1 jam). Hanya satu instance API. Status ada di halaman Kesehatan Sistem. |
| **Database** | MySQL 8.0 InnoDB | `3306` | Penyimpanan persisten (24 tabel Prisma & Session Ledger) |

---

## 2. Variabel Lingkungan (*Environment Variables*)

Setiap service menggunakan berkas konfigurasi `.env` pada root direktori:

```bash
# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
DATABASE_URL="mysql://dailydose_user:secure_password@127.0.0.1:3306/dailydose_v2?connection_limit=20"

# ==============================================================================
# SECURITY & AUTHENTICATION
# ==============================================================================
JWT_SECRET="super-secure-production-secret-key-32-chars-min"
JWT_EXPIRES_IN="7d"

# ==============================================================================
# SERVICE PORTS & URLS
# ==============================================================================
PORT=3001
API_PUBLIC_URL="https://api.dailydosepilates.com"
WEB_PUBLIC_URL="https://app.dailydosepilates.com"

# ==============================================================================
# WHATSAPP BUSINESS API (META CLOUD API)
# ==============================================================================
# Gunakan 'official' untuk produksi, 'mock' untuk staging/testing
WHATSAPP_PROVIDER="official"
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxx...production_meta_token"
WHATSAPP_PHONE_NUMBER_ID="109876543210987"
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"
WHATSAPP_API_VERSION="v21.0"

# ==============================================================================
# STORAGE & MEDIA (S3 / MinIO)
# ==============================================================================
STORAGE_DRIVER="s3"
S3_ENDPOINT="https://s3.ap-southeast-1.amazonaws.com"
S3_REGION="ap-southeast-1"
S3_BUCKET="dailydose-production-media"
S3_ACCESS_KEY="AKIAxxxxxxx"
S3_SECRET_KEY="xxxxxxx"
```

---

## 3. Kompilasi & Prosedur Deployment

### A. Build Produksi
Sebelum menaikkan versi ke server produksi, jalankan kompilasi monorepo:
```bash
# 1. Pastikan dependensi terkunci
pnpm install --frozen-lockfile

# 2. Sinkronisasi Prisma Schema (Tanpa reset)
pnpm db:generate

# 3. Jalankan pengecekan tipe dan tes (API: jest, web: vitest)
pnpm typecheck
pnpm --filter @dailydose/api test
pnpm --filter @dailydose/web test

# 4. Bangun seluruh bundle produksi
pnpm --filter @dailydose/api build
pnpm --filter @dailydose/web build
```

### B. Konfigurasi PM2 (Process Manager)
Gunakan konfigurasi `ecosystem.config.js` untuk menjaga reliabilitas kedua service (API dan web) di server produksi:

```javascript
module.exports = {
  apps: [
    {
      name: 'dailydose-api',
      script: 'dist/main.js',
      cwd: '/var/www/dailydose_v2/apps/api',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'dailydose-web',
      script: '.next/standalone/apps/web/server.js',
      cwd: '/var/www/dailydose_v2/apps/web',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

---

## 4. Standar Operasional Prosedur (SOP) 13 Keputusan Bisnis

### Rule #1: Pengurangan Sesi Pasca-Kehadiran
* **Ketentuan:** Saldo sesi pelanggan **TIDAK BOLEH** dipotong saat booking dibuat.
* **Prosedur:**
  1. Pelanggan memesan kelas ➔ Status booking `CONFIRMED`, saldo sesi di `SessionLedger` tetap utuh.
  2. Saat kelas berlangsung, Instruktur melakukan check-in via QR dan Pelanggan mengonfirmasi kehadiran via Link.
  3. Kelas dinyatakan selesai (`ClassSlotStatus.COMPLETED`) ➔ Sistem secara otomatis memotong saldo sesi sebesar 1 dengan mutasi `SessionMutationType.ATTEND` ke dalam `SessionLedger`.
  4. Jika pelanggan tidak hadir (*no-show*), sesi tetap dapat ditandai selesai sesuai kebijakan studio.

### Rule #2 & #3: Persetujuan Paket & Masa Berlaku
* **Ketentuan:** Pembelian paket oleh pelanggan memerlukan persetujuan Manager sebelum sesi dapat digunakan. Masa berlaku paket dihitung sejak tanggal aktivasi paket.
* **Prosedur:**
  1. Pelanggan melakukan pembayaran dan mengunggah bukti bayar.
  2. Manager cabang membuka menu `/workspace/payments` dan memvalidasi pembayaran.
  3. Klik **Setujui Pembelian** ➔ Status menjadi `PAID`, paket diaktifkan, dan mutasi `PURCHASE` ditambahkan ke `SessionLedger`.
  4. Masa berlaku (*validUntil*) terkunci sesuai paket (misal 30 hari / 90 hari).

### Rule #4 & #5: Kuota Minimum & Auto-Cancel H-24
* **Ketentuan:** Kelas yang tidak memenuhi kuota minimum tepat pada **24 jam sebelum kelas dimulai (H-24)** harus dibatalkan otomatis oleh sistem.
* **Prosedur Otomatis:**
  1. `AutoCancelService` mengevaluasi semua kelas yang `startAt` berada di rentang H-24.
  2. Jika jumlah peserta aktif < `minQuota`:
     - Status slot kelas diubah menjadi `CANCELLED`.
     - Seluruh booking dibatalkan (`CANCELLED`).
     - Sesi dikembalikan ke saldo pelanggan via mutasi `REFUND_AUTOCANCEL` di `SessionLedger`.
     - Sistem mengirim pesan WhatsApp otomatis ke 4 pihak: Pelanggan, Instruktur, Admin Cabang, dan Owner Cabang.
* **Prosedur Manual (Emergency Override):**
  - Admin/Manager dapat memicu evaluasi instan melalui halaman `/workspace/reminders` dengan tombol **Trigger Evaluasi Auto-Cancel H-24**.

### Rule #6: Dual Check-In (QR Studio & Link Mandiri)
* **Ketentuan:** Instruktur check-in menggunakan QR code studio. Pelanggan check-in melalui tautan konfirmasi mandiri (bukan scan QR).
* **Prosedur:**
  1. **Instruktur:**
     - 30 menit sebelum kelas dimulai, instruktur membuka `/check-in-scanner` di tablet studio atau ponselnya dan memindai QR dinamis studio.
     - Sistem mencatat kehadiran instruktur (`CheckInMethod.QR_SCAN`) sebagai syarat validasi jam mengajar.
  2. **Pelanggan:**
     - Pelanggan menerima link check-in WhatsApp atau membuka dashboard pelanggan.
     - Klik tombol **Konfirmasi Kehadiran** pada link unik (`/check-in/[token]`).
     - Sistem mencatat kehadiran pelanggan (`CheckInMethod.LINK_CONFIRM`).

### Rule #7 & #10: Struktur 7 Role & Hak Akses Multi-Cabang
* **Hierarki Role:**
  1. `SUPER_OWNER`: Akses penuh ke seluruh cabang dan master data.
  2. `OWNER`: Akses data performa, jadwal, dan finansial **HANYA** untuk cabang yang terdaftar di `OwnerBranch`. Akses cabang lain dicekal 403 Forbidden.
  3. `MANAGER`: Menyetujui pembelian paket, menyetujui *Session Adjust Request*, mengelola operasional cabang, dan menandai pelanggan berhenti (`stoppedAt`).
  4. `FINANCE`: Mencatat biaya operasional (`OtherCost`), dan mengakses 4 laporan keuangan menurut rentang tanggal.
  5. `ADMIN`: Mengelola slot jadwal kelas, presensi pelanggan, dan backfill manual (H+2).
  6. `INSTRUCTOR`: Mengisi ketersediaan mengajar (*availability*), melihat jadwal, dan check-in QR.
  7. `CUSTOMER`: Membeli paket, memesan kelas, reschedule ($\ge$ H-24), dan konfirmasi kehadiran via link.

### Rule #8: Keuangan, 4 Laporan & Rentang Tanggal Bebas
* **Tidak ada tutup buku.** Laporan keuangan dilihat menurut rentang tanggal yang dipilih sendiri (dari tanggal sampai tanggal, paling lama 366 hari), dengan pintasan Bulan ini, Bulan lalu, 30 hari terakhir, dan Tahun ini. Angka selalu dihitung langsung dari data; tidak ada periode yang dikunci dan tidak ada jurnal koreksi (dicabut 25 Okt 2026; v1 juga tidak punya).
* **4 Laporan Inti** (sebelumnya 5; laporan proyeksi dihapus 25 Okt 2026 karena biaya instruktur hanya dihitung dari sesi yang benar-benar terlaksana):
  1. *Laporan Omset Penjualan Paket:* Transaksi pembelian `PAID` pada rentang tanggal.
  2. *Laporan Beban Instruktur Realtime:* Jam mengajar aktual dari slot `COMPLETED` dikalikan tarif `InstructorFee` sesuai tanggal efektif.
  3. *Laporan Biaya Operasional (Other Cost):* Sewa gedung, utilitas, pemeliharaan, marketing, dan lainnya.
  4. *Laporan Laba Bersih:* Omset dikurangi Beban Instruktur Realtime dan Biaya Operasional.
* **Biaya lain bertanggal:** setiap biaya dicatat dengan **tanggal pengeluaran**; biaya masuk ke laporan sesuai tanggal itu. Biaya boleh diubah (tanggal, kategori, keterangan, nominal) atau dihapus (alasan wajib) kapan saja. Biaya lama yang hanya punya bulan dianggap jatuh pada tanggal 1 bulan tersebut.
* **Owner Cabang** memakai rentang tanggal yang sama pada halaman Performa Cabang, terbatas pada cabang yang melekat pada akunnya.

### Rule #9: Batas Toleransi Backfill Admin (H+2)
* **Ketentuan:** Admin hanya diizinkan melakukan presensi manual (*backfill*) dalam batas waktu maksimal **2 jam setelah kelas selesai (H+2)**.
* **Prosedur:**
  1. Jika pelanggan lupa konfirmasi link dan kelas telah selesai kurang dari 2 jam, Admin dapat mengklik tombol "Catat Kehadiran".
  2. Jika telah melewati H+2 jam, tombol dinonaktifkan dan API menolak mutasi dengan error `ATTENDANCE_WINDOW_EXPIRED`.
  3. Untuk kasus di luar jendela toleransi, perubahan wajib melalui pengajuan *Session Adjust Request* ke Manager.

### Rule #11, #12, #13: Notifikasi WhatsApp Berjenjang & Proteksi Customer Berhenti
* **Jadwal Reminder:**
  - **Admin Digest:** Setiap 3 jam, sistem mengirim rekap customer yang memiliki sisa sesi $\le 2$ atau paket kedaluwarsa $\le 7$ hari.
  - **Owner Rekap:** Setiap 3 hari, sistem mengirim rekap eksekutif kesehatan paket cabang ke Owner dan Super Owner.
  - **Customer H-7, H-3, H-1:** Notifikasi pengingat otomatis sebelum masa berlaku paket berakhir.
  - **Follow-up Expired:** Pengingat berkala setiap 3 hari sekali bagi pelanggan expired yang belum renew (maksimal 5x).
* **Proteksi Mutlak Customer Berhenti (`stoppedAt != null`):**
  - Customer yang ditandai berhenti oleh Manager **100% DIKECUALIKAN** dari semua antrean reminder WhatsApp.

---

## 5. Prosedur Pencadangan & Pemulihan Database

### A. Backup Harian Terotomasi (Cron)
Simpan dump database harian dengan kompresi gzip:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/dailydose"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

mysqldump -u dailydose_user -p'secure_password' \
  --single-transaction --quick --routines --triggers \
  dailydose_v2 | gzip > "$BACKUP_DIR/dailydose_v2_$TIMESTAMP.sql.gz"

# Retensi 30 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

### B. Prosedur Restore
```bash
gunzip < /var/backups/dailydose/dailydose_v2_20260918.sql.gz | mysql -u dailydose_user -p'secure_password' dailydose_v2
```

> [!IMPORTANT]
> Skema Prisma Daily Dose V2 mempertahankan kompatibilitas dengan kolom Laravel (`remember_token`, `LaravelMigration`). Jangan pernah menjalankan `prisma migrate reset` di lingkungan produksi!

---

## 6. Penanganan Insiden & Troubleshooting

| Gejala Masalah | Kemungkinan Penyebab | Langkah Penanganan |
| :--- | :--- | :--- |
| **Pesan WhatsApp Gagal Terkirim** | Access token Meta kedaluwarsa atau saldo akun habis | 1. Buka Meta Business Manager.<br>2. Generate token sistem permanen baru.<br>3. Update `WHATSAPP_ACCESS_TOKEN` pada file `.env`.<br>4. Restart service: `pm2 restart dailydose-api`. |
| **Auto-Cancel Tidak Berjalan di Jam H-24** | Penjadwal bawaan API mati atau dinonaktifkan | 1. Pastikan `SCHEDULER_ENABLED` dan `ENABLE_AUTO_CANCEL=true` di `.env`.<br>2. Cek log: `pm2 logs dailydose-api`.<br>3. Buka dashboard `/workspace/reminders` dan klik **Trigger Evaluasi Auto-Cancel H-24** secara manual. |
| **Selisih Saldo Sesi Pelanggan** | Ketidaksesuaian input manual | 1. Buka `/ledger/[customerPackageId]`.<br>2. Periksa audit trail mutasi: `PURCHASE`, `ATTEND`, `REFUND_AUTOCANCEL`, `ADJUST_MANUAL`.<br>3. Jika diperlukan penyesuaian, ajukan *Session Adjust Request* untuk di-approve Manager. |
| **Salah Catat Biaya Lain** | Nominal, tanggal, atau kategori keliru | Buka `/finance`, tab *Biaya Operasional Lain*, lalu **Ubah** (tanggal, kategori, keterangan, nominal) atau **Hapus** (alasan wajib). Tidak ada periode terkunci. |

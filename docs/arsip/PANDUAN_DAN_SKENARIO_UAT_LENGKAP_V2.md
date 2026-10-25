# PANDUAN DAN SKENARIO PENGUJIAN PENERIMAAN PENGGUNA (USER ACCEPTANCE TESTING - UAT)
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `DOC-UAT-DDV2-2026-09-CANONICAL`  
**Status Dokumen:** `FINAL / 100% PRECISE WITH UI & MYSQL DATABASE`  
**Klasifikasi:** Internal Operational, Quality Assurance & Manual Testing  
**Penyusun:** Senior IT Business Consultant & Lead System Analyst  
**Tanggal Rilis:** 28 September 2026  

---

## DAFTAR ISI
1. [Informasi Dokumen, Tujuan & Standar Kualitas](#1-informasi-dokumen-tujuan--standar-kualitas)
2. [Spesifikasi Lingkungan Pengujian (Test Environment) & Panduan Koneksi Database](#2-spesifikasi-lingkungan-pengujian-test-environment)
3. [Matriks 7 Peran Pengguna & Akun Uji Otentik (Test Accounts)](#3-matriks-7-peran-pengguna--akun-uji-otentik-test-accounts)
4. [Lembar Kendali Pengujian Cepat (Quick Manual Testing Cheatsheet)](#4-lembar-kendali-pengujian-cepat-quick-manual-testing-cheatsheet)
5. [Peta Alur Pengujian Kronologis (End-to-End Customer & Studio Lifecycle)](#5-peta-alur-pengujian-kronologis-end-to-end-customer--studio-lifecycle)
6. [Skenario Pengujian UAT Lengkap & Rincian Data (UAT-01 s/d UAT-10)](#6-skenario-pengujian-uat-lengkap--rincian-data)
   - [UAT-01: Eksplorasi Publik di Landing Page, Direktori Studio & Otomasi Filter Lokasi (Deep-Link)](#uat-01-eksplorasi-publik-di-landing-page-direktori-studio--otomasi-filter-lokasi-deep-link)
   - [UAT-02: Registrasi Member Baru, Unggah Dokumen KYC (Selfie & KTP) & Login](#uat-02-registrasi-member-baru-unggah-dokumen-kyc-selfie--ktp--login)
   - [UAT-03: Eksplorasi Katalog Paket Studio, Checkout & Unggah Bukti Transfer Bank](#uat-03-eksplorasi-katalog-paket-studio-checkout--unggah-bukti-transfer-bank)
   - [UAT-04: Verifikasi & Persetujuan Pembayaran oleh Studio Manager (Ledger PURCHASE)](#uat-04-verifikasi--persetujuan-pembayaran-oleh-studio-manager-ledger-purchase)
   - [UAT-05: Ketersediaan Jam Instruktur & Penjadwalan Slot Kelas dengan Collision Guard](#uat-05-ketersediaan-jam-instruktur--penjadwalan-slot-kelas-dengan-collision-guard)
   - [UAT-06: Self-Booking Kelas oleh Member & Verifikasi Integritas Saldo Sesi (Rule #1)](#uat-06-self-booking-kelas-oleh-member--verifikasi-integritas-saldo-sesi-rule-1)
   - [UAT-07: Reschedule Mandiri Pelanggan (Batas H-24) & Proteksi Cutoff](#uat-07-reschedule-mandiri-pelanggan-batas-h-24--proteksi-cutoff)
   - [UAT-08: Jalur Darurat Penyesuaian Sesi Medis (< H-24) via Otorisasi Manager (/ledger/adjustments)](#uat-08-jalur-darurat-penyesuaian-sesi-medis--h-24-via-otorisasi-manager-ledgeradjustments)
   - [UAT-09: Dual Check-In Presensi (QR Tablet vs Link Mandiri), Selesai Kelas & Pemotongan Sesi](#uat-09-dual-check-in-presensi-qr-tablet-vs-link-mandiri-selesai-kelas--pemotongan-sesi)
   - [UAT-10: Finansial Multi-Cabang, 5 Laporan, Tutup Buku Bulanan & WA Anti-Spam](#uat-10-finansial-multi-cabang-5-laporan-tutup-buku-bulanan--wa-anti-spam)
7. [Lembar Kerja Pelaporan Temuan Cacat (Defect Log Sheet)](#7-lembar-kerja-pelaporan-temuan-cacat-defect-log-sheet)
8. [Berita Acara Serah Terima & Persetujuan UAT (UAT Sign-Off Certificate)](#8-berita-acara-serah-terima--persetujuan-uat-uat-sign-off-certificate)

---

## 1. INFORMASI DOKUMEN, TUJUAN & STANDAR KUALITAS

### 1.1 Tujuan UAT
Dokumen ini disusun sebagai panduan pengujian resmi (*User Acceptance Testing - UAT*) untuk memvalidasi kelayakan operasional sistem **Daily Dose Pilates v2** sebelum peluncuran produksi (*Go-Live*). 

Pengujian ini disusun secara **kronologis alami (natural end-to-end journey)**, merefleksikan alur hidup nyata seorang pelanggan studio pilates:
$$\text{Landing Page} \longrightarrow \text{Registrasi/KYC} \longrightarrow \text{Beli Paket} \longrightarrow \text{Approval} \longrightarrow \text{Booking Kelas} \longrightarrow \text{Presensi} \longrightarrow \text{Tutup Buku}$$

### 1.2 Standar Evaluasi & Ketentuan Pengujian
1. **Presisi 100% dengan UI & Database Riil:**
   - Seluruh nama menu, label tombol, dialog konfirmasi, dan status badge di dokumen ini **sama persis** dengan yang tampil di antarmuka web `http://localhost:32120`.
   - Seluruh data paket, harga, bank transfer, dan akun pengguna **terverifikasi ada di database MySQL `dailydose`**.
2. **Kepatuhan Aturan Bisnis Inti (13 Locked Business Rules):**
   - **Rule #1:** Saldo sesi member TIDAK BOLEH terpotong saat booking dibuat (hanya terpotong pasca kelas `COMPLETED`).
   - **Rule #2:** Setiap mutasi sesi tercatat matematis di `session_ledger` (`PURCHASE`, `ATTEND`, `REFUND_AUTOCANCEL`, `ADJUST_MANUAL`).
   - **Rule #4 & #5:** Batas toleransi perubahan mandiri adalah H-24 jam sebelum kelas.
   - **Rule #6:** Penanganan medis darurat ($< H-24$) memerlukan surat dokter dan wajib disetujui Studio Manager (*Separation of Duties*).
   - **Rule #8:** Tutup Buku Bulanan mengunci periode pembukuan secara kriptografis (*Period Lock Guard*).
   - **Rule #9:** Toleransi presensi susulan (*backfill*) oleh admin frontdesk dibatasi maksimal H+2 jam pasca kelas.
   - **Rule #10:** Isolasi data finansial multi-cabang (Owner cabang hanya dapat mengakses data cabangnya sendiri).
   - **Rule #13:** Jaminan 100% Zero-Spam untuk member yang telah berhenti (`stoppedAt != null`).
3. **Kacamata Pengguna Gaptek:** Seluruh antarmuka ramah pengguna, bebas istilah teknis membingungkan, dan penanganan galat (*inline feedback*) mendidik.

---

## 2. SPESIFIKASI LINGKUNGAN PENGUJIAN (TEST ENVIRONMENT)

| Parameter Sistem | Spesifikasi Lingkungan Pengujian / Staging |
| :--- | :--- |
| **Frontend Web App** | `http://localhost:32120` (Next.js 15 Standalone Web App) |
| **Backend Core REST API** | `http://localhost:32121` (NestJS Modular Monolith) |
| **Swagger / OpenAPI Documentation** | `http://localhost:32121/api/docs` |
| **Database Server** | MySQL 8.4 Server (`127.0.0.1:3315`, Database: `dailydose`, Engine: InnoDB) |
| **ORM & Database Driver** | Prisma ORM 6.x dengan TypeScript Client |
| **Penyimpanan Media & Dokumen** | MinIO / S3 Private Storage Driver (`dailydose-testing`) |
| **Background Automation Engine** | NestJS Scheduled Automation Worker Service |
| **Gateway Notifikasi WhatsApp** | WhatsApp Cloud Business API Mock Gateway Service |

### 2.1 Panduan Koneksi & Eksekusi Kueri Verifikasi Database (MySQL in Docker)
Database MySQL sistem ini berjalan di dalam **Docker Container** bernama `dailydose-v2-mysql-1`. Kueri SQL tidak dapat dijalankan langsung di terminal host Mac (akan memunculkan galat `zsh: command not found: USE`).

Penguji manual dapat memilih salah satu dari 3 cara praktis berikut untuk memverifikasi data di database:

#### Metode 1: One-Liner Terminal (Paling Cepat & Direkomendasikan)
Jalankan langsung di terminal Mac pada direktori proyek dengan menambahkan opsi `-e`:
```bash
pnpm db:console -e "SELECT id, email, phone, name, role, status, stoppedAt FROM user WHERE email = 'clara.new@dailydose.test';"
```
*Atau menggunakan Docker CLI langsung:*
```bash
docker exec -i dailydose-v2-mysql-1 mysql -udailydose -pb64c0a6442c3df2f4f940459955788747a844facf4be7d9e23773bad7b592308 dailydose -e "SELECT id, email, phone, name, role, status, stoppedAt FROM user WHERE email = 'clara.new@dailydose.test';"
```
> **Keunggulan:** Langsung menampilkan tabel ASCII rapi di terminal dalam waktu < 1 detik dan otomatis kembali ke prompt shell.

#### Metode 2: Konsol Interaktif MySQL (Interactive Shell)
1. Di terminal proyek, jalankan:
   ```bash
   pnpm db:console
   ```
2. Prompt terminal akan beralih ke konsol MySQL:
   ```text
   mysql> 
   ```
3. Paste kueri SQL apapun yang ada di panduan UAT (database `dailydose` sudah otomatis aktif, Anda tidak perlu mengetik `USE dailydose;` lagi):
   ```sql
   SELECT id, email, phone, name, role, status, stoppedAt FROM user WHERE email = 'clara.new@dailydose.test';
   ```
4. Untuk keluar dan kembali ke terminal Mac biasa, ketik:
   ```sql
   exit;
   ```

#### Metode 3: Aplikasi Database GUI (TablePlus, DBeaver, Beekeeper Studio, MySQL Workbench)
Port MySQL container telah dipetakan ke port `3315` pada komputer penguji. Buat koneksi baru (*New Connection*) dengan konfigurasi:
* **Host / Server:** `127.0.0.1` (atau `localhost`)
* **Port:** `3315`
* **User:** `dailydose`
* **Password:** `b64c0a6442c3df2f4f940459955788747a844facf4be7d9e23773bad7b592308`
* **Database:** `dailydose`
Buka tab SQL Query di aplikasi GUI, paste kueri dari skenario UAT, lalu tekan *Run / Execute*.

---

## 3. MATRIKS 7 PERAN PENGGUNA & AKUN UJI OTENTIK (TEST ACCOUNTS)

Gunakan akun resmi hasil seed database MySQL (`apps/api/prisma/seed.ts`) berikut untuk pengujian sesuai batasan wewenang masing-masing:

| Peran (*Role*) | Email Akun Uji | Password Default | Lingkup Otoritas & Cabang |
| :--- | :--- | :--- | :--- |
| **Super Owner** | `superowner@dailydose.test` | `SuperOwner123!` | Global (Seluruh Cabang), Verifikasi KYC KTP, Otorisasi Jurnal Koreksi Pasca-Lock |
| **Owner Cabang** | `owner.gg@dailydose.test` | `Owner123!` | Terbatas Cabang Green Garden (`DD-GG`), Hanya Laporan Finansial Cabang Sendiri (Rule #10) |
| **Studio Manager** | `manager.gg@dailydose.test` | `Manager123!` | Cabang Green Garden, Approval Pembayaran, Approval Adjust Sesi Medis, Tutup Kelas |
| **Finance** | `finance@dailydose.test` | `Finance123!` | Global / Semua Cabang, Input OtherCost, 5 Laporan Keuangan, Eksekusi Tutup Buku |
| **Admin Front Desk** | `adminmk@ddose.com` | `Admin123!` | Cabang Muara Karang / Green Garden, Buat Slot Kelas, Assisted Booking, Backfill H+2 |
| **Coach / Instruktur** | `instdevi@ddose.com` | `Instructor123!` | Cabang Green Garden (Coach Devi), Input Ketersediaan Jam, Presensi Scan QR Tablet Studio |
| **Customer Baru** | `clara.new@dailydose.test` | `MemberBaru2026!` | Calon Member Baru (Uji Registrasi, KYC Selfie & KTP) |
| **Customer Aktif** | `amanda.member@dailydose.test` | `Customer123!` | Member Aktif (Uji Pembelian Paket, Booking Kelas, Link Check-In Mandiri) |
| **Customer Pembanding**| `budi.member@dailydose.test` | `Customer123!` | Member Aktif (Uji Mangkir / No-Show dan Multi-User Booking) |
| **Customer Berhenti** | `hendra.stopped@dailydose.test` | `Customer123!` | Member Berhenti (`stoppedAt != null`), Uji 100% Proteksi Anti-Spam WhatsApp |

---

## 4. LEMBAR KENDALI PENGUJIAN CEPAT (QUICK MANUAL TESTING CHEATSHEET)

Gunakan tabel kendali 1 halaman ini sebagai panduan cepat saat melakukan pengujian manual dari awal hingga akhir:

| Urutan | ID UAT | Peran Penguji | Akun Login | Halaman Target | Aksi Utama Pengujian | Kriteria Keberhasilan Cepat |
|:---:|:---:|:---|:---|:---|:---|:---|
| **1** | `UAT-01` | Publik (Tamu) | *(Tanpa Login)* | `/` $\to$ `/locations` | Cek landing page, direktori 5 studio, filter wilayah, & uji deep-link ke `/classes?branch=...` | Halaman memuat mulus, filter wilayah bekerja, tombol studio otomatis memfilter jadwal |
| **2** | `UAT-02` | Calon Member | *(Daftar Baru)* | `/register` | Isi data diri & KYC, daftar akun baru & uji email duplikat | Akun terdaftar ke DB, duplikasi ditangani ramah (HTTP 409) |
| **3** | `UAT-03` | Member Aktif | `amanda.member@dailydose.test` | `/packages` | Beli Paket Uji Operasional Fase 1, upload bukti transfer | Invoice terbit status `Menunggu verifikasi` (`PENDING`) |
| **4** | `UAT-04` | Studio Manager | `manager.gg@dailydose.test` | `/workspace/payments` | Filter `Menunggu pemeriksaan`, klik `Setujui pembayaran` | Paket Amanda aktif, Ledger mencatat `PURCHASE (+10 sesi)` |
| **5** | `UAT-05` | Coach & Admin | `instdevi@ddose.com`<br>`adminmk@ddose.com` | `/schedule`<br>`/workspace/classes` | Coach set jadwal, Admin buat slot kelas & uji Collision Guard | Slot terbit di kalender, slot bentrok tertolak tegas |
| **6** | `UAT-06` | Member Aktif | `amanda.member@dailydose.test` | `/classes` | Booking slot kelas Coach Devi dengan paket yang aktif | Tiket booking terbit, **Saldo sesi UTUH 10 sesi (Rule #1)** |
| **7** | `UAT-07` | Member Aktif | `amanda.member@dailydose.test` | `/bookings` | Klik `Ajukan reschedule` (H-24) vs uji cutoff (< H-24) | Reschedule $\ge$ H-24 lolos; $<$ H-24 terkunci (Hubungi studio) |
| **8** | `UAT-08` | Admin & Manager | `adminmk@ddose.com`<br>`manager.gg@dailydose.test` | `/ledger/adjustments` | Admin ajukan kompensasi surat dokter, Manager setujui | Sesi bertambah +1 via mutasi resmi `ADJUST_MANUAL` |
| **9** | `UAT-09` | Coach & Manager | `instdevi@ddose.com`<br>`manager.gg@dailydose.test` | `/check-in-scanner`<br>`/workspace/classes` | Coach scan QR tablet, Amanda check-in link web, Manager selesaikan kelas | Kelas `COMPLETED`, saldo sesi Amanda terpotong 1 (`ATTEND`) |
| **10**| `UAT-10` | Finance & Super Owner | `finance@dailydose.test`<br>`superowner@dailydose.test` | `/finance` | Input OtherCost, klik `Tutup buku periode`, uji anti-spam | Periode `LOCKED`, mutasi baru ditolak, 0 spam ke member berhenti |

---

## 5. PETA ALUR PENGUJIAN KRONOLOGIS (END-TO-END CUSTOMER & STUDIO LIFECYCLE)

```
[FASE I: AKUISISI & ONBOARDING MEMBER]
  (UAT-01) Landing Page & Direktori Studio (/ -> /locations -> /classes)
      └── Navigasi 5 Studio, Filter Wilayah & Otomasi Deep-Link Jadwal Cabang
  (UAT-02) Registrasi Member Baru & KYC (/register)
      └── Input Data Diri, Upload Selfie & KTP, Aktivasi Sesi Sign-In (/sign-in)
  (UAT-03) Pembelian Paket & Checkout (/packages -> /checkout)
      └── Pilih Cabang Green Garden, Pilih Paket Uji Operasional, Transfer BCA & Upload Struk

[FASE II: VERIFIKASI OPERASIONAL & PENJADWALAN STUDIO]
  (UAT-04) Review & Approval Pembayaran (/workspace/payments)
      └── Manager Approve Bukti Bayar -> Paket Aktif -> Ledger Mutation: PURCHASE (+10)
  (UAT-05) Ketersediaan Instruktur & Pembuatan Slot Kelas (/schedule -> /workspace/classes)
      └── Coach submit availability -> Admin buat slot kelas -> Collision Guard aktif

[FASE III: RESERVASI KELAS & PENEGAKAN ATURAN STUDIO]
  (UAT-06) Self-Booking Kelas oleh Member (/classes -> /bookings/new)
      └── Member reservasi kelas -> Kuota kelas berkurang -> Sisa Sesi Member UTUH (Rule #1)
  (UAT-07) Reschedule Mandiri (H-24) & Penegakan Cutoff
      └── Reschedule >= H-24 lolos vs < H-24 terkunci dengan tombol "Hubungi studio"
  (UAT-08) Penanganan Darurat Medis < H-24 (/ledger/adjustments)
      └── Admin ajukan kompensasi surat dokter -> Manager approve -> Ledger ADJUST_MANUAL (+1)

[FASE IV: PELAKSANAAN KELAS, PRESENSI & TUTUP BUKU BULANAN]
  (UAT-09) Dual Presensi & Selesai Kelas (/check-in-scanner & /workspace/classes)
      └── Coach QR tablet + Member Web Link -> Selesai Kelas -> Sesi Terpotong 1 (ATTEND)
      └── Peserta Mangkir (No-Show) kuota sesi tetap terpotong 1 sebagai penalti
  (UAT-10) Laporan Finansial Bulanan, Tutup Buku (Monthly Close) & WA Anti-Spam (/finance)
      └── 5 Laporan Keuangan, Isolasi Cabang Mitra, Tutup Buku LOCKED (Period Lock Guard)
      └── Jurnal Koreksi disetujui Super Owner & 0 Pesan Spam ke Member Berhenti (Rule #13)
```

---

## 6. SKENARIO PENGUJIAN UAT LENGKAP & RINCIAN DATA

---

### UAT-01: Eksplorasi Publik di Landing Page, Direktori Studio & Otomasi Filter Lokasi (Deep-Link)
* **ID Kasus Uji:** `DDV2-UAT-01`
* **Peran Penguji:** Pengunjung Publik / Calon Pelanggan (Tanpa Login / Mode Tamu)
* **URL Target:** `http://localhost:32120/` $\longrightarrow$ `/locations` $\longrightarrow$ `/classes` $\longrightarrow$ `/packages`
* **Tujuan:** 
  1. Memvalidasi bahwa pengunjung baru dapat mengeksplorasi antarmuka landing page utama (`/`), hero carousel 3 slide interaktif, dan navigasi menu navbar tanpa galat JavaScript.
  2. Memvalidasi direktori 5 studio cabang otentik di halaman `/locations` lengkap dengan filter wilayah (*area filter*) dan kotak pencarian teks.
  3. Memvalidasi fitur **Contextual Deep-Linking**: membuktikan bahwa ketika pengunjung mengklik tombol `"Lihat Jadwal"` pada kartu studio cabang tertentu di `/locations`, halaman `/classes` otomatis terbuka dengan parameter `?branch=[branchId]#schedule`, dropdown studio otomatis terpilih ke cabang tersebut, dan daftar jadwal langsung terfilter secara otomatis.
  4. Memvalidasi fleksibilitas pergantian studio secara lokal per-halaman (*Local Scope Override*) melalui dropdown pencarian.

#### A. Data yang Harus Dimasukkan / Aksi Pengujian:

##### Sub-Skenario UAT-01A: Eksplorasi Landing Page Utama (`/`)
1. **Langkah 1 - Akses Landing Page:**
   - URL: `/`
   - Aksi: Buka halaman utama. Gulir halaman dari header navbar, hero carousel, 4 pilar keunggulan studio (*Intimate Class Size*, *Certified Mastery*, *State-of-the-Art*, *Sanctuary Atmosphere*), showcase studio, kelas populer, testimoni/filosofi, hingga footer.
2. **Langkah 2 - Navigasi Header Menu Utama:**
   - Klik menu **`"Studio"`** $\longrightarrow$ Membuka `/locations` (Menampilkan direktori 5 studio cabang resmi).
   - Klik menu **`"Jadwal"`** $\longrightarrow$ Membuka `/classes` (Menampilkan kalender jadwal kelas publik).
   - Klik menu **`"Paket"`** $\longrightarrow$ Membuka `/packages` (Menampilkan katalog paket aktif).
3. **Langkah 3 - Pengujian 3 Slide Hero Carousel & Tombol CTA:**
   - *Slide 1 (Studio Pilates Modern):* Klik **`"Lihat Jadwal"`** (`/classes`) & **`"Lihat Paket"`** (`/packages`).
   - *Slide 2 (Paket Fleksibel):* Klik **`"Pilih Paket Promo"`** (`/packages`) & **`"Jelajahi Studio"`** (`/locations`).
   - *Slide 3 (Instruktur Tersertifikasi):* Klik **`"Daftar Kelas Hari Ini"`** (`/classes`) & **`"Konsultasi WhatsApp"`** (`https://wa.me/...`).
4. **Langkah 4 - Klik Tombol Autentikasi Header:**
   - Klik tombol **`"Daftar"`** $\longrightarrow$ Membuka rute `/register`.
   - Klik tombol **`"Masuk"`** $\longrightarrow$ Membuka rute `/sign-in`.
5. **Langkah 5 - Showcase Studio ke Direktori:**
   - Pada bagian *Studio Showcase* ("Ruang tenang yang dirancang untuk bergerak"), periksa 4 kotak ringkasan:
     - Studio: *5 lokasi*
     - Format: *Personal & kelompok*
     - Durasi: *50 menit*
     - Area: *Jakarta & Tangerang +1*
   - Klik tombol **`"Jelajahi Studio"`** $\longrightarrow$ Mengarah ke `/locations`.

##### Sub-Skenario UAT-01B: Direktori Studio (`/locations`) & Filter Wilayah
1. **Langkah 1 - Buka Direktori Studio:**
   - Akses URL: `/locations`
   - Pastikan tampil 5 cabang studio resmi:
     1. *Daily Dose Green Garden* (`DD-GG`, Jakarta Barat)
     2. *Daily Dose Muara Karang* (`DD-MK`, Jakarta Utara)
     3. *Daily Dose Graha Family Surabaya* (`DD-SBY`, Surabaya)
     4. *Daily Dose Untar Kampus 2* (`DD-UNTAR`, Jakarta Barat)
     5. *Daily Dose Orange Groves PIK 2* (`DD-PIK2`, Tangerang / Banten)
2. **Langkah 2 - Pengujian Filter Wilayah (Area Filter Dropdown):**
   - Pada dropdown wilayah, pilih **`"Jakarta Barat"`**.
   - **Ekspektasi:** Daftar studio langsung tersaring hanya menampilkan studio di Jakarta Barat (*Daily Dose Green Garden* dan *Daily Dose Untar Kampus 2*).
3. **Langkah 3 - Pengujian Kotak Pencarian Teks (Search Input):**
   - Pada kotak pencarian "Cari nama studio atau area...", ketik kata kunci `"Surabaya"`.
   - **Ekspektasi:** Tampilan studio langsung mempersempit hanya menampilkan *Daily Dose Graha Family Surabaya*.
   - Hapus teks pencarian dan kembalikan filter ke `"Semua lokasi"` $\longrightarrow$ Seluruh 5 studio kembali tampil.

##### Sub-Skenario UAT-01C: Pengujian Contextual Deep-Linking Otomatis ke Jadwal Cabang
1. **Langkah 1 - Klik Tombol Jadwal pada Kartu Studio Tertentu:**
   - Di halaman `/locations`, temukan kartu cabang **Daily Dose Green Garden**.
   - Perhatikan 3 tombol aksi di sisi kanan kartu:
     - Tombol `"Lihat detail"` $\longrightarrow$ `/locations/green-garden`
     - Tombol `"Hubungi studio"` $\longrightarrow$ `/contact`
     - Tombol utama **`"Lihat Jadwal"`** (dengan ikon kalender).
   - Klik tombol **`"Lihat Jadwal"`** pada kartu Green Garden tersebut.
2. **Langkah 2 - Verifikasi Filter Otomatis di Halaman `/classes`:**
   - Periksa bilah URL browser: Otomatis memuat `/classes?branch=a1000000-0000-4000-8000-000000000001#schedule`.
   - **Verifikasi Kunci Filter:**
     - Dropdown studio pada halaman `/classes` **otomatis terpilih ke "Daily Dose Green Garden"** (tanpa perlu dipilih manual).
     - Kalender jadwal dan slot kelas yang dimuat **langsung terfilter hanya untuk kelas di studio Green Garden**.
3. **Langkah 3 - Uji Pergantian Filter Studio Lokal (Local Override):**
   - Di halaman `/classes`, ubah dropdown studio ke *"Daily Dose Muara Karang"*.
   - **Ekspektasi:** Jadwal langsung berganti menyajikan slot kelas cabang Muara Karang secara instan tanpa reload halaman penuh.

##### Sub-Skenario UAT-01D: Pemahaman Arsitektur Lokasi Global vs Lokal
> [!NOTE]
> **Arsitektur Pemilihan Lokasi di Daily Dose Pilates v2:**
> 1. **Mode Tamu / Publik (Unauthenticated):**
>    - Menggunakan **Filter Lokal Berbasis URL (`?branch=[id]`)**. Setiap link studio dari halaman `/locations` membawa parameter cabang sehingga tidak membingungkan pengunjung baru (*Contextual Deep-Linking*).
> 2. **Mode Member Terdaftar (Authenticated Member):**
>    - Memiliki **Studio Utama Global (`preferredBranchId`)** yang tersimpan permanen di database profil akun.
>    - Saat member membuka `/classes` atau `/packages` tanpa parameter URL, sistem secara cerdas langsung mengutamakan studio utama mereka (*Zero-Friction Rebooking*), namun tetap memberi kebebasan memilih cabang lain via dropdown filter jika member ingin berlatih di studio lain (*Cross-Branch Flexibility*).

#### B. Data yang Disimpan ke Database / State Aplikasi:
- Pada tahap ini **tidak ada mutasi data database**. Operasi murni pembacaan konfigurasi publik via API:
  - `GET /public/site-config` (profil situs, 3 slide hero carousel, dan 5 cabang aktif).
  - `GET /public/classes?branchId=...` (jadwal kelas terfilter cabang).
- State browser menyimpan query string `?branch=[id]` dan hash `#schedule` untuk memastikan tautan jadwal dapat dibagikan (*shareable URL*).

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Landing page `/` memuat visual lengkap dalam waktu < 2 detik tanpa kesalahan layout CSS ataupun galat konsol browser.
- [x] Tiga slide hero carousel berputar mulus dan seluruh tombol CTA mengarahkan ke halaman yang sesuai.
- [x] Halaman `/locations` menyajikan 5 studio cabang otentik lengkap dengan alamat, deskripsi, dan badge format latihan.
- [x] Filter wilayah dan kotak pencarian di `/locations` bekerja responsif menyaring kartu studio secara instan.
- [x] Mengklik tombol *"Lihat Jadwal"* pada kartu studio tertentu di `/locations` terbukti otomatis memfilter jadwal cabang tersebut di `/classes?branch=...#schedule` (Contextual Deep-Linking 100% bekerja).
- [x] Pengguna dapat mengubah pilihan cabang sewaktu-waktu melalui dropdown filter lokal tanpa kendala.

---

### UAT-02: Registrasi Member Baru, Unggah Dokumen KYC (Selfie & KTP) & Login
* **ID Kasus Uji:** `DDV2-UAT-02`
* **Peran Penguji:** Calon Member Baru & Penguji Ketahanan Sistem
* **URL Target:** `/register` dan `/sign-in`
* **Tujuan:** Memvalidasi alur pendaftaran member baru lengkap dengan nomor WhatsApp Indonesia yang valid, pengunggahan dokumen identitas privasi (Selfie & e-KTP), ketahanan terhadap pendaftaran data duplikat (Anti-Crash 500), dan keberhasilan login akun.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):

##### Sub-Skenario UAT-02A: Pendaftaran Member Baru (Akun Valid)
> [!TIP]
> **Petunjuk Data Pengujian Mandiri:** Jika melakukan pengujian ulang berkali-kali, gunakan alamat email unik seperti `clara+uat1@dailydose.test`, `clara+uat2@dailydose.test`, atau gunakan nomor telepon unik agar tidak terjadi penolakan duplikasi.
1. **Langkah Pendaftaran Member Baru di Form `/register`:**
   - Nama lengkap (`name`): `Clara Natalia`
   - Nomor WhatsApp (`phone`): `081298887766` (Format Indonesia 08xx / +62xx)
   - Email (`email`): `clara.new@dailydose.test`
   - Password (`password`): `MemberBaru2026!` (Minimal 8 karakter)
   - Ulangi password (`confirmPassword`): `MemberBaru2026!`
   - Foto selfie (opsional): Berkas gambar `selfie_clara.jpg` (Format JPG/PNG, < 5MB).
   - Foto KTP (opsional): Berkas gambar `ktp_clara.jpg` (Format JPG/PNG, < 5MB).
   - Persetujuan Syarat & Ketentuan: Centang kotak persetujuan.
   - Tombol: Klik **`"Daftar dan masuk"`**.
2. **Langkah Login di Form `/sign-in`:**
   - Email atau nomor WhatsApp: `clara.new@dailydose.test`
   - Password: `MemberBaru2026!`
   - Tombol: Klik **`"Masuk"`**.

##### Sub-Skenario UAT-02B: Uji Ketahanan Negatif (Anti-Crash Data Duplikat)
1. Buka kembali halaman `/register`.
2. Masukkan alamat email yang **sudah pernah terdaftar** (misal: `clara.new@dailydose.test` atau `amanda.member@dailydose.test`).
3. Masukkan data profil lainnya secara lengkap dan klik **`"Daftar dan masuk"`**.
4. **Ekspektasi Perilaku Sistem:**
   - **TIDAK BOLEH muncul error 500 (Internal Server Error).**
   - API merespons dengan HTTP `409 Conflict`.
   - Muncul kotak peringatan ramah berwarna emas/merah: *"Email atau nomor WhatsApp ini sudah terdaftar. Silakan masuk ke akun Anda."*
   - Tersedia tombol cepat: *"Masuk ke Akun Sekarang →"* yang langsung mengarahkan pengguna ke halaman `/sign-in`.

#### B. Kueri Verifikasi Database MySQL:
Jalankan kueri berikut untuk memastikan data member baru tersimpan dengan benar dan aman:

**Opsi 1 — One-Liner Terminal Mac (Direkomendasikan):**
```bash
pnpm db:console -e "SELECT id, email, phone, name, role, status, stoppedAt FROM user WHERE email = 'clara.new@dailydose.test';"
```
*(Atau via Docker: `docker exec -i dailydose-v2-mysql-1 mysql -udailydose -pb64c0a6442c3df2f4f940459955788747a844facf4be7d9e23773bad7b592308 dailydose -e "SELECT id, email, phone, name, role, status, stoppedAt FROM user WHERE email = 'clara.new@dailydose.test';"`)*

**Opsi 2 — Jalankan di Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
SELECT id, email, phone, name, role, status, stoppedAt 
FROM user 
WHERE email = 'clara.new@dailydose.test';
```
*Hasil yang diharapkan:* `role = 'MEMBER'`, `status = 'ACTIVE'`, `passwordHash` terenkripsi (Argon2id), dan `stoppedAt IS NULL`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Pendaftaran akun baru berhasil tanpa reload halaman dan langsung membawa member ke dashboard akun.
- [x] Percobaan pendaftaran dengan email/nomor HP duplikat ditangani dengan elegan (HTTP 409) tanpa memicu error 500.
- [x] Tautan cepat *"Masuk ke Akun Sekarang"* muncul saat terjadi duplikasi untuk memudahkan pengguna.

---

### UAT-03: Eksplorasi Katalog Paket Studio, Checkout & Unggah Bukti Transfer Bank
* **ID Kasus Uji:** `DDV2-UAT-03`
* **Peran Penguji:** Customer Aktif (`amanda.member@dailydose.test` / `Customer123!`)
* **URL Target:** `/packages` $\longrightarrow$ `/checkout`
* **Tujuan:** Memvalidasi eksplorasi paket berdasarkan cabang studio Green Garden, pemilihan paket resmi database, instruksi rekening transfer bank resmi BCA, pembuatan pesanan (*invoice*), dan pengunggahan bukti transfer bank sebelum diverifikasi tim studio.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):

##### Sub-Skenario UAT-03A: Checkout & Unggah Bukti Bayar oleh Member Terotentikasi
1. **Langkah 1 - Pemilihan Studio & Paket Riil:**
   - Login Akun: `amanda.member@dailydose.test` / `Customer123!`
   - Buka menu: `/packages`
   - Filter Cabang: Pilih **`Daily Dose Green Garden`** (`a1000000-0000-4000-8000-000000000001`).
   - Pilih Paket Riil: **`"Paket Uji Operasional Fase 1"`** (Kode: `PKG-TEST-1789699463379`)
     - Sesi: **10 Sesi Group Class**
     - Masa Aktif: **30 Hari**
     - Harga Resmi: **Rp 1.500.000**
   - Klik tombol: **`"Beli Paket"`** $\longrightarrow$ Mengarah ke `/checkout?packageId=a0280367-94c9-4fe7-8cc3-9ec0b9d7b998&branchId=a1000000-0000-4000-8000-000000000001`.
2. **Langkah 2 - Form Checkout & Pembayaran:**
   - Rincian Paket: 10 Sesi Group Class, Masa Aktif 30 Hari, Subtotal Rp 1.500.000.
   - Rekening Pembayaran Studio Terpilih (Otentik Green Garden):
     - **Nama Bank:** `Bank Central Asia` (BCA)
     - **Nomor Rekening:** `6600482911`
     - **Atas Nama:** `Gerald Reyner Liando`
   - Unggah Bukti Bayar: Unggah struk transfer ATM / m-Banking `struk_bca_1500k.jpg`.
   - Klik tombol: **`"Kirim bukti pembayaran"`** (atau `"Konfirmasi & Kirim Bukti Pembayaran"`).

##### Sub-Skenario UAT-03B: Alur Tamu Belum Login (Guest-to-Member Conversion)
1. Buka browser dalam mode *Incognito* / *Private Window* (tanpa sesi login).
2. Akses halaman `/packages`, pilih paket apapun dan klik `"Beli Paket"`.
3. **Ekspektasi Perilaku Sistem:**
   - Sistem menampilkan kartu informasi ramah: *"Masuk untuk Melanjutkan Pembelian - Untuk mengaitkan paket sesi Pilates dengan akun Anda dan memproses pembayaran secara aman, silakan masuk atau buat akun baru terlebih dahulu."*
   - Terdapat tombol `"Masuk"` dan `"Daftar"` dengan parameter `returnUrl`.
   - Setelah pengunjung berhasil masuk/mendaftar, sistem **otomatis mengembalikan mereka langsung ke halaman checkout paket tersebut**.

##### Sub-Skenario UAT-03C: Pengujian Filter & Pencarian Lanjutan Paket Studio
1. **Langkah 1 - Pencarian Teks Nama Paket:**
   - Di halaman `/packages` dengan cabang **Daily Dose Green Garden**, arahkan ke blok **`02 — Filter & Pencarian Paket`**.
   - Pada kolom **`Nama paket`**, ketik kata kunci: `"Fase 1"`.
   - **Ekspektasi:** Katalog kartu langsung tersaring instan menyajikan *"Paket Uji Operasional Fase 1"*. Paket lain yang tidak mengandung kata kunci tersebut disembunyikan.
   - Klik tombol bersihkan `(X)` pada input search $\longrightarrow$ Seluruh paket kembali tampil.
2. **Langkah 2 - Pengujian Filter Rentang Harga:**
   - Pada dropdown **`Rentang harga`**, pilih **`"< Rp 2.000.000"`**.
   - **Ekspektasi:** Hanya paket dengan harga di bawah Rp 2.000.000 yang tampil (seperti paket starter/fase 1 seharga Rp 1.500.000). Paket premium di atas Rp 2.000.000 disembunyikan.
3. **Langkah 3 - Pengujian Filter Jumlah Sesi:**
   - Pada dropdown **`Jumlah sesi`**, pilih **`"6 – 10 sesi"`**.
   - **Ekspektasi:** Hanya paket dengan kuota 6 hingga 10 sesi yang tampil.
4. **Langkah 4 - Pengujian Tombol Reset & Status Counter:**
   - Perhatikan baris status di bawah filter: Menampilkan teks counter aktif, misal *"Menampilkan 1 dari X paket tersedia (Filter aktif diterapkan)"*.
   - Klik tombol **`"Reset filter"`** di pojok kanan atas filter bar $\longrightarrow$ Seluruh input dan dropdown kembali ke default (`Semua tipe kelas`, `Semua harga`, `Semua sesi`, search kosong) dan seluruh paket aktif kembali ditampilkan.

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, invoiceNumber, userId, branchId, packageId, subtotalRp, totalAmountRp, status, paymentMethod FROM pembelian WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1;"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
SELECT id, invoiceNumber, userId, branchId, packageId, subtotalRp, totalAmountRp, status, paymentMethod 
FROM pembelian 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY createdAt DESC LIMIT 1;
```
*Hasil yang diharapkan:* Record terbuat dengan `status = 'WAITING_VERIFICATION'` (atau `PENDING`), `totalAmountRp = 1500000`. Tabel `paket_pelanggan` dan `session_ledger` **BELUM BERTAMBAH** (saldo belum aktif sebelum di-approve).

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Halaman checkout menampilkan nomor rekening resmi BCA `6600482911` a.n. `Gerald Reyner Liando` sesuai cabang Green Garden.
- [x] Pengunjung tamu disambut dengan panduan login/daftar yang ramah dan dialihkan kembali ke checkout secara otomatis setelah autentikasi.
- [x] Fitur pencarian teks nama paket menyaring kartu paket secara real-time dan reaktif.
- [x] Filter rentang harga dan jumlah sesi bekerja akurat membatasi paket sesuai kriteria yang dipilih.
- [x] Tombol "Reset filter" memulihkan seluruh filter ke kondisi semula dalam 1 klik.
- [x] Invoice terbit otomatis di tabel `pembelian` dengan status menunggu verifikasi.
- [x] Layar member menampilkan status *"Bukti Pembayaran Anda Sedang Ditinjau Tim Studio"*.

---

### UAT-04: Verifikasi & Persetujuan Pembayaran oleh Studio Manager (Ledger PURCHASE)
* **ID Kasus Uji:** `DDV2-UAT-04`
* **Peran Penguji:** Studio Manager (`manager.gg@dailydose.test` / `Manager123!`) & Admin Studio (`adminmk@ddose.com` / `Admin123!`)
* **URL Target:** `/workspace/payments`
* **Tujuan:** Memvalidasi alur tinjauan bukti transfer bank oleh Studio Manager, pencegahan persetujuan oleh staf yang tidak berhak (Admin biasa), penambahan kuota fisik paket pelanggan, dan pencatatan mutasi kredit resmi `PURCHASE` di Session Ledger.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah Negative Test - Percobaan Approval oleh Admin Biasa:**
   - Login Akun: `adminmk@ddose.com` / `Admin123!`
   - Aksi: Buka menu `/workspace/payments` dan coba setujui pesanan Amanda.
   - **Ekspektasi:** Admin biasa dicekal karena tidak memiliki hak wewenang `payment:decide` / `purchase:decide` (tombol disabled atau muncul galat 403 Forbidden).
2. **Langkah Studio Manager - Review & Persetujuan:**
   - Login Akun: `manager.gg@dailydose.test` / `Manager123!`
   - URL: `/workspace/payments` (Menu: **`"Antrean Pembayaran"`**)
   - Filter Status: Pilih **`"Menunggu pemeriksaan"`** (`status=PENDING`).
   - Klik baris pesanan Amanda $\longrightarrow$ Pratinjau gambar bukti transfer terbuka di modal/dialog resolusi tinggi.
   - Klik tombol aksi: **`"Setujui pembayaran"`**.
3. **Langkah Idempotency Test - Double Click Protection:**
   - Coba klik tombol persetujuan untuk kedua kalinya.
   - **Ekspektasi:** Sistem menolak klik berulang (`PURCHASE_ALREADY_DECIDED`) tanpa membuat paket ganda.

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, invoiceNumber, status FROM pembelian WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1; SELECT id, remainingSessions, totalSessions, status FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1; SELECT type, amount, balanceAfter, notes FROM session_ledger WHERE customerPackageId = (SELECT id FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1);"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
-- 1. Pastikan pembelian berubah status menjadi PAID
SELECT id, invoiceNumber, status FROM pembelian 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY createdAt DESC LIMIT 1;

-- 2. Pastikan paket pelanggan aktif terbuat dengan 10 sesi
SELECT id, userId, branchId, totalSessions, remainingSessions, status, validUntil 
FROM paket_pelanggan 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY createdAt DESC LIMIT 1;

-- 3. Pastikan mutasi kredit PURCHASE tercatat di session_ledger
SELECT id, customerPackageId, type, amount, balanceAfter, notes 
FROM session_ledger 
WHERE customerPackageId = (
    SELECT id FROM paket_pelanggan 
    WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
    ORDER BY createdAt DESC LIMIT 1
);
```
*Hasil yang diharapkan:* `pembelian.status = 'PAID'`, `paket_pelanggan.remainingSessions = 10`, `session_ledger.type = 'PURCHASE'`, `amount = 10`, `balanceAfter = 10`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Admin biasa dicekal dari aksi persetujuan pembayaran.
- [x] Studio Manager berhasil menyetujui pesanan dengan tombol "Setujui pembayaran".
- [x] Saldo sesi pelanggan di database dan profil aplikasi bertambah tepat 10 sesi aktif.
- [x] Percobaan persetujuan ulang (*double click*) ditangani dengan aman tanpa menduplikasi kuota.

---

### UAT-05: Ketersediaan Jam Instruktur & Penjadwalan Slot Kelas dengan Collision Guard
* **ID Kasus Uji:** `DDV2-UAT-05`
* **Peran Penguji:** Coach Devi (`instdevi@ddose.com` / `Instructor123!`) & Admin Studio (`adminmk@ddose.com` / `Admin123!`)
* **URL Target:** `/schedule` (Coach) dan `/workspace/classes` (Admin)
* **Tujuan:** Memvalidasi pengisian ketersediaan jam mengajar instruktur, pembuatan slot kelas oleh Admin di menu Timetable Kelas, dan aktivasi *Slot Collision Guard* untuk menolak bentrok instruktur atau ruangan studio pada jam yang sama.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah Instruktur - Input Jam Ketersediaan:**
   - Login Akun: `instdevi@ddose.com` / `Instructor123!`
   - URL: `/schedule` (Menu: `"Jadwal Saya"`)
   - Cabang: `Daily Dose Green Garden` (`a1000000-0000-4000-8000-000000000001`)
   - Tanggal: Tanggal pengujian (misal: 3 hari dari hari ini)
   - Jam Ketersediaan: `09:00:00` s/d `13:00:00`
   - Klik tombol: **`"Simpan ketersediaan"`**.
2. **Langkah Admin - Buat Slot Kelas Normal (Slot A):**
   - Login Akun: `adminmk@ddose.com` / `Admin123!`
   - URL: `/workspace/classes` (Menu: **`"Timetable kelas"`**)
   - Klik tombol: **`"Tambah jadwal kelas"`**
   - Form Pembuatan Slot:
     - Cabang: `Daily Dose Green Garden`
     - Jenis Kelas: `Group Class` (`GROUP_CLASS`)
     - Studio & Ruangan: `Studio Reformer Jakarta` / `Reformer Room A`
     - Instruktur: `Coach Devi` (`instdevi@ddose.com`)
     - Waktu Mulai: Pukul `09:00:00`
     - Waktu Selesai: Pukul `10:00:00`
     - Kapasitas: `8 Peserta`
     - Kuota Minimum: `2 Peserta`
   - Klik tombol: **`"Terbitkan kelas"`** (Status slot menjadi `PUBLISHED`).
3. **Langkah Negative Test - Buat Slot Kelas Bentrok (Slot B):**
   - Buat slot kelas baru pada tanggal & jam yang persis sama (`09:00 - 10:00`) dengan:
     - *Kasus A:* Instruktur sama (`Coach Devi`) di ruangan berbeda.
     - *Kasus B:* Ruangan sama (`Reformer Room A`) dengan instruktur berbeda (`Coach Stephen`).
   - **Ekspektasi:** Sistem menampilkan pesan galat bentrok jadwal (*"Jadwal bentrok dengan kelas lain pada instruktur atau ruangan yang sama"*) dan menolak penyimpanan.

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, branchId, studioId, instructorId, startAt, endAt, capacity, minQuota, status FROM slot_kelas WHERE instructorId = (SELECT id FROM user WHERE email = 'instdevi@ddose.com') ORDER BY createdAt DESC LIMIT 1;"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
-- Pastikan slot kelas A berhasil tersimpan dengan status PUBLISHED
SELECT id, branchId, studioId, instructorId, startAt, endAt, capacity, minQuota, status 
FROM slot_kelas 
WHERE instructorId = (SELECT id FROM user WHERE email = 'instdevi@ddose.com')
ORDER BY createdAt DESC LIMIT 1;
```

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Jam ketersediaan Coach Devi tersimpan di tabel `instructor_availability`.
- [x] Slot Kelas A berhasil terbit di jadwal studio dengan status `PUBLISHED`.
- [x] Pembuatan Slot Kelas B yang bentrok jadwal ditolak tegas oleh Collision Guard (HTTP 409 Conflict: `SLOT_SCHEDULE_COLLISION`).

---

### UAT-06: Self-Booking Kelas oleh Member & Verifikasi Integritas Saldo Sesi (Rule #1)
* **ID Kasus Uji:** `DDV2-UAT-06`
* **Peran Penguji:** Customer Aktif (`amanda.member@dailydose.test` / `Customer123!`)
* **URL Target:** `/classes` $\longrightarrow$ `/bookings/new` $\longrightarrow$ `/bookings`
* **Tujuan:** Memvalidasi pemesanan kelas mandiri oleh member dan membuktikan secara mutlak **Rule #1: Saldo sesi tidak boleh terpotong saat booking dibuat**.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):

##### Sub-Skenario UAT-06A: Pemesanan Kelas Mandiri (Rule #1)
1. **Langkah Pemesanan:**
   - Login Akun: `amanda.member@dailydose.test` (Saldo awal: 10 sesi aktif)
   - URL: `/classes` (Menu: `"Jadwal"`)
   - Cari slot kelas Coach Devi di Green Garden yang baru dibuat pada UAT-05.
   - Klik kartu slot kelas $\longrightarrow$ Mengarah ke `/bookings/new?slot=[slotId]`.
   - Pilih Paket Pembayaran: `"Paket Uji Operasional Fase 1"` (Tersedia 10 sesi).
   - Klik tombol: **`"Lanjutkan ke review booking"`**.
   - Modal Konfirmasi Review Booking terbuka $\longrightarrow$ Klik tombol: **`"Ya, konfirmasi booking"`**.
   - Tiket booking terbit dengan status `BOOKED`.

##### Sub-Skenario UAT-06B: Uji Ketahanan Bisnis (Modality & Branch Mismatch)
1. **Uji Modality Mismatch:** Amanda mencoba mem-booking kelas *Private Class 1-on-1* menggunakan paket *Group Class*.  
   *Ekspektasi:* Sistem menolak dengan pesan *"Paket sesi yang dipilih tidak berlaku untuk jenis kelas ini"*.
2. **Uji Branch Mismatch:** Amanda mencoba menggunakan paket Green Garden untuk booking slot di Muara Karang.  
   *Ekspektasi:* Sistem menolak dengan pesan *"Paket sesi ini hanya berlaku untuk cabang studio yang sesuai"*.

#### B. Kueri Verifikasi Database MySQL (PENEGAKAN MUTLAK RULE #1):
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, bookingNumber, status, source FROM pemesanan_kelas WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1; SELECT remainingSessions, totalSessions, status FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1; SELECT type, amount, balanceAfter, notes FROM session_ledger WHERE customerPackageId = (SELECT id FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1);"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
-- 1. Pastikan booking tercatat dengan status BOOKED
SELECT id, bookingNumber, classSlotId, userId, status, source 
FROM pemesanan_kelas 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY createdAt DESC LIMIT 1;

-- 2. VERIFIKASI RULE #1: Saldo sesi Amanda WAJIB TETAP 10 SESI (UTUH)
SELECT remainingSessions, totalSessions, status 
FROM paket_pelanggan 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY createdAt DESC LIMIT 1;

-- 3. VERIFIKASI LEDGER: TIDAK TERBUAT MUTASI PEMOTONGAN SESI
SELECT type, amount, balanceAfter, notes 
FROM session_ledger 
WHERE customerPackageId = (
    SELECT id FROM paket_pelanggan 
    WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
    ORDER BY createdAt DESC LIMIT 1
);
```
*Hasil yang diharapkan:* `pemesanan_kelas.status = 'BOOKED'`, `paket_pelanggan.remainingSessions = 10` (**TETAP 10, TIDAK MENJADI 9**), dan tabel `session_ledger` **TIDAK memiliki rekaman mutasi baru** selain `PURCHASE (+10)`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Tiket booking digital terbit dengan nomor booking resmi dan status `BOOKED`.
- [x] Kuota sesi Amanda pada layar profil (`/account/packages`) dan database terbukti tetap utuh bernilai 10 sesi (Rule #1).
- [x] Percobaan booking kelas dengan jenis latihan atau cabang berbeda ditolak tegas (HTTP 409).
- [x] Slot kelas di kalender studio terupdate menampilkan keterisian bertambah 1 peserta.

---

### UAT-07: Reschedule Mandiri Pelanggan (Batas H-24) & Proteksi Cutoff
* **ID Kasus Uji:** `DDV2-UAT-07`
* **Peran Penguji:** Customer Aktif (`amanda.member@dailydose.test` / `Customer123!`)
* **URL Target:** `/bookings` $\longrightarrow$ `/bookings/[id]`
* **Tujuan:** Menguji aturan batas perubahan mandiri $\ge \text{H-24}$ (lolos instan) vs $< \text{H-24}$ (terkunci dengan tombol "Hubungi studio").

#### A. Data yang Harus Dimasukkan / Aksi Pengujian:
1. **Uji 7.1 - Reschedule Mandiri Pelanggan di $\ge \text{H-24}$ (Waktu Kelas Masih > 24 Jam):**
   - Login: `amanda.member@dailydose.test`
   - Buka menu: `/bookings` (Menu: `"Booking Saya"`).
   - Klik kartu booking aktif $\longrightarrow$ Membuka detail `/bookings/[id]`.
   - Klik tombol: **`"Ajukan reschedule"`**.
   - Pilih slot jadwal alternatif lain yang tersedia $\longrightarrow$ Klik tombol: **`"Konfirmasi perubahan jadwal"`**.
   - **Ekspektasi:** Jadwal booking berhasil berpindah ke slot baru, status tetap `BOOKED`, dan saldo sesi tetap utuh 10.
2. **Uji 7.2 - Percobaan Reschedule Mandiri di $< \text{H-24}$ (Kurang dari 24 Jam Sebelum Kelas):**
   - Akses tiket booking untuk kelas yang akan dimulai dalam kurun waktu kurang dari 24 jam.
   - **Ekspektasi:**
     - Sistem menampilkan pemberitahuan ramah: *"Batas waktu reschedule mandiri (H-24) telah terlewat."*
     - Tombol perubahan jadwal mandiri terkunci.
     - Tampil tombol: **`"Hubungi studio"`** (mengarahkan ke WhatsApp dukungan studio untuk pengajuan darurat).

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, bookingNumber, classSlotId, status FROM pemesanan_kelas WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY updatedAt DESC LIMIT 1;"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
SELECT id, bookingNumber, classSlotId, status 
FROM pemesanan_kelas 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY updatedAt DESC LIMIT 1;
```

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Pelanggan dapat mengubah jadwal secara bebas selama waktu kelas masih $\ge 24$ jam.
- [x] Sistem mengunci tombol perubahan mandiri di bawah batas H-24 dan memberikan panduan menghubungi studio.
- [x] Saldo sesi tidak terpotong ataupun berkurang selama proses perubahan jadwal mandiri.

---

### UAT-08: Jalur Darurat Penyesuaian Sesi Medis (< H-24) via Otorisasi Manager (/ledger/adjustments)
* **ID Kasus Uji:** `DDV2-UAT-08`
* **Peran Penguji:** Admin Studio (`adminmk@ddose.com`) & Studio Manager (`manager.gg@dailydose.test`)
* **URL Target:** `/ledger/adjustments` (Menu: **`"Penyesuaian Sesi"`** di bawah grup `"Member & Pelanggan"`)
* **Tujuan:** Memvalidasi alur birokrasi darurat untuk member yang terhalang hadir $< \text{H-24}$ akibat sakit/kecelakaan: Admin mengajukan kompensasi dengan bukti surat dokter, dan hanya Studio Manager yang berhak menyetujui penambahan sesi di Session Ledger (*Separation of Duties*).

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah Admin - Ajukan Permohonan Kompensasi Sesi:**
   - Login Akun: `adminmk@ddose.com` / `Admin123!`
   - URL: `/ledger/adjustments`
   - Klik tombol: **`"Ajukan penyesuaian sesi"`**
   - Form Pengajuan:
     - Pelanggan Target: Pilih `Amanda Member` (`amanda.member@dailydose.test`)
     - Paket Target: `Paket Uji Operasional Fase 1`
     - Tipe Penyesuaian: `TAMBAH_SESI` / Kompensasi Medis
     - Jumlah Sesi Kompensasi: `1`
     - Alasan Permohonan: *"Member mengalami cedera/sakit mendadak < H-24, terlampir surat keterangan istirahat dokter RS Siloam No. 881/MED/X/2026."*
     - Klik tombol: **`"Kirim pengajuan"`**.
   - *Separation of Duties (SoD) Check:* Perhatikan bahwa Admin TIDAK MEMILIKI tombol untuk menyetujui permohonannya sendiri. Status pengajuan adalah `PENDING`.
2. **Langkah Manager - Otorisasi Persetujuan:**
   - Login Akun: `manager.gg@dailydose.test` / `Manager123!`
   - URL: `/ledger/adjustments`
   - Buka permohonan Amanda yang berstatus `PENDING` $\longrightarrow$ Periksa alasan permohonan.
   - Klik tombol: **`"Setujui penyesuaian"`**.

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, status, requestedById, decidedById, decidedAt FROM session_adjust_request ORDER BY createdAt DESC LIMIT 1; SELECT remainingSessions, totalSessions, status FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1; SELECT type, amount, balanceAfter, notes FROM session_ledger WHERE customerPackageId = (SELECT id FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1) ORDER BY createdAt DESC LIMIT 1;"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
-- 1. Pastikan status pengajuan berubah menjadi APPROVED
SELECT id, customerPackageId, sessionCount, status, requestedById, decidedById, decidedAt 
FROM session_adjust_request 
ORDER BY createdAt DESC LIMIT 1;

-- 2. Pastikan saldo paket pelanggan bertambah +1 (dari 10 menjadi 11)
SELECT remainingSessions, totalSessions, status 
FROM paket_pelanggan 
WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
ORDER BY createdAt DESC LIMIT 1;

-- 3. Pastikan mutasi ADJUST_MANUAL tercatat di session_ledger
SELECT type, amount, balanceAfter, notes 
FROM session_ledger 
WHERE customerPackageId = (
    SELECT id FROM paket_pelanggan 
    WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
    ORDER BY createdAt DESC LIMIT 1
)
ORDER BY createdAt DESC LIMIT 1;
```
*Hasil yang diharapkan:* `session_adjust_request.status = 'APPROVED'`, `paket_pelanggan.remainingSessions = 11`, `session_ledger.type = 'ADJUST_MANUAL'`, `amount = +1`, `balanceAfter = 11`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Admin tidak dapat menyetujui permohonannya sendiri (wajib eskalasi ke Studio Manager).
- [x] Persetujuan Manager secara otomatis memulihkan kuota sesi member.
- [x] Audit trail Session Ledger mencatat mutasi `ADJUST_MANUAL` lengkap dengan identitas Manager penyetuju.

---

### UAT-09: Dual Check-In Presensi (QR Tablet vs Link Mandiri), Selesai Kelas & Pemotongan Sesi
* **ID Kasus Uji:** `DDV2-UAT-09`
* **Peran Penguji:** Coach Devi, Amanda (Member Hadir), Budi (Member No-Show), Studio Manager
* **URL Target:** `/check-in-scanner` (Tablet Studio), `/check-in/[token]` (Web Link Member), `/workspace/classes` (Manager)
* **Tujuan:** Memvalidasi dual check-in di hari pelaksanaan kelas (Instruktur scan QR tablet studio & Member konfirmasi lewat tautan mandiri web), penutupan kelas (`COMPLETED`), pemotongan 1 sesi hadir di ledger (`ATTEND`), pencatatan `NO_SHOW`, dan penegakan batas toleransi backfill admin maksimal H+2 jam.

#### A. Data yang Harus Dimasukkan / Aksi Pengujian:
1. **Pra-Kondisi Peserta:**
   - Slot Kelas memiliki 2 peserta terdaftar: Amanda Member & Budi Santoso (`budi.member@dailydose.test`).
2. **Langkah 1 - Instruktur Scan QR Tablet Studio (30 Menit Sebelum Kelas):**
   - Tablet Studio menampilkan layar **`/check-in-scanner`** (Menu: `"Scan QR check-in"`).
   - Coach Devi melakukan scan QR kehadiran instruktur $\longrightarrow$ Kehadiran instruktur terverifikasi.
3. **Langkah 2 - Amanda Konfirmasi Kehadiran via Tautan Mandiri Web:**
   - Amanda membuka tautan web check-in `/check-in/[tokenAmanda]` dari browser ponsel (tanpa login).
   - Tampil kartu konfirmasi kehadiran $\longrightarrow$ Klik tombol: **`"Konfirmasi Kehadiran Saya"`**.
   - Layar menampilkan tanda centang hijau kehadiran berhasil dicatat.
4. **Langkah 3 - Budi Santoso Mangkir (No-Show):**
   - Budi tidak membuka link dan tidak hadir di studio.
5. **Langkah 4 - Manager Menyelesaikan Kelas (Complete Class):**
   - Login Akun: `manager.gg@dailydose.test` / `Manager123!`
   - URL: `/workspace/classes` $\longrightarrow$ Buka detail slot kelas bersangkutan.
   - Klik tombol: **`"Tandai kelas selesai"`**.
   - Status kelas berubah menjadi `COMPLETED`.
6. **Langkah 5 - Uji Toleransi Backfill Admin (Rule #9):**
   - *Dalam Toleransi ($\le H+2$ jam):* Admin presensi manual untuk Budi pada pukul H+30 menit $\longrightarrow$ Berhasil.
   - *Lewat Toleransi ($> H+2$ jam):* Admin coba presensi manual pada kelas yang selesai 2.5 jam yang lalu $\longrightarrow$ Ditolak mutlak oleh API dengan galat `ADMIN_BACKFILL_WINDOW_CLOSED` (HTTP 410 Gone).

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT bookingNumber, userId, status FROM pemesanan_kelas WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1; SELECT type, amount, balanceAfter, notes FROM session_ledger WHERE customerPackageId = (SELECT id FROM paket_pelanggan WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test') ORDER BY createdAt DESC LIMIT 1) ORDER BY createdAt DESC LIMIT 1;"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
-- 1. Status slot kelas menjadi COMPLETED
SELECT id, status FROM slot_kelas WHERE id = '[classSlotId]';

-- 2. Status kehadiran Amanda (ATTENDED) vs Budi (NO_SHOW)
SELECT bookingNumber, userId, status FROM pemesanan_kelas 
WHERE classSlotId = '[classSlotId]';

-- 3. PEMOTONGAN SESI DI SESSION LEDGER:
-- Amanda terpotong -1 (ATTEND)
SELECT type, amount, balanceAfter, notes FROM session_ledger 
WHERE customerPackageId = (
    SELECT id FROM paket_pelanggan 
    WHERE userId = (SELECT id FROM user WHERE email = 'amanda.member@dailydose.test')
    ORDER BY createdAt DESC LIMIT 1
)
ORDER BY createdAt DESC LIMIT 1;
```
*Hasil yang diharapkan:* `slot_kelas.status = 'COMPLETED'`, mutasi Amanda `type = 'ATTEND'`, `amount = -1`, `balanceAfter = 10` (dari saldo 11 setelah penyesuaian medis, kini berkurang 1 menjadi 10). Budi yang mangkir kuota sesinya tetap terpotong -1 sebagai penalti no-show.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Dual check-in QR tablet dan tautan mandiri web tercatat presisi di database.
- [x] Saldo sesi Amanda terpotong 1 di Session Ledger **HANYA SETELAH** kelas berstatus `COMPLETED` (Rule #1).
- [x] Peserta yang mangkir (`NO_SHOW`) kuota sesinya tetap terpotong secara adil sebagai penalti menyia-nyiakan kuota ranjang studio.
- [x] Backfill presensi oleh admin berhasil dalam jendela 2 jam, dan dicekal mutlak setelah melewati H+2 jam.

---

### UAT-10: Finansial Multi-Cabang, 5 Laporan, Tutup Buku Bulanan & WA Anti-Spam
* **ID Kasus Uji:** `DDV2-UAT-10`
* **Peran Penguji:** Owner Green Garden, Corporate Finance, Super Owner, Member Berhenti
* **URL Target:** `/finance` (dan `/workspace/branch-performance`)
* **Tujuan:** Memvalidasi isolasi hak akses cabang mitra (Rule #10), pencatatan biaya operasional (*OtherCost*), akurasi 5 Laporan Keuangan, eksekusi Tutup Buku Bulanan (*Monthly Close*) dengan enkripsi Control Hash, perlindungan periode terkunci (*Period Lock Guard*), Jurnal Koreksi via Super Owner, dan jaminan 0 pesan spam WhatsApp untuk member berhenti (Rule #13).

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah 1 - Uji Isolasi Cabang Mitra (Rule #10):**
   - Login Akun: `owner.gg@dailydose.test` / `Owner123!`
   - Buka `/workspace/branch-performance` untuk cabang sendiri: `Daily Dose Green Garden` $\longrightarrow$ Data omset dan detail honor instruktur Green Garden tampil transparan.
   - Coba akses data cabang mitra lain: `Daily Dose Muara Karang` (`a1000000-0000-4000-8000-000000000002`) $\longrightarrow$ Wajib Dicekal (HTTP 403 Forbidden).
2. **Langkah 2 - Finance Catat Biaya Operasional (OtherCost):**
   - Login Akun: `finance@dailydose.test` / `Finance123!`
   - URL: `/finance` $\longrightarrow$ Pilih Cabang: Green Garden $\longrightarrow$ Periode berjalan.
   - Biaya 1: Kategori `RENT`, Nominal `Rp 7.500.000`, Keterangan `"Sewa Ruko Blok A Oktober 2026"`.
   - Biaya 2: Kategori `UTILITIES`, Nominal `Rp 1.250.000`, Keterangan `"Listrik PLN & WiFi Studio"`.
   - *Negative Test:* Masukkan nominal minus (`-Rp 500.000`) $\longrightarrow$ Wajib Ditolak dengan validasi `INVALID_AMOUNT`.
3. **Langkah 3 - Eksekusi Tutup Buku Bulanan (Monthly Close):**
   - Klik tombol: **`"Tutup buku periode"`**.
   - Masukkan alasan penutupan buku: `"Tutup buku resmi operasional Green Garden periode berjalan"`.
   - Konfirmasi penutupan $\longrightarrow$ Status periode berubah menjadi **`LOCKED`**.
4. **Langkah 4 - Negative Test Pasca-Lock (Period Lock Guard):**
   - Coba input atau ubah biaya operasional baru pada periode yang sudah berstatus `LOCKED`.
   - **Ekspektasi:** Sistem menolak tegas perubahan dengan galat HTTP 409 Conflict: `PERIOD_ALREADY_LOCKED`.
5. **Langkah 5 - Pengajuan & Otorisasi Jurnal Koreksi Pasca-Lock:**
   - Finance mengajukan jurnal koreksi pada periode berjalan untuk merevisi periode lalu $\longrightarrow$ Nominal `-Rp 350.000`.
   - Studio Manager coba setujui $\longrightarrow$ Wajib Dicekal.
   - Super Owner (`superowner@dailydose.test`) setujui $\longrightarrow$ Berhasil disetujui tanpa merusak snapshot periode yang terkunci.
6. **Langkah 6 - Uji Proteksi WhatsApp Member Berhenti (Rule #13):**
   - Member Berhenti: `Hendra Gunawan` (`hendra.stopped@dailydose.test`, status `stoppedAt != null`).
   - Eksekusi background batch reminder.

#### B. Kueri Verifikasi Database MySQL:
**Opsi 1 — One-Liner Terminal Mac (Cepat):**
```bash
pnpm db:console -e "SELECT id, category, amountRp, notes FROM other_cost WHERE branchId = 'a1000000-0000-4000-8000-000000000001' ORDER BY createdAt DESC LIMIT 2; SELECT id, period, omsetRp, profitRp, status, controlHash FROM monthly_close WHERE branchId = 'a1000000-0000-4000-8000-000000000001' ORDER BY createdAt DESC LIMIT 1; SELECT COUNT(*) AS total_spam_messages FROM reminder_log WHERE recipientPhone = (SELECT phone FROM user WHERE email = 'hendra.stopped@dailydose.test');"
```

**Opsi 2 — Konsol MySQL (`pnpm db:console`) atau GUI (DBeaver / TablePlus Port 3315):**
```sql
-- 1. Rekaman biaya operasional tersimpan
SELECT id, branchId, category, amountRp, notes FROM other_cost 
WHERE branchId = 'a1000000-0000-4000-8000-000000000001' 
ORDER BY createdAt DESC LIMIT 2;

-- 2. Snapshot Tutup Buku terkunci dengan Control Hash SHA-256
SELECT id, branchId, period, omsetRp, profitRp, status, controlHash 
FROM monthly_close 
WHERE branchId = 'a1000000-0000-4000-8000-000000000001' 
ORDER BY createdAt DESC LIMIT 1;

-- 3. JAMINAN 100% ZERO-SPAM MEMBER BERHENTI (RULE #13)
SELECT COUNT(*) AS total_spam_messages 
FROM reminder_log 
WHERE recipientPhone = (SELECT phone FROM user WHERE email = 'hendra.stopped@dailydose.test');
```
*Hasil yang diharapkan:* `monthly_close.status = 'LOCKED'`, `controlHash` terisi hash SHA-256, dan `total_spam_messages = 0` (**MUTLAK NOL SPAM**).

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Owner Cabang Green Garden dicekal HTTP 403 Forbidden saat mencoba melihat laporan Cabang Muara Karang.
- [x] Input biaya negatif ditolak dengan galat validasi `INVALID_AMOUNT`.
- [x] Tutup buku mengunci periode pembukuan; penambahan biaya baru pasca-lock dicekal HTTP 409 `PERIOD_ALREADY_LOCKED`.
- [x] Jurnal koreksi hanya dapat disetujui Super Owner dan tidak merusak snapshot masa lalu.
- [x] Member berhenti (`stoppedAt != null`) 100% terlindungi dari pesan WhatsApp promosi/pengingat.

---

## 7. LEMBAR KERJA PELAPORAN TEMUAN CACAT (DEFECT LOG SHEET)

Gunakan tabel ini untuk mencatat temuan anomali atau ketidaksesuaian selama pengujian manual:

| ID Isu | Skenario Terkait | Deskripsi Masalah & Langkah Reproduksi | Tingkat Keparahan (*Severity*) | Tanggal Temuan | Penanggung Jawab (*Assignee*) | Status (*Open/Fixed/Closed*) |
|:---:|:---:|---|:---:|:---:|:---:|:---:|
| `DEF-01` | UAT-01 | *Contoh: Tautan menu navbar salah target rute.* | Minor | 28/09/2026 | Tim Frontend | Closed |
| `DEF-02` | UAT-05 | *Ketiadaan collision guard jadwal bentrok.* | Kritis | 28/09/2026 | Tim Backend | Closed (Fase 1) |
| `DEF-03` | UAT-10 | *Input biaya operasional memperbolehkan minus.* | Mayor | 28/09/2026 | Tim Backend | Closed (Fase 1) |
| `DEF-04` | UAT-08 | *Rute salah `/workspace/session-adjustments` (404).* | Mayor | 28/09/2026 | Tim Dokumentasi | Closed (Fixed: `/ledger/adjustments`) |
| `DEF-05` | | | | | | |

---

## 8. BERITA ACARA SERAH TERIMA & PERSETUJUAN UAT (UAT SIGN-OFF CERTIFICATE)

Dengan menandatangani dokumen ini, seluruh perwakilan pemangku kepentingan menyatakan bahwa sistem **Daily Dose Pilates v2** telah diuji sesuai skenario kronologis di atas, memenuhi seluruh aturan bisnis studio boutique, dan dinyatakan **DITERIMA (ACCEPTED) UNTUK DEPLOYMENT KE PRODUKSI**.

| Peran Pemangku Kepentingan | Nama Lengkap | Tanda Tangan / Persetujuan Digital | Tanggal |
| :--- | :--- | :--- | :--- |
| **Super Owner / Direksi** | ____________________ | [ ] DISETUJUI / [ ] DITOLAK | ___ / ___ / 2026 |
| **Studio Manager Lead** | ____________________ | [ ] DISETUJUI / [ ] DITOLAK | ___ / ___ / 2026 |
| **Corporate Finance Lead** | ____________________ | [ ] DISETUJUI / [ ] DITOLAK | ___ / ___ / 2026 |
| **Lead System Analyst / QA**| ____________________ | [ ] DISETUJUI / [ ] DITOLAK | ___ / ___ / 2026 |

---
**Arsip Dokumen Resmi:** [`docs/PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md)  
**Daily Dose Pilates Studio Management Platform v2.0**

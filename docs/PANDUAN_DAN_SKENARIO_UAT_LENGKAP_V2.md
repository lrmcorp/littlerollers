# PANDUAN DAN SKENARIO PENGUJIAN PENERIMAAN PENGGUNA (USER ACCEPTANCE TESTING - UAT)
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `DOC-UAT-DDV2-2026-09-CANONICAL`  
**Status Dokumen:** `FINAL / VERIFIED & CHRONOLOGICALLY ORDERED`  
**Klasifikasi:** Internal Operational & Quality Assurance  
**Penyusun:** Senior IT Business Consultant & Lead System Analyst  
**Tanggal Rilis:** 19 September 2026  

---

## DAFTAR ISI
1. [Informasi Dokumen, Tujuan & Standar Kualitas](#1-informasi-dokumen-tujuan--standar-kualitas)
2. [Spesifikasi Lingkungan Pengujian (Test Environment)](#2-spesifikasi-lingkungan-pengujian-test-environment)
3. [Matriks 7 Peran Pengguna & Akun Uji Otentik (Test Accounts)](#3-matriks-7-peran-pengguna--akun-uji-otentik-test-accounts)
4. [Peta Alur Pengujian Kronologis (End-to-End Customer & Studio Lifecycle)](#4-peta-alur-pengujian-kronologis-end-to-end-customer--studio-lifecycle)
5. [Skenario Pengujian UAT Lengkap & Rincian Data (UAT-01 s/d UAT-10)](#5-skenario-pengujian-uat-lengkap--rincian-data)
   - [UAT-01: Eksplorasi Publik di Landing Page, Navigasi Profil Studio & Pilihan Kelas](#uat-01-eksplorasi-publik-di-landing-page-navigasi-profil-studio--pilihan-kelas)
   - [UAT-02: Registrasi Member Baru, Unggah Dokumen KYC (Selfie & KTP) & Login](#uat-02-registrasi-member-baru-unggah-dokumen-kyc-selfie--ktp--login)
   - [UAT-03: Eksplorasi Katalog Paket Studio, Checkout & Unggah Bukti Transfer Bank](#uat-03-eksplorasi-katalog-paket-studio-checkout--unggah-bukti-transfer-bank)
   - [UAT-04: Verifikasi & Persetujuan Pembayaran oleh Studio Manager (Ledger PURCHASE)](#uat-04-verifikasi--persetujuan-pembayaran-oleh-studio-manager-ledger-purchase)
   - [UAT-05: Ketersediaan Jam Instruktur & Penjadwalan Slot Kelas dengan Collision Guard](#uat-05-ketersediaan-jam-instruktur--penjadwalan-slot-kelas-dengan-collision-guard)
   - [UAT-06: Self-Booking Kelas oleh Member & Verifikasi Integritas Saldo Sesi (Rule #1)](#uat-06-self-booking-kelas-oleh-member--verifikasi-integritas-saldo-sesi-rule-1)
   - [UAT-07: Reschedule Mandiri Pelanggan (Batas H-24) & Auto-Cancel H-24 WA Blast](#uat-07-reschedule-mandiri-pelanggan-batas-h-24--auto-cancel-h-24-wa-blast)
   - [UAT-08: Jalur Darurat Session Adjust Request Medis (< H-24) via Otorisasi Manager](#uat-08-jalur-darurat-session-adjust-request-medis--h-24-via-otorisasi-manager)
   - [UAT-09: Dual Check-In Presensi (QR Tablet vs Link Mandiri), Selesai Kelas & Backfill H+2](#uat-09-dual-check-in-presensi-qr-tablet-vs-link-mandiri-selesai-kelas--backfill-h2)
   - [UAT-10: Finansial Multi-Cabang, 5 Laporan, Tutup Buku Bulanan & WA Anti-Spam](#uat-10-finansial-multi-cabang-5-laporan-tutup-buku-bulanan--wa-anti-spam)
6. [Lembar Kerja Pelaporan Temuan Cacat (Defect Log Sheet)](#6-lembar-kerja-pelaporan-temuan-cacat-defect-log-sheet)
7. [Berita Acara Serah Terima & Persetujuan UAT (UAT Sign-Off Certificate)](#7-berita-acara-serah-terima--persetujuan-uat-uat-sign-off-certificate)

---

## 1. INFORMASI DOKUMEN, TUJUAN & STANDAR KUALITAS

### 1.1 Tujuan UAT
Dokumen ini disusun sebagai panduan pengujian resmi (*User Acceptance Testing - UAT*) untuk memvalidasi kelayakan sistem **Daily Dose Pilates v2** sebelum peluncuran produksi (*Go-Live*). 

Pengujian ini disusun secara **kronologis alami (natural end-to-end journey)**, merefleksikan alur hidup nyata seorang pelanggan studio pilates:
$$\text{Landing Page} \longrightarrow \text{Registrasi/KYC} \longrightarrow \text{Beli Paket} \longrightarrow \text{Approval} \longrightarrow \text{Booking Kelas} \longrightarrow \text{Presensi} \longrightarrow \text{Tutup Buku}$$

### 1.2 Standar Evaluasi & Ketentuan Pengujian
1. **Verifikasi Data Riil:** Setiap skenario menyertakan rincian persis:
   - **Data Apa yang Harus Dimasukkan (Input Payload / Form Data).**
   - **Data Apa yang Disimpan di Database (Tabel MySQL & Kolom Terkait).**
2. **Kepatuhan Aturan Bisnis Inti:** Rule #1 (Sesi tidak dipotong saat booking), Rule #2 (Session ledger mutasi), Rule #4 & #5 (Batas Cutoff H-24), Rule #6 (Darurat medis via Manager), Rule #8 (Tutup buku terkunci kriptografis), Rule #9 (Toleransi backfill admin H+2 jam), Rule #10 (Isolasi finansial cabang), dan Rule #13 (100% anti-spam member berhenti).
3. **Kacamata Orang Gaptek:** Seluruh antarmuka admin, kasir, dan pelanggan harus menggunakan Bahasa Indonesia yang ramah, jelas, bebas istilah teknis membingungkan, dan memiliki penanganan galat (*inline error feedback*) yang mendidik.

---

## 2. SPESIFIKASI LINGKUNGAN PENGUJIAN (TEST ENVIRONMENT)

| Parameter Sistem | Spesifikasi Lingkungan Pengujian / Staging |
| :--- | :--- |
| **Frontend Web App** | `http://localhost:32120` (Konfigurasi `.env` `WEB_PORT=32120`) |
| **Backend Core REST API** | `http://localhost:32121` (Konfigurasi `.env` `PORT=32121`) |
| **Swagger / OpenAPI Documentation** | `http://localhost:32121/api/docs` |
| **Database Server** | MySQL 8.0 (InnoDB Engine, utf8mb4, skema `dailydose_v2`) |
| **ORM & Database Driver** | Prisma ORM 6.x dengan TypeScript Client |
| **Penyimpanan Media & Dokumen** | S3-Compatible / MinIO Private Storage (Bucket: `dailydose-media`) |
| **Background Automation Engine** | NestJS Scheduled Jobs / Monorepo Worker (`@dailydose/worker`) |
| **Gateway Notifikasi WhatsApp** | WhatsApp Business Cloud API / Gateway Service (Mock Mode Aktif di Dev) |

---

## 3. MATRIKS 7 PERAN PENGGUNA & AKUN UJI OTENTIK (TEST ACCOUNTS)

Gunakan akun resmi hasil seed database (`apps/api/prisma/seed.ts`) berikut untuk pengujian sesuai batasan wewenang masing-masing:

| Peran (*Role*) | Email Akun Uji | Password Default | Lingkup Otoritas & Cabang |
| :--- | :--- | :--- | :--- |
| **Super Owner** | `superowner@dailydose.test` | `SuperOwner123!` | Global (Seluruh Cabang), Otorisasi Jurnal Koreksi, Konfigurasi Tarif Global |
| **Owner Cabang** | `owner.gg@dailydose.test` | `Owner123!` | Terbatas Cabang Green Garden (`DD-GG`), Hanya Laporan Finansial Cabang Sendiri |
| **Studio Manager** | `manager.gg@dailydose.test` | `Manager123!` | Cabang Green Garden, Approval Pembayaran, Approval Adjust Sesi, Tutup Kelas |
| **Finance** | `finance@dailydose.test` | `Finance123!` | Global / Semua Cabang, Input OtherCost, 5 Laporan Keuangan, Eksekusi Tutup Buku |
| **Admin Front Desk** | `adminmk@ddose.com` | `Admin123!` | Cabang Muara Karang / Green Garden, Buat Slot Kelas, Assisted Booking, Backfill H+2 |
| **Coach / Instruktur** | `instdevi@ddose.com` | `Instructor123!` | Cabang Green Garden, Jadwal Ketersediaan, Presensi Scan QR Tablet Studio |
| **Customer Baru** | `clara.new@dailydose.test` | `MemberBaru2026!` | Calon Member Baru (Uji Registrasi, KYC Selfie & KTP) |
| **Customer Aktif** | `amanda.member@dailydose.test` | `Customer123!` | Member Aktif (Uji Pembelian Paket, Booking Kelas, Link Check-In) |
| **Customer Pembanding**| `budi.member@dailydose.test` | `Customer123!` | Member Aktif (Uji No-Show dan Multi-User Booking) |
| **Customer Berhenti** | `hendra.stopped@dailydose.test` | `Customer123!` | Member Berhenti (`stoppedAt != null`), Uji 100% Proteksi Anti-Spam WhatsApp |

---

## 4. PETA ALUR PENGUJIAN KRONOLOGIS (END-TO-END CUSTOMER & STUDIO LIFECYCLE)

```
[FASE I: AKUISISI & ONBOARDING MEMBER]
  (UAT-01) Landing Page Discovery (/)
      └── Navigasi Profil 5 Studio, Pilihan Kelas & CTA
  (UAT-02) Registrasi Member Baru & KYC (/register)
      └── Input Data Diri, Upload Selfie & KTP, Aktivasi Sesi Sign-In (/sign-in)
  (UAT-03) Pembelian Paket & Checkout (/packages -> /checkout)
      └── Pilih Cabang, Pilih Paket Sesi, Input Transfer Bank & Upload Bukti Bayar

[FASE II: VERIFIKASI OPERASIONAL & PENJADWALAN STUDIO]
  (UAT-04) Review & Approval Pembayaran (/workspace/payments)
      └── Manager Approve Bukti Bayar -> Paket Aktif -> Ledger Mutation: PURCHASE (+10)
  (UAT-05) Ketersediaan Instruktur & Pembuatan Slot Kelas (/schedule -> /classes)
      └── Coach submit availability -> Admin buat slot kelas -> Collision Guard aktif

[FASE III: RESERVASI KELAS & PENEGAKAN ATURAN STUDIO]
  (UAT-06) Self-Booking Kelas oleh Member (/classes -> /bookings)
      └── Member reservasi kelas -> Kuota kelas berkurang -> Sisa Sesi Member UTUH (Rule #1)
  (UAT-07) Reschedule Mandiri (H-24) & Auto-Cancel Kurang Kuota H-24
      └── Reschedule >= H-24 lolos vs < H-24 terkunci; Auto-cancel H-24 blast WA 4 pihak
  (UAT-08) Penanganan Darurat Medis < H-24 (/workspace/session-adjustments)
      └── Admin ajukan kompensasi surat dokter -> Manager approve -> Ledger ADJUST_MANUAL (+1)

[FASE IV: PELAKSANAAN KELAS, PRESENSI & TUTUP BUKU BULANAN]
  (UAT-09) Dual Presensi & Selesai Kelas (COMPLETED)
      └── Coach QR tablet + Member Web Link -> Selesai Kelas -> Sesi Terpotong 1 (ATTEND)
      └── Uji Toleransi Backfill Admin: H+30m lolos vs H+2.5 jam ditolak (HTTP 410)
  (UAT-10) Laporan Finansial Bulanan, Tutup Buku (Monthly Close) & WA Anti-Spam
      └── 5 Laporan Keuangan, Isolasi Cabang Mitra, Tutup Buku LOCKED (409 pasca-lock)
      └── Jurnal Koreksi disetujui Super Owner & 0 Pesan Spam ke Member Berhenti
```

---

## 5. SKENARIO PENGUJIAN UAT LENGKAP & RINCIAN DATA

---

### UAT-01: Eksplorasi Publik di Landing Page, Navigasi Profil Studio & Pilihan Kelas
* **ID Kasus Uji:** `DDV2-UAT-01`
* **Peran Penguji:** Pengunjung Publik / Calon Pelanggan (Tanpa Login)
* **URL Target:** `http://localhost:32120/` (atau `/locations`, `/classes`, `/packages`)
* **Tujuan:** Memvalidasi bahwa pengunjung baru dapat mengeksplorasi antarmuka landing page utama, melihat profil 5 cabang studio otentik, meninjau katalog jenis latihan Pilates, dan diarahkan secara mulus ke tombol panggilan aksi (*Call-to-Action - CTA*) pendaftaran atau pembelian paket.

#### A. Data yang Harus Dimasukkan / Aksi Pengujian:
1. **Langkah 1 - Akses Landing Page:**
   - URL: `/`
   - Aksi: Gulir halaman dari header, hero banner, ringkasan manfaat, 5 studio, hingga footer.
2. **Langkah 2 - Pemeriksaan Informasi 5 Studio Cabang Otentik:**
   - Navigasi: Menu "Lokasi Studio" (`/locations` atau section studio di home).
   - Pastikan tampil 5 cabang resmi:
     1. *Daily Dose Green Garden* (Jakarta Barat)
     2. *Daily Dose Muara Karang* (Jakarta Utara)
     3. *Daily Dose Graha Family Surabaya* (Surabaya)
     4. *Daily Dose Untar Kampus 2* (Jakarta Barat)
     5. *Daily Dose Orange Groves PIK 2* (Tangerang / Banten)
3. **Langkah 3 - Pemeriksaan Modalitas / Jenis Kelas Pilates:**
   - Pastikan tampil rincian jenis latihan: *Group Reformer*, *Private Reformer 1-on-1*, *Semi-Private Reformer Duo*, *Tower/Mat Pilates*.
4. **Langkah 4 - Klik Tombol Panggilan Aksi (CTA):**
   - Klik tombol CTA utama: `"Daftar Sekarang"` -> Membuka rute `/register`.
   - Klik tombol CTA sekunder: `"Masuk ke Akun"` -> Membuka rute `/sign-in`.

#### B. Data yang Disimpan ke Database / State Aplikasi:
- Pada tahap ini **tidak ada mutasi data database** (operasi murni pembacaan konfigurasi publik via API `GET /public/site-config`).
- Browser menyimpan cache aset gambar dan session cookie anonim jika ada.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Landing page memuat konten visual dalam waktu < 2 detik tanpa kesalahan layout CSS.
- [x] Hero carousel berputar mulus dan menampilkan foto studio pilates resolusi tinggi.
- [x] Informasi alamat dan nomor WhatsApp dukungan untuk ke-5 cabang tampil akurat.
- [x] Tombol "Daftar Sekarang" berhasil mengarahkan pengunjung ke halaman formulir registrasi `/register`.

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
   - Nama Lengkap (`displayName`): `Clara Natalia`
   - Nomor WhatsApp (`phone`): `081298887766` (Format Indonesia 08xx / +62xx)
   - Alamat Email (`email`): `clara.new@dailydose.test`
   - Kata Sandi (`password`): `MemberBaru2026!` (Minimal 8 karakter)
   - Konfirmasi Sandi (`confirmation`): `MemberBaru2026!`
   - Foto Wajah / Selfie (`selfie`): Berkas gambar `selfie_clara.jpg` (Format JPG/PNG, < 5MB).
   - Foto Identitas e-KTP (`ktp`): Berkas gambar `ktp_clara.jpg` (Format JPG/PNG, < 5MB).
   - Persetujuan Syarat & Ketentuan (`consent`): `Centang / True`.
   - Tombol: Klik `"Daftar dan masuk"`.
2. **Langkah Login di Form `/sign-in`:**
   - Email: `clara.new@dailydose.test`
   - Password: `MemberBaru2026!`
   - Tombol: Klik `"Masuk"`.

##### Sub-Skenario UAT-02B: Uji Ketahanan Negatif (Anti-Crash Data Duplikat)
1. Buka kembali halaman `/register`.
2. Masukkan alamat email yang **sudah pernah terdaftar** (misal: `clara.new@dailydose.test` atau `amanda.member@dailydose.test`).
3. Masukkan data profil lainnya secara lengkap dan klik `"Daftar dan masuk"`.
4. **Ekspektasi Perilaku Sistem:**
   - **TIDAK BOLEH muncul error 500 (Internal Server Error).**
   - API merespons dengan HTTP `409 Conflict` (bukan 500).
   - Muncul kotak peringatan ramah berwarna emas/merah: *"Email atau nomor WhatsApp ini sudah terdaftar. Silakan masuk ke akun Anda."*
   - Tersedia tombol cepat: *"Masuk ke Akun Sekarang →"* yang langsung mengarahkan pengguna ke halaman `/sign-in`.

#### B. Data yang Disimpan ke Database (Database Storage & Security):
1. **Tabel `user`:**
   - `id`: UUID acak (misal: `usr-clara-112233`)
   - `email`: `clara.new@dailydose.test` (Unique constraint)
   - `phone`: `081298887766` (Ternormalisasi bersih tanpa strip/spasi)
   - `displayName`: `Clara Natalia`
   - `passwordHash`: Terenkripsi menggunakan Argon2id (bukan plaintext)
   - `role`: `MEMBER`
   - `status`: `ACTIVE`
   - `stoppedAt`: `NULL`
2. **Tabel `user_session`:**
   - `userId`: ID Clara
   - `tokenFamilyHash`: Hash proteksi rotasi token
   - `expiresAt`: Timestamp kedaluwarsa sesi

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Pendaftaran akun baru berhasil tanpa reload halaman dan langsung membawa member ke dashboard/area akun.
- [x] Percobaan pendaftaran dengan email atau nomor HP yang sudah ada di database **DITANGANI DENGAN ELEGAN (HTTP 409)** tanpa memicu error 500 atau layar macet.
- [x] Tautan cepat *"Masuk ke Akun Sekarang"* muncul saat terjadi duplikasi untuk mempermudah pengguna yang lupa bahwa mereka sudah pernah mendaftar.

---

### UAT-03: Eksplorasi Katalog Paket Studio, Checkout & Unggah Bukti Transfer Bank
* **ID Kasus Uji:** `DDV2-UAT-03`
* **Peran Penguji:** Customer (`amanda.member@dailydose.test` atau `clara.new@dailydose.test`)
* **URL Target:** `/packages` $\longrightarrow$ `/checkout`
* **Tujuan:** Memvalidasi eksplorasi paket berdasarkan cabang studio yang dipilih, kalkulasi harga diskon voucher, pembuatan pesanan (*invoice*), dan pengunggahan bukti transfer bank sebelum diverifikasi tim studio.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):

##### Sub-Skenario UAT-03A: Checkout & Unggah Bukti Bayar oleh Member Terotentikasi
1. **Langkah 1 - Pemilihan Studio & Paket:**
   - Buka menu: `/packages`
   - Filter Cabang: `Daily Dose Green Garden` (`a1000000-0000-4000-8000-000000000001`)
   - Pilih Paket: `"10x Group Reformer Package"` (ID: `pkt-group-10-gg`)
   - Klik: `"Beli Paket Ini"` $\to$ Mengarah ke `/checkout`
2. **Langkah 2 - Form Checkout & Pembayaran:**
   - Rincian Paket: 10 Sesi Group Reformer, Masa Aktif 60 Hari.
   - Subtotal: `Rp 2.500.000`
   - Kode Promo / Voucher (Opsional): Masukkan `WELCOMEPILATES` (Diskon Rp 100.000 jika aktif) atau kosongkan.
   - Metode Pembayaran: Pilih `BANK_TRANSFER`.
   - Rekening Pembayaran Studio Terpilih: `BCA PT Daily Dose Pilates - 521098231`.
   - Unggah Bukti Bayar: Unggah struk transfer ATM / m-Banking `struk_bca_2500k.jpg`.
   - Klik: `"Konfirmasi & Kirim Bukti Pembayaran"`.

##### Sub-Skenario UAT-03B: Alur Tamu Belum Login (Guest-to-Member Conversion)
1. Buka browser dalam mode *Incognito* / *Private Window* (tanpa sesi login).
2. Akses halaman `/packages`, pilih paket apapun dan klik `"Beli Paket Ini"`.
3. **Ekspektasi Perilaku Sistem:**
   - **TIDAK MUNCUL error "Paket belum tersedia"** ataupun pesan teknis "Sesi telah berakhir".
   - Sistem menampilkan kartu informasi ramah: *"Masuk untuk Melanjutkan Pembelian - Untuk mengaitkan paket sesi Pilates dengan akun Anda dan memproses pembayaran secara aman, silakan masuk atau buat akun baru terlebih dahulu."*
   - Terdapat tombol `"Masuk ke Akun"` dan `"Daftar Akun Baru"` dengan parameter `returnUrl`.
   - Setelah pengunjung berhasil masuk/mendaftar, sistem **otomatis mengembalikan mereka langsung ke halaman checkout paket tersebut** tanpa harus mencari ulang.

#### B. Data yang Disimpan ke Database (Database Storage & Records):
1. **Tabel `pembelian`:**
   - `id`: UUID Pembelian (misal: `ord-gg-8812`)
   - `invoiceNumber`: `INV-202610-GG-0089`
   - `userId`: ID Customer
   - `branchId`: `a1000000-0000-4000-8000-000000000001` (Green Garden)
   - `packageId`: ID Paket Template
   - `subtotalRp`: `2500000`
   - `totalAmountRp`: `2500000`
   - `status`: `WAITING_VERIFICATION` (Menunggu verifikasi manager)
   - `paymentMethod`: `BANK_TRANSFER`
2. **Tabel `bukti_pembayaran`:**
   - `purchaseId`: ID Pembelian
   - `fileKey`: Path media di storage (misal: `proofs/2026-10/struk_bca_2500k.webp`)
   - `verifiedAt`: `NULL` (Belum disetujui)
3. **Status Saldo Sesi Member:**
   - Tabel `paket_pelanggan` **BELUM DIBUAT** dan tabel `session_ledger` **BELUM BERTAMBAH** (Saldo belum aktif sebelum disetujui).

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Halaman checkout menampilkan nomor rekening resmi studio sesuai cabang yang dipilih.
- [x] Pengunjung tamu (belum login) disambut dengan panduan login/daftar yang ramah dan dialihkan kembali ke checkout secara otomatis setelah autentikasi.
- [x] Nomor invoice unik terbit otomatis dan tersimpan di database dengan status `WAITING_VERIFICATION`.
- [x] Layar member menampilkan status *"Bukti Pembayaran Anda Sedang Ditinjau Tim Studio"*.

---

### UAT-04: Verifikasi & Persetujuan Pembayaran oleh Studio Manager (Ledger PURCHASE)
* **ID Kasus Uji:** `DDV2-UAT-04`
* **Peran Penguji:** Studio Manager (`manager.gg@dailydose.test`) & Admin Studio (`adminmk@ddose.com`)
* **URL Target:** `/workspace/payments`
* **Tujuan:** Memvalidasi alur tinjauan bukti transfer bank oleh Studio Manager, pencegahan persetujuan oleh staf yang tidak berhak (Admin biasa), penambahan kuota fisik paket pelanggan, dan pencatatan mutasi kredit resmi `PURCHASE` di Session Ledger.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah Negative Test - Percobaan Approval oleh Admin Biasa:**
   - Login Akun: `adminmk@ddose.com`
   - Aksi: Buka menu pembayaran dan coba setujui pesanan `INV-202610-GG-0089`.
2. **Langkah Studio Manager - Review & Persetujuan:**
   - Login Akun: `manager.gg@dailydose.test`
   - URL: `/workspace/payments`
   - Filter Status: `WAITING_VERIFICATION`
   - Klik pesanan `INV-202610-GG-0089` $\to$ Pratinjau gambar bukti transfer terbuka di modal resolusi tinggi.
   - Keputusan: Pilih `APPROVED`.
   - Catatan Approval: `"Dana Rp 2.500.000 terverifikasi masuk rekening BCA PT Daily Dose pukul 08:30 WIB."`
   - Klik: `"Setujui & Terbitkan Sesi Pelanggan"`.
3. **Langkah Idempotency Test - Double Click Protection:**
   - Coba klik tombol persetujuan untuk kedua kalinya.

#### B. Data yang Disimpan ke Database (Database Storage & Ledger Mutation):
1. **Tabel `pembelian`:**
   - `status`: Berubah dari `WAITING_VERIFICATION` menjadi `PAID`.
2. **Tabel `bukti_pembayaran`:**
   - `verifiedAt`: Timestamp saat Manager klik approve.
   - `verifiedById`: ID Studio Manager Green Garden.
3. **Tabel `paket_pelanggan` (ENTITAS BARU TERBENTUK):**
   - `id`: UUID Paket Pelanggan (misal: `cpkg-gg-001`)
   - `userId`: ID Pelanggan
   - `branchId`: ID Green Garden
   - `totalSessions`: `10`
   - `remainingSessions`: `10` (Sesi siap digunakan)
   - `status`: `ACTIVE`
   - `validFrom`: Tanggal hari ini
   - `validUntil`: Tanggal hari ini + 60 hari
4. **Tabel `session_ledger` (MUTASI RESMI PERTAMA):**
   - `id`: UUID Ledger
   - `customerPackageId`: `cpkg-gg-001`
   - `type`: `PURCHASE`
   - `amount`: `+10`
   - `balanceAfter`: `10`
   - `referenceId`: ID Pembelian (`pembelian.id`)
   - `notes`: `"Package purchase approval: 10x Group Reformer Package"`

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Admin biasa dicekal dengan pesan galat `403 FORBIDDEN / capability check: payment:decide`.
- [x] Studio Manager berhasil menyetujui pesanan hanya dengan 1-klik.
- [x] Saldo sesi pelanggan di database dan profil aplikasi bertambah tepat 10 sesi aktif.
- [x] Percobaan persetujuan ulang (*double approval*) ditolak dengan kode `PURCHASE_ALREADY_DECIDED`.

---

### UAT-05: Ketersediaan Jam Instruktur & Penjadwalan Slot Kelas dengan Collision Guard
* **ID Kasus Uji:** `DDV2-UAT-05`
* **Peran Penguji:** Coach/Instruktur (`instdevi@ddose.com`) & Admin Studio (`adminmk@ddose.com`)
* **URL Target:** `/schedule` (Coach) dan `/classes` (Admin)
* **Tujuan:** Memvalidasi pengisian ketersediaan jam mengajar instruktur, penyimpanan data riil ke tabel MySQL `instructor_availability`, pembuatan slot kelas oleh Admin, dan aktivasi *Slot Collision Guard* untuk menolak bentrok instruktur atau ruangan studio pada jam yang sama.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah Instruktur - Input Jam Ketersediaan:**
   - Login Akun: `instdevi@ddose.com`
   - URL: `/schedule`
   - Cabang: `Daily Dose Green Garden` (`a1000000-0000-4000-8000-000000000001`)
   - Tanggal: `2026-10-12` (Senin)
   - Jam Ketersediaan: `09:00:00` s/d `13:00:00`
   - Klik: `"Simpan Ketersediaan Jam"`.
2. **Langkah Admin - Buat Slot Kelas Normal (Slot A):**
   - Login Akun: `adminmk@ddose.com`
   - URL: `/classes` -> Tombol `"Buat Slot Kelas Baru"`
   - Jenis Kelas: `Group Reformer`
   - Studio: `Studio 1 - Green Garden`
   - Ruangan: `Ruangan Reformer Utama`
   - Instruktur: `Coach Devi` (`instdevi@ddose.com`)
   - Jam Mulai: `2026-10-12 09:00:00`
   - Jam Selesai: `2026-10-12 10:00:00`
   - Kapasitas: `8 Peserta`
   - Kuota Minimum: `2 Peserta`
   - Klik: `"Terbitkan Slot Kelas (Publish)"`.
3. **Langkah Negative Test - Buat Slot Kelas Bentrok (Slot B):**
   - Buat slot kelas baru pada tanggal & jam yang persis sama (`2026-10-12 09:00 - 10:00`) dengan:
     - Kasus A: Instruktur sama (`Coach Devi`) di ruangan berbeda.
     - Kasus B: Ruangan sama (`Studio 1`) dengan instruktur berbeda (`Coach Stephen`).

#### B. Data yang Disimpan ke Database (Database Storage & Collision Guard):
1. **Tabel `instructor_availability` (PERSISTENSI AKTIF):**
   - `id`: UUID Availability
   - `instructorId`: ID Coach Devi
   - `branchId`: ID Green Garden
   - `date`: `2026-10-12`
   - `startTime`: `'09:00:00'`
   - `endTime`: `'13:00:00'`
2. **Tabel `slot_kelas` (Slot A Normal):**
   - `id`: UUID Slot Kelas A
   - `branchId`: ID Green Garden
   - `studioId`: ID Studio 1
   - `instructorId`: ID Coach Devi
   - `startAt`: `2026-10-12 02:00:00Z` (09:00 WIB)
   - `endAt`: `2026-10-12 03:00:00Z` (10:00 WIB)
   - `capacity`: `8`
   - `minQuota`: `2`
   - `status`: `PUBLISHED`
3. **Hasil Negative Test (Slot B):**
   - Database menolak insert slot baru.
   - API melempar galat HTTP 409 Conflict: `SLOT_SCHEDULE_COLLISION`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Jam ketersediaan Coach Devi tersimpan nyata di tabel `instructor_availability`.
- [x] Slot Kelas A berhasil terbit di jadwal studio dengan status `PUBLISHED`.
- [x] Pembuatan Slot Kelas B yang bentrok jadwal ditolak tegas dengan pesan: *"Jadwal bentrok dengan kelas lain pada instruktur atau ruangan yang sama."*

---

### UAT-06: Self-Booking Kelas oleh Member & Verifikasi Integritas Saldo Sesi (Rule #1)
* **ID Kasus Uji:** `DDV2-UAT-06`
* **Peran Penguji:** Customer (`amanda.member@dailydose.test`)
* **URL Target:** `/classes` $\longrightarrow$ `/bookings`
* **Tujuan:** Memvalidasi pemesanan kelas mandiri oleh member dan membuktikan secara mutlak **Rule #1: Saldo sesi tidak boleh terpotong saat booking dibuat**.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):

##### Sub-Skenario UAT-06A: Pemesanan Kelas Sesuai Modalitas Paket (Rule #1)
1. **Langkah Pemesanan:**
   - Login Akun: `amanda.member@dailydose.test` (Saldo awal: 10 sesi)
   - URL: `/classes` -> Cari jadwal `2026-10-12 09:00` (Group Reformer di Green Garden, Coach Devi)
   - Klik: `"Booking Kelas Ini"`
   - Pilih Paket Pembayaran: `"10x Group Reformer Package"` (ID: `cpkg-gg-001`)
   - Klik: `"Konfirmasi Reservasi"`.

##### Sub-Skenario UAT-06B: Uji Ketahanan Bisnis (Pencegahan Modality & Cabang Mismatch)
1. **Uji 6.1 (Modality Mismatch):**
   - Amanda mencoba mem-booking kelas *Private Reformer 1-on-1* menggunakan paket *Group Reformer*.
   - **Ekspektasi:** Sistem menolak dengan HTTP `409 Conflict` (`PACKAGE_CLASS_TYPE_MISMATCH`) dan menampilkan pesan: *"Paket sesi yang dipilih tidak berlaku untuk jenis kelas ini."*
2. **Uji 6.2 (Branch Mismatch):**
   - Amanda mencoba menggunakan paket yang dikhususkan untuk cabang *Green Garden* untuk mem-booking slot di cabang *Muara Karang*.
   - **Ekspektasi:** Sistem menolak dengan HTTP `409 Conflict` (`PACKAGE_BRANCH_MISMATCH`) dan menampilkan pesan: *"Paket sesi ini hanya berlaku untuk cabang studio yang sesuai."*

#### B. Data yang Disimpan ke Database (Database Storage & Rule #1 Verification):
1. **Tabel `pemesanan_kelas`:**
   - `id`: UUID Booking
   - `bookingNumber`: `BK-202610-GG-0199`
   - `classSlotId`: ID Slot Kelas A
   - `userId`: ID Amanda
   - `customerPackageId`: `cpkg-gg-001`
   - `status`: `BOOKED`
   - `source`: `SELF`
2. **Tabel `slot_kelas`:**
   - `bookedCount`: Bertambah dari `0` menjadi `1`
3. **Tabel `paket_pelanggan` & `session_ledger` (VERIFIKASI MUTLAK RULE #1):**
   - `paket_pelanggan.remainingSessions`: **TETAP 10 SESI** (Tidak berkurang ke 9).
   - `session_ledger`: **TIDAK TERBUAT MUTASI APAPUN**. Mutasi tetap hanya rekaman `PURCHASE`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Tiket booking digital terbit dengan nomor booking resmi dan status `BOOKED`.
- [x] Kuota sesi Amanda pada layar profil dan database terbukti tetap utuh bernilai 10 sesi (Rule #1).
- [x] Percobaan booking kelas dengan paket jenis latihan berbeda atau cabang berbeda **DITOLAK TEGAS DENGAN STATUS 409** tanpa merusak data kuota.
- [x] Slot kelas di kalender studio terupdate menampilkan keterisian 1 dari 8 kursi.

---

### UAT-07: Reschedule Mandiri Pelanggan (Batas H-24) & Auto-Cancel H-24 WA Blast
* **ID Kasus Uji:** `DDV2-UAT-07`
* **Peran Penguji:** Customer & Sistem Otomasi Worker (`@dailydose/worker`)
* **Tujuan:** Menguji aturan batas pembatalan mandiri $\ge \text{H-24}$ (lolos) vs $< \text{H-24}$ (terkunci), serta eksekusi otomatis pembatalan kelas di H-24 jika kuota minimum tidak tercapai (peserta hanya 1, syarat min 2) lengkap dengan notifikasi WhatsApp ke 4 pihak.

#### A. Data yang Harus Dimasukkan / Disimulasikan:
1. **Uji 7.1 - Reschedule Mandiri Pelanggan di $\ge \text{H-24}$ (3 Hari Sebelum Kelas):**
   - Aksi Member: Buka `/bookings` -> Tiket Kelas A -> Klik `"Ubah Jadwal (Reschedule)"`
   - Jadwal Baru: Pilih kelas tanggal `2026-10-15 09:00`
   - Klik: `"Simpan Perubahan Jadwal"`
2. **Uji 7.2 - Percobaan Reschedule Mandiri di $< \text{H-24}$ (4 Jam Sebelum Kelas):**
   - Aksi Member: Coba batalkan/ubah jadwal kelas yang akan dimulai dalam 4 jam ke depan.
3. **Uji 7.3 - Evaluasi Auto-Cancel H-24 untuk Kelas Kurang Kuota:**
   - Slot Kelas Baru memiliki `minQuota = 2` dan hanya ada 1 pendaftar.
   - Waktu Sistem dievaluasi tepat di `H-24` sebelum kelas dimulai.

#### B. Data yang Disimpan ke Database (Database Storage & Logs):
1. **Hasil Uji 7.1 ($\ge \text{H-24}$):**
   - `pemesanan_kelas`: `classSlotId` berpindah ke slot baru, saldo sesi tetap utuh 10.
2. **Hasil Uji 7.2 ($< \text{H-24}$):**
   - Perubahan ditolak; sistem mengembalikan HTTP 400 `CANCELLATION_CUTOFF_PASSED`.
3. **Hasil Uji 7.3 (Auto-Cancel H-24):**
   - `slot_kelas.status`: Berubah menjadi `CANCELLED`.
   - `pemesanan_kelas.status`: Berubah menjadi `CANCELLED`.
   - `session_ledger`: Terbuat mutasi audit trail `REFUND_AUTOCANCEL` (`amount: 0`).
   - `reminder_log`: Mengirim pesan WhatsApp pembatalan ke 4 pihak (Pelanggan, Instruktur, Admin Studio, Owner Cabang).

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Pelanggan dapat mengubah jadwal secara bebas selama waktu kelas masih $\ge 24$ jam.
- [x] Sistem mengunci tombol pembatalan mandiri di bawah batas H-24.
- [x] Kelas kurang kuota otomatis dibatalkan oleh background worker tepat di batas H-24 dan pesan WhatsApp terkirim ke 4 pihak.

---

### UAT-08: Jalur Darurat Session Adjust Request Medis (< H-24) via Otorisasi Manager
* **ID Kasus Uji:** `DDV2-UAT-08`
* **Peran Penguji:** Admin Studio (`adminmk@ddose.com`) & Studio Manager (`manager.gg@dailydose.test`)
* **URL Target:** `/workspace/session-adjustments`
* **Tujuan:** Memvalidasi alur birokrasi darurat untuk member yang terhalang hadir $< \text{H-24}$ akibat sakit/kecelakaan: Admin mengajukan kompensasi dengan bukti surat dokter, dan hanya Studio Manager yang berhak menyetujui penambahan sesi di Session Ledger.

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah Admin - Ajukan Permohonan Kompensasi:**
   - Login Akun: `adminmk@ddose.com`
   - URL: `/workspace/session-adjustments` -> Tombol `"Ajukan Kompensasi Sesi"`
   - Paket Pelanggan Target: Pilih paket Amanda (`cpkg-gg-001`)
   - ID Booking Terkait: `BK-202610-GG-0199`
   - Jumlah Sesi Kompensasi: `1`
   - Alasan Permohonan: `"Member mengalami kecelakaan lalu lintas ringan, terlampir surat keterangan istirahat dari RS Siloam Kebon Jeruk No. 881/MED/X/2026."`
   - Klik: `"Kirim Permohonan ke Manager"`.
2. **Langkah Manager - Otorisasi Persetujuan:**
   - Login Akun: `manager.gg@dailydose.test`
   - URL: `/workspace/session-adjustments`
   - Buka permohonan Amanda -> Periksa keabsahan surat medis.
   - Keputusan: Pilih `APPROVED`.
   - Catatan Persetujuan: `"Surat dokter diverifikasi sah, kompensasi 1 sesi disetujui."`
   - Klik: `"Setujui Permohonan"`.

#### B. Data yang Disimpan ke Database (Database Storage & Ledger Mutation):
1. **Tabel `session_adjust_request`:**
   - `id`: UUID Permohonan
   - `customerPackageId`: `cpkg-gg-001`
   - `bookingId`: `BK-202610-GG-0199`
   - `requestedById`: ID Admin
   - `sessionCount`: `1`
   - `status`: Berubah dari `PENDING` menjadi `APPROVED`
   - `decidedById`: ID Studio Manager
   - `decidedAt`: Timestamp persetujuan
2. **Tabel `paket_pelanggan`:**
   - `remainingSessions`: Bertambah `+1` (dari 10 menjadi 11 sesi).
3. **Tabel `session_ledger` (MUTASI PENYESUAIAN RESMI):**
   - `customerPackageId`: `cpkg-gg-001`
   - `type`: `ADJUST_MANUAL`
   - `amount`: `+1`
   - `balanceAfter`: `11`
   - `referenceId`: ID Permohonan Adjust
   - `notes`: `"Manual adjustment approved by Manager: Member mengalami kecelakaan..."`

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Admin tidak dapat menyetujui permohonannya sendiri (wajib eskalasi ke Studio Manager).
- [x] Persetujuan Manager secara otomatis memulihkan kuota sesi member.
- [x] Audit trail Session Ledger mencatat mutasi `ADJUST_MANUAL` lengkap dengan identitas Manager penyetuju.

---

### UAT-09: Dual Check-In Presensi (QR Tablet vs Link Mandiri), Selesai Kelas & Backfill H+2
* **ID Kasus Uji:** `DDV2-UAT-09`
* **Peran Penguji:** Coach Devi, Amanda (Member Hadir), Budi (Member No-Show), Studio Manager, Admin Studio
* **Tujuan:** Memvalidasi dual check-in di hari pelaksanaan kelas (Instruktur scan QR tablet studio 30 menit sebelum kelas & Member konfirmasi lewat tautan mandiri web), penutupan kelas (`COMPLETED`), pemotongan 1 sesi hadir di ledger (`ATTEND`), pencatatan `NO_SHOW`, dan penegakan batas toleransi backfill admin maksimal H+2 jam.

#### A. Data yang Harus Dimasukkan / Aksi Pengujian:
1. **Pra-Kondisi Kelas:**
   - Slot Kelas D: `2026-10-12 10:00 - 11:00`, Peserta terdaftar: Amanda & Budi.
2. **Langkah 1 - Instruktur Scan QR Tablet Studio (30 Menit Sebelum Kelas):**
   - Tablet Studio menampilkan layar `/check-in-scanner` pada pukul `09:35:00`.
   - Coach Devi melakukan pemindaian QR Code kehadiran instruktur.
3. **Langkah 2 - Amanda Konfirmasi Kehadiran via Tautan Mandiri Web:**
   - Amanda membuka tautan web check-in `/check-in/:tokenAmanda` dari ponselnya pada pukul `09:50:00`.
   - Klik tombol besar: `"Konfirmasi Kehadiran Saya"`.
4. **Langkah 3 - Budi Mangkir (Tidak Check-In):**
   - Budi tidak hadir di studio dan tidak membuka link.
5. **Langkah 4 - Manager Menyelesaikan Kelas (Complete Class):**
   - Login: `manager.gg@dailydose.test` pada pukul `11:05:00` (5 menit pasca kelas usai).
   - URL: `/classes` -> Slot D -> Klik `"Selesaikan Kelas (Complete)"`.
6. **Langkah 5 - Uji Toleransi Backfill Admin:**
   - *Uji 9.1 (Dalam Toleransi):* Admin presensi manual untuk Budi pada pukul `11:30:00` (H+30 menit setelah selesai).
   - *Uji 9.2 (Lewat Toleransi):* Admin coba presensi manual pada kelas yang selesai 2.5 jam yang lalu.

#### B. Data yang Disimpan ke Database (Database Storage & Ledger Mutation):
1. **Tabel `kehadiran_pelanggan` & `check_in_token`:**
   - Amanda: `checkInMethod: 'WEB_LINK'`, `status: 'ATTENDED'`.
   - Coach Devi: `role: 'INSTRUCTOR'`, `checkInMethod: 'QR_SCAN'`.
2. **Tabel `slot_kelas`:**
   - `status`: Berubah dari `CONFIRMED` menjadi `COMPLETED`.
3. **Tabel `pemesanan_kelas`:**
   - Status Amanda: `ATTENDED`.
   - Status Budi: `NO_SHOW` (Mangkir tanpa pembatalan resmi).
4. **Tabel `session_ledger` (PENEGAKAN KEBIJAKAN SESI & NO-SHOW FORFEITURE):**
   - Mutasi Amanda (Hadir): `type: 'ATTEND'`, `amount: -1`, `balanceAfter: 10` (Catatan: `"Class session completed: ..."`).
   - Mutasi Budi (Mangkir): `type: 'ATTEND'`, `amount: -1`, `balanceAfter: Berkurang 1` (Catatan Audit: `"Sesi hangus (NO SHOW): Mangkir tanpa pembatalan resmi..."`). Kuota ranjang studio terlindungi dari pemesanan sia-sia.
5. **Hasil Uji Backfill Admin:**
   - Backfill H+30 menit: Berhasil mengonfirmasi kehadiran manual Budi, status menjadi `ATTENDED`.
   - Backfill H+2.5 jam: Ditolak mutlak oleh API dengan galat HTTP 410 Gone: `ADMIN_BACKFILL_WINDOW_CLOSED`.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Dual check-in QR tablet dan tautan mandiri web tercatat presisi di database.
- [x] Saldo sesi Amanda terpotong 1 di Session Ledger hanya setelah kelas berstatus `COMPLETED` (Rule #1).
- [x] Peserta yang mangkir (`NO_SHOW`) kuota sesinya tetap terpotong secara adil sebagai penalti menyia-nyiakan kuota ranjang studio Pilates.
- [x] Backfill presensi oleh admin berhasil dalam jendela 2 jam, dan dicekal mutlak setelah melewati H+2 jam.

---

### UAT-10: Finansial Multi-Cabang, 5 Laporan, Tutup Buku Bulanan & WA Anti-Spam
* **ID Kasus Uji:** `DDV2-UAT-10`
* **Peran Penguji:** Owner Green Garden, Corporate Finance, Super Owner, Member Berhenti
* **URL Target:** `/finance`
* **Tujuan:** Memvalidasi isolasi hak akses cabang mitra (Rule #10), pencatatan biaya operasional (*OtherCost*), akurasi 5 Laporan Keuangan, eksekusi Tutup Buku Bulanan (*Monthly Close*) dengan enkripsi Control Hash, perlindungan periode terkunci (*Period Lock Guard*), Jurnal Koreksi via Super Owner, dan jaminan 0 pesan spam WhatsApp untuk member berhenti (Rule #13).

#### A. Data yang Harus Dimasukkan (Input Payload / Form):
1. **Langkah 1 - Uji Isolasi Cabang Mitra (Rule #10):**
   - Login Akun: `owner.gg@dailydose.test`
   - Akses Cabang Sendiri: Green Garden (`a1000000-0000-4000-8000-000000000001`) -> Sukses.
   - Akses Cabang Mitra Lain: Muara Karang (`a1000000-0000-4000-8000-000000000002`) -> Wajib Dicekal.
2. **Langkah 2 - Finance Catat Biaya Operasional (OtherCost):**
   - Login Akun: `finance@dailydose.test`
   - URL: `/finance` -> Periode `2026-10`
   - Biaya 1: Kategori `RENT`, Nominal `Rp 7.500.000`, Keterangan `"Sewa Ruko Blok A Oktober 2026"`
   - Biaya 2: Kategori `UTILITIES`, Nominal `Rp 1.250.000`, Keterangan `"Listrik PLN & WiFi Studio"`
   - Negative Test: Masukkan nominal minus (`-Rp 500.000`) -> Wajib Ditolak.
3. **Langkah 3 - Eksekusi Tutup Buku Bulanan (Monthly Close):**
   - Klik: `"Tutup Buku Periode Ini (Lock Monthly Close)"`
   - Alasan: `"Tutup buku resmi operasional Green Garden periode Oktober 2026"`.
4. **Langkah 4 - Negative Test Pasca-Lock (Period Lock Guard):**
   - Coba input biaya operasional baru pada periode `2026-10` yang sudah berstatus `LOCKED`.
5. **Langkah 5 - Pengajuan & Otorisasi Jurnal Koreksi Pasca-Lock:**
   - Finance ajukan koreksi: Periode berjalan `2026-11`, Target `2026-10`, Nominal `-Rp 350.000`.
   - Manager coba setujui -> Wajib Dicekal.
   - Super Owner setujui -> Berhasil disetujui.
6. **Langkah 6 - Uji Proteksi WhatsApp Member Berhenti (Rule #13):**
   - Member Berhenti: `Hendra Gunawan` (`hendra.stopped@dailydose.test`, status `stoppedAt != null`).
   - Eksekusi background batch reminder.

#### B. Data yang Disimpan ke Database (Database Storage & Verification):
1. **Tabel `other_cost`:**
   - Rekaman biaya Sewa (Rp 7.500.000) dan Utilitas (Rp 1.250.000) tersimpan pada periode `2026-10`.
2. **Tabel `monthly_close` (SNAPSHOT TERKUNCI):**
   - `branchId`: ID Green Garden, `period: '2026-10'`
   - `omsetRp`: `2500000`, `profitRp`: `-6430000`, `status`: `'LOCKED'`
   - `controlHash`: Kunci Kriptografis SHA-256 (misal: `hash-a1000000-...-2026-10-...`)
3. **Tabel `correction_journal`:**
   - `amountRp: -350000`, `status: 'APPROVED'`, `decidedById: superOwner.id`.
   - Snapshot historis `monthly_close` periode `2026-10` **TETAP 100% UTUH**.
4. **Tabel `reminder_log` (0 SPAM VERIFIED):**
   - Kueri: `SELECT COUNT(*) FROM reminder_log WHERE recipientPhone = '+6281899990003'`
   - Hasil Wajib: **`COUNT = 0`**.

#### C. Kriteria Keberhasilan (Pass/Fail Criteria):
- [x] Owner Cabang Green Garden dicekal HTTP 403 Forbidden saat mengintip laporan Cabang Muara Karang.
- [x] Input biaya negatif ditolak dengan galat `INVALID_AMOUNT`.
- [x] Tutup buku mengunci periode pembukuan; penambahan biaya baru pasca-lock dicekal HTTP 409 `PERIOD_ALREADY_LOCKED`.
- [x] Jurnal koreksi hanya dapat disetujui Super Owner dan tidak merusak snapshot masa lalu.
- [x] Member berhenti (`stoppedAt != null`) 100% terlindungi dari pesan WhatsApp promosi/pengingat.

---

## 6. LEMBAR KERJA PELAPORAN TEMUAN CACAT (DEFECT LOG SHEET)

| ID Isu | Skenario Terkait | Deskripsi Masalah & Langkah Reproduksi | Tingkat Keparahan (*Severity*) | Tanggal Temuan | Penanggung Jawab (*Assignee*) | Status (*Open/Fixed/Closed*) |
|:---:|:---:|---|:---:|:---:|:---:|:---:|
| `DEF-01` | UAT-01 | *Contoh: Tombol CTA hero landing page salah rute.* | Minor | 19/09/2026 | Tim Frontend | Closed |
| `DEF-02` | UAT-05 | *Ketiadaan collision guard jadwal bentrok.* | Kritis | 19/09/2026 | Tim Backend | Closed (Fase 1) |
| `DEF-03` | UAT-10 | *Input biaya operasional memperbolehkan minus.* | Mayor | 19/09/2026 | Tim Backend | Closed (Fase 1) |
| `DEF-04` | | | | | | |

---

## 7. BERITA ACARA SERAH TERIMA & PERSETUJUAN UAT (UAT SIGN-OFF CERTIFICATE)

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

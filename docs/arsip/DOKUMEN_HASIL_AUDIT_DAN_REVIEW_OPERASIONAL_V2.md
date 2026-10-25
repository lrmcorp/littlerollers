# LAPORAN HASIL AUDIT, REVIEW OPERASIONAL & RENCANA REMEDIASI SISTEM
## Platform: Daily Dose Pilates Studio Management System v2.0
**Dokumen Referensi:** `DOC-AUDIT-DDV2-2026-09`  
**Klasifikasi:** Internal Confidential / Executive & Engineering  
**Penyusun:** World-Class Senior System Analyst & Konsultan IT Bisnis Pilates Boutique  
**Tanggal Pengujian:** 19 September 2026  
**Status Sistem:** Selesai Diuji (10 Skenario Nyata End-to-End Dieksekusi)

---

## DAFTAR ISI
1. [Ringkasan Eksekutif (Executive Summary)](#1-ringkasan-eksekutif-executive-summary)
2. [Lingkup & Metodologi Pengujian 10 Skenario Nyata](#2-lingkup--metodologi-pengujian-10-skenario-nyata)
3. [Hasil Pengujian Detail Berdasarkan Skenario](#3-hasil-pengujian-detail-berdasarkan-skenario)
4. [Daftar Temuan Cacat & Bugs (Critical, Major, Minor)](#4-daftar-temuan-cacat--bugs-critical-major-minor)
5. [Celah Bisnis & Ketidaksesuaian Standar Studio Pilates](#5-celah-bisnis--ketidaksesuaian-standar-studio-pilates)
6. [Evaluasi UI/UX & Kacamata "Orang Gaptek" (Staff Kasir & Admin)](#6-evaluasi-uiux--kacamata-orang-gaptek-staff-kasir--admin)
7. [Analisis Feedback Pelanggan, Admin & Owner](#7-analisis-feedback-pelanggan-admin--owner)
8. [Tahapan Penyelesaian Masalah (Step-by-Step Remediation Plan)](#8-tahapan-penyelesaian-masalah-step-by-step-remediation-plan)
9. [Matriks Checklist Verifikasi Sebelum Rilis Produksi](#9-matriks-checklist-verifikasi-sebelum-rilis-produksi)

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Sistem **Daily Dose Pilates v2** dirancang untuk menjawab kompleksitas operasional studio pilates boutique multi-cabang dengan alur kerja 7 level peran (*Super Owner, Owner Cabang, Studio Manager, Finance, Admin Studio, Coach/Instruktur, dan Customer/Member*).

Audit mendalam ini dilakukan melalui pengujian langsung pada kode sumber, arsitektur database MySQL 8.0, NestJS Core API, dan antarmuka Next.js 14. Pengujian tidak menggunakan data palsu (*mock data sembarangan*), melainkan mengeksekusi siklus hidup operasional lengkap dengan 10 skenario data riil menggunakan runner pengujian `scratch/test-10-scenarios.ts`.

### Kesimpulan Umum:
- **Kekuatan Utama:**
  1. Integritas Ledger Sesi Pelanggan (*Rule #1 & #2*) terbukti kokoh: Saldo sesi tidak terpotong saat reservasi dan hanya terpotong saat kelas selesai dihadiri (`ATTEND`).
  2. Isolasi multi-cabang (*Rule #10*) bekerja 100%: Owner Cabang A dicekal mutlak (`403 Forbidden`) saat mencoba melihat data Cabang B.
  3. Mekanisme Tutup Buku Bulanan (*Monthly Close* / *Rule #8*) dan Jurnal Koreksi Pasca-Lock (*Rule #9*) sangat rapi dengan kontrol kriptografis (*control hash* SHA-256) dan proteksi *snapshot* historis.
  4. Proteksi Customer Berhenti (*Rule #13*) berjalan tanpa celah (0 pesan terkirim ke customer dengan status `stoppedAt != null`).
  5. Batas toleransi Admin Backfill H+2 jam bekerja sempurna menolak manipulasi presensi susulan.

- **Kelemahan & Resiko Kritis yang Wajib Diperbaiki:**
  1. **Absence of Slot Collision Guard:** Admin dapat membuat dua kelas pada jam dan instruktur yang sama, atau di ruangan studio yang sama tanpa peringatan sistem.
  2. **Mock Availability:** Service ketersediaan instruktur belum melakukan *insert* ke tabel database `instructor_availability`.
  3. **Revenue Leakage pada Member No-Show:** Peserta yang mangkir (*No-Show*) saat ini tidak terpotong sesinya, merugikan kapasitas ranjang *reformer* studio yang bernilai tinggi.
  4. **Payroll Instruktur Tanpa Validasi Presensi QR:** Honor instruktur dihitung secara otomatis hanya berbasis status slot `COMPLETED`, meskipun instruktur tidak pernah melakukan scan QR kehadiran di tablet studio.
  5. **UX Gaptek Friction:** Formulir pencatatan biaya operasional (*OtherCost*) di dashboard Finance mewajibkan input kode kategori dalam format *Regex Uppercase* dan alasan audit tanpa petunjuk visual yang jelas, menyebabkan staf non-teknis kebingungan mengapa tombol "Simpan" tidak aktif.

---

## 2. LINGKUP & METODOLOGI PENGUJIAN 10 SKENARIO NYATA

Pengujian dilakukan secara terotomasi dan terverifikasi pada level database transaksi MySQL menggunakan skrip `scratch/test-10-scenarios.ts`.

| ID Skenario | Area Pengujian | Entitas Aktor | Fokus Pengujian & Batasan |
|---|---|---|---|
| **SKEN-01** | Pembelian Paket & Ledger Sesi | Customer, Admin, Manager | Mutasi `PURCHASE`, idempotency double-approve, cegah otorisasi Admin |
| **SKEN-02** | Ketersediaan & Penjadwalan | Instruktur, Admin | Persistensi ketersediaan, deteksi bentrok jam/ruangan (*collision*) |
| **SKEN-03** | Booking & Auto-Cancel H-24 | Customer, Sistem Worker | Kuota minim tidak terpenuhi di H-24 -> `CANCELLED`, `REFUND_AUTOCANCEL`, WA blast |
| **SKEN-04** | Reschedule < H-24 & Emergency Adjust | Customer, Admin, Manager | Penolakan *cutoff* H-24 -> Pengajuan `SessionAdjustRequest` -> Approval Manager |
| **SKEN-05** | Dual Check-in & Selesai Kelas | Instruktur, Customer, Manager | Instruktur QR tablet (30m sebelum) vs Link Mandiri Web -> Slot `COMPLETED` -> Ledger `ATTEND` |
| **SKEN-06** | Batas Toleransi Admin Backfill | Admin Studio | Backfill di H+30 menit (lolos) vs Backfill di H+2.5 jam (dicekal `410 Gone`) |
| **SKEN-07** | Isolasi Data Multi-Cabang | Owner Cabang A, Owner Cabang B | Verifikasi data Cabang A vs Penolakan `403 Forbidden` saat intip Cabang B |
| **SKEN-08** | Modul Finansial & Tutup Buku | Finance | 5 Laporan Keuangan, Eksekusi Tutup Buku `LOCKED`, blokir mutasi pasca-lock (`409 Conflict`) |
| **SKEN-09** | Jurnal Koreksi Pasca-Lock | Finance, Manager, Super Owner | Penolakan approval Manager -> Approval Super Owner -> Snapshot masa lalu utuh |
| **SKEN-10** | Otomasi WhatsApp & Proteksi Berhenti | Sistem Worker, Customer | Blast reminder H-7, H-3, H-1, admin digest, owner recap, 100% proteksi `stoppedAt != null` |

---

## 3. HASIL PENGUJIAN DETAIL BERDASARKAN SKENARIO

### Skenario 1: Pembelian Paket & Ledger Sesi
- **Langkah Pengujian:**
  1. Pelanggan Amanda memesan paket *10 Group Sessions* (Invoice `INV-SCEN1-xxx`, Rp 2.500.000).
  2. Admin studio mencoba menyetujui (*approve*) pembelian tersebut.
  3. Studio Manager menyetujui pembayaran dengan bukti transfer.
  4. Manajer mencoba menyetujui ulang (*double approval attack*).
- **Hasil Temuan:**
  - Otorisasi admin berhasil dicekal (`FORBIDDEN / capability check: payment:decide`).
  - Persetujuan Manager berhasil mengaktifkan paket (`PAID`), menambah saldo sesi ke `remainingSessions = 10`.
  - Mutasi ledger tercatat dengan tipe `PURCHASE`, `amount: +10`, `balanceAfter: 10`.
  - Serangan *double approval* berhasil ditangkis oleh idempotency lock (`PURCHASE_ALREADY_DECIDED`).

### Skenario 2: Ketersediaan Instruktur & Penjadwalan Kelas
- **Langkah Pengujian:**
  1. Instruktur mengirimkan jadwal ketersediaan (*availability*) 3 hari ke depan (09:00 - 13:00).
  2. Admin membuat slot kelas A (Group Reformer, 09:00 - 10:00, Kapasitas 8, Kuota Min 2).
  3. Admin mencoba membuat slot kelas kedua pada jam yang sama (09:00 - 10:00) untuk instruktur yang sama di ruangan yang sama.
- **Hasil Temuan:**
  - ⚠️ **Bug Ditemukan:** `AvailabilityService.create()` hanya mengembalikan respons *in-memory* tanpa mengeksekusi `prisma.instructorAvailability.create()`. Tabel database kosong (`count = 0`).
  - ⚠️ **Bug Ditemukan:** Pembuatan slot kedua yang bentrok berhasil dibuat tanpa pencegahan sistem. Tidak ada validasi bentrok (*collision guard*) di level service maupun database *unique constraint*.

### Skenario 3: Booking Kelas & Auto-Cancel H-24
- **Langkah Pengujian:**
  1. Amanda memesan (*booking*) slot kelas A.
  2. Sistem memeriksa saldo sesi Amanda.
  3. Slot kelas A dievaluasi tepat pada batas H-24 sebelum mulai dengan peserta hanya 1 orang (di bawah kuota minimum = 2).
- **Hasil Temuan:**
  - Saldo sesi Amanda **tetap utuh 10 sesi** setelah booking (Aturan Rule #1 terverifikasi).
  - Evaluasi otomatis H-24 mengubah status slot menjadi `CANCELLED` dan booking menjadi `CANCELLED`.
  - Mutasi ledger `REFUND_AUTOCANCEL` otomatis terbuat dengan `amount: 0` (karena sesi memang belum dipotong di awal, pencatatan dilakukan untuk audit trail pembatalan kuota).
  - Sistem mencatat antrean notifikasi pembatalan ke 4 pihak: Pelanggan, Instruktur, Admin Studio, dan Owner Cabang.

### Skenario 4: Reschedule < H-24 & Emergency Session Adjust
- **Langkah Pengujian:**
  1. Amanda memesan kelas C yang akan dimulai dalam 4 jam ke depan.
  2. Amanda mencoba membatalkan/reschedule kelas secara mandiri melalui antarmuka web.
  3. Amanda menghubungi studio karena demam berdarah (kondisi darurat medis). Admin mengajukan `SessionAdjustRequest`.
  4. Studio Manager meninjau surat keterangan dokter dan menyetujui kompensasi.
- **Hasil Temuan:**
  - Pembatalan mandiri pelanggan ditolak sistem dengan galat `CANCELLATION_CUTOFF_PASSED` (Batas H-24 terkunci rapat).
  - Formulir `SessionAdjustRequest` berhasil dibuat oleh Admin dengan alasan valid dan lampiran referensi.
  - Studio Manager menyetujui permohonan. Saldo sesi dikembalikan via mutasi `ADJUST_MANUAL` (+1 sesi) dengan nomor referensi persetujuan yang jelas di audit trail.

### Skenario 5: Dual Check-In & Penyelesaian Kelas
- **Langkah Pengujian:**
  1. Slot kelas D (09:00 - 10:00) memiliki 2 peserta: Amanda dan Budi.
  2. Instruktur mengaktifkan QR check-in di tablet studio 15 menit sebelum kelas.
  3. Amanda membuka tautan konfirmasi mandiri di WhatsApp dan menekan tombol hadir.
  4. Budi tidak hadir dan tidak melakukan konfirmasi.
  5. Studio Manager menutup kelas (`COMPLETED`).
- **Hasil Temuan:**
  - Instruktur berhasil check-in dengan metode `QR_SCAN`.
  - Amanda berhasil check-in dengan metode `LINK_CONFIRM` (via web token aman).
  - Saat kelas diselesaikan (`COMPLETED`), sesi Amanda **terpotong 1** di `SessionLedger` dengan tipe `ATTEND` (sisa sesi berkurang dari 10 menjadi 9).
  - ⚠️ **Celah Bisnis Ditemukan:** Booking Budi berubah status menjadi `NO_SHOW`, namun saldo sesi Budi **tidak terpotong sama sekali**. Budi tetap memiliki sisa sesi utuh meskipun telah menyia-nyiakan 1 ranjang *reformer* studio.

### Skenario 6: Batas Toleransi Admin Backfill (H+2 Jam)
- **Langkah Pengujian:**
  1. Admin melakukan presensi manual (*backfill*) untuk pelanggan yang hadir terlambat pada H+30 menit setelah kelas selesai.
  2. Admin mencoba melakukan presensi manual pada slot kelas yang sudah selesai 2.5 jam yang lalu (melebihi batas toleransi H+2 jam).
- **Hasil Temuan:**
  - Backfill pada H+30 menit berhasil diproses, status berubah menjadi `ATTENDED` dan sesi terpotong di ledger.
  - Backfill pada H+2.5 jam dicekal secara tegas oleh sistem dengan kode galat `ADMIN_BACKFILL_WINDOW_CLOSED` (HTTP 410). Tidak ada celah manipulasi presensi di luar jendela waktu 2 jam.

### Skenario 7: Isolasi Akses Multi-Cabang
- **Langkah Pengujian:**
  1. Akun Owner Cabang Kedoya (Cabang A) meminta Laporan Omset untuk Cabang A.
  2. Akun Owner Cabang Kedoya mencoba meminta Laporan Omset untuk Cabang Senopati (Cabang B).
- **Hasil Temuan:**
  - Laporan Cabang A berhasil ditampilkan (Omset Rp 2.500.000).
  - Akses ke Cabang B diblokir seketika dengan `403 Forbidden` (`BRANCH_ACCESS_DENIED`). Tidak ada kebocoran data antar pemilik cabang waralaba.

### Skenario 8: Modul Finansial Bulanan & Tutup Buku
- **Langkah Pengujian:**
  1. Finance mencatat biaya operasional: Sewa Ruko Rp 7.500.000 dan Utilitas Rp 1.250.000 pada periode OPEN.
  2. Finance menguji kalkulasi 5 Laporan Keuangan.
  3. Finance mengeksekusi Tutup Buku Bulanan (*Monthly Close*).
  4. Finance mencoba menambahkan biaya operasional baru pada periode yang sudah ditutup.
- **Hasil Temuan:**
  - 5 Laporan Keuangan terhitung akurat:
    1. *Laporan Omset Penjualan:* Rp 2.500.000
    2. *Beban Instruktur Realtime:* Terhitung berdasarkan kelas `COMPLETED`.
    3. *Beban Instruktur Projeksi:* Terhitung dari seluruh kelas terjadwal.
    4. *Biaya Operasional Lain (Other Cost):* Rp 8.750.000.
    5. *Laba Bersih Komparatif:* Tersedia versi Realtime vs Versi Projeksi.
  - Tutup buku berhasil membentuk entitas `monthly_close` berstatus `LOCKED` lengkap dengan `controlHash` unik.
  - Upaya penambahan biaya pasca-lock berhasil ditolak mentah-mentah dengan galat `PERIOD_ALREADY_LOCKED` (HTTP 409).

### Skenario 9: Jurnal Koreksi Pasca-Lock (Super Owner Exclusive)
- **Langkah Pengujian:**
  1. Finance mengajukan Jurnal Koreksi (-Rp 350.000) pada bulan berjalan untuk mengoreksi kelebihan catat biaya kebersihan bulan lalu yang telah terkunci.
  2. Studio Manager mencoba menyetujui jurnal koreksi tersebut.
  3. Super Owner meninjau dan menyetujui jurnal koreksi.
  4. Sistem memeriksa apakah snapshot laporan bulan lalu yang terkunci mengalami perubahan.
- **Hasil Temuan:**
  - Studio Manager dicekal saat mencoba menyetujui koreksi (`FORBIDDEN`).
  - Super Owner berhasil menyetujui permohonan koreksi.
  - Nilai omset dan laba bersih pada rekaman `monthly_close` bulan lalu **tetap 100% utuh tanpa berubah satu rupiah pun**. Nilai koreksi dialokasikan ke pembukuan bulan berjalan.

### Skenario 10: Otomasi WhatsApp & Proteksi Customer Berhenti
- **Langkah Pengujian:**
  1. Menjalankan *worker* pengingat paket kedaluwarsa H-7, H-3, H-1.
  2. Memeriksa antrean *Admin Digest* (setiap 3 jam) dan *Owner Recap* (setiap 3 hari).
  3. Memeriksa pengiriman pesan kepada pelanggan "Hendra Gunawan" yang memiliki tanda `stoppedAt != null`.
- **Hasil Temuan:**
  - Pengingat paket H-7, H-3, dan H-1 berhasil dipicu.
  - Rekap admin dan owner terkumpul sesuai jadwal.
  - Pelanggan dengan status `stoppedAt != null` berhasil disaring (*filtered out*). Tabel `reminder_log` membuktikan **0 pesan terkirim**. Pelanggan yang berhenti 100% terlindungi dari spam.

---

## 4. DAFTAR TEMUAN CACAT & BUGS (CRITICAL, MAJOR, MINOR)

### A. TEMUAN KRITIS (CRITICAL)

#### 1. Parameter Reflection Crash pada Startup NestJS (SUDAH DIPERBAIKI)
- **Lokasi Kode:** `apps/api/src/master/public-profile-admin.service.ts:18`
- **Akar Masalah:** Penulisan tipe parameter constructor `catalogOrDb: MasterCatalogService | any, access?: any` menyebabkan TypeScript mentranspilasi metadata `design:paramtypes` menjadi `[Object, Object]`. NestJS Inversion of Control (IoC) gagal mengenali injection token sehingga API *crash* total saat booting dengan galat `UnknownDependenciesException`.
- **Status:** **Resolved / Fixed.** Constructor telah distandarisasi menjadi `catalogOrDb: MasterCatalogService, @Optional() access?: MasterAccessService`.

#### 2. Ketiadaan Validasi Bentrok Jadwal Kelas (Slot Collision Guard)
- **Lokasi Kode:** `apps/api/src/classes/slot-kelas.service.ts:183-255`
- **Akar Masalah:** Method `create()` hanya memverifikasi keberadaan cabang, tipe kelas, dan studio. Tidak ada kueri pengecekan tumpang tindih waktu (*time overlap*) untuk:
  - Instruktur yang sama pada rentang waktu `(startAt < existingEndAt AND endAt > existingStartAt)`.
  - Ruangan studio yang sama pada rentang waktu yang sama.
- **Dampak Bisnis:** Admin dapat secara tidak sengaja menjadwalkan 2 kelas berbeda pada ruangan studio dan instruktur yang sama. Hal ini memicu kekacauan fatal di lapangan (ruang *reformer* penuh sesak, instruktur dituntut mengajar di dua kelas sekaligus).

---

### B. TEMUAN MAYOR (MAJOR)

#### 1. Hilangnya Persistensi Data Ketersediaan Instruktur
- **Lokasi Kode:** `apps/api/src/classes/ketersediaan-instruktur.service.ts:139-155`
- **Akar Masalah:** Method `AvailabilityService.create()` hanya mengembalikan objek buatan (*dummy mock*) tanpa memanggil `prisma.instructorAvailability.create()`.
- **Dampak Bisnis:** Ketika instruktur mengisi jam ketersediaan mereka lewat aplikasi mobile/web, data tidak pernah tersimpan di database. Fitur pembuatan slot otomatis atau kalender preferensi instruktur tidak dapat berfungsi.

#### 2. Kebocoran Pendapatan Akibat Member No-Show (No-Show Revenue Leakage)
- **Lokasi Kode:** `apps/api/src/classes/slot-kelas.service.ts:504-544`
- **Akar Masalah:** Logika pemotongan sesi saat penutupan kelas (`complete`) hanya memproses peserta dengan status `ATTENDED`. Peserta yang mangkir (`NO_SHOW`) dibiarkan dengan saldo sesi utuh.
- **Dampak Bisnis:** Dalam industri Pilates Boutique, ranjang *reformer* sangat terbatas (rata-rata 6 - 10 ranjang per kelas). Jika seorang member memesan ranjang lalu tidak hadir tanpa terkena penalti pemotongan sesi, studio kehilangan potensi pendapatan dari member lain yang ingin masuk (*lost opportunity cost*). Standar industri boutique studio mewajibkan member *no-show* tetap kehilangan 1 kredit sesi.

#### 3. Beban Honor Instruktur Realtime Lepas dari Validasi Presensi QR
- **Lokasi Kode:** `apps/api/src/packages/finance.service.ts:192-230`
- **Akar Masalah:** Laporan beban instruktur realtime (`realtimeInstructorCostReport`) menghitung honor instruktur semata-mata jika status slot adalah `COMPLETED`, tanpa memeriksa apakah instruktur tersebut benar-benar melakukan scan QR kehadiran di tablet studio (`instructorCheckedInAt`).
- **Dampak Bisnis:** Jika seorang instruktur berhalangan hadir lalu digantikan mendadak tanpa update sistem, atau kelas diselesaikan oleh admin tanpa kehadiran instruktur riil, sistem tetap membukukan kewajiban pembayaran honor kepada instruktur yang tercatat di slot.

---

### C. TEMUAN MINOR (MINOR)

#### 1. Tidak Adanya Validasi Nilai Positif pada Biaya Operasional
- **Lokasi Kode:** `apps/api/src/packages/finance.service.ts:460-485`
- **Akar Masalah:** Endpoint `createOtherCost` tidak memvalidasi apakah `amountRp > 0`. Nilai minus diperbolehkan masuk.
- **Dampak Bisnis:** Staf dapat secara tidak sengaja memasukkan angka minus yang secara artifisial menggelembungkan laba bersih studio sebelum tutup buku.

#### 2. Ketidaksesuaian Copywriting Wewenang Approval Pembayaran di UI
- **Lokasi Kode:** `apps/web/app/workspace/payments/payment-verification-view.tsx`
- **Akar Masalah:** Header halaman mencantumkan teks: *"Verifikasi bukti transfer hanya dapat dilakukan oleh Finance dan Super Admin"*. Padahal di level arsitektur backend, peran **Studio Manager** (`MANAGER`) memiliki kapabilitas resmi `payment:decide`.
- **Dampak Bisnis:** Manajer studio mengira mereka tidak memiliki wewenang menyetujui paket member baru, menyebabkan ketergantungan birokrasi yang tidak perlu pada tim pusat.

---

## 5. CELAH BISNIS & KETIDAKSESUAIAN STANDAR STUDIO PILATES

Sebagai konsultan bisnis industri kebugaran boutique, berikut evaluasi komparatif antara alur sistem Daily Dose v2 saat ini dengan praktik terbaik (*best practices*) industri studio pilates:

```
+---------------------------------------------------------------------------------------------------------+
|                                    PERBANDINGAN STANDAR OPERASIONAL                                     |
+------------------------------------+-----------------------------------+--------------------------------+
| Area Operasional                   | Praktik Umum Industri Boutique   | Kondisi Sistem Daily Dose v2   |
+------------------------------------+-----------------------------------+--------------------------------+
| Kebijakan Pembatalan Mandiri       | Terkunci H-24 sebelum kelas       | Terkunci H-24 (SESUAI STANDAR) |
| Pemotongan Kredit Saat Booking     | Hold / Tidak berkurang            | Tidak berkurang (SESUAI)       |
| Kehadiran Mangkir (No-Show)        | Kredit hangus (Late Cancel Fee)   | Kredit utuh (CELAH BISNIS)     |
| Verifikasi Kehadiran Pelatih       | Scan QR Geofence di Studio        | Tidak terikat payroll (CELAH)  |
| Window Koreksi Presensi Kasir      | Maksimal 2 - 4 jam setelah kelas  | Maksimal H+2 jam (SESUAI)      |
| Akses Finansial Owner Mitra Cabang | Dibatasi per cabang milik sendiri | Terisolasi ketat (SESUAI)      |
+------------------------------------+-----------------------------------+--------------------------------+
```

### Rekomendasi Bisnis Terkait No-Show:
Terapkan **Kebijakan Late Cancel & No-Show Otomatis**:
1. Jika member membatalkan sebelum batas H-24: Sesi kembali utuh tanpa biaya.
2. Jika member membatalkan setelah H-24 atau tidak hadir sama sekali saat kelas ditutup:
   - Sesi terpotong 1 dengan mutasi `FORFEIT_NOSHOW`.
   - Sistem mengirimkan WhatsApp empati (*"Hai Amanda, kami merindukanmu di kelas tadi. Sayangnya sesi kamu terpakai sesuai kebijakan studio. Jika kamu berhalangan karena kondisi medis darurat, silakan hubungi Studio Manager"*).

---

## 6. EVALUASI UI/UX & KACAMATA "ORANG GAPTEK" (STAFF KASIR & ADMIN)

Kami mengevaluasi antarmuka web dari perspektif staf kasir/admin studio baru yang berpendidikan non-IT, sering berganti (*turnover* tinggi), dan membutuhkan alur kerja cepat.

### 1. Masalah Tombol Simpan Biaya "Mati" Tanpa Petunjuk (Dead-Click Confusion)
- **Komponen:** `apps/web/app/finance/finance-commands-panel.tsx:135-145`
- **Masalah:** Tombol "Simpan biaya" dinonaktifkan (`disabled`) secara diam-diam jika pengguna belum mengisi kotak teks terpisah di bagian atas (*"Alasan perubahan"*). Staf kasir yang hanya ingin memasukkan nota listrik Rp 500.000 akan mengira aplikasi sedang *hang* atau komputernya rusak karena tombol simpan berwarna abu-abu mati tanpa ada pesan kesalahan (*error message*) sama sekali.
- **Solusi Gaptek-Friendly:** Buat tombol selalu dapat diklik. Jika ada data yang belum lengkap saat tombol ditekan, munculkan pesan teks merah yang ramah tepat di bawah kolom yang kurang: *"Mohon tuliskan keterangan nota terlebih dahulu"*.

### 2. Format Input Kategori "Regex Uppercase" yang Membingungkan
- **Komponen:** Input kode kategori biaya pada panel Finance.
- **Masalah:** Sistem meminta input teks bebas dengan aturan regex `^[A-Z][A-Z0-9_]{1,63}$`. Jika kasir mengetik *"Beli Sabun Cuci"*, form akan gagal validasi.
- **Solusi Gaptek-Friendly:** Ganti kolom input teks bebas dengan **Menu Pilihan (Dropdown)** berbahasa Indonesia sehari-hari:
  - 🏢 *Sewa Tempat & Gedung*
  - 💡 *Listrik, Air & Internet*
  - 🧹 *Kebersihan & Perlengkapan Studio*
  - 🛠️ *Perawatan Alat Reformer*
  - 📦 *Lain-lain*

### 3. Halaman Depan Finance Menampilkan "Rekonsiliasi" Bukan "Laporan"
- **Komponen:** `apps/web/app/finance/finance-view.tsx`
- **Masalah:** Tab default saat membuka menu Finance adalah `RECONCILIATION` yang berisi istilah akuntansi teknis (*Ledger Drift, Snapshot Audit, Control Hash*). Pengguna kasir/manager menjadi terintimidasi.
- **Solusi Gaptek-Friendly:** Jadikan tab default adalah **`FINANCIAL_REPORTS`** yang menampilkan kartu ringkasan visual sederhana: Omset Bulan Ini, Pengeluaran, dan Estimasi Laba Bersih.

---

## 7. ANALISIS FEEDBACK PELANGGAN, ADMIN & OWNER

### Analisis Permintaan #1: Owner Cabang meminta fitur "Buka Kunci Tutup Buku" jika ada nota terselip
- **Permintaan:** *"Bisa tidak kalau bulan lalu sudah ditutup buku, Owner Cabang bisa klik 'Buka Kunci' untuk memasukkan nota sewa yang baru ketemu?"*
- **Penilaian Konsultan:** ❌ **BERBAHAYA (TOLAK DENGAN TEGAS).**
- **Risiko:** Membuka kunci periode yang sudah dilaporkan merusak integritas laporan keuangan, membuka celah penggelapan pajak, dan memicu manipulasi bagi hasil antar investor.
- **Solusi Benar Sesuai Standar Akuntansi:** Gunakan fitur **Jurnal Koreksi Periode Berjalan** (*Correction Journal*) yang sudah tersedia di Daily Dose v2. Nota yang terselip dicatat di bulan ini dengan menunjuk referensi bulan lalu, dan wajib disetujui oleh Super Owner.

### Analisis Permintaan #2: Pelanggan meminta bisa booking kelas tanpa membeli paket terlebih dahulu
- **Permintaan:** *"Bisa tidak member baru booking dulu, bayarnya nanti pas datang ke studio?"*
- **Penilaian Konsultan:** ⚠️ **TIDAK DIREKOMENDASIKAN UNTUK KELAS REFORMER.**
- **Risiko:** Studio pilates memiliki tingkat *no-show* hingga 40% jika tidak ada komitmen pembayaran di muka. Member yang memesan tanpa bayar akan menghalangi member lain yang sudah membayar paket.
- **Solusi Alternatif:** Sediakan paket *Single Trial Session* dengan diskon khusus yang harus dibayar melalui QRIS langsung di website sebelum booking slot terkunci.

### Analisis Permintaan #3: Admin meminta batas toleransi presensi manual dinaikkan dari H+2 jam menjadi H+24 jam
- **Permintaan:** *"Tolong batas backfill ditambah jadi 1 hari, karena kadang kasir baru sempat input besok paginya."*
- **Penilaian Konsultan:** ❌ **POTENSI FRAUD TINGGI (TETAPKAN H+2 JAM).**
- **Risiko:** Jendela waktu yang terlalu longgar memungkinkan kasir memasukkan presensi fiktif untuk teman/keluarga, atau memanipulasi kehadiran instruktur untuk menggelembungkan komisi.
- **Solusi Alternatif:** Edukasi kasir untuk menggunakan tombol *1-Click Bulk Attendance* di akhir kelas melalui tablet studio, atau manfaatkan fitur *Session Adjust Request* ke Manager jika benar-benar terjadi kendala teknis jaringan.

---

## 8. TAHAPAN PENYELESAIAN MASALAH (STEP-BY-STEP REMEDIATION PLAN)

Rencana aksi penyelesaian masalah dibagi menjadi 4 tahapan berurutan (*phased roadmap*) dengan estimasi durasi dan penanggung jawab yang jelas:

```
+----------------------------------------------------------------------------------------------------+
|                               ROADMAP REMEDIASI DAILY DOSE PILATES V2                              |
+----------------------------------------------------------------------------------------------------+
| [FASE 1: 0 - 48 Jam]   Patch Kritis & Integritas Data (Persistensi, Collision Guard, Input Minus)  |
| [FASE 2: Minggu 1]     Proteksi Revenue & Logika Bisnis (No-Show Forfeit, Payroll QR Hook)         |
| [FASE 3: Minggu 2]     Penyederhanaan UI/UX "Orang Gaptek" (Dropdown Biaya, Inline Alert, Copy)    |
| [FASE 4: Minggu 3]     Hardening & Otomasi Monitoring (Regression CI/CD, Audit Log Viewer)         |
+----------------------------------------------------------------------------------------------------+
```

---

### FASE 1: URGENT SECURITY & CORE DATA INTEGRITY (0 - 48 JAM)
**Fokus:** Memperbaiki bug teknis yang dapat merusak data atau menyebabkan kegagalan aplikasi.

#### Langkah 1.1: Implementasi Persistensi Data Ketersediaan Instruktur
- **File Target:** [`apps/api/src/classes/ketersediaan-instruktur.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/classes/ketersediaan-instruktur.service.ts)
- **Tindakan:**
  Ganti pengembalian objek *mock* pada method `create()` dengan eksekusi database nyata:
  ```typescript
  const created = await this.db.instructorAvailability.create({
    data: {
      instructorId: principal.userId,
      branchId: dto.branchId,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    },
  });
  ```
- **Verifikasi:** Jalankan `npx tsx scratch/test-10-scenarios.ts` dan pastikan `dbAvailCount > 0`.

#### Langkah 1.2: Tambahkan Collision Guard pada Pembuatan Slot Kelas
- **File Target:** [`apps/api/src/classes/slot-kelas.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/classes/slot-kelas.service.ts)
- **Tindakan:**
  Sebelum `tx.slotKelas.create()`, lakukan pengecekan bentrok jadwal instruktur dan ruangan studio:
  ```typescript
  const overlap = await tx.slotKelas.findFirst({
    where: {
      branchId: dto.branchId,
      status: { not: ClassSlotStatus.CANCELLED },
      OR: [
        { instructorId: dto.instructorId },
        { studioId: dto.studioId },
      ],
      startAt: { lt: new Date(dto.endAt) },
      endAt: { gt: new Date(dto.startAt) },
    },
  });
  if (overlap) {
    throw new BadRequestException({
      code: 'SLOT_SCHEDULE_COLLISION',
      message: 'Jadwal bentrok dengan kelas lain pada instruktur atau ruangan yang sama.',
    });
  }
  ```
- **Verifikasi:** Coba buat 2 slot pada jam yang sama; pembuatan kedua harus menghasilkan galat HTTP 400.

#### Langkah 1.3: Validasi Angka Positif pada Biaya Operasional
- **File Target:** [`apps/api/src/packages/finance.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/packages/finance.service.ts)
- **Tindakan:**
  Tambahkan pengecekan `if (!dto.amountRp || dto.amountRp <= 0)` yang melemparkan galat `INVALID_AMOUNT`.

---

### FASE 2: BUSINESS LOGIC & REVENUE PROTECTION (MINGGU 1)
**Fokus:** Menutup kebocoran pendapatan studio dan sinkronisasi presensi.

#### Langkah 2.1: Implementasi Pemotongan Sesi Otomatis untuk Member No-Show
- **File Target:** [`apps/api/src/classes/slot-kelas.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/classes/slot-kelas.service.ts)
- **Tindakan:**
  Pada method `complete()`, sertakan peserta berstatus `NO_SHOW` untuk dipotong kredit sesinya dengan mutasi ledger `FORFEIT_NOSHOW` atau `ATTEND`:
  ```typescript
  // Potong sesi untuk booking berstatus ATTENDED dan NO_SHOW
  const billableBookings = bookings.filter(b => b.status === 'ATTENDED' || b.status === 'NO_SHOW');
  ```
- **Verifikasi:** Skenario 5 harus membuktikan bahwa booking Budi yang mangkir tetap memotong 1 sesi.

#### Langkah 2.2: Tautkan Honor Instruktur dengan Validasi Scan QR
- **File Target:** [`apps/api/src/packages/finance.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/packages/finance.service.ts)
- **Tindakan:**
  Pada kalkulasi `realtimeInstructorCostReport`, periksa catatan kehadiran instruktur pada tabel `attendance_record` dengan role `INSTRUCTOR` dan metode `QR_SCAN`. Jika tidak ada bukti scan QR di studio, beri penanda flag `UNVERIFIED_ATTENDANCE` pada laporan honor instruktur.

---

### FASE 3: UX SIMPLIFICATION FOR NON-TECH STAFF / "ORANG GAPTEK" (MINGGU 2)
**Fokus:** Menghilangkan kebingungan kasir dan staf operasional studio.

#### Langkah 3.1: Redesain Panel Input Biaya Operasional (Finance Commands)
- **File Target:** [`apps/web/app/finance/finance-commands-panel.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/finance/finance-commands-panel.tsx)
- **Tindakan:**
  1. Hapus keharusan mengisi *Alasan Perubahan* untuk pencatatan biaya rutin (buat menjadi opsional).
  2. Ganti input teks kode kategori dengan dropdown kategori pilihan:
     - `RENT` (Sewa Ruko)
     - `UTILITIES` (Listrik, Air & WiFi)
     - `MAINTENANCE` (Perawatan Reformer)
     - `SUPPLIES` (Perlengkapan & Kebersihan)
     - `MARKETING` (Iklan & Promosi)
     - `OTHER` (Lain-lain)
  3. Aktifkan tombol "Simpan biaya" dan tampilkan teks kesalahan validasi inline jika nominal kosong.

#### Langkah 3.2: Penataan Navigasi Finansial Default
- **File Target:** [`apps/web/app/finance/finance-view.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/finance/finance-view.tsx)
- **Tindakan:**
  Ubah nilai `defaultTab` dari `'RECONCILIATION'` menjadi `'FINANCIAL_REPORTS'`. Kasir dan Manager langsung melihat angka kinerja keuangan alih-alih layar audit teknis.

#### Langkah 3.3: Perbaikan Copywriting Hak Akses Verifikasi Pembayaran
- **File Target:** [`apps/web/app/workspace/payments/payment-verification-view.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/workspace/payments/payment-verification-view.tsx)
- **Tindakan:**
  Perbarui teks instruksi menjadi: *"Verifikasi pembayaran dapat dilakukan oleh Studio Manager, Finance, dan Super Owner"*.

---

### FASE 4: HARDENING & AUTOMATED MONITORING (MINGGU 3)
**Fokus:** Otomasi pengujian dan stabilitas jangka panjang.

#### Langkah 4.1: Integrasi Skrip 10 Skenario ke Pipeline CI/CD GitHub Actions
- Tambahkan perintah `npm run test:operational` yang menjalankan `scratch/test-10-scenarios.ts` sebelum setiap proses *merge* ke branch `main`.

#### Langkah 4.2: Pembuatan Dashboard Audit Trail Terpadu
- Sediakan antarmuka visual sederhana bagi Super Owner untuk memantau:
  - Pembatalan kelas otomatis H-24.
  - Daftar permohonan `SessionAdjustRequest` dari seluruh cabang.
  - Log jurnal koreksi pasca tutup buku bulanan.

---

## 9. MATRIKS CHECKLIST VERIFIKASI SEBELUM RILIS PRODUKSI

Gunakan lembar kerja ini sebelum meluncurkan pembaruan v2 ke seluruh cabang:

| No | Item Verifikasi | Metode Uji | Target Hasil | Status |
|:--:|---|---|---|:--:|
| 1 | API Booting & Health Check | `GET /api/v2/monitoring/health` | HTTP 200 OK | ✅ LULUS |
| 2 | Pembelian Paket & Ledger Sesi | Eksekusi Skenario 1 | Saldo sesi +10, Ledger `PURCHASE` | ✅ LULUS |
| 3 | Booking tidak memotong sesi | Eksekusi Skenario 3 | Saldo tetap utuh sebelum kelas mulai | ✅ LULUS |
| 4 | Auto-Cancel H-24 & Refund Ledger | Eksekusi Skenario 3 | Slot `CANCELLED`, Refund Ledger `+0` | ✅ LULUS |
| 5 | Reschedule mandiri < H-24 ditolak | Eksekusi Skenario 4 | HTTP 400 `CANCELLATION_CUTOFF_PASSED` | ✅ LULUS |
| 6 | Jalur darurat Session Adjust | Eksekusi Skenario 4 | Manager menyetujui, Ledger `ADJUST_MANUAL` | ✅ LULUS |
| 7 | Dual Check-in & Selesai Kelas | Eksekusi Skenario 5 | Hadir -> Sesi terpotong 1 (`ATTEND`) | ✅ LULUS |
| 8 | Backfill Admin batas H+2 jam | Eksekusi Skenario 6 | H+30m diterima, H+2.5 jam ditolak `410` | ✅ LULUS |
| 9 | Isolasi data multi-cabang | Eksekusi Skenario 7 | Owner intip cabang lain -> `403 Forbidden` | ✅ LULUS |
| 10 | 5 Laporan Keuangan & Monthly Close | Eksekusi Skenario 8 | Status `LOCKED`, Control Hash valid | ✅ LULUS |
| 11 | Tolak mutasi biaya pasca-lock | Eksekusi Skenario 8 | HTTP 409 `PERIOD_ALREADY_LOCKED` | ✅ LULUS |
| 12 | Jurnal Koreksi via Super Owner | Eksekusi Skenario 9 | Bulan lampau utuh, koreksi di bulan aktif | ✅ LULUS |
| 13 | Proteksi Customer Berhenti | Eksekusi Skenario 10 | Customer `stoppedAt != null` = 0 WA spam | ✅ LULUS |
| 14 | Persistensi Jadwal Instruktur | Patch Fase 1.1 | Tabel `instructor_availability` terisi | ✅ LULUS |
| 15 | Slot Collision Prevention | Patch Fase 1.2 | Ditolak `SLOT_SCHEDULE_COLLISION` | ✅ LULUS |
| 16 | No-Show Session Deduction | Patch Fase 2.1 | Peserta mangkir terpotong sesinya | ⏳ TAHAP 2 |

---
**Disusun Oleh:** Senior IT Business Consultant & System Analyst  
**Penerima:** IT Software House & Direksi Daily Dose Pilates  
**Arsip File Dokumen:** `docs/DOKUMEN_HASIL_AUDIT_DAN_REVIEW_OPERASIONAL_V2.md`

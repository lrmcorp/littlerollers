# 📘 DOKUMEN MASTER SPESIFIKASI & MATRIKS UAT KOMPREHENSIF PER ROLE & PER MODUL
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `DOC-UAT-DDV2-CANONICAL-MASTER-2026`  
**Status Dokumen:** `VERIFIED & CANONICAL`  
**Target Lingkungan:** Web App `http://localhost:32120` | REST API `http://localhost:32121` | MySQL Database `dailydose_v2_uat`  
**Penyusun:** Lead QA & Orang Awam Testing Team  
**Kepatuhan:** 100% Presisi dengan Rute Next.js 15, Controller NestJS 11, dan 13 Keputusan Bisnis Terkunci (*Locked Business Decisions*)

---

## DAFTAR ISI
1. [Standar & Metodologi Pengujian UAT Orang Awam](#1-standar--metodologi-pengujian-uat-orang-awam)
2. [Matriks 7 Peran Pengguna & Kredensial Uji Otentik](#2-matriks-7-peran-pengguna--kredensial-uji-otentik)
3. [Peta Arsitektur 10 Modul Inti & Rute Antarmuka Web](#3-peta-arsitektur-10-modul-inti--rute-antarmuka-web)
4. [Katalog Skenario UAT Detail per Role & Modul (Happy Path & No-Happy Path)](#4-katalog-skenario-uat-detail-per-role--modul)
   - [Peran 1: Super Admin / Super Owner (Global Multi-Cabang)](#peran-1-super-admin--super-owner)
   - [Peran 2: Owner Cabang / Mitra Studio (Investor Lokal)](#peran-2-owner-cabang--mitra-studio)
   - [Peran 3: Studio Manager (Operasional & Otorisasi Cabang)](#peran-3-studio-manager)
   - [Peran 4: Admin Front Desk / Resepsionis (Kasir & Meja Depan)](#peran-4-admin-front-desk--resepsionis)
   - [Peran 5: Instruktur / Coach (Pengajar & Pelatih Studio)](#peran-5-instruktur--coach)
   - [Peran 6: Finance Lead (Verifikasi Pembayaran & Tutup Buku)](#peran-6-finance-lead)
   - [Peran 7: Customer / Member (Member Baru, Member Aktif & Member Berhenti)](#peran-7-customer--member)
5. [Daftar Verifikasi Ketahanan Non-Happy Path (Adversarial Security)](#5-daftar-verifikasi-ketahanan-non-happy-path)
6. [Lembar Kendali Eksekusi & Kriteria Serah Terima (Sign-Off)](#6-lembar-kendali-eksekusi--kriteria-serah-terima)

---

## 1. Standar & Metodologi Pengujian UAT Orang Awam

Pengujian UAT ini dirancang dari **dua perspektif yang saling melengkapi**:
1. **Kacamata "Orang Awam" (Non-Teknis):** Menguji apakah staf studio (kasir resepsionis, coach, manajer) dan pelanggan awam dapat menggunakan setiap fitur dengan intuitif, tanpa memerlukan pemahaman teknis IT, tanpa pesan error bahasa programmer yang membingungkan, dan tanpa alur kerja yang membuat frustrasi.
2. **Kacamata "No-Happy Path" / Adversarial QA:** Menguji perilaku sistem saat menghadapi data salah, input minus, persaingan kuota bersamaan (*race condition*), pemalsuan bukti bayar, kebocoran isolasi cabang, koordinat GPS palsu, dan upaya eskalasi hak akses di luar wewenang.

---

## 2. Matriks 7 Peran Pengguna & Kredensial Uji Otentik

| Peran (*Role*) | Akun Login UAT | Password Default | Lingkup Otoritas Cabang | Modul Utama yang Digunakan |
| :--- | :--- | :--- | :--- | :--- |
| **Super Owner / Super Admin** | `ralamzah@gmail.com` / `superowner@dailydose.test` | `ridho123` / `SuperOwner123!` | Global (Seluruh Cabang) | Master Data, Cabang, Role Staf, Duplikasi Paket, Audit Log, Jurnal Koreksi Pasca-Lock |
| **Owner Cabang (Mitra)** | `owner.gg@dailydose.test` | `ridho123` / `Owner123!` | Terbatas Cabang Green Garden (`DD-GG`) | Laporan Omset Cabang Sendiri, Performa Cabang (Rule #10: Dilarang intip cabang lain) |
| **Studio Manager** | `manager.gg@dailydose.test` | `ridho123` / `Manager123!` | Cabang Green Garden (`DD-GG`) | Approval Bukti Bayar, Approval Sesi Medis (< H-24), Selesaikan Kelas, Supervisi Booking |
| **Admin Front Desk** | `admin.gg@dailydose.test` / `adminmk@ddose.com` | `ridho123` / `Admin123!` | Cabang Green Garden / Muara Karang | Pendaftaran Cepat Walk-in, Buat Slot Kelas, Assisted Sale & Booking, Backfill H+2 |
| **Instruktur / Coach** | `coach.sarah@dailydose.test` / `instdevi@ddose.com` | `ridho123` / `Instructor123!` | Cabang Penugasan (Green Garden) | Jadwal Mengajar, Input Ketersediaan Jam, Presensi QR Tablet, Lihat Roster Murid |
| **Finance Lead** | `finance@dailydose.test` | `ridho123` / `Finance123!` | Global (Semua Cabang) | Antrean Pembayaran (Maker-Checker & Anti-Blind Approval), Voucher, Rekonsiliasi, Tutup Buku |
| **Customer Baru** | `clara.new@dailydose.test` / Registrasi Baru | `MemberBaru2026!` | - | Eksplorasi Landing Page, Registrasi Mandiri, Unggah Dokumen KTP KYC |
| **Customer Aktif** | `cindyedelene@gmail.com` / `amanda.member@dailydose.test` | `ridho123` / `Customer123!` | Pelanggan Studio | Self-Booking Kelas, Reschedule H-24, Link Presensi Mandiri, Pembatalan Kelas, Unduh Pass QR |
| **Customer Berhenti** | `hendra.stopped@dailydose.test` | `ridho123` / `Customer123!` | Akun Berhenti (`stoppedAt != null`) | Uji Proteksi Zero-Spam WhatsApp & Pembatasan Booking Mandiri |

---

## 3. Peta Arsitektur 10 Modul Inti & Rute Antarmuka Web

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PETA 10 MODUL INTI DAILY DOSE PILATES V2                        │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 1. OTENTIKASI & KEAMANAN │ 2. MASTER DATA & CABANG  │ 3. KATALOG PAKET & PROMOSI       │
│    /sign-in, /register   │    /workspace/branches   │    /packages, /workspace/packages│
│    /account/verification │    /locations, /master   │    /workspace/vouchers           │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 4. PENJADWALAN KELAS     │ 5. PEMESANAN KELAS       │ 6. PRESENSI KEHADIRAN GANDA      │
│    /workspace/classes    │    /classes, /bookings   │    /check-in-scanner             │
│    /schedule, /classes   │    /checkout, /orders    │    /check-in/[token]             │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 7. PENYESUAIAN SESI      │ 8. VERIFIKASI PEMBAYARAN │ 9. FINANSIAL & TUTUP BUKU        │
│    /ledger/adjustments   │    /workspace/payments   │    /finance, /workspace/branch-  │
│    /ledger               │    (Maker-Checker Guard) │    performance, /monthly-closes  │
├──────────────────────────┴──────────────────────────┴──────────────────────────────────┤
│ 10. OTOMASI SISTEM, WORKER CRON & NOTIFIKASI WHATSAPP                                  │
│     /workspace/reminders, /support-cases, Auto-Cancel H-24, Zero-Spam Member Berhenti  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Katalog Skenario UAT Detail per Role & Modul

---

### Peran 1: Super Admin / Super Owner (`ralamzah@gmail.com`)
*Karakter:* Pemilik utama studio, mengawasi semua cabang, bertanggung jawab atas kelangsungan bisnis global.

#### Modul 1.1: Manajemen Cabang & Studio Global (`/workspace/branches`)
* **Happy Path (UAT-SA-01):**  
  Super Admin membuka `/workspace/branches`, melihat daftar seluruh cabang (Green Garden, Muara Karang, Surabaya, Untar, PIK 2), mengedit jam operasional, radius geofence (150m), dan kapasitas maksimal reformer studio.
* **No-Happy Path (UAT-SA-02 - Adversarial):**  
  1. Input radius geofence negatif (-50 meter) &rarr; Sistem menolak dengan validasi angka positif.
  2. Mengisi kapasitas ruangan 0 atau huruf &rarr; Form memblokir pengiriman data.

#### Modul 1.2: Katalog Paket & Duplikasi Paket Instan (`/workspace/packages`)
* **Happy Path (UAT-SA-03):**  
  Super Admin memilih paket aktif (misal: "Reformer 10 Sessions"), klik tombol **`"Duplikasi paket"`**, mengisi kode bisnis unik baru (`PKG-PROMO-LEBARAN`), harga diskon, masa aktif 60 hari. Paket baru langsung terbit di katalog.
* **No-Happy Path (UAT-SA-04 - Adversarial):**  
  1. Input harga paket bernilai negatif (misal `-Rp 100.000`) atau jumlah sesi 0 &rarr; Server menolak dengan `VALIDATION_ERROR (HTTP 400)`.
  2. Input tanggal berakhir promo sebelum tanggal mulai promo &rarr; Form menampilkan pesan: *"Tanggal berakhir harus setelah tanggal mulai"*.

#### Modul 1.3: Manajemen Timetable & Collision Guard Global (`/workspace/classes`)
* **Happy Path (UAT-SA-05):**  
  Super Admin menjadwalkan kelas Reformer di cabang Green Garden pada jam kosong, menetapkan Coach Sarah, kapasitas 6 peserta, klik **`"Buat kelas"`** &rarr; Kelas berstatus `DRAFT`, lalu klik **`"Publikasikan"`** &rarr; Berstatus `PUBLISHED`.
* **No-Happy Path (UAT-SA-06 - Adversarial):**  
  1. **Tabrakan Ruangan (*Room Collision*):** Membuat kelas kedua di Ruang Reformer Green Garden pada rentang jam yang sama persis &rarr; Server menolak dengan pesan ramah: *"Ruangan ini sudah memiliki jadwal kelas lain pada jam yang sama. Silakan pilih ruangan lain atau ubah jam mulai."*
  2. **Tabrakan Instruktur (*Instructor Collision*):** Menugaskan Coach Sarah di dua kelas berbeda pada jam yang sama &rarr; Ditolak dengan pesan: *"Instruktur yang dipilih sudah memiliki jadwal mengajar di kelas lain pada jam yang sama."*
  3. **Jam Selesai Mundur:** Mengisi jam mulai 10:00 dan jam selesai 09:00 &rarr; Ditolak sebelum form terkirim.

#### Modul 1.4: Verifikasi Dokumen KYC KTP Pelanggan (`/identity-verifications`)
* **Happy Path (UAT-SA-07):**  
  Super Admin membuka antrean `/identity-verifications`, memeriksa foto selfie dan KTP member baru Clara, klik **`"Setujui"`** &rarr; Status member menjadi `APPROVED`, member langsung berhak membeli paket dan booking kelas.
* **No-Happy Path (UAT-SA-08 - Adversarial):**  
  Super Admin menolak dokumen KTP buram tanpa mengisi alasan penolakan &rarr; Tombol Tolak terkunci hingga alasan diisi agar member mendapat penjelasan yang jelas.

#### Modul 1.5: Konfigurasi Tarif Master Honor Instruktur & Override Sesi (`/instructors` & `/workspace/classes`)
* **Happy Path (UAT-SA-09):**  
  Super Admin mengonfigurasi skema honor instruktur:
  1. **Tarif Master Per Jam:** Mengatur tarif per jam untuk Coach Sarah pada tipe kelas Reformer di cabang Green Garden (misal: Rp 250.000/jam) di tabel `InstructorFee`.
  2. **Penimpaan Flat Per Sesi (*Manual Override*):** Saat membuat slot kelas khusus (workshop/event spesial), Super Admin mengaktifkan opsi honor manual (`isManualFee = true`) dengan nominal tetap Rp 350.000/sesi &rarr; Sistem memprioritaskan nominal flat tersebut di atas tarif per jam standar.
* **No-Happy Path (UAT-SA-10 - Fallback Tarif Default):**  
  Super Admin menjadwalkan kelas dengan instruktur baru yang belum memiliki entri tarif master di tabel `InstructorFee` dan tidak diset manual fee &rarr; Saat kelas selesai (`COMPLETED`), sistem otomatis menerapkan fallback tarif aman `DEFAULT_INSTRUCTOR_FEE_PER_HOUR_RP` (Rp 150.000/jam) dengan penanda `configured = false` (*Butuh Konfigurasi Tarif*), sehingga studio tidak mengalami deadlock finansial.

---

### Peran 2: Owner Cabang / Mitra Studio (`owner.gg@dailydose.test`)
*Karakter:* Investor pemilik cabang Green Garden, ingin melihat performa bisnisnya tanpa mengganggu operasional harian.

#### Modul 2.1: Laporan Performa & Finansial Cabang Sendiri (`/workspace/branch-performance`)
* **Happy Path (UAT-OW-01):**  
  Owner login, membuka dashboard `/workspace/branch-performance`, melihat 4 kartu statistik utama:
  1. Omset Cabang (`omsetRp`).
  2. **Biaya Instruktur (Aktual):** Melihat total honor instruktur yang terverifikasi (`totalInstructorFeeRp`), jumlah jam mengajar aktual, dan rincian per instruktur.
  3. Biaya Operasional Lain (`otherCostRp`).
  4. Estimasi Profit Bersih (`estimatedProfitRp`).
* **No-Happy Path (UAT-OW-02 - Batas Otorisasi, Warning Blocker & Rule #10):**  
  1. **Deteksi Honor Belum Terverifikasi / Tarif Belum Diset:** Jika terdapat kelas selesai tanpa presensi instruktur, kartu Biaya Instruktur berubah menjadi tone peringatan kuning (*warning*) bertuliskan: *"X kelas (Rp Y) belum terverifikasi presensi"*, atau *"Tarif belum diset (Z kelas butuh konfigurasi)"* &rarr; Estimasi profit ditandai belum final hingga seluruh presensi/tarif dilengkapi.
  2. Owner mencoba beralih ke cabang Muara Karang atau Surabaya &rarr; Dropdown cabang terkunci hanya pada Green Garden (`DD-GG`).
  3. Owner mencoba menembak API `/api/v1/finance/reports?branchId=MK` &rarr; Server memblokir keras dengan status `HTTP 403 Forbidden` (Rule #10: Isolasi data finansial multi-cabang).
  4. Owner mencoba memodifikasi atau menghapus slot jadwal kelas &rarr; Tombol tindakan mutasi disembunyikan (*Read-Only mode*).

---

### Peran 3: Studio Manager (`manager.gg@dailydose.test`)
*Karakter:* Pengelola harian studio cabang Green Garden, memegang wewenang persetujuan pembayaran dan kebijakan pengecualian.

#### Modul 3.1: Antrean Verifikasi Pembayaran & Maker-Checker (`/workspace/payments`)
* **Happy Path (UAT-MN-01):**  
  Manager membuka `/workspace/payments`, memilih transaksi pembelian paket Cindy, klik **`"Buka & Periksa Bukti Sekarang"`** &rarr; Foto struk transfer BCA tampil di panel kiri &rarr; Tombol **`"Setujui pembayaran"`** aktif &rarr; Klik setujui &rarr; Paket Cindy langsung aktif dengan 10 sesi, mutasi ledger `PURCHASE` tercatat permanen.
* **No-Happy Path (UAT-MN-02 - Anti-Blind Approval & Maker-Checker):**  
  1. **Pencegahan Approval Buta (*Anti-Blind Approval*):** Manager mencoba langsung menyetujui transaksi tanpa membuka foto bukti bayar &rarr; Tombol *"Setujui pembayaran"* dinonaktifkan dengan banner: *"Tinjauan Bukti Wajib: Buka dan periksa pratinjau bukti transfer di panel kiri sebelum menyetujui transaksi ini."*
  2. **Pemisahan Tugas (*Maker-Checker*):** Jika transaksi dicatat secara offline oleh Manager sendiri, Manager DILARANG menyetujui pembayarannya sendiri &rarr; Tampil peringatan: *"Anda mencatat transaksi ini. Sesuai prinsip pemisahan tugas, persetujuan harus dilakukan oleh staf lain."*
  3. **Penolakan Bukti Tanpa Alasan:** Manager memilih opsi tolak bukti bayar tanpa memilih templat alasan atau catatan &rarr; Ditolak validasi form.

#### Modul 3.2: Otorisasi Penyesuaian Sesi Medis Darurat < H-24 (`/ledger/adjustments`)
* **Happy Path (UAT-MN-03):**  
  Member mengalami cedera mendadak pada H-3 jam sebelum kelas dan membawa surat dokter. Admin front desk mengajukan `SessionAdjustRequest`. Manager membuka `/ledger/adjustments`, memeriksa lampiran surat dokter, klik **`"Setujui Kompensasi"`** &rarr; Saldo sesi member dikembalikan +1 sesi via mutasi resmi `ADJUST_MANUAL`.
* **No-Happy Path (UAT-MN-04 - Adversarial):**  
  Admin resepsionis mencoba menyetujui penyesuaian sesi sendiri tanpa Manager &rarr; Tindakan diblokir HTTP 403 Forbidden (Hanya Manager/Super Owner yang berhak mengeksekusi).

#### Modul 3.3: Selesai Kelas & Pemotongan Sesi Aktual (`/workspace/classes`)
* **Happy Path (UAT-MN-05):**  
  Setelah kelas Reformer selesai dan presensi dicatat, Manager mengklik **`"Selesaikan kelas"`** &rarr; Status kelas berubah menjadi `COMPLETED` &rarr; Saldo sesi seluruh peserta yang hadir resmi terpotong 1 sesi (`ATTEND`), peserta mangkir terpotong penalti (`NO_SHOW`).  
  **Evaluasi Honor Otomatis:** Sistem mengecek presensi instruktur pada slot kelas:
  - Jika instruktur telah melakukan presensi (via QR atau verifikasi manual) &rarr; Honor sesi otomatis terkunci ke dalam **`verifiedFeeRp`** (Siap dibayar).
  - Jika instruktur belum memiliki presensi &rarr; Honor otomatis dialokasikan ke **`unverifiedFeeRp`** dengan flag *Belum Terverifikasi* agar tidak dibayarkan keliru.

---

### Peran 4: Admin Front Desk / Resepsionis (`admin.gg@dailydose.test`)
*Karakter:* Staf meja depan studio, menghadapi antrean pelanggan walk-in, butuh alur cepat dan anti-bingung.

#### Modul 4.1: Pendaftaran Cepat Member Walk-in (`/customers`)
* **Happy Path (UAT-FD-01):**  
  Pelanggan datang langsung ke meja depan studio. Resepsionis klik **`"Buat pelanggan aktif"`** &rarr; Drawer pendaftaran terbuka &rarr; Cukup masukkan Nama Lengkap dan Nomor WhatsApp &rarr; Klik **`"Simpan pelanggan"`** &rarr; Akun langsung aktif, notifikasi otomatis terkirim ke WhatsApp pelanggan.
* **No-Happy Path (UAT-FD-02 - Bug P0 Fix Verification):**  
  Resepsionis memasukkan nomor telepon atau email yang ternyata sudah terdaftar sebelumnya &rarr; **Banner merah error tampil langsung di dalam Drawer** tepat di atas tombol simpan: *"Email atau nomor telepon sudah terdaftar atas nama pelanggan lain. Gunakan data berbeda atau cari akun pelanggan di tabel."* &rarr; Form TIDAK macet, tombol Simpan kembali aktif.

#### Modul 4.2: Penjualan Paket Walk-in Cepat (*Assisted Sale Drawer*) (`/customers`)
* **Happy Path (UAT-FD-03):**  
  Pada baris pelanggan di tabel `/customers`, resepsionis klik tombol aksi cepat **`"Jual paket"`** &rarr; Drawer penjualan terbuka otomatis mengunci nama pelanggan &rarr; Pilih paket 10 sesi &rarr; Pilih metode pembayaran Cash/EDC &rarr; Klik simpan &rarr; Transaksi berhasil tercatat.

#### Modul 4.3: Pembuatan Jadwal Harian & Presensi Susulan Backfill H+2 (`/workspace/classes`)
* **Happy Path (UAT-FD-04):**  
  Admin membuat slot kelas harian studio Green Garden, memilih tipe Reformer, ruangan, dan instruktur.
* **No-Happy Path (UAT-FD-05 - Aturan Bisnis #9 Backfill Cutoff):**  
  Admin mencoba mengisi presensi susulan untuk member yang hadir pada kelas yang sudah selesai lebih dari 2 jam lalu (> H+2 jam) &rarr; Tombol presensi terkunci dengan peringatan: *"Batas waktu presensi susulan H+2 jam telah terlewati. Hubungi Studio Manager."*

#### Modul 4.4: Manajemen Presensi Instruktur di Studio & Fallback Manual (`/classes` & `/workspace/classes`)
* **Happy Path (UAT-FD-06 - Penayangan QR Presensi Studio):**  
  Staf Front Desk membuka detail kelas yang sedang aktif di `/classes`, mengklik tombol **`"Tampilkan QR presensi instruktur"`** &rarr; QR dinamis dengan identitas cabang dan nama tipe kelas muncul di layar/tablet meja depan studio untuk dipindai oleh instruktur yang bertugas.
* **Happy Path (UAT-FD-07 - Verifikasi Manual oleh Admin / Fallback Kendala Teknis):**  
  Instruktur hadir tepat waktu memandu kelas namun ponselnya kehabisan baterai atau kamera rusak sehingga tidak bisa memindai QR. Admin front desk (memiliki kapabilitas `attendance:manage`):
  1. Membuka detail kelas bersangkutan di `/classes`.
  2. Memasukkan catatan pertanggungjawaban pada kolom *Catatan (opsional)*: *"Instruktur hadir memandu kelas Reformer, HP lowbat"*.
  3. Mengklik tombol **`"Verifikasi presensi instruktur"`** &rarr; Sistem mencatat presensi instruktur dengan metode `MANUAL_FRONTDESK`, menyimpan identitas admin yang memverifikasi (`recordedById`), dan mengubah honor kelas menjadi terverifikasi. Sifat aksi ini idempoten (tidak dapat ditimpa ganda).
* **No-Happy Path (UAT-FD-08 - Validasi Boundary Verifikasi Manual):**  
  1. **Sebelum Jendela Presensi Dibuka:** Admin mencoba memverifikasi presensi sebelum H-30 menit sebelum kelas mulai &rarr; Ditolak `HTTP 400 Bad Request` (`CHECK_IN_TOO_EARLY`).
  2. **Status Kelas Tidak Valid:** Admin mencoba memverifikasi presensi pada kelas yang masih `PUBLISHED` (belum dikonfirmasi) atau `CANCELLED` &rarr; Ditolak `INVALID_STATE_TRANSITION`.
  3. **Isolasi Cabang:** Admin cabang Green Garden mencoba memverifikasi instruktur pada slot kelas cabang Muara Karang &rarr; Ditolak `RESOURCE_NOT_FOUND` / `FORBIDDEN`.

---

### Peran 5: Instruktur / Coach (`coach.sarah@dailydose.test`)
*Karakter:* Instruktur profesional di studio Pilates, menggunakan smartphone atau tablet studio untuk presensi.

#### Modul 5.1: Presensi Mandiri Scan QR di Studio (`/check-in-scanner`)
* **Happy Path (UAT-CO-01):**  
  Coach Sarah datang ke studio Green Garden 20 menit sebelum kelas dimulai (dalam jendela H-30m sampai jam selesai), membuka menu `/check-in-scanner` di ponsel/tablet, mengarahkan kamera ke QR presensi studio &rarr; Presensi sukses tercatat dengan metode `INSTRUCTOR_QR` & GPS tervalidasi dalam geofence studio &rarr; Fee mengajar terhitung otomatis.
* **No-Happy Path (UAT-CO-02 - Geofence Violation, GPS Check & Waktu):**  
  1. **Presensi di Luar Studio (>10 km):** Coach Sarah mencoba scan QR dari rumah di Jakarta Pusat &rarr; Ditolak seketika dengan pesan: *"Presensi ditolak karena Anda berada di luar radius area cabang studio yang telah ditentukan. Anda harus berada di lokasi cabang untuk melakukan presensi."*
  2. **Presensi Tanpa Izin GPS:** Coach mematikan izin lokasi GPS di browser HP &rarr; Dalam waktu 4 detik sistem menampilkan pesan instruksi ramah: *"Akses lokasi (GPS) diperlukan untuk memvalidasi bahwa Anda berada di cabang tempat kelas berlangsung. Izinkan akses lokasi pada browser Anda."* (Tidak ada freeze membeku 10 detik).
  3. **Presensi Terlalu Awal (> H-30 menit):** Coach mencoba presensi 2 jam sebelum kelas mulai &rarr; Ditolak dengan pesan: *"Presensi baru dapat dicatat mulai 30 menit sebelum kelas dimulai."*
  4. **Presensi Kelas Lewat (Expired):** Coach mencoba scan QR setelah jam kelas berakhir &rarr; Ditolak dengan status expired (`EXPIRED`). Presensi harus diverifikasi secara manual oleh Front Desk/Manager.
  5. **Verifikasi Diri Tanpa Hak Akses:** Instruktur mencoba menembak API verifikasi manual mandiri (`/instructor-attendance`) tanpa izin staf &rarr; Ditolak `HTTP 403 Forbidden` (instruktur tidak dapat memverifikasi presensinya sendiri secara sepihak).

#### Modul 5.2: Tinjauan Roster Murid & Catatan Medis (`/classes` & `/workspace/classes`)
* **Happy Path (UAT-CO-03):**  
  Coach Sarah membuka detail kelasnya, melihat daftar nama murid yang terdaftar, status kehadiran murid, dan catatan riwayat cedera/kesehatan murid (*medical notes*).
* **No-Happy Path (UAT-CO-04 - Privasi Finansial):**  
  Coach Sarah mencoba membuka menu `/finance` atau laporan kas studio &rarr; Ditolak HTTP 403 Forbidden.

#### Modul 5.3: Siklus Akumulasi Honor Mengajar & Penahanan Honor Non-Presensi (`/instructors` & `/instructors/[id]`)
* **Happy Path (UAT-CO-05 - Akumulasi Honor Terverifikasi `verifiedFeeRp`):**  
  Setelah memandu kelas dan melakukan presensi valid (metode `INSTRUCTOR_QR` atau `MANUAL_FRONTDESK`), kelas diselesaikan (`COMPLETED`).  
  Pada halaman profil `/instructors/[id]`:
  1. Metric *"Sesi Kelas Diampu"* bertambah.
  2. Metric *"Honor Bulan Ini (kelas selesai)"* menampilkan total nominal honor terverifikasi (misal: Rp 250.000).
  3. Banner status menampilkan pesan hijau: *"Presensi dan konfigurasi fee kelas selesai bulan ini sudah lengkap."*
  4. Honor masuk ke dalam status siap cair (*payable*) pada rekapitulasi penggajian Finance.
* **No-Happy Path (UAT-CO-06 - Kasus Lupa Absen & Penahanan Honor `unverifiedFeeRp`):**  
  Coach Sarah memandu kelas hingga selesai, tetapi lupa memindai QR dan staf belum melakukan verifikasi manual saat kelas diselesaikan (`COMPLETED`):
  1. **Penahanan Honor (*Hold*):** Sistem TIDAK menghilangkan honor, melainkan mengalokasikannya ke `unverifiedFeeRp` (misal: Rp 250.000 belum terverifikasi).
  2. **Indikator Warning Profil:** Pada profil `/instructors/[id]`, muncul banner peringatan oranye: *"Bulan ini ada 1 kelas selesai tanpa presensi instruktur; honornya ditandai belum terverifikasi, verifikasi dari detail kelas."*
  3. **Indikator Warning Daftar Instruktur:** Pada tabel `/instructors`, baris Coach Sarah menampilkan label oranye: *"Rp 250.000 belum terverifikasi"*.
  4. **Pencegahan Pembayaran Buta:** Honor ini DITAHAN dari daftar transfer pembayaran Finance hingga staf studio melakukan verifikasi presensi susulan secara resmi.

---

### Peran 6: Finance Lead (`finance@dailydose.test`)
*Karakter:* Pimpinan akuntansi dan kas, menjamin keabsahan seluruh penerimaan kas dan pengeluaran beban.

#### Modul 6.1: Antrean Verifikasi Pembayaran & Rekonsiliasi Bank (`/workspace/payments`)
* **Happy Path (UAT-FN-01):**  
  Finance membuka daftar pembayaran status `WAITING_VERIFICATION`, mencocokkan kode unik transfer bank dengan rekening koran BCA, membuka pratinjau bukti bayar, klik **`"Setujui pembayaran"`** &rarr; Saldo kas bertambah, invoice berstatus `PAID`, paket member aktif.
* **No-Happy Path (UAT-FN-02 - Penolakan dengan Templat Standar):**  
  Finance menemukan bukti transfer fiktif/palsu. Memilih alasan `PROOF_INVALID`, klik templat cepat *"Nominal transfer tidak sesuai tagihan"* &rarr; Member menerima alasan penolakan yang profesional di portalnya.

#### Modul 6.2: Pengelolaan Voucher Diskon Promosi (`/workspace/vouchers`)
* **Happy Path (UAT-FN-03):**  
  Finance membuat voucher baru `PILATESMEI`, potongan nominal Rp 150.000, kuota penggunaan 50 kali, berlaku untuk seluruh cabang.
* **No-Happy Path (UAT-FN-04 - Voucher Kedaluwarsa & Kuota 0):**  
  Member mencoba menggunakan voucher `PILATESMEI` setelah melewati tanggal berlaku atau setelah kuota habis &rarr; Sistem checkout menampilkan error ramah: *"Voucher telah kedaluwarsa atau batas kuota penggunaan telah tercapai."*

#### Modul 6.3: Eksekusi Tutup Buku Bulanan (*Monthly Close Period Lock*) (`/finance`)
* **Happy Path (UAT-FN-05):**  
  Finance memeriksa 5 pilar laporan keuangan bulan berjalan. Setelah seluruh transaksi terekonsiliasi, Finance mengklik **`"Tutup buku periode"`** untuk bulan bersangkutan &rarr; Periode pembukuan berstatus `LOCKED`.
* **No-Happy Path (UAT-FN-06 - Period Lock Guard):**  
  Setelah periode berstatus `LOCKED`, staf kasir atau admin mencoba memasukkan transaksi susulan atau mengubah data keuangan pada periode lampau tersebut &rarr; Sistem menolak mutasi dengan `PERIOD_LOCKED`. Perubahan hanya dapat dilakukan melalui prosedur Jurnal Koreksi resmi yang disetujui Super Owner.

#### Modul 6.4: Audit Presensi & Rekonsiliasi Penggajian Honor Instruktur (`/finance` & `/instructors`)
* **Happy Path (UAT-FN-07 - Audit Tab Beban Instruktur Aktual):**  
  Finance membuka menu `/finance` dan masuk ke tab **"Beban Instruktur"**:
  1. Memeriksa 4 kartu ringkasan:
     - Total Beban Instruktur Aktual (`totalInstructorCostRp`).
     - Belum Terverifikasi Presensi: `Rp 0` (0 kelas).
     - Total Jam Mengajar Aktual (`totalTeachingHours` jam).
     - Jumlah Instruktur Aktif (`instructorCount` orang).
  2. Beralih mode audit antara:
     - **Mode Rekap Instruktur (`SUMMARY`):** Menampilkan ringkasan total jam, tarif kategori, dan total honor per instruktur.
     - **Mode Rincian per Sesi (`SESSIONS`):** Mengaudit setiap sesi kelas yang selesai, memeriksa metode presensi (`QR_SCAN` / `MANUAL_FRONTDESK`), nama cabang, ruangan, dan nominal modal honor.
  3. Seluruh sesi bersih terverifikasi &rarr; Finance menyetujui laporan beban honor untuk diproses ke transfer payroll bank.
* **No-Happy Path (UAT-FN-08 - Blocker Penahanan Payroll Akibat Presensi Belum Lengkap):**  
  1. **Deteksi Anomali Presensi:** Finance membuka tab Beban Instruktur dan mendapati kartu *"Belum Terverifikasi Presensi"* menyala oranye: *"Rp 250.000 (1 kelas)"*.
  2. **Banner Peringatan Tindakan:** Sistem memunculkan banner peringatan: *"1 kelas senilai Rp 250.000 belum punya presensi instruktur. Verifikasi dari detail kelas di menu Kelas sebelum honor dibayarkan."*
  3. **Prosedur Penahanan & Investigasi:** Finance TIDAK mentransfer honor yang belum terverifikasi. Finance mengontak Studio Manager Green Garden untuk mengecek CCTV/daftar hadir murid.
  4. **Penyelesaian Blocker:** Setelah Admin Front Desk / Manager melakukan *"Verifikasi presensi instruktur"* di detail kelas dengan catatan resmi, halaman Finance otomatis ter-update: nominal `totalUnverifiedFeeRp` menjadi `Rp 0`, dan honor berpindah ke `totalVerifiedFeeRp` yang sah untuk dibayarkan.

---

### Peran 7: Customer / Member (`cindyedelene@gmail.com` & Member Gerald)
*Karakter:* Pelanggan studio Pilates, menggunakan web portal untuk membeli paket, melihat jadwal, dan latihan.

#### Modul 7.1: Registrasi Mandiri & Verifikasi KTP (`/register` & `/account/verification`)
* **Happy Path (UAT-CS-01):**  
  Calon member membuka `/register`, memasukkan nama, nomor HP WhatsApp, email, dan password. Masuk ke halaman `/account/verification`, mengunggah foto KTP dan foto selfie &rarr; Status berubah menjadi `PENDING`.
* **No-Happy Path (UAT-CS-02 - Format File & Proteksi Verifikasi KTP):**  
  1. Member mengunggah file non-gambar (misal file script `.sh` atau `.pdf` rusak) &rarr; Form menolak dengan pesan validasi format gambar yang jelas.
  2. Member yang belum terverifikasi mencoba langsung klik checkout paket &rarr; Tampil modal edukatif ramah: *"Verifikasi KTP Diperlukan — Lengkapi verifikasi KTP terlebih dahulu untuk dapat membeli paket sesi Pilates di Daily Dose."*

#### Modul 7.2: Pembelian Paket & Unggah Bukti Bayar (`/packages` & `/checkout`)
* **Happy Path (UAT-CS-03):**  
  Member memilih paket "10 Sesi Reformer All-Branch", lanjut ke checkout, melihat rincian tagihan beserta rekening transfer resmi BCA Daily Dose, mentransfer via m-Banking, lalu mengunggah screenshot bukti transfer &rarr; Invoice berstatus `Menunggu Verifikasi`.

#### Modul 7.3: Pemesanan Kelas Mandiri & Aturan Saldo Sesi (Rule #1) (`/classes` & `/bookings`)
* **Happy Path (UAT-CS-04):**  
  Member membuka jadwal kelas `/classes`, memilih kelas Reformer Coach Sarah besok pagi, klik **`"Booking Kelas"`** &rarr; Booking berhasil terbit status `BOOKED`.  
  **Verifikasi Krusial (Aturan Bisnis #1):** Saldo sesi paket member **TIDAK BERKURANG** (tetap utuh 10 sesi, hanya kuota reservasi bertambah 1).
* **No-Happy Path (UAT-CS-05 - Booking Tanpa Saldo & Kelas Penuh):**  
  1. Member mencoba booking kelas saat paket sesi habis atau 0 &rarr; Ditolak dengan pesan: *"Sisa sesi paket Anda sudah habis. Silakan beli paket baru untuk melanjutkan booking."*
  2. Member mencoba booking kelas yang kapasitasnya sudah penuh (6/6 tempat) &rarr; Tombol booking berubah menjadi *"Kelas Penuh"*.

#### Modul 7.4: Reschedule Mandiri (Batas H-24) vs Pembatalan (< H-24) (`/bookings/[id]`)
* **Happy Path (UAT-CS-06 - Reschedule >= H-24):**  
  Pada H-2 hari sebelum kelas, member berhalangan hadir. Member membuka `/bookings/[id]`, klik **`"Ajukan reschedule"`**, memilih jadwal alternatif yang tersedia &rarr; Jadwal berhasil dipindahkan seketika tanpa penalti.
* **No-Happy Path (UAT-CS-07 - Cutoff H-24 & Pembatalan Kelas Selesai):**  
  1. Member mencoba membatalkan mandiri pada H-5 jam sebelum kelas (< H-24) &rarr; Tombol pembatalan mandiri terkunci dengan penjelasan: *"Batas waktu pembatalan mandiri (H-24) telah terlewati. Hubungi admin studio jika terdapat kondisi darurat medis."*
  2. Member mencoba membatalkan booking kelas yang kehadirannya sudah tercatat atau kelas telah selesai (`ATTENDANCE_RECORDED`) &rarr; Tampil pesan jelas: *"Kehadiran kelas sudah tercatat atau sesi telah berjalan. Booking tidak dapat dibatalkan."* (Tidak ada pesan membingungkan menyuruh member coba kembali).

#### Modul 7.5: Presensi Mandiri via Web Link & Tiket QR (`/bookings/[id]` & `/check-in/[token]`)
* **Happy Path (UAT-CS-08):**  
  Saat tiba di studio, member dapat:
  1. Menunjukkan Pass QR di layar HP dari menu `/bookings/[id]` ke staf studio untuk dipindai, ATAU
  2. Mengklik tautan check-in mandiri privat yang dikirimkan sistem (`/check-in/[token]`) &rarr; Kehadiran terkonfirmasi instan tanpa perlu mengunduh aplikasi tambahan.

---

## 5. Daftar Verifikasi Ketahanan Non-Happy Path (Adversarial Security)

| ID Uji | Modul | Kondisi Uji Ekstrem | Ekspektasi Keamanan Sistem | Status Uji |
| :---: | :--- | :--- | :--- | :---: |
| **SEC-01** | **Otorisasi API** | Customer memanggil endpoint staf `/api/v1/customers` (UU PDP) | Server mengembalikan `HTTP 403 Forbidden` | **✅ Lolos** |
| **SEC-02** | **Isolasi Cabang** | Admin Green Garden mengedit jadwal cabang Muara Karang | Server mengembalikan `HTTP 403 Forbidden` | **✅ Lolos** |
| **SEC-03** | **Segregasi Peran** | Finance mencoba membuat slot jadwal kelas Reformer | Server mengembalikan `HTTP 403 Forbidden` | **✅ Lolos** |
| **SEC-04** | **Buku Kas** | Resepsionis mencoba menutup buku kas bulanan | Server mengembalikan `HTTP 403 Forbidden` | **✅ Lolos** |
| **SEC-05** | **Geofence GPS** | Coach absen scan QR 10 km dari studio Green Garden | Ditolak `422 Unprocessable` / `OUT_OF_GEOFENCE` | **✅ Lolos** |
| **SEC-06** | **Anti-Blind Approval** | Approval pembayaran tanpa membuka gambar struk transfer | Tombol persetujuan terkunci secara otomatis | **✅ Lolos** |
| **SEC-07** | **Maker-Checker** | Staf kasir menyetujui transaksi penjualan yang ia catat sendiri | Sistem memblokir persetujuan mandiri | **✅ Lolos** |
| **SEC-08** | **Zero-Spam** | Kirim pesan promosi WhatsApp ke akun member berhenti | Worker otomatis memfilter member berhenti (0 pesan) | **✅ Lolos** |
| **SEC-09** | **Bypass Presensi Mandiri** | Instruktur menembak API `/instructor-attendance` manual sendiri | Ditolak `HTTP 403 Forbidden` (`attendance:manage` guard) | **✅ Lolos** |
| **SEC-10** | **Payroll Lock Guard** | Pencairan honor kelas yang belum diverifikasi presensinya | Sistem menahan nominal ke `unverifiedFeeRp` & trigger warning | **✅ Lolos** |

---

## 6. Lembar Kendali Eksekusi & Kriteria Serah Terima (Sign-Off)

Untuk memastikan pengujian UAT orang awam berjalan tertib dan terukur, lembar kendali berikut digunakan pada saat eksekusi:

| No. | Skenario Pengujian | Target Role | Modul Terkait | Cakupan Validasi Kunci | Hasil Aktual | Status (Lolos / Catatan) |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | UAT-SA-01 s/d SA-10 | Super Admin | Cabang, Paket, Jadwal, KYC & Tarif Master Honor | Collision Guard, KYC Approval, Skema Tarif Master & Override Sesi | Diverifikasi | Siap Diuji Orang Awam |
| 2 | UAT-OW-01 s/d OW-02 | Owner Cabang | Laporan Finansial & Isolasi Cabang | Omset, Biaya Instruktur Aktual, Warning Unverified Honor & Multi-Branch Guard | Diverifikasi | Siap Diuji Orang Awam |
| 3 | UAT-MN-01 s/d MN-05 | Studio Manager | Approval Bayar, Adjust Medis & Tutup Kelas | Anti-Blind Review, Maker-Checker, Kompensasi Medis & Evaluasi Otomatis Honor Selesai | Diverifikasi | Siap Diuji Orang Awam |
| 4 | UAT-FD-01 s/d FD-08 | Admin Front Desk | Pendaftaran Cepat, Penjualan, & Presensi Instruktur | Drawer P0 Form, Assisted Sale, Display QR Studio & Verifikasi Manual Instruktur | Diverifikasi | Siap Diuji Orang Awam |
| 5 | UAT-CO-01 s/d CO-06 | Instruktur | Presensi QR, Geofence GPS, Roster & Akumulasi Honor | Scan QR Studio, Timeout GPS 4s, Akumulasi verifiedFeeRp vs unverifiedFeeRp Hold | Diverifikasi | Siap Diuji Orang Awam |
| 6 | UAT-FN-01 s/d FN-08 | Finance Lead | Verifikasi Bayar, Voucher, Tutup Buku & Audit Honor | Rekonsiliasi Bank, Period Lock Guard, Audit Summary vs Sessions, Penahanan Payroll Unverified | Diverifikasi | Siap Diuji Orang Awam |
| 7 | UAT-CS-01 s/d CS-08 | Customer Member | Self-Booking, Reschedule H-24 & Presensi | Rule #1 Saldo Sesi, Reschedule H-24 vs Cutoff, Pesan Ramah ATTENDANCE_RECORDED | Diverifikasi | Siap Diuji Orang Awam |

Dokumen ini telah divalidasi dan selaras 100% dengan kode program aktif pada repositori Daily Dose Pilates V2.


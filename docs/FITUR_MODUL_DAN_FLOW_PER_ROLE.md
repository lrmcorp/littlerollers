# 📖 DOKUMEN SPESIFIKASI MODUL, FITUR, ALUR END-TO-END & MATRIKS HAK AKSES PER PERAN
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `DOC-DDV2-SPEC-MODULES-FLOW-ROLES`  
**Status Dokumen:** `OFFICIAL / CANONICAL REFERENCE`  
**Versi:** `2.0.0`  
**Tanggal Rilis:** September 2026  
**Kepatuhan:** 100% Selaras dengan **13 Keputusan Bisnis yang Sudah Dikunci (*Locked Decisions*)**

---

## 🎯 Ringkasan Eksekutif & Tujuan Dokumen

Dokumen ini merupakan panduan fungsional dan teknis menyeluruh yang mendefinisikan arsitektur modul, katalog fitur, matriks perizinan (*Role-Based Access Control / RBAC*), dan alur kerja harian (*End-to-End Workflow*) untuk ke-7 peran pengguna (*roles*) di sistem **Daily Dose Pilates Studio Management System v2.0**.

Sistem dirancang sebagai **Modular Monolith** berbasis NestJS (backend), Next.js 15 (web frontend), dan Worker Cron Service terpisah untuk otomasi latar belakang, dengan database relasional MySQL.

---

## 🏗️ BAGIAN 1: ARSITEKTUR & KATALOG 7 MODUL INTI

Daily Dose Pilates v2 terbagi ke dalam 7 modul inti fungsional:

```
┌────────────────────────────────────────────────────────────────────────┐
│             DAILY DOSE PILATES STUDIO MANAGEMENT SYSTEM v2.0           │
├──────────────────┬──────────────────┬──────────────────────────────────┤
│ 1. OTENTIKASI &  │ 2. PENJADWALAN   │ 3. PEMESANAN & SIKLUS SESI       │
│    IDENTITAS/RBAC│    KELAS & STUDIO│    - Self-Booking Mandiri        │
│    - Multi-Tenant│    - Timetable   │    - Cutoff H-24 Auto-Cancel     │
│    - KYC Dokumen │    - Collision   │    - Sesi Terpotong saat Hadir   │
├──────────────────┼──────────────────┼──────────────────────────────────┤
│ 4. PRESENSI      │ 5. BUKU BESAR    │ 6. FINANSIAL, BIAYA OPERASIONAL  │
│    GANDA         │    SESI (LEDGER) │    & TUTUP BUKU BULANAN          │
│    - Link Member │    - Immutable   │    - 5 Pilar Laporan Finansial   │
│    - QR Pelatih  │    - Birokrasi   │    - Realtime vs Projected Cost  │
│    - Backfill H+2│      Sesi Medis  │    - Period Lock & Jurnal Koreksi│
├──────────────────┴──────────────────┴──────────────────────────────────┤
│ 7. OTOMASI NOTIFIKASI WHATSAPP & PENGINGAT SISTEM (WORKER CRON)        │
│    - Admin Digest (3 Jam)      - Member Reminder H-7, H-3, H-1         │
│    - Owner Recap (3 Hari)      - Member Expired Re-engagement (3 Hari) │
│    - Proteksi Anti-Spam: Pengecualian Member Berhenti (stoppedAt != null)│
└────────────────────────────────────────────────────────────────────────┘
```

---

### Modul 1: Otentikasi, Keamanan & RBAC (Identity & Access)
* **Deskripsi:** Mengelola identitas pengguna, sesi login berbasis cookie terenkripsi, hashing password menggunakan Argon2id, segregasi multi-cabang, dan verifikasi dokumen identitas KYC.
* **Fitur Utama:**
  1. *Multi-Role RBAC*: Penegakan 7 peran hierarkis (`SUPER_OWNER`, `OWNER`, `MANAGER`, `FINANCE`, `ADMIN`, `INSTRUCTOR`, `CUSTOMER`).
  2. *Branch Scoping & Isolation*: Batasan akses berbasis cabang aktif (`branchId`), mencegah kebocoran data antar-cabang.
  3. *KYC Document Verification*: Unggah KTP depan & foto selfie oleh pelanggan, peninjauan dan persetujuan oleh Super Owner, penutupan dokumen terkunci pasca-verifikasi (*tamper-proof*).
  4. *Multi-Branch Assignment*: Penugasan pemilik studio (*Owner*) ke satu atau lebih cabang studio oleh Super Owner via tabel `OwnerBranch`.

---

### Modul 2: Penjadwalan Kelas & Studio (Class & Timetable Scheduling)
* **Deskripsi:** Pengaturan jadwal kelas studio harian, mingguan, dan bulanan dengan validasi ketersediaan instruktur dan kapasitas reformer studio.
* **Fitur Utama:**
  1. *Timetable Calendar Grid*: Tampilan kalender interaktif per studio, ruangan, dan rentang jam.
  2. *Collision Guard*: Pencegahan otomatis bentrok jadwal (*conflict detection*) pada instruktur yang sama atau ruangan yang sama di jam yang beririsan.
  3. *Capacity & Room Management*: Batas kapasitas reformer spesifik per studio (misal: Ruang Reformer Green Garden = 8 reformer).
  4. *Siklus Hidup Status Kelas*: `DRAFT` $\rightarrow$ `PUBLISHED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `COMPLETED` / `CANCELLED`.

---

### Modul 3: Pemesanan & Siklus Sesi (Booking & Session Lifecycle)
* **Deskripsi:** Pengelolaan pemesanan kelas mandiri oleh pelanggan, reservasi kuota, pembatalan otomatis jika kuota minimal tidak tercapai, dan pemotongan sesi.
* **Fitur Utama:**
  1. *Customer Self-Booking*: Pelanggan memilih kelas langsung dari *timetable* publik secara mandiri (**Aturan Bisnis #2**).
  2. *Reservation vs Deduction*: Saat booking, saldo sesi hanya di-*reserve* (ditahan). Saldo sesi **HANYA dipotong** apabila kelas telah berstatus `COMPLETED` dan pelanggan terbukti hadir (**Aturan Bisnis #1**).
  3. *Cutoff Auto-Cancel H-24*: Latar belakang worker memeriksa seluruh kelas pada jendela H-24 jam sebelum mulai. Jika jumlah peserta terdaftar < Kuota Minimal cabang, kelas otomatis berstatus `CANCELLED` dan seluruh sesi dikembalikan 100% instan via mutasi `REFUND_AUTOCANCEL` (**Aturan Bisnis #4 & #5**).
  4. *Assisted Booking*: Booking manual oleh staf kasir/admin frontdesk khusus untuk kasus insidental/jarang terjadi (*rare cases*).

---

### Modul 4: Sistem Presensi Ganda (Dual Attendance & Check-In)
* **Deskripsi:** Validasi kehadiran fisik peserta dan instruktur menggunakan dua kanal independen untuk menjamin akurasi operasional dan perhitungan kompensasi.
* **Fitur Utama:**
  1. *Customer Link Mandiri*: Pelanggan melakukan konfirmasi kehadiran mandiri melalui klik Link Web Privat bertoken unik (`/check-in/[token]`), tanpa memerlukan aplikasi QR scanner eksternal (**Aturan Bisnis #1**). Tautan idempoten sehingga aman dari klik berulang.
  2. *Instructor QR Scanner*: Instruktur melakukan check-in kehadiran di studio menggunakan tablet scanner studio (`/check-in-scanner`), yang seketika memicu perhitungan kompensasi honor mengajar aktual (*Realtime Instructor Fee*).
  3. *Admin Backfill Window*: Admin studio diizinkan mengisi presensi susulan untuk pelanggan yang terlambat atau terkendala teknis, dengan batas toleransi mutlak maksimal **H+2 jam** setelah kelas berakhir (**Aturan Bisnis #9**).

---

### Modul 5: Buku Besar Sesi & Birokrasi Penyesuaian (Session Ledger & Adjustments)
* **Deskripsi:** Pencatatan setiap pergerakan saldo sesi pelanggan secara matematis, transparan, dan tidak dapat diubah (*immutable ledger*), serta penegakan tata kelola persetujuan penyesuaian sesi.
* **Fitur Utama:**
  1. *Immutable Ledger Transaction*: Setiap mutasi saldo dicatat dengan tipe resmi: `PURCHASE`, `ATTEND`, `REFUND_AUTOCANCEL`, `ADJUST_MANUAL`, dan `EXPIRE`.
  2. *Reschedule Mandiri $\ge$ H-24 Jam*: Pelanggan bebas membatalkan/mengubah jadwal minimal 24 jam sebelum kelas dimulai; sesi kembali instan ke saldo paket tanpa denda (**Aturan Bisnis #6**).
  3. *Birokrasi Reschedule / Batal Medis $<$ H-24 Jam*: Jika mendesak dalam kurun kurang dari 24 jam karena kondisi sakit darurat, pelanggan wajib menyertakan surat dokter. Admin membuat pengajuan `SessionAdjustRequest`, dan keputusan mutlak wajib disetujui oleh Studio Manager (**Aturan Bisnis #6** - *Separation of Duties*).

---

### Modul 6: Finansial, Biaya Operasional & Tutup Buku (Finance & Monthly Close)
* **Deskripsi:** Pusat pengelolaan pendapatan studio, pencatatan beban instruktur, pencatatan beban operasional lain, perbandingan antar-cabang, dan eksekusi tutup buku periodik.
* **Fitur Utama:**
  1. *4 Pilar Laporan Finansial* (proyeksi biaya dihapus 25 Okt 2026):
     - **Laporan 1: Omset Penjualan (Revenue)**: Total pembayaran paket terverifikasi.
     - **Laporan 2: Realtime Instructor Cost**: Beban honor instruktur aktual dari kelas yang selesai dan dihadiri.
     - **Laporan 3: Operational Other Cost**: Pengeluaran operasional studio di luar instruktur (sewa, listrik, air, perlengkapan, maintenance).
     - **Laporan 4: Estimasi Laba Bersih (Net Profit)**: Revenue dikurangi Beban Instruktur Aktual dan Beban Operasional Lain.
  2. *Tutup Buku Bulanan (Period Lock)*: Eksekusi kunci periode oleh Finance membekukan angka finansial bulan bersangkutan (**Aturan Bisnis #8**).
  3. *Jurnal Koreksi Pasca-Lock*: Seluruh koreksi transaksi masa lalu yang sudah terkunci dicatat pada bulan berjalan sebagai jurnal koreksi dan memerlukan approval dari Super Owner.
  4. *Isolasi Finansial Cabang*: Owner cabang hanya dapat melihat omset dan rincian honor instruktur pada cabangnya sendiri; proteksi sistem mencekal (HTTP 403 Forbidden) akses lintas cabang (**Aturan Bisnis #10**).

---

### Modul 7: Otomasi Notifikasi WhatsApp (Multi-Tier Worker Cron)
* **Deskripsi:** Layanan background worker independen yang mengirimkan notifikasi operasional terstruktur ke admin, pemilik, dan pelanggan melalui WhatsApp.
* **Fitur Utama:**
  1. *Admin Digest (Setiap 3 Jam)*: Ringkasan paket member yang kedaluwarsa ke WhatsApp Admin studio (**Aturan Bisnis #11**).
  2. *Owner & Super Owner Recap (Setiap 3 Hari)*: Laporan rekapitulasi paket kedaluwarsa dan retensi pelanggan (**Aturan Bisnis #11**).
  3. *Pengingat Masa Aktif Paket Member*: Blast otomatis ke WhatsApp member pada jendela **H-7, H-3, dan H-1** sebelum paket kedaluwarsa (**Aturan Bisnis #12**).
  4. *Re-engagement Member Expired*: Penawaran perpanjangan paket berkala setiap 3 hari pasca kedaluwarsa (**Aturan Bisnis #13**).
  5. *Proteksi Anti-Spam*: Member yang ditandai telah berhenti (`stoppedAt != null`) dikeluarkan secara mutlak dari seluruh antrean notifikasi WhatsApp.

---

## 👥 BAGIAN 2: MATRIKS HAK AKSES & PERIZINAN (7 PERAN)

Sistem Daily Dose Pilates v2 menerapkan kontrol hak akses berbasis kapabilitas (*capabilities-based RBAC*) yang ketat. 

### Tabel Matriks Hak Akses Modul & Fitur

| Modul & Fitur Sistem | Super Owner | Branch Owner | Studio Manager | Finance | Frontdesk Admin | Instructor / Coach | Customer / Member |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Kredensial Pengujian Resmi** | `superowner@dailydose.test` | `owner.gg@dailydose.test` | `manager.gg@dailydose.test` | `finance@dailydose.test` | `adminmk@ddose.com` | `coach.sarah@dailydose.test` | `amanda.member@dailydose.test` |
| **Scope Akses Data** | Global (Semua) | Cabang Terdaftar | Cabang Bertugas | Global (Keuangan) | Cabang Bertugas | Jadwal Sendiri | Akun Pribadi |
| **1. Manajemen Pengguna & Staf** | ✅ Penuh | ❌ Baca Staf Cabang | ❌ Baca Staf Cabang | ❌ | ❌ | ❌ | ❌ |
| **2. Penugasan Owner Cabang (`OwnerBranch`)** | ✅ Penuh | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **3. Verifikasi Identitas KYC (KTP/Selfie)** | ✅ Review/Approve | ❌ | ❌ | ❌ | ❌ | ❌ | 🔼 Unggah Mandiri |
| **4. Penyusunan Jadwal & Timetable Kelas** | ✅ | ❌ Baca | ✅ Kelola Cabang | ❌ | ✅ Kelola Cabang | ❌ | ❌ Baca Saja |
| **5. Collision Guard Override** | ❌ (Guard Mutlak) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **6. Customer Self-Booking** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Mandiri |
| **7. Assisted Booking (Kasir)** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **8. Presensi Mandiri Customer (Web Link)**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Klik Link Privat |
| **9. Presensi Instruktur (QR Scanner)** | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ Scan di Studio | ❌ |
| **10. Backfill Presensi ($\le$ H+2 Jam)** | ✅ | ❌ | ✅ Cabang | ❌ | ✅ Cabang | ❌ | ❌ |
| **11. Backfill Presensi ($>$ H+2 Jam)** | ❌ (Dicekal) | ❌ | ❌ (Dicekal) | ❌ | ❌ (Dicekal) | ❌ | ❌ |
| **12. Reschedule Mandiri ($\ge$ H-24 Jam)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Instan |
| **13. Pengajuan Adjust Sesi Medis ($<$ H-24)**| ✅ Ajukan (SoD: tidak boleh memutus pengajuannya sendiri) | ❌ | ❌ (SoD) | ❌ | ✅ Ajukan Bukti | ❌ | 🔼 Minta ke Admin |
| **14. Keputusan Adjust Sesi Medis** | ✅ Approve/Reject | ❌ | ✅ Approve/Reject | ❌ | ❌ (SoD) | ❌ | ❌ |
| **15. Verifikasi Bukti Bayar Paket** | ✅ | ❌ | ✅ Approve/Reject | ✅ Approve/Reject | ❌ Review Saja | ❌ | 🔼 Unggah Bukti |
| **16. Input Beban Lain (*Other Cost*)** | ✅ | ❌ | ❌ | ✅ Input/Edit | ❌ | ❌ | ❌ |
| **17. 5 Pilar Laporan Keuangan** | ✅ Global | ❌ (Hanya Cabangnya) | ❌ | ✅ Global | ❌ | ❌ | ❌ |
| **18. Transparansi Fee Instruktur Cabang** | ✅ Global | ✅ Cabangnya Sendiri | ❌ | ✅ Global | ❌ | ✅ Fee Sendiri | ❌ |
| **19. Eksekusi Tutup Buku (*Period Lock*)** | ✅ Override | ❌ | ❌ | ✅ Eksekusi | ❌ | ❌ | ❌ |
| **20. Approval Jurnal Koreksi Pasca-Lock** | ✅ Otoritas Tunggal | ❌ | ❌ | 🔼 Pengajuan | ❌ | ❌ | ❌ |
| **21. Tandai Customer Berhenti (`stoppedAt`)**| ✅ | ❌ | ✅ Cabang | ❌ | ❌ | ❌ | ❌ |
| **22. Trigger Manual Job Otomasi WA** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |

*Keterangan Simbol:*  
* `✅`: Diizinkan penuh sesuai wewenang.  
* `❌`: Dilarang keras / dicekal oleh sistem (HTTP 403 Forbidden).  
* `🔼`: Aksi awal berupa pengunggahan data atau permohonan.  
* `SoD`: Dibatasi oleh prinsip *Separation of Duties* (Pemisahan Tugas).

---

## 🔍 RINCIAN AKSES & BATASAN MUTLAK PER PERAN

### 1. Peran: `SUPER_OWNER`
* **Definisi:** Pemegang otoritas tertinggi di seluruh entitas Daily Dose Pilates. Memiliki akses global tanpa terikat satu cabang tertentu (`branchId: null`).
* **Apa Saja yang BISA Dilakukan:**
  1. Menugaskan kepemilikan cabang kepada akun Owner via antarmuka penugasan multi-cabang (`/assignments` & `OwnerBranch`).
  2. Meninjau, memverifikasi (*Approve*), dan menolak dokumen identitas KYC (KTP & Selfie) di `/customers/[id]` dan `/identity-verifications`.
  3. Menyetujui atau menolak permohonan Jurnal Koreksi finansial pasca Tutup Buku Bulanan.
  4. Mengakses ringkasan dan 4 laporan finansial komparatif seluruh cabang (`/finance`).
  5. Mengatur konfigurasi tarif dasar instruktur (`/master`, tab Honor Instruktur; URL lama `/master/rates` dialihkan ke sana). Tarif honor hanya dapat diubah oleh Finance dan Super Owner.
  6. Mengelola akun staf, penetapan hak akses, audit log, dan trigger darurat job latar belakang.
* **Apa Saja yang DILARANG / BATASAN:**
  1. Dilarang melakukan backfill presensi kelas yang telah lewat lebih dari batas toleransi H+2 jam (aturan sistem terkunci di database).
  2. Dilarang menimpa (*override*) Collision Guard jadwal kelas (aturan pencegahan bentrok bersifat fisik dan absolut).

---

### 2. Peran: `OWNER` (Branch Owner)
* **Definisi:** Pemilik atau investor pada satu atau beberapa cabang studio spesifik yang ditugaskan resmi oleh Super Owner.
* **Apa Saja yang BISA Dilakukan:**
  1. Mengakses dashboard performa omset, tren reservasi, dan jumlah kelas pada cabangnya sendiri (`/workspace/branch-performance`).
  2. Melihat transparansi penuh rincian jam mengajar dan akumulasi *Instructor Cost* (realtime) khusus untuk instruktur yang mengajar di cabangnya (**Aturan Bisnis #10**).
  3. Menerima rekapitulasi notifikasi WhatsApp status paket pelanggan setiap 3 hari sekali (**Aturan Bisnis #11**).
  4. Memantau daftar staf dan pelanggan yang berafiliasi dengan cabangnya.
* **Apa Saja yang DILARANG / BATASAN:**
  1. **Dilarang keras mengakses data cabang lain**: Sistem akan memblokir seketika dengan status `403 Forbidden` jika mencoba membaca data studio lain (*Cross-Branch Isolation Shield*).
  2. Dilarang menyetujui penyesuaian sesi (*Session Adjust Request*) atau melakukan verifikasi pembayaran paket (kewenangan operasional dipegang Manager/Finance).
  3. Dilarang melakukan tutup buku bulanan (*Period Lock*) atau mengubah master tarif studio.

---

### 3. Peran: `MANAGER` (Studio Manager)
* **Definisi:** Pengelola operasional harian cabang studio. Bertindak sebagai *Approver* utama untuk transaksi dan birokrasi sesi di cabangnya.
* **Apa Saja yang BISA Dilakukan:**
  1. Memeriksa dan menyetujui/menolak bukti transfer pembayaran pembelian paket member di `/workspace/payments` (**Aturan Bisnis #1**).
  2. Memutuskan persetujuan atau penolakan permohonan penyesuaian sesi darurat medis $< H-24$ jam (`SessionAdjustRequest`) di `/ledger/adjustments` (**Aturan Bisnis #6**).
  3. Mengatur jadwal kelas studio cabang, menugaskan instruktur, dan mempublikasikan jadwal ke member.
  4. Menandai profil customer yang berhenti berlangganan (`stoppedAt = NOW()`) di `/customers/[id]` untuk mencegah kiriman blast WA promosi (**Aturan Bisnis #12 & #13**).
  5. Melakukan presensi susulan (*backfill*) kehadiran pelanggan maksimal H+2 jam jika staf admin berhalangan.
* **Apa Saja yang DILARANG / BATASAN:**
  1. **Prinsip Separation of Duties (SoD)**: Manager dilarang mengajukan (*request*) penyesuaian saldo sesi untuk dirinya sendiri; pengajuan wajib diinisiasi oleh Admin frontdesk.
  2. Dilarang melakukan tutup buku bulanan atau mengubah konfigurasi biaya operasional lain (*Other Cost*).
  3. Dilarang melihat data dan laporan finansial cabang studio lain di luar wilayah tugasnya.

---

### 4. Peran: `FINANCE` (Financial Officer)
* **Definisi:** Petugas keuangan studio yang mengawal akurasi kas, pengeluaran operasional, verifikasi pembayaran, dan siklus penutupan buku periodik.
* **Apa Saja yang BISA Dilakukan:**
  1. Mengakses dan menganalisis 5 Laporan Keuangan Inti (Omset, Realtime Cost, Projected Cost, Other Cost, Profit) di `/finance`.
  2. Melakukan verifikasi dan konfirmasi pembayaran paket pembelian member bersama Manager.
  3. Menginput, memperbarui, dan mengkategorisasikan pengeluaran operasional studio (*Other Cost*) seperti utilitas, sewa gedung, dan peralatan di `/finance`.
  4. Melakukan rekonsiliasi mutasi rekening bank studio dengan transaksi di sistem.
  5. Mengeksekusi Tutup Buku Bulanan (*Period Lock*) untuk membekukan data finansial suatu bulan kalender (**Aturan Bisnis #8**).
  6. Mengajukan jurnal koreksi penyesuaian transaksi pasca-tutup buku kepada Super Owner.
* **Apa Saja yang DILARANG / BATASAN:**
  1. Dilarang mengubah jadwal kelas harian atau melakukan perubahan slot instruktur.
  2. Dilarang menyetujui pembatalan/penyesuaian sesi medis member (kewenangan operasional Manager).
  3. Dilarang merevisi atau menghapus angka laporan pada periode yang sudah berstatus *Locked* tanpa melalui persetujuan Jurnal Koreksi oleh Super Owner.

---

### 5. Peran: `ADMIN` (Front Desk / Studio Receptionist)
* **Definisi:** Staf operasional garda depan studio yang melayani pelanggan langsung di studio, mengatur slot kelas, dan menangani presensi darurat.
* **Apa Saja yang BISA Dilakukan:**
  1. Menyusun jadwal kelas studio (*timetable*) dan menugaskan instruktur yang tersedia pada ruangan reformer di `/workspace/classes`.
  2. Melakukan *Assisted Booking* (pemesanan kelas dibantu kasir) jika pelanggan mengalami kendala gawai atau memesan langsung di meja resepsionis (**Aturan Bisnis #2**).
  3. Melakukan presensi susulan (*Backfill Attendance*) bagi peserta yang hadir tetapi lupa klik link check-in, dalam batas toleransi $\le H+2$ jam dari jam selesai kelas (**Aturan Bisnis #9**).
  4. Menerima surat keterangan sakit dari member dan menginisiasi pengajuan penyesuaian sesi darurat medis $< H-24$ jam (`SessionAdjustRequest`) di `/ledger/adjustments` (**Aturan Bisnis #6**).
  5. Menerima rekapitulasi notifikasi WhatsApp setiap 3 jam perihal paket member yang kedaluwarsa (**Aturan Bisnis #11**).
* **Apa Saja yang DILARANG / BATASAN:**
  1. **Prinsip Separation of Duties (SoD)**: Admin dilarang menyetujui (*approve*) pengajuan penyesuaian sesi yang dia buat sendiri; approval mutlak berada di tangan Manager.
  2. Dilarang melakukan backfill presensi jika jam kelas telah selesai lebih dari 2 jam yang lalu ($> H+2$).
  3. Dilarang mengakses laporan laba rugi, margin profit, dan biaya operasional studio.

---

### 6. Peran: `INSTRUCTOR` / `COACH`
* **Definisi:** Pelatih pilates bersertifikasi yang bertugas memandu latihan di studio reformer.
* **Apa Saja yang BISA Dilakukan:**
  1. Mengajukan jadwal ketersediaan waktu mengajar (*Instructor Availability*) ke studio.
  2. Melihat daftar kelas yang ditugaskan kepada dirinya serta daftar peserta yang terdaftar pada kelas tersebut di `/workspace/classes`.
  3. Melakukan presensi kedatangan mengajar melalui Tablet QR Scanner yang tersedia di studio (`/check-in-scanner`) (**Aturan Bisnis #1**).
  4. Menandai kelas yang telah selesai diajar sebagai `COMPLETED`.
  5. Melihat riwayat jam mengajar dan akumulasi honor mengajar (*fee*) miliknya sendiri secara transparan.
* **Apa Saja yang DILARANG / BATASAN:**
  1. Dilarang melihat data personal sensitif member (seperti foto KTP/Selfie, alamat rumah, atau data transaksi keuangan member).
  2. Dilarang mengubah jadwal kelas, membatalkan kelas sepihak, atau memanipulasi presensi peserta.
  3. Dilarang mengakses dashboard keuangan studio, omset cabang, atau beban operasional cabang.

---

### 7. Peran: `CUSTOMER` / `MEMBER`
* **Definisi:** Pelanggan aktif atau calon pelanggan studio Daily Dose Pilates.
* **Apa Saja yang BISA Dilakukan:**
  1. Melakukan registrasi mandiri akun baru dan login berbasis sandi aman di `/register` & `/sign-in`.
  2. Mengunggah dokumen identitas KYC (foto KTP dan foto selfie wajah) di `/account/verification` untuk membuka akses penuh pemesanan kelas.
  3. Memilih, memesan (*checkout*), dan mengunggah bukti transfer bank untuk pembelian paket sesi di `/packages` dan `/checkout`.
  4. Melihat jadwal kelas studio aktif (*timetable*) dan melakukan pemesanan kelas mandiri (*Self-Booking*) di `/classes` (**Aturan Bisnis #2**).
  5. Melakukan pembatalan dan penjadwalan ulang (*Reschedule*) mandiri jika waktu kelas masih $\ge H-24$ jam di `/bookings`, di mana sesi otomatis kembali 100% (**Aturan Bisnis #6**).
  6. Mengonfirmasi kehadiran fisik di studio dengan sekali klik pada Link Web Privat (`/check-in/[token]`) yang dikirimkan sistem tanpa memerlukan scanner khusus (**Aturan Bisnis #1**).
  7. Meninjau saldo sisa sesi, masa berlaku paket (*validUntil*), dan riwayat mutasi buku besar sesi di `/account`.
* **Apa Saja yang DILARANG / BATASAN:**
  1. Dilarang melakukan booking kelas jika dokumen identitas KYC belum disetujui (`status != APPROVED`).
  2. Dilarang melakukan reschedule mandiri langsung jika sisa waktu menuju kelas kurang dari 24 jam ($< H-24$); wajib menghubungi admin dan menyertakan bukti darurat medis.
  3. Dilarang mengakses seluruh antarmuka internal studio (area `/workspace`, `/finance`, `/master`, dll).

---

## 🔄 BAGIAN 3: ALUR KERJA END-TO-END PER PERAN (LIFECYCLE & JOURNEYS)

---

### Flow 1: Customer End-to-End Journey (Member Baru Hingga Selesai Latihan)

```
[Customer Mendaftar]
        │
        ▼
[Unggah KTP & Selfie di /account/verification] ──► [Super Owner Menyetujui KYC]
        │                                                     │
        ▼                                                     ▼
[Pilih Paket di /packages & Transfer] ──────────► [Manager Verifikasi Pembayaran]
        │                                                     │
        ▼                                                     ▼
[Saldo Sesi Aktif di Akun]                                    │
        │                                                     │
        ▼                                                     │
[Buka Timetable di /classes & Self-Booking] ◄─────────────────┘
        │
        ├──────────────────────────────────────┐
        │                                      │
   (Kondisi A: $\ge$ H-24 Jam)          (Kondisi B: Auto-Cancel H-24)
        │                                      │
        ▼                                      ▼
[Reschedule Mandiri di /bookings]       [Worker Cron Deteksi Peserta < Min Quota]
        │                                      │
        ▼                                      ▼
[Sesi Kembali Utuh ke Paket]            [Kelas BATAL & Sesi Refund Otomatis 100%]
        │
        ▼ (Jika Kelas Lanjut $\ge$ Min Quota)
[Hari-H Kelas: Datang ke Studio]
        │
        ▼
[Buka Link Privat /check-in/[token] & Klik Hadir] ──► Presensi Tercatat Idempoten
        │
        ▼
[Instruktur Selesaikan Kelas (COMPLETED)]
        │
        ▼
[Sistem Potong Saldo Sesi (ATTEND)] ──► Sesi Berkurang 1 di Session Ledger
```

1. **Onboarding & KYC**: Pelanggan mendaftar di `/register` $\rightarrow$ mengunggah foto KTP dan foto selfie wajah di `/account/verification`. Status verifikasi berstatus `PENDING`.
2. **Persetujuan Identitas**: Super Owner meninjau dokumen dan menekan tombol *Approve*. Status verifikasi akun menjadi `APPROVED`.
3. **Pembelian Paket**: Pelanggan masuk ke menu `/packages` $\rightarrow$ memilih paket (misal: *Package 10 Sessions*) $\rightarrow$ melakukan transfer bank sesuai nomor rekening studio $\rightarrow$ mengunggah bukti transfer di `/checkout`.
4. **Aktivasi Saldo**: Studio Manager memvalidasi mutasi bukti bayar di `/workspace/payments` dan menyetujuinya $\rightarrow$ mutasi ledger `PURCHASE` terbit $\rightarrow$ saldo sesi aktif bertambah 10 sesi dengan masa berlaku tertentu (*validUntil*).
5. **Self-Booking Kelas**: Pelanggan membuka timetable di `/classes` $\rightarrow$ memilih kelas reformer di cabang Green Garden $\rightarrow$ klik *Book Now*. Sistem memeriksa saldo aktif: kuota reformer direservasi (*reserved*), namun **saldo sesi belum dipotong** (**Aturan Bisnis #1**).
6. **Otomasi Evaluasi H-24**:
   - Jika kuota minimal terpenuhi: kelas terkonfirmasi (`CONFIRMED`).
   - Jika kuota minimal tidak tercapai: sistem membatalkan kelas otomatis, pelanggan menerima notifikasi WA, dan sesi dikembalikan instan via mutasi `REFUND_AUTOCANCEL` (**Aturan Bisnis #4**).
7. **Kehadiran Hari-H**: Pelanggan tiba di studio $\rightarrow$ membuka tautan privat `/check-in/[token]` yang diterima $\rightarrow$ menekan tombol "Konfirmasi Kehadiran". Sistem memvalidasi kehadiran secara aman dan idempoten.
8. **Penyelesaian Kelas & Pemotongan Sesi**: Instruktur menandai kelas `COMPLETED`. Sistem memverifikasi kehadiran pelanggan, lalu secara otomatis mencatat mutasi ledger `ATTEND` dan memotong 1 saldo sesi dari paket pelanggan.

---

### Flow 2: Admin Front Desk End-to-End Flow (Operasional Studio Harian)

```
[Buka Kalender /workspace/classes]
        │
        ▼
[Buat Slot Kelas Baru: Ruangan, Jam, Instruktur, Kuota Min & Maks]
        │
        ▼ (Collision Guard Memvalidasi: Tidak Ada Bentrok)
[Publikasikan Kelas (PUBLISHED)]
        │
        ├──────────────────────────────────────┐
        │                                      │
   (Kasus Normal)                       (Kasus Insidental / Khusus)
        │                                      │
        ▼                                      ▼
[Member Booking Mandiri]                [Assisted Booking oleh Admin di Kasir]
        │                                      │
        ├──────────────────────────────────────┴────────────────┐
        │                                                       │
   (Hari-H Kelas Selesai)                                (Member Sakit Mendadak < H-24)
        │                                                       │
        ▼                                                       ▼
[Member Lupa Klik Link Check-In]                        [Member Hubungi Admin Bawa Surat Dokter]
        │                                                       │
        ▼ (Waktu Selesai Masih $\le$ H+2 Jam)                   ▼
[Admin Buka /classes & Klik Backfill Hadir]             [Admin Ajukan SessionAdjustRequest di /ledger/adjustments]
        │                                                       │
        ▼                                                       ▼
[Presensi Berhasil Disusulkan]                          [Menunggu Persetujuan Resmi Manager Studio]
```

1. **Penyusunan Jadwal**: Admin membuka kalender jadwal studio di `/workspace/classes` $\rightarrow$ memilih ruangan studio reformer $\rightarrow$ memilih jam mulai & selesai $\rightarrow$ menugaskan instruktur yang tersedia $\rightarrow$ menentukan Kuota Minimum dan Kuota Maksimum cabang.
2. **Pemeriksaan Collision Guard**: Sistem secara otomatis mengecek jadwal instruktur dan ketersediaan fisik ruangan studio. Jika tidak ada bentrok, jadwal berhasil disimpan dengan status `PUBLISHED`.
3. **Assisted Booking (Pemesanan Dibantu)**: Jika terdapat member lansia atau member yang mengalami kendala koneksi di meja kasir, Admin membuka menu `/workspace/bookings` $\rightarrow$ memilih nama member $\rightarrow$ memilih kelas $\rightarrow$ mengeksekusi *Assisted Booking*.
4. **Presensi Susulan (Backfill Attendance $\le$ H+2 Jam)**: Jika ada pelanggan yang hadir secara fisik namun baterai ponselnya habis sehingga tidak sempat membuka link check-in mandiri, Admin membuka daftar hadir kelas di `/classes` $\rightarrow$ menekan tombol *Backfill Attendance*.
   - *Validasi Sistem*: Jika waktu selesai kelas belum melewati 2 jam ($\le H+2$), presensi berhasil disimpan (**Aturan Bisnis #9**).
   - *Pencegahan Manipulasi*: Jika sudah lewat dari 2 jam ($> H+2$), tombol otomatis nonaktif dan API menolak dengan galat `400 Bad Request`.
5. **Pengajuan Kompensasi Medis ($<$ H-24 Jam)**: Jika member mendadak masuk rumah sakit 6 jam sebelum kelas dimulai dan melampirkan surat dokter:
   - Admin membuka `/ledger/adjustments` $\rightarrow$ membuat permohonan penyesuaian sesi dengan melampirkan dokumen surat sakit.
   - Sesuai prinsip *Separation of Duties*, status tiket pengajuan menjadi `PENDING_APPROVAL` dan diteruskan ke meja Studio Manager (**Aturan Bisnis #6**).

---

### Flow 3: Studio Manager End-to-End Flow (Pengawasan & Persetujuan)

```
[Buka Dashboard Manager /workspace]
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
[Antrean Bukti Bayar /workspace/payments]  [Antrean Kompensasi /ledger/adjustments]
        │                                      │
        ▼                                      ▼
[Cocokkan Rekening Bank Studio]         [Periksa Surat Keterangan Dokter]
        │                                      │
        ▼                                      ▼
[Klik APPROVE Pembayaran Member]        [Klik APPROVE Penyesuaian Sesi]
        │                                      │
        ▼                                      ▼
[Saldo Paket Member Aktif 100%]         [Sistem Terbitkan Mutasi ADJUST_MANUAL (+1 Sesi)]
        │
        ▼ (Tugas Berkala)
[Member Berhenti Berlangganan: Buka /customers/[id] & Klik "Tandai Berhenti"]
        │
        ▼
[Kolom stoppedAt Terisi: 100% Bebas Spam Notifikasi WhatsApp]
```

1. **Verifikasi Pembayaran Paket**:
   - Manager membuka antrean pembayaran di `/workspace/payments`.
   - Memeriksa nama pembeli, paket yang dipilih, nominal transfer, dan gambar struk transfer bank.
   - Manager menekan tombol **APPROVE** $\rightarrow$ status order berubah menjadi `COMPLETED` dan saldo sesi otomatis masuk ke buku besar pelanggan.
2. **Persetujuan Penyesuaian Sesi Darurat Medis**:
   - Manager membuka `/ledger/adjustments` dan meninjau daftar pengajuan berstatus `PENDING`.
   - Memeriksa catatan pengajuan dari Admin dan memvalidasi keabsahan dokumen surat dokter yang diunggah.
   - Manager menekan **APPROVE** $\rightarrow$ sistem menerbitkan mutasi buku besar `ADJUST_MANUAL` (+1 Sesi) ke akun member, mengembalikan sesi yang hangus secara sah dan teraudit.
3. **Penghentian Notifikasi Member Berhenti**:
   - Ketika ada member yang menyatakan tidak akan memperpanjang lagi atau pindah ke luar kota, Manager membuka profil member di `/customers/[id]`.
   - Manager menekan tombol **"Tandai Member Berhenti"** $\rightarrow$ kolom `stoppedAt` terisi waktu saat ini.
   - Seketika seluruh cron notifikasi WhatsApp mengecualikan member tersebut dari daftar blast pengingat kedaluwarsa (**Aturan Bisnis #12 & #13**).

---

### Flow 4: Instructor / Coach End-to-End Flow (Pengajaran & Presensi Studio)

```
[Buka Jadwal Pribadi di /workspace/classes]
        │
        ▼
[Lihat Penugasan Kelas & Daftar Peserta yang Terdaftar]
        │
        ▼
[Tiba di Studio: Buka Tablet Scanner di /check-in-scanner]
        │
        ▼
[Pindai QR Pass Instruktur] ──► Presensi Instruktur TERCATAT di Studio
        │
        ▼
[Pandu Sesi Latihan Pilates Reformer hingga Selesai]
        │
        ▼
[Tandai Kelas Berstatus COMPLETED]
        │
        ▼
[Sistem Hitung Fee Mengajar Realtime Berdasarkan Tarif & Jumlah Kehadiran]
        │
        ▼
[Instruktur Lihat Rekapitulasi Honor Mengajar di Profil Pribadi]
```

1. **Pemeriksaan Jadwal Mengajar**: Instruktur masuk ke sistem dan melihat jadwal penugasan kelasnya di `/workspace/classes`. Instruktur dapat melihat jumlah murid yang sudah memesan tempat di kelasnya.
2. **Presensi Kehadiran di Studio**:
   - Begitu tiba di studio sebelum kelas dimulai, instruktur mendatangi meja resepsionis studio.
   - Menghadap ke kamera Tablet Studio pada menu `/check-in-scanner` dan memindai kode QR Pass miliknya (**Aturan Bisnis #1**).
   - Presensi instruktur terverifikasi seketika di database.
3. **Pelaksanaan Kelas & Penyelesaian**:
   - Instruktur memandu sesi latihan selama 50-60 menit sesuai instruksi keselamatan reformer.
   - Setelah seluruh peserta selesai berlatih, instruktur menekan tombol **"Complete Class"**.
4. **Kalkulasi Fee Mengajar Otomatis**:
   - Sistem mendeteksi status kelas berubah menjadi `COMPLETED` dan instruktur terbukti hadir melalui scanner.
   - Sistem secara otomatis menghitung *Realtime Instructor Fee* berdasarkan parameter tarif per jam atau skema bagi hasil studio, dan mencatatnya ke modul pembukuan cabang.

---

### Flow 5: Finance Officer End-to-End Flow (Akuntansi & Tutup Buku)

```
[Buka Dashboard Finansial di /finance]
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
[Periksa Arus Kas Masuk (Revenue)]      [Input Biaya Operasional di Other Cost]
        │                               (Listrik, Sewa Gedung, Maintenance)
        ▼                                      │
[Rekonsiliasi Mutasi Bank]                     │
        │                                      │
        ├──────────────────────────────────────┘
        │
        ▼
[Analisis 5 Pilar Laporan Keuangan Studio]
  1. Total Omset Penjualan
  2. Beban Instruktur Aktual (Realtime Cost)
  3. Beban Operasional Lain (Other Cost)
  4. Estimasi Laba Bersih (Net Profit)
        │
        ▼ (Akhir Periode Bulan Berjalan)
[Eksekusi Tutup Buku Bulanan (Period Lock)]
        │
        ▼
[Seluruh Angka Finansial Terkunci Permanen]
        │
        ▼ (Jika Ditemukan Kesalahan Input Masa Lalu)
[Finance Ajukan Jurnal Koreksi] ──► [Super Owner Setujui di Bulan Berjalan]
```

1. **Pemantauan Pendapatan & Rekonsiliasi**: Petugas Finance membuka `/finance` setiap hari untuk memantau paket yang terjual, mencocokkan laporan penerimaan sistem dengan mutasi rekening koran bank studio.
2. **Pencatatan Biaya Operasional (*Other Cost*)**:
   - Finance membuka tab *Other Cost* di `/finance`.
   - Menginput biaya operasional cabang (seperti tagihan listrik, air PAM, sewa gedung, pembelian kaos kaki pilates, servis berkala mesin reformer, internet studio).
   - Biaya langsung terhubung ke kalkulasi margin laba cabang bersangkutan.
3. **Analisis Komparatif 5 Laporan**:
   - Finance membandingkan performa antara cabang Muara Karang (`DD-MK`) dan Green Garden (`DD-GG`).
   - Memastikan perbandingan antara *Projected Cost* (estimasi kelas mendatang) dengan *Realtime Cost* (beban aktual kelas selesai) berada pada batas anggaran yang sehat.
4. **Eksekusi Tutup Buku Bulanan (*Period Lock*)**:
   - Pada tanggal cutoff akhir bulan, Finance memverifikasi seluruh transaksi telah berstatus final.
   - Finance menekan tombol **"Tutup Buku Periode Ini"** (**Aturan Bisnis #8**).
   - Database menyematkan tanda *Locked*: seluruh transaksi pada bulan tersebut dibekukan dan tidak dapat diubah maupun dihapus.
5. **Penanganan Koreksi Pasca-Lock**:
   - Jika terdapat nota biaya tertinggal dari bulan yang telah terkunci, Finance dilarang membuka kunci secara langsung.
   - Finance membuat permohonan *Jurnal Koreksi* yang dicatatkan pada buku kas bulan berjalan, dan wajib disetujui resmi oleh Super Owner.

---

### Flow 6: Branch Owner End-to-End Flow (Pengawasan Pemilik Cabang)

```
[Owner Login di /sign-in]
        │
        ▼
[Sistem Mengidentifikasi Cabang Terdaftar (Misal: Green Garden DD-GG)]
        │
        ▼
[Buka /workspace/branch-performance]
        │
        ├───────────────────────────────────────────────────────┐
        │                                                       │
        ▼                                                       ▼
[Pantau Omset & Utilisasi Studio GG]            [Audit Transparansi Fee Instruktur GG]
  - Total Reservasi Reformer                      - Rincian Jam Mengajar per Instruktur
  - Okupansi Kelas Harian & Mingguan             - Fee Aktual Selesai per Instruktur
        │                                                       │
        └───────────────────────────────────────────────────────┘
        │
        ▼ (Uji Keamanan: Owner Mencoba Buka Data Cabang Muara Karang DD-MK)
[Sistem Mencekal Seketika dengan Layar 403 Forbidden (Cross-Branch Shield)]
```

1. **Login & Scoping Otomatis**: Akun Owner login di `/sign-in`. Sistem membaca relasi tabel `OwnerBranch` dan menetapkan batasan scope cabang aktif (misal: hanya cabang Green Garden `DD-GG`).
2. **Monitoring Kinerja Studio Cabang**:
   - Owner membuka `/workspace/branch-performance`.
   - Meninjau total omset penjualan paket, tingkat okupansi reformer per slot jam ramai (*peak hours*), dan jumlah pelanggan aktif di cabangnya.
3. **Audit Transparansi Honor Instruktur Cabang**:
   - Sesuai **Aturan Bisnis #10**, Owner dapat membuka rincian jam mengajar dan akumulasi honor yang harus dibayarkan studio kepada masing-masing instruktur di cabangnya.
   - Owner memvalidasi bahwa beban instruktur sebanding dengan jumlah murid yang hadir pada setiap sesi.
4. **Verifikasi Keamanan Cross-Branch Isolation**:
   - Jika Owner mencoba mengubah parameter URL ke cabang Muara Karang (`branchId=DD-MK`), sistem backend dan frontend secara otomatis menghentikan permintaan dengan status `403 Forbidden`. Data studio cabang lain terlindungi 100% dari kebocoran (*Zero Cross-Branch Leakage*).

---

### Flow 7: Super Owner End-to-End Flow (Tata Kelola Multi-Cabang & Otoritas Tertinggi)

```
[Super Owner Login di /sign-in]
        │
        ▼
[Buka Menu Super Admin /workspace/branches & /assignments]
        │
        ├──────────────────────────────────────────────────────┐
        │                                                      │
        ▼                                                      ▼
[Atur Penugasan Multi-Cabang Owner]             [Verifikasi Identitas KYC Pelanggan]
  - Tunjuk Owner A untuk Cabang GG                - Buka /identity-verifications
  - Tunjuk Owner B untuk Cabang MK                - Periksa Kejelasan Foto KTP & Selfie
  - Atur Periode Aktif Penugasan                  - Klik APPROVE (Dokumen Terkunci Aman)
        │                                                      │
        ├──────────────────────────────────────────────────────┘
        │
        ▼
[Pengawasan Finansial Konsolidasi di /finance]
  - Perbandingan Laba Rugi Lintas Seluruh Cabang
  - Pengaturan Tarif Global Instruktur di /master (tab Honor Instruktur)
        │
        ▼ (Koreksi Finansial Bulanan)
[Tinjau Permohonan Jurnal Koreksi dari Finance Pasca Tutup Buku]
        │
        ▼
[Super Owner Memberikan Otorisasi Persetujuan Resmi (APPROVED)]
```

1. **Penetapan Hak Milik Cabang (*Owner Assignment*)**:
   - Super Owner membuka `/assignments` $\rightarrow$ memilih profil pengguna Owner $\rightarrow$ menetapkan cabang yang menjadi hak miliknya (misal: Green Garden atau penugasan multi-cabang sekaligus) (**Aturan Bisnis #7**).
2. **Verifikasi Dokumen Identitas KYC**:
   - Super Owner membuka antrean verifikasi di `/identity-verifications`.
   - Memeriksa foto KTP dan foto selfie pelanggan baru.
   - Menekan tombol **APPROVE** $\rightarrow$ dokumen identitas berstatus sah dan otomatis dikunci secara permanen (tidak dapat disunting kembali untuk mencegah manipulasi data identitas).
3. **Tata Kelola Master Tarif Global**:
   - Super Owner mengatur besaran tarif dasar honor instruktur per jam, dan kuota peserta di `/master` (tab Honor Instruktur dan Kuota & Kapasitas; `/master/rates` dialihkan ke sana).
4. **Persetujuan Jurnal Koreksi Finansial Pasca-Lock**:
   - Ketika Finance mengajukan koreksi penyesuaian transaksi untuk periode yang telah ditutup buku, permohonan masuk ke antrean Super Owner.
   - Super Owner memeriksa justifikasi audit koreksi tersebut dan menekan tombol **APPROVE** untuk meresmikan jurnal koreksi pada buku berjalan (**Aturan Bisnis #8**).

---

## 🔒 BAGIAN 4: PENERAPAN 13 KEPUTUSAN BISNIS DALAM ALUR SISTEM

Seluruh modul dan alur kerja di atas ditegakkan secara baku oleh **13 Keputusan Bisnis yang Sudah Dikunci**:

| No | Keputusan Bisnis Terkunci | Penegakan Teknis di Modul & Endpoint Sistem |
| :---: | :--- | :--- |
| **#1** | **Sesi Terpotong saat Selesai & Hadir** | Pemotongan sesi terjadi di event `ClassService.completeClass()`. Hanya peserta dengan `AttendanceRecord.status = PRESENT` yang dipotong sesi lewat mutasi ledger `ATTEND`. Presensi customer via `/check-in/[token]` (web link idempoten), instruktur via `/check-in-scanner` (QR). |
| **#2** | **Customer Self-Booking** | Rute `/classes` terbuka untuk publik/member dengan KYC approved. Booking mandiri via `POST /api/bookings`. Kasir hanya menggunakan *Assisted Booking* di `/workspace/bookings` untuk kondisi darurat. |
| **#3** | **Expiry Basis Masa Aktif Paket** | Tabel `CustomerPackage` menyimpan kolom `validUntil`. Background cron mengevaluasi tanggal kedaluwarsa setiap malam: sisa sesi otomatis berstatus expired dengan mutasi ledger `EXPIRE`. |
| **#4** | **Cutoff Auto-Cancel H-24** | Cron service mengevaluasi seluruh kelas berstatus `PUBLISHED` pada jendela $T-24$ jam. Jika jumlah booking $< minQuota$, status kelas berubah ke `CANCELLED`, sesi dikembalikan instan melalui mutasi ledger `REFUND_AUTOCANCEL`. |
| **#5** | **Min Quota per Kelas per Cabang** | Kolom `minQuota` dan `capacity` didefinisikan per relasi tipe kelas dan cabang pada tabel `ClassSlot` (contoh: Reformer Green Garden minQuota = 3, kapasitas = 8). |
| **#6** | **Birokrasi Reschedule Sesi** | Jika $\ge H-24$ jam, pelanggan membatalkan via `POST /api/bookings/:id/cancel` dan sesi kembali instan. Jika $< H-24$ jam, tombol cancel di aplikasi pelanggan nonaktif; Admin mengajukan `POST /api/ledger/adjustments/request` dengan bukti surat dokter dan Studio Manager menyetujuinya via `PATCH /api/ledger/adjustments/:id/approve`. |
| **#7** | **Struktur Multi-Cabang & Owner** | Relasi antar entitas cabang dikunci via tabel `OwnerBranch`. Peran Owner dibatasi pada cabang yang ditugaskan resmi oleh Super Owner (`POST /api/owner-branches`). |
| **#8** | **Tutup Buku & Jurnal Koreksi** | Finance mengeksekusi kunci periode via `POST /api/finance/periods/close`. Transaksi masa lalu berstatus `LOCKED`. Segala penyesuaian dicatat pada bulan berjalan sebagai `CorrectionJournal` dengan approval Super Owner (`PATCH /api/finance/corrections/:id/approve`). |
| **#9** | **Batas Toleransi Backfill H+2** | Endpoint `POST /api/attendances/backfill` memverifikasi selisih waktu `NOW() - classSlot.endTime <= 120 Menit`. Jika lewat dari 2 jam, sistem menolak mutlak dengan status HTTP 400. |
| **#10**| **Isolasi Finansial Cabang** | Endpoint `GET /api/finance/branch-performance` memvalidasi relasi `user.branchId == requestedBranchId`. Usaha akses cabang lain memicu pengecekan `OwnerBranchShield` dan mengembalikan respon `403 Forbidden`. |
| **#11**| **Reminder WhatsApp Internal** | Worker cron `operations-automation.cron.ts`: menjalankan digest ringkasan paket kedaluwarsa ke Admin setiap 3 jam (`0 */3 * * *`), dan recap ke Owner/Super Owner setiap 3 hari (`0 9 */3 * *`). |
| **#12**| **Reminder WA Member Menjelang Expired**| Cron otomatis memindai paket pelanggan yang aktif dan mengirimkan pesan notifikasi WhatsApp personal pada **H-7, H-3, dan H-1** sebelum tanggal `validUntil`. |
| **#13**| **Reminder WA Member Sudah Expired** | Cron memindai pelanggan yang paketnya telah habis dan mengirimkan penawaran perpanjangan berkala setiap 3 hari. Member yang memiliki nilai `stoppedAt != null` otomatis dilewati (*Excluded / Anti-Spam Protection*). |

---

## 🛠️ PANDUAN PENGUJIAN & VALIDASI SISTEM

Untuk memvalidasi bahwa seluruh fitur, modul, hak akses, dan alur kerja di atas berfungsi 100% tanpa regresi:
1. **Daftar Akun Pengujian Resmi**: Selalu gunakan akun otentik yang terdaftar pada [`AKUN_TESTING_RESMI.md`](./AKUN_TESTING_RESMI.md).
2. **Skenario UAT Kronologis Lengkap**: Ikuti langkah-langkah terperinci di [`PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md`](./PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md).
3. **Eksekusi Pengujian Otomatis**:
   ```bash
   # 1. Jalankan stress test konkurensi (Zero overbooking, presensi idempoten, pemotongan sesi ganda nol):
   pnpm test:concurrency

   # 2. Jalankan rangkaian verifikasi spesifikasi 13 Keputusan Bisnis:
   pnpm verify:spec5

   # 3. Jalankan rangkaian simulasi browser UAT otomatis (Paket A, B, C):
   pnpm test:uat:suites
   ```

---
*Dokumen ini diterbitkan secara resmi sebagai acuan arsitektur fungsional dan operasional platform Daily Dose Pilates Studio Management System v2.0.*

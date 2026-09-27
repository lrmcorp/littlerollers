# 📋 DOKUMEN ACUAN RESMI: MATRIKS KREDENSIAL & AKUN PENGUJIAN SISTEM (UAT & AUTOMATION)
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `DOC-REF-ACCOUNTS-DDV2-CANONICAL`  
**Status Dokumen:** `OFFICIAL / ACTIVE REFERENCE`  
**Lingkungan Sistem:**
* **Frontend Web Application:** `http://localhost:32120`
* **Backend REST API:** `http://localhost:32121`
* **Swagger API Docs:** `http://localhost:32121/api/docs`

---

## 🎯 Tujuan Dokumen
Dokumen ini adalah **sumber tunggal kebenaran (*Single Source of Truth*)** untuk seluruh kredensial pengujian (*testing accounts*). 
> [!IMPORTANT]
> **ATURAN MUTLAK BAGI TESTER MANUAL & AI BROWSER SUBAGENT:**
> 1. Dilarang keras menebak (*hallucinating/guessing*) email atau password fiktif (seperti `user@example.com`, `admin@example.com`, `password123`, dll).
> 2. Seluruh aktivitas pengujian fitur, login, maupun simulasi browser **WAJIB menggunakan salah satu akun otentik yang terdaftar pada tabel di bawah ini** sesuai peran (*role*) yang sedang diuji.
> 3. Jika sesi browser ter-logout atau meminta login ulang, gunakan kredensial yang bersesuaian dari tabel ini.

---

## 👥 Matriks Akun Uji Otentik Berdasarkan 7 Peran (*Roles*)

| No | Peran (*Role*) | Email Resmi Uji | Password | Lingkup Cabang | Otoritas & Skenario Pengujian Utama |
|:---:|:---|:---|:---|:---|:---|
| **1** | **SUPER_OWNER** | `superowner@dailydose.test` | `SuperOwner123!` | Global (Seluruh Cabang) | - Otoritas tertinggi & akses lintas cabang.<br>- Tinjau & verifikasi KYC KTP/Selfie di `/customers/[id]`.<br>- Approval Jurnal Koreksi pasca Tutup Buku Bulanan.<br>- Penetapan cabang untuk akun Owner. |
| **2** | **OWNER** | `owner.gg@dailydose.test` | `Owner123!` | Green Garden (`DD-GG`) | - Laporan kinerja & omset cabang Green Garden.<br>- Transparansi detail jam mengajar & fee instruktur di cabangnya (Aturan #10).<br>- Terisolasi ketat: Dicekal (403 Forbidden) jika mengakses cabang lain. |
| **3** | **MANAGER** | `manager.gg@dailydose.test` | `Manager123!` | Green Garden (`DD-GG`) | - Verifikasi & approval bukti pembayaran paket member.<br>- Otoritas persetujuan *Session Adjust Request* kompensasi darurat medis $< H-24 (Aturan #6).<br>- Tombol aksi "Tandai Customer Berhenti" (*stoppedAt*). |
| **4** | **FINANCE** | `finance@dailydose.test` | `Finance123!` | Global (Seluruh Cabang) | - Akses 5 Laporan Keuangan Inti (Omset, Realtime Cost, Projection, Other Cost, Profit).<br>- Input & kelola biaya operasional (*Other Cost*).<br>- Eksekusi Tutup Buku Bulanan (*Monthly Close / Period Lock* Aturan #8). |
| **5** | **ADMIN** | `adminmk@ddose.com`<br>`admin@ddose.com` | `Admin123!` | Muara Karang (`DD-MK`)<br>Green Garden (`DD-GG`) | - Pengaturan jadwal & alokasi instruktur ke slot kelas.<br>- Pemesanan kelas dibantu kasir (*Assisted Booking*).<br>- Presensi susulan pelanggan (*Backfill*) dengan toleransi $\le H+2$ jam (Aturan #9).<br>- Pengajuan permohonan *Session Adjust Request* ke Manager. |
| **6** | **INSTRUCTOR** | `instdevi@ddose.com`<br>`coach.sarah@dailydose.test` | `Instructor123!` | Green Garden (`DD-GG`) | - Pengajuan jadwal ketersediaan (*Instructor Availability*).<br>- Presensi instruktur via Scan QR Tablet Studio (Aturan #1).<br>- Menandai kelas selesai (`COMPLETED`). |
| **7** | **CUSTOMER (Aktif UAT)** | `amanda.member@dailydose.test` | `Customer123!` | Member Aktif Studio | - Memiliki paket aktif (10 sesi).<br>- Self-booking kelas dari timetable (Aturan #2).<br>- Reschedule mandiri $\ge H-24$ jam (Aturan #6).<br>- Konfirmasi presensi mandiri via Klik Link Web (Aturan #1). |
| **8** | **CUSTOMER (KYC Verified)**| `kukertadesabetung5@gmail.com` | `ridho123` | Member Terdaftar | - Dokumen KTP depan & foto selfie berstatus `APPROVED`.<br>- Validasi dokumen terkunci resmi & tidak dapat diubah/dihapus pasca-verifikasi. |
| **9** | **CUSTOMER (Baru/Onboarding)**| `clara.new@dailydose.test` | `MemberBaru2026!` | Calon Member Baru | - Alur registrasi mandiri akun baru.<br>- Pengunggahan awal dokumen KYC KTP & Selfie di `/account/verification`.<br>- Pembelian & checkout paket sesi pertama kali. |
| **10**| **CUSTOMER (Berhenti/Stop)**| `hendra.stopped@dailydose.test` | `Customer123!` | Member Berhenti | - Status `stoppedAt != null` aktif.<br>- Validasi 100% Proteksi Anti-Spam: Tidak pernah menerima blast pengingat WhatsApp (Aturan #12 & #13). |

---

## 🗺️ Peta Navigasi URL Berdasarkan Peran Pengguna

| Peran | Halaman Utama yang Sering Diuji | Deskripsi Fitur |
|:---|:---|:---|
| **Super Owner** | `http://localhost:32120/customers` | Direktori member & verifikasi dokumen identitas |
| | `http://localhost:32120/finance` | Dashboard 5 Laporan Finansial & Jurnal Koreksi |
| | `http://localhost:32120/master/rates` | Konfigurasi tarif instruktur & projeksi |
| **Owner Cabang** | `http://localhost:32120/workspace/branch-performance` | Laporan performa omset & rincian cost instruktur cabang |
| **Studio Manager** | `http://localhost:32120/workspace/payments` | Antrean verifikasi bukti transfer pembayaran paket |
| | `http://localhost:32120/ledger/adjustments` | Antrean approval penyesuaian sesi darurat medis |
| **Finance** | `http://localhost:32120/finance` | Laporan laba rugi, biaya operasional, & tombol Tutup Buku |
| **Admin Frontdesk** | `http://localhost:32120/workspace/classes` | Timetable kelas studio, buat slot, monitoring kehadiran & Backfill $H+2$ |
| | `http://localhost:32120/workspace/bookings` | Manajemen booking bantuan (assisted booking) & antrean reschedule |
| | `http://localhost:32120/ledger/adjustments` | Pengajuan kompensasi penyesuaian sesi darurat medis |
| **Coach / Instruktur** | `http://localhost:32120/schedule` | Jadwal ketersediaan jam mengajar instruktur |
| | `http://localhost:32120/check-in-scanner` | Presensi instruktur via Scan QR Tablet Studio |
| **Customer** | `http://localhost:32120/account/verification` | Unggah/preview KTP & Selfie, status verifikasi identitas |
| | `http://localhost:32120/packages` | Katalog paket sesi studio & checkout transfer bank |
| | `http://localhost:32120/classes` | Timetable jadwal kelas studio untuk self-booking |
| | `http://localhost:32120/bookings` | Riwayat booking kelas & tombol reschedule mandiri |
| | `http://localhost:32120/check-in/[token]` | Halaman publik konfirmasi presensi mandiri (tanpa login) |

---

## 🔄 Pemulihan Akun & Reset Database Cepat
Jika suatu saat database di-reset atau memerlukan pemulihan data akun uji awal, jalankan perintah seeder berikut dari terminal root:
```bash
# Reset & masukkan seluruh akun di atas ke database:
pnpm db:seed
```
Seluruh akun di atas dijamin selalu tersedia dan aktif setelah seeder dijalankan.

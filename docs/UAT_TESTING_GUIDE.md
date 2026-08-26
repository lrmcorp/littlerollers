# Dokumen Pengujian Penerimaan Pengguna (User Acceptance Testing - UAT)
## Sistem Manajemen Studio Daily Dose Pilates v2

---

## 1. Informasi Dokumen & Tujuan UAT

| Parameter | Detail |
| :--- | :--- |
| **Nama Aplikasi** | Daily Dose Pilates Management System (v2.0) |
| **Tujuan Pengujian** | Memvalidasi seluruh alur bisnis, integrasi transaksi, verifikasi identitas (KYC), pemesanan kelas, absensi QR Code, audit keuangan (Ledger), dan kontrol multi-cabang sebelum dideploy ke lingkungan produksi. |
| **Target Tanggal UAT** | Agustus 2026 |
| **Status Dokumen** | **FINAL / READY FOR EXECUTION** |

---

## 2. Lingkungan Uji Coba (*Test Environment*)

| Komponen | Spesifikasi / URL |
| :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` (atau URL Staging yang ditentukan) |
| **Pusat Panduan Web** | `http://localhost:3000/guide` |
| **Backend REST API** | `http://localhost:4000` |
| **Database** | PostgreSQL 16 (dengan snapshot data migrasi v1) |
| **Penyimpanan Berkas** | S3 / MinIO Private Storage (untuk KTP, Selfie, & Bukti Transfer) |
| **Worker Service** | PM2 Background Worker (Evaluasi Kuota H-24 & Notifikasi) |

---

## 3. Matriks Peran & Akun Pengujian (*Test Accounts Matrix*)

Gunakan akun berikut untuk menjalankan skenario pengujian sesuai peran:

| Peran (*Role*) | Email Akun Demo | Password Default | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Owner** | `super.owner@dailydosepilates.com` | `SuperOwner123!` | Akses Penuh Seluruh Cabang, RBAC, Audit Log, Master Data |
| **Finance & Kasir** | `finance@dailydosepilates.com` | `Finance123!` | Approval Pembayaran, Session Ledger, Adjustment Saldo |
| **Branch Operations** | `jakarta.ops@dailydosepilates.com` | `JakartaOps123!` | QR Scanner, Slot Kelas Jakarta, Assisted Booking |
| **Front Desk BSD** | `bsd.ops@dailydosepilates.com` | `BsdOps123!` | QR Scanner, Slot Kelas BSD, Assisted Booking |
| **Instruktur** | `instructor.sarah@dailydosepilates.com` | `Instructor123!` | Jadwal Mengajar, Daftar Hadir Murid |
| **Member / Customer** | `customer.demo@dailydosepilates.com` | `Customer123!` | Beli Paket, Booking Sesi, Reschedule, QR Pass Digital |

---

## 4. Matriks Skenario Pengujian UAT (10 Skenario Kunci)

---

### Skenario UAT-01: Registrasi Member Baru & Verifikasi Identitas (KYC)
* **Tujuan**: Memastikan member baru dapat mendaftar dengan validasi nomor WhatsApp, e-KTP, dan foto selfie.
* **Peran Terlibat**: Customer & Front Desk / Verifikator.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1.1 | Buka halaman registrasi `/register` | - | Form pendaftaran tampil bersih dan responsif. | [ ] PASS |
| 1.2 | Masukkan data diri, nomor WA, dan password | Nama: Budi Santoso<br>WA: 081234567890 | Sistem memvalidasi format nomor WhatsApp Indonesia secara real-time. | [ ] PASS |
| 1.3 | Unggah file foto KTP dan selfie | Format: JPG / PNG (< 5MB) | Pratinjau lokal gambar tampil di browser sebelum submit. | [ ] PASS |
| 1.4 | Klik "Kirim Pendaftaran" | - | Akun terdaftar dengan status `PENDING_VERIFICATION`. | [ ] PASS |
| 1.5 | Login sebagai Verifikator (`/identity-verifications`) | Akun Operasional | Dokumen KTP & Selfie tampil berdampingan dalam *secure preview drawer*. | [ ] PASS |
| 1.6 | Klik tombol "Approve KYC" | - | Status member berubah menjadi `APPROVED` dan notifikasi WhatsApp terkirim. | [ ] PASS |

---

### Skenario UAT-02: Pembelian Paket Kelas & Unggah Bukti Bayar
* **Tujuan**: Memastikan customer dapat memilih paket studio dan mengunggah bukti transfer bank.
* **Peran Terlibat**: Customer.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 2.1 | Login sebagai Customer dan buka menu `/packages` | - | Katalog paket Jakarta & BSD tampil dengan harga resmi. | [ ] PASS |
| 2.2 | Pilih paket "10x Group Reformer" | Studio: Jakarta | Halaman checkout menampilkan rincian harga, pajak, dan rekening bank resmi. | [ ] PASS |
| 2.3 | Masukkan kode voucher promo (misal: `WELCOME2026`) | Diskon: Rp 100.000 | Total tagihan otomatis terpotong sesuai nilai promo voucher. | [ ] PASS |
| 2.4 | Unggah screenshot bukti transfer | File: `transfer_struk.jpg` | SHA-256 hash bukti transfer dihitung otomatis dan tersimpan aman di S3. | [ ] PASS |
| 2.5 | Klik "Konfirmasi Pembayaran" | - | Status pesanan menjadi `PAYMENT_UNDER_REVIEW`. | [ ] PASS |

---

### Skenario UAT-03: Approval Pembayaran & Sinkronisasi Saldo Ledger
* **Tujuan**: Memvalidasi alur approval tim Finance dan pencatatan buku besar (*Ledger*).
* **Peran Terlibat**: Finance.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 3.1 | Login sebagai Finance dan buka menu `/workspace/payments` | - | Daftar pesanan pending tampil dengan nominal dan thumbnail bukti transfer. | [ ] PASS |
| 3.2 | Klik detail pesanan dan periksa mutasi | - | Pratinjau bukti bayar resolusi penuh terbuka di secure modal. | [ ] PASS |
| 3.3 | Klik tombol "Setujui Pembayaran" (*Approve*) | - | Pesanan berubah menjadi `PAID`. | [ ] PASS |
| 3.4 | Periksa saldo akun member di menu `/ledger` | - | Entri kredit (+10 Sesi) otomatis tercatat di Session Ledger dengan referensi Order ID. | [ ] PASS |

---

### Skenario UAT-04: Pemesanan Jadwal Kelas (*Booking Slot*)
* **Tujuan**: Memastikan member dapat memotong kuota aktif untuk memesan jadwal kelas.
* **Peran Terlibat**: Customer.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 4.1 | Buka menu `/classes` dan pilih tanggal latihan | Tanggal: H+3 | Jadwal kelas harian, kuota kursi, dan nama instruktur tampil akurat. | [ ] PASS |
| 4.2 | Pilih slot "09:00 Reformer Flow" yang masih tersedia | Sisa kursi: 3 | Modal konfirmasi booking terbuka menampilkan sisa paket member. | [ ] PASS |
| 4.3 | Klik "Konfirmasi Reservasi" | - | Saldo kuota berkurang (-1 Sesi), status booking menjadi `BOOKED`. | [ ] PASS |
| 4.4 | Cek menu "Booking Saya" (`/bookings`) | - | Tiket digital dengan QR Code Pass terbit seketika. | [ ] PASS |

---

### Skenario UAT-05: Reschedule Kelas (Uji Batas Cutoff H-24)
* **Tujuan**: Memvalidasi kepatuhan aturan bisnis Cutoff H-24 pembatalan/perubahan sesi.
* **Peran Terlibat**: Customer.

| No | Langkah Pengujian (*Action Steps*) | Kondisi Waktu | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 5.1 | Ajukan reschedule pada kelas yang berlangsung di **H+3** | > 24 Jam sebelum kelas | Tombol "Reschedule" aktif; member dapat memilih jadwal baru tanpa penalti kuota. | [ ] PASS |
| 5.2 | Ajukan reschedule pada kelas yang berlangsung dalam **4 jam ke depan** | < 24 Jam sebelum kelas | Sistem menolak perubahan dan menampilkan pesan aturan Cutoff H-24 dengan jelas. | [ ] PASS |

---

### Skenario UAT-06: Check-in Kehadiran via Scanner QR Code
* **Tujuan**: Memastikan scanner front desk dapat memvalidasi QR Pass secara real-time.
* **Peran Terlibat**: Customer & Front Desk.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 6.1 | Customer membuka QR Pass di smartphone (`/check-in-pass`) | QR Code Digital | QR Code ter-render tajam dengan data token terenkripsi. | [ ] PASS |
| 6.2 | Front Desk membuka `/check-in-scanner` di tablet | Kamera aktif | Scanner mendeteksi QR Code dalam < 1 detik. | [ ] PASS |
| 6.3 | Validasi status kehadiran | - | Layar scanner menampilkan konfirmasi hijau ("CHECK-IN SUCCESS"), status booking menjadi `ATTENDED`. | [ ] PASS |
| 6.4 | Lakukan scan ulang pada QR yang sama | - | Sistem menolak ("ALREADY CHECKED IN") untuk mencegah tiket ganda. | [ ] PASS |

---

### Skenario UAT-07: Evaluasi Kuota Otomatis H-24 (*Auto-Cancellation*)
* **Tujuan**: Memvalidasi job background worker membatalkan kelas yang tidak memenuhi kuota minimum 24 jam sebelum kelas dimulai.
* **Peran Terlibat**: Background Worker & System.

| No | Langkah Pengujian (*Action Steps*) | Kondisi Uji | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 7.1 | Buat kelas uji coba dengan pendaftar di bawah kuota minimum (misal: hanya 1 pendaftar dari min 3) | Waktu: Tepat H-24 | Background worker mendeteksi kelas *under-quota*. | [ ] PASS |
| 7.2 | Worker mengeksekusi proses auto-cancel | - | Status kelas berubah menjadi `CANCELLED_BY_SYSTEM`. | [ ] PASS |
| 7.3 | Periksa saldo member terdaftar | - | Kuota sesi otomatis di-refund kembali ke akun member (+1 Sesi). | [ ] PASS |
| 7.4 | Periksa log notifikasi | - | Pesan pemberitahuan pembatalan kelas dan refund terkirim otomatis ke WhatsApp/Email member. | [ ] PASS |

---

### Skenario UAT-08: Pembuatan Voucher Diskon & Promosi Paket
* **Tujuan**: Memastikan manajemen promo dapat membuat kode voucher dengan batas kuota dan kedaluwarsa.
* **Peran Terlibat**: Super Owner / Marketing.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 8.1 | Buka menu `/vouchers` dan klik "Tambah Voucher" | Kode: `PROMO50K`<br>Nominal: Rp 50.000 | Voucher berhasil dibuat dengan masa berlaku aktif. | [ ] PASS |
| 8.2 | Coba gunakan voucher pada saat checkout paket | Nilai belanja > syarat | Potongan harga tertera transparan di rincian tagihan. | [ ] PASS |
| 8.3 | Coba gunakan voucher yang sudah kedaluwarsa atau kuota habis | Voucher Expired | Sistem menolak voucher dengan notifikasi yang jelas dan ramah. | [ ] PASS |

---

### Skenario UAT-09: Penyesuaian Saldo Manual (*Ledger Adjustment & 4-Eyes Check*)
* **Tujuan**: Memastikan penyesuaian saldo kompensasi teknis terlindungi dengan prinsip otorisasi ganda.
* **Peran Terlibat**: Finance & Super Owner.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 9.1 | Finance mengajukan request penambahan saldo di `/ledger/adjustments` | Member: Budi<br>Alasan: Kompensasi Mati Lampu | Request tercatat dengan status `PENDING_APPROVAL`. | [ ] PASS |
| 9.2 | Cek saldo member sebelum approval | - | Saldo kuota member **belum bertambah** (aman). | [ ] PASS |
| 9.3 | Super Owner membuka `/ledger/adjustments` dan klik "Otorisasi" | - | Request disetujui, entri `MANUAL_ADJUSTMENT` tercatat permanen di Ledger, dan saldo member bertambah. | [ ] PASS |

---

### Skenario UAT-10: Dynamic RBAC & Security Audit Log
* **Tujuan**: Memastikan isolasi data antar cabang dan audit trail yang tidak dapat diubah (*immutable*).
* **Peran Terlibat**: Super Owner & Staff Cabang.

| No | Langkah Pengujian (*Action Steps*) | Data Uji (*Test Data*) | Hasil yang Diharapkan (*Expected Result*) | Status |
| :---: | :--- | :--- | :--- | :---: |
| 10.1 | Login sebagai Staf Cabang Jakarta (`jakarta.ops`) | Akses: Jakarta Only | Hanya dapat melihat data jadwal, kelas, dan member studio Jakarta (Data BSD terisolasi). | [ ] PASS |
| 10.2 | Buka menu `/audit` sebagai Super Owner | - | Seluruh riwayat transaksi, login, approval, dan perubahan role tercatat dengan Timestamp, User ID, dan IP Address. | [ ] PASS |

---

## 5. Lembar Persetujuan Penerimaan (*UAT Sign-Off Sheet*)

Dengan ini dinyatakan bahwa seluruh skenario pengujian di atas telah diuji pada lingkungan UAT dan dinyatakan:

[ ] **DITERIMA TANPA CATATAN** (*Accepted*)
[ ] **DITERIMA DENGAN CATATAN MINOR** (*Conditionally Accepted*)
[ ] **DITOLAK / PERLU PERBAIKAN** (*Rejected*)

### Tanda Tangan Tim Penguji:

| Peran Penguji | Nama Lengkap | Tanda Tangan | Tanggal |
| :--- | :--- | :--- | :--- |
| **Lead Product Owner** | ________________________ | ____________________ | ____ / ____ / 2026 |
| **Lead Finance & Kasir** | ________________________ | ____________________ | ____ / ____ / 2026 |
| **Head of Branch Operations** | ________________________ | ____________________ | ____ / ____ / 2026 |
| **Lead Quality Assurance (QA)** | ________________________ | ____________________ | ____ / ____ / 2026 |

---
*Dokumen ini merupakan bagian resmi dari standar serah terima operasional Daily Dose Pilates v2.*

# Walkthrough - Harmonisasi Halaman Profil Akun & Resolusi Fitur Reschedule

## 1. Redesain Halaman Profil Pengguna (`/account/profile`)

Halaman Profil Akun (**`http://localhost:32120/account/profile`**) telah diperbarui total agar selaras dengan bahasa desain Daily Dose v2:

### 🎨 Fitur & Detail Desain:
* **Header Standar**: Menggunakan `PageHeader` dengan badge kategori *"Pengaturan Akun"*, judul *"Profil Saya"*, dan tautan langsung ke *"Keamanan Akun"*.
* **Hero Badge Profil & Inisial**:
  - Avatar inisial nama member berlatar belakang hijau tua Daily Dose (`bg-dd-forest text-white`).
  - Badge status verifikasi akun (**Member Terverifikasi** dengan nada hijau `StatusBadge tone="success"`).
* **Formulir Rincian Akun**:
  - Input nama tampilan yang bersih dan responsif.
  - Bidang Email dan Nomor WhatsApp terproteksi (*read-only*) dengan badge gembok terverifikasi.
  - Catatan keamanan untuk perubahan kontak melalui tim studio.
* **Kartu Preferensi Studio Utama**:
  - Menampilkan studio latihan utama (*Muara Karang, Jakarta Utara*) lengkap dengan alamat dan tombol *"Ganti Studio"*.
* **Hub Navigasi Akun Cepat**:
  - 3 kartu ringkas terpadu menuju **Verifikasi KYC**, **Paket & Kuota**, dan **Booking Saya**.

---

## 2. Resolusi Fitur Reschedule Booking (`/bookings/[id]`)

* **Penyebab Masalah Sebelumnya**: Dev server API belum memuat konfigurasi `RESCHEDULE_ENABLED=true` dan `RESCHEDULE_CUTOFF_HOURS=24` dari `.env`, sehingga melempar status HTTP 503 `CONFIGURATION_REQUIRED`.
* **Solusi yang Diterapkan**:
  - Memperbarui `apps/api/src/main.ts` dengan pemuat `.env` otomatis (*built-in Node loadEnvFile*).
  - API endpoint `GET /api/v1/bookings/:id/reschedule-options` kini **100% aktif (HTTP 200 OK)**.
  - Halaman booking `f835bb24-aab1-48c0-aa43-b5a4e0c85d9c` kini menampilkan opsi pergantian jadwal interaktif (*Selasa, 25 Agustus 2026 pukul 11.00 WIB*).

---

## 3. Matriks Progres User Acceptance Testing (UAT)

| ID UAT | Skenario Pengujian | Status | Verifikasi Teknis |
| :--- | :--- | :---: | :--- |
| **UAT-01** | Registrasi Member Baru & Verifikasi KYC | **PASSED ✅** | Dokumen Selfie & KTP `APPROVED`, scan `CLEAN`. |
| **UAT-02** | Pembelian Paket & Upload Bukti Pembayaran | **PASSED ✅** | Order `85437c16-...` senilai Rp 4.000.519 terkirim. |
| **UAT-03** | Konfirmasi Pembayaran & Penerbitan Kuota | **PASSED ✅** | Status `APPROVED`, 24 sesi aktif di akun. |
| **UAT-04** | Booking Sesi Kelas oleh Customer & Reschedule | **PASSED ✅** | Booking ID `9b67b71b-...` & `f835bb24-...` aktif, Reschedule 200 OK. |
| **UAT-05** | Check-in Pass & Scanner Kehadiran Studio | **READY ⏳** | Penerbitan QR Code Pass & scanner kehadiran staf. |

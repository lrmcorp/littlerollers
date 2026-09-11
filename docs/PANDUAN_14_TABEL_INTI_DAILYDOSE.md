# 🧘 Panduan Cepat: 14 Tabel Inti Daily Dose Pilates V2
*Cheat Sheet Operasional & Pengembangan Tanpa Beban Kognitif*

Dokumen ini adalah ringkasan praktis **Strategi A** untuk menyederhanakan pemahaman sistem database Daily Dose V2. Meskipun database teknis memiliki 97 tabel (akibat *over-engineering* modul enterprise, migrasi, dan audit log di latar belakang), **seluruh roda bisnis harian studio Pilates sebenarnya hanya bertumpu pada 14 TABEL INTI berikut**.

Gunakan panduan ini sebagai acuan utama saat melakukan perbaikan bug, audit data, atau penambahan fitur baru.

---

## 🗺️ Peta Navigasi Cepat (Troubleshooting Guide)

| Jika Anda Sedang Mengerjakan / Memeriksa: | Cukup Buka Tabel Ini: | Abaikan Tabel Rumit Lainnya: |
| :--- | :--- | :--- |
| **1. Data Member, Akun Staf, Login** | `User` & `ProfilPengguna` | *Abaikan: `CapabilityDefinition`, `RoleCapability`, `UserCapabilityOverride`, `Identitas`* |
| **2. Cabang, Ruangan & Ranjang Reformer** | `Cabang`, `Studio`, `Ruangan` | *Abaikan: `ProfilPublikCabang`, `KonfigurasiEfektif`, `AuditMasterData`* |
| **3. Jenis Latihan (Group / Private / Duet)** | `JenisKelas` | *Abaikan: `ProfilPublikKelas`, `CakupanCabangJenisKelas`* |
| **4. Jadwal Kelas & Jam Instruktur** | `SlotKelas` & `KetersediaanInstruktur` | *Abaikan: `SlotTemplate`, `PolaJadwal`* |
| **5. Katalog Paket Sesi Latihan** | `Paket` | *Abaikan: `RevisiPaket`, `CakupanCabangPaket`, `ProfilPublikPaket`* |
| **6. Uang Masuk, Invoice & Bukti Bayar** | `Pembelian` & `BuktiPembayaran` | *Abaikan: Seluruh 8 tabel akuntansi jurnal (`EntriJurnal`, `AkunAkuntansi`, dll.)* |
| **7. Saldo Kuota Sesi Member** | `PaketPelanggan` | *Abaikan: `QuotaEvaluationJob`, `QuotaBag`, `ReservasiKodeUnik`* |
| **8. Tiket Booking & Reschedule** | `PemesananKelas` & `UbahJadwal` | *Abaikan: `ReservasiSesi`, `HasilKehadiranPemesanan`, `JadwalRutin`* |
| **9. Presensi Scanner di Resepsionis** | `KehadiranPelanggan` & `CheckInToken` | *Abaikan: `InstructorCheckInToken`, `RekapJamInstruktur`* |
| **10. Diskon Promo & Notifikasi** | `Voucher` & `UserNotification` | *Abaikan: `NotificationAttempt`, `NotificationProjection`, `OutboxEvent`* |

---

## 📋 14 Tabel Inti & Tanggung Jawabnya

### Kelompok 1: Pengguna & Akun
1. **`User`** (`identity.prisma` ➔ MySQL: `User`)
   - *Fungsi*: Akun otentikasi login (email, nomor telepon, status aktif/banned).
2. **`ProfilPengguna`** (`identity.prisma` ➔ MySQL: `ProfilPengguna`)
   - *Fungsi*: Biodata member/staf (nama lengkap, tanggal lahir, jenis kelamin, alamat, foto avatar).

### Kelompok 2: Fasilitas & Studio Cabang
3. **`Cabang`** (`master.prisma` ➔ MySQL: `Cabang`)
   - *Fungsi*: Lokasi unit studio fisik (nama cabang, alamat, WhatsApp resepsionis).
4. **`Studio` & `Ruangan`** (`master.prisma` ➔ MySQL: `Studio`, `Ruangan`)
   - *Fungsi*: Ruangan latihan fisik dan kapasitas ranjang Reformer maksimal.
5. **`JenisKelas`** (`master.prisma` ➔ MySQL: `JenisKelas`)
   - *Fungsi*: Tipe kelas (Group Reformer, Private 1-on-1, Duet) dan durasi menit sesi.

### Kelompok 3: Paket Sesi & Penjualan (Billing)
6. **`Paket`** (`packages.prisma` ➔ MySQL: `Paket`)
   - *Fungsi*: Katalog harga paket sesi (misal: Starter 5 Sesi, Regular 10 Sesi, harga Rp, masa aktif hari).
7. **`Pembelian`** (`packages.prisma` ➔ MySQL: `Pembelian`)
   - *Fungsi*: Faktur / Invoice pemesanan paket oleh customer (total bayar, status: MENUNGGU / LUNAS).
8. **`BuktiPembayaran`** (`packages.prisma` ➔ MySQL: `BuktiPembayaran`)
   - *Fungsi*: Berkas foto struk transfer bank manual yang diunggah customer untuk dicek kasir.
9. **`PaketPelanggan`** (`packages.prisma` ➔ MySQL: `PaketPelanggan`)
   - *Fungsi*: Saldo kuota sesi aktif milik member (total kuota, sisa sesi, tanggal kedaluwarsa).

### Kelompok 4: Jadwal & Pemesanan Kelas (Bookings)
10. **`SlotKelas`** (`classes.prisma` ➔ MySQL: `SlotKelas`)
    - *Fungsi*: Jadwal kelas harian (tanggal, jam mulai, instruktur yang mengajar, kuota terisi).
11. **`PemesananKelas`** (`bookings.prisma` ➔ MySQL: `PemesananKelas`)
    - *Fungsi*: Tiket booking member untuk satu sesi kelas tertentu.
12. **`UbahJadwal`** (`bookings.prisma` ➔ MySQL: `UbahJadwal`)
    - *Fungsi*: Riwayat saat member memindahkan jadwal booking ke jam lain (reschedule).

### Kelompok 5: Presensi & Operasional Harian
13. **`KehadiranPelanggan`** (`attendance.prisma` ➔ MySQL: `KehadiranPelanggan`)
    - *Fungsi*: Catatan kehadiran fisik member saat tiba di studio (jam check-in, status hadir).
14. **`CheckInToken`** (`attendance.prisma` ➔ MySQL: `CheckInToken`)
    - *Fungsi*: Token QR dinamis di aplikasi ponsel member yang dipindai resepsionis saat check-in.

---

## 🔄 Alur Kerja Ringkas (End-to-End Workflow)

```
1. SETUP STUDIO
   Admin isi Cabang ➔ Ruangan (Kapasitas Bed) ➔ Jenis Kelas ➔ Buat Paket

2. PEMBELIAN PAKET (UANG MASUK)
   Member pilih Paket ➔ Buat Pembelian (Invoice) ➔ Upload BuktiPembayaran
   ➔ Kasir Verifikasi Lunas ➔ Saldo masuk ke PaketPelanggan (misal: 10 Sesi)

3. JADWAL KELAS
   Admin / Head Coach membuat jadwal sesi di SlotKelas (Tentukan Jam, Ruangan & Instruktur)

4. BOOKING KELAS
   Member pilih SlotKelas ➔ Cek PaketPelanggan.sisaSesi > 0 
   ➔ Buat PemesananKelas ➔ Sisa sesi berkurang (-1) ➔ SlotKelas.kuotaTerisi bertambah (+1)

5. PRESENSI DI STUDIO
   Member tiba di studio ➔ Buka CheckInToken QR ➔ Resepsionis Scan QR
   ➔ Catat di KehadiranPelanggan ➔ Status PemesananKelas berubah jadi 'ATTENDED'
```

---

## 💡 Prinsip Kerja Tim dengan Strategi A

1. **Abaikan 83 Tabel Tambahan**:
   Anggap tabel seperti `OutboxEvent`, `IdempotencyRecord`, `MigrationBatch`, `EntriJurnal`, dan `RateLimitCounter` sebagai komponen mesin otomatis di latar belakang yang tidak perlu dipikirkan saat mengembangkan fitur harian.
2. **Pengerjaan Fitur Jauh Lebih Cepat**:
   Dengan hanya berfokus pada 14 tabel di atas, pembuatan fitur atau perbaikan antarmuka web/mobile dapat diselesaikan dalam hitungan jam, bukan berhari-hari.
3. **Zero Risk (Tanpa Risiko Kerusakan)**:
   Karena kita tidak mengubah struktur fisik database secara drastis saat ini, seluruh API dan kode backend yang sudah berjalan tetap 100% aman dan stabil.

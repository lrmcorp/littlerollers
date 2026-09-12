# 🗺️ Pemetaan Refaktor Backend API & Database Ramping Daily Dose V2
*Dokumen Arsitektur & Panduan Transisi Tahap 1 Menuju Tahap 2 & 3*

---

## 1. Latar Belakang & Ringkasan Tahap 1
Sistem Daily Dose V2 sebelumnya memuat **97 tabel** dengan arsitektur *over-engineered* tingkat korporat perbankan (double-entry ledger untuk kuota sesi, 8 tabel akuntansi jurnal, antrean outbox worker yang polling 24/7, serta 12 tabel sisa migrasi v1). Struktur ini menyebabkan server VPS mengalami lonjakan CPU hingga terkena penalti 90%.

Pada **Tahap 1**, kita telah berhasil menyusun dan memvalidasi **Skema Database Ramping (*Lean Schema*)** di:
[`apps/api/prisma/schema_lean/schema.prisma`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/prisma/schema_lean/schema.prisma)

Skema ini memangkas struktur menjadi hanya **14 tabel inti** berbasis **5 Pilar Utama Studio Pilates**, divalidasi 100% lulus `npx prisma validate`.

---

## 2. Peta Komparasi: Tabel Lama (97 Tabel) ➔ Skema Ramping (14 Tabel)

| No | Model Skema Ramping | Sumber / Pengganti Tabel Lama | Keterangan Perubahan |
|:---|:---|:---|:---|
| **Pilar 1: Multi-Cabang & Fasilitas** | | | |
| 1 | `Cabang` | `Cabang` | Dihapus puluhan relasi foreign key ke tabel audit, migrasi, dan akuntansi. |
| 2 | `Studio` | `Studio` | Tetap, dibersihkan dari relasi audit log berlebih. |
| 3 | `Ruangan` | `Ruangan` | Kapasitas bed reformer disimpan langsung pada kolom `capacityBed`. |
| 4 | `JenisKelas` | `JenisKelas` | Menampung jenis sesi (Group Reformer, Private, Duet). Dihapus tabel junction `CakupanCabangJenisKelas`. |
| **Pilar 2: Pengguna & Peran** | | | |
| 5 | `User` | `User`, `PasswordCredential`, `UserRole`, `RoleDefinition`, `RoleCapability`, `AccessRoleAssignment` | **Major simplification**: Role disimpan langsung sebagai enum (`SUPERADMIN`, `ADMIN`, `COACH`, `MEMBER`) pada `User.role`. Menghapus 6 tabel junction RBAC yang rumit. |
| 6 | `ProfilPengguna` | `ProfilPengguna`, `Identitas` | Biodata 1:1 member/coach (nama lengkap, tanggal lahir, jenis kelamin, avatar, kontak darurat). |
| 7 | `PenugasanInstruktur` | `Penugasan`, `KetersediaanInstruktur` | Relasi bersih coach mengajar di cabang mana saja (`coachId`, `branchId`, `isActive`). |
| **Pilar 3: Paket Sesi & Penjualan (Billing)** | | | |
| 8 | `Paket` | `Paket`, `RevisiPaket`, `CakupanCabangPaket` | Katalog paket sesi Pilates (nama, jumlah sesi, masa aktif, harga Rp). |
| 9 | `Pembelian` | `Pembelian`, `PeristiwaLinimasaPembelian`, `ReservasiKodeUnikPembayaran` | Faktur/Invoice order. Menghapus 30+ kolom snapshot akuntansi perbankan yang tidak terpakai. |
| 10 | `BuktiPembayaran` | `BuktiPembayaran`, `OtorisasiLihatBuktiPembayaran` | Berkas foto struk transfer bank manual yang diunggah customer untuk dicek kasir. |
| 11 | `PaketPelanggan` | `PaketPelanggan`, `QuotaEvaluationJob`, `QuotaBag`, `ReservasiSesi` | **Kunci Efisiensi CPU**: Saldo kuota sesi disimpan langsung (`totalSessions`, `remainingSessions`, `usedSessions`). Pembacaan saldo member instan $O(1)$ tanpa polling worker. |
| 12 | `RekeningPembayaran` | `RekeningPembayaran` | Daftar rekening bank transfer milik studio (BCA, Mandiri, dll). |
| 13 | `Voucher` | `Voucher`, `CakupanPaketVoucher`, `HakVoucherPelanggan` | Voucher promo diskon belanja paket. |
| **Pilar 4: Jadwal & Pemesanan Kelas (Bookings)** | | | |
| 14 | `SlotKelas` | `SlotKelas` | Jadwal kelas harian. Kuota terisi dicatat langsung pada `bookedCount` (integer). |
| 15 | `PemesananKelas` | `PemesananKelas`, `PendaftaranKelasPelanggan`, `HasilKehadiranPemesanan` | Tiket booking member untuk slot kelas tertentu. Status: `BOOKED`, `ATTENDED`, `CANCELLED`, `NO_SHOW`. |
| 16 | `UbahJadwal` | `UbahJadwal` | Riwayat member memindahkan jadwal booking ke slot jam lain (reschedule). |
| **Pilar 5: Presensi & Operasional Harian** | | | |
| 17 | `KehadiranPelanggan` | `KehadiranPelanggan` | Presensi fisik saat member check-in di studio. |
| 18 | `CheckInToken` | `CheckInToken` | Token QR dinamis 5 menit untuk member scan di front desk studio. |

---

## 3. Daftar 80+ Tabel yang Ditiadakan Sepenuhnya

1. **Seluruh 8 Tabel Akuntansi Double-Entry**:
   - `EntriBukuBesar`, `AkunAkuntansi`, `EntriJurnal`, `BiayaLain`, `PeriodeKeuangan`, `SnapshotTutupBukuKeuangan`, `KoreksiKeuangan`, `EntriKeuanganHistoris`.
   - *Alasan*: Studio Pilates beroperasi dengan pencatatan kas sederhana via invoice `Pembelian`.

2. **Seluruh 10 Tabel Worker Polling & Background Queue**:
   - `OutboxEvent`, `NotificationAttempt`, `NotificationProjection`, `NotificationOccurrence`, `QuotaEvaluationJob`, `IdempotencyRecord`, `RateLimitCounter`, `WorkerHealth`.
   - *Alasan*: Inilah penyebab utama CPU VPS melonjak hingga 90% karena loop polling tanpa henti.

3. **Seluruh 12 Tabel Sisa Migrasi V1**:
   - `MigrationBatch`, `MigrationSourceKey`, `MigrationReject`, `MigrationControlTotal`, `MigrationResolution`, `MigrationDeltaEvent`, `MigrationGtidCheckpoint`, `MigrationBranchCutover`, `MigrationPilotOutbox`, `MigrationPilotMediaAlias`, `MigrationLegacyPayload`, `MigrationDeferredMediaReference`.
   - *Alasan*: Migrasi data historis sudah selesai dan tabel ini sudah usang (*dead code*).

4. **Tabel Hak Akses & Capability Berlebih (6 tabel)**:
   - `RoleDefinition`, `RoleCapability`, `CapabilityDefinition`, `AccessRoleAssignment`, `UserCapabilityOverride`, `Penugasan` (versi legacy).
   - *Alasan*: Digantikan oleh `role: 'SUPERADMIN' | 'ADMIN' | 'COACH' | 'MEMBER'` langsung pada tabel `User`.

5. **Tabel Duplikasi Cakupan & Konfigurasi Jam (10+ tabel)**:
   - `CakupanCabangJenisKelas`, `CakupanCabangPaket`, `CakupanJenisKelasPaket`, `KonfigurasiJenisKelasCabang`, `KonfigurasiEfektif`, `ProfilPublikCabang`, `ProfilPublikKelas`, `ProfilPublikPaket`.

---

## 4. Analisis Dampak Modul Backend API (`apps/api/src`)

Berikut modul-modul di backend yang akan disederhanakan pada **Tahap 2 (Migrasi) & Tahap 3 (Pangkas Service)**:

| Modul Backend | Status di Skema Ramping | Rencana Tindakan |
|:---|:---|:---|
| **`src/finance/`** | **Dieliminasi** | Hapus dari `app.module.ts`. Laporan keuangan diringkas menjadi query agregasi sederhana dari tabel `Pembelian` (Total Omzet per Cabang/Bulan). |
| **`src/ledger/`** | **Dieliminasi** | Hapus dari `app.module.ts`. Logika saldo kuota sesi langsung membaca/mengurangi `PaketPelanggan.remainingSessions`. |
| **`src/migration/`** | **Dieliminasi** | Hapus dari `app.module.ts` beserta route dan binlog listener-nya. |
| **`src/operations/`** | **Dirampingkan** | Hapus background evaluation job. Sisakan endpoint healthcheck dan setting studio sederhana. |
| **`src/identity/`** | **Disederhanakan** | Sederhanakan `guards` dan `auth.service.ts` agar mengecek `user.role` langsung, tanpa query bertingkat ke `RoleCapability`. |
| **`src/packages/`** | **Disederhanakan** | Sederhanakan mutasi order & verifikasi pembayaran: saat kasir klik "Setujui", update `Pembelian.status = 'PAID'` dan buat/tambah saldo di `PaketPelanggan`. |
| **`src/bookings/`** | **Disederhanakan** | Saat member booking slot kelas: cek `PaketPelanggan.remainingSessions > 0`, buat `PemesananKelas`, lalu kurangi `remainingSessions - 1` dan tambah `SlotKelas.bookedCount + 1` dalam 1 transaksi Prisma `$transaction`. Sangat cepat dan bebas race condition! |
| **`src/attendance/`** | **Disederhanakan** | Scanner QR di front desk langsung mengubah status `PemesananKelas` menjadi `ATTENDED` dan catat jam check-in. |

---

## 5. Analisis Dampak Service Worker (`apps/worker`) & ClamAV

- **`apps/worker/`**:
  - Worker ini menjalankan 7 proses background loop (`quota-worker`, `notification-projection-worker`, `payment-expiration-worker`, dll).
  - Pada Tahap 3, service `dailydose-worker` pada PM2 (`ecosystem.config.cjs`) dan docker compose akan **dimatikan**.
  - Pengecekan kedaluwarsa paket cukup dijalankan melalui **1 Cron Job ringan harian** (misal jam 00:01 tengah malam) yang hanya butuh waktu 1 detik untuk `UPDATE paket_pelanggan SET status = 'EXPIRED' WHERE valid_until < NOW()`.
- **ClamAV (Antivirus Container)**:
  - Mengonsumsi RAM 1.5 GB - 2 GB di VPS.
  - Untuk upload foto bukti transfer (struk jpg/png), pengecekan tipe MIME dan ukuran file (< 5MB) di level Node.js/Sharp sudah lebih dari cukup dan aman tanpa antivirus container berat.

---

## 6. Roadmap Langkah Selanjutnya (Tahap 2 & Tahap 3)

1. **Tahap 2: Sinkronisasi & Migrasi Data**
   - Menyiapkan script migrasi data/ETL ringan untuk memindahkan data riil yang sudah ada di database VPS (data cabang, user/member/coach, paket aktif, sisa kuota, dan booking aktif) ke tabel-tabel skema ramping baru.
   - Mengaktifkan skema ramping ke Prisma aktif (`npx prisma generate`).
   - Menyesuaikan service `auth`, `packages`, dan `bookings` dengan skema baru.

2. **Tahap 3: Pangkas Service-Service Berat**
   - Hapus service `dailydose-worker` dari `ecosystem.config.cjs`.
   - Hapus container ClamAV dari `docker-compose.yml`.
   - Deploy bersih ke VPS.
   - Hasil yang diharapkan: **CPU < 2%**, **RAM < 500 MB**, bebas penalti server VPS.

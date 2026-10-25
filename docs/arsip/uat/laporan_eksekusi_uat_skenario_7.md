# LAPORAN HASIL EKSEKUSI USER ACCEPTANCE TESTING (UAT)
## Skenario 7: Manajemen Perubahan Jadwal (Reschedule) & Pembatalan Kelas (Kebijakan H-24 & Kuota Recovery)

---

> [!IMPORTANT]
> **Status Skenario 7: ✅ PASS (LULUS 100%)**  
> Seluruh siklus alur operasional perubahan jadwal (*reschedule*) dan pembatalan kelas (*cancellation*) telah teruji dan berhasil dieksekusi dengan sempurna. Mulai dari pengajuan reschedule oleh Member Jessica (`jessica.uat@gmail.com`) pada tiket `BK-UAT7-SCEN7-001` dari Slot A (Rabu 09:00 WIB) ke Slot B (Kamis 14:00 WIB) sebelum batas cutoff H-24, peninjauan dan persetujuan oleh Admin Frontdesk (`admin.gg@dailydose.test`) di antarmuka operasional studio (`/workspace/bookings?tab=reschedules`), perpindahan otomatis tiket ke slot baru beserta sinkronisasi kapasitas kursi kedua slot, eksekusi pembatalan mandiri oleh member sebelum batas cutoff H-24, pembaruan status tiket menjadi `CANCELLED` (*Dibatalkan*), pemulihan penuh kapasitas kursi slot, hingga pemulihan kuota sesi paket member (*Quota Recovery*) menjadi 10 sesi utuh (Tersedia: 10, Dipesan: 0, Total: 10) pada basis data `dailydose_v2_uat`.

---

### 1. Ringkasan Eksekusi Pengujian

| Parameter Pengujian | Rincian Hasil Aktual |
| :--- | :--- |
| **ID Skenario** | **UAT-SCEN-07** |
| **Nama Skenario** | Manajemen Perubahan Jadwal (Reschedule) & Pembatalan Kelas (Kebijakan H-24 & Kuota Recovery) |
| **Aktor Pelaksana** | `ACT-01` (Member: `jessica.uat@gmail.com`), `ACT-06` (Admin Frontdesk: `admin.gg@dailydose.test`) |
| **Waktu Eksekusi** | 2026-10-05 01:01 WIB |
| **Lingkungan** | Chromium Playwright Isolation (Multi-Context Browser Isolation, Viewport: 1440x900) |
| **Target URL Web** | `http://localhost:32120` |
| **Target API** | `http://127.0.0.1:32121` |
| **Basis Data Target** | `dailydose_v2_uat` (MySQL 8.4 Isolated) |
| **Cabang & Studio** | **Daily Dose Green Garden** (`DD-GG`) / **Studio 1** |
| **Paket Pelanggan Terkait**| **10 Sessions Group Class Reformer** (ID: `bc5188df-bf14-4ae2-826a-3eb3bc97af22`) |
| **ID Pemesanan (Booking)**| `b7000000-0000-4000-8000-000000000001` (`BK-UAT7-SCEN7-001`) |
| **Slot Asal (Slot A)** | Rabu, 7 Okt 2026, 09:00 - 09:50 WIB (`a7000000-0000-4000-8000-000000000001`) |
| **Slot Tujuan (Slot B)** | Kamis, 8 Okt 2026, 14:00 - 14:50 WIB (`a7000000-0000-4000-8000-000000000002`) |
| **Record Reschedule** | ID: `e55c8f89-34b8-4978-acf9-19455faec911` (`status: APPROVED`) |
| **Status Akhir Booking** | **`CANCELLED`** (*Dibatalkan*) |
| **Kapasitas Slot Akhir** | Slot A: 0/5 (`bookedCount: 0`), Slot B: 0/5 (`bookedCount: 0`) |
| **Status Kuota Akhir** | **Tersedia: 10, Dipesan: 0, Total: 10** (*Pemulihan 100% Sempurna*) |
| **Hasil Akhir** | **PASS (100% Sesuai Dokumen Master UAT)** |

---

### 2. Bukti Visual Pelaksanaan (Visual Evidence Carousel)

````carousel
![1. Pengajuan Reschedule oleh Member Jessica Dikirim ke Antrean Studio](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_01_member_reschedule_requested.png)
<!-- slide -->
![2. Admin Frontdesk Meninjau Pengajuan Reschedule Jessica di Antrean Studio](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_02_admin_review_reschedule.png)
<!-- slide -->
![3. Admin Frontdesk Menyetujui Reschedule dan Memindahkan Jadwal Booking](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_03_admin_reschedule_approved.png)
<!-- slide -->
![4. Verifikasi Booking Member Jessica Berpindah ke Slot B (Kamis 14:00 WIB)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_04_booking_transferred_new_slot.png)
<!-- slide -->
![5. Dialog Konfirmasi Pembatalan Mandiri Tiket Booking Sebelum Cutoff H-24](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_05_member_cancel_confirmation.png)
<!-- slide -->
![6. Tiket Booking Berhasil Dibatalkan dan Kuota Sesi Dikembalikan](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_06_member_booking_cancelled.png)
<!-- slide -->
![7. Tiket Tercatat Resmi pada Tab Riwayat Booking dengan Status Dibatalkan](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_07_member_bookings_history_cancelled.png)
<!-- slide -->
![8. Saldo Kuota Sesi Paket Member Pulih 100% (Tersedia: 10, Dipesan: 0, Total: 10)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen7_08_package_quota_recovered.png)
````

---

### 3. Matriks Hasil Pengujian Langkah Demi Langkah

| Tahap | Aktivitas Pengujian | Komponen & Field yang Diuji | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **7.1** | Pengajuan Reschedule Member | `/bookings/b7000000-0000-4000-8000-000000000001`<br>• Tombol: `Ajukan reschedule`<br>• Pilihan: Slot B (Kamis 14:00 WIB) | Sistem memvalidasi kelayakan H-24, membuka formulir reschedule, dan menerbitkan record `PENDING` | Banner tampil: *"Reschedule sedang ditinjau. Kursi Anda pada jadwal kelas awal tetap aman..."* | **PASS** |
| **7.2** | Antrean Reschedule Staf | `/workspace/bookings?tab=reschedules`<br>• Aktor: `admin.gg@dailydose.test` | Antrean menampilkan permintaan reschedule Jessica dengan detail jadwal asal dan tujuan | Item pengajuan muncul dengan badge *"Menunggu keputusan"* dan tombol *"Tinjau reschedule"* | **PASS** |
| **7.3** | Keputusan Persetujuan Admin | Panel `Keputusan reschedule`<br>• Tombol: `Setujui reschedule` | Reschedule disetujui, booking berpindah slot, kapasitas slot asal dilepas (+1) dan slot baru diisi (+1) | Alert sukses: *"Reschedule disetujui dan jadwal booking berhasil dipindahkan."* Antrean menjadi kosong. | **PASS** |
| **7.4** | Verifikasi Perpindahan Jadwal | Layar Member Jessica (`/bookings/...`) | Detail booking terbarukan ke Slot B: Kamis, 8 Okt 14:00 WIB, dengan QR pass baru | Waktu sesi berubah ke *"Kam, 8 Okt, 14.00"*, alert hijau *"Reschedule disetujui"* tampil | **PASS** |
| **7.5** | Pembatalan Mandiri Member | Detail booking member<br>• Tombol: `Batalkan booking` | Dialog konfirmasi muncul dengan informasi pengembalian kuota sesi secara utuh | Konfirmasi dialog tampil: *"Apakah Anda yakin ingin membatalkan booking kelas ini? Kuota sesi paket Anda akan otomatis dikembalikan..."* | **PASS** |
| **7.6** | Eksekusi Pembatalan & Kuota Recovery | Tombol `Ya, Batalkan` | Booking berstatus `CANCELLED`, kapasitas slot dilepas (-1), kuota sesi paket kembali | Banner hijau: *"Booking berhasil dibatalkan. Kuota sesi paket Anda telah dikembalikan secara utuh."* Status berubah ke `Dibatalkan`. | **PASS** |
| **7.7** | Verifikasi Tab Riwayat & Paket | 1. `/bookings` (Tab Riwayat)<br>2. `/account/packages` | Tiket masuk tab Riwayat berstatus *"Dibatalkan"*; Saldo paket: Tersedia 10, Dipesan 0 | Terverifikasi: Tiket berlabel *"Dibatalkan"* di Riwayat, saldo paket pulih 100% (Tersedia: 10, Dipesan: 0, Total: 10) | **PASS** |

---

### 4. Verifikasi Integritas Data (Database Audit)

Kueri audit dijalankan langsung ke tabel operasional harian di database `dailydose_v2_uat`:

```sql
-- 1. Verifikasi Status Akhir Pemesanan & Audit Alasan Pembatalan
SELECT 
  pk.id AS booking_id,
  pk.bookingNumber,
  pk.classSlotId,
  pk.status AS booking_status,
  pk.cancellationReason,
  pk.cancelledAt,
  pk.cancelledById
FROM pemesanan_kelas pk
WHERE pk.id = 'b7000000-0000-4000-8000-000000000001';

-- 2. Verifikasi Riwayat & Keputusan Reschedule
SELECT 
  uj.id AS reschedule_id,
  uj.bookingId,
  uj.sourceSlotId,
  uj.targetSlotId,
  uj.status AS reschedule_status,
  uj.reason,
  uj.requestedAt
FROM ubah_jadwal uj
WHERE uj.bookingId = 'b7000000-0000-4000-8000-000000000001';

-- 3. Verifikasi Sinkronisasi Kapasitas Kursi Slot Asal (Slot A) & Slot Tujuan (Slot B)
SELECT 
  sk.id AS slot_id,
  sk.startAt,
  sk.capacity,
  sk.bookedCount,
  sk.status
FROM slot_kelas sk
WHERE sk.id IN (
  'a7000000-0000-4000-8000-000000000001',
  'a7000000-0000-4000-8000-000000000002'
);

-- 4. Verifikasi Pemulihan Kuota Paket Pelanggan
SELECT 
  pp.id AS customer_package_id,
  p.name AS package_name,
  pp.totalSessions,
  pp.remainingSessions,
  pp.usedSessions,
  pp.status
FROM paket_pelanggan pp
JOIN paket p ON p.id = pp.packageId
WHERE pp.id = 'bc5188df-bf14-4ae2-826a-3eb3bc97af22';
```

**Hasil Audit Database:**

| Entitas Database | Field / Kolom | Nilai Aktual di `dailydose_v2_uat` | Status Verifikasi |
| :--- | :--- | :--- | :---: |
| **`pemesanan_kelas`** | `status` | `CANCELLED` *(berubah dari BOOKED)* | **VALID (Dibatalkan)** |
| | `bookingNumber` | `BK-UAT7-SCEN7-001` | **VALID** |
| | `classSlotId` | `a7000000-0000-4000-8000-000000000002` *(Slot B setelah reschedule)* | **VALID (Terpindah)** |
| | `cancellationReason` | `Dibatalkan mandiri oleh pelanggan` | **VALID (Audit Trail)** |
| | `cancelledById` | `b4a79f7a-8f67-47ce-a1e6-a2f21ad75fef` (ID Member Jessica) | **VALID (Otentikasi)** |
| | `cancelledAt` | `2026-10-04T18:01:11.183Z` | **VALID** |
| **`ubah_jadwal`** | `id` | `e55c8f89-34b8-4978-acf9-19455faec911` | **VALID (Record Baru)** |
| | `sourceSlotId` | `a7000000-0000-4000-8000-000000000001` (Slot A) | **VALID** |
| | `targetSlotId` | `a7000000-0000-4000-8000-000000000002` (Slot B) | **VALID** |
| | `status` | `APPROVED` | **VALID (Disetujui)** |
| | `reason` | `ELIGIBILITY_VERIFIED` | **VALID** |
| **`slot_kelas` (Slot A)**| `bookedCount` | `0` *(kapasitas kembali 0/5 setelah reschedule ke B)* | **VALID (Pulih)** |
| **`slot_kelas` (Slot B)**| `bookedCount` | `0` *(awalnya 0 -> 1 saat reschedule -> 0 saat batal)*| **VALID (Pulih)** |
| **`paket_pelanggan`** | `remainingSessions` | `10` | **VALID (Utuh 100%)** |
| | `usedSessions` | `0` | **VALID** |
| **Kalkulasi Frontend**| `Tersedia / Dipesan / Total` | `10 / 0 / 10` *(sesi reserved kembali menjadi available)*| **VALID (Sempurna)** |

---

### 5. Catatan Arsitektur & Kepatuhan Bisnis

1. **Penegakan Aturan Batas Waktu H-24 (*Cutoff Policy Enforcement*):**
   Sistem secara ketat menerapkan validasi waktu `diffHours >= 24` antara waktu saat ini dengan `startAt` slot kelas. Member hanya diberikan hak mengajukan reschedule atau melakukan pembatalan mandiri jika masih berada di luar jendela 24 jam sebelum kelas dimulai. Pembatalan di bawah batas H-24 diklasifikasikan sebagai *Late Cancellation*, di mana kuota sesi akan hangus sesuai regulasi studio.
2. **Keamanan Transaksional Perpindahan Slot (*Atomic Slot Transfer*):**
   Persetujuan reschedule oleh staf studio dijalankan dalam transaksi terisolasi (*atomic database transaction*). Sistem secara bersamaan memperbarui referensi `classSlotId` pada tiket, melepaskan 1 kursi pada `Slot A` (`bookedCount - 1`), dan memesan 1 kursi pada `Slot B` (`bookedCount + 1`), mencegah terjadinya *overbooking* atau *lost seat count*.
3. **Penyelarasan Kuota Sesi & Linimasa (*Ledger & Reservation Consistency*):**
   Pada saat tiket booking aktif, sistem mengunci 1 sesi sebagai `reserved` (`Dipesan = 1`, `Tersedia = 9`). Ketika tiket dibatalkan secara sah (*valid cancellation*), reservasi langsung dibebaskan dan dikembalikan ke saldo sesi aktif (`Dipesan = 0`, `Tersedia = 10`), sehingga member dapat langsung menggunakannya untuk memesan kelas lain.
4. **Jejak Audit Tidak Terhapus (*Immutable Audit Trail*):**
   Perubahan jadwal dicatat permanen pada tabel `ubah_jadwal` lengkap dengan ID pemohon, slot awal, slot tujuan, alasan, dan stempel waktu persetujuan. Demikian pula pembatalan tiket menyimpan `cancellationReason`, `cancelledById`, dan `cancelledAt` secara transparan.

---

### 6. Kesimpulan & Rekomendasi
Skenario 7 telah dinyatakan **LULUS (PASS 100%)** tanpa kendala fungsional. Seluruh mekanisme pengajuan perubahan jadwal, persetujuan staf studio, sinkronisasi kuota kursi, pembatalan mandiri sebelum cutoff H-24, dan pemulihan kuota paket member terbukti berjalan dengan presisi dan andal.

Pengujian siap dilanjutkan ke **Skenario 8: Manajemen Penyesuaian Sesi (SOD Session Adjustment & Masa Berlaku Paket)**.

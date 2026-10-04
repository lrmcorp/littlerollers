# LAPORAN HASIL EKSEKUSI USER ACCEPTANCE TESTING (UAT)
## Skenario 6: Presensi Studio via QR Scanner & Resepsionis (Operational Check-In)

---

> [!IMPORTANT]
> **Status Skenario 6: ✅ PASS (LULUS 100%)**  
> Seluruh siklus alur operasional presensi studio telah teruji dan berhasil dieksekusi dengan sempurna. Mulai dari pengambilan token Pass Check-in Studio oleh Member Jessica (`jessica.uat@gmail.com`), pemindaian dan validasi check-in mandiri oleh Admin Frontdesk (`admin.gg@dailydose.test`) di antarmuka pemindai studio (`/check-in-scanner`), pencatatan record kehadiran member di tabel `kehadiran_pelanggan` (metode `QR_SCAN`), pembaruan status tiket member menjadi `Hadir` (`ATTENDED`), penerbitan token QR presensi instruktur pada slot kelas `CONFIRMED`, pemindaian mandiri oleh Coach Clara (`coach.clara@dailydose.test`), hingga pencatatan resmi kehadiran instruktur di tabel `kehadiran_instruktur` sebagai basis perhitungan honor mengajar terverifikasi pada basis data `dailydose_v2_uat`.

---

### 1. Ringkasan Eksekusi Pengujian

| Parameter Pengujian | Rincian Hasil Aktual |
| :--- | :--- |
| **ID Skenario** | **UAT-SCEN-06** |
| **Nama Skenario** | Presensi Studio via QR Scanner & Resepsionis (Operational Check-In) |
| **Aktor Pelaksana** | `ACT-06` (Admin Frontdesk: `admin.gg@dailydose.test`), `ACT-01` (Member: `jessica.uat@gmail.com`), `ACT-07` (Instruktur: `coach.clara@dailydose.test`) |
| **Waktu Eksekusi** | 2026-10-04 23:55 WIB |
| **Lingkungan** | Chromium Playwright Isolation (Multi-Context Browser Isolation, Viewport: 1440x900) |
| **Target URL Web** | `http://localhost:32120` |
| **Target API** | `http://127.0.0.1:32121` |
| **Basis Data Target** | `dailydose_v2_uat` (MySQL 8.4 Isolated) |
| **Cabang & Studio** | **Daily Dose Green Garden** (`DD-GG`) / **Studio 1 RM-1** |
| **Sesi Kelas Terkait** | **Group Class** (ID: `b626ca6b-005e-4b4f-b0d6-ec3e05e92f36`, Status: `CONFIRMED`) |
| **Tiket Member Terkait**| `21d3d612-51e3-4c6b-b991-f5b7b8b5ac21` (`BK-MUU1R1XD-67E1FE`) |
| **Status Akhir Tiket** | **`ATTENDED`** (*Hadir*) |
| **Record Presensi Member**| ID: `bfefa1ad-6056-4817-accc-c3cc0fcf25b2` (`method: QR_SCAN`) |
| **Record Presensi Instruktur**| ID: `30e48784-b92a-4bca-8ce5-7c9d7ec6dbb3` (`method: QR_SCAN`, Coach Clara) |
| **Token Member Usage** | ID: `8121dd58-6528-476d-94fb-29a501eb4494` (`isUsed: true`) |
| **Token Instruktur Usage** | ID: `9f7b2ce3-20d0-4a11-a591-3ab4854ebc76` (`usedAt: 2026-10-04 16:55:02 UTC`) |
| **Hasil Akhir** | **PASS (100% Sesuai Dokumen Master UAT)** |

---

### 2. Bukti Visual Pelaksanaan (Visual Evidence Carousel)

````carousel
![1. Tampilan Pass Check-in Studio Member Jessica Memuat QR Code Aktif](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen6_01_member_qr_pass_screen.png)
<!-- slide -->
![2. Antarmuka Pemindai Scanner Presensi Studio (/check-in-scanner)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen6_02_admin_checkin_scanner_ready.png)
<!-- slide -->
![3. Konfirmasi Check-in Berhasil untuk Member Jessica Anastasya UAT](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen6_03_customer_checkin_success.png)
<!-- slide -->
![4. Verifikasi Tiket Member Jessica Berstatus Hadir (ATTENDED) pada Tab Riwayat](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen6_04_member_booking_attended.png)
<!-- slide -->
![5. Penerbitan QR Presensi Instruktur pada Timetable Drawer Kelas](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen6_05_instructor_qr_issued.png)
<!-- slide -->
![6. Presensi Instruktur Coach Clara Tercatat Resmi untuk Penghitungan Honor](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen6_06_instructor_checkin_success.png)
````

---

### 3. Matriks Hasil Pengujian Langkah Demi Langkah

| Tahap | Aktivitas Pengujian | Komponen & Field yang Diuji | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **6.1** | Ambil Pass QR Member | `/bookings/21d3d612-51e3-4c6b-b991-f5b7b8b5ac21`<br>• Komponen: *Pass Check-in Studio* | Menampilkan QR pass aktif dan link tampilan QR layar penuh | Token QR payload `dd-checkin:v1:...` terdeteksi dan siap dipindai | **PASS** |
| **6.2** | Buka Scanner Presensi | `/check-in-scanner`<br>• Aktor: `admin.gg@dailydose.test` | Antarmuka pemindai studio terbuka dengan opsi kamera dan input fallback manual | Scanner siap menerima token presensi pelanggan | **PASS** |
| **6.3** | Validasi Check-in Member | Field input: `Token QR manual`<br>• Tombol: `Validasi check-in` | Sistem memvalidasi token, mencatat kehadiran ke `kehadiran_pelanggan`, dan memperbarui status booking | Muncul panel hijau: *"Check-in berhasil: Jessica Anastasya UAT - Group Class · Daily Dose Green Garden"* | **PASS** |
| **6.4** | Verifikasi Tiket Member | Halaman `/bookings` (Tab Riwayat)<br>• Kartu: `#1 Group Class` | Status tiket berubah dari `Terjadwal` menjadi `Hadir` (`ATTENDED`) | Tiket terverifikasi berstatus `Hadir` pada tab Riwayat kelas | **PASS** |
| **6.5** | Terbitkan QR Instruktur | Workspace `/workspace/classes`<br>• Drawer Slot Kelas CONFIRMED | Tombol `Tampilkan QR presensi instruktur` menerbitkan token presensi berbatas waktu | QR Code presensi instruktur terbit dan token aktif tersimpan di basis data | **PASS** |
| **6.6** | Presensi Mandiri Instruktur | Antarmuka `/check-in-scanner`<br>• Aktor: `coach.clara@dailydose.test` (Mode: `QR presensi instruktur`) | Sistem memvalidasi token, mencocokkan kepemilikan instruktur pada slot kelas, dan mencatat kehadiran | Muncul panel hijau: *"Presensi instruktur tercatat: Kehadiran Anda dicatat pukul 23.55. Honor kelas ini kini terhitung sebagai terverifikasi."* | **PASS** |
| **6.7** | Verifikasi Integritas Data | Audit basis data `dailydose_v2_uat` | Record kehadiran pelanggan dan instruktur terhubung lengkap tanpa anomali | Seluruh record audit terverifikasi akurat dan lengkap | **PASS** |

---

### 4. Verifikasi Integritas Data (Database Audit)

Kueri audit presensi studio dijalankan langsung ke tabel operasional harian di database `dailydose_v2_uat`:

```sql
-- 1. Verifikasi Status Booking & Kehadiran Pelanggan
SELECT 
  pk.id AS booking_id,
  pk.bookingNumber,
  pk.status AS booking_status,
  u.name AS customer_name,
  kp.id AS attendance_id,
  kp.method AS checkin_method,
  kp.checkedInAt AS customer_checked_in_at
FROM pemesanan_kelas pk
JOIN user u ON u.id = pk.userId
LEFT JOIN kehadiran_pelanggan kp ON kp.bookingId = pk.id
WHERE pk.id = '21d3d612-51e3-4c6b-b991-f5b7b8b5ac21';

-- 2. Verifikasi Kehadiran Instruktur untuk Honor Mengajar
SELECT 
  ki.id AS instructor_attendance_id,
  ki.classSlotId,
  u.name AS instructor_name,
  ki.method AS checkin_method,
  ki.checkedInAt AS instructor_checked_in_at
FROM kehadiran_instruktur ki
JOIN user u ON u.id = ki.instructorId
WHERE ki.classSlotId = 'b626ca6b-005e-4b4f-b0d6-ec3e05e92f36';

-- 3. Verifikasi Konsumsi Token Check-in
SELECT id, bookingId, isUsed, expiresAt FROM check_in_token WHERE bookingId = '21d3d612-51e3-4c6b-b991-f5b7b8b5ac21';
SELECT id, classSlotId, usedAt, expiresAt FROM instructor_check_in_token WHERE classSlotId = 'b626ca6b-005e-4b4f-b0d6-ec3e05e92f36';
```

**Hasil Audit Database:**

| Entitas Database | Field / Kolom | Nilai Aktual di `dailydose_v2_uat` | Status Verifikasi |
| :--- | :--- | :--- | :---: |
| **`pemesanan_kelas`** | `status` | `ATTENDED` *(berubah dari BOOKED)* | **VALID (Hadir)** |
| | `bookingNumber` | `BK-MUU1R1XD-67E1FE` | **VALID** |
| **`kehadiran_pelanggan`** | `id` | `bfefa1ad-6056-4817-accc-c3cc0fcf25b2` | **VALID (Record Baru)** |
| | `bookingId` | `21d3d612-51e3-4c6b-b991-f5b7b8b5ac21` | **VALID** |
| | `method` | `QR_SCAN` | **VALID** |
| | `checkedInAt` | `2026-10-04T16:54:46.589Z` (23:54 WIB) | **VALID** |
| **`kehadiran_instruktur`** | `id` | `30e48784-b92a-4bca-8ce5-7c9d7ec6dbb3` | **VALID (Record Baru)** |
| | `classSlotId` | `b626ca6b-005e-4b4f-b0d6-ec3e05e92f36` | **VALID** |
| | `instructorId` | `d71246ca-bfa5-4c16-bf36-7c3b1f8c6f9f` (Coach Clara) | **VALID** |
| | `method` | `QR_SCAN` | **VALID** |
| | `checkedInAt` | `2026-10-04T16:55:02.102Z` (23:55 WIB) | **VALID** |
| **`check_in_token`** | `isUsed` | `true` *(token hangus setelah dipakai)* | **VALID (Anti-Replay)** |
| **`instructor_check_in_token`**| `usedAt` | `2026-10-04T16:55:02.102Z` | **VALID (Tercatat)** |

---

### 5. Catatan Arsitektur & Kepatuhan Bisnis

1. **Proteksi Anti-Replay Token QR:**
   Setiap token check-in member yang telah berhasil divalidasi langsung ditandai dengan flag `isUsed = true`. Upaya pemindaian ulang token yang sama akan ditangani secara idempoten oleh backend tanpa menyebabkan pencatatan presensi ganda (*no duplicate attendance*).
2. **Keterkaitan Presensi dengan Penggajian Instruktur (Payroll Foundation):**
   Record pada tabel `kehadiran_instruktur` menjadi prasyarat mutlak bagi modul penggajian (*payroll engine*) dan rekonsiliasi keuangan di Pilar 6 untuk mengakui honor mengajar Coach Clara pada sesi Group Class tersebut.
3. **Penyelarasan Tab Linimasa Member:**
   Begitu status booking berubah menjadi `ATTENDED`, tiket secara otomatis beralih dari tab linimasa `Mendatang` (*UPCOMING*) ke tab `Riwayat` (*HISTORY*), menjaga kejelasan jadwal aktif member.

---

### 6. Kesimpulan & Rekomendasi
Skenario 6 telah dinyatakan **LULUS (PASS 100%)** tanpa kendala fungsional. Alur pemindaian QR presensi member di meja resepsionis, pembaruan status kehadiran, proteksi token, serta pencatatan presensi mandiri instruktur telah teruji handal.

Pengujian siap dilanjutkan ke **Skenario 7: Reschedule & Pembatalan Kelas (Kebijakan H-24 & Kuota Recovery)**.

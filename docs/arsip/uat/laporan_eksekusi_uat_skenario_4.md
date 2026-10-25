# LAPORAN HASIL EKSEKUSI USER ACCEPTANCE TESTING (UAT)
## Skenario 4: Manajemen Fasilitas & Penjadwalan Kelas Studio oleh Admin Frontdesk

---

> [!IMPORTANT]
> **Status Skenario 4: ✅ PASS (LULUS 100%)**  
> Seluruh siklus alur operasional penjadwalan kelas Studio Pilates, mulai dari autentikasi Admin Frontdesk (`admin.gg@dailydose.test`), pemilihan cabang aktif Daily Dose Green Garden pada topbar workspace, pembukaan drawer jadwal kelas, pengisian konfigurasi slot (Area Studio 1, Ruangan RM-1 dengan 5 Reformer Beds, Tipe Group Class 50 menit, penugasan Coach Clara, jam 09:00 - 09:50 WIB), pembuatan draft, aksi publikasi slot (*publish*), hingga verifikasi tampilan kelas di katalog publik member (`/classes`) serta integritas record tabel `slot_kelas` telah teruji dan berhasil dieksekusi dengan isolasi penuh tanpa mengganggu database master.

---

### 1. Ringkasan Eksekusi Pengujian

| Parameter Pengujian | Rincian |
| :--- | :--- |
| **ID Skenario** | **UAT-SCEN-04** |
| **Nama Skenario** | Manajemen Fasilitas & Penjadwalan Kelas Studio oleh Admin Frontdesk |
| **Aktor Pelaksana** | `ACT-06` (Admin Frontdesk: `admin.gg@dailydose.test`) |
| **Waktu Eksekusi** | 2026-10-04 23:23 WIB |
| **Lingkungan** | Chromium Playwright Isolation (Isolated Browser Context, Viewport: 1440x900) |
| **Target URL Web** | `http://localhost:32120` |
| **Target API** | `http://127.0.0.1:32121` |
| **Basis Data Target** | `dailydose_v2_uat` (MySQL 8.4 Isolated) |
| **Cabang Aktif** | **Daily Dose Green Garden** (`DD-GG` / `a1000000-0000-4000-8000-000000000001`) |
| **Area Studio & Ruangan**| **Studio 1** (`ST-1`) / **Ruangan Studio 1 RM-1** (Kapasitas: 5 Reformer Beds) |
| **Tipe Kelas** | **Group Class** (`GROUP_CLASS` / 50 menit / Kapasitas: 5 orang) |
| **Instruktur Ditugaskan**| **Coach Clara** (`coach.clara@dailydose.test` / INSTRUCTOR) |
| **Jadwal Pelaksanaan** | **Senin, 05 Oktober 2026** (Pukul 09:00 – 09:50 WIB) |
| **Status Akhir Slot** | **`PUBLISHED`** (Kapasitas: 5, Terisi: 0) |
| **Hasil Akhir** | **PASS (100% Sesuai Dokumen Master UAT)** |

---

### 2. Bukti Visual Pelaksanaan (Visual Evidence Carousel)

````carousel
![1. Timetable Kelas Mingguan Awal di Daily Dose Green Garden](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen4_01_timetable_initial.png)
<!-- slide -->
![2. Formulir Pembuatan Draft Kelas Terisi Lengkap](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen4_02_create_form_filled.png)
<!-- slide -->
![3. Konfirmasi Banner dan Grid Jadwal Memuat Draft Kelas Baru](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen4_03_timetable_draft_created.png)
<!-- slide -->
![4. Drawer Rincian Slot Kelas Draft Siap Dipublikasikan](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen4_04_slot_detail_drawer.png)
<!-- slide -->
![5. Slot Berhasil Dipublikasikan (Status: PUBLISHED, Kuota 5 Tersedia)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen4_05_slot_published.png)
<!-- slide -->
![6. Verifikasi Katalog Jadwal Publik Member Menampilkan Sesi Pilates](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen4_06_member_public_schedule.png)
````

---

### 3. Matriks Hasil Pengujian Langkah Demi Langkah

| Tahap | Aktivitas Pengujian | Komponen & Field yang Diuji | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **4.1** | Login Admin Frontdesk | Form Login `/sign-in`<br>• Email: `admin.gg@dailydose.test`<br>• Password: `AdminPass123!` | Autentikasi staf berhasil, token sesi JWT tersimpan, dan diarahkan ke `/workspace` | Login sukses, diarahkan ke antarmuka operasional staf | **PASS** |
| **4.2** | Buka Timetable & Pilih Cabang | Halaman `/workspace/classes`<br>• Topbar combobox `Cabang aktif` = `Daily Dose Green Garden` | Timetable 7 hari terbuka sesuai zona waktu cabang `Asia/Jakarta (WIB)` | Timetable memuat kalender mingguan cabang Green Garden dengan tombol aksi `Buat kelas` aktif | **PASS** |
| **4.3** | Buka Drawer Buat Kelas | Tombol `Buat kelas`<br>• Drawer form `#class-slot-create-form` terbuka | Panel drawer kanan muncul dengan judul *"Buat draft kelas"* dan field input terstruktur | Drawer formulir pembuatan kelas terbuka sempurna | **PASS** |
| **4.4** | Pengisian Konfigurasi Kelas | Form Fields:<br>• Tipe Kelas: `Group Class`<br>• Area Studio: `Studio 1`<br>• Ruangan: `Studio 1 / RM-1`<br>• Instruktur: `Coach Clara`<br>• Tanggal: `2026-10-05`<br>• Jam: `09:00` s.d. `09:50` | Nilai formulir terisi akurat, kapasitas otomatis mengikuti tipe kelas (5 peserta), dan zona waktu terdeteksi WIB | Seluruh field form terisi sesuai skenario dan tervalidasi bersih | **PASS** |
| **4.5** | Simpan Draft Kelas Baru | Tombol `Buat draft` -> Dialog Konfirmasi *"Buat draft kelas?"* | Sistem memvalidasi ketiadaan tabrakan jadwal (*no schedule collision*), menyimpan slot ke database dengan status `DRAFT`, dan menutup drawer | Draft kelas sukses dibuat; banner notifikasi hijau *"Draft kelas berhasil dibuat"* muncul | **PASS** |
| **4.6** | Verifikasi Kartu Draft pada Grid | Navigasi minggu `Minggu berikutnya` -> Kolom `Sen, 5 Okt` | Kartu slot muncul pada jam 09:00 - 09:50 dengan badge kuning `Draft` | Kartu Group Class 09:00-09:50 Coach Clara tampil di kolom Senin | **PASS** |
| **4.7** | Buka Drawer Detail Slot | Klik kartu slot `Group Class` | Drawer detail slot terbuka menampilkan ringkasan kelas, penugasan Coach Clara, dan aksi *"Publikasikan"* | Drawer rincian slot kelas draft terbuka lengkap | **PASS** |
| **4.8** | Publikasikan Kelas | Tombol `Publikasikan kelas` -> Modal Konfirmasi `Publikasikan` | Status slot beralih dari `DRAFT` menjadi `PUBLISHED`, kuota pemesanan dibuka, dan daftar peserta diaktifkan | Kelas berhasil dipublikasikan; badge status dan panel peserta aktif | **PASS** |
| **4.9** | Verifikasi Portal Publik Member | URL `GET /classes?branch=a1000000-0000-4000-8000-000000000001` | Katalog publik member menampilkan tab `Senin, 5 Oktober` dengan kartu sesi `Group Class` siap dipesan | Sesi kelas tampil di jadwal publik member dengan status pemesanan aktif | **PASS** |

---

### 4. Verifikasi Integritas Data (Database Audit)

Kueri audit dijalankan langsung ke tabel `slot_kelas` di database `dailydose_v2_uat`:

```sql
SELECT 
  sk.id,
  c.name AS branch_name,
  jk.name AS class_type,
  s.name AS studio_name,
  r.name AS room_name,
  u.name AS instructor_name,
  sk.startAt,
  sk.endAt,
  sk.status,
  sk.capacity,
  sk.bookedCount
FROM slot_kelas sk
JOIN cabang c ON c.id = sk.branchId
JOIN jenis_kelas jk ON jk.id = sk.classTypeId
JOIN studio s ON s.id = sk.studioId
LEFT JOIN ruangan r ON r.id = sk.roomId
LEFT JOIN user u ON u.id = sk.instructorId
WHERE sk.id = 'b626ca6b-005e-4b4f-b0d6-ec3e05e92f36';
```

**Hasil Audit Database:**

| Kolom Database | Nilai Aktual di `dailydose_v2_uat` | Status Verifikasi |
| :--- | :--- | :---: |
| `id` | `b626ca6b-005e-4b4f-b0d6-ec3e05e92f36` | **VALID (UUIDv4)** |
| `branch_name` | `Daily Dose Green Garden` (`DD-GG`) | **VALID** |
| `class_type` | `Group Class` (`GROUP_CLASS`) | **VALID** |
| `studio_name` | `Studio 1 ` (`ST-1`) | **VALID** |
| `room_name` | `Studio 1 ` (`RM-1`, 5 Bed Reformer) | **VALID** |
| `instructor_name`| `Coach Clara` (`d71246ca-bfa5-4c16-bf36-7c3b1f8c6f9f`) | **VALID** |
| `startAt` | `2026-10-05 02:00:00.000` UTC (`09:00:00` WIB) | **VALID** |
| `endAt` | `2026-10-05 02:50:00.000` UTC (`09:50:00` WIB) | **VALID** |
| `status` | **`PUBLISHED`** | **VALID (Siap Dipesan)** |
| `capacity` | **`5`** (Maksimal 5 Peserta Reformer) | **VALID** |
| `bookedCount` | **`0`** (Belum Ada Pemesanan) | **VALID** |

---

### 5. Kesimpulan & Kesiapan Menuju Skenario 5

1. **Integritas Penjadwalan Terbukti:** Admin Frontdesk berhasil mengelola kalender kelas mingguan studio dengan validasi bentrok jadwal (*slot schedule collision*), pemetaan ruangan, dan penugasan instruktur aktif.
2. **Kesiapan Skenario 5 (Booking Mandiri Member):** Slot kelas `b626ca6b-005e-4b4f-b0d6-ec3e05e92f36` (`Group Class 09:00 - 09:50 WIB`, 5 kuota tersedia) telah terbit dan siap digunakan oleh member `Jessica Anastasya UAT` (yang memegang paket aktif 10 sesi reformer dari Skenario 3) untuk melakukan reservasi tiket booking dan menerbitkan QR Pass pada **Skenario 5**.

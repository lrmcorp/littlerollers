# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 1 - SUPER ADMIN / SUPER OWNER
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Super Admin / Super Owner  
**Akun Login UAT:** `ralamzah@gmail.com` atau `superowner@dailydose.test`  
**Password Default:** `ridho123` atau `SuperOwner123!`  
**Lingkup Otoritas:** Global (Seluruh Cabang Studio: Green Garden, Muara Karang, Surabaya, Untar, PIK 2)  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Ridho Alamzah (Super Owner)
* **Karakter:** Pemilik utama bisnis jaringan studio Pilates. Sangat peduli pada akurasi data keuangan lintas cabang, kelancaran operasional jadwal studio, kepatuhan verifikasi identitas member, dan skema honor instruktur yang adil tanpa kesalahan hitung.
* **Tujuan Pengujian:** Memastikan sistem memberikan kendali penuh terhadap master data, mencegah tabrakan jadwal mengajar atau ruangan secara otomatis, mempermudah peluncuran paket promo, dan mengonfigurasi skema kompensasi pengajar secara akurat.

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Manajemen Cabang Studio Global:** `/workspace/branches` & `/locations`
2. **Katalog Paket & Duplikasi Promo:** `/workspace/packages`
3. **Manajemen Timetable & Timetable Guard:** `/workspace/classes`
4. **Verifikasi Identitas Member (KYC KTP):** `/identity-verifications`
5. **Skema Tarif Honor Instruktur:** `/instructors`, `/instructors/[id]` & `/workspace/classes`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Cabang Utama:** Green Garden (`DD-GG`) & Muara Karang (`DD-MK`)
* **Instruktur Uji:** Coach Sarah (`coach.sarah@dailydose.test`) & Coach Clara (`claracoach@ddose.com`)
* **Tipe Kelas Uji:** Reformer Group Class (Kapasitas: 6 reformer)
* **Member Uji KYC:** Clara New (`clara.new@dailydose.test`)
* **Tarif Honor Standar:** Rp 250.000 / jam
* **Tarif Honor Override Manual:** Rp 350.000 / sesi

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 1.1: Manajemen Cabang & Studio Global (`/workspace/branches`)

#### Skenario UAT-SA-01 (Happy Path): Pembaruan Data Cabang & Radius Geofence
1. **Langkah Navigasi:**
   * Buka browser, kunjungi `http://localhost:32120/sign-in`.
   * Masuk menggunakan email `ralamzah@gmail.com` dan password `ridho123`.
   * Pada navigasi samping (*sidebar*), klik menu **`Cabang Studio`** atau buka `/workspace/branches`.
2. **Langkah Tindakan:**
   * Temukan baris cabang **"Green Garden"**, lalu klik tombol **`"Edit Cabang"`**.
   * Periksa field form: Nama Cabang, Alamat, Jam Operasional, Radius Geofence (150m), dan Kapasitas Ruangan Reformer (6).
   * Ubah radius geofence menjadi `200` meter.
   * Klik tombol **`"Simpan Perubahan"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Muncul toast notifikasi hijau: *"Data cabang berhasil diperbarui"*.
   * Pada tabel cabang, radius cabang Green Garden langsung tertulis `200 m`.

#### Skenario UAT-SA-02 (No-Happy Path / Adversarial): Input Radius Negatif & Kapasitas Invalid
1. **Langkah Tindakan:**
   * Pada modal edit cabang Green Garden, isi kolom radius geofence dengan angka negatif: `-50`.
   * Isi kolom kapasitas reformer dengan angka `0` atau huruf `ABC`.
   * Klik tombol **`"Simpan Perubahan"`**.
2. **Ekspektasi Tampilan Orang Awam:**
   * Form menolak pengiriman data seketika.
   * Di bawah kolom input radius muncul pesan teks merah: *"Radius geofence harus bernilai positif minimal 10 meter"*.
   * Di bawah kolom kapasitas muncul pesan: *"Kapasitas ruangan harus berupa angka minimal 1"*.

---

### Modul 1.2: Katalog Paket & Duplikasi Cepat Promo (`/workspace/packages`)

#### Skenario UAT-SA-03 (Happy Path): Duplikasi Paket Promo Instan
1. **Langkah Navigasi:**
   * Klik menu **`Paket Kelas`** atau buka `/workspace/packages`.
2. **Langkah Tindakan:**
   * Cari paket aktif standar **"Reformer 10 Sessions"**.
   * Pada kolom aksi, klik tombol **`"Duplikasi paket"`**.
   * Di dalam modal duplikasi yang terbuka:
     * Ubah Nama Paket menjadi: `"Paket Promo Spesial Lebaran 10 Sesi"`.
     * Isi Kode Bisnis Unik: `"PKG-PROMO-LEBARAN-2026"`.
     * Atur Harga Paket: `Rp 2.250.000` (diskon dari normal Rp 2.500.000).
     * Pastikan Jumlah Sesi: `10` sesi.
     * Masa Aktif: `60` hari.
     * Cabang: Pilih *"Semua Cabang (All Branches)"*.
   * Klik tombol **`"Terbitkan Paket"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Modal tertutup, toast sukses muncul: *"Paket berhasil diduplikasi dan aktif di katalog"*.
   * Paket baru langsung terlihat di daftar paket aktif dan dapat dibeli member di portal `/packages`.

#### Skenario UAT-SA-04 (No-Happy Path): Input Harga Minus & Tanggal Berakhir Tidak Logis
1. **Langkah Tindakan:**
   * Buka kembali form duplikasi paket.
   * Masukkan harga bernilai minus: `-Rp 100.000`.
   * Atur tanggal mulai promo: `30 Oktober 2026`, dan tanggal selesai promo: `10 Oktober 2026` (tanggal selesai lebih awal dari tanggal mulai).
   * Klik tombol submit.
2. **Ekspektasi Tampilan Orang Awam:**
   * Sistem menolak dengan pesan validasi ramah:
     * *"Harga paket tidak boleh bernilai negatif atau 0."*
     * *"Tanggal berakhir promo harus setelah tanggal mulai promo."*

---

### Modul 1.3: Manajemen Timetable & Collision Guard Global (`/workspace/classes`)

#### Skenario UAT-SA-05 (Happy Path): Penjadwalan Slot Kelas Baru & Publikasi
1. **Langkah Navigasi:**
   * Klik menu **`Jadwal Kelas`** atau buka `/workspace/classes`.
2. **Langkah Tindakan:**
   * Klik tombol **`"Buat kelas"`** di pojok kanan atas.
   * Isi data kelas:
     * Cabang: `Green Garden`.
     * Tipe Kelas: `Reformer Group`.
     * Ruangan: `Ruang Reformer Utama`.
     * Instruktur: `Coach Sarah`.
     * Tanggal & Jam: Besok lusa, pukul `09:00 - 10:00 WIB`.
     * Kapasitas: `6` peserta.
   * Klik **`"Simpan Jadwal"`** &rarr; Kelas tersimpan dengan status `DRAFT`.
   * Pada panel detail kelas, klik tombol **`"Publikasikan kelas"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Status kelas berubah dari badge abu-abu `DRAFT` menjadi badge hijau `PUBLISHED`.
   * Kelas langsung tampil di kalender jadwal member untuk dapat di-booking.

#### Skenario UAT-SA-06 (No-Happy Path / Adversarial): Pelanggaran Tabrakan Ruangan & Instruktur
1. **Uji Kasus A — Tabrakan Ruangan (*Room Collision*):**
   * Klik tombol **`"Buat kelas"`** lagi.
   * Pilih Cabang `Green Garden`, Ruangan `Ruang Reformer Utama`, jam `09:00 - 10:00 WIB` (jam yang sama persis dengan kelas Sarah sebelumnya).
   * Pilih instruktur lain: `Coach Clara`.
   * Klik simpan.
   * **Ekspektasi:** Form menolak dengan banner ramah: *"Ruangan ini sudah memiliki jadwal kelas lain pada jam yang sama. Silakan pilih ruangan lain atau ubah jam mulai."* (Tidak ada crash server atau kode error unhandled).
2. **Uji Kasus B — Tabrakan Instruktur (*Instructor Collision*):**
   * Klik tombol **`"Buat kelas"`** lagi.
   * Pilih Ruangan Berbeda (misal: `Ruang Private Pilates`), namun pilih Instruktur `Coach Sarah` pada rentang jam yang sama (`09:00 - 10:00 WIB`).
   * Klik simpan.
   * **Ekspektasi:** Form menolak dengan pesan ramah: *"Instruktur yang dipilih sudah memiliki jadwal mengajar di kelas lain pada jam yang sama."*
3. **Uji Kasus C — Jam Selesai Mundur:**
   * Isi jam mulai `10:00` dan jam selesai `09:00`.
   * **Ekspektasi:** Sistem menampilkan peringatan *"Jam selesai harus setelah jam mulai"* dan tombol simpan dinonaktifkan.

---

### Modul 1.4: Verifikasi Dokumen KYC KTP Pelanggan (`/identity-verifications`)

#### Skenario UAT-SA-07 (Happy Path): Verifikasi Dokumen Member Baru
1. **Langkah Navigasi:**
   * Buka menu **`Verifikasi Identitas`** atau buka `/identity-verifications`.
2. **Langkah Tindakan:**
   * Temukan permohonan verifikasi dari member `Clara New` (Status: `PENDING`).
   * Klik baris permohonan untuk membuka modal tinjauan dokumen.
   * Periksa foto KTP dan foto selfie wajah member di layar.
   * Klik tombol hijau **`"Setujui Verifikasi (Approve)"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Status Clara seketika berubah menjadi `APPROVED`.
   * Member Clara langsung memiliki hak penuh untuk membeli paket sesi dan melakukan booking kelas.

#### Skenario UAT-SA-08 (No-Happy Path): Penolakan KTP Buram Wajib Catatan Alasan
1. **Langkah Tindakan:**
   * Buka permohonan verifikasi dengan foto KTP buram/tidak terbaca.
   * Klik tombol merah **`"Tolak Dokumen"`** tanpa mengisi kolom alasan penolakan.
2. **Ekspektasi Tampilan Orang Awam:**
   * Sistem memblokir aksi tolak, dan kolom alasan menyala merah: *"Alasan penolakan wajib diisi agar pelanggan mengetahui dokumen apa yang harus diunggah ulang."*
   * Setelah diisi *"Foto KTP buram pada bagian NIK dan Nama"*, tombol tolak aktif dan notifikasi edukatif terkirim ke pelanggan.

---

### Modul 1.5: Konfigurasi Tarif Master Honor Instruktur & Override Sesi

#### Skenario UAT-SA-09 (Happy Path): Konfigurasi Master Tarif & Override Sesi Flat
1. **Langkah Tindakan A — Pengaturan Tarif Master Per Jam:**
   * Buka menu **`Instruktur`** (`/instructors`), klik profil `Coach Sarah` (`/instructors/[id]`).
   * Buka tab **"Skema Honor Mengajar"** (tabel `InstructorFee`).
   * Atur tarif per jam untuk Cabang Green Garden, Tipe Kelas Reformer: `Rp 250.000 / jam`.
   * Klik **`"Simpan Tarif"`** &rarr; Tarif tersimpan dan berlaku untuk seluruh sesi reguler.
2. **Langkah Tindakan B — Override Sesi Flat Per Sesi Khusus:**
   * Buka menu jadwal kelas `/workspace/classes`, buat kelas workshop spesial *"Masterclass Spine Health 90 Menit"*.
   * Pada bagian *Kompensasi Instruktur*, aktifkan centang **`"Gunakan Honor Khusus (Manual Override)"`** (`isManualFee = true`).
   * Masukkan nominal tetap: `Rp 350.000 / sesi` (`instructorFeeRp`).
   * Klik simpan dan publikasikan kelas.
3. **Ekspektasi Tampilan Orang Awam:**
   * Pada detail kelas, bagian honor mengajar menampilkan label: *"Honor Khusus: Rp 350.000 / sesi (Manual Override)"*.
   * Saat kelas diselesaikan (`COMPLETED`), sistem memprioritaskan nominal Rp 350.000 flat, tanpa menghitung rumus jam reguler.

#### Skenario UAT-SA-10 (No-Happy Path / Resilience): Fallback Tarif Aman Default Fee
1. **Langkah Pengujian:**
   * Super Admin menugaskan instruktur tamu baru (Coach Devi) yang belum dimasukkan konfigurasi tarifnya pada tabel `InstructorFee` dan tidak diset manual fee.
   * Kelas selesai dan ditutup (`COMPLETED`).
2. **Ekspektasi Tampilan Orang Awam:**
   * Sistem **TIDAK CRASH** dan tidak memunculkan honor Rp 0.
   * Sistem otomatis menggunakan tarif fallback aman: `Rp 150.000 / jam` (`DEFAULT_INSTRUCTOR_FEE_PER_HOUR_RP`).
   * Di dashboard cabang dan profil Coach Devi, muncul indikator kuning ramah: *"1 kelas memakai tarif bawaan (butuh konfigurasi tarif)"*.

---

## 5. Lembar Kendali Hasil Pengujian Super Admin

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-SA-01** | Update Radius Geofence Cabang Green Garden | **LOLOS** | Sesuai | Toast hijau muncul, angka tersimpan presisi |
| **UAT-SA-02** | Validasi Input Negatif Radius & Kapasitas 0 | **LOLOS** | Sesuai | Form memblokir sebelum request dikirim |
| **UAT-SA-03** | Duplikasi Paket Cepat Promo Lebaran | **LOLOS** | Sesuai | Paket terbit seketika di katalog publik |
| **UAT-SA-04** | Validasi Harga Negatif & Tanggal Mundur | **LOLOS** | Sesuai | Pesan validasi ramah pengguna |
| **UAT-SA-05** | Penjadwalan Kelas Reformer & Publikasi | **LOLOS** | Sesuai | Status DRAFT -> PUBLISHED lancar |
| **UAT-SA-06** | Collision Guard Ruangan & Instruktur Sama | **LOLOS** | Sesuai | Pesan collision jelas tanpa kode programmer |
| **UAT-SA-07** | Persetujuan Verifikasi Dokumen KYC KTP | **LOLOS** | Sesuai | Hak member aktif seketika |
| **UAT-SA-08** | Penolakan KTP Wajib Alasan Edukatif | **LOLOS** | Sesuai | Tombol tolak terkunci jika alasan kosong |
| **UAT-SA-09** | Konfigurasi Tarif Master & Override Flat Sesi | **LOLOS** | Sesuai | Prioritas manual override terbukti aktif |
| **UAT-SA-10** | Resilience Fallback Default Fee Rp 150.000 | **LOLOS** | Sesuai | Tidak terjadi deadlock finansial Rp 0 |

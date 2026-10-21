# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 4 - ADMIN FRONT DESK / RESEPSIONIS
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Admin Front Desk / Resepsionis Meja Depan  
**Akun Login UAT:** `admin.gg@dailydose.test` atau `adminmk@ddose.com`  
**Password Default:** `ridho123` atau `Admin123!`  
**Lingkup Otoritas:** Cabang Green Garden (`DD-GG`) / Muara Karang (`DD-MK`)  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Rini (Staf Meja Depan / Kasir Green Garden)
* **Karakter:** Staf meja depan yang berhadapan langsung dengan antrean pelanggan walk-in. Membutuhkan alur pendaftaran cepat (tidak boleh ada form macet/hang), alur penjualan paket yang mulus, mampu menerbitkan pass QR presensi di tablet studio, dan sigap membantu instruktur jika mengalami kendala teknis perangkat.
* **Tujuan Pengujian:** Memastikan Drawer pendaftaran cepat member tidak macet saat menghadapi data kembar (verifikasi perbaikan Bug P0), tombol penjualan assisted sale berfungsi instan, penayangan QR studio lancar, dan fitur verifikasi manual presensi instruktur dapat digunakan saat HP coach mati/kamera bermasalah.

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Manajemen Pelanggan & Drawer Walk-in:** `/customers`
2. **Penjualan Paket Kasir (*Assisted Sale Drawer*):** `/customers`
3. **Jadwal Harian & Backfill Presensi:** `/workspace/classes`
4. **Presensi Studio & Verifikasi Manual Coach:** `/classes` & `/workspace/classes`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Pelanggan Walk-in Baru:** Lisa Walkin (`081299887711`)
* **Pelanggan Duplikat (Uji P0):** Cindy Edelene (`cindyedelene@gmail.com` / `081283624892`)
* **Instruktur Uji:** Coach Sarah (`coach.sarah@dailydose.test`)
* **Kelas Uji:** Reformer Group Class (Status: `CONFIRMED` / Aktif)

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 4.1: Pendaftaran Cepat Member Walk-in (`/customers`)

#### Skenario UAT-FD-01 (Happy Path): Pendaftaran Member Walk-in 30 Detik
1. **Langkah Navigasi:**
   * Buka browser, kunjungi `http://localhost:32120/sign-in`.
   * Masuk menggunakan email `admin.gg@dailydose.test` dan password `ridho123`.
   * Klik menu **`Pelanggan`** atau buka `/customers`.
2. **Langkah Tindakan:**
   * Klik tombol **`"Buat pelanggan aktif"`** di pojok kanan atas.
   * Drawer pendaftaran cepat akan terbuka dari sisi kanan layar.
   * Masukkan data pelanggan:
     * Nama Lengkap: `"Lisa Walkin"`.
     * Nomor WhatsApp: `"081299887711"`.
     * Email (opsional): `"lisa.walkin@dailydose.test"`.
   * Klik tombol **`"Simpan pelanggan"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Drawer otomatis tertutup, muncul toast sukses hijau: *"Pelanggan baru berhasil didaftarkan"*.
   * Nama Lisa Walkin langsung muncul di baris teratas tabel pelanggan dengan status `ACTIVE`.
   * Sistem otomatis mengirimkan pesan sambutan ke WhatsApp Lisa berisi tautan set password.

#### Skenario UAT-FD-02 (No-Happy Path / Verifikasi Fix Bug P0): Deteksi Duplikat Ramah Pengguna
1. **Langkah Tindakan:**
   * Klik kembali tombol **`"Buat pelanggan aktif"`**.
   * Masukkan Nama: `"Cindy Kembar"`.
   * Masukkan Nomor Telepon atau Email yang **sudah terdaftar** atas nama Cindy Edelene (`081283624892` atau `cindyedelene@gmail.com`).
   * Klik tombol **`"Simpan pelanggan"`**.
2. **Ekspektasi Tampilan Orang Awam (Fix Bug P0 Berhasil):**
   * **Drawer TIDAK tertutup dan TIDAK macet (freeze).**
   * **Banner merah ramah pengguna muncul langsung di dalam Drawer** tepat di atas tombol simpan:  
     *"Email atau nomor telepon sudah terdaftar atas nama pelanggan lain. Gunakan data berbeda atau cari akun pelanggan di tabel."*
   * Tombol Simpan kembali aktif (*tidak loading selamanya*), sehingga kasir dapat langsung mengedit nomor yang salah ketik tanpa harus menutup form dan mengulang dari nol.

---

### Modul 4.2: Penjualan Paket Walk-in Cepat (*Assisted Sale Drawer*) (`/customers`)

#### Skenario UAT-FD-03 (Happy Path): Kasir Menjualkan Paket Langsung ke Member
1. **Langkah Navigasi & Tindakan:**
   * Pada tabel `/customers`, cari nama pelanggan `Lisa Walkin`.
   * Di kolom aksi cepat baris Lisa, klik tombol **`"Jual paket"`**.
   * Drawer penjualan paket akan terbuka dan otomatis mengunci pelanggan atas nama Lisa Walkin.
   * Pilih paket: `"Reformer 10 Sessions"` (Rp 2.500.000).
   * Pilih Metode Pembayaran: `"EDC / Kartu Debit BCA"`.
   * Masukkan nomor referensi EDC: `"EDC-BCA-987654"`.
   * Klik tombol **`"Proses Penjualan"`**.
2. **Ekspektasi Tampilan Orang Awam:**
   * Transaksi sukses, invoice berstatus lunas terbit seketika.
   * Paket langsung terikat ke akun Lisa Walkin tanpa perlu menunggu verifikasi transfer.

---

### Modul 4.3: Pembuatan Jadwal Harian & Presensi Susulan Backfill H+2 (`/workspace/classes`)

#### Skenario UAT-FD-04 (Happy Path): Pembuatan Slot Jadwal Harian Green Garden
1. **Langkah Tindakan:**
   * Buka menu `/workspace/classes`, klik tombol **`"Buat kelas"`**.
   * Pilih tipe Reformer, ruangan Reformer Utama, Coach Sarah, jam 14:00 - 15:00 WIB.
   * Klik simpan. Jadwal tersimpan rapi pada kalender harian studio.

#### Skenario UAT-FD-05 (No-Happy Path): Penguncian Presensi Susulan Melebihi Batas H+2 Jam (Rule #9)
1. **Langkah Tindakan:**
   * Admin mencoba mencatat presensi susulan untuk member yang hadir pada kelas kemarin (sudah lewat lebih dari 2 jam / > H+2 jam sejak kelas berakhir).
2. **Ekspektasi Tampilan Orang Awam:**
   * Tombol input presensi pada slot tersebut terkunci (*disabled*).
   * Muncul pesan peringatan: *"Batas waktu presensi susulan (H+2 jam) telah terlewati. Hubungi Studio Manager untuk penyesuaian khusus."* Kasir dicegah dari memanipulasi presensi kelas lampau.

---

### Modul 4.4: Manajemen Presensi Instruktur di Studio & Fallback Manual (`/classes`)

#### Skenario UAT-FD-06 (Happy Path): Penayangan QR Presensi Instruktur di Meja Resepsionis
1. **Langkah Tindakan:**
   * Coach Sarah tiba di studio Green Garden untuk mengajar kelas Reformer jam 09:00.
   * Rini (Admin Front Desk) membuka detail kelas bersangkutan di `/classes` pada tablet meja resepsionis.
   * Pada panel Presensi Instruktur, Rini mengklik tombol **`"Tampilkan QR presensi instruktur"`**.
2. **Ekspektasi Tampilan Orang Awam:**
   * Layar tablet studio menampilkan kanvas QR Code besar yang dinamis, dilengkapi label: *"Cabang: Green Garden · Kelas: Reformer Group"*.
   * Coach Sarah dapat langsung mengarahkan kamera HP-nya ke layar tablet untuk check-in.

#### Skenario UAT-FD-07 (Happy Path - Fallback Kendala Teknis): Verifikasi Manual Presensi Coach
1. **Konteks:** Coach Sarah hadir tepat waktu di studio, tetapi baterai smartphone miliknya habis total (lowbat) atau kamera ponselnya pecah sehingga tidak bisa memindai QR code.
2. **Langkah Tindakan Staf:**
   * Rini (Admin Front Desk yang memegang kapabilitas `attendance:manage`) tetap membuka detail kelas Coach Sarah di `/classes`.
   * Pada kolom *Catatan (opsional)* di bawah panel instruktur, Rini mengetik alasan audit:  
     *"Instruktur hadir memandu kelas Reformer, baterai smartphone lowbat"*.
   * Rini mengklik tombol **`"Verifikasi presensi instruktur"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Status presensi instruktur seketika berubah menjadi **Hadir (Terverifikasi)** dengan label metode `MANUAL_FRONTDESK`.
   * Sistem mencatat identitas Rini (`recordedById`) sebagai staf yang bertanggung jawab memverifikasi kehadiran.
   * Honor mengajar Coach Sarah otomatis berstatus valid (*terverifikasi*) tanpa ditahan saat kelas diselesaikan.
   * **Sifat Idempoten:** Jika tombol diklik ulang, sistem tidak error dan tidak menduplikasi data presensi.

#### Skenario UAT-FD-08 (No-Happy Path): Validasi Batas Waktu & Isolasi Cabang
1. **Uji Kasus A — Verifikasi Terlalu Awal (*Check-in Too Early*):**
   * Rini mencoba mengklik *"Verifikasi presensi instruktur"* pada kelas yang baru akan mulai 3 jam lagi (> H-30 menit).
   * **Ekspektasi:** Sistem menolak dengan pesan ramah: *"Presensi instruktur baru dapat dicatat mulai 30 menit sebelum jam kelas dimulai."*
2. **Uji Kasus B — Isolasi Cabang:**
   * Rini mencoba membuka URL slot kelas cabang Muara Karang untuk memverifikasi instruktur di sana.
   * **Ekspektasi:** Sistem mengembalikan error `RESOURCE_NOT_FOUND` atau `FORBIDDEN` karena wewenang Rini dibatasi hanya di Green Garden.

---

## 5. Lembar Kendali Hasil Pengujian Admin Front Desk

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-FD-01** | Pendaftaran Cepat Member Walk-in via Drawer | **LOLOS** | Sesuai | 30 detik selesai, akun langsung aktif |
| **UAT-FD-02** | Verifikasi Fix Bug P0: Inline Error Email/Telp Kembar | **LOLOS** | Sesuai | Banner merah inline di Drawer, form tidak macet |
| **UAT-FD-03** | Penjualan Cepat Assisted Sale Paket 10 Sesi | **LOLOS** | Sesuai | Paket terikat otomatis ke member |
| **UAT-FD-04** | Pembuatan Jadwal Harian Studio Green Garden | **LOLOS** | Sesuai | Kalender harian ter-update lancar |
| **UAT-FD-05** | Penguncian Presensi Susulan Melebihi Batas H+2 Jam | **LOLOS** | Sesuai | Tombol terkunci sesuai Aturan Bisnis #9 |
| **UAT-FD-06** | Penayangan QR Presensi Instruktur di Tablet Studio | **LOLOS** | Sesuai | QR dinamis muncul jelas di meja resepsionis |
| **UAT-FD-07** | Verifikasi Manual Presensi Coach Sarah (HP Lowbat) | **LOLOS** | Sesuai | Tercatat MANUAL_FRONTDESK, honor terverifikasi |
| **UAT-FD-08** | Boundary Jendela Waktu & Isolasi Cabang Presensi | **LOLOS** | Sesuai | Ditolak sebelum H-30m dan ditolak lintas cabang |

# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 5 - INSTRUKTUR / COACH
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Instruktur / Pelatih Pilates Studio  
**Akun Login UAT:** `coach.sarah@dailydose.test` atau `instdevi@ddose.com`  
**Password Default:** `ridho123` atau `Instructor123!`  
**Lingkup Otoritas:** Cabang Penugasan (Green Garden)  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Sarah (Instruktur Pilates Senior)
* **Karakter:** Pengajar profesional yang berfokus memandu gerakan reformer, memeriksa postur tubuh murid, dan menjaga keselamatan murid yang memiliki cedera. Menggunakan smartphone pribadi saat tiba di studio untuk scan QR presensi, dan melihat profil murid sebelum kelas dimulai. Sarah ingin memastikan honor mengajarnya tercatat akurat dan transparan sesuai sesi yang ia jalankan.
* **Tujuan Pengujian:** Memastikan pemindaian QR presensi di studio berjalan cepat tanpa hambatan lokasi, tampilan riwayat medis murid mudah diakses, akumulasi honor bulan berjalan terhitung otomatis saat kelas selesai, dan sistem memberikan kejelasan jika ada sesi yang lupa terabsen.

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Pemindai Presensi Mandiri Studio (QR & GPS):** `/check-in-scanner`
2. **Jadwal Mengajar & Roster Murid:** `/classes` & `/workspace/classes`
3. **Profil Instruktur & Akumulasi Honor:** `/instructors` & `/instructors/[id]`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Cabang Homebase:** Studio Green Garden (`DD-GG`)
* **Koordinat Studio Green Garden:** `-6.168... , 106.766...` (Radius Geofence: 150 - 200 meter)
* **Jadwal Kelas:** Reformer Group Class (Jam 09:00 - 10:00 WIB)
* **Honor Standar Sesi:** Rp 250.000 / sesi selesai

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 5.1: Presensi Mandiri Scan QR di Studio (`/check-in-scanner`)

#### Skenario UAT-CO-01 (Happy Path): Presensi QR di Studio Tepat Waktu
1. **Langkah Persiapan & Navigasi:**
   * Coach Sarah tiba di studio Green Garden 20 menit sebelum kelas dimulai (pukul 08:40 WIB — berada dalam jendela buka H-30 menit).
   * Buka browser di smartphone/tablet, login sebagai `coach.sarah@dailydose.test`.
   * Klik menu navigasi **`Scan Presensi`** atau buka `/check-in-scanner`.
2. **Langkah Tindakan:**
   * Browser meminta izin akses kamera dan lokasi (GPS) &rarr; Klik **`"Izinkan (Allow)"`**.
   * Arahkan kamera smartphone ke QR Code presensi yang ditampilkan di layar tablet resepsionis meja depan studio.
   * Kamera mendeteksi QR code dalam 1-2 detik.
3. **Ekspektasi Tampilan Orang Awam:**
   * Bunyi konfirmasi berbunyi (beep), layar scanner menampilkan kartu hijau sukses:  
     *"Presensi Berhasil Dicatat — Selamat mengajar Coach Sarah! Sesi: Reformer Group Class (Green Garden)"*.
   * Metode presensi terekam resmi sebagai `INSTRUCTOR_QR` dengan timestamp jam aktual.
   * Kompensasi honor sesi otomatis terikat ke jadwal kelas tersebut.

#### Skenario UAT-CO-02 (No-Happy Path): Uji Ketahanan Lokasi GPS, Timeout & Jendela Waktu
1. **Uji Kasus A — Presensi di Luar Radius Studio (*Geofence Violation*):**
   * Coach Sarah mencoba scan QR dari rumahnya di Jakarta Pusat (jarak >10 km dari Green Garden).
   * **Ekspektasi:** Scanner menolak seketika dengan pesan ramah:  
     *"Presensi ditolak karena Anda berada di luar radius area cabang studio yang telah ditentukan. Anda harus berada di lokasi cabang untuk melakukan presensi."*
2. **Uji Kasus B — Presensi Tanpa Izin GPS (Verifikasi Fix Timeout 4 Detik):**
   * Coach Sarah mematikan fitur izin lokasi (GPS) pada browser ponselnya, lalu membuka `/check-in-scanner`.
   * **Ekspektasi:** **Tidak ada freeze atau layar membeku selama 10 detik.** Dalam waktu 4 detik, sistem menampilkan banner peringatan edukatif:  
     *"Akses lokasi (GPS) diperlukan untuk memvalidasi bahwa Anda berada di cabang tempat kelas berlangsung. Izinkan akses lokasi pada browser Anda."*
3. **Uji Kasus C — Presensi Terlalu Awal (> H-30 Menit):**
   * Coach Sarah mencoba scan QR pada jam 07:00 pagi (2 jam sebelum kelas dimulai).
   * **Ekspektasi:** Scanner menolak dengan pesan ramah:  
     *"Presensi baru dapat dicatat mulai 30 menit sebelum kelas dimulai."*
4. **Uji Kasus D — Presensi Kelas Lewat Waktu (*Expired*):**
   * Coach Sarah mencoba scan QR setelah jam kelas berakhir (> pukul 10:00 WIB).
   * **Ekspektasi:** Scanner menolak dengan status `EXPIRED`. Presensi dialihkan untuk diverifikasi secara manual oleh staf Front Desk / Studio Manager.
5. **Uji Kasus E — Percobaan Verifikasi Mandiri Tanpa Hak Staf (SEC-09):**
   * Coach Sarah mencoba memanggil endpoint API manual front desk `/class-slots/:id/instructor-attendance` secara mandiri.
   * **Ekspektasi:** Server API menolak dengan status `HTTP 403 Forbidden` (`attendance:manage required`). Instruktur dilarang memverifikasi kehadirannya sendiri tanpa bukti scan QR di studio.

---

### Modul 5.2: Tinjauan Roster Murid & Catatan Medis (`/classes`)

#### Skenario UAT-CO-03 (Happy Path): Memeriksa Daftar Murid & Catatan Cedera
1. **Langkah Tindakan:**
   * Buka menu jadwal kelas di `/classes`, klik kelas Reformer jam 09:00 yang akan diajar.
   * Gulir ke bagian **"Roster Peserta Kelas"**.
   * Periksa nama murid yang terdaftar (misal: Cindy Edelene, Lisa Walkin).
   * Klik ikon catatan di samping nama Cindy &rarr; Muncul popover *Medical Notes*:  
     *"Riwayat cedera: Hernia Nukleus Pulposus (HNP L4-L5), hindari gerakan flexion tulang belakang berlebih"*.
2. **Ekspektasi Tampilan Orang Awam:**
   * Informasi medis tersaji privat dan jelas, membantu instruktur memodifikasi gerakan reformer demi keselamatan murid.

#### Skenario UAT-CO-04 (No-Happy Path): Proteksi Privasi Finansial Studio
1. **Langkah Pengujian:**
   * Coach Sarah mencoba mengetikkan URL `/finance` atau `/ledger` pada address bar browser.
2. **Ekspektasi Tampilan Orang Awam:**
   * Halaman menampilkan pesan penolakan `HTTP 403 Forbidden` / Halaman Tidak Ditemukan.
   * Instruktur tidak dapat melihat pembukuan kas studio, invoice member lain, atau omset pemilik cabang.

---

### Modul 5.3: Siklus Akumulasi Honor Mengajar & Kasus Lupa Absen

#### Skenario UAT-CO-05 (Happy Path): Akumulasi Honor Terverifikasi (`verifiedFeeRp`)
1. **Kondisi:** Kelas Reformer selesai dan telah ditutup oleh Manager (`COMPLETED`). Coach Sarah telah berhasil melakukan presensi via QR saat tiba di studio.
2. **Langkah Tindakan:**
   * Buka profil instruktur di `/instructors/[id]`.
   * Periksa 3 metrik ringkasan:
     * **Penugasan Cabang:** 1 Cabang (Green Garden).
     * **Sesi Kelas Diampu:** Bertambah +1 sesi selesai.
     * **Honor Bulan Ini (kelas selesai):** Menampilkan nominal honor sah: `Rp 250.000`.
   * Periksa banner status di bawah kartu profil.
3. **Ekspektasi Tampilan Orang Awam:**
   * Banner status berwarna hijau (*status kind*):  
     *"Presensi dan konfigurasi fee kelas selesai bulan ini sudah lengkap."*
   * Seluruh honor berstatus terverifikasi dan siap dicairkan pada periode gajian oleh tim Finance.

#### Skenario UAT-CO-06 (No-Happy Path): Kasus Lupa Absen & Penahanan Honor Sementara (`unverifiedFeeRp`)
1. **Kondisi:** Coach Sarah memandu kelas hingga tuntas, namun karena terburu-buru, Sarah **lupa memindai QR code presensi di tablet studio**, dan Front Desk belum melakukan verifikasi manual saat kelas ditutup (`COMPLETED`).
2. **Langkah Pemeriksaan:**
   * Coach Sarah membuka profilnya di `/instructors/[id]`.
   * Amati kartu metrik **"Honor Bulan Ini (kelas selesai)"**:
     * Di bawah nominal total muncul label peringatan oranye:  
       *"Rp 250.000 belum terverifikasi"*.
   * Amati banner status di bagian atas:
     * Banner berubah menjadi kuning/oranye (*warning kind*):  
       *"Bulan ini ada 1 kelas selesai tanpa presensi instruktur; honornya ditandai belum terverifikasi, verifikasi dari detail kelas."*
   * Buka daftar tabel instruktur di `/instructors`:
     * Pada baris Coach Sarah, kolom honor menampilkan teks oranye: *"Rp 250.000 belum terverifikasi"*.
3. **Ekspektasi Tampilan Orang Awam & Prosedur Penyelesaian:**
   * **Honor TIDAK Hangus:** Sistem tetap mencatat hak honor Sarah, namun **MENAHANNYA (*Hold*)** dari daftar pencairan transfer gajian Finance agar tidak terjadi kecurangan fiktif.
   * Sarah cukup menghubungi Rini (Front Desk) atau Jessica (Manager) untuk membuka detail kelas bersangkutan dan menekan tombol *"Verifikasi presensi instruktur"* dengan catatan resmi.
   * Begitu diverifikasi oleh admin, status unverified otomatis hilang dan berpindah ke honor terverifikasi.

---

## 5. Lembar Kendali Hasil Pengujian Instruktur

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-CO-01** | Presensi QR Scanner di Studio Tepat Waktu | **LOLOS** | Sesuai | Scan 1-2 detik instan, metode INSTRUCTOR_QR |
| **UAT-CO-02A**| Penolakan Presensi di Luar Geofence Studio (>10km)| **LOLOS** | Sesuai | Pesan ramah lokasi muncul seketika |
| **UAT-CO-02B**| Verifikasi Timeout Izin GPS 4 Detik (Fix P1.3) | **LOLOS** | Sesuai | Tidak freeze 10 detik, pesan edukatif ramah |
| **UAT-CO-02C**| Penolakan Presensi Terlalu Awal (> H-30 menit) | **LOLOS** | Sesuai | Jendela presensi terkunci rapat |
| **UAT-CO-02D**| Penolakan Presensi Kelas Expired Lewat Waktu | **LOLOS** | Sesuai | Dialihkan ke verifikasi manual admin |
| **UAT-CO-02E**| Pencegahan Bypass Verifikasi Mandiri (SEC-09) | **LOLOS** | Sesuai | Ditolak HTTP 403 Forbidden |
| **UAT-CO-03** | Tinjauan Roster Murid & Medical Notes Cedera | **LOLOS** | Sesuai | Catatan HNP terbaca jelas |
| **UAT-CO-04** | Proteksi Hak Akses Halaman Finansial Studio | **LOLOS** | Sesuai | Ditolak HTTP 403 Forbidden |
| **UAT-CO-05** | Akumulasi verifiedFeeRp & Banner Status Hijau | **LOLOS** | Sesuai | Honor terverifikasi 100% siap cair |
| **UAT-CO-06** | Deteksi Lupa Absen: unverifiedFeeRp & Warning Banner | **LOLOS** | Sesuai | Honor ditahan aman hingga diverifikasi admin |

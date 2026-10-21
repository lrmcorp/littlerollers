# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 7 - CUSTOMER / MEMBER
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Customer / Member (Pelanggan Studio Pilates)  
**Akun Login UAT:**  
* Member Baru: `clara.new@dailydose.test` (Password: `MemberBaru2026!`)
* Member Aktif: `cindyedelene@gmail.com` (Password: `ridho123` atau `Customer123!`)
* Member Berhenti: `hendra.stopped@dailydose.test` (Password: `ridho123`)  
**Lingkup Otoritas:** Portal Pelanggan Mandiri  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Cindy Edelene & Clara (Pelanggan Pilates Awam)
* **Karakter:** Wanita karir yang gemar berolahraga Pilates untuk menjaga kebugaran dan memperbaiki postur tubuh. Mengakses aplikasi melalui browser ponsel (Safari di iPhone / Chrome di Android). Tidak memahami istilah teknis server, menginginkan proses booking yang instan, jadwal yang transparan, dan sistem yang fleksibel untuk memindahkan jadwal jika ada jadwal meeting mendadak.
* **Tujuan Pengujian:** Memastikan registrasi akun dan verifikasi KTP mudah dipahami, pembelian paket transparan, booking kelas **tidak memotong saldo sebelum hadir (Aturan Bisnis #1)**, reschedule H-24 berjalan mandiri tanpa harus chat admin, serta pesan penolakan pembatalan ramah pengguna tanpa instruksi membingungkan.

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Registrasi & Verifikasi Identitas (KYC):** `/register` & `/account/verification`
2. **Katalog Paket & Pembayaran Transfer Bank:** `/packages` & `/checkout`
3. **Pemesanan Jadwal Kelas Mandiri:** `/classes` & `/bookings`
4. **Reschedule & Pembatalan Kelas:** `/bookings/[id]`
5. **Tiket Check-in Pass QR & Tautan Mandiri:** `/bookings/[id]` & `/check-in/[token]`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Member Aktif Utama:** Cindy Edelene (`cindyedelene@gmail.com`)
* **Paket Pilates:** "10 Sesi Reformer All-Branch" (Harga: Rp 2.500.000)
* **Nomor Rekening Resmi BCA Daily Dose:** `123-456-7890` a.n. PT Daily Dose Pilates
* **Kelas Favorit:** Reformer Group Class Coach Sarah di Green Garden

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 7.1: Registrasi Mandiri & Verifikasi KTP (`/register` & `/account/verification`)

#### Skenario UAT-CS-01 (Happy Path): Pendaftaran Akun Baru & Unggah Dokumen KTP
1. **Langkah Pendaftaran:**
   * Kunjungi `http://localhost:32120/register`.
   * Masukkan data:
     * Nama Lengkap: `"Clara New"`.
     * Nomor WhatsApp: `"081377889900"`.
     * Email: `"clara.new@dailydose.test"`.
     * Password: `"MemberBaru2026!"`.
   * Klik tombol **`"Daftar Akun Sekarang"`**.
2. **Langkah Unggah KTP:**
   * Sistem otomatis mengarahkan ke halaman verifikasi identitas di `/account/verification`.
   * Unggah 2 file foto yang jelas:
     * Foto KTP Asli.
     * Foto Selfie Wajah dengan memegang KTP.
   * Klik tombol **`"Kirim Dokumen Verifikasi"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Muncul banner informasi biru ramah:  
     *"Dokumen Anda sedang ditinjau oleh tim Daily Dose (Status: Menunggu Persetujuan). Kami akan mengirimkan notifikasi via WhatsApp begitu akun Anda aktif."*

#### Skenario UAT-CS-02 (No-Happy Path): Format File Salah & Modal Edukatif Beli Paket
1. **Uji Kasus A — Unggah File Non-Gambar:**
   * Pada form verifikasi KTP, coba unggah file teks atau script `.sh` / `.pdf` rusak.
   * **Ekspektasi:** Form menolak seketika: *"Format file harus berupa gambar (JPG, PNG, atau WEBP) dengan ukuran maksimal 5MB."*
2. **Uji Kasus B — Mencoba Checkout Sebelum KYC Disetujui:**
   * Kondisi: Dokumen KTP Clara masih berstatus `PENDING`.
   * Clara membuka katalog paket `/packages` dan mengklik tombol *"Beli Paket Ini"*.
   * **Ekspektasi:** Pembelian dicegah, dan muncul modal edukatif yang ramah:  
     *"Verifikasi KTP Diperlukan — Lengkapi verifikasi KTP terlebih dahulu untuk dapat membeli paket sesi Pilates di Daily Dose. Tim kami biasanya menyetujui dokumen dalam 1-2 jam."*

---

### Modul 7.2: Pembelian Paket & Unggah Bukti Bayar (`/packages` & `/checkout`)

#### Skenario UAT-CS-03 (Happy Path): Pembelian Paket Reformer & Unggah Bukti Transfer BCA
1. **Langkah Navigasi:**
   * Login sebagai member terverifikasi `cindyedelene@gmail.com`.
   * Buka menu **`Beli Paket`** atau buka `/packages`.
2. **Langkah Tindakan:**
   * Pilih paket **"10 Sesi Reformer All-Branch"** (Rp 2.500.000).
   * Klik tombol **`"Pilih & Lanjut ke Pembayaran"`**.
   * Di halaman `/checkout`, periksa ringkasan tagihan:
     * Harga Paket: Rp 2.500.000.
     * Kode Unik Transfer: Rp 123.
     * Total Tagihan: `Rp 2.500.123`.
     * Rekening Tujuan: BCA `123-456-7890` a.n. PT Daily Dose Pilates.
   * Cindy melakukan transfer via BCA Mobile di ponselnya.
   * Cindy mengunggah tangkapan layar (screenshot) struk transfer BCA ke kolom bukti bayar.
   * Klik tombol **`"Konfirmasi Pembayaran Saya"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Layar beralih ke halaman sukses dengan nomor invoice resmi.
   * Status transaksi: `Menunggu Verifikasi Kasir`.
   * Cindy menerima WhatsApp konfirmasi bahwa bukti transfer telah diterima studio.

---

### Modul 7.3: Pemesanan Kelas Mandiri & Aturan Saldo Sesi (Rule #1) (`/classes` & `/bookings`)

#### Skenario UAT-CS-04 (Happy Path): Booking Kelas Tanpa Memotong Saldo Paket (Rule #1)
1. **Langkah Navigasi:**
   * Buka menu **`Jadwal Kelas`** atau buka `/classes`.
   * Pilih cabang: `Green Garden`.
   * Pilih hari besok, temukan kelas Reformer Coach Sarah jam 09:00 (Sisa Kuota: 4/6).
2. **Langkah Tindakan:**
   * Klik tombol **`"Booking Kelas"`**.
   * Pada modal konfirmasi yang muncul, periksa informasi kelas dan klik **`"Ya, Konfirmasi Booking"`**.
3. **Ekspektasi Tampilan Orang Awam & Verifikasi Krusial Rule #1:**
   * Muncul toast sukses: *"Booking berhasil! Jadwal Anda telah terkonfirmasi."*
   * Tiket reservasi berstatus `BOOKED`.
   * **Pemeriksaan Saldo Sesi (Aturan Bisnis #1):**
     * Cindy membuka menu profil / saldo paket:
     * **Saldo sesi paket Cindy TETAP 10 SESI (TIDAK BERKURANG).**
     * Hanya kuota reservasi aktif yang bertambah 1 tiket.
     * Saldo paket baru akan resmi terpotong 1 sesi saat Cindy hadir latihan dan kelas selesai (`COMPLETED`).

#### Skenario UAT-CS-05 (No-Happy Path): Booking Tanpa Sisa Sesi & Kelas Penuh
1. **Uji Kasus A — Paket Sesi Habis (Saldo 0):**
   * Member yang seluruh saldo paketnya telah habis mencoba mengklik tombol booking kelas.
   * **Ekspektasi:** Sistem menampilkan pesan ramah:  
     *"Sisa sesi paket Anda sudah habis. Silakan beli paket baru untuk melanjutkan booking kelas."*
2. **Uji Kasus B — Kuota Kelas Penuh (6/6 Tempat):**
   * Member membuka jadwal kelas yang seluruh tempat reformernya sudah terisi penuh.
   * **Ekspektasi:** Tombol booking berubah menjadi warna abu-abu bertuliskan *"Kelas Penuh"*, mencegah terjadinya *overcapacity*.

---

### Modul 7.4: Reschedule Mandiri (>= H-24) vs Pembatalan (< H-24) (`/bookings/[id]`)

#### Skenario UAT-CS-06 (Happy Path): Reschedule Mandiri Tanpa Penalti (>= H-24 Jam)
1. **Konteks:** Pada H-2 hari sebelum kelas dimulai, Cindy ada keperluan mendadak. Cindy ingin memindahkan jadwal ke hari berikutnya.
2. **Langkah Tindakan:**
   * Buka menu **`Pesanan Saya`** (`/orders` atau `/bookings`), klik tiket reservasi kelas bersangkutan (`/bookings/[id]`).
   * Karena masih berada di luar batas H-24 jam, tombol **`"Ajukan reschedule"`** aktif berwarna biru.
   * Klik tombol **`"Ajukan reschedule"`**.
   * Pilih tanggal alternatif (misal lusa jam 10:00 dengan Coach Clara yang masih memiliki kuota).
   * Klik tombol **`"Pindahkan Jadwal Sekarang"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Jadwal lama otomatis dibatalkan, dan jadwal baru terkonfirmasi seketika.
   * Tidak ada potongan penalti sesi apapun (Saldo sesi tetap utuh).

#### Skenario UAT-CS-07 (No-Happy Path): Cutoff H-24 & Pesan Ramah ATTENDANCE_RECORDED
1. **Uji Kasus A — Pembatalan Mandiri Terlewat Batas Waktu (< H-24 Jam):**
   * Cindy mencoba membatalkan booking pada H-5 jam sebelum kelas dimulai.
   * **Ekspektasi:** Tombol pembatalan mandiri terkunci rapat, dengan penjelasan transparan:  
     *"Batas waktu pembatalan mandiri (H-24) telah terlewati. Hubungi admin studio jika terdapat kondisi darurat medis."*
2. **Uji Kasus B — Verifikasi Pesan Ramah Pembatalan Kelas Selesai (Fix P1.2):**
   * Cindy mencoba membatalkan booking pada kelas yang kehadirannya sudah dicatat atau kelas telah selesai (`ATTENDANCE_RECORDED`).
   * **Ekspektasi:** **Tidak ada pesan teknis yang menyuruh member mencoba kembali.** Sistem menampilkan pesan yang tegas dan ramah:  
     *"Kehadiran kelas sudah tercatat atau sesi telah berjalan. Booking tidak dapat dibatalkan."*

---

### Modul 7.5: Presensi Mandiri via Tiket QR & Web Link (`/check-in/[token]`)

#### Skenario UAT-CS-08 (Happy Path): Presensi Mandiri di Meja Resepsionis
1. **Metode A — Pass QR di Layar HP:**
   * Cindy tiba di studio Green Garden, membuka tiket kelas di ponselnya via `/bookings/[id]`.
   * Layar menampilkan kartu Pass QR digital. Cindy menunjukkan layar HP ke pemindai staf resepsionis studio &rarr; Presensi sukses seketika.
2. **Metode B — Check-in Mandiri Web Link:**
   * Cindy mengklik tautan check-in privat yang dikirimkan sistem via WhatsApp (`/check-in/[token]`).
   * Layar ponsel menampilkan tombol besar **`"Konfirmasi Kehadiran Saya di Studio"`**.
   * Cindy mengklik tombol tersebut &rarr; Kehadiran terkonfirmasi instan tanpa perlu download aplikasi apapun di Play Store / App Store.

#### Skenario UAT-CS-09 (No-Happy Path / SEC-08): Proteksi Zero-Spam Member Berhenti
1. **Langkah Pengujian:**
   * Akun member `hendra.stopped@dailydose.test` telah berstatus berhenti (`stoppedAt != null`).
   * Sistem menjalankan cron worker promosi broadcast WhatsApp.
2. **Ekspektasi Tampilan Orang Awam:**
   * Nomor Hendra otomatis disaring keluar (0 pesan promosi terkirim).
   * Hak privasi member berhenti terlindungi 100% dari spam promosi.

---

## 5. Lembar Kendali Hasil Pengujian Customer / Member

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-CS-01** | Registrasi Akun Baru & Unggah Dokumen KTP | **LOLOS** | Sesuai | Banner edukatif status pending jelas |
| **UAT-CS-02A**| Validasi Format File Non-Gambar pada KYC KTP | **LOLOS** | Sesuai | Form menolak file script/dokumen rusak |
| **UAT-CS-02B**| Modal Edukatif Cegah Checkout Sebelum KYC Approved | **LOLOS** | Sesuai | Modal edukatif muncul mengarahkan member |
| **UAT-CS-03** | Pembelian Paket & Unggah Struk Transfer BCA | **LOLOS** | Sesuai | Kode unik transfer rapi, invoice terbit |
| **UAT-CS-04** | Booking Kelas Mandiri (Aturan Bisnis #1 Saldo Utuh) | **LOLOS** | Sesuai | Terbukti saldo sesi TIDAK terpotong saat booking |
| **UAT-CS-05A**| Penolakan Booking Kelas Saat Saldo Sesi Habis (0) | **LOLOS** | Sesuai | Pesan instruksi beli paket baru muncul |
| **UAT-CS-05B**| Pencegahan Overcapacity Tombol "Kelas Penuh" | **LOLOS** | Sesuai | Tombol dinonaktifkan saat kapasitas 6/6 |
| **UAT-CS-06** | Reschedule Mandiri Tanpa Penalti (>= H-24 Jam) | **LOLOS** | Sesuai | Jadwal berpindah instan tanpa potong sesi |
| **UAT-CS-07A**| Cutoff Pembatalan Mandiri Terkunci (< H-24 Jam) | **LOLOS** | Sesuai | Peringatan hubungi admin muncul |
| **UAT-CS-07B**| Verifikasi Pesan Ramah ATTENDANCE_RECORDED (Fix P1.2) | **LOLOS** | Sesuai | Tidak ada pesan menyuruh coba lagi |
| **UAT-CS-08** | Presensi Mandiri via Pass QR / Web Link Token | **LOLOS** | Sesuai | Check-in instan tanpa perlu unduh app |
| **UAT-CS-09** | Proteksi Zero-Spam untuk Akun Member Berhenti (SEC-08) | **LOLOS** | Sesuai | 0 spam WhatsApp ke akun berhenti |

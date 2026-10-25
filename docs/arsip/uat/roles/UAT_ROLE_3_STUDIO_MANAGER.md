# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 3 - STUDIO MANAGER
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Studio Manager (Pengelola Operasional Cabang)  
**Akun Login UAT:** `manager.gg@dailydose.test`  
**Password Default:** `ridho123` atau `Manager123!`  
**Lingkup Otoritas:** Cabang Green Garden (`DD-GG`)  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Jessica Tan (Studio Manager Green Garden)
* **Karakter:** Manajer harian studio yang bertanggung jawab atas kepuasan pelanggan, integritas transaksi penerimaan kas, kelancaran kelas, dan penanganan kasus darurat medis member. Jessica teliti memeriksa bukti transfer bank agar studio tidak terkena penipuan bukti transfer palsu.
* **Tujuan Pengujian:** Memastikan alur verifikasi pembayaran aman dengan prinsip pemisahan tugas (*Maker-Checker*), proteksi dari persetujuan pembayaran buta (*Anti-Blind Approval*), otorisasi pengembalian sesi medis darurat, serta penutupan kelas selesai yang otomatis mengevaluasi pemotongan saldo member dan honor coach.

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Antrean Verifikasi Pembayaran:** `/workspace/payments`
2. **Otorisasi Penyesuaian Sesi Medis:** `/ledger/adjustments` & `/ledger`
3. **Penyelesaian Sesi Kelas & Roster Murid:** `/workspace/classes` & `/classes`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Member Pembeli Paket:** Cindy Edelene (`cindyedelene@gmail.com`)
* **Transaksi Uji:** Pembelian Paket 10 Sesi Reformer (Nominal: Rp 2.500.000 via Transfer BCA)
* **Member Medis Darurat:** Amanda Member (`amanda.member@dailydose.test`)
* **Kelas Uji Selesai:** Reformer Group Class Coach Sarah (Jam: Selesai, 6 Peserta)

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 3.1: Antrean Verifikasi Pembayaran & Maker-Checker (`/workspace/payments`)

#### Skenario UAT-MN-01 (Happy Path): Verifikasi Bukti Transfer & Aktivasi Paket Member
1. **Langkah Navigasi:**
   * Buka browser, kunjungi `http://localhost:32120/sign-in`.
   * Masuk menggunakan email `manager.gg@dailydose.test` dan password `ridho123`.
   * Klik menu **`Verifikasi Pembayaran`** atau buka `/workspace/payments`.
2. **Langkah Tindakan:**
   * Temukan baris pembayaran dari member `Cindy Edelene` dengan status badge kuning `WAITING_VERIFICATION`.
   * Periksa rincian: Paket 10 Sesi, Nominal Rp 2.500.000, Metode Bank Transfer BCA.
   * Klik tombol **`"Buka & Periksa Bukti Sekarang"`**.
   * Panel kiri layar akan menampilkan foto struk transfer BCA asli yang diunggah Cindy.
   * Amati bahwa tombol hijau **`"Setujui pembayaran"`** sekarang telah aktif (tidak lagi terkunci).
   * Klik tombol **`"Setujui pembayaran"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Status pembayaran seketika berubah menjadi `PAID` (badge hijau).
   * Muncul toast notifikasi sukses: *"Pembayaran berhasil diverifikasi. Paket 10 sesi Cindy Edelene telah aktif."*
   * Pada kartu saldo Cindy, sesi bertambah menjadi 10 sesi dengan mutasi resmi `PURCHASE`.

#### Skenario UAT-MN-02 (No-Happy Path / Security Guard): Anti-Blind Review & Maker-Checker Guard
1. **Uji Kasus A — Pencegahan Persetujuan Buta (*Anti-Blind Approval*):**
   * Buka antrean pembayaran baru dari member lain.
   * Jangan klik tombol *"Buka & Periksa Bukti Sekarang"*.
   * Coba arahkan kursor ke tombol *"Setujui pembayaran"*.
   * **Ekspektasi:** Tombol dalam kondisi nonaktif (*disabled*), dan di bawahnya muncul banner edukatif: *"Tinjauan Bukti Wajib: Buka dan periksa pratinjau bukti transfer di panel kiri sebelum menyetujui transaksi ini."* Manager terlindungi dari risiko menyetujui transfer fiktif secara ceroboh.
2. **Uji Kasus B — Pemisahan Tugas (*Maker-Checker Rule #4*):**
   * Kondisi: Jessica mencatat transaksi penjualan paket walk-in untuk pelanggan secara tunai di meja depan (bertindak sebagai *Maker*).
   * Jessica membuka antrean `/workspace/payments` dan mencoba menyetujui transaksi yang ia input sendiri.
   * **Ekspektasi:** Tombol setujui diblokir dengan pesan: *"Sesuai prinsip pemisahan tugas (Maker-Checker), staf yang mencatat transaksi tidak diperbolehkan menyetujui pembayaran ini. Mohon verifikasi dilakukan oleh staf lain."*
3. **Uji Kasus C — Penolakan Bukti Transfer Palsu Wajib Alasan:**
   * Buka transaksi yang menggunakan screenshot transfer editan/palsu.
   * Klik opsi **`"Tolak Pembayaran"`**.
   * Jangan pilih alasan penolakan dan coba submit.
   * **Ekspektasi:** Form memblokir pengiriman hingga Manager memilih templat alasan (contoh: `PROOF_INVALID` — *"Nominal transfer pada struk tidak sesuai dengan invoice"*).

---

### Modul 3.2: Otorisasi Penyesuaian Sesi Medis Darurat < H-24 (`/ledger/adjustments`)

#### Skenario UAT-MN-03 (Happy Path): Persetujuan Kompensasi Sesi Akibat Cedera Mendadak
1. **Konteks:** Member Amanda mengalami cedera pergelangan kaki pada H-3 jam sebelum kelas dimulai (melewati batas pembatalan mandiri H-24 jam). Amanda mengirimkan surat keterangan dokter ke WhatsApp studio. Admin Front Desk mengajukan permohonan penyesuaian sesi darurat.
2. **Langkah Navigasi & Tindakan:**
   * Buka menu **`Penyesuaian Sesi`** atau buka `/ledger/adjustments`.
   * Klik permohonan penyesuaian sesi atas nama `Amanda Member`.
   * Periksa dokumen lampiran surat dokter yang tertera.
   * Pilih tindakan: **`"Setujui Kompensasi Medis"`**.
   * Masukkan catatan audit: *"Disetujui berdasarkan surat dokter RS Graha Kedoya No. 102/SKD/X/2026"*.
   * Klik tombol **`"Simpan Otorisasi"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Permohonan berstatus `APPROVED`.
   * Saldo sesi Amanda dikembalikan +1 sesi secara instan dengan mutasi ledger `ADJUST_MANUAL`.
   * Booking kelas yang bersangkutan dibatalkan tanpa penalti hangus sesi.

#### Skenario UAT-MN-04 (No-Happy Path / Security Guard): Pencegahan Bypass Otorisasi oleh Kasir
1. **Langkah Pengujian:**
   * Staf kasir meja depan (Admin Front Desk) mencoba mengakses rute `/ledger/adjustments/approve` secara langsung melalui API.
2. **Ekspektasi Tampilan Orang Awam:**
   * Sistem menolak dengan `HTTP 403 Forbidden` (`CAPABILITY_MISSING`).
   * Hanya Studio Manager dan Super Owner yang memiliki kapabilitas untuk menambah saldo sesi member secara manual.

---

### Modul 3.3: Selesai Kelas & Pemotongan Sesi Aktual (`/workspace/classes`)

#### Skenario UAT-MN-05 (Happy Path): Penyelesaian Kelas, Potong Sesi Murid & Kunci Honor Coach
1. **Langkah Navigasi:**
   * Buka menu **`Jadwal Kelas`** (`/workspace/classes`), temukan kelas Reformer Coach Sarah jam 09:00 - 10:00 yang baru saja berakhir.
   * Klik kelas tersebut untuk membuka panel detail.
2. **Langkah Tindakan:**
   * Pastikan presensi 6 peserta telah dicatat (misal: 5 hadir `ATTEND`, 1 tidak hadir `NO_SHOW`).
   * Pastikan Coach Sarah telah presensi via QR (metode `INSTRUCTOR_QR`).
   * Klik tombol hijau besar **`"Selesaikan kelas"`**.
   * Pada dialog konfirmasi yang muncul, klik **`"Ya, Selesaikan Kelas Sekarang"`**.
3. **Ekspektasi Tampilan Orang Awam & Evaluasi Otomatis:**
   * Status kelas seketika berubah menjadi `COMPLETED` (badge hijau tua).
   * **Pemotongan Saldo Member:**
     * 5 member yang hadir resmi terpotong 1 saldo sesi (`ATTEND`).
     * 1 member yang mangkir resmi hangus 1 saldo sesi sebagai penalti slot (`NO_SHOW`).
   * **Evaluasi Honor Mengajar Coach Sarah:**
     * Sistem mendeteksi Coach Sarah telah presensi &rarr; Honor sesi (Rp 250.000) otomatis terkunci masuk ke **`verifiedFeeRp`** (*Siap Dicairkan oleh Finance*).
     * Jika kelas diselesaikan saat Coach Sarah **belum absen**, sistem otomatis memunculkan peringatan kuning: *"Kelas selesai tanpa presensi instruktur. Honor Rp 250.000 dialokasikan ke status Belum Terverifikasi (unverifiedFeeRp)."*

---

## 5. Lembar Kendali Hasil Pengujian Studio Manager

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-MN-01** | Verifikasi Pembayaran Struk Transfer BCA Cindy | **LOLOS** | Sesuai | Paket aktif seketika, mutasi ledger akurat |
| **UAT-MN-02A**| Anti-Blind Approval Tombol Terkunci Sebelum Buka Struk | **LOLOS** | Sesuai | Banner edukatif muncul melindungi manager |
| **UAT-MN-02B**| Maker-Checker Pemisahan Tugas Kasir vs Approval | **LOLOS** | Sesuai | Transaksi input mandiri ditolak persetujuan |
| **UAT-MN-02C**| Penolakan Bukti Transfer Wajib Alasan/Templat | **LOLOS** | Sesuai | Form memblokir aksi tolak tanpa penjelasan |
| **UAT-MN-03** | Otorisasi Kompensasi Sesi Medis < H-24 | **LOLOS** | Sesuai | Sesi member kembali +1 via ADJUST_MANUAL |
| **UAT-MN-04** | Proteksi Otorisasi Penyesuaian Sesi dari Kasir | **LOLOS** | Sesuai | Kasir ditolak HTTP 403 Forbidden |
| **UAT-MN-05** | Selesaikan Kelas (Potong Sesi Murid & Kunci Honor) | **LOLOS** | Sesuai | Status COMPLETED, verifiedFeeRp terkunci |

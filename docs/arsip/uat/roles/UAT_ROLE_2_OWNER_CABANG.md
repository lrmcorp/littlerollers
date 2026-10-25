# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 2 - OWNER CABANG / MITRA STUDIO
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Owner Cabang / Mitra Studio Lokal  
**Akun Login UAT:** `owner.gg@dailydose.test`  
**Password Default:** `ridho123` atau `Owner123!`  
**Lingkup Otoritas:** Terbatas Cabang Green Garden (`DD-GG`)  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Budi Santoso (Investor & Mitra Pemilik Cabang Green Garden)
* **Karakter:** Pengusaha / pemilik modal cabang Green Garden. Budi tidak mengurus operasional meja depan setiap hari, namun setiap minggu membuka portal untuk melihat pendapatan kotor (omset), biaya operasional, biaya pengajar instruktur, dan keuntungan bersih studio. Budi tidak boleh dan tidak tertarik mengurus cabang mitra lain seperti Muara Karang atau Surabaya.
* **Tujuan Pengujian:** Memastikan dashboard performa cabang mudah dibaca tanpa istilah akuntansi yang membingungkan, metrik biaya instruktur terhitung secara transparan (membedakan antara yang sudah valid dan yang belum absen), dan proteksi isolasi data cabang terjamin 100%.

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Dashboard Performa & Finansial Cabang:** `/workspace/branch-performance`
2. **Jadwal & Kalender Kelas Cabang (Read-Only):** `/workspace/classes`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Cabang Terdaftar:** Green Garden (`DD-GG`)
* **Cabang Terlarang (Isolasi):** Muara Karang (`DD-MK`) & Surabaya (`DD-SBY`)
* **Kartu Ringkasan Finansial:**
  * Omset Cabang (`omsetRp`)
  * Biaya Instruktur (Aktual) (`totalInstructorFeeRp`)
  * Biaya Operasional Lain (`otherCostRp`)
  * Estimasi Profit Bersih (`estimatedProfitRp`)

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 2.1: Laporan Performa & Finansial Cabang Sendiri (`/workspace/branch-performance`)

#### Skenario UAT-OW-01 (Happy Path): Pemantauan 4 Pilar Finansial Cabang Green Garden
1. **Langkah Navigasi:**
   * Buka browser, kunjungi `http://localhost:32120/sign-in`.
   * Masuk menggunakan email `owner.gg@dailydose.test` dan password `ridho123`.
   * Sistem otomatis mengarahkan ke dashboard atau klik menu **`Performa Cabang`** (`/workspace/branch-performance`).
2. **Langkah Tinjauan Metrik:**
   * Amati 4 kartu ringkasan di bagian atas layar:
     1. **Omset Cabang:** Menampilkan total penerimaan rupiah dari pembelian paket member cabang Green Garden (warna hijau: *success*).
     2. **Biaya Instruktur (Aktual):** Menampilkan total honor mengajar dari seluruh kelas yang telah berstatus `COMPLETED`.
     3. **Biaya Operasional Lain:** Menampilkan total pengeluaran utilitas/operasional studio.
     4. **Estimasi Profit:** Menampilkan kalkulasi laba bersih (`Omset - Beban`).
   * Gulir ke bawah ke tabel **"Rincian Biaya Mengajar Instruktur"**:
     * Periksa daftar instruktur yang bertugas di Green Garden (Coach Sarah, Coach Clara).
     * Periksa rincian jam mengajar dan nominal honor yang terkumpul.
3. **Ekspektasi Tampilan Orang Awam:**
   * Seluruh angka tersaji rapi dalam format Rupiah (`Rp X.XXX.XXX`).
   * Data hanya mencerminkan transaksi cabang Green Garden, tanpa tercampur cabang lain.

#### Skenario UAT-OW-02 (No-Happy Path / Security Guard): Isolasi Cabang & Deteksi Honor Belum Terverifikasi
1. **Uji Kasus A — Deteksi Peringatan Honor Belum Terverifikasi (*Unverified Blocker*):**
   * Kondisi: Terdapat 1 kelas selesai di mana instruktur lupa melakukan scan QR presensi.
   * Amati kartu **`"Biaya Instruktur (Aktual)"`**:
     * Warna kartu otomatis berubah menjadi kuning/oranye (*warning tone*).
     * Teks bantuan di bawah nominal memunculkan peringatan: *"1 kelas (Rp 250.000) belum terverifikasi presensi"*.
     * Kartu Estimasi Profit memunculkan helper: *"Estimasi belum final (masih terdapat presensi yang belum terverifikasi)"*.
   * **Ekspektasi:** Owner langsung mengetahui bahwa angka pengeluaran masih berstatus sementara hingga staf studio memvalidasi kehadiran instruktur.
2. **Uji Kasus B — Isolasi Pilihan Cabang (Rule #10):**
   * Periksa dropdown pemilih cabang di bagian atas halaman.
   * **Ekspektasi:** Dropdown cabang terkunci secara permanen pada *"Green Garden"*. Tidak ada opsi untuk memilih atau melihat cabang Muara Karang, Surabaya, atau PIK 2.
3. **Uji Kasus C — Pelanggaran Otorisasi Akses API (*Direct API Attack*):**
   * Menggunakan browser developer tools atau curl, tembak endpoint API finansial cabang lain:  
     `GET /api/v1/finance/reports?branchId=00000000-0000-4000-8000-000000000003` (ID Muara Karang).
   * **Ekspektasi:** Server API menolak keras dengan respon `HTTP 403 Forbidden` / `POLICY_VIOLATION`. Tidak ada kebocoran data sensitif antar investor mitra.
4. **Uji Kasus D — Modus Hanya-Baca (*Read-Only Protection*):**
   * Buka menu jadwal kelas `/workspace/classes`.
   * **Ekspektasi:** Seluruh tombol tindakan mutasi—seperti *"Buat kelas"*, *"Edit kelas"*, *"Batalkan kelas"*, dan *"Presensi"*—disembunyikan secara otomatis. Owner hanya dapat melihat jadwal tanpa dapat mengacaukan operasional studio.

---

## 5. Lembar Kendali Hasil Pengujian Owner Cabang

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-OW-01** | Tinjauan 4 Pilar Metrik Finansial Green Garden | **LOLOS** | Sesuai | Format Rupiah rapi, navigasi bersih dan jelas |
| **UAT-OW-02A**| Indikator Warning Kartu Biaya Instruktur Unverified | **LOLOS** | Sesuai | Helper oranye muncul jelas jika ada yang lupa absen |
| **UAT-OW-02B**| Penguncian Dropdown Cabang Hanya Green Garden | **LOLOS** | Sesuai | Tidak ada kebocoran navigasi cabang mitra lain |
| **UAT-OW-02C**| Proteksi API Isolasi Multi-Cabang (Rule #10) | **LOLOS** | Sesuai | Ditolak HTTP 403 Forbidden saat coba akses MK |
| **UAT-OW-02D**| Mode Hanya-Baca (Read-Only) Jadwal Kelas | **LOLOS** | Sesuai | Tombol manipulasi operasional tersembunyi aman |

# 📘 BUKU PANDUAN PENGUJIAN UAT: PERAN 6 - FINANCE LEAD
## Platform: Daily Dose Pilates Studio Management System v2.0
**Target Peran:** Finance Lead (Pimpinan Keuangan & Pembukuan Kas)  
**Akun Login UAT:** `finance@dailydose.test`  
**Password Default:** `ridho123` atau `Finance123!`  
**Lingkup Otoritas:** Global (Seluruh Cabang Studio: Green Garden, Muara Karang, Surabaya, PIK 2)  
**Dokumen Induk:** [docs/uat/DOKUMEN_MASTER_UAT_INDEX.md](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/DOKUMEN_MASTER_UAT_INDEX.md)

---

## 1. Karakter & Profil Pengguna Awam
* **Nama Pengguna:** Daniel (Kepala Akuntansi & Keuangan)
* **Karakter:** Akuntan profesional yang cermat dan berhati-hati. Daniel bertanggung jawab mencocokkan mutasi rekening koran BCA dengan invoice masuk, mengontrol pengeluaran biaya operasional dan honor mengajar instruktur, memastikan voucher promo tidak bocor, serta mengunci buku kas bulanan (*close period*) agar data tidak dapat diubah-ubah di kemudian hari.
* **Tujuan Pengujian:** Memastikan verifikasi pembayaran bank bebas dari bukti fiktif, tutup buku bulanan terkunci aman dari manipulasi staf kasir, serta modul audit honor instruktur mampu mendeteksi sesi yang belum terverifikasi absensinya sehingga payroll tidak dibayarkan secara membabi buta (*Payroll Lock Guard*).

---

## 2. Daftar Modul & Rute Antarmuka Web
1. **Antrean Pembayaran & Rekonsiliasi Bank:** `/workspace/payments`
2. **Manajemen Voucher Promo Diskon:** `/workspace/vouchers`
3. **Pembukuan Kas & Tutup Buku Bulanan:** `/finance` & `/monthly-closes`
4. **Audit Beban & Penggajian Instruktur:** `/finance` (Tab Beban Instruktur) & `/instructors`

---

## 3. Data Uji Nyata (*Test Data Reference*)
* **Rekening Operasional Studio:** BCA Cabang Kedoya No. `123-456-7890` a.n. PT Daily Dose Pilates
* **Invoice Uji Rekonsiliasi:** Pembelian Paket Cindy Edelene (Nominal: Rp 2.500.000)
* **Voucher Uji:** `PILATESMEI` (Diskon Rp 150.000, Kuota: 50)
* **Instruktur Uji Audit:** Coach Sarah & Coach Devi
* **Periode Tutup Buku Uji:** Periode Bulan Berjalan (Tahun 2026)

---

## 4. Katalog Skenario Pengujian Klik-demi-Klik

### Modul 6.1: Antrean Verifikasi Pembayaran & Rekonsiliasi Bank (`/workspace/payments`)

#### Skenario UAT-FN-01 (Happy Path): Rekonsiliasi Bukti Transfer Bank BCA
1. **Langkah Navigasi:**
   * Buka browser, kunjungi `http://localhost:32120/sign-in`.
   * Masuk menggunakan email `finance@dailydose.test` dan password `ridho123`.
   * Klik menu **`Verifikasi Pembayaran`** (`/workspace/payments`).
2. **Langkah Tindakan:**
   * Filter antrean pembayaran dengan status `WAITING_VERIFICATION`.
   * Klik transaksi pembelian paket dari member Cindy Edelene.
   * Cocokkan nominal tagihan (Rp 2.500.000) dengan data mutasi rekening koran BCA.
   * Klik tombol **`"Buka & Periksa Bukti Sekarang"`** &rarr; Pratinjau struk BCA tampil di panel kiri.
   * Klik tombol **`"Setujui pembayaran"`**.
3. **Ekspektasi Tampilan Orang Awam:**
   * Status pembayaran berubah menjadi `PAID`.
   * Kas penerimaan studio bertambah, jurnal penerimaan kas tercatat otomatis, dan paket sesi Cindy aktif seketika.

#### Skenario UAT-FN-02 (No-Happy Path): Penolakan Bukti Transfer Fiktif dengan Templat Standar
1. **Langkah Tindakan:**
   * Temukan transaksi mencurigakan dengan bukti struk yang tidak ditemukan pada mutasi rekening koran BCA.
   * Klik tombol **`"Tolak Pembayaran"`**.
   * Pada dropdown alasan, pilih opsi `PROOF_INVALID`.
   * Klik templat pesan cepat: *"Nominal transfer atau nomor rekening tujuan pada struk tidak sesuai dengan invoice studio."*
   * Klik tombol **`"Kirim Penolakan"`**.
2. **Ekspektasi Tampilan Orang Awam:**
   * Invoice berstatus `REJECTED`.
   * Member menerima penjelasan alasan penolakan yang profesional dan sopan pada portal akunnya, serta dapat mengunggah bukti bayar perbaikan.

---

### Modul 6.2: Pengelolaan Voucher Diskon Promosi (`/workspace/vouchers`)

#### Skenario UAT-FN-03 (Happy Path): Pembuatan Voucher Diskon Kuota Terbatas
1. **Langkah Tindakan:**
   * Buka menu **`Voucher Promo`** atau buka `/workspace/vouchers`.
   * Klik tombol **`"Buat Voucher Baru"`**.
   * Isi formulir:
     * Kode Voucher: `"PILATESMEI"`.
     * Jenis Potongan: Nominal Tetap (*Fixed Amount*).
     * Nilai Potongan: `Rp 150.000`.
     * Batas Kuota Pemakaian: `50` kali.
     * Periode Berlaku: 1 Mei 2026 s/d 31 Mei 2026.
   * Klik **`"Simpan Voucher"`**.
2. **Ekspektasi Tampilan Orang Awam:**
   * Voucher berstatus aktif dan langsung dapat diinput pelanggan pada halaman checkout paket.

#### Skenario UAT-FN-04 (No-Happy Path): Proteksi Voucher Kedaluwarsa & Kuota Habis
1. **Langkah Pengujian:**
   * Pelanggan mencoba memasukkan kode voucher `PILATESMEI` pada halaman checkout setelah kuota 50 kali habis terpakai, atau setelah tanggal berlaku terlewati.
2. **Ekspektasi Tampilan Orang Awam:**
   * Form checkout menolak seketika dengan pesan ramah:  
     *"Voucher telah kedaluwarsa atau batas kuota penggunaan telah tercapai."*

---

### Modul 6.3: Eksekusi Tutup Buku Bulanan (*Monthly Period Close Lock*) (`/finance`)

#### Skenario UAT-FN-05 (Happy Path): Penguncian Pembukuan Kas Periode Bulanan
1. **Langkah Navigasi & Tindakan:**
   * Buka menu **`Finansial`** (`/finance`).
   * Periksa 5 pilar ringkasan keuangan: Kas Masuk, Beban Operasional, Beban Instruktur, Laba Bersih, dan Rekonsiliasi Bank.
   * Setelah seluruh selisih kas terekonsiliasi 100%, klik tombol **`"Tutup buku periode"`**.
   * Pada jendela konfirmasi, centang pernyataan persetujuan dan klik **`"Kunci Periode Pembukuan Ini"`**.
2. **Ekspektasi Tampilan Orang Awam:**
   * Status periode pembukuan berubah menjadi badge gembok terkunci: `LOCKED`.
   * Seluruh angka keuangan periode tersebut dibekukan secara permanen sebagai laporan resmi studio.

#### Skenario UAT-FN-06 (No-Happy Path / Period Lock Guard): Pencegahan Mutasi di Periode Terkunci
1. **Langkah Pengujian:**
   * Staf kasir atau admin mencoba membuat transaksi susulan offline atau mengedit invoice pada bulan yang statusnya telah `LOCKED`.
2. **Ekspektasi Tampilan Orang Awam:**
   * Server menolak keras dengan error `PERIOD_LOCKED` / `HTTP 400 Bad Request`.
   * Pesan muncul: *"Periode pembukuan telah ditutup dan dikunci. Perubahan hanya dapat dilakukan melalui prosedur Jurnal Koreksi resmi yang disetujui Super Owner."* Kas studio terlindung dari manipulasi data masa lalu.

---

### Modul 6.4: Audit Presensi & Rekonsiliasi Penggajian Honor Instruktur (`/finance`)

#### Skenario UAT-FN-07 (Happy Path): Audit Tab Beban Instruktur Aktual (Mode Summary & Sessions)
1. **Langkah Navigasi:**
   * Buka menu `/finance`, klik tab **`"Beban Instruktur"`**.
2. **Langkah Tinjauan Metrik:**
   * Periksa 4 kartu ringkasan:
     1. **Total Beban Instruktur Aktual:** Menampilkan total pengeluaran honor sah (`totalInstructorCostRp`).
     2. **Belum Terverifikasi Presensi:** Menampilkan `Rp 0` (0 kelas).
     3. **Total Jam Mengajar Aktual:** Menampilkan akumulasi jam (misal: `45 Jam`).
     4. **Jumlah Instruktur Aktif:** Menampilkan jumlah pengajar (misal: `5 Orang`).
   * **Uji Mode Rekapitulasi (`SUMMARY`):**
     * Klik tombol toggle *"Rekap Instruktur"*.
     * Periksa tabel rekap: Nama Instruktur, Total Jam Mengajar, Tarif Rata-rata, Total Honor, dan Status Presensi.
   * **Uji Mode Rincian Sesi (`SESSIONS`):**
     * Klik tombol toggle *"Rincian per Sesi"*.
     * Periksa rincian baris per sesi: Tanggal, Jam, Nama Kelas, Instruktur, Ruangan, Cabang, Nominal Honor, dan Metode Presensi (`QR_SCAN` / `MANUAL_FRONTDESK`).
3. **Ekspektasi Tampilan Orang Awam:**
   * Seluruh sesi bersih terverifikasi.
   * Daniel dapat menyetujui laporan beban honor untuk diproses ke transfer payroll bank tanpa kekhawatiran.

#### Skenario UAT-FN-08 (No-Happy Path / SEC-10): Blocker Penahanan Payroll Akibat Presensi Belum Lengkap
1. **Kondisi:** Terdapat 1 kelas selesai di Green Garden di mana Coach Sarah lupa melakukan scan QR dan belum diverifikasi staf.
2. **Langkah Pengujian & Deteksi Anomali:**
   * Buka tab **"Beban Instruktur"** di `/finance`.
   * Amati kartu **`"Belum Terverifikasi Presensi"`**:
     * Kartu menyala warna kuning/oranye (*warning tone*):  
       Nilai: `Rp 250.000` (keterangan: *1 kelas*).
   * Amati banner peringatan di bawah kartu:
     * Banner oranye tegas muncul di atas tabel:  
       *"1 kelas senilai Rp 250.000 belum punya presensi instruktur. Verifikasi dari detail kelas di menu Kelas sebelum honor dibayarkan."*
3. **Prosedur Penahanan Payroll (Payroll Lock Guard):**
   * Daniel **TIDAK mencairkan transfer honor Rp 250.000 tersebut** ke rekening Coach Sarah.
   * Daniel mengontak Jessica (Studio Manager) atau Rini (Front Desk Green Garden) untuk memeriksa CCTV studio / daftar hadir murid.
4. **Penyelesaian Blocker (Resolution):**
   * Staf Front Desk membuka detail kelas bersangkutan di `/classes`, memasukkan catatan resmi, dan mengklik tombol *"Verifikasi presensi instruktur"*.
   * Daniel me-refresh halaman `/finance`:
     * Kartu *"Belum Terverifikasi Presensi"* otomatis kembali menjadi **`Rp 0`**.
     * Banner peringatan oranye hilang.
     * Nominal Rp 250.000 otomatis berpindah ke `totalVerifiedFeeRp` yang sah untuk dibayarkan.

---

## 5. Lembar Kendali Hasil Pengujian Finance Lead

| ID Skenario | Judul Skenario Uji | Status Target | Hasil Uji Aktual | Catatan QA Orang Awam |
| :---: | :--- | :---: | :---: | :--- |
| **UAT-FN-01** | Rekonsiliasi Pembayaran Transfer Bank BCA | **LOLOS** | Sesuai | Kas bertambah, paket aktif otomatis |
| **UAT-FN-02** | Penolakan Struk Fiktif dengan Templat Standar | **LOLOS** | Sesuai | Member menerima alasan penolakan profesional |
| **UAT-FN-03** | Penerbitan Voucher Kuota 50x PILATESMEI | **LOLOS** | Sesuai | Diskon Rp 150.000 aktif di checkout |
| **UAT-FN-04** | Proteksi Voucher Kedaluwarsa & Kuota 0 | **LOLOS** | Sesuai | Pesan ramah mencegah kebocoran promo |
| **UAT-FN-05** | Eksekusi Tutup Buku Bulanan Periode LOCKED | **LOLOS** | Sesuai | Periode terkunci permanen |
| **UAT-FN-06** | Period Lock Guard Mutasi Susulan Ditolak | **LOLOS** | Sesuai | Mencegah kecurangan pembukuan masa lalu |
| **UAT-FN-07** | Audit Beban Instruktur (Mode Summary & Sessions) | **LOLOS** | Sesuai | Toggle rekap vs sesi bekerja presisi |
| **UAT-FN-08** | Payroll Lock Guard Penahanan Honor Unverified (SEC-10) | **LOLOS** | Sesuai | Banner peringatan oranye mencegah pembayaran buta |

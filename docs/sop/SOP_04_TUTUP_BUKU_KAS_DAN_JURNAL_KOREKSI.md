# 📄 STANDAR OPERASIONAL PROSEDUR (SOP) 04
## Tutup Buku Kas Bulanan & Prosedur Jurnal Koreksi Resmi
**Target Pengguna:** Finance Lead (Daniel) & Super Owner / Super Admin  
**Tujuan:** Mengunci laporan keuangan bulanan dari manipulasi data masa lalu (*Period Lock Guard*), serta mengatur tata cara koreksi resmi jika ditemukan selisih pasca-lock.

---

### 1. Prosedur Pra-Tutup Buku Kas Bulanan
Tutup buku bulanan dilakukan paling lambat **tanggal 3 setiap awal bulan baru** untuk mengunci periode bulan sebelumnya.
1. Buka menu **`Finansial`** (`/finance`).
2. Tinjau 5 pilar ringkasan keuangan cabang:
   * **Kas Masuk (Omset):** Pastikan seluruh invoice berstatus `PAID` telah cocok 100% dengan mutasi rekening koran BCA.
   * **Beban Instruktur (Aktual):** Pastikan kartu *"Belum Terverifikasi Presensi"* bernilai **`Rp 0`** (seluruh jam mengajar telah valid).
   * **Beban Operasional Lain:** Periksa seluruh pencatatan biaya listrik, sewa, utilitas, dan perbaikan alat.
   * **Estimasi Profit Bersih:** Pastikan kalkulasi laba bersih telah sesuai dengan rumus `Omset - Beban Instruktur - Beban Operasional`.
   * **Rekonsiliasi Bank:** Pastikan selisih kas fisik vs rekening bank adalah `Rp 0`.

---

### 2. Eksekusi Tutup Buku Bulanan (*Monthly Period Close Lock*)
1. Setelah seluruh angka diverifikasi, klik tombol **`"Tutup Buku Periode"`**.
2. Pada jendela konfirmasi yang muncul:
   * Periksa ringkasan angka akhir periode (misal: Periode `2026-10`).
   * Centang kotak persetujuan: *"Saya menyatakan seluruh mutasi kas dan honor mengajar telah diperiksa dan terekonsiliasi."*
   * Masukkan alasan penutupan: *"Tutup buku resmi periode Oktober 2026 telah diverifikasi audit kasir dan mutasi rekening koran BCA Kedoya."*
3. Klik tombol **`"Kunci Periode Pembukuan Ini"`**.
4. **Hasil (Keputusan Bisnis #6 & #8):**
   * Status periode pembukuan berubah menjadi badge gembok permanen: **`LOCKED`**.
   * Sistem otomatis men-generate kode hash kontrol audit (`controlHash`).
   * **Period Lock Guard Aktif:** Mulai detik ini, tidak ada kasir atau admin yang dapat menambah invoice susulan, mengedit transaksi, atau mencatat biaya lain pada bulan tersebut. Percobaan transaksi backdate akan ditolak keras oleh server: `HTTP 409 PERIOD_ALREADY_LOCKED`.

---

### 3. Prosedur Jurnal Koreksi Resmi Pasca-Lock (Keputusan Bisnis #8)
* **Situasi:** Periode bulan lalu telah berstatus `LOCKED`, namun audit eksternal menemukan ada struk biaya utilitas sebesar Rp 500.000 yang belum tercatat atau salah saji.
* **ATURAN MUTLAK SISTEM:**  
  Data lama pada periode `LOCKED` **DILARANG DIHAPUS ATAU DIUBAH SECARA LANGSUNG**. Koreksi harus dilakukan melalui Jurnal Koreksi resmi:
1. Buka tab **`Jurnal Koreksi`** di menu `/finance`.
2. Klik tombol **`"Ajukan Jurnal Koreksi"`**.
3. Isi formulir pengajuan:
   * Cabang: `Daily Dose Green Garden`
   * Periode Rujukan (Yang Terkunci): `2026-10`
   * Periode Penyesuaian Efektif: Bulan berjalan (misal: `2026-11`)
   * Nominal Penyesuaian: Masukkan nominal koreksi (misal: `Rp 500.000`).
   * Alasan & Dokumen Pendukung: *"Penyesuaian biaya listrik tertinggal berdasarkan invoice PLN No. 98127391."*
4. Klik **`"Kirim Pengajuan Koreksi"`**.
5. **Otorisasi Super Owner (Maker-Checker Tingkat Tinggi):**
   * Pengajuan Jurnal Koreksi membutuhkan persetujuan resmi dari **Super Owner / Super Admin**.
   * Super Owner membuka antrean Jurnal Koreksi, memeriksa bukti fisik, dan mengklik tombol **`"Setujui Jurnal Koreksi"`**.
6. **Hasil:** Laporan laba periode berjalan secara otomatis disesuaikan (*adjusted net profit*) secara transparan dengan audit trail yang akuntabel di mata hukum dan perpajakan.

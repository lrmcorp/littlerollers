# 📄 STANDAR OPERASIONAL PROSEDUR (SOP) 04
## Laporan Keuangan menurut Rentang Tanggal & Pencatatan Biaya Lain
**Target Pengguna:** Finance, Super Owner / Super Admin, dan Owner Cabang (lihat saja)
**Tujuan:** Membaca laporan keuangan untuk rentang tanggal yang dibutuhkan, serta mencatat dan memperbaiki biaya operasional lain dengan benar.

> **Tidak ada tutup buku.** Sejak 25 Okt 2026 aplikasi tidak lagi mengunci bulan dan tidak ada jurnal koreksi (v1 juga tidak punya). Angka selalu dihitung langsung dari data, sehingga perbaikan data langsung tampak di laporan.

---

### 1. Membaca laporan keuangan
1. Buka menu **Keuangan** (`/finance`), pilih **Cabang Studio**.
2. Pilih rentang: isi **Dari tanggal** dan **Sampai tanggal** (paling lama 366 hari), atau klik pintasan **Bulan ini**, **Bulan lalu**, **30 hari terakhir**, **Tahun ini**.
3. Empat laporan:
   * **Laba Bersih:** Omset − Beban Instruktur Aktual − Biaya Lain.
   * **Omset Penjualan:** paket berstatus `PAID` pada rentang tanggal.
   * **Biaya Instruktur Aktual:** honor dari kelas `COMPLETED` pada rentang tanggal. Perhatikan kartu "belum terverifikasi presensi"; kelas itu tetap dihitung.
   * **Biaya Operasional Lain:** biaya yang **tanggal pengeluarannya** ada di dalam rentang.
4. **Owner Cabang** memakai rentang yang sama di halaman *Performa Cabang*, hanya untuk cabang yang melekat pada akunnya.

### 2. Mencatat biaya lain
1. Di tab **Biaya Operasional Lain**, isi **Tanggal pengeluaran**, **Kode kategori** (huruf besar/angka/garis bawah), **Keterangan**, dan **Nominal**, lalu **Simpan biaya**.
2. Biaya masuk ke laporan sesuai tanggal pengeluarannya, bukan tanggal input.

### 3. Memperbaiki biaya yang salah
* **Ubah:** tanggal, kategori, keterangan, atau nominal dapat diubah kapan saja (tercatat di audit).
* **Hapus:** wajib menyertakan alasan 3–500 karakter; biaya yang dihapus tidak dapat dipulihkan (tercatat di audit).
* Tidak ada periode terkunci, sehingga tidak ada kode galat `PERIOD_ALREADY_LOCKED` dan tidak perlu mengajukan jurnal koreksi.

### 4. Catatan data lama
Biaya yang dibuat sebelum perubahan ini hanya punya bulan; sistem menganggapnya jatuh pada tanggal 1 bulan tersebut sampai tanggalnya diubah. Tabel tutup buku dan jurnal koreksi lama tetap ada sebagai arsip dan tidak dipakai lagi.

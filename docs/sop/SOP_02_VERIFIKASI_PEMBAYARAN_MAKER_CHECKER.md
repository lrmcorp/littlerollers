# 📄 STANDAR OPERASIONAL PROSEDUR (SOP) 02
## Verifikasi Pembayaran & Prinsip Maker-Checker Anti-Fraud
**Target Pengguna:** Studio Manager (Jessica Tan) & Finance Lead (Daniel)  
**Tujuan:** Mencegah kebocoran kas, bukti transfer palsu, dan pelanggaran pemisahan tugas (*Separation of Duties*).

---

### 1. Prinsip Dasar Maker-Checker (Keputusan Bisnis #4)
* **Maker (Pembuat):** Staf Front Desk yang melayani pelanggan dan mencatat transaksi penjualan di kasir.
* **Checker (Pemeriksa):** Studio Manager atau Finance Lead yang mencocokkan struk fisik / mutasi bank sebelum mengaktifkan paket sesi member.
* **ATURAN MUTLAK SISTEM:**  
  Staf yang mencatat transaksi **TIDAK BISA** menyetujui transaksi yang dibuatnya sendiri. Sistem akan memblokir tindakan ini dengan error `HTTP 403 SEPARATION_OF_DUTIES_VIOLATION`.

---

### 2. Prosedur Verifikasi Transfer Bank BCA
1. Buka menu **`Verifikasi Pembayaran`** (`/workspace/payments`).
2. Filter antrean transaksi dengan status **`Menunggu Verifikasi (WAITING_VERIFICATION)`**.
3. Klik baris invoice yang ingin diperiksa.
4. **Guard Anti-Blind Review (Keputusan Bisnis #5):**
   * Tombol **`"Setujui Pembayaran"`** awalnya akan berwarna abu-abu / tidak aktif (*disabled*).
   * Petugas **WAJIB** mengklik tombol **`"Buka & Periksa Bukti Sekarang"`** di panel kiri.
   * Amati gambar struk transfer bank yang diunggah oleh pelanggan:
     * Cek Nama Rekening Pengirim (harus sesuai dengan identitas member).
     * Cek Nomor Rekening Tujuan (harus BCA `123-456-7890` a.n. PT Daily Dose Pilates).
     * Cek Nominal Rupiah (harus sama persis dengan tagihan invoice hingga 3 digit terakhir).
5. Cocokkan dengan mutasi rekening koran BCA (melalui KlikBCA Bisnis).
6. Setelah struk diperiksa dan dinyatakan cocok, tombol **`"Setujui Pembayaran"`** akan menyala hijau.
7. Masukkan catatan: *"Telah dicocokkan dengan mutasi rekening koran BCA kliring jam [HH:mm]"*.
8. Klik **`"Setujui Pembayaran"`**.
9. **Hasil:** Status invoice menjadi `PAID`, paket pelanggan aktif seketika, dan jurnal penerimaan kas tercatat rapi.

---

### 3. Prosedur Penolakan Bukti Transfer Fiktif / Tidak Sah
Jika ditemukan struk mencurigakan, hasil editan, atau nominal transfer kurang:
1. Klik tombol **`"Tolak Pembayaran"`**.
2. Pada dropdown kode alasan, pilih opsi yang sesuai:
   * **`PROOF_INVALID`**: Bukti transfer editan, blur, atau nomor rekening tujuan salah.
   * **`AMOUNT_MISMATCH`**: Nominal transfer kurang dari tagihan invoice resmi studio.
   * **`DUPLICATE_PURCHASE`**: Bukti transfer sudah pernah digunakan untuk invoice lain.
3. Pilih templat pesan standar agar penjelasan yang dikirimkan ke pelanggan sopan dan profesional:  
   *"Nominal transfer atau nomor rekening tujuan pada struk tidak sesuai dengan tagihan invoice studio. Mohon periksa kembali transaksi Anda atau hubungi meja depan kami."*
4. Klik **`"Kirim Penolakan"`**.
5. **Hasil:** Status invoice menjadi `REJECTED`, paket batal aktif, dan member menerima pesan instruksi untuk mengunggah bukti bayar perbaikan.

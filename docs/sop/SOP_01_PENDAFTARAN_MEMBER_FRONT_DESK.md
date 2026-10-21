# 📄 STANDAR OPERASIONAL PROSEDUR (SOP) 01
## Pendaftaran Cepat Member Walk-In & Penjualan Berbantuan
**Target Pengguna:** Staf Admin Meja Depan (Front Desk / Kasir)  
**Tujuan:** Memandu pendaftaran pelanggan baru di meja kasir dalam waktu < 30 detik tanpa kendala teknis, serta menangani situasi duplikasi data secara ramah.

---

### 1. Alur Pendaftaran Walk-In Cepat (Target: 30 Detik)
1. Buka menu **`Pelanggan`** (`/customers`).
2. Klik tombol **`"+ Tambah Pelanggan"`** di pojok kanan atas.
3. Panel samping (*Drawer*) pendaftaran akan terbuka otomatis di sisi kanan layar.
4. Masukkan 3 informasi inti pelanggan:
   * **Nama Lengkap:** Contoh: `Amanda Manopo`
   * **Nomor WhatsApp:** Contoh: `081234567890` (sistem otomatis merapikan format ke `+6281234567890`)
   * **Alamat Email:** Contoh: `amanda@example.com`
5. *(Opsional)* Jika member datang ke cabang Green Garden, pastikan *"Cabang Pilihan"* terpilih `Daily Dose Green Garden`.
6. Klik tombol **`"Simpan Pelanggan"`**.
7. **Hasil:** Member baru langsung aktif seketika, dan kasir diarahkan ke halaman detail profil member.

---

### 2. Penanganan Situasi "Member Sudah Terdaftar" (Fix P0 & P1)
* **Kondisi:** Kasir mendaftarkan nomor WhatsApp atau email yang ternyata sudah pernah dibuat sebelumnya.
* **Tampilan Layar:**  
  Sistem akan menampilkan banner informasi berwarna kuning/oranye yang ramah pengguna:  
  > ℹ️ *"Nomor WhatsApp atau Email ini sudah terdaftar atas nama [Nama Pelanggan]. Klik di sini untuk membuka data profil member."*
* **Tindakan Kasir:**
  1. **JANGAN panik atau mencoba mendaftar ulang.**
  2. Klik link/tombol **`"Buka Profil Member"`** pada pesan tersebut.
  3. Lakukan konfirmasi identitas ke pelanggan yang berdiri di depan meja kasir:  
     *"Halo Kak Amanda, data Kakak ternyata sudah terdaftar di sistem kami. Apakah nomor WhatsApp-nya masih di 0812...?"*
  4. Langsung lanjutkan transaksi atau booking kelas tanpa perlu input ulang.

---

### 3. Penjualan Paket Berbantuan di Meja Kasir (*Assisted Sale*)
1. Pada profil pelanggan, klik tombol **`"Beli Paket via Kasir"`**.
2. Pilih paket yang diinginkan pelanggan (misal: *10 Sessions Reformer*).
3. Pilih metode pembayaran:
   * **Tunai (CASH):** Terima uang fisik, pastikan nominal pas.
   * **QRIS / EDC Bank:** Minta pelanggan scan QRIS kasir atau gesek kartu debit/kredit.
   * **Transfer Bank BCA:** Informasikan rekening resmi studio BCA `123-456-7890` a.n. PT Daily Dose Pilates.
4. Klik **`"Catat Pembayaran"`**.
5. **PENTING (Prinsip Maker-Checker):**  
   * Transaksi penjualan yang dicatat oleh kasir akan berstatus `WAITING_VERIFICATION`.
   * Berikan struk/invoice ke pelanggan dan informasikan: *"Pembayaran Kakak sedang diverifikasi oleh tim supervisor kami dan paket akan aktif dalam 1-2 menit."*
   * **Kasir dilarang menyetujui transaksi yang diinput sendiri.** Persetujuan wajib dilakukan oleh Studio Manager atau Finance Lead.

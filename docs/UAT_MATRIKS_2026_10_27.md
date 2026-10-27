# Matriks UAT Daily Dose v2 (diperbarui 27 Oktober 2026)

Menggantikan `docs/arsip/uat/roles/*` (dibuat sekitar 13 Oktober, sebelum pemangkasan modul, penyatuan nama peran,
dan perombakan keuangan). Hanya baris yang benar-benar dijalankan yang diberi hasil. Lingkungan: web `localhost:32120`,
API `localhost:32121`, database lokal `dailydose_v2_uat` (bukan produksi).

Cara membaca kolom hasil: **OK** = sesuai harapan; **Diperbaiki** = cacat ditemukan lalu diperbaiki dan diuji ulang;
**Sesuai desain** = perilaku disengaja (lihat catatan); **Belum** = belum dijalankan.

## 1. Keuangan, voucher, dan pembayaran (dijalankan sebagai Super Owner lewat API dan browser)

| ID | Skenario | Jalur | Hasil |
|---|---|---|---|
| F-04 | Laporan omset rentang sah (1–31 Okt, Green Garden) | normal | OK |
| F-05 | `from` lebih besar dari `until` | gagal | OK, 422 `VALIDATION_ERROR` |
| F-06 | Rentang lebih dari 366 hari | gagal | OK, 422 `RANGE_TOO_LARGE` |
| F-07 | Semua cabang (Super Owner) | normal | OK |
| F-08 | Tanggal rusak | gagal | OK, 422 |
| F-09 | Rentang masa depan | tepi | OK, 200 data kosong |
| F-10 | Pintasan `period=YYYY-MM` | normal | OK |
| F-11, F-12 | Ringkasan laba, honor instruktur aktual | normal | OK |
| F-13 | Catat biaya lain | normal | OK, 201 |
| F-14, F-15 | Nominal negatif, nominal pecahan | gagal | OK, 400 `INVALID_AMOUNT` |
| F-16 | Tanggal tidak mungkin (2026-13-45) | gagal | OK, 422 |
| F-17 | Keterangan kosong | gagal | **Diperbaiki** (sebelumnya 201; kini 422) |
| F-18 | Cabang tidak ada | gagal | **Diperbaiki** (sebelumnya 500; kini 404) |
| F-19 | Ubah biaya | normal | OK |
| F-20, F-21, F-22 | Hapus tanpa alasan / dengan alasan / dua kali | gagal+normal | OK (422, 200, 404) |
| F-24 | Ekspor CSV | normal | OK |
| V-01, V-07 | Buat dan aktifkan voucher | normal | OK |
| V-02 | Kode voucher ganda | gagal | OK, 409 |
| V-03, V-04 | Diskon persen di atas 100, potongan negatif / pecahan, kuota 0 | gagal | **Diperbaiki** (sebelumnya 201; kini 422, juga saat ubah) |
| V-05 | "Berakhir sebelum mulai" | gagal | Tidak berlaku: model voucher tidak menyimpan tanggal mulai |
| V-08 | Member memakai voucher aktif (preview) | normal | OK, diskon Rp 50.000 |
| V-09, V-12, V-18 | Kode tidak ada, voucher dijeda, voucher kedaluwarsa | gagal | OK (`VOUCHER_INVALID`, `VOUCHER_INACTIVE`, `VOUCHER_EXPIRED`) |
| V-10, V-14 | Jeda / arsip tanpa alasan | gagal | Sesuai desain (alasan opsional, keputusan gelombang 1) |
| V-13 | Aktifkan dengan versi basi | gagal | Sesuai desain (versi tidak ditegakkan, keputusan gelombang 1) |
| V-19, V-20 | Member membuka / membuat voucher staf | akses | OK, 403 |
| P-01 sampai P-04 | Tolak tanpa alasan, kode alasan ngawur, "lainnya" tanpa catatan, catatan lebih dari 500 karakter | gagal | OK (422/400) |
| P-05 | Tolak tanpa kunci idempotensi | gagal | OK, 400 |
| P-06 | Setujui id tidak ada | gagal | OK, 404 |
| P-07 sampai P-09 | Member menyetujui, menolak, membuka antrean pembayaran | akses | OK, 403 |
| P-10, P-11 | Tolak sah, kirim ulang dengan kunci sama | normal | OK (201, replay) |
| P-12, P-13 | Tolak lagi / setujui yang sudah ditolak | gagal | OK, 409 `PURCHASE_ALREADY_DECIDED` |
| T-21 | Tinjau bukti: pratinjau privat, tombol setuju menunggu gambar, pembandingan nominal, hitung mundur 10 detik, batalkan, PAID dan paket aktif | normal+gagal | OK (browser) |
| T-22 | Identitas cepat: S/Z/L, hitung mundur, batalkan | normal+gagal | OK (browser) |

## 2. Member dan alur handover (dijalankan di browser 375 x 812 dengan akun uji)

Rincian dan temuan ada di `paket-handover-daily-dose/03-BACKLOG-TIKET.md`. Ringkas:

| Area | Cakupan | Hasil |
|---|---|---|
| Daftar akun (T-09) | Format WhatsApp salah ditolak, tanpa unggah KTP, tujuan `returnTo` terbawa | OK, 2 cacat diperbaiki |
| Verifikasi (T-01) | Kirim dokumen, disetujui staf, kembali ke tujuan | OK, cacat formulir terhapus diperbaiki |
| Jadwal (T-04) | Ukuran, ganti tanggal, kartu penuh, banner verifikasi | OK, banner diperbaiki |
| Booking (T-05) | Lembar, klik ganda, booking ganda, kelas penuh, dua orang berebut kursi terakhir | OK, 1 cacat pesan galat diperbaiki |
| Staf jadwal (T-18, T-20) | Salin minggu, jadwal rutin, isi-susulan kehadiran, batas 2 jam | OK |

## 3. Pembatasan akses menurut peran (dijalankan lewat API dengan login tiap peran)

Akun uji disetel ke password di `docs/AKUN_TESTING_RESMI.md` lewat rute reset Super Owner (`direct-password-reset`, tercatat di audit):
`finance@`, `finance.mk@`, `owner.gg@`, `owner.sby@`, `manager.gg@`, `admin.gg@`, `coach.sarah@` (semua `@dailydose.test`).
Cara uji: 403 berarti ditolak; kode lain (200, 400, 404, 422) berarti lolos otorisasi. Probe tulis memakai isi yang sengaja tidak valid
sehingga tidak ada data yang berubah. Acuan harapan: matriks di `docs/FITUR_MODUL_DAN_FLOW_PER_ROLE.md`.

| Probe | SO | Owner GG | Owner SBY | Manager | Finance | Admin | Instruktur |
|---|---|---|---|---|---|---|---|
| Daftar pengguna | 200 | 200 (hanya staf, R-2) | 200 (hanya staf) | 200 (hanya staf) | 403 | 200 (hanya staf) | 403 |
| Reset password langsung | 422 | 403 | 403 | 403 | 403 | 403 | 403 |
| Antrean verifikasi KTP | 200 | 403 | 403 | 403 | 403 | 403 | 403 |
| Baca timetable GG | 200 | 200 | 403 | 200 | 403 | 200 | 200 |
| Buat kelas | 400 | 403 | 403 | 400 | 403 | 400 | 403 |
| Antrean pembayaran | 200 | 403 | 403 | 200 | 200 | 200 | 403 |
| Setujui pembayaran | 404 | 403 | 403 | 404 | 404 | 403 (diperbaiki, R-1) | 403 |
| Laporan omset GG / SBY | 200 / 200 | 200 / 403 | 403 / 200 | 403 / 403 | 200 / 200 | 403 / 403 | 403 / 403 |
| Laporan honor instruktur GG | 200 | 200 | 403 | 403 | 200 | 403 | 403 |
| Catat biaya lain | 400 | 403 | 403 | 403 | 400 | 403 | 403 |
| Daftar voucher / buat voucher | 200 / 400 | 200 / 403 | 200 / 403 | 403 / 403 | 200 / 400 | 403 / 403 | 403 / 403 |
| Daftar booking staf GG | 200 | 200 | 404 | 200 | 403 | 200 | 200 |
| Daftar pelanggan | 200 | 403 | 403 | 200 | 403 | 200 | 403 |
| Picu otomasi kuota H-24 | 201 | 403 | 403 | **403** | 403 | **403** | 403 |
| Manajemen notifikasi (baca) | 200 | 403 | 403 | 403 | 403 | 403 | 403 |
| Konten publik (baca / tulis) | 200 / 422 | 403 / 403 | 403 / 403 | 403 / 403 | 403 / 403 | 403 / 403 | 403 / 403 |
| Ketersediaan mengajar saya | 403 | 403 | 403 | 403 | 403 | 403 | 200 |

Isolasi antar cabang berjalan: Owner Green Garden ditolak untuk laporan Surabaya, Owner Surabaya ditolak untuk timetable dan booking Green Garden.
Probe verifikasi 422 (tanpa 403) pada baris Super Owner berarti lolos otorisasi lalu ditolak validasi.

### Temuan dan penyelesaiannya

| ID | Temuan | Status |
|---|---|---|
| R-1 | Admin (front desk) dan Manager bisa memutus pembayaran lewat kapabilitas lama `purchase:decide`; Admin juga bisa mencatat penjualan (`purchase:record`). | **Diperbaiki 27 Okt**: `purchase:decide` dicabut dari ADMIN. Manager, Finance, dan Super Owner tetap. Diuji langsung: Admin 403, lainnya lolos. |
| R-2 | Daftar pengguna menampilkan pelanggan dan akun Super Owner (dengan email) kepada Admin, Manager, dan Owner cabang. | **Diperbaiki 27 Okt**: tanpa `user:admin` hanya staf cabang (Owner, Manager, Finance, Admin, Instruktur) yang tampil di daftar dan di hitungan ringkasan, dan `audience=CUSTOMER` kosong. Pemeriksaan tambahan menemukan detail akun (`GET /users/:id`) untuk Super Owner dan pelanggan juga terbuka; kini 404 untuk peran cabang. |
| R-3 | Picu manual otomasi kuota H-24 hanya untuk Super Owner, sedangkan matriks menyebut Manager dan Admin juga boleh. | Menunggu keputusan: beri kapabilitas, atau ubah matriks |
| R-4 | Urutan pemeriksaan penulisan konten publik: jenis konten divalidasi sebelum izin (tidak ada data yang berubah). | Belum, kecil |

## 3b. Sapuan UI per peran (browser desktop, login tiap peran; 19 halaman staf untuk Manager, Admin, Owner)

Yang dicatat per halaman: apakah halaman dibuka atau dialihkan ke Ringkasan, panggilan API yang gagal (4xx/5xx) saat memuat, dan tombol aksi yang tampil.

| Peran | Hasil |
|---|---|
| **Manager** | Terbuka: Ringkasan, Timetable (dengan "Buat kelas"), Booking (booking manual, QR), Antrean Pembayaran (dengan "Setujui"), Pengingat WhatsApp, Pelanggan, Sesi Pelanggan, Instruktur, Pengguna, Scan QR. Dialihkan: Ketersediaan Mengajar, Voucher, Performa Cabang, Verifikasi KTP, Master, Keuangan, Operasi, Audit, Konten Publik. Tanpa panggilan API gagal. Sesuai API. |
| **Admin** | Beranda "Hari ini" (T-20). Terbuka: Timetable, Booking, Antrean Pembayaran (hanya "Catat penjualan", **tanpa "Setujui"**, efek R-1), Pengingat (tanpa tombol jalankan), Pelanggan, Sesi Pelanggan, Instruktur, Pengguna (hanya staf), Scan QR. Dialihkan: Ketersediaan, Voucher, Performa Cabang, Verifikasi KTP, Master, Keuangan, Operasi, Audit, Konten Publik. Tanpa panggilan API gagal. |
| **Owner GG** | Terbuka: Ringkasan, Timetable (tombol "Buat kelas" nonaktif dengan keterangan), Booking (tanpa aksi), Pengingat, Voucher (baca saja), Performa Cabang, Sesi Pelanggan, Instruktur, Pengguna, Audit (hanya entri cabangnya). Dialihkan: Pembayaran, Pelanggan, Verifikasi KTP, Master, Keuangan, Operasi, Konten Publik, Scan QR, Ketersediaan. |
| **Instruktur** | Terbuka: beranda "Halo, Sarah", Jadwal kelas saya, Ketersediaan mengajar, Scan QR. Dialihkan ke beranda: Booking, Pembayaran, Pelanggan, Keuangan. |

Temuan UI (kecil, diperbaiki sebagian pada 27 Okt):

| ID | Temuan | Status |
|---|---|---|
| U-1 | Instruktur: setiap halaman memicu 403 pada `/dashboard/overview` (jumlah antrean di shell dan beranda), dan beranda juga pada `/class-types`, `/assignments`, `/branches/:id/studios`. | **Diperbaiki**: peringatan minggu kosong dan beranda instruktur hanya meminta jadwal (`slotsOnly`), shell dan beranda tidak meminta ringkasan antrean untuk instruktur. Beranda Instruktur dan Owner tanpa 403. |
| U-2 | Owner dan Instruktur di halaman Timetable: 403 pada tipe kelas, penugasan, dan studio (dipakai form buat kelas yang tidak boleh mereka pakai). | Terbuka (kecil): minta daftar itu hanya bila punya `class-slot:manage` |
| U-3 | Keterangan tombol nonaktif "Buat kelas" memuat kode teknis `class-slot:manage`. | Terbuka (kecil, kamus istilah T-13) |
| U-4 | Admin dan Manager dapat membuka halaman Pengguna Internal (hanya staf cabang, setelah R-2); matriks lama menyebut Admin tidak boleh. | Sesuai kode (`user:read` untuk form jadwal); ubah dokumen atau cabut |
| U-5 | Owner memegang `audit:read` dan `finance:read`; halaman Audit terbuka dan terbatas cabang (diverifikasi API: GG hanya entri GG, SBY hanya entri SBY). | OK |

## 4. Belum dijalankan

| Area | Alasan atau catatan |
|---|---|
| Alur kerja sungguhan per peran di UI (klik demi klik tindakan, bukan hanya akses halaman) | Sapuan halaman selesai (3b); alur tindakan per peran belum |
| Peran Instruktur: mengajukan ketersediaan, QR presensi, daftar hadir hari ini | Halaman terbuka (3b); tindakannya belum dijalankan |
| Kasus dukungan, penyesuaian sesi, reschedule | Belum |
| Konten publik, manajemen notifikasi, operasi (evaluasi kuota H-24), audit, kesehatan sistem | Belum |
| Presensi kiosk (PIN cabang, QR bergantian) dan pemindaian QR instruktur | Butuh perangkat |
| Pesanan kedaluwarsa 24 jam, "minta perbaikan bukti" dari sisi member | Belum |
| Enam suite integrasi API yang di-skip, spesifikasi e2e Playwright | Perlu keputusan: hidupkan atau hapus |

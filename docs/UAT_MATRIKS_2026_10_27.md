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

## 3. Belum dijalankan

| Area | Alasan atau catatan |
|---|---|
| Pembatasan akses menurut peran (Owner, Manager, Finance, Admin, Instruktur) | Butuh login masing-masing. Password yang tercatat di `docs/AKUN_TESTING_RESMI.md` untuk Finance ditolak API (401); akun lain belum dicoba. Perlu password yang benar atau reset lewat alur resmi aplikasi. |
| Peran Instruktur: ketersediaan, QR presensi, hari ini | Menunggu akun instruktur |
| Kasus dukungan, penyesuaian sesi, reschedule | Belum |
| Konten publik, manajemen notifikasi, operasi (evaluasi kuota H-24), audit, kesehatan sistem | Belum |
| Presensi kiosk (PIN cabang, QR bergantian) dan pemindaian QR instruktur | Butuh perangkat |
| Pesanan kedaluwarsa 24 jam, "minta perbaikan bukti" dari sisi member | Belum |
| Enam suite integrasi API yang di-skip, spesifikasi e2e Playwright | Perlu keputusan: hidupkan atau hapus |

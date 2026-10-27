# Paket handover Daily Dose Pilates v2

Disusun 26 Oktober 2026 dari pengujian langsung pada v2.dailydosepilates.com
sepanjang 6 sampai 26 Oktober 2026.

---

## Isi paket

| Berkas | Untuk siapa | Isi |
|---|---|---|
| `00-README-PAKET-HANDOVER.md` | Anda | Halaman ini. Urutan baca dan keputusan yang menunggu |
| `01-PROMPT-UNTUK-LLM-DEVELOPER.md` | Developer | Prompt siap tempel ke Claude Code, Cursor, atau LLM lain |
| `02-SPEC-DESAIN.md` | Developer dan desainer | Token, skala teks, aturan komponen, spesifikasi 12 layar member dan 6 layar admin |
| `03-BACKLOG-TIKET.md` | Developer dan manajer proyek | 22 tiket dengan kriteria selesai, termasuk 6 tiket panel admin |
| `04-LAPORAN-UAT-BUG.md` | Developer dan tim operasional | 30 temuan dan 3 hal yang perlu direview |
| `mockup-png-daily-dose.zip` | Developer dan desainer | 18 gambar mockup, resolusi 2x, bisa dibuka tanpa akses kanvas |
| Kanvas desain (artifact) | Semua | Mockup 18 artboard, bisa diukur dan dikomentari |

Gambar PNG dan kanvas berisi hal yang sama. PNG dipakai kalau developer
belum diberi akses kanvas, atau untuk ditempel ke tiket. Kanvas dipakai
kalau perlu mengukur jarak, menyalin warna, atau meninggalkan komentar.

PNG dirender langsung dari berkas sumber kanvas pada ukuran bingkai
aslinya, jadi isinya persis sama, bukan gambar yang dibuat ulang.

Dua dokumen menjawab pertanyaan berbeda. `04-LAPORAN-UAT-BUG.md` menjawab
"apa yang tidak berjalan sekarang". `02-SPEC-DESAIN.md` menjawab "seperti
apa seharusnya". Keduanya diperlukan.

---

## Urutan pengerjaan yang disarankan

**Langkah 1, sebelum apa pun.** Isi jadwal kelas. Sistem tidak punya kelas
terjadwal sejak 9 Oktober di kelima cabang, jadi customer tidak bisa
booking apa pun. Lima tiket juga tidak bisa diuji selama ini belum beres.

**Langkah 2.** Serahkan `04-LAPORAN-UAT-BUG.md` ke developer. Bagian
Kritis berisi sembilan hal, tiga di antaranya menyangkut uang: kelas
terisi melebihi kapasitas, sesi terpakai sebelum pembayaran disetujui, dan
895 pembayaran yang belum tercocokkan.

**Langkah 3.** Baru mulai revisi UX dengan `01-PROMPT`, `02-SPEC`, dan
`03-BACKLOG`. Kerjakan tiket urut nomor, satu per satu.

**Catatan urutan untuk panel admin.** Gelombang 5 berisi enam tiket panel
admin, T-17 sampai T-22. T-17 mengganti paletnya dan harus dikerjakan lebih
dulu, karena lima tiket lain memakai token hasil tiket itu. T-18 adalah
tiket paling penting dari sisi operasional di seluruh backlog: jadwal kosong
sejak 9 Oktober terjadi karena kelas harus dibuat satu per satu.

Alasan urutannya begitu: memperbaiki tampilan di atas data yang salah
hanya membuat kesalahan itu lebih mudah dipercaya.

---

## Tiga langkah sebelum diserahkan

1. **Buka `01-PROMPT`**, isi bagian `[isi: ...]` dengan stack sebenarnya:
   framework, cara styling, state management, library form dan tanggal.
2. **Bagikan kanvas desain** lewat menu Share pada halaman artifact-nya.
   Sekarang masih privat, developer belum bisa membuka.
3. **Tempel tautan kanvas** ke bagian LAMPIRAN nomor 3 di dalam prompt.

Saran cara pakai: minta developer mengerjakan satu tiket per percakapan
LLM. Laporannya jadi pendek dan bisa diperiksa per kriteria, bukan satu
laporan panjang yang sulit diverifikasi.

---

## Keputusan yang menunggu Anda

Tidak bisa diputuskan developer. Beberapa tiket tertahan sampai ini
dijawab.

| Keputusan | Menahan | Pertanyaannya |
|---|---|---|
| Keamanan layar kiosk | T-12, B-08 | Halaman kiosk terbuka publik tanpa login, ditautkan di footer, URL mudah ditebak, berisi QR presensi dan alamat studio. Lepas tautan, beri kode akses, atau pasangkan ke perangkat? |
| Verifikasi KTP member lama | T-02, R-03 | Member yang sudah bertahun-tahun berlatih tetap wajib unggah KTP, atau cukup diverifikasi front desk saat datang? |
| Cakupan cabang superadmin | R-01 | Halaman admin kini berawal pada satu cabang, bukan semua cabang. Disengaja atau perlu dikembalikan? |
| Rekening pembayaran | T-07 | Nama bank, nomor rekening, dan nama pemilik rekening untuk halaman bayar |
| Login kode WhatsApp | T-09 | Mau diadakan? Kalau ya, penyedia pengirimannya apa? |
| Penyedia WhatsApp | B-06 | Pengingat dan pembatalan otomatis sekarang hanya dicatat, tidak terkirim |
| Teks hukum | T-09 | Syarat dan Ketentuan serta Kebijakan Privasi versi final |
| Daftar tunggu kelas penuh | T-04 | Fiturnya ada atau tidak? |
| Email pelanggan migrasi | R-02 | Pola email terlihat dibentuk dari nama depan. Perlu dicek ke sumber data migrasi |

---

## Yang tidak tercakup paket ini

- **Tampilan desktop dan tablet untuk sisi member.** Layar member dirancang
  pada 375 x 812 px. Panel admin dirancang pada 1280 px, dan tampilan
  ponselnya untuk front desk belum dirancang.
- **Halaman depan publik.** Beranda sudah dirombak tim Anda pada 26 Oktober
  dan tidak dirancang ulang di sini, selain keputusan mengalihkan member
  yang sudah login.
- **Alur yang belum bisa diuji.** Pembelian paket, booking, reschedule, QR
  check-in, presensi instruktur, dan honor. Semuanya butuh jadwal kelas
  yang terisi dan akun uji yang sudah terverifikasi.
- **Pesan kesalahan pada form.** Semua pengujian bersifat baca saja, tidak
  ada aksi simpan atau kirim yang dijalankan.
- **Keputusan bisnis.** Struktur harga, hubungan antar 11 paket, dan
  kebijakan pembatalan tidak dinilai di sini.

---

## Catatan kejujuran data

Pada mockup, nama orang ditulis sebagai `[placeholder]`. Data member asli
tidak dikarang, dan nama pelanggan sungguhan tidak ditampilkan karena itu
soal privasi.

Yang memakai data nyata dari sistem: nama studio, tipe kelas, nama
instruktur, jam kelas, kapasitas, nama paket, dan harga.

QR pada mockup adalah pola placeholder, bukan kode yang bisa dipindai.

Dua temuan berstatus dugaan dan ditandai jelas di laporan: B-04 tentang
pencocokan pembayaran otomatis, dan R-02 tentang email hasil migrasi.
Keduanya perlu diverifikasi developer ke sumber datanya.

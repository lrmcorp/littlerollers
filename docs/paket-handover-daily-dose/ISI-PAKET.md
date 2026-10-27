# Isi paket handover Daily Dose Pilates v2

Disusun 26 Oktober 2026. Mulai dari `00-README-PAKET-HANDOVER.md`.

## Dokumen

| Berkas | Untuk siapa | Isi |
|---|---|---|
| `00-README-PAKET-HANDOVER.md` | Reyner | Urutan baca, urutan pengerjaan, dan 9 keputusan yang menunggu |
| `01-PROMPT-UNTUK-LLM-DEVELOPER.md` | Developer | Prompt siap tempel ke Claude Code, Cursor, atau LLM lain. Masih ada bagian `[isi: ...]` yang perlu diisi stack sebenarnya |
| `02-SPEC-DESAIN.md` | Developer dan desainer | Token warna, skala teks, aturan komponen, spesifikasi 12 layar member dan 6 layar admin. Bagian 10 khusus panel admin |
| `03-BACKLOG-TIKET.md` | Developer dan manajer proyek | 22 tiket dalam 5 gelombang, masing masing dengan kriteria selesai |
| `04-LAPORAN-UAT-BUG.md` | Developer dan tim operasional | 30 temuan dari pengujian langsung, 3 hal yang perlu direview, 16 yang sudah diperbaiki |

## Gambar

`mockup-png/` berisi 18 gambar mockup resolusi 2x, bisa dibuka tanpa akses
kanvas dan bisa langsung ditempel ke tiket.

| Nomor | Layar |
|---|---|
| 1 sampai 5 | Alur member dan instruktur |
| 6 dan 7 | Status kosong atau error, dan fondasi visual |
| 8 sampai 12 | Lima layar paling boros langkah |
| 13 | Aturan warna panel admin |
| 14 sampai 18 | Panel admin: front desk, timetable, finance, verifikasi, owner |

## Berkas sumber

`mockup-sumber/` berisi berkas asli setiap artboard dalam format `.dc.html`,
ditambah `canvas.json` sebagai indeksnya. Dipakai kalau developer ingin
menyalin nilai warna, ukuran, atau jarak persis dari sumbernya, bukan
mengukur dari gambar.

Gambar PNG dirender langsung dari berkas sumber ini pada ukuran bingkai
aslinya, jadi isinya persis sama.

## Tiga langkah sebelum diserahkan ke developer

1. Buka `01-PROMPT-UNTUK-LLM-DEVELOPER.md`, isi bagian `[isi: ...]` dengan
   stack sebenarnya: framework, cara styling, state management, library form
   dan tanggal.
2. Bagikan kanvas desain lewat menu Share pada halaman artifact-nya. Sekarang
   masih privat, developer belum bisa membuka.
3. Tempel tautan kanvas ke bagian LAMPIRAN nomor 3 di dalam prompt.

## Urutan pengerjaan

Isi jadwal kelas dulu sebelum apa pun. Sistem belum punya kelas terjadwal
sejak 9 Oktober 2026 di kelima cabang, jadi pelanggan tidak bisa memesan apa
pun, dan lima tiket tidak bisa diuji selama itu belum beres.

Lalu serahkan `04-LAPORAN-UAT-BUG.md`, baru mulai revisi UX dengan
`01-PROMPT`, `02-SPEC`, dan `03-BACKLOG`.

Untuk panel admin, kerjakan T-17 lebih dulu karena mengganti paletnya, dan
lima tiket lain memakai token hasil tiket itu.

## Catatan kejujuran data

Nama orang ditulis sebagai `[placeholder]`. Data member asli tidak dikarang,
dan nama pelanggan sungguhan tidak ditampilkan karena soal privasi.

Yang memakai data nyata dari sistem: nama studio, tipe kelas, nama
instruktur, jam kelas, kapasitas, nama paket, harga, dan seluruh angka
temuan di laporan UAT.

QR pada mockup adalah pola placeholder, bukan kode yang bisa dipindai. Area
foto identitas digambar sebagai blok abu berlabel, bukan contoh kartu
identitas.

Dua temuan berstatus dugaan dan ditandai jelas di laporan: B-04 tentang
pencocokan pembayaran otomatis, dan R-02 tentang email hasil migrasi.
Keduanya perlu diverifikasi developer ke sumber datanya.

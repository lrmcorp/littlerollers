# Spesifikasi desain Daily Dose Pilates v2

Dokumen ini adalah sumber kebenaran untuk pengerjaan antarmuka mobile.
Disusun 26 Oktober 2026 dari pengujian langsung pada v2.dailydosepilates.com
di layar 375 x 812 px.

Mockup visual: 12 artboard di kanvas desain yang menyertai dokumen ini.

---

## 1. Dasar keputusan

Pengguna sasaran:

- Member usia 45 sampai 55 tahun. Mental model mereka WhatsApp, Gojek,
  Tokopedia. Sering lupa password, mata mulai berkurang.
- Instruktur yang butuh aksi cepat di sela kelas.

Target yang dipakai untuk menilai setiap layar:

- Member dengan paket aktif: buka aplikasi sampai kelas terbooking,
  maksimal 3 tap.
- Instruktur: maksimal 1 sampai 3 tap per tugas.

Dial desain: ENERGY 1 (tenang), RHYTHM 2 (konsisten dengan sedikit
variasi), MOTION 1 (hanya state hover dan tekan, tanpa animasi berulang).

---

## 2. Token visual

Palet dan font diambil dari token yang sudah ada di situs. Yang berubah
hanya warna garis tepi, skala teks, dan tinggi target sentuh.

### Warna

| Token | Nilai | Pakai untuk |
|---|---|---|
| brand | `#396552` | Tombol utama, tautan, tab aktif |
| brand-strong | `#24483a` | State tekan, latar gelap, outline fokus |
| brand-soft | `#e8f0ec` | Kotak informasi paket |
| canvas | `#f3f6f4` | Latar halaman |
| surface | `#ffffff` | Kartu, header, menu bawah |
| surface-muted | `#f8faf9` | Kartu nonaktif, kerangka memuat |
| text | `#17231e` | Teks utama |
| text-muted | `#607069` | Teks pendukung, label |
| border | `#768b84` | Batas komponen interaktif |
| divider | `#d5dfda` | Garis pemisah dekoratif saja |
| success | `#246144` / soft `#e6f4ec` | Sisa slot, status hadir |
| warning | `#8a5b17` / soft `#fff4da` | Kelas penuh, menunggu pemeriksaan |
| danger | `#9b3d38` / soft `#faeceb` | Error, pembatalan, penolakan |
| info | `#27607c` / soft `#e8f3f8` | Banner verifikasi |

### Kontras yang sudah diukur

Semua angka di bawah dihitung dengan rumus WCAG 2.x, bukan perkiraan.

Lolos:

| Pasangan | Rasio |
|---|---|
| `#17231e` pada `#f3f6f4` | 14.90:1 |
| `#17231e` pada `#ffffff` | 16.21:1 |
| `#607069` pada `#ffffff` | 5.23:1 |
| `#607069` pada `#f3f6f4` | 4.80:1 |
| putih pada `#396552` | 6.65:1 |
| putih pada `#24483a` | 10.18:1 |
| `#396552` pada `#ffffff` | 6.65:1 |
| `#8a5b17` pada `#fff4da` | 5.35:1 |
| `#9b3d38` pada `#faeceb` | 5.86:1 |
| `#246144` pada `#e6f4ec` | 6.46:1 |

Gagal, harus diganti:

| Pasangan | Rasio | Syarat |
|---|---|---|
| `#d5dfda` pada `#ffffff` | 1.36:1 | 3:1 untuk batas komponen |
| `#aabbb3` pada `#ffffff` | 2.01:1 | 3:1 untuk batas komponen |

Pengganti: `#768b84`, terukur 3.62:1 pada putih dan 3.33:1 pada kanvas.

Aturan: `#768b84` untuk setiap batas yang membungkus elemen interaktif
(kartu yang bisa ditap, input, tombol kedua, pil tanggal). `#d5dfda` hanya
untuk garis pemisah yang tidak membawa informasi.

### Teks

Mobile first, dasar lebar 375 px, gutter 20 px.

| Peran | Ukuran / tinggi baris | Font |
|---|---|---|
| Judul halaman | 28 / 34 | Poppins 600 |
| Judul bagian | 20 / 26 | Poppins 600 |
| Nama kelas di kartu | 22 / 28 | Poppins 600 |
| Teks utama | 17 / 26 | DM Sans 400 |
| Teks pendukung | 15 / 22 | DM Sans 400 |
| Label kecil, huruf besar | 13 / 18, tracking 0.06em | DM Sans 700 |
| Kutipan aksen | 18 italic / 28 | Georgia |

Tidak ada teks di bawah 13 px. Ukuran 13 px hanya untuk label yang isinya
sudah ada di tempat lain. Teks tidak pernah lebih terang dari `#607069`.

### Jarak

Skala 4 px. Nilai yang dipakai: 8, 12, 16, 20, 24, 32, 48.

- Jarak antar kartu: 12
- Padding dalam kartu: 20
- Jarak antar bagian: 32
- Ruang di atas menu bawah: 24 ditambah tinggi bar

### Tombol

| Jenis | Tinggi | Gaya |
|---|---|---|
| Utama | 52 | Latar `#396552`, teks putih, radius 12 |
| Kedua | 48 | Latar putih, batas 1.5px `#768b84`, teks `#396552` |
| Teks | 44 minimal | Tanpa latar, bergaris bawah |
| Nonaktif | 48 | Latar `#f8faf9`, teks `#607069`, batas `#768b84` |

Radius 12, bukan bentuk pil, supaya tombol, chip, dan badge tetap bisa
dibedakan. Jarak antar tombol minimal 12 px. Tombol nonaktif selalu
disertai satu baris alasan di bawahnya, tidak pernah dimatikan diam-diam.

Fokus keyboard: outline 3 px `#24483a` dengan offset 2 px, terlihat di
semua latar.

---

## 3. Navigasi

### Satu sistem, bukan dua

Masalah sekarang: member yang sudah login lalu membuka `/` melihat halaman
yang sama persis dengan tamu, tanpa menu bawah dan tanpa sapaan. Tombol
"Beranda" di menu bawah justru membuka `/account`.

Perbaikan: member yang login membuka `/` dialihkan ke beranda member, dan
menu bawah tampil di semua halaman member.

### Menu bawah member, lima item

`Beranda` | `Jadwal` | `Booking` | `Paket` | `Akun`

Tinggi bar 68 px. Setiap item punya ikon dan label 12 px yang selalu
terlihat. Item aktif ditandai warna `#396552` ditambah garis atas 3 px,
bukan warna saja.

`Pesanan` dipindah ke dalam Akun karena jarang dibuka. Tetapi pesanan yang
masih menunggu bukti transfer selalu muncul sebagai kartu di Beranda
supaya tidak tersembunyi.

### Menu bawah instruktur, empat item

`Hari Ini` | `Jadwal Saya` | `Scan` | `Akun`

### Isi menu Akun member

Profil saya, Verifikasi identitas, Keamanan dan password, Pesanan saya,
Studio utama, Hubungi studio, Keluar.

### Setiap halaman member

Punya judul halaman dan tombol kembali 44 x 44 px di kiri atas. Judul tab
browser mengikuti nama halaman, contoh "Booking Saya - Daily Dose Pilates",
bukan "Move with intention" untuk semua halaman.

---

## 4. Alur utama

### Booking member, 3 tap

Prasyarat: sudah login, punya paket aktif, sudah terverifikasi.

1. **Tap 1** di Beranda: tap kartu sesi di daftar "Kelas minggu ini di
   [nama studio]". Daftar sudah terfilter studio utama member, jadi tidak
   ada layar pilih studio.
2. **Tap 2**: bottom sheet konfirmasi terbuka. Berisi nama kelas, hari dan
   tanggal lengkap dengan tahun, jam mulai dan selesai, nama instruktur,
   nama studio, sisa slot, dan paket yang akan dipakai beserta sisa sesi
   setelah booking.
3. **Tap 3**: tap `Konfirmasi booking sekarang`. Sheet berubah jadi status
   berhasil di tempat yang sama, dengan tombol `Lihat QR Pass` dan `Tutup`.
   Tidak ada pindah halaman.

Jalur dari tab Jadwal juga 3 tap: tap `Jadwal`, tap kartu sesi, tap
konfirmasi.

Halaman perantara "Pilih jadwal kelas terlebih dahulu" dihapus seluruhnya.

### Instruktur, tiga aksi cepat

| Tugas | Jumlah tap | Isi |
|---|---|---|
| Kelas saya hari ini | 1 (halaman default setelah login) | Daftar sesi hari ini urut jam, dengan jumlah peserta terdaftar dibanding kapasitas |
| Lihat peserta satu sesi | 2 | Daftar nama peserta dengan status hadir atau belum, tanpa data pembayaran |
| Catat kehadiran sendiri | 2 | Buka Scan, arahkan kamera ke QR di tablet studio, shutter otomatis |

Tombol `Buat kelas` dan teks administrasi tidak ditampilkan untuk peran
instruktur. Pemilih cabang hanya memuat cabang penugasannya. Kalau hanya
satu cabang, pemilih disembunyikan.

---

## 5. Spesifikasi layar

### 5.1 Beranda member

Urutan dari atas:

1. Header 72 px, latar putih, garis bawah 1 px `#768b84`. Berisi
   "Halo, [nama depan]" 20 px Poppins 600, lalu baris 15 px
   "Studio utama: [nama studio penuh]" dengan tautan `Ganti studio`
   (area sentuh 44 px). Nama studio tidak dipotong. Kalau panjang, turun
   ke dua baris.
2. Kartu verifikasi, hanya kalau belum terverifikasi. Lihat 5.5.
3. Kartu pesanan menunggu pembayaran, hanya kalau ada. Latar `#fff4da`,
   teks `#8a5b17`, tombol `Unggah bukti transfer`.
4. Kartu booking terdekat, hanya kalau ada. Label `BOOKING TERDEKAT`,
   nama kelas 22 px, lalu hari dan tanggal dengan tahun, jam mulai sampai
   selesai, nama studio, nama instruktur. Tombol `Lihat QR Pass` dan
   tautan teks `Batalkan`.
5. "Kelas minggu ini di [nama studio]", maksimal 5 kartu sesi. Tiap kartu:
   jam 20 px tebal di kiri (lebar tetap 64 px), nama kelas 17 px,
   instruktur 15 px, sisa slot 15 px. Seluruh kartu adalah target sentuh,
   tinggi minimal 88 px. Di bawahnya tautan `Lihat semua jadwal`.
6. Paket aktif saya. Hanya paket yang masih berlaku dan sisa sesinya lebih
   dari nol.
7. Tautan teks `Pesanan saya` dan `Riwayat booking`.

Empat kartu statistik bernilai 0 yang ada sekarang dihapus. Angka nol
memakan satu layar penuh tanpa membantu keputusan apa pun.

### 5.2 Jadwal

1. Baris atas 56 px: tombol kembali dan judul `Jadwal kelas`.
2. Baris tanggal horizontal langsung di bawahnya. Tujuh pil 56 x 64 px,
   nama hari 13 px di atas, tanggal 20 px di bawah. Terpilih: latar
   `#396552`, teks putih. Lainnya: latar putih, batas 1.5 px `#768b84`.
   Tanpa paragraf pengantar dan tanpa label "01 PILIH JADWAL".
3. Baris filter ringkas: dua tombol sejajar, `Studio: [nama]` dan
   `Tipe kelas: Semua`. Tap membuka bottom sheet. Nilai awal studio sama
   dengan studio utama member, jadi nol tap untuk kasus normal. Tautan
   `Reset filter` hanya muncul kalau ada filter yang diubah.
4. Daftar sesi hari terpilih, bentuk kartu sama dengan di Beranda.
   Sesi penuh tetap ditampilkan dengan label `Penuh, 0 slot` warna
   `#8a5b17` dan kartu tidak bisa ditap.

Konten pertama harus muncul di atas y = 400 px. Sekarang pemilih studio
baru muncul di y = 883 px pada layar setinggi 812 px.

Nama studio ditampilkan sebagai nama manusia. Kode DD-GG, DD-MK, DD-SBY,
DD-PIK2, DD-UNTAR tidak ditampilkan ke member.

### 5.3 Konfirmasi booking

Bottom sheet naik dari bawah, tinggi menyesuaikan isi maksimal 80 persen
layar, radius atas 20 px, latar putih, overlay `#17231e` 45 persen. Tidak
menutupi tombol sistem.

Urutan: garis pegangan dekoratif, nama kelas 24 px, lalu lima baris dengan
ikon: tanggal lengkap dengan tahun, jam mulai sampai selesai dan durasi,
nama instruktur, nama studio, sisa slot. Lalu kotak `#e8f0ec` berisi nama
paket dan sisa sesi setelah booking. Tombol utama lebar penuh
`Konfirmasi booking sekarang` tinggi 52 px, lalu tombol teks `Batal`.

Status sheet:

| Keadaan | Tampilan |
|---|---|
| Diproses | Tombol jadi `Memproses booking...` dan nonaktif, sheet tidak bisa ditutup |
| Berhasil | Isi sheet diganti judul `Booking berhasil` dan ringkasan, tombol `Lihat QR Pass` dan `Tutup` |
| Slot habis | "Slot kelas ini baru saja penuh. Pilih jam lain di hari yang sama." tombol `Lihat jam lain` |
| Belum verifikasi | "Booking belum bisa diproses karena identitas kamu belum diverifikasi." tombol `Isi data verifikasi` |

### 5.4 Beranda instruktur

1. Header: "Halo, [nama depan]" dan baris tanggal hari ini dengan tahun
   serta nama studio.
2. Tombol lebar penuh `Scan QR presensi saya`, tinggi 60 px, di atas
   daftar karena ini aksi paling sering.
3. `Kelas saya hari ini`: kartu sesi berisi jam 22 px, durasi, nama kelas,
   nama studio, jumlah peserta dibanding kapasitas, dan badge status
   `HADIR` atau `NANTI`.
4. Panel peserta sesi terpilih: nama peserta dan status check-in. Satu
   baris penutup: "Instruktur tidak melihat data pembayaran peserta."
5. Kartu ketersediaan mengajar dengan ringkasan pengajuan dan tautan
   `Atur`.

Halaman ketersediaan diberi opsi `Ulangi setiap minggu sampai [tanggal]`
pada satu pengajuan, supaya instruktur tidak mengisi hari demi hari.

### 5.5 Verifikasi identitas

Banner di Beranda, bukan halaman tersembunyi. Latar `#e8f3f8`, batas kiri
4 px `#27607c`. Judul 18 px "Identitas kamu belum diverifikasi", isi 16 px
"Verifikasi diperlukan sebelum kamu bisa membeli paket dan booking kelas.
Satu halaman, sekitar 2 menit." Tombol `Isi data verifikasi`.

Halaman verifikasi, judul `Verifikasi identitas`. Kata KYC dihapus karena
bukan kosakata member. Urutan kolom, satu kolom, label di atas input,
tinggi input 52 px:

1. Nama lengkap sesuai KTP, placeholder `Tulis nama sesuai KTP`
2. Nomor NIK, placeholder `16 angka pada KTP`, keyboard angka
3. Alamat sesuai KTP, textarea 3 baris, placeholder
   `Tulis alamat lengkap sesuai KTP`
4. Dua tombol unggah: `Foto KTP` dan `Foto selfie`

Contoh isian yang terlihat seperti NIK atau alamat nyata dihapus, karena
contoh seperti itu terbaca sebagai kolom yang sudah terisi.

Setelah dikirim, banner Beranda berubah:

| Status | Warna | Teks |
|---|---|---|
| Diperiksa | `#fff4da` | "Data kamu sedang diperiksa tim studio. Kami kabari lewat WhatsApp kalau sudah selesai." |
| Ditolak | `#faeceb` | "Data ditolak: [alasan dari tim studio]. Perbaiki lalu kirim lagi." tombol `Perbaiki data` |

Tab Booking dan Pesanan tidak lagi dialihkan diam-diam ke halaman
verifikasi. Keduanya tetap terbuka dan menampilkan kartu penjelasan yang
sama.

### 5.6 Paket

Masalah sekarang: 11 layar gulir untuk 11 paket, kartu pertama baru muncul
di y = 1575 px, tanpa opsi urutkan.

Perbaikan:

1. Header dengan tombol kembali dan judul `Pilih paket`.
2. Baris filter: tombol studio (nilai awal dari studio utama member) dan
   tombol urutkan (`Termurah per sesi`, `Sesi terbanyak`, `Paling sering
   dibeli`).
3. Baris tab tipe kelas: Private Group, Private, Semi, Group.
4. Paket dikelompokkan dengan judul kecil: `COBA DULU, 1 SAMPAI 3 SESI`
   dan `PAKET RUTIN, 5 SESI KE ATAS`.
5. Tiap kartu berisi fakta, bukan tagline: nama paket, harga total, harga
   per sesi, jumlah sesi, masa berlaku, dan tombol `Beli paket ini`.
   Paket termurah per sesi diberi badge `TERMURAH` dan batas 2 px.
6. Baris penutup menyebutkan jumlah yang ditampilkan dan bahwa paket promo
   yang sudah lewat periodenya tidak ditampilkan.

Lima kartu studio di atas halaman dihapus. Hero dan tiga poin keunggulan
dipindah ke bawah atau dihapus.

Tagline generik yang sekarang berulang di hampir semua kartu
("Fleksibel untuk latihan mingguan", "Cocok untuk mulai mencoba",
"Nilai terbaik untuk latihan rutin") diganti fakta paket.

### 5.7 Bayar dan unggah bukti

Pembayaran tetap transfer manual dengan nominal berkode unik. Yang
diperbaiki adalah jumlah langkah dan kejelasannya.

1. Kartu ringkasan paket yang dibeli.
2. Kartu `LANGKAH 1, TRANSFER TEPAT SEJUMLAH INI`, batas 2 px `#396552`.
   Nominal ditampilkan 30 px Poppins 600. Satu baris peringatan bahwa tiga
   angka terakhir adalah kode pesanan dan transfer harus pas. Tombol
   `Salin nominal`. Lalu rekening tujuan dan tombol `Salin nomor rekening`.
3. Kartu `LANGKAH 2, UNGGAH BUKTI TRANSFER` dengan satu tombol besar
   `Ambil foto atau pilih dari galeri`, keterangan format dan ukuran
   maksimal, lalu tombol `Kirim bukti transfer`.
4. Kartu batas waktu dengan tanggal dan jam, serta akibatnya kalau lewat.

Dua tombol salin itu yang memotong langkah paling banyak. Tanpa itu,
member mengetik ulang 10 angka nominal dan nomor rekening dari layar.

### 5.8 QR Pass

Dibuka 1 tap dari kartu booking terdekat di Beranda. Latar gelap `#24483a`
supaya layar otomatis dicerahkan dan QR mudah dipindai.

Isi: satu baris instruksi, kartu putih berisi QR besar 230 px, lalu nama
kelas, tanggal dengan tahun, jam, studio, instruktur, dan nama pemegang
pass. Di bawahnya keterangan masa berlaku kode, lalu tombol
`Simpan ke galeri`.

### 5.9 Daftar akun

Sekarang form daftar punya tiga bagian dan meminta KTP di awal.

Perbaikan: tiga kolom saja (nama lengkap, nomor WhatsApp, password).
Verifikasi KTP diminta nanti, saat pembelian paket pertama, dan itu
disebutkan jelas di bawah judul.

Keputusan pemilik (27 Okt 2026): **login dengan kode WhatsApp tidak
dikerjakan.** Login tetap memakai email atau nomor WhatsApp dengan
password, dan lupa password lewat tautan reset. Penyedia pengiriman
WhatsApp belum ada, dan rute OTP sudah dicabut dari API.

Satu kotak tambahan untuk member lama: "Sudah pernah latihan di studio?
Akun kamu mungkin sudah dibuatkan staf. Masuk pakai nomor WhatsApp yang
kamu berikan ke studio."

### 5.10 Tablet kiosk studio

Orientasi mendatar 1024 x 768, dibaca dari jarak sekitar 2 meter.

Kiri: QR presensi 280 px pada kartu putih, dengan keterangan kode berganti
setiap 60 detik.

Kanan atas: sesi berikutnya, jam dan nama kelas 40 px, nama instruktur dan
studio 22 px, jumlah peserta terdaftar.

Kanan bawah: daftar presensi hari ini dengan jam scan.

Baris penutup: "Presensi hanya tercatat jika instruktur terdaftar di sesi
ini dan berada di area studio."

Keputusan pemilik (27 Okt 2026): **PIN per cabang, diperiksa server.**
- Staf membuat PIN 6 digit di menu `PIN Kiosk` (`/workspace/kiosk-pin`).
  PIN hanya tampil sekali dan tidak disimpan dalam bentuk asli.
- Tablet memasukkan PIN sekali; server menjawab token 30 hari yang
  disimpan tablet. Mengganti PIN langsung mematikan semua token lama.
- Tanpa token yang sah, halaman data kiosk menjawab 401 dan tidak berisi
  apa pun. Percobaan PIN dibatasi 6 kali per tablet dan 30 kali per cabang
  setiap 15 menit.
- Koordinat studio, radius geofence, dan hitungan jarak tidak pernah
  dikirim ke halaman kiosk atau daftar cabang publik.
- QR berganti tiap 60 detik (berlaku sekitar 120 detik), seperti
  sebelumnya.

---

## 6. Status wajib di setiap layar data

Tulisan "Tidak ada data" tidak dipakai. Setiap status menyebut penyebab dan
satu aksi berikutnya.

| Layar dan keadaan | Teks | Tombol |
|---|---|---|
| Beranda, belum punya paket | "Belum ada paket aktif. Kamu perlu paket sesi sebelum bisa booking kelas." | `Lihat pilihan paket` |
| Jadwal, tanggal tanpa kelas | "Tidak ada kelas pada [hari, tanggal, tahun]. Studio [nama] belum membuka kelas di tanggal ini." | `Lihat tanggal berikutnya` |
| Memuat | "Memuat jadwal [nama studio]..." ditambah kerangka abu tanpa animasi berulang | tidak ada |
| Error koneksi | "Jadwal gagal dimuat. Koneksi internet terputus saat mengambil data." | `Coba muat ulang` |
| Checkout ditolak verifikasi | "Pembelian paket belum bisa diproses. Identitas kamu belum diverifikasi. Isi data verifikasi dulu, sekitar 2 menit." | `Isi data verifikasi` |
| Booking berhasil | "Booking berhasil. [kelas], [hari, tanggal, tahun], [jam] di [studio]." | `Lihat QR Pass`, `Tutup` |
| Instruktur, tidak ada kelas | "Tidak ada kelas terjadwal untuk kamu hari ini." | `Buka jadwal mingguan` |

---

## 7. Perbaikan teks

| Sebelum | Sesudah |
|---|---|
| Paket belum tersedia. Checkout belum dapat dimuat. Layanan pesanan belum dapat memproses permintaan. | Pembelian paket belum bisa diproses karena identitas kamu belum diverifikasi. Isi data verifikasi dulu, sekitar 2 menit. |
| KYC | Verifikasi identitas |
| Booking kelas (tombol yang membuka halaman perantara) | Lihat jadwal kelas |
| Pilih jadwal kelas terlebih dahulu | halaman dihapus |
| Rab, 2 Okt | Rab, 2 Okt 2025 |
| Menampilkan 1 dari 0 pesanan | Menampilkan 1 pesanan |
| Studio aktif: Daily Dose Green Ga... | Studio utama: Daily Dose Green Garden |
| Ganti | Ganti studio |
| DD-GG, DD-MK, DD-SBY, DD-PIK2, DD-UNTAR | Green Garden, Muara Karang, Graha Family Surabaya, Orange Groves PIK 2, Untar Kampus 2 |
| ALL_LEVELS | Semua Level |
| PRIVATE_GROUP | Private Group |
| Asia/Jakarta | WIB |
| 01 PILIH JADWAL | label dihapus, tanggal langsung terlihat |
| Pilih studio tanpa pilihan otomatis. | kalimat dihapus |
| Ketersediaan slot (pada booking yang sudah batal) | Booking dibatalkan pada [tanggal, tahun] |
| Lihat detail & QR Pass (pada booking selesai) | Lihat detail booking |
| Booking kelas (pada paket kedaluwarsa) | Paket berakhir [tanggal]. Beli paket baru |
| Paste payload dd-checkin:v1:... | Arahkan kamera ke QR di tablet studio |
| Pilih satu cabang pada topbar untuk membuat atau mengubah kelas | Kelas saya hari ini di [nama studio] |
| Buat kelas (untuk peran instruktur) | dihapus dari peran instruktur |
| Fleksibel untuk latihan mingguan | 10 sesi, berlaku 75 hari, Rp 200.000 per sesi |
| [PROMO] 20 Sessions Private Group Class FREE 3 Ses | Private Group 20 sesi, bonus 3 sesi (nama dua baris, tidak dipotong) |
| Move with intention (judul tab semua halaman) | [Nama halaman] - Daily Dose Pilates |
| Tidak ada data | lihat tabel status di bagian 6 |

---

## 8. Daftar keputusan dan alasannya

1. Satu sistem navigasi, `/` dialihkan ke beranda member saat login: dua
   beranda membuat member kehilangan jejak.
2. Menu bawah tampil juga di beranda: bar yang hilang dan muncul mematahkan
   mental model WhatsApp dan Gojek.
3. Pesanan dipindah ke Akun: frekuensinya rendah dibanding empat tab lain,
   dan slot menu bawah terbatas lima.
4. Beranda member dimulai dari booking terdekat dan daftar kelas: itu dua
   hal yang dicari member, bukan angka ringkasan.
5. Empat kartu bernilai nol dihapus: nol tidak mengubah keputusan apa pun.
6. Tanggal selalu dengan tahun: tanpa tahun, booking tahun lalu terbaca
   sebagai minggu ini.
7. Studio utama jadi filter awal: menghilangkan satu layar pemilihan dari
   jalur booking harian.
8. Baris tanggal horizontal menggantikan judul, paragraf, dan label
   langkah: konten pertama harus terlihat tanpa menggulir.
9. Konfirmasi booking memakai bottom sheet, bukan halaman: menjaga konteks
   dan menahan alur di tiga tap.
10. Radius 12 dan bukan pil: bentuk pil membuat tombol, chip, dan badge
    tidak bisa dibedakan.
11. Batas komponen `#768b84`: `#d5dfda` pada putih hanya 1.36:1 dan tidak
    memenuhi syarat 3:1.
12. Teks utama 17 px: mata usia 45 sampai 55 kehilangan akurasi pada 14 px,
    dan Poppins bertubuh kecil.
13. Setiap halaman member punya judul dan tombol kembali: tanpa itu
    pengguna tidak tahu posisinya.
14. Pesan error menyebut penyebab sebenarnya: kode server tidak bisa
    ditindaklanjuti member.
15. Tidak ada pengalihan diam-diam ke halaman verifikasi: pengalihan tanpa
    penjelasan terbaca sebagai aplikasi rusak.
16. Placeholder jujur pada form KTP: contoh NIK yang terlihat nyata membuat
    kolom terbaca seolah sudah terisi.
17. Tagline paket diganti fakta paket: tiga tagline berulang tidak membantu
    memilih di antara 11 paket.
18. Tombol salin di halaman bayar: tanpa itu member mengetik ulang 10 angka
    nominal dan nomor rekening dari layar.
19. Peran instruktur tidak melihat aksi administrasi: tombol yang pasti
    gagal menghapus kepercayaan pada aplikasi.
20. ~~Login dengan kode WhatsApp~~ keluar dari lingkup (keputusan pemilik
    27 Okt 2026): penyedia WhatsApp belum ada dan rute OTP sudah dicabut.
    Lupa password ditangani lewat tautan reset yang sudah ada.

---

## 9. Batasan dokumen ini

- Diuji hanya pada 375 x 812 px. Tablet dan desktop belum dirancang.
- Nama orang dalam mockup ditulis sebagai `[placeholder]` karena data
  member asli tidak boleh dikarang dan menampilkan nama customer sungguhan
  adalah soal privasi. Nama studio, tipe kelas, nama instruktur, jam, dan
  harga paket diambil dari data sistem yang sebenarnya.
- QR pada mockup adalah pola placeholder, bukan kode yang bisa dipindai.
- Halaman depan publik belum dirancang ulang, selain keputusan mengalihkan
  member yang sudah login.
- Daftar tunggu kelas penuh, isi notifikasi WhatsApp, dan teks hukum belum
  ditentukan. Butuh keputusan pemilik.
- Jadwal yang muncul di mockup adalah contoh tampilan. Sistem aslinya belum
  punya kelas terjadwal sejak 9 Oktober 2026.

---

## 10. Panel admin

Ditambahkan 26 Oktober 2026 setelah keluhan bahwa panel admin terasa terlalu
hijau dan melelahkan mata.

### 10.1 Masalah yang diukur

Pada lebar 1440 px, sidebar `#17352a` menutup **18 persen layar** dan tidak
pernah hilang. Warna aksen berhenti berfungsi sebagai aksen begitu dipakai
seluas itu: tombol hijau di tengah halaman kehilangan daya tariknya karena
warnanya sudah ada di mana-mana, dan mata tidak punya tempat beristirahat
pada panel yang dipakai berjam-jam setiap hari.

### 10.2 Token panel admin

Berbeda dari token layar member, karena latarnya krem hangat, bukan abu
kehijauan. Semua angka di bawah diukur, bukan diperkirakan.

| Token | Dipakai untuk | Kontras |
|---|---|---|
| `#f4f2ec` | Bidang kerja | latar |
| `#ebe8e0` | Sidebar dan kepala tabel | latar |
| `#ffffff` | Kartu dan baris isi | latar |
| `#17231e` | Teks utama | 13,24:1 di sidebar, 14,48:1 di bidang kerja |
| `#5f6b63` | Label kelompok menu | 4,55:1 di sidebar |
| `#607069` | Teks pendukung | 4,67:1 di bidang kerja |
| `#827c6a` | Semua garis dan batas | 3,40:1 sampai 4,17:1 |
| `#396552` | Tombol utama dan menu aktif | 5,43:1 di sidebar |
| `#9b3d38` | Perlu ditindak sekarang | 6,73:1 di putih |
| `#8a5b17` | Menunggu terlalu lama | 5,85:1 di putih |

Dua token lama dibuang di seluruh sistem karena gagal syarat 3:1 untuk batas
komponen: `#d5dfda` hanya 1,36:1 dan `#aabbb3` hanya 2,01:1 terhadap putih.
Layar member memakai `#768b84` (3,62:1), panel admin memakai `#827c6a`.

### 10.3 Aturan pakai warna

1. Hijau `#396552` hanya untuk tombol aksi utama dan penanda halaman aktif.
   Satu tombol hijau per area kerja, tidak lebih.
2. Permukaan besar netral: sidebar, bidang kerja, kartu. Tidak ada blok
   hijau yang lebih besar dari sebuah tombol.
3. Merah dan kuning hanya untuk hal yang perlu ditindak, bukan hiasan
   status. Kalau semuanya berwarna, tidak ada yang mendesak.
4. Warna tidak boleh jadi satu satunya penanda. Setiap baris berwarna juga
   punya teks yang menyebutkan masalahnya.

### 10.4 Tiga aturan yang membedakan panel admin dari layar member

Panel admin dipakai berjam-jam tiap hari, layar member hanya beberapa menit.

- **Tidak ada kartu statistik hiasan.** Angka muncul kalau ada yang bisa
  dilakukan terhadapnya, dan selalu bersama tombol tindakannya.
- **Grafik hanya dipasang kalau menjawab satu pertanyaan**, dan judulnya
  ditulis sebagai pertanyaan itu. Contoh: "Hari mana omzet turun dalam 30
  hari terakhir?"
- **Tidak ada tombol setujui banyak sekaligus** pada layar yang menentukan
  uang masuk atau siapa yang boleh masuk studio. Satu berkas satu keputusan.
  Setelah menekan setujui atau tolak, keputusan **baru dikirim ke server
  setelah 10 detik**; tombol `Batalkan` hanya bekerja sebelum itu. Setelah
  terkirim, keputusan tidak bisa dibalik: persetujuan pembayaran menulis
  buku besar yang tidak bisa diubah, dan dokumen identitas yang disetujui
  terkunci permanen.

### 10.5 Enam layar admin

| Papan | Layar | Keputusan utama |
|---|---|---|
| 13 | Aturan warna | Papan acuan, bukan layar. Dipakai developer saat menerapkan palet |
| 14 | Front desk, Hari Ini | Kelas berjalan dan kelas berikutnya di atas, daftar hadir di tengah, tiga tombol besar di kanan. Tanpa kartu statistik |
| 15 | Timetable kelas | Salin minggu dan jadwal rutin. Mengubah 39 kelas jadi satu kali isi form |
| 16 | Finance, bukti transfer | Nominal paket dan nominal bukti disandingkan sebagai elemen utama, selisih ditulis dengan kata. Tombol setujui baru aktif setelah gambar bukti dibuka, lalu keputusan ditunda 10 detik sebelum terkirim |
| 17 | Antrean verifikasi | Mode cepat, satu berkas satu layar, pintasan papan ketik S, U, T, L, dan Z untuk batal |
| 18 | Owner | Daftar "yang perlu ditindak" lebih dulu, baru tabel cabang. Kolom kelas 7 hari ke depan bernilai nol di semua cabang |

### 10.6 Catatan khusus layar verifikasi

Sistem menyimpan foto identitas asli. Pada mockup, area foto digambar
sebagai blok abu berlabel, bukan contoh kartu identitas.

Petugas hanya perlu mencocokkan nama dan tanggal lahir. Nomor identitas
tidak perlu dibaca atau dicatat, dan hal itu ditulis di layarnya supaya
tidak ada yang menyalinnya tanpa keperluan.

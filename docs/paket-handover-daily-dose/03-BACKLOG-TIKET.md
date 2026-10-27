# Backlog implementasi Daily Dose Pilates v2

Tiket diurutkan berdasarkan dampak ke konversi dan kepercayaan member.
Kerjakan satu per satu, urut nomor. Jangan gabung beberapa tiket dalam satu
perubahan.

Rujukan: `02-SPEC-DESAIN.md` dan 18 mockup (`mockup-png/`, sumber di `mockup-sumber/`).

Keterangan ukuran: S kurang dari 1 hari, M 1 sampai 3 hari, L lebih dari
3 hari. Perkiraan ini dari sisi desain, bukan dari pembacaan basis kode.

---

## Status per 27 Oktober 2026

Diperiksa dengan membaca kode repositori (komit terakhir dan pekerjaan yang
sedang berjalan di IDE lain), bukan dengan menjalankan aplikasinya. "Ada di
kode" berarti berkas dan tesnya ada, belum berarti perilakunya sudah diuji di
browser. "Belum ada jejak" berarti pencarian kata kunci tiket tidak menemukan
apa pun.

| Tiket | Status | Yang ditemukan | Sisa atau catatan |
|---|---|---|---|
| T-01 | Ada di kode | Checkout menangani `CUSTOMER_VERIFICATION_REQUIRED` dengan pesan ramah dan tombol ke `/account/verification?returnTo=` berisi paket, cabang, tipe kelas, dan slot pilihan; halaman verifikasi menyimpan tujuan itu dan mengarahkan kembali setelah disetujui (tes: checkout dan `verification-continuation`). UAT Antigravity: tidak ada kode mentah yang tampil | Alur penuh "verifikasi disetujui lalu kembali ke paket" belum dicoba di browser dengan akun yang benar-benar belum terverifikasi; UAT langsung 27 Okt (akun baru, 375 x 812): kirim NIK, alamat, KTP, selfie lalu setelah staf menyetujui kedua dokumen, dalam 17 detik halaman verifikasi mengarahkan member ke tujuan `returnTo`, status menjadi APPROVED dan banner hilang. Bug ditemukan dan diperbaiki: `KycSubmissionForm` dideklarasikan di dalam `VerificationView`, sehingga formulir dipasang ulang tiap polling 20 detik dan NIK, alamat, serta foto yang dipilih hilang (tes regresi ditambahkan) |
| T-02 | Ada di kode | Banner status (belum, diperiksa, ditolak) dipakai di beranda, booking, dan pesanan | Uji bahwa tab tidak lagi dialihkan diam-diam |
| T-03 | Ada di kode | `/` mengalihkan member yang login ke `/account` (diukur sekitar 5 detik, menunggu sesi dimuat). Menu bawah 5 item muncul di 12 halaman member yang diperiksa di browser lebar 390 px, tab aktif cocok. Judul tab sendiri di semua halaman member dan halaman masuk, daftar, lupa dan reset password, aktivasi (dijaga tes `judul-halaman-member`) | Pesanan, Checkout, dan QR Pass menandai tab Akun; Notifikasi tidak menandai tab apa pun. Halaman panel staf kini juga punya judul sendiri (40 halaman ditambah; judul lama yang menumpuk nama situs dirapikan; dijaga tes `judul-halaman-staf` untuk semua halaman). Selama sesi dimuat, tamu sempat melihat halaman landing sebelum dialihkan |
| T-04 | Ada di kode | Tombol `Studio:` dan `Tipe kelas:` dengan filter ringkas di halaman jadwal | UAT 27 Okt di 375 x 812 (akun dengan banner paket): pemilih studio y = 498 (dulu 883), jam pertama y = 678 terlihat tanpa menggulir, ganti tanggal tanpa muat ulang (URL ikut `date=`), tidak ada kode DD-, kartu penuh berlabel `Penuh, 0 slot` tanpa tautan. Masih di bawah layar: tombol "Lanjutkan booking" kartu pertama (y = 832); banner paket memakai sekitar 185 px |
| T-05 | Ada di kode | Lembar konfirmasi dengan keadaan berhasil dan slot penuh; kunci kuota di server sudah ada. Semua tombol "Booking kelas" langsung ke `/classes` (beranda: `/classes?branch=…`); `/bookings/new` hanya dibuka dengan slot terpilih | `/bookings/new` yang dibuka tanpa slot lewat URL langsung masih menampilkan "Pilih jadwal kelas terlebih dahulu" dengan tautan ke jadwal. UAT 27 Okt di browser: lembar terbuka tanpa pindah halaman, klik ganda = satu POST, keadaan berhasil muncul, dua booking serentak pada kursi terakhir = satu 201 dan satu 409 `CLASS_CAPACITY_FULL`, pihak yang kalah melihat "Slot kelas ini baru saja penuh". Ditemukan dan diperbaiki: `bookingProblem` tidak membaca `ApiError` dari `apiFetch`, sehingga semua galat booking tampil sebagai "Layanan tidak dapat dijangkau". Sudah diperbaiki dan dicek di browser: footer lembar menempel (tombol konfirmasi y = 690 dengan 19 paket), daftar dimuat ulang saat slot penuh atau sudah dipesan, kartu kelas yang sudah dipesan berubah menjadi "Sudah Anda booking" + "Lihat booking". Beranda: "Booking kelas" dengan paket aktif membuka `/classes` tanpa cabang, sehingga halaman jadwal memilih studio paket (Cindy: Green Garden, 11 kelas bisa dipesan, 0 "Perlu paket"); label header "Studio aktif" diganti "Studio utama" (sama dengan modal dan toast); badge member memakai satu penyimpanan bersama (`/me/dashboard` 2 kali dalam 25 detik, sebelumnya sekitar 6 per 5 detik) dan fokus beruntun tidak lagi memuat ulang notifikasi |
| T-06 | Ada di kode (sedang dikerjakan) | Urutkan dan kelompok `COBA DULU` ada di halaman paket | Berkas masih berubah di IDE lain |
| T-07 | Ada di kode (sedang dikerjakan) | `Salin nominal` dan `Salin nomor rekening` ada | Rekening diisi di Master, Rekening Pembayaran (lihat Penyesuaian) |
| T-08 | Ada di kode | QR Pass berlatar `#24483a`, QR minimal 230 px, `Simpan ke galeri`, masa berlaku | Uji kecerahan layar dan keterbacaan pemindai |
| T-09 | Ada di kode | Formulir daftar: nama lengkap, nomor WhatsApp, email (tetap wajib, keputusan 27 Okt: API dan reset password memakainya), password dengan tombol lihat, persetujuan. Unggah KTP dan selfie serta "Ulangi password" dibuang; KTP diunggah di halaman verifikasi. Penomoran bagian 1 dan 2 berurutan, nomor WhatsApp salah format ditolak dengan pesan yang menyebut awalan 08 atau +62 dan contohnya, kalimat "masuk tanpa password" yang tidak benar dihapus, teks persetujuan tidak lagi menyebut pemrosesan data identitas | UAT langsung 27 Okt di 375 x 812: formulir 5 isian tanpa kolom unggah, format WhatsApp salah ditolak dengan pesan yang benar, pendaftaran 201, pilihan studio utama wajib muncul, lalu member dibawa ke tujuan semula (`returnTo` kini diteruskan dari masuk ke daftar dan sebaliknya). Spesifikasi e2e `customer-fullstack` disesuaikan tetapi belum dijalankan |
| T-10 | Sebagian | Halaman `Hari Ini`, menu bawah 4 item, tombol administrasi disembunyikan, input `repeatUntil` pada ketersediaan | Ulang mingguan dikerjakan di sisi klien (beberapa pengajuan); API tidak punya parameter ulang. Cek pemilih cabang hanya memuat cabang penugasan. |
| T-11 | Sebagian | Teks `Arahkan kamera ke QR di tablet studio` dan tautan `Tidak bisa memindai QR?`, kamera dibuka lewat pembaca QR (`decodeFromConstraints`) | Cek shutter otomatis dan kolom manual tersembunyi |
| T-12 | Keamanan selesai | PIN per cabang diperiksa server, koordinat tidak lagi dikirim, QR berganti 60 detik, tata letak 40/22/280 px | Tinggal uji baca dari jarak 2 meter |
| T-13 | Ada di kode | `lib/system-dictionary.ts` (345 baris) dan tes | Jalankan pencarian teks hasil render untuk kata terlarang |
| T-14 | Sebagian | Tes status layar data ada; frasa "Tidak ada data" tidak ditemukan lagi | Uji tiga status di tiap layar data |
| T-15 | Ada di kode | Diukur di browser pada halaman nyata (skrip: kontras teks, batas input, fokus terlihat, ukuran target). Garis fokus global 3 px `#24483a` offset 2 px (sebelumnya aturan tanpa layer di `globals.css` mengalahkan spesifikasi). Teks pendukung `#566660` (4,95:1 di atas `#ebe8e0`, sebelumnya 4,27:1). Target interaktif 44 px di tab, paginasi, menu aksi tabel, header, sidebar, footer, dan pencarian paket publik. Pelanggaran kontras teks dan batas input: 0 di 6 halaman yang diukur | Halaman member (akun, booking, pembayaran) belum diukur di browser karena butuh login pelanggan; target di sana hanya diubah di kode. Skrip pengukuran belum jadi tes otomatis |
| T-16 | Ada di kode | Empat butir awal sudah ada (paket kedaluwarsa ke riwayat, booking batal/selesai tanpa Ketersediaan Slot dan QR Pass, tahun pada tanggal booking, penghitung pesanan). Ditambah: tombol Batalkan booking mengikuti `cancellation-options` API (pelanggan: disembunyikan dengan alasan; staf: dialog tidak dibuka, toast menunjuk Penyesuaian Sesi), tombol QR check-in staf hanya untuk kelas PUBLISHED/CONFIRMED yang belum selesai, `formatBranchDay` dan tiga tampilan tanggal lain menulis tahun bila bukan tahun berjalan | Diuji langsung di browser untuk dialog batal staf (booking lama di kelas yang sudah lewat). Halaman pelanggan belum diuji di browser (butuh login pelanggan). Tanggal pada tabel yang memakai `dateStyle` sudah memuat tahun, tidak diubah |
| T-17 | Ada di kode | Sidebar krem `#ebe8e0`, penanda menu aktif putih dengan garis kiri 3 px, garis `#827c6a`, `#d5dfda` dan `#aabbb3` sudah tidak ada. Hijau admin tetap `#285740` sesuai keputusan. Hijau diukur 0 sampai 1,5 persen layar (1440 x 900) pada 5 halaman admin, tanpa blok hijau lebih besar dari tombol | Hijau masih dipakai di tombol, menu aktif, dan beberapa penanda kecil (titik, ikon). Pengukuran piksel baru dilakukan lewat skrip di browser, belum jadi tes otomatis |
| T-18 | Ada di kode | T-18a: `/workspace/classes/salin`. T-18b: `/workspace/classes/rutin` (hari Sen–Min, jam 24 jam dengan titik, durasi, tipe, studio, ruangan, instruktur, tanggal mulai dan akhir sampai 92 hari). Keduanya menampilkan rencana lebih dulu (buat, sudah ada, bentrok, sudah lewat) dan hanya membuat kelas baru | T-18b dibuat di web memakai API pembuatan kelas yang ada (3 permintaan bersamaan), tanpa endpoint massal: server tetap menolak bentrok ruang dan instruktur. Bila nanti terlalu lambat untuk jadwal besar, baru perlu endpoint massal. Uji pembuatan sungguhan di browser belum dilakukan |
| T-19 | Ada di kode | Komponen `EmptyWeeksNotice` (chip per minggu + peringatan merah dengan kata `Kosong`, tombol `Isi pakai jadwal rutin` dan tautan salin jadwal) terpasang di timetable (tidak untuk instruktur), dashboard Owner (cabang aktif, atau satu blok per cabang), halaman Hari ini, dan halaman salin/jadwal rutin; 7 tes di `tiket-t19-peringatan-minggu-kosong` | Belum dicek langsung di browser dengan sesi staf (data lokal kini terisi sampai 19 Jan 2027, jadi peringatan baru muncul mulai sekitar 22 Des 2026) |
| T-20 | Ada di kode | `/workspace` untuk sesi Admin saja membuka halaman Hari ini (jadwal, daftar hadir, isi-susulan dengan batas 2 jam) | Uji di browser dengan data cabang nyata |
| T-21 | Ada di kode | Pembandingan nominal, bukti bisa diperbesar, keputusan ditunda 10 detik dengan tombol Batalkan; tombol setuju baru aktif setelah gambar bukti termuat | UAT langsung 27 Okt (Super Owner, pesanan nyata dari akun uji): bukti tidak dimuat otomatis, tombol "Preview bukti" menerbitkan akses privat; tombol setujui nonaktif sampai gambar termuat lalu aktif; pembandingan nominal (sama persis, kurang Rp 59.000); perbesar/perkecil/putar; dialog konfirmasi lalu hitung mundur 10 detik dengan Batalkan dan Kirim sekarang (Batalkan: pembelian tetap PENDING dan tidak ada paket); dibiarkan selesai: PAID, paket ACTIVE 3 sesi, antrean pindah ke bukti berikutnya. Email "pembayaran disetujui" gagal `EMAIL_TEMPLATE_INVALID_HREF` di lokal karena tautan harus `https://` (isi `PUBLIC_WEB_BASE_URL` https di produksi) |
| T-22 | Ada di kode | Mode cepat `/identity-verifications/cepat`: satu berkas per layar, pintasan keyboard, keputusan ditunda 10 detik | API hanya mengirim nama dan nama profil, tanpa tanggal lahir, jadi pembandingan itu belum bisa; uji dengan dokumen gambar asli; UAT langsung 27 Okt: satu berkas per layar dengan foto besar, pintasan keyboard S/U/T/L/Z dicoba dengan tombol sungguhan; S memulai hitung mundur 10 detik, Z membatalkan (dokumen tetap PENDING), setelah selesai APPROVED dan berkas berikutnya langsung tampil; L melewati tanpa mengubah keputusan |

---

## Penyesuaian tiket terhadap aplikasi (27 Oktober 2026)

Hal-hal berikut ditemukan saat mencocokkan tiket dengan kode. Yang bertanda
**Keputusan** menunggu jawaban pemilik; sisanya sudah pasti dari kodenya.

**Semua tiket**
- Hanya T-12, T-18, T-19, dan T-22 (bila status baru dipilih) yang mungkin
  menyentuh API atau skema. Aturan "dilarang ubah skema atau kontrak API" di
  prompt berlaku untuk tiket lain. Tiket yang butuh API diajukan dulu dengan
  satu paragraf dampaknya.
- Tiket berstatus Ada di kode tidak dikerjakan ulang; yang dikerjakan hanya
  kriteria "Selesai jika" yang terbukti belum terpenuhi.

**T-03.** Menu bawah member sudah lima titik lewat Akun
(`customer-navigation.tsx`); yang kurang adalah judul tab per halaman. Cukup
tambahkan `metadata` pada tiap `page.tsx` member.

**T-07.** Nama bank, nomor, dan pemilik rekening bukan keputusan developer atau
pemilik produk; diisi lewat Master, Rekening Pembayaran (model
`RekeningPembayaran`, per cabang). Tiket ini tidak tertahan.

**T-09.** Bagian kode WhatsApp dihapus dari tiket (keputusan 27 Okt). Sisanya
tetap: tiga kolom, validasi nomor, dan kalimat KTP nanti.

**T-15.** Sasaran di kode, bukan di spesifikasi umum: komponen interaktif
memakai `border-interactive` (`--color-dd-border-interactive`, sudah ada).
`--color-border` (#d5dfda) dan `--color-border-strong` (#aabbb3) di
`globals.css`, serta `--color-dd-line` (#d8ddd8, kontras 1,38:1) hanya boleh
untuk pemisah. Lima `outline-none` yang tersisa
(`application-shell`, `guide-view`, `customers-view`, `customer-detail-view`
dua kali) perlu pengganti fokus.

**T-16.** Penghitung pesanan dan aturan paket kedaluwarsa ada di halaman
pesanan dan akun; belum ada perubahan.

**T-17.** Panel admin memakai token `--color-dd-*` di `tailwind.css`, bukan
token `brand` pada spesifikasi:
- Sidebar: `bg-dd-sidebar` (#17352a) dan `border-white/10` di
  `app-navigation.tsx`, plus dua logo di `application-shell.tsx`.
- Bidang kerja #f4f2ec sudah sama dengan `--color-dd-canvas`.
- Garis `--color-dd-line` #d8ddd8 gagal 3:1 (1,38:1); pengganti #827c6a
  (3,72:1 di #f4f2ec) sesuai spesifikasi 10.2.
- **Keputusan:** hijau tombol utama admin memakai `--color-dd-forest` yang ada
  (#285740, kontras 8,31:1 di putih) atau #396552 dari spesifikasi. Usulan:
  tetap #285740, supaya tidak ada dua hijau di satu aplikasi.
  **Diputuskan 27 Oktober 2026: tetap #285740.**
- Kriteria "hijau di bawah 5 persen layar" perlu cara ukur yang disepakati
  (hitung piksel pada tangkapan layar 1440 x 900).
- **Keputusan:** spesifikasi 10.4 melarang kartu statistik hiasan, sedangkan
  dashboard Super Owner dan Owner kini menampilkan sekitar 12 kartu metrik
  (dashboard dua ringkasan, komit 9f97b8ee). Pilih: kartu dipertahankan
  karena memuat tombol tindakan, atau dipangkas ke yang bisa ditindaklanjuti.
  **Diputuskan 27 Oktober 2026: kartu dipertahankan.** Font tetap Poppins.

**T-18.** Aplikasi sudah punya "Duplikat sebagai draf (+1 minggu)" untuk satu
kelas. Usulan memecah tiket:
- **T-18a, salin minggu** (ukuran S sampai M): tombol `Salin minggu ini ke
  minggu depan` dan `ke empat minggu ke depan`, dengan hitungan kelas dan
  daftar tabrakan sebelum disimpan; kelas yang sudah dipesan tidak tertimpa.
  Bisa dikerjakan di web dengan API pembuatan kelas yang ada.
- **T-18b, jadwal rutin** (ukuran L): form hari, jam, studio, tipe, instruktur,
  rentang tanggal. Butuh endpoint pembuatan massal dengan laporan tabrakan,
  jadi perlu persetujuan API baru.
- **Keputusan (27 Oktober 2026):** T-18a dulu, lalu T-18b. T-18b dikerjakan di web tanpa endpoint massal (lihat tabel status).

**T-19.** Dihitung dari daftar kelas per rentang tanggal yang sudah ada;
tidak butuh API baru. Bergantung T-18.

**T-20.** Tambahan aturan yang harus dihormati dan tidak ada di spesifikasi:
- Presensi susulan oleh admin hanya sampai 2 jam setelah kelas selesai
  (Rule #9); lewat itu lewat pengajuan penyesuaian ke Manager.
- Sesi pelanggan baru terpotong saat kelas berstatus selesai dan pelanggan
  hadir, bukan saat booking.
- Memindahkan booking kurang dari H-24 butuh persetujuan Manager.
- Ikuti pola `workspace/instructor-today-view.tsx` yang sudah ada. Halaman ini
  menggantikan atau melengkapi ringkasan operasional di `/workspace` untuk
  peran Admin.

**T-21.** Tiga keputusan sudah ada di API tanpa skema baru: setuju memberi
status pembelian `PAID`; menolak dengan kode alasan selain `DUPLICATE_PURCHASE`
mengirim email "perlu tindakan" (minta bukti diperbaiki); `DUPLICATE_PURCHASE`
adalah penolakan murni. Dialog setuju dengan nama dan nominal sudah ada di
`purchase-review-view.tsx`; yang kurang adalah gambar bukti besar dan syarat
membukanya. Syarat "tombol setujui tidak aktif sebelum bukti dibuka" hanya
ditegakkan di antarmuka; server tidak tahu apakah bukti dibuka. Penundaan
kirim 10 detik juga di antarmuka.

**T-22.** Antrean verifikasi punya aksi setujui dan tolak
(`identity-verifications/review-view.tsx`); `U minta foto ulang` sama dengan
tolak dengan alasan, bukan status baru. `L lewati` cukup berupa daftar di
sisi klien selama sesi petugas. Penundaan kirim 10 detik berlaku untuk S dan
T; setelah terkirim, dokumen yang disetujui terkunci permanen.

---

## Gelombang 1: yang membuat member berhenti

### T-01. Terjemahkan penolakan verifikasi di checkout
Ukuran S

Sekarang member yang belum verifikasi menekan "Pilih paket" dan mendapat
"Paket belum tersedia. Checkout belum dapat dimuat. Layanan pesanan belum
dapat memproses permintaan." Penyebab sebenarnya `CUSTOMER_VERIFICATION_REQUIRED`.

Yang dikerjakan:
- Baca kode error dari respons server, jangan tampilkan pesan umum.
- Tampilkan: "Pembelian paket belum bisa diproses. Identitas kamu belum
  diverifikasi. Isi data verifikasi dulu, sekitar 2 menit."
- Tombol `Isi data verifikasi` menuju halaman verifikasi dengan `returnTo`
  ke halaman asal.

Selesai jika:
- Member belum verifikasi melihat alasan sebenarnya, bukan pesan layanan.
- Setelah verifikasi terkirim, member kembali ke paket yang tadi dipilih.
- Kode error lain juga diterjemahkan, dan kode mentah tidak pernah tampil.

### T-02. Banner status verifikasi di beranda member
Ukuran S

Sekarang beranda tidak menyebut status verifikasi sama sekali.

Yang dikerjakan:
- Banner di bawah header, hanya tampil kalau status bukan disetujui.
- Tiga keadaan dengan warna dan teks sesuai spesifikasi 5.5.
- Tab Booking dan Pesanan tidak lagi dialihkan diam-diam. Keduanya tetap
  terbuka dan menampilkan kartu penjelasan yang sama.

Selesai jika:
- Member yang belum verifikasi tahu statusnya tanpa harus menekan apa pun.
- Tidak ada pengalihan otomatis tanpa penjelasan.
- Banner hilang sendiri setelah status disetujui.

### T-03. Satu sistem navigasi
Ukuran M

Sekarang member yang login lalu membuka `/` melihat halaman tamu, tanpa
menu bawah. Tombol "Beranda" di menu bawah membuka `/account`.

Yang dikerjakan:
- Member yang login membuka `/` dialihkan ke beranda member.
- Menu bawah tampil di semua halaman member, lima item sesuai spesifikasi 3.
- Pesanan dipindah ke menu Akun.
- Setiap halaman member diberi judul halaman dan tombol kembali 44 x 44 px.
- Judul tab browser mengikuti nama halaman.

Selesai jika:
- Menu bawah tidak pernah hilang di halaman member mana pun.
- Tab aktif selalu cocok dengan halaman yang sedang dibuka.
- Tidak ada halaman member yang judul tab-nya "Move with intention".

### T-04. Rombak halaman jadwal
Ukuran M

Sekarang pemilih studio muncul di y = 883 px pada layar setinggi 812 px.

Yang dikerjakan:
- Susunan baru sesuai spesifikasi 5.2: header satu baris, baris tanggal
  horizontal, baris filter ringkas, daftar sesi.
- Studio awal diambil dari studio utama member.
- Hapus paragraf pengantar, label "01 PILIH JADWAL", dan kalimat "Pilih
  studio tanpa pilihan otomatis."
- Ganti kode cabang dengan nama studio.
- Kartu sesi penuh tidak bisa ditap dan diberi label `Penuh, 0 slot`.

Selesai jika:
- Pada layar 375 x 812, pilihan jam sudah terlihat tanpa menggulir.
- Mengganti tanggal mengganti daftar sesi tanpa memuat ulang halaman.
- Tidak ada kode DD- yang terlihat member.

### T-05. Konfirmasi booking jadi bottom sheet
Ukuran M

Yang dikerjakan:
- Bottom sheet sesuai spesifikasi 5.3, dengan empat keadaan: siap,
  diproses, berhasil, gagal.
- Hapus halaman perantara "Pilih jadwal kelas terlebih dahulu".
- Tombol "Booking kelas" di beranda langsung menuju jadwal studio aktif.
- Kuota sudah dikunci di server saat konfirmasi, dalam satu transaksi
  (`FOR UPDATE` pada kelas, dihitung dari booking aktif). Tidak perlu dibuat
  ulang; cukup dijaga dengan tes dua booking bersamaan pada slot terakhir.
  Kelas yang sudah melebihi kapasitas di data berasal dari impor migrasi
  (lihat B-02 di laporan UAT), bukan dari alur ini.

Selesai jika:
- Member dengan paket aktif bisa booking dalam 3 tap dari beranda.
- Dua perangkat yang menekan konfirmasi bersamaan pada slot terakhir
  menghasilkan satu booking berhasil dan satu pesan "Slot kelas ini baru
  saja penuh".
- Tidak ada perpindahan halaman di tengah alur konfirmasi.

---

## Gelombang 2: yang membuat memilih dan membayar lebih cepat

### T-06. Rombak halaman paket
Ukuran M

Sekarang 11 layar gulir untuk 11 paket, kartu pertama di y = 1575 px, tanpa
opsi urutkan.

Yang dikerjakan:
- Susunan baru sesuai spesifikasi 5.6.
- Hapus lima kartu studio di atas halaman, ganti tombol studio.
- Tambah urutkan: termurah per sesi, sesi terbanyak, paling sering dibeli.
- Tambah tab tipe kelas.
- Kelompokkan paket: coba dulu, dan paket rutin.
- Ganti tagline generik dengan fakta paket.
- Sembunyikan paket yang periode promonya sudah lewat.

Selesai jika:
- Kartu paket pertama terlihat di layar pertama.
- Member bisa menyaring ke daftar yang relevan dalam dua tap.
- Nama paket tidak terpotong di tengah kata.
- Paket promo yang sudah lewat tidak muncul di halaman publik.

### T-07. Halaman bayar dengan tombol salin
Ukuran S

Yang dikerjakan:
- Susunan baru sesuai spesifikasi 5.7.
- Nominal unik 30 px, tombol `Salin nominal`.
- Nomor rekening dengan tombol `Salin nomor rekening`.
- Satu baris peringatan bahwa tiga angka terakhir adalah kode pesanan.
- Kartu batas waktu dengan tanggal, jam, dan akibat kalau lewat.

Selesai jika:
- Member tidak perlu mengetik ulang angka apa pun.
- Kedua tombol salin memberi umpan balik terlihat setelah ditekan.
- Batas waktu memakai waktu nyata dari server, bukan nilai tetap.

### T-08. QR Pass satu tap dari beranda
Ukuran S

Yang dikerjakan:
- Kartu booking terdekat di beranda dengan tombol `Lihat QR Pass`.
- Halaman QR Pass sesuai spesifikasi 5.8, latar gelap, QR minimal 230 px.
- Kecerahan layar dinaikkan saat halaman dibuka, kalau platform mengizinkan.
- Tampilkan masa berlaku kode.

Selesai jika:
- Dari beranda ke QR terbaca cukup satu tap.
- QR terbaca pemindai pada kecerahan layar bawaan perangkat.

### T-09. Sederhanakan daftar akun
Ukuran S

Yang dikerjakan:
- Tiga kolom: nama lengkap, nomor WhatsApp, password.
- Validasi format nomor WhatsApp Indonesia.
- Satu baris di bawah judul yang menyebut KTP diminta nanti saat pembelian
  pertama.
- Kotak untuk member lama tentang akun yang mungkin sudah dibuatkan staf.

Selesai jika:
- Penomoran bagian berurutan, tidak lompat.
- Nomor WhatsApp yang salah format ditolak dengan pesan yang menyebut
  format yang benar.
- Teks tidak lagi menjanjikan sesuatu yang bertentangan dengan aturan
  verifikasi.

---

## Gelombang 3: instruktur dan kiosk

### T-10. Beranda instruktur dan pembatasan peran
Ukuran M

Sekarang tombol "Beranda" instruktur membuka halaman Kelas yang memakai
teks administrasi dan menampilkan tombol "Buat kelas" yang tidak berhak
dia pakai. Pemilih cabang menampilkan semua cabang, dan error baru muncul
setelah dipilih.

Yang dikerjakan:
- Halaman `Hari Ini` sesuai spesifikasi 5.4, jadi halaman default.
- Menu bawah instruktur empat item.
- Sembunyikan tombol dan teks administrasi dari peran instruktur.
- Pemilih cabang hanya memuat cabang penugasan. Kalau satu, sembunyikan.
- Opsi `Ulangi setiap minggu sampai [tanggal]` pada pengajuan ketersediaan.

Selesai jika:
- Instruktur melihat kelasnya hari ini dalam satu tap setelah login.
- Tidak ada tombol yang pasti gagal kalau ditekan instruktur.
- Memilih cabang yang bukan penugasannya tidak mungkin dilakukan.

### T-11. Scan presensi tanpa istilah teknis
Ukuran S

Yang dikerjakan:
- Ganti "Paste payload dd-checkin:v1:..." dengan "Arahkan kamera ke QR di
  tablet studio".
- Kamera langsung aktif saat halaman dibuka, shutter otomatis.
- Kolom input manual disembunyikan di balik tautan `Tidak bisa memindai?`.

Selesai jika:
- Instruktur mencatat kehadiran dalam dua tap.
- Tidak ada istilah teknis yang terlihat instruktur.

### T-12. Tablet kiosk dan keamanannya
Ukuran M

Yang dikerjakan:
- Tata letak mendatar sesuai spesifikasi 5.10, terbaca dari jarak 2 meter.
- QR berganti berkala, dengan masa berlaku pendek.
- Presensi hanya sah kalau instruktur terdaftar di sesi itu, berada dalam
  radius cabang, dan waktunya dalam jendela jam kelas.

Keputusan pemilik (27 Okt 2026): PIN per cabang yang diperiksa server.
**Bagian keamanan sudah dikerjakan** di repositori: PIN dibuat staf di
`/workspace/kiosk-pin`, tablet membuka kunci dengan PIN lalu memakai token,
data kiosk menjawab 401 tanpa token, dan koordinat serta radius geofence
tidak lagi dikirim ke halaman publik. QR sudah berganti tiap 60 detik.
Yang tersisa di tiket ini hanya tata letak mendatar.

Selesai jika:
- Jam, kelas berikutnya, dan QR terbaca dari jarak 2 meter.
- QR hasil tangkapan layar tidak bisa dipakai setelah masa berlakunya
  habis.
- (Sudah selesai) PIN cabang diperiksa server dan koordinat tidak terbuka.

---

## Gelombang 4: kebersihan sistem

### T-13. Hapus kode sistem dari tampilan pengguna
Ukuran S

Yang dikerjakan:
- Ganti semua istilah pada tabel di spesifikasi bagian 7.
- Buat satu tempat pemetaan dari kode sistem ke teks tampilan, supaya tidak
  tersebar di banyak komponen.

Selesai jika:
- Pencarian teks pada hasil render tidak menemukan ALL_LEVELS,
  PRIVATE_GROUP, DD-GG, Asia/Jakarta, KYC, payload, idempotency,
  optimistic locking.

### T-14. Status kosong, memuat, dan error di semua layar data
Ukuran M

Yang dikerjakan:
- Terapkan tabel status pada spesifikasi bagian 6.
- Hapus semua tulisan "Tidak ada data".
- Kerangka memuat tanpa animasi berulang.

Selesai jika:
- Setiap layar data punya tiga status, dan masing-masing menyebut penyebab
  serta satu aksi berikutnya.
- Tidak ada layar yang menampilkan angka 0 sementara saat sedang memuat.

### T-15. Perbaiki kontras dan ukuran teks
Ukuran S

Yang dikerjakan:
- Ganti `--color-border` untuk komponen interaktif dari `#d5dfda` ke
  `#768b84`. Pertahankan `#d5dfda` untuk garis pemisah dekoratif saja.
- Naikkan teks utama ke 17 px sesuai skala pada spesifikasi bagian 2.
- Pastikan setiap target sentuh minimal 44 x 44 px dengan jarak 12 px.
- Outline fokus 3 px `#24483a`, tidak ada `outline: none` tanpa pengganti.

Selesai jika:
- Setiap batas komponen interaktif terukur minimal 3:1 terhadap latarnya.
- Setiap teks terukur minimal 4.5:1, atau 3:1 untuk teks 18 px ke atas.
- Navigasi keyboard menghasilkan fokus yang terlihat di setiap elemen.

### T-16. Aturan tampilan menurut status
Ukuran S

Yang dikerjakan:
- Paket kedaluwarsa pindah ke tab riwayat, tombol diganti `Beli paket baru`.
- Booking yang batal atau selesai tidak lagi menampilkan "Ketersediaan slot"
  dan tombol QR Pass.
- Tanggal menyertakan tahun kalau bukan tahun berjalan.
- Perbaiki penghitung pesanan, "Menampilkan 1 dari 0 pesanan" menjadi
  "Menampilkan 1 pesanan".

Selesai jika:
- Tidak ada tombol yang mengarah ke aksi yang tidak mungkin dilakukan.
- Riwayat booking tahun lalu tidak terbaca sebagai minggu ini.

---

## Yang belum bisa dibuatkan tiket

Butuh keputusan atau data dari pemilik dulu:

1. Daftar tunggu untuk kelas penuh. Belum diketahui apakah fiturnya ada.
2. Isi dan kanal notifikasi. Penyedia WhatsApp belum dikonfigurasi, jadi
   pengingat dan pembatalan otomatis sekarang hanya dicatat di log.
3. Teks Syarat dan Ketentuan serta Kebijakan Privasi versi final.
4. Nama bank, nomor rekening, dan nama pemilik rekening untuk halaman bayar.
5. ~~Login dengan kode WhatsApp~~ (dikeluarkan dari lingkup, keputusan pemilik 27 Okt 2026).
6. Tampilan tablet dan desktop. Pengujian baru dilakukan pada 375 px.
7. Apakah member lama tetap wajib verifikasi KTP, atau cukup diverifikasi
   front desk saat datang ke studio.

Satu catatan operasional yang bukan tiket desain: sistem belum punya kelas
terjadwal sejak 9 Oktober 2026, di kelima cabang. Selama itu belum diisi,
tiket T-04, T-05, T-08, T-10, dan T-12 tidak bisa diuji.

---

## Gelombang 5, panel admin

Ditambahkan setelah keluhan bahwa panel admin terlalu hijau. Spesifikasi
lengkapnya ada di `02-SPEC-DESAIN.md` bagian 10, mockupnya papan 13 sampai
18 di kanvas.

### T-17. Ganti palet panel admin ke netral

Kerjakan ini sebelum lima tiket lain di gelombang ini, karena semuanya
memakai token hasil tiket ini.

- Sidebar dari `#17352a` menjadi `#ebe8e0` dengan teks `#17231e`, label
  kelompok `#5f6b63`, dan garis kanan `#827c6a`.
- Penanda menu aktif: latar putih dengan garis kiri 3 px `#396552`.
- Bidang kerja `#f4f2ec`, kartu putih, semua garis `#827c6a`.
- Hapus `#d5dfda` dan `#aabbb3` dari seluruh sistem, keduanya gagal 3:1.
- Hijau `#396552` disisakan untuk tombol aksi utama dan menu aktif saja.

Selesai jika:
- Hijau menutup di bawah 5 persen layar pada halaman admin mana pun,
  diukur dengan hitung piksel pada 1440 x 900.
- Tidak ada blok hijau yang lebih besar dari sebuah tombol.
- Seluruh pasangan teks dan latar lolos 4.5:1, batas komponen lolos 3:1.

### T-18. Jadwal rutin dan salin minggu pada timetable

Tiket paling penting di seluruh backlog dari sisi operasional. Jadwal kosong
sejak 9 Oktober bukan karena lupa, tetapi karena kelas harus dibuat satu per
satu.

- Form jadwal rutin: pilih hari, jam mulai, studio, tipe kelas, instruktur,
  tanggal mulai, tanggal akhir.
- Sebelum disimpan, tampilkan berapa kelas yang akan dibuat dan apakah ada
  tabrakan dengan jadwal yang sudah ada.
- Tombol `Salin minggu ini ke minggu depan` dan `Salin ke empat minggu ke
  depan`.
- Tombol hari ditulis tiga huruf, Sen Sel Rab Kam Jum Sab Min, karena Senin,
  Selasa, dan Sabtu sama sama berawal S.
- Tanggal ditulis `2 Nov 2026`, bukan format angka yang bisa terbaca
  terbalik. Jam ditulis 24 jam dengan titik, `08.00`.

Selesai jika:
- Satu orang bisa mengisi jadwal tiga bulan ke depan dalam satu kali isi
  form, tanpa membuat kelas satu per satu.
- Kelas yang sudah dipesan tidak pernah tertimpa.

### T-19. Papan peringatan minggu kosong

- Deret chip per minggu di atas timetable: minggu berisi kelas berwarna
  netral, minggu kosong berwarna merah dengan kata `Kosong`.
- Peringatan di atas halaman kalau ada minggu kosong dalam empat minggu ke
  depan, lengkap dengan tombol `Isi pakai jadwal rutin`.
- Peringatan yang sama muncul di halaman Hari Ini front desk dan di halaman
  owner.

Selesai jika:
- Jadwal kosong tidak bisa lagi berjalan 17 hari tanpa ada yang melihatnya.

### T-20. Halaman Hari Ini untuk front desk

- Dua kartu di atas: kelas yang berjalan sekarang dan kelas berikutnya,
  lengkap dengan instruktur, studio, dan keterisian.
- Daftar hadir kelas berjalan di bawahnya, dengan tombol `Tandai hadir` per
  orang dan sisa sesinya.
- Tiga tombol besar di kanan: buat booking manual, pindahkan jadwal booking,
  cari pelanggan.
- Kartu `Perlu dibereskan di cabang ini` berisi masalah cabang itu saja,
  masing masing dengan tautannya.
- Hapus kartu statistik yang tidak bisa ditindaklanjuti.

Selesai jika:
- Petugas bisa menandai kehadiran tanpa berpindah halaman.
- Tidak ada angka di layar ini yang tidak punya tombol tindakannya.

### T-21. Layar pemeriksaan bukti transfer

- Nominal pada paket dan nominal pada bukti disandingkan berdampingan
  sebagai elemen terbesar di layar, dengan selisihnya ditulis dengan kata.
- Gambar bukti minimal 420 px, dengan tombol perbesar dan putar.
- Tiga keputusan: setujui dan aktifkan paket, minta perbaikan bukti, tolak
  pembayaran.
- Tombol setujui tidak aktif sebelum gambar bukti dibuka.
- Setelah diputuskan, antrean langsung pindah ke bukti berikutnya.
  Keputusan baru dikirim ke server setelah 10 detik; `Batalkan` hanya
  bekerja sebelum terkirim. Setelah terkirim tidak ada pembalikan
  (buku besar pembelian tidak bisa diubah).
- Tidak ada tombol setujui banyak sekaligus.

Selesai jika:
- Petugas tidak bisa menyetujui pembayaran tanpa pernah melihat buktinya.
- Selisih nominal terbaca tanpa petugas perlu menghitung sendiri.

### T-22. Mode cepat antrean verifikasi identitas

- Satu berkas satu layar: foto identitas besar di kiri, nama dan tanggal
  lahir pada akun di kanan.
- Pintasan papan ketik: S setujui, U minta foto ulang, T tolak, L lewati,
  Z batalkan keputusan terakhir selama masih dalam tahan 10 detik sebelum
  terkirim. Persetujuan yang sudah terkirim terkunci permanen dan tidak bisa
  dibalik.
- Yang dilewati masuk daftar `Perlu dilihat ulang`, tidak hilang.
- Tulis di layar bahwa nomor identitas tidak perlu dibaca atau dicatat.
- Penghitung sisa antrean terlihat terus.

Selesai jika:
- Satu berkas bisa diputuskan tanpa menyentuh tetikus.
- Tidak ada tombol setujui banyak sekaligus.

# Backlog implementasi Daily Dose Pilates v2

Tiket diurutkan berdasarkan dampak ke konversi dan kepercayaan member.
Kerjakan satu per satu, urut nomor. Jangan gabung beberapa tiket dalam satu
perubahan.

Rujukan: `02-SPEC-DESAIN.md` dan mockup 12 artboard di kanvas desain.

Keterangan ukuran: S kurang dari 1 hari, M 1 sampai 3 hari, L lebih dari
3 hari. Perkiraan ini dari sisi desain, bukan dari pembacaan basis kode.

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

Keputusan yang perlu diambil pemilik sebelum tiket ini dikerjakan:
halaman kiosk sekarang terbuka publik tanpa login, ditautkan di footer
situs, dengan URL yang mudah ditebak. Pilihan: lepas tautan dari footer,
beri kode akses, atau pasangkan ke perangkat tertentu.

Selesai jika:
- Jam, kelas berikutnya, dan QR terbaca dari jarak 2 meter.
- QR hasil tangkapan layar tidak bisa dipakai setelah masa berlakunya
  habis.
- Keputusan keamanan sudah diambil dan diterapkan.

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
5. Login dengan kode WhatsApp. Penyedia pengiriman belum ditentukan.
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
- Setelah diputuskan, antrean langsung pindah ke bukti berikutnya, dengan
  pembatalan 10 detik.
- Tidak ada tombol setujui banyak sekaligus.

Selesai jika:
- Petugas tidak bisa menyetujui pembayaran tanpa pernah melihat buktinya.
- Selisih nominal terbaca tanpa petugas perlu menghitung sendiri.

### T-22. Mode cepat antrean verifikasi identitas

- Satu berkas satu layar: foto identitas besar di kiri, nama dan tanggal
  lahir pada akun di kanan.
- Pintasan papan ketik: S setujui, U minta foto ulang, T tolak, L lewati,
  Z batalkan keputusan terakhir dalam 10 detik.
- Yang dilewati masuk daftar `Perlu dilihat ulang`, tidak hilang.
- Tulis di layar bahwa nomor identitas tidak perlu dibaca atau dicatat.
- Penghitung sisa antrean terlihat terus.

Selesai jika:
- Satu berkas bisa diputuskan tanpa menyentuh tetikus.
- Tidak ada tombol setujui banyak sekaligus.

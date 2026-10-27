# Laporan UAT Daily Dose Pilates v2

Hasil pengujian berulang pada v2.dailydosepilates.com, 6 sampai 26 Oktober
2026. Pengujian dilakukan di layar 375 x 812 px untuk sisi publik, member,
dan instruktur, serta di layar lebar untuk sisi superadmin.

Semua pengujian bersifat baca saja. Tidak ada data yang diubah, disetujui,
dihapus, atau dikirim.

Dokumen ini terpisah dari revisi UX. Yang di sini adalah hal yang tidak
berjalan sebagaimana mestinya, bukan usulan desain.

---

## Ringkasan status per 26 Oktober 2026

| Tingkat | Jumlah | Keterangan |
|---|---|---|
| Kritis | 9 | Menghalangi transaksi atau berisiko uang dan data |
| Tinggi | 7 | Membuat angka atau status tidak bisa dipercaya |
| Sedang | 8 | Mengganggu pemakaian, tidak menghalangi |
| Teks dan tampilan | 6 | Kode sistem dan istilah teknis terlihat pengguna |

Sudah diperbaiki sejak pengujian pertama: 14 temuan. Daftarnya ada di
bagian akhir.

---

## Kritis

### B-01. Tidak ada kelas terjadwal sejak 9 Oktober
Terakhir dicek 26 Okt, masih terjadi.

Kelas terakhir di sistem mulai 9 Oktober pukul 19.00. Pengecekan langsung
ke data server untuk rentang 26 Oktober sampai 25 November menghasilkan
nol kelas di kelima cabang, baik di jadwal publik maupun di admin.

Dampak: customer tidak bisa booking apa pun selama lebih dari dua minggu.

Ini kemungkinan masalah operasional, bukan cacat perangkat lunak. Tetapi
akibatnya sama: aplikasi tidak bisa dipakai. Perlu dipastikan apakah kelas
memang belum dibuat, atau ada kegagalan saat publikasi.

Catatan: selama ini belum beres, pengujian booking, reschedule, QR,
presensi instruktur, dan layar kiosk tidak bisa dilakukan.

### B-02. Booking masuk ke kelas yang sudah penuh
Terakhir dicek 26 Okt, masih ada 15 kelas bermasalah.

Contoh yang terukur dari data server:

| Cabang | Waktu | Terisi / kapasitas |
|---|---|---|
| Muara Karang | 1 Okt 09.00 | 6 / 4 |
| Muara Karang | 1 Okt 18.00 | 5 / 4 |
| Muara Karang | 7 Okt 18.00 | 5 / 4 |
| PIK 2 | 3 Okt 08.00 | 5 / 2 |
| PIK 2 | 3 Okt 09.00 | 4 / 2 |

Bukti bahwa ini bukan hanya data migrasi: Muara Karang 7 Oktober pukul
18.00 dan 19.00 tercatat "Penuh, 0/4" saat dicek 6 Oktober, lalu menjadi
5/4 pada pengecekan berikutnya. Artinya booking masih bisa masuk setelah
kelas penuh.

Dugaan penyebab: pengecekan kuota dan penyimpanan booking tidak berada
dalam satu transaksi, sehingga dua permintaan bersamaan sama-sama lolos.

Perbaikan: kunci kuota di server saat konfirmasi, dalam satu transaksi,
termasuk untuk booking manual yang dibuat admin.

### B-03. Sesi terpakai sebelum pembayaran disetujui
Terakhir dicek 26 Okt, masih terjadi.

Pada antrean pembayaran, pesanan atas nama Lusianna untuk paket
"[BEST DEAL 10.10] 8 Sessions Private Group" berstatus "Menunggu
pemeriksaan", tetapi tercatat "0 dipesan, 2 terpakai".

Dampak: sesi terpakai tanpa pembayaran yang disetujui.

Perbaikan: blokir booking dari paket yang pembayarannya belum disetujui.
Audit paket lain dengan pola yang sama.

### B-04. 895 pembayaran menunggu, tertua sejak 2 Oktober
Terakhir dicek 26 Okt, jumlahnya tetap.

Seluruh 895 pembayaran berstatus "Menunggu pemeriksaan" dan semuanya sudah
lewat 24 jam. Bukti transfer tertua dikirim 2 Oktober.

Pembayaran memakai nominal berkode unik, contoh Rp 1.900.844, yang
seharusnya bisa dicocokkan otomatis dengan mutasi rekening.

Pada halaman Keuangan, tiga angka ini persis sama:

- Ekspektasi pembayaran: Rp 13.008.354.790
- Diterima rekening: Rp 13.008.354.790
- Disetujui manual atau gateway: Rp 13.008.354.790

Angka yang identik mengarah pada dugaan bahwa sistem belum membaca mutasi
rekening yang sebenarnya, melainkan menyalin nilai dari pesanan.

Status dugaan. Saya tidak bisa melihat mutasi rekening, jadi developer
perlu memastikan apakah pencocokan otomatis memang belum berjalan atau
datanya yang belum masuk.

### B-05. Tombol "Setujui" langsung di daftar pembayaran
Ditemukan 26 Okt.

Pada halaman antrean pembayaran terdapat 20 tombol "Setujui" yang bisa
ditekan langsung dari daftar, tanpa membuka bukti transfer lebih dulu.

Saya tidak menekan tombol itu, jadi belum diketahui apakah ada dialog
konfirmasi sesudahnya.

Perbaikan: wajibkan membuka detail atau pratinjau bukti sebelum menyetujui,
atau tambahkan konfirmasi yang menyebut nama pelanggan dan nominal.

### B-06. Notifikasi WhatsApp belum terkirim
Terakhir dicek 26 Okt, masih mode uji.

Halaman Otomasi WhatsApp menyatakan penyedia WhatsApp belum dikonfigurasi,
sehingga pesan hanya dicatat di log. Jumlah pesan terkirim nol.

Dampak: pengingat kelas, pembatalan otomatis H-24, dan pemberitahuan hasil
verifikasi tidak sampai ke customer maupun instruktur.

### B-07. Tombol otomasi tanpa pengaman
Terakhir dicek 26 Okt, masih terbuka.

Tombol "Jalankan Auto-Cancel H-24" dan "Jalankan Reminder Batch" berdiri
bebas di halaman Otomasi, bisa ditekan dalam satu klik.

Saya tidak menekan keduanya.

Perbaikan: tambahkan dialog konfirmasi yang menyebut dampaknya, misalnya
jumlah kelas yang akan dibatalkan dan jumlah pesan yang akan dikirim.
Batasi ke superadmin dan catat pelakunya di log audit.

### B-08. Layar kiosk terbuka publik
Ditemukan 26 Okt.

Halaman `/kiosk` dan `/kiosk/<kode cabang>` dapat dibuka siapa saja dari
internet tanpa login. Tautannya ada di footer situs publik, dan pola URL
mudah ditebak, contoh `/kiosk/dd-gg`.

Isinya: alamat lengkap kelima studio dan QR presensi instruktur.

Pengaman satu-satunya adalah pencocokan GPS ponsel instruktur.

Perbaikan yang disarankan: lepas tautan dari footer publik, beri kode akses
atau pasangkan ke perangkat studio, dan putar QR secara berkala supaya
tangkapan layar tidak bisa dipakai ulang.

Ini keputusan pemilik, bukan hanya pekerjaan teknis.

### B-09. Data uji bercampur data produksi
Terakhir dicek 26 Okt, masih ada.

Akun yang ditemukan:

- Instruktur `ridhoinstruktur@example.com`, status aktif
- Instruktur dengan nama "-" dan email `dummy@example.com`
- Dua akun pelanggan bernama "Test"
- Pengguna internal `admin_test`

Satu akun instruktur uji diberi kata sandi lemah saat pengujian. Akun itu
perlu dinonaktifkan atau kata sandinya diganti sebelum go-live, karena
sistem ini memuat data asli termasuk foto KTP pelanggan.

---

## Tinggi

### B-10. Angka booking aktif berbeda antar halaman
Terakhir dicek 26 Okt.

Dasbor menampilkan 1.099 untuk kehadiran dan booking, sedangkan halaman
Booking menampilkan 15.134 booking aktif.

Kemungkinan keduanya memakai definisi berbeda (periode terpilih dibanding
total). Kalau memang begitu, labelnya yang perlu dibedakan.

### B-11. Antrean verifikasi punya tiga angka berbeda
Terakhir dicek 26 Okt.

- Dasbor: 4.560 verifikasi menunggu
- Halaman Verifikasi, kotak "Dalam antrean": 4.560
- Daftar pada halaman yang sama: "Menampilkan 1 sampai 10 dari 9.254 data"

Angka 9.254 adalah jumlah seluruh pelanggan, bukan jumlah antrean. Daftar
yang difilter status menunggu seharusnya menampilkan 4.560.

### B-12. Honor instruktur nol, sehingga profit sama dengan omzet
Terakhir dicek 26 Okt.

Seluruh instruktur tercatat Rp 0. Akibatnya laporan laba rugi menunjukkan
margin 100 persen, dan halaman Performa Cabang menampilkan Rp 0 untuk
semua kolom.

Dampak: laporan keuangan tidak bisa dipakai untuk mengambil keputusan.

### B-13. Booking kembar
Terakhir dicek 15 Okt.

Pelanggan yang sama muncul beberapa kali pada kelas dan jam yang sama.
Contoh: Fera Julia empat kali pada 5 Oktober pukul 11.00, sherly luciana
dan hermi subianty masing-masing dua kali.

Kalau ini booking untuk teman, tampilannya perlu menyebut jumlah orang.
Kalau bukan, perlu dicegah.

### B-14. Daftar booking tidak urut tanggal
Terakhir dicek 15 Okt.

Daftar menampilkan 6 Okt, lalu 5 Okt, lalu 3 Okt, lalu 7 Okt. Front desk
kesulitan mencari kelas hari ini.

### B-15. Anomali keuangan berisi data 2023
Ditemukan 15 Okt.

Daftar deteksi anomali penuh dengan entri "VERIFIKASI_TERTAHAN" bertanggal
Agustus 2023, kemungkinan data migrasi lama. Anomali baru tenggelam di
antaranya.

### B-16. Server sesekali menjawab error 500
Ditemukan 13 Okt, tidak konsisten.

Permintaan data akun, dasbor, dan detail staf sesekali gagal, sehingga
halaman menampilkan "Konteks sesi tidak dapat dimuat" atau sempat
menampilkan booking nol. Saat diulang 10 kali berturut-turut, semuanya
normal.

Perlu pemeriksaan log server di sekitar 13 Oktober pukul 11.50 WIB dan
15 Oktober pukul 11.47 WIB.

---

## Sedang

### B-17. Paket kedaluwarsa masih punya tombol booking
Terakhir dicek 20 Okt, dari sisi member.

Halaman "Paket Saya" menampilkan paket yang berakhir 30 September 2024
dengan keterangan "Tersedia 14" dan tombol "Booking kelas".

### B-18. Riwayat booking tanpa tahun
Terakhir dicek 20 Okt.

Tertulis "Rab, 2 Okt" untuk kelas tahun 2023 dan 2024. Pada 2026, "Rab,
2 Okt" terbaca seperti minggu ini. Tanggal 2 Oktober 2026 sendiri jatuh
hari Jumat, jadi penanggalannya juga perlu diperiksa.

### B-19. Riwayat booking menampilkan info yang tidak relevan
Terakhir dicek 20 Okt.

Booking yang sudah dibatalkan atau selesai masih menampilkan "Ketersediaan
slot" dan tombol "Lihat detail dan QR Pass".

Ditemukan juga satu baris berbunyi "4/2 terisi" pada riwayat, yang
menguatkan temuan B-02.

### B-20. Hitungan pesanan salah
Terakhir dicek 20 Okt.

Halaman "Pesanan Saya" menampilkan semua penghitung status bernilai 0 dan
baris "Menampilkan 1 dari 0 pesanan", padahal ada satu pesanan disetujui.

### B-21. Tombol "Booking kelas" membuka halaman perantara
Terakhir dicek 20 Okt.

Tombol di beranda member membuka halaman berisi "Pilih jadwal kelas
terlebih dahulu", bukan jadwal itu sendiri. Satu langkah sia-sia.

### B-22. Instruktur melihat tombol dan teks administrasi
Terakhir dicek 7 Okt.

Halaman Kelas untuk instruktur memakai teks "Pilih satu cabang pada topbar
untuk membuat atau mengubah kelas" dan menampilkan tombol "Buat kelas"
yang tidak berhak dipakai.

Pemilih cabang menampilkan semua cabang, termasuk yang bukan penugasannya.
Error "Cabang tidak ditemukan atau Anda tidak ditugaskan di cabang
tersebut" baru muncul setelah cabang dipilih.

Tombol "Beranda" instruktur melempar ke halaman Kelas, bukan ke halaman
awal instruktur.

### B-23. Ketersediaan mengajar diisi satu tanggal per pengajuan
Terakhir dicek 7 Okt.

Tidak ada opsi berulang mingguan, sehingga instruktur mengisi hari demi
hari.

### B-24. Alamat studio pada profil member tidak cocok
Terakhir dicek 20 Okt.

Pada halaman Profil, studio utama Green Garden ditampilkan dengan alamat
"Pluit Karang Cantik Blok P 3 Timur No. 18, Muara Karang", sedangkan
halaman Studio menampilkan alamat Green Garden di Jl. Panjang No. 30,
Kedoya.

Bisa jadi soal data, bisa juga profil mengambil dari kolom yang salah.

---

## Teks dan tampilan

### B-25. Kode sistem terlihat pengguna
Terakhir dicek 26 Okt.

| Kode | Tempat |
|---|---|
| `ALL_LEVELS` | Kartu kelas populer di beranda |
| `DD-GG`, `DD-MK`, `DD-SBY`, `DD-PIK2`, `DD-UNTAR` | Pemilih studio di Jadwal, halaman Kiosk |
| `VERIFIKASI_TERTAHAN`, `WARNING`, `SEVERITY` | Halaman Keuangan |
| `SENT`, `FAILED`, `Idempotensi`, `ReminderLog` | Halaman Otomasi WhatsApp |
| `Versi data`, `role assignment` | Halaman detail staf |
| `KYC` | Judul form verifikasi member |
| `dd-checkin:v1`, `payload` | Halaman scan presensi instruktur |

### B-26. Label berbahasa Inggris di tengah teks Indonesia
Terakhir dicek 26 Okt.

Dasbor masih memakai "GROSS SALES" dan "PROJECTION COST".

Beranda publik sudah diperbaiki pada pembaruan 26 Oktober.

### B-27. Nama paket belum dirapikan
Terakhir dicek 26 Okt.

Masih ditemukan "12 PVG Free 2 Sesi" dan "[PROMO] 20 Sessions Private Group
Class FREE 3 Ses" yang terpotong di tengah kata.

Tagline tiap kartu paket masih berulang dan generik.

### B-28. Riwayat audit staf kosong
Terakhir dicek 15 Okt.

Halaman detail staf mencatat akun diperbarui pada tanggal tertentu, tetapi
bagian "Aktivitas Audit" menyatakan belum ada aktivitas.

### B-29. Nama tombol reset kata sandi tidak konsisten
Terakhir dicek 7 Okt.

Di daftar Staf namanya "Kirim setup password", di halaman detail "Reset
kata sandi", dan form yang terbuka ternyata mengganti kata sandi langsung,
bukan mengirim tautan.

Teks pada bagian Keamanan menyatakan tautan setup "tidak pernah ditampilkan
di panel", yang bertentangan dengan fungsi form itu.

### B-30. sitemap.xml belum ada
Terakhir dicek 26 Okt.

`/sitemap.xml` menghasilkan 404. `robots.txt` sudah ada.

---

## Perlu direview, bukan bug

### R-01. Cakupan cabang superadmin berubah ke satu cabang
Ditemukan 26 Okt.

Halaman Instruktur, Keuangan, Sesi Pelanggan, Performa Cabang, dan Booking
kini berawal pada "Daily Dose Green Garden", bukan "Semua cabang" seperti
sebelumnya.

Akibat yang terlihat: daftar instruktur menampilkan 22 dari sebelumnya 70,
Keuangan dan Performa Cabang menampilkan Rp 0 untuk periode berjalan, dan
halaman Booking sempat menampilkan total 0 sebelum data cabang dimuat.

Kalau ini disengaja, superadmin kehilangan gambaran lintas cabang. Kalau
tidak, perlu dikembalikan.

### R-02. Email pelanggan hasil migrasi
Ditemukan 6 Okt, belum dicek ulang.

Pola email pada daftar pelanggan terlihat seperti dibentuk dari nama depan,
contoh `rini@gmail.com`, `tina@gmail.com`, `mira@gmail.com`.

Kalau benar bukan email asli, reset kata sandi akan terkirim ke orang lain
dan pelanggan lama tidak bisa masuk.

Status dugaan dari pola penamaan, belum diverifikasi ke sumber data
migrasi.

### R-03. Apakah member lama tetap wajib verifikasi KTP
Keputusan pemilik.

Member lama yang sudah bertahun-tahun berlatih kini diminta mengunggah KTP
dan selfie sebelum bisa booking. Alternatifnya, member lama diverifikasi
front desk saat datang ke studio.

---

## Sudah diperbaiki selama periode pengujian

Dicatat supaya tidak dikerjakan ulang.

| Temuan | Diperbaiki |
|---|---|
| Nomor WhatsApp dummy 6281234567890 | 13 Okt, diganti 62895329736127 |
| Halaman salah dilempar ke login, bukan 404 | 13 Okt, lalu 404 kosong, lalu beres 20 Okt |
| Halaman Syarat dan Kebijakan Privasi belum ada | 13 Okt |
| KTP dan selfie wajib saat daftar | 13 Okt, jadi opsional |
| Login hanya email | 13 Okt, bisa nomor WhatsApp |
| Lonceng notifikasi superadmin error 500 | 15 Okt |
| Penghitung staf tidak konsisten | 15 Okt |
| Penghitung "Menunggu lebih dari 24 jam" salah | 15 Okt |
| Voucher persen tampil sebagai rupiah | 15 Okt |
| Daftar paket admin terpotong di 20 | 15 Okt |
| Istilah teknis di admin (Rule #, ledger authoritative, Optimistic locking) | 15 Okt |
| Testimoni tanpa nama (Member Komunitas, Member Rutin) | 26 Okt |
| Alamat studio belum tampil di halaman Studio | 26 Okt |
| Panduan memuat BSD, Barre, APPROVED, LUNAS, KYC | 26 Okt |
| Promo Juli masih dijual di Muara Karang | 26 Okt |
| Kapasitas beranda tertulis 6 sampai 8 peserta | 26 Okt, jadi 4 |

---

## Batasan laporan ini

- Semua pengujian baca saja. Tidak ada aksi simpan, ubah, setujui, atau
  hapus yang dijalankan, sehingga pesan kesalahan pada form belum diuji.
- Sisi customer setelah login diuji dengan satu akun yang belum
  terverifikasi, sehingga pembelian paket, booking, reschedule, dan QR
  belum bisa dicoba.
- Sisi instruktur diuji dengan akun tanpa penugasan cabang, sehingga daftar
  kelas, peserta, presensi, dan honor belum bisa dicoba.
- Tampilan desktop dan tablet belum diuji menyeluruh.
- B-04 dan R-02 berstatus dugaan, ditandai jelas di masing-masing bagian.

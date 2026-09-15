# -*- coding: utf-8 -*-
"""
Kamus Lengkap Fungsi Bisnis, Alur & Alasan Pemisahan 97 Model Tabel Daily Dose Pilates V2.
"""

MODEL_PURPOSES = {
    # =========================================================================
    # DOM-01: master.prisma (10 Models)
    # =========================================================================
    'Cabang': {
        'role_title': 'Unit Cabang Studio Fisik',
        'purpose': 'Menyimpan data induk lokasi fisik studio Pilates (contoh: Cabang Senopati, Dharmawangsa, Menteng) mencakup nama resmi, kode cabang unik, alamat lengkap, nomor WhatsApp resepsionis, serta titik koordinat GPS.',
        'workflow': 'Didaftarkan oleh Super Admin saat membuka cabang baru atau saat memperbarui kontak operasional dan manajer penanggung jawab cabang.',
        'why_separated': 'Sebagai root entitas multi-tenancy internal; seluruh inventaris alat reformer, jadwal kelas harian, paket wilayah, dan penempatan staf diikat langsung pada unit cabang tertentu.'
    },
    'ProfilPublikCabang': {
        'role_title': 'Profil Informasi Publik Cabang (Website)',
        'purpose': 'Menyediakan data konten pemasaran cabang untuk landing page publik website: galeri foto studio, deskripsi fasilitas (loker, shower, ruang santai), petunjuk akses transportasi, dan ketersediaan valet parkir.',
        'workflow': 'Diisi dan dimutakhirkan oleh tim Marketing atau Admin Konten saat ada pembaruan foto interior atau penambahan fasilitas di cabang.',
        'why_separated': 'Memisahkan data operasional internal privat cabang (NPWP, izin usaha, rekening bank) dari konten display pemasaran yang bebas diakses publik tanpa login.'
    },
    'Studio': {
        'role_title': 'Gedung / Area Studio Spesifik',
        'purpose': 'Mendefinisikan zona studio atau lantai tertentu di dalam cabang (contoh: Main Studio Lantai 1, Private Studio Lantai 2).',
        'workflow': 'Dikonfigurasi oleh Admin Cabang saat penataan denah fasilitas studio bertingkat atau saat ada penambahan area latihan baru.',
        'why_separated': 'Mendukung skalabilitas hierarki studio multi-lantai; satu cabang fisik dapat memiliki beberapa area studio mandiri dengan pintu akses berbeda.'
    },
    'Ruangan': {
        'role_title': 'Ruangan Fisik Latihan Pilates',
        'purpose': 'Mencatat ruangan aktual tempat kelas berlangsung beserta kapasitas maksimal ranjang Reformer, Wunda Chair, Cadillac, atau Matras lantai.',
        'workflow': 'Didaftarkan saat setup awal cabang atau saat studio menambah unit ranjang reformer baru di ruangan latihan.',
        'why_separated': 'Mencegah over-booking kapasitas fisik; satu ruangan latihan tidak boleh dijadwalkan untuk dua kelas berbeda pada rentang waktu yang bertabrakan.'
    },
    'JamOperasionalCabang': {
        'role_title': 'Jadwal Buka & Tutup Cabang',
        'purpose': 'Menentukan jam buka dan jam tutup studio per hari dalam seminggu (Senin s/d Minggu) serta batas penerimaan member terakhir.',
        'workflow': 'Diatur oleh Manajer Cabang untuk jadwal reguler mingguan atau saat penyesuaian jam kerja hari libur nasional.',
        'why_separated': 'Memisahkan kebijakan waktu buka studio dari pembuatan slot kelas, agar sistem otomatis memblokir pembuatan jadwal di luar jam operasional studio.'
    },
    'JenisKelas': {
        'role_title': 'Katalog Tipe Kelas Pilates',
        'purpose': 'Master kurikulum tipe kelas latihan yang ditawarkan studio (misal: Group Reformer, Private 1-on-1, Duet Reformer, Prenatal Pilates, Jumpboard Cardio).',
        'workflow': 'Dibuat oleh Manajemen Studio / Head Coach saat merancang format latihan atau paket kurikulum baru.',
        'why_separated': 'Menjadi standar acuan bagi paket kuota membership, kualifikasi instruktur pengajar, perhitungan honor, dan durasi default latihan.'
    },
    'ProfilPublikKelas': {
        'role_title': 'Konten Pemasaran Tipe Kelas (Website)',
        'purpose': 'Menyimpan teks promosi, deskripsi manfaat kebugaran, tingkat kesulitan (Beginner, Intermediate, Advanced), dan anjuran pakaian untuk halaman katalog website.',
        'workflow': 'Dikelola oleh tim Marketing untuk menarik minat calon member baru yang sedang menjelajahi website.',
        'why_separated': 'Memisahkan teks editorial promosi yang sering berganti dari konfigurasi logika komputasi kelas di backend.'
    },
    'CakupanCabangJenisKelas': {
        'role_title': 'Ketersediaan Jenis Kelas per Cabang',
        'purpose': 'Tabel relasi (many-to-many) yang menentukan jenis kelas mana saja yang aktif dan tersedia di masing-masing cabang studio.',
        'workflow': 'Ditetapkan saat cabang dibuka atau saat suatu cabang mendapatkan fasilitas alat khusus (contoh: hanya cabang tertentu yang menyediakan alat Cadillac untuk kelas Private).',
        'why_separated': 'Menjamin fleksibilitas antar cabang; tidak semua cabang studio memiliki ruangan atau alat yang sama untuk menyelenggarakan semua jenis kelas.'
    },
    'KonfigurasiJenisKelasCabang': {
        'role_title': 'Kebijakan Operasional Kelas per Cabang',
        'purpose': 'Menyimpan pengaturan lokal per cabang untuk tipe kelas tertentu (contoh: batas menit pembatalan/late-cancel, kapasitas ranjang default, jeda istirahat antar sesi).',
        'workflow': 'Diatur oleh Manajer Cabang jika karakteristik operasional cabangnya membutuhkan penyesuaian aturan dari standar global pusat.',
        'why_separated': 'Mendukung desentralisasi aturan cabang tanpa merusak atau menduplikasi master kurikulum jenis kelas nasional.'
    },
    'KonfigurasiEfektif': {
        'role_title': 'Cache Konfigurasi Operasional Aktif',
        'purpose': 'Menyimpan hasil kalkulasi akhir dari penggabungan aturan default global dan aturan override cabang untuk mempercepat proses query booking.',
        'workflow': 'Dihitung dan diperbarui otomatis oleh sistem saat admin menyimpan perubahan konfigurasi cabang.',
        'why_separated': 'Optimasi performa query database; menghindari operasi JOIN berlapis yang lambat saat ratusan member mengakses halaman booking bersamaan.'
    },

    # =========================================================================
    # DOM-02: identity.prisma (19 Models)
    # =========================================================================
    'User': {
        'role_title': 'Akun Otentikasi & Identitas Utama',
        'purpose': 'Entitas akun login pusat yang menyimpan email terverifikasi, nomor ponsel E.164, status akun (aktif/banned), tanggal registrasi, dan penanda verifikasi.',
        'workflow': 'Dibuat saat pelanggan mendaftar akun di web/mobile atau saat Super Admin mengundang staf/instruktur baru ke sistem.',
        'why_separated': 'Prinsip Single Identity (SSO); memisahkan kredensial autentikasi teknis dari data biodata pribadi dan wewenang peran pengguna.'
    },
    'ProfilPengguna': {
        'role_title': 'Biodata & Data Diri Pengguna',
        'purpose': 'Menyimpan identitas personal pengguna: nama lengkap, nama panggilan, tanggal lahir, jenis kelamin, alamat rumah, preferensi bahasa, dan riwayat cedera/kesehatan ringkas.',
        'workflow': 'Diisi oleh pengguna saat proses onboarding awal dan dapat diperbarui melalui menu profil akun.',
        'why_separated': 'Normalisasi data profil; jika satu akun memiliki multi-peran (misal staf yang juga member aktif), biodata pribadinya tetap tunggal dan konsisten.'
    },
    'AliasKontakPengguna': {
        'role_title': 'Kontak Cadangan & Nomor Darurat',
        'purpose': 'Mencatat nomor kontak sekunder atau nomor kontak darurat (keluarga/kerabat) pengguna untuk penanganan insiden.',
        'workflow': 'Diisi oleh member saat melengkapi profil kesehatan atau formulir keselamatan latihan pilates.',
        'why_separated': 'Kebutuhan standar keselamatan studio olahraga; nomor kontak darurat disimpan mandiri tanpa mencemari tabel akun User.'
    },
    'DokumenVerifikasiIdentitas': {
        'role_title': 'Berkas Dokumen KYC (KTP / Paspor)',
        'purpose': 'Menyimpan metadata foto kartu identitas resmi (KTP, Paspor, KITAS) dan foto selfie verifikasi member untuk mencegah akun fiktif atau penyalahgunaan promo.',
        'workflow': 'Diunggah oleh member di halaman verifikasi akun; diperiksa oleh Staf Reviewer melalui antrean verifikasi KYC.',
        'why_separated': 'Kepatuhan privasi tingkat tinggi (UU Perlindungan Data Pribadi / GDPR); berkas identitas wajib disimpan di storage privat berenkripsi terpisah dari foto publik.'
    },
    'OtorisasiLihatDokumenIdentitas': {
        'role_title': 'Audit Izin Akses Buka KTP Privat',
        'purpose': 'Mencatat izin akses sementara (time-limited authorization) saat seorang staf reviewer membuka dan memeriksa foto KTP member.',
        'workflow': 'Dibuat otomatis oleh backend saat reviewer mengklik tombol tinjau dokumen di dashboard.',
        'why_separated': 'Jejak rekam forensik keamanan; membuktikan secara legal siapa staf yang melihat KTP member, kapan, dan untuk verifikasi apa.'
    },
    'AntreanHapusDokumenIdentitas': {
        'role_title': 'Antrean Retensi & Penghapusan KTP',
        'purpose': 'Daftar antrean otomatis untuk menghapus berkas fisik KTP dari cloud storage setelah masa verifikasi selesai atau saat akun ditutup.',
        'workflow': 'Didaftarkan otomatis saat verifikasi disetujui; dieksekusi berkala oleh background scheduler.',
        'why_separated': 'Kepatuhan batas retensi data privasi; mencegah penumpukan data foto KTP sensitif yang sudah tidak relevan.'
    },
    'Identitas': {
        'role_title': 'Koneksi Akun Sosial (Google / Apple SSO)',
        'purpose': 'Menyimpan tautan identitas login pihak ketiga (Google OAuth, Apple ID) yang terhubung ke akun User Daily Dose.',
        'workflow': 'Tercatat saat pengguna memilih opsi "Masuk dengan Google" atau "Masuk dengan Apple".',
        'why_separated': 'Memungkinkan satu akun member memiliki beberapa metode masuk (email/password dan Google SSO) secara fleksibel.'
    },
    'Penugasan': {
        'role_title': 'Penugasan Staf ke Cabang Operasional',
        'purpose': 'Menghubungkan staf internal, kasir, atau instruktur ke satu atau beberapa unit cabang tempat mereka bertugas.',
        'workflow': 'Ditetapkan oleh Super Admin / HRD saat menempatkan staf di cabang tertentu (misal: Cabang Senopati).',
        'why_separated': 'Isolasi wewenang operasional cabang; kasir di cabang A tidak boleh melihat atau mengutak-atik transaksi cabang B.'
    },
    'UserRole': {
        'role_title': 'Penetapan Peran ke Pengguna (User-to-Role)',
        'purpose': 'Tabel perantara yang menetapkan peran sistem ke akun pengguna (SUPER_OWNER, ADMIN, INSTRUCTOR, RECEPTIONIST, CUSTOMER).',
        'workflow': 'Diberikan otomatis saat registrasi (default CUSTOMER) atau diubah oleh Super Admin di panel manajemen peran.',
        'why_separated': 'Mendukung multi-peran; seorang instruktur bisa memiliki peran ganda sebagai member aktif tanpa perlu membuat akun berbeda.'
    },
    'RoleDefinition': {
        'role_title': 'Master Definisi Peran (Role Catalog)',
        'purpose': 'Katalog master daftar peran resmi yang berlaku di sistem Daily Dose Pilates beserta deskripsi tanggung jawab operasionalnya.',
        'workflow': 'Dikelola oleh arsitek sistem / Super Admin saat ada penambahan posisi jabatan baru di studio.',
        'why_separated': 'Menghilangkan peran hardcoded di kode program; manajemen peran dapat dikonfigurasi dinamis sesuai pertumbuhan bisnis.'
    },
    'CapabilityDefinition': {
        'role_title': 'Master Hak Akses Fitur (Capability)',
        'purpose': 'Katalog master izin akses terkecil dalam sistem (contoh: `branch:read`, `payment:verify`, `instructor:payroll`, `class:reschedule`).',
        'workflow': 'Didaftarkan oleh developer sistem setiap kali ada modul fitur baru yang diluncurkan.',
        'why_separated': 'Pondasi Granular RBAC; wewenang tidak diikat kaku ke nama jabatan, melainkan ke daftar kapabilitas fungsional spesifik.'
    },
    'RoleCapability': {
        'role_title': 'Matriks Hak Akses per Peran',
        'purpose': 'Tabel relasi yang menentukan daftar kapabilitas fitur apa saja yang dimiliki oleh suatu peran.',
        'workflow': 'Dikonfigurasi oleh Super Admin saat mengatur wewenang kerja resepsionis, kasir, atau manajer cabang.',
        'why_separated': 'Kemudahan penyesuaian wewenang kerja; Super Admin dapat mencabut atau menambah izin suatu peran tanpa mengubah kode program.'
    },
    'AccessRoleAssignment': {
        'role_title': 'Penugasan Peran dengan Batasan Wilayah',
        'purpose': 'Menetapkan peran tertentu kepada pengguna dengan batasan cakupan cabang atau studio spesifik.',
        'workflow': 'Dibuat saat seorang Admin hanya diangkat menjadi Admin Cabang Dharmawangsa, bukan Admin Pusat.',
        'why_separated': 'Mencegah eskalasi wewenang lintas wilayah dalam operasional multi-outlet studio.'
    },
    'UserCapabilityOverride': {
        'role_title': 'Pengecualian Izin Individual Pengguna',
        'purpose': 'Memberikan hak akses istimewa (grant) atau mencabut hak tertentu (revoke) kepada satu individu di luar peran standarnya.',
        'workflow': 'Diberikan oleh Super Admin jika ada staf senior yang memerlukan izin darurat tertentu.',
        'why_separated': 'Menyediakan fleksibilitas diskresi manajemen tanpa perlu repot-repot membuat peran baru untuk satu orang.'
    },
    'UserSession': {
        'role_title': 'Sesi Login Perangkat Aktif',
        'purpose': 'Mencatat sesi aktif di peramban atau smartphone (refresh token, IP address, user-agent browser, waktu kedaluwarsa).',
        'workflow': 'Dibuat saat pengguna sukses login; dimatikan saat pengguna logout atau saat admin mencabut sesi dari jarak jauh.',
        'why_separated': 'Fitur keamanan modern; memungkinkan pengguna melihat perangkat apa saja yang sedang terhubung dan melakukan remote logout.'
    },
    'AuthChallenge': {
        'role_title': 'Tantangan Verifikasi OTP / 2FA',
        'purpose': 'Menyimpan kode OTP WhatsApp/SMS sementara serta challenge dua faktor saat login baru atau konfirmasi tindakan sensitif.',
        'workflow': 'Dibuat otomatis saat pengguna meminta kode verifikasi, memiliki masa kedaluwarsa singkat (contoh: 5 menit).',
        'why_separated': 'Isolasi siklus hidup token sementara; kode verifikasi berumur sangat pendek dan langsung hangus setelah diverifikasi.'
    },
    'UserInvitation': {
        'role_title': 'Undangan Pendaftaran Karyawan Baru',
        'purpose': 'Mencatat tautan undangan registrasi untuk staf atau instruktur baru yang dikirimkan via email dengan token sekali pakai.',
        'workflow': 'Dibuat oleh HRD/Super Admin saat merekrut instruktur atau resepsionis baru.',
        'why_separated': 'Mencegah registrasi staf ilegal; pendaftaran akun internal studio hanya bisa dilakukan melalui token undangan resmi.'
    },
    'PasswordCredential': {
        'role_title': 'Kredensial Kata Sandi Terenkripsi',
        'purpose': 'Menyimpan hash kata sandi akun pengguna menggunakan algoritma kriptografi modern (Argon2id/Bcrypt) beserta salt.',
        'workflow': 'Dibuat saat pendaftaran akun atau diperbarui saat pengguna mengganti kata sandi.',
        'why_separated': 'Prinsip Zero-Trust Security; hash sandi dipisahkan dari tabel profil publik agar tidak mudah bocor dalam query biasa.'
    },
    'PasswordActionToken': {
        'role_title': 'Token Aksi Reset Kata Sandi',
        'purpose': 'Menyimpan token verifikasi sekali pakai yang dikirimkan ke email saat pengguna lupa kata sandi.',
        'workflow': 'Dibuat saat pengguna mengklik "Lupa Kata Sandi"; hangus otomatis setelah kata sandi baru berhasil disimpan.',
        'why_separated': 'Mencegah eksploitasi URL reset lama dan membatasi masa berlaku tautan pemulihan demi keamanan akun.'
    },

    # =========================================================================
    # DOM-03: packages.prisma (18 Models)
    # =========================================================================
    'Paket': {
        'role_title': 'Katalog Paket Sesi Pilates',
        'purpose': 'Master katalog paket membership (misal: Starter 5 Sesi, Regular 10 Sesi, Gold 20 Sesi, Unlimited 30 Hari) lengkap dengan harga dasar, kuota sesi, dan masa berlaku hari.',
        'workflow': 'Dibuat oleh Manajemen Studio saat meluncurkan produk penawaran sesi baru untuk dipasarkan.',
        'why_separated': 'Pusat master produk komersial; menjadi acuan bagi order pembelian (invoice), voucher promo, dan kuota sesi pelanggan.'
    },
    'RevisiPaket': {
        'role_title': 'Arsip Jejak Riwayat Harga Paket',
        'purpose': 'Menyimpan rekaman snapshot harga, kuota sesi, dan ketentuan lama setiap kali katalog paket diedit oleh admin.',
        'workflow': 'Tercatat otomatis oleh sistem saat admin mengubah harga atau spesifikasi paket yang sudah beredar.',
        'why_separated': 'Integritas audit akuntansi; transaksi pembelian masa lalu tetap mengacu pada harga revisi saat dibeli dan tidak berubah ketika harga katalog naik.'
    },
    'CakupanCabangPaket': {
        'role_title': 'Aturan Wilayah Cabang Berlaku Paket',
        'purpose': 'Menentukan apakah suatu paket berlaku di seluruh cabang (All Branch) atau hanya di cabang tertentu (Single Branch).',
        'workflow': 'Dikonfigurasi oleh Admin saat membuat paket promosi khusus pembukaan cabang baru.',
        'why_separated': 'Mencegah member menggunakan paket promo murah cabang suburban untuk memesan kelas di cabang premium pusat kota.'
    },
    'CakupanJenisKelasPaket': {
        'role_title': 'Pembatasan Tipe Kelas untuk Paket',
        'purpose': 'Mengatur jenis kelas apa saja yang boleh diambil menggunakan paket ini (misal: Paket Mat Only dilarang dipakai untuk kelas Reformer).',
        'workflow': 'Ditetapkan oleh Manajemen saat merancang spesifikasi paket keanggotaan.',
        'why_separated': 'Pengendalian margin operasional studio; mencegah sesi paket bertarif hemat digunakan pada kelas privat yang membutuhkan instruktur khusus.'
    },
    'ProfilPublikPaket': {
        'role_title': 'Etalase Kartu Paket Website (CMS)',
        'purpose': 'Menyimpan tampilan kartu paket di website publik: badge penanda "Terlaris", urutan susunan, deskripsi benefit, dan testimoni member.',
        'workflow': 'Dikelola oleh tim Marketing untuk mengoptimalkan tampilan konversi penjualan paket di website.',
        'why_separated': 'Memisahkan aspek tata letak promosi visual marketing dari komputasi saldo kuota sesi teknis.'
    },
    'BuktiPembayaran': {
        'role_title': 'Arsip Struk Bukti Transfer Bank',
        'purpose': 'Menyimpan berkas foto/gambar struk transfer manual yang diunggah customer beserta nomor rekening pengirim, nama bank, dan nominal transfer.',
        'workflow': 'Diunggah oleh customer setelah mentransfer biaya paket ke rekening bank studio; diperiksa oleh kasir/finance.',
        'why_separated': 'Manajemen lampiran privat; struk pembayaran diverifikasi secara teliti sebelum saldo kuota sesi diaktifkan.'
    },
    'OtorisasiLihatBuktiPembayaran': {
        'role_title': 'Izin Buka Struk Bukti Transfer',
        'purpose': 'Mencatat log audit saat kasir atau staf finance membuka gambar struk transfer bank customer untuk proses verifikasi.',
        'workflow': 'Dibuat otomatis oleh sistem saat kasir mengklik pratinjau bukti transfer di dashboard.',
        'why_separated': 'Perlindungan privasi data finansial member; mencegah staf non-keuangan sembarangan melihat rekening bank pribadi member.'
    },
    'RekeningPembayaran': {
        'role_title': 'Master Rekening Bank Studio',
        'purpose': 'Daftar nomor rekening bank resmi milik studio Daily Dose Pilates (BCA, Mandiri, BNI) atas nama perusahaan untuk tujuan transfer pelanggan.',
        'workflow': 'Didaftarkan oleh Manajer Keuangan dan ditampilkan pada petunjuk pembayaran customer saat checkout.',
        'why_separated': 'Sentralisasi rekening penampung; jika nomor rekening studio berganti, perubahan cukup dilakukan di satu tempat tanpa menyentuh kode aplikasi.'
    },
    'Pembelian': {
        'role_title': 'Faktur / Invoice Pemesanan Paket',
        'purpose': 'Catatan transaksi pemesanan paket oleh pelanggan (nomor invoice unik, total tagihan, potongan diskon, kode unik transfer, status: Menunggu Bayar, Lunas, Batal).',
        'workflow': 'Dibuat saat customer checkout paket; statusnya diperbarui menjadi LUNAS setelah diverifikasi kasir atau payment gateway.',
        'why_separated': 'Entitas pusat transaksi komersial; menjadi dasar penagihan, pencatatan pajak, jurnal akuntansi, dan pemicu aktivasi sesi.'
    },
    'PromosiPaket': {
        'role_title': 'Program Diskon & Promo Terjadwal',
        'purpose': 'Menyimpan kampanye diskon periode tertentu (contoh: Promo Kemerdekaan Diskon 17%, Early Bird Promo) lengkap dengan tanggal mulai dan berakhir.',
        'workflow': 'Dibuat oleh Marketing untuk memotong harga paket secara otomatis pada rentang tanggal tertentu.',
        'why_separated': 'Mendukung program promosi musiman otomatis tanpa harus merubah harga standar di katalog paket master.'
    },
    'Voucher': {
        'role_title': 'Master Kupon Diskon (Voucher Promo)',
        'purpose': 'Master kode kupon diskon (contoh: `PILATESNEW2026`) dengan aturan potongan (persentase % atau nominal Rp), batas kuota klaim, dan syarat belanja minimal.',
        'workflow': 'Dibuat oleh tim Marketing saat menyelenggarakan program kolaborasi komunitas atau giveaway.',
        'why_separated': 'Manajemen kupon promosi yang fleksibel; satu voucher bisa diaplikasikan ke banyak paket berbeda sesuai aturan promo.'
    },
    'AliasKodeVoucher': {
        'role_title': 'Toleransi Ejaan Kode Voucher',
        'purpose': 'Mendukung variasi huruf besar/kecil atau variasi ejaan umum (contoh: `PILATESNEW` dan `pilatesnew`) yang mengarah ke promo yang sama.',
        'workflow': 'Didaftarkan oleh tim Marketing saat merilis voucher kampanye di media sosial.',
        'why_separated': 'Mencegah kegagalan klaim kupon akibat perbedaan kapitalisasi keyboard pada smartphone pelanggan.'
    },
    'CakupanPaketVoucher': {
        'role_title': 'Pembatasan Paket untuk Voucher Diskon',
        'purpose': 'Memetakan paket apa saja yang berhak dipotong menggunakan kode voucher diskon tertentu.',
        'workflow': 'Ditetapkan saat konfigurasi voucher agar kupon diskon besar tidak bisa dipakai untuk paket hemat/starter.',
        'why_separated': 'Menjaga margin keuntungan studio; mencegah voucher diskon disalahgunakan pada paket yang sudah mendapatkan harga promo.'
    },
    'PenukaranVoucher': {
        'role_title': 'Riwayat Penggunaan Kode Voucher',
        'purpose': 'Mencatat setiap transaksi pemakaian kode voucher oleh member (siapa yang memakai, nomor invoice terkait, dan besaran potongan harga).',
        'workflow': 'Tercatat otomatis saat customer berhasil menyelesaikan checkout menggunakan voucher.',
        'why_separated': 'Pencegahan kecurangan klaim; menegakkan aturan "1 kupon hanya dapat digunakan 1 kali per akun member".'
    },
    'HakVoucherPelanggan': {
        'role_title': 'Voucher Eksklusif Personal Member',
        'purpose': 'Menyimpan voucher hadiah khusus yang hanya dapat digunakan oleh satu akun member tertentu (contoh: kado ulang tahun member atau kompensasi kendala layanan).',
        'workflow': 'Diberikan langsung oleh Customer Service atau Manajer Studio kepada member tertentu.',
        'why_separated': 'Mendukung program retensi pelanggan personal; voucher bersifat privat dan tidak dapat digunakan atau diklaim oleh orang lain.'
    },
    'PeristiwaLinimasaPembelian': {
        'role_title': 'Linimasa Tahapan Transaksi Pembelian',
        'purpose': 'Merekam kronologi status invoice dari awal hingga tuntas (Checkout Dibuat ➔ Bukti Diupload ➔ Terverifikasi Finance ➔ Sesi Aktif).',
        'workflow': 'Ditulis otomatis oleh sistem pada setiap perubahan status transaksi.',
        'why_separated': 'Transparansi pelacakan order; memudahkan kasir melacak riwayat jika pesanan customer mengalami keterlambatan verifikasi.'
    },
    'ReservasiKodeUnikPembayaran': {
        'role_title': 'Alokasi 3 Digit Kode Unik Transfer',
        'purpose': 'Mengalokasikan 3 digit angka acak di ujung nominal transfer (contoh: Rp 1.500.328) agar sistem dapat membedakan transfer member secara otomatis tanpa tertukar.',
        'workflow': 'Dialokasikan saat checkout dan dibebaskan kembali jika pesanan dibatalkan atau kedaluwarsa.',
        'why_separated': 'Mencegah bentrok transfer antar pelanggan yang membeli paket dengan nominal identik pada jam yang bersamaan.'
    },
    'PaketPelanggan': {
        'role_title': 'Saldo Kuota Sesi Aktif Member',
        'purpose': 'Menyimpan saldo sesi latihan aktif milik pelanggan (total kuota sesi, sisa sesi belum dipakai, sesi yang sedang di-booking, dan tanggal kedaluwarsa paket).',
        'workflow': 'Bertambah otomatis saat pembelian paket lunas; berkurang saat customer memesan dan menyelesaikan kelas pilates.',
        'why_separated': 'Aset utama member; entitas paling krusial yang selalu divalidasi oleh sistem saat member hendak memesan kelas.'
    },

    # =========================================================================
    # DOM-04: classes.prisma (2 Models)
    # =========================================================================
    'SlotKelas': {
        'role_title': 'Jadwal Slot Kelas Pilates Aktual',
        'purpose': 'Jadwal operasional kelas aktual di studio: tanggal pelaksanaan, jam mulai, jam selesai, tipe kelas, ruangan reformer, instruktur bertugas, kapasitas ranjang maksimal, dan kuota terisi.',
        'workflow': 'Dibuat oleh Tim Operasional saat merilis jadwal mingguan studio; dipantau customer di aplikasi untuk dibooking.',
        'why_separated': 'Pusat aktivitas operasional studio; menghubungkan ruangan fisik, instruktur pengajar, reservasi member, dan sistem presensi QR.'
    },
    'KetersediaanInstruktur': {
        'role_title': 'Shift & Ketersediaan Instruktur',
        'purpose': 'Mencatat ketersediaan shift kerja atau jadwal cuti/libur instruktur di cabang studio tertentu.',
        'workflow': 'Diisi oleh instruktur atau disetujui Manajer Studio sebelum jadwal kelas mingguan disusun.',
        'why_separated': 'Mencegah bentrok jadwal instruktur; sistem otomatis melarang penugasan mengajar di luar jam ketersediaan instruktur.'
    },

    # =========================================================================
    # DOM-05: bookings.prisma (8 Models)
    # =========================================================================
    'PemesananKelas': {
        'role_title': 'Tiket Reservasi Kelas Customer',
        'purpose': 'Catatan tiket reservasi kelas oleh member (kode tiket unik, status: Terkonfirmasi, Dibatalkan, Hadir, No-Show, waktu pemesanan).',
        'workflow': 'Dibuat saat customer memilih slot jadwal kelas dan memotong kuota sesi; selesai setelah kelas dihadiri.',
        'why_separated': 'Entitas reservasi utama; menjadi bukti hak member untuk menempati satu ranjang reformer pada jam tersebut.'
    },
    'PendaftaranKelasPelanggan': {
        'role_title': 'Daftar Peserta Kelas (Roster)',
        'purpose': 'Mencatat nomor urut peserta atau nomor ranjang reformer spesifik yang ditempati oleh member di dalam kelas.',
        'workflow': 'Tercatat otomatis saat transaksi pemesanan kelas berhasil dibuat.',
        'why_separated': 'Manajemen tata letak ranjang studio dan penanganan nomor antrean waiting list jika kuota kelas penuh.'
    },
    'ReservasiSesi': {
        'role_title': 'Penguncian Kuota Saldo Sesi (Session Lock)',
        'purpose': 'Mengunci (hold) saldo sesi dari paket member saat booking dibuat, agar sesi tidak bisa dipakai untuk booking kelas lain di jam yang sama.',
        'workflow': 'Dibuat saat booking dibuat; berubah menjadi DIKONSUMSI setelah kelas selesai, atau DILEPAS kembali jika booking dibatalkan tepat waktu.',
        'why_separated': 'Anti-Double Booking & Concurrency Guard; menjamin saldo kuota member tidak minus jika booking dilakukan serentak dari banyak perangkat.'
    },
    'HasilKehadiranPemesanan': {
        'role_title': 'Keputusan Status Akhir Booking',
        'purpose': 'Menyimpan evaluasi akhir tiket setelah kelas usai: Hadir Tepat Waktu, Terlambat, Hangus (No-Show), atau Batal Terlambat (Late Cancel).',
        'workflow': 'Diproses otomatis oleh sistem segera setelah kelas pilates selesai atau saat instruktur menutup presensi.',
        'why_separated': 'Penegakan kebijakan penalti studio; mencatat dasar pertimbangan apakah kuota sesi member hangus atau dikembalikan.'
    },
    'UbahJadwal': {
        'role_title': 'Riwayat Reschedule Jadwal Kelas',
        'purpose': 'Mencatat kronologi perpindahan kelas oleh member (slot jadwal lama, slot jadwal baru, waktu pemindahan, dan biaya denda reschedule jika ada).',
        'workflow': 'Tercatat saat member memilih opsi "Ubah Jadwal" di aplikasi sebelum batas cut-off waktu minimal studio.',
        'why_separated': 'Transparansi jejak perubahan; mencegah perselisihan klaim jadwal antara member dan staf resepsionis studio.'
    },
    'PenyesuaianSesi': {
        'role_title': 'Koreksi & Kompensasi Saldo Sesi Manual',
        'purpose': 'Mencatat penambahan atau pemotongan kuota sesi member secara manual oleh Admin/Owner (contoh: kompensasi kelas batal mendadak, perpanjangan masa aktif sakit, bonus loyalitas).',
        'workflow': 'Diinput oleh Super Admin / Manajer Cabang dengan wajib menyertakan alasan penyesuaian resmi.',
        'why_separated': 'Pencegahan manipulasi kuota internal; seluruh perubahan manual tercatat dengan jelas beserta identitas staf penanggung jawab.'
    },
    'JadwalRutinPelanggan': {
        'role_title': 'Konfigurasi Booking Berulang Otomatis',
        'purpose': 'Menyimpan preferensi jadwal rutin member VIP (contoh: otomatis pesan kelas setiap Selasa & Kamis jam 08:00 selama paket aktif).',
        'workflow': 'Didaftarkan oleh member VIP atau diatur oleh resepsionis atas persetujuan member.',
        'why_separated': 'Fitur kenyamanan member loyal; background job sistem akan otomatis membookingkan kelas favorit tanpa harus berebut slot tiap minggu.'
    },
    'UlasanPemesanan': {
        'role_title': 'Rating & Ulasan Selesai Kelas',
        'purpose': 'Mencatat ulasan member (skor bintang 1-5, komentar kepuasan, kebersihan studio, keramahan instruktur) setelah selesai berolahraga.',
        'workflow': 'Diisi oleh member melalui notifikasi ulasan sesaat setelah presensi kelas selesai diverifikasi.',
        'why_separated': 'Evaluasi mutu layanan studio dan acuan penilaian performa instruktur secara periodik.'
    },

    # =========================================================================
    # DOM-06: attendance.prisma (5 Models)
    # =========================================================================
    'CheckInToken': {
        'role_title': 'Token QR Presensi Dinamis (Anti-Screenshot)',
        'purpose': 'Menyimpan token QR Code sekali pakai berbatas waktu yang ditampilkan di aplikasi ponsel member saat tiba di pintu resepsionis studio.',
        'workflow': 'Di-generate saat member membuka kartu pass di studio; diverifikasi saat dipindai scanner resepsionis.',
        'why_separated': 'Pencegahan kecurangan kehadiran; token berubah tiap 30 detik sehingga barcode tidak bisa difoto atau dibagikan ke orang lain.'
    },
    'KehadiranPelanggan': {
        'role_title': 'Buku Presensi Kehadiran Member',
        'purpose': 'Mencatat kehadiran fisik member di kelas tertentu (jam check-in presisi, status hadir, dan identitas resepsionis yang memvalidasi).',
        'workflow': 'Tercatat instan pada detik barcode/QR code member sukses dipindai di pintu studio.',
        'why_separated': 'Bukti kehadiran fisik resmi; memicu status booking menjadi "ATTENDED" dan mengunci pemotongan saldo sesi secara permanen.'
    },
    'InstructorCheckInToken': {
        'role_title': 'Token Presensi QR Khusus Instruktur',
        'purpose': 'Token otentikasi presensi QR atau validasi geolokasi GPS studio saat instruktur hadir di cabang untuk mulai mengajar.',
        'workflow': 'Di-generate di aplikasi instruktur saat tiba di studio untuk mencatat presensi masuk.',
        'why_separated': 'Memisahkan alur presensi staf pengajar dari alur presensi member latihan.'
    },
    'KehadiranInstruktur': {
        'role_title': 'Catatan Absensi Mengajar Instruktur',
        'purpose': 'Mencatat jam kedatangan dan jam kepulangan aktual instruktur pada kelas yang diajarnya (tepat waktu / terlambat).',
        'workflow': 'Tercatat saat instruktur memindai presensi sebelum kelas dimulai dan setelah kelas berakhir.',
        'why_separated': 'Penegakan SOP kedatangan instruktur dan menjadi dasar perhitungan honor/komisi mengajar bulanan.'
    },
    'RekapJamInstruktur': {
        'role_title': 'Rekapitulasi Jam Mengajar Bulanan',
        'purpose': 'Akumulasi total jam mengajar efektif dan jumlah kelas yang sukses dipandu instruktur dalam satu periode bulan pembukuan.',
        'workflow': 'Dihitung otomatis oleh sistem pada akhir periode payroll untuk diserahkan ke bagian Keuangan.',
        'why_separated': 'Efisiensi pelaporan payroll; mempercepat kalkulasi komisi tanpa perlu menjumlahkan ribuan baris log kelas dari awal.'
    },

    # =========================================================================
    # DOM-07: finance.prisma (8 Models)
    # =========================================================================
    'AkunAkuntansi': {
        'role_title': 'Bagan Akun Standar (Chart of Accounts / COA)',
        'purpose': 'Master bagan akun keuangan studio: Kas Kasir, Bank BCA, Pendapatan Membership, Pendapatan Diterima di Muka, Beban Gaji Instruktur, Beban Listrik.',
        'workflow': 'Disusun oleh Manajer Keuangan / Akuntan saat perancangan sistem pembukuan studio.',
        'why_separated': 'Standar akuntansi berpasangan (Double-Entry Bookkeeping); seluruh mutasi uang masuk dan keluar memiliki klasifikasi akuntansi yang baku.'
    },
    'EntriJurnal': {
        'role_title': 'Header Bukti Jurnal Akuntansi',
        'purpose': 'Kepala bukti transaksi keuangan (nomor voucher jurnal, tanggal pencatatan, deskripsi transaksi, status posting: DRAFT / POSTED).',
        'workflow': 'Dibuat otomatis saat invoice lunas atau saat kasir mencatat pengeluaran operasional cabang.',
        'why_separated': 'Prinsip integritas akuntansi; mengelompokkan baris debit dan kredit dalam satu transaksi yang seimbang (balance).'
    },
    'EntriBukuBesar': {
        'role_title': 'Baris Rincian Debit / Kredit Buku Besar',
        'purpose': 'Rincian baris transaksi pembukuan yang mencatat mutasi nilai debit atau kredit pada akun akuntansi tertentu.',
        'workflow': 'Dihasilkan bersamaan dengan EntriJurnal saat transaksi keuangan diposting.',
        'why_separated': 'Memungkinkan penyusunan laporan buku besar (general ledger) dan neraca saldo studio secara instan dan akurat.'
    },
    'BiayaLain': {
        'role_title': 'Pencatatan Biaya Operasional Studio',
        'purpose': 'Mencatat pengeluaran harian studio di luar kelas (contoh: servis rutin spring reformer, deterjen laundry handuk, air galon, listrik, internet).',
        'workflow': 'Diinput oleh Kasir/Operasional dengan wajib melampirkan foto nota/struk belanja.',
        'why_separated': 'Menghitung laba-rugi bersih riil per cabang secara transparan dan terperinci.'
    },
    'PeriodeKeuangan': {
        'role_title': 'Periode Pembukuan & Tutup Buku',
        'purpose': 'Menentukan status periode akuntansi bulanan (OPEN / CLOSED) untuk mengunci transaksi masa lalu dari manipulasi.',
        'workflow': 'Ditutup oleh Manajer Keuangan setiap akhir bulan setelah proses rekonsiliasi bank selesai.',
        'why_separated': 'Kepatuhan audit finansial; transaksi pada bulan yang sudah "CLOSED" tidak boleh diubah atau dihapus oleh siapapun.'
    },
    'SnapshotTutupBukuKeuangan': {
        'role_title': 'Arsip Neraca & Laba Rugi Bulanan',
        'purpose': 'Menyimpan salinan tetap posisi neraca, total pendapatan, dan total pengeluaran pada saat proses tutup buku akhir bulan.',
        'workflow': 'Dibekukan otomatis oleh sistem saat status periode keuangan diubah menjadi CLOSED.',
        'why_separated': 'Kecepatan pelaporan historis; manajemen bisa langsung melihat performa finansial bulan lalu tanpa perlu komputasi ulang dari nol.'
    },
    'KoreksiKeuangan': {
        'role_title': 'Jurnal Balik & Koreksi Transaksi',
        'purpose': 'Mencatat koreksi transaksi salah posting atau pembatalan transaksi tanpa menghapus jejak data aslinya (Reversal Entry).',
        'workflow': 'Dibuat oleh Akuntan saat menemukan kesalahan input akun atau pengembalian dana (refund) yang wajib disetujui Super Admin.',
        'why_separated': 'Prinsip anti-fraud; data keuangan tidak boleh dihapus begitu saja, melainkan wajib dikoreksi melalui jurnal resmi.'
    },
    'EntriKeuanganHistoris': {
        'role_title': 'Gudang Arsip Keuangan Lampau',
        'purpose': 'Menyimpan data ringkasan transaksi keuangan tahun-tahun terdahulu untuk analisis tren performa studio jangka panjang.',
        'workflow': 'Diarsipkan otomatis saat pergantian tahun buku pembukuan.',
        'why_separated': 'Menjaga tabel transaksi harian tetap ringan dan cepat dengan memindahkan data lama ke arsip historis.'
    },

    # =========================================================================
    # DOM-08: operations.prisma (15 Models)
    # =========================================================================
    'QuotaEvaluationJob': {
        'role_title': 'Antrean Evaluasi Masa Aktif Paket',
        'purpose': 'Tabel antrean background job yang bertugas memeriksa tanggal kedaluwarsa paket sesi member setiap tengah malam.',
        'workflow': 'Dijalankan oleh cron scheduler otomatis; membekukan saldo paket yang telah melewati masa aktif.',
        'why_separated': 'Mencegah server web lemot; proses evaluasi ribuan paket member dilakukan di latar belakang tanpa mengganggu customer yang sedang booking.'
    },
    'RateLimitCounter': {
        'role_title': 'Penghitung Batas Akses API (Rate Limiting)',
        'purpose': 'Mencatat frekuensi request per alamat IP atau per pengguna untuk mencegah serangan brute-force atau spam tombol.',
        'workflow': 'Diperbarui otomatis oleh middleware API pada setiap request masuk ke server.',
        'why_separated': 'Perlindungan keamanan infrastruktur; memastikan server tetap stabil dan responsif bagi seluruh pengguna.'
    },
    'AuditLog': {
        'role_title': 'Rekam Jejak Aktivitas Staf (Audit Trail)',
        'purpose': 'Mencatat seluruh tindakan penting staf di aplikasi: siapa yang mengubah jadwal, siapa yang menyetujui pembayaran, nilai data sebelum vs sesudah.',
        'workflow': 'Ditulis otomatis oleh sistem setiap kali terjadi operasi create, update, atau delete data sensitif.',
        'why_separated': 'Forensik keamanan & akuntabilitas; jika terjadi selisih kas atau jadwal hilang, manajemen dapat mengetahui kronologinya secara pasti.'
    },
    'AuditExport': {
        'role_title': 'Riwayat Ekspor Laporan Data',
        'purpose': 'Mencatat siapa staf yang mengunduh data sensitif ke berkas Excel/CSV (contoh: ekspor data nomor HP pelanggan atau laporan keuangan).',
        'workflow': 'Tercatat saat admin menekan tombol "Download CSV / Export Excel" di dashboard.',
        'why_separated': 'Pencegahan kebocoran data member oleh oknum internal studio.'
    },
    'IdempotencyRecord': {
        'role_title': 'Kunci Anti-Duplikasi Transaksi',
        'purpose': 'Menyimpan hash unik permintaan transaksi agar saat jaringan internet lemot dan tombol diklik berulang kali, pesanan tidak terproses ganda.',
        'workflow': 'Diperiksa pada setiap klik tombol bayar atau booking; jika request yang sama berulang dalam 1 menit, sistem mengembalikan hasil yang sama tanpa memotong kuota dobel.',
        'why_separated': 'Kestabilan e-commerce; menjamin tidak ada saldo atau uang member yang terpotong ganda akibat koneksi yang tidak stabil.'
    },
    'OutboxEvent': {
        'role_title': 'Antrean Pesan Latar Belakang (Transactional Outbox)',
        'purpose': 'Menjamin pengiriman event sistem (kirim email tiket, kirim WhatsApp bukti bayar, webhook) tidak hilang meskipun server mendadak restart.',
        'workflow': 'Disimpan bersamaan dengan transaksi utama di database, lalu dieksekusi oleh background event dispatcher.',
        'why_separated': 'Arsitektur Enterprise Resilient; mencegah pesanan sukses di database namun notifikasi tiket ke member hilang.'
    },
    'NotificationOccurrence': {
        'role_title': 'Pemicu Kejadian Notifikasi',
        'purpose': 'Mencatat peristiwa bisnis yang memicu notifikasi (contoh: "Member A sukses memesan kelas B untuk besok pagi jam 08:00").',
        'workflow': 'Dibuat saat suatu peristiwa bisnis penting selesai diproses di sistem.',
        'why_separated': 'Memisahkan konsep "peristiwa kejadian" dari "saluran pengiriman" (email, WhatsApp, push notification).'
    },
    'NotificationAttempt': {
        'role_title': 'Log Percobaan Pengiriman Pesan',
        'purpose': 'Merekam status kirim (SUKSES / GAGAL), waktu pengiriman, respons gateway WhatsApp/Email, dan jumlah pengulangan (retry).',
        'workflow': 'Tercatat setiap kali server mencoba menghubungi gateway SMS/WhatsApp (Twilio/Fonnte/SendGrid).',
        'why_separated': 'Troubleshooting pengiriman; mempermudah staf mendeteksi jika nomor WhatsApp member tidak aktif atau kuota SMS habis.'
    },
    'NotificationProjection': {
        'role_title': 'Agregasi Status Pengiriman Notifikasi',
        'purpose': 'Tabel proyeksi ringkas untuk mempercepat query tampilan status notifikasi di dashboard admin.',
        'workflow': 'Diperbarui otomatis saat NotificationAttempt selesai diproses.',
        'why_separated': 'Optimasi kecepatan dashboard; mencegah query lambat pada tabel log pengiriman yang berisi ratusan ribu baris.'
    },
    'UserNotification': {
        'role_title': 'Kotak Masuk (Inbox) Notifikasi Pengguna',
        'purpose': 'Menyimpan daftar pesan notifikasi di aplikasi pengguna (ikon lonceng di navbar): status dibaca/belum dibaca, dan tautan halaman tujuan.',
        'workflow': 'Dibuat saat ada notifikasi personal untuk pengguna; diperbarui saat pengguna mengklik "Tandai Telah Dibaca".',
        'why_separated': 'Kotak pesan personal member agar informasi penting dapat dibaca kembali sewaktu-waktu di dalam aplikasi.'
    },
    'NotificationTemplate': {
        'role_title': 'Master Template Pesan Notifikasi',
        'purpose': 'Draf pesan email, WhatsApp, dan push notification lengkap dengan variabel dinamis (contoh: `{nama_member}`, `{nama_kelas}`, `{jam_mulai}`).',
        'workflow': 'Dikelola oleh tim Marketing / Admin Komunikasi untuk menyesuaikan gaya bahasa pesan pengingat.',
        'why_separated': 'Memisahkan redaksional pesan dari kode program; staf non-teknis bisa mengedit kata-kata ucapan tanpa campur tangan programmer.'
    },
    'EntriKontenPublik': {
        'role_title': 'Manajemen Konten Halaman Publik (CMS)',
        'purpose': 'Menyimpan teks dinamis landing page, artikel tips pilates, pengumuman jadwal libur studio, dan banner promosi.',
        'workflow': 'Dikelola melalui panel Admin Konten untuk memperbarui informasi website tanpa perlu deploy ulang kode aplikasi.',
        'why_separated': 'CMS internal terintegrasi; memisahkan konten display publik dari basis data transaksi sensitif.'
    },
    'KasusBantuan': {
        'role_title': 'Tiket Layanan Bantuan (Support Case)',
        'purpose': 'Mencatat keluhan, pertanyaan, atau kendala dari member (contoh: kendala upload bukti bayar, permohonan reschedule darurat, pertanyaan saldo).',
        'workflow': 'Dibuat saat customer mengirim formulir "Hubungi Kami" atau diinput oleh kasir saat member melapor di resepsionis.',
        'why_separated': 'Helpdesk CRM terpadu; memantau SLA kecepatan respons staf dalam menyelesaikan komplain member hingga tuntas.'
    },
    'CatatanKasusBantuan': {
        'role_title': 'Riwayat Kronologi Percakapan Bantuan',
        'purpose': 'Menyimpan riwayat kronologis balasan staf, pesan member, atau catatan internal tim mengenai penanganan keluhan tersebut.',
        'workflow': 'Ditambahkan setiap kali ada balasan pesan atau catatan progress penanganan tiket.',
        'why_separated': 'Transparansi penanganan komplain; staf shift berikutnya bisa membaca kronologi masalah tanpa mengulang pertanyaan ke member.'
    },
    'AsetMedia': {
        'role_title': 'Katalog Berkas Media & Gambar',
        'purpose': 'Menyimpan metadata berkas gambar studio, foto instruktur, dan video tutorial yang diunggah ke cloud storage (URL, ukuran berkas, format mime-type).',
        'workflow': 'Tercatat saat admin mengunggah foto baru di panel media website.',
        'why_separated': 'Manajemen aset cloud terpusat; memudahkan pemantauan kapasitas penyimpanan dan penggunaan media di berbagai halaman.'
    },

    # =========================================================================
    # DOM-09: v1_migration.prisma (12 Models)
    # =========================================================================
    'MigrationBatch': {
        'role_title': 'Sesi Eksekusi Migrasi Data V1-V2',
        'purpose': 'Mencatat sesi pelaksanaan migrasi data dari sistem lama V1 ke arsitektur baru V2 (tanggal mulai, tanggal selesai, status batch).',
        'workflow': 'Dibuat oleh Tim Data Engineer saat menjalankan tahapan pemindahan data per kelompok entitas.',
        'why_separated': 'Pengendalian pemindahan data; membagi migrasi data ribuan member menjadi gelombang terukur agar server tidak overload.'
    },
    'MigrationDeferredMediaReference': {
        'role_title': 'Antrean Unduh Media Migrasi (Deferred)',
        'purpose': 'Menampung referensi berkas gambar/media (struk transfer lama, foto dokumen KYC lama) yang pengunduhannya ditunda saat proses migrasi data tabular teks berlangsung.',
        'workflow': 'Tercatat saat migrasi data menemukan tautan berkas gambar; diunduh dan dipindahkan ke cloud storage baru secara asinkronus oleh media migration worker.',
        'why_separated': 'Efisiensi bandwidth migrasi; memisahkan pemindahan data tabular yang cepat dari transfer ribuan berkas foto berukuran gigabyte.'
    },
    'MigrationSourceKey': {
        'role_title': 'Kamus Pemetaan Kunci Lama ke UUID Baru',
        'purpose': 'Menyimpan jembatan pemetaan antara ID lama integer di V1 (contoh: `user_id = 412`) dengan ID UUID baru di V2 (contoh: `usr_9a8f7b...`).',
        'workflow': 'Dibuat saat suatu baris data lama berhasil dipindahkan ke skema V2.',
        'why_separated': 'Krusial untuk integritas relasi; memastikan seluruh riwayat pembelian dan kuota member lama tetap terhubung ke akun yang tepat.'
    },
    'MigrationReject': {
        'role_title': 'Daftar Data Anomali yang Ditolak',
        'purpose': 'Menampung data lama yang cacat atau tidak valid (contoh: email duplikat, nomor HP tidak valid, saldo sesi minus) untuk diperbaiki manual.',
        'workflow': 'Tercatat otomatis saat validasi skema V2 menolak data kotor dari V1.',
        'why_separated': 'Pembersihan data kotor; menjaga database V2 tetap steril tanpa menghilangkan data asli yang butuh konfirmasi manual.'
    },
    'MigrationControlTotal': {
        'role_title': 'Angka Kontrol Rekonsiliasi Data',
        'purpose': 'Membandingkan angka total kontrol sebelum vs sesudah migrasi (contoh: Total saldo sesi di V1 = 12.450 sesi, di V2 wajib tepat 12.450 sesi).',
        'workflow': 'Dihitung sebelum dan sesudah migrasi untuk ditandatangani oleh auditor sistem.',
        'why_separated': 'Jaminan Zero-Data-Loss; membuktikan secara matematis bahwa tidak ada uang atau kuota sesi member yang hilang dalam migrasi.'
    },
    'MigrationResolution': {
        'role_title': 'Penyelesaian Manual Data Bermasalah',
        'purpose': 'Mencatat keputusan perbaikan yang diambil oleh admin terhadap data yang sebelumnya ditolak di MigrationReject.',
        'workflow': 'Diisi saat tim admin mengonfirmasi perbaikan data (contoh: mengonfirmasi nomor HP member yang benar).',
        'why_separated': 'Audit kepatuhan migrasi; mencatat siapa yang menyetujui koreksi data lama dan atas dasar bukti apa.'
    },
    'MigrationDeltaEvent': {
        'role_title': 'Penampung Perubahan Data Selama Transisi',
        'purpose': 'Mencatat transaksi baru yang terjadi di sistem V1 selama masa transisi sebelum pemotongan penuh (cutover) ke V2.',
        'workflow': 'Ditangkap otomatis oleh change-data-capture listener saat sistem V1 masih aktif melayani kasir.',
        'why_separated': 'Memungkinkan migrasi tanpa downtime (Zero-Downtime Cutover); data transaksi hari ini tetap tersinkronisasi.'
    },
    'MigrationGtidCheckpoint': {
        'role_title': 'Checkpoint Replikasi Log Database',
        'purpose': 'Menyimpan posisi koordinat transaksi log MySQL (Global Transaction Identifier / GTID) untuk sinkronisasi data lanjutan.',
        'workflow': 'Diperbarui otomatis oleh daemon sinkronisasi database.',
        'why_separated': 'Menghindari duplikasi sinkronisasi; memastikan jika koneksi terputus, sinkronisasi melanjutkan dari titik terakhir.'
    },
    'MigrationBranchCutover': {
        'role_title': 'Status Transisi Operasional per Cabang',
        'purpose': 'Mencatat jadwal dan status peralihan operasional dari sistem V1 ke V2 secara bertahap cabang demi cabang.',
        'workflow': 'Dikonfirmasi oleh Manajemen Studio saat Cabang Senopati mulai 100% menggunakan Daily Dose V2.',
        'why_separated': 'Mitigasi risiko bisnis; memungkinkan migrasi bertahap (pilot branch) tanpa memaksa seluruh cabang pindah sekaligus.'
    },
    'MigrationPilotOutbox': {
        'role_title': 'Antrean Uji Coba Fitur Cabang Pilot',
        'purpose': 'Menampung event uji coba fitur di cabang percontohan sebelum dirilis ke cabang lainnya.',
        'workflow': 'Digunakan saat fase evaluasi operasional cabang percontohan.',
        'why_separated': 'Isolasi data uji coba agar tidak mencemari antrean notifikasi atau operasional cabang reguler.'
    },
    'MigrationPilotMediaAlias': {
        'role_title': 'Pemetaan Berkas Media Lama ke Cloud Baru',
        'purpose': 'Mencatat pemetaan URL foto struk transfer atau foto profil lama dari server V1 ke bucket storage V2 yang baru.',
        'workflow': 'Dibuat saat proses migrasi aset gambar berlangsung.',
        'why_separated': 'Mencegah broken link pada gambar bukti pembayaran dan foto fasilitas studio lama.'
    },
    'MigrationLegacyPayload': {
        'role_title': 'Arsip Cadangan Data Mentah V1',
        'purpose': 'Menyimpan salinan asli mentah format JSON dari baris data sistem lama sebagai arsip cadangan historis (historical backup).',
        'workflow': 'Disimpan sebelum data diparsing dan dinormalisasi ke tabel-tabel V2.',
        'why_separated': 'Arsip forensik absolut; jika sewaktu-waktu ada audit pajak mengenai transaksi masa lalu, data aslinya masih tersimpan utuh.'
    }
}

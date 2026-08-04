# Audit Struktur dan Mapping Daily Dose v1 ke v2

Tanggal audit: 3 Agustus 2026  
Sumber audit: `dailydose.sql`, kontrak 34 tabel/309 kolom, Prisma schema v2, mapper full import, dan reconciliation v1.

## Keputusan audit

Status keseluruhan: **NO-GO untuk Rehearsal 1 dan migrasi produksi**.

Schema v2 sudah memiliki fondasi yang baik untuk user, purchase, ledger, booking, voucher, audit, histori, source key, dan migration control. Namun struktur dan mapper saat ini belum dapat menjamin seluruh perilaku serta relasi bisnis v1 tetap utuh. Sebagian data dapat masuk secara fisik, tetapi beberapa relasi dipipihkan, beberapa field hanya disimpan sebagai JSON/checksum, dan beberapa status bisnis berubah arti.

Keputusan domain yang dicatat:

1. `ClassType` adalah katalog global dan tidak dimiliki satu cabang.
2. Ketersediaan tipe kelas menggunakan scope semua, satu, atau beberapa cabang.
3. `locations` v1 adalah outlet fisik Daily Dose. Pada UI dapat disebut **Studio/Cabang**.
4. `location_studios` v1 adalah area latihan di dalam outlet. Pada UI harus disebut **Area Studio/Ruang Kelas** agar tidak tertukar dengan cabang.
5. `ruangans` adalah ruangan di bawah area studio.
6. Venue wajib ditentukan pada jadwal/slot kelas, bukan saat membuat tipe kelas.
7. File media tetap `metadata-only` dan tidak menjadi bagian gate audit ini. Nominal pembayaran, status, voucher, jurnal, sesi, dan seluruh referensi database tetap material.

## Fakta snapshot yang diperiksa

| Data v1 | Jumlah |
|---|---:|
| User | 8.996 |
| Role assignment | 9.007 |
| Cabang/outlet (`locations`) | 5 |
| Area studio (`location_studios`) | 12 |
| Ruangan | 2 |
| Tipe kelas | 4 |
| Aktivitas/slot kelas | 75.357 |
| Booking | 131.437 |
| Paket | 122 |
| Scope paket-cabang | 222 |
| Order | 14.447 |
| Voucher | 312 |
| Voucher customer | 7.954 |
| Jurnal | 22.285 |
| Activity log | 214.899 |
| Jadwal statis customer | 558 |

Data penting yang memengaruhi desain:

- Tiga dari empat tipe kelas menggunakan `id_location = 0`; satu tipe menggunakan lokasi 4.
- Sebanyak 46 paket digunakan pada lebih dari satu cabang; satu paket dapat memiliki sampai lima scope cabang.
- Sebanyak 24 order memakai paket yang tidak tersedia dan 2.516 order memakai `id_location = 0`.
- Status slot v1 terdiri dari 34.435 status 1, 906 status 2, 37.574 status 3, dan 2.442 status 4.
- Mapper saat ini hanya menganggap status slot 1 sebagai `PUBLISHED`; status 2, 3, dan 4 seluruhnya menjadi `CANCELLED`. Sebanyak 40.922 slot berisiko salah status.
- Booking terdiri dari 102.750 status kehadiran 1, dua status 2, dan 28.685 tanpa status kehadiran.
- Order terdiri dari kombinasi status/aktif yang berbeda; mapper saat ini mereduksinya menjadi hanya `APPROVED` atau `PENDING`, sementara schema v2 sebenarnya mendukung state yang lebih lengkap.

## Hasil audit per domain

### 1. Cabang, area studio, ruangan, dan opening hours

Status: **PERLU KOREKSI SEBELUM MIGRASI**.

Yang sudah sesuai:

- `locations` dapat menjadi `Branch` dan `BranchPublicProfile`.
- `location_studios` dapat menjadi `Studio`.
- `ruangans` dapat menjadi `Room`.
- `location_openings` dapat menjadi `BranchOpeningHour`.
- Soft-delete dan timestamp sudah memiliki target.

Gap:

- Email cabang v1 tidak mempunyai field first-class pada `Branch`/`BranchPublicProfile`.
- `url_location` dipetakan ke `arrivalInformation`, padahal maknanya adalah URL peta/lokasi.
- Nama bank, nomor rekening, dan pemilik rekening dinyatakan menuju `PaymentAccount`, tetapi full-import mapper tidak membuat `PaymentAccount`.
- `Studio` v2 tidak mempunyai equipment dan nomor telepon, sehingga kedua field `location_studios` hilang secara operasional.
- Admin API/form untuk area studio, ruangan, dan opening hours belum tersedia sebagai pengelolaan first-class.
- `BranchPublicProfile.heroImageKey` diisi string kosong pada mode database-only; ini aman hanya jika UI dan API memperlakukan media deferred secara eksplisit.

Perbaikan wajib:

- Tambah email operasional dan map URL first-class pada profil cabang.
- Lengkapi pembuatan `PaymentAccount` atau model metadata rekening historis terenkripsi.
- Tambah equipment dan kontak area studio.
- Sediakan CRUD/observasi Area Studio, Room, dan Opening Hours.

### 2. User, profil, login, role, dan permission

Status: **CUKUP UNTUK DATA DASAR, BELUM CUKUP UNTUK KESETARAAN PERILAKU**.

Yang sudah sesuai:

- User, profil, alamat, gender, tanggal lahir, NIK terenkripsi/hash, barcode, kontak alias, bcrypt credential, role, assignment, soft-delete, dan source key mempunyai target.
- Duplikasi/invalid phone masuk resolution queue.
- Password bcrypt dapat dipertahankan untuk upgrade Argon2id.

Gap:

- User dengan `email_verified_at = NULL` dipetakan sebagai terverifikasi pada waktu pembuatan user. Ini mengubah status keamanan akun.
- Country selain Indonesia hanya menjadi metadata, bukan kode negara first-class.
- Rating user tidak dipetakan.
- `google_id` tidak dipetakan ke `Identity`. Pada snapshot yang diperiksa tidak ditemukan nilai Google ID aktif, tetapi mapper tetap harus aman untuk snapshot terbaru.
- Legacy role/capability disimpan sebagai role/capability nonaktif untuk audit; akses operasional bergantung pada hard-coded role mapping. Kesetaraan permission lama belum dibuktikan.
- `model_type` perlu divalidasi agar assignment hanya diarahkan ke model User yang sah.

Perbaikan wajib:

- Jangan menaikkan akun belum terverifikasi menjadi terverifikasi.
- Tambah mapping Google identity bila snapshot terbaru mengandung data.
- Definisikan matriks role/permission v1 ke capability v2 dan reconciliation efektivitas akses per user/cabang.

### 3. Tipe kelas, venue, jadwal, dan konfigurasi kelas

Status: **BLOCKER P0**.

Gap struktur:

- `ClassType.branchId` membuat tipe kelas dimiliki satu cabang, tidak sesuai pola v1.
- Belum ada `ClassTypeBranchScope` untuk semua/satu/multiple cabang.
- `ClassSlot` tidak mempunyai `studioId` atau `roomId`.
- Mapper membaca `kelas_activities.id_location_studio`, tetapi hanya memakai cabangnya. ID area studio disimpan di `sourceMetadata`, bukan relasi first-class.
- Minimum peserta, kapasitas, durasi, honor, fee, modality/type, deskripsi, equipment/bawaan, nama latihan, dan level belum mempunyai pembagian yang jelas antara default global dan override cabang/slot.
- Status slot 2/3/4 digabung menjadi `CANCELLED`; 40.922 record terdampak.
- `kelas_pertamuans` mengambil cabang dari `ClassType`, sehingga venue historis ditebak dari ownership yang keliru.

Perbaikan wajib:

- Jadikan `ClassType` global dengan business code unik global.
- Tambah `ClassTypeBranchScope` dengan override efektif untuk kapasitas, minimum quota, durasi, honor, dan fee bila diperlukan.
- Tambah `studioId` wajib dan `roomId` opsional pada `ClassSlot`.
- Kunci kamus status v1 berdasarkan kode aplikasi v1 dan data aktual sebelum mapper diubah.
- Jadikan nama latihan/level field first-class bila masih dipakai operasional atau laporan.

### 4. Paket, scope cabang, class scope, dan promosi

Status: **BLOCKER P0**.

Gap struktur dan mapping:

- `pakets` v1 adalah katalog yang dapat tersedia pada banyak cabang melalui `paket_locations`.
- Mapper v2 membuat clone `Package` per cabang. Ini mempertahankan availability secara fisik, tetapi memecah satu identitas paket menjadi beberapa produk dan memungkinkan harga/ketentuan menyimpang antar-clone tanpa revision policy.
- `Package` hanya memiliki satu `classTypeId`, sedangkan v1 juga mempunyai `kelas_pakets` sebagai relasi terpisah.
- Mapper `kelas_pakets` hanya membuat source key menuju package; tidak membuat relasi class scope first-class.
- `promote_code`, `diskon`, dan `is_many_times` hanya masuk `sourceMetadata`, sehingga perilaku paket lama tidak tersedia secara operasional.
- Effective revision paket belum memisahkan katalog global, availability cabang, serta harga/ketentuan efektif.

Perbaikan wajib:

- Gunakan `Package` global + `PackageBranchScope`.
- Gunakan `PackageClassTypeScope` untuk satu atau beberapa tipe kelas.
- Pertahankan revision/effective record untuk harga, jumlah sesi, validitas, visibility, dan aturan pemakaian berulang.
- Petakan promosi lama menjadi snapshot/revision first-class atau keputusan historis yang eksplisit.

### 5. Order, pembayaran database, CustomerPackage, dan ledger sesi

Status: **BLOCKER P0**.

Yang sudah sesuai:

- Target `Purchase`, `CustomerPackage`, append-only `LedgerEntry`, reservation, source balance, expiry, dan snapshot dasar tersedia.
- Satu opening ledger per order dan resolution saldo abnormal sudah disiapkan.
- Total order, Rupiah, dan sesi direkonsiliasi.

Gap:

- Mapping status order mereduksi state v1 menjadi `APPROVED` atau `PENDING`; state batal, belum lunas, expired, rejected, dan konflik status/aktif belum memiliki kamus yang disetujui.
- `harga` v1 sering merupakan nominal bayar yang sudah mengandung unique code. Mapper mengisinya sebagai `priceRpSnapshot`, tetapi tidak mengisi `paymentUniqueCode` dan `payableAmountRpSnapshot`.
- `unix_code` dan `metode_pembayaran` hanya disimpan sebagai metadata.
- Saat voucher dipakai, mapper kembali mengurangi `priceRpSnapshot` yang berasal dari `order_pakets.harga`. Ini berisiko menerapkan diskon dua kali dan menghasilkan snapshot diskon yang tidak sama dengan transaksi v1.
- Payment account snapshot tidak diisi karena rekening cabang belum dimigrasikan.
- Reconciliation total Rupiah dapat tetap hijau walaupun breakdown base price, discount, unique code, dan payable amount salah.
- Belum terbukti apakah `sisa` v1 sudah memperhitungkan booking aktif. Jika ya, mengurangi active reservation lagi akan membuat available session terlalu kecil.

Perbaikan wajib:

- Kunci state machine order v1 dari source code/aplikasi v1, bukan asumsi angka.
- Rekonstruksi dan reconcile: catalog/base price, discount, unique code, payable amount, dan amount paid.
- Simpan metode pembayaran first-class.
- Tambah control total untuk masing-masing komponen nominal, bukan hanya `SUM(harga)`.
- Buktikan semantik `sisa` terhadap booking aktif sebelum formula saldo final dikunci.

### 6. Booking, reservation, attendance, feedback, dan jadwal statis

Status: **BLOCKER P0**.

Yang sudah sesuai:

- Booking mempunyai relasi ke slot, user, CustomerPackage, dan reservation.
- Resolver tidak menebak CustomerPackage ketika kandidat nol atau lebih dari satu.
- Duplicate aktif dan orphan masuk resolution queue.

Gap:

- Validitas booking bergantung pada model ClassType/Package yang saat ini salah scope.
- Status kehadiran v1 direduksi menjadi `ATTENDED`, `NO_SHOW`, atau `BOOKED`; arti izin/tidak hadir belum dikunci.
- Booking berstatus `ATTENDED` tidak otomatis mempunyai `CustomerAttendance` first-class bila tabel check-in/absensi v1 kosong.
- `CustomerAttendance` v2 hanya merepresentasikan check-in sukses; belum dapat menyimpan outcome izin/no-show lengkap beserta alasan.
- Feedback dapat berasal dari `booking_kelas` dan `kelas_ratings`. Jika keduanya ada, mapper mempertahankan record pertama tanpa kebijakan merge/konflik.
- `customer_jadwal_statics.keterangan` tidak disimpan.
- Jadwal statis v1 tidak memiliki branch, tetapi mapper memaksakan preferred branch user. Ini dapat mengubah preferensi waktu global menjadi jadwal milik satu cabang.
- Tidak ada `studioId` pada slot, sehingga laporan venue, kapasitas ruang, dan jadwal area studio tidak dapat direkonsiliasi.

Perbaikan wajib:

- Tambah attendance outcome first-class: hadir, izin/excused, no-show, dan unknown historical.
- Tambah note pada recurring schedule dan jadikan branch nullable atau gunakan scope yang disetujui.
- Definisikan merge policy feedback.
- Reconcile booking per user, slot, venue, class type, status, dan CustomerPackage.

### 7. Voucher dan voucher customer

Status: **STRUKTUR DASAR CUKUP, MAPPING TRANSAKSI PERLU KOREKSI P0**.

Yang sudah sesuai:

- Voucher, code alias, package scope, entitlement, redemption, expiry, dan soft-delete mempunyai target.
- JSON paket voucher dapat diproyeksikan ke scope paket.
- Duplicate voucher code mempunyai resolution flow.

Gap:

- Scope voucher mengikuti package clone per cabang sehingga bergantung pada desain Package yang perlu diubah.
- Entitlement yang sudah digunakan masih dapat ditandai `active` berdasarkan field status terpisah.
- Nilai diskon redemption dihitung ulang dari konfigurasi voucher dan `order.harga`, bukan dipertahankan dari snapshot transaksi yang dapat dibuktikan.
- `lama_aktif` hanya metadata; perlu keputusan apakah memengaruhi entitlement expiry.
- Tidak ada reconciliation `base price +/− discount + unique code = payable` per redemption.

### 8. COA, jurnal, dan finance

Status: **KONDISIONAL; BLOCKER JIKA SNAPSHOT TERBARU MEMILIKI COA, TETAP PERLU SIGN-OFF FINANCE UNTUK JURNAL**.

Fakta snapshot:

- Tabel `coas` kosong.
- Tabel `jurnals` berisi 22.285 record.

Gap:

- `coas.saldo` tidak dipetakan.
- Seluruh jurnal diarahkan ke satu fallback account `LEGACY-UNCLASSIFIED`, bukan account yang terklasifikasi.
- Model `JournalEntry` memakai debit/credit, tetapi v1 menyimpan single-entry pemasukan/pengeluaran. Mapping pemasukan ke debit dan pengeluaran ke credit bukan jurnal double-entry yang seimbang.
- Branch jurnal hanya didapat dari order. Pengeluaran tanpa order menjadi global/null meskipun mungkin secara bisnis milik cabang tertentu.
- Actor `id_user = 0` akan menjadi unresolved kecuali dipetakan sebagai system actor.
- Total Rupiah dapat cocok meski klasifikasi akun, branch, dan arti debit/credit tidak benar.

Perbaikan wajib:

- Finance memilih salah satu: simpan sebagai `LegacyFinancialEntry` first-class atau transformasi ke Journal Header + balanced Journal Lines melalui aturan yang disetujui.
- Sediakan system actor untuk `id_user = 0`.
- Tambah resolution branch/account untuk transaksi yang memang dapat dibuktikan.
- Jika COA terbaru tidak kosong, saldo awal COA wajib mempunyai opening balance/ledger yang dapat direkonsiliasi.

### 9. Activity log dan notification

Status: **BLOCKER P0 UNTUK PERSYARATAN “SELURUH DATA”**.

Gap:

- Sebanyak 214.899 activity log dibuat sebagai `AuditLog`, tetapi `properties` hanya disimpan sebagai checksum. Isi before/after atau metadata historis tidak dapat dicari atau dipulihkan.
- `description` dipotong dan sebagian tipe/subject hanya menjadi string generik.
- Notification payload diproyeksikan menjadi title/message dan checksum; payload lain tidak dipertahankan.
- Count reconciliation dapat cocok 100% meskipun isi properties/payload hilang.

Perbaikan wajib:

- Simpan payload legacy lengkap dalam field terenkripsi atau archive table dengan authorization ketat, ditambah projection aman untuk pencarian.
- Tambah checksum source dan projection, tetapi checksum tidak boleh menggantikan payload yang diwajibkan untuk dipertahankan.
- Tambah sampling/field-level reconciliation untuk event penting.

### 10. Tabel framework dan secret

Status: **SESUAI UNTUK DIABAIKAN**.

Tabel berikut bukan business state dan aman tidak dimigrasikan sebagai record aktif:

- `failed_jobs`
- `migrations`
- `password_reset_tokens`
- `personal_access_tokens`

Alasan: queue runtime, metadata framework, dan secret/token lama tidak boleh dihidupkan kembali. Count serta keputusan ignore harus tetap tercatat pada evidence.

## Matriks 34 tabel

| Tabel v1 | Target/rencana | Hasil audit |
|---|---|---|
| `activity_log` | AuditLog + encrypted legacy payload | Blocker: properties sekarang hanya checksum |
| `booking_kelas` | Booking, Reservation, Feedback, outcome | Blocker: scope/status/attendance |
| `check_in_outs` | Attendance event | Conditional; kosong pada snapshot |
| `coas` | AccountingAccount + opening balance | Conditional; kosong, saldo belum dipetakan |
| `customer_jadwal_statics` | RecurringSchedule | Perlu branch nullable/scope dan note |
| `customer_kelas` | Enrollment | Conditional; kosong pada snapshot |
| `failed_jobs` | Ignore | Sesuai |
| `jurnals` | Legacy finance entry atau balanced journal | Blocker Finance |
| `kelas` | Global ClassType + branch scopes | Blocker |
| `kelas_activities` | ClassSlot + Studio/Room | Blocker |
| `kelas_images` | Deferred media metadata | Sesuai scope saat ini |
| `kelas_pakets` | PackageClassTypeScope | Blocker: source key saja |
| `kelas_pertamuans` | Historical slot + resolved venue | Perlu resolution venue |
| `kelas_pertemuan_absensis` | Attendance outcome | Conditional; kosong |
| `kelas_ratings` | BookingFeedback | Conditional; kosong, merge policy belum ada |
| `location_openings` | BranchOpeningHour | Cukup |
| `location_studios` | Area Studio | Perlu equipment/phone dan admin API |
| `locations` | Branch/Profile/PaymentAccount | Perlu email/map/rekening |
| `migrations` | Ignore | Sesuai |
| `model_has_permissions` | Capability override | Conditional; kosong |
| `model_has_roles` | UserRole/Assignment | Perlu effective-access reconciliation |
| `notifications` | Notification + encrypted legacy payload | Conditional; kosong pada snapshot |
| `order_pakets` | Purchase/CustomerPackage/Ledger | Blocker payment/status/session semantics |
| `paket_locations` | PackageBranchScope | Blocker: package sekarang di-clone |
| `pakets` | Global Package + revision | Blocker |
| `password_reset_tokens` | Ignore | Sesuai |
| `permissions` | CapabilityDefinition | Conditional; kosong |
| `personal_access_tokens` | Ignore | Sesuai |
| `role_has_permissions` | RoleCapability | Conditional; kosong |
| `roles` | RoleDefinition/ApplicationRole mapping | Perlu access sign-off |
| `ruangans` | Room | Cukup, setelah venue slot ditambahkan |
| `users` | User/Profile/Identity/Credential/Alias | Perlu verification/access correction |
| `voucher_customers` | Entitlement/Redemption | Perlu active/discount snapshot correction |
| `vouchers` | Voucher/Alias/Scopes | Cukup setelah Package scope diperbaiki |

## Kelemahan reconciliation saat ini

Reconciliation sudah kuat pada count, total sesi, total Rupiah, booking/reservation status, source key, orphan, dan duplicate opening ledger. Namun hasil dapat `blocking=false` walaupun beberapa arti data salah.

Control tambahan yang wajib:

1. Class type global dan jumlah scope cabang per tipe.
2. Slot per source studio/room dan status source.
3. Package identity, branch scope, class scope, dan revision.
4. Order base price, discount, unique code, payable, paid amount, dan payment method.
5. User verification state dan effective capability per branch.
6. Attendance outcome dan alasan.
7. Branch email/map/payment account completeness.
8. Audit/notification encrypted-payload cardinality dan checksum.
9. Journal classification/branch/account serta balance policy.
10. Column-level disposition untuk seluruh 309 kolom: first-class, encrypted archive, deferred media, atau explicit ignore dengan alasan.

## Urutan engineering yang direkomendasikan

1. Bekukan Rehearsal 1; jangan mengubah mapping version final.
2. Buat kamus domain v1 dari source code v1 untuk status kelas, order, booking, voucher, role, dan saldo.
3. Refactor katalog global dan scope: ClassType, Package, branch scope, serta class scope.
4. Refactor venue: ClassSlot → Branch + Studio + optional Room.
5. Refactor purchase breakdown/status dan voucher snapshot.
6. Refactor attendance outcome dan recurring schedule.
7. Lengkapi Branch/Studio/PaymentAccount dan user verification/access mapping.
8. Tentukan model finance bersama Finance Owner.
9. Pertahankan encrypted legacy payload untuk audit/notification.
10. Perluas reconciliation sampai column-level dan semantic controls.
11. Update full import, delta applier, reverse outbox, API, form, fixture, dan E2E.
12. Jalankan integration harness dari target kosong. Rehearsal 1 baru boleh dimulai setelah seluruh P0 lulus.

## Gate baru sebelum Rehearsal 1

- Tidak ada katalog global yang dipaksa menjadi milik satu cabang.
- Semua relasi multiple branch/class dipertahankan sebagai scope first-class.
- Seluruh slot mempertahankan studio/room dan status yang benar.
- Seluruh order mempertahankan breakdown Rupiah dan state bisnis.
- Seluruh booking mempertahankan package, reservation, attendance outcome, dan venue.
- Tidak ada akun belum terverifikasi yang berubah menjadi terverifikasi.
- Tidak ada payload audit material yang diganti hanya dengan checksum.
- Seluruh 309 kolom memiliki disposition eksplisit dan teruji.
- Count, sesi, Rupiah, status, scope, venue, dan field-level checksum cocok.
- Media aktif tetap nol pada mode `metadata-only`.

## Batas audit

SQL dump membuktikan bentuk tabel, data, volume, dan sebagian komentar status. SQL dump tidak membuktikan seluruh perilaku form/controller v1. Arti kode status dan timing perubahan saldo harus diverifikasi terhadap source code v1 atau keputusan Data Owner. Tidak aman menetapkan arti angka hanya berdasarkan nama kolom.

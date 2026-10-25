# Peta Pemangkasan — Daily Dose Pilates V2

> **Status (25 Okt 2026):** **Gelombang 0 dan 1 selesai**; **gelombang 3 sebagian** (lihat 4.4). Gelombang 2 dan 4 masih usulan.
>
> **Konteks dari pemilik produk:** v1 (Laravel, `dailydosepilates.com`) **masih berjalan di produksi** dengan struktur data berbeda; v2 (ini) **belum produksi** dan akan menggantikannya. Akibatnya: skrip migrasi v1→v2 di `tools/migrations` **dipertahankan** sampai peluncuran, dan data di database dev kemungkinan berasal dari v1 (data pelanggan nyata).
> **Dasar:** pembacaan kode, hitungan baris/endpoint/tabel, dan data database dev. Saya **tidak punya data pemakaian produksi**, jadi bagian bertanda **TANYA** menunggu keputusan pemilik produk.
> **Tujuan:** aplikasi manajemen studio pilates yang pragmatis. Fitur yang tidak dipakai, tidak selesai, atau lebih rumit dari masalah yang diselesaikan dikurangi.

## 1. Cara membaca peta

| Tanda | Arti |
|---|---|
| **PERTAHANKAN** | Inti pilates atau melindungi uang pelanggan; biarkan. |
| **SEDERHANAKAN** | Fungsinya perlu, bentuknya terlalu rumit; kurangi lapisan. |
| **HAPUS** | Tidak dipakai, tidak selesai, atau tidak punya pemakai; cabut. |
| **TANYA** | Bergantung pada kebutuhan bisnis yang hanya Anda yang tahu. |

## 2. Ukuran sekarang (angka terukur)

| Bagian | Kode | Tes | Catatan |
|---|---:|---:|---|
| Backend `apps/api` | 30.800 | 18.900 | 272 endpoint, 42 tabel, 11 peran, 75 izin |
| Frontend `apps/web` | 68.600 | 16.700 | 80 halaman, 35 spesifikasi e2e (21 + 14 di `e2e/real`) |
| Worker `apps/worker` | 1.100 | — | Tidak berjalan di setup dev; jalan di konfigurasi PM2 produksi |
| Skrip `tools/` | 30.800 | — | UAT, verifikasi "adversarial", migrasi v1 |
| `scratch/` (terlacak git) | 79.000 | — | 130 berkas skrip sekali-pakai dan keluaran |
| `docs/` (terlacak git) | 858.000 baris | — | 23 dokumen utama, 35 laporan UAT, sisanya data/HTML |

Pola kerumitan yang berulang: `expectedVersion` 134 kali, `idempotency` 154 kali, nama ganda Inggris/Indonesia di 21 berkas, tampilan sangat besar (7 file web > 1.200 baris).

## 3. Fungsi inti pilates (patokan untuk menilai sisanya)

1. Katalog publik, pendaftaran dan login pelanggan
2. Cabang, studio, ruangan, tipe kelas
3. Jadwal kelas: buat, tetapkan instruktur, terbitkan, batalkan, selesaikan
4. Paket, checkout, unggah bukti bayar
5. Verifikasi pembayaran + penjualan langsung oleh kasir
6. Booking, pembatalan, ubah jadwal
7. Presensi pelanggan dan instruktur
8. Saldo sesi pelanggan (riwayat penambahan/pemakaian)
9. Honor instruktur dan laporan: omzet, honor, biaya lain, laba (rentang tanggal bebas)
10. Pengguna dan peran staf
11. Pengingat WhatsApp/email

Semua yang **tidak** ada di daftar ini harus membuktikan kegunaannya.

## 4. Peta per area

### 4.1 HAPUS — tidak selesai atau tidak punya pemakai (risiko rendah) — **SELESAI 25 Okt 2026**

| Area | Bukti | Isi yang dicabut |
|---|---|---|
| **Import Data** (`/data-import`) | Halaman 765 baris, API-nya **tidak pernah dibuat** (tercatat di tes kontrak sebagai `KNOWN_MISSING`); sudah disembunyikan dari menu | Halaman, klien, tes |
| **Migrasi v1→v2 di UI** (`/migrations`, `/internal/migrations/*`) | 541 baris web + 6 endpoint (±240 baris API); halaman menampilkan data contoh dan keputusan tidak tersimpan; disembunyikan dari menu | Halaman, 6 endpoint. Skrip migrasi satu kali di `tools/` ditangani di 4.5 |
| **Mutasi bank** (`/finance/mutations/*`) | Tidak ada layar, 0 data, 0 jejak audit; melewati aturan persetujuan pembayaran (lihat pembahasan sebelumnya) | **Dicabut:** modul, 3 endpoint, mesin rekonsiliasi (±1.100 baris termasuk tes). Tabel `mutasi_bank` dibiarkan; daftar anomali keuangan kini hanya memuat pembelian yang tertahan verifikasi |
| **Peran kustom (RBAC dinamis)** | Buat/ubah/nonaktif peran dan pengecualian izin mengembalikan **501**; UI-nya sudah disembunyikan | **Dicabut:** 6 endpoint 501, 6 metode klien, dan seluruh kode edit/duplikasi/override di halaman Peran & Izin (hanya baca + ganti peran langsung pengguna yang tersisa) |
| **Rute ganda `/owner-branches`** (koreksi 25 Okt) | Pemeriksaan lanjutan: tabel `owner_cabang` **adalah mekanisme nyata** akses Owner cabang (peran OWNER dibentuk dari tabel ini saat login; juga dipakai auto-cancel dan pengingat), dan halaman **Penugasan Cabang** mengelolanya lewat `AssignmentService` (tipe "Owner cabang"). `/owner-branches` hanya salinan ganda dari jalur itu, tanpa pemanggil web | **Tabel dan halaman Penugasan DIPERTAHANKAN.** Duplikatnya **sudah dicabut (25 Okt):** 3 endpoint + `OwnerBranchService` (±240 baris). Skrip `tools/verification` yang masih mengimpornya (`adversarial-phase1`, `verify-spec-phase2`) tidak lagi bisa jalan; keduanya diarsipkan di gelombang 4 |
| **Proyeksi biaya** | Sudah dihapus (komit `a8f1ab76`) | — |

### 4.2 SEDERHANAKAN — fungsinya perlu, bentuknya berlebihan

> **Gelombang 1 selesai (25 Okt).** Temuan yang mengubah asumsi peta: dari 134 pemakaian `expectedVersion`, hanya **kelas, penyesuaian saldo (ledger), kasus bantuan, dan promosi paket** yang benar-benar memeriksa versi; sisanya diterima lalu diabaikan (formalitas di kontrak). Dari 154 pemakaian idempotency, sebagian besar pada uang/pesanan atau opsional. Maka yang dikerjakan:
> - **Alasan:** opsional (bila diisi tetap 3–500 karakter) untuk nonaktifkan/jeda/arsip cabang, studio, ruang, tipe kelas, paket, voucher, promosi, konten publik, template notifikasi, dan ubah draf kelas. **Tetap wajib:** hapus permanen, akun pengguna, rekening pembayaran, tarif, pembatalan/penolakan/koreksi uang dan saldo, akhiri penugasan.
> - **Kunci versi:** tetap wajib hanya untuk terbit/batal/selesai kelas dan keputusan penyesuaian saldo. Opsional (diperiksa bila dikirim) untuk tetapkan instruktur, ubah draf kelas, promosi paket, dan kasus bantuan.
> - **Idempotency:** tidak diubah (tidak terasa bagi staf; melindungi pesanan dan pembayaran).
> - **Gelombang 2, butir pertama selesai (26 Okt):** 85 pembungkus alias Indonesia (`daftarX`, `buatX`, ...) di 21 layanan API dihapus; tidak ada pemanggilnya di api, web, tools, maupun tes.
> - **Peran selesai (26 Okt):** hanya tujuh peran kanonik (`SUPER_OWNER`, `OWNER`, `MANAGER`, `ADMIN`, `FINANCE`, `INSTRUCTOR`, `CUSTOMER`); `OPS` (tidak pernah dipegang siapa pun) dihapus. Nilai lama `SUPERADMIN`/`COACH`/`MEMBER` tetap ada di enum database tetapi tidak pernah ditulis lagi: alat migrasi v1, seed, dan pembuatan akun memakai nama kanonik, dan `RoleAliasMigrationService` mengubah baris lama saat API menyala (di DB dev: 2 SUPERADMIN, 1 COACH, 38 MEMBER). Principal sekarang punya satu peran efektif, bukan dua (kanonik + alias).
> - **Belum:** klien API web, tampilan raksasa, dashboard, konten publik versi, template notifikasi versi.

| Area | Masalah | Usulan |
|---|---|---|
| **Kunci versi (`expectedVersion`)** | 134 pemakaian; setiap form edit master membawa versi dan bisa menjawab 409 | Pertahankan hanya di perubahan **status kelas** yang bisa berbenturan (terbit/batal/selesai). Cabut dari edit master (cabang, studio, ruang, tipe kelas, paket, voucher) |
| **Idempotency-key** | 154 pemakaian, hampir di semua POST | Pertahankan hanya untuk **uang dan pesanan**: checkout, bukti bayar, persetujuan, booking, penyesuaian saldo. Cabut dari data master |
| **Alasan wajib** | Dari keputusan K4: wajib di nonaktif/arsip/hapus/tolak/batal/ganti peran | Pertahankan di yang menyentuh **uang, saldo sesi, akun, dan hapus permanen**. Cabut dari nonaktifkan/aktifkan data master biasa |
| **Audit permanen** | Dipasang di hampir semua aksi staf | Pertahankan untuk uang, saldo, akun/peran, dan hapus. Jangan menambah untuk data master biasa |
| **Peran** | 11 kunci peran: `SUPER_OWNER`, `SUPERADMIN` (alias), `ADMIN`, `MANAGER`, `OWNER`, `FINANCE`, `INSTRUCTOR`, `COACH` (alias), `CUSTOMER`, `MEMBER` (alias), plus `OPS` | Satukan alias menjadi: Super Owner, Admin cabang, Finance, Owner cabang (baca saja), Instruktur, Pelanggan. 75 izin dikelompokkan lebih kasar |
| **Nama ganda EN/ID** | 21 berkas punya metode Inggris + alias Indonesia | Pilih satu, hapus pembungkus |
| **Klien API di web** | 7.300 baris klien tulisan tangan + tipe | Satukan pola panggilan; target 1 `apiFetch` + tipe, tanpa pembungkus per modul |
| **Tampilan raksasa** | Tujuh berkas web > 1.200 baris (Peran & Izin 1.653, Booking 1.450, Detail Pelanggan 1.403, Data Master 1.383, Keuangan 1.382, Ledger 1.290, Promosi Paket 1.243) | Pecah per bagian saat disentuh; jangan ditulis ulang sekaligus |
| **Konten publik** | 1.772 baris API + 1.292 web untuk slider dan FAQ dengan versi, draf, terbit, arsip | Cukup satu isi aktif + riwayat sederhana; hapus alur duplikat/arsip versi bila tidak dipakai |
| **Template notifikasi** | Editor WhatsApp dan email dengan versi dan arsip | Edit teks langsung + simpan; tanpa status draf/arsip |
| **Dashboard** | Lima variasi fokus peran (`EXECUTIVE`, `OWNER`, `FINANCE`, `OPERATIONS`, `BRANCH_OPERATIONS`) | Dua: ringkasan keuangan (Finance/Super Owner) dan ringkasan operasional (Admin/Owner) |
| **Lifecycle (hapus/arsip)** | Layanan baru dari sesi lalu: dialog tunggal, pemindaian FK, `class-slot`, dll | Pertahankan sebagai satu-satunya jalur hapus (menggantikan 5 jalur lama), tetapi alasan hanya wajib sesuai aturan di atas |
| **Laporan keuangan tambahan** | `reconciliation/overview`, `anomalies`, `legacy-cashflow`, `owner-branch-performance` di luar 4 laporan inti | Cabut yang tidak punya layar; `legacy-cashflow` adalah sisa v1 |
| **Tutup buku** | Tutup buku + jurnal koreksi dengan persetujuan Super Owner | **DICABUT 25 Okt** (v1 tidak punya). Laporan memakai rentang tanggal bebas; biaya lain bertanggal dan bisa diubah/dihapus. Tabel `monthly_close`/`correction_journal` jadi arsip |

### 4.3 PERTAHANKAN — inti pilates dan pelindung uang

| Area | Alasan |
|---|---|
| Jadwal kelas, booking, batal, ubah jadwal | Fungsi inti |
| Paket, checkout, bukti bayar, verifikasi pembayaran | Fungsi inti; verifikasi tetap dengan pemisahan tugas (pencatat ≠ penyetuju) |
| Penjualan langsung kasir | Fungsi inti |
| Saldo sesi dengan riwayat | Sesi = uang pelanggan |
| Presensi (QR/tautan/kiosk) | Dasar honor dan pemakaian sesi |
| Honor instruktur per cabang × tipe kelas | Dasar laporan biaya |
| Laporan omzet, honor, biaya lain, laba | Empat laporan inti |
| Email/WhatsApp pengingat (yang sudah ada) | Dipakai pelanggan |
| Dasbor kesehatan, antrean email | Kecil dan berguna |

### 4.4 TANYA — keputusan bisnis, bukan teknis

> **Keputusan pemilik produk (25 Okt):** KYC KTP+selfie **dipertahankan** (kebutuhan bisnis; server sudah menegakkan: checkout, voucher, dan booking pelanggan ditolak sebelum disetujui). Rute khusus mobile **dicabut** (termasuk satu rute yang menerbitkan sesi tanpa bukti; lihat komit `9656ea8b`). Voucher **dan** promosi dipertahankan. Kasus bantuan **dicabut** (`ea806701`). Panduan SOP di aplikasi **dipertahankan**. **Worker diganti penjadwal kecil di dalam API** (25 Okt; `apps/worker` dihapus; dari 7 job worker hanya 2 yang benar-benar bekerja, sisanya stub; tanpa Redis; aktif dengan `SCHEDULER_ENABLED=true`, auto-cancel H-24 tetap perlu `ENABLE_AUTO_CANCEL=true`). Menunggu: pentingnya jurnal koreksi (butir 6).


| Pertanyaan | Dampak bila "tidak" |
|---|---|
| **Verifikasi identitas (KTP/selfie).** Dipakai nyata? Ada 4.579 antrean di data dev. | Hapus alur KYC: unggah dokumen, antrean tinjau, akses dokumen terotorisasi (±1.200 web + sebagian besar bagian identity) |
| **Aplikasi mobile.** `MOBILE_CUSTOMER_API_CONTRACT.md` menjelaskan iOS/Android, tetapi **tidak ada aplikasi mobile di repositori** (hanya api, web, worker). Rute OTP, pemulihan akun, tautan akun, `sessions/revoke-all` tidak punya pemanggil web. | Cabut rute khusus mobile dan dokumennya |
| **Worker (`apps/worker`).** 7 job, konfigurasi PM2 produksi menjalankannya. | Kalau produksi tidak memerlukannya, cabut aplikasi dan konfigurasinya (1.100 baris + tes) |
| **Dua mekanisme diskon: voucher dan promosi paket.** Total ±3.900 baris web. | Pertahankan satu |
| ~~**Owner Cabang.**~~ **Terjawab 25 Okt:** akun Owner melekat ke cabang dan peran lewat penugasan; Super Admin/Owner utama melihat semua cabang. Itu sudah persis cara kerja `owner_cabang` + halaman Penugasan, jadi tidak ada yang dicabut selain rute ganda. | — |
| **Kasus bantuan pelanggan** (`/support-cases`, 684 web + API) | Cabut bila bantuan lewat WhatsApp |
| ~~**Jurnal koreksi pasca-tutup buku.**~~ **Dicabut 25 Okt** bersama tutup buku. | — |
| **Panduan SOP di aplikasi** (`/workspace/guide`, 783 baris) | Pindah ke dokumen biasa |

### 4.5 Repositori (bukan aplikasi)

| Bagian | Usulan |
|---|---|
| `tools/verification` (±25 skrip, ±27.800 baris, nama "adversarial") | Arsipkan ke cabang `archive/verification`; simpan 3–4 yang dipakai skrip root (`db-fresh`, harness MySQL, integrasi API) |
| `scratch/` (130 berkas, 79.000 baris) | Hapus dari git; berisi skrip sekali pakai dan keluaran |
| `docs/uat` (35 laporan) dan dokumen audit lama | Pindah ke `docs/arsip/`; sisakan README + panduan operasional + spesifikasi aktif |
| `tools/migrations` (migrasi v1) | Simpan sampai migrasi selesai, lalu arsipkan |

## 5. Temuan sampingan yang perlu keputusan Anda

1. **Dump database ikut terlacak git.** `backups/dailydose_v2_export.sql.gz` (12 MB) dikomit pada 3 Okt (komit "Update"). Isinya memuat tabel `user`, `profil_pengguna`, `pembelian`, `bukti_pembayaran`. Repositori GitHub-nya **private**, tetapi data pribadi sebaiknya tidak ada di riwayat git. Usulan: periksa apakah isinya data pelanggan nyata; jika ya, hapus dari riwayat dan putar ulang kredensial yang ada di dump.
2. **Kata sandi basis data dev ditulis di `package.json`** (skrip `db:console`). Ini kredensial lokal Docker, tetapi lebih baik membaca dari `.env`.

## 6. Urutan eksekusi yang disarankan (satu gelombang = satu sesi pembahasan)

| Gelombang | Isi | Risiko | Dampak |
|---|---|---|---|
| **0** | Cabut fitur mati: Import Data, Migrasi UI, Mutasi bank, sisa RBAC 501, owner-cabang (bila setuju) | Rendah, tidak ada pemakai | ±4.000 baris kode+tes |
| **1** | Aturan baru: kunci versi, idempotency, alasan wajib, audit hanya untuk uang/saldo/akun/hapus | Sedang, mengubah kontrak API; butuh perbaikan tes | Form master jadi langsung simpan |
| **2** | Sederhanakan modul: peran (alias), konten publik, template notifikasi, dashboard, nama ganda | Sedang | Lebih sedikit file dan cabang kode |
| **3** | Keputusan TANYA: KYC, mobile, worker, diskon, kasus bantuan | Bergantung jawaban | Bisa terbesar |
| **4** | Rapikan repositori: arsip `tools/verification`, hapus `scratch/`, arsip docs UAT, tangani dump DB | Rendah | −110.000 baris dari git |

Tiap gelombang diakhiri tes hijau (API dan web) dan verifikasi di browser. Skema database **tidak dihapus** (tabel warisan dibiarkan), jadi tidak ada langkah destruktif.

## 7. Yang tidak akan dilakukan

- Tidak menghapus data pelanggan, saldo sesi, riwayat pembayaran, atau audit yang sudah ada.
- Tidak menjatuhkan tabel atau kolom.
- Tidak mengubah perilaku pembayaran, saldo sesi, atau presensi tanpa persetujuan Anda per butir.

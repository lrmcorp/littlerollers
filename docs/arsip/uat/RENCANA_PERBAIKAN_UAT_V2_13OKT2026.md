# Rencana Perbaikan UAT Daily Dose Pilates V2 — Cek Ulang 13 Okt 2026

Sumber: laporan UAT ulang 13 Okt 2026 (publik + superadmin, v2.dailydosepilates.com).
Cakupan: poin 2–26 (poin 1 tidak ada di laporan sumber; konfirmasi ke pembuat laporan bahwa memang tidak ada).
Instruktur belum dicek ulang (akun tes belum punya penugasan) → masuk Fase 7.

Repo: `dailydose_v2` (API NestJS + Prisma di `apps/api`, Web Next.js di `apps/web`, worker di `apps/worker`).
**Status: sebagian besar sudah dikerjakan. Lihat `LAPORAN_PENGERJAAN_UAT_13OKT2026.md` untuk hasil nyata per poin; bagian di bawah ini adalah rencana awal dan sebagian klaimnya sudah dikoreksi di laporan.**

---

## 0. Aturan kerja (berlaku untuk semua fase)

1. **Satu poin = satu cabang kecil/commit** dengan tes sendiri. Tidak ada commit yang mencampur poin.
2. **Reproduksi dulu, baru perbaiki.** Setiap poin wajib punya tes yang GAGAL sebelum perbaikan dan LULUS sesudahnya (unit / integrasi / e2e sesuai sifat poin).
3. **Verifikasi versi terdeploy.** Beberapa poin tampak sudah ada di kode HEAD (lihat §1). Bisa jadi produksi menjalankan build lama, atau perbaikan hanya menutup satu jalur. Jangan menganggap "sudah beres" tanpa bukti di staging.
4. **Data produksi tidak disentuh langsung.** Semua uji di staging dengan salinan DB. Koreksi data produksi (lembur booking, paket, akun tes) lewat skrip migrasi/koreksi yang punya mode `--dry-run`, dicatat di audit, dan disetujui pemilik sebelum dijalankan.
5. **Gerbang per fase** (semua wajib hijau sebelum lanjut): `pnpm check` (lint + typecheck + unit), tes integrasi area terkait, tes web (vitest) area terkait, dan smoke e2e. Suite penuh dijalankan di latar belakang pada snapshot + DB terpisah, jangan ditunggu di tengah pengerjaan.
6. **Laporan wajib per fase** (format §9): laporan pengerjaan saat fase berjalan, laporan selesai saat fase ditutup, disimpan di `docs/uat/`.
7. Bila ada poin yang butuh keputusan bisnis atau akses eksternal (§8), dikerjakan sisi teknisnya dulu, lalu ditandai "menunggu keputusan" — tidak dilewati diam-diam.

---

## 1. Temuan awal dari kode (belum diverifikasi di staging)

| Poin | Yang terlihat di kode HEAD | Implikasi |
|---|---|---|
| 2 | `pemesanan-kelas.service.ts` ~L731 sudah `SELECT ... FOR UPDATE` pada slot dan ~L804 cek `bookedCount >= capacity` di dalam transaksi (jalur booking utama aman). Cek ~L443 hanya pratinjau kelayakan (bukan penentu) dan TIDAK perlu dihapus. **`ubah-jadwal.service.ts` (L301, L366-398) membaca `bookedCount` slot tujuan dan menaikkannya TANPA `FOR UPDATE`** → kandidat kuat penyebab overcapacity. Impor `migrate-full-v1-to-v2.ts` juga belum tentu mematuhi kapasitas. | Prioritas audit: ubah jadwal, impor migrasi, booking manual admin, serta `bookedCount` yang tidak sinkron dengan jumlah booking aktif. |
| 8 | Model `PemesananKelas` hanya punya indeks biasa `[userId,status]` dan `[classSlotId,status]`, TIDAK ada unique `(classSlotId,userId)`. | Duplikat memang tidak dicegah di level data. MySQL tidak punya unique parsial → perlu kolom bantu/generated column atau cek dalam transaksi terkunci. |
| 9 | `Voucher.discountType` adalah `String` (default `"NOMINAL"`), bukan enum; `pembelian-paket.service.ts` L79 memetakan `=== 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT'`. Nilai lain (mis. `PERCENT`) otomatis jadi nominal → petunjuk kuat "10%" tampil "Rp 10". (Koreksi: penerapan voucher di API SUDAH memeriksa `active` dan `validUntil`; yang tampak "aktif" adalah data voucher yang periodenya memang masih berlaku atau flag aktif belum dimatikan.) | Cek nilai aktual `discountType` di DB; jadikan enum; tambah validasi periode di server. |
| 4 (tambahan) | `payment-expiration-worker.ts` hanya membatalkan status `PENDING`; pembelian `WAITING_VERIFICATION` (895 antrean) tidak pernah kedaluwarsa. Tidak ada modul mutasi rekening sama sekali (hasil grep hanya "mutasi sesi"). | Fitur pencocokan memang BELUM ADA. Perlu aturan umur untuk antrean menunggu. |
| 7 (tambahan) | `whatsapp-gateway.service.ts` L91-103: bila token/phoneId resmi tidak diisi, otomatis memakai provider MOCK (hanya mencatat). Provider resmi sudah ada. | Masalah utamanya konfigurasi env produksi + templat disetujui Meta, bukan kode kirim. |
| 19 (tambahan) | `operations-automation.controller.ts` L29 mengizinkan `SUPER_OWNER, OWNER, MANAGER, ADMIN` untuk auto-cancel dan L42 `SUPER_OWNER, MANAGER, ADMIN` untuk reminder batch. (Catatan: skrip `scripts/automation-daemon.mjs` memakai kredensial bawaan; ini pengamatan di luar laporan UAT dan TIDAK diubah.) | Persempit peran sesuai permintaan. Cek apakah daemon/worker benar-benar jalan di produksi, sebab pengingat dan auto-cancel bergantung padanya. |
| 21 (tambahan) | `user-detail-view.tsx` L42 menyatakan pengiriman tautan setup password `NOT_IMPLEMENTED`, tetapi `users-view.tsx` L580 punya tombol "Kirim setup password". Laporan UAT bilang tombol itu mengganti password langsung. | Jalur ini membingungkan; telusuri perilaku nyata endpoint sebelum menamai ulang. |
| 15, 17, 23, 25 | Terkonfirmasi di kode: `sign-in-view.tsx` L151 ("email dan password"), L242 & L283 (dua "Belum punya akun?"); `register-view.tsx` L325 ("langsung aktif"); `public-landing.tsx` L383/L401 (Member Komunitas/Rutin); `class-detail-view.tsx` L209; `customer-detail-view.tsx` L702-705 ("Rule #12 & #13"); `owner-branch-performance-view.tsx` L108 ("Keputusan Bisnis #7 & #10"); "ledger authoritative" di `ledger-view.tsx` L546, `customer-session-detail-view.tsx` L258, `payment-review-detail-view.tsx` L543/L587; `Gross Sales` di `guide-view.tsx` L427. Teks "6-8 peserta" dan "Graha Family Surabaya, Jakarta" TIDAK ada di kode web/API. | Poin 17 bersumber dari DATA (cabang/konten publik di DB), bukan kode: perbaiki data + pastikan tampilan memakai data cabang. `(OTHER COST)`, `(REALTIME)`, `DD-MK`, tanggal grafik juga tidak ditemukan di kode web → cari di label API/seed/DB. |
| 19 | `reminders-view.tsx` sudah punya dialog konfirmasi ("Jalankan Evaluasi Auto-Cancel H-24?") dan tes yang menyembunyikan tombol untuk non-superadmin. | Kemungkinan produksi memakai build lama. Verifikasi deploy; tambah pengaman di sisi API (bukan hanya UI). |
| 14 | `apps/web/app/not-found.tsx` ada. | Cek kenapa produksi menampilkan kotak abu-abu memuat terus (kemungkinan `loading.tsx`/session-context menahan render). |
| 18 | `guide/guide-view.tsx` masih memuat "KYC", "LUNAS (Verified)", tab Front Desk/Finance; ada tes yang MEWAJIBKAN tab itu terlihat (`guide-view.test.tsx`). | Tes harus diubah bersama konten. |
| 3 | Teks "Konteks sesi tidak dapat dimuat" ada di `session-context.tsx` L373. | Pesan muncul saat `GET` konteks sesi gagal; akar masalah ada di API/DB, bukan di teks. |
| 4 | Pembuatan pembelian memakai `paymentUniqueCode` (`pembelian-paket.service.ts`); modul mutasi rekening tidak ditemukan di `api/src`. | Kemungkinan fitur pencocokan otomatis memang belum ada, bukan sekadar mati. Tentukan di Fase 0. |
| 7 | `whatsapp-gateway.service.ts` ada; `provider-adapters.ts` ada. | Perlu cek mode (`dry-run`/log-only) dan konfigurasi provider. |

---

## Fase 0 — Baseline, reproduksi, dan pengaman (WAJIB paling awal)

**Tujuan:** tahu persis kondisi sebenarnya sebelum mengubah apa pun.

Tugas:
- 0.1 Catat commit yang berjalan di produksi vs `HEAD` (cek `update.sh`/image tag). Jika beda, daftar perubahan yang belum terdeploy dan tandai poin yang mungkin sudah tertangani.
- 0.2 Buat cabang kerja `fix/uat-13okt-fase-N` dari `main`; pastikan working tree bersih (file `scratch/verify_kategori_a.ts` yang belum di-commit: putuskan commit sebagai alat verifikasi atau pindahkan).
- 0.3 Siapkan staging dengan salinan DB produksi (anonimkan data pribadi). Jalankan `pnpm check` sebagai baseline merah/hijau awal.
- 0.4 Jalankan skrip verifikasi read-only untuk data nyata: slot overcapacity, booking kembar, paket dipakai-sebelum-disetujui, pembayaran menunggu per umur, akun tes, voucher aktif lewat periode, tarif honor kosong. Simpan hasil sebagai `docs/uat/bukti/fase0-*.txt`.
- 0.5 Tarik log server 13 Okt sekitar 11.50 WIB (poin 3) dan catat jenis galat.
- 0.6 Buat tabel pelacak status 25 poin (§10) — satu sumber kebenaran progres.

Keluaran: `laporan_pengerjaan_fase_0.md` berisi baseline, daftar poin yang ternyata sudah beres/belum, dan angka nyata dampak data (mis. berapa slot overcapacity).

---

## Fase 1 — Integritas kuota, sesi, dan pembayaran (Kritis, paling berisiko)

### Poin 2 — Booking melewati kapasitas
- Audit SEMUA jalur yang menulis `PemesananKelas`/`bookedCount`: booking customer, booking manual admin, ubah jadwal, restore/aktifkan ulang booking, impor migrasi, pembatalan (decrement).
- Pastikan setiap jalur: dalam satu transaksi, kunci baris slot (`FOR UPDATE`) SEBELUM membaca kapasitas, hitung ulang dari data (bukan hanya `bookedCount`), tolak bila penuh, lalu simpan. Titik pertama: `ubah-jadwal.service.ts` (tidak ada kunci). Cek ~L443 di `pemesanan-kelas.service.ts` hanya pratinjau; biarkan, tetapi pastikan tidak dipakai sebagai penentu.
- Tambahkan tolok ukur anti-drift: job/pemeriksa yang membandingkan `bookedCount` dengan hitungan booking aktif dan melaporkan selisih; pertimbangkan constraint/DB-level (mis. trigger atau cek di transaksi) bila memungkinkan.
- Skrip koreksi data: daftar 6 slot 5–7 Okt yang melebihi kapasitas (Muara Karang 7 Okt 18.00 & 19.00 = 5/4), `--dry-run` dulu; JANGAN membatalkan booking otomatis — keputusan siapa yang dipindah/dibatalkan ada di operasional.
- Tes: integrasi konkurensi (N booking paralel ke slot kapasitas 4 → tepat 4 berhasil), per jalur (customer, admin manual, ubah jadwal). Tes harus gagal di kode lama.

### Poin 8 — Booking kembar
- Constraint: satu customer tidak boleh punya >1 booking AKTIF pada slot yang sama. MySQL tidak mendukung unique parsial → gunakan kolom bantu (mis. generated column yang bernilai NULL bila status batal) dengan unique `(classSlotId, userId, kolom_bantu)`, ditambah cek di transaksi terkunci. Migrasi unique HANYA bisa jalan setelah duplikat lama dibereskan (urutan: audit → keputusan → koreksi → migrasi). Pesan galat jelas bagi customer dan admin.
- Audit data: customer Fera Julia (4x), sherly luciana, hermi subianty + sisanya; skrip dry-run untuk daftar duplikat. Putuskan (dengan operasional) apakah sesi yang terpotong dikembalikan.
- Tes: dua request bersamaan dari customer yang sama → satu berhasil; admin manual juga ditolak.

### Poin 6 — Sesi terpakai sebelum pembayaran disetujui
- Booking hanya boleh memakai paket pelanggan yang pembayarannya `APPROVED`/aktif (cek di `package-access.service.ts` dan jalur booking). Ledger sesi tidak boleh mengurangi dari paket belum aktif.
- Audit: kueri semua `PaketPelanggan` dengan sesi terpakai > 0 namun `Pembelian` belum disetujui (kasus Lusianna "8 Sessions PVG" 2 sesi terpakai, dan lainnya). Keputusan per kasus: batalkan booking / setujui pembayaran / koreksi ledger lewat jurnal koreksi (bukan edit langsung).
- Tes: booking dengan paket status pembayaran menunggu → ditolak; setelah disetujui → berhasil.

### Poin 4 — Pencocokan transfer otomatis
- Fase 0 menentukan: apakah ada pemasok mutasi rekening (mis. feed bank/email/scraper/impor CSV)? Jika TIDAK ada → ini pembangunan fitur, bukan perbaikan; sisi teknis minimal: impor mutasi (CSV/API) + pencocokan by nominal unik + antrean manual untuk yang tak cocok + log audit.
- Pencocokan: nominal unik (`paymentUniqueCode`), toleransi waktu, satu mutasi hanya cocok ke satu pembelian, tolak ambigu (masuk antrean manual), idempotent.
- Tangani 895 tunggakan: pencocokan massal dengan `--dry-run` + laporan, bukan auto-approve buta. Pembayaran yang sudah kedaluwarsa (tertua 25 Sep) perlu aturan kedaluwarsa jelas.
- Beri umur maksimum untuk `WAITING_VERIFICATION` (worker kedaluwarsa saat ini hanya menangani `PENDING`): lewat batas → kedaluwarsa/tandai perlu ditinjau, jangan menumpuk tanpa batas. Putuskan nasib 895 antrean lama bersama pemilik.
- Perbaiki teks Keuangan "deteksi anomali belum aktif" (teks ini tidak ditemukan di kode web; telusuri sumbernya di API/halaman Keuangan) (juga poin 24) sesuai keadaan setelah fitur.
- **Butuh keputusan pemilik** (§8): sumber mutasi rekening.

### Poin 5 — Tombol "Setujui" langsung di daftar
- Hapus/ubah aksi setujui di daftar pembayaran (`purchases/purchase-review-view.tsx`); persetujuan hanya dari halaman detail yang menampilkan bukti transfer, ATAU dialog konfirmasi yang menampilkan nominal + bukti. Di sisi API: persetujuan menolak jika belum ada bukti/belum dibuka? (minimal: wajib ada bukti unggahan bila metode transfer).
- Catat di audit siapa menyetujui dan bukti mana yang dilihat.
- Tes web: tombol tidak ada di daftar / dialog muncul; tes API: tanpa bukti ditolak.

### Poin 3 — Error 500 intermiten
- Analisis log 13 Okt ~11.50 WIB: pool koneksi DB habis, timeout Prisma, deadlock (mungkin akibat kunci baru Fase 1!), memori, restart worker.
- Perbaikan sesuai akar masalah; tambah pencatatan galat terstruktur dengan correlation id; batas waktu + retry aman pada endpoint konteks sesi/dashboard/detail staf; pesan galat bagi pengguna yang memberi tombol "Coba lagi".
- Tes: simulasi kegagalan sementara (mock) → UI menampilkan coba lagi, bukan halaman mati; uji beban ringan pada endpoint terkait.
- Catatan urutan: kerjakan SETELAH kunci konkurensi poin 2 agar deadlock baru terpantau, lalu pantau 24 jam di staging.

Gerbang Fase 1: tes konkurensi lulus, audit data (dry-run) terdokumentasi, tidak ada regresi di `bookings.integration`, `packages.integration`, `class-slot.spec`.
Keluaran: `laporan_pengerjaan_fase_1.md` + `laporan_selesai_fase_1.md` (angka sebelum/sesudah, bukti log tes).

---

## Fase 2 — Keamanan operasional dan data tes

- **Poin 19**: verifikasi build produksi; persempit `@Roles` di `operations-automation.controller.ts` L29 dan L42 menjadi hanya `SUPER_OWNER` (saat ini OWNER/MANAGER/ADMIN masih boleh), wajib konfirmasi (dialog sudah ada di UI; pastikan muncul di produksi) dan dicatat di audit. Tes API per peran. Pastikan juga daemon/worker benar-benar berjalan di produksi dan ada pemantauan.
- **Poin 13**: daftar akun tes (`dummy@example.com`, `admin_test`, `ridhoinstruktur@example.com`, instruktur bernama "-") + kueri pola serupa. Nonaktifkan (bukan hapus bila punya riwayat), pastikan tidak muncul di daftar publik/jadwal. Skrip dry-run. Akun tes resmi di `docs/AKUN_TESTING_RESMI.md` dipisahkan jelas dari produksi.
- **Poin 21**: audit log harus mencatat SEMUA perubahan akun staf (ubah peran, status, nama, reset); satukan label tombol "Kirim setup password" — putuskan perilaku sebenarnya (kirim tautan vs ganti langsung) dan buat nama + perilaku konsisten. Tes: setiap perubahan menghasilkan entri audit.
- **Poin 22**: mode "Semua cabang" — saat klik "Buat kelas"/"Buat booking" tampilkan pemilih cabang (modal) alih-alih tombol mati.

Gerbang: tes peran (matriks superadmin/admin/front desk/finance/instruktur/customer) untuk endpoint operasi.

---

## Fase 3 — Keakuratan angka, katalog, dan keuangan

- **Poin 10**: satu sumber hitungan. Petakan 3 angka verifikasi (dashboard 4.560 / halaman Verifikasi 1 / daftar 9.254) ke definisinya (semua vs menunggu vs ...), pakai satu fungsi layanan; label jelas. Booking per cabang 0 → perbaiki kueri `dashboard.service.ts`. Tes unit dengan data kontrol yang angkanya bisa dihitung tangan.
- **Poin 11**: isi tarif honor instruktur (`InstructorFee`) — butuh data tarif dari pemilik (§8); perbaiki perhitungan Performa Cabang; tampilkan "tarif belum diisi" alih-alih Rp 0 yang menyesatkan.
- **Poin 12**: satu sumber data paket (admin = publik). Cari bagaimana publik mengambil paket (`public-content`/`PackagePromotion` vs `Paket`); bersihkan paket kembar, promo Juli kedaluwarsa, nama terpotong ("FREE 3 Ses"); validasi panjang nama saat input. Skrip dry-run pembersihan katalog; keputusan paket mana yang dihapus oleh pemilik.
- **Poin 9**: periksa nilai `discountType` yang benar-benar ada di DB (kolom bebas `String`, pemetaan di `pembelian-paket.service.ts` L79 menganggap selain `PERCENTAGE` sebagai nominal); seragamkan jadi enum + migrasi data; bedakan persen vs nominal di semua tempat (checkout, admin, detail pembayaran, `customer-payment-flow.tsx`); tambahkan validasi `validUntil`, `quota`, dan `active` di server saat voucher dipakai (tidak ditemukan di API saat ini); nonaktifkan JULY2026; job penonaktifan otomatis. Tes: voucher 10% pada Rp 1.000.000 = Rp 100.000, voucher kedaluwarsa ditolak.
- **Poin 20**: samakan status customer (Aktif/Disetujui/Perlu perbaikan) dari satu sumber; hitungan tab "Paket Aktif" = isi sebenarnya.

---

## Fase 4 — Notifikasi dan login

- **Poin 7**: provider resmi sudah ada; gateway jatuh ke MOCK bila token/phoneId kosong. Isi konfigurasi produksi, ajukan/pastikan templat pesan disetujui, dan buat gateway MENOLAK start (atau menampilkan peringatan jelas di halaman Notifikasi) bila di produksi masih MOCK. Pisahkan jelas mode uji vs live lewat konfigurasi, dengan pengaman agar mode uji tidak aktif tak sengaja di produksi dan sebaliknya; pengingat dan auto-cancel tercatat status kirimnya. Notifikasi pop-up Chrome: tentukan sumber (push web?) dan cek izin/jadwal. **Butuh keputusan**: penyedia WhatsApp + kredensial (§8). Uji dengan nomor tes, bukan customer sungguhan.
- **Poin 16**: login OTP WhatsApp — bergantung poin 7. Rancangan: kode 6 digit, kedaluwarsa singkat, batas percobaan + rate limit, satu kali pakai, tercatat di audit, tidak menggantikan password sebelum diputuskan. Tes keamanan (brute force, replay).

---

## Fase 5 — Alur customer publik

- **Poin 14**: halaman 404 informatif: "Halaman tidak ditemukan" + tombol ke Beranda dan Jadwal; cari kenapa muncul kotak abu-abu memuat (cek `loading.tsx`/session-context di rute tak dikenal). Tes e2e: URL ngawur → pesan + tombol.
- **Poin 15**: rapikan teks login (email atau nomor WhatsApp), hilangkan tautan daftar ganda, nomor langkah form daftar 1–2 berurutan, ganti "Akun langsung aktif" dengan keadaan sebenarnya (perlu verifikasi?).
- **Poin 17**: kapasitas, kota, alamat diambil dari data cabang (`Cabang`/`Studio`), bukan teks tetap ("6-8 peserta", "Graha Family Surabaya, Jakarta"); halaman Studio memuat alamat; data alamat yang kosong perlu diisi pemilik (§8).
- **Poin 18**: tulis ulang Panduan untuk customer (tanpa tanggal lahir, Barre, APPROVED, LUNAS, KYC); panduan internal (Front Desk/Finance) pindah ke dalam login berhak akses. Perbarui `guide-view.test.tsx` sesuai.

---

## Fase 6 — Teks dan kerapian (minor, dikerjakan sapuan menyeluruh)

- **Poin 23**: ganti kode programmer → bahasa biasa. Pencarian terstruktur di `apps/web/app` dan teks API: `ALL_LEVELS`, `Asia/Jakarta`, `DD-MK`/`DD-SBY`, tanggal `YYYY-MM-DD` di grafik, `Rule #`, `Keputusan Bisnis #`, `ledger authoritative`, `Optimistic locking`, `Role & Scope`, `(OTHER COST)`, `(REALTIME)`, `Projection Cost`, `Gross Sales`. Buat satu util pemformat (label enum, zona waktu, tanggal) agar konsisten.
- **Poin 24**: hapus/sembunyikan teks internal (Studio, Jadwal, Keuangan, Penyesuaian Sesi), perbaiki kalimat yang bertentangan.
- **Poin 25**: testimoni asli (butuh konten, §8), deskripsi per paket, perbaiki teks perlengkapan Reformer.
- **Poin 26**: judul tab Bahasa Indonesia konsisten ("Our Studios" → "Studio Kami"), perbaiki "1-20 dari 20 dari 20 paket".
- Tes pengaman: tes vitest yang memindai string terlarang pada halaman utama agar tidak kembali (daftar kata terlarang di satu berkas).

---

## Fase 7 — Regresi total, UAT ulang, laporan akhir

- 7.0 **Kontrak API & mobile**: perubahan respons/kode galat (kelas penuh, booking kembar, voucher, persetujuan) wajib dicerminkan di OpenAPI, klien Dart digenerate ulang, dan `dart test` di `packages/api-client-dart` hijau; kabari repo `dailydose_v2_mobile` bila kontrak berubah.
- 7.0b **Regresi item yang di laporan sumber sudah beres** (jangan sampai rusak lagi): nomor WhatsApp, notifikasi superadmin error, KTP opsional saat daftar, halaman Syarat dan Privasi, penghitung staf, penghitung "Menunggu lebih dari 24 jam". Masing-masing diberi tes/pemeriksaan ulang di UAT akhir.
- 7.1 Suite penuh (API unit + integrasi, web vitest, e2e Playwright) di snapshot terpisah; semua hijau.
- 7.2 Deploy ke staging; UAT ulang setiap poin 2–26 memakai langkah dan data yang sama dengan laporan sumber (publik + superadmin), mencatat bukti (tangkapan layar/log).
- 7.3 Uji peran INSTRUKTUR (belum pernah dicek ulang): siapkan penugasan untuk akun tes di staging, uji jadwal, check-in, honor.
- 7.4 Uji performa ringan + pantau galat 500 selama 24 jam.
- 7.5 Rencana deploy produksi: urutan migrasi, skrip koreksi data (dry-run → dijalankan setelah persetujuan), rencana rollback, jendela waktu.
- 7.6 Pasca-deploy: cek ulang poin-poin Kritis di produksi (hanya baca), tutup tabel pelacak.

Keluaran: `laporan_selesai_uat_13okt2026.md` (§9).

---

## 7b. Urutan & ketergantungan antar poin (wajib dipatuhi)

1. **Cadangan penuh DB produksi + uji pemulihan** sebelum skrip koreksi data apa pun.
2. Poin 2 (kunci kuota) dan 8 (anti-duplikat) dulu, karena duplikat membuat hitungan kuota/dashboard salah; koreksi data duplikat/overcapacity sebelum migrasi unique.
3. Poin 6 (blokir sesi dari paket belum disetujui) SEBELUM pencocokan massal poin 4, sebab menyetujui 895 pembayaran mengaktifkan paket dan membuka sesi sekaligus.
4. Poin 4 sebelum poin 10 (angka antrean verifikasi berubah drastis setelah pencocokan).
5. Poin 9 (voucher) sebelum poin 12 (katalog/harga) agar harga akhir konsisten.
6. Poin 7 sebelum 16 (OTP butuh WhatsApp berjalan); poin 15 (teks login) disesuaikan setelah 16 diputuskan.
7. Poin 3 dipantau setelah perubahan penguncian Fase 1 (risiko deadlock/timeout baru).
8. Poin 13 (akun tes) dikerjakan sebagai koreksi data oleh pemilik.

## 8. Keputusan / masukan yang dibutuhkan dari pemilik (tidak bisa ditebak dari kode)

0. Arti "notif Pop Up via Chrome" pada poin 7: apakah pop-up izin notifikasi browser yang mengganggu di situs publik, atau notifikasi push yang diharapkan? Laporan sumber ambigu.

1. Sumber mutasi rekening untuk poin 4 (feed bank, impor CSV, email notifikasi bank?).
2. Penyedia WhatsApp + akun/kredensial + templat pesan (poin 7, 16).
3. Tarif honor instruktur per kelas/level (poin 11).
4. Paket mana yang resmi dijual; nasib paket kembar/promo Juli (poin 12).
5. Nasib booking kembar dan booking melebihi kapasitas yang sudah terjadi: pindah, batalkan, atau biarkan; pengembalian sesi (poin 2, 8).
6. Penanganan paket yang dipakai sebelum dibayar (poin 6).
7. Alamat resmi + kapasitas tiap cabang; konten testimoni asli (poin 17, 25).
8. Konfirmasi poin 1 memang tidak ada di laporan.

## 9. Format laporan

Per fase dua berkas di `docs/uat/`:

**`laporan_pengerjaan_fase_N.md`** (diperbarui selama pengerjaan):
- Poin yang dikerjakan, akar masalah yang ditemukan (bukan sekadar gejala)
- Berkas/fungsi yang diubah, keputusan desain, risiko
- Tes yang ditambah (nama berkas), bukti merah-sebelum
- Pertanyaan terbuka / menunggu keputusan

**`laporan_selesai_fase_N.md`** (saat fase ditutup):
- Tabel poin → status (Selesai/Sebagian/Menunggu keputusan) + commit
- Hasil gerbang: perintah yang dijalankan + hasil nyata (lulus/gagal/dilewati dan alasannya)
- Bukti uji di staging (tangkapan layar/log), angka sebelum/sesudah
- Koreksi data yang dijalankan (dry-run vs nyata), siapa menyetujui
- Sisa pekerjaan dan risiko yang masih ada

Laporan akhir: `laporan_selesai_uat_13okt2026.md` — matriks 25 poin × (akar masalah, perbaikan, tes, bukti UAT ulang, status), daftar sisa/ditunda dengan alasan, rencana deploy, dan hasil UAT instruktur.

## 10. Tabel pelacak status

| # | Poin | Fase | Status | Tes | Bukti UAT ulang |
|---|---|---|---|---|---|
| 2 | Booking melewati kapasitas | 1 | Belum | | |
| 3 | Error 500 intermiten | 1 | Belum | | |
| 4 | Pencocokan transfer otomatis | 1 | Belum (butuh keputusan) | | |
| 5 | Tombol Setujui di daftar | 1 | Belum | | |
| 6 | Sesi terpakai sebelum bayar | 1 | Belum | | |
| 7 | Notifikasi WhatsApp/pop-up | 4 | Belum (butuh keputusan) | | |
| 8 | Booking kembar | 1 | Belum | | |
| 9 | Voucher persen/rupiah & periode | 3 | Belum | | |
| 10 | Angka dashboard | 3 | Belum | | |
| 11 | Profit = omzet / honor 0 | 3 | Belum (butuh data) | | |
| 12 | Paket admin vs publik | 3 | Belum (butuh keputusan) | | |
| 13 | Data tes di sistem live | 2 | Belum | | |
| 14 | Halaman 404 | 5 | Belum | | |
| 15 | Login & daftar | 5 | Belum | | |
| 16 | Login OTP WhatsApp | 4 | Belum (bergantung #7) | | |
| 17 | Info studio salah | 5 | Belum (butuh data) | | |
| 18 | Halaman Panduan | 5 | Belum | | |
| 19 | Tombol berbahaya | 2 | Belum | | |
| 20 | Status customer bertentangan | 3 | Belum | | |
| 21 | Halaman staf (audit, tombol) | 2 | Belum | | |
| 22 | Mode "Semua cabang" | 2 | Belum | | |
| 23 | Kode programmer tampil | 6 | Belum | | |
| 24 | Teks internal developer | 6 | Belum | | |
| 25 | Konten generik | 6 | Belum (butuh konten) | | |
| 26 | Format tidak rapi | 6 | Belum | | |

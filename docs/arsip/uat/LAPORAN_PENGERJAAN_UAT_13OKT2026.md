# Laporan Pengerjaan UAT Daily Dose Pilates V2 — Cek Ulang 13 Okt 2026

Tanggal pengerjaan: 13 Okt 2026. Cabang kerja: `perbaikan_arsitektur`. **Belum ada commit** (menunggu keputusan pemilik).
Dasar: laporan UAT 13 Okt (poin 2–26), rencana `RENCANA_PERBAIKAN_UAT_V2_13OKT2026.md`.

## 1. Cara verifikasi dan batasannya

- **Tidak ada akses ke database atau log produksi.** Semua pembuktian data memakai salinan lokal `dailydose_v2_uat` (hasil migrasi V1, 9.274 pelanggan). Angka produksi bisa berbeda.
- Setiap perbaikan kode diawali tes yang gagal (merah), lalu lulus (hijau). Beberapa diverifikasi juga ke data nyata lokal.
- Aplikasi tidak dijalankan di browser; tampilan diverifikasi lewat tes komponen. Cek visual di staging tetap perlu.

## 2. Hasil gerbang kualitas

| Pemeriksaan | Hasil |
|---|---|
| Typecheck semua paket (`pnpm lint`) | Lulus |
| Build produksi (`pnpm build`) | Lulus |
| Tes unit API | 551 lulus, 1 gagal (lama, lihat di bawah) |
| Tes web (vitest) | 481 lulus, 1 gagal di lari penuh (lama/flaky, lihat di bawah) |
| Tes worker | 17 gagal, **identik dengan kondisi sebelum perubahan** |

Kegagalan yang sudah ada sebelum perubahan (dibuktikan dengan menjalankan salinan bersih kode awal): `ledger.service.spec` TEST-1.6 (1 tes) dan 17 tes di paket worker. `run-mock-e2e.test.mjs` ("reports child process failures") gagal sesekali saat suite penuh berjalan, tetapi lulus bila dijalankan sendiri, baik sebelum maupun sesudah perubahan.

## 3. Status per poin

Keterangan: **Selesai** = kode + tes. **Sebagian** = ada bagian yang butuh data/keputusan pemilik. **Belum** = tidak dikerjakan, alasannya dijelaskan.

| # | Poin | Status | Akar masalah yang ditemukan | Perubahan |
|---|---|---|---|---|
| 2 | Booking melebihi kapasitas | **Sebagian** | Booking baru di v2 sudah mengunci slot. Semua booking pada kelas yang melebihi kapasitas bernomor `BKG-V1-…`, artinya berasal dari sistem lama. Celah nyata di v2: persetujuan ubah jadwal membaca kapasitas tanpa kunci. | `ubah-jadwal.service.ts`: kunci permintaan + slot (urut id) sebelum membaca; tolak keputusan ganda. Tes `reschedule-decide-lock.spec.ts`. |
| 3 | Error 500 acak | **Belum** | Perlu log produksi 13 Okt ~11.50 WIB (= 04.50 UTC). Tanpa log, perbaikan hanya tebakan. | — |
| 4 | Pencocokan transfer otomatis | **Belum** | Fitur pencocokan mutasi rekening tidak ada di kode (bukan mati). Perlu keputusan sumber mutasi. | Teks "deteksi anomali belum aktif" disembunyikan (poin 24). |
| 5 | Tombol Setujui di daftar | **Selesai** | Dialog konfirmasi sudah ada, tetapi tombol aktif walau bukti belum dibuka. | Tombol Setujui terkunci sampai "Preview bukti" dibuka (bila ada bukti). Tes ditambah. Batasan: kunci ini di tampilan, bukan di server. |
| 6 | Sesi terpakai sebelum bayar disetujui | **Sebagian** | Booking v2 sudah menolak paket yang belum `PAID`. Sesi terpakai berasal dari booking V1 yang dimigrasi. Data lokal: 148 paket seperti ini. | Tidak ada perubahan kode. Kueri audit [C] disediakan. |
| 7 | WhatsApp masih mode uji | **Sebagian** | Panduan produksi menyuruh mengisi `WHATSAPP_ACCESS_TOKEN`, tetapi kode hanya membaca `WHATSAPP_API_TOKEN`: operator yang mengikuti panduan tetap di mode uji. | Kode menerima kedua nama; `WHATSAPP_PROVIDER=mock` memaksa mode uji; variabel dicantumkan di `.env.production.example`. Token Meta nyata tetap harus diisi pemilik. |
| 8 | Booking kembar | **Sebagian** | Booking v2 sudah menolak duplikat (`DUPLICATE_ACTIVE_BOOKING`). Duplikat berasal dari V1 (lokal: 68 kasus dalam 30 hari). | Tidak ada perubahan kode. Kueri audit [B]. |
| 9 | Voucher persen tampil rupiah | **Sebagian** | Tampilan admin sudah memisahkan persen/nominal di kode terbaru. `discountType` adalah teks bebas; nilai tidak baku dianggap nominal. | `isPercentageVoucherType` dipakai di perhitungan dan tampilan. Ini langkah defensif (penyebab di produksi belum terbukti). JULY2026 aktif sampai 31 Okt adalah data. |
| 10 | Angka dashboard | **Selesai** | Tiga angka verifikasi berbeda karena tiga definisi: dashboard (pelanggan belum disetujui), halaman Verifikasi (SQL yang menghitung "tepat satu dokumen"), dan daftar pelanggan (status di-hardcode APPROVED, filter diabaikan). Booking per cabang 0 karena hanya menghitung status `BOOKED` sedangkan kelas lampau berstatus `ATTENDED`. | Satu predikat (`verificationStatusWhere`) untuk semua; SQL ringkasan diperbaiki; booking = BOOKED + ATTENDED di seluruh dashboard. Terverifikasi ke data: 4.565 + 7 + 4.702 = 9.274. |
| 11 | Profit = omzet | **Sebagian** | `instructor_fee` dan `projection_rate` kosong. Dashboard memakai `projectionRp: 0` hardcode, padahal laporan Keuangan punya rumus. | Rumus proyeksi dipakai bersama; peringatan jelas bila tarif honor belum diisi. **Tarif honor harus diisi pemilik.** |
| 12 | Paket admin ≠ publik | **Selesai** (kode) | Daftar admin hanya 20 paket terbaru: `cursor` dan `branchId` diabaikan, ringkasan dihitung dari halaman itu. | Paginasi nyata, filter cabang (termasuk paket semua cabang), ringkasan dari seluruh katalog. Pembersihan paket kembar/promo lama adalah keputusan pemilik. |
| 13 | Data tes di sistem live | **Belum (data)** | Murni data. | Kueri audit [H] mendaftar kandidat. Tidak ada yang dihapus. |
| 14 | Halaman 404 kosong | **Selesai** | Tamu di URL yang tidak dikenal selalu melihat kerangka abu-abu "Mengarahkan ke halaman masuk" tanpa redirect. `/notification-management` juga tidak pernah diarahkan ke login. | Render 404 untuk URL tak dikenal; `/notification-management` ditambahkan ke rute terproteksi. |
| 15 | Login dan daftar | **Selesai** | Teks menyebut hanya email, dua link daftar, bagian form loncat 1→3, "langsung aktif" menyesatkan (booking butuh verifikasi). | Teks, satu link daftar, penomoran 1–3, keterangan yang benar. |
| 16 | Login OTP WhatsApp | **Belum** | `verifyOtp` hanya kerangka yang selalu menolak. Pesan OTP butuh templat kategori Authentication di Meta dan penyedia WhatsApp yang sudah hidup (poin 7). Tidak dibangun setengah jalan. | — |
| 17 | Info studio salah | **Selesai** | Kota `'Jakarta'` di-hardcode di beberapa tempat pada API (muncul "Graha Family Surabaya, Jakarta"); kapasitas "6–8" hardcode; alamat tidak ditampilkan. | `branchPublicLocation` satu sumber; alamat tampil di kartu studio; teks kapasitas tanpa angka salah. |
| 18 | Halaman Panduan | **Selesai** | Isi panduan customer salah fakta (batas bukti 5 MB padahal 10 MB; check-in; jenis kelas) dan penuh istilah teknis. Tab staf sudah tersembunyi untuk tamu. | Panduan customer ditulis ulang; tes melarang kata teknis. |
| 19 | Tombol berbahaya | **Selesai** | Izin `automation:run` dimiliki Admin dan Manager; API mengizinkan Owner/Manager/Admin. Dialog konfirmasi sudah ada. | Server dan daftar izin dibatasi ke Super Owner. |
| 20 | Status customer bertentangan | **Selesai** | Daftar menulis "Disetujui" untuk semua (hardcode); tab "Paket Aktif (1)" menghitung semua paket. | Status satu sumber (lihat poin 10); tab menghitung paket benar-benar aktif; badge diberi label "Akun…"/"Verifikasi:…". |
| 21 | Halaman staf | **Selesai** | Riwayat audit tidak pernah disimpan (endpoint mengembalikan daftar kosong). Tombol "Kirim setup password" sebenarnya mengganti kata sandi langsung. | Tabel `audit_log` baru + pencatatan buat/profil/peran/reset kata sandi/status; halaman Audit dan detail pengguna membaca darinya; tombol diberi nama "Reset kata sandi". |
| 22 | Mode "Semua cabang" | **Sebagian** | "Buat booking manual" memang mati di mode ini. Formulir "Buat kelas" sudah punya pemilih cabang (tidak dapat direproduksi di kode). | Tombol booking aktif dan meminta memilih cabang. |
| 23 | Kode programmer tampil | **Selesai** (sejauh ditemukan di kode) | — | Semua istilah dalam daftar laporan diganti; `ALL_LEVELS`, zona waktu, tanggal grafik, kode cabang di dashboard. Tes pengaman `jargon-guard.test.ts`. `DD-MK` di tabel master staf (kolom kode) sengaja dipertahankan. |
| 24 | Teks internal developer | **Selesai** | — | Catatan developer dihapus; panel "anomali" dan "arus kas lama" hanya tampil bila ada isinya; kalimat Penyesuaian Sesi diperbaiki. |
| 25 | Konten generik | **Sebagian** | Testimoni "Member Komunitas/Rutin" adalah kutipan rekaan; "membawa perlengkapan pribadi: Reformer" salah (alat disediakan studio); semua paket memakai deskripsi yang sama. | Testimoni rekaan dihapus; teks peralatan diperbaiki; deskripsi paket memakai isi database bila ada. **Testimoni asli dan deskripsi per paket harus disediakan pemilik.** |
| 26 | Format tidak rapi | **Selesai** | Label "X dari Y paket" dirangkai ulang menjadi "dari 20 dari 20". "Our Studios" di judul tab. | Perbaikan `Pagination`; judul "Studio Kami". |

## 4. Dampak deploy yang perlu diketahui

1. **Tabel baru `audit_log`** (poin 21). Bersifat tambahan. `docker-entrypoint.sh` memakai `prisma db push`, jadi tabel dibuat otomatis saat deploy. Catatan: `AuditService` lama sengaja hanya mencatat ke log; tabel baru ini terbatas pada perubahan akun staf. Jika pemilik tidak ingin audit tersimpan di database, poin 21 perlu dibahas ulang.
2. Perubahan respons API: `pendingCustomers`/`approvedCustomers` (ringkasan verifikasi), `financial.instructorFeeMissing` (dashboard), item audit. Semuanya berupa penambahan. Kontrak OpenAPI/klien mobile belum diperiksa ulang.
3. Izin `automation:run` dicabut dari Admin dan Manager; mereka tetap bisa melihat log pengingat.

## 5. Yang perlu dikerjakan pemilik/operasi (tidak bisa dari kode)

1. Jalankan `docs/uat/sql/audit-data-uat-13okt2026.sql` di produksi (hanya SELECT) dan putuskan koreksi data: kelas melebihi kapasitas, booking kembar, 148 paket terpakai sebelum lunas (angka lokal), paket kembar/terpotong, akun tes.
2. Isi tarif honor instruktur (`instructor_fee`) dan tarif proyeksi.
3. Isi `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` produksi; siapkan templat pesan di Meta (pesan di luar jendela 24 jam butuh templat; saat ini sistem mengirim teks biasa).
4. Tarik log API sekitar 11.50 WIB 13 Okt (= 04.50 UTC) untuk poin 3.
5. Putuskan sumber mutasi rekening (poin 4) dan apakah login OTP dibangun (poin 16).
6. Sediakan testimoni asli dan deskripsi tiap paket (poin 25).
7. Verifikasi visual di staging, terutama halaman publik, 404, Panduan, Studio, dan Keuangan.

## 6. Daftar berkas

Kode API: `bookings/ubah-jadwal.service.ts`, `dashboard/dashboard.service.ts`, `identity/{manajemen-pelanggan,identity-review-query,user-administration}.service.ts`, `identity/role-capabilities.ts`, `master/{branch-location.ts,master-catalog.service.ts}`, `notifications/{operations-automation.controller,whatsapp-gateway.service}.ts`, `packages/{finance,katalog-paket,pembelian-paket,voucher}.service.ts`, `packages/projection-cost.ts`, `public-content/*`, `prisma/schema.prisma`.
Kode web: `session-context.tsx`, `application-shell.tsx`, `sign-in`, `register`, `guide`, `locations`, `classes`, `public-landing.tsx`, `purchases`, `customers/[id]`, `users`, `audit`, `bookings`, `finance`, `dashboard.tsx`, `identity-verifications`, `components/admin/admin-ui.tsx`, serta label baru `lib/{class-level,audit-labels}.ts`.
Tes baru: 14 berkas (API 9, web 5) dan penyesuaian tes lama yang mengunci perilaku keliru (mis. tanggal grafik `2026-08-01`, tombol setujui langsung).
Dokumen: `RENCANA_PERBAIKAN_UAT_V2_13OKT2026.md` (dikoreksi), `sql/audit-data-uat-13okt2026.sql`.

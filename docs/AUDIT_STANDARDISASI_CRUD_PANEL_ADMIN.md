# Audit Standardisasi CRUD Panel Admin / Super Admin / Manager

Tanggal audit: 2026-10-23 · Status: **usulan; Tahap 1 (audit permanen) sudah dikerjakan 2026-10-24 — lihat §9. Tahap lain menunggu keputusan Ridho.**
Cakupan: `apps/api/src` (rute mutasi, audit, penjaga hapus) dan `apps/web/app` (kosakata aksi, dialog alasan, feedback, filter URL).

Metode: pembacaan kode dan `grep` terhadap working tree pada tanggal di atas, **termasuk perubahan yang belum dikomit** (mis. panel cabang `branch-venues-panel.tsx` / `branch-payment-accounts-panel.tsx` sedang dihapus/dilebur oleh pekerjaan lain). Angka seperti "N pemanggilan" adalah hitungan `grep`, bukan hasil eksekusi. Bagian yang tidak saya verifikasi di runtime ditandai *(belum diuji)*.

---

## 1. Temuan utama (urut dampak)

1. **Jejak audit permanen hampir tidak ada.** Tabel `audit_log` memang ada, tetapi hanya ditulis oleh:
   - `UserAdministrationService.recordAudit` (buat/ubah profil/reset password/ubah role/nonaktifkan/aktifkan pengguna),
   - `CustomerProfileService` (ubah profil sendiri),
   - `PemesananKelasService.cancel` (`booking.cancelled_by_customer|staff`),
   - `OperationsAutomationController` (`operations.auto_cancel_evaluated`, `reminders.evaluated`).

   Semua yang lain **tidak permanen**:
   - `AuditService.catat()` dan `.record()` (dipakai paket, voucher, rekening, promosi, keuangan, ledger, bukti bayar) hanya `Logger.log(...)` — lenyap saat log berputar.
   - `MasterAccessService.audit()` adalah **fungsi kosong** (`return Promise.resolve()`), padahal dipanggil ±15× di `master-catalog.service.ts` (cabang, studio, ruangan, tipe kelas). Kode terlihat "diaudit" padahal tidak ada yang tercatat.
   - Nol referensi audit sama sekali di: manajemen role/hak akses (`access-management`), penugasan (`assignment`), cabang-owner (`owner-branch`), konten publik, template notifikasi, kasus bantuan, tarif honor/proyeksi, pelanggan (`manajemen-pelanggan`).
2. **Kosakata lifecycle tidak seragam** di API dan UI (lihat §3–§4). Contoh paling jelas: voucher punya tombol "Arsipkan" tetapi di DB `Jeda` dan `Arsipkan` sama persis (`active=false`) — **tidak ada status ARCHIVED untuk voucher**.
3. **Tidak ada kunci versi (optimistic lock) di banyak mutasi** yang justru sering dipakai bersamaan: paket (transisi, ubah), rekening, konten publik, template notifikasi, owner-cabang, keuangan. (Kelas, cabang/master, pengguna, promosi, kasus bantuan sudah punya.)
4. **Dialog alasan tidak konsisten.** Komponen `ReasonDialog` hanya dipakai di 2 tempat (`bookings/booking-view.tsx`, `ledger/[customerPackageId]/customer-session-detail-view.tsx`). Tempat lain memakai kolom alasan buatan sendiri di drawer (rekening, tipe kelas, pelanggan), `feedback.confirm` tanpa alasan (cabang, studio, paket), atau tanpa konfirmasi sama sekali (pengguna, hapus tab pelanggan).
5. **API mengisi alasan bawaan diam-diam** untuk beberapa aksi (mis. `reason ?? 'Menonaktifkan cabang'`, `'Menonaktifkan tipe kelas'`, `'Setup kata sandi'`), sehingga "alasan" di log/audit bisa berisi teks yang bukan dari operator.
6. **`CustomerManagement.setStatus` tidak memeriksa cakupan cabang** (tidak ada pembandingan `preferredBranchId` dengan cabang pemanggil, berbeda dari `markStopped`) dan mengabaikan `reason`. Temuan baru; belum diperbaiki (di luar Tahap 1).
7. **CRUD role dinamis tidak ada** (501); label "Nonaktifkan role" di UI tidak punya jalur backend nyata.
8. **Hapus permanen** hanya aman bila dijaga data turunan. Penjaga ada untuk cabang, studio, ruangan, tipe kelas, paket, tarif (hanya yang belum berlaku), biaya lain (periode terkunci). **Tanpa penjaga/konfirmasi alasan:** `owner-branches DELETE` (hapus baris langsung, hanya Super Owner) dan `identity-verifications/:id/delete`.
9. Satu pemanggilan **`confirm()` bawaan browser** tersisa: `public-content-management-view.tsx` ("Hapus slide ini dari slider?"). Sisanya memakai `feedback.confirm`.

---

## 2. Tabel entitas × verba backend

Legenda audit: **P** = tercatat permanen di `audit_log` · **L** = hanya log aplikasi (`AuditService`) · **∅** = tidak ada / fungsi kosong. Kunci versi: ✔ ada, ✘ tidak.

| Entitas | Rute mutasi (ringkas) | Verba lifecycle | Hapus keras | Audit | Versi | Alasan di API |
|---|---|---|---|---|---|---|
| Cabang | `POST /branches`, `PATCH /branches/:id`, `POST …/deactivate`, `…/reactivate`, `DELETE` | deactivate / reactivate | ya, dijaga `CANNOT_DELETE_BRANCH_WITH_DEPENDENCIES` | ∅ (master) | ✔ | opsional, **bawaan diisi server** |
| Studio | `POST branches/:id/studios`, `PATCH studios/:id`, `DELETE` | aktif/nonaktif lewat `PATCH active`; nonaktif ditolak `HAS_UPCOMING_SLOTS` | ya, dijaga | ∅ | – | tidak ada |
| Ruangan | `POST studios/:id/rooms`, `PATCH rooms/:id`, `DELETE` | sama seperti studio | ya, dijaga | ∅ | – | tidak ada |
| Tipe kelas | `POST/PATCH class-types`, `PUT …/scopes`, `…/deactivate`, `…/reactivate`, `DELETE` | deactivate / reactivate | ya, dijaga | ∅ | ✔ | wajib di ubah/scope/hapus; opsional+bawaan di deactivate |
| Profil publik (cabang/tipe) | `PATCH master/public-profiles/:kind/:id` | – | – | ∅ | – | – |
| Tarif honor / proyeksi | `POST`, `DELETE` (`instructor-fees`, `projection-rates`) | – (koreksi = tarif baru) | hanya yang belum berlaku (`RATE_IN_EFFECT`) | ∅ | – | tidak ada |
| Kuota/kapasitas & kuota minimum | `POST quota-capacity-settings`, `min-quota-settings` | – | – | ∅ | – | – |
| Paket | `POST/PATCH packages`, `POST …/revisions`, `PUT …/scopes`, **`POST packages/:id/:action`** (`activate\|pause\|archive`), `DELETE` | activate / pause(=INACTIVE) / archive(=ARCHIVED) — **tiga status nyata** | ya, dijaga `CANNOT_DELETE_PACKAGE_WITH_DEPENDENCIES` | L | ✘ | tidak ada |
| Promosi paket | `POST packages/:id/promotions`, `PATCH package-promotions/:id`, **`POST …/:action`** | status ACTIVE/PAUSED/ARCHIVED | tidak | L | ✔ | – |
| Voucher | `POST/PATCH vouchers`, **`POST vouchers/:id/:action`** (`activate\|pause\|archive`) | **hanya boolean `active`**; pause ≡ archive | tidak | L | ✘ (param ada, tidak diperiksa) | opsional |
| Rekening pembayaran | `POST/PATCH payment-accounts`, `…/deactivate`, `…/reactivate` | deactivate / reactivate | tidak | L | ✘ | – |
| Biaya lain | `POST/PATCH/DELETE other-costs` | – | ya, dikunci periode (`PERIOD_ALREADY_LOCKED`) | L (hanya sebagian) | ✘ | – |
| Tutup buku / koreksi | `POST monthly-closes`, `correction-journals` + `/:id/:decision` | approve / reject | – | L | ✘ (versi di baris) | wajib |
| Penyesuaian sesi | `POST session-adjustments`, `/:id/:decision`, `/direct` | approve / reject | – | L | – | wajib |
| Paket pelanggan | `POST customer-packages/:id/:action` (`extend\|freeze\|unfreeze`) | freeze / unfreeze | – | ledger 0-sesi (jejak di data) | ✔ (`expectedValidUntil`) | wajib |
| Pengguna | `POST/PATCH users`, `…/deactivate`, `…/reactivate`, `…/roles`, `…/direct-password-reset`, `…/password-setup-requests` | deactivate / reactivate | tidak | **P** | ✔ | opsional |
| Pelanggan | `POST/PATCH customers`, `…/deactivate`, `…/reactivate`, `…/mark-stopped`, `…/unmark-stopped` | deactivate / reactivate + "berhenti" | tidak | ∅ → P status & berhenti (Tahap 1); buat/ubah profil belum | ✔ di profil; `setStatus` tidak memakai `expectedVersion` | opsional; **sebelumnya `reason` diabaikan** |
| Role & hak akses | **Hanya `PUT users/:id/access/roles` yang nyata** (ganti peran pengguna). `POST/PATCH access/roles`, `PUT …/capabilities`, `…/deactivate`, `permission-overrides` (+`/revoke`) mengembalikan **501** — RBAC dinamis belum ada; izin peran tetap di `role-capabilities.ts` | – | – | ∅ → P (Tahap 1) | – | `reasonCode` wajib |
| Penugasan | `POST assignments`, **`POST assignments/:id/end`** | **end** (istilah ketiga) | tidak | ∅ | ✔ | wajib |
| Owner ↔ cabang | `POST owner-branches`, `DELETE :id` | – | **ya, tanpa penjaga** | ∅ | ✘ | tidak ada |
| Verifikasi identitas | `POST …/decisions/:decision`, **`POST …/:id/delete`** | approve / reject | "hapus" via POST bukan DELETE | sebagian (`identity-document-workflow`) | ✔ | wajib di delete |
| Kelas (slot) | `POST/PATCH class-slots`, `…/assign-instructor`, `…/publish`, `…/cancel`, `…/complete` | DRAFT→PUBLISHED→CONFIRMED→COMPLETED / CANCELLED | tidak | ∅ (hanya catatan ledger) | ✔ (wajib) | `reasonCode` wajib di cancel |
| Booking | `POST bookings`, `…/:id/cancel` | cancel | tidak | **P** (cancel) | – | wajib (staf) |
| Reschedule | `POST reschedules`, `/:id/:decision` | approve / reject | tidak | ∅ | – | – |
| Konten publik | `POST/PATCH public-content-management`, `…/duplicate`, **`POST :id/:status`** | DRAFT→PUBLISHED→ARCHIVED | tidak (ada arsip) | ∅ | ✘ (klaim bersyarat status) | tidak ada |
| Template notifikasi | `POST/PATCH notification-management/templates`, `…/duplicate`, **`POST :id/:status`** | DRAFT→PUBLISHED→ARCHIVED | tidak | ∅ | ✘ | tidak ada |
| Kasus bantuan | `POST/PATCH support-cases`, `…/internal-notes` | status OPEN→…→CLOSED | tidak | ∅ | ✔ | – |
| Pengiriman email | `POST operations/email-deliveries/:id/retry` | retry | tidak | log saja (`[EMAIL RETRY] by=…`) | – | wajib |

Catatan bentuk rute lifecycle (6 pola berbeda):
`POST /:id/deactivate|reactivate` (cabang, tipe kelas, pengguna, pelanggan, rekening, role) · `POST /:id/:action` generik (paket, voucher, promosi, paket-pelanggan) · `POST /:id/:status` (konten publik, template) · `PATCH … active` (studio/ruangan) · `POST /:id/end` (penugasan) · `POST /:id/delete` (verifikasi identitas).

---

## 3. Tabel entitas × antarmuka web

Hitungan di kolom "konfirmasi/alasan/feedback" berasal dari `grep` per berkas; "kolom alasan" = ada input alasan yang dikirim ke API.

| Panel (berkas utama) | Kosakata aksi yang tampil | Konfirmasi | Alasan | Feedback | Filter di URL |
|---|---|---|---|---|---|
| Cabang (`branches/branches-view`, `branch-detail-view`) | Nonaktifkan · Aktifkan kembali · **Hapus cabang permanen**; teks "Nonaktifkan untuk mengarsipkan cabang" | `feedback.confirm` | tidak diminta (API mengisi bawaan) | toast | ya (sebagian) |
| Master (tipe kelas, tarif) (`master/master-view`) | Nonaktifkan · Aktifkan kembali · Hapus tipe kelas · Hapus tarif | `feedback.confirm` (5) | kolom alasan di drawer | pesan inline | tidak |
| Studio & ruangan (`master/studio-venue-list`) | Nonaktifkan · Aktifkan · Hapus | `feedback.confirm` | tidak | toast | tidak |
| Rekening (`master/payment-accounts-view`) | Nonaktifkan · Aktifkan kembali | `feedback.confirm` + **kolom alasan sendiri** | ya (25 rujukan) | pesan inline | tidak |
| Paket (`package-promotions/packages-management-view`, `…/package-promotion-detail-view`) | Nonaktifkan · Aktifkan kembali · **Arsipkan** · **Hapus paket** | `feedback.confirm` (6+6) | sebagian | toast | ya (8) |
| Voucher (`vouchers/vouchers-view`, `voucher-detail-view`) | Aktifkan · **Jeda** · **Arsipkan** (tak ada "Nonaktifkan") | `feedback.confirm` | sebagian | toast | ya |
| Pelanggan (`customers/customers-view`, `[id]/customer-detail-view`) | Nonaktifkan Pelanggan · Aktifkan Pelanggan | **tanpa konfirmasi** (form di drawer) | kolom alasan opsional, **bawaan "Perubahan status pelanggan"** | pesan inline | tidak |
| Instruktur (`instructors/[id]/instructor-detail-view`) | Nonaktifkan · Aktifkan kembali instruktur | `feedback.confirm` | tidak | toast + inline | tidak |
| Pengguna (`users/users-view`, `user-admin-controls`) | Nonaktifkan (tab) | 1 konfirmasi hanya untuk batal-ubah | **tidak ada** | pesan inline | tidak |
| Role & hak akses (`users/roles-permissions`) | ganti peran pengguna (nonaktifkan role = 501 di API) | `feedback.confirm` (7) | `reasonCode` | toast + inline | tidak |
| Penugasan (`assignments/assignments-view`) | **Akhiri penugasan** | `feedback.confirm` | ya | toast + inline | tidak |
| Kelas (`classes/class-slot-view`, `class-slot-panels`) | Batalkan kelas · Publikasikan · Selesaikan | `feedback.confirm` | pilihan alasan wajib (tanpa bawaan) | pesan inline | tidak |
| Booking (`bookings/booking-view`) | Batalkan booking · Tolak reschedule | **`ReasonDialog`** | ya | toast | ya |
| Penyesuaian sesi (`ledger/…`) | Tolak · Setujui | **`ReasonDialog`** | ya | toast | sebagian |
| Keuangan (`finance/finance-view`) | **Hapus Biaya Operasional** · Ubah | `feedback.confirm` | tidak | toast + inline | ya (2) |
| Verifikasi identitas (`identity-verifications/review-view`) | **Hapus permanen** (file) | dialog khusus | ya (wajib) | toast | tidak |
| Konten publik (`public-content-management/*`) | Terbitkan · Arsipkan · hapus slide | **`confirm()` native** untuk hapus slide; FAQ memakai `feedback.confirm` | tidak | pesan inline | tidak |
| Template notifikasi (`notification-management/*`) | Terbitkan · Arsipkan · Kembali ke teks bawaan | **tanpa konfirmasi** | tidak | pesan inline | tidak |
| Kasus bantuan (`support-cases/*`) | ubah status · catatan | tanpa konfirmasi | – | pesan inline | tidak |
| Owner ↔ cabang (di halaman cabang/pengguna) | hapus penugasan | *(belum diverifikasi)* | – | – | – |

Ringkasan mekanisme: `feedback.confirm` dipakai di 37 berkas non-tes; `ReasonDialog` di 2; kolom alasan buatan sendiri di ≥4; `confirm()` native di 1. Ada **tiga gaya umpan balik** (toast, pesan inline `Feedback kind=status|error`, dan campuran keduanya dalam satu halaman).

---

## 4. Kosakata aksi saat ini vs usulan

Keputusan Ridho (handoff 2026-10-23): cabang, paket, dan tipe kelas **diarsipkan**, hapus permanen hanya untuk draf tanpa riwayat.

| Konsep | Dipakai sekarang | Usulan standar |
|---|---|---|
| Berhenti sementara, bisa dipulihkan | Nonaktifkan · Jeda · Akhiri · "Nonaktifkan untuk mengarsipkan" | **Nonaktifkan** (+ **Aktifkan kembali**) |
| Sembunyikan permanen dari daftar kerja, riwayat tetap | Arsipkan (paket, promosi, konten, template, voucher*) | **Arsipkan** — hanya untuk cabang, paket, tipe kelas, voucher, promosi, konten, template |
| Hapus data | Hapus cabang/paket/tipe kelas permanen · Hapus (studio, ruangan, tarif, biaya) | **Hapus** — hanya entitas tanpa riwayat (draf, tarif belum berlaku, studio/ruangan kosong) |
| Mengakhiri hubungan berjangka | Akhiri penugasan | tetap **Akhiri** (bukan lifecycle entitas) |
| Menolak permintaan | Tolak | tetap **Tolak** |

\* Voucher belum punya status ARCHIVED di DB — lihat keputusan K3.

Aturan turunan yang diusulkan:
- Tombol "Hapus" tidak ditampilkan bila API menyatakan entitas punya riwayat; yang tampil adalah "Arsipkan" (atau "Nonaktifkan" bila entitas tidak diarsipkan).
- Label tombol, judul dialog, pesan sukses, dan istilah di riwayat audit memakai verba yang sama (`lib/glossary.ts` diperluas, dijaga tes).

---

## 5. Standar yang diusulkan

1. **Satu pola daftar + drawer/detail** untuk semua entitas master/operasional: pencarian dan filter status tersinkron ke URL (`useSearchParams`), paginasi kursor, aksi baris di menu satu tempat.
2. **Lifecycle backend satu konvensi:** `POST /{resource}/:id/deactivate|reactivate|archive`; `DELETE /{resource}/:id` hanya untuk entitas tanpa riwayat dan selalu dengan penjaga yang mengembalikan `CANNOT_DELETE_*`. Rute generik `/:action` dan `/:status` diganti rute eksplisit (alias lama dipertahankan sementara agar klien lama tidak patah).
3. **Dialog alasan satu mekanisme:** `ReasonDialog` untuk aksi **operasional/finansial/akses** (nonaktifkan, arsipkan, hapus, tolak, batalkan, ubah role, akhiri penugasan, hapus biaya). Konfirmasi biasa (`feedback.confirm`) hanya untuk aksi yang bisa dibatalkan sendiri (terbitkan draf, tutup form berisi isian). Alasan **diminta di UI dan wajib di API**; tidak ada alasan bawaan yang diisi server.
4. **Satu mekanisme feedback:** toast untuk hasil aksi, pesan inline hanya untuk galat validasi form; tidak dicampur dalam satu alur.
5. **Audit permanen wajib untuk setiap mutasi:** jadikan `AuditService.catat/record` dan `MasterAccessService.audit` menulis ke `audit_log` (tabel sudah ada; tambah kolom `objectType`/`objectId`/`before`/`after` bila perlu — perubahan skema additive). Satu perubahan di dua kelas ini langsung menutup sebagian besar kekurangan di §2 karena pemanggilnya sudah ada. Tambah pemanggilan di modul yang nol audit.
6. **Kunci versi** pada setiap mutasi entitas yang bisa diedit bersamaan (paket, rekening, voucher, konten, template, owner-cabang); 409 `STALE_VERSION` dengan pesan Indonesia yang seragam.
7. **Tes penjaga** bergaya `terminology-guard.test.ts`: (a) tidak ada `confirm()`/`alert()` native; (b) tombol bertulisan "Hapus"/"Arsipkan"/"Nonaktifkan" hanya lewat komponen standar `LifecycleAction`; (c) tiap rute mutasi punya bukti audit (pola `route-access.spec`); (d) tidak ada `reason ?? '<teks bawaan>'` di controller.

---

## 6. Rencana implementasi bertahap (setelah disetujui)

| Tahap | Isi | Risiko | Skema |
|---|---|---|---|
| 0 | Keputusan K1–K6 (di bawah) + perluas `glossary.ts` | rendah | – |
| 1 | Audit permanen: `AuditService`/`MasterAccessService.audit` → `audit_log`; halaman Audit menampilkan entri baru; tes | sedang (volume tulis, jangan memblokir alur) | additive (kolom objek) |
| 2 | Komponen bersama `LifecycleAction` + `ReasonDialog` terstandar + util feedback; tes penjaga a–b | rendah | – |
| 3 | Migrasi per modul (satu komit per modul): **master** (cabang, studio, ruangan, tipe kelas, tarif) → **paket & promosi & voucher** → **rekening & keuangan** → **pengguna, pelanggan, role, penugasan, owner-cabang** → **konten & template & kasus bantuan** | sedang | voucher ARCHIVED = additive |
| 4 | Rute lifecycle eksplisit + alias lama; hapus alasan bawaan server; kunci versi di entitas yang belum | sedang (kontrak web↔API; `web-api-contract.spec` menjaga) | – |
| 5 | Tes penjaga c–d; verifikasi browser sapuan semua panel; laporan | rendah | – |

Urutan sengaja menaruh audit (tahap 1) lebih dulu: ia tidak mengubah tampilan dan paling mengurangi risiko operasional.

---

## 7. Keputusan yang dibutuhkan dari Ridho

| # | Pertanyaan | Rekomendasi |
|---|---|---|
| K1 | Apakah audit tersimpan di tabel `audit_log` yang ada (perluas kolom) atau tabel baru khusus objek? | perluas `audit_log` (satu tempat untuk halaman Audit) |
| K2 | Cabang dan tipe kelas belum punya status ARCHIVED (hanya `active`). Cukup UI "Arsipkan" = nonaktif permanen tanpa tombol aktifkan kembali, atau tambah status nyata? | tambah kolom status additive agar "Nonaktifkan" dan "Arsipkan" bisa dibedakan di data |
| K3 | Voucher: pisahkan Jeda dan Arsipkan di DB (tambah status), atau hapus tombol "Arsipkan"? | tambah status (konsisten dengan paket & promosi) |
| K4 | Aksi mana yang wajib alasan? Usulan: semua nonaktifkan/arsipkan/hapus/tolak/batalkan/ubah role/akhiri penugasan; **tidak** wajib untuk terbitkan draf dan aktifkan kembali. | setuju seperti usulan |
| K5 | Rute lama (`/:action`, `/:status`, `POST …/delete`) dipertahankan sebagai alias berapa lama? | 1 rilis, lalu dihapus |
| K6 | `owner-branches DELETE` dan `identity-verifications/:id/delete`: dipertahankan hapus keras (dengan alasan + audit) atau diganti "akhiri/arsipkan"? | owner-cabang → "akhiri" (ada tanggal), verifikasi → tetap hapus keras dengan alasan (kebutuhan privasi) |

---

## 8. Di luar cakupan dokumen ini

Redesain tampilan landing publik, perbaikan e2e (snapshot shell, tes `package catalog reaches products quickly`), pengiriman email/WA produksi, dan portal instruktur — tercatat di dokumen/handoff masing-masing.

---

## 9. Status Tahap 1 — audit permanen (dikerjakan 2026-10-24)

Diputuskan mengikuti rekomendasi K1: **memperluas `audit_log`** (tidak membuat tabel baru).

**Skema (additive, sudah diterapkan ke DB dev):** `audit_log` + kolom `objectType VARCHAR(40)`, `objectId VARCHAR(64)`, indeks `(objectType, objectId, createdAt)`. Nilai sebelum/sesudah disimpan di kolom `detail` sebagai `{ before, after }`.

**Perubahan kode**
- `AuditService.catat()` dan `.record()` kini **menulis ke `audit_log`** (dulu hanya `Logger.log`). Bila `tx` diberikan, baris ikut transaksi pemanggil; kegagalan mencatat tidak pernah menggagalkan perubahan (hanya masuk log galat). Nilai dibersihkan lebih dulu (`scrubAuditValue`): kunci seperti `password`, `token`, `secret`, `accountNumber` dibuang, teks dipotong 500 karakter, larik 50 butir.
- `MasterAccessService.audit()` — yang tadinya fungsi kosong — kini memanggil `AuditService` di transaksi pemanggil. Otomatis menghidupkan ±15 pemanggilan di cabang, studio, ruangan, tipe kelas, dan tarif.
- Pemanggilan baru di modul yang tadinya nol audit: konten publik (draf dibuat/diubah/disalin/diterbitkan/diarsipkan), template notifikasi (idem), penugasan (dibuat/diakhiri, **dengan alasan** yang sebelumnya dibuang), owner–cabang (ditugaskan/dilepas, termasuk kenaikan peran otomatis ke OWNER), ganti peran pengguna, pelanggan (nonaktifkan/aktifkan/berhenti/cabut berhenti), kelas (tetapkan instruktur/ubah/publikasi/batal/selesai), tarif honor/proyeksi dan kuota minimum (buat; hapus kini menyertakan nilai sebelumnya).
- `GET /audit-logs`: filter baru `objectType` dan `objectId`; mengembalikan `objectType`/`objectId` sebenarnya; **peran bercakupan cabang (Manager, Owner) kini hanya melihat jejak cabangnya** (sebelumnya semua baris terlihat oleh pemegang `audit:read`). Catatan: baris lama tanpa cabang hanya terlihat oleh peran lintas cabang.
- Web: label Indonesia untuk seluruh kode aksi baru dan lama (termasuk kode huruf besar dari modul paket/voucher/rekening), kolom "Target" menampilkan jenis objek bila tidak ada pengguna target.

**Belum tercakup Tahap 1 (tetap terbuka):** buat/ubah profil pelanggan, reschedule, support case, e-mail retry (hanya log), paket pelanggan (hanya entri ledger 0-sesi), `identity-verifications` delete, serta pengguna-lama yang sudah tercatat sebelum tahap ini. Entri `AuditService.record()` dipanggil tanpa `await` oleh beberapa modul paket; bila transaksi pemanggil dibatalkan sesudahnya, baris audit tetap ada (tercatat sebagai percobaan, bukan bukti perubahan berhasil).

**Verifikasi:** `tsc` bersih; jest API seluruh suite hijau (unit + integrasi; kegagalan sesaat di beban mesin tinggi hilang saat diulang); spec baru `foundation/audit-trail.spec.ts` (8 tes) dan 2 tes cakupan di `identity/user-audit.spec.ts`; uji hidup di database sandbox sementara: ubah cabang (sebelumnya tidak tercatat), draf+terbit konten publik, draf template email — semuanya muncul di `/audit-logs` dengan aktor, objek, sebelum/sesudah; filter `objectType=PublicContent` bekerja.

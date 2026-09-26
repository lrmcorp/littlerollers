# DOKUMEN AUDIT SISTEM, EVALUASI PENGUJIAN & RENCANA TUNTAS PENYEDERHANAAN ARSITEKTUR
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `DOC-AUDIT-ROADMAP-DDV2-2026-09`  
**Status Dokumen:** `OFFICIAL / ACUAN RESMI PENGERJAAN BERTAHAP`  
**Tanggal Rilis:** 26 September 2026  
**Klasifikasi:** Internal Operational, Architecture & Quality Assurance  

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & Jawaban Audit](#1-ringkasan-eksekutif--jawaban-audit)
2. [Hasil Audit Teknis: Kelayakan Paket pada Alur Booking Kelas](#2-hasil-audit-teknis-kelayakan-paket-pada-alur-booking-kelas)
   - 2.1 [Integritas Aturan Bisnis di Backend Creation](#21-integritas-aturan-bisnis-di-backend-creation)
   - 2.2 [Temuan Cacat Kritis pada Endpoint Options & Frontend](#22-temuan-cacat-kritis-pada-endpoint-options--frontend)
   - 2.3 [Kasus Khusus Slot Surabaya (f1000000-ddsby0-4000-8000-0000060001)](#23-kasus-khusus-slot-surabaya-f1000000-ddsby0-4000-8000-0000060001)
3. [Evaluasi Riwayat Pengujian (UAT, Negative, Edge & Stress Testing)](#3-evaluasi-riwayat-pengujian-uat-negative-edge--stress-testing)
   - 3.1 [Bukti Nyata Pengujian yang Telah Dilakukan](#31-bukti-nyata-pengujian-yang-telah-dilakukan)
   - 3.2 [Manfaat Nyata Pengujian Sebelumnya](#32-manfaat-nyata-pengujian-sebelumnya)
   - 3.3 [Mengapa Masih Timbul Masalah? (Analisis Akar Masalah)](#33-mengapa-masih-timbul-masalah-analisis-akar-masalah)
4. [Rencana Aksi Penyelesaian Tuntas (5 Langkah Eksekusi Sistematis)](#4-rencana-aksi-penyelesaian-tuntas-5-langkah-eksekusi-sistematis)
   - [Langkah 1: Perbaikan dan Penyelarasan Alur Booking](#langkah-1-perbaikan-dan-penyelarasan-alur-booking)
   - [Langkah 2: Tuntaskan Pelepasan SDK OpenAPI pada Sisa Modul Transaksi](#langkah-2-tuntaskan-pelepasan-sdk-openapi-pada-sisa-modul-transaksi)
   - [Langkah 3: Audit Endpoint-to-View pada 4 Alur Transaksi Utama](#langkah-3-audit-endpoint-to-view-pada-4-alur-transaksi-utama)
   - [Langkah 4: Implementasi Full E2E Browser Journey Test (Playwright)](#langkah-4-implementasi-full-e2e-browser-journey-test-playwright)
   - [Langkah 5: Pembersihan File Usang & Duplikasi (Dead Code Cleanup)](#langkah-5-pembersihan-file-usang--duplikasi-dead-code-cleanup)
5. [Matriks Checklist Verifikasi & Kriteria Sukses (Definition of Done)](#5-matriks-checklist-verifikasi--kriteria-sukses-definition-of-done)

---

## 1. RINGKASAN EKSEKUTIF & JAWABAN AUDIT

### Pertanyaan Pokok Pengguna:
> *"Apakah sekarang ini jadwal untuk sesi kelas ketika di-booking sudah menyesuaikan dengan paket yang di-order oleh customer dan tidak sembarang masuk kelas? Serta apakah testing (UAT, negative, edge, stress) pernah dilakukan, dan mengapa masih banyak masalah?"*

### Kesimpulan Singkat:
1. **Aturan Bisnis di Backend:** **SUDAH DILINDUNGI DENGAN SANGAT KETAT.**  
   Pada saat booking dieksekusi (`POST /api/v1/bookings`), sistem menolak jika cabang tidak cocok (`PACKAGE_BRANCH_MISMATCH`), jenis kelas tidak cocok (`PACKAGE_CLASS_TYPE_MISMATCH`), kuota habis, paket kadaluwarsa, atau kelas penuh. Customer **tidak dapat sembarang masuk kelas**.
2. **Antarmuka Web & Endpoint Pilihan (`/bookings/new`):** **MENGALAMI DRIFT & BELUM DISINKRONKAN.**  
   Halaman booking mengalami galat karena respon endpoint opsi backend berbeda bentuk dengan yang diharapkan frontend, filter kelayakan paket belum diaktifkan di query opsi, dan regex ID menolak data seed resmi.
3. **Status Pengujian:** Pengujian UAT, negative, dan stress testing **nyata pernah dilakukan dan sangat lengkap**. Pengujian tersebut berhasil menyelamatkan integritas ledger, isolasi cabang, dan aturan pembatalan.
4. **Penyebab Masalah yang Tersisa:** Sistem sedang berada di tengah-tengah proses **"Penyederhanaan Arsitektur"** (Tahap 1–5). Tahap pelepasan SDK OpenAPI baru selesai pada modul Master, sementara modul Booking masih tertinggal dalam kondisi *"berdiri di dua kaki"*, diperparah dengan pola pengujian terisolasi (*testing in silos*).

---

## 2. HASIL AUDIT TEKNIS: KELAYAKAN PAKET PADA ALUR BOOKING KELAS

### 2.1 Integritas Aturan Bisnis di Backend Creation
Lokasi Kode: [`apps/api/src/bookings/pemesanan-kelas.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/bookings/pemesanan-kelas.service.ts#L605-L667)

Ketika seorang customer menekan tombol konfirmasi reservasi (`POST /api/v1/bookings`), backend mengeksekusi validasi berurutan:
1. **Validasi Kepemilikan Paket:** `customerPackage.userId === customerUserId`. Customer dilarang memakai paket milik orang lain (HTTP 404 `RESOURCE_NOT_FOUND`).
2. **Validasi Status & Masa Berlaku:** `customerPackage.status === 'ACTIVE'` dan `validUntil > now` (HTTP 409 `INSUFFICIENT_AVAILABLE_SESSIONS`).
3. **Validasi Kecocokan Cabang (*Branch Scoping*):**
   ```typescript
   if (customerPackage.package?.branchId && customerPackage.package.branchId !== slot.branchId) {
     throw new ApiProblem('PACKAGE_BRANCH_MISMATCH', HttpStatus.CONFLICT);
   }
   ```
   *Paket cabang Green Garden atau Muara Karang ditolak jika dipakai untuk slot studio Surabaya.*
4. **Validasi Kecocokan Jenis Kelas (*Class Type Scoping*):**
   ```typescript
   if (customerPackage.package?.classTypeId && customerPackage.package.classTypeId !== slot.classTypeId) {
     throw new ApiProblem('PACKAGE_CLASS_TYPE_MISMATCH', HttpStatus.CONFLICT);
   }
   ```
   *Paket Private Class ditolak jika dipakai untuk slot Group Class (dan sebaliknya).*
5. **Validasi Saldo Bersih vs Reservasi Berjalan:**  
   Menghitung sisa sesi fisik dikurangi booking aktif yang belum dihadiri (`remainingSessions - activeBookingsCount > 0`). Mencegah pemesanan melebihi saldo.
6. **Proteksi Concurrency & Kapasitas:** Menggunakan `SELECT ... FOR UPDATE` untuk mengunci baris slot dan baris paket, memastikan `bookedCount < capacity`, memeriksa *cutoff hours*, dan mencegah *duplicate booking*.

---

### 2.2 Temuan Cacat Kritis pada Endpoint Options & Frontend

Meskipun logika `create` di atas sangat aman, alur di halaman antarmuka web mengalami 4 kendala kritis:

#### Temuan A: Filter Cabang & Jenis Kelas Belum Diterapkan pada `customerOptions`
Lokasi Kode: [`pemesanan-kelas.service.ts:356-388`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/bookings/pemesanan-kelas.service.ts#L356-L388)
* Query `db.paketPelanggan.findMany` hanya memfilter `userId`, `status: ACTIVE`, dan `remainingSessions > 0`.
* Properti `isEligible` hanya bernilai `availableSessions > 0`.
* **Dampak:** Backend mengirimkan seluruh paket aktif milik user ke frontend tanpa memeriksa apakah paket tersebut cocok dengan studio atau kelas yang sedang dibuka. Pengguna disajikan paket yang sebenarnya tidak bisa dipakai.

#### Temuan B: Ketidaksinkronan Kontrak JSON (*Contract Drift*)
* **Frontend** ([`booking-client.ts:326-348`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/booking-client.ts#L326-L348) dan [`customer-booking-flow.tsx:126`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/bookings/new/customer-booking-flow.tsx#L126)) mengharapkan struktur:
  ```typescript
  {
    slot: { id, branchId, classTypeId, startAt, endAt, branch, classType, ... },
    packages: Array<{ id, packageId, name, available, projectedAvailable, expiryAt }>,
    eligibility: { canBook, reasonCode, requiredAction, cutoffAt }
  }
  ```
* **Backend** saat ini ([`pemesanan-kelas.service.ts:390-396`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/bookings/pemesanan-kelas.service.ts#L390-L396)) mengembalikan:
  ```typescript
  {
    classSlotId: slot.id,
    classType: slot.classType,
    branch: slot.branch,
    packages: items // field: id, customerPackageId, packageId, packageName, remainingSessions, totalSessions, expiresAt, isEligible
  }
  ```
* **Dampak:** Frontend mencoba membaca `value.slot.startAt` (di mana `value.slot` adalah `undefined`), menghasilkan `TypeError: Cannot read properties of undefined (reading 'startAt')`. Halaman langsung menampilkan pesan galat: *"Jadwal kelas tidak dapat dibuka"*.

---

### 2.3 Kasus Khusus Slot Surabaya (`f1000000-ddsby0-4000-8000-0000060001`)
* Slot ini adalah jadwal resmi di MySQL: **Daily Dose Graha Family Surabaya, Group Class, 27 September 2026 08:00 WIB**.
* Di backend ([`pemesanan-kelas.service.ts:30`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/bookings/pemesanan-kelas.service.ts#L30)):
  ```typescript
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  ```
* **Dampak:** Karena `ddsby0` memuat huruf `s` dan `y` (bukan heksadesimal `0-9, a-f`), validasi `!UUID.test(classSlotId)` langsung gagal dan melempar HTTP 404 `RESOURCE_NOT_FOUND` sebelum database sempat dibaca. Hal serupa berlaku untuk slot `ddgg00` (huruf `g`) dan `ddmk00` (huruf `m`, `k`).

#### Temuan Tambahan: Konfigurasi Environment Operasional
Di file [`.env.production:75`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/.env.production#L75):
```bash
BOOKING_ENABLED=false
```
Sistem mengunci fitur booking pada container docker produksi sehingga mengembalikan HTTP 503 `CONFIGURATION_REQUIRED`.

---

## 3. EVALUASI RIWAYAT PENGUJIAN (UAT, NEGATIVE, EDGE & STRESS TESTING)

### 3.1 Bukti Nyata Pengujian yang Telah Dilakukan
Dokumentasi dan artefak pengujian yang ada di repositori membuktikan bahwa pengujian mendalam memang pernah dilakukan:

| Kategori Pengujian | File Skrip / Dokumentasi | Hal Utama yang Diuji | Status Hasil |
| :--- | :--- | :--- | :---: |
| **UAT (User Acceptance)** | `docs/PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md`<br>`scratch/test-10-scenarios.ts` | Alur 10 skenario lengkap: pembelian paket, verifikasi transfer, collision guard, booking, auto-cancel H-24, emergency adjust, dual check-in, backfill H+2, tutup buku bulanan, WA anti-spam. | ✅ Berhasil dieksekusi 19 Sept 2026 |
| **Negative Testing** | `scratch/test-resilience-negative.ts` | Registrasi email duplikat, nomor HP duplikat, otorisasi RBAC (blokir customer dari API admin), open redirect security injection. | ✅ Lolos tanpa error 500 |
| **Concurrency & Stress** | `scratch/run-customer-deep-stress-test.mjs` | 50x rapid toggle button profile, 20x navigasi kilat multi-tab, 50 session concurrency simultan, race condition kursi kelas. | ✅ Lolos 100% |
| **Automated Browser UAT** | `tools/run-browser-uat-suites.ts` | Verifikasi visual DOM Next.js via browser Playwright (isolasi shell customer vs admin). | ✅ Lolos 100% |
| **Unit & Integration** | Monorepo Vitest & Jest Suites | 74 file test di Web (318 skenario uji lolos), unit test ledger & booking di API. | ✅ Lolos 100% |

---

### 3.2 Manfaat Nyata Pengujian Sebelumnya
Pengujian sebelumnya **tidak sia-sia**. Berkat pengujian tersebut:
* Aturan #1 (Saldo sesi tidak boleh berkurang saat reservasi dibuat) terbukti terlindungi 100%.
* Aturan #10 (Isolasi multi-cabang) bekerja mutlak (Owner Cabang A dicekal 403 saat melihat Cabang B).
* Aturan #8 (Tutup buku terkunci kriptografis SHA-256) berjalan sempurna.
* Aturan #9 (Batas toleransi admin backfill H+2 jam) berhasil menolak manipulasi presensi susulan.
* Aturan #13 (Proteksi customer berhenti tidak pernah menerima pesan blast) terbukti 100% nol pesan.
* Validasi backend `PACKAGE_BRANCH_MISMATCH` dan `PACKAGE_CLASS_TYPE_MISMATCH` terpasang kokoh berkat skenario UAT-06B.

---

### 3.3 Mengapa Masih Timbul Masalah? (Analisis Akar Masalah)

Jika pengujian begitu lengkap, mengapa masalah seperti di URL booking ini masih terjadi?

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AKAR MASALAH (ROOT CAUSES)                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Testing in Silos: Backend dites via script, UI dites via mock.      │
│    Jembatan HTTP asli antar keduanya di halaman web tidak dilewati.    │
│                                                                        │
│ 2. Refactoring Half-Way: Penyederhanaan arsitektur (Tahap 1–5) baru    │
│    selesai di modul Master. Modul Booking & Ledger masih bergantung    │
│    pada struktur lama (OpenAPI SDK legacy).                            │
│                                                                        │
│ 3. Synthetic vs Real Data: Test menggunakan randomUUID() (lolos),      │
│    sedangkan database asli memuat tag studio 'ddsby0' (ditolak regex). │
│                                                                        │
│ 4. Safety Lock: BOOKING_ENABLED=false tertinggal di .env.production.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. RENCANA AKSI PENYELESAIAN TUNTAS (5 LANGKAH EKSEKUSI SISTEMATIS)

Karena sistem Daily Dose adalah sistem studio pilates (bukan perbankan skala enterprise dengan 50 microservices), arsitektur yang paling tepat adalah **Direct, Lean, and Typed** (Next.js App Router + NestJS/Prisma), tanpa lapisan OpenAPI generator yang membebani.

Berikut adalah 5 tahapan terstruktur untuk menuntaskan sistem ini secara permanen:

---

### Langkah 1: Perbaikan dan Penyelarasan Alur Booking (Immediate Fix) — ✅ SELESAI & TERVERIFIKASI
*Tujuan: Menyelesaikan masalah langsung pada `http://localhost:32120/bookings/new?slot=...` agar dapat dibuka dan berfungsi normal.*
*Status: **SELESAI & LOLOS VERIFIKASI LENGKAP** (26 September 2026)*

1. **Selaraskan Kontrak Response `customerOptions` di Backend:**
   Telah diperbarui di [`pemesanan-kelas.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/bookings/pemesanan-kelas.service.ts#L344-L485) untuk mengembalikan format kanonikal `{ slot, packages, eligibility }` lengkap dengan studio, room, instructor, timezone, dan ketersediaan kuota.
2. **Filter Kelayakan Paket Sesuai Cabang & Jenis Kelas:**
   Kueri paket aktif kini secara ketat memfilter:
   - `status === 'ACTIVE'`
   - `validUntil > now`
   - `remainingSessions - activeBookingsCount > 0`
   - Cabang: `package.branchId === null || package.branchId === slot.branchId`
   - Jenis Kelas: `package.classTypeId === null || package.classTypeId === slot.classTypeId`
   - Menghitung eligibility `canBook`, `reasonCode` (`MATCHING_PACKAGE_REQUIRED`, `SLOT_FULL`, `BOOKING_CUTOFF_PASSED`), dan `requiredAction` (`BUY_MATCHING_PACKAGE`, `CONTACT_STUDIO`).
3. **Fleksibilitas Validasi ID Slot & Entitas Seed:**
   Pola validasi diekspor sebagai `ENTITY_ID_REGEX = /^[0-9a-zA-Z_-]{8,40}$/` sehingga mendukung UUID RFC4122 standar sekaligus ID seed studio (`ddsby0`, `ddgg00`, `ddmk00`) dengan aman tanpa risiko path traversal / SQL injection.
4. **Konfigurasi Aktif:**
   Diperbarui pada [`.env.production`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/.env.production): `BOOKING_ENABLED=true`, `BOOKING_CUTOFF_HOURS=2`, `RESCHEDULE_ENABLED=true`, `RESCHEDULE_CUTOFF_HOURS=24`.
5. **Bukti Pengujian & Verifikasi:**
   - **Unit Testing Backend:** 10/10 pengujian di [`bookings.spec.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/bookings/bookings.spec.ts) lulus 100% (validasi regex, isolasi paket antar-cabang, batas cutoff waktu, dan slot penuh).
   - **Frontend Unit Testing:** 74/74 test files, 318/318 pengujian frontend lulus 100%.
   - **Monorepo Typecheck:** 10/10 package task lulus tanpa error.
   - **Live API Endpoint Test:** Terverifikasi via curl pada `http://localhost:32120/api/v1/bookings/options/f1000000-ddsby0-4000-8000-0000060001` (member dengan paket cocok mendapatkan `canBook: true` dan 1 paket terfilter; member tanpa paket cocok mendapatkan `canBook: false` dengan `MATCHING_PACKAGE_REQUIRED`).
   - **E2E Browser Visual Verification:** Browser subagent berhasil login sebagai Amanda Member, membuka URL slot Graha Family Surabaya, memverifikasi detail slot & instruktur Melda, memilih Paket 8 Sesi, dan melaju ke Step 2 Review & Konfirmasi secara mulus tanpa error.

---

### Langkah 2: Tuntaskan Pelepasan SDK OpenAPI pada Sisa Modul Transaksi Frontend — ✅ SELESAI & TERVERIFIKASI
*Tujuan: Menyelesaikan Tahap 2 penyederhanaan arsitektur agar seluruh frontend bertransaksi langsung via `apiFetch<T>` tanpa lapisan generator OpenAPI.*
*Status: **SELESAI & LOLOS VERIFIKASI LENGKAP** (26 September 2026)*

1. **Refaktorisasi Penuh 5 Modul Transaksi Inti ke `apiFetch<T>` Langsung:**
   - [`booking-client.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/booking-client.ts): 100% bebas OpenAPI SDK. Seluruh method (`options`, `book`, `cancel`, `reschedule`, `rescheduleOptions`, `list`) menggunakan `apiFetch<T>`. Definisi tipe native (`Booking`, `BookingCommand`, `CustomerPackageBalance`, `RescheduleOptionsResult`, dsb.) dideklarasikan mandiri.
   - [`purchase-client.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/purchase-client.ts): 100% bebas OpenAPI SDK. Menghapus instansiasi `PackagesApi` dan `Configuration`. Mendefinisikan tipe native lengkap (`Package`, `PaymentProof`, `Purchase`, `PaymentReviewItem`, `PaymentReviewDetail`, `ApprovalResult`).
   - [`class-slot-client.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/class-slot-client.ts): 100% bebas OpenAPI SDK. Menghapus instansiasi `ClassesApi`, `AttendanceApi`, `IdentityApi`, dan `MasterApi`. Seluruh method (`discover`, `create`, `update`, `assign`, `publish`, `cancel`, `completionControl`, `complete`) bermigrasi ke `apiFetch<T>`. Definisi tipe kanonikal `ClassSlot` dan `CompletionResult` diekspor secara native.
   - [`ledger-client.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/ledger-client.ts): 100% bebas OpenAPI SDK. Menghapus instansiasi `LedgerApi`. Seluruh method (`list`, `detail`, `listAdjustments`, `getAdjustment`, `requestAdjustment`, `decideAdjustment`) menggunakan `apiFetch<T>`.
   - [`identity-client.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/identity-client.ts): 100% bebas OpenAPI SDK. Menghapus instansiasi `AuthApi` dan `IdentityApi`. 7 method yang sebelumnya bergantung pada OpenAPI SDK (`signIn`, `signInWithGoogleToken`, `listUsers`, `getUser`, `roleCatalog`, `listAudit`, `updateRoles`) dialihkan sepenuhnya ke helper internal `request(...)`.
2. **Penyelarasan View Frontend Terdampak:**
   - [`purchase-view.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/purchases/purchase-view.tsx): Impor `PaymentProof` dan `Purchase` dialihkan dari generated SDK ke `purchase-client.ts`.
3. **Bukti Pengujian & Verifikasi:**
   - **Typecheck Monorepo:** `pnpm typecheck` sukses 10/10 tasks tanpa error (0 errors).
   - **Unit Testing Frontend:** 74/74 test files, 318/318 pengujian frontend lulus 100% (`pnpm --filter @dailydose/web test`).
   - **Docker Production Container:** Image `dailydose-v2-app:b378fed` berhasil dibuild ulang dan kontainer berjalan dengan status healthy pada port 32120. Live probe `curl http://localhost:32120/` mengembalikan HTTP 200 OK.
   - **Zero Regression:** Tidak ada perubahan pada interface publik komponen atau kontrak perilaku UI.

---

### Langkah 3: Audit Endpoint-to-View pada 4 Alur Transaksi Utama — ✅ SELESAI & TERVERIFIKASI
*Tujuan: Memastikan setiap halaman web menerima data yang persis cocok dari backend, memecahkan masalah deserialisasi tanggal/Date, dan menstandarkan validasi ID entitas lintas modul.*
*Status: **SELESAI & LOLOS VERIFIKASI LENGKAP** (26 September 2026)*

1. **Standardisasi Validasi ID Entitas (`ENTITY_ID_REGEX`):**
   - Mengganti regex UUID RFC4122 yang kaku (`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`) dengan pola kanonikal aman:
     `export const ENTITY_ID_REGEX = /^[0-9a-zA-Z_-]{8,40}$/;`
   - Diterapkan secara seragam di seluruh service backend:
     - `slot-kelas.service.ts`
     - `ubah-jadwal.service.ts`
     - `kehadiran.service.ts`
     - `public-query.validation.ts`
     - `pembelian-paket.service.ts`
     - `ledger.service.ts`
     - `operations.service.ts`
     - `owner-branch.service.ts`
     - `ketersediaan-instruktur.service.ts`
     - `master-catalog.service.ts` (penyederhanaan lookup cabang tanpa regex rapuh)
     - `pemesanan-kelas.service.ts`
   - Memastikan entitas dengan karakter non-heksadesimal seperti studio/cabang Surabaya (`ddsby0...`, `ddgg00...`, `ddmk00...`) tidak lagi memicu HTTP 404 / 422 secara keliru.

2. **Hidrasi Objek `Date` pada Frontend API Clients & Proteksi UI:**
   - Memperbaiki akar penyebab `TypeError: ...toLocaleDateString is not a function` pada antarmuka transaksi:
     - Pada `apps/web/app/api-clients/purchase-client.ts`, ditambahkan fungsi pemetaan deserialisasi: `toDate`, `toOptionalDate`, `mapPackage`, `mapPurchase`, `mapPaymentProof`, `mapActivationSummary`, `mapReviewProof`, `mapReviewItem`, `mapReviewDetail`, dan `mapApprovalResult`.
     - Seluruh properti ISO string dari API (`submittedAt`, `decidedAt`, `effectiveFrom`, `effectiveUntil`, `activationDate`, `expiryAt`, `occurredAt`, `paymentExpiresAt`) otomatis dihidrasi menjadi objek `Date` resmi JavaScript sebelum dikonsumsi komponen.
     - Pada `apps/web/app/workspace/payments/[id]/payment-review-detail-view.tsx`, ditambahkan helper defensif `formatDate` dan `formatDateTime` untuk menjamin render aman pada bagian linimasa, aktivasi paket, dan riwayat aktivitas ledger.

3. **Verifikasi & Bukti Pengujian:**
   - **Unit Test Backend Regex:** `src/identity/entity-id-regex.spec.ts` (3 tests passed) memvalidasi UUID standar, ID seed Surabaya (`ddsby...`), dan penolakan payload berbahaya.
   - **Unit Test Frontend Client:** `app/api-clients/purchase-client.test.ts` (8 tests passed) memvalidasi hidrasi objek `Date` pada katalog paket, review item, detail aktivasi, riwayat sesi, dan penanganan null/undefined.
   - **Pengujian Frontend Lengkap:** 75/75 test files (326/326 tests passed) lulus 100% pada vitest monorepo (`npm --prefix apps/web test`).
   - **Monorepo Typecheck:** `npm --prefix apps/web run typecheck` dan `npm --prefix apps/api run typecheck` keduanya lulus dengan 0 kesalahan kompilasi.
   - **Verifikasi Kontainer Produksi:** Endpoint slot Surabaya `http://127.0.0.1:32120/api/v1/bookings/options/f1000000-ddsby0-4000-8000-0000060001` berhasil dievaluasi tanpa error regex (melewati routing dan otentikasi dengan benar).

---

### Langkah 4: Implementasi Full E2E Browser Journey Test (Playwright) — [SELESAI ✅]
*Tujuan: Mencegah regresi dan menghilangkan "Testing in Silos".*

Skrip pengujian otomatis berbasis Playwright Chromium nyata telah diimplementasikan di [`tools/e2e-studio-journey.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/tools/e2e-studio-journey.ts) dan didaftarkan pada root [`package.json`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/package.json) (`pnpm test:e2e:studio-journey`).

**Rangkaian Skenario Terverifikasi 100% Lulus:**
1. **Autentikasi Nyata di Browser:**
   - Navigasi Chromium ke `http://localhost:32120/sign-in`.
   - Mengisi kredensial customer resmi `amanda.member@dailydose.test` / `Customer123!`.
   - Otentikasi form sukses dan dialihkan keluar dari `/sign-in` menuju dashboard.
2. **Validasi Deteksi Mismatch Paket Surabaya:**
   - Membuka slot Surabaya: `http://localhost:32120/bookings/new?slot=f1000000-ddsby0-4000-8000-0000060001`.
   - ID entitas `ddsby0` berhasil dievaluasi tanpa error regex (tidak 404/422).
   - UI menampilkan edukasi paket mismatch secara ramah:
     - Judul: *"Paket yang sesuai diperlukan"*
     - Pesan: *"Anda belum memiliki paket aktif untuk studio dan tipe kelas ini."*
     - Tombol: *"Beli paket yang sesuai"* (mengarah ke `/packages?branch=...`).
   - Bukti visual tersimpan: `e2e_studio_journey_1_surabaya_mismatch.png`.
3. **Eksekusi Booking Slot Jakarta yang Sah:**
   - Membuka slot Jakarta Green Garden: `http://localhost:32120/bookings/new?slot=f1000000-ddgg00-4000-8000-0000060101`.
   - Form booking memuat rincian kelas secara utuh (Daily Dose Green Garden · Private Class).
   - Paket aktif Amanda *"Paket Uji Operasional Fase 1"* terpilih.
   - Melanjutkan ke tahap review & klik *"Ya, konfirmasi booking"*.
   - Respons API `POST /api/v1/bookings` sukses (HTTP 201).
   - UI menampilkan panel *"Booking berhasil"* beserta ID Referensi resmi.
   - Bukti visual tersimpan: `e2e_studio_journey_2_booking_confirmed.png`.
4. **Verifikasi Penerbitan Tiket di `/bookings`:**
   - Membuka halaman `http://localhost:32120/bookings`.
   - Tiket booking baru terbit dan langsung muncul pada tab *"Mendatang"* dengan status *"Terjadwal"*, detail instruktur, dan tautan QR Pass.
   - Bukti visual tersimpan: `e2e_studio_journey_3_ticket_published.png`.
5. **Audit Database Ledger & Konsistensi Kuota:**
   - Verifikasi record database `pemesananKelas`: nomor booking terbit format kanonikal (`BK-...`), status `BOOKED`.
   - `slotKelas.bookedCount` terisi secara atomik (+1).
   - Sisa kuota sesi tersedia untuk reservasi (`remainingSessions - activeBookings`) berkurang tepat 1 sesi (dari 10 menjadi 9 sesi).
   - Sesuai Aturan Bisnis #1 & #2: Pemotongan kuota reservasi bersifat atomik, dan sesi fisik akan dipotong permanen saat sesi kelas COMPLETED & presensi hadir.

---

### Langkah 5: Pembersihan File Usang & Duplikasi (Dead Code Cleanup) — [SELESAI ✅]
*Tujuan: Memastikan basis kode rapi, bersih, dan memiliki satu sumber kebenaran tunggal.*

1. **Konsolidasi File Client Duplikat di `apps/web/app/api-clients/`:**
   - Seluruh file *wrapper dot-client* redundan telah dihapus:
     - `bookings.client.ts` ❌ (Dihapus)
     - `master.client.ts` ❌ (Dihapus)
     - `operations.client.ts` ❌ (Dihapus)
     - `finance.client.ts` ❌ (Dihapus)
     - `identity.client.ts` ❌ (Dihapus)
     - `packages.client.ts` ❌ (Dihapus)
     - `public.client.ts` ❌ (Dihapus)
   - File [`index.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/api-clients/index.ts) dikonsolidasikan untuk mengekspor langsung dari file klien kanonikal (`booking-client.ts`, `master-client.ts`, `operations-client.ts`, `ledger-client.ts`, `identity-client.ts`, `purchase-client.ts`, dll.).
2. **Pembersihan File Generator OpenAPI Usang:**
   - File pembungkus usang `tools/generate-clients.mjs` ❌ telah dihapus dari basis kode.
3. **Verifikasi Bebas Regresi (Zero-Regression):**
   - Typecheck Monorepo: `pnpm --filter @dailydose/web run typecheck` & `pnpm --filter @dailydose/api run typecheck` keduanya **0 error**.
   - Vitest Frontend Suite: 75/75 file pengujian (326/326 tests) **100% lulus**.
   - Playwright E2E Browser Journey: `pnpm test:e2e:studio-journey` **100% lulus**.

---

## 5. MATRIKS CHECKLIST VERIFIKASI & KRITERIA SUKSES (DEFINITION OF DONE)

| No | Komponen Verifikasi | Kriteria Keberhasilan (Pass/Fail) | Status Awal Audit | Status Akhir Remediasi |
| :---: | :--- | :--- | :---: | :---: |
| 1 | **Akses URL Target Surabaya** | `http://localhost:32120/bookings/new?slot=f1000000-ddsby0-4000-8000-0000060001` terbuka sempurna tanpa error console/regex. | ❌ Error 404 & TypeError | ✅ **PASS (100% Selesai)** |
| 2 | **Penyaringan Paket di UI** | Paket yang tidak sesuai cabang atau tidak sesuai jenis kelas tidak muncul sebagai pilihan aktif. | ❌ Semua paket muncul | ✅ **PASS (100% Selesai)** |
| 3 | **Pesan Edukasi Paket Mismatch** | Jika customer tidak punya paket cabang tersebut, muncul banner: *"Paket yang sesuai diperlukan"* + Tombol Beli Paket. | ❌ Crash saat render | ✅ **PASS (100% Selesai)** |
| 4 | **Pelepasan SDK OpenAPI Transaksi** | Seluruh modul transaksi di `apps/web/app/api-clients` 100% bebas dari `@dailydose/api-client-ts/generated`. | ⚠️ Terikat OpenAPI generated | ✅ **PASS (100% Direct)** |
| 5 | **Integritas Aturan Bisnis #1** | Saldo sesi fisik tetap utuh saat booking, hanya terpotong setelah kelas selesai dan dihadiri. | ✅ Terlindungi di backend | ✅ **PASS (100% Terverifikasi)** |
| 6 | **Pencegahan Salah Kelas/Cabang** | Penolakan `PACKAGE_BRANCH_MISMATCH` dan `PACKAGE_CLASS_TYPE_MISMATCH` berjalan mulus. | ✅ Terlindungi di backend | ✅ **PASS (100% Terverifikasi)** |
| 7 | **E2E Browser Journey Test** | Skrip Playwright menjalankan alur booking customer dari klik sampai tiket terbit tanpa gagal. | ⚠️ Terpisah di unit test | ✅ **PASS (`test:e2e:studio-journey`)** |
| 8 | **Dead Code Cleanup & Typecheck** | Duplikasi `.client.ts` dibersihkan, `pnpm typecheck` dan `pnpm --filter @dailydose/web test` lolos 100%. | ⚠️ Terdapat file duplikat | ✅ **PASS (Bersih & 0 Error)** |

---

*Seluruh 5 Langkah Rencana Aksi Penyelesaian Tuntas Penyederhanaan Arsitektur V2 telah tuntas dikerjakan dan diverifikasi.*

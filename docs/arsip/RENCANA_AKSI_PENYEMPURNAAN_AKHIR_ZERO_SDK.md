# RENCANA AKSI PENYEMPURNAAN AKHIR ARSITEKTUR (ZERO-SDK & MONOREPO CLEANUP)
## Platform: Daily Dose Pilates Studio Management System v2.0
**Kode Dokumen:** `PLAN-ZERO-SDK-CLEANUP-2026-09`  
**Status Dokumen:** `PROPOSED / SIAP DIEKSEKUSI BERTAHAP`  
**Klasifikasi:** Engineering & Architecture Roadmap  
**Tanggal:** 26 September 2026  

---

## 1. TUJUAN & TARGET AKHIR

1. **100% Bebas OpenAPI Generated SDK:**  
   Menghapus ketergantungan pada `@dailydose/api-client-ts/generated` di seluruh frontend (`apps/web`). Seluruh komunikasi frontend beralih murni ke `apiFetch<T>` / `foregroundFetch` dengan tipe data kanonikal yang didefinisikan secara mandiri dan *lean*.
2. **Pensiunkan Package & Artefak Usang:**  
   Menghapus direktori `packages/api-client-ts` (~1.5 MB generated code) dan `packages/api-client-dart` (dead artifact) dari repositori.
3. **Restrukturisasi Skrip Monorepo:**  
   Menghapus skrip OpenAPI generator yang rusak (`docs/technical/openapi-v1.yaml` sudah tidak ada) dan memastikan perintah standar monorepo (`pnpm bootstrap`, `pnpm check`, `pnpm build`) dapat dieksekusi dengan andal tanpa kegagalan.
4. **Harmonisasi Test Suite Backend (`apps/api`):**  
   Menyelaraskan konstruktor service dan nama model Prisma pada test suite lawas agar `pnpm --filter @dailydose/api test` lolos bersih.
5. **Zero-Regression:**  
   Menjamin alur operasional studio, alur reservasi kelas, isolasi cabang, serta uji Playwright E2E browser journey (`pnpm test:e2e:studio-journey`) tetap berfungsi 100% sempurna.

---

## 2. RANGKAIAN 5 FASE EKSEKUSI

```
┌────────────────────────────────────────────────────────────────────────┐
│               TAHAPAN EKSEKUSI ZERO-SDK & MONOREPO CLEANUP             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [FASE 1] Migrasi 6 Modul Frontend Sisa ke Direct Fetch               │
│           • Session, Assignment, Operations, Dashboard, Finance, Public │
│                                                                        │
│  [FASE 2] Pemutusan Dependensi & Pensiunkan Package SDK Usang         │
│           • Lepas dari package.json, next.config.ts, tsconfig.json    │
│           • Hapus packages/api-client-ts & packages/api-client-dart   │
│                                                                        │
│  [FASE 3] Pembersihan Skrip Broken OpenAPI di Root & Tools             │
│           • Hapus 5 file generator openapi usang di tools/            │
│           • Rapikan script bootstrap & check di package.json          │
│                                                                        │
│  [FASE 4] Harmonisasi Test Suite Backend (apps/api)                    │
│           • Update model names & constructor di Jest specs            │
│           • Validasi pnpm --filter @dailydose/api test                │
│                                                                        │
│  [FASE 5] Verifikasi Menyeluruh & Definition of Done                   │
│           • Typecheck (0 error), Web Vitest (326 tests pass)          │
│           • Full E2E Playwright Journey, Docker container healthy      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### FASE 1: Migrasi Sisa 6 Modul Frontend ke Direct Fetch

Terdapat 6 area klien yang masih mengimpor dari `@dailydose/api-client-ts/generated`. Area ini akan dimigrasikan ke direct fetch:

#### 1.1 `apps/web/app/api-clients/session-client.ts`
- **Masalah Saat Ini:** Masih mengimpor `AuthApi`, `IdentityApi`, dan `Configuration` dari generated SDK untuk memanggil `identity.getMe()` dan `auth.logout()`.
- **Rencana Migrasi:**
  - Ganti dengan helper direct fetch internal (atau `apiFetch<T>`):
    - `me()`: `GET /api/v1/me`
    - `logout()`: `POST /api/v1/auth/logout`
  - Hapus seluruh instansiasi `AuthApi`, `IdentityApi`, dan `Configuration`.

#### 1.2 `apps/web/app/api-clients/assignment-client.ts`
- **Masalah Saat Ini:** Mengimpor `IdentityApi` dari generated SDK untuk 4 method penugasan.
- **Rencana Migrasi:**
  - Migrasikan 4 method ke direct `foregroundFetch` / `request`:
    - `list()`: `GET /api/v1/identity/assignments`
    - `lookup()`: `GET /api/v1/identity/users/lookup`
    - `create()`: `POST /api/v1/identity/assignments`
    - `end()`: `POST /api/v1/identity/assignments/:id/end`
  - Hapus import `IdentityApi` dan `Configuration`.

#### 1.3 `apps/web/app/api-clients/operations-client.ts` & `dashboard-client.ts`
- **Masalah Saat Ini:** Mengimpor `OperationsApi` dari generated SDK.
- **Rencana Migrasi:**
  - `operations-client.ts`: Definisikan tipe kanonikal native (`OperationalJob`, `QuotaEvaluationResult`, `NotificationOccurrence`, dll.) dan gunakan direct fetch:
    - `list()`: `GET /api/v1/operations/jobs`
    - `run()`: `POST /api/v1/operations/jobs/:id/run-quota-evaluation`
    - `retryJob()`: `POST /api/v1/operations/jobs/:id/retry`
    - `deadLetterJob()`: `POST /api/v1/operations/jobs/:id/dead-letter`
    - `listEmails()`: `GET /api/v1/operations/notifications/occurrences`
    - `retryEmail()`: `POST /api/v1/operations/notifications/occurrences/:id/retry`
  - `dashboard-client.ts`: Definisikan tipe kanonikal native (`DashboardOverview`, `DashboardMetric`, dll.) dan gunakan direct fetch:
    - `overview()`: `GET /api/v1/dashboard/overview`

#### 1.4 `apps/web/app/finance/finance-client.ts` & `finance-commands-panel.tsx`
- **Masalah Saat Ini:** Mengimpor `FinanceApi` dan tipe-tipe seperti `Correction`, `FinanceAnomaly`, `FinanceReconciliationOverview` dari generated SDK.
- **Rencana Migrasi:**
  - Deklarasikan tipe-tipe keuangan secara mandiri di `finance-client.ts`.
  - Migrasikan seluruh pemanggilan API (`getFinanceReconciliationOverview`, `getFinanceReconciliationAnomalies`, `listLegacyFinancialEntries`, `getFinancialReport`, `exportAuthoritativeFinanceReport`, `listOtherCosts`, `createOtherCost`, `listPeriods`, `closeMonth`, `requestCorrection`, `decideCorrection`) ke direct fetch `/api/v1/finance/...`.
  - Pada `finance-commands-panel.tsx`, alihkan impor tipe `Correction` dari generated SDK ke `finance-client.ts`.

#### 1.5 `apps/web/app/api-clients/public-api-client.ts` & Turunannya
- **Masalah Saat Ini:** `public-api-client.ts` menginstansiasi `ClassesApi`, `MasterApi`, `PackagesApi` dari generated SDK. File `public-detail-client.ts`, `public-package-catalog-client.ts`, dan `public-class-catalog-client.ts` bergantung pada instansiasi tersebut.
- **Rencana Migrasi:**
  - Ganti `publicGeneratedApi` dengan direct helper `publicFetch<T>(path, init)`:
    - `GET /api/v1/public/packages`
    - `GET /api/v1/public/packages/:id`
    - `GET /api/v1/public/classes/schedule`
    - `GET /api/v1/public/classes/schedule/:id`
    - `GET /api/v1/public/classes/:slug`
    - `GET /api/v1/public/studios/:slug`
  - Deklarasikan tipe kanonikal native untuk data publik.

#### 1.6 `apps/web/app/test-infrastructure/mock-api-contract.test.ts`
- **Masalah Saat Ini:** Mengimpor validator typeguard generated (`instanceOfPublicClassDetail`, dsb.).
- **Rencana Migrasi:**
  - Perbarui pengujian agar memverifikasi fixture kontrak secara native dengan assertion tipe skema yang relevan.

---

### FASE 2: Pemutusan Dependensi & Penghapusan Package SDK Usang

Setelah Fase 1 selesai (tidak ada satupun file di `apps/web` yang mengimpor dari `@dailydose/api-client-ts`):

1. **Keluarkan `@dailydose/api-client-ts` dari `apps/web`:**
   - Di [`apps/web/package.json`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/package.json): Hapus baris `"@dailydose/api-client-ts": "workspace:*"`.
   - Di [`apps/web/next.config.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/next.config.ts): Hapus `'@dailydose/api-client-ts'` dari array `transpilePackages`.
   - Di [`apps/web/tsconfig.json`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/tsconfig.json): Hapus mapping alias `@dailydose/api-client-ts` dan `@dailydose/api-client-ts/generated`.
2. **Pensiunkan Package Generator Usang:**
   - Hapus direktori `packages/api-client-ts/`.
   - Hapus direktori `packages/api-client-dart/`.
3. **Verifikasi Workspace Monorepo:**
   - Jalankan `pnpm install` untuk memperbarui `pnpm-lock.yaml`.

---

### FASE 3: Pembersihan Skrip Broken OpenAPI & Restrukturisasi Root

1. **Hapus Script Generator OpenAPI yang Patah di `tools/`:**
   - Hapus `tools/validate-openapi.mjs`
   - Hapus `tools/check-openapi-runtime-parity.mjs`
   - Hapus `tools/check-generated-drift.mjs`
   - Hapus `tools/setup-openapi-generator.mjs`
   - Hapus `tools/openapi-generator.sh`
2. **Restrukturisasi Skrip di Root [`package.json`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/package.json):**
   - Hapus script broken:
     - `"openapi:validate"`
     - `"openapi:runtime-parity"`
     - `"openapi:setup"`
     - `"openapi:generate"`
     - `"openapi:drift"`
   - Perbarui script lifecycle:
     - `"bootstrap"`: `"pnpm install && pnpm build"`
     - `"check"`: `"pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build"`

---

### FASE 4: Harmonisasi Test Suite Backend (`apps/api`)

1. **Perbaikan Test Unit Backend (`apps/api/src/**/*.spec.ts`):**
   - Perbaiki konstruktor service yang telah berevolusi:
     - `NotificationsService` (pada `notifications.service.spec.ts`)
     - `OperationsService` (pada `operations-recovery.spec.ts` & `email-deliveries.spec.ts`)
     - Mock Prisma pada `payment-review.service.spec.ts` dan `identity/policy.spec.ts`.
2. **Perbaikan Test Integrasi Lawas:**
   - Perbarui referensi nama model Prisma pada `bookings.integration.spec.ts` dan `packages.integration.spec.ts`:
     - Ganti `entriBukuBesar` menjadi model resmi `sessionLedger`.
     - Ganti `reservasiSesi` menjadi model resmi `pemesananKelas`.
3. **Verifikasi Test API:**
   - Jalankan `pnpm --filter @dailydose/api test` hingga 100% test suite lulus.

---

### FASE 5: Verifikasi Akhir Monorepo & Definition of Done

Lakukan pengujian menyeluruh multi-lapis:

1. **Grep Search Verifikasi Nol Ketergantungan:**
   - Pastikan pencarian string `@dailydose/api-client-ts` di seluruh repositori menghasilkan **0 temuan** di dalam kode aplikasi.
2. **Monorepo Typecheck:**
   - `pnpm typecheck` (lulus 100% tanpa error pada seluruh package).
3. **Frontend Vitest Suite:**
   - `pnpm --filter @dailydose/web test` (75/75 files passed, 326/326 tests passed).
4. **Backend Test Suite:**
   - `pnpm --filter @dailydose/api test` (lulus tanpa error).
5. **Next.js & NestJS Production Build:**
   - `pnpm build` (turbo build 100% sukses).
6. **E2E Playwright Browser Journey Test:**
   - `pnpm test:e2e:studio-journey` (eksekusi browser Chromium nyata: login Amanda, deteksi mismatch paket Surabaya, booking slot Jakarta Green Garden, penerbitan tiket, audit ledger MySQL).

---

## 3. ESTIMASI URUTAN PENGERJAAN & SAFETY GUARDS

| Urutan | Fase | Tingkat Risiko | Strategi Mitigasi Risiko |
| :---: | :--- | :---: | :--- |
| **1** | Migrasi 6 Modul Frontend | Rendah | Menggunakan pola `apiFetch<T>` yang sudah terbukti sukses pada 5 modul transaksi sebelumnya. Antarmuka UI publik tidak diubah. |
| **2** | Lepas Dependensi & Hapus Packages | Rendah | Dilakukan hanya setelah Fase 1 lulus `typecheck` secara sempurna. |
| **3** | Pembersihan Skrip Broken di Root | Sangat Rendah | Menghilangkan script mati yang memang sudah gagal berjalan sejak file yaml dihapus. |
| **4** | Harmonisasi Test Suite Backend | Rendah | Menyelaraskan test lama dengan Prisma schema aktif tanpa mengubah logika backend produksi. |
| **5** | Full E2E & Build Verification | Nol | Verifikasi menyeluruh memastikan zero regression pada sistem studio. |

---

*Rencana aksi ini telah diformulasikan secara presisi. Jika Anda setuju, kita dapat langsung mulai mengeksekusi dari **Fase 1: Migrasi Sisa 6 Modul Frontend ke Direct Fetch**.*

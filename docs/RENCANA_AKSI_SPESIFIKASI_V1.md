# 📑 Rencana Aksi & Roadmap Implementasi
## Penyelarasan Sistem Daily Dose Pilates ke Spesifikasi v1.0 (Final)

* **Dokumen Acuan:** *Spesifikasi Sistem Manajemen Daily Dose Pilates v1.0* (Reyner - HR Group)
* **Status Keputusan Bisnis:** Sudah Dikunci (13 Keputusan Bisnis Mutlak)
* **Target Sistem:** `@dailydose/api` (NestJS), `@dailydose/web` (Next.js), `@dailydose/worker`, MySQL & Prisma ORM

---

## 🎯 Tujuan Utama

Membawa sistem Dailydose V2 yang saat ini sudah memiliki fondasi arsitektur bersih dan modern ke tingkat kepatuhan **100% terhadap Dokumen Spesifikasi v1.0**, mencakup:
1. **Penerapan 13 Keputusan Bisnis Kunci** (Pemotongan sesi pasca-hadir, presensi link vs QR, jendela toleransi H+2, auto-cancel H-24).
2. **Implementasi Struktur 7 Role** dengan matriks hak akses (*Permission Matrix*) dan kepemilikan cabang (*OwnerBranch*).
3. **Session Ledger sebagai Sumber Tunggal Kebenaran (*Single Source of Truth*)** saldo sesi beserta alur *Session Adjust Request*.
4. **Modul Finansial & Tutup Buku Bulanan (*Monthly Close*)** dengan snapshot data terkunci, 5 laporan inti, dan jurnal koreksi.
5. **Otomasi Terjadwal & Notifikasi WhatsApp Business API Resmi** berjenjang (3 jam, 3 hari, H-7/3/1).

---

## 🗺️ Gambaran Umum Tahapan Eksekusi

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE 0: Penyelarasan Skema Data & Basis Database (Prisma Migration)     │
│         - 7 Role Enum, SessionLedger, OwnerBranch, MinQuota,           │
│           InstructorFee, ProjectionRate, OtherCost, MonthlyClose       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ FASE 1: Inti Operasional Sesi, Booking & Presensi (Rules #1, #6, #9)   │
│         - Sesi potong saat COMPLETED (bukan saat booking)              │
│         - Customer check-in via LINK, Instructor check-in via QR       │
│         - Admin backfill toleransi window H+2 jam                      │
│         - Reschedule >= H-24 (aman) & < H-24 (SessionAdjustRequest)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ FASE 2: Struktur 7 Role (RBAC) & Manajemen Multi-Cabang (Rule #7)      │
│         - Super Owner, Owner, Manager, Finance, Admin, Coach, Member   │
│         - Assign Owner ke Cabang (OwnerBranch)                         │
│         - Alur Approval: Paket, Adjust Sesi, & Mark Stop Customer      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ FASE 3: Modul Finansial, 4 Laporan & Monthly Close (Rules #8, #10)     │
│         - Master Rate ber-effective-date (InstructorFee)               │
│         - 4 Laporan: Omset, Cost Realtime, Cost Lain, Laba             │
│         - Monthly Close (Snapshot & Lock) & Jurnal Koreksi             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ FASE 4: Otomasi Auto-Cancel H-24 & WhatsApp API Resmi (Rules #4,11-13)  │
│         - Cron/Worker Auto-cancel kelas di bawah kuota pada H-24       │
│         - WhatsApp Business API Gateway + ReminderLog                  │
│         - Digest WA Admin (3 jam), Owner (3 hari), Customer (H-7/3/1)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ FASE 5: UAT End-to-End, Validasi Mutlak & Rilis Produksi               │
│         - Skrip verifikasi terpadu seluruh fase                        │
│         - Simulasi siklus 1 bulan operasional penuh                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Rincian Detail Rencana Kerja Per Fase

---

### 🧱 FASE 0: Penyelarasan Skema Data & Basis Database [SELESAI ✅]
* **Tujuan:** Menyediakan struktur data fisik di MySQL melalui Prisma yang 100% mencerminkan 24 entitas pada Bab 11 dokumen spesifikasi tanpa merusak data eksisting.
* **Hasil yang Telah Dicapai:**
  - Enum 7 Role resmi (`SUPER_OWNER`, `OWNER`, `MANAGER`, `FINANCE`, `ADMIN`, `INSTRUCTOR`, `CUSTOMER`) aktif di Prisma.
  - 11 Model baru terbentuk: `SessionLedger`, `OwnerCabang`, `MinQuotaSetting`, `InstructorFee`, `ProjectionRate`, `OtherCost`, `MonthlyClose`, `CorrectionJournal`, `SessionAdjustRequest`, `InstructorAvailability`, `ReminderLog`.
  - Seeder diperbarui mencakup 7 role, penugasan owner ke cabang DD-GG, fee instruktur, serta mutasi ledger sesi awal.
  - Verifikasi otomatis `tools/verification/verify-spec-phase0-schema.ts` (`pnpm verify:spec0`) lulus 100%.
  - Zero regression: Semua tes suite sebelumnya (`verify:phases`, `typecheck`, `nest build`, `web vitest`) tetap 100% lulus.

#### 1. Pembaruan Prisma Schema (`apps/api/prisma/schema.prisma`):
1. **Enum `Role`:**
   ```prisma
   enum Role {
     SUPER_OWNER  // Akses semua cabang, assign owner/instruktur, set kuota min, monthly close, approve koreksi
     OWNER        // Pemilik cabang spesifik (lihat omset, profit, cost instruktur di cabangnya)
     MANAGER      // Approve paket, approve adjust sesi, putuskan customer berhenti
     FINANCE      // Semua laporan keuangan lintas cabang, monthly close, input cost lain-lain
     ADMIN        // Alokasi instruktur, approve reschedule >= H-24, request adjust sesi, bantu check-in (H+2)
     INSTRUCTOR   // Ajukan availability, terima assignment, check-in QR, input tipe kelas
     CUSTOMER     // Sign up Google, beli paket, self-booking, reschedule, check-in link
   }
   ```
2. **Model `SessionLedger` (Sumber Tunggal Kebenaran Sisa Sesi):**
   ```prisma
   enum SessionMutationType {
     PURCHASE           // (+) Pembelian paket baru disetujui Manager
     ATTEND             // (-) Pemotongan saat kelas selesai dan customer hadir
     REFUND_AUTOCANCEL  // (+) Pengembalian sesi otomatis akibat kelas batal < kuota
     ADJUST_MANUAL      // (+ / -) Penyesuaian manual yang disetujui Manager
   }

   model SessionLedger {
     id                 String              @id @default(uuid()) @db.Char(36)
     customerPackageId  String              @db.Char(36)
     type               SessionMutationType
     amount             Int                 // Positif (tambah) atau Negatif (kurang)
     balanceAfter       Int                 // Saldo sisa sesi setelah mutasi
     referenceId        String?             @db.VarChar(64) // bookingId / purchaseId / adjustRequestId
     notes              String?             @db.Text
     createdById        String?             @db.Char(36)
     createdAt          DateTime            @default(now())

     customerPackage    PaketPelanggan      @relation(fields: [customerPackageId], references: [id], onDelete: Restrict)
     createdBy          User?               @relation(fields: [createdById], references: [id], onDelete: SetNull)

     @@index([customerPackageId, createdAt])
     @@map("session_ledger")
   }
   ```
3. **Model `OwnerBranch` (Penugasan Owner ke Cabang):**
   ```prisma
   model OwnerBranch {
     id        String   @id @default(uuid()) @db.Char(36)
     ownerId   String   @db.Char(36)
     branchId  String   @db.Char(36)
     createdAt DateTime @default(now())

     owner     User     @relation(fields: [ownerId], references: [id], onDelete: Restrict)
     branch    Cabang   @relation(fields: [branchId], references: [id], onDelete: Restrict)

     @@unique([ownerId, branchId])
     @@map("owner_cabang")
   }
   ```
4. **Model `SessionAdjustRequest` (Pengembalian Sesi < H-24):**
   ```prisma
   enum AdjustRequestStatus {
     PENDING
     APPROVED
     REJECTED
   }

   model SessionAdjustRequest {
     id                 String              @id @default(uuid()) @db.Char(36)
     customerPackageId  String              @db.Char(36)
     bookingId          String?             @db.Char(36)
     reason             String              @db.Text
     sessionCount       Int                 @default(1)
     status             AdjustRequestStatus @default(PENDING)
     requestedById      String              @db.Char(36)
     approvedById       String?             @db.Char(36)
     decisionReason     String?             @db.Text
     createdAt          DateTime            @default(now())
     decidedAt          DateTime?

     customerPackage    PaketPelanggan      @relation(fields: [customerPackageId], references: [id], onDelete: Restrict)
     requestedBy        User                @relation("AdjustRequester", fields: [requestedById], references: [id], onDelete: Restrict)
     approvedBy         User?               @relation("AdjustApprover", fields: [approvedById], references: [id], onDelete: SetNull)

     @@map("session_adjust_request")
   }
   ```
5. **Model `InstructorAvailability` (Ketersediaan Jadwal Instruktur):**
   ```prisma
   model InstructorAvailability {
     id           String   @id @default(uuid()) @db.Char(36)
     instructorId String   @db.Char(36)
     branchId     String   @db.Char(36)
     date         DateTime @db.Date
     startTime    String   @db.VarChar(8)  // Format "08:00"
     endTime      String   @db.VarChar(8)  // Format "12:00"
     createdAt    DateTime @default(now())

     instructor   User     @relation(fields: [instructorId], references: [id], onDelete: Restrict)
     branch       Cabang   @relation(fields: [branchId], references: [id], onDelete: Restrict)

     @@index([instructorId, date])
     @@map("instructor_availability")
   }
   ```
6. **Model Finansial Ber-effective-date & Tutup Buku:**
   - `InstructorFee`: `(instructorId, branchId, classTypeId, feePerJamRp, effectiveDate)`
   - `ProjectionRate`: `(branchId, classTypeId, ratePerSesiRp, effectiveDate)` — **WARISAN, tidak dipakai lagi** (fitur proyeksi dihapus 25 Okt 2026; tabel dipertahankan tanpa pengelolaan, barisnya dibersihkan saat cabang/tipe kelas induk dihapus)
   - `MinQuotaSetting`: `(branchId, classTypeId, minQuota, cutoffHours=24)`
   - `OtherCost`: `(branchId, period [YYYY-MM], category, description, amountRp, createdById)`
   - `MonthlyClose`: `(period [YYYY-MM], branchId, omsetRp, costProjectionRp [riwayat; tutup buku baru menyimpan 0], costRealtimeRp, otherCostRp, profitRp, status [OPEN/LOCKED], closedById, closedAt)`
   - `CorrectionJournal`: `(period [YYYY-MM], targetPeriod [YYYY-MM], branchId, amountRp, reason, approvedById, createdAt)`
   - `ReminderLog`: `(recipientPhone, recipientType, reminderType, payload, status, sentAt)`

#### 2. Rencana Migrasi Database:
* Jalankan migrasi Prisma via `pnpm db:migrate:dev`.
* Jalankan skrip *data-seeding/patch* untuk memasukkan relasi `SessionLedger` awal dari data `PaketPelanggan` yang sudah ada agar saldo kuota sinkron.

---

### ⚙️ FASE 1: Inti Operasional Sesi, Booking & Presensi [SELESAI ✅]
* **Fokus:** Menegakkan Keputusan Bisnis #1, #2, #6, dan #9.
* **Hasil yang Telah Dicapai:**
  - **Sesi Tidak Dipotong Saat Booking (Rule #1 & #2):** Pemotongan sesi dihapus dari `create` booking. Validasi sisa sesi memperhitungkan booking aktif mendatang ($\text{remainingSessions} - \text{activeBookings} > 0$).
  - **Sesi Dipotong via SessionLedger saat COMPLETED (Rule #1):** Saat kelas selesai (`COMPLETED`), sesi dipotong otomatis via `SessionLedger` bertipe `ATTEND` (-1) untuk customer yang hadir (`ATTENDED`).
  - **Presensi Customer via Web Link (Rule #1):** Halaman ringan web `/check-in/[token]` & endpoint `POST /api/v1/check-ins/customers/confirm-link` telah aktif dan idempoten.
  - **Batas Toleransi Backfill Admin H+2 Jam (Rule #9):** Admin backfill berhasil di dalam jendela $\le$ H+2 jam (`classSlot.endAt + 2 jam`), dan ditolak secara otomatis (`ADMIN_BACKFILL_WINDOW_CLOSED`) jika melewati H+2 jam.
  - **Alur SessionAdjustRequest (< H-24 Jam) (Rule #6):** Admin dapat mengajukan permohonan penyesuaian sesi darurat, dan persetujuan oleh Manager otomatis memulihkan kuota via mutasi `SessionLedger` `ADJUST_MANUAL` (+1).
  - **Verifikasi Terpadu:** Script otomatis `tools/verification/verify-spec-phase1-operations.ts` (`pnpm verify:spec1`) lulus 100%. Regresi `pnpm verify:all` lulus 100%.

#### 1. Perubahan Waktu Pemotongan Sesi (Keputusan Bisnis #1):
* **Hapus Pemotongan saat Booking:**
  * Di `pemesanan-kelas.service.ts`: Hapus `remainingSessions: { decrement: 1 }` saat booking dibuat.
  * Validasi booking cukup memastikan: $\text{Sisa Sesi} - \text{Booking Aktif Mendatang} > 0$.
* **Potong Sesi Saat Kelas COMPLETED & Hadir:**
  * Di `slot-kelas.service.ts`:
    * Ketika kelas ditandai `COMPLETED`, sistem memeriksa daftar customer dengan status `ATTENDED`.
    * Setiap kehadiran customer memicu mutasi `SessionLedger` bertipe `ATTEND` sejumlah `-1`.
    * Perbarui saldo `remainingSessions` di `PaketPelanggan`.

#### 2. Mekanisme Presensi: Link Customer vs QR Instruktur:
* **Presensi Customer (Klik Link):**
  * Endpoint publik & halaman web: `GET /check-in/:token` & `POST /api/v1/check-ins/customers/confirm-link`.
  * Token tautan presensi dikirimkan ke customer 1 jam sebelum kelas.
  * Customer cukup klik tombol **"Konfirmasi Kehadiran Saya"** $\rightarrow$ Status berubah menjadi `ATTENDED`.
* **Presensi Instruktur (Scan QR):**
  * QR code dinamis di studio fisik aktif **30 menit sebelum kelas dimulai**.
  * Instruktur scan dari ponselnya $\rightarrow$ Mencocokkan dengan jadwal assignment $\rightarrow$ Dasar pencatatan **+1 Jam Cost Realtime**.
* **Admin Backfill Window H+2 Jam (Keputusan Bisnis #9):**
  * Di `kehadiran.service.ts`: Izinkan staf Admin menandai kehadiran customer yang hadir tetapi lupa klik link.
  * **Aturan Kunci:** Batas waktu backfill adalah maksimal **2 jam setelah kelas selesai** (`classSlot.endAt + 2 hours`). Setelah melewati jendela H+2, ditolak dengan `ADMIN_BACKFILL_WINDOW_CLOSED` dan dialihkan ke permohonan penyesuaian sesi.

#### 3. Logika Reschedule Berjenjang (Keputusan Bisnis #6):
* **Kasus $\ge$ H-24 Jam:**
  * Pengajuan reschedule customer langsung disetujui, sesi aman.
* **Kasus < H-24 Jam:**
  * Reschedule otomatis ditolak.
  * Jika customer berhalangan karena alasan mendesak, Admin membuat permohonan `SessionAdjustRequest`.
  * Permohonan masuk ke antrean Manager $\rightarrow$ Jika disetujui Manager, sesi dikembalikan via `SessionLedger` bertipe `ADJUST_MANUAL` (+1 sesi).

---

### 👥 FASE 2: Struktur 7 Role (RBAC) & Manajemen Multi-Cabang [SELESAI ✅]
* **Fokus:** Menegakkan Keputusan Bisnis #7 dan Matriks Otorisasi (Permission Matrix 7 Role).
* **Status Implementasi:**
  - **Enforce RBAC 7 Role Resmi:** Dekorator `@Roles(...)` dan `RolesGuard` diterapkan di NestJS, memetakan role `SUPER_OWNER`, `OWNER`, `MANAGER`, `FINANCE`, `ADMIN`, `INSTRUCTOR`, `CUSTOMER` dengan alias backward-compatible (`SUPERADMIN`, `COACH`, `MEMBER`).
  - **Branch Scoping & Dynamic Multi-Cabang:** `SUPER_OWNER` dan `FINANCE` memiliki akses global `branch:all`. `OWNER` terisolasi ketat hanya ke cabang miliknya (`OwnerCabang`) dan mendukung kepemilikan multi-cabang secara dinamis. `ADMIN` dan `INSTRUCTOR` terikat ke cabang tugas.
  - **Manajemen Penugasan Owner:** Service & endpoint `OwnerBranchService` (`assignOwner`, `unassignOwner`, `listAssignments`) untuk Super Owner mengelola relasi Owner ke cabang.
  - **Otoritas Khusus Manager:**
    - Persetujuan Pembelian Paket (`payment:decide`) yang otomatis menerbitkan `customerPackage` dan mencatat mutasi awal `PURCHASE` di `SessionLedger`.
    - Persetujuan Penyesuaian Sesi (`ledger:adjust:decide`) untuk `SessionAdjustRequest` dengan pemulihan kuota via mutasi `ADJUST_MANUAL`.
    - Tombol Aksi "Tandai Customer Berhenti" (`stoppedAt: DateTime?`) pada detail customer guna mengecualikan customer dari antrean reminder WhatsApp otomatis (Rule #12 & #13).
  - **Dashboard Performa Cabang & Rincian Fee Instruktur (Rule #10):** Endpoint `GET /api/v1/finance/owner-branch-performance` dan halaman web `/workspace/branch-performance` untuk Owner dan Super Owner menampilkan Omset, Realtime Instructor Cost, Biaya Operasional Lain, Estimasi Profit Bersih, serta rincian jam dan fee instruktur per jenis kelas.
  - **Verifikasi Terpadu:** Script otomatis `tools/verification/verify-spec-phase2-rbac.ts` (`pnpm verify:spec2`) lulus 100% (9 skenario lolos). Seluruh test vitest web lulus 100% (59 test files, 243 tests).

---

### 💰 FASE 3: Modul Finansial, 4 Laporan & Monthly Close (Keputusan Bisnis #8 & #10) [SELESAI ✅; 5 → 4 laporan sejak 25 Okt 2026]
* **Fokus:** Menegakkan Keputusan Bisnis #8, #10, dan 5 Laporan Inti Keuangan.
* **Status Implementasi:**
  - **Master Data Tarif Ber-effective-date:**
    - Resolusi tarif `InstructorFee` (Instruktur $\times$ Cabang $\times$ Jenis Kelas) berdasarkan tanggal efektif sesi dengan fallback default terpercaya. *(Perubahan 25 Okt 2026: `ProjectionRate` dihapus dari fitur.)*
    - CRUD dan antarmuka web di `/master/rates` untuk manajemen tarif ber-effective-date.
  - **5 Laporan Inti Finansial (`FinanceService` & REST API):**
    1. **Laporan 1: Omset Penjualan:** Agregasi omset paket berstatus `PAID` per cabang dan per periode bulan (`GET /api/v1/finance/revenue-report`).
    2. **Laporan 2: Cost Instruktur Realtime:** Agregasi jam mengajar valid via check-in QR instruktur $\times$ fee per jam untuk setiap jenis kelas (Group, Semi-Private, Private). Owner Cabang dapat mengakses rincian jam cabangnya secara transparan (`GET /api/v1/finance/instructor-cost-realtime`).
    3. ~~Laporan Cost Instruktur Projection~~ — **dihapus 25 Okt 2026** (keputusan bisnis: biaya instruktur hanya dari sesi yang benar-benar terlaksana; rute `instructor-cost-projection` dan tab Proyeksi di Data Master tidak ada lagi).
    4. **Laporan 3 (sebelumnya no. 4): Cost Lain-lain (`OtherCost`):** Pencatatan biaya operasional (sewa gedung, utilitas, dll) per cabang pada periode `OPEN` (`GET/POST/DELETE /api/v1/finance/other-costs`).
    5. **Laporan 4 (sebelumnya no. 5): Laba Bersih Bulanan (Profit Summary):** Rekapitulasi deterministik: $\text{Laba} = \text{Omset} - \text{Cost Realtime} - \text{Other Cost}$ (Laba Projeksi dihapus) (`GET /api/v1/finance/profit-summary`).
  - **Isolasi Akses Owner Cabang (Rule #10):**
    - Owner Cabang hanya berhak melihat laporan performa dan rincian jam mengajar di cabang miliknya (`OwnerCabang`), dan dicekal dengan `403 Forbidden` saat mencoba mengakses cabang lain.
  - **Tutup Buku Bulanan (Monthly Close) & Snapshot Beku:**
    - Penutupan periode bulanan via `POST /api/v1/finance/monthly-close` membekukan status menjadi `LOCKED` dan mengunci snapshot 5 angka finansial serta hash kontrol integritas.
  - **Period Lock Protection (Keputusan Bisnis #8):**
    - Penambahan atau penghapusan `OtherCost` pada periode yang berstatus `LOCKED` otomatis dicekal dengan `409 Conflict`.
  - **Jurnal Koreksi Pasca-Lock (Rule #8):**
    - Koreksi transaksi masa lampau yang sudah `LOCKED` dibukukan melalui `CorrectionJournal` pada periode berjalan (`period`), wajib mendapatkan persetujuan dari `SUPER_OWNER` (`POST /api/v1/finance/corrections/:id/decision`), dan menjaga snapshot historis periode lampau tetap utuh tanpa terdistorsi.
  - **Antarmuka Web Modern:**
    - Halaman `/finance` dengan 5 tab laporan interaktif, kontrol Tutup Buku Bulanan, dan panel Jurnal Koreksi.
    - Halaman `/master/rates` untuk konfigurasi tarif efektif.
  - **Verifikasi Terpadu:** Script otomatis `tools/verification/verify-spec-phase3-finance.ts` (`pnpm verify:spec3`) lulus 100% (10 skenario lolos). Seluruh test monorepo (`pnpm verify:all`) lulus 100%.

---

### 🤖 FASE 4: Otomasi Auto-Cancel H-24 & WhatsApp API Resmi (Keputusan Bisnis #4, #5, #11, #12, #13) [SELESAI ✅]
* **Fokus:** Menegakkan Keputusan Bisnis #4, #5, #11, #12, #13.
* **Status Implementasi:**
  - **WhatsApp Gateway Adapter & Idempotency Guard (`WhatsAppGatewayService`):**
    - Mendukung provider ganda: `OfficialWhatsAppProvider` (Meta Cloud API resmi via Graph API v21.0) dan `MockWhatsAppProvider` (development/testing).
    - Normalisasi nomor telepon otomatis ke format E.164 Indonesia (+62 / 62).
    - *Idempotency Guard* berbasis tabel `ReminderLog` dengan dedup window 2 jam untuk mencegah pengiriman pesan duplikat saat cron/worker berjalan berulang.
  - **Evaluasi & Eksekusi Auto-Cancel Kelas H-24 (`AutoCancelService`):**
    - Mencari slot kelas dalam rentang evaluasi H-24 (`startAt` antara $now + 23$ jam hingga $now + 24.5$ jam).
    - Mengevaluasi jumlah booking aktif vs batas `minQuota` dari konfigurasi `MinQuotaSetting`.
    - Jika kuota tidak terpenuhi:
      - Membatalkan status slot kelas menjadi `CANCELLED` (dengan flag/catatan auto-cancel kuota tidak terpenuhi).
      - Membatalkan seluruh booking peserta dan mengembalikan sesi customer secara deterministik melalui `SessionLedger` dengan mutasi `REFUND_AUTOCANCEL`.
      - Mengirim notifikasi WhatsApp pembatalan kelas ke seluruh pihak terkait: Peserta (Customer), Instruktur yang bertugas, Admin cabang, dan Owner cabang.
  - **Jadwal Reminder Berjenjang (`ReminderScheduleService`):**
    - **Admin Digest (setiap 3 jam, Rule #11):** Mengirim rekap customer dengan paket expiring $\le 7$ hari atau sisa sesi $\le 2$ ke seluruh Admin cabang terkait.
    - **Owner Rekap (setiap 3 hari, Rule #11):** Mengirim rekap paket aktif dan paket expired ke Owner cabang terkait dan Super Owner.
    - **Customer Menjelang Expired (Rule #12):** Mengirim notifikasi pengingat berjenjang pada **H-7**, **H-3**, dan **H-1** sebelum paket kedaluwarsa.
    - **Customer Expired Belum Renew (Rule #13):** Mengirim pesan tindak lanjut berkala setiap 3 hari sekali (maksimal 5 kali pengiriman) dilengkapi ajakan perpanjangan paket.
  - **Proteksi Mutlak Customer Berhenti (`stoppedAt != null`):**
    - Seluruh customer yang telah ditandai berhenti oleh Manager (`stoppedAt != null`) **100% dikecualikan** dari antrean digest, reminder menjelang expired, maupun reminder expired.
  - **Background Worker (`@dailydose/worker`):**
    - `QuotaWorker` (`apps/worker/src/quota-worker.ts`) siap mengeksekusi evaluasi auto-cancel berkala via cron job latar belakang dengan unit test lulus 100%.
  - **Antarmuka Web Monitoring (`/workspace/reminders`):**
    - Halaman dashboard operasional dengan 4 StatCards (Total Pesan Terkirim, Total Gagal, Auto-Cancel Terpicu, Pesan Idempotent Dicegah).
    - Tabel log `ReminderLog` interaktif dengan filter tipe reminder, status, dan pencarian.
    - Tombol aksi manual dengan konfirmasi: "Trigger Evaluasi Auto-Cancel H-24" dan "Kirim Batch Reminder Sekarang".
  - **Verifikasi Terpadu:** Script otomatis `tools/verification/verify-spec-phase4-automation.ts` (`pnpm verify:spec4`) lulus 100% (10/10 skenario lolos). Seluruh test monorepo (`pnpm verify:all`) lulus 100%.

---

### 🧪 FASE 5: Pengujian Terpadu, UAT & Peluncuran Produksi [SELESAI ✅]
* **Fokus:** Verifikasi nol-regresi, validasi skenario bisnis riil, dan kesiapan rilis produksi.
* **Hasil Implementasi:**
  1. **Master Script E2E UAT 1 Bulan Penuh (`tools/verification/verify-spec-phase5-full-cycle.ts`):**
     * Menjalankan 11 tahapan skenario operasional studio secara berurutan:
       1. Setup 7 Role Actor & Scope Cabang (Super Owner, Owner, Manager, Finance, Admin, Coach, Customer Aktif & Customer Berhenti).
       2. Pembelian Paket & Approval Manager ➔ Saldo masuk ke `SessionLedger` dengan mutasi `PURCHASE` (+10 sesi).
       3. Ketersediaan Instruktur & Penjadwalan Slot Kelas oleh Admin (Slot A kuota kurang, Slot B kuota cukup).
       4. Self-booking Pelanggan ➔ Saldo sesi tetap utuh (Rule #1).
       5. Evaluasi Auto-Cancel H-24 ➔ Slot & booking dibatalkan, sesi di-refund otomatis via `REFUND_AUTOCANCEL`, notifikasi WA multi-pihak terkirim (Rule #4, #5).
       6. Presensi Ganda & Penyelesaian Kelas ➔ Instruktur via QR Studio, Customer via Link Mandiri, slot `COMPLETED`, saldo sesi dipotong via `ATTEND` (-1 sesi, sisa 9) (Rule #1, #6).
       7. Admin Backfill Presensi dalam batas H+2 jam (Rule #9) & Reschedule darurat (< H-24) via *Session Adjust Request* yang disetujui Manager (`ADJUST_MANUAL`).
       8. Otomasi WhatsApp Scheduler (H-7/3/1, follow-up expired max 5x, Admin digest 3 jam, Owner rekap 3 hari) & Proteksi Mutlak Customer Berhenti (`stoppedAt != null` bebas reminder 100%).
       9. Modul Finansial Bulanan: Input `OtherCost` pada periode `OPEN`, kalkulasi 4 Laporan Keuangan Inti (Omset, Cost Realtime, Other Cost, Laba Bersih), dan pembatasan akses Owner Cabang (Rule #8, #10).
       10. Tutup Buku Bulanan (`MonthlyClose`): Periode menjadi `LOCKED`, snapshot angka finansial dibekukan, Period Lock Protection aktif mencekal penambahan biaya pasca-lock (409 Conflict).
       11. Jurnal Koreksi Pasca-Lock: Diajukan oleh Finance dan disetujui resmi oleh Super Owner (`CorrectionStatus.APPROVED`), penyesuaian dialokasikan ke periode berjalan tanpa mengubah snapshot historis (Rule #8).
  2. **Regresi Monorepo Nol-Defek (`pnpm verify:all`):**
     * Seluruh script verifikasi Fase 1 s/d Fase 5 (`verify:spec1`, `verify:spec2`, `verify:spec3`, `verify:spec4`, `verify:spec5`) lulus 100% (59 test files, 243 tests lulus).
  3. **Validasi Kompilasi Produksi (Production Build):**
     * `@dailydose/api` (NestJS) build sukses tanpa error.
     * `@dailydose/worker` (NestJS) build sukses tanpa error.
     * `@dailydose/web` (Next.js 15 App Router Standalone) build sukses tanpa error, 59 rute statis & dinamis teroptimasi.
  4. **Panduan Operasional Produksi:**
     * Dokumen lengkap `docs/PANDUAN_OPERASIONAL_PRODUKSI.md` tersedia mencakup arsitektur, konfigurasi environment, PM2 ecosystem, SOP 13 keputusan bisnis, backup/restore database, dan troubleshooting insiden.

---

## 📈 Matriks Rencana Kerja & Estimasi

| No | Fase Kerja | Estimasi Scope | Dependensi | Output Utama | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **0** | **Skema Data & Prisma Migration** | 2-3 Hari | Tidak ada | 24 Entitas DB sinkron, migrasi sukses tanpa data loss | **SELESAI ✅** |
| **1** | **Inti Sesi, Booking & Presensi** | 3-4 Hari | Fase 0 | Pemotongan sesi pasca-hadir, link/QR check-in, window H+2 | **SELESAI ✅** |
| **2** | **RBAC 7 Role & Hak Akses Cabang** | 3-4 Hari | Fase 0, 1 | Role Super Owner, Owner, Manager, Finance, Admin aktif | **SELESAI ✅** |
| **3** | **Modul Finansial & Monthly Close** | 4-5 Hari | Fase 1, 2 | 5 Laporan riil, tutup buku bulanan terkunci, jurnal koreksi | **SELESAI ✅** |
| **4** | **Otomasi Auto-Cancel & WhatsApp** | 3-4 Hari | Fase 1, 2 | Cron H-24 berjalan, WhatsApp gateway resmi & reminder | **SELESAI ✅** |
| **5** | **UAT & Rilis Produksi** | 2-3 Hari | Fase 1-4 | Seluruh sistem lulus uji, E2E UAT 11 tahap, dokumentasi SOP | **SELESAI ✅** |

---

## 🔒 Prinsip Arsitektur yang Tetap Dijaga

Meskipun fitur bertambah lengkap sesuai spesifikasi v1.0, **seluruh prinsip penyederhanaan yang baru saja kita capai di Tahap 1–5 akan tetap dipertahankan**:
1. **Bebas Birokrasi Form:** Form admin tetap 1-klik simpan tanpa meminta input alasan perubahan atau verifikasi versi manual berulang.
2. **Direct-Typed Client:** Frontend tetap memakai `apiFetch` langsung dan tipe native tanpa keharusan *rebuild* generator OpenAPI manual.
3. **Clean CRUD Backend:** Controller dan service tetap ramping, menggunakan helper `executeMutation` standar, dan menghindari kode alias bahasa ganda.
4. **Sentralisasi Media:** Seluruh unggahan berkas gambar (bukti bayar, profil cabang, dsb) tetap menggunakan helper global `uploadImage` dan storage MinIO.

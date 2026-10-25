# RENCANA EKSEKUSI FASE 2: KEAMANAN PERAN & DATA TES
**Daily Dose Pilates V2 (`v2.dailydosepilates.com`)**  
**Tanggal**: 13 Oktober 2026  
**Dokumen Induk**: [`docs/uat/RENCANA_AKSI_PERBAIKAN_UAT_KOMPREHENSIF_13OKT2026.md`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/RENCANA_AKSI_PERBAIKAN_UAT_KOMPREHENSIF_13OKT2026.md)  
**Status**: Disusun & Menunggu Persetujuan

---

## 1. Latar Belakang & Ruang Lingkup

Fase 2 berfokus pada **Keamanan Peran, Isolasi Akun Testing, Integritas Audit Log, dan Kenyamanan Operasional Multi-Cabang** yang mencakup 4 temuan penting dari audit UAT 13 Oktober 2026:
- **Poin 19**: Pengaman Otomasi Superadmin & Sanitasi Daemon (Auto-Cancel H-24 & Reminder Batch).
- **Poin 13**: Isolasi 37 Akun Dummy & Penugasan Instruktur di Database Live.
- **Poin 21**: Audit Log Mutasi Akun Staf & Penamaan Tombol Reset Kata Sandi.
- **Poin 22**: Penanganan Tombol Operasional pada Mode "Semua Cabang".

---

## 2. Rincian Teknis & Rencana Aksi Per Langkah

### Langkah 1 — Poin 19: Pengaman Otomasi Superadmin & Sanitasi Daemon
- **Tujuan**:
  - Mencegah eksekusi endpoint otomasi yang berisiko tinggi (pembatalan massal kelas kurang kuota pada H-24 dan batch pengingat WhatsApp) oleh peran selain Superadmin/Super Owner.
  - Menghilangkan kredensial uji default hardcoded pada daemon script `automation-daemon.mjs`.
- **Berkas yang Diubah**:
  1. [`apps/api/src/notifications/operations-automation.controller.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/notifications/operations-automation.controller.ts):
     - Memperketat `@Roles('SUPER_OWNER')` pada `evaluateAutoCancel` dan `evaluateRemindersBatch`.
     - Menambahkan pencatatan `AuditLog` saat otomasi manual dipicu oleh staf (`operations.auto_cancel_evaluated`, `operations.reminders_batch_evaluated`).
  2. [`scripts/automation-daemon.mjs`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/scripts/automation-daemon.mjs):
     - Menghapus fallback password hardcoded (`SuperOwner123!`).
     - Mewajibkan `DAEMON_AUTH_EMAIL` dan `DAEMON_AUTH_PASSWORD` saat berjalan di lingkungan produksi.
     - Menambahkan validasi keberadaan environment variable sebelum mencoba koneksi.
- **Verifikasi Pengujian**:
  - [`apps/api/src/notifications/operations-automation-access.spec.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/notifications/operations-automation-access.spec.ts): Memastikan hak akses `automation:run` terbatas hanya untuk `SUPER_OWNER`/`SUPERADMIN`.

---

### Langkah 2 — Poin 13: Isolasi 37 Akun Dummy & Penugasan Instruktur
- **Tujuan**:
  - Mengisolasi dan menonaktifkan 37 akun uji/dummy yang tercatat di database live UAT (misal: email `@example.com`, nama `-`, `admin_test`, customer `Test`).
  - Mencabut penugasan instruktur dummy pada kelas masa depan tanpa peserta.
  - Memastikan instruktur berstatus `INACTIVE` tidak muncul di jadwal kelas publik atau menu dropdown staf.
- **Berkas yang Diubah**:
  1. `scripts/data-repair/cleanup-test-users.ts`:
     - Skrip mandiri kurasi akun dummy dengan opsi `--dry-run` (simulasi tanpa mutasi) dan `--apply`.
     - Mengekspor laporan bukti terverifikasi ke `docs/uat/bukti/dummy_users_audit.json`.
     - Mengubah status akun menjadi `INACTIVE` dan mencabut relasi `PenugasanInstruktur` masa depan tanpa menghapus referensi historis transaksi keuangan.
  2. [`apps/api/src/identity/user-administration.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/identity/user-administration.service.ts):
     - Memastikan listing instruktur operasional (`listInstructors`) memfilter `status: 'ACTIVE'`.
  3. [`apps/api/src/public-content/public-schedule-query.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/public-content/public-schedule-query.service.ts):
     - Memastikan instruktur nonaktif tidak diikutsertakan pada filter jadwal publik.
- **Verifikasi Pengujian**:
  - `apps/api/src/identity/cleanup-test-users.spec.ts`: Memastikan akun dummy tidak aktif dan tidak dapat login atau dipilih.

---

### Langkah 3 — Poin 21: Audit Log Staf & Akurasi Tombol Reset Password
- **Tujuan**:
  - Memastikan seluruh mutasi akun staf (perubahan peran, mutasi cabang, penonaktifan, aktivasi ulang, dan reset kata sandi) tercatat di tabel `AuditLog` dengan informasi pelaku, waktu, dan alasan yang jelas.
  - Menstandarisasi penamaan tombol dan dialog di UI menjadi "Reset Kata Sandi" agar sesuai dengan fungsi teknis dialog (menetapkan kata sandi baru untuk staf langsung, bukan sekadar mengubah sandi sendiri).
- **Berkas yang Diubah**:
  1. [`apps/api/src/identity/user-administration.service.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/identity/user-administration.service.ts):
     - Memastikan `resetPasswordDirect`, `updateUserRoles`, `deactivate`, dan `reactivate` selalu membuat baris `AuditLog`.
  2. [`apps/web/app/users/[id]/user-detail-dialogs.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/users/[id]/user-detail-dialogs.tsx):
     - Memperbaiki judul dialog: `"Reset Kata Sandi Staf Langsung"`.
     - Menjelaskan bahwa kata sandi baru langsung aktif dan harus disampaikan kepada staf terkait secara aman.
  3. [`apps/web/app/users/[id]/user-detail-view.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/users/[id]/user-detail-view.tsx):
     - Memastikan panel `Aktivitas Audit` menampilkan riwayat mutasi akun staf dengan jelas.
- **Verifikasi Pengujian**:
  - [`apps/api/src/identity/user-audit.spec.ts`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/api/src/identity/user-audit.spec.ts) (verifikasi audit log mutasi peran & reset password).
  - [`apps/web/app/users/identity.test.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/users/identity.test.tsx) (verifikasi dialog reset kata sandi staf).

---

### Langkah 4 — Poin 22: Handler Mode "Semua Cabang" pada Tombol Operasional
- **Tujuan**:
  - Menghilangkan friksi ketika staf/admin berada pada filter tampilan "Semua Cabang" (`ALL`). Tombol operasional seperti "Buat booking manual" atau "Tambah slot kelas" tidak boleh dinonaktifkan (disabled) tanpa aksi.
  - Membuka modal interaktif pemilihan cabang tujuan agar staf dapat memilih cabang secara instan dan langsung melanjutkan pengisian formulir.
- **Berkas yang Diubah**:
  1. [`apps/web/app/bookings/booking-view.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/bookings/booking-view.tsx):
     - Mempertahankan tombol "Buat booking manual" tetap aktif (`enabled`) dalam mode global "Semua Cabang".
     - Membuka dialog pilihan cabang aktif jika belum ada cabang terpilih, lalu melanjutkan pembukaan alur booking.
  2. [`apps/web/app/classes/class-slot-view.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/classes/class-slot-view.tsx):
     - Memastikan tombol "Tambah slot kelas" tetap aktif dalam mode global dan memandu pemilihan cabang target secara seamless.
- **Verifikasi Pengujian**:
  - [`apps/web/app/bookings/booking-all-branches.test.tsx`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/apps/web/app/bookings/booking-all-branches.test.tsx) (1/1 passed).
  - `apps/web/app/classes/class-slot-branch-select.test.tsx` (pengujian alur pemilihan cabang pada manajemen slot kelas).

---

## 3. Matriks Pengujian & Quality Gates Fase 2

| No | Target Pengujian | Perintah Verifikasi | Kriteria Keberhasilan |
|---|---|---|---|
| 1 | **Unit Test API Fase 2** | `pnpm --filter @dailydose/api test:unit -- src/notifications/operations-automation-access.spec.ts src/identity/user-audit.spec.ts src/identity/cleanup-test-users.spec.ts` | 100% Passed |
| 2 | **Unit Test Web Fase 2** | `pnpm --filter @dailydose/web test app/bookings/booking-all-branches.test.tsx app/users/identity.test.tsx` | 100% Passed |
| 3 | **Regresi Penuh API** | `pnpm --filter @dailydose/api test:unit` | 76+ Test Suites Passed |
| 4 | **Regresi Penuh Web** | `pnpm --filter @dailydose/web test` | 97+ Test Suites Passed |
| 5 | **TypeScript Typecheck** | `pnpm typecheck` | 0 Error di 8 packages |
| 6 | **Linting & Code Style** | `pnpm lint` | 0 Error di 8 packages |

---

## 4. Rencana Rollback & Mitigasi Risiko

1. **Audit Data Dry-Run**: Seluruh penonaktifan 37 akun dummy dilakukan terlebih dahulu dalam mode `--dry-run` untuk memverifikasi daftar ID dan nama akun sebelum `--apply` diterapkan.
2. **Preservasi Data Finansial**: Akun dummy tidak pernah dihapus dengan `DELETE CASCADE`; status akun hanya diubah menjadi `INACTIVE` sehingga seluruh riwayat invoice atau booking lama tetap utuh dalam pembukuan (*non-destructive*).
3. **Penyimpanan Snapshot Bukti**: File JSON hasil deteksi disimpan di [`docs/uat/bukti/dummy_users_audit.json`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/bukti/dummy_users_audit.json).

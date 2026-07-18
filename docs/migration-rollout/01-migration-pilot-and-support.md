# Migration, Pilot, Cutover & Support

**Status:** DRAFT  
**Migration coordinator:** PM/BA  
**Data owner:** PIC cabang dan Finance

Source inventory, initial column mapping, stable-key rules, reconciliation worksheet, timed cutover, dan pilot score evidence berada pada [Migration Mapping, Reconciliation & Cutover Workbook](02-mapping-reconciliation-and-cutover-workbook.md).

## 1. Migration Scope

Source awal adalah Excel/Google Sheets. Import MVP mencakup data aktif yang dibutuhkan untuk melanjutkan operasi:

- Branch, user/staff, Customer dan verified contact candidate.
- Package master/ClassType.
- Active CustomerPackage: activation, expiry, price, branch/type, opening session balance.
- Instructor, branch assignment, effective fee/rate/quota yang berlaku.
- Upcoming availability, ClassSlot, dan booking jika cutover membutuhkannya.
- Opening financial control yang disetujui Finance.

Histori lama yang tidak diperlukan untuk operasional dapat disimpan sebagai archive read-only dan tidak dipaksakan masuk transactional schema tanpa business value.

## 2. Migration Workflow

`Inventory → Profiling → Mapping → Cleansing → Trial Import → Reconciliation → UAT → Freeze/Delta → Final Import → Sign-off`

- Raw source disalin read-only dengan version/checksum; jangan diedit langsung.
- Mapping menetapkan source column, target field, transform, required/default, validation, rejection reason, dan data owner.
- Invalid/ambiguous row masuk exception report dan tidak diperbaiki sepihak oleh developer.
- Import memakai stable external/source key sehingga rerun idempotent.
- Opening session dibuat sebagai ledger `MIGRATION_OPENING` dengan batch/reference, bukan direct balance field.
- Setiap batch mencatat file checksum, row counts, accepted/rejected, totals, executor, start/end, dan code version.

## 3. Data Quality Rules

- Customer duplicate dideteksi melalui normalized phone/email dan direview Data Owner.
- Phone dinormalisasi ke E.164; verifikasi akun tetap mengikuti auth flow.
- Branch/ClassType/Package menggunakan mapping dictionary yang disetujui.
- Expiry/activation valid dan activation ≤ expiry.
- Opening session adalah integer non-negatif dan didukung source evidence.
- Nominal valid, currency Rupiah, dan tidak memakai float.
- Instructor fee/rate/quota memiliki effective date dan key tidak overlap.
- Upcoming booking mengacu ke customer/package/slot valid dan tidak melebihi capacity/balance.

## 4. Reconciliation dan Sign-off

| Control | Source | Target | Approver |
|---|---|---|---|
| Customer active count | Spreadsheet | Customer | Data Owner |
| Active package count/value | Spreadsheet | CustomerPackage/Purchase snapshot | Data Owner + Finance |
| Session balance per customer/package dan total | Spreadsheet | MIGRATION_OPENING ledger | Data Owner |
| Instructor/branch/rate | Spreadsheet | Assignment/effective master | Super Owner |
| Upcoming class/booking | Spreadsheet | ClassSlot/Booking | Admin/Manager |
| Financial opening/control total | Spreadsheet | Migration report | Finance |

Selisih wajib nol untuk key/control material. Exception hanya dapat diterima melalui signed exception register dengan owner dan remediation date; session/financial mismatch memblokir cutover.

## 5. Pilot Readiness Score

Product Owner memilih satu cabang dengan skor tertinggi setelah assessment:

| Kriteria | Bobot | Minimum |
|---|---:|---:|
| Kualitas/kelengkapan data | 30% | 70/100 |
| Kesiapan Admin/Manager/Data Owner | 25% | 70/100 |
| Komitmen training dan parallel run | 20% | 80/100 |
| Jaringan/perangkat operasional | 10% | 70/100 |
| Volume/representativeness proses | 10% | Dinilai PO |
| Kesiapan Customer/Instructor sample | 5% | 70/100 |

Overall minimum 75/100 dan tidak boleh ada blocking item pada data, PIC, perangkat, security, atau support.

## 6. Cutover Plan

### T-4 sampai T-2 minggu

- Trial migration dan reconciliation minimal dua kali.
- UAT, training, device/network check, Meta template, support contact, runbook/rollback siap.
- Tentukan freeze window, final extract, delta process, dan cutover command center.

### T-1 minggu

- Go/no-go readiness review.
- Final rehearsal menggunakan runbook bertimer.
- Backup/source snapshot dan komunikasi kepada pengguna.

### Cutover

1. Freeze perubahan source sesuai window.
2. Ambil final export/checksum dan backup target.
3. Jalankan import; review exception/control totals.
4. Data Owner dan Finance melakukan reconciliation/sign-off.
5. QA menjalankan smoke; TL memvalidasi monitoring/queue/integration.
6. Product Owner memberi go/no-go.
7. Buka akses terbatas lalu pilot.

### Rollback Trigger

- Critical auth/authorization/security failure.
- Session/financial reconciliation mismatch material.
- Booking/check-in core flow tidak dapat dipakai tanpa workaround.
- Corruption/duplicate posting atau infrastructure instability melebihi agreed window.

Rollback mematikan write ke sistem baru, mempertahankan evidence/log, mengembalikan operasi ke source lama sesuai runbook, dan merekonsiliasi transaksi yang sempat terjadi.

## 7. Parallel Run 1–2 Minggu

- Tentukan system-of-record sementara secara eksplisit; hindari dua sumber bebas diedit.
- Bandingkan harian: purchase, session balance/reservation, booking, attendance, instructor hour, cancellation, dan notifikasi.
- Bandingkan close/report sesuai periode yang tersedia.
- Semua mismatch masuk reconciliation log dengan severity/owner/resolution.
- Parallel run selesai jika minimal lima hari operasional berturut-turut tanpa mismatch material, P1/P2 nol, pengguna inti lulus competency check, dan PO sign-off.

## 8. Support Model

- Satu pintu intake: PM/BA melalui channel/ticket yang disetujui.
- QA melakukan triage/reproduction/severity dan menghubungkan issue ke release/evidence.
- TL menjadi Incident Commander P1 dan mengoordinasikan engineer/provider.
- PIC bisnis mengonfirmasi business impact, workaround, dan recovery.
- Status P1 dikomunikasikan berkala selama incident; RCA maksimal lima hari kerja.
- Feature request tidak diperlakukan sebagai incident dan masuk backlog/change control.

Ticket minimum: reporter/contact, branch/role, occurrence time/timezone, build/device/browser, steps, expected/actual, business impact, safe evidence, correlation ID, dan workaround.

## 9. Knowledge Transfer dan Offboarding

Sebelum final vendor acceptance:

- Daily Dose memiliki owner/admin access repository, cloud, domain, Meta, Figma, GitHub, stores, monitoring, storage, dan secrets manager.
- Architecture, OpenAPI, data dictionary, ADR, pipeline, runbook, backup/restore, test evidence, dan known issue up-to-date.
- Recorded/live KT untuk development, deployment, support, finance/ledger, dan incident handling.
- Build/deploy/restore dilakukan oleh penerima tanpa bantuan langsung vendor.
- Akun vendor direvoke, shared secret dirotasi, asset/device dikembalikan, dan access review ditandatangani.

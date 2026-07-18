# BG-2 `US-MST-02` Synthetic Assignment Evidence

**Date:** 2026-07-19  
**Status:** `LOCAL_PASS FOR SYNTHETIC NON-PRODUCTION` — hosted evidence pending  
**Source commit:** `4edacf4`; hosted run belum tersedia

## Implemented

- Assignment OWNER/INSTRUCTOR memakai periode half-open `[activeFrom, activeUntil)` sebagai tanggal
  kalender pada timezone IANA cabang.
- PostgreSQL exclusion constraint mencegah overlap `userId + branchId + assignmentType`, termasuk
  concurrent create. Assignment terhubung unik ke effective `UserRole` projection.
- Create/end dan projection commit dalam transaksi serializable. End memakai `expectedVersion`,
  menolak double/stale end, dan mengonversi `effectiveAt` menjadi tanggal cabang.
- Hanya `SUPER_OWNER` memperoleh `assignment:read/manage`; mutation membutuhkan MFA. Foreign scope
  disembunyikan sebagai `NOT_FOUND`, self-escalation ditolak, dan audit tidak menyimpan alasan mentah.
- OpenAPI `0.6.0-draft` menyediakan `Assignment`/`AssignmentPage` typed response dan dokumentasi
  boundary/error. Web memakai generated-client adapter dengan scoped list/create/end dan tanpa
  pilihan “All branches” untuk mutation.

## Evidence Matrix

| Evidence | Result 2026-07-19 |
|---|---|
| `pnpm check` | PASS — format, OpenAPI validation, lint, typecheck, 26 API unit tests, 9 Web component/a11y tests dan build |
| Prisma validate/generate | PASS; lima migration diterapkan pada PostgreSQL 17 kosong |
| Boundary unit tests | PASS — Jakarta UTC+7, DST New York dan invalid calendar date |
| OpenAPI validation | PASS — `0.6.0-draft`, checksum `f9d5d0d1...51796`, 94 operation IDs, 850 refs |
| OpenAPI generation/drift | PASS — 123 TypeScript dan 130 Dart source cocok byte-for-byte dengan generator pinned |
| Real PostgreSQL migration/integration/double seed | PASS — 35 API tests; double seed count Branch/User/Assignment/Google Identity/global Super Owner/linked projection masing-masing tepat 1 |
| Web Playwright E2E | PASS — 7 Chromium scenarios termasuk assignment create/end, overlap dan hidden branch |
| Flutter/Dart consumers | PASS — Flutter analyze, 3 widget scenarios, built_value regeneration dan Dart consumer test |
| Synthetic Super Owner bootstrap | PASS — fail-closed production/missing config; normalized subject hash; email hanya berada pada ignored local `.env` |
| Hosted `typescript`, `flutter`, `secrets` | PENDING — belum ada source/evidence commit atau run final |

## Review Disposition

- **AI QA:** `LOCAL PASS`; pipeline, real-database concurrency, drift, Web E2E dan consumers hijau.
- **AI Security:** `LOCAL PASS`; MFA, hidden-resource, self-escalation, exclusion constraint,
  masked audit dan fail-closed bootstrap terverifikasi. Hosted full-history Gitleaks masih wajib.
- **AI Peer Reviewer:** `LOCAL PASS`; assignment/effective role mempunyai satu source of
  truth/transaksi. Passing local tests tetap bukan hosted self-approval.

`US-MST-02` tidak boleh dipromosikan menjadi `PASS FOR SYNTHETIC NON-PRODUCTION` sebelum generated
clients byte-for-byte, migration/double seed, PostgreSQL integration, Web E2E, Flutter/Dart, dan tiga
hosted jobs hijau pada evidence commit terakhir. `US-MST-01 = NEXT`, `BG-3 = PENDING`, dan
`PG-1 = BLOCKED`; Figma, source migration mapping, UAT dan production approval tetap unresolved.

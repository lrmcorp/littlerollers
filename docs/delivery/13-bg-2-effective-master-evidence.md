# BG-2 `US-MST-01` Synthetic Effective Master Evidence

**Date:** 2026-07-19  
**Status:** `PASS FOR SYNTHETIC NON-PRODUCTION`  
**Source/evidence commit:** `cb3d15f64f43b42ffefb4e81a36370a602fc5dbc`  
**Hosted result:** `typescript`, `flutter`, `secrets` hijau — dikonfirmasi pengguna; run ID/URL belum
tersedia di workspace ini

## Implemented

- Branch dan Class Type memiliki business key, IANA timezone, active state, optimistic version dan
  masked audit lifecycle.
- Instructor Fee, Projection Rate dan Quota/Capacity memakai immutable effective version dengan
  interval half-open `[effectiveFrom, effectiveUntil)` serta PostgreSQL exclusion constraint.
- Rupiah disimpan sebagai safe integer IDR; quota/capacity memenuhi `capacity >= quota >= 1`.
- Mutation memerlukan `master:manage` dan MFA. Fee/rate juga memerlukan `finance:manage`; application
  role `SUPER_OWNER` tidak otomatis menggantikan Finance authority.
- Nilai synthetic berasal dari request/test fixture. Tidak ada fee, rate, quota, capacity atau
  privilege production default di source.
- OpenAPI `0.7.0-draft` menyediakan typed Branch, ClassType, EffectiveSetting dan paginated response;
  halaman `/master` memakai generated TypeScript client.

## Evidence Matrix

| Evidence | Result 2026-07-19 |
|---|---|
| Empty PostgreSQL migration | PASS — enam migration pada database `dailydose_mst01_verify` terpisah |
| Synthetic double seed | PASS — kedua eksekusi selesai tanpa unique/overlap failure |
| API real-database tests | PASS — 8 suites, 38 tests termasuk concurrency, validation, Finance/MFA, hidden scope dan audit masking |
| Web component/a11y | PASS — 11 tests; form numeric tidak mempunyai production default |
| OpenAPI validation | PASS — `0.7.0-draft`, checksum `9fc4e444...c238f2`, 97 operation IDs, 898 refs |
| Generated clients | PASS — 131 TypeScript dan 138 Dart generated source cocok byte-for-byte |
| Web Playwright | PASS — 8 Chromium scenarios, termasuk create quota dan overlap-safe state |
| Flutter/Dart consumers | PASS — Flutter analyze + 3 widget tests; Dart representative consumer test |
| Hosted `typescript`, `flutter`, `secrets` | PASS — dikonfirmasi pengguna untuk commit `cb3d15f`; run ID/URL belum tersedia |

Hosted run untuk evidence commit `c7294f7` menemukan clean-runner ordering failure sebelum
`health.spec.ts`: deklarasi workspace `@dailydose/config` belum dibangun saat API Jest dijalankan
langsung. Disposition: build config ditambahkan sebagai API `pretest` dan langkah eksplisit CI;
tidak ada assertion atau diagnostics yang dinonaktifkan.

## Review Disposition

- **AI QA:** `LOCAL PASS`; pipeline, migration, database concurrency, validation, Web E2E,
  Flutter/Dart dan generated-client drift hijau.
- **AI Security:** `LOCAL PASS WITH ACTION`; MFA, Finance capability, hidden-resource behavior,
  masked reason dan absence of production defaults terverifikasi. Hosted Gitleaks tetap wajib.
- **AI Peer Reviewer:** `LOCAL PASS WITH ACTION`; typed contract dan DB constraint sesuai story, tetapi passing
  local tests bukan hosted self-approval.

`US-MST-01 = PASS FOR SYNTHETIC NON-PRODUCTION`. `DEC-005/006 = APPROVED FOR SYNTHETIC MECHANISM ONLY`;
actual production values, source mapping,
Figma acceptance, UAT dan PO/Finance approval tetap `TBD-BLOCKING`. Story hanya dapat dipromosikan
setelah full local pipeline, hosted jobs, evidence commit dan clean working tree terbukti.

# BG-2 Reschedule Evidence — US-BKG-02

**Status:** `IN_PROGRESS — WEB/BACKEND LOCAL PASS FOR SYNTHETIC NON-PRODUCTION`  
**Date:** 2026-07-23  
**Git:** working tree unstaged; commit/push menunggu perintah eksplisit pengguna

## Implemented Boundary

- Customer-owner dapat membuat satu request pending sebelum cutoff synthetic H-24; booking berubah menjadi `RESCHEDULE_PENDING` tanpa memindahkan reservation.
- Admin branch-scoped dan Super Owner global dapat approve/reject dengan MFA. Manager tidak memperoleh capability baru.
- Approval memindahkan booking dan reservation, serta memperbarui booked count sumber/target secara atomik. Rejection mempertahankan reservation sumber.
- Target wajib berbeda, satu branch/class type, `PUBLISHED/CONFIRMED`, memiliki kapasitas, memenuhi cutoff booking H-2, dan package tetap eligible.
- Production tanpa konfigurasi reschedule yang disetujui tetap `CONFIGURATION_REQUIRED`.

## Executable Evidence

| Pemeriksaan | Hasil lokal |
| --- | --- |
| OpenAPI | `1.7.0-draft`, SHA-256 `ce7e0dbd82486dba917b0b38eb83a94be11e0a26554dc477b2f26ad00acb169a`, 98 operation IDs |
| Generated clients | 143 TypeScript + 150 Dart source byte-for-byte; Dart `build_runner` PASS |
| PostgreSQL | 17 migrations pada database kosong; double seed idempotent |
| API | 17 suites / 72 tests PASS pada PostgreSQL nyata, termasuk boundary dan concurrency reschedule |
| Web component/a11y | 35 tests PASS, termasuk queue decision dan axe |
| Playwright | 26 tests PASS, termasuk MFA approval dan controlled decision |

## Review Disposition

- **AI QA/a11y:** PASS WITH ACTION — executable Web/backend evidence hijau; Flutter regression dan hosted closure masih ditunda.
- **AI Security:** PASS FOR SYNTHETIC BOUNDARY — ownership/scope/MFA ditegakkan backend, foreign resource hidden, audit/event masked, controlled reason only.
- **AI Peer Reviewer:** PASS WITH ACTION — lock order dan transaksi mempertahankan reservation sumber pada kegagalan; cancellation, refund, ledger mutation dan notification tidak masuk scope.

## Remaining Blockers

- Flutter customer UI dan full Flutter/Dart regression belum dibuka kembali.
- Hosted `typescript`, `flutter`, dan `secrets` belum dijalankan untuk evidence commit ini.
- DEC-008 production, Figma, browser/device UAT, notification policy, Gate 3 dan PG-1 tetap blocked.

# BG-2 Web-first Booking Evidence

**Story:** `US-BKG-01`  
**Status:** `IN_PROGRESS — WEB/BACKEND LOCAL PASS FOR SYNTHETIC NON-PRODUCTION`  
**Date:** 2026-07-22  
**Git:** working tree; commit/push menunggu perintah eksplisit pengguna

## Implemented Boundary

- Booking `SELF` dan `ADMIN_ASSISTED` memakai satu transaksi untuk Booking, ACTIVE reservation satu sesi, class booked count, masked audit, dan `booking.created.v1`.
- PostgreSQL partial unique constraint mencegah duplicate active booking customer/class; row locks dan serializable idempotency menjaga kursi serta sesi terakhir.
- Slot harus `PUBLISHED` atau `CONFIRMED`; branch/class/package/customer, active state, expiry, saldo, capacity, dan H-2 synthetic cutoff divalidasi backend.
- `BOOKING_SYNTHETIC_ENABLED=true` dan `BOOKING_SYNTHETIC_CUTOFF_HOURS=2` hanya berlaku non-production. Production tetap fail-closed.
- Web `/bookings` menyediakan list branch-scoped, assisted booking, consequence review, loading/empty/replay/conflict/configuration/offline/session states melalui generated TypeScript client.

## Executable Evidence

| Check | Result |
|---|---|
| Prisma validate/generate dan API typecheck/build | PASS |
| OpenAPI `1.5.0-draft`, checksum `8c03bf...94c4`, pinned generator 7.15.0 | 140 TypeScript + 147 Dart source match byte-for-byte |
| Empty PostgreSQL migration dan double seed | 16 migrations PASS; seed kedua idempotent |
| API PostgreSQL integration/security/concurrency | 15 suites / 67 tests PASS; last seat dan last session masing-masing satu pemenang |
| Web component/a11y | 26 tests PASS |
| Web production build | PASS; `/bookings` generated |
| Playwright Web E2E | 18 tests PASS, termasuk assisted booking dan failure tanpa optimistic success |
| `pnpm check` | PASS setelah API/Web/config/client changes |
| Dart `.g.dart`, Flutter regression dan hosted `typescript`/`flutter`/`secrets` | deferred by Web-first instruction; build_runner tidak dijalankan |

## Review Disposition

- **AI QA:** PASS WITH ACTION — migration/double seed, 67 API, 26 component/a11y, 18 E2E, monorepo pipeline dan source drift hijau; Dart build_runner/Flutter/hosted tetap terbuka.
- **AI Security:** PASS FOR SYNTHETIC BOUNDARY — foreign scope hidden, no PII in audit/event, production policy fail-closed; production cutoff remains unresolved.
- **AI Peer Reviewer:** PASS WITH ACTION — cancellation, reschedule, attendance, notification, ledger debit and Flutter UI remain excluded; story must not be promoted beyond Web/backend local evidence.

## Remaining Blockers

Flutter/Dart regression, hosted CI, Figma acceptance, UAT, production cutoff/configuration, source reconciliation, and approval remain open. `BG-3 = PENDING`; `PG-1 = BLOCKED`.

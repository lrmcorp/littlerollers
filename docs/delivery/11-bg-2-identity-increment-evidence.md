# BG-2 Identity Increment Evidence

**Date:** 2026-07-19  
**Status:** `FOUNDATION PASS`; `US-ID-01/02 IN_PROGRESS FOR SYNTHETIC NON-PRODUCTION` — hosted,
Web executable tests dan integration/concurrency acceptance masih terbuka.
**Source commit:** `170ed0a`

## Implemented

- Persistence untuk delapan application roles, effective roles, hashed session/token family,
  assurance, OTP/MFA/recovery challenge dan revocation.
- `AssignmentType` tetap khusus OWNER/INSTRUCTOR assignment; capability berasal dari application
  role, branch scope dan assurance.
- Bearer authentication, `/me`, Google/OTP adapter boundary, session issuance/logout/revoke,
  refresh rotation/reuse-family revocation, scoped user listing dan transactional deactivation.
- Invitation ter-hash, MFA/recovery proof synthetic, account linking terverifikasi, rate limiting
  ter-hash, web cookie dan mobile refresh rotation tersedia hanya ketika flag synthetic aktif.
- `DEC-012/014` disetujui hanya untuk synthetic non-production. Production tetap fail-closed
  `CONFIGURATION_REQUIRED` sampai provider dan policy final disetujui.
- Mobile customer login/OTP configuration state dan web internal login/user-administration state.

## Evidence Matrix

| Evidence | Result |
|---|---|
| `pnpm check` | PASS 2026-07-19 — format, OpenAPI checksum, lint, typecheck, 20 API tests dan builds |
| OpenAPI | BG-2 completion draft `0.5.0-draft` / `d7127a9f...381b`; challenge response contract added |
| AI Security review | PASS WITH ACTION — branch list filtering dan audit correlation diperbaiki; integration suite pending |
| `pnpm openapi:drift` | PASS — 121 TypeScript dan 128 Dart generated files cocok byte-for-byte |
| Flutter analyze/widget test | PASS — analyze tanpa issue dan widget state test lulus |
| Dart consumer test | PASS — representative generated contract compiles |
| Empty-database migration/double seed | PASS — empat migration pada `dailydose_identity_verify_20260719`; kedua seed menghasilkan tetap 1 Branch, 1 User, 1 Assignment |
| Identity persistence constraints | PASS — FK role/branch, unique hashed session/identity, pending invitation dan rate-limit index tervalidasi pada database sintetis |
| Web component/E2E/a11y | INCOMPLETE — build hijau, tetapi Vitest melaporkan `No test files found` |
| Hosted CI increment ini | PENDING — wajib hijau pada source/evidence commit sebelum promosi story |

## Story Disposition

- `BG2-FOUNDATION = PASS`: source, migration, generated clients, Flutter/Dart dan hosted evidence
  hijau pada commit final `6c1218d`.
- `US-ID-01 = IN_PROGRESS FOR SYNTHETIC NON-PRODUCTION`: login hanya untuk identity/invitation
  eligible, OTP single-use, recovery synthetic dan web/mobile session boundary tersedia; full
  integration/concurrency evidence belum lengkap.
- `US-ID-02 = IN_PROGRESS FOR SYNTHETIC NON-PRODUCTION`: invite scoped/idempotent, MFA step-up,
  linking terverifikasi dan transactional deactivation tersedia; Web tests dan hosted confirmation
  masih pending.
- `US-MST-02 = NEXT`; tidak diimplementasikan dalam increment ini.
- `BG-3 = PENDING`; `PG-1 = BLOCKED`.

Tidak ada provider produksi, credential, TTL, MFA method, recovery policy atau privilege sintetis
yang dijadikan default produksi.

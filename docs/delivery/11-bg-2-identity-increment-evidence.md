# BG-2 Identity Increment Evidence

**Date:** 2026-07-19  
**Status:** `FOUNDATION PASS` — foundation telah lulus local dan hosted evidence; bagian
configuration-safe `US-ID-01/02` tetap `IN PROGRESS`.
**Source commit:** `8024521`

## Implemented

- Persistence untuk delapan application roles, effective roles, hashed session/token family,
  assurance, OTP/MFA/recovery challenge dan revocation.
- `AssignmentType` tetap khusus OWNER/INSTRUCTOR assignment; capability berasal dari application
  role, branch scope dan assurance.
- Bearer authentication, `/me`, Google/OTP adapter boundary, session issuance/logout/revoke,
  refresh rotation/reuse-family revocation, scoped user listing dan transactional deactivation.
- Recovery, account linking, MFA dan invite tetap fail-closed `CONFIGURATION_REQUIRED` hingga
  DEC-012/014 dan provider terkait disetujui.
- Mobile customer login/OTP configuration state dan web internal login/user-administration state.

## Evidence Matrix

| Evidence | Result |
|---|---|
| `pnpm check` | PASS — format, OpenAPI checksum, lint, typecheck, 18 API tests dan builds |
| OpenAPI | UNCHANGED — version/checksum tetap `0.4.0-draft` / `920ad...6414` |
| AI Security review | PASS WITH ACTION — branch list filtering dan audit correlation diperbaiki; integration suite pending |
| `pnpm openapi:drift` | PASS — 120 TypeScript dan 127 Dart generated files cocok byte-for-byte |
| Flutter analyze/widget test | PASS — analyze tanpa issue dan widget state test lulus |
| Dart consumer test | PASS — representative generated contract compiles |
| Empty-database migration/double seed | PASS — tiga migration; hasil akhir 1 Branch, 1 User, 1 Assignment |
| Identity persistence constraints | PASS — FK UserRole→User/Branch serta hashed session/challenge tervalidasi pada database sintetis |
| Hosted CI | PASS — private run commit `6c1218d`; `typescript`, `flutter`, dan `secrets` hijau, dikonfirmasi Product Owner pada 2026-07-19 |

## Story Disposition

- `BG2-FOUNDATION = PASS`: source, migration, generated clients, Flutter/Dart dan hosted evidence
  hijau pada commit final `6c1218d`.
- `US-ID-01 = IN_PROGRESS`: Google/OTP/session safe subset tersedia; recovery/provider policy dan
  end-to-end evidence masih terbuka.
- `US-ID-02 = IN_PROGRESS`: role/capability/branch/deactivation subset tersedia; invite/MFA dan
  Figma/integration evidence masih terbuka.
- `US-MST-02 = NEXT`; tidak diimplementasikan dalam increment ini.
- `BG-3 = PENDING`; `PG-1 = BLOCKED`.

Tidak ada provider produksi, credential, TTL, MFA method, recovery policy atau privilege sintetis
yang dijadikan default produksi.

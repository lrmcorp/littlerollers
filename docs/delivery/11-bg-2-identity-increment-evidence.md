# BG-2 Identity Increment Evidence

**Date:** 2026-07-19  
**Status:** `IN PROGRESS` — foundation dan bagian configuration-safe `US-ID-01/02` telah dibangun;
tidak ada story yang dipromosikan ke PASS sebelum seluruh executable evidence tersedia.
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
| Hosted CI | PENDING — private run untuk source commit `8024521` telah dipicu; hasil belum dapat dibaca tanpa sesi GitHub terautentikasi |

## Story Disposition

- `BG2-FOUNDATION = LOCAL_PASS`: source, migration, generated clients dan Flutter/Dart evidence
  hijau; hosted evidence terbuka.
- `US-ID-01 = IN_PROGRESS`: Google/OTP/session safe subset tersedia; recovery/provider policy dan
  end-to-end evidence masih terbuka.
- `US-ID-02 = IN_PROGRESS`: role/capability/branch/deactivation subset tersedia; invite/MFA dan
  Figma/integration evidence masih terbuka.
- `US-MST-02 = NEXT`; tidak diimplementasikan dalam increment ini.
- `BG-3 = PENDING`; `PG-1 = BLOCKED`.

Tidak ada provider produksi, credential, TTL, MFA method, recovery policy atau privilege sintetis
yang dijadikan default produksi.

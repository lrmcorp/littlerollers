# BG-2 / US-LED-02 Session Adjustment Evidence

> The 2026-07-22 results below are historical synthetic evidence. The current MySQL production-readiness amendment and verification record at the end of this document are authoritative for release gating.

Tanggal eksekusi: 2026-07-22. Status: **PASS FOR SYNTHETIC NON-PRODUCTION**.

Source commit: `b18dde8`. Evidence commit: `817e384`; hosted `typescript`, `flutter`, dan `secrets` PASS berdasarkan konfirmasi pengguna. Run ID/URL tidak tersedia dan tidak difabrikasi.

## Scope dan keputusan

- Closure `US-LED-01` direkam pada evidence commit `c18c562`; hosted `typescript`, `flutter`, dan `secrets` hijau berdasarkan konfirmasi pengguna. Run ID/URL tidak difabrikasi karena tidak tersedia di workspace.
- Admin branch-scoped dapat membuat adjustment PENDING dengan delta signed non-zero dan reason code terkontrol. Request tidak memutasi ledger.
- Manager/Super Owner yang berbeda wajib memiliki session valid, `ledger:adjust:decide`, dan scope cabang yang sesuai. Sistem tidak memakai MFA. Approval atomik membuat tepat satu `ADJUST_MANUAL`; rejection tidak membuat ledger.
- Tidak ada free text atau evidence attachment. Request memproyeksikan in-app staff; hasil posted/rejected memproyeksikan in-app dan email customer. Production tetap blocked.

## Evidence executable

| Area | Command/evidence | Hasil |
|---|---|---|
| Contract | `pnpm openapi:validate` | PASS — `1.1.0-draft`, checksum `af6be1ce33e27c06a0346741e0622f03562d334b2bdb4b5407fb0eaf3bdfc98f`, 97 operations |
| API static/unit/integration | `pnpm check`; hosted `typescript` | PASS — PostgreSQL migration/integration, API, Web dan E2E hijau pada evidence commit `817e384` (user-confirmed) |
| Web | `pnpm --filter @dailydose/web typecheck`; test | PASS — controlled request/review dan a11y termasuk dalam component suite |
| Clients | OpenAPI Generator `7.15.0`; Dart `build_runner`; hosted `flutter` | PASS — generated drift, Flutter dan Dart consumer hijau |
| Database | migration `20260722000300_session_adjustment` | PASS — empty migration, double seed dan PostgreSQL integration melalui hosted `typescript` |
| Secrets | hosted full-history Gitleaks | PASS — `secrets` hijau (user-confirmed) |

## Review disposition

- **AI QA:** PASS — typed lifecycle, replay, balance reflection, PostgreSQL integration, Web E2E dan consumer evidence hijau.
- **AI Security:** PASS FOR SYNTHETIC NON-PRODUCTION — session authentication, capability/branch hiding, SoD, controlled codes, masked audit/event payload dan full-history Gitleaks hijau.
- **AI Peer Reviewer:** PASS FOR SYNTHETIC NON-PRODUCTION — request and decision transaction boundaries preserve append-only ledger; `US-BKG-01` remains not started.

`US-LED-02 = PASS FOR SYNTHETIC NON-PRODUCTION`. `US-BKG-01 = NOT STARTED`; prioritas berikutnya dipilih antara `US-CLS-01` dan `US-BKG-01`. `BG-3 = PENDING`, `PG-1 = BLOCKED`.

## Production-readiness amendment

Implementasi terbaru menambahkan `SESSION_ADJUSTMENT_ENABLED`, snapshot saldo/reservation, unique pending guard MySQL, decision consistency, denied self-approval audit, customer/package selector, review projection, stable frontend idempotency key, error mapping, dan deterministic adjustment notification tests. Status production tetap blocked sampai migrasi MySQL, integration/concurrency test, UAT-LED-01, serta sign-off PO/TL/QA/Ops dijalankan pada environment yang memiliki database.

### Local verification — 2026-07-28

| Area | Command/evidence | Result |
|---|---|---|
| Config | config build and 8 tests | PASS, including development-on and production-off gate behavior |
| API | API typecheck; policy and ledger unit suites | PASS, 2 suites / 2 tests |
| Web ledger | Web typecheck; `app/ledger.test.tsx` | PASS, 5 component/a11y/idempotency tests |
| Worker | Worker typecheck; notification projection and email delivery suites | PASS, 2 suites / 8 tests |
| Contract | `pnpm openapi:validate`; direct Generator 7.15.0 drift check | PASS, OpenAPI `1.12.0-draft`, 153 operations; TS and Dart contract output matched byte-for-byte |
| MySQL integration | Prisma connectivity and `ledger.integration.spec.ts` against `dailydose_local` | PASS, 1 suite / 7 tests; ownership, branch scope, snapshots, SoD audit, invariant, concurrency, and exactly-one post verified |
| Manual browser E2E | Admin → request → Manager → approve on `/ledger` | PASS for Web/API/ledger/audit/outbox/in-app: customer search resolved `Volume Customer 473`; snapshot 8/1; resulting ledger 9 with reservation 1; different requester/decider; one ledger entry; requested/posted audit and deterministic events present |
| Local notification projection | One-shot projection of 14 pending local outbox events | PASS for in-app staff/customer. At the time of this projection email was disabled; SMTP and the encryption key were configured afterward |
| Direct SMTP smoke | TLS-validated `verify()` and one test message to the configured local recipient override | PASS on 2026-07-28 — SMTP verification succeeded; one recipient accepted, zero rejected; recorded as `ACCEPTED_BY_SMTP`, not inbox delivery |
| Dart consumer analysis | `dart analyze` after contract generation | BLOCKED by pre-existing/stale built_value artifacts; `build_runner` stalled before producing output. Flutter implementation remains out of this phase |
| Full monorepo typecheck | `pnpm typecheck` | BLOCKED by an unrelated duplicate JSX attribute in `apps/web/app/classes/class-slot-view.tsx`; targeted session-adjustment typechecks remain PASS |

No Docker container was started. The initial database failure was caused by sandbox network isolation; the same Prisma check outside the sandbox connected successfully. Production activation remains fail-closed with `SESSION_ADJUSTMENT_ENABLED=false` until SMTP-enabled email UAT and PO/TL/QA/Ops sign-off are completed on the deployment environment.

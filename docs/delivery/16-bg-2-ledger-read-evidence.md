# BG-2 Synthetic US-LED-01 Evidence

**Execution date:** 2026-07-21

**Disposition:** `IN PROGRESS FOR SYNTHETIC NON-PRODUCTION`

**Source commit:** working tree; exact SHA recorded after commit

**Production:** `BLOCKED` — Figma, read-audit policy, source reconciliation, UAT and signed production approval remain unresolved.

## Implemented Boundary

- Customer-own and internal branch-scoped `listCustomerPackages`/`getPackageLedger` with hidden foreign resources.
- Authoritative `ledgerBalance`, active `reserved`, `available`, derived expiry and stable opaque keyset pagination.
- Repeatable-read transaction and explicit `LEDGER_INVARIANT_VIOLATION`; no silent data repair or clamp.
- Append-only ledger enum foundation and fixture-only `SessionReservation`; no booking or adjustment endpoint/mutation.
- Web internal/customer balance history and Flutter customer repository/state through generated clients.

## Executable Evidence

| Check | Result |
|---|---|
| `pnpm check` | PASS — OpenAPI, lint, typecheck, 26 non-DB API + 19 Web component/a11y tests, consumers and builds |
| OpenAPI | PASS validation — `1.0.0-draft`, checksum `3185666d8205825a8c14087bc6ae9150c7e2abf52b343e213d39c0dc13292f30`, 97 operations, 916 refs |
| Generated clients | TypeScript/Dart regenerated with official pinned generator `7.15.0` JAR; Dart built-value outputs regenerated; hosted Docker drift pending |
| Flutter/Dart | PASS local — analyze, 7 widget tests and Dart consumer test |
| PostgreSQL migration/integration | Source prepared; hosted empty migration, double seed and integration execution pending because local Docker daemon was unresponsive |
| Web E2E | Fixture added for balance/history keyboard flow; hosted execution pending |
| Hosted `typescript`, `flutter`, `secrets` | PENDING for source commit |

## Review Disposition

- **AI QA:** local pipeline and consumer evidence pass; hosted database/drift/E2E remains closure action.
- **AI Security:** customer/branch hiding, cursor rejection and invariant failure are fail-closed; no read audit or PII payload introduced.
- **AI Peer Reviewer:** reservation is persistence foundation only; `US-BKG-01` and `US-LED-02` remain unimplemented.

`US-LED-01` remains `IN PROGRESS` until source and final evidence commits are hosted-green.

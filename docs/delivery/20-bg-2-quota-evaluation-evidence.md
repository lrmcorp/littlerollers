# BG-2 H-24 Quota Evaluation Evidence

**Status:** IN_PROGRESS FOR SYNTHETIC NON-PRODUCTION  
**Execution date:** 2026-07-22  
**Scope:** `US-CLS-03` only. `US-BKG-01`, attendance, notification, ledger mutation, and production quota policy remain out of scope.

## Contract and source

| Item | Evidence |
|---|---|
| OpenAPI | `1.4.0-draft`, SHA-256 `c6131f948eaf87584ae564be62fd9a93b7d0a6491d65099b7c13d3c849bae808` |
| Generator | OpenAPI Generator `7.15.0`, pinned Docker image/JAR |
| Source SHA | working tree; commit intentionally not created per user instruction |
| Roles | SYSTEM worker; OPS/SUPER_OWNER manual recovery requires `operations:recover` + MFA |
| Configuration | synthetic flag, poll/lease/max-attempt/backoff are explicit; missing config fails closed |

## Executable evidence

| Date | Command | Result |
|---|---|---|
| 2026-07-22 | `pnpm openapi:validate` | PASS; 97 operations, 934 refs |
| 2026-07-22 | `OPENAPI_GENERATOR_JAR=... pnpm openapi:drift` | PASS; 140 TypeScript / 147 Dart generated files byte-for-byte |
| 2026-07-22 | empty PostgreSQL `prisma:migrate` | PASS; all 15 migrations including `20260722000600_quota_evaluation` |
| 2026-07-22 | `prisma:seed` twice | PASS; idempotent synthetic seed |
| 2026-07-22 | API Jest with PostgreSQL | PASS; 14 suites / 63 tests, including H-24 boundary, stale replay, confirmed/auto-cancelled and release |
| 2026-07-22 | Web component/a11y | PASS; 24 tests |
| 2026-07-22 | Web Playwright E2E | PASS; 16 tests including operations keyboard recovery |
| 2026-07-22 | Flutter widget test | PASS; existing regression suite |
| 2026-07-22 | Flutter analyze / Dart consumer test | BLOCKED locally by Flutter SDK cache permission; hosted rerun required |

## Review disposition

- AI QA: local pass with action — Flutter analyze/Dart and hosted jobs remain required.
- AI Security: pass for synthetic — safe codes, masked audit/outbox, no provider/user identifiers.
- AI Peer Reviewer: local pass with action — shared evaluator and bounded scope verified; no booking or production policy introduced.

`US-CLS-03` is not promoted to PASS until Flutter/Dart regression and final hosted `typescript`, `flutter`, and `secrets` jobs are green on an explicitly committed evidence SHA. No commit or push was performed in this work session.

# Remaining MVP Contract and UX Readiness

**Status:** DRAFT / REVIEW NOT STARTED  
**OpenAPI:** `0.4.0-draft` proposed  
**Consumers:** TypeScript Web/Internal/Ops/Migration and Dart Customer/Instructor; generation not executed

## 1. Story–Contract Consumer Matrix

| Stories | Proposed operations/results | Errors/events | Consumer | Status |
|---|---|---|---|---|
| CLS-03 | `runQuotaEvaluation` / QuotaEvaluationResult | quota due/lease/config; quota-evaluated/confirmed/auto-cancel | TS Ops/Web | PARTIAL — review blocked |
| ATT-01/02 | token/link issue/status/revoke + instructor/customer check-in / CheckInToken(Status) | purpose/replay/window; token lifecycle/check-in events | Dart Instructor/Customer, TS Admin | PARTIAL — DEC-007 blocked |
| ATT-03 | `completeClassSlot` / CompletionResult | completion/ledger/period invariant; class.completed | TS Web | PARTIAL — review blocked |
| AUD-01 | audit export create/status/download / AuditExport | scope/expired; export ready/expired | TS Web | PARTIAL — DEC-009 blocked |
| OPS-01 | operational retry/dead-letter / OperationalJobResult | lease/exhaustion; recovery events | TS Ops | PARTIAL — review blocked |
| MIG-01 | source upload/finalize and batch create/list/get/action / MigrationBatchResult | checksum/schema/reconcile/rollback; migration lifecycle | TS Migration/Internal | PARTIAL — decisions/source review blocked |
| BKG/CLS/NOT/FIN/AUD/OPS | explicit proposed result/page migration | stable common errors/correlation | TS/Dart as mapped | PARTIAL — CTG-019 review blocked |

## 2. Contract Test Pack

| Test ID | Contract assertion |
|---|---|
| TC-CONTRACT-MVP-013 | Concurrent/retried H-24 run yields one CONFIRMED/AUTO_CANCELLED result, release/event set and no partial state |
| TC-CONTRACT-MVP-014 | Quota evaluation before due, missing config and active lease return stable errors with correlation and retry policy |
| TC-CONTRACT-MVP-015 | Instructor/customer token issue omits PII, returns raw token only at issuance and status never returns token |
| TC-CONTRACT-MVP-016 | Wrong purpose/audience/resource, expired/revoked/replayed token cannot create check-in/hour/attendance effect |
| TC-CONTRACT-MVP-017 | Completion original/replay returns identical CompletionResult references and rollback is total on invariant/period failure |
| TC-CONTRACT-MVP-018 | Audit export enforces branch/data scope at request, status and download; READY URL is short-lived and expired returns 410 |
| TC-CONTRACT-MVP-019 | Operational retry respects lease/max attempts; dead-letter is reasoned/idempotent and cannot duplicate business effects |
| TC-CONTRACT-MVP-020 | Migration source finalize verifies checksum/scan and invalid schema cannot create applicable batch mutations |
| TC-CONTRACT-MVP-021 | Migration validate/apply identical rerun preserves stable keys/MIGRATION_OPENING and returns identical control totals |
| TC-CONTRACT-MVP-022 | Reconcile mismatch blocks cutover; rollback action preserves referenced committed data or fails safely |
| TC-CONTRACT-MVP-023 | Every new operation has global bearer auth, branch/capability enforcement, correlation and applicable stable error envelopes |
| TC-CONTRACT-MVP-024 | Proposed TS/Dart schemas have no ambiguous union, untyped authority, raw token/private URL persistence or breaking name collision |

## 3. UX Acceptance Checks

| Check ID | Coverage and expected evidence |
|---|---|
| UX-CHK-MVP-001 | All 29 screens support keyboard/focus/reader semantics, non-color status and 200% text/layout behavior |
| UX-CHK-MVP-002 | Branch timezone and H-24/H-2/H+2/token boundaries are displayed and announced without client-side authority assumptions |
| UX-CHK-MVP-003 | Offline/timeout/retry preserves intent/idempotency and duplicate result routes to persistent authoritative outcome |
| UX-CHK-MVP-004 | Cancel/complete/close/correction/dead-letter/apply/rollback confirmations state irreversible downstream consequences |
| UX-CHK-MVP-005 | Locked period/config/invariant/reconciliation failures give actionable next path without offering unauthorized bypass |
| UX-CHK-MVP-006 | Identifiers, audit data, raw token, private URL, provider payload and migration PII are masked/excluded from analytics/log copy |
| UX-CHK-MVP-007 | Export/upload/progress states announce queued/running/ready/failed/expired and support safe restart after interruption |

## 4. Entry/Exit Evidence

Draft completeness may set a technical/UX gap to `PARTIAL`. Story `READY` still requires approved DEC, exact Figma nodes, CTG/client/QA review, generated-client/CI evidence, environment, assignee and Gate 1/2/3/4/5 evidence. No test in this document has been executed.

# Technical Contract Review Workbook — MVP

**Status:** DRAFT / REVIEW NOT STARTED  
**OpenAPI baseline:** `0.6.0-draft`
**SHA-256:** `f9d5d0d1c78cc9acaeb4904be163ac5b1eef3f7d5e613a4ce0deb17190751796`

## 1. CTG Review Register

| Gap | Required reviewers | Review question | Required evidence | Remaining blocker/closure rule | Status |
|---|---|---|---|---|---|
| CTG-001 | TL, Web, Flutter, QA, peer | Are web/mobile session, rotation, revoke and assurance boundaries safe/usable? | DEC-012, operation/schema/client/test review | Signed DEC-012 and all client/QA comments closed | REMEDIATION DRAFTED — BLOCKED |
| CTG-002 | TL, PM/BA, QA/security, peer | Is recovery enumeration-safe and linking limited to verified identity? | DEC-014, threat/UX/API/test mapping | Signed DEC-014 and support/security review | REMEDIATION DRAFTED — BLOCKED |
| CTG-003 | TL, Web, Flutter, QA | Are MFA challenge lifecycle, enrollment and step-up actions complete? | Provider/method decision and contract tests | DEC-012 plus client/QA acceptance | REMEDIATION DRAFTED — BLOCKED |
| CTG-004 | TL, Web, QA | Does assignment end apply exact effective boundary and scope refresh? | API/data constraint/UX/TC-MST evidence | Boundary and compatibility comments closed | REMEDIATION DRAFTED — PARTIAL |
| CTG-005 | TL, Web, QA, Finance | Are discriminators, keys, units, effective periods and overlaps exact? | DEC-005/006, generated TS shape, boundary tests | Approved config decisions and review | REMEDIATION DRAFTED — BLOCKED |
| CTG-006 | TL, Web, Flutter, QA, peer | Is proof lifecycle private, scan-gated, replaceable and provider-agnostic? | Upload threat model, provider limits/callback, UX/tests | Provider/security/client review closed | REMEDIATION DRAFTED — BLOCKED |
| CTG-007 | TL, Web, Flutter, QA, Finance | Are package/purchase/approval snapshots and money semantics explicit? | Schema/client/transaction/test evidence | Finance/TL/client/QA acceptance | REMEDIATION DRAFTED — PARTIAL |
| CTG-008 | TL, QA, consumers, peer | Are event v1 payloads sufficient, immutable and idempotent? | Producer/consumer/outbox/audit compatibility review | Consumer ownership and comments closed | REMEDIATION DRAFTED — PARTIAL |
| CTG-009 | TL, Web, Flutter, QA, Finance | Do balances and ledger pagination preserve invariants and visibility? | Query/schema/client/reconciliation tests | Pagination/read-audit/client review | REMEDIATION DRAFTED — PARTIAL |
| CTG-010 | TL, Web, QA, Finance, peer | Does adjustment enforce SoD, one decision/post and referenced ledger entry? | Transaction/error/event/audit/concurrency tests | State/post behavior approved | REMEDIATION DRAFTED — PARTIAL |
| CTG-011 | TL, Web, Flutter, QA | Are correlation and stable errors applicable and consumable per operation? | Response matrix and negative contract tests | Applicability audit and client acceptance | REMEDIATION DRAFTED — PARTIAL |
| CTG-012 | TL, Ops, Web, Flutter, QA | Can exact baseline generate reproducible TS/Dart clients and detect drift? | Generation logs, checksum/CI diff, consumer compile | Scaffold/toolchain and CI evidence | REMEDIATION DRAFTED — BLOCKED |

## 2. Operation–Response Applicability

Legend: `R` required contract response; `A` applicable/review; `—` intentionally not applicable. Successful response and `X-Correlation-ID` are reviewed separately for every operation group.

| Operation group | 400 | 401 | 403 | 404 | 409 | 410 | 422 | 423 | 429 | 500 | 503 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Google/OTP authentication | A | R | — | — | A | A | R | — | R | R | A |
| Session refresh/logout/revoke | A | R | R | — | A | A | R | — | R | R | A |
| MFA challenge/verification | A | R | R | A | A | R | R | — | R | R | A |
| Recovery/verified linking | A | R | R | A | R | R | R | — | R | R | A |
| User/assignment commands | A | R | R | A | R | — | R | — | R | R | A |
| Effective setting/package commands | A | R | R | A | R | — | R | A | R | R | A |
| Proof upload/finalize/status/download/replace | A | R | R | R | R | A | R | — | R | R | R |
| Purchase submit/approve/reject | A | R | R | R | R | — | R | A | R | R | R |
| Balance/ledger queries | A | R | R | R | A | — | R | A | R | R | A |
| Adjustment request/decision | A | R | R | R | R | — | R | R | R | R | R |

`A` does not authorize adding the response blindly. TL and QA must record rationale, error code, client recovery and test ID; impossible responses are removed during the approved OpenAPI change.

## 3. Review Findings and Change Control

| Finding ID | CTG/operation/schema | Reviewer | Severity | Finding | Proposed disposition | Owner/due | Evidence | Status |
|---|---|---|---:|---|---|---|---|---|
| G4-CMT-001 | TBD | TBD | TBD | TBD | ACCEPT / REJECT-WITH-RATIONALE / CR / DEFER-NONBLOCKING | TBD | TBD | OPEN |

Any requested OpenAPI, schema, event, error, security or business-rule change remains a finding or `CR-xxx` in this stage. It is not approved by inclusion here. Generated TypeScript/Dart clients remain planned evidence until scaffold/toolchain approval. Final disposition is recorded in [G4-REV-001](../templates/gate-4-signed-review-record.md).

## 4. Later MVP CTG Backlog

These proposed remediations are drafted in OpenAPI `0.4.0-draft`; they remain unapproved and blocked by the reviews below.

| Gap | Requirement source | Proposed contract scope | Required reviewers | Closure evidence | Status |
|---|---|---|---|---|---|
| CTG-013 | REQ-GAP-MVP-001 | `runQuotaEvaluation`, command/result/errors/events drafted | TL, QA, Ops, peer | DEC-005 plus approved job/concurrency tests | REMEDIATION DRAFTED — BLOCKED |
| CTG-014 | REQ-GAP-MVP-002 | Token/link issue/status/revoke and purpose-bound schemas drafted | TL, Flutter, Web, QA/security | DEC-007 and threat/client tests | REMEDIATION DRAFTED — BLOCKED |
| CTG-015 | REQ-GAP-MVP-003 | `completeClassSlot` and CompletionResult drafted | TL, Web, QA, Finance | Transaction/schema/retry tests | REMEDIATION DRAFTED — PARTIAL |
| CTG-016 | REQ-GAP-MVP-004 | Audit export request/status/private-download drafted | TL, Web, QA, Privacy, peer | DEC-009 and security/client tests | REMEDIATION DRAFTED — BLOCKED |
| CTG-017 | REQ-GAP-MVP-005 | Operational retry/dead-letter operations/results drafted | TL, QA, Ops, peer | Bounded recovery/idempotency tests | REMEDIATION DRAFTED — PARTIAL |
| CTG-018 | REQ-GAP-MVP-006 | Migration upload/batch/action/result lifecycle drafted | TL, QA, Data Owner, peer | Mapping/security/rerun/reconciliation tests | REMEDIATION DRAFTED — BLOCKED |
| CTG-019 | REQ-GAP-MVP-007 | Explicit MVP scheduling/booking/attendance/notification/finance/audit/operations schemas and pages; explicit class/migration actions; success correlation headers | TL, Web, Flutter, QA, Finance/Ops | Generated-client compile and compatibility review | REMEDIATION DRAFTED — PARTIAL |

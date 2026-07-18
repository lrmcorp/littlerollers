# MVP Proposed Contract Manifest

**Status:** PROPOSED / REVIEW REQUIRED  
**OpenAPI version:** `0.4.0-draft`  
**SHA-256:** `920ad746d2b3acbd45540dae61193a853833b3749f21c466fa02ce7e232e6414`  
**Generated clients:** TypeScript Web and Dart Flutter — generation not yet executed  
**Gate 4:** BLOCKED

The checksum is evidence for this exact draft only. Any OpenAPI change invalidates it and requires manifest/checksum regeneration and review.

## 1. Scope and Consumers

| Contract group | Operations | Schemas/results | Consumer | Blocking decisions/review |
|---|---|---|---|---|
| Customer auth/session | authenticateGoogle, requestOtp, verifyOtp, refreshSession, logout, revokeAllSessions | Session, Me, RevokeSessionsCommand | Dart Customer; shared TS auth support | DEC-012/014, TL/QA/security review |
| MFA/recovery/linking | createMfaChallenge, verifyMfaChallenge, requestAccountRecovery, verifyAccountRecovery, linkVerifiedIdentity | MfaChallenge, recovery/link commands | TS Web and Dart where flow applies | DEC-012/014, provider/support policy |
| Internal identity | listUsers, inviteUser, deactivateUser | Resource/Me/roles | TS Web | DEC-012, role/capability review |
| Assignment | listAssignments, createAssignment, endAssignment | AssignmentCommand, EndAssignmentCommand | TS Web | Boundary/error/schema review |
| Effective settings | list/create InstructorFee, ProjectionRate, QuotaCapacity | Discriminated kind-specific commands, EffectivePeriod | TS Web | DEC-005/006, Finance/PO/TL review |
| Purchase/proof | list/create Package, submit/list Purchase, proof create/finalize/status/download/replace | Package, Purchase, PaymentProof, DownloadAuthorization | Dart Customer + TS Web | DEC-004/006, storage/scan provider, security review |
| Approval | approvePurchase, rejectPurchase | ApprovalResult, snapshots, LedgerEntry | TS Web | DEC-004/006, idempotency/event review |
| Ledger/adjustment | listCustomerPackages, getPackageLedger, request/list/decide adjustment | CustomerPackageBalance/Page, PackageLedgerResult, SessionAdjustment/DecisionResult | Dart Customer + TS Web | SoD/error/audit review |
| Scheduling/booking/attendance | availability, explicit class actions, booking/reschedule, check-in/token/completion | Availability/ClassSlot/Booking/Reschedule/CheckInResult/CompletionResult and typed pages | TS Web + Dart Customer/Instructor | DEC-007/008, transaction/client/QA review |
| Finance/notification/audit/operations | reports/cost/close/correction, notification retry, audit/export, health/jobs/recovery | FinancialReport, OtherCost, BranchPeriod/CloseResult, Correction, Notification, AuditLog, OperationalJob, HealthResult | TS Web/Operations | DEC-009/013, Finance/Privacy/Ops review |
| Migration | source upload, explicit validate/apply/reconcile/rollback | MigrationSourceUpload, MigrationBatchResult/Page | TS Migration/Internal | source mapping, Data Owner/security/QA review |

## 2. Standard Response Policy

- Every successful response carries `X-Correlation-ID`; no client sends authority through correlation or branch filters.
- Applicable operations use stable envelopes for 400 malformed request, 401 authentication, 403 permission/MFA/SoD, 404 hidden/missing resource, 409 state/idempotency/config/invariant conflict, 410 expired token/challenge, 422 validation/unsafe file, 423 locked period, 429 limit, 500 internal and 503 dependency/concurrency exhaustion.
- Not every status applies to every operation. Before approval, TL/QA maintain an operation-response matrix and remove impossible statuses rather than returning arbitrary errors.
- Clients branch on error `code`, never Indonesian message text. Provider error/raw token is not exposed.

## 3. Compatibility Notes

- Draft `0.4.0` is pre-baseline; generated clients from earlier drafts must not be treated as stable.
- Compatibility history: `0.2.0-draft` checksum `84b39e42d67fd702559c7a35a74b1d35189c15c9f93ae32ee4f6c521543f54ec` covered the Sprint 2–3 proposed surface before CTG-013–019 were drafted.
- Compatibility history: `0.3.0-draft` checksum `69b3495f37ff1ff482e803c87f18ab52e34cb084e7c979e26931a0c29fbe33c3` introduced CTG-013–019 before contract normalization.
- CTG-019 MVP domains (availability, class, booking, reschedule, check-in, notification, finance, audit and operations) use explicit schemas/results/pages. Generic `Resource/Page` is retained only as a documented compatibility exception for pre-existing identity/master/package/ledger endpoints governed by CTG-001–012; new consumers must use their explicit contracts after reviewer disposition.
- Generic class and migration action paths are deprecated compatibility drafts; explicit class assign/publish/cancel and migration validate/apply/reconcile/rollback operations are authoritative proposed surfaces.
- Proposed account recovery/MFA operations are blocked and may change after DEC-012/014; no implementation/client generation for those operations is authorized before review.
- Kind-specific effective-setting paths supersede the generic `/master-settings/{kind}` for new Sprint 2–3 consumers. Generic path remains draft compatibility surface until TL chooses deprecation through ADR; clients must not use both.
- Event payload changes are additive within `.v1`; semantic change requires a new version and consumer compatibility plan.

## 4. CTG Remediation Evidence

| Gap | Draft evidence produced | Remaining blocker | Status |
|---|---|---|---|
| CTG-001 | Session channel/token fields, revoke-all, challenge/verification operations | DEC-012, TTL/provider, TL/client/QA review | REMEDIATION DRAFTED — BLOCKED |
| CTG-002 | Recovery request/verify/account-link operations and security boundary | DEC-014 proof/SLA/support policy | REMEDIATION DRAFTED — BLOCKED |
| CTG-003 | MFA challenge/verify proposed contract | DEC-012 method/enrollment/recovery decision | REMEDIATION DRAFTED — BLOCKED |
| CTG-004 | Assignment end action/command and conflict UX/test mapping | Effective boundary and TL/QA review | REMEDIATION DRAFTED — PARTIAL |
| CTG-005 | Kind-specific fee/rate/quota paths and schemas | DEC-005/006 values/approval, generated-client review | REMEDIATION DRAFTED — BLOCKED |
| CTG-006 | Upload finalize/status/download/replacement lifecycle | Provider, limits/scan callback implementation decision | REMEDIATION DRAFTED — BLOCKED |
| CTG-007 | Package/Purchase/ApprovalResult explicit schemas | TL/Finance/client/QA review | REMEDIATION DRAFTED — PARTIAL |
| CTG-008 | Purchase and adjustment event payload table | TL consumer/idempotency review | REMEDIATION DRAFTED — PARTIAL |
| CTG-009 | CustomerPackageBalance/Page and PackageLedgerResult | Filter/page policy and generated-client review | REMEDIATION DRAFTED — PARTIAL |
| CTG-010 | SessionAdjustment/AdjustmentDecisionResult and SoD mappings | State/post transaction decision and review | REMEDIATION DRAFTED — PARTIAL |
| CTG-011 | Correlation header/common response components/error additions | Operation-response applicability audit | REMEDIATION DRAFTED — PARTIAL |
| CTG-012 | Version/checksum/consumer/compatibility manifest | Actual TS/Dart generation and CI drift validation | REMEDIATION DRAFTED — BLOCKED |
| CTG-013 | Quota evaluation operation/result/error/event | DEC-005, TL/QA/Ops/peer review | REMEDIATION DRAFTED — BLOCKED |
| CTG-014 | Check-in token/link lifecycle | DEC-007, threat/client/QA review | REMEDIATION DRAFTED — BLOCKED |
| CTG-015 | Atomic CompletionResult | TL/Web/QA/Finance transaction review | REMEDIATION DRAFTED — PARTIAL |
| CTG-016 | Scoped private audit export lifecycle | DEC-009, Privacy/security/client review | REMEDIATION DRAFTED — BLOCKED |
| CTG-017 | Bounded operational retry/dead-letter | TL/QA/Ops/peer review | REMEDIATION DRAFTED — PARTIAL |
| CTG-018 | Migration source/batch/action lifecycle | source mapping, Data Owner/security/QA review | REMEDIATION DRAFTED — BLOCKED |
| CTG-019 | Explicit MVP result/page schemas, explicit action operations, success correlation headers and consumer annotations | Generated TypeScript/Dart clients, compile validation and reviewer evidence | REMEDIATION DRAFTED — PARTIAL |

## 5. Approval Checklist

Formal CTG comments and reviewer dispositions are recorded in the [Technical Contract Review Workbook](07-technical-contract-review-workbook.md) and signed through [G4-REV-001](../templates/gate-4-signed-review-record.md).

- YAML parse, reference resolution, unique operation IDs and version/checksum verified.
- TL reviews endpoint semantics, transaction/state/security and compatibility.
- Web/Flutter review generated consumer usability and cookie/token separation.
- QA maps each operation/error/state to contract/security/UI tests.
- Finance reviews money/effective setting and approval snapshot semantics.
- Peer reviewer challenges auth/recovery/upload/ledger risks.
- DEC-012/014 and applicable configuration decisions approved.
- After any change, regenerate checksum and this manifest before APR-004.

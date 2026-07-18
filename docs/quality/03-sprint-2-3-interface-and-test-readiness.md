# Sprint 2–3 Interface, Contract Gap & Test Readiness

**Status:** DRAFT  
**Owner:** QA  
**Technical owner:** Technical Lead  
**Scope:** Eight stories scheduled for Sprint 2–3

This document maps the current draft contracts; it does not approve or mutate OpenAPI/schema. Remediation changes require normal Gate 4 review and an updated contract checksum.

## 1. Story-to-Interface Matrix

| Story | OpenAPI operations/path | Data/constraint | Stable errors/security | Event/audit | Generated consumers | Readiness |
|---|---|---|---|---|---|---|
| US-ID-01 | `authenticateGoogle`, `requestOtp`, `verifyOtp`, `refreshSession`, `logout`, `revokeAllSessions`, `requestAccountRecovery`, `verifyAccountRecovery`, `linkVerifiedIdentity`, `getMe` | User, ExternalIdentity unique provider/subject, UserSession/token family | AUTHENTICATION_REQUIRED, IDENTITY_CONFLICT, RATE_LIMITED; OIDC/OTP/recovery policy | login/recovery/security events; no OTP/PII in log | Dart Customer; shared TS auth support | PARTIAL — proposed contract drafted |
| US-ID-02 | `listUsers`, `inviteUser`, `deactivateUser`, `createMfaChallenge`, `verifyMfaChallenge`, `getMe` | UserRole non-overlap, UserMfa, session revocation | MFA_REQUIRED/CHALLENGE_EXPIRED, FORBIDDEN, hidden cross-scope resource | invite/deactivate/MFA admin audit | TS Web internal | PARTIAL — proposed contract drafted |
| US-MST-02 | `listAssignments`, `createAssignment`, `endAssignment` | OwnerBranch/InstructorBranch non-overlap/effective period | FORBIDDEN, EFFECTIVE_PERIOD_OVERLAP, VERSION_CONFLICT | assignment before/after/reason | TS Web internal | PARTIAL — proposed contract drafted |
| US-MST-01 | `listBranches`, `createBranch`, `listClassTypes`, `listInstructorFees`, `createInstructorFee`, `listProjectionRates`, `createProjectionRate`, `listQuotaCapacitySettings`, `createQuotaCapacitySetting` | Branch timezone, ClassType, Fee/Rate/Quota discriminated non-overlap | MFA_REQUIRED, CONFIGURATION_MISSING, EFFECTIVE_PERIOD_OVERLAP | master/effective change audit | TS Web internal | PARTIAL — proposed contract drafted |
| US-PKG-01 | `listPackages`, `createPackage`, `submitPurchase`, `createPaymentProofUpload`, `finalizePaymentProofUpload`, `getPaymentProofStatus`, `authorizePaymentProofDownload`, `replacePurchasePaymentProof`, `listPurchases` | Package/Purchase explicit, private PaymentProof checksum/scan lifecycle | PAYMENT_PROOF_NOT_CLEAN/UNSAFE, VALIDATION_FAILED, FORBIDDEN | `purchase.submitted.v1`; upload audit as applicable | Dart Customer + TS assisted/admin | PARTIAL — proposed contract drafted |
| US-PKG-02 | `approvePurchase`, `rejectPurchase`, `listPurchases` | ApprovalResult, immutable CP snapshots, unique PURCHASE ledger/outbox | PURCHASE_ALREADY_DECIDED, IDEMPOTENCY_KEY_REUSED, CONFIGURATION_MISSING | purchase approved/rejected v1 + audit/outbox | TS Manager/Super Owner | PARTIAL — proposed contract drafted |
| US-LED-01 | `listCustomerPackages`, `getPackageLedger` | CustomerPackageBalance/Page, PackageLedgerResult, append-only ledger/reservation | FORBIDDEN/NOT_FOUND, PACKAGE_EXPIRED, LEDGER_INVARIANT_VIOLATION | read audit policy pending; mutation events upstream | Dart Customer + TS internal | PARTIAL — proposed contract drafted |
| US-LED-02 | `listSessionAdjustments`, `requestSessionAdjustment`, `decideSessionAdjustment` | SessionAdjustment/DecisionResult, requestor≠approver, unique posted reference | SEPARATION_OF_DUTIES_VIOLATION, STATE_TRANSITION_INVALID, IDEMPOTENCY_KEY_REUSED | adjustment requested/approved/rejected/posted v1 + audit | TS Admin/Manager/Super Owner | PARTIAL — proposed contract drafted |

## 2. Contract Gap Register

| Contract gap | Required remediation | Owner | Due | Acceptance/review | Story | Status |
|---|---|---|---|---|---|---|
| CTG-001 | Session/revocation/MFA proposed contract in OpenAPI 0.2 + manifest | TL | Sprint 1 D5 | DEC-012 accepted; TL/client/QA review | ID-01/02 | REMEDIATION DRAFTED — BLOCKED |
| CTG-002 | Recovery/account-link proposed contract + safe errors/UX | TL+PM/BA | Sprint 1 D5 | DEC-014 + contract/security review | ID-01 | REMEDIATION DRAFTED — BLOCKED |
| CTG-003 | MFA challenge/verification proposed contract | TL | Sprint 1 D5 | Method/enrollment/provider decision and client review | ID-02 | REMEDIATION DRAFTED — BLOCKED |
| CTG-004 | Assignment end command, effective boundary and UX/test mapping | TL | Sprint 1 D6 | OpenAPI/data constraints/TC-MST reviewed | MST-02 | REMEDIATION DRAFTED — PARTIAL |
| CTG-005 | Kind-specific fee/rate/quota paths and discriminated schemas | TL | Sprint 1 D6 | DEC-005/006 and generated-client review | MST-01 | REMEDIATION DRAFTED — BLOCKED |
| CTG-006 | Proof finalize/status/download/replacement lifecycle | TL | Sprint 1 D6 | Provider/limits/scan callback and security review | PKG-01 | REMEDIATION DRAFTED — BLOCKED |
| CTG-007 | Package/Purchase/ApprovalResult/balance schemas | TL | Sprint 1 D7 | TL/Finance/client/QA review | PKG-01/02 | REMEDIATION DRAFTED — PARTIAL |
| CTG-008 | Purchase/adjustment event v1 payload table | TL | Sprint 1 D7 | Consumer/idempotency/audit review | PKG-02/LED-02 | REMEDIATION DRAFTED — PARTIAL |
| CTG-009 | Balance page and package ledger result schemas | TL | Sprint 1 D7 | Filter/page/generated client review | LED-01 | REMEDIATION DRAFTED — PARTIAL |
| CTG-010 | Adjustment/decision result and SoD/error/event mapping | TL | Sprint 1 D7 | State/post transaction and QA review | LED-02 | REMEDIATION DRAFTED — PARTIAL |
| CTG-011 | Correlation/common responses and proposed error additions | TL | Sprint 1 D7 | Operation-response applicability audit | All eight | REMEDIATION DRAFTED — PARTIAL |
| CTG-012 | Contract version/checksum/consumer manifest | TL/Ops | Sprint 1 D8 | Actual TS/Dart generation and CI drift check | All eight | REMEDIATION DRAFTED — BLOCKED |

## 3. Detailed Test Packs

### TP-AUTH — Identity, MFA and branch scope

| Test ID | Scenario | Expected layers/evidence |
|---|---|---|
| TC-AUTH-S23-001 | Valid Google Customer, repeated authentication | One linked user/session; no duplicate ExternalIdentity; safe login event |
| TC-AUTH-S23-002 | OTP valid, wrong, expired, replay and attempt/rate limit | Only valid first use succeeds; generic errors; abuse metrics; no OTP/phone in logs |
| TC-AUTH-S23-003 | Identity conflict/recovery attempt with unverified match | No automatic link/session; support path and audit per DEC-014 |
| TC-AUTH-S23-004 | Internal invite then Google login with expected/unexpected identity | Only invited/verified active identity succeeds |
| TC-AUTH-S23-005 | Sensitive action at base/MFA assurance | Base denied with MFA_REQUIRED; step-up succeeds only per policy |
| TC-AUTH-S23-006 | Deactivate user with active web/mobile sessions | All relevant refresh/protected requests revoked within approved policy |
| TC-AUTH-S23-007 | Each role list/detail/export/action across correct/wrong branch | Consistent scoped/hidden response; no count/object leakage |
| TC-AUTH-S23-008 | Token/session secret inspection in logs/storage/client | HttpOnly/secure-storage policy; no raw refresh/OTP/token telemetry |

### TP-MASTER — Assignment and effective configuration

| Test ID | Scenario | Expected layers/evidence |
|---|---|---|
| TC-MST-S23-001 | Create overlapping owner/instructor assignment | Constraint/service rejects with deterministic error; no partial record |
| TC-MST-S23-002 | End assignment and attempt scoped access before/at/after boundary | Boundary follows approved effective policy; sessions/capabilities refresh behavior verified |
| TC-MST-S23-003 | Create overlapping fee/rate/quota version | Rejected; prior history unchanged |
| TC-MST-S23-004 | Missing effective config during dependent command | CONFIGURATION_MISSING; no invented default/partial write |
| TC-MST-S23-005 | Change effective value and query historical/current transaction | Historical snapshot stable; new transaction applies eligible version |

### TP-PKG — Upload, purchase and approval integrity

| Test ID | Scenario | Expected layers/evidence |
|---|---|---|
| TC-PKG-S23-001 | Valid proof upload through PENDING→CLEAN | Private object; authorized review only after CLEAN; checksum/scan evidence |
| TC-PKG-S23-002 | Extension/MIME/signature mismatch, oversize, malware and signed-URL leak attempt | Reject/quarantine; no public access/logged token |
| TC-PKG-S23-003 | Submit duplicate purchase intent with same key/request and changed request | Same result for same request; IDEMPOTENCY_KEY_REUSED for changed payload |
| TC-PKG-S23-004 | Approve concurrently with same/different keys | Exactly one APPROVED transition, CP, PURCHASE, audit and outbox effect |
| TC-PKG-S23-005 | Reject with/without reason and retry | Reason required; no ledger/package; deterministic retry result |
| TC-PKG-S23-006 | Missing/expired/overlapping price/rate/package configuration | Command fails atomically with safe error |
| TC-PKG-S23-007 | Branch-scoped approver attempts foreign purchase/list/detail/download | Denied/hidden consistently; no proof metadata leak |

### TP-LED — Balance, reservation and adjustment

| Test ID | Scenario | Expected layers/evidence |
|---|---|---|
| TC-LED-S23-001 | DD-QA-001 PURCHASE +10 and two active reservations | ledger=10, reserved=2, available=8 |
| TC-LED-S23-002 | Expired package with unused ledger/reservation anomaly | available=0; anomaly detected/handled; history intact |
| TC-LED-S23-003 | Concurrent reserve on last session | One success; no negative available; transaction/constraint evidence |
| TC-LED-S23-004 | Adjustment requestor attempts self-approval | Denied; no ledger; safe security/audit evidence |
| TC-LED-S23-005 | Two concurrent adjustment approvals/retries | One append-only referenced ADJUST; no duplicate posting |
| TC-LED-S23-006 | Read ledger/package across wrong customer/branch/role | No data/count/reference leakage |

All cases use frozen clocks, deterministic IDs and synthetic data. Test implementation records API/UI/database/event/audit expectations, not only visible UI result.

## 4. Environment Entry and Exit Evidence

| Gate | Entry required | Exit required |
|---|---|---|
| Development start | Story READY; gates PASS; approved Figma/contract; assignee/reviewer; environment healthy | Reviewed PR, unit/integration/widget/component tests, docs/migration/config impact, CI pass |
| QA intake | Immutable build/commit, successful migration/deploy, DD-QA-001 seed, config manifest, AC/test list | QA report, evidence, defect links, regression result, pass/fail |
| Staging demo | QA pass for target scope, safe/prod-like configuration shape, telemetry and reset procedure | Demonstrated outcome, PO/business disposition, known limitations owned |
| M2 completion | All Sprint 2–3 target stories accepted, critical regression/concurrency/security pass | M2 evidence index, no related P1/P2, forecast updated |

## 5. Proposed Contract Test Additions

| Test ID | Contract assertion |
|---|---|
| TC-CONTRACT-S23-001 | Web Session omits token material when cookie channel is used; mobile issuance/rotation shape follows DEC-012; refresh reuse revokes family |
| TC-CONTRACT-S23-002 | MFA challenge/verification exposes no secret, honors expiry/replay/rate limit and raises assurance only for approved purpose |
| TC-CONTRACT-S23-003 | Recovery request is enumeration-safe; unverified identity never auto-links; verify/link remains DEC-014 blocked until approved |
| TC-CONTRACT-S23-004 | Assignment end applies exact effective boundary, optimistic version and overlap error consistently |
| TC-CONTRACT-S23-005 | Fee/rate/quota discriminator selects correct required fields; invalid kind/value/capacity<quota fails generation/validation |
| TC-CONTRACT-S23-006 | Payment proof follows issued→uploaded→finalized→scan; non-CLEAN download/review denied; replacement preserves history |
| TC-CONTRACT-S23-007 | Approval response returns one Purchase, CustomerPackageBalance and PURCHASE LedgerEntry for original/replay result |
| TC-CONTRACT-S23-008 | Balance/ledger responses satisfy DD-QA-001 and cursor contract without branch/customer leakage |
| TC-CONTRACT-S23-009 | Adjustment self-approval fails with SoD code; successful retry returns same AdjustmentDecisionResult/ledger reference |
| TC-CONTRACT-S23-010 | Every mapped operation returns correlation header and an applicable stable error envelope; raw provider errors never surface |

## 6. UX Acceptance Additions

- Execute keyboard/focus/error-summary tests for internal Web screens and screen-reader semantics for async status.
- Verify Flutter dynamic text to 200%, safe area, keyboard and persistent critical result.
- Simulate offline/timeout/retry and confirm same-intent idempotency versus new intent.
- Verify duplicate/replay shows existing result without a second mutation.
- Verify branch/timezone/session/financial consequences remain visible in confirmations.
- Inspect analytics/log payloads for phone, email, proof URL, token, OTP and unrestricted PII.
- Map every priority screen state to error code, recovery action and test in the screen-level handoff.

## 7. Contract Validation Checklist

- OpenAPI parses; all refs resolve; operation IDs are unique.
- Every affected command defines auth/MFA/branch scope, idempotency where required, error responses and correlation behavior.
- Generated TS/Dart clients compile against the approved checksum.
- Schema constraints/invariants match AC and concurrency tests.
- Event/audit fields exclude secrets/unsafe PII and are versioned/idempotent.
- No CTG item is silently treated as approved; story remains BLOCKED until remediation evidence and Gate 4 approval exist.

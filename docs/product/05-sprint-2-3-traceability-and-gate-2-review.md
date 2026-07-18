# Sprint 2–3 Traceability and Gate 2 Review Workbook

**Status:** DRAFT / BLOCKED  
**Baseline:** [Detailed Story Specification](04-sprint-2-3-detailed-story-specification.md)  
**Gate record:** [G2-REV-001](../templates/gate-2-signed-review-record.md)

## 1. Exact AC Traceability

Every AC below maps to at least one UX/API/data/error/event/test/UAT path. Contract references remain proposed until Gate 4.

| BR/NFR | Story / AC | UX screen | operationId | Schema/invariant | Error/event/audit | TC | UAT |
|---|---|---|---|---|---|---|---|
| BR-001,004; NFR-001,007 | US-ID-01 / AC-US-ID-01-01 | SCR-UX01-01/02 | `authenticateGoogle`, `verifyOtp`, `getMe` | Session; verified identity uniqueness | login security audit | TC-AUTH-S23-001/002 | UAT-AUTH-01 |
| BR-001; NFR-007 | US-ID-01 / AC-US-ID-01-02 | SCR-UX01-02 | `verifyOtp` | OTP single-use/expiry | rate/expired/replay; abuse metric | TC-AUTH-S23-002 | UAT-AUTH-01 |
| BR-004; NFR-001,007 | US-ID-01 / AC-US-ID-01-03 | SCR-UX01-06 | `refreshSession`, `revokeAllSessions` | rotating session family | unauthorized/revoked; revoke audit | TC-AUTH-S23-006/008 | UAT-AUTH-01 |
| BR-001,004; NFR-007 | US-ID-01 / AC-US-ID-01-04 | SCR-UX01-04/05 | `requestAccountRecovery`, `verifyAccountRecovery`, `linkVerifiedIdentity` | verified link boundary | IDENTITY_CONFLICT; recovery/link audit | TC-AUTH-S23-003 | UAT-AUTH-01 |
| BR-002–005; NFR-001 | US-ID-02 / AC-US-ID-02-01 | SCR-UX11-01 | `inviteUser`, `listUsers` | User verified identity unique | IDENTITY_CONFLICT; invite audit | TC-AUTH-S23-004 | UAT-AUTH-02 |
| BR-003–005; NFR-007 | US-ID-02 / AC-US-ID-02-02 | SCR-UX01-03 | `createMfaChallenge`, `verifyMfaChallenge` | MfaChallenge one-use/expiry | MFA_CHALLENGE_REQUIRED/EXPIRED | TC-AUTH-S23-005 | UAT-AUTH-02 |
| BR-003–005; NFR-001 | US-ID-02 / AC-US-ID-02-03 | SCR-UX11-01 | `listUsers`, `inviteUser`, `deactivateUser` | backend branch/capability scope | FORBIDDEN/hidden resource; admin audit | TC-AUTH-S23-007 | UAT-AUTH-02 |
| BR-004; NFR-007 | US-ID-02 / AC-US-ID-02-04 | SCR-UX11-01, SCR-UX01-06 | `deactivateUser`, `revokeAllSessions` | User active/session revocation | unauthorized/revoked; before/after audit | TC-AUTH-S23-006/008 | UAT-AUTH-02 |
| BR-005,030–031; NFR-001 | US-MST-02 / AC-US-MST-02-01 | SCR-UX11-02 | `createAssignment`, `listAssignments` | AssignmentCommand; effective interval | assignment-created audit | TC-MST-S23-001 | UAT-MST-02 |
| BR-005,030–031 | US-MST-02 / AC-US-MST-02-02 | SCR-UX11-02 | `createAssignment`, `endAssignment` | non-overlap/date constraint | EFFECTIVE_PERIOD_OVERLAP/validation | TC-MST-S23-001/002 | UAT-MST-02 |
| BR-005; NFR-001 | US-MST-02 / AC-US-MST-02-03 | SCR-UX11-02 | `endAssignment`, `getMe` | EndAssignmentCommand/boundary | forbidden after boundary; end audit | TC-MST-S23-002 | UAT-MST-02 |
| BR-005; NFR-002 | US-MST-02 / AC-US-MST-02-04 | SCR-UX11-02 | `createAssignment`, `endAssignment` | unique/non-overlap transaction | conflict; single audit effect | TC-CONTRACT-S23-004 | UAT-MST-02 |
| BR-004,032,061–062; NFR-001 | US-MST-01 / AC-US-MST-01-01 | SCR-UX11-03..06 | create branch/fee/rate/quota operations | discriminated command + EffectivePeriod | effective-change audit | TC-MST-S23-003 | UAT-MST-01 |
| BR-032,061–062 | US-MST-01 / AC-US-MST-01-02 | SCR-UX11-04..06 | create fee/rate/quota operations | units; capacity ≥ quota ≥1 | validation/configuration error | TC-MST-S23-004 | UAT-MST-01 |
| BR-032,061–062; NFR-002 | US-MST-01 / AC-US-MST-01-03 | SCR-UX11-04..06 | create fee/rate/quota operations | effective key non-overlap | EFFECTIVE_PERIOD_OVERLAP/conflict | TC-MST-S23-003/005 | UAT-MST-01 |
| BR-061–062; NFR-007 | US-MST-01 / AC-US-MST-01-04 | SCR-UX11-04..06 | list/create effective settings | non-retroactive snapshots | configuration audit | TC-MST-S23-005 | UAT-MST-01 |
| BR-010–012; NFR-001,007 | US-PKG-01 / AC-US-PKG-01-01 | SCR-UX02-01/02 | `listPackages`, `createPaymentProofUpload`, `finalizePaymentProofUpload`, `getPaymentProofStatus` | Package/PaymentProof private scan lifecycle | scan status/upload audit | TC-PKG-S23-001 | UAT-PKG-01 |
| BR-011–012; NFR-007 | US-PKG-01 / AC-US-PKG-01-02 | SCR-UX02-02 | proof finalize/status + `submitPurchase` | proof CLEAN gate | PAYMENT_PROOF_NOT_CLEAN/UNSAFE | TC-PKG-S23-002 | UAT-PKG-01 |
| BR-010–012; NFR-002 | US-PKG-01 / AC-US-PKG-01-03 | SCR-UX02-03/04 | `submitPurchase`, `listPurchases` | Purchase snapshots/idempotency | `purchase.submitted.v1`; submit audit | TC-PKG-S23-003/006 | UAT-PKG-01 |
| BR-012; NFR-002 | US-PKG-01 / AC-US-PKG-01-04 | SCR-UX02-03 | `submitPurchase` | IdempotencyRecord request hash | IDEMPOTENCY_KEY_REUSED | TC-PKG-S23-003 | UAT-PKG-01 |
| BR-012–016; NFR-001,002 | US-PKG-02 / AC-US-PKG-02-01 | SCR-UX02-05 | `authorizePaymentProofDownload`, `approvePurchase` | ApprovalResult; one package/PURCHASE/outbox | `purchase.approved.v1`; approval audit | TC-PKG-S23-004 | UAT-PKG-02 |
| BR-012–016; NFR-002 | US-PKG-02 / AC-US-PKG-02-02 | SCR-UX02-05 | `approvePurchase` | unique purchase decision/ledger/outbox | PURCHASE_ALREADY_DECIDED | TC-PKG-S23-005 | UAT-PKG-02 |
| BR-012–016; NFR-001,007 | US-PKG-02 / AC-US-PKG-02-03 | SCR-UX02-05 | proof download + approve/reject | branch/MFA/config/scan gate | FORBIDDEN/CONFIGURATION_MISSING | TC-PKG-S23-007 | UAT-PKG-02 |
| BR-012–014 | US-PKG-02 / AC-US-PKG-02-04 | SCR-UX02-05/04 | `rejectPurchase`, `listPurchases` | rejected Purchase; no ledger/package | `purchase.rejected.v1`; rejection audit | TC-PKG-S23-005 | UAT-PKG-02 |
| BR-015,021–025; NFR-001 | US-LED-01 / AC-US-LED-01-01 | SCR-UX02-04, SCR-UX03-02 | `listCustomerPackages`, `getPackageLedger` | CustomerPackageBalance invariant | no mutation; read policy | TC-LED-S23-001 | UAT-LED-01 |
| BR-074; NFR-001,007 | US-LED-01 / AC-US-LED-01-02 | same | balance/ledger queries | branch/customer scope | FORBIDDEN/RESOURCE_NOT_FOUND | TC-LED-S23-002 | UAT-LED-01 |
| BR-015,021–025; NFR-002 | US-LED-01 / AC-US-LED-01-03 | SCR-UX09-03 | balance/ledger queries | transactional read/no negative state | conflict/service unavailable | TC-LED-S23-003 | UAT-LED-01 |
| BR-015; NFR-002,007 | US-LED-01 / AC-US-LED-01-04 | SCR-UX09-03 | `getPackageLedger` | append-only/MIGRATION_OPENING reconciliation | LEDGER_INVARIANT_VIOLATION | TC-LED-S23-006 | UAT-LED-01 |
| BR-052–054; NFR-001,002 | US-LED-02 / AC-US-LED-02-01 | SCR-UX09-01 | `requestSessionAdjustment` | SessionAdjustment PENDING; no ledger post | `session.adjustment_requested.v1`; audit | TC-LED-S23-004 | UAT-RES-02 |
| BR-052–054; NFR-001,007 | US-LED-02 / AC-US-LED-02-02 | SCR-UX09-02 | `decideSessionAdjustment` | requester ≠ approver | SEPARATION_OF_DUTIES_VIOLATION | TC-RES-005..010 | UAT-RES-02 |
| BR-052–054; NFR-002 | US-LED-02 / AC-US-LED-02-03 | SCR-UX09-02/03 | decide adjustment + `getPackageLedger` | AdjustmentDecisionResult; one referenced post | approved/posted v1; decision audit | TC-LED-S23-005 | UAT-RES-02 |
| BR-052–054; NFR-002 | US-LED-02 / AC-US-LED-02-04 | SCR-UX09-02 | `decideSessionAdjustment` | state lock/idempotency/unique ledger ref | already-decided/idempotency conflict | TC-CONTRACT-S23-009 | UAT-RES-02 |

Operation groups written descriptively above (for example “create fee/rate/quota operations”) resolve to the exact operation IDs listed in the detailed story section and must be expanded in the issue import; this workbook does not add an API operation.

## 2. Requirement Gap Register

| Gap | Affected story/gate | Accountable | Due trigger | Closure evidence | Status |
|---|---|---|---|---|---|
| REQ-GAP-S23-001 DEC-012 session/MFA values and approval absent | ID-01/02; G2/G4 | TL | Before Sprint 2 planning | Signed DEC-012 linked to ADR/contract/tests | TBD-BLOCKING |
| REQ-GAP-S23-002 DEC-014 recovery verification/SLA absent | ID-01; G2/G4 | PO+TL | Before Sprint 2 planning | Signed DEC-014 with security/support review | TBD-BLOCKING |
| REQ-GAP-S23-003 DEC-004 package records absent | PKG-01/02; G2 | PO | Before Sprint 3 planning | Approved CFG-PKG record/source/effective date | TBD-BLOCKING |
| REQ-GAP-S23-004 DEC-005/006 quota/fee/rate records absent | MST-01, PKG-02; G2/G4 | PO+Finance | Before affected story READY | Approved kind-specific records | TBD-BLOCKING |
| REQ-GAP-S23-005 Figma nodes/prototypes absent | All eight; G3 | PO | Before UI story READY | Exact approved Figma nodes/version | TBD-BLOCKING |
| REQ-GAP-S23-006 CTG/client/QA review and generated-client evidence absent | All eight; G4 | TL | Before APR-004 | Closed CTG workbook and G4 signatures | TBD-BLOCKING |
| REQ-GAP-S23-007 Named assignees/reviewers and environment absent | All eight; G1/G5 | PO/TL | Before Sprint 0/review/build | PIC/access/environment readiness evidence | TBD-BLOCKING |
| REQ-GAP-S23-008 Migration identity/purchase/assignment source policies incomplete | ID-01/02, MST-02, PKG-01/02, LED-01 | Data Owner | Before migration rehearsal/story sign-off | Approved mapping/source/reconciliation evidence | TBD-BLOCKING |

## 3. Gate 2 Review Agenda

| Order | Reviewer | Required review and output | Blocking rule |
|---:|---|---|---|
| 1 | PM/BA | Freeze exact version; verify actor, flow, BR/AC, decisions, dependency and scope | Missing/ambiguous scope or AC is BLOCKING |
| 2 | TL | Verify feasibility, operation/schema/invariant, authorization, transaction and failure semantics | Contract/invariant/security gap is BLOCKING |
| 3 | Designer | Verify every UI AC maps to screen/state/transition and no flow redefinition is needed | Missing Figma/state mapping is BLOCKING |
| 4 | QA | Verify deterministic Given/When/Then, errors, concurrency, negative cases, TC/UAT/data evidence | Missing executable test mapping is BLOCKING |
| 5 | Finance/Data Owner | Review package/rate/ledger snapshots, effective dates, migration/reconciliation sources | Missing business/source evidence is BLOCKING |
| 6 | PO | Resolve comments/decisions and sign exact baseline | Unresolved decision/configuration is BLOCKING |

## 4. Per-Story Reviewer Worksheet

Create one row per reviewer comment. A story result can be `PASS`, `PASS-WITH-ACTION`, or `BLOCKING`; scope/configuration, authorization, ledger invariant, missing AC/test, unresolved DEC and missing Figma cannot be `PASS-WITH-ACTION`.

| Comment ID | Story/AC | Reviewer | Severity | Comment | Disposition | Owner/due | Resolution evidence | Result/status |
|---|---|---|---:|---|---|---|---|---|
| G2-S23-CMT-001 | TBD | TBD | TBD | TBD | ACCEPT / REJECT-WITH-RATIONALE / CR / DEFER-NONBLOCKING | TBD | TBD | OPEN |

Review order and signatures are finalized in `G2-REV-001`. APR-002 and Gate 2 remain `OPEN/BLOCKED` until exact version, all mandatory reviews, closed blocking comments and PO approval are recorded.

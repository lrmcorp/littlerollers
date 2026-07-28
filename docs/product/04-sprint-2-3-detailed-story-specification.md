# Sprint 2–3 Detailed Story Specification

**Status:** DRAFT / BLOCKED  
**Scope:** exactly eight stories scheduled for Sprint 2–3  
**Owners:** PM/BA responsible; PO accountable; TL/Designer/QA/Finance review by area  
**Contract proposal:** OpenAPI `0.4.0-draft`; exact checksum is recorded in the contract manifest; approval remains pending

This document refines requirements without approving decisions, Figma or technical contracts. `TBD-BLOCKING` values are never production defaults.

## 1. US-ID-01 — Customer Login and Safe Recovery

| Contract | Specification |
|---|---|
| Actor/permission | Customer or eligible customer identity; public authentication/recovery entry, then active authenticated customer scope |
| Objective/trigger | Establish a customer session through Google or WhatsApp OTP; recover/link only after approved verification |
| Preconditions | Active eligible identity; approved DEC-012/014; configured providers; no unresolved identity conflict |
| Main flow | Select method → authenticate/request+verify OTP → resolve one verified identity → issue channel-appropriate session → return scoped profile |
| Alternate/failure | Invalid/expired/replayed/rate-limited OTP; provider/offline failure; inactive/revoked user; identity conflict; recovery expiration; unverified linking denied |
| Postcondition | At most one intended user/customer identity; active session or generic failure; security audit/metric without OTP/token/PII leakage |
| BR/NFR/decisions | BR-001, BR-004; NFR-001, NFR-007; DEC-012 and DEC-014 `TBD-BLOCKING` |
| API/schema | `authenticateGoogle`, `requestOtp`, `verifyOtp`, `refreshSession`, `logout`, `revokeAllSessions`, `requestAccountRecovery`, `verifyAccountRecovery`, `linkVerifiedIdentity`, `getMe`; Session/MfaChallenge/recovery/link schemas |
| Data/invariant | User, Customer, ExternalIdentity and UserSession; verified identity unique; refresh family rotation/reuse rule; no automatic unverified link |
| Error/audit/notification | IDENTITY_CONFLICT, MFA_CHALLENGE_REQUIRED, MFA_CHALLENGE_EXPIRED, unauthorized/rate/expired/revoked; login/recovery/link/revoke security audit; recovery notification policy pending DEC-014 |
| Concurrency/idempotency | Concurrent verified identity resolution cannot create duplicates; refresh reuse revokes family; repeated recovery/link returns safe deterministic state |
| Migration/UX/tests | Source identity linking policy required; SCR-UX01-01..06; TC-AUTH-S23-001..003/005/006/008; UAT-AUTH-01 |
| Dependencies/status | CTG-001..003, Figma UX-01, provider/environment, G1/G2/G3/G4/G5, assigned roles; `BLOCKED` |

Flow: authentication entry → provider/OTP verification → identity resolution → session issue → profile. Recovery follows request → generic acknowledgement → verified proof → link/revoke sessions; failure never creates or links an identity.

- **AC-US-ID-01-01:** Given one verified eligible active identity, when Google or valid OTP authentication succeeds, then exactly one channel-appropriate session is issued, the scoped profile is returned, and the security event contains no credential/token material.
- **AC-US-ID-01-02:** Given invalid, expired, replayed or rate-limited OTP, when verification is attempted, then no session or identity mutation occurs, a generic stable error is returned, and only safe abuse telemetry increments.
- **AC-US-ID-01-03:** Given inactive/revoked user or refresh-token reuse, when refresh/protected access occurs, then access is denied, the affected session family is revoked per DEC-012, and no scoped resource existence leaks.
- **AC-US-ID-01-04:** Given a recovery match that is conflicting or not verified, when link is requested, then no automatic linking/session issuance occurs and only the approved DEC-014 support/verification path is offered and audited.

## 2. US-ID-02 — Internal Invitation, MFA and Deactivation

| Contract | Specification |
|---|---|
| Actor/permission | Super Owner or authorized security administrator with branch/role authority and required MFA; invited internal user |
| Objective/trigger | Invite internal identity, assign allowed roles, enforce MFA/assurance and deactivate access safely |
| Preconditions | Inviter active/authorized; verified work identity; valid role/branch assignment; DEC-012 approved |
| Main flow | List/invite user → verify identity → grant effective role/assignment → authenticate → MFA challenge for protected action → optionally deactivate and revoke |
| Alternate/failure | Duplicate/conflicting identity; invalid role/branch; missing/expired MFA; wrong branch; inactive inviter/target; concurrent duplicate invite/deactivation |
| Postcondition | One internal user identity, effective scoped capabilities, immutable admin/security audit; deactivated user cannot refresh/access |
| BR/NFR/decisions | BR-002–005; NFR-001, NFR-007; DEC-012 `TBD-BLOCKING` |
| API/schema | `listUsers`, `inviteUser`, `deactivateUser`, `createMfaChallenge`, `verifyMfaChallenge`, `getMe`, `revokeAllSessions`; User/Me/MfaChallenge/Resource schemas |
| Data/invariant | User, UserRole, UserMfa, UserSession, assignment references; effective role periods do not overlap forbidden scope |
| Error/audit/notification | IDENTITY_CONFLICT, MFA_CHALLENGE_REQUIRED/EXPIRED, FORBIDDEN, RESOURCE_NOT_FOUND; invite/role/MFA/deactivate/revoke audit; invitation channel policy pending |
| Concurrency/idempotency | Unique verified identity; duplicate invite/deactivate yields existing/consistent outcome; capability evaluated backend on every path |
| Migration/UX/tests | Internal-user source/invite treatment required; SCR-UX11-01 and SCR-UX01-03/06; TC-AUTH-S23-004..008; UAT-AUTH-02 |
| Dependencies/status | CTG-001/003, UX-11/01 Figma, DEC-012, identity provider/environment, G1–G5; `BLOCKED` |

- **AC-US-ID-02-01:** Given an authorized MFA-satisfied inviter and valid verified work identity, when invite is submitted, then one scoped internal user/invitation is created and duplicate submission cannot create a second identity.
- **AC-US-ID-02-02:** Given missing, expired or insufficient MFA assurance, when a protected identity/master action is attempted, then it is denied with a stable MFA error and no target mutation.
- **AC-US-ID-02-03:** Given a role or branch outside the inviter’s capability, when list/detail/invite/deactivate is attempted, then the request is denied/hidden consistently without counts, metadata or target existence leakage.
- **AC-US-ID-02-04:** Given an active internal user, when authorized deactivation commits, then protected access and refresh are rejected/revoked according to DEC-012 and one before/after audit is recorded.

## 3. US-MST-02 — Owner and Instructor Branch Assignment

| Contract | Specification |
|---|---|
| Actor/permission | MFA-satisfied Super Owner with assignment-management capability |
| Objective/trigger | Create or end effective-dated owner/instructor assignment to a branch |
| Preconditions | Active user and branch; assignment type valid; effective boundary supplied; identity foundation available |
| Main flow | List assignments → select user/type/branch/period → validate overlap/scope → create; or end existing assignment at approved boundary |
| Alternate/failure | Wrong scope, inactive resource, forbidden overlap, invalid date, stale/concurrent end, dependent future work warning |
| Postcondition | Exactly one valid effective assignment interval; capability/visibility follows approved boundary; before/after audit exists |
| BR/NFR/decisions | BR-005, BR-030–031; NFR-001/007; no explicit business DEC, boundary still requires TL/PO review |
| API/schema | `listAssignments`, `createAssignment`, `endAssignment`; AssignmentCommand, EndAssignmentCommand, Resource |
| Data/invariant | OwnerBranch/InstructorBranch or assignment entity; active-key non-overlap; branch timezone/effective-boundary semantics |
| Error/audit/notification | EFFECTIVE_PERIOD_OVERLAP, FORBIDDEN, RESOURCE_NOT_FOUND, conflict/validation; assignment create/end audit; notification only if approved policy requires |
| Concurrency/idempotency | Concurrent create/end cannot produce overlapping intervals or double end; stale version returns conflict |
| Migration/UX/tests | Source assignment mapping and stable external key required; SCR-UX11-02; TC-MST-S23-001/002; UAT-MST-02 |
| Dependencies/status | US-ID-02, CTG-004, UX-11 Figma, data/client review, G1–G5; `BLOCKED` |

- **AC-US-MST-02-01:** Given active user/branch and authorized actor, when a non-overlapping effective assignment is created, then exactly one interval is stored and scoped capability begins only at the approved boundary.
- **AC-US-MST-02-02:** Given an overlapping or invalid effective period, when create/end is requested, then the command fails deterministically without partial interval or capability changes.
- **AC-US-MST-02-03:** Given an assignment ending at a defined boundary, when access is evaluated before, at and after that boundary, then repository query and policy service produce the same reviewed result.
- **AC-US-MST-02-04:** Given two concurrent end/create commands, when both execute, then constraints prevent overlap/double end and the loser receives a stable conflict with no duplicate audit effect.

## 4. US-MST-01 — Branch, Class Type and Effective Master

| Contract | Specification |
|---|---|
| Actor/permission | MFA-satisfied Super Owner; Finance participates where fee/rate authority applies |
| Objective/trigger | Manage branch/class type and effective instructor-fee, projection-rate and quota/capacity settings |
| Preconditions | Active business keys; actor capability; DEC-005/006 approved values/effective periods |
| Main flow | List master/settings → create branch/class where allowed → submit kind-specific setting → validate discriminator/key/unit/period → persist effective version/audit |
| Alternate/failure | Missing configuration, invalid discriminator/value/date, capacity below quota, overlap, wrong scope, stale/concurrent version |
| Postcondition | New eligible transactions use correct version; historical snapshots remain unchanged; no overlapping key period |
| BR/NFR/decisions | BR-004, BR-032, BR-061–062; NFR-001/007; DEC-005/006 `TBD-BLOCKING` |
| API/schema | `listBranches`, `createBranch`, `listClassTypes`, `listInstructorFees`, `createInstructorFee`, `listProjectionRates`, `createProjectionRate`, `listQuotaCapacitySettings`, `createQuotaCapacitySetting`; discriminated commands/EffectivePeriod |
| Data/invariant | Branch/ClassType/effective settings; exact business key, integer Rupiah/rate unit, capacity ≥ quota ≥1, non-overlap, non-retroactive history |
| Error/audit/notification | CONFIGURATION_MISSING, EFFECTIVE_PERIOD_OVERLAP, validation/forbidden/conflict; before/after/effective audit; no notification unless policy requires |
| Concurrency/idempotency | Database exclusion/unique constraints prevent simultaneous overlapping versions; retry does not create duplicate effective record |
| Migration/UX/tests | Master/rate source mapping and evidence owner required; SCR-UX11-03..06; TC-MST-S23-003..005; UAT-MST-01 |
| Dependencies/status | CTG-005, DEC-005/006, Finance/PO evidence, UX-11 Figma, ID-02/MST-02, G1–G5; `BLOCKED` |

- **AC-US-MST-01-01:** Given an authorized MFA-satisfied actor and approved kind-specific configuration, when a non-overlapping version is created, then its discriminator, business key, unit and effective period are persisted and audited exactly once.
- **AC-US-MST-01-02:** Given capacity below quota, invalid amount/rate/date or mismatched discriminator, when submitted, then validation fails with no master/effective record mutation.
- **AC-US-MST-01-03:** Given an overlapping key/effective period including concurrent requests, when creation executes, then at most one succeeds and the other returns EFFECTIVE_PERIOD_OVERLAP/conflict.
- **AC-US-MST-01-04:** Given an effective master change, when historical and new transactions are queried, then historical snapshots remain unchanged and only eligible new transactions use the new version.

## 5. US-PKG-01 — Purchase Submission and Payment Proof

| Contract | Specification |
|---|---|
| Actor/permission | Authenticated Customer for own scope or authorized branch-scoped Admin-assisted purchase |
| Objective/trigger | Select active package, privately upload/scan proof and submit a pending purchase |
| Preconditions | Verified active identity; active approved package configuration; allowed file metadata; storage/scan adapter available |
| Main flow | List/select package → request signed upload → upload → finalize/check scan → submit purchase with CLEAN proof and idempotency key → show pending result |
| Alternate/failure | Inactive/stale/config-missing package; invalid/oversize/mismatch/unsafe/unscanned proof; wrong scope; offline/provider failure; replacement/retry |
| Postcondition | One pending purchase references private CLEAN proof and immutable commercial/source snapshot; no package/ledger created before approval |
| BR/NFR/decisions | BR-010–012; NFR-001/002/007; DEC-004 `TBD-BLOCKING` |
| API/schema | `listPackages`, `createPackage`, `createPaymentProofUpload`, `finalizePaymentProofUpload`, `getPaymentProofStatus`, `submitPurchase`, `listPurchases`, `replacePurchasePaymentProof`; Package/Purchase/PaymentProof |
| Data/invariant | Package, Purchase, PaymentProof, IdempotencyRecord; proof private/checksum/scan state; purchase branch/customer/source snapshots |
| Error/audit/notification | PAYMENT_PROOF_NOT_CLEAN/UNSAFE, CONFIGURATION_MISSING, validation/forbidden/conflict/503; upload access and submission audit; `purchase.submitted.v1`; transactional notification pending policy |
| Concurrency/idempotency | Same intent/key returns stored result; reused key/different request conflicts; proof can bind only to allowed lifecycle; no partial purchase on provider failure |
| Migration/UX/tests | Package/customer source mapping required; SCR-UX02-01..04; TC-PKG-S23-001..003/005/006; UAT-PKG-01 |
| Dependencies/status | US-ID-01, DEC-004, CTG-006/007/011/012, UX-02 Figma, storage/provider/environment, G1–G5; `BLOCKED` |

- **AC-US-PKG-01-01:** Given an approved active package and authorized actor, when a valid private proof is uploaded/finalized, then it remains inaccessible publicly and purchase submission is disabled until scan status is CLEAN.
- **AC-US-PKG-01-02:** Given mismatched, unsafe, unscanned or unauthorized proof, when finalize/download/submit is attempted, then the action is denied with stable error and no pending purchase is created.
- **AC-US-PKG-01-03:** Given CLEAN proof and valid package, when purchase is submitted with one idempotency intent, then exactly one PENDING purchase with immutable package/price/source snapshots and `purchase.submitted.v1` is committed.
- **AC-US-PKG-01-04:** Given timeout, retry or reused key with a different request, when resubmitted, then the same request returns the original result while the different request conflicts and neither creates a duplicate purchase/event.

## 6. US-PKG-02 — Purchase Approval or Rejection

| Contract | Specification |
|---|---|
| Actor/permission | MFA-satisfied branch-authorized Manager/Super Owner; requestor/customer cannot gain approval authority |
| Objective/trigger | Review CLEAN proof and commercial snapshot, then atomically approve or reject pending purchase |
| Preconditions | PENDING purchase, CLEAN proof, approver branch permission, approved DEC-004/006 configuration where snapshot calculation applies |
| Main flow | List/detail queue → authorize private proof download → review → confirm approve/reject with idempotency → return persistent decision result |
| Alternate/failure | Wrong branch hidden; proof not clean; missing config; stale/already decided; duplicate approval; MFA/SoD denial; transaction/dependency failure |
| Postcondition | Approval atomically creates CustomerPackage, one PURCHASE ledger entry, audit/outbox and snapshots; rejection creates no package/ledger |
| BR/NFR/decisions | BR-012–016; NFR-001/002/007; DEC-004/006 `TBD-BLOCKING` |
| API/schema | `listPurchases`, `authorizePaymentProofDownload`, `approvePurchase`, `rejectPurchase`; Purchase, ApprovalResult, CustomerPackageBalance, LedgerEntry |
| Data/invariant | Purchase/CustomerPackage/LedgerEntry/Outbox/Audit/IdempotencyRecord; one decision and one PURCHASE entry per approved purchase |
| Error/audit/notification | PURCHASE_ALREADY_DECIDED, IDEMPOTENCY_KEY_REUSED, CONFIGURATION_MISSING, PAYMENT_PROOF_NOT_CLEAN, MFA/forbidden/conflict; decision audit; purchase approved/rejected v1 and notification occurrence |
| Concurrency/idempotency | Row/state lock plus unique references; concurrent/retried decision returns one authoritative result; transaction rollback prevents partial package/ledger/outbox |
| Migration/UX/tests | Opening/current purchase boundary required; SCR-UX02-05/04; TC-PKG-S23-004/005/007 plus concurrency pack; UAT-PKG-02 |
| Dependencies/status | PKG-01, DEC-004/006, CTG-007/008/011/012, UX-02 Figma, Finance/client/QA review, G1–G5; `BLOCKED` |

- **AC-US-PKG-02-01:** Given PENDING purchase, CLEAN proof and authorized MFA-satisfied approver, when approval commits, then one CustomerPackage, one referenced PURCHASE ledger entry, immutable snapshots, audit and approved outbox event commit atomically.
- **AC-US-PKG-02-02:** Given concurrent/retried approval, when commands execute with the same intent, then one authoritative ApprovalResult is returned and no duplicate package, ledger, audit occurrence or outbox occurrence exists.
- **AC-US-PKG-02-03:** Given wrong branch, missing MFA, unclean proof or missing approved configuration, when decision/download is attempted, then access is denied/hidden or conflicts consistently and no decision-side mutation occurs.
- **AC-US-PKG-02-04:** Given PENDING purchase and authorized rejection, when reject commits with required reason, then status/event/audit update once and no CustomerPackage or PURCHASE ledger entry is created.

## 7. US-LED-01 — Balance and Ledger History

| Contract | Specification |
|---|---|
| Actor/permission | Customer own package or authorized branch-scoped internal role |
| Objective/trigger | View reconciliable total, reserved, available, expiry and append-only history |
| Preconditions | Valid visible customer package; policy service permits scope; ledger/reservation records consistent |
| Main flow | List scoped package balances → select package → retrieve paginated ledger/history and current reservation summary |
| Alternate/failure | Hidden/wrong branch, missing package, expired package, invariant mismatch, stale pagination, temporary dependency error |
| Postcondition | No data mutation; response reflects authoritative ledger/reservations and safe scoped visibility |
| BR/NFR/decisions | BR-015, BR-021–025, BR-074; NFR-001/002/007; no explicit business DEC |
| API/schema | `listCustomerPackages`, `getPackageLedger`; CustomerPackageBalance/Page, PackageLedgerResult, LedgerEntry |
| Data/invariant | Append-only ledger; active reservation separate; `available=max(total-active reservations,0)`, expired available zero; stable pagination |
| Error/audit/notification | LEDGER_INVARIANT_VIOLATION, forbidden/not-found/conflict/503; sensitive read/audit policy pending review; no notification |
| Concurrency/idempotency | Read snapshot must not expose negative/half-committed state during concurrent approval/reservation/adjustment; cursor stable by reviewed ordering |
| Migration/UX/tests | MIGRATION_OPENING mapping and reconciliation required; SCR-UX02-04, SCR-UX03-02, SCR-UX09-03; TC-LED-S23-001..003/006; UAT-LED-01 |
| Dependencies/status | PKG-02, CTG-009/011/012, Figma UX-02/03/09, pagination/read-audit review, G1–G5; `BLOCKED` |

- **AC-US-LED-01-01:** Given visible package with ledger and active reservations, when balance is requested, then total, reserved and available equal the reviewed invariant and expired package available is zero.
- **AC-US-LED-01-02:** Given a cross-branch or unauthorized package identifier, when list/detail is requested, then response is consistently scoped/hidden without balance, count, proof or customer metadata leakage.
- **AC-US-LED-01-03:** Given concurrent approval/reservation/adjustment commits, when balance/history is read, then it represents an authoritative transaction state and never exposes negative or partially posted values.
- **AC-US-LED-01-04:** Given an invariant mismatch or migration-opening discrepancy, when queried/reconciled, then a stable invariant signal/evidence is produced and the system does not silently clamp or rewrite append-only history.

## 8. US-LED-02 — Session Adjustment with Separation of Duties

| Contract | Specification |
|---|---|
| Actor/permission | Branch-scoped Admin requests; different authenticated Manager/Super Owner with `ledger:adjust:decide` approves/rejects; MFA is not used |
| Objective/trigger | Correct session balance through reviewed request and one referenced append-only adjustment |
| Preconditions | Visible active customer package; signed non-zero delta/reason; requester/approver capabilities; period/state permits posting |
| Main flow | View balance → request adjustment → list/review request → enforce SoD → approve/reject → show decision, ledger reference and resulting balance |
| Alternate/failure | Self-approval; wrong branch; invalid delta/package/period; duplicate pending; stale/already decided; concurrent decision; ledger invariant failure |
| Postcondition | Approval creates one referenced adjustment ledger entry/audit/events; rejection creates no ledger entry; immutable request/decision remains visible |
| BR/NFR/decisions | BR-052–054; NFR-001/002/007; policy baseline subject to Gate 2 approval |
| API/schema | `requestSessionAdjustment`, `listSessionAdjustments`, `decideSessionAdjustment`, `getPackageLedger`; SessionAdjustment, AdjustmentDecisionResult, LedgerEntry |
| Data/invariant | SessionAdjustRequest/Ledger/Audit/Outbox/IdempotencyRecord; requester ≠ approver; one decision and at most one referenced post |
| Error/audit/notification | SEPARATION_OF_DUTIES_VIOLATION, LEDGER_INVARIANT_VIOLATION, already-decided/idempotency/forbidden/locked/validation; requested/approved/rejected/posted v1 events and before/after audit |
| Concurrency/idempotency | State lock/unique reference prevents duplicate decision/post; same intent returns stored result; failed transaction leaves request/ledger consistent |
| Migration/UX/tests | No special opening record beyond package reference; SCR-UX09-01..03; TC-LED-S23-004..006 and TC-RES-005..010; UAT-RES-02 |
| Dependencies/status | LED-01, ID-02/RBAC, CTG-008/010/011/012, UX-09 Figma, Finance/QA review, G1–G5; `BLOCKED` |

- **AC-US-LED-02-01:** Given authorized Admin, valid package, non-zero delta and reason, when request is submitted idempotently, then one PENDING adjustment request and requested audit/event are created without changing ledger balance.
- **AC-US-LED-02-02:** Given requester equals approver or approver lacks branch/decision capability, when decision is attempted, then SEPARATION_OF_DUTIES_VIOLATION/forbidden is returned, a safe denied-action audit is recorded for self-approval, and request/ledger remain unchanged.
- **AC-US-LED-02-03:** Given valid PENDING request and different authorized approver, when approval commits, then one referenced append-only adjustment, decision/audit/outbox and resulting balance commit atomically.
- **AC-US-LED-02-04:** Given concurrent/retried or stale decisions, when processed, then at most one decision/post succeeds, duplicate intent returns the authoritative result, and conflicting intent cannot create a second ledger entry.

## 9. Common Readiness Boundary

All eight stories remain `BLOCKED` until assigned reviewers close [Gate 2 review](../templates/gate-2-signed-review-record.md), applicable decisions are signed, Figma flow is approved, CTG review and Gate 4 pass, Gate 1/5 pass, assignee/reviewer and environment exist. Detailed draft completeness alone never authorizes coding.

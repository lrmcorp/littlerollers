# Remaining MVP Traceability, Readiness and Review Workbook

**Status:** DRAFT / BLOCKED  
**Requirement source:** [Remaining MVP Detailed Story Specification](06-remaining-mvp-detailed-story-specification.md)  
**Review record:** [G2-REV-001](../templates/gate-2-signed-review-record.md)

## 1. AC-level Traceability

`GAP-n` refers to `REQ-GAP-MVP-00n` in section 2. Proposed gaps are not operation IDs.

OpenAPI `0.4.0-draft` provides proposed remediation mappings: GAP-1→`runQuotaEvaluation`/QuotaEvaluationResult; GAP-2→token/link issue/status/revoke and CheckInToken(Status); GAP-3→`completeClassSlot`/CompletionResult; GAP-4→audit export create/status/download and AuditExport; GAP-5→`retryOperationalJob`/`deadLetterOperationalJob`/OperationalJobResult; GAP-6→explicit migration upload/validate/apply/reconcile/rollback and MigrationBatchResult; GAP-7→explicit MVP results/pages. The `GAP-n` marker remains because these contracts are unapproved.

| BR/NFR | Story/AC | UX | operationId or gap | Schema/invariant | Error/event/audit | TC | UAT |
|---|---|---|---|---|---|---|---|
| BR-030; NFR-001 | CLS-01/AC-US-CLS-01-01 | UX-06 | `createAvailability` | TimeRange/non-overlap | create audit | TC-CLS-001 | UAT-CLS-01 |
| BR-030; NFR-002 | CLS-01/AC-US-CLS-01-02 | UX-06 | `createAvailability` | valid range | validation/conflict | TC-CLS-002 | UAT-CLS-01 |
| BR-030; NFR-001 | CLS-01/AC-US-CLS-01-03 | UX-06 | `listAvailabilities` | assignment scope | forbidden/hidden | TC-CLS-003 | UAT-CLS-01 |
| BR-030; NFR-002 | CLS-01/AC-US-CLS-01-04 | UX-06 | `createAvailability` | overlap constraint | conflict/single audit | TC-CLS-004 | UAT-CLS-01 |
| BR-031–033 | CLS-02/AC-US-CLS-02-01 | UX-07 | `createClassSlot`, `transitionClassSlot` | ClassSlot state/snapshot | `class.published.v1`/audit | TC-CLS-005..007 | UAT-CLS-02 |
| BR-031–033; NFR-002 | CLS-02/AC-US-CLS-02-02 | UX-07 | same | transition invariant | validation/conflict | TC-CLS-008 | UAT-CLS-02 |
| BR-032–033 | CLS-02/AC-US-CLS-02-03 | UX-07 | `transitionClassSlot` | cancel+reservation release | `class.manual_cancelled.v1`/audit | TC-CLS-009..011 | UAT-CLS-02 |
| BR-031–033; NFR-002 | CLS-02/AC-US-CLS-02-04 | UX-07 | `transitionClassSlot` | state lock/idempotency | conflict/single event | TC-CLS-012 | UAT-CLS-02 |
| BR-032–036; NFR-006 | CLS-03/AC-US-CLS-03-01 | UX-07 | GAP-1; `listJobs` | due job/slot lock | `class.confirmed.v1` | TC-CLASS-001 | UAT-CLASS-01 |
| BR-032–036 | CLS-03/AC-US-CLS-03-02 | UX-07 | GAP-1 | quota snapshot/release | `class.auto_cancelled.v1` | TC-CLASS-002 | UAT-CLASS-01 |
| BR-034–036; NFR-002 | CLS-03/AC-US-CLS-03-03 | UX-07 | GAP-1 | unique evaluation key | single transition/audit | TC-CLASS-003/004 | UAT-CLASS-01 |
| BR-032–036; NFR-006 | CLS-03/AC-US-CLS-03-04 | UX-07 | GAP-1; `listJobs` | retryable job | config/service error | TC-CLASS-005 | UAT-CLASS-01 |
| BR-020–025 | BKG-01/AC-US-BKG-01-01 | UX-03 | `createBooking` | Booking+Reservation atomic | `booking.created.v1`/audit | TC-BOOK-001/002 | UAT-BOOK-01 |
| BR-021–025; NFR-002 | BKG-01/AC-US-BKG-01-02 | UX-03 | `createBooking` | seat/session locks | conflict/no negative | TC-BOOK-003/004 | UAT-BOOK-01 |
| BR-020–025; NFR-001 | BKG-01/AC-US-BKG-01-03 | UX-03 | `createBooking` | eligibility/scope | validation/forbidden/conflict | TC-BOOK-005..008 | UAT-BOOK-01 |
| BR-020–025; NFR-002 | BKG-01/AC-US-BKG-01-04 | UX-03 | `createBooking` | idempotency request hash | reused-key conflict | TC-BOOK-009/010 | UAT-BOOK-01 |
| BR-050–054 | BKG-02/AC-US-BKG-02-01..06 | UX-04 Web customer/admin | `getCustomerRescheduleOptions`, `requestReschedule`, `decideReschedule` | active-customer-slot unique guard; old release/new reserve atomic | request/approved/rejected events; request/decision audit | TC-RES-001..008 | UAT-RES-01 |
| BR-050–054 | BKG-02/AC-US-BKG-02-02 | UX-04 | same | cutoff entitlement | validation/consequence | TC-RES-002 | UAT-RES-01 |
| BR-050–054; NFR-002 | BKG-02/AC-US-BKG-02-03 | UX-04 | `decideReschedule` | target revalidation | conflict/no partial | TC-RES-003 | UAT-RES-01 |
| BR-050–054; NFR-002 | BKG-02/AC-US-BKG-02-04 | UX-04 | `decideReschedule` | one decision/idempotency | conflict/single notification | TC-RES-004 | UAT-RES-01 |
| BR-040–041 | ATT-01/AC-US-ATT-01-01 | UX-06 | GAP-2; `instructorCheckIn` | JTI/check-in/hour unique | `check_in.instructor.v1` | TC-ATT-001 | UAT-ATT-01 |
| BR-040–041; NFR-001 | ATT-01/AC-US-ATT-01-02 | UX-06 | `instructorCheckIn` | actor/slot/window | expired/forbidden | TC-ATT-002/003 | UAT-ATT-01 |
| BR-040–041; NFR-002 | ATT-01/AC-US-ATT-01-03 | UX-06 | `instructorCheckIn` | JTI/idempotency | replay/single effect | TC-ATT-004/005 | UAT-ATT-01 |
| BR-040–041; NFR-006 | ATT-01/AC-US-ATT-01-04 | UX-06 | `instructorCheckIn` | transaction atomic | service/no partial | TC-ATT-006 | UAT-ATT-01 |
| BR-042–043 | ATT-02/AC-US-ATT-02-01 | UX-05 | GAP-2; `customerCheckIn` | booking/JTI attendance | `check_in.customer.v1` | TC-ATT-007/008 | UAT-ATT-02 |
| BR-042–043; NFR-001 | ATT-02/AC-US-ATT-02-02 | UX-05 | `customerCheckIn` | identity/window/scope | expired/forbidden/replay | TC-ATT-009/010 | UAT-ATT-02 |
| BR-042–043 | ATT-02/AC-US-ATT-02-03 | UX-08 | `backfillCustomerCheckIn` | H+2/reason/audit | conflict/locked | TC-ATT-011/012 | UAT-ATT-02 |
| BR-042–043; NFR-002 | ATT-02/AC-US-ATT-02-04 | UX-05/08 | customer/backfill operations | unique booking attendance | single effect | TC-ATT-013 | UAT-ATT-02 |
| BR-044–045 | ATT-03/AC-US-ATT-03-01 | UX-07 | `transitionClassSlot`; GAP-3 | completion transaction | `class.completed.v1`/audit | TC-ATT-014..016 | UAT-ATT-03 |
| BR-044–045 | ATT-03/AC-US-ATT-03-02 | UX-07 | same | no-show policy | no unauthorized debit | TC-ATT-017 | UAT-ATT-03 |
| BR-044–045; NFR-002 | ATT-03/AC-US-ATT-03-03 | UX-07 | same | unique completion/effect refs | single event/result | TC-ATT-018/019 | UAT-ATT-03 |
| BR-044–045; NFR-002 | ATT-03/AC-US-ATT-03-04 | UX-07 | same | ledger/period atomicity | invariant/locked rollback | TC-ATT-020 | UAT-ATT-03 |
| BR-070–072; NFR-002 | NOT-01/AC-US-NOT-01-01 | notification flow | `listNotifications` | deterministic occurrence | source event/attempt audit | TC-NOTIF-001 | UAT-NOTIF-01 |
| BR-070–072; NFR-007 | NOT-01/AC-US-NOT-01-02 | notification flow | `receiveMetaWebhook` | webhook idempotency/order | provider status normalized | TC-NOTIF-003/004 | UAT-NOTIF-01 |
| BR-070–072; NFR-006 | NOT-01/AC-US-NOT-01-03 | notification/ops | `listNotifications` | retry budget/dead-letter | terminal alert/fallback | TC-NOTIF-002/005/006 | UAT-NOTIF-01 |
| BR-070–072 | NOT-01/AC-US-NOT-01-04 | notification/ops | `retryNotification` | same occurrence/new attempt | reason audit | TC-NOTIF-007/008 | UAT-NOTIF-01 |
| BR-060–064 | FIN-01/AC-US-FIN-01-01 | UX-10 | `getFinancialReport` | formula/snapshot/control | report control evidence | TC-FIN-001..003 | UAT-FIN-01 |
| BR-060–064; NFR-001 | FIN-01/AC-US-FIN-01-02 | UX-10 | `getFinancialReport` | branch/data scope | forbidden/hidden/read audit | TC-FIN-004 | UAT-FIN-01 |
| BR-061–064; NFR-002 | FIN-01/AC-US-FIN-01-03 | UX-10 | `getFinancialReport` | effective config/invariant | configuration/invariant error | TC-FIN-005/006 | UAT-FIN-01 |
| BR-060–064; NFR-002 | FIN-01/AC-US-FIN-01-04 | UX-10 | `getFinancialReport` | cutoff/snapshot consistency | version evidence | TC-FIN-007/008 | UAT-FIN-01 |
| BR-063 | FIN-02/AC-US-FIN-02-01 | UX-10 | `createOtherCost` | OtherCost in OPEN period | create audit | TC-FIN-009 | UAT-FIN-02 |
| BR-063; NFR-001 | FIN-02/AC-US-FIN-02-02 | UX-10 | list/create OtherCost | branch-period lock | PERIOD_LOCKED/forbidden | TC-FIN-010 | UAT-FIN-02 |
| BR-063 | FIN-02/AC-US-FIN-02-03 | UX-10 | `createOtherCost` | amount/category/date | validation/no write | TC-FIN-011 | UAT-FIN-02 |
| BR-063; NFR-002 | FIN-02/AC-US-FIN-02-04 | UX-10 | `createOtherCost`, `closeMonth` | serialized period mutation | one cost or locked | TC-FIN-012 | UAT-FIN-02 |
| BR-065–067 | FIN-03/AC-US-FIN-03-01 | UX-10 | `closeMonth` | close snapshot/lock atomic | `period.closed.v1`/audit | TC-FIN-013..015 | UAT-FIN-03 |
| BR-065–067; NFR-002 | FIN-03/AC-US-FIN-03-02 | UX-10 | `closeMonth` | control hash/config | conflict/no partial | TC-FIN-016 | UAT-FIN-03 |
| BR-065–067; NFR-002 | FIN-03/AC-US-FIN-03-03 | UX-10 | `closeMonth`, mutation commands | branch-period serialization | PERIOD_LOCKED | TC-FIN-017/018 | UAT-FIN-03 |
| BR-065–067; NFR-002 | FIN-03/AC-US-FIN-03-04 | UX-10 | `closeMonth` | unique close/idempotency | already closed/single event | TC-FIN-019/020 | UAT-FIN-03 |
| BR-066–067 | FIN-04/AC-US-FIN-04-01 | UX-10 | `requestCorrection` | pending correction/reference | request audit | TC-FIN-021 | UAT-FIN-04 |
| BR-066–067; NFR-001 | FIN-04/AC-US-FIN-04-02 | UX-10 | `decideCorrection` | requester≠approver/scope | SoD/forbidden | TC-FIN-022/023 | UAT-FIN-04 |
| BR-066–067 | FIN-04/AC-US-FIN-04-03 | UX-10 | `decideCorrection` | current journal/old immutable | `correction.posted.v1` | TC-FIN-024 | UAT-FIN-04 |
| BR-066–067; NFR-002 | FIN-04/AC-US-FIN-04-04 | UX-10 | `decideCorrection` | one decision/journal/period lock | conflict/locked | TC-FIN-025/026 | UAT-FIN-04 |
| BR-073–075 | AUD-01/AC-US-AUD-01-01 | audit flow | `listAuditLogs` | immutable fields/cursor | masked read evidence | TC-AUD-001/002 | UAT-AUD-01 |
| BR-073–075; NFR-001 | AUD-01/AC-US-AUD-01-02 | audit flow | `listAuditLogs` | branch/object scope | forbidden/hidden | TC-AUD-003/004 | UAT-AUD-01 |
| BR-073–075; NFR-007 | AUD-01/AC-US-AUD-01-03 | audit flow | GAP-4 | private export/retention | export access audit | TC-AUD-005/006 | UAT-AUD-01 |
| BR-073–075; NFR-002 | AUD-01/AC-US-AUD-01-04 | audit flow | `listAuditLogs` | append-only/stable cursor | no application mutation | TC-AUD-007/008 | UAT-AUD-01 |
| BR-070–075; NFR-006 | OPS-01/AC-US-OPS-01-01 | operations flow | `getHealth`, `listJobs` | sanitized status | safe telemetry | TC-OPS-001/002 | UAT-OPS-01 |
| BR-073–075; NFR-001 | OPS-01/AC-US-OPS-01-02 | operations flow | health/jobs/notification lists | restricted scope | forbidden/no topology leak | TC-OPS-003/004 | UAT-OPS-01 |
| BR-070–072; NFR-002 | OPS-01/AC-US-OPS-01-03 | operations flow | `retryNotification`; GAP-5 | lease/idempotency | recovery reason audit | TC-OPS-005..007 | UAT-OPS-01 |
| BR-070–072; NFR-006 | OPS-01/AC-US-OPS-01-04 | operations flow | GAP-5; `listJobs` | dead-letter/retry bound | alert/escalation | TC-OPS-008/009 | UAT-OPS-01 |
| migration rules; NFR-007 | MIG-01/AC-US-MIG-01-01 | migration tool | GAP-6 | mapping/checksum validation | row rejection evidence | TC-MIG-001/002 | UAT-MIG-01 |
| migration rules; BR-015/073 | MIG-01/AC-US-MIG-01-02 | migration tool | GAP-6 | stable keys/MIGRATION_OPENING | batch/control audit | TC-MIG-003..005 | UAT-MIG-01 |
| migration rules; NFR-002 | MIG-01/AC-US-MIG-01-03 | migration tool | GAP-6 | batch/key idempotency | duplicate-safe result | TC-MIG-006/007 | UAT-MIG-01 |
| migration rules; NFR-006 | MIG-01/AC-US-MIG-01-04 | migration tool | GAP-6 | rollback/reconciliation gate | cutover blocked/evidence | TC-MIG-008..010 | UAT-MIG-01 |

## 2. Requirement and Contract Gap Register

| Gap | Affected story/gate | Accountable | Due trigger | Proposed remediation | Closure evidence | Status |
|---|---|---|---|---|---|---|
| REQ-GAP-MVP-001 H-24 job contract | CLS-03, OPS-01; G4 | TL | Before Sprint 7 planning | OpenAPI 0.3 command/result/error/event drafted | Approved schema/TC/client + G4 evidence | REMEDIATION DRAFTED — BLOCKED |
| REQ-GAP-MVP-002 QR/link lifecycle | ATT-01/02; G3/G4 | TL | Before Sprint 6 planning | Purpose-bound issue/status/revoke and UX states drafted | DEC-007 + threat/client/TC approval | REMEDIATION DRAFTED — BLOCKED |
| REQ-GAP-MVP-003 completion result | ATT-03; G4 | TL | Before Sprint 6 planning | CompletionResult with atomic references drafted | Transaction/schema/client/QA approval | REMEDIATION DRAFTED — PARTIAL |
| REQ-GAP-MVP-004 audit export | AUD-01; G3/G4 | TL+Privacy | Before Sprint 9 planning | Private request/status/download contract drafted | DEC-009 + security/client/TC approval | REMEDIATION DRAFTED — BLOCKED |
| REQ-GAP-MVP-005 ops recovery actions | OPS-01; G4/G5 | TL+Ops | Before Sprint 7/9 planning | Reasoned retry/dead-letter results drafted | Operations/threat/contract test approval | REMEDIATION DRAFTED — PARTIAL |
| REQ-GAP-MVP-006 migration lifecycle | MIG-01; G4/G5 | TL+Data Owner | Before rehearsal | Upload/batch/validate/apply/reconcile/rollback drafted | Mapping/security/client/TC-MIG approval | REMEDIATION DRAFTED — BLOCKED |
| REQ-GAP-MVP-007 explicit result migration | BKG-02, NOT, FIN, AUD; G4 | TL | Before affected build | Availability/class/booking/reschedule/check-in/notification/finance/audit/operations results drafted explicitly in OpenAPI 0.4 | Generated TypeScript/Dart clients, client/QA/Finance review and G4 sign-off | REMEDIATION DRAFTED — PARTIAL |
| REQ-GAP-MVP-008 Figma flows/screens absent | All 16; G3 | PO | Before applicable story READY | Screen handoff and approved nodes for follow-up queue | G3 exact node/version/signatures | TBD-BLOCKING |
| REQ-GAP-MVP-009 DEC-005/006/007/008/009/010/011/013 unresolved | Affected stories; G2–G5 | PO/TL/Finance by DEC | Before affected planning | Decision workshops and signed configuration/policy records | DEC/APR links | TBD-BLOCKING |
| REQ-GAP-MVP-010 staffing/environment/source evidence absent | All 16; G1/G5 | PO/TL | Before review/build/rehearsal | PIC, access, provider/account, source ownership evidence | Gate records | TBD-BLOCKING |

## 3. Readiness Matrix — 16 Stories

| Story | Requirement | Decision | UX | Technical | Test/UAT | Migration/owner | Dependency/sprint | Overall |
|---|---|---|---|---|---|---|---|---|
| CLS-01 | PARTIAL detailed draft | no explicit DEC | BLOCKED UX-06 | PARTIAL existing generic API | PARTIAL mapped | source policy/TL | MST-02/S4 | BLOCKED |
| CLS-02 | PARTIAL detailed draft | BLOCKED 005/008 | BLOCKED UX-07 | PARTIAL result/error detail | PARTIAL mapped | upcoming slot/Data | CLS-01/S4 | BLOCKED |
| CLS-03 | PARTIAL detailed draft | BLOCKED 005 | BLOCKED detailed UX-07/Figma absent | PARTIAL proposed GAP-1 contract | PARTIAL mapped | evaluation marker/TL | CLS-02/S7 | BLOCKED |
| BKG-01 | PARTIAL detailed draft | BLOCKED 005 | UX-03 text only/Figma blocked | PARTIAL generic result | PARTIAL mapped | upcoming booking/Data | CLS/LED/S5 | BLOCKED |
| BKG-02 | PARTIAL detailed draft | Gate 2 policy pending | BLOCKED UX-04 | PARTIAL generic result/schema | PARTIAL mapped | stable booking/Data | BKG-01/S5 | BLOCKED |
| ATT-01 | PARTIAL detailed draft | BLOCKED 007 | BLOCKED detailed UX-06/Figma absent | PARTIAL proposed GAP-2 contract | PARTIAL mapped | assignment/slot/Data | CLS/S6 | BLOCKED |
| ATT-02 | PARTIAL detailed draft | BLOCKED 007 | BLOCKED detailed UX-05/08/Figma absent | PARTIAL proposed GAP-2 contract | PARTIAL mapped | booking identity/Data | BKG/S6 | BLOCKED |
| ATT-03 | PARTIAL detailed draft | no explicit DEC | BLOCKED detailed UX-07/Figma absent | PARTIAL proposed GAP-3 contract | PARTIAL mapped | open class/Data | ATT/LED/S6 | BLOCKED |
| NOT-01 | PARTIAL detailed draft | BLOCKED 013 | BLOCKED notification flow | PARTIAL generic schemas | PARTIAL mapped | no production send/Ops | outbox/S7 | BLOCKED |
| FIN-01 | PARTIAL detailed draft | BLOCKED 006 | BLOCKED UX-10 | PARTIAL report schema/export | PARTIAL mapped | opening controls/Finance | ledger/hour/S8 | BLOCKED |
| FIN-02 | PARTIAL detailed draft | no explicit DEC | BLOCKED UX-10 | PARTIAL generic result | PARTIAL mapped | OtherCost/Data | period/S8 | BLOCKED |
| FIN-03 | PARTIAL detailed draft | BLOCKED 006 | BLOCKED UX-10 | PARTIAL CloseResult | PARTIAL mapped | reconciliation/Finance | FIN-01/02/S9 | BLOCKED |
| FIN-04 | PARTIAL detailed draft | no explicit DEC | BLOCKED UX-10 | PARTIAL decision result | PARTIAL mapped | stable refs/Finance | FIN-03/S9 | BLOCKED |
| AUD-01 | PARTIAL detailed draft | BLOCKED 009 | BLOCKED detailed audit flow/Figma absent | PARTIAL proposed GAP-4 contract | PARTIAL mapped | provenance/Privacy | auth/all/S9 | BLOCKED |
| OPS-01 | PARTIAL detailed draft | BLOCKED 011/013 | BLOCKED detailed ops flow/Figma absent | PARTIAL proposed GAP-5 contract | PARTIAL mapped | environment/Ops | queues/S7/9 | BLOCKED |
| MIG-01 | PARTIAL detailed draft | BLOCKED 010 | BLOCKED detailed migration flow/Figma absent | PARTIAL proposed GAP-6 contract | PARTIAL mapped | source/Data Owner | mappings/S10 | BLOCKED |

## 4. Gate 2 Review and Follow-up Queues

Review sequence for all 24 stories is PM/BA → TL → Designer → QA → Finance/Data/Operations/Privacy where applicable → PO. Comments use `G2-MVP-CMT-xxx`; unresolved scope, authorization, financial/ledger invariant, period lock, migration reconciliation, API/schema, AC/test, DEC or Figma is `BLOCKING`.

### UX handoff queue

The inventory is maintained in [Remaining MVP Screen-level Handoff Queue](../design/05-remaining-mvp-screen-handoff-queue.md) and detailed states/wireflows in [Remaining MVP Detailed Screen Handoff](../design/06-remaining-mvp-detailed-screen-handoff.md). Figma remains absent.

### Technical follow-up queue

Resolve GAP-1..6 first, then GAP-7 explicit results/schemas. Each remediation must add authorization/branch scope, correlation/error applicability, idempotency/transaction boundary, audit/event payload, generated TypeScript/Dart consumer and contract/security tests. No queue item changes OpenAPI until approved through G4/CR.

| Comment ID | Story/AC | Reviewer | Severity | Comment/disposition | Owner/due | Evidence | Status |
|---|---|---|---:|---|---|---|---|
| G2-MVP-CMT-001 | TBD | TBD | TBD | TBD | TBD | TBD | OPEN |

APR-002 and Gate 2 remain `OPEN/BLOCKED` until the exact 24-story baseline, mandatory reviews, closed blockers and PO approval are recorded.

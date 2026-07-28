# Remaining MVP Detailed Story Specification

**Status:** DRAFT / BLOCKED  
**Scope:** 16 MVP stories after Sprint 2–3 priority set  
**Contract proposal:** OpenAPI `0.4.0-draft`; exact checksum is recorded in the contract manifest; approval remains pending  
**Ownership:** PM/BA responsible; PO accountable; role reviewers remain TBD-BLOCKING

Every story below requires Gate 1/2/4/5, applicable Gate 3, decisions, assignees and environment before implementation. Proposed contract gaps are not active APIs.

## 1. US-CLS-01 — Instructor Availability

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Active Instructor submits branch-scoped availability after assignment |
| Preconditions/main flow | Effective assignment and timezone → list availability → submit time range → validate overlap/scope → persist |
| Alternate/postcondition | Invalid range, overlap, wrong branch, inactive assignment, concurrent duplicate; one effective availability interval or no mutation |
| BR/NFR/DEC | BR-030; NFR-001/002/007; no explicit DEC |
| API/schema/data | `listAvailabilities`, `createAvailability`; TimeRangeCommand/Resource; InstructorAvailability with timezone and non-overlap invariant |
| Error/event/audit/notification | validation/conflict/forbidden; create/change audit; no notification unless downstream assignment policy requires |
| Concurrency/migration | Constraint prevents overlapping concurrent intervals; source availability import policy remains migration gap |
| UX/test/dependency/status | UX-06, SCR-I-02; TC-CLS-001..004; UAT-CLS-01; MST-02, Figma/CTG review; BLOCKED |

- **AC-US-CLS-01-01:** Given an active effective assignment, when a valid non-overlapping range is submitted in branch timezone, then one availability interval is stored and audited.
- **AC-US-CLS-01-02:** Given an overlapping or invalid range, when submitted, then validation/conflict is returned and no interval is partially written.
- **AC-US-CLS-01-03:** Given missing/inactive or foreign-branch assignment, when list/create is attempted, then access is denied/hidden without schedule leakage.
- **AC-US-CLS-01-04:** Given concurrent overlapping submissions, when both execute, then at most one succeeds and retry cannot duplicate the interval/audit effect.

## 2. US-CLS-02 — Class Slot Lifecycle and Manual Cancellation

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Authorized Admin creates, assigns, publishes and manually cancels a branch class slot |
| Preconditions/main flow | Approved master/quota, valid instructor availability → create slot → assign → publish → optional reasoned cancel |
| Alternate/postcondition | Invalid timezone/master/assignment, overlap, stale state, cutoff/policy denial; valid state transition with snapshots/outbox or no mutation |
| BR/NFR/DEC | BR-031–033; NFR-001/002/007; DEC-005/008 TBD-BLOCKING |
| API/schema/data | `listClassSlots`, `createClassSlot`, `transitionClassSlot`; ClassSlotCommand/ActionCommand/Resource; ClassSlot state/snapshot/reservations/outbox |
| Error/event/audit/notification | validation/conflict/forbidden; `class.published.v1`, `class.manual_cancelled.v1`; reason/before-after audit and customer/instructor notification |
| Concurrency/migration | State lock/idempotency prevents duplicate publish/cancel; upcoming-slot migration mapping required |
| UX/test/dependency/status | UX-07, SCR-W-02; TC-CLS-005..012; UAT-CLS-02; DEC/Figma/explicit result review; BLOCKED |

- **AC-US-CLS-02-01:** Given valid master, availability and authorized Admin, when slot creation/assignment/publish commits, then reviewed state, capacity/quota snapshot, audit and one publish event are consistent.
- **AC-US-CLS-02-02:** Given invalid overlap, master, assignment, timezone or state, when transition is requested, then it fails without partial slot/event/notification writes.
- **AC-US-CLS-02-03:** Given an eligible slot and approved DEC-008 policy, when manual cancellation commits with reason, then state changes once, active reservations release atomically and one cancellation occurrence is emitted.
- **AC-US-CLS-02-04:** Given concurrent/retried publish or cancel, when commands execute, then only one valid transition wins and later/stale intent receives the authoritative result/conflict.

## 3. US-CLS-03 — H-24 Quota Evaluation

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Scheduler evaluates each published slot at branch-time H-24 exactly once |
| Preconditions/main flow | Approved quota snapshot and published slot → claim due job → lock/recount eligible bookings → confirm or auto-cancel → outbox/audit |
| Alternate/postcondition | Late/repeated/concurrent job, config missing, dependency failure; one terminal evaluation or retryable job without partial transition |
| BR/NFR/DEC | BR-032–036; NFR-002/006/007; DEC-005 TBD-BLOCKING |
| API/schema/data | `listJobs` and proposed `runQuotaEvaluation`/QuotaEvaluationResult (`REQ-GAP-MVP-001`); approval and generated-client evidence pending; ClassSlot/QuotaJob/reservation/outbox |
| Error/event/audit/notification | config/lock/conflict/service failure; `class.confirmed.v1` or `class.auto_cancelled.v1`; job correlation/audit and notification occurrence |
| Concurrency/migration | Unique slot+evaluation key and transaction lock; imported upcoming slot needs evaluation eligibility marker |
| UX/test/dependency/status | UX-07; TC-CLASS-001..005; UAT-CLASS-01; CLS-02/DEC/CTG/job environment; BLOCKED |

- **AC-US-CLS-03-01:** Given a published due slot with bookings meeting approved quota, when H-24 evaluation commits, then slot confirms once with one audit/outbox occurrence.
- **AC-US-CLS-03-02:** Given bookings below quota, when evaluation commits, then slot auto-cancels once, reservations release atomically and affected notifications derive from one occurrence.
- **AC-US-CLS-03-03:** Given concurrent/retried scheduler execution, when the same slot is claimed, then only one terminal transition/effect exists and all other attempts observe the result.
- **AC-US-CLS-03-04:** Given missing configuration or transient dependency failure, when evaluated, then no partial transition/release/event occurs and the job remains observable/retryable with safe telemetry.

## 4. US-BKG-01 — Concurrency-safe Booking

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Customer books own eligible package or authorized Admin assists within branch |
| Preconditions/main flow | Published/confirmed slot, active matching package, before H-2 → select slot/package → transactionally claim seat/session reservation → confirm result |
| Alternate/postcondition | Full/cutoff/mismatch/expired/duplicate/wrong scope/offline; one Booking+Reservation or no mutation |
| BR/NFR/DEC | BR-020–025; NFR-001/002/007; DEC-005 TBD-BLOCKING |
| API/schema/data | `listClassSlots`, `listCustomerPackages`, `listBookings`, `createBooking`; BookingCommand/Resource; Booking/Reservation/IdempotencyRecord |
| Error/event/audit/notification | validation/conflict/forbidden; `booking.created.v1`; booking audit and transactional notification |
| Concurrency/migration | Lock/constraints protect last seat/session and duplicate active booking; upcoming bookings mapping required |
| UX/test/dependency/status | UX-03, SCR-C-03/SCR-W-04; TC-BOOK-001..010; UAT-BOOK-01; PKG/LED/DEC/Figma; BLOCKED |

- **AC-US-BKG-01-01:** Given eligible slot/package and authorization, when booking commits before cutoff, then one Booking and active Reservation plus audit/event commit atomically.
- **AC-US-BKG-01-02:** Given last seat or session and concurrent commands, when both execute, then at most one succeeds and capacity/available never becomes negative.
- **AC-US-BKG-01-03:** Given cutoff, full slot, expired/mismatched package, duplicate booking or foreign scope, when requested, then stable denial/conflict occurs with no partial write or data leak.
- **AC-US-BKG-01-04:** Given retry/timeout with same intent, when resubmitted, then the authoritative result is returned; changed request with reused key conflicts without duplicate event.

## 5. US-BKG-02 — Reschedule Request and Decision

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Customer requests; authorized Admin/Super Owner reviews reschedule to eligible target |
| Preconditions/main flow | Active booking/target → request with consequence → review → approve/reject → atomically release old and reserve new when entitled |
| Alternate/postcondition | Target invalid/full, cutoff, stale booking, self/wrong scope, concurrent decision; one immutable request/decision and consistent reservations |
| BR/NFR/DEC | BR-050–054; NFR-001/002/007; policy baseline pending Gate 2 approval |
| API/schema/data | `listBookings`, `requestReschedule`, `decideReschedule`; RescheduleCommand/Resource; Reschedule/Booking/Reservation/IdempotencyRecord |
| Error/event/audit/notification | validation/conflict/forbidden; `booking.reschedule_requested.v1`, `booking.rescheduled.v1`, `booking.reschedule_rejected.v1`; request/decision audit; staff in-app request notification dan customer in-app/email decision notification |
| Concurrency/migration | Target revalidated under lock; one decision; old release/new claim atomic; migrated booking retains stable key |
| UX/test/dependency/status | UX-04, SCR-C-04/SCR-W-04; TC-RES-001..004; UAT-RES-01; BKG-01/Figma/explicit schemas gap; BLOCKED |

- **AC-US-BKG-02-01:** Given eligible request at or before approved entitlement boundary and valid target, when approval commits, then old release and new booking/reservation plus audit/event commit atomically.
- **AC-US-BKG-02-02:** Given request tepat H-24, request diterima; given request setelah boundary, UI/API menolak tanpa record/mutasi dan mengarahkan Customer menghubungi studio.
- **AC-US-BKG-02-03:** Given target becomes full/invalid or scope/state is stale, when decision executes, then no old reservation is lost and no partial target booking exists.
- **AC-US-BKG-02-04:** Given concurrent/retried decisions, when processed, then exactly one decision/effect exists and subsequent attempts return result/conflict without duplicate notification.
- **AC-US-BKG-02-05:** Given requester juga memiliki role approver, approval request miliknya sendiri ditolak; rejection/approval pihak lain tetap mengikuti scope dan audit.
- **AC-US-BKG-02-06:** Given Customer memperoleh booking aktif pada target saat request pending, approval ditolak dan reservation sumber tidak berubah.

## 6. US-ATT-01 — Instructor Check-in and Matched Hour

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Assigned Instructor checks in with purpose-bound QR/token within approved window |
| Preconditions/main flow | Confirmed assigned slot and DEC-007 boundaries → obtain/display token (contract gap) → submit → validate actor/slot/JTI/time → create check-in/hour |
| Alternate/postcondition | Early/late/expired/replay/wrong actor/branch/unassigned/offline; one check-in/hour or no mutation |
| BR/NFR/DEC | BR-040–041; NFR-001/002/007; DEC-007 TBD-BLOCKING |
| API/schema/data | `instructorCheckIn` plus proposed `issueInstructorCheckInToken`/CheckInToken (`REQ-GAP-MVP-002`); DEC-007 and approval pending; InstructorCheckIn/HourLog/token JTI |
| Error/event/audit/notification | expired/forbidden/conflict; `check_in.instructor.v1`; safe check-in audit, no raw token logging |
| Concurrency/migration | Unique slot+instructor/check-in/JTI; retry returns same outcome; imported assignment/slot must reconcile |
| UX/test/dependency/status | UX-06, SCR-I-03; TC-ATT-001..006; UAT-ATT-01; DEC/token CTG/Figma; BLOCKED |

- **AC-US-ATT-01-01:** Given assigned confirmed slot and valid purpose-bound token inside approved window, when submitted, then one instructor check-in and matched HourLog commit with audit/event.
- **AC-US-ATT-01-02:** Given wrong actor/slot/branch, expired or out-of-window token, when submitted, then no check-in/hour occurs and no schedule/identity data leaks.
- **AC-US-ATT-01-03:** Given token replay or concurrent submissions, when processed, then one effect maximum exists and later attempts return deterministic replay/result behavior.
- **AC-US-ATT-01-04:** Given offline/provider or transaction failure, when retry occurs, then no partial HourLog/check-in/event exists and safe correlation evidence supports recovery.

## 7. US-ATT-02 — Customer Check-in and Admin Backfill

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Booked Customer checks in through authenticated link; authorized Admin backfills with reason within H+2 policy |
| Preconditions/main flow | Active booking, confirmed slot, DEC-007 window → validate token/link or find booking → confirm/backfill → record attendance audit |
| Alternate/postcondition | Early/late/>H+2, wrong customer/slot/branch, no booking, replay, locked state; one attendance marker or no mutation |
| BR/NFR/DEC | BR-042–043; NFR-001/002/007; DEC-007 TBD-BLOCKING |
| API/schema/data | `customerCheckIn`, `backfillCustomerCheckIn`, `listBookings`, proposed `issueCustomerCheckInLink`; CheckInResult/CheckInToken (`REQ-GAP-MVP-002`); DEC-007 and approval pending |
| Error/event/audit/notification | expired/forbidden/conflict/locked; `check_in.customer.v1`; backfill actor/reason/before-after audit |
| Concurrency/migration | Unique booking attendance/JTI; link/backfill race yields one result; migrated booking identity mapping required |
| UX/test/dependency/status | UX-05/08, SCR-C-04/SCR-W-04; TC-ATT-007..013; UAT-ATT-02; DEC/Figma/token CTG; BLOCKED |

- **AC-US-ATT-02-01:** Given active booking and valid customer link inside approved boundary, when confirmed, then one customer check-in is recorded and safely acknowledged.
- **AC-US-ATT-02-02:** Given wrong identity/slot/branch, early/late, expired or replayed link, when submitted, then no attendance mutation occurs and details remain hidden.
- **AC-US-ATT-02-03:** Given authorized Admin and eligible booking before/at approved H+2 boundary, when backfill with reason commits, then one attendance marker and full actor/reason audit exist.
- **AC-US-ATT-02-04:** Given concurrent link/backfill or duplicate retry, when processed, then at most one attendance effect exists and no duplicate downstream completion debit is enabled.

## 8. US-ATT-03 — Class Completion

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Authorized Admin reviews attendance and completes confirmed class |
| Preconditions/main flow | Confirmed slot, reviewed check-ins/reservations → confirm consequence → transactional completion posts attendance debits/hour results/releases → outbox/audit |
| Alternate/postcondition | Stale/cancelled/already completed, mismatch, invariant/locked failure; one completion result or no partial posting |
| BR/NFR/DEC | BR-044–045; NFR-001/002/007; no explicit DEC |
| API/schema/data | Proposed explicit `completeClassSlot`/CompletionResult (`REQ-GAP-MVP-003`); transaction/client review pending; ClassSlot/Booking/Reservation/Ledger/HourLog/Outbox |
| Error/event/audit/notification | conflict/locked/ledger invariant; `class.completed.v1`; completion before-after/control audit and notifications |
| Concurrency/migration | Slot lock and unique ATTEND/hour references; retry returns same completion; migrated open slots/bookings reconcile |
| UX/test/dependency/status | UX-07, SCR-W-02; TC-ATT-014..020; UAT-ATT-03; ATT-01/02, LED, Figma/CTG; BLOCKED |

- **AC-US-ATT-03-01:** Given confirmed reviewed class, when completion commits, then each attended eligible booking produces one referenced ATTEND effect, reservations release and hour/outbox/audit commit atomically.
- **AC-US-ATT-03-02:** Given no-show without approved debit policy, when completion commits, then no automatic debit is created and reservation treatment follows the approved rule.
- **AC-US-ATT-03-03:** Given retry/concurrent completion, when executed, then one terminal completion and one effect per booking/hour/event exists.
- **AC-US-ATT-03-04:** Given reconciliation, ledger, period or state failure, when completion is attempted, then the entire transaction rolls back and the slot remains recoverable with safe evidence.

## 9. US-NOT-01 — Transactional Notification

| Contract | Specification |
|---|---|
| Actor/objective/trigger | System consumes committed outbox; authorized Operator observes/retries terminal failures |
| Preconditions/main flow | Approved template/channel and DEC-013 → claim event → create deterministic occurrence → attempt provider → process webhook → fallback/retry/dead-letter |
| Alternate/postcondition | Duplicate event/webhook, provider timeout/rate/failure, invalid signature/template; one occurrence with ordered attempts/status |
| BR/NFR/DEC | BR-070–072; NFR-002/006/007; DEC-013 TBD-BLOCKING |
| API/schema/data | `listNotifications`, `retryNotification`, `receiveMetaWebhook`; NotificationOccurrencePage/NotificationAttempt proposed in OpenAPI 0.4; approval pending |
| Error/event/audit/notification | provider errors normalized; terminal alert; manual retry reason audit; original business events remain authority |
| Concurrency/migration | Deterministic occurrence key and webhook idempotency; retry adds attempt, not occurrence; no production message during migration dry run |
| UX/test/dependency/status | notification list/support flow; TC-NOTIF-001..008; UAT-NOTIF-01; DEC/provider/templates/OPS/Figma gap; BLOCKED |

- **AC-US-NOT-01-01:** Given one committed supported outbox event, when consumed/retried concurrently, then one deterministic notification occurrence exists with no duplicate recipient occurrence.
- **AC-US-NOT-01-02:** Given provider accepted/delivered/failed webhook, when signature-valid duplicate payload arrives, then status transition is idempotent and ordered without raw provider secret exposure.
- **AC-US-NOT-01-03:** Given terminal primary failure, when retry budget ends, then fallback/dead-letter alert and operator action are visible according to DEC-013 with no silent success.
- **AC-US-NOT-01-04:** Given authorized manual retry with reason, when executed, then a new attempt attaches to the same occurrence and audit records actor/reason/result once.

### US-NOT-02 — SMTP Transactional Email Amendment

- **AC-US-NOT-02-01:** Given one supported event and eligible recipient, when projection runs concurrently, then one encrypted EMAIL occurrence exists for the exact template version.
- **AC-US-NOT-02-02:** Given SMTP temporary failure, when retry runs, then the same occurrence receives bounded attempts and never sends concurrently under an active lease.
- **AC-US-NOT-02-03:** Given SMTP acceptance, when persisted, then status is `ACCEPTED_BY_SMTP`, sensitive envelope is purged, and the system never claims inbox delivery.
- **AC-US-NOT-02-04:** Given terminal business-email failure, when handling completes, then in-app fallback, safe operations evidence, and auditable manual retry are available.
- **AC-US-NOT-02-05:** Given package balance/expiry polling repeats, when threshold 3/1/0 or H-7/H-3/H-1 is due, then one reminder exists per package/threshold or package/offset.

## 10. US-FIN-01 — Reconciliable Financial Reports

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Branch-scoped Owner/Finance views revenue, instructor, projection, cost and profit reports |
| Preconditions/main flow | Authorized period/filter and approved rates → select branch/period/report → compute from immutable sources/snapshots → paginate/export gap |
| Alternate/postcondition | Wrong branch, missing config, stale/incomplete source, closed/open distinction; read-only reconciliable totals or explicit failure |
| BR/NFR/DEC | BR-060–064; NFR-001/002/007; DEC-006 TBD-BLOCKING |
| API/schema/data | `getFinancialReport`; FinancialReportPage proposed in OpenAPI 0.4; ledger/purchase/hour/OtherCost/effective snapshots; Finance/client approval pending |
| Error/event/audit/notification | forbidden/config/invariant; sensitive report read/export audit policy; no notification |
| Concurrency/migration | Consistent period snapshot/query; migration financial controls must reconcile opening totals |
| UX/test/dependency/status | UX-10, SCR-W-06; TC-FIN-001..008; UAT-FIN-01; DEC/Finance/Figma/CTG; BLOCKED |

- **AC-US-FIN-01-01:** Given authorized branch/period and complete sources, when each report is requested, then totals follow approved formulas/snapshots and reconcile to control records.
- **AC-US-FIN-01-02:** Given foreign branch or unauthorized report/export, when requested, then access is denied/hidden without totals, counts or sensitive metadata leakage.
- **AC-US-FIN-01-03:** Given missing/overlapping effective rate or invariant mismatch, when calculated, then report fails explicitly rather than silently defaulting or changing history.
- **AC-US-FIN-01-04:** Given concurrent operational writes, when report/control is produced, then the result uses a documented consistent cutoff/snapshot and exposes its period/version evidence.

## 11. US-FIN-02 — Other Cost in Open Period

| Contract | Specification |
|---|---|
| Actor/objective/trigger | MFA-satisfied Finance/Super Owner records branch OtherCost in OPEN period |
| Preconditions/main flow | Authorized branch, OPEN period → list costs → submit amount/category/date/reason/evidence reference → audit/result |
| Alternate/postcondition | Locked/wrong period/branch, invalid amount/category, duplicate/retry; one cost or no mutation |
| BR/NFR/DEC | BR-063; NFR-001/002/007; no explicit DEC |
| API/schema/data | `listOtherCosts`, `createOtherCost`; OtherCostCommand/Resource; OtherCost/Audit/IdempotencyRecord |
| Error/event/audit/notification | forbidden/validation/PERIOD_LOCKED; before-after audit; no notification unless approval policy adds it |
| Concurrency/migration | Period lock checked inside transaction; idempotent command; imported other cost maps stable key |
| UX/test/dependency/status | UX-10, SCR-W-06; TC-FIN-009..012; UAT-FIN-02; period/RBAC/Figma; BLOCKED |

- **AC-US-FIN-02-01:** Given authorized MFA-satisfied actor and OPEN period, when valid cost is submitted, then one branch-scoped OtherCost and audit commit.
- **AC-US-FIN-02-02:** Given closed/locked period or foreign branch, when create/list is attempted, then mutation/access is denied consistently without financial leakage.
- **AC-US-FIN-02-03:** Given invalid amount/category/date or missing reason/evidence required by policy, when submitted, then validation fails with no partial record.
- **AC-US-FIN-02-04:** Given retry racing with monthly close, when executed, then serialization yields either one cost before close or PERIOD_LOCKED, never an unaccounted post-close cost.

## 12. US-FIN-03 — Transactional Monthly Close

| Contract | Specification |
|---|---|
| Actor/objective/trigger | MFA-satisfied Finance/Super Owner closes reconciled OPEN branch period |
| Preconditions/main flow | DEC-006/config complete, reconciliation/control hash pass → review → lock/close → snapshot totals/audit/event |
| Alternate/postcondition | Mismatch, stale hash, concurrent write/close, missing config, already closed; one immutable close or no partial lock |
| BR/NFR/DEC | BR-065–067; NFR-001/002/007; DEC-006 TBD-BLOCKING |
| API/schema/data | `listPeriods`, `closeMonth`; BranchPeriodPage/CloseResult proposed in OpenAPI 0.4; Finance/locking/client approval pending |
| Error/event/audit/notification | reconciliation/conflict/PERIOD_LOCKED/config; `period.closed.v1`; close control/before-after audit |
| Concurrency/migration | Branch+period lock serializes mutations/close; checksum/idempotency; migration must reconcile before pilot close |
| UX/test/dependency/status | UX-10, SCR-W-06; TC-FIN-013..020; UAT-FIN-03; FIN-01/02, DEC/Figma/CTG; BLOCKED |

- **AC-US-FIN-03-01:** Given complete reconciliation and matching control hash for OPEN period, when close commits, then snapshots, CLOSED lock, audit and one period event commit atomically.
- **AC-US-FIN-03-02:** Given mismatch, stale hash or missing configuration, when close is requested, then no snapshot/lock/event is partially written and actionable control differences are returned safely.
- **AC-US-FIN-03-03:** Given concurrent cost/financial mutation and close, when executed, then period locking produces a serial order and no mutation bypasses the closed boundary.
- **AC-US-FIN-03-04:** Given repeated/concurrent close, when retried, then one immutable close result/event exists and later attempts return authoritative already-closed/idempotent result.

## 13. US-FIN-04 — Current-period Correction Journal

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Authorized requester submits correction; different MFA-satisfied Super Owner approves/rejects into current OPEN period |
| Preconditions/main flow | Referenced historical item/locked period and current OPEN period → request → review SoD → approve/reject → post correction journal |
| Alternate/postcondition | Self-approval, invalid reference/amount, current period lock, stale/concurrent decision; immutable request/decision and at most one journal |
| BR/NFR/DEC | BR-066–067; NFR-001/002/007; no explicit DEC |
| API/schema/data | `requestCorrection`, `decideCorrection`; CorrectionCommand/Resource; CorrectionJournal/Audit/IdempotencyRecord |
| Error/event/audit/notification | SoD/forbidden/locked/conflict; `correction.posted.v1`; request/decision/reference/before-after audit |
| Concurrency/migration | One decision/journal reference; old closed snapshot unchanged; migrated references require stable keys |
| UX/test/dependency/status | UX-10, SCR-W-06; TC-FIN-021..026; UAT-FIN-04; FIN-03/RBAC/Figma/explicit result gap; BLOCKED |

- **AC-US-FIN-04-01:** Given valid referenced item and OPEN current period, when authorized request is submitted, then one pending correction exists without mutating the locked historical record.
- **AC-US-FIN-04-02:** Given requester equals approver or approver lacks scope/MFA, when decision is attempted, then it is denied and no journal/decision mutation occurs.
- **AC-US-FIN-04-03:** Given valid pending request and different authorized approver, when approval commits, then one current-period referenced journal, audit and event commit while old close remains immutable.
- **AC-US-FIN-04-04:** Given concurrent/retried decision or current period closes, when processed, then at most one journal is posted or PERIOD_LOCKED/conflict is returned without partial effect.

## 14. US-AUD-01 — Scoped Audit Search and Export

| Contract | Specification |
|---|---|
| Actor/objective/trigger | MFA/permission-authorized role searches or exports immutable audit within data/branch scope |
| Preconditions/main flow | Approved DEC-009 retention/export policy → filter actor/object/time/branch → paginate → authorized export (contract gap) |
| Alternate/postcondition | Wrong scope, excessive filter/export, expired retention, injection, unavailable storage; read-only scoped results/evidence |
| BR/NFR/DEC | BR-073–075; NFR-001/002/007; DEC-009 TBD-BLOCKING |
| API/schema/data | `listAuditLogs`/AuditLogPage plus proposed audit export create/status/download (`REQ-GAP-MVP-004`); DEC-009 and approval pending |
| Error/event/audit/notification | forbidden/rate/validation; audit-search/export access audit without recursive sensitive payload; no notification |
| Concurrency/migration | Append-only ordering/cursor; retention/legal hold; migration audit provenance preserved separately |
| UX/test/dependency/status | audit flow, SCR-W-08; TC-AUD-001..008; UAT-AUD-01; DEC/Privacy/Figma/CTG; BLOCKED |

- **AC-US-AUD-01-01:** Given authorized scoped filters, when audit is listed, then stable paginated immutable entries contain required actor/role/branch/reason/correlation fields with masking.
- **AC-US-AUD-01-02:** Given unauthorized branch/object/export, when requested, then results/counts are denied/hidden with no PII or sensitive before/after leakage.
- **AC-US-AUD-01-03:** Given approved export policy and bounded query, when export is requested, then one access-audited private artifact is produced with retention/expiry and exact filter/version evidence.
- **AC-US-AUD-01-04:** Given concurrent append, retention action or repeated pagination, when queried, then cursor/order remains deterministic and immutable records are not modified through application API.

## 15. US-OPS-01 — Operational Health and Recovery

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Restricted Operator monitors sanitized health, jobs, queues and notification failures and performs approved recovery |
| Preconditions/main flow | DEC-011/013 and environment ownership → view health/jobs → diagnose correlation → retry/requeue/dead-letter recovery (contract gap) → record evidence |
| Alternate/postcondition | Dependency outage, stale job, poison message, unauthorized action, retry exhaustion; observable safe state and bounded audited recovery |
| BR/NFR/DEC | BR-070–075; NFR-002/006/007; DEC-011/013 TBD-BLOCKING |
| API/schema/data | `getHealth`, `listJobs`, `listNotifications`, `retryNotification`, proposed retry/dead-letter operations (`REQ-GAP-MVP-005`); Ops/client approval pending |
| Error/event/audit/notification | sanitized dependency status, forbidden/rate/service errors; manual recovery reason/audit/alert |
| Concurrency/migration | Lease/idempotent retry prevents duplicate business effects; migration jobs use separate scope/queue and evidence |
| UX/test/dependency/status | operations flow, SCR-W-08; TC-OPS-001..009; UAT-OPS-01; DEC/provider/observability/Figma/CTG; BLOCKED |

- **AC-US-OPS-01-01:** Given authorized Operator, when health/jobs are viewed, then sanitized readiness and correlation/status are visible without secrets, payload PII or cross-scope data.
- **AC-US-OPS-01-02:** Given unauthorized actor, when operations list/action is attempted, then access is denied and operational topology/metrics are not leaked.
- **AC-US-OPS-01-03:** Given failed retryable job and approved reason, when recovery is invoked, then one bounded attempt/lease is created and business idempotency prevents duplicate effect.
- **AC-US-OPS-01-04:** Given poison/exhausted job or dependency outage, when handling completes, then dead-letter/alert/escalation evidence is recorded and no silent success or infinite retry occurs.

## 16. US-MIG-01 — Repeatable Opening Migration

| Contract | Specification |
|---|---|
| Actor/objective/trigger | Authorized Data team executes validate/apply/reconcile migration batches for pilot cutover |
| Preconditions/main flow | DEC-010 pilot, approved mapping/source checksum/stable keys → ingest → validate/quarantine → dry run → apply transactionally → reconcile/sign off |
| Alternate/postcondition | Schema/checksum drift, duplicate key, invalid row, partial batch, rerun, rollback; accepted records once, actionable rejection and control totals |
| BR/NFR/DEC | Migration rules plus BR-015/060/073 provenance; NFR-002/006/007; DEC-010 TBD-BLOCKING |
| API/schema/data | MigrationBatch/source keys/MIGRATION_OPENING ledger; proposed explicit upload/validate/apply/reconcile/rollback operations (`REQ-GAP-MVP-006`); Data Owner/client approval pending |
| Error/event/audit/notification | validation/checksum/conflict/locked; batch lifecycle/audit/control evidence; no customer notification during rehearsal |
| Concurrency/migration | Stable external keys, batch checksum and idempotent rerun; exception quarantine; rollback/cutover reconciliation |
| UX/test/dependency/status | internal migration console/CLI flow; TC-MIG-001..010; UAT-MIG-01; DEC/source/data owner/environment/CTG; BLOCKED |

- **AC-US-MIG-01-01:** Given approved mapping and versioned source checksum, when validation runs, then every row is deterministically accepted or rejected with reason and no target mutation during dry run.
- **AC-US-MIG-01-02:** Given validated batch, when apply commits, then stable external keys, batch metadata and MIGRATION_OPENING references are written with control totals and immutable audit.
- **AC-US-MIG-01-03:** Given identical checksum/key rerun or concurrent duplicate batch, when applied, then accepted records/ledger are not duplicated and the original result/control evidence is returned.
- **AC-US-MIG-01-04:** Given partial failure, checksum drift or reconciliation mismatch, when detected, then cutover remains blocked, exceptions are actionable and rollback/retry preserves prior accepted consistency.

## Common Readiness Boundary

The 16 stories remain `BLOCKED`. Their acceptance criteria are review units for Gate 2, not coding authorization. Technical gaps `REQ-GAP-MVP-001..006` must be resolved through approved ADR/OpenAPI/schema/test change and Gate 4 evidence.

# Remaining MVP Detailed Screen Handoff

**Status:** DRAFT / BLOCKED  
**Figma file/nodes/Designer:** TBD-BLOCKING  
**Contract:** OpenAPI `0.4.0-draft` proposed

## 1. Screen Contract

Every row defines actor/permission and entry, fields/actions/API, all required states and recovery, Indonesian copy intent, responsive/accessibility, analytics-safe event, test and Figma placeholder. Branch/timezone and consequence are never implicit; raw tokens, private URLs, PII and provider errors never enter analytics.

| Screen | Actor/entry | Fields/actions/API | States, errors and recovery | Copy/responsive/accessibility | Safe event/test | Figma |
|---|---|---|---|---|---|---|
| SCR-UX06-01 | Instructor; active assignment | branch/date filters, list/calendar, add; `listAvailabilities` | loading/empty/offline/forbidden; retry or assignment support | WIB/timezone explicit; list alternative, keyboard/date semantics | `availability_viewed` dimensions / TC-CLS-001/003 | TBD-BLOCKING |
| SCR-UX06-02 | Instructor; availability list | start/end/branch, submit; `createAvailability` | validation/overlap/concurrent/duplicate/offline; edit or reload | “Jadwal bentrok”; focus summary, dynamic text | `availability_result` category / TC-CLS-002/004 | TBD-BLOCKING |
| SCR-UX06-03 | Assigned Instructor; confirmed slot | slot/branch/time, issue/refresh/revoke QR; `issueInstructorCheckInToken`, `getCheckInTokenStatus`, `revokeCheckInToken` | too early/late, expired/used/revoked, offline, DEC-007 locked; retry/support | token masked from reader/analytics; expiry announced, high contrast | `checkin_token_result` status / TC-ATT-001..003 | TBD-BLOCKING |
| SCR-UX06-04 | Instructor; active token | confirm check-in; `instructorCheckIn` | wrong actor/slot/window, replay, timeout/idempotent result | “Check-in berhasil” persistent; no raw token, focus result | `instructor_checkin_result` category / TC-ATT-004..006 | TBD-BLOCKING |
| SCR-UX07-01 | Branch Admin; master valid | slot list/form, type/instructor/time; `listClassSlots`, `createClassSlot` | empty/loading/invalid master/overlap/wrong scope | branch/timezone prominent; keyboard form/table | `class_slot_result` action/category / TC-CLS-005..008 | TBD-BLOCKING |
| SCR-UX07-02 | Admin; draft slot | assignment/publish summary, confirm; `transitionClassSlot` | stale/invalid assignment/already published/retry | publish consequence explicit; status non-color | `class_transition_result` action/category / TC-CLS-006/012 | TBD-BLOCKING |
| SCR-UX07-03 | Admin; cancellable slot | reason, recipients, reservation consequence; `transitionClassSlot` | DEC-008 locked, invalid state, conflict, duplicate result | destructive confirmation; cancellation not toast-only | `class_cancel_result` category / TC-CLS-009..011 | TBD-BLOCKING |
| SCR-UX07-04 | Admin/Ops; published slot/job | due time, quota/bookings, job/result; `runQuotaEvaluation`, `listJobs` | not due/config missing/lease conflict/retry/confirmed/auto-cancel | H-24 in branch timezone; job status reader announcement | `quota_evaluation_result` category / TC-CLASS-001..005 | TBD-BLOCKING |
| SCR-UX07-05 | Admin; confirmed class reviewed | attendance/no-show/control summary, reason, complete; `completeClassSlot` | mismatch/stale/locked/invariant/duplicate/503; reconcile or retry | financial/session consequence explicit; accessible totals | `class_completion_result` category / TC-ATT-014..020 | TBD-BLOCKING |
| SCR-UX04-01 | Customer; active booking | booking detail, consequence, reason/request; `listBookings`, `requestReschedule` | cutoff/not eligible/offline/duplicate; explain entitlement | old/new consequence and timezone; dynamic text | `reschedule_requested` category / TC-RES-001/002 | TBD-BLOCKING |
| SCR-UX04-02 | Customer; pending request | target filters/slots/select; `listClassSlots` | empty/full/stale/mismatch/offline; refresh targets | list alternative; capacity/status non-color | `reschedule_target_selected` refs / TC-RES-002/003 | TBD-BLOCKING |
| SCR-UX04-03 | Admin/Super Owner; scoped queue | request/old/new detail, approve/reject; `decideReschedule` | wrong scope/target invalid/already decided/duplicate | confirmation names old/new slot and session effect | `reschedule_decision_result` / TC-RES-003/004 | TBD-BLOCKING |
| SCR-UX05-01 | Customer; authenticated link | booking/slot/time/branch review, continue; `getCheckInTokenStatus` | too early/late/wrong/expired/revoked/offline | identity-safe details; large action, reader time | `customer_checkin_reviewed` category / TC-ATT-007..010 | TBD-BLOCKING |
| SCR-UX05-02 | Customer; eligible link | confirm/result; `customerCheckIn` | replay/timeout/idempotent/wrong actor/window | persistent success or actionable error; focus result | `customer_checkin_result` category / TC-ATT-008..010/013 | TBD-BLOCKING |
| SCR-UX08-01 | Admin; branch scope | customer/booking filters and exact slot review; `listBookings` | empty/loading/wrong branch/no booking/offline | mask identifiers; keyboard-first results | `backfill_search` safe filters / TC-ATT-011 | TBD-BLOCKING |
| SCR-UX08-02 | Admin; eligible booking | reason, H+2 boundary, confirm; `backfillCustomerCheckIn` | >H+2/locked/duplicate/stale/conflict | exact customer/slot and audit consequence | `backfill_result` category / TC-ATT-011..013 | TBD-BLOCKING |
| SCR-UX10-01 | Owner/Finance; permitted branch/period | report type/filter/totals/table; `getFinancialReport` | empty/loading/config/invariant/forbidden/stale; reconcile | currency alignment; chart has table; cutoff/version visible | `financial_report_viewed` type/period / TC-FIN-001..008 | TBD-BLOCKING |
| SCR-UX10-02 | Finance; MFA, OPEN period | cost list/form/amount/evidence/reason; `listOtherCosts`, `createOtherCost` | validation/locked/concurrent close/duplicate | Rupiah semantics and lock consequence; keyboard table | `other_cost_result` category / TC-FIN-009..012 | TBD-BLOCKING |
| SCR-UX10-03 | Finance/Super Owner; reconciled OPEN period | controls/hash/totals/reason/MFA/close; `listPeriods`, `closeMonth` | mismatch/stale/config/locked/concurrent/idempotent | irreversible lock confirmation; reader summary | `monthly_close_result` category / TC-FIN-013..020 | TBD-BLOCKING |
| SCR-UX10-04 | Requester/Super Owner; current OPEN period | reference/amount/reason, queue/decision; `requestCorrection`, `decideCorrection` | SoD/wrong scope/locked/stale/duplicate | old period immutable/current journal explicit | `correction_result` action/category / TC-FIN-021..026 | TBD-BLOCKING |
| SCR-NOT-01 | Customer/internal recipient | occurrence list/status/detail/next action; `listNotifications` | empty/loading/offline/failed/fallback/delivered | status non-color; safe message and timestamp | `notification_viewed` status/type / TC-NOTIF-001/003..006 | TBD-BLOCKING |
| SCR-NOT-02 | Operator; restricted | occurrence/attempts/error category/reason/retry; `retryNotification` | retrying/exhausted/duplicate/forbidden/provider down | no raw provider payload; confirmation explains same occurrence | `notification_retry_result` / TC-NOTIF-002/007/008 | TBD-BLOCKING |
| SCR-AUD-01 | MFA-authorized role | branch/time/actor/object filters, page; `listAuditLogs` | empty/loading/rate/forbidden/invalid cursor | masking and scope visible; keyboard table | `audit_search` safe dimensions / TC-AUD-001..004/007/008 | TBD-BLOCKING |
| SCR-AUD-02 | Authorized exporter; DEC-009 | filters/format/reason/status/download; `createAuditExport`, `getAuditExportStatus`, `authorizeAuditExportDownload` | queued/running/failed/ready/expired/forbidden; recreate | private expiry and retention warning; progress announced | `audit_export_result` status/format / TC-AUD-005/006 | TBD-BLOCKING |
| SCR-OPS-01 | Restricted Operator | dependency health/job filters/status; `getHealth`, `listJobs` | loading/degraded/down/stale/forbidden | sanitized labels; status non-color; compact responsive table | `ops_health_viewed` status category / TC-OPS-001..004 | TBD-BLOCKING |
| SCR-OPS-02 | Operator; failed job | attempts/lease/error/reason, retry/dead-letter; `retryOperationalJob`, `deadLetterOperationalJob` | lease conflict/exhausted/retrying/duplicate/503 | no payload PII; destructive dead-letter confirmation | `ops_recovery_result` action/category / TC-OPS-005..009 | TBD-BLOCKING |
| SCR-MIG-01 | Data team; restricted | source file/type/checksum/mapping/upload/finalize/validate; migration source and batch operations | unsafe/schema/checksum/row rejects/offline; replace or inspect exceptions | no production PII preview; progress and rejection summary accessible | `migration_validation_result` category / TC-MIG-001..003 | TBD-BLOCKING |
| SCR-MIG-02 | Data team; validated batch | mode/control hash/reason, apply/status/rollback; `getMigrationBatch`, `transitionMigrationBatch` | running/failed/duplicate/locked/checksum drift/rollback | dry-run versus APPLY unmistakable; destructive confirmation | `migration_action_result` action/category / TC-MIG-004..008 | TBD-BLOCKING |
| SCR-MIG-03 | Data/Finance/PO; applied batch | control totals/exceptions/reconcile/cutover disposition; `getMigrationBatch`, `transitionMigrationBatch` | mismatch/reconciling/reconciled/blocked/rolled back | totals table and sign-off consequence; export-safe masking | `migration_reconcile_result` category / TC-MIG-008..010 | TBD-BLOCKING |

## 2. Text Wireflows

- UX-06: availability list → create/result; assigned slot → token issue/status → instructor check-in/result.
- UX-07: slot list/create → assign/publish → H-24 result → cancel or attendance review → completion result.
- UX-04/05/08: booking detail → reschedule request/target → internal decision; customer link review → check-in; Admin search → reasoned backfill.
- UX-10: report → reconcile; cost list/create; period review → close; correction request → independent decision → current-period journal result.
- Notification/Audit/Ops: occurrence/search/health list → detail → authorized retry/export/recovery → persistent result.
- Migration: private source upload → finalize/scan → batch create/validate → dry-run/apply → reconcile → sign-off or rollback.

## 3. Transition and Error-Recovery Contract

| State/error family | Indonesian copy intent | Recovery/next screen | Consequence confirmation | Tests |
|---|---|---|---|---|
| TIME_WINDOW_NOT_OPEN/CLOSED, TOKEN_EXPIRED/REPLAY/PURPOSE | “Check-in belum dapat dilakukan/sudah berakhir” without secret detail | status screen; reissue only when permitted | Actor, branch, class and time | TC-ATT-* |
| QUOTA_JOB_NOT_DUE/LEASED/CONFIGURATION_MISSING | “Evaluasi belum dapat diproses” with correlation reference | reload job/config owner escalation | Confirm versus auto-cancel/reservation release | TC-CLASS-* |
| STATE_CONFLICT/IDEMPOTENCY replay | Show authoritative current result, not generic failure | result/detail screen | No duplicate action | concurrency packs |
| PERIOD_LOCKED/RECONCILIATION_MISMATCH | “Periode terkunci/rekonsiliasi belum sesuai” | report/control detail or correction path | Financial lock/journal impact | TC-FIN-* |
| EXPORT_EXPIRED/FORBIDDEN | “Tautan ekspor berakhir/tidak tersedia” | recreate export or return to scoped search | Private artifact/retention | TC-AUD-* |
| JOB_LEASE_CONFLICT/RETRY_EXHAUSTED | “Pekerjaan sedang diproses/batas percobaan tercapai” | refresh or reasoned dead-letter/escalate | Recovery can affect downstream operation | TC-OPS-* |
| MIGRATION_CHECKSUM/SCHEMA/RECONCILIATION error | “Sumber atau hasil belum cocok” | validation/exceptions/reconcile screen | APPLY/rollback/cutover blocking | TC-MIG-* |

## 4. Figma Register

All 29 screen IDs inherit `TBD-BLOCKING` for file URL, node URL/version, prototype, Designer, review date and PO approval. Gate 3 remains `BLOCKED`; this document cannot replace Figma evidence.

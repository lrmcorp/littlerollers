# Remaining MVP Screen-level Handoff Queue

**Status:** DRAFT / BLOCKED  
**Figma file, Designer and nodes:** TBD-BLOCKING

These stable screen IDs reserve handoff scope; they are not designs or Gate 3 evidence.

| Priority | Screen ID / flow | Platform/actor | Required handoff scope | Story | Contract/gap | Status |
|---:|---|---|---|---|---|---|
| 1 | SCR-UX06-01 / UX-06 | Flutter Instructor | availability list/calendar, empty/loading/offline/conflict | CLS-01 | list/create availability | BLOCKED |
| 2 | SCR-UX06-02 / UX-06 | Flutter Instructor | submit availability, timezone/range validation/result | CLS-01 | create availability | BLOCKED |
| 3 | SCR-UX06-03 / UX-06 | Flutter Instructor | assigned slot and QR/token readiness/expired/offline | ATT-01 | GAP-2 | BLOCKED |
| 4 | SCR-UX06-04 / UX-06 | Flutter Instructor | check-in confirmation/result/replay/wrong scope | ATT-01 | instructor check-in | BLOCKED |
| 5 | SCR-UX07-01 / UX-07 | Web Admin | class-slot list/create, master/availability errors | CLS-02 | list/create slots | BLOCKED |
| 6 | SCR-UX07-02 / UX-07 | Web Admin | assign/publish review, state conflict/idempotent result | CLS-02 | transition slot | BLOCKED |
| 7 | SCR-UX07-03 / UX-07 | Web Admin | manual cancel consequence/reason/reservation result | CLS-02 | transition slot; DEC-008 | BLOCKED |
| 8 | SCR-UX07-04 / UX-07 | Web Admin/Ops | H-24 evaluation status, retry/failure/confirmed/auto-cancel | CLS-03 | GAP-1 | BLOCKED |
| 9 | SCR-UX07-05 / UX-07 | Web Admin | attendance review and completion consequence/result | ATT-03 | GAP-3 | BLOCKED |
| 10 | SCR-UX04-01 / UX-04 | Flutter Customer | booking detail/reschedule consequence/request | BKG-02 | request reschedule | BLOCKED |
| 11 | SCR-UX04-02 / UX-04 | Flutter Customer | target selection/full/cutoff/stale/retry result | BKG-02 | list slots/bookings | BLOCKED |
| 12 | SCR-UX04-03 / UX-04 | Web Admin | reschedule queue/review/approve/reject/duplicate result | BKG-02 | decide reschedule | BLOCKED |
| 13 | SCR-UX05-01 / UX-05 | Flutter Customer | authenticated check-in link review/time/branch/class | ATT-02 | GAP-2 | BLOCKED |
| 14 | SCR-UX05-02 / UX-05 | Flutter Customer | confirm/success/early/late/replay/offline | ATT-02 | customer check-in | BLOCKED |
| 15 | SCR-UX08-01 / UX-08 | Web Admin | branch-scoped booking search and exact customer/slot review | ATT-02 | list bookings | BLOCKED |
| 16 | SCR-UX08-02 / UX-08 | Web Admin | H+2 backfill reason/confirmation/locked/duplicate result | ATT-02 | backfill check-in | BLOCKED |
| 17 | SCR-UX10-01 / UX-10 | Web Owner/Finance | report filters/totals/table/reconciliation/config error | FIN-01 | financial report | BLOCKED |
| 18 | SCR-UX10-02 / UX-10 | Web Finance | OtherCost list/create/validation/period lock | FIN-02 | list/create OtherCost | BLOCKED |
| 19 | SCR-UX10-03 / UX-10 | Web Finance | close reconciliation/control hash/MFA/concurrent result | FIN-03 | close month | BLOCKED |
| 20 | SCR-UX10-04 / UX-10 | Web Super Owner | correction request/review/SoD/approve/reject/result | FIN-04 | correction operations | BLOCKED |
| 21 | SCR-NOT-01 | Flutter/Web | notification list/status/fallback and safe next action | NOT-01 | notification operations | BLOCKED |
| 22 | SCR-NOT-02 | Web Operations | occurrence attempts/failure/manual retry/reason | NOT-01/OPS-01 | retry notification | BLOCKED |
| 23 | SCR-AUD-01 | Web Authorized | scoped search/filter/pagination/masking/empty/error | AUD-01 | list audit | BLOCKED |
| 24 | SCR-AUD-02 | Web Authorized | export review/status/private download/expiry | AUD-01 | GAP-4 | BLOCKED |
| 25 | SCR-OPS-01 | Web Operations | sanitized health/dependency/job status | OPS-01 | health/jobs | BLOCKED |
| 26 | SCR-OPS-02 | Web Operations | job detail/retry/dead-letter/escalation/evidence | OPS-01 | GAP-5 | BLOCKED |
| 27 | SCR-MIG-01 | Web/internal tool | batch source/checksum/mapping validation/rejections | MIG-01 | GAP-6 | BLOCKED |
| 28 | SCR-MIG-02 | Web/internal tool | dry-run/apply/progress/rerun/rollback | MIG-01 | GAP-6 | BLOCKED |
| 29 | SCR-MIG-03 | Web/internal tool | reconciliation controls/exceptions/cutover disposition | MIG-01 | GAP-6 | BLOCKED |

Every eventual screen must include permission/branch context, fields/actions, exact API or approved gap remediation, loading/empty/error/success/locked/offline/retry, Indonesian copy intent, responsive/accessibility, analytics-safe event, test IDs, Figma node/version and review evidence. Production order follows table priority; Finance and operations screens may proceed in parallel only after their prerequisites are approved.

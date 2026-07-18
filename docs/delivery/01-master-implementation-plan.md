# Master Implementation Plan — Sprint 0–12

**Status:** DRAFT  
**Version:** 0.1  
**Owner:** PM/BA  
**Accountable:** Product Owner  
**Cadence:** 13 sprint × 2 minggu; baseline enam bulan termasuk contingency

Detailed task sequencing and current readiness for the first build window are maintained in [Sprint 0–3 Detailed Execution Backlog](06-sprint-0-3-detailed-execution-backlog.md) and [Sprint 2–3 Readiness Audit](07-sprint-2-3-readiness-audit.md). Detailed Gate 2 drafts for later sprints and their blockers are maintained in [Remaining MVP Traceability/Readiness](../product/07-remaining-mvp-traceability-readiness-and-review.md).

## 1. Delivery Rules

- Sprint execution uses AI role modes; no human staffing prerequisite exists.
- Coding begins after BG-0 `PASS`. Local/synthetic scaffold and implementation are authorized; unresolved decisions remain configuration/production blockers and PG-1 controls production release.
- Sprint 0–1 adalah discovery/foundation. Jika gate belum lulus pada akhir Sprint 1, Sprint 2 tidak otomatis memulai build; milestone direforecast dan blocker dieskalasi.
- Setiap deliverable memiliki satu Accountable (`A`), satu atau lebih Responsible (`R`), reviewer, dependency, acceptance, dan evidence.
- Perubahan baseline setelah story pointing memakai Change Request. Unused contingency tidak otomatis menambah scope.
- EP-12 Expiry Automation adalah post-pilot dan tidak masuk Sprint 0–12.

## 2. Milestone Map

| Milestone | Target | Outcome | Accountable | Evidence |
|---|---|---|---|---|
| M0 Kickoff ready | Awal Sprint 0 | Team working agreement, accounts/dependencies owned | PO | Signed kickoff checklist |
| M1 Baseline ready | Akhir Sprint 1 | Gate 1,2,4,5 PASS; priority design Gate 3 PASS | PO/TL sesuai gate | APR-001/002/004/005 + Figma approvals |
| M2 Core commerce | Akhir Sprint 3 | Identity/master/purchase/package/ledger usable in staging | TL | Demo, traceability, test evidence |
| M3 Scheduling | Akhir Sprint 5 | Availability/timetable/booking/reschedule usable | TL | Staging E2E and concurrency evidence |
| M4 Attendance automation | Akhir Sprint 7 | Check-in/completion/quota/notification transaction usable | TL | E2E, scheduler/retry evidence |
| M5 Finance complete | Akhir Sprint 9 | Reports, cost, close/correction reconcilable | PO | Finance UAT-precheck and control totals |
| M6 Release candidate | Akhir Sprint 10 | Hardening and migration rehearsal pass | QA | RC report, restore/security/performance evidence |
| M7 UAT/cutover ready | Akhir Sprint 11 | Business/Finance UAT pass, go/no-go pack ready | PO | UAT sign-off and cutover rehearsal |
| M8 Pilot exit | Akhir Sprint 12 | Pilot/parallel run exit criteria achieved | PO | Production sign-off and pilot report |

## 3. Sprint Plan

| Sprint | Goal dan scope | Entry | Exit/deliverables | R / A | Reviewer | Critical dependency / risk | Evidence |
|---|---|---|---|---|---|---|---|
| 0 | Kickoff, Gate 1 review preparation, story refinement S2–3, IA/design system UX-01/02/03, ADR/ERD/OpenAPI review, test/data profiling, environment ownership | Staffing inti; PO tersedia; repo docs accessible | Working agreement; review comments owned; story priority DoR gaps known; source inventory; environment dependency register | R: PM/BA, Design, TL, QA, Data Owner, Ops; A: PO | Peer reviewer, Finance | Missing PIC/accounts/source data; unresolved DEC-004/006/011/012/014 | Kickoff record, refinement board, review logs, source manifest |
| 1 | Close prerequisite gates, approved priority Figma, environment/scaffold plan, migration/test baseline | Sprint 0 outputs; blocking decisions have owner/due | G1/G2/G4/G5 PASS; UX-01/02/03 approved; Sprint 2 stories READY; scaffold execution checklist approved | R: PM/BA, Design, TL, QA; A: PO for G1/2/5, TL for G4 | Web, Flutter, peer reviewer, Finance | Gate slippage blocks coding; scope pressure | Approval evidence, DoR report, design handoff, technical review |
| 2 | Identity/RBAC/branch foundation and customer/internal login | M1; US-ID-01/02, US-MST-02 READY | Auth/session/MFA/branch policy in development; generated clients; automated auth/authorization baseline | R: TL/BE, Web, Flutter, QA; A: TL | PM/BA, peer reviewer | OIDC/Meta sandbox, DEC-012/014, account linking security | CI, API contract tests, TC-AUTH, demo |
| 3 | Master, purchase, package, payment proof, ledger/adjustment | Sprint 2 identity stable; US-MST-01, PKG-01/02, LED-01/02 READY | Purchase approval→package→ledger staging flow; upload scan states; balance/SoD/concurrency tests | R: TL/BE, Web, Flutter, QA; A: TL | PM/BA, Finance, PO | DEC-004/005/006; storage scan; ledger integrity | M2 demo, TC-PKG/LED, audit/outbox evidence |
| 4 | Instructor availability, class-slot lifecycle, timetable | M2; UX-06/07 and CLASS stories READY | Availability/conflict, slot/assignment/publish and timetable staging flow | R: TL/BE, Web, Flutter, QA; A: TL | PM/BA, Design, Admin/Instructor reps | Quota/capacity config; schedule/timezone edge cases | TC-CLS, design QA, staging demo |
| 5 | Booking/reservation/reschedule with cutoff/concurrency | Stable slots/packages; UX-03/04; BKG stories READY | Self/assisted booking and reschedule staging E2E; last-seat/session tests pass | R: TL/BE, Web, Flutter, QA; A: TL | PM/BA, Customer/Admin reps | H-2/H-24 inclusivity; reservation deadlock/oversell | M3 E2E, TC-BOOK/RES, performance sample |
| 6 | Instructor/customer check-in, Admin backfill, completion | M3; UX-05/06/08/07; ATT stories READY | Signed check-in flows and idempotent completion; ledger/hour results correct | R: TL/BE, Web, Flutter, QA; A: TL | PM/BA, Design, Finance | DEC-007; token/replay security; H+2 boundary | TC-ATT/SEC, design QA, reconciliation |
| 7 | H-24 quota automation, auto/manual cancellation, transactional notifications | Stable booking/attendance; CLASS-03/NOT-01/OPS-01 READY | Scheduler/outbox/provider adapter/fallback operational in staging | R: TL/BE, Web, Flutter, QA, Ops; A: TL | PM/BA, PO, peer reviewer | DEC-008/013; Meta template/provider delay | M4 E2E, job replay, notification evidence, alerts |
| 8 | Financial reports, effective rates, OtherCost | M4 transactional data; FIN-01/02 READY | Revenue/projection/realtime/other/profit reports match deterministic dataset | R: TL/BE, Web, QA, Finance; A: Finance for formula, TL for implementation | PM/BA, PO | Missing approved rates; query performance; branch leakage | TC-FIN-001..012, DD-QA-001 controls, Finance review |
| 9 | Monthly close, period lock, correction, audit/operations | Sprint 8 controls pass; FIN-03/04, AUD-01 READY | Close/correction staging UAT-precheck; locked paths denied; audit/ops usable | R: TL/BE, Web, QA, Finance, Ops; A: TL technical / PO business | PM/BA, peer reviewer | SoD, period mutation bypass, reconciliation mismatch | M5, TC-FIN/AUD/OPS, Finance recommendation |
| 10 | Hardening, security/performance/accessibility, migration rehearsal, training/UAT preparation | Feature complete; regression stable; source/mapping approved | RC candidate; restore test; security/performance/a11y exit; trial migration reconciled; training/UAT scripts ready | R: QA, TL, PM/BA, Data Owner, Finance, Ops; A: QA pass/fail | PO, peer reviewer | Production-like environment/provider; source quality | M6 RC report, MIG-REC, restore/threat evidence |
| 11 | Full UAT, final rehearsal, release/go-no-go preparation | RC pass; trained representatives; staging stable | Operational/Finance UAT pass; defects disposition; timed cutover/rollback rehearsal pass | R: QA, PM/BA, Data Owner, Finance, business reps, TL; A: PO | Ops, peer reviewer | P1/P2, readiness score, store/Meta/cloud access | M7 signed UAT, cutover rehearsal, release checklist |
| 12 | Production cutover, pilot, parallel run, stabilization and handover | PO go; backup/monitoring/support ready; zero blocking mismatch | Production smoke; daily reconciliation; ≥5 consecutive operating days no material mismatch; no P1/P2; handover evidence | R: TL, QA, PM/BA, Ops, Data Owner, Finance; A: PO | Business reps, peer reviewer | Incident/data mismatch/adoption; rollback trigger | M8 release sign-off, pilot exit, KT/access review |

## 4. Critical Path and Dependency Policy

Critical path:

`Gate 1/2/4/5 → priority Figma → identity/branch → purchase/package/ledger → slot/booking/reservation → check-in/completion → finance/close → migration/UAT → pilot`.

- Provider/account dependencies run in parallel from Sprint 0 but cannot bypass security or release gates.
- Design stays at least one sprint ahead of UI build from Sprint 1–9.
- QA designs tests during refinement, automates alongside implementation, and runs independent exit; testing is not deferred to Sprint 10.
- Migration profiling starts Sprint 0; import implementation/rehearsal cannot wait until cutover.
- A predecessor is complete only when its acceptance/evidence is linked, not when activity is merely started.

### Epic delivery ownership

| Epic | Primary delivery window | Outcome owner |
|---|---|---|
| EP-01 Identity & RBAC | Sprint 2 | TL |
| EP-02 Master Data | Sprint 2–3 | TL |
| EP-03 Purchase & Package | Sprint 3 | TL |
| EP-04 Session Ledger | Sprint 3 | TL |
| EP-05 Instructor & Timetable | Sprint 4 and automation completion Sprint 7 | TL |
| EP-06 Booking & Reschedule | Sprint 5 | TL |
| EP-07 Check-in & Completion | Sprint 6 | TL |
| EP-08 Notification | Sprint 7 | TL |
| EP-09 Finance & Close | Sprint 8–9 | PO business / TL technical |
| EP-10 Audit & Security | Cross-cutting Sprint 2–10; operational UI Sprint 7/9 | TL |
| EP-11 Migration & Pilot | Sprint 0 profiling; Sprint 10–12 execution | PO |

Each MVP epic has one final delivery outcome above even when enabling work begins earlier. EP-12 remains post-pilot.

## 5. Status and Reporting

PM/BA reports sprint goal confidence, completed/accepted scope, blocker age, decision SLA, defect trend, gate/evidence state, capacity variance, critical-path variance, and milestone forecast. Status is `GREEN`, `AMBER`, or `RED` with evidence; any critical-path blocker older than two working days is escalated to PO and reflected in forecast.

# Work Breakdown Structure & Role Delivery Plan

**Status:** DRAFT  
**Owner:** PM/BA  
**Approver:** Product Owner

## 1. WBS Contract

ID format: `WBS-{EP}-{ROLE}-{NN}` where role is `BA`, `UX`, `BE`, `WEB`, `FLT`, `QA`, `OPS`, `MIG`, or `BIZ`. Every task records story/requirement, input, activity/output, `R`, one `A`, reviewer, predecessor, sprint, acceptance, and evidence link. A task cannot start if a blocking predecessor is incomplete.

Standard chain per story:

1. `BA`: baseline outcome/AC/traceability and decision closure.
2. `UX`: applicable Figma states/handoff; `N/A` only for non-UI job/internal migration.
3. `BE`: ADR/API/schema/security/test approach and backend implementation.
4. `WEB`/`FLT`/`OPS`: applicable consumer implementation.
5. `QA`: automated/manual verification and evidence.
6. `BIZ`: demo/UAT/PO acceptance at milestone appropriate to story.

## 2. Story-to-WBS Coverage

All 24 MVP stories from the implementation backlog appear exactly once below as delivery outcomes. BA/UX/technical predecessors for the 16 later stories use [DOC-PROD-06/07](../product/06-remaining-mvp-detailed-story-specification.md) and its gap/readiness queue; consolidated status and closure evidence are controlled by the [Pre-coding Readiness & Blocker Ledger](08-pre-coding-readiness-and-blocker-ledger.md). Detailed drafts or readiness percentages do not clear any WBS predecessor.

| Epic/story | Sprint | WBS chain and primary output | R | A | Review/approval | Blocking predecessors | Acceptance/evidence |
|---|---:|---|---|---|---|---|---|
| EP-01 / US-ID-01 | 2 | `WBS-01-BA-01` login/recovery AC → `WBS-01-UX-01` UX-01 → `WBS-01-BE-01` auth/OTP/session → `WBS-01-FLT-01` Customer login → `WBS-01-QA-01` | PM/BA, Design, BE, Flutter, QA | TL | PO business; peer security | DEC-012/014, Gate 3 UX-01 | TC-AUTH-001..004; UAT-AUTH-01 |
| EP-01 / US-ID-02 | 2 | `WBS-01-BA-02` internal identity → `WBS-01-UX-02` UX-11 auth states → `WBS-01-BE-02` invite/MFA/deactivate → `WBS-01-WEB-01` → `WBS-01-QA-02` | PM/BA, Design, BE, Web, QA | TL | PO/TL | US-ID-01 policy; DEC-012 | TC-AUTH-005..009; UAT-AUTH-02 |
| EP-02 / US-MST-01 | 3 | `WBS-02-BA-01` master rules → `WBS-02-UX-01` UX-11 → `WBS-02-BE-01` effective master → `WBS-02-WEB-01` → `WBS-02-QA-01` | PM/BA, Design, BE, Web, QA | TL | PO/Finance | Identity/RBAC; DEC-005/006 | TC-MST-001..005; UAT-MST-01 |
| EP-02 / US-MST-02 | 2 | `WBS-02-BA-02` assignment AC → `WBS-02-UX-02` UX-11 → `WBS-02-BE-02` scoped assignment → `WBS-02-WEB-02` → `WBS-02-QA-02` | PM/BA, Design, BE, Web, QA | TL | PO | US-ID-02 | TC-MST-006..009; UAT-MST-02 |
| EP-03 / US-PKG-01 | 3 | `WBS-03-BA-01` submission/proof → `WBS-03-UX-01` UX-02 → `WBS-03-BE-01` purchase/upload scan → `WBS-03-FLT-01` + `WBS-03-WEB-01` → `WBS-03-QA-01` | PM/BA, Design, BE, Flutter, Web, QA | TL | PO/Finance | Identity/package config; DEC-004 | TC-PKG-001..004; UAT-PKG-01 |
| EP-03 / US-PKG-02 | 3 | `WBS-03-BA-02` approval AC → `WBS-03-UX-02` UX-02 → `WBS-03-BE-02` atomic approval/snapshots/outbox → `WBS-03-WEB-02` → `WBS-03-QA-02` | PM/BA, Design, BE, Web, QA | TL | Finance/PO | US-PKG-01; DEC-004/006 | TC-PKG-005..010; UAT-PKG-02 |
| EP-04 / US-LED-01 | 3 | `WBS-04-BA-01` balance semantics → `WBS-04-UX-01` UX-02/03 → `WBS-04-BE-01` ledger query/invariants → `WBS-04-WEB-01` + `WBS-04-FLT-01` → `WBS-04-QA-01` | PM/BA, Design, BE, Web, Flutter, QA | TL | Finance | US-PKG-02 | TC-LED-001..005; UAT-LED-01 |
| EP-04 / US-LED-02 | 3 | `WBS-04-BA-02` SoD adjustment → `WBS-04-UX-02` UX-09 → `WBS-04-BE-02` request/approve/post → `WBS-04-WEB-02` → `WBS-04-QA-02` | PM/BA, Design, BE, Web, QA | TL | PO | US-LED-01, RBAC | TC-RES-005..010; UAT-RES-02 |
| EP-05 / US-CLS-01 | 4 | `WBS-05-BA-01` availability/conflict → `WBS-05-UX-01` UX-06 → `WBS-05-BE-01` → `WBS-05-FLT-01` → `WBS-05-QA-01` | PM/BA, Design, BE, Flutter, QA | TL | Instructor rep | Assignment/branch | TC-CLS-001..004; UAT-CLS-01 |
| EP-05 / US-CLS-02 | 4 | `WBS-05-BA-02` slot lifecycle → `WBS-05-UX-02` UX-07 → `WBS-05-BE-02` class commands → `WBS-05-WEB-01` → `WBS-05-QA-02` | PM/BA, Design, BE, Web, QA | TL | Admin rep/PO | Master, availability; DEC-005/008 | TC-CLS-005..012; UAT-CLS-02 |
| EP-05 / US-CLS-03 | 7 | `WBS-05-BA-03` H-24 semantics → `WBS-05-UX-03` UX-07 → `WBS-05-BE-03` idempotent quota job → `WBS-05-OPS-01` monitoring → `WBS-05-QA-03` | PM/BA, Design, BE, Ops, QA | TL | PO/peer reviewer | Booking stable; DEC-005 | TC-CLASS-001..005; UAT-CLASS-01 |
| EP-06 / US-BKG-01 | 5 | `WBS-06-BA-01` booking/cutoff → `WBS-06-UX-01` UX-03 → `WBS-06-BE-01` transaction/reservation → `WBS-06-FLT-01` + `WBS-06-WEB-01` → `WBS-06-QA-01` | PM/BA, Design, BE, Flutter, Web, QA | TL | Customer/Admin reps | Slot/package/ledger | TC-BOOK-001..010; UAT-BOOK-01 |
| EP-06 / US-BKG-02 | 5 | `WBS-06-BA-02` reschedule branches → `WBS-06-UX-02` UX-04 → `WBS-06-BE-02` atomic move → `WBS-06-FLT-02` + `WBS-06-WEB-02` → `WBS-06-QA-02` | PM/BA, Design, BE, Flutter, Web, QA | TL | Customer/Admin reps | US-BKG-01 | TC-RES-001..004; UAT-RES-01 |
| EP-07 / US-ATT-01 | 6 | `WBS-07-BA-01` Instructor QR → `WBS-07-UX-01` UX-06 → `WBS-07-BE-01` signed token/hour → `WBS-07-FLT-01` → `WBS-07-QA-01` | PM/BA, Design, BE, Flutter, QA | TL | Instructor/Finance | Confirmed slot; DEC-007 | TC-ATT-001..006; UAT-ATT-01 |
| EP-07 / US-ATT-02 | 6 | `WBS-07-BA-02` Customer/backfill windows → `WBS-07-UX-02` UX-05/08 → `WBS-07-BE-02` → `WBS-07-FLT-02` + `WBS-07-WEB-01` → `WBS-07-QA-02` | PM/BA, Design, BE, Flutter, Web, QA | TL | Customer/Admin reps | Booking; DEC-007 | TC-ATT-007..013; UAT-ATT-02 |
| EP-07 / US-ATT-03 | 6 | `WBS-07-BA-03` completion AC → `WBS-07-UX-03` UX-07 → `WBS-07-BE-03` ledger/hour posting → `WBS-07-WEB-02` → `WBS-07-QA-03` | PM/BA, Design, BE, Web, QA | TL | Finance/Admin | ATT-01/02, ledger | TC-ATT-014..020; UAT-ATT-03 |
| EP-08 / US-NOT-01 | 7 | `WBS-08-BA-01` occurrence/fallback → `WBS-08-UX-01` notification states → `WBS-08-BE-01` outbox/adapter/webhook → `WBS-08-WEB-01` + `WBS-08-FLT-01` inbox → `WBS-08-QA-01` | PM/BA, Design, BE, Web, Flutter, QA | TL | PO/Ops | Domain events; DEC-013; provider sandbox | TC-NOTIF-001..008; UAT-NOTIF-01 |
| EP-09 / US-FIN-01 | 8 | `WBS-09-BA-01` report definitions → `WBS-09-UX-01` UX-10 → `WBS-09-BE-01` queries/snapshots → `WBS-09-WEB-01` → `WBS-09-QA-01` | PM/BA, Design, BE, Web, QA, Finance | Finance | TL/PO | Transaction data; DEC-006 | TC-FIN-001..008; UAT-FIN-01 |
| EP-09 / US-FIN-02 | 8 | `WBS-09-BA-02` OtherCost → `WBS-09-UX-02` UX-10 → `WBS-09-BE-02` period guard → `WBS-09-WEB-02` → `WBS-09-QA-02` | PM/BA, Design, BE, Web, QA | Finance | TL/PO | BranchPeriod/RBAC | TC-FIN-009..012; UAT-FIN-02 |
| EP-09 / US-FIN-03 | 9 | `WBS-09-BA-03` close controls → `WBS-09-UX-03` UX-10 → `WBS-09-BE-03` transactional close → `WBS-09-WEB-03` → `WBS-09-QA-03` | PM/BA, Design, BE, Web, QA, Finance | PO | TL/peer reviewer | FIN-01/02; reconciliation | TC-FIN-013..020; UAT-FIN-03 |
| EP-09 / US-FIN-04 | 9 | `WBS-09-BA-04` correction/SoD → `WBS-09-UX-04` UX-10 → `WBS-09-BE-04` journal approval → `WBS-09-WEB-04` → `WBS-09-QA-04` | PM/BA, Design, BE, Web, QA, Finance | PO | TL | Locked period, current open period | TC-FIN-021..026; UAT-FIN-04 |
| EP-10 / US-AUD-01 | 9 | `WBS-10-BA-01` audit access → `WBS-10-UX-01` audit UX → `WBS-10-BE-01` immutable/scoped query → `WBS-10-WEB-01` → `WBS-10-QA-01` | PM/BA, Design, BE, Web, QA | TL | Privacy/peer reviewer | Audit producers; DEC-009 before production | TC-AUD-001..008; UAT-AUD-01 |
| EP-10 / US-OPS-01 | 7 | `WBS-10-BA-02` operator needs → `WBS-10-UX-02` ops UX → `WBS-10-BE-02` restricted diagnostics → `WBS-10-OPS-01` dashboards/runbooks → `WBS-10-QA-02` | PM/BA, Design, BE, Ops, QA | TL | Peer reviewer | Queue/observability; DEC-011/013 | TC-OPS-001..009; UAT-OPS-01 |
| EP-11 / US-MIG-01 | 10–12 | `WBS-11-BA-01` mapping/controls → `WBS-11-UX-01` N/A internal job → `WBS-11-MIG-01` idempotent import → `WBS-11-OPS-01` cutover/rollback → `WBS-11-QA-01` reconciliation/UAT | PM/BA, Data Owner, TL, Ops, QA, Finance | PO | Peer reviewer/business reps | Source inventory, DEC-010, environment | TC-MIG-001..010; UAT-MIG-01; signed controls |

## 3. Role Delivery Plan

| Role | Discovery/Foundation | Build | Hardening/Pilot | Required handoff/output | Accountable decisions |
|---|---|---|---|---|---|
| Product Owner | Scope, priority, decision SLA, Gate 1/2 approval | Sprint goal acceptance, CR decisions, business unblock | UAT/go-no-go/pilot exit | Approved baseline, priorities, business sign-offs | MVP, business rules, release |
| PM/BA | Charter, process, stories/AC, traceability, plan/registers | Refinement one sprint ahead, dependency/risk/status, demo acceptance | Migration/UAT coordination, support intake, handover tracking | READY story pack, decision/risk logs, milestone report | Delivery coordination (not technical/business authority) |
| Designer | IA, design system, UX-01.. priority flows | Approved flow at least one sprint ahead, handoff/design QA | Accessibility/usability fixes, training visuals | Figma node/version, state/copy/token checklist | Design execution; PO approves business flow |
| TL/Backend | ADR/ERD/OpenAPI/security/environment design | Backend, DB migrations, clients contract, code review, CI/CD/observability | Hardening, recovery, incident command, technical readiness | API/schema/event artifacts, backend/tests/runbooks | Technical architecture/release readiness |
| Web | Component foundation and API client review | Internal role flows, tests, accessibility/telemetry | Regression, performance, support fixes | Reviewed PR, UI test/design QA evidence | Web implementation under TL accountability |
| Flutter | Mobile foundation and API client review | Customer/Instructor flows, deep links/QR/notifications/tests | Device/store readiness, crash/support fixes | Reviewed PR, widget/integration/device evidence | Mobile implementation under TL accountability |
| QA | Strategy, test design/data, automation foundation | Shift-left review, API/UI/mobile automation, exploratory/regression | Security/performance/a11y/recovery, UAT/release evidence | Test plan/cases/results/defects, pass/fail | Independent quality recommendation |
| Finance | Formula/config/opening controls | Rate/snapshot/report reviews | Finance UAT, close/reconciliation sign-off | Approved values/control totals/recommendation | Financial correctness |
| Data Owner | Source inventory/profile/mapping | Cleansing and trial extracts | Rehearsal/final reconciliation/parallel run | Versioned source, exceptions, control sign-off | Source-data correctness |
| Operations | Account/environment ownership, access baseline | Monitoring, secrets/config, deployment/runbooks | On-call, cutover, restore, incident/handover | Environment evidence, dashboards, runbooks, access review | Operational execution; TL accountable until handover |
| Privacy/Legal | Consent/retention decision input | PII/export/log review | Production retention/breach readiness | Approved policy/review comments | Privacy/legal policy with PO accountable |
| Peer reviewer | Challenge Gate 1/4 decisions | Risk-based review of ledger/auth/finance/release changes | Security/operability/recovery challenge and KT verification | Independent findings/disposition | Independent review only |

## 4. Capacity Control

PM/BA, TL/BE, Web, Flutter, and QA use the capacity baseline in the Role Charter. Design is 100% in discovery, 40–60% build, 20–30% pilot; business roles increase during UAT/pilot. PM/BA records planned versus available capacity before planning. If committed work exceeds available capacity, the team must reduce scope, split story, add approved capacity, or reforecast; overtime is not a planning assumption.

## 5. WBS Acceptance Rules

- No task is `DONE` without output/evidence and acceptance owner.
- A story is `DONE` only after all applicable WBS chain tasks and parent AC pass.
- `N/A` requires PM/BA and relevant reviewer rationale; it cannot hide UX, security, migration, audit, notification or test impact.
- Shared work (auth framework, design system, CI, generated clients) is linked as a predecessor rather than duplicated in story estimates.
- Story IDs, task IDs, Figma, API/schema, test and evidence links are maintained in the traceability matrix/GitHub issue.

# Sprint 0 Kickoff Pack

**Status:** DRAFT  
**Sprint length:** 2 minggu / 10 hari kerja  
**Facilitator:** PM/BA  
**Accountable:** Product Owner  
**Start date:** 2026-07-18 — AI delivery kickoff; BG-1 is next

Task-level continuation through Sprint 3 is maintained in [Sprint 0–3 Detailed Execution Backlog](06-sprint-0-3-detailed-execution-backlog.md). Sprint 2–3 coding remains blocked according to the current [Readiness Audit](07-sprint-2-3-readiness-audit.md).

## 1. Sprint 0 Goal

Membuat baseline kerja yang dapat direview dan menyiapkan Sprint 1 untuk menutup seluruh prerequisite coding: governance, priority requirements/design/technical contracts, test/data baseline, dan environment ownership. Sprint 0 tidak mengotorisasi coding aplikasi.

## 2. Required Participants

PO, PM/BA, Designer, TL/Backend, QA, Web, Flutter, Data Owner, Finance, Operations, dan independent peer reviewer. Nama boleh belum terisi saat dokumen disusun, tetapi kickoff tidak dimulai tanpa PO, PM/BA, TL, QA, dan owner untuk design/data/environment dependencies.

## 3. Kickoff Agenda

| Agenda | Owner | Duration | Required output |
|---|---|---:|---|
| Vision, MVP/post-pilot, success and six-month constraint | PO | 30m | Shared scope statement |
| Role, RACI, authority and decision SLA | PM/BA | 30m | Confirmed role map/escalation |
| Gate 1–5 and no-coding prerequisites | PM/BA/TL/QA | 30m | Gate/evidence owners |
| Architecture/data/API/security baseline | TL | 45m | Review plan and blocking decisions |
| UX delivery sequence | Designer | 30m | UX-01/02/03 schedule and reviewers |
| Quality/UAT/release expectations | QA | 30m | Test/evidence ownership |
| Data migration and Finance controls | Data Owner/Finance | 30m | Source/config action list |
| Environment/accounts/access | Ops/TL | 30m | Dependency/account register |
| Sprint goal, tasks, capacity and risks | PM/BA | 45m | Committed Sprint 0 board |

## 4. Working Agreement

- Repository documentation, Figma, and issue tracker are authoritative for their declared areas; decisions are linked, not retained only in chat.
- Daily sync on working days; blocker logged same day. PO decision SLA is two working days.
- Required review uses work identity. No production PII, credential, OTP or secret in documents/issues/evidence.
- Meeting decisions record ID, owner, date, rationale and affected artifacts. Material change follows CR after approval baseline.
- Story/task status follows the Sprint Playbook; no partial DONE and no unreviewed handoff.
- Working hours/timezone, communication channels, emergency contacts and language are filled at kickoff; absence is an owned dependency.

## 5. Accounts and Access Checklist

| System | Organization owner | Required roles/access | Backup admin | Evidence/status |
|---|---|---|---|---|
| Source repository/issues | Daily Dose/TBD | PO, PM/BA, TL, dev, QA; branch protection | TBD-BLOCKING | TBD-BLOCKING |
| Figma | Daily Dose/TBD | Designer edit; team comment/view | TBD-BLOCKING | TBD-BLOCKING |
| Cloud/DNS/storage/database/cache | TBD via DEC-011 | TL/Ops admin; restricted engineers | TBD-BLOCKING | TBD-BLOCKING |
| Google identity | Daily Dose/TBD | Authorized integration admins | TBD-BLOCKING | TBD-BLOCKING |
| Meta Business/WhatsApp | Daily Dose/TBD | PO/TL/Ops and template owner | TBD-BLOCKING | TBD-BLOCKING |
| Mobile stores/signing | Daily Dose/TBD | Flutter release + PO/Ops | TBD-BLOCKING | TBD-BLOCKING |
| Monitoring/error tracking | Daily Dose/TBD | TL/Ops/QA | TBD-BLOCKING | TBD-BLOCKING |
| Secret manager | Daily Dose/TBD | Ops-managed least privilege | TBD-BLOCKING | TBD-BLOCKING |

Account provisioning is not proof of environment readiness; access review, MFA, ownership and revocation path are also required.

## 6. Sprint 0 Tasks by Role

| Task ID | Role (R) | Activity/output | A | Reviewer | Dependency | Acceptance/evidence |
|---|---|---|---|---|---|---|
| S0-PO-01 | PO | Confirm MVP/post-pilot, priority and DEC-004/005/006/007/008/013/014 decision owner/due | PO | PM/BA/TL | Business availability | Updated decision register; no hidden priority |
| S0-PM-01 | PM/BA | Run Gate 1 review preparation and close document cross-comments | PO | TL/QA/peer | Assigned reviewers | G1 signed-review draft fully populated except signatures |
| S0-PM-02 | PM/BA | Refine Sprint 2–3 stories/WBS and traceability | PO | TL/Design/QA | Decision owners | DoR matrix with blocker/owner/due |
| S0-UX-01 | Designer | IA, navigation and design-system foundation | PO | PM/BA/Web/Flutter/QA | Figma account | Versioned handoff draft |
| S0-UX-02 | Designer | UX-01/02/03 full state/prototype plan and first review | PO | PM/BA/dev/QA | Refined stories | Review comments and approval schedule |
| S0-TL-01 | AI TL | Review ADR-001..009, ERD/data invariants, OpenAPI and error/event/security contracts | AI TL | AI Web/Flutter/QA/peer | BG-0 documentation | Finding/disposition register; DEC-011/012 recommendation |
| S0-TL-02 | TL | Define auth/ledger concurrency test approach and scaffold/environment execution checklist | TL | QA/Ops/peer | S0-TL-01 | Approved technical work package |
| S0-QA-01 | QA | Validate test strategy, DD-QA-001 and critical cases for S2–3 | QA | TL/PM/BA | Refined AC/API | Test mapping and data corrections closed |
| S0-QA-02 | QA | Create browser/device decision item and automation/environment dependencies | QA | TL/PO | Pilot inventory if available | DEC-QA-001 owner/due and tooling plan |
| S0-DATA-01 | Data Owner | Inventory/version candidate source exports and data owners | PO | PM/BA/TL/QA | Source access | SRC register populated; no production extract copied to unsafe place |
| S0-FIN-01 | Finance | Identify package/rate/quota/fee source and approve formula/control review schedule | PO | PM/BA/TL/QA | Business records | DEC-004/005/006 inputs/owners; control list |
| S0-OPS-01 | Ops | Inventory provider/account/environment dependencies and ownership | TL | PO/QA/peer | DEC-011 options | DEP register, account matrix, access baseline |
| S0-REV-01 | Peer reviewer | Challenge Gate 1 and proposed auth/ledger/environment risks | PO/TL by area | PM/BA | Independent assignment | Prioritized findings with blocker status |

## 7. Ten-Day Execution Schedule

| Day | Focus/output |
|---:|---|
| 1 | Kickoff, working agreement, Sprint 0 board, access/dependency owners |
| 2 | Scope/decision workshop; source/account inventory starts |
| 3 | Story refinement S2–3; IA/design system; ADR/ERD review |
| 4 | UX-01/02/03 working review; OpenAPI/security/test review |
| 5 | Gate/document comments, DD-QA-001 validation, data profiling plan; mid-sprint health check |
| 6 | Auth/ledger concurrency workshop; design revision; Finance/config workshop |
| 7 | WBS/traceability/DoR review; environment/scaffold checklist |
| 8 | Independent peer challenge; test/migration dependency review |
| 9 | Close/assign comments, prepare Gate 1 record and Sprint 1 backlog |
| 10 | Sprint review, PO decisions/acceptance, retrospective, Sprint 1 readiness/forecast |

## 8. Sprint 0 Exit Criteria

Sprint 0 succeeds when:

- Gate 1 review package is populated and scheduled; unresolved items have owner/due and correct blocker state.
- Sprint 2–3 priority stories have complete DoR assessment and traceability; no hidden design/API/test dependency.
- UX-01/02/03 and design-system work have versioned artifacts, review comments and approval plan.
- ADR/ERD/OpenAPI/auth-ledger review findings are dispositioned or owned; technical review for Sprint 1 is scheduled.
- DD-QA-001/test approach is reviewed; browser/device decision and automation dependencies are owned.
- Source inventory and migration profiling plan exist; Finance/config inputs have owner/due.
- Environment/provider/accounts/access dependencies have named role owner and critical-path impact.
- Sprint 1 backlog and goal are ordered against closing Gate 1/2/4/5 and priority Gate 3.

Sprint 0 does not require gates to be PASS; Sprint 1 is responsible for closing prerequisite gates. A missing required role, unsafe data handling, or unowned critical dependency makes Sprint 0 exit `FAIL` and prevents a false readiness claim.

## 9. Kickoff Sign-off

Record sprint dates, capacity by role, communication channel, working timezone, emergency path, accepted goal, task assignments, risks and PO acceptance. Link the exact version/commit of this pack. Sign-off does not approve application production behavior or bypass any gate.

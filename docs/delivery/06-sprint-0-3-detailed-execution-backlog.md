# Sprint 0–3 Detailed Execution Backlog

**Status:** DRAFT  
**Owner:** PM/BA  
**Approver:** Product Owner  
**Rule:** `BUILD-BLOCKED` until Gate 1, 2, 4, 5 and applicable Gate 3 flow are PASS

## 1. Task Contract

Every task has one accountable role, evidence-based acceptance, and explicit predecessor. Day targets are relative working days inside a two-week sprint and are re-estimated at planning without changing dependency order. `TBD-BLOCKING` cannot be interpreted as permission to start dependent implementation.

Statuses: `PLANNED`, `BLOCKED`, `READY`, `IN PROGRESS`, `REVIEW`, `DONE`. All Sprint 2–3 implementation tasks start `BLOCKED` in this document.

## 2. Sprint 0 — Discovery Inputs and Review Preparation

| ID / day | Activity and output | Input | R / A | Reviewer | Dependency | Acceptance/evidence | Status |
|---|---|---|---|---|---|---|---|
| S0-PO-01 / D2 | Assign owner/due for DEC-004..014 and confirm priority | Decision register | PO / PO | PM/BA, TL | PO availability | Every blocking decision has owner, due trigger, affected story | PLANNED |
| S0-PM-01 / D1–9 | Populate Gate 1 review package and comment register | DOC-GOV-01..06 | PM/BA / PO | TL, QA, peer | Assigned reviewers | Exact versions and all comments have disposition/owner | BLOCKED |
| S0-PM-02 / D3–7 | Review/refine eight detailed Sprint 2–3 stories and exact AC traceability | DOC-PROD-04/05, PRD, WBS, OpenAPI | PM/BA / PO | Design, TL, QA, Finance/Data | S0-PO-01 | Every G2 comment has owner/disposition; gaps remain explicit | BLOCKED |
| S0-UX-01 / D3–7 | IA/design system and UX-01/02/03/11 state inventory | UX contract, stories | Designer / PO | PM/BA, Web, Flutter, QA | Figma account | Versioned nodes/draft states and comment log | BLOCKED |
| S0-TL-01 / D3–8 | Review ADR/ERD/OpenAPI/security for Sprint 2–3 | Technical baseline | TL / TL | Web, Flutter, QA, peer | TL assigned | Finding IDs, severity, disposition and remediation | BLOCKED |
| S0-TL-02 / D6–9 | Auth/ledger concurrency and scaffold execution checklist | S0-TL-01 | TL / TL | QA, Ops, peer | S0-TL-01 | Accepted approach and test linkage | BLOCKED |
| S0-QA-01 / D4–8 | Validate DD-QA-001 and Sprint 2–3 test mappings | AC, contracts, dataset | QA / QA | PM/BA, TL | S0-PM-02 | Expected results and missing case actions documented | BLOCKED |
| S0-DATA-01 / D2–8 | Source inventory/profile plan without unsafe copy | Migration workbook | Data Owner / PO | PM/BA, QA, TL | Source access | SRC owner/version/classification/checksum plan | BLOCKED |
| S0-FIN-01 / D2–7 | Identify source/approver for package, quota, fee/rate | Business records | Finance / PO | PM/BA, TL | Finance available | DEC-004/005/006 inputs and evidence owners | BLOCKED |
| S0-OPS-01 / D2–8 | Provider/account/environment ownership inventory | Environment plan | Ops / TL | PO, QA, peer | Ops owner | DEP/config/access register populated | BLOCKED |
| S0-REV-01 / D8 | Independent challenge of Gate/auth/ledger/environment | Review packs | Peer / PO or TL by area | PM/BA | Peer assigned; upstream drafts | Prioritized findings and blocker classification | BLOCKED |
| S0-REV-02 / D3–8 | Populate Gate 2–4 review records, blocker board and decision workshop evidence | DOC-GOV-08/09, G2/G3/G4 templates | PM/BA / PO | TL, Design, QA | Named reviewers and business evidence | Exact baseline, comment IDs, decisions and factual gate outcomes recorded | BLOCKED |
| S0-UX-02 / D3–8 | Produce 23 Figma nodes/prototypes in prescribed queue and run cross-role checklist | DOC-DES-03, text handoff | Designer / PO | PM/BA, Web, Flutter, QA | Figma file/designer | Every screen has exact node/version and review disposition | BLOCKED |
| S0-TL-03 / D3–8 | Review CTG-001–012 and response applicability workbook | DOC-TECH-08, OpenAPI checksum | TL / TL | Web, Flutter, QA, Finance, peer | Named reviewers; DEC inputs | Findings have severity, owner, disposition; no silent contract change | BLOCKED |
| S0-PM-03 / D10 | Sprint 0 exit and Sprint 1 ordered backlog | All S0 evidence | PM/BA / PO | Team | Prior tasks reviewed | Exit PASS/FAIL and forecast recorded | PLANNED |

## 3. Sprint 1 — Close Prerequisite Gates

| ID / day | Activity and output | Input | R / A | Reviewer | Dependency | Acceptance/evidence | Status |
|---|---|---|---|---|---|---|---|
| S1-GOV-01 / D1–4 | Close Gate 1 comments and signed record | S0-PM-01, peer findings | PM/BA / PO | TL, peer | Named PIC/reviewers | APR-001 exact version and signatures; Gate 1 factual result | BLOCKED |
| S1-REQ-01 / D1–5 | Baseline DOC-PROD-04/05 using G2-REV-001 | Detailed stories, traceability, readiness audit, review pack | PM/BA / PO | TL, Design, QA, Finance/Data | Decisions due for S2–3 | APR-002 exact baseline or explicit blocker; Gate 2 factual result | BLOCKED |
| S1-UX-01 / D1–7 | Complete and approve priority flows using production queue and G3-REV-001 | S0-UX-01/02 | Designer / PO | PM/BA, Web/Flutter, QA | Figma account; story baseline | Exact nodes/version/signatures; applicable flow factual result | BLOCKED |
| S1-TECH-01 / D1–6 | Resolve CTG findings and complete G4-REV-001 for ADR/ERD/OpenAPI/security baseline | S0-TL-01/02/03 | TL / TL | Web, Flutter, QA, Finance, peer | DEC-011/012/014; contract gaps | APR-004 exact checksum with comments closed or Gate 4 remains blocked | BLOCKED |
| S1-QA-01 / D2–7 | Finalize Sprint 2–3 test/data/environment entry | S0-QA-01 | QA / QA | TL, PM/BA | Technical/story baseline | Test IDs, data, expected results and automation owner | BLOCKED |
| S1-MIG-01 / D2–6 | Approve initial mapping/source profile approach | S0-DATA-01 | PM/BA / PO | Data Owner, TL, QA, Finance | Source owners | G5 migration evidence or explicit blocker | BLOCKED |
| S1-ENV-01 / D2–7 | Approve provider-neutral environment/scaffold execution pack | S0-OPS-01, S0-TL-02 | Ops, TL / TL | QA, peer, PO | DEC-011 owner/due | G5 environment evidence; no unowned critical dependency | BLOCKED |
| S1-GATE-01 / D8 | Consolidated Gate 1/2/4/5 and priority Gate 3 review | Above evidence | PM/BA / PO | TL, QA | All gate reviews | Each gate PASS/BLOCKED with exact evidence; no conditional coding | BLOCKED |
| S1-PLAN-01 / D9 | Story pointing/capacity and Sprint 2 proposal | READY stories | PM/BA / PO | Team | Required gates PASS | Estimate, assignee role, reviewer and sprint goal | BLOCKED |
| S1-REVIEW-01 / D10 | Sprint review/decision and coding authorization status | Gate/capacity report | PM/BA / PO | Team/steering | S1-GATE-01 | Written GO for Sprint 2 only if all prerequisites pass | BLOCKED |

## 4. Sprint 2 — Identity, RBAC and Assignment

Entry: Gate 1/2/4/5 PASS; UX-01 and required UX-11 Gate 3 PASS; DEC-012/014 approved; environment and generated-client pipeline ready.

| ID / story | Activity and output | Input | R / A | Reviewer | Dependency | Acceptance/evidence | Initial status |
|---|---|---|---|---|---|---|---|
| WBS-01-BA-01 / ID-01 | Confirm login/recovery AC/error/copy and traceability | Approved DEC-012/014, UX-01 | PM/BA / PO | TL, QA | Sprint entry | Story issue READY and linked | BLOCKED |
| WBS-01-UX-01 / ID-01 | Final UX-01 handoff/design QA criteria | Approved story | Designer / PO | Flutter, QA | BA task | Approved node/version/state checklist | BLOCKED |
| WBS-01-BE-01 / ID-01 | Google/OTP/session/recovery backend and migration | OpenAPI/schema/security contract | BE/TL / TL | QA, peer | BA+technical gate | Unit/integration/contract/security tests; safe telemetry | BLOCKED |
| WBS-01-FLT-01 / ID-01 | Customer mobile login/recovery client | Generated Dart client, UX-01 | Flutter / TL | Designer, QA | BE contract stable | Widget/integration states and design evidence | BLOCKED |
| WBS-01-QA-01 / ID-01 | Execute TC-AUTH-001..004 and evidence | Build, DD-QA-001 | QA / QA | TL, PM/BA | Deploy to QA | AC pass; no OTP/PII leak; defect disposition | BLOCKED |
| WBS-01-BA-02 / ID-02 | Internal invite/MFA/deactivate AC | DEC-012, UX-11 | PM/BA / PO | TL, QA | Sprint entry | READY story and role matrix | BLOCKED |
| WBS-01-UX-02 / ID-02 | Internal auth/MFA/deactivation states | Story/permission matrix | Designer / PO | Web, QA | BA task | Approved UX-11 subset | BLOCKED |
| WBS-01-BE-02 / ID-02 | Invite, Google internal auth, MFA assurance, revoke | API/schema | BE/TL / TL | QA, peer | Technical contract | API/integration/authz evidence | BLOCKED |
| WBS-01-WEB-01 / ID-02 | Web internal sign-in/MFA/session UI | Generated TS client, UX | Web / TL | Designer, QA | BE contract | Component/E2E/a11y evidence | BLOCKED |
| WBS-01-QA-02 / ID-02 | Execute TC-AUTH-005..009 | Stable build | QA / QA | TL, PM/BA | Deploy to QA | Role/branch/MFA/deactivation pass | BLOCKED |
| WBS-02-BA-02 / MST-02 | Assignment rules and AC | BR-005,030–031 | PM/BA / PO | TL, QA | Identity policy | READY story | BLOCKED |
| WBS-02-UX-02 / MST-02 | Owner/instructor assignment UX | UX-11 | Designer / PO | Web, QA | BA task | Approved states/confirmation | BLOCKED |
| WBS-02-BE-02 / MST-02 | Effective assignment and scoped APIs | OpenAPI/schema | BE/TL / TL | QA | ID-02 | Constraint/authz tests | BLOCKED |
| WBS-02-WEB-02 / MST-02 | Assignment management UI | Generated client, UX | Web / TL | Designer, QA | BE contract | UI/test/audit evidence | BLOCKED |
| WBS-02-QA-02 / MST-02 | TC-MST-006..009 and branch leakage tests | Build/data | QA / QA | TL, PM/BA | Deploy | AC and authorization pass | BLOCKED |
| S2-BIZ-01 / M2 partial | Sprint demo and acceptance disposition | QA evidence | PM/BA / PO | Business reps | Story QA results | Accepted/rejected outcome and Sprint 3 carryover none/owned | BLOCKED |

## 5. Sprint 3 — Master, Purchase, Package and Ledger

Entry: Sprint 2 accepted identity/RBAC/assignment; DEC-004/005/006 approved for applicable stories; UX-02/03/09/11 portions approved; upload/storage adapter and QA environment ready.

| Task package / story | Role-level outputs | R / A | Reviewer | Dependency | Acceptance/evidence | Initial status |
|---|---|---|---|---|---|---|
| `WBS-02-BA/UX/BE/WEB/QA-01` / MST-01 | Effective master AC → UX-11 → master APIs/constraints → web UI → TC-MST-001..005 | PM/BA, Design, BE, Web, QA / TL | PO, Finance | DEC-005/006; ID-02 | No overlap; audit/effective-date behavior; UAT-MST-01 prep | BLOCKED |
| `WBS-03-BA/UX/BE/FLT/WEB/QA-01` / PKG-01 | Purchase submission/proof AC → UX-02 → private upload/scan → Flutter/Web entry → TC-PKG-001..004 | Delivery roles / TL | PO, Finance, peer security | DEC-004; identity; storage adapter | Unsafe file denied; private access; pending state/audit | BLOCKED |
| `WBS-03-BA/UX/BE/WEB/QA-02` / PKG-02 | Approval/reject AC → UX-02 → transactional snapshots/ledger/outbox → review UI → TC-PKG-005..010 | Delivery roles / TL | Finance, PO, peer | PKG-01; DEC-004/006 | One package/PURCHASE/outbox on retries/concurrency | BLOCKED |
| `WBS-04-BA/UX/BE/WEB/FLT/QA-01` / LED-01 | Balance semantics → UX-02/03 → ledger/reservation query/invariants → clients → TC-LED-001..005 | Delivery roles / TL | Finance | PKG-02 | Total/reserved/available/expiry exact; no negative/invariant leak | BLOCKED |
| `WBS-04-BA/UX/BE/WEB/QA-02` / LED-02 | Adjustment/SoD AC → UX-09 → request/approval/post → web UI → TC-RES-005..010 | Delivery roles / TL | PO, Finance | LED-01, RBAC | No self-approve; one append-only referenced adjustment/audit | BLOCKED |
| S3-QA-REG-01 | Sprint 2 auth/RBAC regression plus Sprint 3 E2E purchase→ledger | QA / QA | TL, PM/BA | All build packages | Critical regression and concurrency evidence | BLOCKED |
| S3-BIZ-01 | M2 staging demo and outcome acceptance | PM/BA / PO | Finance/business reps | QA pass | M2 accepted or blockers/forecast recorded | BLOCKED |

Slash task packages in Sprint 3 expand to the exact unique WBS IDs already defined in the WBS document; they are display compression only and do not create a new ID format.

## 6. Sprint 0–3 Exit Evidence Index

Evidence folders/links must distinguish governance approval, design versions, technical contract checksum, CI/build, test results, decision/config approval and business acceptance. M2 is complete only when Sprint 2–3 target stories pass QA, are demonstrated in staging, and PO records acceptance with no related P1/P2.

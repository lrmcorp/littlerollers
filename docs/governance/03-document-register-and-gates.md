# Document Register, Baseline & Delivery Gates

**Status:** DRAFT  
**Version:** 0.1  
**Owner:** PM/BA  
**Final approver:** Product Owner

Dokumen repository adalah calon source of truth baru. PDF `Spesifikasi Sistem Daily Dose Pilates v1.0` dipertahankan sebagai sumber bisnis historis. Isi PDF baru dianggap baseline repository setelah direkonsiliasi, direview, dan disetujui pada Gate 1.

## 1. Status dan Aturan Baseline

- `DRAFT`: dapat dipakai untuk refinement, tidak boleh menjadi dasar production behavior.
- `IN_REVIEW`: lengkap untuk ruang lingkupnya dan sedang menunggu reviewer wajib.
- `APPROVED`: baseline aktif; perubahan material wajib memakai `CR-xxx`.
- `SUPERSEDED`: digantikan versi APPROVED yang ditautkan.
- `TBD-BLOCKING`: nilai/assignment belum diputuskan dan memblokir gate/story yang disebutkan.
- Placeholder configuration tidak boleh digunakan di production tanpa `DEC-xxx`, approver, effective date, dan evidence konfigurasi.

## 2. Master Document Register

| ID | Dokumen/artefak | Owner | Reviewer wajib | Approver | Version | Status | Last review | Gate |
|---|---|---|---|---|---|---|---|---|
| DOC-GOV-01 | Project Charter & Governance | PM/BA | TL, QA, fungsi bisnis | PO | 0.1 | DRAFT | TBD-BLOCKING | G1 |
| DOC-GOV-02 | Roles, RACI & Vendor SOW | PM/BA | TL, Finance | PO | 0.1 | DRAFT | TBD-BLOCKING | G1 |
| DOC-GOV-03 | Document Register & Gates | PM/BA | TL, QA | PO | 0.1 | DRAFT | TBD-BLOCKING | G1 |
| DOC-GOV-04 | Reconciliation & Decision Register | PM/BA | TL, QA, fungsi bisnis | PO | 0.1 | DRAFT | TBD-BLOCKING | G1 |
| DOC-GOV-05 | Candidate Selection & Scorecards | N/A | N/A | N/A | 0.1 | SUPERSEDED — human staffing only | 2026-07-18 | None |
| DOC-GOV-06 | Gate 1 Signed Review Record | AI Product/BA | AI TL and independent AI review pass | PO for business baseline | 0.1 | DRAFT | TBD-BLOCKING | G1/PG-1 |
| DOC-DEL-01 | Master Implementation Plan | PM/BA | TL, Design, QA, business functions | PO | 0.1 | DRAFT | TBD-BLOCKING | G1/G5 |
| DOC-DEL-02 | WBS & Role Delivery Plan | PM/BA | All delivery role leads | PO | 0.1 | DRAFT | TBD-BLOCKING | G2/G5 |
| DOC-DEL-03 | Handoff Matrix & Sprint Playbook | PM/BA | TL, QA, Design | PO/TL/QA by policy | 0.1 | DRAFT | TBD-BLOCKING | G5 |
| DOC-DEL-04 | Environment, CI/CD & Release Plan | TL | QA, Ops, peer reviewer | TL; PO release | 0.1 | DRAFT | TBD-BLOCKING | G4/G5 |
| DOC-DEL-05 | Sprint 0 Kickoff Pack | PM/BA | All role owners | PO | 0.1 | DRAFT | TBD-BLOCKING | G1/G5 |
| DOC-DEL-06 | Sprint 0–3 Detailed Execution Backlog | PM/BA | Design, TL, QA, business owners | PO | 0.1 | DRAFT | TBD-BLOCKING | G2/G5 |
| DOC-DEL-07 | Sprint 2–3 Readiness Audit | PM/BA | Design, TL, QA | PO/TL/QA by evidence | 0.1 | DRAFT | 2026-07-18 | G2/G3/G4/G5 |
| DOC-DEL-08 | Pre-coding Readiness & Consolidated Blocker Ledger | PM/BA | PO, TL, Design, QA, business/operations roles | PO/TL/QA by gate | 0.1 | DRAFT | 2026-07-18 | G1/G2/G3/G4/G5 |
| DOC-GOV-07 | Business Configuration & Decision Workbook | PM/BA | TL, Finance, Privacy/Ops as applicable | PO | 0.1 | DRAFT | TBD-BLOCKING | G2/G4/G5 |
| DOC-GOV-08 | Gate 2–4 Review & Approval Pack | PM/BA | TL, Designer, Web, Flutter, QA, Finance, peer | PO/TL by gate | 0.1 | DRAFT | 2026-07-18 | G2/G3/G4 |
| DOC-GOV-09 | Decision Closure Workshop Pack | PM/BA | PO, TL, Finance, QA/security, Ops, Privacy | PO/TL by decision | 0.1 | DRAFT | 2026-07-18 | G2/G4/G5 |
| DOC-GOV-10 | External Activation Execution Pack | N/A | N/A | N/A | 0.1 | SUPERSEDED — human staffing only | 2026-07-18 | None |
| DOC-GOV-11 | AI Delivery Operating Model & Coding Authorization | AI Product/BA | AI TL/QA/Peer | Product Owner for business/production boundary | 0.1 | ACTIVE WORKING MODEL | 2026-07-18 | BG-0/BG-1/PG-1 |
| DOC-QA-02 | Sprint 2–3 Interface & Test Readiness | QA | PM/BA, TL | QA/TL | 0.1 | DRAFT | 2026-07-18 | G4/G5 |
| DOC-QA-03 | Remaining MVP Contract & UX Readiness | QA | PM/BA, TL, Designer, client/business roles | QA/TL | 0.1 | DRAFT | 2026-07-18 | G3/G4/G5 |
| DOC-PROD-01 | PRD & Business Rules | PM/BA | TL, QA, Data Owner, Finance | PO | 0.1 | DRAFT | TBD-BLOCKING | G2 |
| DOC-PROD-02 | Backlog & Traceability | PM/BA | Design, TL, QA | PO | 0.1 | DRAFT | TBD-BLOCKING | G2 |
| DOC-PROD-03 | MVP Implementation Backlog | PM/BA | Design, TL, QA, Finance/Data | PO | 0.1 | DRAFT | 2026-07-18 | G2 |
| DOC-PROD-04 | Sprint 2–3 Detailed Story Specification | PM/BA | TL, Designer, QA, Finance/Data | PO | 0.1 | DRAFT | 2026-07-18 | G2 |
| DOC-PROD-05 | Sprint 2–3 Traceability & Gate 2 Review Workbook | PM/BA | TL, Designer, QA, Finance/Data | PO | 0.1 | DRAFT | 2026-07-18 | G2 |
| DOC-PROD-06 | Remaining MVP Detailed Story Specification | PM/BA | TL, Designer, QA, Finance, Data, Ops, Privacy | PO | 0.1 | DRAFT | 2026-07-18 | G2 |
| DOC-PROD-07 | Remaining MVP Traceability, Readiness & Review | PM/BA | TL, Designer, QA, Finance, Data, Ops, Privacy | PO | 0.1 | DRAFT | 2026-07-18 | G2/G3/G4/G5 |
| DOC-DES-01 | UX/UI Delivery Specification | Designer | PM/BA, Web, Flutter, QA | PO | 0.1 | DRAFT | TBD-BLOCKING | G3 |
| DOC-DES-02 | Priority Flow Screen-Level Handoff | Designer | PM/BA, Web, Flutter, QA | PO | 0.1 | DRAFT | 2026-07-18 | G3 |
| DOC-DES-03 | Priority Figma Production & Review Pack | Designer | PM/BA, Web, Flutter, QA | PO | 0.1 | DRAFT | 2026-07-18 | G3 |
| DOC-DES-04 | Remaining MVP Screen-level Handoff Queue | Designer | PM/BA, Web, Flutter, QA, business roles | PO | 0.1 | DRAFT | 2026-07-18 | G3 |
| DOC-DES-05 | Remaining MVP Detailed Screen Handoff | Designer | PM/BA, Web, Flutter, QA, Finance/Ops/Data | PO | 0.1 | DRAFT | 2026-07-18 | G3 |
| DOC-TECH-01 | Solution Architecture | TL | Web, Flutter, QA | TL | 0.1 | DRAFT | TBD-BLOCKING | G4 |
| DOC-TECH-02 | Data/API/Security/Operations | TL | Web, Flutter, QA | TL | 0.1 | DRAFT | TBD-BLOCKING | G4 |
| DOC-TECH-03 | ADR Baseline | TL | Web, Flutter, QA | TL | 0.1 | DRAFT | TBD-BLOCKING | G4 |
| DOC-TECH-04 | Data Dictionary & ERD | TL | QA, Finance | TL | 0.1 | DRAFT | TBD-BLOCKING | G4 |
| DOC-TECH-05 | OpenAPI Contract | TL | Web, Flutter, QA | TL | 0.1 | DRAFT | TBD-BLOCKING | G4 |
| DOC-TECH-06 | Event, Error & Security Contract | TL | QA, PM/BA | TL | 0.1 | DRAFT | TBD-BLOCKING | G4 |
| DOC-TECH-07 | MVP Proposed Contract Manifest | TL | Web, Flutter, QA, Finance/Ops/Data, peer reviewer | TL | 0.4-draft | PROPOSED | 2026-07-18 | G4 |
| DOC-TECH-08 | Technical Contract Review Workbook | TL | Web, Flutter, QA, Finance, peer reviewer | TL | 0.1 | DRAFT | 2026-07-18 | G4 |
| DOC-QA-01 | Test/UAT/Release | QA | PM/BA, TL | QA pass/fail; PO release | 0.1 | DRAFT | TBD-BLOCKING | G5 |
| DOC-MIG-01 | Migration/Pilot/Support | PM/BA | TL, QA, Data Owner, Finance | PO | 0.1 | DRAFT | TBD-BLOCKING | G5 |

Versi dan review date diperbarui pada Pull Request yang mengubah isi material. Link approval harus dicatat pada Approval Evidence Register.

## 3. Gate Register

Gate `G1–G5` below are retained as formal completeness/production-readiness checklists. Under the AI delivery model they do not block repository scaffold or local/synthetic implementation. Coding authorization is controlled by the Build Gate register that follows.

| Gate | Exit criteria | Evidence minimum | Accountable | Status |
|---|---|---|---|---|
| G1 Baseline | Scope, terminology, AI role model, document ownership, reconciliation and business decision backlog reviewed | DOC-GOV-01..04 plus DOC-GOV-11; AI review evidence; PO business disposition | PO | OPEN — production checklist; not BG-1 blocker |
| G2 Requirements | Seluruh epic MVP memiliki story/AC; seluruh BR punya owner, API/schema, test, UAT mapping | Traceability tanpa gap MVP selain decision yang eksplisit memblokir story | PO | BLOCKED |
| G3 Design | Flow UI terkait memiliki Figma approved, state, validation, copy, responsive dan accessibility handoff | Figma node/version + review Design/PM/dev/QA + PO approval | PO | BLOCKED |
| G4 Technical | ADR, ERD/data dictionary, OpenAPI, event/error/security contract selesai | Review Web/Flutter/QA dan TL approval | TL | BLOCKED |
| G5 Delivery readiness | Test/UAT, migration mapping awal, environment strategy, release gates siap | QA review, migration owner review, dependency register | PO | BLOCKED |
| G6 Pilot | Migration rehearsal, UAT, security/restore/regression, support dan no P1/P2 | Signed go-live checklist | PO | NOT STARTED |

### Build Gate Register

| Gate | Exit criteria | Evidence | Status |
|---|---|---|---|
| BG-0 Documentation | Requirement, UX text, API/schema, tests and delivery plan sufficiently detailed for safe scaffold | 24 stories, 96 AC, OpenAPI 0.4 validation, 52 screen handoffs, QA/migration/release documents | PASS — coding authorized |
| BG-1 Scaffold | Monorepo/local dependencies/generated clients/CI build successfully | [BG-1 implementation evidence](../delivery/09-bg-1-implementation-evidence.md) dan [Current Work Register](../delivery/10-current-work-register.md) | PASS — local evidence dan hosted GitHub Actions pada commit `8cd2ce3` hijau |
| BG-2 Story implementation | Applicable AC and automated tests pass; unresolved production input remains config-blocked | foundation PASS; ID-01/02 dan MST-02 LOCAL_PASS; MST-01 PASS synthetic non-production | IN_PROGRESS |
| BG-3 Integrated demo | Synthetic E2E and non-functional evidence pass | demo, E2E, accessibility/security/finance checks | PENDING |
| PG-1 Production | Real DEC/CFG/provider/account/migration/UAT/release evidence complete | G1–G5/G6 applicable sign-offs | BLOCKED |

Gate hanya berubah menjadi `PASS` setelah seluruh evidence tertaut. `CONDITIONAL PASS` tidak mengizinkan production release dan hanya boleh mengizinkan discovery/prototype dengan exception berjangka.

## 4. Approval Evidence Register

| Evidence ID | Artefak/gate | Version/commit | Reviewer result | Approver/date | Link | Status |
|---|---|---|---|---|---|---|
| APR-001 | Gate 1 baseline | Baseline commit `6aa4646`; DEC-001–003 approved; AI operating model active | Local AI QA/peer review recorded; production baseline review remains open | Reyner / 2026-07-18; production-baseline sign-off pending | [Gate 1 Signed Review Record](../templates/gate-1-signed-review-record.md) — DRAFT | OPEN — does not block BG-1 |
| APR-002 | Gate 2 requirements | Baseline commit `6aa4646` | AI Product/TL/QA production review evidence pending | Reyner / final business evidence TBD-BLOCKING | [G2-REV-001](../templates/gate-2-signed-review-record.md) — DRAFT | OPEN — does not block BG-1 |
| APR-003 | Gate 3 design | Repository UI evidence/Figma version TBD-BLOCKING | AI Designer/Web/Flutter/QA review evidence pending | Reyner visual acceptance TBD-BLOCKING | [G3-REV-001](../templates/gate-3-signed-review-record.md) — DRAFT | OPEN — production visual acceptance; not BG-1 blocker |
| APR-004 | Gate 4 technical | OpenAPI `0.7.0-draft` checksum `9fc4e444120499589918244d6522a3f9f3853418df21291e4b38db8735c238f2`; BG-1 commit `8cd2ce3` | Identity/assignment/effective-master local evidence; current hosted review pending; production technical review remains pending | AI TL BG-1 disposition PASS; production disposition pending | [G4-REV-001](../templates/gate-4-signed-review-record.md) — DRAFT | OPEN — production gate; BG-1 PASS |
| APR-005 | Gate 5 readiness | TBD-BLOCKING | TBD-BLOCKING | TBD-BLOCKING | TBD-BLOCKING | OPEN |

## 5. Readiness Rules

- Coding scaffold dan local/synthetic implementation dapat dimulai setelah BG-0 `PASS`; kondisi ini sudah terpenuhi.
- Unresolved `TBD-BLOCKING` business values/policies use configuration-required behavior or feature flags and block production activation, not unrelated coding.
- UI dapat diimplementasikan dari screen/state handoff repository; Product Owner visual acceptance remains required before production-visible release.
- A story is build-complete only after applicable AC/tests/review evidence; production-ready remains false until real DEC/CFG/environment evidence exists.
- Nilai configuration wajib memiliki environment, owner, validation range, effective date, approval evidence, dan non-production safe default.
- Perubahan APPROVED artifact memperbarui document version, traceability, test impact, dan Change Request bila material.

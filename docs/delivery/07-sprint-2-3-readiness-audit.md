# Sprint 2–3 Readiness Audit

**Status:** DRAFT audit snapshot  
**Audit date:** 2026-07-18  
**Owner:** PM/BA  
**Reviewers:** Designer, TL, QA  
**Classification:** `READY`, `PARTIAL`, `BLOCKED`

Proposed remediation evidence now includes [Priority Flow Screen-Level Handoff](../design/03-priority-flow-screen-handoff.md) and [Sprint 2–3 Contract Manifest](../technical/06-sprint-2-3-contract-manifest.md). Text/specification evidence may improve a gap to PARTIAL but cannot replace Figma or Gate 4 approval.

Review execution evidence is prepared in the [Gate 2–4 Review Pack](../governance/07-gate-2-4-review-and-approval-pack.md), [Figma Production Pack](../design/04-priority-figma-production-and-review-pack.md), and [Technical Contract Review Workbook](../technical/07-technical-contract-review-workbook.md). These are templates/queues only and do not change any story or gate status.

`READY` means approved and executable evidence exists; `PARTIAL` means a draft exists but review/decision/evidence is incomplete; `BLOCKED` means a mandatory prerequisite is absent. Overall story status is the most restrictive mandatory item.

## 1. Story Readiness Matrix

Exactly eight Sprint 2–3 stories are audited below.

| Story | BR/AC | Decisions | Figma | API/schema/invariant | Error/auth/audit/notification | Migration | Test/UAT | Owner/dependency | Overall |
|---|---|---|---|---|---|---|---|---|---|
| US-ID-01 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | BLOCKED — DEC-012/014 | BLOCKED — UX-01 text handoff complete; Figma node/approval absent | PARTIAL — proposed session/MFA/recovery contract drafted; TL/client/QA review pending | PARTIAL — proposed error/security mapping drafted; final policy and telemetry review pending | PARTIAL — identity/source linking policy needed | PARTIAL — exact AC→TC/UAT mapping drafted; executable steps/environment pending | BLOCKED — TL/Design/QA/Figma/environment | BLOCKED |
| US-ID-02 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | BLOCKED — DEC-012 | BLOCKED — UX-11 text handoff complete; Figma node/approval absent | PARTIAL — user/deactivation/MFA proposed contract drafted; enrollment/provider review pending | PARTIAL — role/audit/error mapping drafted; approval pending | PARTIAL — internal-user source/invite treatment pending | PARTIAL — exact AC→TC/UAT mapping drafted; environment pending | BLOCKED — TL/Design/QA/Figma | BLOCKED |
| US-MST-02 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | READY — no explicit blocking business decision | BLOCKED — UX-11 assignment text handoff complete; Figma absent | PARTIAL — assignment end/effective-boundary contract drafted; data/client review pending | PARTIAL — overlap/branch/audit mapping drafted; review pending | PARTIAL — source assignments mapping draft | PARTIAL — exact boundary AC→TC/UAT mapping drafted; execution pending | BLOCKED — UX/API review and identity predecessor | BLOCKED |
| US-MST-01 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | BLOCKED — DEC-005/006 | BLOCKED — UX-11 master/settings text handoff complete; Figma absent | PARTIAL — discriminated fee/rate/quota contracts drafted; value/client review pending | PARTIAL — MFA/audit/configuration/overlap mapping drafted; review pending | PARTIAL — master/rate mapping exists | PARTIAL — exact AC→TC/UAT mapping drafted; production configuration absent | BLOCKED — Finance/PO decisions, Figma, TL/QA | BLOCKED |
| US-PKG-01 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | BLOCKED — DEC-004 | BLOCKED — UX-02 text handoff complete; Figma absent | PARTIAL — proof lifecycle and Package/Purchase schemas drafted; provider/client review pending | PARTIAL — unsafe/unscanned/auth mapping drafted; audit/provider review pending | PARTIAL — package/customer source mapping draft | PARTIAL — exact AC→TC/UAT mapping drafted; executable environment pending | BLOCKED — storage/provider adapter, package config, Figma | BLOCKED |
| US-PKG-02 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | BLOCKED — DEC-004/006 | BLOCKED — UX-02 decision text handoff complete; Figma absent | PARTIAL — ApprovalResult/balance/ledger/outbox schemas drafted; review pending | PARTIAL — idempotency/duplicate/event mapping drafted; approval pending | PARTIAL — opening/current purchase boundary pending | PARTIAL — exact AC→TC/UAT mapping drafted; harness pending | BLOCKED — PKG-01, Finance config, gates | BLOCKED |
| US-LED-01 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | READY — no explicit blocking decision | BLOCKED — UX-02/03 text handoff complete; Figma absent | PARTIAL — explicit balance/ledger result drafted; pagination/client review pending | PARTIAL — auth/invariant mapping drafted; read-audit review pending | PARTIAL — MIGRATION_OPENING mapping exists | PARTIAL — exact AC→TC/UAT mapping drafted; reconciliation execution pending | BLOCKED — PKG-02, Figma, contract review | BLOCKED |
| US-LED-02 | PARTIAL — detailed story/unique AC/traceability draft complete; G2 sign-off pending | READY — policy baseline, approval still Gate 2 | BLOCKED — UX-09 text handoff complete; Figma absent | PARTIAL — adjustment/decision result and events drafted; transaction review pending | PARTIAL — SoD/duplicate/invariant mapping drafted; review pending | READY — no opening migration required beyond package reference | PARTIAL — exact AC→TC/UAT mapping drafted; execution pending | BLOCKED — LED-01/RBAC, Figma, contract review | BLOCKED |

No story is currently `READY`. This is expected and prevents false coding authorization.

## 2. Gap and Remediation Register

| Gap ID | Gap/remediation output | Role owner | Due | Acceptance | Affected story/milestone | Status |
|---|---|---|---|---|---|---|
| GAP-S03-001 | Approve DEC-012 session/MFA policy | TL | Sprint 1 D3 | Signed decision linked to ADR/OpenAPI/test | ID-01/02, M1/M2 | BLOCKED |
| GAP-S03-002 | Approve DEC-014 recovery/linking policy | PO+TL | Sprint 1 D3 | Verification/escalation/notifications and SLA explicit | ID-01, M1/M2 | BLOCKED |
| GAP-S03-003 | Approve DEC-004 package configuration records | PO | Sprint 1 D5 | At least pilot-candidate configuration evidence; no example default | PKG-01/02, M2 | BLOCKED |
| GAP-S03-004 | Approve DEC-005/006 applicable master/rate configuration | PO+Finance | Sprint 1 D5 | Valid business keys/effective dates/approvals | MST-01, PKG-02, M2 | BLOCKED |
| GAP-S03-005 | Create/approve UX-01 | Designer | Sprint 1 D6 | All states/copy/a11y/dev/QA review and PO approval | ID-01 | BLOCKED |
| GAP-S03-006 | Create/approve UX-02 | Designer | Sprint 1 D6 | Purchase/review/upload/approval states complete | PKG-01/02, LED-01 | BLOCKED |
| GAP-S03-007 | Create/approve UX-03 and UX-09 | Designer | Sprint 1 D7 | Balance and adjustment views/states approved | LED-01/02 | BLOCKED |
| GAP-S03-008 | Create/approve UX-11 identity/master/assignment subsets | Designer | Sprint 1 D7 | Role/MFA/master/assignment states approved | ID-02, MST-01/02 | BLOCKED |
| GAP-S03-009 | Resolve auth/MFA/recovery contract gaps | TL | Sprint 1 D6 | OpenAPI/schema/error/event mapping reviewed; client generation valid | ID-01/02 | PARTIAL |
| GAP-S03-010 | Resolve assignment/effective-master contract gaps | TL | Sprint 1 D6 | Explicit lifecycle/validation/error/audit contracts | MST-01/02 | PARTIAL |
| GAP-S03-011 | Resolve upload/purchase/ledger/adjustment contract gaps | TL | Sprint 1 D7 | Operations/responses/events/concurrency constraints accepted | PKG/LED stories | PARTIAL |
| GAP-S03-012 | Expand TC-AUTH/MST/PKG/LED/RES into executable cases | QA | Sprint 1 D8 | Preconditions/steps/data/expected layers/evidence template | All eight | PARTIAL |
| GAP-S03-013 | Provision safe dev/staging dependencies and synthetic seed route | Ops+TL | Sprint 1 D8 | Account ownership/access/config/health/seed evidence | All eight, M2 | BLOCKED |
| GAP-S03-014 | Complete Gate 1/2/4/5 evidence | PM/BA | Sprint 1 D8 | Each gate has exact approval or remains blocked | All eight, M1 | BLOCKED |

## 3. Interface and Evidence Links Required Per Story

Before overall status becomes `READY`, each story row must link exact BR/AC version, approved Figma node/version, OpenAPI checksum and operations, data dictionary/migration version, stable errors/events, WBS tasks, executable TC/UAT IDs, role assignee/reviewer, environment, and gate evidence.

## 4. Dependency Graph

```text
PIC/reviewers ──> Gate 1
business decisions ──> Gate 2 ──> story baseline
technical decisions ──> Gate 4 ──> OpenAPI/schema/error/event baseline
test/data/environment ──> Gate 5
story baseline ──> Figma review ──> applicable Gate 3

Gate 1+2+4+5 + applicable Gate 3
  ├─> US-ID-01 ──┐
  ├─> US-ID-02 ──┼─> US-MST-02
  │              └─> US-MST-01 (also DEC-005/006)
  └─> DEC-004 + UX-02 + storage adapter ─> US-PKG-01

US-ID-01/02 + US-MST-01 + US-PKG-01
  └─> US-PKG-02 ─> US-LED-01 ─> US-LED-02
```

Cycle audit: no story is a predecessor of its own requirement/design/API/test prerequisite; identity is upstream of assignment/purchase, purchase approval is upstream of ledger read, and ledger read is upstream of adjustment. Shared gates/configuration are roots, not downstream outputs. Any implementation discovery that changes an approved prerequisite returns through Change Request and does not create an implicit reverse dependency.

## 5. Audit Exit

PM/BA updates this audit at Sprint 0 exit, Sprint 1 mid-point, and Sprint 1 exit. A story can change to `READY` only when every mandatory column is `READY`, exact evidence is linked, WBS assignee/reviewer is assigned, estimate fits capacity, and all relevant gates are PASS.

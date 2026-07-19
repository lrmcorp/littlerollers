# Gate 2–4 Review and Approval Pack

**Status:** DRAFT  
**Coordinator:** AI Product/BA mode  
**Rule:** review readiness is not approval

## 1. Master Review Register

| Review | Scope and exact baseline | Required sequence | Due point | Comment/disposition evidence | Approval evidence | Current result |
|---|---|---|---|---|---|---|
| G2-REV-001 | PRD, BR, DOC-PROD-04/06 detailed story/AC, DOC-PROD-05/07 traceability/readiness, decision workbook; repository commit TBD | PM/BA → TL → Designer → QA → Finance/Data/Operations/Privacy as applicable → PO | Before Gate 2 decision | G2-S23-CMT/G2-MVP-CMT/G2-CMT IDs; owner/due/resolution | [Gate 2 record](../templates/gate-2-signed-review-record.md), APR-002 | BLOCKED |
| G3-REV-001 | UX-01/02/03/09/11 text handoff plus exact Figma file/node/version TBD | Designer → PM/BA → Web/Flutter → QA → PO | Per flow before story READY | G3-CMT IDs per flow/node | [Gate 3 record](../templates/gate-3-signed-review-record.md), APR-003 | BLOCKED |
| G4-REV-001 | ADR, ERD/data dictionary, OpenAPI `0.7.0-draft` SHA-256 `9fc4e444120499589918244d6522a3f9f3853418df21291e4b38db8735c238f2`, event/error/security and manifest | TL initial → Web → Flutter → QA → Finance/Ops/Data → peer → TL final | Before Gate 4 decision | G4-CMT/CTG IDs; CR if approved baseline changes | [Gate 4 record](../templates/gate-4-signed-review-record.md), APR-004 | BLOCKED |

Allowed reviewer results are `PASS`, `PASS-WITH-ACTION`, and `BLOCKING`. `PASS-WITH-ACTION` requires a non-critical action owner, due date and accepted risk. It is forbidden for unresolved scope, business configuration, Figma, security, authorization, ledger/invariant, concurrency, recovery, or provider-boundary issues.

## 2. Review Execution Contract

1. Coordinator freezes and records repository commit, document versions, OpenAPI checksum and Figma version where applicable.
2. Reviewers work in the listed order and create stable comment IDs; verbal/chat agreement is not evidence.
3. Owner responds `ACCEPT`, `REJECT-WITH-RATIONALE`, `SUPERSEDED`, or `DEFER-NONBLOCKING`, linking evidence and due date.
4. Any requested material baseline change uses `CR-xxx`, updates traceability/tests, and restarts affected review rows.
5. Approver signs only after blocking comments are closed and identity/date/timezone evidence is linkable.
6. PM/BA updates APR and gate register only from signed evidence; otherwise result remains `BLOCKED/OPEN`.

## 3. Consolidated Blocker Board

| Blocker | Gate/story | Accountable | Required input | Due trigger | Escalation | Closure evidence | Status |
|---|---|---|---|---|---|---|---|
| BLK-001 AI review separation | BG-1–3/all critical changes | AI TL/QA | Separate author/reviewer passes and executable evidence | Per change | Product Owner only for business conflict | review findings and rerun evidence | OPEN — not a staffing blocker |
| BLK-002 business configuration | G2; MST-01, PKG-01/02 | PO; Finance for DEC-006 | DEC-004/005/006 source values/effective dates/approval | Before Sprint 3 planning/story READY | PO | Signed decision/config records | TBD-BLOCKING |
| BLK-003 Figma ownership/nodes | G3; UI stories | PO | Daily Dose Figma file, Designer, 52 nodes/prototypes (23 priority + 29 remaining) | Before flow review | PO | Exact node/version and G3 signatures | TBD-BLOCKING |
| BLK-004 provider/environment | G4/G5; all integration/release | TL+PO | DEC-011 evaluation, account ownership and backup | Before environment build | PO/steering | Signed DEC-011/ADR and account evidence | TBD-BLOCKING |
| BLK-005 session/MFA | G2/G4; ID-01/02 | TL | DEC-012 TTL, MFA roles/method/provider/revocation | Before Sprint 2 planning | PO if overdue | Signed DEC-012 linked to ADR/contract/tests | TBD-BLOCKING |
| BLK-006 recovery/linking | G2/G4; ID-01 | PO+TL | DEC-014 verification, escalation, SLA, notification | Before Sprint 2 planning | Reyner/peer security | Signed DEC-014 and threat/test review | TBD-BLOCKING |
| BLK-007 technical client/QA review | G4; eight Sprint 2–3 stories | TL | CTG-001–012 review and TS/Dart compatibility evidence | Before APR-004 | Peer/steering | Closed workbook findings and G4 signatures | TBD-BLOCKING |

No row may be closed by a template alone. The authoritative current state remains the gate and approval registers.

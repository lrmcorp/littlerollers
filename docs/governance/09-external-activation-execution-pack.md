# External Activation Execution Pack

**Status:** SUPERSEDED — HUMAN STAFFING ACTIVATION NOT APPLICABLE  
**Activation owner:** Reyner until PM/BA is appointed  
**Start baseline:** Monday, 2026-07-20 (Asia/Jakarta)  
**Coding authorization:** Replaced by BG-0/BG-1 in the [AI Delivery Operating Model](10-ai-delivery-and-coding-authorization.md)

> The staffing, candidate and work-contact sections below are retained as historical contingency only. They do not block AI coding and must not be executed unless the Product Owner explicitly changes the delivery model to human/vendor staffing.

## 1. Four-Week Activation Board

Dates are target windows, not fabricated appointments. A row changes from `TBD-BLOCKING` only when a named work identity accepts it and evidence is linked.

| Work item | Target | Responsible / accountable | Input | Exit evidence | Status |
|---|---|---|---|---|---|
| ACT-STAFF-01 collect PM/BA candidates | 20–22 Jul | R: Reyner; A: Reyner | two CVs, availability, conflict declarations | CAND-PM-01/02 intake complete | TBD-BLOCKING |
| ACT-STAFF-02 collect TL candidates | 20–22 Jul | R: Reyner; A: Reyner | two CVs, allocation, case availability | CAND-TL-01/02 intake complete | TBD-BLOCKING |
| ACT-STAFF-03 independent reviewer | 20–22 Jul | R: Reyner; A: Reyner | independence and allocation evidence | CAND-REV-01 intake complete | TBD-BLOCKING |
| ACT-STAFF-04 business/delivery role inventory | 20–22 Jul | R: Reyner; A: Reyner | named Designer, QA, Web, Flutter, Finance, Data, Ops, Privacy candidates | role intake rows complete | TBD-BLOCKING |
| ACT-SEL-01 structured PM/BA selection | 23–28 Jul | R: evaluator panel; A: Reyner | CASE-PM-01 and scorecards | moderated result, reference and approval | BLOCKED — candidates/panel |
| ACT-SEL-02 structured TL selection | 23–28 Jul | R: evaluator panel; A: Reyner | CASE-TL-01 and scorecards | moderated result, reference and approval | BLOCKED — candidates/panel |
| ACT-SEL-03 peer review selection | 27–29 Jul | R: Reyner/internal evaluator; A: Reyner | CASE-REV-01, independence evidence | reviewer PASS and conflict clearance | BLOCKED — candidate |
| ACT-PIC-01 assignment/provisioning | 29–30 Jul | R: PM/BA after appointment; A: Reyner | PASS evidence, work contacts | PIC, backup, escalation and account request | BLOCKED — selection |
| ACT-G1-01 Gate 1 review | 27 Jul–3 Aug | R: PM/BA; A: Reyner | staffing, governance exact commit | signed G1-REV, APR-001, no blockers | BLOCKED — core staffing |
| ACT-DEC-01 auth/recovery workshops | 3–5 Aug | R: PM/BA+TL; A: DEC owners | DEC-012/014 evidence | signed decision or NO DECISION/escalation | BLOCKED — TL/QA/security |
| ACT-DEC-02 business configuration | 4–7 Aug | R: PM/BA+Finance; A: Reyner | DEC-004, DEC-005 and DEC-006 sources | signed CFG/DEC records | BLOCKED — Finance/source |
| ACT-DEC-03 operating policies | 6–11 Aug | R: PM/BA; A: DEC owners | DEC-007, DEC-008, DEC-009, DEC-010 and DEC-013 evidence | signed policy/assessment records | BLOCKED — participants/input |
| ACT-REV-01 Gate 2 review | 10–18 Aug | R: PM/BA; A: Reyner | exact version, decisions/configs | G2-REV/APR-002 | BLOCKED — G1/decisions |
| ACT-FIG-01 priority Figma production/review | 3–21 Aug | R: Designer; A: Reyner | 52 screen text handoffs | exact nodes/prototypes and G3 flow evidence | BLOCKED — Designer/file |
| ACT-REV-02 Gate 4 review | 10–19 Aug | R/A: TL | OpenAPI checksum, ADR/ERD/security | closed CTG-001–019, G4-REV/APR-004 | BLOCKED — TL/reviewers/DEC |
| ACT-ENV-01 provider/environment decision | 10–20 Aug | R: TL+Ops; A: TL/PO by boundary | DEC-011 evaluation | signed ADR/DEC, account/access owners | BLOCKED — TL/Ops/provider evidence |
| ACT-REV-03 Gate 5 review | 17–24 Aug | R: QA+PM/BA; A: PO | QA/UAT/migration/environment/release | APR-005 and signed readiness evidence | BLOCKED — QA/Data/Ops/environment |

If a target is missed, owner records reason, impact, revised date and escalation; status never changes merely because the date passes.

## 2. Staffing Intake Register

Use work contact only. Candidate `PASS` requires the applicable scorecard threshold, critical floors, reference check, allocation, and no blocker.

| Intake ID | Role | Minimum pool | Candidate/work identity | Organization | Vendor/internal | Allocation/start | Conflict/independence | Evidence | Selection route | Status |
|---|---|---:|---|---|---|---|---|---|---|---|
| STI-PM | PM/BA | 2 | TBD-BLOCKING | TBD-BLOCKING | Main vendor | 100% / TBD | declaration required | CV, CASE-PM-01, reference | weighted scorecard | OPEN |
| STI-TL | Technical Lead | 2 | TBD-BLOCKING | TBD-BLOCKING | Main vendor | 100% / TBD | declaration required | CV, CASE-TL-01, reference | weighted scorecard | OPEN |
| STI-REV | Peer reviewer/technical backup | 1 | TBD-BLOCKING | TBD-BLOCKING | Independent/internal | ≥20% / TBD | independence mandatory | CASE-REV-01, reporting/commercial map | TL rubric + independence | OPEN |
| STI-DES | UI/UX Designer | 1 | TBD-BLOCKING | TBD-BLOCKING | TBD | phase capacity / TBD | declaration required | portfolio, accessibility/handoff sample | competency review | OPEN |
| STI-QA | QA Engineer | 1 | TBD-BLOCKING | TBD-BLOCKING | TBD | 100% / TBD | declaration required | API/concurrency/security/UAT evidence | competency review | OPEN |
| STI-WEB | Web Developer | 1 | TBD-BLOCKING | TBD-BLOCKING | TBD | 100% / TBD | declaration required | Next.js/TS/OpenAPI sample | TL review after appointment | OPEN |
| STI-FLT | Flutter Developer | 1 | TBD-BLOCKING | TBD-BLOCKING | TBD | 100% / TBD | declaration required | Flutter/Dart generated-client sample | TL review after appointment | OPEN |
| STI-FIN | Finance Representative | 1 | TBD-BLOCKING | Daily Dose | Internal | phase-based / TBD | authority confirmation | package/rate/close source ownership | Reyner appointment | OPEN |
| STI-DATA | Pilot Data Owner | 1 | TBD-BLOCKING | Daily Dose | Internal | phase-based / TBD | authority confirmation | source inventory/mapping ownership | Reyner appointment | OPEN |
| STI-OPS | Operations owner | 1 | TBD-BLOCKING | TBD-BLOCKING | TBD | phase/on-call / TBD | declaration required | IAM, backup, recovery evidence | TL+PO review | OPEN |
| STI-PRIV | Privacy/legal reviewer | 1 | TBD-BLOCKING | Daily Dose/advisor | Internal/advisor | decision-based / TBD | independence/authority | retention/export/recovery review evidence | Reyner appointment | OPEN |

### Assignment Handoff

For each selected person record: role, name, organization, vendor/internal, allocation, start/end, backup, work contact, account request/result, approval identity/date, onboarding owner, and offboarding trigger. Missing backup/contact/provisioning keeps assignment `TBD-BLOCKING` even if the candidate passed.

## 3. Decision Closure Calendar

| Sequence | Workshop | Decisions | Required participants | Required evidence | Result boundary |
|---:|---|---|---|---|---|
| 1 | DWS-AUTH-01 | DEC-012 | TL, PO, QA/security, Web, Flutter, peer, Ops | threat model, client constraints, provider options | signed TTL/MFA/revocation policy or NO DECISION |
| 2 | DWS-REC-01 | DEC-014 | PO, TL, PM/BA, QA/security, Support/Ops, Privacy, peer | verification options, escalation capacity/SLA | signed recovery/linking policy or NO DECISION |
| 3 | DWS-BIZ-01 | DEC-004, DEC-005, DEC-006 | PO, Finance, PM/BA, TL, QA, Data Owner | authoritative package/quota/rate sources | signed effective CFG records or NO DECISION |
| 4 | DWS-ATT-01 | DEC-007, DEC-008 | PO, PM/BA, TL, QA, Operations, customer/admin representative | window/cutoff, role, ledger/reservation consequence | signed check-in/cancellation policy or NO DECISION |
| 5 | DWS-GOV-01 | DEC-009, DEC-010 | PO, Privacy, Finance, Data Owner, Ops, PM/BA | retention obligations; pilot readiness scoring | signed retention schedule/pilot choice or NO DECISION |
| 6 | DWS-PLAT-01 | DEC-011 | TL, Ops, PO, Finance/procurement, QA, peer | provider/region/IAM/PITR/cost/exit evidence | signed provider ADR/DEC or NO DECISION |
| 7 | DWS-NOT-01 | DEC-013 | PO, TL, Ops/Support, QA, PM/BA | channel failure, retry, fallback and operator capacity | signed fallback policy or NO DECISION |

Every result records repository version, input links, options, validation, effective date/environment, dissent, affected story/gate, follow-up owner/due, approver and immutable evidence. Synthetic QA values are explicitly rejected as production evidence.

## 4. Gate Execution Tracker

| Gate | Entry owner | Review sequence | Mandatory evidence | Hard blockers | Current |
|---|---|---|---|---|---|
| G1 | PM/BA | PM/BA → TL → peer → Reyner | exact commit, governance/RACI/reconciliation, PIC/backup/escalation, signed APR-001 | missing PM/BA/TL/peer, blocking comments, no Reyner signature | BLOCKED |
| G2 | PM/BA | PM/BA → TL → Designer → QA → business roles → Reyner | 24 stories/96 AC, traceability, signed DEC/CFG, G2-REV/APR-002 | scope/auth/ledger/finance/test/decision gaps | BLOCKED |
| G3 | Designer | Designer → PM/BA → Web/Flutter → QA → Reyner | Daily Dose-owned Figma file, exact node/version/prototype, state/accessibility review | missing node/state/permission/Figma approval | BLOCKED |
| G4 | TL | TL → Web → Flutter → QA → Finance/Ops/Data → peer → TL | ADR/ERD, OpenAPI 0.4 checksum, security/event/error, CTG dispositions, APR-004 | security/auth/ledger/concurrency/provider boundary/client gaps | BLOCKED |
| G5 | QA/PM/BA | QA → TL/Ops/Data → business UAT owner → Reyner | test/UAT, migration mapping, environment/access, backup/rollback/release evidence | missing environment/source/recovery/test ownership | BLOCKED |

Review comments use stable IDs and fields: gate, artifact/version, reviewer, severity, finding, required change, owner, due date, disposition, resolution evidence, verification, and result. `PASS-WITH-ACTION` is prohibited for scope, configuration, authorization, security, ledger/finance invariants, concurrency, Figma, recovery, or unresolved decisions.

## 5. Figma Activation Checklist

- File and team/project are owned by Daily Dose; named organizational admin and backup are recorded.
- Designer records file URL, version, node URL, prototype URL, platform, flow/screen ID, review date and reviewer evidence.
- Production order is UX-01 → UX-11 → UX-02 → UX-09 → UX-03 → remaining MVP flows.
- The 23 priority screens and 29 remaining screens total exactly 52 screen IDs; text handoff never counts as Figma evidence.
- Each flow covers permission/branch context, validation, loading/empty/error/offline/retry/locked/success, responsive behavior, keyboard/screen reader, dynamic text, masking, confirmation consequence and test IDs.

## 6. Provider and Environment Activation Checklist

`DEC-011` evaluates provider, Indonesian-region latency/data handling, managed PostgreSQL/cache/object storage/queue compatibility, IAM/MFA, PITR/restore, monitoring, cost, exit/portability, support and Daily Dose account ownership. No candidate is preselected here.

For local, development, staging/UAT and production, record owner/admin backup, purpose/data class, named access/MFA, account/subscription ID, region, secret/config system of record, deployment identity, network/TLS, health/telemetry, backup/restore, support/on-call, access review and evidence link. Provider approval does not authorize scaffold; Gate 1/2/4/5 still control that action.

## 7. Completion and Escalation

This activation stage completes only when all core PICs and work contacts exist, DEC-004–014 have signed dispositions or explicit escalated blockers, G1–5 evidence points to exact repository/OpenAPI/Figma versions, and no gate marked PASS has an unresolved blocking comment. Until then all stories remain `BLOCKED`, APR-001–005 remain `OPEN`, and readiness percentage is diagnostic only.

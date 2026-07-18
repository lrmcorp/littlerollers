# Decision Closure Workshop Pack

**Status:** DRAFT  
**Facilitator:** AI Product/BA mode  
**Rule:** synthetic data and vendor assumptions cannot become production decisions

## 1. Workshop Register

| Session | Decisions | Required participants | Required input | Recommended starting point | Output/affected scope | Status |
|---|---|---|---|---|---|---|
| DWS-BIZ-01 | DEC-004/005/006 | PO, Finance, PM/BA, TL, QA, Data Owner | Approved price/package/rate/quota source, business keys, effective dates | Effective-dated, non-overlap configuration; no production default | Signed CFG records; MST-01, PKG-01/02, scheduling/finance; G2/G4 | TBD-BLOCKING |
| DWS-PLAT-01 | DEC-011 | TL, Ops, PO, Finance/procurement, QA, peer | Candidate evidence, region/data handling, PITR, IAM, cost, exit | Provider-agnostic adapter; managed services; Daily Dose account ownership | Signed provider/region/service ADR; G4/G5 | TBD-BLOCKING |
| DWS-AUTH-01 | DEC-012 | TL, PO, QA/security, Web, Flutter, peer, Ops | Threat model, client constraints, provider candidates, support needs | Web HttpOnly session; mobile rotating family; step-up MFA | Signed TTL/MFA/revocation policy; ID-01/02; G2/G4 | TBD-BLOCKING |
| DWS-REC-01 | DEC-014 | PO, TL, PM/BA, QA/security, Operations/support, Privacy, peer | Identity risks, acceptable verification, escalation capacity and SLA | Never auto-link unverified identity; verified proof plus support escalation | Signed recovery/linking policy; ID-01; G2/G4 | TBD-BLOCKING |
| DWS-ATT-01 | DEC-007/008 | PO, PM/BA, TL, QA, Operations, customer/admin representative | Check-in boundary evidence, cancellation actor/cutoff/reason, reservation/ledger/notification impact | Configurable bounded window; atomic consequence; no implicit ledger mutation | Signed check-in/cancellation policy; ATT/BKG/CLS; G2/G3 | TBD-BLOCKING |
| DWS-GOV-01 | DEC-009/010 | PO, Privacy, Finance, Data Owner, Ops, PM/BA | Retention/legal obligations and completed pilot readiness scoring | Per-class retention; select branch only at score ≥75 without blocker | Signed retention schedule and pilot decision; G5/G6 | TBD-BLOCKING |
| DWS-NOT-01 | DEC-013 | PO, TL, Ops/support, QA, PM/BA | Failure/retry/dead-letter/operator capacity and channel evidence | Persisted in-app fallback; bounded retry; no silent success | Signed fallback/operator policy; NOT/OPS; G2/G4 | TBD-BLOCKING |

## 2. Decision Worksheet Contract

Complete one record per DEC before changing the decision register:

| Field | Required content |
|---|---|
| Decision/session ID | Stable DEC/DWS ID and repository version |
| Owner and approver | Named work identity, organization and authority evidence |
| Input evidence | Link/version/date/source owner; no production PII copied into repo |
| Options | At least recommended option and viable alternative, including do-nothing impact |
| Evaluation | Business, security, operations, cost, UX, migration and compatibility impact as applicable |
| Validation rule | Exact range/invariant/boundary and effective date where relevant |
| Decision and rationale | Selected option, rejected alternatives and dissent |
| Affected items | Gate, story, ADR/API/schema/UX/test/config records |
| Follow-up | Responsible role, due date, evidence and escalation |
| Approval | Approved identity, date/time/timezone and immutable link |

## 3. Decision-Specific Closure Checks

| DEC | Options/evidence that must be evaluated | Cannot close without |
|---|---|---|
| DEC-004 | Package versions by branch/class, sessions, duration/expiry, Rupiah price | PO-approved source, effective dates, unique business key and validation |
| DEC-005 | Quota/capacity per branch/class and snapshot/override behavior | Capacity ≥ quota ≥ 1, effective period, PO evidence |
| DEC-006 | Instructor fee and projection rate keys/units/effective periods | Finance evidence, PO+Finance approval, non-overlap and historical behavior |
| DEC-011 | Provider/region/services versus portability, security/recovery, cost and ownership | Score/evidence, TL decision, PO commercial acceptance, admin backup/exit plan |
| DEC-012 | Web/mobile TTL, rotation/reuse, MFA roles/actions/method/provider, revoke behavior | TL approval, threat/client/QA review and contract impact |
| DEC-014 | Recovery proof, account-link verification, session revoke, notification, escalation and SLA | PO+TL approval, security/privacy/support review; no automatic unverified linking |
| DEC-007 | Customer/instructor boundary, inclusivity, timezone, replay and backfill consequence | PO approval, exact boundary/effective scope, QA/security review |
| DEC-008 | Cancellation actor, cutoff, reason, notification and reservation/ledger treatment | PO approval, atomic consequence and Finance/TL review |
| DEC-009 | Retention by data class, legal hold, deletion/anonymization and private artifact expiry | PO+Privacy approval and authoritative obligation evidence |
| DEC-010 | Candidate branches, readiness score, blockers, support/data/training capacity | Completed scoring, score ≥75, no blocker and PO approval |
| DEC-013 | Primary/fallback occurrence, retry/dead-letter, operator action and customer visibility | PO+TL approval, QA/Ops review and no silent-success behavior |

## 4. Agenda and Result Handling

Agenda: authority/conflict check → evidence sufficiency → options/tradeoffs → boundary/failure review → decision/dissent → impact mapping → owner/due → approval. If required evidence or approver is absent, record `NO DECISION`, owner and next due point. Only signed outcomes update `DEC`, configuration, ADR, readiness and gate evidence; otherwise existing `TBD-BLOCKING` remains unchanged.

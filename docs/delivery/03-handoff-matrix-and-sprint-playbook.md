# Delivery Handoff Matrix & Sprint Execution Playbook

**Status:** DRAFT  
**Owner:** PM/BA  
**Approvers:** Product Owner for delivery policy; Technical Lead for engineering policy; QA for quality gate

## 1. End-to-End Handoff

`Business Rule → Story/AC → Figma → ADR/API/schema → Implementation → Test Evidence → UAT/PO Acceptance`

The receiver accepts or rejects a handoff within one working day. Rejection identifies missing checklist item, owner, and required date; it does not silently move incomplete work downstream.

| Handoff | Sender → Receiver | Required package | Acceptance owner | Reject when | Evidence |
|---|---|---|---|---|---|
| H01 Business intent | PO/business → PM/BA | Outcome, actor, policy/decision, priority, source | PM/BA | authority/policy ambiguous or decision owner absent | DEC/meeting decision link |
| H02 Story ready for design/tech | PM/BA → Design/TL/QA | BR/US/AC, branch/role, edge cases, decision/dependency, target sprint | PM/BA | AC not testable, blocking decision hidden | Refinement checklist/DoR gaps |
| H03 Design handoff | Designer → PM/BA/Web/Flutter/QA | Figma ID/version, all applicable states, copy, tokens, responsive/a11y, API/permission assumptions | PO business flow; dev/QA readiness | missing state/permission/validation/breakpoint | Approved Figma register |
| H04 Technical contract | TL → Web/Flutter/QA/BE | Accepted ADR, OpenAPI operation, schema/migration, error/event/security/concurrency approach | TL | breaking ambiguity, missing invariant/auth/test approach | Review/contract checksum |
| H05 Implementation for review | Developer → Reviewer | PR, linked WBS/US/AC, tests, migration/docs/config impact, screenshots/log-safe evidence | Code reviewer/TL | CI fail, unreviewable scope, missing tests/docs | PR approvals/CI |
| H06 Build for QA | TL/dev → QA | Immutable build/commit, environment, seed/migration, feature/config, known limitations, AC list | QA | unstable/deployment incomplete/test data missing | Deployment + QA intake record |
| H07 QA result | QA → PM/BA/TL/PO | Results/evidence, regression, defects, residual risks, pass/fail | QA | evidence unsafe/incomplete | Test run/release evidence |
| H08 Business acceptance | PM/BA/QA → Business/PO | Demo/UAT script, expected values, QA status, known limitations | PO | P1/P2, critical AC fail, unaccepted limitation | UAT/PO sign-off |
| H09 Release readiness | QA/TL/PM → PO/Ops | Scope, artifact, migration, backup, rollback, monitoring, support, approvals | PO | missing required sign-off/evidence | Release sign-off |
| H10 Operations/handover | TL/vendor → Ops/Daily Dose | Access, IaC/config, runbooks, dashboards, restore/deploy proof, KT, known issues | PO/Ops | recipient cannot independently operate/restore | Access/KT/offboarding evidence |

## 2. Ceremonies and Required Outputs

| Ceremony | Timing | Participants | Required preparation | Output/owner |
|---|---|---|---|---|
| Backlog refinement | Weekly | PM/BA, TL, Design, QA, relevant dev/business | Candidate stories, decisions, design/API/test impacts | DoR status, estimates/actions — PM/BA |
| Design review | Before UI READY | Design, PM/BA, Web/Flutter, QA, PO | Versioned flow and state checklist | Comments closed, PO approval — Design |
| Technical review | Before critical story READY | TL, BE, Web/Flutter, QA, peer as risk warrants | ADR/API/schema/options/test approach | Accepted decision/contract — TL |
| Sprint planning | Day 1 | Delivery team + PO | Ordered READY backlog, capacity, prior carry-over | Sprint goal/commitment — PM/BA |
| Daily sync | Working days, 15 min | Delivery team | Board current | Blocker/owner/next action — assignee |
| Defect triage | At least 2× weekly; immediate P1 | QA, TL, PM/BA, relevant dev/business | Reproduction/evidence/impact | Severity, owner, target/disposition — QA |
| Sprint review/demo | End sprint | Team, PO, stakeholders | Staging build and acceptance status | Accepted/rejected feedback — PO/PM |
| Retrospective | End sprint | Delivery team | Metrics/events | 1–3 actions with owner/due — PM/BA |
| Steering/status | Every sprint | PO, PM/BA, TL | Scope/milestone/risk/capacity/quality | Decisions/escalation/forecast — PO |
| Release review | Before production | PO, PM/BA, TL, QA, Ops, business reps | Complete H09 package | GO/NO-GO — PO |

## 3. Workflow and Policies

Workflow:

`BACKLOG → REFINEMENT → READY → IN PROGRESS → CODE REVIEW → QA → UAT/ACCEPTANCE → DONE`

Additional states: `BLOCKED` retains previous state metadata and adds blocker/owner/due; `CANCELLED` requires reason/authority; `RELEASED` is tracked by release, not used as a substitute for DONE.

### Ready and commitment

- Only `READY` work may be committed. UI work needs approved Figma; critical backend command needs reviewed OpenAPI/schema/concurrency/test approach.
- Planning uses actual capacity after leave/support/ceremony allowance. Shared prerequisites are scheduled explicitly.
- Sprint goal is outcome-based. PO may reorder future backlog but cannot add in-sprint scope without removing equivalent work or approved emergency/CR.

### Blocker and carry-over

- Blocker is logged the same working day with type, owner, needed decision/input, due date and critical-path impact.
- PO decisions have two-working-day SLA. Critical-path breach becomes AMBER/RED and triggers forecast update.
- Incomplete work does not receive partial DONE. It returns to backlog/refinement, is re-estimated from remaining work, and carry-over cause is reviewed.
- Repeated carry-over is treated as planning/root-cause issue, not hidden velocity.

### Bug and quality

- Defect found before story acceptance belongs to that story; story remains not DONE.
- Post-release defect is a linked issue with severity, affected release/requirement, regression test and evidence.
- P1/security incident interrupts sprint through Incident Commander. P2 is prioritized by impact; P3/P4 follow triage and do not silently displace commitment.
- A fix includes regression coverage and documentation/schema/Figma update when impacted.

### Change and emergency

- Clarification that preserves approved outcome/AC can be resolved in story comments and traceability update.
- Changes to scope, policy, acceptance meaning, API semantics, schema history, milestone/cost or release require Change Request.
- Emergency production/security mitigation may proceed under incident authority; permanent behavior and documentation follow review/CR after stabilization.

## 4. Review Standards

### Code review

Reviewer verifies requirement/AC, design/API contract, authorization/branch scope, validation/error, transaction/idempotency, audit/notification, migration/backward compatibility, observability, tests and safe logging. Author cannot be sole approver. Critical ledger/auth/finance/migration code requires TL or delegated senior review.

### QA intake and exit

QA intake requires immutable build, successful CI/deployment, migrations/seeds, stable environment, known config, AC and test data. QA exit reports pass/fail, coverage, defects, residual risk and evidence. PM/BA or PO cannot override QA result silently; accepted risk is written with owner and scope.

### Business acceptance

PO accepts outcomes, not code activity. Finance/Data Owner/business representatives recommend acceptance for their domain. Conditional acceptance lists limitation, owner, due date and release impact; P1/P2 cannot be conditionally accepted for production.

## 5. Metrics

Track sprint goal success, committed/accepted ratio, cycle time, blocker age, decision SLA, carry-over cause, escaped defects, automation/regression status, DoR rejection, review turnaround, critical-path variance and capacity variance. Metrics diagnose delivery; they are not individual productivity rankings.

## 6. Handoff Acceptance Checklist

Every handoff record answers:

- Exact requirement/story/WBS and artifact version?
- Responsible and accountable roles identified?
- Blocking decisions/dependencies closed or explicitly rejected?
- Authorization, data, audit, notification, migration, privacy and operations impacts assessed?
- Acceptance/test/evidence location clear?
- Receiver accepted with date, or rejected with actionable reason/owner/due?


# Registers & Change Request Templates

## 1. Change Request

```text
CR ID / Title:
Requestor / Date:
Baseline affected (BR/US/Figma/API/schema/release):
Current behavior:
Requested behavior and business value:
Reason / deadline driver:
Options considered:
UX impact:
Architecture/API/data/security/migration impact:
QA/UAT/regression impact:
Timeline/capacity/cost impact:
Operational/support impact:
Risks and mitigation:
Recommendation (PM/BA):
Decision: APPROVED / REJECTED / DEFERRED
Product Owner / decision date:
Backlog/docs updated links:
```

## 2. Decision Register

| Decision ID | Date | Topic | Options | Decision/rationale | Owner | Documents affected | Status |
|---|---|---|---|---|---|---|---|
| DEC-xxx | TBD | Decision topic | Options/reference | Decision and rationale | Decision owner | Affected documents | DRAFT/APPROVED/SUPERSEDED |

## 3. Risk/Issue Register

| ID | Type | Description | Probability | Impact | Score | Owner | Mitigation/action | Due | Status |
|---|---|---|---:|---:|---:|---|---|---|---|
| R-001 | Risk | Legacy data inconsistency | 4 | 5 | 20 | PM/BA | Profiling, cleansing, rehearsal | TBD | OPEN |

## 4. Dependency Register

| ID | Dependency | Provider/Owner | Needed by | SLA/date | Impact if late | Status/escalation |
|---|---|---|---|---|---|---|
| DEP-001 | Business approval | Product Owner | Per sprint | ≤2 hari kerja | Story/milestone shift | OPEN |
| DEP-002 | Meta business/template approval | PO/TL | Before notification QA | TBD | WA flow blocked | OPEN |

## 4A. Approval Evidence Register

| Evidence ID | Gate/artefak | Version/commit | Required reviewers | Result | Final approver/date | Link | Status |
|---|---|---|---|---|---|---|---|
| APR-xxx | Gx / DOC-xxx | TBD-BLOCKING | TBD-BLOCKING | PASS/FAIL | TBD-BLOCKING | TBD-BLOCKING | OPEN |

## 4B. Configuration Approval

```text
Configuration ID / environment:
Business key (branch/class/instructor/package):
Value and unit:
Validation range/source evidence:
Effective from/to:
Business owner:
Technical validation:
Approver/date:
Applied by/time/build:
Verification evidence:
Rollback/replacement reference:
```

## 5. UAT Sign-off

```text
Release/build/environment:
Scope and requirement IDs:
Test period:
Operational representative result/evidence:
Finance representative result/evidence:
Open defects and accepted disposition:
Known limitations:
Training/runbook/support readiness:
Recommendation: GO / CONDITIONAL GO / NO-GO
QA:
Technical Lead:
Product Owner final decision/date:
```

## 6. Production Release Sign-off

```text
Release/version/commit:
Change log and rollback version:
CI/test/security/migration evidence:
Backup/restore point:
Monitoring/alerts/on-call ready:
QA pass:
TL technical readiness:
UAT sign-off link:
PO business approval:
Deployment result and smoke evidence:
Observation window result:
```

## 7. Incident/RCA

```text
Incident ID / severity / branch:
Detected/resolved timestamps and timezone:
Business/customer/data impact:
Incident commander and responders:
Timeline:
Containment/workaround/recovery:
Root cause and contributing factors:
Detection/response gaps:
Corrective and preventive actions (owner/due):
Evidence/correlation IDs:
Communication record:
Approval/closure:
```

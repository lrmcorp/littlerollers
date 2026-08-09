# Business Configuration & Decision Workbook

**Status:** DRAFT  
**Coordinator:** PM/BA  
**Business approver:** Product Owner; Finance co-approval where stated  
**Rule:** `TBD-BLOCKING` is never a production default

## 1. Approval Contract

Each record includes stable ID, environment/scope, business key, value/policy, source evidence, validation, effective period, owner, approver/date, affected story, due trigger, applied-by/build and verification evidence. A row is usable only when `APPROVED`; examples and DD-QA-001 values remain `SYNTHETIC-NONPRODUCTION`.

| Record ID | Decision | Scope/environment | Owner | Approver | Affected stories | Due trigger | Evidence/status |
|---|---|---|---|---|---|---|---|
| CFG-PKG-001 | DEC-004 | Production pilot candidate | PO | PO | MST-01, PKG-01/02 | Before Sprint 3 planning | TBD-BLOCKING |
| CFG-QUOTA-001 | DEC-005 | Production pilot candidate | PO | PO | MST-01, CLS-02/03, BKG-01 | Before applicable story READY | TBD-BLOCKING |
| CFG-FEE-001 | DEC-006 | Production pilot candidate | Finance | PO + Finance | MST-01, PKG-02, FIN-01/03 | Before Sprint 3/Finance story READY | TBD-BLOCKING |
| POL-CHECKIN-001 | DEC-007 | All branches unless overridden by approved policy | PO | PO | ATT-01/02 | Before UX-05/06 approval | TBD-BLOCKING |
| POL-CANCEL-001 | DEC-008 | All branches unless approved effective override | PO | PO | CLS-02, NOT-01 | Before class lifecycle READY | TBD-BLOCKING |
| ADR-CLOUD-001 | DEC-011 | Development/staging/production | TL | TL + PO commercial/ownership | OPS-01, MIG-01, all release | Before environment build/G4/G5 | TBD-BLOCKING |
| ADR-AUTH-001 | DEC-012 | Web/mobile/API | TL | TL | ID-01/02 | Before Sprint 2 planning/G4 | TBD-BLOCKING |
| POL-NOTIF-001 | DEC-013 | MVP transactional notifications | PO+TL | PO business + TL technical | NOT-01, OPS-01 | Before notification story READY | TBD-BLOCKING |
| POL-RECOVERY-001 | DEC-014 | Customer/internal identity | PO+TL | PO business + TL security | ID-01 | Before Sprint 2 planning/G2/G4 | TBD-BLOCKING |

## 2. DEC-004 — Package Configuration Form

One row per approved package version.

| Field | Value | Validation/source |
|---|---|---|
| Configuration ID | CFG-PKG-001 | Stable; new effective version gets new ID |
| Environment | TBD-BLOCKING | Production requires approval; synthetic is separately labeled |
| Branch code/ID | TBD-BLOCKING | Exactly one active branch |
| Class type code/ID | TBD-BLOCKING | Exactly one active class type |
| Package name/version | TBD-BLOCKING | Unique active business key/version |
| Session count | TBD-BLOCKING | Positive integer; owner source evidence |
| Duration and unit | TBD-BLOCKING | Positive; expiry calculation definition explicit |
| Price Rupiah | TBD-BLOCKING | Integer ≥0; Finance-readable evidence |
| Effective from/to | TBD-BLOCKING | Valid period; no conflicting version |
| Source evidence | TBD-BLOCKING | Owner-approved price/package reference |
| Owner/approver/date | TBD-BLOCKING | Product Owner |
| Applied/verified | TBD-BLOCKING | Environment/build/config record and smoke evidence |

## 3. DEC-005 — Quota and Capacity Form

| Field | Value | Validation/source |
|---|---|---|
| Configuration ID | CFG-QUOTA-001 | Stable version |
| Branch / class type | TBD-BLOCKING | Exact business key |
| Minimum quota | TBD-BLOCKING | Integer ≥1 |
| Default capacity | TBD-BLOCKING | Integer ≥ minimum quota |
| Cutoff | H-24 | Existing approved business rule; timezone branch |
| Effective from/to | TBD-BLOCKING | No overlapping key period |
| Slot snapshot/override policy | TBD-BLOCKING | Explicit authorized action, reason and audit if override allowed |
| Source/owner/approval | TBD-BLOCKING | PO evidence/date |
| Verification | TBD-BLOCKING | Boundary and auto-cancel test references |

## 4. DEC-006 — Fee and Projection Rate Forms

### Instructor fee

| Field | Value | Validation/source |
|---|---|---|
| Configuration ID | CFG-FEE-001 | Stable version |
| Instructor / branch / class type | TBD-BLOCKING | Exact business key |
| Fee per matched class, Rupiah | TBD-BLOCKING | Integer ≥0; one matched instructor check-in and completed class creates one unit |
| Effective from/to | TBD-BLOCKING | Non-overlap |
| Source/owner/approval | TBD-BLOCKING | Finance evidence; PO+Finance date |
| Verification | TBD-BLOCKING | Applied-value snapshot and historical test |

### Projection rate

| Field | Value | Validation/source |
|---|---|---|
| Configuration ID | CFG-PROJ-001 | Stable version |
| Branch / class type | TBD-BLOCKING | Exact business key |
| Rate per sold session, Rupiah | TBD-BLOCKING | Integer ≥0 |
| Effective from/to | TBD-BLOCKING | Non-overlap |
| Source/owner/approval | TBD-BLOCKING | Finance evidence; PO+Finance date |
| Verification | TBD-BLOCKING | Purchase snapshot and historical test |

## 5. DEC-007 — Customer and Instructor Check-in Policy

| Policy field | Proposed baseline for approval | Status/validation |
|---|---|---|
| Customer window start | 30 minutes before ClassSlot start | TBD-BLOCKING; PO must approve |
| Customer window end | ClassSlot end | TBD-BLOCKING; inclusivity must be explicit |
| Instructor QR start | Approximately 30 minutes before start | TBD-BLOCKING; exact boundary/TTL required |
| Instructor/customer boundary inclusivity | TBD-BLOCKING | Define `<`, `≤`, start/end timezone behavior |
| Token properties | signed, purpose/audience/resource-bound, short-lived, one JTI effect | Technical baseline; TL review required |
| Admin backfill | Until H+2 after class end with actor/reason/audit | Business baseline; exact inclusivity TBD-BLOCKING |
| Wrong actor/slot/replay | reject without duplicate attendance/hour | Required |
| Owner/approver/evidence | TBD-BLOCKING | PO date + TL/QA boundary review |

## 6. DEC-008 — Manual Studio Cancellation Policy

| Policy field | Value/decision required |
|---|---|
| Requestor and approver roles | TBD-BLOCKING |
| Eligible ClassSlot states | TBD-BLOCKING |
| Cutoff/window and emergency exception | TBD-BLOCKING |
| Reason code list and free-text requirement | TBD-BLOCKING |
| Reservation handling | Proposed atomic release; PO approval required |
| Ledger handling | No new balance unless reversing a valid referenced debit; exception policy TBD-BLOCKING |
| Customer/instructor/internal notification | Required recipients/channel/timing TBD-BLOCKING |
| Instructor hour/cost treatment | No hour unless valid matched policy; exact exception TBD-BLOCKING |
| Audit/before-after/source | Required |
| Owner/approver/evidence | TBD-BLOCKING |

## 7. DEC-011 — Provider and Region Evaluation

Score candidates 0–5 and attach evidence; commercial price alone cannot override a security/recovery blocker.

| Criterion | Weight | Candidate/evidence/status |
|---|---:|---|
| Indonesia-adjacent region, latency and data handling | 15% | TBD-BLOCKING |
| Managed PostgreSQL PITR/RPO/RTO capability | 20% | TBD-BLOCKING |
| Managed cache/queue and private object storage | 10% | TBD-BLOCKING |
| IAM/MFA/network/secret manager/security logging | 15% | TBD-BLOCKING |
| Deployment/IaC/rollback support | 10% | TBD-BLOCKING |
| Monitoring/exportability and incident support | 10% | TBD-BLOCKING |
| Cost/forecast/contract/exit portability | 10% | TBD-BLOCKING |
| Team operability and account ownership | 10% | TBD-BLOCKING |
| **Total** | **100%** | TBD-BLOCKING |

Decision records selected services, region, networking, backup, object lifecycle, secret manager, monitoring, owner/admin backup, estimated pilot cost, exit plan and rejected alternatives.

## 8. DEC-012 — Session and Token Policy

| Field | Recommended decision package | Status |
|---|---|---|
| Web session | Implemented local draft: `dd_session` + rotating `dd_refresh`, HttpOnly, SameSite=Lax, Secure di non-development; production origin validation | Production approval required |
| Mobile session | Rotating refresh-token family; access token in secure storage | TBD-BLOCKING |
| Access/session/refresh TTL | Synthetic/test only: 15m access/web session, 30d mobile refresh; production TBD-BLOCKING | No production default |
| Refresh reuse | Revoke token family and alert/security audit | TL approval required |
| Session revocation | Inactive/deactivated/compromise/password or identity recovery events | Required; timing TBD |
| Authorization amendment | MFA/TOTP dihapus. Tindakan sensitif memakai permission efektif, scope cabang, optimistic locking, audit dan separation-of-duties | Implemented local; production UAT required |
| Owner/approval/evidence | TL / TBD-BLOCKING | ADR/OpenAPI/test references |

Password sign-in amendment: internal accounts may create Argon2id credentials only through
valid invitation/setup tokens. Resend configuration, verified sender/domain, HTTPS public base
URL, Google OAuth origin, encryption key, migration rehearsal, and security UAT remain production
blockers.

## 9. DEC-013 — Notification Fallback Policy

| Field | Proposed baseline/status |
|---|---|
| Primary MVP channel | SMTP Niagahoster email melalui CR-SMTP-001; production approval/evidence TBD-BLOCKING |
| Fallback | Persisted in-app notification; PO/TL approval TBD-BLOCKING |
| No silent success | Required; accepted is not delivered |
| Retry | Bounded provider-aware backoff; exact limits operational config TBD-BLOCKING |
| Terminal handling | Dead-letter alert, operator action, auditable manual retry |
| WhatsApp/push | Post-pilot kecuali Change Request; Resend hanya rollback manual |
| Recipient/event/template ownership | TBD-BLOCKING |
| Operator SLA/escalation | TBD-BLOCKING |
| Approval/evidence | TBD-BLOCKING; TC-NOTIF references required |

## 10. DEC-014 — Recovery and Account Linking Policy

| Field | Proposed baseline/status |
|---|---|
| Automatic linking | Never link unverified phone/email; required baseline |
| Google linking | Verified issuer/audience/expiry/nonce/email_verified identity; match only an existing identity or valid pending invitation |
| Phone change | Re-authentication; notify old verified channel when available |
| Lost Google/phone access | Support escalation with approved identity evidence; exact proof TBD-BLOCKING |
| Conflicting identities | Freeze automatic link; authorized support review and audit |
| Recovery SLA/roles | Password token 15m, one-time, enumeration-safe request; production support role/SLA TBD-BLOCKING |
| Session action after recovery | Revoke relevant sessions/token family; notify user |
| PII handling/retention | Minimal evidence; DEC-009 linkage required before production |
| Approval/evidence | PO+TL / TBD-BLOCKING; TC-AUTH references |

## 11. Application and Verification Register

| Config/policy ID | Approved version/date | Environment | Applied by/build/time | Verification | Rollback/replacement | Status |
|---|---|---|---|---|---|---|
| CFG/POL/ADR-* | TBD-BLOCKING | TBD-BLOCKING | TBD-BLOCKING | TBD-BLOCKING | TBD-BLOCKING | NOT APPROVED |
| ADR-AUTH-SYN-001 / POL-RECOVERY-SYN-001 | 2026-07-19 | synthetic/test only | BG-2 build | automated auth/security evidence | replace with approved production DEC | APPROVED NON-PRODUCTION |

Approval of a form does not prove it was applied. Application and verification evidence are separate and required before environment/release readiness.

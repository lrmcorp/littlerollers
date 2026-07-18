# Migration Mapping, Reconciliation & Cutover Workbook

**Status:** DRAFT  
**Coordinator:** PM/BA  
**Approvers:** Data Owner and Finance for their controls; Product Owner for cutover

## 1. Source Inventory

| SRC ID | Source/file/table | Business owner | Extract method | Key candidate | Data period | Classification | Version/checksum | Status |
|---|---|---|---|---|---|---|---|---|
| SRC-001 | Customer master | TBD-BLOCKING | Read-only export | normalized phone/email + source ID | active | PII | TBD-BLOCKING | BLOCKED |
| SRC-002 | Active packages/balances | TBD-BLOCKING | Read-only export | source package/customer key | active at cutover | PII/financial | TBD-BLOCKING | BLOCKED |
| SRC-003 | Package/class/branch master | TBD-BLOCKING | Read-only export | source code | current/effective | internal | TBD-BLOCKING | BLOCKED |
| SRC-004 | Instructor/assignment/rates | TBD-BLOCKING | Read-only export | source instructor key | current/effective | PII/financial | TBD-BLOCKING | BLOCKED |
| SRC-005 | Upcoming class/bookings | TBD-BLOCKING | Read-only export | source slot/booking key | cutover horizon | PII | TBD-BLOCKING | BLOCKED |
| SRC-006 | Financial opening controls | Finance TBD-BLOCKING | Signed export | branch/period/control type | agreed opening | financial | TBD-BLOCKING | BLOCKED |

Raw extracts are immutable, access-restricted, encrypted where supported, versioned and checksummed. Cleaning happens in controlled staging copies with an explicit change/reason log.

## 2. Column Mapping Template and Initial Baseline

| MAP ID | Source.column | Target.field | Required | Transform | Validation | Default | Reject reason | Owner |
|---|---|---|---:|---|---|---|---|---|
| MAP-001 | customer.source_id | User migration source key | Y | trim/string | unique per source | none | MISSING/DUPLICATE_SOURCE_KEY | Data Owner |
| MAP-002 | customer.name | User.display_name | Y | trim/collapse whitespace | 1..160 chars | none | INVALID_NAME | Data Owner |
| MAP-003 | customer.phone | User.phone_e164 | conditional | normalize Indonesia/E.164 | parseable, duplicate reviewed | none | INVALID/AMBIGUOUS_PHONE | Data Owner |
| MAP-004 | customer.email | ExternalIdentity verified candidate | N | lowercase/trim | syntactically valid; not automatically verified | null | INVALID_EMAIL | Data Owner |
| MAP-005 | package.branch | Branch.id | Y | approved dictionary | exact one target | none | UNKNOWN_BRANCH | Data Owner |
| MAP-006 | package.class_type | ClassType.id | Y | approved dictionary | exact one target | none | UNKNOWN_CLASS_TYPE | Data Owner |
| MAP-007 | package.activation | CustomerPackage.activation_date | Y | parse with declared source timezone | valid date ≤ expiry | none | INVALID_ACTIVATION | Data Owner |
| MAP-008 | package.expiry | CustomerPackage.expiry_at | Y | branch-local end → UTC | activation≤expiry | none | INVALID_EXPIRY | Data Owner |
| MAP-009 | package.sale_price | CustomerPackage.sale_price_rp | Y | strip Rp/separator; integer | ≥0 with source evidence | none | INVALID_PRICE | Finance |
| MAP-010 | package.balance | SessionLedger.quantity | Y | integer | ≥0 | none | INVALID_OPENING_BALANCE | Data Owner |
| MAP-011 | package.source_key | Ledger.reference_id | Y | prefix source/batch | stable/unique | none | DUPLICATE_PACKAGE_KEY | Data Owner |
| MAP-012 | instructor.source_id | User source key | Y | trim/string | unique | none | DUPLICATE_INSTRUCTOR | Data Owner |
| MAP-013 | rate.amount | InstructorFee/ProjectionRate value | Y | Rupiah integer | ≥0; owner approved | none | INVALID_RATE | Finance |
| MAP-014 | rate.effective_from | effective master date | Y | parse local date | no overlap | none | OVERLAPPING_RATE | Finance |
| MAP-015 | slot.start/end | ClassSlot UTC timestamps | Y | source timezone → UTC | end>start; future horizon | none | INVALID_SLOT_TIME | Admin |
| MAP-016 | booking keys | Booking references | Y | resolve dictionaries | customer/package/slot valid; capacity/balance | none | INVALID_BOOKING_REFERENCE | Admin |

No business value uses an invented default. `Default=none` means the row rejects when required data is absent. Additional source columns are added before rehearsal, not silently ignored.

## 3. Stable Keys and Batch Rules

- Target stores source system, source entity and source key in a migration-key table with unique constraint.
- `MigrationBatch` records source version/checksum, mapping version, code version, environment, executor, timestamps, row totals, accepted/rejected and control totals.
- Opening balance creates exactly one `MIGRATION_OPENING` ledger per source package key and batch scope; rerun resolves the same target/effect.
- A changed source checksum creates a new reviewed batch/delta. Same checksum cannot produce a different result without mapping/code version change and documented decision.
- Row validation is deterministic. Fatal schema/checksum/configuration errors fail the batch; row-specific errors enter reject report without leaking unnecessary PII.
- Referential load order: branch/class/user → assignments/master/package → opening ledger → slots → bookings/reservations → financial controls.

## 4. Reconciliation Worksheet

| REC-CONTROL | Source measure | Target query/measure | Tolerance | Approver | Result/evidence |
|---|---|---|---|---|---|
| MIG-REC-001 | Active unique customer count | active migrated Customer source keys | exact | Data Owner | TBD |
| MIG-REC-002 | Active package count | migrated CustomerPackage count | exact | Data Owner | TBD |
| MIG-REC-003 | Sale value by branch/package and total | CustomerPackage snapshot sum | exact Rp | Finance | TBD |
| MIG-REC-004 | Balance per package/customer | sum MIGRATION_OPENING by source key | exact | Data Owner | TBD |
| MIG-REC-005 | Total sessions by branch/type | ledger opening sum | exact | Data Owner | TBD |
| MIG-REC-006 | Instructor assignment/rate rows | active effective records | exact, no overlap | Super Owner/Finance | TBD |
| MIG-REC-007 | Upcoming slots/bookings by key/status | ClassSlot/Booking/Reservation | exact | Admin/Manager | TBD |
| MIG-REC-008 | Capacity and available session invariants | invariant query | zero violation | QA/TL | TBD |
| MIG-REC-009 | Financial opening control | approved target report/control table | exact Rp | Finance | TBD |
| MIG-REC-010 | Rejected rows | exception register with owner/disposition | all owned; zero material unresolved | PM/BA | TBD |

Any per-package session mismatch or financial mismatch blocks cutover. Other exception requires signed risk acceptance, owner and remediation date; it cannot be hidden by aggregate totals.

## 5. Pilot Selection Worksheet

| Candidate branch | Data 30% | PIC 25% | Training 20% | Device 10% | Representative 10% | Sample 5% | Weighted total | Blocker | Decision |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| TBD-BLOCKING | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | DEC-010 |

Each scored item links evidence. Overall must be ≥75, data/PIC/device ≥70, training ≥80, and no security/support/data blocker.

## 6. Freeze and Delta Procedure

1. PO approves system-of-record, freeze start/end, allowed emergency changes and named command team.
2. Source owner publishes final full extract with timestamp/timezone, version and checksum; access becomes read-only except logged emergency path.
3. Emergency/source changes are recorded in delta register with stable key, before/after, actor, reason and timestamp.
4. Import full extract, then delta in chronological/idempotent order; late unregistered changes reject go/no-go.
5. Reconciliation uses the same final source/delta checksums. Sign-off names exact target build and migration code version.

## 7. Timed Cutover Runbook

Relative times are finalized in rehearsal; owner/contact must be named before G6.

| Relative time | Action | Owner | Evidence | Stop/rollback condition |
|---|---|---|---|---|
| T-120 | Start bridge; confirm people/accounts/runbooks; source freeze | PM/BA | attendance/freeze confirmation | missing owner/access |
| T-105 | Final extracts/checksums; target backup/restore point | Data Owner/TL | manifest + backup ID | checksum/backup failure |
| T-90 | Validate config/build/mapping versions | TL/QA | signed manifest | version mismatch |
| T-75 | Import master/identity/assignments | Migration operator | batch controls | fatal/referential error |
| T-55 | Import package/opening ledger | Migration operator | batch + ledger controls | any material mismatch |
| T-35 | Import slots/bookings/delta | Migration operator | batch controls | capacity/reference violation |
| T-20 | Reconciliation and Finance/Data Owner sign-off | Data Owner/Finance | MIG-REC worksheet | required control fail |
| T-10 | QA smoke; TL health/queue/integration check | QA/TL | smoke/telemetry | core/security instability |
| T-0 | PO go/no-go; restricted access opens | PO | decision record | no approval |
| T+30 | First transaction reconciliation | QA/business | transaction log | duplicate/corruption |
| T+120 | Expand pilot access or rollback decision | PO/TL | observation report | rollback trigger reached |

Rollback disables new writes, preserves evidence, exports all new-system transactions since T-0, returns operation to the declared legacy system, reconciles every interim transaction, communicates status, and requires a new rehearsal before retry.

## 8. Parallel Run and Exit

One declared system remains authoritative for writes; the second receives controlled mirrored/manual entries. Daily worksheet compares purchase, package balance/reservation, booking, attendance, hour, cancellations, notification and financial controls. Exit requires five consecutive operating days with zero material mismatch, zero P1/P2, competency checks for core users, stable support/monitoring and signed PO decision.

## 9. Training, Support and Offboarding Evidence

- Role-based training scripts use approved UAT flows; attendance and competency result are recorded.
- Support roster covers intake, triage, Incident Commander, business impact confirmation, escalation and backup contacts.
- Daily Dose owns/administers repository, cloud, domain, Meta, Google, Figma, stores, monitoring, storage and secret manager.
- Recipient independently demonstrates build, deploy, rollback, restore, queue recovery, ledger reconciliation and monthly close.
- Vendor accounts are revoked, secrets rotated and access review signed only after evidence/asset transfer completes.


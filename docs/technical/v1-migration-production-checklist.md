# Daily Dose v1 → v2 production checklist

This checklist supplements the migration runbook. A checked box is evidence-backed; never check an item from an assumption or from the 29 July audit dump alone.

## Environment matrix

| Environment | Source | Target | Purpose | Exit approval |
| --- | --- | --- | --- | --- |
| `migration-dev` | restored snapshot, read-only | empty v2 | mapper development | Technical Lead |
| `rehearsal-1` | latest full snapshot, read-only | empty v2 | mapping and resolution profile | Data Owner |
| `rehearsal-2` | fresh full snapshot, read-only | empty v2 | full run, replay, freeze simulation | Data Owner + Finance + QA |
| `staging-pilot` | pilot branch snapshot/final delta | empty or approved pilot target | branch operational acceptance | Product Owner |
| `production` | v1 writer until branch freeze | production v2 | branch-by-branch cutover | Go/no-go board |

Every environment must use separate source and target database identities, separate credentials, and its own batch IDs. Fixture/demo data is prohibited in every v2 target.

## Snapshot gate

- [ ] Latest consistent MySQL dump timestamp and last transaction position recorded.
- [ ] Dump SHA-256 verified after transfer and restore tested.
- [ ] All 34 tables and 309 source columns match the checked-in source contract.
- [ ] Source database credential is limited to `SELECT`.
- [ ] `rehearsal-preflight` reports `credentialReadOnly=true` and the expected MySQL version.
- [ ] Snapshot start/end time and GTID/binlog coordinate are recorded; `V1_SNAPSHOT_AT` equals snapshot completion.
- [ ] `V1_MIGRATION_MEDIA_MODE=metadata-only` is set for every operator process.
- [ ] Every legacy media column is represented by encrypted `MigrationDeferredMediaReference` metadata.
- [ ] Active identity-document, payment-proof, and media-asset counts created by migration are zero.
- [ ] Empty-target gate reports no v2 business records.

## Rehearsal gate

- [ ] All six phases complete in the enforced order.
- [ ] Same batch replay has no additional business effect or ledger posting.
- [ ] Failed batch resumes only after an approved, audited resolution.
- [ ] 8,996 users, 14,447 orders, 131,437 bookings, 75,357 slots, 7,954 voucher usages, 22,285 journals, and 214,899 audit events reconcile to the current source baseline or an approved newer control total.
- [ ] Session control totals reconcile exactly, including opening, active/non-deleted, reserved, consumed, released, and available balances.
- [ ] Order counts and Rupiah totals reconcile exactly by branch, package, legacy status, and transaction date.
- [ ] Exactly one `MIGRATION_OPENING` ledger entry exists per resolved order.
- [ ] User/role/assignment/capability, booking/reservation/attendance status, voucher entitlement/redemption, COA/journal hierarchy, debit/credit, audit, and notification controls match exactly.
- [ ] No material database reject, open resolution, or target orphan remains; deferred media is reported separately and nonblocking.
- [ ] Operator evidence directory contains a SHA-256 manifest and reports `blocking=false`, zero mismatch, and zero open material decisions.
- [ ] Rehearsal runner reports `PASSED_AUTOMATED_GATES` and evidence verification succeeds before manual sign-off.
- [ ] Super Owner, branch staff, Finance, instructor, and customer E2E core flows pass with migrated data.
- [ ] Bcrypt login upgrades transactionally to Argon2id and subsequent login succeeds.
- [ ] Rollback report and restoration of v1 operation are exercised.

## Pilot branch gate

- [ ] Pilot selected using orphan rate, open-resolution count, volume, media completeness, PIC readiness, and device readiness.
- [ ] Branch write freeze announced and verified.
- [ ] v1 and v2 backups completed immediately before import.
- [ ] Final branch delta imported by an update-aware CDC path that passed rehearsal.
- [ ] Reconciliation and smoke E2E pass before branch traffic is opened on v2.
- [ ] Five operational days show no mismatch in purchases, Rupiah, sessions, booking, attendance, voucher, journal, or authentication.

Rollback the branch immediately for any session/Rupiah mismatch, duplicate posting, authentication failure, or unusable core flow.

## Final go/no-go

- [ ] All branches have passed the pilot checklist.
- [ ] Full v1 write freeze and final transaction position are recorded.
- [ ] Final idempotent delta, reconciliation, health, queue, and E2E smoke checks pass.
- [ ] Data Owner approval recorded.
- [ ] Finance approval recorded.
- [ ] QA approval recorded with zero P1/P2.
- [ ] Technical Lead approval recorded.
- [ ] Product Owner go decision recorded.
- [ ] v2 declared system of record and v1 made read-only.
- [ ] Monitoring covers mismatch, rejects, credential upgrades, failed jobs, deferred-media counts, duplicate ledger entries, latency, and error rate.
- [ ] Restore tests for both v1 and v2 backups pass before v1 retirement.

## Current hard blockers

- GTID/ROW/FULL direct `mysqlbinlog` capture, encrypted spool/manifest, verification, status, drain, cutover registry, row-level dispatcher, and reverse pilot consumer are implemented. MySQL 8.4 migration validation passes.
- Reference run `mig_20260803050200_d02610` proves the automated Rehearsal 1 runner and database-only integration harness pass read-only credential preflight, controlled pause/resume, all six phases, exact dimensional sessions/Rupiah/order/booking/voucher/journal/audit controls, evidence verification, 15 live CDC changes spanning six domains, identical replay, profile/booking reverse drain, receipt replay, and crash-after-receipt recovery. Broader business mutation coverage remains a Rehearsal 2 acceptance item.
- Pilot outbox keeps database business facts enabled while payment-proof and identity-document facts are explicitly suppressed in `metadata-only` mode. Finance journal/COA and global master writes remain v1-owned during pilot.
- Approved delta decisions can safely retry blocked events with source-column allowlisted overrides and `retainArgon2id`; resolution policies for every ambiguity class still require Data Owner/Finance fixtures and tests.
- A fresh production dump has not been supplied; the 29 July dump is audit-only. Storage export is intentionally outside the current database-only scope.
- Local MySQL 8.4 validation is available, but isolated `rehearsal-1`, `rehearsal-2`, staging, and production environments plus current source credentials are still required.

These blockers prohibit staging pilot and production cutover even when static validation and mocked browser tests pass.

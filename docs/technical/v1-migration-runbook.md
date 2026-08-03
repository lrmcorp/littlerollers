# Daily Dose v1 → v2 migration runbook

## Safety contract

- `dailydose_v1` is always the source and must remain the only writer until a branch cutover.
- A non-delta first phase only runs when all v2 business tables are empty. Migration control tables do not count as fixture data.
- Source and target database identities must differ.
- The operator must supply the expected SHA-256; the CLI hashes the dump again before creating a batch.
- A changed source checksum, mapping version, phase order, or source schema fails closed.
- No command in this runbook deletes or rolls back business data. `rollback-report` only reports records attributable to a batch.
- Import, reconciliation, and evidence commands require `MIGRATION_ALLOW_WRITES=true`. Keep this unset for read-only profile, gate, resume, status, and rollback-report jobs.

The audited 29 July dump is 155 MB with SHA-256:

```text
10c7a6511471a7e8721dd86d4719ccb7c538bccc08b90a070e71ba0c2d40e92d
```

This checksum is an audit reference, not the final production source. Production needs a fresh full dump and deltas. Media transfer is explicitly deferred during the current database-only rehearsal.

## Required environment

```text
DATABASE_URL=<empty v2 target>
V1_DATABASE_URL=<restored read-only v1 source>
V1_DUMP_SHA256=<64 lower-case hex characters>
V1_SNAPSHOT_AT=<ISO-8601 timestamp>
V1_SNAPSHOT_STARTED_AT=<ISO-8601 timestamp>
V1_SNAPSHOT_COMPLETED_AT=<same value as V1_SNAPSHOT_AT>
V1_SNAPSHOT_GTID=<snapshot GTID set or recorded binlog coordinate>
V1_EXPECTED_SOURCE_MYSQL_VERSION=8.4
V1_MAPPING_VERSION=v1.0.0
V1_MIGRATION_MEDIA_MODE=metadata-only
V1_REHEARSAL_CONFIRMATION=REHEARSAL_1_DATABASE_ONLY
V1_BRANCH_CODES={"1":"GREEN_GARDEN","2":"MUARA_KARANG","3":"GRAHA_FAMILY","4":"UNTAR","5":"ORANGE_GROVES"}
V1_BRANCH_TIMEZONES={"1":"Asia/Jakarta","2":"Asia/Jakarta","3":"Asia/Jakarta","4":"Asia/Jakarta","5":"Asia/Jakarta"}
V1_MIGRATION_ACTOR_SOURCE_USER_ID=<approved v1 Super Owner user id>
MIGRATION_PII_KEY_BASE64=<base64-encoded 32-byte AES key>
MIGRATION_PII_HASH_PEPPER=<separate high-entropy pepper>
MIGRATION_DELTA_KEY_BASE64=<different base64-encoded 32-byte AES key>
```

Resolution decisions through the internal API additionally require a verified OTP challenge no older than `MIGRATION_MFA_MAX_AGE_SECONDS` (default 900 seconds) and `MIGRATION_STEP_UP_TOKEN_HASH=sha256(<operator step-up token>)`. Never put the token, database URLs, passwords, NIK, or private file paths in logs or command history.

## Operator sequence

1. Restore the dump into an isolated, read-only v1 database and deploy the new Prisma migration to a genuinely empty v2 database.
2. Profile all 34 source tables:

   ```bash
   pnpm db:migration:v1 profile
   ```

3. Verify the empty-target and checksum gates:

   ```bash
   pnpm db:migration:v1 gate --dump /absolute/path/to/dailydose.sql
   ```

4. Enable writes only for the operator process, prepare the first batch, then use the returned batch ID:

   ```bash
   MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 prepare --phase branch-master --dump /absolute/path/to/dailydose.sql
   MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 import --batch <batch-id> --dump /absolute/path/to/dailydose.sql
   ```

5. A rerun of the same completed batch returns `replay: true`. A source row whose checksum changed fails with `SOURCE_RECORD_OR_MAPPING_CHANGED` instead of overwriting v2 silently.
6. Inspect progress and reconciliation:

   ```bash
   pnpm db:migration:v1 resume --batch <batch-id>
   MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 reconcile --batch <batch-id>
   pnpm db:migration:v1 rollback-report --batch <batch-id>
   ```

7. Setelah fase keenam lulus, buat evidence operator ke direktori absolut yang masih kosong:

   ```bash
   MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 evidence \
     --batch <batch-id-fase-keenam> \
     --output /absolute/path/to/rehearsal-1-evidence
   ```

   Perintah ini menulis ringkasan, source profile, control totals, reconciliation, resolution summary, rollback report, serta manifest SHA-256. Evidence tidak memuat source ID per-record, keputusan mentah, credential, NIK, atau referensi media privat.

In `metadata-only` mode, do not pass a storage manifest. KTP, selfie, payment-proof, journal-attachment, and other legacy media reference strings are encrypted into `MigrationDeferredMediaReference` and reported as nonblocking `deferredMedia`; no source file is opened, copied, or activated.

The active-media path remains available for a later, separately approved phase, but it is outside the current rehearsal scope. Do not prepare or pass a storage manifest while `V1_MIGRATION_MEDIA_MODE=metadata-only`.

## Rehearsal 1 boundary

Rehearsal 1 uses a fresh, consistent production snapshot restored to an isolated source server. Record the snapshot timestamp, dump SHA-256, MySQL server version, schema/mapping version, and GTID/binlog coordinate in the change record. The source credential is read-only and the target starts empty without fixture/demo data.

Run the six phases strictly in order. For every phase execute `prepare → import → reconcile → replay import → rollback-report`; stop immediately when `blocking=true`. Rehearsal 1 does not freeze production and does not import live delta. CDC starts from the recorded snapshot GTID in Rehearsal 2 after the full-import result and all database-only resolution decisions have been signed off.

The exact reconciliation gate includes user/role/assignment/capability cardinality; order count and Rupiah by branch, package, legacy status, and date; CustomerPackage/opening-ledger cardinality; reserved, consumed, released, and available sessions; booking/reservation/attendance status; voucher entitlement/redemption; COA/journal hierarchy and debit/credit; audit/notification counts; orphan references; duplicate opening ledgers; and deferred-media metadata reported separately as nonblocking.

### Automated Rehearsal 1 runner

Store the Rehearsal 1 environment in an absolute-path file with mode `0600`. The runner refuses a source credential containing write privileges, a non-empty target, active media mode, an unapproved mapping version, mismatched dump checksum, missing snapshot window/GTID, or a source/target identity collision.

```bash
pnpm db:migration:rehearsal -- \
  --env-file /absolute/secure/rehearsal-1.env \
  --dump /absolute/snapshots/dailydose-latest.sql \
  --output /absolute/evidence/rehearsal-1-<date> \
  --run-id r1_<date> \
  --apply-migrations \
  --execute
```

The runner applies Prisma migrations, executes the preflight/profile/gate, then runs all six phases with import replay, reconciliation, rollback report, timing, CPU, and peak-memory sampling. It writes only PII-safe evidence and never stores database URLs, raw GTID, encryption keys, private media references, or absolute dump paths.

If a phase reaches a material reject, resolution, or reconciliation blocker, the runner exits with status `PAUSED` and preserves its batch ID. Resolve the item through the Super Owner control plane, then continue the same run:

```bash
pnpm db:migration:rehearsal -- \
  --env-file /absolute/secure/rehearsal-1.env \
  --dump /absolute/snapshots/dailydose-latest.sql \
  --output /absolute/evidence/rehearsal-1-<date> \
  --resume \
  --execute
```

After automated gates pass, verify the complete evidence tree and finish the generated smoke/sign-off checklist:

```bash
pnpm db:migration:rehearsal:verify -- \
  --output /absolute/evidence/rehearsal-1-<date>
```

`PASSED_AUTOMATED_GATES` is not the final organizational sign-off. Rehearsal 1 is complete only after the generated `smoke-and-signoff.md` is approved by Data Owner, Finance, and Technical Lead.

## Implemented phases

The executable `branch-master` mapper imports `locations`, `location_studios`, `ruangans`, and `location_openings` into Branch, Studio, Room, BranchPublicProfile, and BranchOpeningHour. The executable `user-role` mapper imports users, profiles, bcrypt credentials, identities, encrypted contact aliases, roles, and instructor/owner assignments. Duplicate or invalid phones and unresolved branch/role mappings enter the resolution queue; users are never merged automatically. `user-role` requires a 32-byte `MIGRATION_PII_KEY_BASE64` and `MIGRATION_PII_HASH_PEPPER`.

IDs are deterministic, each target has a unique source key and record checksum, soft-deletes remain historical/inactive, and each aggregate plus its source keys is written transactionally.

All six mapper phases are executable in enforced order:

1. `branch-master`
2. `user-role`
3. `package-order`
4. `ledger`
5. `slot-booking`
6. `voucher-finance-audit-media`

- `package-order` imports class types, branch-scoped package revisions, purchases, customer packages, legacy status metadata, and approved opening balances.
- `ledger` writes exactly one `MIGRATION_OPENING` ledger entry per migrated order.
- `slot-booking` imports slots, recurring schedules, enrollment, booking, reservation, feedback, and historical attendance without fabricating QR tokens.
- `voucher-finance-audit-media` imports voucher entitlement/redemption, code aliases, COA/journal hierarchy, safe audit metadata, legacy permissions, and notifications. In `metadata-only` mode it stores encrypted historical media references but creates zero active identity documents, payment proofs, or media assets.

A phase with an open material reject is set to `FAILED` with `OPEN_MATERIAL_RESOLUTIONS`; approve a PII-safe decision and rerun the same batch. The mapper marks the resolution `APPLIED` and the reject `RESOLVED` only after the target write succeeds.

## CDC, GTID, and branch cutover

MySQL source must have `log_bin=ON`, `binlog_format=ROW`, `binlog_row_image=FULL`, `gtid_mode=ON`, and `enforce_gtid_consistency=ON`. The local and production Compose definitions set those server options. Record the snapshot GTID before accepting new writes.

The CDC control path is executable through these operator-only commands:

```bash
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 delta-capture --events /absolute/path/events.ndjson --gtid-set <gtid-set> --operator <operator-id>
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 delta-capture --source-binlog --from-gtid <snapshot-gtid-set> --spool-dir /absolute/encrypted/spool --operator <operator-id>
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 delta-verify --operator <operator-id>
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 delta-import --operator <operator-id>
pnpm db:migration:v1 delta-status
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 delta-drain --source-branch <v1-location-id> --high-water-gtid <gtid> --high-water-order <order>
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 branch-cutover --source-branch <v1-location-id> --action <freeze|activate|rollback-start|rollback-complete> --actor <v2-user-id> --expected-version <version>
```

`delta-capture` can accept canonical NDJSON for controlled rehearsal or invoke the official `mysqlbinlog` executable directly with `--source-binlog`. Direct capture requires ROW/FULL/GTID, resolves branch ownership from the read-only source, normalizes MySQL TIMESTAMP row values, encrypts the captured stream with AES-256-GCM, and writes a checksum manifest with mode `0600`. Each canonical event includes `eventKey`, `gtid`, monotonically increasing `transactionOrder`, `eventOrder`, `sourceTable`, `sourceId`, operation, before/after, branch ownership, binlog coordinates, and occurrence time. Identical event keys/checksums are replay/no-op; changed replays fail closed. Keep spool and transient NDJSON outside Git and apply an operator retention policy.

The state/verification/cutover control plane and row-level dispatch for all mapped source tables are implemented. Delta handlers reuse deterministic source keys, preserve deletes as historical/inactive, protect Argon2id credentials, append ledger adjustments, and queue ambiguous or media-bearing changes for audited resolution. A live MySQL 8.4 smoke test has passed capture, verify, INSERT, UPDATE, DELETE, and identical replay for the `roles` aggregate. This is engineering evidence only: all material table families, reconnect/gap injection, and approved-resolution replay still require the two-database Rehearsal 2 matrix before pilot.

During `V2_ACTIVE`, purchase/payment decisions, customer profile changes, voucher redemption, booking create/cancel/reschedule, attendance, and session-adjustment writes create encrypted, idempotent pilot outbox records. In `metadata-only` mode payment-proof and identity-document events are deliberately not enqueued. The limited v1 adapter applies database facts in sequence, commits an idempotent receipt in the same v1 transaction, records new v1 source IDs where applicable, verifies receipt checksums, and stops after a bounded retry count.

The compatibility-alias implementation remains in the repository but is disabled for database-only rehearsals. It is not part of the current engineering or rehearsal gate.

```bash
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 pilot-outbox-prepare
pnpm db:migration:v1 pilot-outbox-status --source-branch <v1-location-id>
pnpm db:migration:v1 pilot-outbox-verify --source-branch <v1-location-id>
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 pilot-outbox-apply --source-branch <v1-location-id>
MIGRATION_ALLOW_WRITES=true pnpm db:migration:v1 pilot-outbox-drain --source-branch <v1-location-id> --high-water-order <order>
```

Finance journal/COA and public/master media remain v1-owned during pilot and are not accepted by the v2 reverse bridge. Password reset/change is locked whenever any branch is freezing, draining, active on v2, or rolling back.

## Synthetic integration harness

The repository includes an isolated Compose harness with two MySQL 8.4 servers, GTID/ROW/FULL source capture, synthetic 34-table source schema, empty migrated target, shared private storage, limited capture/rollback users, six ordered full-import phases, reconciliation, replay, live `mysqlbinlog` capture, delta verification/import, and owned-resource cleanup.

```bash
pnpm db:migration:integration
pnpm db:migration:integration:keep
pnpm db:migration:integration:cleanup --run-id <run-id>
```

Normal runs remove their own containers, networks, volumes, spool, fixture dump, and private test files while retaining PII-safe evidence under `.migration-integration/runs/<run-id>/evidence`. `:keep` retains a failed environment for diagnosis. The fixture is generated from `v1-schema-contract.json` and contains synthetic values only; it never reads the 29 July dump.

Reference engineering run `mig_20260803050200_d02610` passed the automated Rehearsal 1 runner against two MySQL 8.4 instances, all 30 Prisma migrations, read-only source preflight, controlled pause/resume, all six phases with representative 34-table fixture data, exact dimensional session/Rupiah/order/booking/voucher/journal/audit reconciliation, replay/rollback reports, evidence verification, 15 live multi-domain CDC events, database-only reverse profile/booking facts, receipt replay, and crash-after-receipt recovery. Production-scale totals and the fresh production snapshot remain external Rehearsal 1 gates.

## Internal Super Owner interface

Authenticated users with `migration:read` can inspect batches, control totals, rejects, and resolutions under `/api/v1/internal/migrations`. A resolution decision requires `migration:resolve`, `Idempotency-Key`, a valid `X-Migration-Step-Up`, a reason, and a PII-safe decision payload. Decisions are optimistic, auditable, and conflicting replays fail.

The Super Owner browser console is available at `/migrations`. It is read-only except for resolution decisions; import remains CLI-only. It also displays PII-safe CDC lag, checkpoints, branch cutover status, failed-event metadata, pilot outbox counts, and the nonblocking deferred-media count.

`includeHistorical` defaults to false for users, packages, vouchers, class slots, bookings, and audit logs. Only principals with `migration:read` may set it to true.

## Cutover blockers

Do not pilot or cut over while any of these is true:

- session or Rupiah reconciliation differs by any amount;
- material reject or resolution remains open;
- a target reference is orphaned;
- a bcrypt login fails or does not upgrade the credential to Argon2id;
- duplicate posting occurs on a batch replay;
- P1/P2 E2E failures remain for Super Owner, branch staff, Finance, instructor, or customer.
- a production delta is required but update-aware CDC replay has not passed rehearsal;
- the latest production dump has not replaced the 29 July audit snapshot.

Use `docs/technical/v1-migration-production-checklist.md` to record rehearsal, pilot, sign-off, and go/no-go evidence.

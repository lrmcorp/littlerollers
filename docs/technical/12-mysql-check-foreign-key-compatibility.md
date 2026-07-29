# MySQL Check Constraint and Foreign-Key Compatibility

MySQL 8.4 rejects a `CHECK` constraint that references a column used by a
foreign-key referential action. This affects actor columns such as
`SessionAdjustment.decidedById` and `UserCapabilityOverride.revokedById`.

The migrations therefore keep database checks for the non-FK state fields:

- session-adjustment snapshot values;
- decision status, decision code, and decision timestamp;
- override revoke timestamp and reason.

Actor/FK consistency remains an application invariant. The authorization and
ledger services validate it inside the same transaction as the mutation:

- pending adjustments have no decider;
- posted or rejected adjustments have a valid decider;
- the requester cannot decide their own adjustment;
- active overrides have no revoke metadata;
- revoked overrides have a valid revoking actor.

Integration tests must cover both valid and invalid combinations. A failed
service validation must roll back the business mutation, audit, outbox, and
notification effects together.

Do not resolve a failed migration as `--applied`. After deploying the corrected
SQL, resolve the failed migration as rolled back and run `migrate deploy` again.

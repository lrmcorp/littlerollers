# Session Adjustment Runbook

**Status:** DRAFT — production activation requires PO/TL/QA/Ops sign-off.

## Authorization and policy

- Daily Dose uses session authentication, static capability RBAC, branch scope, and separation of duties; MFA is not used.
- Admin with `ledger:adjust:request` creates a request in an assigned branch.
- a different Manager or Super Owner with `ledger:adjust:decide` approves or rejects it.
- `SESSION_ADJUSTMENT_ENABLED=false` disables request and decision while retaining ledger reads, pending records, audit, and notifications.

## Deployment and smoke test

1. Deploy with `SESSION_ADJUSTMENT_ENABLED=false` and run the reviewed MySQL migration.
2. Verify `SessionAdjustment_one_pending_per_package`, decision consistency, snapshot checks, and the unique ledger reference.
3. In staging, select an active customer package, request a positive and safe negative adjustment, approve/reject with a different actor, and verify the ledger, audit, outbox, in-app notification, and email occurrence.
4. Record PO/TL/QA/Ops sign-off, then set `SESSION_ADJUSTMENT_ENABLED=true` on the VPS and restart API processes normally.

## Monitoring and response

- Monitor pending queue age, `PENDING_ADJUSTMENT_EXISTS`, serialization conflicts, self-approval denials, ledger invariant failures, outbox projection, and terminal email failures for 24 hours.
- A stale or ineligible request must be rejected with an approved reason; never edit ledger or adjustment rows directly.
- For a terminal incident, set `SESSION_ADJUSTMENT_ENABLED=false`. Do not delete adjustment, ledger, audit, outbox, notification, or email-occurrence records.

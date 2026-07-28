# Health and Customer Session Operations Runbook

## Access model

- `/health` and `GET /api/v1/operations/health` require a valid session with a global
  `operations:read` grant. Dependency names, statuses, and safe detail codes are the only
  operational details returned.
- `/ledger` is an internal workspace requiring `ledger:read`. A customer may still read their
  own package balance through customer-owned API flows, but cannot enter this workspace.
- Adjustment actions remain separately protected by `ledger:adjust:request`,
  `ledger:adjust:read`, and `ledger:adjust:decide`.

## VPS health probe

The API Docker healthcheck opens a TCP socket to `127.0.0.1:32121`. It proves only that the API
process is listening. It intentionally does not call the authenticated dependency-readiness
endpoint. Dependency readiness is reviewed through `/health` by an authorized operator.

`DEGRADED` means the API can serve requests but at least one non-critical component needs
attention. `NOT_READY` means a critical dependency is unavailable. `STALE_HEARTBEAT` requires the
worker process and its Redis heartbeat to be inspected.

## Ledger review

1. Select the authorized branch and search by customer, package, or class type.
2. Verify the summary represents the complete filtered result, not only the current cursor page.
3. Open package history and paginate until the required reference is found.
4. Admin requests an adjustment with a controlled reason. The request does not mutate the ledger.
5. A different Manager or Super Owner reviews current balance, active reservation, and projection.
6. If the package is no longer eligible, refresh and resolve the underlying package/reservation
   condition. Never bypass the invariant.

For rollback, set `SESSION_ADJUSTMENT_ENABLED=false`. Ledger reads, existing adjustment records,
audit, outbox, and notifications must remain intact.

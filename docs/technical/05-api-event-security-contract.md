# API, Event, Job, Error & Security Contract

**Status:** DRAFT  
**Owner/approver:** Technical Lead

Normative HTTP shape berada di `openapi-v1.yaml`. Dokumen ini menetapkan semantics lintas endpoint dan worker.

## 1. HTTP Contract

- Semua response membawa `X-Correlation-ID`; server menerima nilai valid atau membuat baru. Internal `request_id` berbeda dan tidak dipercaya dari client.
- Cursor opaque, ditandatangani atau divalidasi; default/max page size ditetapkan saat implementation dan didokumentasikan pada OpenAPI sebelum client generation.
- Filter/sort adalah allowlist. Query branch dari client hanya filter dan tidak pernah menambah authority.
- `Idempotency-Key` disimpan sebagai hash bersama actor/operation scope dan canonical request hash. Same request returns stored result; different request returns `409 IDEMPOTENCY_KEY_REUSED`.
- Commands use action endpoints. Generic patch cannot change lifecycle state, balance, close, approval, attendance, assignment, or effective master.
- Generated TypeScript/Dart clients use the exact approved artifact checksum; CI fails on uncommitted generated changes or breaking contract.

## 2. Error Catalog

| Code | HTTP | Retryable | Meaning/client action |
|---|---:|---:|---|
| AUTHENTICATION_REQUIRED | 401 | N | Sign in; no resource detail |
| FORBIDDEN | 403 | N | Action not permitted; no sensitive detail |
| RESOURCE_NOT_FOUND | 404 | N | Missing or deliberately hidden cross-scope resource |
| VALIDATION_FAILED | 422 | N | Render safe field details |
| STATE_TRANSITION_INVALID | 409 | N | Refresh resource and show current state |
| VERSION_CONFLICT | 409 | Y | Refresh/review before retry |
| IDEMPOTENCY_KEY_REUSED | 409 | N | Generate key only for a new intent |
| CONFIGURATION_MISSING | 409 | N | Operator resolves approved effective configuration |
| PACKAGE_EXPIRED | 409 | N | Choose active package |
| INSUFFICIENT_AVAILABLE_SESSION | 409 | N | Purchase/choose another package |
| CLASS_CAPACITY_FULL | 409 | N | Choose another slot |
| BOOKING_CUTOFF_PASSED | 409 | N | Booking closed at H-2 |
| RESCHEDULE_CUTOFF_PASSED | 409 | N | Explain manual adjustment path |
| SCHEDULE_CONFLICT | 409 | N | Resolve overlapping assignment/availability |
| TOKEN_EXPIRED_OR_USED | 410 | N | Reissue/re-auth/backfill path where permitted |
| PERIOD_LOCKED | 423 | N | Use correction workflow |
| RECONCILIATION_REQUIRED | 409 | N | Resolve blocking control before close/cutover |
| RATE_LIMITED | 429 | Y | Respect `Retry-After` |
| EXTERNAL_PROVIDER_UNAVAILABLE | 503 | Y | Preserve pending state; in-app fallback |
| CONCURRENCY_RETRY_EXHAUSTED | 503 | Y | Safe retry with same idempotency key |
| INTERNAL_ERROR | 500 | Maybe | Show support correlation ID only |
| IDENTITY_CONFLICT | 409 | N | Do not auto-link; use approved recovery/support flow |
| EFFECTIVE_PERIOD_OVERLAP | 409 | N | Change business key/effective period |
| PAYMENT_PROOF_NOT_CLEAN | 409 | Y | Wait for scan or replace proof; cannot review/approve |
| PAYMENT_PROOF_UNSAFE | 422 | N | Replace with an allowed clean file |
| PURCHASE_ALREADY_DECIDED | 409 | N | Refresh and show existing decision/result |
| SEPARATION_OF_DUTIES_VIOLATION | 403 | N | Use a different authorized approver |
| LEDGER_INVARIANT_VIOLATION | 409 | N | Stop mutation and escalate to operations |
| QUOTA_EVALUATION_NOT_DUE | 409 | N | Wait for reviewed branch-time H-24 boundary |
| QUOTA_EVALUATION_LEASE_CONFLICT | 423 | Y | Another worker owns the active evaluation lease |
| CHECK_IN_TOKEN_PURPOSE_MISMATCH | 403 | N | Token purpose/audience/resource does not match actor command |
| CHECK_IN_TOKEN_REPLAYED | 409 | N | Show authoritative check-in result; never create another effect |
| CHECK_IN_WINDOW_CLOSED | 410 | N | Reissue/backfill only through approved DEC-007 path |
| COMPLETION_INVARIANT_VIOLATION | 409 | N | Roll back completion and reconcile controls |
| AUDIT_EXPORT_SCOPE_DENIED | 403 | N | Narrow filters to caller-authorized scope |
| AUDIT_EXPORT_EXPIRED | 410 | N | Create a new scoped export |
| JOB_RETRY_EXHAUSTED | 409 | N | Dead-letter/escalate through authorized recovery |
| JOB_LEASE_CONFLICT | 423 | Y | Refresh job after active lease ends |
| MIGRATION_CHECKSUM_MISMATCH | 409 | N | Re-finalize verified source or create new batch |
| MIGRATION_SCHEMA_INVALID | 422 | N | Correct mapping/source and revalidate |
| MIGRATION_RECONCILIATION_FAILED | 409 | N | Keep cutover blocked and resolve controls |
| MIGRATION_ROLLBACK_UNSAFE | 409 | N | Escalate to approved rollback procedure |

Messages are Indonesian and safe for the actor. Code semantics are stable within API version; clients branch on code, not message text.

## 3. Domain Event Envelope

```json
{
  "eventId": "uuid",
  "eventType": "purchase.approved.v1",
  "occurredAt": "UTC ISO-8601",
  "aggregate": { "type": "Purchase", "id": "uuid", "version": 3 },
  "branchId": "uuid-or-null",
  "actor": { "userId": "uuid-or-null", "source": "USER|SYSTEM|MIGRATION" },
  "correlationId": "string",
  "payload": {},
  "dataClassification": "INTERNAL"
}
```

Event types MVP: `purchase.submitted/approved/rejected.v1`, `package.expired.v1`, `booking.created/rescheduled/cancelled.v1`, `class.published/confirmed/auto_cancelled/manual_cancelled/completed.v1`, `check_in.instructor/customer.v1`, `session.adjusted.v1`, `period.closed.v1`, `correction.posted.v1`, and `security.user_deactivated.v1`.

- Event payload is minimal and references records; it excludes proof URLs, OTP, tokens, secrets and unnecessary phone/email.
- Producer writes OutboxEvent in the same transaction. Consumer records deterministic effect before acknowledging.
- Payload change is additive within version; meaning/removal requires a new event version and dual-read migration.

### Sprint 2–3 event payloads

| Event | Required payload references | Excluded data | Producer/effect |
|---|---|---|---|
| `purchase.submitted.v1` | purchaseId, branchId, customerUserId, packageId, paymentProofId, source | proof URL/content, phone/email | Purchase transaction; review occurrence may be derived |
| `purchase.approved.v1` | purchaseId, customerPackageId, purchaseLedgerEntryId, branchId, commercial snapshot version | proof/token/provider secret | Atomic approval/outbox; customer notification derived |
| `purchase.rejected.v1` | purchaseId, branchId, safe reasonCode/reference | proof URL and unrestricted free-text | Atomic decision/outbox; customer status/notification |
| `session.adjustment_requested.v1` | adjustmentId, customerPackageId, branchId, quantity, requestorId | unnecessary customer PII | Request transaction; reviewer queue/notification |
| `session.adjustment_approved.v1` | adjustmentId, customerPackageId, branchId, approverId | credentials/PII | Approval transition; posting may be same transaction per implementation decision |
| `session.adjustment_rejected.v1` | adjustmentId, branchId, approverId, safe reasonCode | unrestricted unsafe payload | Rejection transition/notification |
| `session.adjustment_posted.v1` | adjustmentId, ledgerEntryId, customerPackageId, branchId, quantity | computed balance as mutable authority | Append-only ledger post; balance consumers re-query |
| `class.quota_evaluated.v1` | classSlotId, branchId, dueAt, bookingCount, minimumQuota, result | recipient PII | One occurrence per evaluation key |
| `check_in.token_issued.v1` | tokenId, purpose, resourceType/resourceId, expiresAt | raw token/JTI/PII | Security lifecycle event |
| `check_in.token_revoked.v1` | tokenId, purpose, resourceId, reasonCode, revokedAt | raw token | Revocation audit occurrence |
| `class.completed.v1` | classSlotId, branchId, attendanceCount, ledger/hour/control references | customer PII/mutable balance | Atomic completion/outbox |
| `audit.export_ready.v1` | exportId, requestorId, scoped filter hash, expiresAt, rowCount | signed URL/row content | Authorized requestor lifecycle only |
| `audit.export_expired.v1` | exportId, requestorId, expiredAt | artifact URL/content | Lifecycle/security audit |
| `operations.job_retried.v1` | jobId, jobType, attemptCount, actorId, reasonCode | payload/secrets | Manual recovery audit |
| `operations.job_dead_lettered.v1` | jobId, jobType, attemptCount, actorId, reasonCode | payload/secrets | Alert/escalation occurrence |
| `migration.validated.v1` | batchId, sourceChecksum, mappingVersion, totals, controlHash | source rows/PII | Validation lifecycle |
| `migration.applied.v1` | batchId, sourceChecksum, totals, controlHash | source rows/PII | Applied batch evidence |
| `migration.reconciled.v1` | batchId, totals, reconciliationHash, result | source rows/PII | Required cutover evidence |
| `migration.rolled_back.v1` | batchId, reasonCode, totals, rollbackHash | source rows/PII | Controlled rollback evidence |

Event IDs and occurrences are deterministic/idempotent. `commercial snapshot version` identifies applied package/rate evidence without exposing administrative secrets. Whether approved and posted are one database transaction must be documented by TL; external consumers remain idempotent if both events are emitted.

## 4. Jobs and Retry

| Job | Deterministic key | Schedule/trigger | Retry/dead-letter | Alert condition |
|---|---|---|---|---|
| quota-evaluation | `slot:{id}:h24` | branch-local H-24 converted to UTC | bounded exponential; idempotent slot transition | late/missed beyond agreed threshold |
| notification-create | `event:{id}:recipient:{id}:template:{version}` | outbox event | bounded; dead-letter after terminal mapping/config failure | dead-letter or age threshold |
| notification-send | `occurrence:{id}:attempt:{n}` | pending occurrence | provider-aware backoff; max attempts configuration | terminal/high failure rate |
| notification-webhook | `provider:{messageId}:{status}:{timestamp}` | signed webhook | idempotent upsert; malformed rejected | signature failures spike |
| package-expiry | `package:{id}:expiry` | scheduled sweep/event | idempotent derived status/occurrence | scheduler late/mismatch |
| migration-import | `batch:{id}` | operator-approved | row rejects separated; fatal batch rollback | control mismatch/fatal reject rate |

Exact attempts/timeouts are operational configuration with owner and alert evidence; retry never creates another business command.

## 5. Notification Contract

- Occurrence unique key: channel + recipient reference + event type + business reference + schedule occurrence + template version.
- Status: `PENDING → QUEUED → ACCEPTED → DELIVERED`, with `FAILED_RETRYABLE`, `FAILED_TERMINAL`, or `FALLBACK_IN_APP` branches.
- Delivery is asserted only from provider evidence; API acceptance is not delivery.
- Manual retry requires permission, reason, audit, and same occurrence; it adds an attempt rather than an occurrence.
- Meta webhook signature and timestamp are verified before parsing; unknown status is retained safely for investigation, not mapped to success.

## 6. Upload Contract

- Server issues short-lived upload instruction after filename, allowlisted MIME, size and checksum validation. Object key is random/private and cannot be chosen by client.
- Storage event or controlled command runs MIME/signature validation and malware scan. Only `CLEAN` proof can be reviewed; `PENDING`, `REJECTED`, `INFECTED`, and `ERROR` are not downloadable by business users.
- Downloads use short-lived authorized signed URL or API streaming after role/branch check; URL/token never enters analytics/log.
- Replacement does not overwrite history; each object has checksum, uploader, scan evidence and retention disposition.

## 7. Authorization and Security Controls

Each request evaluates authenticated active session → permission → branch/data scope → resource state → separation of duties. List, detail, export, signed-download, and command share the same policy service.

Security minimum:

- Validate OIDC issuer/audience/signature/nonce/state and verified identity before linking.
- Hash OTP and one-time token identifiers; rate-limit by phone/account/IP/device signal; generic response prevents enumeration.
- Rotate refresh token family and revoke on reuse; cookies Secure/HttpOnly/SameSite per flow; mobile token in secure storage.
- Check-in token includes purpose, subject/audience, resource, issued/expiry and JTI; raw token is never persisted.
- Parameterized DB access, output encoding, CSRF protection for cookie commands, CORS allowlist, security headers and dependency/secret scanning.
- PII logging uses allowlist fields and deterministic redaction; production debug payload is prohibited.
- Break-glass access is time-bound, alerted, reasoned and reviewed next business day.

## 8. Threat Model

| Threat | Control | Verification |
|---|---|---|
| OTP brute force/account enumeration | generic response, hash, expiry, attempt/rate limits | TC-SEC-001..004 |
| OIDC/account-link takeover | issuer/audience/nonce, verified identity, explicit recovery | TC-SEC-005..008 |
| Cross-role/branch IDOR | centralized policy and scoped repository queries | TC-SEC-009..015 |
| Malicious payment upload | private storage, signature/MIME/size scan, authorized download | TC-SEC-016..020 |
| QR/deep-link theft/replay | short-lived purpose/resource/JTI, authenticated subject | TC-SEC-021..025 |
| Double spend/over-capacity | transaction locks, unique constraints, idempotency | TC-SEC-026..029 |
| Ledger/close tampering | append-only, period lock, SoD, audit, reconciliation | TC-SEC-030..035 |
| Queue/webhook replay | signed webhook, deterministic key, idempotent consumer | TC-SEC-036..039 |
| PII leakage in logs/export | allowlist/redaction, scoped export, retention | TC-SEC-040..043 |
| Privileged compromise | least privilege, session revocation, access review, audit and break-glass alerts | TC-SEC-044..048 |

## 9. Observability and SLO Evidence

Metrics include API rate/availability/latency/error by normalized route, DB pool/slow query/deadlock, queue depth/oldest age/failure, scheduler lateness, notification outcome, auth abuse, upload scan, client crash, and invariant/reconciliation violations. Labels must not contain user ID, phone, proof name, raw URL/token, or unbounded object ID. Alerts link to owner, severity, dashboard and runbook; every release smoke validates telemetry arrival.

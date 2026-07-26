# Architecture Decision Baseline

**Status:** DRAFT — decisions become binding at Gate 4  
**Owner/approver:** Technical Lead

## Decision Summary

| ADR | Decision | Rationale | Consequence / verification | Status |
|---|---|---|---|---|
| ADR-001 | NestJS modular monolith; worker may deploy separately from same codebase | MVP consistency and lower operational overhead | Module public services/events only; architecture dependency test | PROPOSED |
| ADR-002 | REST JSON `/api/v1`, OpenAPI 3.1, generated TS/Dart clients | Contract consistency across Web/Flutter | CI validates spec and breaking changes; clients generated from pinned artifact | PROPOSED |
| ADR-003 | MySQL 8.4+ + Prisma; reviewed SQL migrations and stable aggregate row locking for critical invariants | Productive baseline aligned with the selected operational database without sacrificing concurrency safety | Migration review, MySQL integration/concurrency suite, forward-compatible deploy, no destructive rollback assumption | PROPOSED |
| ADR-004 | Append-only session ledger + active reservation; pessimistic row/advisory locking by aggregate | Correct available balance under concurrency | Unique references, transaction isolation test, retry on serialization/deadlock | PROPOSED |
| ADR-005 | Google OIDC/password; hashed WhatsApp OTP; server session for web and rotating token family for mobile; no MFA | Channel-appropriate authentication with permission-based authorization | Exact session TTL is DEC-012; revoke on inactive/compromise | AMENDED |
| ADR-006 | Transactional outbox + BullMQ-compatible jobs; deterministic occurrence/idempotency keys | Business commit and async delivery remain consistent | At-least-once processing, idempotent consumers, bounded retry/dead-letter | PROPOSED |
| ADR-007 | Managed regional cloud services, private network where supported, object storage and PITR | Meets pilot RPO/RTO with small team | Provider/region blocked by DEC-011; adapter/IaC boundary retained | BLOCKED |
| ADR-008 | Structured JSON logs, OpenTelemetry-compatible traces/metrics, PII allowlist/redaction | Operability without data leakage | Correlation/request IDs end-to-end; security tests inspect logs | PROPOSED |
| ADR-009 | Container deploy, immutable artifact, staging promotion, canary/rolling, expand-migrate-contract DB changes | Repeatable releases and safe rollback | Health/readiness gates, feature/config validation, rollback runbook | PROPOSED |

## Cross-cutting Decisions

### Transaction and concurrency

- Aggregate-affecting commands execute in one database transaction and lock stable aggregate rows in a documented order: period/slot first, then package/reservation, then child records.
- `Idempotency-Key` is required for purchase approval, booking, reschedule approval, adjustment posting, completion, close, correction, and manual retry. Key scope is authenticated actor + operation + target; request hash mismatch returns `IDEMPOTENCY_KEY_REUSED`.
- Unique constraints provide final duplicate defense for ledger reference, active reservation, booking/customer/slot, attendance debit, instructor hour, notification occurrence, and close branch/period.
- Transaction retry is bounded with jitter for serialization/deadlock; client receives stable conflict/retryable error after exhaustion.

### Configuration

- Business values are versioned/effective-dated records, not environment variables. Infrastructure/provider secrets use managed secret store.
- No production-safe fallback is invented for price, duration, capacity, quota, fee or rate. Missing eligible configuration blocks the command with stable error.
- Configuration change requires actor, reason, approval where applicable, effective date, before/after audit and overlap constraint.

### Deployment and schema compatibility

- Migrations use expand → backfill → switch → contract. Contract/removal occurs only after all deployed versions stop using the old shape.
- Application rollback must work against expanded schema. Destructive/down migration is not the normal rollback mechanism.
- Worker and API artifacts share domain/schema version compatibility and deploy order is documented per release.

## ADR Approval Record

Each row becomes `ACCEPTED` only after context/options/decision/consequences have been reviewed by Web, Flutter and QA, and Technical Lead approval evidence is linked in `APR-004`. `BLOCKED` decisions remain Gate 4 blockers.

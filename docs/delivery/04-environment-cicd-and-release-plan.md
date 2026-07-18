# Environment, CI/CD & Release Plan

**Status:** DRAFT  
**Owner:** Technical Lead  
**Approvers:** TL for technical readiness; QA for quality result; Product Owner for production release  
**Provider:** TBD-BLOCKING through DEC-011

## 1. Ownership and Environment Matrix

All organization, cloud, domain, Meta, Google, stores, monitoring, storage, repository and secret-manager accounts are owned by Daily Dose or an explicitly approved organization account. No personal account may be the sole administrator.

| Environment | Purpose/data | Access | Deployment | Owner | Exit/control |
|---|---|---|---|---|---|
| Local | Development with synthetic data and local/container dependencies | Assigned engineers | Developer-controlled from pinned tooling | Engineer; TL governs baseline | No production data/secrets; reproducible setup |
| Development | Shared integration, generated clients and feature validation | Delivery team least privilege | Automatic from approved main/integration policy | TL/Ops | CI pass, health/telemetry, disposable synthetic data |
| Staging/UAT | Production-like QA, UAT and migration rehearsal | Restricted team/business testers | Promoted immutable artifact | TL/Ops; QA controls intake | Masked/synthetic data, prod-like config shape, approval/audit |
| Production | Pilot operations | Named least-privilege, MFA, time-bound where supported | Approval-gated promotion only | Ops; TL accountable until handover | Backup/monitoring/on-call/rollback and PO approval |

## 2. Repository and Scaffold Sequence

After Gate 1/2/4/5 pass:

1. Create Daily Dose-owned repository/branch protection, CODEOWNERS, issue/PR templates and required checks.
2. Scaffold workspace for `apps/api`, `apps/worker`, `apps/web`, `apps/mobile`, shared OpenAPI artifact/generated clients, infrastructure and documentation; exact monorepo tooling is an ADR/scaffold decision.
3. Pin runtimes/dependencies and commit lockfiles; provide one documented bootstrap path.
4. Create local PostgreSQL/Redis/storage/provider adapters and synthetic seed `DD-QA-001`.
5. Configure OpenAPI validation/generation for TypeScript/Dart; generated diffs are committed or produced as versioned artifact according to ADR-002.
6. Establish migration tooling and empty baseline before domain implementation; migration names/version/checksum are tracked.
7. Provision development, then staging; production is provisioned only after DEC-011/security/network/backup/access review.

## 3. Provider-neutral Interfaces

- Identity integrates behind Google OIDC and OTP/MFA/session application services; provider-specific payloads do not leak into domain entities.
- Messaging uses provider adapter around notification occurrence/attempt; Meta webhook is normalized and verified at the boundary.
- Object storage uses private object service for upload instruction, scan status and signed authorized download.
- Queue/scheduler uses application job contract with deterministic keys; BullMQ-compatible implementation is replaceable behind adapter.
- Observability emits structured logs, metrics and OpenTelemetry-compatible trace context; backend choice does not alter domain behavior.
- Secrets/config use an environment configuration interface; business values remain effective-dated database configuration, never hidden env defaults.

## 4. CI Quality Gates

| Stage | Required checks | Owner | Failure behavior/evidence |
|---|---|---|---|
| Validate | Formatting check, lint, type/static analysis, OpenAPI/YAML/links, generated-client drift | Developers/TL | PR blocked; check logs retained |
| Unit | Domain/service/web component/Flutter unit-widget tests | Developers | PR blocked; coverage/risk gaps reviewed |
| Integration | PostgreSQL constraints/transactions/migrations, Redis/queue, adapter contract | BE/QA | PR blocked for affected change |
| Security | Secret/dependency/SAST, container/IaC scan where applicable | TL/Ops | Critical/high disposition required; secrets revoke immediately |
| Build | API/worker/web/mobile build and immutable artifact/SBOM | TL/Ops | No promotion on failure |
| Deploy dev | Forward migration, deploy, health/smoke/telemetry | Ops | Automated rollback/stop promotion |
| Staging QA | API contract, critical E2E, migration smoke, accessibility sample | QA | QA intake/result recorded |
| Production gate | Release evidence, backup, config, UAT, QA/TL/PO approval | PO | No deployment without complete package |

Required checks cannot be bypassed by vendor administrators. Emergency bypass, if technically available, requires break-glass reason, alert, approver and next-business-day review.

## 5. Configuration and Secret Lifecycle

- Secret inventory records purpose, environment, owner, system of record, rotation/expiry, consumers and last review—never the secret value.
- Production secrets are inaccessible to normal development. Logs/CI artifacts must not reveal secret, OTP, token, signed URL or unnecessary PII.
- Configuration promotion has typed validation, approved environment values, diff evidence and rollback/replacement reference.
- Missing price/duration/quota/capacity/fee/rate blocks the command; no invented production fallback.
- Access is provisioned by role, MFA enforced, quarterly reviewed, and revoked immediately on offboarding or incident.

## 6. Database and Deployment Compatibility

- Use expand → deploy compatible readers/writers → backfill/reconcile → switch → contract in a later release.
- Migration runs once under controlled identity, records checksum/timing/result, and is tested on production-like volume before release.
- Application rollback targets the expanded schema; destructive down migration is not assumed.
- Backfill is idempotent, observable, resumable where needed and reconciled before constraint/switch.
- API/worker version compatibility and deploy order are declared in release notes.

## 7. Promotion and Release Flow

`Commit/PR → Required CI → Merge → Development deploy/smoke → Immutable release candidate → Staging deploy/migrate → QA/UAT → Release review → Production canary/rolling → Smoke → Observation → Complete or Rollback`

Release package includes:

- Version/commit/artifact digest/SBOM and changelog with BR/US/AC/WBS.
- OpenAPI/generated client and schema migration compatibility evidence.
- CI/regression/security/performance/accessibility results as applicable.
- Migration/config diff, backup/restore point, rollback artifact/runbook.
- Dashboard/alerts/on-call/support status.
- QA pass/fail, TL readiness, UAT/business/Finance evidence, PO GO decision.

## 8. Production Procedure

1. Confirm bridge/owners, maintenance/customer communication if applicable, health and rollback threshold.
2. Create/verify backup restore point; capture current artifact/config/schema.
3. Apply compatible migration, deploy canary/rolling artifact, validate readiness.
4. Smoke login/authorization, booking/check-in, report, queue/scheduler, notification health and telemetry without creating uncontrolled financial data.
5. Observe API/DB/queue/client/invariant signals. Expand only while thresholds pass.
6. Mark release complete after observation and first business-control check; otherwise rollback/contain and reconcile writes.

Rollback triggers include critical auth/security, session/financial mismatch, duplicate/corrupt posting, unavailable core flow without safe workaround, or infrastructure instability beyond agreed window. Rollback preserves logs/evidence, stops unsafe writes, restores prior application/config, avoids destructive schema reversal, and reconciles transactions made during the window.

## 9. Backup, Recovery, Monitoring and Runbooks

- Pilot targets RPO ≤1 hour and RTO ≤4 hours; exact provider configuration is approved before production.
- Database PITR and object versioning/retention are enabled; restore is rehearsed in isolation before pilot and quarterly.
- Dashboards/alerts cover API SLI, DB, queue age/failures, scheduler lateness, notification outcome, auth abuse, upload scan, client error/crash and ledger/close reconciliation.
- Runbooks cover API/DB/queue/scheduler/provider outage, duplicate notification, suspected ledger mismatch, failed close, credential compromise, deployment rollback and restore.
- Alert contains severity, owner, dashboard, safe correlation context and runbook; it does not contain PII/secrets.

## 10. Environment Readiness Checklist

An environment is ready only when ownership/admin backup, access/MFA, network/TLS, secret/config inventory, data classification, migration path, deployment identity, health/telemetry, backup/recovery, support contact and evidence location are complete. Provider `TBD-BLOCKING` prevents environment approval but does not invalidate adapter contracts or task planning.


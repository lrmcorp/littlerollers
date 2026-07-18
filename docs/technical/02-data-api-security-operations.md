# Data, API, Security & Operations

**Status:** DRAFT

Daftar entitas di sini bersifat logis. Field/constraint/index normatif terdapat pada [Data Dictionary & ERD](04-data-dictionary-and-erd.md); HTTP shape pada [OpenAPI v1](openapi-v1.yaml); semantics error/event/job/upload/security pada [API/Event/Security Contract](05-api-event-security-contract.md).
Version/checksum and Sprint 2–3 review blockers are tracked in [Sprint 2–3 Contract Manifest](06-sprint-2-3-contract-manifest.md).

## 1. Logical Data Model

Entitas minimum:

- Identity: `User`, `ExternalIdentity`, `UserRole`, `UserMfa`, `UserSession`.
- Organization: `Branch`, `OwnerBranch`, `InstructorBranch`, `ClassType`.
- Package: `Package`, `Purchase`, `PaymentProof`, `CustomerPackage`.
- Session: `SessionLedger`, `SessionReservation`, `SessionAdjustRequest`.
- Schedule: `InstructorAvailability`, `ClassSlot`, `Booking`, `Reschedule`.
- Attendance: `InstructorCheckIn`, `CustomerCheckIn`, `InstructorHourLog`.
- Effective master: `InstructorFee`, `ProjectionRate`, `MinQuotaSetting`.
- Finance: `OtherCost`, `BranchPeriod`, `MonthlyClose`, `CorrectionJournal`.
- Platform: `NotificationOccurrence`, `NotificationAttempt`, `AuditLog`, `OutboxEvent`, `IdempotencyRecord`.

## 2. Data Invariants

- Money memakai integer rupiah atau fixed precision decimal; floating point dilarang.
- Timestamp disimpan UTC; `Branch.timezone` adalah IANA zone dan immutable tanpa migration plan.
- Ledger append-only; reversal melalui entry referensi, bukan update/delete.
- Satu active reservation per active Booking; unique constraint mencegah duplikat.
- Satu attendance debit per CustomerPackage/ClassSlot/Booking reference.
- Satu InstructorHourLog per Instructor/ClassSlot.
- Effective-dated master tidak overlap untuk business key yang sama; transaksi menyimpan applied value/reference.
- Foreign key/reference histori menggunakan restrictive delete/soft deactivate.
- Financial mutation ditolak bila BranchPeriod locked.
- Record branch-scoped selalu membawa `branch_id` langsung atau melalui relasi immutable yang dapat diauthorize dengan aman.

## 3. API Contract

- Base path `/api/v1`; JSON UTF-8; UTC ISO-8601 timestamp.
- OpenAPI adalah contract source bagi generated TypeScript/Dart client.
- Command memakai action resource/endpoint, contoh `POST /purchases/{id}/approve`, bukan generic status patch.
- Pagination cursor untuk feed/log besar; filter/sort allowlist.
- Semua request membawa correlation ID; command retry-sensitive menerima `Idempotency-Key`.
- Error berbentuk konsisten:

```json
{
  "error": {
    "code": "BOOKING_CUTOFF_PASSED",
    "message": "Booking ditutup dua jam sebelum kelas.",
    "correlationId": "...",
    "details": []
  }
}
```

Endpoint group minimum:

- `/auth`, `/me`, `/users`, `/roles`, `/branches`, `/assignments`.
- `/packages`, `/purchases`, `/customer-packages`, `/session-ledger`, `/session-adjustments`.
- `/instructors`, `/availabilities`, `/class-slots`, `/bookings`, `/reschedules`.
- `/check-ins/instructors`, `/check-ins/customers`, `/class-slots/{id}/complete`.
- `/reports/*`, `/other-costs`, `/periods`, `/monthly-closes`, `/correction-journals`.
- `/notifications`, `/audit-logs`, restricted `/operations/*`.

Public API changes mengikuti semantic versioning contract policy: additive field optional dapat masuk minor; removal/meaning change memerlukan version baru dan deprecation window.

## 4. Authorization Policy

Setiap request melewati:

1. Authentication dan session validity.
2. User active/MFA assurance sesuai action.
3. Role permission.
4. Branch/data scope.
5. Resource state dan separation of duties.
6. Audit/outbox bila action sensitif.

Backend tidak menerima `role` atau branch authority dari client sebagai kebenaran. Query list/detail dan export memakai scope yang sama; object ID guessing harus menghasilkan not found/forbidden tanpa data leak.

## 5. Security & Privacy Baseline

- Threat model untuk auth/OTP, payment proof, check-in links/QR, RBAC, ledger, close, notification, file upload, dan admin operations.
- Google OIDC memvalidasi issuer/audience/nonce/state; account linking membutuhkan verified identity.
- OTP di-hash, short-lived, rate-limited per account/phone/IP/device, attempt-limited, dan replay-safe.
- Refresh/session token disimpan aman; mobile memakai secure storage; web memakai secure HttpOnly cookie bila architecture memilih cookie session.
- QR/deep-link token signed, short-lived, audience/resource-bound, one-purpose; sensitive token tidak masuk analytics/referrer/log.
- Upload proof: extension/MIME/signature/size validation, private bucket, random key, malware scan, signed short-lived access.
- Secret hanya pada managed secret store; rotation dan break-glass process terdokumentasi.
- Production access least privilege, MFA, time-bound bila tersedia, dan quarterly access review.
- PII disensor pada log; nomor telepon dan bukti bayar hanya terlihat bagi role berizin.
- Consent/privacy notice, data subject handling, retention schedule, incident response, dan breach communication dimiliki bisnis dan direview legal sesuai kebutuhan.

## 6. Audit Model

Audit minimum untuk approve/reject purchase, assisted booking/check-in, reschedule approval, adjustment request/approval, assignments, quota/master change, auto/manual cancellation, OtherCost, monthly close/correction, stop customer, access/security administration.

Field minimum: `actor_user_id`, `actor_role`, `action`, `object_type/id`, `branch_id`, `reason`, safe `before/after`, `occurred_at`, `source`, `correlation_id`, `request_id`. Audit immutable dan hanya dapat dibaca role berizin.

## 7. Notification Architecture

- Domain transaction menulis `OutboxEvent` bersama business commit.
- Worker membuat deterministic `NotificationOccurrence` berdasarkan recipient/event/reference/schedule occurrence.
- Provider adapter mengubah occurrence menjadi Meta template request.
- `NotificationAttempt` menyimpan provider message ID, attempt, timestamps, normalized status/error.
- Webhook Meta diverifikasi signature dan diproses idempotent.
- Retry bounded exponential backoff; terminal failure memicu alert/dead-letter dan manual retry yang diaudit.
- Template name/language/version diperlakukan sebagai configuration dengan approval.

## 8. Observability dan SLO

Dashboard/alert minimum:

- API availability, latency p50/p95/p99, 4xx/5xx rate.
- DB connection/slow query/deadlock; Redis/queue depth/age/failure.
- H-24 scheduler lateness dan missed jobs.
- Notification accepted/delivered/failed per template/provider.
- Ledger/close invariant violation dan reconciliation mismatch.
- Auth/OTP abuse signal, file scan failure, suspicious authorization failure.
- Mobile crash/error dan web client error tanpa PII.

## 9. Backup, Restore, dan Runbook

- Database automated backup + point-in-time recovery sesuai kemampuan provider; object storage versioning/retention sesuai policy.
- RPO/RTO final disetujui sebelum production; baseline pilot: RPO ≤1 jam, RTO ≤4 jam.
- Restore diuji sebelum pilot dan minimal tiap kuartal; evidence disimpan.
- Runbook mencakup API down, DB saturation, queue stuck, missed H-24 job, Meta outage, duplicate notification, suspected ledger mismatch, failed close, credential compromise, dan rollback deployment.
- P1 dipimpin TL; response ≤30 menit pada jam operasional, target workaround ≤4 jam, komunikasi berkala, lalu RCA maksimal lima hari kerja.

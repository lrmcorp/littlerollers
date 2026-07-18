# Test Strategy, UAT & Release

**Status:** DRAFT  
**Quality owner:** QA Engineer

Langkah test kritis, deterministic dataset, expected financial values, UAT scripts, device/browser policy, dan release evidence index berada pada [Detailed Tests, Data & UAT](02-detailed-tests-data-and-uat.md).

## 1. Quality Gates

| Gate | Entry | Exit |
|---|---|---|
| Story QA | Code review/build lulus | AC dan regression terkait lulus; evidence tersedia |
| Release candidate | Semua story target DONE | Automated suite, security/performance checklist, migration smoke lulus |
| UAT | Stable staging + seeded/masked data | Operasional dan Finance sign-off; no open P1/P2 |
| Production | QA pass + TL readiness + PO approval | Deploy/smoke/monitoring lulus atau rollback |

Developer bertanggung jawab atas kualitas implementasi; QA bertanggung jawab atas strategi, independent verification, evidence, dan rekomendasi pass/fail.

## 2. Test Layers

- Unit/domain: balance, expiry, cutoff, state transition, calculation, authorization policy.
- Integration/database: transaction, constraints, locking/concurrency, effective dates, period lock, outbox.
- API contract: OpenAPI schema, validation, error codes, idempotency, role/branch matrix.
- Web: component dan critical internal journey.
- Flutter: view model/widget/integration pada Android/iOS device matrix.
- E2E: purchase → booking → check-in → completion → report/close.
- Migration: mapping, reject handling, count/control total, balance reconciliation, re-run safety.
- Non-functional: performance, accessibility, security, backup/restore, failure recovery.

## 3. Mandatory Test Scenarios

| ID | Scenario | Expected outcome |
|---|---|---|
| TC-AUTH-001 | Role tanpa permission membuka action/API | Ditolak tanpa data leak; security log tersedia |
| TC-AUTH-002 | Owner mengakses branch bukan assignment | List/detail/export seluruhnya ditolak/scoped |
| TC-AUTH-003 | OTP expired/replay/brute force | Ditolak, rate/attempt limit berlaku, OTP tidak tercatat di log |
| TC-PKG-001 | Approve bukti bayar valid | Package aktif, expiry benar, satu PURCHASE, audit/outbox |
| TC-PKG-002 | Approval request dikirim ulang | Tidak ada package/ledger ganda |
| TC-BOOK-001 | Balance 1, dua concurrent booking | Hanya satu berhasil; available tidak negatif |
| TC-BOOK-002 | Capacity terakhir diperebutkan | Hanya satu booking memperoleh seat |
| TC-BOOK-003 | Booking pada/selewat H-2 | Ditolak dengan deterministic error |
| TC-BOOK-004 | Package branch/class mismatch | Ditolak dan tidak membuat reservation |
| TC-CLASS-001 | Quota kurang pada H-24 | AUTO_CANCELLED, reservation dilepas, notifikasi unik |
| TC-CLASS-002 | Quota cukup pada H-24 | CONFIRMED dan booking tetap terbuka sampai H-2/capacity |
| TC-CLASS-003 | H-24 job dijalankan dua kali | State/refund/notification tidak duplikat |
| TC-ATT-001 | Customer hadir dan class completed | Satu ATTEND, reservation consumed, balance benar |
| TC-ATT-002 | Customer tidak hadir | Tidak ada ATTEND otomatis |
| TC-ATT-003 | Admin backfill sebelum/selewat H+2 | Sebelum berhasil+audit; setelah ditolak |
| TC-ATT-004 | QR salah slot/instructor/expired/replay | Ditolak; tidak ada hour log |
| TC-ATT-005 | Completion dijalankan ulang | Ledger/hour log tidak duplikat |
| TC-RES-001 | Reschedule ≥H-24 | Reservation dipindahkan atomik ke target valid |
| TC-RES-002 | Reschedule <H-24 | Tidak ada refund otomatis; adjustment approval diperlukan |
| TC-RES-003 | Requestor mencoba self-approve adjustment | Ditolak separation-of-duties |
| TC-FIN-001 | Fee/rate berubah effective date | Histori memakai rate lama; transaksi baru memakai rate baru |
| TC-FIN-002 | Monthly close valid | Snapshot benar dan period LOCKED |
| TC-FIN-003 | Mutasi locked period via UI/API | Seluruh jalur ditolak |
| TC-FIN-004 | Correction periode lama | Journal di current open period + Super Owner approval |
| TC-NOTIF-001 | Provider timeout/retry/webhook duplicate | Bounded retry dan satu occurrence/status konsisten |
| TC-NOTIF-002 | Provider terminal failure | Dead-letter/alert/fallback dan manual retry auditable |
| TC-MIG-001 | Import file duplicate/malformed | Row reject jelas; valid row tidak menggandakan data saat rerun |
| TC-MIG-002 | Opening session mismatch | Reconciliation gagal dan cutover terblokir |
| TC-OPS-001 | Restore backup rehearsal | RPO/RTO evidence memenuhi target |

## 4. Authorization Test Matrix

Setiap protected endpoint diuji minimal dengan:

- Unauthenticated dan inactive user.
- Role tanpa permission.
- Role benar, branch salah.
- Role/branch benar, resource state salah.
- Role sensitif tanpa required MFA.
- Multi-role user mencoba separation-of-duties violation.
- List/detail/export/action untuk memastikan scope konsisten.

## 5. Financial dan Ledger Reconciliation

Untuk setiap CustomerPackage:

```text
ledger_balance = SUM(SessionLedger.quantity)
reserved = COUNT(active SessionReservation)
available = max(ledger_balance - reserved, 0), kecuali expired => 0
```

Control harus mendeteksi negative balance, orphan reservation, duplicate attend/reference, expired package dengan active reservation, dan completion tanpa consistent attendance.

Untuk setiap BranchPeriod, Finance membandingkan package approval source, revenue, projection snapshot, instructor hour × fee, OtherCost, profit formula, close snapshot, dan correction journal.

## 6. UAT

### Perwakilan

- Admin/Manager: purchase, timetable, booking assistance, reschedule, adjustment, backfill.
- Owner/Super Owner: branch scoping, master/assignment, reports, correction approval.
- Finance: OtherCost, reconciliation, close, locked period, correction.
- Customer/Instructor representative: Flutter critical journey.

### UAT Entry/Exit

Entry: scope/AC baseline, staging stable, test data dan script tersedia, training singkat selesai, QA regression pass.

Exit: seluruh critical script pass, P1/P2 nol, P3 memiliki accepted disposition, evidence/sign-off tersimpan, rollback/support siap.

Product Owner memberi final sign-off setelah rekomendasi perwakilan operasional dan Finance.

## 7. Defect Severity dan SLA

| Severity | Contoh | Response | Target |
|---|---|---|---|
| P1 Critical | Sistem tidak dapat dipakai, data/uang/security compromise | ≤30 menit jam operasional | Workaround ≤4 jam; continuous handling |
| P2 High | Critical flow gagal tanpa workaround wajar | ≤4 jam kerja | Fix/release plan ≤1 hari kerja |
| P3 Medium | Fungsi terbatas dengan workaround | ≤1 hari kerja | Prioritized sprint |
| P4 Low | Cosmetic/minor enhancement | ≤2 hari kerja | Backlog triage |

RCA untuk P1 maksimal lima hari kerja setelah stabil dan memuat timeline, root cause, impact, containment, corrective/preventive action, owner, dan due date.

## 8. Release Checklist

- Release scope/changelog dan traceability lengkap.
- CI, regression, security, performance, accessibility, dan migration check lulus.
- OpenAPI/generated client, schema migration, feature flag/config, Meta template siap.
- Backup/restore point, rollout, rollback, monitoring dashboard, alert, dan on-call contact siap.
- QA pass, TL technical readiness, UAT evidence, dan PO approval tersimpan.
- Post-deploy smoke: login tiap class role, booking/check-in, report query, queue/scheduler, notification sandbox/health.
- Observasi intensif sesuai rollout plan sebelum release dinyatakan selesai.

## 9. Test Evidence

Evidence ditautkan ke release dan requirement: environment/build/commit, dataset, executor/time, expected/actual, screenshot/log aman, defect link, dan result. Evidence tidak boleh berisi OTP, token, credential, atau PII produksi yang tidak diperlukan.

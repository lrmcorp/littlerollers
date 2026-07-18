# MVP Implementation Backlog & Complete Traceability

**Status:** DRAFT  
**Owner:** PM/BA  
**Approver:** Product Owner

The eight Sprint 2–3 stories are refined in [Sprint 2–3 Detailed Story Specification](04-sprint-2-3-detailed-story-specification.md) and its [Gate 2 Review Workbook](05-sprint-2-3-traceability-and-gate-2-review.md). The other 16 MVP stories are refined in [Remaining MVP Detailed Story Specification](06-remaining-mvp-detailed-story-specification.md) and its [Traceability/Readiness Workbook](07-remaining-mvp-traceability-readiness-and-review.md). Together they cover all 24 stories at detailed-draft level; none becomes `READY` without gate evidence.

Dokumen ini melengkapi contoh story pada dokumen backlog awal. GitHub issue adalah salinan operasional; requirement dan acceptance baseline tetap di repository.

## 1. Story Contract

Setiap story di bawah wajib diturunkan ke issue dengan actor/branch, precondition, `BR/NFR`, Figma node/version, API/schema, Given/When/Then, authorization, audit, notification, failure/error code, concurrency/idempotency, migration compatibility, estimate, assignee, reviewer, dan test evidence. Story berstatus `BLOCKED` selama decision atau design yang ditautkan belum disetujui.

## 2. MVP Stories

| Story | Actor dan outcome | Precondition | Rules | UX | API/data | Test/UAT | Blocking decision |
|---|---|---|---|---|---|---|---|
| US-ID-01 | Customer login Google/OTP dan recovery aman | Active/eligible customer identity | BR-001,004; NFR-001,007 | UX-01 | API-AUTH; User, ExternalIdentity, UserSession | TC-AUTH-001..004; UAT-AUTH-01 | DEC-012,014 |
| US-ID-02 | Internal user invitation, Google login, MFA dan deactivation | Inviter berizin; branch assignment valid | BR-002–005 | UX-11 | API-USERS; UserRole, UserMfa, assignments | TC-AUTH-005..009; UAT-AUTH-02 | DEC-012 |
| US-MST-01 | Super Owner mengelola branch, class type dan effective master | MFA; period/branch valid | BR-004,032,061,062 | UX-11 | API-MASTER; Branch/ClassType/settings | TC-MST-001..005; UAT-MST-01 | DEC-005,006 |
| US-MST-02 | Super Owner mengelola owner/instructor branch assignment | User active; no forbidden conflict | BR-005,030–031 | UX-11 | API-ASSIGN; OwnerBranch/InstructorBranch | TC-MST-006..009; UAT-MST-02 | none |
| US-PKG-01 | Customer/Admin mengajukan purchase dan bukti bayar | Package active; verified account | BR-010–012 | UX-02 | API-PURCHASE; Purchase/PaymentProof | TC-PKG-001..004; UAT-PKG-01 | DEC-004 |
| US-PKG-02 | Manager/Super Owner approve/reject purchase secara idempotent | Pending purchase; branch permission | BR-012–016 | UX-02 | API-PURCHASE; CustomerPackage/Ledger/Outbox | TC-PKG-005..010; UAT-PKG-02 | DEC-004,006 |
| US-LED-01 | User berizin melihat total/reserved/available dan histori | Package/customer access valid | BR-015,021–025,074 | UX-02,03 | API-LEDGER; Ledger/Reservation | TC-LED-001..005; UAT-LED-01 | none |
| US-LED-02 | Admin meminta dan Manager/Super Owner approve adjustment | Active request; separation of duties | BR-052–054 | UX-09 | API-ADJUST; SessionAdjustRequest/Ledger | TC-RES-005..010; UAT-RES-02 | none |
| US-CLS-01 | Instructor mengajukan availability tanpa konflik | Active branch assignment | BR-030 | UX-06 | API-AVAIL; InstructorAvailability | TC-CLS-001..004; UAT-CLS-01 | none |
| US-CLS-02 | Admin membuat, assign, publish dan manual-cancel slot | Master/availability valid | BR-031–033 | UX-07 | API-CLASS; ClassSlot/assignment/outbox | TC-CLS-005..012; UAT-CLS-02 | DEC-005,008 |
| US-CLS-03 | Scheduler mengevaluasi quota H-24 tepat satu kali | Published slot; quota snapshot | BR-032–036 | UX-07 | API-CLASS; ClassSlot/job/outbox | TC-CLASS-001..005; UAT-CLASS-01 | DEC-005 |
| US-BKG-01 | Customer/Admin booking valid secara concurrency-safe | Active package; published/confirmed slot | BR-020–025 | UX-03 | API-BOOKING; Booking/Reservation/Idempotency | TC-BOOK-001..010; UAT-BOOK-01 | DEC-005 |
| US-BKG-02 | Customer meminta dan Admin/Super Owner memproses reschedule | Active booking; target eligible | BR-050–054 | UX-04 | API-RESCHEDULE; Reschedule/Booking/Reservation | TC-RES-001..004; UAT-RES-01 | none |
| US-ATT-01 | Instructor check-in QR menghasilkan matched hour | Assigned confirmed slot; valid window | BR-040–041 | UX-06 | API-CHECKIN; InstructorCheckIn/HourLog | TC-ATT-001..006; UAT-ATT-01 | DEC-007 |
| US-ATT-02 | Customer check-in link atau Admin backfill | Active booking; valid window/reason | BR-042–043 | UX-05,08 | API-CHECKIN; CustomerCheckIn/Audit | TC-ATT-007..013; UAT-ATT-02 | DEC-007 |
| US-ATT-03 | Admin menyelesaikan kelas dan memposting attendance | Confirmed slot; attendance reviewed | BR-044–045 | UX-07 | API-COMPLETE; Ledger/Reservation/HourLog | TC-ATT-014..020; UAT-ATT-03 | none |
| US-NOT-01 | Sistem mengirim notification transactional secara idempotent | Committed outbox event; approved template | BR-070–072 | UX notifications | API-NOTIFICATION; Outbox/Occurrence/Attempt | TC-NOTIF-001..008; UAT-NOTIF-01 | DEC-013 |
| US-FIN-01 | Owner/Finance melihat laporan branch-scoped yang dapat direkonsiliasi | Authorized period/filter | BR-060–064 | UX-10 | API-REPORT; snapshots/ledger/hour/other cost | TC-FIN-001..008; UAT-FIN-01 | DEC-006 |
| US-FIN-02 | Finance/Super Owner mengelola OtherCost pada OPEN period | Period OPEN; MFA | BR-063 | UX-10 | API-FINANCE; OtherCost/Audit | TC-FIN-009..012; UAT-FIN-02 | none |
| US-FIN-03 | Finance/Super Owner close period secara transactional | Reconciliation pass; period OPEN | BR-065–067 | UX-10 | API-CLOSE; BranchPeriod/MonthlyClose | TC-FIN-013..020; UAT-FIN-03 | DEC-006 |
| US-FIN-04 | Super Owner approve correction di current period | Old period locked; current open | BR-066–067 | UX-10 | API-CORRECTION; CorrectionJournal | TC-FIN-021..026; UAT-FIN-04 | none |
| US-AUD-01 | Role berizin mencari/export audit tanpa data leak | MFA/permission; scoped query | BR-073–075 | UX internal audit | API-AUDIT; AuditLog | TC-AUD-001..008; UAT-AUD-01 | DEC-009 |
| US-OPS-01 | Operator memantau health, queue dan notification failure | Restricted operations role | BR-070–075; NFR-002,006 | UX operational health | API-OPS; metrics/jobs/dead-letter | TC-OPS-001..009; UAT-OPS-01 | DEC-011,013 |
| US-MIG-01 | Data team mengimpor opening data secara repeatable | Approved mapping/source checksum | Migration rules | internal tool only | API-MIG/internal job; MigrationBatch/source keys | TC-MIG-001..010; UAT-MIG-01 | DEC-010 |

## 3. Acceptance Criteria per Story Group

The grouped criteria in this section remain cross-story invariants. Unique `AC-US-...` criteria in DOC-PROD-04 and DOC-PROD-06 are the per-story review units; neither set is approved until Gate 2 evidence exists.

### Identity and access

- **AC-ID-01:** Given identity terverifikasi dan user aktif, when authentication valid, then session diterbitkan tanpa membuat user/customer duplikat dan login security event tercatat.
- **AC-ID-02:** Given OTP expired/replayed/attempt limit terlampaui, when verify dilakukan, then request ditolak dengan generic error, tidak ada session, dan abuse metric bertambah tanpa OTP/PII sensitif di log.
- **AC-ID-03:** Given role/branch/MFA tidak memenuhi action, when list/detail/export/command dipanggil, then seluruh jalur scoped secara konsisten dan tidak membocorkan existence/data.
- **AC-ID-04:** Given account dinonaktifkan, when refresh atau protected request dilakukan, then session ditolak/revoked sesuai contract.

### Master, package, and ledger

- **AC-PKG-01:** Given valid private payment proof, when purchase diajukan, then file berstatus scan-pending/clean sebelum dapat direview; invalid/unsafe file tidak dapat diakses publik.
- **AC-PKG-02:** Given pending purchase dan approver berizin, when approve dengan idempotency key, then CustomerPackage, snapshots, one PURCHASE ledger, audit, dan outbox commit atomik.
- **AC-PKG-03:** Given retry atau concurrent approval, then hasil konsisten tanpa package/ledger/outbox occurrence ganda.
- **AC-LED-01:** Given ledger entries dan active reservations, then `available=max(sum(quantity)-active reservation count,0)` kecuali expired menjadi zero; mismatch memicu invariant signal.
- **AC-LED-02:** Given adjustment requestor sama dengan approver, then approval ditolak; successful approval membuat satu referenced append-only entry dan audit.

### Scheduling, booking, and attendance

- **AC-CLS-01:** Given overlapping instructor availability/assignment lintas branch, then command ditolak deterministically.
- **AC-CLS-02:** Given H-24 job retry/concurrency, then slot hanya efektif bertransisi sekali; auto-cancel melepas reservations dan menghasilkan occurrence unik.
- **AC-BKG-01:** Given last session/seat dan dua concurrent commands, then hanya satu booking sukses dan balance/capacity tidak negatif.
- **AC-BKG-02:** Given cutoff H-2, mismatched branch/class, expired package, invalid state atau duplicate active booking, then tidak ada partial write.
- **AC-RES-01:** Given request ≥H-24 dan valid target, then old release + new booking/reservation commit atomik; given <H-24, no automatic entitlement return.
- **AC-ATT-01:** Given valid signed token, then one check-in maximum; wrong actor/slot/window/replay ditolak tanpa hour/attendance duplicate.
- **AC-ATT-02:** Given confirmed class completion, then each attended booking creates one ATTEND and consumes reservation; retry has identical result; no-show has no automatic debit.

### Notification, finance, audit, operations, migration

- **AC-NOT-01:** Given duplicate outbox/webhook/retry, then one deterministic occurrence remains with consistent attempts/status; terminal failure is alerted and auditable.
- **AC-FIN-01:** Given effective master change, then historical snapshots remain unchanged and new transaction applies the eligible value.
- **AC-FIN-02:** Given reconciliation pass, then close snapshots all totals and locks period atomically; all UI/API mutation paths reject locked period.
- **AC-FIN-03:** Given correction for locked period, then only current-open-period journal with Super Owner approval is posted.
- **AC-AUD-01:** Every sensitive action records actor, asserted role, branch, safe before/after, reason, source, timestamps and correlation/request IDs; audit cannot be mutated through application API.
- **AC-MIG-01:** Given identical source checksum/key rerun, then accepted records and MIGRATION_OPENING ledger are not duplicated; rejected rows remain actionable and reconciliation gates cutover.

## 4. Complete BR Traceability

| Requirement | Stories | UX | API | Schema | Tests | UAT | Owner |
|---|---|---|---|---|---|---|---|
| BR-001–005 | US-ID-01,02; US-MST-02 | UX-01,11 | API-AUTH, USERS, ASSIGN | identity/assignments | TC-AUTH-* | UAT-AUTH-* | TL |
| BR-010–016 | US-PKG-01,02; US-LED-01 | UX-02 | API-PURCHASE, LEDGER | purchase/package/ledger | TC-PKG-*,LED-* | UAT-PKG/LED | TL |
| BR-020–025 | US-BKG-01; US-LED-01 | UX-03 | API-BOOKING | booking/reservation/idempotency | TC-BOOK-* | UAT-BOOK-01 | TL |
| BR-030–036 | US-CLS-01..03 | UX-06,07 | API-AVAIL, CLASS | availability/class slot | TC-CLS/CLASS-* | UAT-CLS/CLASS | TL |
| BR-040–045 | US-ATT-01..03 | UX-05..08 | API-CHECKIN, COMPLETE | check-in/hour/ledger | TC-ATT-* | UAT-ATT-* | TL |
| BR-050–054 | US-BKG-02; US-LED-02 | UX-04,09 | API-RESCHEDULE, ADJUST | reschedule/adjust/ledger | TC-RES-* | UAT-RES-* | PM/BA |
| BR-060–067 | US-FIN-01..04 | UX-10 | API-REPORT, FINANCE, CLOSE, CORRECTION | finance/period/snapshots | TC-FIN-* | UAT-FIN-* | Finance |
| BR-070–072 | US-NOT-01; US-OPS-01 | notifications/ops | API-NOTIFICATION, OPS | outbox/occurrence/attempt | TC-NOTIF/OPS-* | UAT-NOTIF/OPS | TL |
| BR-073–075 | Semua sensitive command; US-AUD-01 | UX-10,11/audit | API-AUDIT | audit + branch/time invariants | TC-AUD + cross-cutting | UAT-AUD | TL |
| NFR-001–008 | Semua MVP | seluruh flow | seluruh API | cross-cutting | TC-NFR-* | release/UAT | TL+QA |

## 5. Definition of Ready Enforcement

Sebuah story hanya `READY` jika seluruh kolom story contract terisi, semua decision blocking APPROVED, Figma terkait APPROVED, OpenAPI/schema review selesai, test IDs memiliki steps/data/expected result, dependency memiliki owner/due date, dan estimate/assignee/reviewer ditetapkan. Nilai aktual configuration tidak ditulis di story; story menautkan configuration evidence yang disetujui.

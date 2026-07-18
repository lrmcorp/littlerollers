# Backlog, Acceptance Criteria & Traceability

**Status:** DRAFT

Dokumen ini berisi roadmap dan contoh minimum. Backlog MVP lengkap, acceptance lintas domain, dan traceability implementasi berada pada [MVP Implementation Backlog](03-mvp-implementation-backlog.md).
Jadwal Sprint 0–12 dan task/handoff per role berada pada [Master Implementation Plan](../delivery/01-master-implementation-plan.md) dan [WBS & Role Delivery Plan](../delivery/02-work-breakdown-and-role-delivery-plan.md).

## 1. Release Roadmap Baseline 6 Bulan

Estimasi menggunakan sprint dua minggu dan wajib direbaseline setelah story-pointing.

| Fase | Perkiraan | Outcome | Role dominan |
|---|---|---|---|
| Discovery & foundation | Sprint 0–1 | Governance, PRD, Figma, architecture, environment, data profiling | PO, PM/BA, Design, TL, QA |
| Identity, master, package | Sprint 2–3 | Auth/RBAC/branch, master, purchase approval, ledger | TL, Web, Flutter, QA |
| Scheduling & booking | Sprint 4–5 | Availability, slot, timetable, reservation, reschedule | Seluruh delivery |
| Attendance & automation | Sprint 6–7 | QR/link check-in, completion, auto-cancel, WhatsApp transaction | TL, Web, Flutter, QA |
| Finance & close | Sprint 8–9 | Reports, costs, profit, close/correction | TL, Web, QA, Finance |
| Hardening & migration rehearsal | Sprint 10 | Security/performance, import, training, UAT prep | Seluruh tim |
| UAT, pilot & parallel run | Sprint 11–12 | Pilot readiness, UAT, cutover, 1–2 week parallel run | Seluruh tim + bisnis |

Baseline keputusan `DEC-003` adalah enam bulan termasuk contingency setelah kickoff dan staffing lengkap. Urutan sprint tetap estimasi awal dan wajib direbaseline setelah story pointing; perubahan commitment setelah baseline mengikuti Change Request.

## 2. Epic Backlog

| Epic | Outcome | Business rules | Release |
|---|---|---|---|
| EP-01 Identity & RBAC | Login aman dan branch-scoped access | BR-001–005 | MVP |
| EP-02 Master Data | Effective-dated operational/financial master | BR-010, BR-016, BR-032 | MVP |
| EP-03 Purchase & Package | Approval mengaktifkan package dan balance | BR-010–016 | MVP |
| EP-04 Session Ledger | Balance/reservation konsisten dan auditable | BR-013–025, BR-044 | MVP |
| EP-05 Instructor & Timetable | Availability hingga confirmed class | BR-030–036 | MVP |
| EP-06 Booking & Reschedule | Self-service aman terhadap quota/time/session | BR-020–025, BR-050–054 | MVP |
| EP-07 Check-in & Completion | Attendance dan instructor cost valid | BR-040–045 | MVP |
| EP-08 Notification | Transactional WhatsApp/in-app idempotent | BR-070–072 | MVP |
| EP-09 Finance & Close | Report dan period lock dapat direkonsiliasi | BR-060–067 | MVP |
| EP-10 Audit & Security | Critical actions traceable dan protected | BR-003–005, BR-073–075 | MVP |
| EP-11 Migration & Pilot | Opening data benar dan cabang siap | Migration plan | MVP |
| EP-12 Expiry Automation | Reminder/digest lengkap | BR-015, BR-070–072 | Post-pilot |

## 3. User Story dan Acceptance Minimum

### US-001 — Customer login

Sebagai Customer, saya ingin login melalui Google atau OTP WhatsApp agar dapat menggunakan akun yang terverifikasi.

- **AC-001:** Google identity yang cocok dengan akun aktif membuat session tanpa membuat duplikat Customer.
- **AC-002:** OTP memiliki expiry, attempt limit, rate limit, dan tidak muncul pada log.
- **AC-003:** Nomor yang sudah digunakan akun lain tidak dapat diambil alih tanpa recovery flow.

### US-010 — Approve package purchase

Sebagai Manager, saya ingin memvalidasi bukti transfer agar paket aktif dengan saldo dan expiry yang benar.

- **AC-010:** Approver hanya melihat purchase pada branch yang berhak.
- **AC-011:** Approval atomik membuat CustomerPackage aktif dan satu ledger PURCHASE.
- **AC-012:** Retry approval menghasilkan hasil sama tanpa entry ganda.
- **AC-013:** Reject mewajibkan reason dan tidak menambah saldo.

### US-020 — Customer booking

Sebagai Customer, saya ingin booking dari timetable agar dapat mengikuti kelas.

- **AC-020:** Hanya slot/branch/class type/package yang valid dapat dipilih.
- **AC-021:** Booking sebelum H-2 menahan satu session dan satu capacity seat secara atomik.
- **AC-022:** Available session/capacity tidak negatif pada concurrent booking.
- **AC-023:** Retry idempotent tidak membuat booking/reservation ganda.

### US-030 — H-24 quota evaluation

Sebagai tim studio, saya ingin sistem menentukan kelas otomatis pada H-24 agar keputusan quota konsisten.

- **AC-030:** Scheduler memakai timezone Branch dan hanya memproses slot eligible satu kali secara efektif.
- **AC-031:** Quota terpenuhi menghasilkan CONFIRMED; kurang quota menghasilkan AUTO_CANCELLED.
- **AC-032:** Auto-cancel melepas semua reservation dan membuat notification occurrence unik.

### US-040 — Complete class

Sebagai Admin, saya ingin menyelesaikan kelas agar attendance dan cost terposting tepat.

- **AC-040:** Setiap Customer hadir mendapat tepat satu ATTEND debit dan reservation dikonsumsi.
- **AC-041:** Customer tidak hadir tidak mendapat ATTEND debit otomatis.
- **AC-042:** Matched Instructor check-in membuat tepat satu hour log.
- **AC-043:** Retry completion tidak mengubah hasil atau menduplikasi ledger/hour log.

### US-050 — Monthly close

Sebagai Finance/Super Owner, saya ingin menutup periode cabang agar laporan terkunci dan dapat diaudit.

- **AC-050:** Close ditolak bila reconciliation blocking belum selesai.
- **AC-051:** Snapshot revenue, projection, realtime, other cost, dan profit tersimpan atomik.
- **AC-052:** Data locked tidak dapat diubah melalui API maupun UI.
- **AC-053:** Koreksi periode lama hanya melalui current-period journal dengan Super Owner approval.

## 4. Requirement Traceability Matrix

Lengkapi kolom Figma/API/Test/UAT ketika artefak dibuat. Tidak boleh ada `BR` MVP tanpa test dan owner.

| Requirement | Epic/Story | Figma node | API/Schema | Test | UAT | Owner |
|---|---|---|---|---|---|---|
| BR-001–005 | EP-01/US-001 | TBD | Auth/User/Role | TC-AUTH-* | UAT-AUTH | TL |
| BR-010–016 | EP-03/US-010 | TBD | Purchase/Package/Ledger | TC-PKG-* | UAT-PKG | TL |
| BR-020–025 | EP-04,06/US-020 | TBD | Booking/Reservation | TC-BOOK-* | UAT-BOOK | TL |
| BR-030–036 | EP-05/US-030 | TBD | ClassSlot/QuotaJob | TC-CLASS-* | UAT-CLASS | TL |
| BR-040–045 | EP-07/US-040 | TBD | CheckIn/HourLog/Ledger | TC-ATT-* | UAT-ATT | TL |
| BR-050–054 | EP-06 | TBD | Reschedule/Adjust | TC-RES-* | UAT-RES | PM/BA |
| BR-060–067 | EP-09/US-050 | TBD | Reports/Close/Journal | TC-FIN-* | UAT-FIN | Finance |
| BR-070–075 | EP-08,10 | TBD | Notification/Audit | TC-NOTIF-* | UAT-NOTIF | TL |

## 5. Backlog Issue Template

Setiap GitHub issue user story memuat:

```text
Title: [US-xxx] Outcome singkat
Epic / Release / Sprint:
Actor / Branch context:
Business value:
Requirement IDs:
Figma link:
API/schema impact:
Acceptance criteria (Given/When/Then):
Authorization/audit/notification impact:
Data migration/backward compatibility impact:
Dependencies/risks:
Estimate / Assignee / Reviewer:
Test evidence link:
```

## 6. Release Acceptance

MVP pilot siap UAT ketika seluruh epic MVP feature-complete di staging, migration rehearsal lulus, open P1/P2 nol, critical regression lulus, runbook/rollback siap, dan training material tersedia. Go-live memerlukan sign-off QA, TL, perwakilan operasional, Finance, dan Product Owner.

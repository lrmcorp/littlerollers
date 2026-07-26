# Project Charter & Governance

**Project:** Daily Dose Pilates Management System  
**Status:** DRAFT  
**Target:** Pilot satu cabang dalam enam bulan setelah AI build kickoff, including contingency; sprint commitment direbaseline setelah story pointing  

Delivery roles are AI work modes. Human staffing and vendor selection are outside the active delivery model; Product Owner remains responsible only for genuine business decisions and production acceptance.
**Cadence:** Sprint dua minggu

Rencana operasional Sprint 0–12, WBS role, handoff, environment/release dan kickoff dipelihara pada folder `docs/delivery/`, dengan [Master Implementation Plan](../delivery/01-master-implementation-plan.md) sebagai jadwal utama.

## 1. Tujuan dan Outcome

Membangun platform multi-cabang untuk operasional studio Pilates yang memiliki satu backend dan sumber data bersama bagi:

- Web responsif untuk Admin, Manager, Owner, Super Owner, dan Finance.
- Flutter Android/iOS untuk Customer dan Instructor.
- Pengelolaan paket, session ledger/reservation, timetable, booking, check-in, reschedule, auto-cancel, laporan finansial, monthly close, audit, dan notifikasi.

Outcome pilot dinyatakan tercapai ketika satu cabang dapat menjalankan alur penjualan paket hingga monthly close, data lama berhasil direkonsiliasi, dan tidak ada defect P1/P2 terbuka saat go-live.

## 2. Ruang Lingkup Rilis

### MVP Pilot

- Google sign-in dan OTP WhatsApp untuk Customer.
- Google sign-in dan password untuk akun internal terdaftar; tindakan sensitif dibatasi permission, scope, audit, optimistic locking, dan separation-of-duties.
- RBAC dan pembatasan data per cabang.
- Master cabang, class type, package, instructor fee, projection rate, dan minimum quota dengan effective date.
- Upload bukti transfer, approval, aktivasi paket, expiry, dan session ledger.
- Instructor availability, timetable, instructor assignment, self-booking, dan session reservation.
- Instructor QR check-in, Customer link check-in, Admin backfill H+2, class completion.
- Reschedule, manual adjustment, H-24 quota evaluation, auto-cancel, dan refund reservation/session.
- Audit trail, transaksi WhatsApp penting, laporan inti, cost, profit, correction journal, dan monthly close per cabang.
- Migrasi data aktif, pilot satu cabang, dan parallel run 1–2 minggu.

### Setelah Pilot Stabil

- Reminder expiry Customer lengkap H-7/H-3/H-1.
- Reminder expired setiap tiga hari maksimal lima kali.
- Digest expiry Admin setiap tiga jam dan rekap Owner/Super Owner setiap tiga hari.
- Optimalisasi, enhancement, dan rollout cabang berikutnya berdasarkan hasil pilot.

### Tidak Termasuk MVP

- Payment gateway.
- Aplikasi Flutter untuk role internal selain Customer dan Instructor.
- Microservices terpisah.
- Integrasi WhatsApp tidak resmi.
- Penghapusan histori transaksi atau perubahan angka periode yang telah locked.

## 3. Prinsip Delivery

- Backend adalah satu-satunya tempat aturan bisnis otoritatif; web/mobile tidak boleh menggandakan rule kritis.
- Modular monolith digunakan untuk MVP; pemisahan service hanya melalui ADR setelah ada bukti kebutuhan skala.
- API contract, migration, dan dokumentasi berubah bersama code.
- Satu user story harus memiliki satu outcome pengguna yang dapat diuji.
- Semua keputusan signifikan masuk Decision Register; perubahan baseline masuk Change Request.

## 4. Governance dan Otoritas

| Keputusan/Deliverable | Responsible | Accountable/Approver | Consulted |
|---|---|---|---|
| Prioritas, MVP, business rule | PM/BA | Product Owner | PIC Operasional, Finance, TL |
| Requirement dan acceptance criteria | PM/BA | Product Owner | Designer, QA, TL |
| UX flow/prototype | UI/UX Designer | Product Owner | PM/BA, Web, Flutter |
| Architecture, API, data, security | Technical Lead | Technical Lead | Web, Flutter, QA |
| Test strategy dan release evidence | QA | PM/BA + TL | Developer, PIC UAT |
| UAT operasional | PIC Operasional | Product Owner | PM/BA, QA |
| UAT finansial | Finance | Product Owner | PM/BA, QA |
| Production release | TL | Product Owner | QA, PM/BA |
| Monthly close produksi | Finance/Super Owner | Sesuai permission bisnis | Owner, PM/BA |

Product Owner memberikan keputusan atau approval maksimal **dua hari kerja**. Delay dicatat sebagai dependency dan PM/BA memperbarui dampak milestone.

## 5. Communication Plan

| Kegiatan | Frekuensi | Peserta | Output |
|---|---|---|---|
| Daily sync | Hari kerja, 15 menit | Tim delivery | Blocker dan fokus harian |
| Backlog refinement | Mingguan | PM/BA, TL, Designer, QA, developer | Story siap sprint |
| Sprint planning | Dua mingguan | Tim delivery + PO | Sprint goal dan commitment |
| Design/technical review | Sesuai kebutuhan, sebelum build | Pemilik dokumen + reviewer | Approval/comment tercatat |
| Sprint review/demo | Akhir sprint | Tim + stakeholder | Feedback dan acceptance |
| Retrospective | Akhir sprint | Tim delivery | Improvement action |
| Steering/status | Dua mingguan | PO, PM/BA, TL | Status scope, timeline, risk |
| Incident bridge P1 | Saat insiden | TL, QA, PM/BA, PIC bisnis | Mitigasi dan komunikasi |

## 6. Sprint Workflow

`BACKLOG → READY → IN PROGRESS → CODE REVIEW → QA → UAT/ACCEPTANCE → DONE`

- Story tidak masuk sprint jika Definition of Ready belum terpenuhi.
- Scope sprint tidak berubah kecuali P1/security issue atau Change Request yang secara eksplisit mengganti commitment.
- Bug ditemukan sebelum story selesai menjadi bagian story tersebut; bug pascarilis dibuat issue terpisah.
- GitHub issue wajib terkait epic, requirement ID, owner, estimate, acceptance criteria, dan target release.

## 7. Definition of Ready

Story berstatus `READY` jika:

- Outcome, aktor, branch context, dan business rule jelas.
- Acceptance criteria dapat diuji dan edge case utama tercantum.
- Desain Figma tersedia bila ada perubahan UI.
- API/data impact telah direview TL bila diperlukan.
- Dependency, migration, security/privacy, notification, dan audit impact telah ditandai.
- QA memahami test approach; estimate dan PIC tersedia.

## 8. Definition of Done

Story berstatus `DONE` hanya jika:

- Acceptance criteria terpenuhi.
- Code review lulus tanpa temuan blocking.
- Unit/integration/widget/e2e test relevan lulus.
- QA regression relevan lulus dan evidence tersimpan.
- Authorization, audit, idempotency, timezone, dan error handling diuji bila relevan.
- OpenAPI, schema/migration, docs, dan Figma diperbarui bila terdampak.
- Berhasil dideploy ke staging dan didemokan.
- Tidak ada defect P1/P2 terbuka yang terkait story.

## 9. Change Control

Perubahan terhadap baseline `APPROVED` mengikuti alur:

1. Requestor membuat Change Request.
2. PM/BA menjelaskan alasan, scope, business value, dan alternatif.
3. TL menilai dampak architecture, data, security, integration, dan technical debt.
4. QA menilai dampak regression/UAT; Designer menilai dampak UX bila relevan.
5. PM/BA menyusun dampak timeline, kapasitas, biaya, dan risiko.
6. Product Owner memilih `APPROVED`, `REJECTED`, atau `DEFERRED`.
7. Baseline, backlog, traceability, dan milestone diperbarui setelah approval.

## 10. Risk Baseline

| Risiko | Dampak | Mitigasi | Owner |
|---|---|---|---|
| Data spreadsheet tidak konsisten | Saldo/paket awal salah | Profiling, cleansing, rehearsal, reconciliation | PM/BA + Data Owner |
| Approval bisnis lambat | Sprint/milestone tertunda | SLA 2 hari, decision log, escalation ke PO | PM/BA |
| Rule ledger salah | Kerugian finansial/kepercayaan | Append-only ledger, transaction, concurrency test | TL + QA |
| WhatsApp template/quality ditolak | Notifikasi gagal | Submission dini, fallback in-app, monitoring | TL |
| Vendor knowledge lock-in | Operasi bergantung vendor | Account ownership, docs, KT, offboarding checklist | PO + TL |
| Scope creep | Pilot terlambat | MVP baseline dan formal Change Request | PO + PM/BA |
| Cabang pilot tidak siap | Pilot gagal bukan karena produk | Readiness score dan exit criteria | PO + PM/BA |

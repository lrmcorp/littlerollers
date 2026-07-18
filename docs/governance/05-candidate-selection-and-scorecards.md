# PM/BA, Technical Lead & Peer Reviewer Selection

**Status:** SUPERSEDED — NOT APPLICABLE TO AI DELIVERY  
**Process owner:** Product Owner sementara sampai PM/BA ditunjuk  
**Final approver:** Reyner  
**Sourcing model:** Historical human/vendor option only

> Superseded on 2026-07-18 by [AI Delivery Operating Model & Coding Authorization](10-ai-delivery-and-coding-authorization.md). Candidate selection is not required because delivery roles are executed by AI. Keep this document only as historical material if human staffing is introduced later.

Dokumen ini mengatur seleksi personel, bukan pemilihan harga/vendor komersial. Penilaian hanya memakai data sintetis dan dokumen repository; data produksi, credential, dan PII dilarang.

## 1. Entry, Tahapan, dan Keputusan

Seleksi dimulai setelah tersedia minimal dua kandidat PM/BA, dua kandidat TL, dan satu reviewer independen. Tahapan wajib:

1. Eligibility dan conflict-of-interest declaration.
2. CV/portfolio evidence review.
3. Structured interview dengan pertanyaan dan rubric yang sama per role.
4. Daily Dose synthetic case exercise.
5. Reference check dan availability confirmation.
6. Weighted scoring, moderation, dan keputusan Reyner.

Keputusan kandidat: `SHORTLISTED`, `PASS`, `RESERVE`, atau `REJECTED`. Kandidat hanya `PASS` jika total minimal 75/100, seluruh area kritis minimal 60/100, allocation memenuhi baseline, tidak ada conflict/reference blocker, dan evidence tiap skor tersedia.

## 2. Candidate Selection Register

Gunakan satu baris per kandidat dan jangan menyimpan kontak pribadi.

| Candidate ID | Role | Nama | Organisasi | Main vendor/independent | Conflict declaration | Availability/allocation | CV/interview/case | Weighted score | Critical floor | Reference check | Decision | Approved by/date |
|---|---|---|---|---|---|---|---|---:|---|---|---|---|
| CAND-PM-01 | PM/BA | TBD-BLOCKING | TBD-BLOCKING | Main vendor | TBD | 100% / TBD | TBD/TBD/TBD | TBD | TBD | TBD | OPEN | TBD |
| CAND-PM-02 | PM/BA | TBD-BLOCKING | TBD-BLOCKING | Main vendor | TBD | 100% / TBD | TBD/TBD/TBD | TBD | TBD | TBD | OPEN | TBD |
| CAND-TL-01 | Technical Lead | TBD-BLOCKING | TBD-BLOCKING | Main vendor | TBD | 100% / TBD | TBD/TBD/TBD | TBD | TBD | TBD | OPEN | TBD |
| CAND-TL-02 | Technical Lead | TBD-BLOCKING | TBD-BLOCKING | Main vendor | TBD | 100% / TBD | TBD/TBD/TBD | TBD | TBD | TBD | OPEN | TBD |
| CAND-REV-01 | Peer reviewer/backup | TBD-BLOCKING | TBD-BLOCKING | Independent/internal | TBD | ≥20% / TBD | TBD/TBD/TBD | TBD | TBD | TBD | OPEN | TBD |

## 3. Scoring Rules

Setiap category diberi raw score 0–100 berdasarkan evidence. `weighted contribution = raw score × weight`. Total adalah jumlah seluruh weighted contribution dan harus berada 0–100.

Rubric raw score:

- `0–39`: tidak ada bukti memadai atau jawaban menimbulkan risiko material.
- `40–59`: memahami konsep dasar tetapi tidak dapat menerapkannya secara aman.
- `60–74`: kompeten untuk situasi normal dengan review/support.
- `75–89`: kuat, berbasis bukti, menangani edge case dan trade-off.
- `90–100`: sangat kuat, sistematis, dapat membimbing tim dan memperbaiki kelemahan requirement/design.

Skor wajib memiliki note singkat dan evidence link. Pembulatan dilakukan dua decimal pada contribution dan total. Spreadsheet/formula tidak boleh mengubah `PASS` jika threshold atau blocker gagal.

## 4. PM/BA Scorecard

Area kritis adalah empat baris pertama.

| Category | Weight | Evidence yang dinilai | Raw 0–100 | Contribution |
|---|---:|---|---:|---:|
| Requirement/business analysis | 25% | process mapping, ambiguity resolution, business rule, scope control | TBD | TBD |
| Delivery and risk management | 20% | roadmap, dependency, estimation facilitation, escalation, change control | TBD | TBD |
| Acceptance criteria/traceability | 20% | testable GWT, edge case, BR→US→API→TC→UAT mapping | TBD | TBD |
| Migration/UAT | 15% | source profiling, mapping, reconciliation, UAT and cutover coordination | TBD | TBD |
| Stakeholder communication | 10% | decision facilitation, status clarity, conflict handling | TBD | TBD |
| Daily Dose case exercise | 10% | completeness, prioritization, correctness, clarity | TBD | TBD |
| **Total** | **100%** | `SUM(contribution)` |  | **TBD** |

## 5. Technical Lead Scorecard

Area kritis adalah lima baris pertama. Scorecard yang sama digunakan untuk peer reviewer; reviewer juga wajib lulus independence check.

| Category | Weight | Evidence yang dinilai | Raw 0–100 | Contribution |
|---|---:|---|---:|---:|
| Architecture/data design | 25% | modular boundaries, schema constraints, effective data, migrations | TBD | TBD |
| Ledger/transaction/concurrency | 20% | locking, isolation, last seat/session, idempotency, invariant defense | TBD | TBD |
| Security/auth/RBAC | 15% | identity linking, MFA, branch scoping, token/upload and PII controls | TBD | TBD |
| API/event contract | 15% | OpenAPI semantics, errors, compatibility, outbox and webhook design | TBD | TBD |
| Operations/recovery | 10% | deployment, observability, PITR, queue recovery, incident handling | TBD | TBD |
| Technical leadership | 10% | review quality, trade-offs, mentoring, vendor/accountability | TBD | TBD |
| Daily Dose case exercise | 5% | correctness, risk recognition, communication | TBD | TBD |
| **Total** | **100%** | `SUM(contribution)` |  | **TBD** |

## 6. Synthetic Case Exercises

### CASE-PM-01 — Flow refinement and change control

Input: PRD/backlog repository dan dataset sintetis DD-QA-001. Kandidat memiliki 90 menit preparation dan 45 menit presentation/Q&A.

Deliverables:

- Refine purchase → package activation → booking → check-in → completion menjadi story/AC yang independently testable.
- Identifikasi actor/branch, preconditions, failure/concurrency, audit, notification, data dan UAT impacts.
- Tanggapi change request: “potong session saat booking” dengan options, impact, recommendation, affected BR/US/API/test/migration dan approval route.
- Susun delivery risks/dependencies dan satu sprint-ready slice tanpa mengabaikan blocking decision.

Penilaian case: requirement correctness 30%, testability/traceability 25%, scope/change reasoning 20%, risk/dependency 15%, clarity 10%.

### CASE-TL-01 — Integrity and recovery design

Input: ADR, ERD, OpenAPI, error/event contract dan DD-QA-001. Kandidat memiliki 120 menit preparation dan 60 menit presentation/Q&A.

Deliverables:

- Transaction/locking design ketika dua request memperebutkan last session dan last seat.
- Idempotency behavior untuk retry, changed payload dan concurrent different keys.
- Period lock/correction design dan defense pada service/database.
- Failure path ketika commit berhasil tetapi worker/provider gagal, termasuk recovery dan observability.
- Minimum schema constraints, error codes, test cases dan rollout compatibility.

Penilaian case: integrity/concurrency 30%, failure/recovery 20%, security/authorization 15%, API/event/schema consistency 20%, testability/communication 15%.

### CASE-REV-01 — Independent challenge review

Reviewer menerima output CASE-TL-01 dan baseline technical documents. Dalam 60 menit, reviewer menghasilkan temuan berprioritas, evidence, impact, recommended disposition, dan Gate blocker/non-blocker. Reviewer dinilai pada independence, correctness, security/operability coverage, dan ability to distinguish preference from material risk.

## 7. Conflict, Independence, and Reference Check

- Kandidat mengungkap hubungan finansial/pelaporan dengan evaluator dan vendor lain.
- Peer reviewer tidak boleh menjadi bawahan TL, bagian dari approval komersial vendor utama, atau dinilai berdasarkan penerimaan output TL.
- Reference check memverifikasi role, delivery outcome, integrity/security incident handling, communication dan reason for leaving; unsupported claim dicatat.
- Blocker: misrepresentation, unresolved conflict, refusal to follow Daily Dose repository/account ownership, inability to meet allocation, atau material negative reference yang telah diverifikasi.

## 8. Assignment and Gate Handoff

Setelah `PASS`, PIC Assignment Register diisi dengan nama, organisasi, vendor status, allocation, start/end, backup, work contact, account provisioning dan Reyner approval/date. Tidak ada auto-assignment Reyner sebagai PM/BA/TL. Kandidat `RESERVE` tidak memenuhi PIC wajib kecuali dipromosikan melalui decision record.

PM/BA, TL, dan reviewer kemudian menjalankan Signed Gate 1 Review Record. Sampai seluruh syarat terpenuhi, `DEP-001`, `RISK-002`, `APR-001`, dan Gate 1 tetap blocking.

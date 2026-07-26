# Source Reconciliation & Decision Backlog

**Status:** DRAFT  
**Owner:** PM/BA  
**Approver:** Product Owner

## 1. Reconciliation PDF ke Repository

| REC ID | Topik PDF | Disposition repository | Hasil/artefak | Status |
|---|---|---|---|---|
| REC-001 | Tujuh role dan permission | Dipertahankan dan diperjelas | PRD permission matrix + RACI membedakan role aplikasi/proyek | READY FOR REVIEW |
| REC-002 | Customer login Google | Ditambahkan OTP WhatsApp | BR-001; Google + OTP WhatsApp diterima untuk MVP melalui DEC-001 | ACCEPTED 2026-07-18 |
| REC-003 | Session dipotong saat completed + hadir | Dipertahankan | BR-044; reservation bukan debit | READY FOR REVIEW |
| REC-004 | Self-booking; Admin rare case | Dipertahankan dan diaudit | BR-020–025 | READY FOR REVIEW |
| REC-005 | Auto-cancel H-24 dan sesi kembali | Diperjelas | Reservation dilepas; ledger refund hanya bila debit valid pernah ada | READY FOR REVIEW |
| REC-006 | Instructor QR; Customer link | Dipertahankan dengan security control | BR-040–043 | READY FOR REVIEW |
| REC-007 | Expiry dan reminder lengkap | Reminder expiry dipindah post-pilot | Transactional notification tetap MVP; reminder expiry lengkap post-pilot melalui DEC-002 | ACCEPTED 2026-07-18 |
| REC-008 | Reports dan monthly close | Dipertahankan | BR-060–067; realtime cost snapshot terpisah | READY FOR REVIEW |
| REC-009 | Effective-dated master | Dipertahankan dan diperluas | Fee, rate, quota; package snapshot | READY FOR REVIEW |
| REC-010 | Entity list | Diperjelas | Data dictionary menambah reservation, outbox, idempotency, sessions | READY FOR REVIEW |
| REC-011 | Roadmap tiga fase | Diganti roadmap sprint 0–13 | Baseline enam bulan dengan contingency; commitment direbaseline setelah story pointing melalui DEC-003 | ACCEPTED 2026-07-18 |
| REC-012 | “Final untuk Development” | Tidak otomatis diadopsi | Repo tetap DRAFT sampai G1 approval | READY FOR REVIEW |

`READY FOR REVIEW` bukan approval. Product Owner menandatangani seluruh disposition pada APR-001.

## 2. Decision Item Format

Setiap keputusan memuat owner, due trigger, pilihan, rekomendasi, dampak dan gate/story yang diblokir. Nilai `TBD-BLOCKING` tidak boleh diganti angka contoh.
Input, validation, approval, application dan verification fields untuk DEC-004..014 dipelihara pada [Business Configuration & Decision Workbook](06-business-configuration-and-decision-workbook.md).

| ID | Keputusan | Owner | Due trigger | Rekomendasi | Opsi/constraint | Dampak bila terlambat | Blocks | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-001 | OTP WhatsApp Customer masuk MVP | PO | Sebelum G2 | Google + OTP WhatsApp, dengan abuse/recovery control | Google-only atau Google+OTP | Auth UX/API/test berubah | G2, US-001 | APPROVED — Reyner, 2026-07-18 |
| DEC-002 | Reminder expiry lengkap post-pilot | PO | Sebelum G1 | Reminder expiry lengkap post-pilot; transactional notice tetap MVP | MVP penuh atau post-pilot | Scope/timeline/Meta template | G1 | APPROVED — Reyner, 2026-07-18 |
| DEC-003 | Baseline timeline setelah estimation | PO + PM | Setelah story pointing | 6 bulan + contingency; final sprint commitment direbaseline setelah story pointing | 5 bulan aggressive / 6 bulan baseline | Contract/milestone | G1 | APPROVED — Reyner, 2026-07-18 |
| DEC-004 | Harga, session count, duration package | PO | Sebelum US-PKG-01 READY | Configuration approved per package | Tidak ada production default | Purchase/expiry | G2 story terkait | TBD-BLOCKING |
| DEC-005 | Capacity dan minimum quota per branch/class | PO | Sebelum scheduling READY | Effective-dated configuration dengan min 1 dan capacity ≥ quota | Nilai aktual dari bisnis | Booking/auto-cancel | G2 story terkait | TBD-BLOCKING |
| DEC-006 | Instructor fee dan projection rate | PO + Finance | Sebelum finance READY | Integer Rupiah, effective-dated, non-overlap | Nilai aktual dari bisnis | Financial snapshot | G2 story terkait | TBD-BLOCKING |
| DEC-007 | Customer check-in window | PO | Sebelum UX-05 approval | Mulai 30 menit sebelum start sampai class end; final melalui approval | Window configurable dengan safe bounds | Token/attendance UX | G2/G3 | TBD-BLOCKING |
| DEC-008 | Manual studio cancellation policy | PO | Sebelum class lifecycle READY | Reason wajib; notification; reservation release atomik; refund rule berbasis ledger | Role approver dan cutoff final | Ledger/support | G2 | TBD-BLOCKING |
| DEC-009 | Data retention schedule | PO + Legal/Privacy | Sebelum production | Klasifikasi per data type; legal review | Audit/finance minimum sesuai kewajiban | Storage/privacy | G5/G6 | TBD-BLOCKING |
| DEC-010 | Pilot branch | PO | Sebelum migration rehearsal | Pilih skor tertinggi ≥75 tanpa blocker | Assessment seluruh kandidat | Migration/UAT | G5/G6 | TBD-BLOCKING |
| DEC-011 | Cloud/region/managed services | TL + PO | Sebelum environment build | Region dekat Indonesia, managed DB/cache/storage, IaC | Provider evaluation | ADR/deployment/RPO | G4/G5 | TBD-BLOCKING |
| DEC-012 | Session/token model | TL | Sebelum auth build | AMENDED — web HttpOnly access + rotating refresh cookie; mobile rotating family; 15m access, 30d refresh; MFA/TOTP dihapus; authorization memakai permission, scope, audit dan separation-of-duties | Detail melalui ADR-005; production secret/provider/TTL approval | Clients/security | G4 | LOCAL DRAFT / PROD BLOCKED |
| DEC-013 | Notification fallback | PO + TL | Sebelum notification build | In-app persisted fallback; no silent success | Push/email optional post-pilot | UX/support | G2/G4 | TBD-BLOCKING |
| DEC-014 | Recovery/account-linking policy | PO + TL | Sebelum US-001 READY | AMENDMENT DRAFT IMPLEMENTED LOCALLY — one-time 15m activation/reset token, generic reset response, revoke sessions on reset, no automatic linking; production Resend domain, support SLA, retention dan notification approval tetap wajib | Manual recovery SLA final | Account takeover risk | G2/G4 | LOCAL DRAFT / PROD BLOCKED |

## 3. Minimum Policies Pending Approval

Aturan ini adalah rekomendasi review, bukan baseline production sampai DEC terkait disetujui:

- **Cancellation:** command berizin, reason code + catatan, audit, notification occurrence, atomic reservation release, dan tidak mengubah ledger tanpa referenced reversal.
- **Check-in:** token signed, single-purpose, audience/resource-bound, short-lived; replay tidak membuat record kedua; Admin backfill berakhir H+2.
- **Retention:** payment proof, notification payload, session/security logs, audit, dan financial records memiliki jadwal terpisah; legal hold mengalahkan deletion schedule; ledger/audit tidak hard-delete.
- **Recovery:** account linking hanya untuk verified identity; perubahan nomor sensitif membutuhkan re-authentication dan notification ke identitas lama bila tersedia.
- **Fallback:** kegagalan WhatsApp menghasilkan status eksplisit, retry terbatas, dead-letter alert, dan in-app notice; operator tidak boleh menandai delivered tanpa webhook/evidence.
- **Separation of duties:** requestor tidak self-approve adjustment/correction; role sensitif memakai MFA; emergency override memakai break-glass, reason, alert dan review berikutnya.

## 4. Risk and Dependency Expansion

| ID | Type | Description | Probability | Impact | Owner | Mitigation | Due/status |
|---|---|---|---:|---:|---|---|---|
| RISK-001 | Data | Legacy data inconsistent | 4 | 5 | PM/BA | Profiling, mapping, two rehearsals, zero material mismatch | OPEN |
| RISK-002 | Delivery | One AI pass may miss cross-domain defects | 3 | 5 | AI TL | Separate author/reviewer contexts, executable tests, security/ledger review checklist | OPEN — per-change control |
| RISK-003 | Scope | Figma and complete backlog unavailable | 5 | 4 | PM/BA | G2/G3 gates; no UI story READY early | OPEN |
| RISK-004 | Vendor | Meta template/account approval delayed | 3 | 4 | PO/TL | Submit early, sandbox, in-app fallback | OPEN |
| RISK-005 | Finance | Incorrect effective values or close formula | 3 | 5 | Finance/TL | Deterministic dataset, snapshots, reconciliation | OPEN |
| DEP-001 | Execution | AI role modes and independent review pass | AI TL | Required per critical change | Weak review evidence | AVAILABLE — verify per change |
| DEP-002 | Design | Daily Dose-owned Figma file | Designer/PO | Required per UI story | UI cannot enter READY | TBD-BLOCKING |
| DEP-003 | Platform | Cloud, Meta, Google, stores, monitoring accounts | PO/TL | Required before G5/G6 | Integration/release blocked | TBD-BLOCKING |
| DEP-004 | Data | Versioned source extracts and data owners | PM/BA | Required before rehearsal | Migration blocked | TBD-BLOCKING |
| DEP-005 | Historical | Human candidate pool | N/A | Only if delivery model changes to human/vendor | None for AI delivery | NOT APPLICABLE |

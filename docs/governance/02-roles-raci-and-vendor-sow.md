# Role Charter, RACI & Vendor SOW

**Status:** DRAFT

> Delivery roles in this document are AI work modes, not human positions. Human/vendor staffing, allocation and candidate selection are not required. See [AI Delivery Operating Model](10-ai-delivery-and-coding-authorization.md). Product Owner remains the authority for genuine business inputs and production acceptance.

Dokumen ini membedakan tiga lapisan: delapan **application roles** (`CUSTOMER`, `INSTRUCTOR`,
`ADMIN`, `MANAGER`, `OWNER`, `SUPER_OWNER`, `FINANCE`, `OPS`), **AI delivery modes** pada struktur
delivery di bawah, dan **human approval authorities** untuk keputusan/acceptance nyata. Tidak ada
permission aplikasi atau approval authority yang diwariskan hanya karena nama role serupa.

## 1. Struktur Organisasi

```text
Product Owner
└── PM/Business Analyst
    ├── UI/UX Designer
    ├── Backend Lead / Technical Lead / DevOps / Security Owner
    │   ├── Web Frontend Developer
    │   └── Flutter Developer
    └── QA Engineer

Business collaborators: PIC Cabang/Data Owner, Finance, Admin, Manager,
Owner, Super Owner, Instructor, dan Customer representative.
```

PM/BA mengelola delivery; TL memiliki otoritas teknis. Keduanya tidak menggantikan keputusan bisnis Product Owner.
Execution mode dan review evidence dicatat pada Role Execution Register. Separation of duties berarti authoring dan review dilakukan sebagai pass AI terpisah dengan executable evidence; tidak memerlukan individu, vendor, allocation, atau reporting line.

## 2. Role Charter dan Job Description

### Product Owner — internal, accountable

**Misi:** memaksimalkan nilai produk dan menjadi satu sumber keputusan bisnis.

**Tanggung jawab:** baseline scope; prioritas backlog; approval requirement, UX, Change Request, UAT, dan release; menunjuk perwakilan fungsi; menyelesaikan konflik kebijakan.

**Deliverable:** approved roadmap, priority decisions, business sign-off, release approval.

**Kompetensi:** pemahaman operasional Daily Dose, kemampuan membuat keputusan lintas cabang, literasi finansial dasar.

**KPI:** SLA keputusan ≤2 hari kerja; perubahan darurat minimum; acceptance tepat waktu.

### Project Manager / Business Analyst — mayoritas full-time

**Misi:** menerjemahkan kebutuhan bisnis menjadi delivery yang dapat diuji dan terkendali.

**Tanggung jawab:** discovery, process mapping, PRD, backlog, acceptance criteria, sprint, dependency, risk, change control, status, data migration coordination, UAT coordination, support intake.

**Deliverable:** charter, PRD, backlog, traceability, plans/registers, sprint/release report, migration and UAT coordination.

**Kompetensi:** BA, project delivery, facilitation, SQL/data literacy, domain operations/finance.

**KPI:** story memenuhi DoR; requirement traceability lengkap; milestone/risk transparan; UAT tanpa ambiguity material.

### UI/UX Designer — full-time di discovery, part-time saat build

**Misi:** menghasilkan pengalaman konsisten, accessible, dan efisien untuk delapan application roles.

**Tanggung jawab:** research, IA, flow, wireframe, responsive behavior, prototype, design system, usability testing, handoff, design QA.

**Deliverable:** Figma library, flows, prototype, specs, assets, accessibility/handoff checklist.

**Kompetensi:** product design web/mobile, design system, accessibility, complex workflow.

**KPI:** flow tervalidasi sebelum development; handoff lengkap; defect mismatch desain rendah.

### Backend Lead / Technical Lead / DevOps / Security Owner — full-time

**Misi:** menjaga integritas domain, keamanan, kualitas teknis, dan operabilitas platform.

**Tanggung jawab:** architecture, ADR, NestJS modules, PostgreSQL model, OpenAPI, RBAC, ledger/finance transaction, integration, code review, CI/CD, observability, backup, security, incident command, technical sign-off.

**Deliverable:** architecture/data/API/security docs, backend, infrastructure pipelines, runbook, RCA.

**Kompetensi:** TypeScript/NestJS, PostgreSQL/transaction/concurrency, distributed jobs, OAuth/OIDC, cloud/security/observability.

**KPI:** integrity incident nol; deployment repeatable; P1 response sesuai SLA; API contract stabil.

### Web Frontend Developer — full-time

**Misi:** membangun web internal responsif, aman, accessible, dan efisien.

**Tanggung jawab:** Next.js UI, role-aware navigation, forms/tables/calendar/reports, OpenAPI client, frontend test, error/loading states, design QA.

**Deliverable:** web app, component documentation, tests, analytics/telemetry hooks.

**Kompetensi:** React/Next.js/TypeScript, responsive UI, accessibility, complex data table/calendar.

**KPI:** automated test dan performance target lulus; tidak ada authorization assumption di UI.

### Flutter Developer — full-time

**Misi:** membangun aplikasi Customer dan Instructor untuk Android/iOS.

**Tanggung jawab:** Flutter MVVM/feature architecture, auth, timetable/booking, deep link check-in, QR instructor, notification, offline/error states, store-ready builds, mobile test.

**Deliverable:** mobile app, build pipeline, release configuration, tests, store metadata support.

**Kompetensi:** Flutter/Dart, state management, deep link, QR/camera, push notification, secure storage.

**KPI:** crash-free target terpenuhi; critical mobile flow lulus pada device matrix.

### QA Engineer — full-time dan independen

**Misi:** memberi bukti objektif bahwa produk memenuhi requirement dan aman dirilis.

**Tanggung jawab:** strategy, test design, API/UI/mobile automation, exploratory/regression, migration reconciliation, defect triage, UAT facilitation, release evidence.

**Deliverable:** test plan/cases/evidence, defect report, traceability, QA sign-off.

**Kompetensi:** API/database/web/mobile testing, automation, financial reconciliation, risk-based testing.

**KPI:** requirement coverage; escape defect rendah; evidence lengkap; tidak ada P1/P2 terbuka saat release.

### PIC Cabang / Data Owner — internal

**Misi:** memastikan data dan proses cabang benar.

**Tanggung jawab:** cleansing source, validation customer/package/session/schedule, readiness, training, UAT operasional, parallel-run reconciliation.

### Finance Representative — internal

**Misi:** memastikan angka dan kontrol keuangan benar.

**Tanggung jawab:** opening balance validation, report formula, monthly close/correction UAT, reconciliation, financial sign-off recommendation.

### Production Operations / On-call Owner

**Misi:** memastikan layanan produksi dapat dipantau, dipulihkan, dan didukung setelah handover.

**Tanggung jawab:** roster/on-call, alert dan runbook ownership, incident communication, access review, backup/restore evidence, provider escalation, release observation, serta problem follow-up.

### Privacy/Legal Reviewer — internal atau advisor

**Misi:** menetapkan kebijakan pemrosesan dan retensi PII yang dapat diterapkan secara operasional.

**Tanggung jawab:** privacy notice/consent, retention schedule, data-subject handling, breach communication, legal hold, dan review akses/ekspor PII.

## 3. RACI Utama

RACI ini mengatur delivery dan approval artefak; tabel ini bukan authorization matrix aplikasi.
`AssignmentType` pada schema Prisma saat ini hanya foundation untuk assignment cabang `OWNER` dan
`INSTRUCTOR`, bukan representasi delapan role atau permission model lengkap. Role/permission penuh
harus ditambahkan pada BG-2 melalui schema dan contract story yang direview.

Legenda: `R` Responsible, `A` Accountable, `C` Consulted, `I` Informed. Setiap baris memiliki tepat satu `A`.

| Deliverable/Aktivitas | PO | PM/BA | Design | TL/BE | Web | Flutter | QA | Data Owner | Finance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Project Charter/roadmap | A | R | I | C | I | I | C | C | C |
| PRD/business rules | A | R | C | C | I | I | C | C | C |
| UX/UI prototype | A | C | R | C | C | C | C | C | I |
| Architecture/API/data | I | C | I | A/R | C | C | C | I | C |
| Backend implementation | I | C | I | A/R | C | C | C | I | I |
| Web implementation | I | C | C | A | R | I | C | I | I |
| Flutter implementation | I | C | C | A | I | R | C | I | I |
| Test strategy/evidence | I | C | C | C | C | C | A/R | C | C |
| Data migration | I | A/R | I | R | I | I | R | R | C |
| UAT operasional | A | C | I | C | I | I | R | R | I |
| UAT finansial | A | C | I | C | I | I | R | I | R |
| Production deployment | A | C | I | R | C | C | C | I | I |
| Incident P1 | I | R | I | A/R | C | C | R | C | C |
| Change Request | A | R | C | C | C | C | C | C | C |

Aktivitas privacy/retention: Product Owner `A`, Privacy/Legal Reviewer `R`, PM/BA/TL/QA `C`. Operasi produksi dan incident readiness: TL `A` sampai handover, Production Operations Owner `R`, QA/PM/BA `C`; setelah handover perubahan accountability wajib dicatat melalui approval matrix dan PIC register.

## 4. Approval Matrix

| Artefak/Gate | Reviewer wajib | Final approver |
|---|---|---|
| Requirement/Business Rule | TL, QA, fungsi terkait | Product Owner |
| Figma flow/prototype | PM/BA, Web/Flutter, QA | Product Owner |
| Architecture/ADR/OpenAPI | Web, Flutter, QA | Technical Lead |
| Migration mapping/reconciliation | TL, QA, Data Owner/Finance | PM/BA |
| QA exit report | PM/BA, TL | QA menyatakan pass/fail |
| UAT | PM/BA, QA, perwakilan fungsi | Product Owner |
| Production release | QA pass + TL readiness | Product Owner |

## 5. Vendor Statement of Work Minimum

Kontrak/SOW vendor wajib mencantumkan:

- Scope dan exclusions sesuai baseline MVP.
- Role, kapasitas, seniority, availability, dan aturan penggantian personel.
- Milestone berbasis deliverable/acceptance, bukan hanya jam kerja.
- Kewajiban memakai repository, Figma, GitHub Projects, dan akun milik Daily Dose.
- Pull request review, automated test, security, documentation, dan Definition of Done.
- SLA komunikasi, dependency pada bisnis, dan formal Change Request.
- Kerahasiaan, perlindungan PII, larangan menyalin data produksi, dan least privilege.
- Hak milik Daily Dose atas source code, schema, design, dokumentasi, konfigurasi, dan hasil kerja setelah pembayaran sesuai kontrak.
- Larangan credential pribadi sebagai satu-satunya admin layanan.
- Knowledge transfer berkala, runbook, credential rotation, dan offboarding.
- Warranty defect dan support pilot; severity/SLA mengikuti dokumen Quality.
- Acceptance dapat ditolak jika evidence, dokumentasi, test, security, atau handover tidak lengkap.

## 6. Capacity Baseline

| Role | Discovery | Build | Pilot |
|---|---:|---:|---:|
| Product Owner | 20–30% | 15–20% | 25–35% |
| PM/BA | 100% | 100% | 100% |
| UI/UX | 100% | 40–60% | 20–30% |
| Backend/TL | 100% | 100% | 100% |
| Web | 30–50% | 100% | 60–80% |
| Flutter | 30–50% | 100% | 60–80% |
| QA | 40–60% | 100% | 100% |
| Data Owner/Finance | 10–20% | 20–30% | 50–70% |

Persentase adalah baseline per minggu, bukan komitmen kontrak. PM/BA memperbaruinya setelah backlog estimation.

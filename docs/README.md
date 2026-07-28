# Dokumentasi Proyek Daily Dose Pilates

Dokumentasi ini adalah **source of truth** untuk requirement, governance, arsitektur, kualitas, migrasi, dan operasi aplikasi Daily Dose. Dokumen sumber bisnis tetap tersedia pada [Spesifikasi Sistem Daily Dose Pilates v1.0 copy.pdf](./Spesifikasi%20Sistem%20Daily%20Dose%20Pilates%20v1.0%20copy.pdf).

## Aturan Pengelolaan

- Dokumen repository menggunakan Bahasa Indonesia; nama API, schema, status, dan istilah engineering menggunakan Bahasa Inggris.
- Perubahan requirement yang telah berstatus `APPROVED` wajib mengikuti Change Request.
- Figma adalah source of truth untuk desain visual dan prototype.
- GitHub Projects adalah source of truth untuk epic, user story, task, bug, sprint, dan release.
- Seluruh role delivery dijalankan sebagai AI work modes; register mencatat separation of concerns dan evidence, bukan staffing manusia.
- Setiap business rule memakai ID stabil `BR-xxx`; user story `US-xxx`; acceptance criteria `AC-xxx`; test case `TC-xxx`.

## Indeks Dokumen

| Area | Dokumen | Pemilik | Approver |
|---|---|---|---|
| Governance | [Project Charter & Governance](governance/01-project-charter-and-governance.md) | PM/BA | Product Owner |
| Governance | [Role Charter, RACI & Vendor SOW](governance/02-roles-raci-and-vendor-sow.md) | PM/BA | Product Owner |
| Governance | [Document Register, Baseline & Gates](governance/03-document-register-and-gates.md) | PM/BA | Product Owner |
| Governance | [Source Reconciliation & Decisions](governance/04-reconciliation-and-decisions.md) | PM/BA | Product Owner |
| Governance (historical) | [Candidate Selection & Scorecards — Superseded](governance/05-candidate-selection-and-scorecards.md) | N/A | N/A |
| Governance | [Business Configuration & Decision Workbook](governance/06-business-configuration-and-decision-workbook.md) | PM/BA | Product Owner + Finance sesuai item |
| Governance | [Gate 2–4 Review & Approval Pack](governance/07-gate-2-4-review-and-approval-pack.md) | PM/BA | PO/TL sesuai gate |
| Governance | [Decision Closure Workshop Pack](governance/08-decision-closure-workshop-pack.md) | PM/BA | PO/TL sesuai keputusan |
| Governance (historical) | [External Human Staffing Pack — Superseded](governance/09-external-activation-execution-pack.md) | N/A | N/A |
| Governance | [AI Delivery Operating Model & Coding Authorization](governance/10-ai-delivery-and-coding-authorization.md) | AI Product/BA | Product Owner untuk business/production boundary |
| Delivery | [Master Implementation Plan](delivery/01-master-implementation-plan.md) | PM/BA | Product Owner |
| Delivery | [WBS & Role Delivery Plan](delivery/02-work-breakdown-and-role-delivery-plan.md) | PM/BA | Product Owner |
| Delivery | [Handoff Matrix & Sprint Playbook](delivery/03-handoff-matrix-and-sprint-playbook.md) | PM/BA | PO + TL + QA sesuai area |
| Delivery | [Environment, CI/CD & Release Plan](delivery/04-environment-cicd-and-release-plan.md) | Technical Lead | Product Owner untuk release |
| Delivery | [Sprint 0 Kickoff Pack](delivery/05-sprint-0-kickoff-pack.md) | PM/BA | Product Owner |
| Delivery | [Sprint 0–3 Detailed Execution Backlog](delivery/06-sprint-0-3-detailed-execution-backlog.md) | PM/BA | Product Owner |
| Delivery | [Sprint 2–3 Readiness Audit](delivery/07-sprint-2-3-readiness-audit.md) | PM/BA | PO + TL + QA sesuai area |
| Delivery | [Pre-coding Readiness & Consolidated Blocker Ledger](delivery/08-pre-coding-readiness-and-blocker-ledger.md) | PM/BA | PO + TL + QA sesuai gate |
| Delivery | [Current Work & Role Execution Register](delivery/10-current-work-register.md) | AI Product/BA | AI TL + QA + Peer Reviewer |
| Delivery | [BG-2 Identity Increment Evidence](delivery/11-bg-2-identity-increment-evidence.md) | AI Backend/TL | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Assignment Evidence](delivery/12-bg-2-assignment-evidence.md) | AI Backend/Web/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Effective Master Evidence](delivery/13-bg-2-effective-master-evidence.md) | AI Backend/Web/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Package Purchase Evidence](delivery/14-bg-2-package-purchase-evidence.md) | AI Backend/Web/Flutter/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Package Decision Evidence](delivery/15-bg-2-package-decision-evidence.md) | AI Backend/Web/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Ledger Read Evidence](delivery/16-bg-2-ledger-read-evidence.md) | AI Backend/Web/Flutter/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Session Adjustment Evidence](delivery/17-bg-2-session-adjustment-evidence.md) | AI Backend/Web/Data | AI QA/Security/Peer Reviewer |
| Operations | [Session Adjustment Runbook](operations/session-adjustment-runbook.md) | Ops | PO/TL/QA/Ops |
| Delivery | [BG-2 Instructor Availability Evidence](delivery/18-bg-2-instructor-availability-evidence.md) | AI Backend/Flutter/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Class Slot Lifecycle Evidence](delivery/19-bg-2-class-slot-lifecycle-evidence.md) | AI Backend/Web/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 H-24 Quota Evaluation Evidence](delivery/20-bg-2-quota-evaluation-evidence.md) | AI Backend/Web/Ops/Data | AI QA/Security/Peer Reviewer |
| Delivery | [BG-2 Web-first Booking Evidence](delivery/21-bg-2-booking-evidence.md) | AI Backend/Web/Data | AI QA/Security/Peer Reviewer |
| Product | [PRD & Business Rules](product/01-prd-and-business-rules.md) | PM/BA | Product Owner |
| Product | [Backlog, Acceptance & Traceability](product/02-backlog-and-traceability.md) | PM/BA | Product Owner |
| Product | [MVP Implementation Backlog](product/03-mvp-implementation-backlog.md) | PM/BA | Product Owner |
| Product | [Sprint 2–3 Detailed Story Specification](product/04-sprint-2-3-detailed-story-specification.md) | PM/BA | Product Owner |
| Product | [Sprint 2–3 Traceability & Gate 2 Review Workbook](product/05-sprint-2-3-traceability-and-gate-2-review.md) | PM/BA | Product Owner |
| Product | [Remaining MVP Detailed Story Specification](product/06-remaining-mvp-detailed-story-specification.md) | PM/BA | Product Owner |
| Product | [Remaining MVP Traceability, Readiness & Review](product/07-remaining-mvp-traceability-readiness-and-review.md) | PM/BA | Product Owner |
| Design | [UX/UI Delivery Specification](design/01-ux-ui-delivery-specification.md) | UI/UX Designer | Product Owner |
| Design | [Screen, Flow & Design-System Contract](design/02-screen-flow-and-design-system-contract.md) | UI/UX Designer | Product Owner |
| Design | [Priority Flow Screen-Level Handoff](design/03-priority-flow-screen-handoff.md) | UI/UX Designer | Product Owner |
| Design | [Priority Figma Production & Review Pack](design/04-priority-figma-production-and-review-pack.md) | UI/UX Designer | Product Owner |
| Design | [Remaining MVP Screen-level Handoff Queue](design/05-remaining-mvp-screen-handoff-queue.md) | UI/UX Designer | Product Owner |
| Design | [Remaining MVP Detailed Screen Handoff](design/06-remaining-mvp-detailed-screen-handoff.md) | UI/UX Designer | Product Owner |
| Design | [Frontend Design Baseline — Interim Executable Reference](design/07-frontend-design-baseline.md) | AI Design/Web | Product Owner untuk visual production acceptance |
| Design | [Frontend Page Inventory dan Route Map](design/08-frontend-page-inventory.md) | AI Design/Web | Product Owner untuk scope dan visual production acceptance |
| Design | [ChatGPT Public UI Handoff — Landing dan Studios](design/09-chatgpt-public-ui-handoff.md) | AI Design/Web/QA | Product Owner untuk visual production acceptance |
| Technical | [Solution Architecture](technical/01-solution-architecture.md) | Technical Lead | Technical Lead |
| Technical | [Data, API, Security & Operations](technical/02-data-api-security-operations.md) | Technical Lead | Technical Lead |
| Technical | [Architecture Decision Baseline](technical/03-architecture-decision-baseline.md) | Technical Lead | Technical Lead |
| Technical | [Data Dictionary & ERD](technical/04-data-dictionary-and-erd.md) | Technical Lead | Technical Lead |
| Technical | [API/Event/Security Contract](technical/05-api-event-security-contract.md) | Technical Lead | Technical Lead |
| Technical | [OpenAPI v1](technical/openapi-v1.yaml) | Technical Lead | Technical Lead |
| Technical | [MVP Proposed Contract Manifest](technical/06-sprint-2-3-contract-manifest.md) | Technical Lead | Technical Lead |
| Technical | [Technical Contract Review Workbook](technical/07-technical-contract-review-workbook.md) | Technical Lead | Technical Lead |
| Technical | [Dynamic Role & Permission Reference](technical/07-rbac-role-capability-reference.md) | Technical Lead | PO + TL + Security |
| Delivery | [Dynamic RBAC Implementation & UAT Evidence](delivery/23-dynamic-rbac-evidence.md) | Technical Lead + QA | PO + TL + QA + Ops |
| Delivery | [Identity User Management Implementation & UAT Evidence](delivery/24-identity-user-management-evidence.md) | Technical Lead + QA | PO + TL + QA + Ops |
| Technical | [SMTP Email Delivery Contract](technical/11-smtp-email-delivery.md) | Technical Lead | PO + TL + Ops |
| Product | [Transactional Email Matrix](product/08-transactional-email-matrix.md) | PM/BA | Product Owner |
| Operations | [SMTP Email Runbook](operations/01-smtp-email-runbook.md) | Operations | Technical Lead |
| Operations | [Customer Reschedule Runbook](operations/reschedule-runbook.md) | Operations | Product Owner + Technical Lead |
| Operations | [Dynamic RBAC & Access Recovery Runbook](operations/02-rbac-access-recovery-runbook.md) | Operations | Technical Lead + Security |
| Operations | [Identity Review Runbook](operations/03-identity-review-runbook.md) | Operations | PO + TL + QA + Ops |
| Governance | [CR-SMTP-001](governance/11-cr-smtp-001.md) | Product Owner | PO + TL |
| Template | [Email Template Register](templates/email-template-register.md) | PM/BA | PO + TL |
| Quality | [Test Strategy, UAT & Release](quality/01-test-uat-and-release.md) | QA Engineer | PM/BA + Technical Lead |
| Quality | [Detailed Tests, Data & UAT](quality/02-detailed-tests-data-and-uat.md) | QA Engineer | PM/BA + Technical Lead |
| Quality | [Sprint 2–3 Interface & Test Readiness](quality/03-sprint-2-3-interface-and-test-readiness.md) | QA Engineer | Technical Lead + QA |
| Quality | [Remaining MVP Contract & UX Readiness](quality/04-remaining-mvp-contract-and-ux-readiness.md) | QA Engineer | Technical Lead + QA |
| Migration | [Migration, Pilot & Support](migration-rollout/01-migration-pilot-and-support.md) | PM/BA | Product Owner |
| Migration | [Mapping, Reconciliation & Cutover Workbook](migration-rollout/02-mapping-reconciliation-and-cutover-workbook.md) | PM/BA | Product Owner |
| Template | [PIC Assignment Register](templates/pic-assignment-register.md) | PM/BA | Product Owner |
| Template | [Registers & Change Request](templates/registers-and-change-request.md) | PM/BA | Sesuai jenis perubahan |
| Template | [Gate 1 Signed Review Record](templates/gate-1-signed-review-record.md) | PM/BA | Product Owner |
| Template | [Gate 2 Signed Review Record](templates/gate-2-signed-review-record.md) | PM/BA | Product Owner |
| Template | [Gate 3 Signed Review Record](templates/gate-3-signed-review-record.md) | Designer | Product Owner |
| Template | [Gate 4 Signed Review Record](templates/gate-4-signed-review-record.md) | Technical Lead | Technical Lead |

## Status Dokumen

Gunakan status berikut pada metadata dokumen atau Pull Request:

- `DRAFT`: sedang disusun dan belum menjadi acuan kerja.
- `IN_REVIEW`: menunggu review pihak terkait.
- `APPROVED`: telah disetujui dan menjadi baseline.
- `SUPERSEDED`: digantikan versi baru, tetap disimpan sebagai histori.

Dokumen requirement/technical tetap proposed sampai review per artefak, tetapi AI coding lokal telah diotorisasi melalui BG-0. Readiness cabang, akun layanan, nilai bisnis dan sign-off tetap dibutuhkan sebelum production.

Status gate dan evidence approval otoritatif dicatat pada [Document Register, Baseline & Gates](governance/03-document-register-and-gates.md). Teks `Final untuk Development` pada PDF adalah status dokumen sumber historis dan tidak otomatis membuat artefak repository berstatus `APPROVED`.

## Urutan Pemakaian

1. BG-1 telah PASS; gunakan Current Work Register untuk mempertahankan executable evidence dan CI hijau.
2. Implementasikan foundation dan story Sprint 2–3 dengan configuration-required behavior untuk keputusan produksi yang belum tersedia.
3. Gunakan AI author/reviewer modes dan executable evidence untuk menutup BG-2 per story.
4. Lanjutkan Sprint 4–12 serta integrated synthetic demo BG-3.
5. Sebelum production, lengkapi keputusan bisnis, provider/account, migration/UAT, visual acceptance, restore/security review dan PG-1/Gate 6 sign-off.

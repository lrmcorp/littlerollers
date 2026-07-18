# AI Delivery Operating Model & Coding Authorization

**Status:** ACTIVE WORKING MODEL  
**Effective:** 2026-07-18  
**Direction:** seluruh role delivery dikerjakan oleh AI; tidak ada proses staffing manusia  
**Business authority:** Product Owner/user tetap memberikan nilai dan keputusan bisnis yang tidak dapat ditentukan dari repository

## 1. Operating Model

Role PM/BA, Designer, Technical Lead, Backend, Web, Flutter, QA, Security, Operations, Finance-analysis, Data-analysis, Privacy-analysis, dan peer reviewer adalah **AI work modes**, bukan lowongan, vendor, atau individu. Satu AI dapat berganti mode, tetapi setiap artefak harus mencatat mode pembuat, mode reviewer, evidence, dan hasil validasi agar separation of concerns tetap terlihat.

| AI role mode | Tanggung jawab | Evidence minimum |
|---|---|---|
| AI Product/BA | requirement, AC, traceability, backlog, decision questions | document diff, ID mapping, orphan check |
| AI Designer | IA, text flow, design system, UI implementation/prototype | screen/state mapping, visual/accessibility validation |
| AI Technical Lead | ADR, data/API contract, architecture and integration decisions | parse/schema/compatibility checks and rationale |
| AI Backend/Web/Flutter | source implementation | build, lint/static analysis, unit/integration/UI tests |
| AI QA | independent test derivation and execution | reproducible commands, results and defect records |
| AI Security/Privacy | threat, authorization, sensitive-data and retention analysis | findings with severity and closure evidence |
| AI Operations/Data/Finance | environment adapter, migration, recovery and deterministic calculation analysis | dry-run/reconciliation/test evidence |
| AI Peer Reviewer | independent pass after implementation context is reset and evidence is re-read | review findings; no self-approval by assertion |

Product Owner is not expected to manage AI staffing. Product Owner supplies business facts, accepts visible outcomes, and authorizes production-impacting decisions.

## 2. Authorization Boundary

Coding is authorized now for:

- repository/monorepo scaffold, pinned tooling, CI validation and local synthetic environment;
- provider-agnostic adapters and configuration interfaces;
- database schema/migrations for approved structural invariants;
- generated TypeScript/Dart clients from the proposed OpenAPI;
- auth, RBAC, audit, outbox, idempotency, ledger/reservation foundations;
- stories or portions whose behavior does not require an unresolved production value;
- UI implemented from repository screen/state specifications, with later visual acceptance by Product Owner.

Coding must use feature flags or configuration-required behavior for unresolved `DEC-004–014`. It must fail explicitly when a required production value is absent; no synthetic value becomes a production default.

The following remain blocked until real input exists:

- production provider/account/secret/domain/store provisioning;
- actual price, duration, quota, capacity, fee and projection rate;
- final TTL, check-in/cancellation/recovery/retention/fallback policies;
- production data migration and pilot-branch selection;
- production release and customer-visible activation.

## 3. Build Gates

| Gate | Purpose | Current result | Evidence/condition |
|---|---|---|---|
| BG-0 Documentation | Enough specification to scaffold safely | PASS | 24 stories, 96 AC, UX text handoff, OpenAPI 0.4, QA/migration/release plans validated |
| BG-1 Scaffold | Repository, local environment, clients and CI compile | PASS | local evidence dan hosted jobs `typescript`, `flutter`, `secrets` hijau pada commit `8cd2ce3` |
| BG-2 Story build | Story implemented behind required config/flags | PER STORY | AC tests pass; unresolved production decision cannot be bypassed |
| BG-3 Integrated demo | Local/staging synthetic flows demonstrated | PENDING | E2E, accessibility, security and deterministic finance evidence |
| PG-1 Production readiness | Real configuration, provider, accounts, migration/UAT and PO acceptance | BLOCKED | DEC/CFG evidence, environment, restore/security/UAT and release sign-off |

Legacy Gate 1–5 templates remain useful review checklists, but human staffing, candidate selection, work contacts and vendor independence are not coding blockers. They must not be used to prevent BG-1.

## 4. AI Review and Separation of Duties

- Authoring and review happen as separate passes with explicit role labels.
- Critical auth, authorization, ledger, finance, migration and destructive actions require an independent AI review pass plus executable tests.
- A passing template or percentage is insufficient; commands and outputs are evidence.
- When a question requires a genuine business preference, AI records a controlled placeholder and asks Product Owner; it does not invent the answer.
- Product Owner acceptance is required for visible UX/business behavior and production release, not for every internal implementation step.

## 5. Immediate Coding Sequence

1. BG-1 telah PASS; pertahankan CI hijau dan generated drift sebagai merge boundary.
2. Lanjutkan foundation story BG-2: auth/session interfaces, RBAC/branch context, audit, idempotency, outbox dan configuration registry.
3. Sprint 2 vertical slice: `US-ID-01`, `US-ID-02`, `US-MST-02` using provider adapters and controlled policy placeholders.
4. Sprint 3 vertical slice: master/package/purchase/ledger, with production business values configuration-blocked.
5. Continue Sprint 4–12 according to the implementation plan; close each story through tests and AI review evidence.

The next repository action is BG-2 story refinement/implementation in planned order—not candidate selection or HR administration.

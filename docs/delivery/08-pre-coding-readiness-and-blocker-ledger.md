# Pre-coding Readiness & Consolidated Blocker Ledger

**Status:** DRAFT — factual snapshot 2026-07-18  
**Scope:** 24 MVP stories  
**Coding authorization:** `YES FOR BG-1/LOCAL-SYNTHETIC BUILD`; `NO FOR PRODUCTION` — PG-1 remains `BLOCKED`

> **Snapshot note:** tabel story pada §2 membekukan kondisi pre-BG-1 pada awal 2026-07-18.
> Status eksekusi terkini berada pada [BG-1 Implementation Evidence](09-bg-1-implementation-evidence.md)
> dan [Current Work Register](10-current-work-register.md): seluruh evidence lokal telah PASS,
> sedangkan BG-1 penuh tetap `IN PROGRESS` sampai hosted GitHub Actions run tersedia.

This report measures documentation maturity. The [AI Delivery Operating Model](../governance/10-ai-delivery-and-coding-authorization.md) supersedes human-staffing assumptions: BG-0 has passed and scaffold/local implementation is authorized. Production readiness still requires applicable business decisions, real environment and acceptance evidence.

## 1. Scoring Contract

| Dimension | Weight | Draft-complete evidence | Current scoring rule |
|---|---:|---|---|
| Requirement | 20 | detailed story, unique AC and traceability | 20 when draft exists |
| UX | 15 | text handoff 8 + approved Figma 7 | current maximum 8 because Figma is absent |
| Technical contract | 20 | proposed API/schema/error/event mapping | 20 when proposed mapping exists; approval is separate |
| QA/UAT | 15 | TC/UAT and state/error mapping | 15 when draft mapping exists |
| Migration/release | 10 | impact plus delivery/migration/release plan | 10 when draft evidence exists |
| AI execution/review | 5 | explicit AI author/reviewer modes and evidence separation | current 5 |
| Decisions | 5 | all applicable DEC/CFG approved | 5 only when no open blocking DEC applies |
| Environment | 5 | owned, accessible environment evidence | current 0 |
| Approvals | 5 | exact-version signed gate evidence | current 0 |

Thus a fully documented story with an unresolved decision scores `78%`; one without an unresolved story decision scores `83%`. These are production-readiness indicators; they do not prevent BG-1 or configuration-gated implementation.

## 2. Story Readiness Snapshot

Abbreviations: `D` = detailed draft complete, `P` = proposed/review pending, `B` = blocking/absent, `N/A` = no direct data migration beyond documented impact. Contract references use OpenAPI `0.4.0-draft` checksum `920ad746d2b3acbd45540dae61193a853833b3749f21c466fa02ce7e232e6414`.

| Story | Requirement | UX text / Figma | Contract | Test/UAT | Migration/release | Blocking DEC | Assignee/env | Gates | % | READY / blocker owner / closure evidence |
|---|---|---|---|---|---|---|---|---|---:|---|
| US-ID-01 | D | D / B | P | D | D | DEC-012,014 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / signed DEC, Figma, G2–5 records |
| US-ID-02 | D | D / B | P | D | D | DEC-012 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / signed session/MFA decision and gate evidence |
| US-MST-02 | D | D / B | P | D | D | — | AI / local pending | BG-1 NEXT; PG-1 B | 83 | BUILD YES; PROD NO / PO+TL / Figma, client review, environment, signatures |
| US-MST-01 | D | D / B | P | D | D | DEC-005,006 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+Finance / approved effective configuration plus gates |
| US-PKG-01 | D | D / B | P | D | D | DEC-004,011 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / package config, storage/scan decision and signatures |
| US-PKG-02 | D | D / B | P | D | D | DEC-004,006,011,012 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+Finance+TL / decisions, Figma and signed contract review |
| US-LED-01 | D | D / B | P | D | D | — | AI / local pending | BG-1 NEXT; PG-1 B | 83 | BUILD YES; PROD NO / TL+QA / generated clients, Figma, environment and gates |
| US-LED-02 | D | D / B | P | D | D | DEC-012 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / MFA/SoD review and signed evidence |
| US-CLS-01 | D | D / B | P | D | D | — | AI / local pending | BG-1 NEXT; PG-1 B | 83 | BUILD YES; PROD NO / TL+Designer / Figma, client review, environment, gates |
| US-CLS-02 | D | D / B | P | D | D | DEC-005,006,008 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+Finance+TL / configuration/cancel policy and approvals |
| US-CLS-03 | D | D / B | P | D | D | DEC-005,013 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL+Ops / quota/fallback decisions and job review |
| US-BKG-01 | D | D / B | P | D | D | DEC-005 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / quota/capacity evidence, Figma and concurrency review |
| US-BKG-02 | D | D / B | P | D | D | DEC-008 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO / cancellation/reschedule policy and signed reviews |
| US-ATT-01 | D | D / B | P | D | D | DEC-007 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / check-in boundary, threat/client tests and Figma |
| US-ATT-02 | D | D / B | P | D | D | DEC-007,008 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL / check-in/backfill policy and signed evidence |
| US-ATT-03 | D | D / B | P | D | D | — | AI / local pending | BG-1 NEXT; PG-1 B | 83 | BUILD YES; PROD NO / TL+Finance+QA / atomic completion review and all gates |
| US-NOT-01 | D | D / B | P | D | D | DEC-011,013 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / PO+TL+Ops / provider/fallback decision and contract review |
| US-FIN-01 | D | D / B | P | D | D | DEC-006 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Finance+PO / rate/formula evidence and signed reconciliation |
| US-FIN-02 | D | D / B | P | D | D | DEC-009,011 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Finance+Privacy+TL / evidence/retention/provider decisions |
| US-FIN-03 | D | D / B | P | D | D | DEC-006 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Finance+TL / controls, deterministic result and close review |
| US-FIN-04 | D | D / B | P | D | D | DEC-009,012 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Finance+TL+Privacy / SoD/retention decision and signatures |
| US-AUD-01 | D | D / B | P | D | D | DEC-009,011,012 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Privacy+TL / scope/masking/retention/provider and G4 evidence |
| US-OPS-01 | D | D / B | P | D | D | DEC-011,013 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Ops+TL / environment/provider, recovery test and sign-off |
| US-MIG-01 | D | D / B | P | D | D | DEC-010,011 | AI / local pending | BG-1 NEXT; PG-1 B | 78 | BUILD YES; PROD NO / Data Owner+PO+TL / pilot/source/provider, rehearsal and gates |

## 3. Consolidated Blocker Ledger

| ID | Category | Blocker | Affected scope | Accountable | Due trigger | Closure evidence | Status |
|---|---|---|---|---|---|---|---|
| BLK-INT-001 | Build evidence | Integrate full generated TypeScript/Dart output into consumed workspace packages and prove clean regeneration drift | CTG-012/019, all API consumers | AI TL | Before BG-1 PASS | pinned generator log, clean regeneration diff, Web/Flutter compile review | CLOSED LOCAL — 120 TS dan 127 Dart source match byte-for-byte; consumers compile/test PASS |
| BLK-DEC-001 | Decision/business | DEC-004–014 and production CFG values remain open where recorded | affected stories, G2/G4/G5 | PO; Finance/TL/Privacy/Ops by item | before affected story planning/READY | signed DEC/CFG record with source/effective date | TBD-BLOCKING |
| BLK-AI-001 | Review evidence | AI role modes are available; independent review must be evidenced per critical change | BG-1–3 | AI TL/QA | per PR/story | separate author/reviewer pass and executable checks | OPEN — not a staffing blocker |
| BLK-FIG-001 | Figma | 52 specified screens lack file/node/prototype/version and review | G3, all UI stories | Designer; PO approval | before applicable story READY | exact Figma links plus PM/dev/QA/PO review | TBD-BLOCKING |
| BLK-ENV-001 | Provider/environment/account | Provider decisions, accounts, secrets ownership, dev/staging/UAT/production evidence absent | G4/G5, build/release | TL+Operations | before scaffold/deployment | approved DEC-011, access review, environment smoke evidence | TBD-BLOCKING |
| BLK-APR-001 | Approval evidence | APR-001–005 and exact-version signed review records remain open | G1–5, all stories | PO/TL/QA by gate | after comments/blockers close | immutable signed records linked to commit/checksum/Figma version | OPEN |

No autonomous documentation or staffing gap prevents coding. Remaining BG-1 blocker is hosted CI execution evidence; BG-2 must not start before its disposition.

## 4. Next Action by Role

| Role | Immediate action | Required output |
|---|---|---|
| Product Owner | Supply genuine business values/policies when requested; accept visible behavior and production release | DEC/CFG and acceptance evidence |
| AI Product/BA | Maintain 24-story traceability and controlled business questions during implementation | updated AC/decision impact and review evidence |
| AI Designer | Implement/iterate UI from 52 screen specifications; prepare visual evidence for PO acceptance | responsive/accessibility screenshots and interaction tests |
| AI Technical Lead | Publish baseline repository dan capture hosted CI run | commit/run links dan final BG-1 disposition |
| AI Web/Flutter | Implement generated-client consumers and UI states | build/component/widget/E2E evidence |
| AI QA/Security | Independently derive and run tests/reviews | reproducible results and closed critical findings |
| Finance | Approve package/rate/fee/formula/close/correction configuration and controls | signed CFG/DEC source evidence and reconciliation expectations |
| Data Owner | Confirm source inventory, mapping, stable keys and control totals | versioned source/mapping evidence and migration rehearsal inputs |
| Operations | Own provider/environment/accounts, backup/restore, monitoring and job recovery | environment/access register, smoke/restore/recovery evidence |
| Privacy | Approve masking, retention, export/download and support boundaries | signed privacy/security disposition for DEC-009/011/014 |
| Peer reviewer | Independently challenge security, operability, recovery and single-point-of-failure | signed independent review with blocking findings closed |

## 5. Authorization Boundary

- Percentage is diagnostic only; it never overrides a gate.
- BG-0 is `PASS`; BG-1 scaffold and local/synthetic coding are authorized.
- Legacy Gate 1–5 and APR-001–005 remain open as production/completeness evidence, not HR or coding blockers.
- All 24 stories may enter implementation in planned order; affected production activation remains configuration-gated.
- No production value, TTL, provider, policy, person, environment or approval has been fabricated.
- The next valid work is hosted CI evidence and final BG-1 validation.

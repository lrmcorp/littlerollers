# Screen, Flow, State & Design-System Contract

**Status:** DRAFT  
**Owner:** UI/UX Designer  
**Approver:** Product Owner  
**Visual source of truth:** Daily Dose-owned Figma file (`TBD-BLOCKING`)

Screen-level proposed handoff for UX-01/02/03/09/11 is defined in [Priority Flow Screen-Level Handoff](03-priority-flow-screen-handoff.md). It remains non-authoritative until actual Figma nodes and approvals exist.

## 1. Navigation and Screen Inventory

| Screen ID | Channel/role | Screen | Required context/actions | Story |
|---|---|---|---|---|
| SCR-C-01 | Flutter Customer | Sign-in/recovery | Google, OTP, recovery, consent/error | US-ID-01 |
| SCR-C-02 | Flutter Customer | Home | Upcoming class, available/reserved/expiry, CTA | US-LED-01 |
| SCR-C-03 | Flutter Customer | Timetable/slot | Branch/type/date, capacity, quota status, booking | US-BKG-01 |
| SCR-C-04 | Flutter Customer | My bookings/detail | Check-in, reschedule, cancellation state/history | US-BKG-02,ATT-02 |
| SCR-C-05 | Flutter Customer | Packages/purchase | Active/expired, proof upload, purchase status | US-PKG-01 |
| SCR-C-06 | Flutter Customer | Notifications/profile | Occurrences, contact verification, security | US-NOT-01,ID-01 |
| SCR-I-01 | Flutter Instructor | Sign-in/home | Next assignment, branch, check-in readiness | US-ID-02,ATT-01 |
| SCR-I-02 | Flutter Instructor | Availability | Calendar/list, conflict feedback | US-CLS-01 |
| SCR-I-03 | Flutter Instructor | Assignment detail/QR | Slot/type/branch, token readiness/result | US-ATT-01 |
| SCR-W-01 | Web Internal | Sign-in/MFA/dashboard | Role/branch context, pending work, alerts | US-ID-02 |
| SCR-W-02 | Web Internal | Timetable/class detail | Create/assign/publish/cancel/complete | US-CLS-02,03,ATT-03 |
| SCR-W-03 | Web Internal | Customers/packages/purchase | Proof review, approve/reject, ledger | US-PKG-01,02,LED-01 |
| SCR-W-04 | Web Internal | Booking/reschedule/check-in | Assisted action, approval, backfill | US-BKG-01,02,ATT-02 |
| SCR-W-05 | Web Internal | Adjustments | Request/approve/reject, separation warning | US-LED-02 |
| SCR-W-06 | Web Internal | Reports/close/correction | Filters, totals, reconciliation, lock | US-FIN-01..04 |
| SCR-W-07 | Web Internal | Master/assignments/users | Effective date, branch/role/MFA state | US-MST-01,02,ID-02 |
| SCR-W-08 | Web Internal | Audit/operations | Scoped search/export, queue/failure health | US-AUD-01,OPS-01 |

Internal navigation is permission-derived from backend `/me/capabilities`; hiding navigation is usability only, never authorization. Active branch is persistent and visible in header, page title, confirmation, export, and mutation summary. Cross-branch roles must explicitly select `All branches` only for read/report actions that permit it; commands always target one branch.

## 2. Universal State Matrix

Every Figma flow must contain applicable states below. Missing applicable state blocks G3.

| State | Required behavior |
|---|---|
| Initial/loading | Skeleton or progress with stable layout; prevent duplicate command |
| Empty | Explain why empty and permitted next action |
| Validation | Field-level Indonesian message, focus/announcement, preserve safe input |
| Business rejection | Map stable API error code to action-oriented copy |
| Unauthorized/wrong branch | No sensitive data; route back or branch-switch action if permitted |
| Offline/timeout | Explain unconfirmed state; retry uses same idempotency key |
| Duplicate/replay | Show existing successful result where safe, never imply second mutation |
| External provider failure | Pending/failed status and in-app fallback; no false “delivered” |
| Expired token/link | No action performed; re-auth/reissue path |
| Destructive/financial confirmation | Branch, object, amount/period, consequence, reason and MFA where required |
| Success | Result, next action, reference/status; not toast-only for critical command |
| Locked/history | Read-only state, lock metadata, correction path when authorized |

## 3. Flow Specifications

| Flow | Happy path | Critical alternatives and states | Accessibility/confirmation | Figma node |
|---|---|---|---|---|
| UX-01 Login/recovery | Provider/OTP → verify → session → role home | expired/replay/rate limit, identity conflict, inactive, recovery escalation, offline | OTP labels/countdown announced; generic security errors | TBD-BLOCKING |
| UX-02 Purchase | Select package → upload → pending → review → approved/rejected | unsafe/oversize proof, upload retry, package inactive, duplicate approval | File alternative/status; confirmation shows branch/package/price/duration | TBD-BLOCKING |
| UX-03 Booking | Filter timetable → slot → package → confirm → upcoming | cutoff, full, low balance, mismatch, concurrent loss, retry result | Calendar has list fallback; announce capacity/status | TBD-BLOCKING |
| UX-04 Reschedule | Request → target → approval → updated booking | ≥H-24 versus <H-24 explanation, target becomes invalid, rejected, adjustment path | Consequence explicitly stated before submit | TBD-BLOCKING |
| UX-05 Customer check-in | Authenticated link → slot review → confirm → attended | too early/late, wrong user/slot, replay, offline, Admin backfill path | Large target; clear time/branch/class; no QR required | TBD-BLOCKING |
| UX-06 Instructor availability/QR | Submit availability → assignment → QR check-in | overlap, wrong branch, unassigned, QR inactive/expired/replay | Camera-free signed display/scan recovery instructions | TBD-BLOCKING |
| UX-07 Class lifecycle | Create → assign → publish → H-24 → confirm → complete | validation, auto/manual cancel, retry scheduler/completion, locked state | State label not color-only; cancel/complete confirmation | TBD-BLOCKING |
| UX-08 Admin backfill | Find booking → mark hadir → reason → success | wrong branch, no booking, >H+2, duplicate, locked period | Keyboard-first search; exact customer/slot confirmation | TBD-BLOCKING |
| UX-09 Adjustment | Admin request → Manager review → approve → ledger result | self-approval, expired request, duplicate, reject, locked implications | Delta sign and resulting balance announced | TBD-BLOCKING |
| UX-10 Reports/close | Filter → reconcile → close review → MFA → locked snapshot | mismatch, stale calculation, concurrent close, correction in open period | Table alternative for chart; currency alignment; lock consequence | TBD-BLOCKING |
| UX-11 Master/assignment | Select entity → effective change/assignment → confirm | overlap, deactivation with dependency, wrong scope, stale edit | Before/after and effective date in confirmation | TBD-BLOCKING |

## 4. Design-System Contract

### Tokens

- Semantic tokens only: `color.surface.*`, `color.text.*`, `color.action.*`, `color.status.{info,success,warning,danger}`, `space.1..n`, `radius.*`, `elevation.*`, `type.*`, `motion.*`.
- Figma tokens map one-to-one to CSS variables/Tailwind theme and Flutter `ThemeExtension`; screen-local raw color/spacing is prohibited.
- Light theme is MVP requirement. Dark theme is out of scope unless approved by Change Request.
- Contrast follows WCAG 2.2 AA; focus indicator remains visible on all interactive components.

### Required components

Buttons, text/select/date-time inputs, uploader with scan status, data table, cards, dialogs/drawers, tabs, filter, pagination, status badge, timetable slot/list, financial summary, approval card, audit timeline, notification item, inline validation, banner, empty/skeleton/retry, destructive/financial confirmation. Each component documents variants, states, keyboard behavior, semantics, responsive behavior, and web/Flutter mapping.

### Content and formatting

- UI copy Bahasa Indonesia; API enum never shown raw.
- Rupiah uses `Rp` and Indonesian thousands separator; backend remains integer Rupiah.
- Local date/time includes branch timezone when ambiguity exists; backend timestamp remains UTC ISO-8601.
- Error copy contains what happened and next safe action; correlation ID may be exposed as support reference, never internal stack/token.
- Status and balance always distinguish ledger total, reserved, available, expiry and locked state.

## 5. Responsive and Accessibility Acceptance

- Web: 1280 desktop, 768 tablet, 360 minimum light-task viewport; finance-heavy tables may horizontally scroll with sticky context and accessible column labels.
- Flutter: supported device matrix, safe area, dynamic text, keyboard visibility, portrait baseline; no critical value clipped at 200% text scaling.
- All actions keyboard-operable on web; logical focus order; async success/error announced; touch target meets platform guidance.
- Charts have table/text alternatives; timetable has list alternative; status never relies only on color; token/check-in flow has recovery path.

## 6. Figma Handoff Register

| Flow | Node URL/version | Owner | PM review | Dev review | QA/a11y review | PO approval | Status |
|---|---|---|---|---|---|---|---|
| UX-01 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-02 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-03 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-04 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-05 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-06 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-07 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-08 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-09 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-10 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |
| UX-11 | TBD-BLOCKING | Designer TBD-BLOCKING | TBD | TBD | TBD | TBD | BLOCKED |

Designer splits the register into one row per flow when nodes exist. A UI story is `READY` only when its row is APPROVED and includes all screen IDs, state matrix, component/token references, copy, responsive frames, API dependency, permission and acceptance links.

# Priority Flow Screen-Level Handoff — UX-01/02/03/09/11

**Status:** DRAFT / REVIEW-READY SPECIFICATION  
**Owner:** Designer  
**Business approver:** Product Owner  
**Figma file/nodes:** TBD-BLOCKING  
**Rule:** This text handoff does not make Gate 3 PASS

## 1. Screen Contract

Each screen lists actor/permission, entry, fields/content, primary/secondary action, API operation, full state behavior, copy intent, responsive/accessibility, analytics-safe event, tests and Figma placeholder. API error messages are mapped to Indonesian action-oriented copy; enum/raw provider error is never displayed.

## 2. Screen Inventory and Handoff

| Screen ID / flow | Actor and entry | Fields/content and actions | API operation | States/error recovery | Responsive/a11y/copy | Safe event / test | Figma |
|---|---|---|---|---|---|---|---|
| SCR-UX01-01 / UX-01 | Customer; unauthenticated app entry | Google CTA, WhatsApp OTP CTA, privacy/help link | `authenticateGoogle`, `requestOtp` | loading; offline retry; generic provider/rate error; no account enumeration | One logical heading; large targets; focus/reader labels; copy “Masuk untuk melanjutkan” | `auth_method_selected` without identifier / TC-AUTH-S23-001/002 | TBD-BLOCKING |
| SCR-UX01-02 / UX-01 | Customer; OTP request accepted | Masked destination, code input, resend timer, change method | `verifyOtp`, `requestOtp` | invalid, expired, replay, rate/attempt limit; preserve only safe request reference | Numeric input semantics; timer announced without noisy updates; copy never confirms account existence | `otp_result` code category only / TC-AUTH-S23-002 | TBD-BLOCKING |
| SCR-UX01-03 / UX-01 | Customer/internal; additional assurance required | Challenge method hint, proof field/action, cancel | `createMfaChallenge`, `verifyMfaChallenge` | expired/used challenge, wrong proof, rate limit, offline; restart challenge | Focus error summary; method/provider neutral copy | `mfa_result` purpose/result / TC-AUTH-S23-005 | TBD-BLOCKING |
| SCR-UX01-04 / UX-01 | User; cannot access verified identity | Identifier/request channel, submit, support explanation | `requestAccountRecovery` | always generic accepted; validation/rate limit; safe support escalation | Explain no instant account link; hide/mask identifier in confirmation | `recovery_requested` channel only / TC-AUTH-S23-003 | TBD-BLOCKING |
| SCR-UX01-05 / UX-01 | User; valid recovery reference or support handoff | Verification proof boundary, new verified identity where approved, confirm | `verifyAccountRecovery`, `linkVerifiedIdentity` | identity conflict, expired recovery, forbidden proof, duplicate/retry result; manual support path | Consequence: sessions revoked and identity changed; sensitive fields masked | `recovery_result` category / TC-AUTH-S23-003/006 | TBD-BLOCKING |
| SCR-UX01-06 / UX-01 | Any user; inactive/conflicting/session expired outcome | Status, safe explanation, sign-in again/support CTA | `getMe`, `refreshSession`, `logout`, `revokeAllSessions` | inactive, revoked, refresh reuse, unauthorized; no resource detail | Persistent outcome page, not toast-only; reader announces session state | `session_ended` reason category / TC-AUTH-S23-006/008 | TBD-BLOCKING |
| SCR-UX02-01 / UX-02 | Customer/Admin; authenticated and branch-scoped | Package cards/list: branch, class type, sessions, duration, price; select | `listPackages` | loading/empty/offline; package inactive; config missing blocks continue | Currency/date semantics; dynamic text; list usable at 200%; branch prominent | `package_selected` package reference only / TC-PKG-S23-006 | TBD-BLOCKING |
| SCR-UX02-02 / UX-02 | Customer/Admin; package selected | Purchase summary, upload file, allowed type/size guidance, replace/remove before submit | `createPaymentProofUpload`, `finalizePaymentProofUpload`, `getPaymentProofStatus` | upload progress/retry; PENDING scan; CLEAN; mismatch/oversize/infected/error; signed URL never shown | Uploader keyboard/screen-reader state; consequences/price explicit | `proof_upload_result` status/type category / TC-PKG-S23-001/002 | TBD-BLOCKING |
| SCR-UX02-03 / UX-02 | Customer/Admin; CLEAN proof and active package | Branch/package/price/session/duration/proof summary; submit/cancel | `submitPurchase` | stale package, proof not clean, duplicate/retry result, provider unavailable; same intent reuses key | Confirmation heading and full commercial summary; Admin-assisted source visible | `purchase_submit_result` category / TC-PKG-S23-003/006 | TBD-BLOCKING |
| SCR-UX02-04 / UX-02 | Customer/Admin; purchase created | Pending/rejected/approved status, reason where safe, balance/expiry after approval, replace proof if eligible | `listPurchases`, `replacePurchasePaymentProof` | loading, rejected, replacement scan, approved, idempotent existing result | Status not color-only; rejected reason next action; approved result persistent | `purchase_status_viewed` status / TC-PKG-S23-005 | TBD-BLOCKING |
| SCR-UX02-05 / UX-02 | Manager/Super Owner; permission/branch/MFA satisfied | Queue/detail, private CLEAN proof preview action, commercial data, approve/reject | `listPurchases`, `authorizePaymentProofDownload`, `approvePurchase`, `rejectPurchase` | wrong branch hidden; proof not CLEAN; config missing; state conflict; duplicate approval; MFA required | Keyboard queue; proof alt/secure expiry; confirmation branch/price/sessions/expiry; reject reason required | `purchase_decision_result` decision/category / TC-PKG-S23-004/005/007 | TBD-BLOCKING |
| SCR-UX03-01 / UX-03 | Customer; authenticated | Branch/class/date filters, calendar/list toggle, slot status/capacity | `listClassSlots` | loading/empty/offline; no eligible package; timezone explicit | List alternative mandatory; filter labels; status not color-only | `timetable_filtered` non-PII dimensions / TC-BOOK-* | TBD-BLOCKING |
| SCR-UX03-02 / UX-03 | Customer; slot selected | Slot detail, capacity/cutoff, eligible package balances, select package | `listClassSlots`, `listCustomerPackages` | full, H-2 passed, branch/class mismatch, expired/insufficient session | Announce capacity/balance changes; branch/timezone visible | `booking_package_selected` references / TC-BOOK-* | TBD-BLOCKING |
| SCR-UX03-03 / UX-03 | Customer/Admin-assisted; valid slot/package | Review slot/package, reserved/available consequence, source, confirm | `createBooking` | concurrent seat/session loss; idempotent existing result; timeout/offline; no partial success | Confirmation consequence; button disabled only with explanation; support correlation ref optional | `booking_result` category / TC-BOOK-S23 future mapping | TBD-BLOCKING |
| SCR-UX09-01 / UX-09 | Admin; customer package visible and branch-scoped | Current totals, signed adjustment quantity, reason, request | `requestSessionAdjustment` | validation, package invalid, duplicate pending, wrong branch, timeout/retry | Plus/minus verbal label and projected balance; reason required | `adjustment_requested` sign/category / TC-LED-S23-004/005 | TBD-BLOCKING |
| SCR-UX09-02 / UX-09 | Authenticated Manager/Super Owner; decision capability and branch permission | Customer/package, requestor, reason, delta, before/current/projected balance, approve/reject | `listSessionAdjustments`, `decideSessionAdjustment` | self-approval forbidden; stale/already decided; duplicate result; package state conflict | Explicit SoD copy; approve/reject confirmations; resulting balance announced | `adjustment_decision_result` category / TC-LED-S23-004/005 | TBD-BLOCKING |
| SCR-UX09-03 / UX-09 | Authorized role; decision complete | Decision, actor/time, ledger reference, final balance; return/view history | `getPackageLedger` | result fetch retry; hidden cross-branch; immutable history | Persistent reference/status; table/list semantics | `adjustment_result_viewed` status / TC-LED-S23-005/006 | TBD-BLOCKING |
| SCR-UX11-01 / UX-11 | Super Owner/admin-security role; MFA | User list/invite: verified email, roles, branch assignment; invite/deactivate | `listUsers`, `inviteUser`, `deactivateUser` | duplicate invite, invalid role/branch, MFA required, inactive/deactivate confirmation | Role/branch summary; destructive consequence and active-session impact | `user_admin_result` action/category / TC-AUTH-S23-004/006/007 | TBD-BLOCKING |
| SCR-UX11-02 / UX-11 | Super Owner; MFA | Assignment list/create: user, type, branch, effective dates, reason; end assignment | `listAssignments`, `createAssignment`, `endAssignment` | overlap, stale version, dependency warning, wrong scope, exact boundary | Before/after and effective timezone/date; reason required; keyboard table | `assignment_result` action/category / TC-MST-S23-001/002 | TBD-BLOCKING |
| SCR-UX11-03 / UX-11 | Super Owner; MFA | Branch/class master list/create/deactivate where allowed | `listBranches`, `createBranch`, `listClassTypes` | duplicate code, invalid timezone, dependency prevents deactivation, stale result | Code/name/timezone labels; confirmation lists downstream impact | `master_result` kind/action/category / TC-MST-* | TBD-BLOCKING |
| SCR-UX11-04 / UX-11 | Super Owner/Finance as permitted; MFA | Instructor fee form: instructor/branch/class/fee/effective period/reason | `listInstructorFees`, `createInstructorFee` | overlap, missing key, invalid amount/date, unauthorized | Rupiah integer formatting; before/after/effective period confirmation | `effective_setting_result` kind/category / TC-MST-S23-003/005 | TBD-BLOCKING |
| SCR-UX11-05 / UX-11 | Super Owner; MFA | Projection rate form: branch/class/rate/effective period/reason | `listProjectionRates`, `createProjectionRate` | overlap/config missing/invalid/unauthorized | Rate unit explicit “per sold session”; historical non-retroactive copy | same safe event / TC-MST-S23-003/005 | TBD-BLOCKING |
| SCR-UX11-06 / UX-11 | Super Owner; MFA | Quota/capacity: branch/class/min/default/effective period/reason | `listQuotaCapacitySettings`, `createQuotaCapacitySetting` | capacity<quota, overlap, invalid date, stale/unauthorized | Explain slot snapshot and H-24 effect; numeric labels/constraints | same safe event / TC-MST-S23-003/004 | TBD-BLOCKING |

## 3. Text Wireflows

```text
UX-01
Entry -> Choose Google or OTP -> Provider/OTP verification
  -> MFA when required -> Authenticated role home
  -> Recovery request -> Generic accepted -> Verified/manual recovery -> Sessions revoked -> Sign in
  -> Inactive/conflict/expired -> Safe outcome -> Re-auth or support

UX-02 Customer/Admin
Packages -> Package detail -> Upload -> Finalize/scan
  -> CLEAN -> Review purchase -> Submit -> Pending
  -> Approved -> Package balance/expiry
  -> Rejected -> Reason/replace proof or choose another package

UX-02 Manager/Super Owner
Purchase queue -> Scoped detail -> Authorize CLEAN proof view
  -> Reject + reason -> Rejected
  -> Approve confirmation/MFA -> Atomic approval result -> CustomerPackage + PURCHASE + notification occurrence

UX-03
Timetable filter/calendar-or-list -> Slot -> Eligible package -> Confirmation
  -> Success/existing retry result -> Upcoming booking
  -> Full/cutoff/session loss -> Refresh alternatives without partial booking

UX-09
Admin package detail -> Adjustment request + reason -> Pending
  -> Manager/Super Owner review
    -> self-approval forbidden
    -> reject -> Rejected
    -> approve -> Posted ledger -> Final balance/history

UX-11
Internal dashboard -> User/MFA | Assignment | Branch/Class | Fee | Projection | Quota
  -> Select/create/effective change -> Review before/after/consequence -> MFA -> Result/audit
```

## 4. State-to-Error and Recovery Mapping

| UI state | Error/code category | User recovery | Required test |
|---|---|---|---|
| Session required/expired | AUTHENTICATION_REQUIRED | Sign in; preserve only non-sensitive destination | TC-AUTH-S23-006 |
| Additional assurance | MFA_REQUIRED | Complete challenge, cancel safely | TC-AUTH-S23-005 |
| Identity conflict | IDENTITY_CONFLICT proposed | No automatic link; recovery/support | TC-AUTH-S23-003 |
| OTP/MFA limited | RATE_LIMITED / TOKEN_EXPIRED_OR_USED | Wait Retry-After or restart; no account disclosure | TC-AUTH-S23-002/005 |
| Wrong branch/role | FORBIDDEN/RESOURCE_NOT_FOUND | Return/switch branch only if permitted | TC-AUTH-S23-007 |
| Assignment overlap | EFFECTIVE_PERIOD_OVERLAP proposed | Adjust date/key; show conflicting safe context | TC-MST-S23-001/003 |
| Configuration missing | CONFIGURATION_MISSING | Operator resolves approved config; no fallback | TC-MST-S23-004 |
| Proof not reviewable | PAYMENT_PROOF_NOT_CLEAN proposed | Wait, replace, or contact support | TC-PKG-S23-001/002 |
| Purchase state changed | STATE_TRANSITION_INVALID | Refresh current status | TC-PKG-S23-004/005 |
| Duplicate intent changed | IDEMPOTENCY_KEY_REUSED | Start a new explicit intent | TC-PKG-S23-003 |
| Self approval | SEPARATION_OF_DUTIES_VIOLATION proposed | Different authorized approver | TC-LED-S23-004 |
| Ledger/invariant problem | LEDGER_INVARIANT_VIOLATION proposed | Stop action and contact operations; no misleading balance | TC-LED-S23-002/003 |

## 5. Cross-Screen Acceptance

- Keyboard order and visible focus on Web; semantic heading/labels/error summary; async changes announced.
- Flutter supports dynamic text to 200%, safe area and keyboard; critical numbers/status never clipped.
- Offline/timeout never implies command failure or success without server result; retry retains same idempotency key for same intent.
- Duplicate/replay shows existing safe result rather than creating a second action.
- Branch, role, timezone and financial/session consequence remain visible in relevant confirmation.
- Phone/email/proof URL/token are masked or absent from analytics; events use stable reference/category only.
- Destructive/financial results are persistent pages/cards, not toast-only.

## 6. Figma Handoff Register

| Flow | Required screen IDs | Node URL/version | Owner | PM review | Dev review | QA/a11y | PO approval | Status |
|---|---|---|---|---|---|---|---|---|
| UX-01 | SCR-UX01-01..06 | TBD-BLOCKING | Designer TBD | TBD | TBD | TBD | TBD | BLOCKED |
| UX-02 | SCR-UX02-01..05 | TBD-BLOCKING | Designer TBD | TBD | TBD | TBD | TBD | BLOCKED |
| UX-03 | SCR-UX03-01..03 | TBD-BLOCKING | Designer TBD | TBD | TBD | TBD | TBD | BLOCKED |
| UX-09 | SCR-UX09-01..03 | TBD-BLOCKING | Designer TBD | TBD | TBD | TBD | TBD | BLOCKED |
| UX-11 | SCR-UX11-01..06 | TBD-BLOCKING | Designer TBD | TBD | TBD | TBD | TBD | BLOCKED |

Gate 3 remains BLOCKED until each applicable row has actual Figma nodes, reviews and Product Owner approval.

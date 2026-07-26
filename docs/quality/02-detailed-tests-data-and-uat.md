# Detailed Test Cases, Deterministic Data & UAT

**Status:** DRAFT  
**Owner:** QA Engineer  
**Reviewers:** PM/BA, Technical Lead

Detailed interface mapping, contract gaps, and executable test packs for Sprint 2–3 are maintained in [Sprint 2–3 Interface & Test Readiness](03-sprint-2-3-interface-and-test-readiness.md).

## 1. Test Case Contract

Each executable case records ID, requirement/story/AC, risk, layer, precondition, immutable dataset version, steps, expected API/UI/database/event/audit result, cleanup, environment/build/commit, executor/time, evidence and defect. Production PII, token, OTP and secrets are prohibited.

## 2. Deterministic Dataset DD-QA-001

Timezone all branches `Asia/Jakarta`; test clock is frozen per case.

| Fixture | Values |
|---|---|
| Branches | B-JKT, B-SBY; Owner A assigned only B-JKT |
| Class types | GROUP, SEMI, PRIVATE |
| Package P-GRP-10 | B-JKT, GROUP, 10 sessions, 30 days, Rp1.000.000, active 2026-07-01 |
| Projection rate | B-JKT/GROUP Rp40.000 per sold session effective 2026-07-01 |
| Instructor fee | Instructor I/B-JKT/GROUP Rp100.000 per matched hour effective 2026-07-01 |
| Quota/capacity | B-JKT/GROUP minimum 2, capacity 3 effective 2026-07-01 |
| Customer package CP-A | activated 2026-07-01, expires 2026-07-31 23:59:59 branch time, PURCHASE +10 |
| Customer package CP-B | PURCHASE +1, one concurrency test candidate |
| Slot S-1 | B-JKT GROUP, start 2026-07-20 10:00, capacity 3, quota 2 |
| Slot S-2 | B-JKT GROUP, start 2026-07-21 10:00, capacity 1, quota 1 |
| Period | B-JKT 2026-07 OPEN |

Expected controls:

- CP-A with 2 active reservations: ledger balance 10, reserved 2, available 8.
- Approval of one P-GRP-10: revenue Rp1.000.000, projection Rp400.000.
- Two matched instructor classes: realtime instructor cost Rp200.000.
- OtherCost Rp150.000: profit formula uses revenue − projection − other = Rp450.000. Realtime Rp200.000 is snapshotted separately and not deducted again.
- Completion with two attended bookings: two unique ATTEND `-1`; consumed reservations 2; ledger balance 8; reserved 0; available 8.

## 3. Detailed Critical Cases

| ID | Preconditions/action | Expected result/evidence |
|---|---|---|
| TC-AUTH-001 | Unauthenticated call each protected endpoint group | 401 generic; no body data; security metric/correlation ID |
| TC-AUTH-002 | Owner A list/detail/export B-SBY through filter and guessed ID | Empty/404/403 consistently; no count/name/timing leak; scoped SQL evidence |
| TC-AUTH-003 | Sensitive command without permission | 403 FORBIDDEN; no write/audit business event |
| TC-AUTH-004 | OTP expired, replayed, wrong until limit, then valid | All invalid; rate/attempt state; no OTP/phone in logs |
| TC-AUTH-005 | Deactivate active internal user then refresh/use session | Session revoked/rejected across API; audit user deactivation |
| TC-PKG-001 | Upload disguised executable and public URL attempt | Scan rejects; object private; no reviewer download URL |
| TC-PKG-002 | Approve pending purchase twice with same key/request | Same result; one CP, PURCHASE, audit/outbox occurrence |
| TC-PKG-003 | Approve concurrently with two keys | One transition succeeds; other state conflict; no duplicates |
| TC-LED-001 | CP-B balance 1; two packages/slots booking commands concurrently | Only one reservation succeeds; available never negative |
| TC-LED-002 | Approver equals adjustment requestor | 403; no ledger; security audit records denied SoD event safely |
| TC-CLS-001 | Overlapping instructor slot across B-JKT/B-SBY | Conflict; no second assignment |
| TC-CLASS-001 | Run quota job twice concurrently below quota | One AUTO_CANCELLED; reservation released once; occurrence unique |
| TC-BOOK-001 | Two customers request last seat S-2 concurrently | One booking/seat; other CLASS_CAPACITY_FULL |
| TC-BOOK-002 | Retry same booking key with changed slot/package | IDEMPOTENCY_KEY_REUSED; original result unchanged |
| TC-BOOK-003 | Request exactly before and at H-2 using frozen clock | Before succeeds; at cutoff rejected per inclusive rule |
| TC-RES-001 | Approve ≥H-24 reschedule while target becomes full | Entire transaction fails; old booking/reservation remains active |
| TC-RES-002 | Request <H-24 | No automatic entitlement return; adjustment path displayed/available |
| TC-ATT-001 | Valid instructor token then replay/wrong slot/instructor | First one matched/hour; subsequent attempts no duplicate |
| TC-ATT-002 | Customer token before/within/after approved window | Boundary behavior matches DEC-007; one check-in max |
| TC-ATT-003 | Admin backfill just before/at/after H+2 | Before allowed; at/after matches documented inclusive rule; reason/audit required |
| TC-ATT-004 | Complete S-1 twice with two attended, one no-show | Two ATTEND and consumed reservations; no no-show debit; retry identical |
| TC-NOTIF-001 | Duplicate outbox delivery, provider timeout, duplicate webhooks | One occurrence, ordered/idempotent attempts/status, bounded retry |
| TC-NOTIF-002 | Terminal provider failure then manual retry | Alert/dead-letter + in-app fallback; manual reason/audit; same occurrence |
| TC-FIN-001 | Change rate effective mid-month; transact before/after | Applied values use eligible versions; historical snapshots unchanged |
| TC-FIN-002 | Close DD-QA-001 twice concurrently | One immutable close with expected totals/control hash; other same/conflict |
| TC-FIN-003 | Mutate locked period through every UI/API route | PERIOD_LOCKED; no write; correction is only route |
| TC-FIN-004 | Request/approve correction by same user or old-period direct edit | Denied; valid two-person correction posts current period only |
| TC-AUD-001 | Execute all sensitive commands | Required safe fields present; no OTP/token/proof URL; update/delete unavailable |
| TC-OPS-001 | Stop worker, age quota job, restore | Alert fires with runbook; catch-up is idempotent; telemetry confirms recovery |
| TC-MIG-001 | Import identical batch twice with valid + invalid rows | No duplicate entities/opening ledger; same reject reasons/control totals |
| TC-MIG-002 | Session total source/target differs by 1 | Reconciliation FAIL; cutover blocked regardless of row count match |
| TC-REC-001 | Restore point-in-time backup to isolated environment | RPO≤1h/RTO≤4h evidence; integrity and smoke pass |

Boundary inclusivity for DEC-007, H-2 and H+2 must be represented explicitly in approved BR/API copy; test clock cannot use wall-clock sleeps.

## 4. Non-functional Matrix

| Area | Scenario/target | Exit evidence |
|---|---|---|
| Performance | Pilot workload profile approved; p95 read <500 ms, command <1s excluding provider | Versioned script, load shape, latency/errors, DB/queue metrics |
| Availability | 99.5% monthly target, dependency degradation | SLI query/dashboard and error budget calculation |
| Accessibility | WCAG 2.2 AA applicable critical flows | Automated scan + keyboard + screen-reader sample + contrast evidence |
| Browser | Latest two stable versions Chrome, Edge, Safari, Firefox | Critical web matrix result |
| Mobile | Current supported Android/iOS baseline plus one older supported OS and representative low/standard devices | Flutter integration/device result; crash-free report |
| Security | TC-SEC-001..048 threat-model verification | Scan report, manual authorization/file/token tests, accepted findings |
| Recovery | DB PITR, object version recovery, queue replay, missed scheduler | Timed rehearsal and integrity reconciliation |

Exact OS/device versions are selected no later than UAT entry based on customer/instructor analytics or pilot inventory and recorded as `DEC-QA-001`; absence blocks G5.

## 5. UAT Scripts

| UAT | Representative | End-to-end script | Pass criteria |
|---|---|---|---|
| UAT-AUTH-01 | Customer/Internal roles | Login/recovery; permission and branch navigation with denied access | Correct access and no data leak |
| UAT-PKG-01 | Customer, Manager | Purchase upload → review → approve/reject → balance/expiry | Commercial values and evidence correct |
| UAT-CLASS-01 | Instructor, Admin | Availability → assignment → publish → H-24 result | Conflict/quota/status clear |
| UAT-BOOK-01 | Customer, Admin | Timetable → booking → reschedule paths | Session/capacity/cutoff correct |
| UAT-ATT-01 | Instructor, Customer, Admin | QR/link → backfill → completion | Hour/attendance/ledger correct |
| UAT-FIN-01 | Owner, Finance, Super Owner | Reports → cost → reconcile → close → correction | DD-QA-001 totals; lock/SoD correct |
| UAT-NOTIF-01 | All recipients/support | Transaction notification and simulated failure/fallback | No duplicate; status/support action clear |
| UAT-MIG-01 | Data Owner, Finance | Trial import → exception → rerun → reconcile | Zero material mismatch and signed controls |

Each script includes screenshots/copy from approved Figma, role credentials in secure test vault, expected records/totals, failure variation, executor and sign-off. P1/P2 must be zero; P3 requires owner, target and explicit accepted disposition.

## 6. Release Evidence Index

| Evidence | Required reference |
|---|---|
| Build | release/version/commit, immutable artifact digest, environment |
| Requirements | BR/US/AC/UX/API/schema/test traceability snapshot |
| Automated/manual | suite result, dataset version, failures/disposition |
| Security/accessibility/performance | reports and accepted residual risk |
| Migration/recovery | batch/reconciliation and restore rehearsal |
| Approval | QA pass/fail, TL readiness, business/Finance UAT, PO decision |
| Deployment | backup point, config diff approval, rollout/rollback, smoke, observation |

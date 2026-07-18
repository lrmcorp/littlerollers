# Priority Figma Production and Review Pack

**Status:** DRAFT  
**Figma owner/file/designer:** TBD-BLOCKING  
**Rule:** text handoff is input, not Gate 3 evidence

## 1. Production Queue

Each row requires Figma node URL/version, prototype URL, named Designer, review date and approval evidence before leaving `BLOCKED`.

| Order | Screen ID | Platform | Component dependency | Required states | Prototype transition | Copy/test | Reviewers | Status |
|---:|---|---|---|---|---|---|---|---|
| 1 | SCR-UX01-01 | Flutter Customer | auth method, network banner | loading/offline/rate/provider error | entry→Google or OTP | safe generic / TC-AUTH-S23-001/002 | PM/BA, Flutter, QA, PO | BLOCKED |
| 2 | SCR-UX01-02 | Flutter Customer | OTP input, timer, masked value | invalid/expired/replay/limit/offline | request→verify→result | enumeration-safe / TC-AUTH-S23-002 | PM/BA, Flutter, QA, PO | BLOCKED |
| 3 | SCR-UX01-03 | Flutter/Web | MFA challenge, error summary | expired/used/wrong/rate/offline | challenge→verify/restart | provider-neutral / TC-AUTH-S23-005 | PM/BA, Web/Flutter, QA, PO | BLOCKED |
| 4 | SCR-UX01-04 | Flutter/Web | recovery form, masked confirm | accepted/validation/rate/offline | request→safe confirmation | no existence leak / TC-AUTH-S23-003 | PM/BA, Web/Flutter, QA, PO | BLOCKED |
| 5 | SCR-UX01-05 | Flutter/Web | verified proof/link form | conflict/expired/forbidden/duplicate | verify→link/support | consequence explicit / TC-AUTH-S23-003/006 | PM/BA, Web/Flutter, QA, PO | BLOCKED |
| 6 | SCR-UX01-06 | Flutter/Web | outcome page, support CTA | inactive/conflict/revoked/expired | outcome→sign-in/support | session reason safe / TC-AUTH-S23-006/008 | PM/BA, Web/Flutter, QA, PO | BLOCKED |
| 7 | SCR-UX11-01 | Web Internal | user table/form, role/branch picker | empty/loading/duplicate/MFA/confirm | list→invite/deactivate→result | destructive consequence / TC-AUTH-S23-004/006/007 | PM/BA, Web, QA, PO | BLOCKED |
| 8 | SCR-UX11-02 | Web Internal | assignment table/form/diff | overlap/stale/wrong scope/boundary | list→create/end→result | before/after / TC-MST-S23-001/002 | PM/BA, Web, QA, PO | BLOCKED |
| 9 | SCR-UX11-03 | Web Internal | branch/class table/form | empty/duplicate/invalid/dependency/stale | list→create/deactivate→result | impact confirmation / TC-MST-* | PM/BA, Web, QA, PO | BLOCKED |
| 10 | SCR-UX11-04 | Web Internal | effective fee form/history | loading/overlap/invalid/unauthorized | list→create→result | Rupiah/effective / TC-MST-S23-003/005 | PM/BA, Web, QA, Finance, PO | BLOCKED |
| 11 | SCR-UX11-05 | Web Internal | projection form/history | loading/overlap/missing/invalid | list→create→result | rate unit/history / TC-MST-S23-003/005 | PM/BA, Web, QA, Finance, PO | BLOCKED |
| 12 | SCR-UX11-06 | Web Internal | quota/capacity form/history | invalid relation/overlap/stale/unauthorized | list→create→result | snapshot/H-24 / TC-MST-S23-003/004 | PM/BA, Web, QA, PO | BLOCKED |
| 13 | SCR-UX02-01 | Flutter/Web | package card/list/filter | loading/empty/offline/inactive/config missing | list→selection | money/date/branch / TC-PKG-S23-006 | PM/BA, Flutter/Web, QA, Finance, PO | BLOCKED |
| 14 | SCR-UX02-02 | Flutter/Web | secure uploader/progress | upload/scan pending/clean/unsafe/error | select→upload→scan/retry | secure guidance / TC-PKG-S23-001/002 | PM/BA, Flutter/Web, QA, PO | BLOCKED |
| 15 | SCR-UX02-03 | Flutter/Web | commercial review/confirm | stale/not-clean/duplicate/offline/503 | review→submit→result | consequence / TC-PKG-S23-003/006 | PM/BA, Flutter/Web, QA, Finance, PO | BLOCKED |
| 16 | SCR-UX02-04 | Flutter/Web | purchase status/timeline | pending/rejected/replacement/approved/retry | status→replace/detail | next action / TC-PKG-S23-005 | PM/BA, Flutter/Web, QA, PO | BLOCKED |
| 17 | SCR-UX02-05 | Web Internal | queue/detail/private preview | empty/wrong scope/not-clean/conflict/MFA | queue→review→decision | SoD/commercial confirm / TC-PKG-S23-004/005/007 | PM/BA, Web, QA, Finance, PO | BLOCKED |
| 18 | SCR-UX09-01 | Web Internal | adjustment form/balance diff | validation/wrong branch/duplicate/retry | package→request→result | projected balance / TC-LED-S23-004/005 | PM/BA, Web, QA, Finance, PO | BLOCKED |
| 19 | SCR-UX09-02 | Web Internal | review queue/diff/confirm | empty/SoD/stale/duplicate/conflict | queue→approve/reject→result | explicit SoD / TC-LED-S23-004/005 | PM/BA, Web, QA, Finance, PO | BLOCKED |
| 20 | SCR-UX09-03 | Web Internal | immutable result/history | loading/retry/hidden | result→ledger/history | reference/balance / TC-LED-S23-005/006 | PM/BA, Web, QA, Finance, PO | BLOCKED |
| 21 | SCR-UX03-01 | Flutter Customer | timetable filters/list/calendar | loading/empty/offline/no package | timetable→slot | timezone/status / TC-BOOK-* | PM/BA, Flutter, QA, PO | BLOCKED |
| 22 | SCR-UX03-02 | Flutter Customer | slot detail/package selector | full/cutoff/mismatch/expired/insufficient | slot→package→review | capacity/balance / TC-BOOK-* | PM/BA, Flutter, QA, PO | BLOCKED |
| 23 | SCR-UX03-03 | Flutter Customer | booking review/result | concurrent loss/duplicate/timeout/offline | review→confirm→result/retry | reservation consequence / TC-BOOK-* | PM/BA, Flutter, QA, PO | BLOCKED |

## 2. Cross-Role Review Checklist

| Check | Designer | PM/BA | Web/Flutter | QA | PO |
|---|---|---|---|---|---|
| Stable screen/node ID and traceability | R | C | C | C | A |
| Actor, permission and branch context | C | R | C | C | A |
| Fields, validation and business consequence | C | R | C | C | A |
| Loading, empty, error, success, locked, offline and retry | R | C | C | R | A |
| Responsive/platform behavior and reusable component | R | C | R | C | A |
| Keyboard, focus, screen reader, contrast, dynamic text and non-color status | R | C | C | R | A |
| Sensitive-data masking and analytics-safe event | C | C | R | R | A |
| Confirmation/destructive consequence and Indonesian copy intent | R | R | C | C | A |

Review evidence per flow is recorded in [G3-REV-001](../templates/gate-3-signed-review-record.md). No row is `READY` until exact Figma evidence and required signatures exist.

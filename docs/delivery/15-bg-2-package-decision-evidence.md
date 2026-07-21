# BG-2 Synthetic US-PKG-02 Evidence

**Execution date:** 2026-07-21

**Disposition:** `PASS FOR SYNTHETIC NON-PRODUCTION`

**Source commit:** `a97f3d3`; Dart generated-model closure `6664850`

**Production:** `BLOCKED` — DEC-004/006/011/012, providers, Figma, UAT dan signed approval remain unresolved.

## Implemented Boundary

- Purchase decision states `PENDING → APPROVED|REJECTED`, typed safe reason codes, optimistic version, MFA and branch authorization.
- Approval atomically creates one immutable `CustomerPackage`, one append-only `PURCHASE` ledger entry, masked audit and `purchase.approved.v1`; rejection creates no package/ledger.
- Activation uses approval date in branch timezone. Expiry is exclusive at local `activationDate + durationDays`.
- Effective projection rate is required and snapshotted; missing configuration fails closed. Proof authorization is CLEAN-only and synthetic-only.
- Customer self-approval is forbidden. `US-LED-01` reads, adjustment, expiry processing and administration are not implemented.

## Executable Evidence

| Check | Result |
|---|---|
| `pnpm check` | PASS — format, OpenAPI validation, lint, typecheck, 26 non-DB API + 17 Web tests, consumers and builds |
| OpenAPI | PASS validation — `0.9.0-draft`, checksum `30c18e7ab7e3bb8b3a3dca048916b9c79daf470c918ae522e0c87de5e61e3c15`, 97 operations, 908 refs |
| Generated clients | PASS hosted — pinned byte-for-byte drift dan regenerated Dart built-value models pada `6664850` |
| Empty migration/integration | PASS hosted — 9 migration pada PostgreSQL kosong, double seed, dan API integration suite; enum extension dipisahkan dari decision records untuk PostgreSQL transaction safety |
| Web component/a11y | PASS — queue, approval, typed rejection and configuration failure included |
| Web E2E | PASS hosted — approval flow, private proof authorization dan keyboard controls |
| Flutter/Dart | PASS hosted pada `6664850` — analyze, 5 widget tests dan Dart consumer test; generated `.g.dart` sinkron |
| Hosted `typescript`, `flutter`, `secrets` | PASS 2026-07-21 untuk `6664850` — dikonfirmasi pengguna; run ID/URL tidak tersedia dan tidak difabrikasi |

## Review Disposition

- **AI QA:** PASS — local pipeline serta hosted migration, integration, E2E, Flutter dan Dart evidence hijau.
- **AI Security:** PASS FOR SYNTHETIC NON-PRODUCTION — MFA/capability/scope/separation-of-duties, CLEAN proof gate, typed reasons, masked audit, Gitleaks dan production fail-closed tervalidasi.
- **AI Peer Reviewer:** PASS FOR SYNTHETIC NON-PRODUCTION — transaction dan idempotency boundaries eksplisit; tidak ada notification, payment gateway, atau `US-LED-01` behavior yang ditambahkan.

`US-PKG-02 = PASS FOR SYNTHETIC NON-PRODUCTION`. Production tetap blocked. `US-LED-01 = NEXT/NOT STARTED`, `BG-3 = PENDING`, dan `PG-1 = BLOCKED`.

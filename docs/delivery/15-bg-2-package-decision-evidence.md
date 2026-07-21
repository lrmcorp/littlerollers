# BG-2 Synthetic US-PKG-02 Evidence

**Execution date:** 2026-07-21  
**Disposition:** `IN PROGRESS FOR SYNTHETIC NON-PRODUCTION`  
**Source commit:** working tree; replaced with exact SHA after commit  
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
| Generated clients | Regenerated with pinned Docker generator; final byte drift check must complete locally or hosted |
| Empty migration/integration | Migration was split after PostgreSQL correctly rejected enum use in the same transaction; final clean hosted execution pending because local Docker daemon became unresponsive |
| Web component/a11y | PASS — queue, approval, typed rejection and configuration failure included |
| Web E2E | Test added; local execution blocked by pre-existing dev servers/file descriptor exhaustion; hosted run required |
| Hosted `typescript`, `flutter`, `secrets` | PENDING for source/evidence commit |

## Review Disposition

- **AI QA:** local pipeline pass; database/concurrency and E2E closure remains hosted action.
- **AI Security:** MFA/capability/scope/separation-of-duties, CLEAN proof gate, typed reasons, masked audit and production fail-closed implemented.
- **AI Peer Reviewer:** transaction and idempotency boundaries are explicit; no notification, payment gateway, or `US-LED-01` behavior was added.

`US-PKG-02` must remain `IN PROGRESS` until the final evidence commit is hosted-green and the working tree is clean.

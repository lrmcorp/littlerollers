# BG-2 Synthetic US-CLS-02 Evidence

Tanggal eksekusi: 2026-07-22. Status: **LOCAL PASS FOR SYNTHETIC NON-PRODUCTION**.

Source/evidence masih berada pada working tree setelah commit `2dc6d78`. Story tidak dipromosikan menjadi PASS sebelum commit, push, dan hosted `typescript`, `flutter`, serta `secrets` hijau. Run ID/URL tidak tersedia dan tidak difabrikasi.

## Scope dan boundary

- `ClassSlot` memakai interval half-open `[startAt,endAt)`, UTC instant, dan snapshot timezone cabang.
- DRAFT mengambil snapshot effective `QUOTA_CAPACITY`; missing/invalid configuration fail-closed.
- Assignment instructor membutuhkan assignment aktif dan satu availability yang mencakup seluruh interval; exclusion constraint menolak overlap lintas cabang.
- Admin/Manager branch-scoped dan Super Owner global dapat mengelola; publish/cancel wajib MFA.
- Cancellation synthetic hanya dari DRAFT/PUBLISHED dengan controlled reason code dan atomic release reservation ACTIVE.
- `CONFIRMED/AUTO_CANCELLED`, booking, attendance, notification, cutoff dan kebijakan production tidak termasuk increment.

## Evidence executable

| Area | Evidence | Hasil |
|---|---|---|
| Contract | `pnpm openapi:validate` | PASS — `1.3.0-draft`, checksum `9967fa3dedb7d37611ea5939b7eba5dbbfda61ceb47a3ea16ebe8eab9794f41e`, 97 operations |
| Database/API | temporary PostgreSQL empty migration, double seed, `pnpm --filter @dailydose/api test` | PASS — 14 migration; 14 suites/62 tests termasuk lifecycle, snapshot/revalidation, customer visibility, replay, MFA, overlap dan reservation release |
| Web | Vitest/a11y dan Playwright | PASS — 23 component/a11y tests dan 15 E2E; Playwright memakai port terisolasi 3010 |
| Clients | pinned generator `7.15.0`, Dart `build_runner`, byte comparison | PASS — 140 TypeScript dan 147 Dart non-generated-serializer files stabil |
| Mobile | Flutter analyze/widget dan Dart consumer | PASS — 9 Flutter regression tests dan Dart consumer hijau |
| Monorepo | `pnpm check` | PASS — format, OpenAPI, lint, typecheck, unit, build |
| Hosted | private `typescript`, `flutter`, `secrets` | PENDING — wajib setelah source/evidence commit dipush |

## Review disposition

- **AI QA:** LOCAL PASS — migration, concurrency boundary, idempotency, lifecycle, clients, Web/Flutter regression hijau.
- **AI Security:** LOCAL PASS — MFA, hidden branch, controlled reason, masked audit/outbox, atomic reservation release, dan no production default tervalidasi; hosted Gitleaks pending.
- **AI Peer Reviewer:** LOCAL PASS — scope berhenti pada PUBLISHED/CANCELLED; quota evaluation dan booking tidak dimulai.

`US-CLS-02 = LOCAL_PASS FOR SYNTHETIC NON-PRODUCTION`. Setelah hosted closure, `US-CLS-03 = NEXT`; `US-BKG-01` menunggu confirmed slot foundation; `BG-3 = PENDING`, `PG-1 = BLOCKED`.

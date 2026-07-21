# BG-2 Synthetic US-LED-02 Evidence

Tanggal eksekusi: 2026-07-22. Status: **LOCAL PASS / HOSTED PENDING**.

## Scope dan keputusan

- Closure `US-LED-01` direkam pada evidence commit `c18c562`; hosted `typescript`, `flutter`, dan `secrets` hijau berdasarkan konfirmasi pengguna. Run ID/URL tidak difabrikasi karena tidak tersedia di workspace.
- Admin branch-scoped dapat membuat adjustment PENDING dengan delta signed non-zero dan reason code terkontrol. Request tidak memutasi ledger.
- Manager/Super Owner yang berbeda wajib MFA untuk approve/reject. Approval atomik membuat tepat satu `ADJUST_MANUAL`; rejection tidak membuat ledger.
- Tidak ada free text, evidence attachment, notification, booking, atau mutation reservation. Production tetap blocked.

## Evidence executable

| Area | Command/evidence | Hasil |
|---|---|---|
| Contract | `pnpm openapi:validate` | PASS — `1.1.0-draft`, checksum `af6be1ce33e27c06a0346741e0622f03562d334b2bdb4b5407fb0eaf3bdfc98f`, 97 operations |
| API static/unit | `pnpm --filter @dailydose/api typecheck`; lint; test | PASS lokal; PostgreSQL adjustment suite tersedia dan berjalan saat `DATABASE_URL` tersedia |
| Web | `pnpm --filter @dailydose/web typecheck`; test | PASS — controlled request/review dan a11y termasuk dalam component suite |
| Clients | OpenAPI Generator `7.15.0`; Dart `build_runner` | PASS generation; Docker drift/hosted pending |
| Database | migration `20260722000300_session_adjustment` | Schema/Prisma generate PASS; empty migration/double seed hosted pending |

## Review disposition

- **AI QA:** LOCAL PASS — typed lifecycle, replay, balance reflection, and Web states implemented; real PostgreSQL/hosted execution pending.
- **AI Security:** LOCAL PASS — MFA, branch hiding, SoD, controlled codes, masked audit/event payload; Gitleaks hosted pending.
- **AI Peer Reviewer:** LOCAL PASS — request and decision transaction boundaries preserve append-only ledger; `US-BKG-01` remains not started.

`US-LED-02` tidak dipromosikan menjadi PASS sebelum source/evidence commit terakhir hijau pada hosted CI dan working tree bersih. `BG-3 = PENDING`, `PG-1 = BLOCKED`.

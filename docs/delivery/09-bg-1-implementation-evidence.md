# BG-1 Implementation Evidence

**Date:** 2026-07-18  
**Status:** `PASS` — seluruh evidence lokal dan hosted GitHub Actions lulus. Status ini bukan production authorization.
**Baseline commit:** `6aa4646`
**Hosted evidence commit:** `8cd2ce3`
**Hosted result:** `typescript`, `flutter`, dan `secrets` PASS; dikonfirmasi Product Owner pada 2026-07-18. Repository tetap private.

## Implemented

- pnpm/Turborepo workspace with NestJS API and worker, Next.js App Router, one Flutter role-shell app, shared configuration/test packages, and TypeScript/Dart API-client packages.
- Node 24, pnpm 11.7.0, Flutter 3.38.5, and Dart 3.10.4 pins.
- PostgreSQL/Prisma foundation schema and baseline migration for identity, branch assignment, audit, idempotency, outbox, and effective configuration.
- Redis, PostgreSQL, MinIO private-object-storage adapter target, and Mailpit local services through Docker Compose.
- Provider/configuration boundaries with no production price, fee, quota, TTL, or provider default.
- BG-1 baseline OpenAPI `0.4.0-draft` checksum `920ad746d2b3acbd45540dae61193a853833b3749f21c466fa02ce7e232e6414`; superseded for BG-2 by `0.5.0-draft`.
- Pinned OpenAPI Generator Docker image `openapitools/openapi-generator-cli:v7.15.0`; full TypeScript and Dart generation succeeds in `.generated`.
- GitHub Actions definitions for TypeScript, Prisma, Flutter/Dart, OpenAPI, generated metadata drift, and gitleaks checks.

## Executed evidence

| Evidence | Result |
|---|---|
| `pnpm check` | PASS — format, contract validation, lint, typecheck, tests, API/worker/web/client builds |
| OpenAPI parse/ref/operation/checksum | PASS — 94 unique operations and 834 local references |
| Standard OpenAPI Generator TS + Dart | PASS after correcting three YAML description quoting defects |
| `pnpm db:generate` | PASS |
| Empty PostgreSQL migration | PASS — `20260718000100_foundation` |
| Synthetic seed run twice | PASS — idempotent |
| Docker local services | PASS — PostgreSQL, Redis, MinIO, Mailpit running; DB host port is `55432` to avoid local `5432` collision |
| Flutter analyze/widget test | PASS |
| Dart client consumer test | PASS |
| Generated drift | PASS — 120 TypeScript dan 127 Dart generated source match byte-for-byte |
| Health degradation tests | PASS — READY, DEGRADED, NOT_READY, timeout, unreachable, missing/stale heartbeat; output credential-safe |
| Idempotency tests | PASS — identical replay, different-payload conflict dan active-lease conflict |
| Empty database migration | PASS — dua migration diterapkan pada database sintetis terpisah |
| Synthetic seed run twice | PASS — hasil akhir 1 Branch, 1 User, 1 Assignment; tidak ada duplikasi |

## Gate Closure

Complete generated clients, byte-for-byte drift, dependency-aware health, transactional
idempotency/outbox foundation, degradation tests, empty-database migration, Flutter/Dart checks dan
full-history secret scan telah lulus secara lokal dan/atau hosted sesuai matriks evidence. `BG-1` adalah
`PASS`; BG-2 dapat dimulai per story. Production gates dan `DEC-004–014` tetap tidak berubah.

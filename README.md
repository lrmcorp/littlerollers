# Daily Dose v2

AI-delivered modular monolith foundation for Daily Dose Pilates. Business and technical documentation lives in [docs](docs/README.md).

## Bootstrap

Prerequisites: Node 24, pnpm 11.7, Docker, Flutter 3.38.5/Dart 3.10.4.

1. Copy `.env.example` to `.env` for local use only.
2. Run `pnpm install`.
3. Run `pnpm local:up`.
4. Run `pnpm db:generate && pnpm db:migrate && pnpm db:seed`.
5. Run `pnpm check`.
6. In `packages/api-client-dart` and `apps/mobile`, run `flutter pub get`; then `flutter analyze && flutter test` in the mobile app.
7. Run `pnpm dev` and open Web `http://localhost:3000`, API health `http://localhost:3001/api/v1/operations/health`, MinIO console `http://localhost:9001`, and Mailpit `http://localhost:8025`.

`pnpm openapi:validate` verifies OpenAPI version, checksum, operation IDs and component references. `pnpm openapi:drift` verifies committed generated-client metadata. Full pinned generator output can be inspected with `sh tools/openapi-generator.sh`.

## Safety Boundaries

- Local seed/configuration is synthetic and must never be promoted as production configuration.
- Missing price, quota, fee, TTL, provider or policy must fail explicitly in affected production behavior.
- A request `branchId` is only a filter; authorization comes from authenticated branch assignments.
- Real provider/account/secrets, production migration, and release remain PG-1 blocked.

## Troubleshooting

- If Docker ports are occupied, stop the conflicting local service; do not silently change shared ports without updating `.env.example`.
- If Flutter cannot update its cache, ensure the pinned SDK is writable or use FVM with `.fvmrc`.
- If Prisma cannot connect, wait for `docker compose ... ps` to report PostgreSQL healthy.
- If generated drift fails, validate the OpenAPI checksum first. Contract changes require manifest/checksum synchronization before regeneration.

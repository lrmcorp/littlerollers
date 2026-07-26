# Daily Dose v2

AI-delivered modular monolith foundation for Daily Dose Pilates. Business and technical documentation lives in [docs](docs/README.md).

## Bootstrap

Prerequisites: Node 24, pnpm 11.7, MySQL 8.4 or newer, and (for mobile work)
Flutter 3.38.5/Dart 3.10.4. Docker is optional and is not used by the default
local development flow.

1. Copy `.env.example` to `.env` for local use only.
2. Start a native MySQL service on `127.0.0.1:3306`.
3. Create the local database and least-privilege application account:

   ```sql
   CREATE DATABASE IF NOT EXISTS dailydose_local
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'dailydose'@'localhost'
     IDENTIFIED BY 'dailydose_local';
   CREATE USER IF NOT EXISTS 'dailydose'@'127.0.0.1'
     IDENTIFIED BY 'dailydose_local';
   GRANT ALL PRIVILEGES ON dailydose_local.* TO 'dailydose'@'localhost';
   GRANT ALL PRIVILEGES ON dailydose_local.* TO 'dailydose'@'127.0.0.1';
   ```

4. Run `pnpm install`.
5. Run `npm run db:setup`.
6. Run `npm run dev`, then open Web `http://localhost:32120` and API health
   `http://localhost:32121/api/v1/operations/health`.
7. Run `pnpm check` before handing off changes.
8. In `packages/api-client-dart` and `apps/mobile`, run `flutter pub get`; then
   `flutter analyze && flutter test` in the mobile app.

The default `npm run dev` starts only the API and Web applications. Start the
background worker separately with `npm run dev:worker`, or start every
application with `npm run dev:all`. A native Redis service is required only
when running worker/queue flows.

### Optional Docker services

The existing container setup remains available as an opt-in convenience:

```bash
npm run local:up
```

Its MySQL service is exposed on `127.0.0.1:3307` to avoid conflicting with the
native MySQL service used by `npm run dev`. If Docker MySQL is selected,
temporarily set:

```text
DATABASE_URL=mysql://dailydose:dailydose_local@127.0.0.1:3307/dailydose_local
```

Docker also provides Redis, MinIO, and Mailpit for flows that need those
adapters. Stop the optional services with `npm run local:down`.

### Akun demo lokal

`npm run db:seed` membuat akun berikut hanya untuk development/test. Kredensial
demo tidak dibuat di production, dan `SEED_DEMO_CREDENTIALS=true` ditolak ketika
`NODE_ENV=production`.

| Role        | Email                          | Password         |
| ----------- | ------------------------------ | ---------------- |
| Super Owner | `ralamzah@gmail.com`           | `ridho123`       |
| Super Owner | `owner@dailydose.local`        | `DailyDose#2026` |
| Owner       | `branch.owner@dailydose.local` | `DailyDose#2026` |
| Owner BSD   | `bsd.owner@dailydose.local`    | `DailyDose#2026` |
| Admin       | `admin@dailydose.local`        | `DailyDose#2026` |
| Manager     | `manager@dailydose.local`      | `DailyDose#2026` |
| Finance     | `finance@dailydose.local`      | `DailyDose#2026` |
| Operations  | `ops@dailydose.local`          | `DailyDose#2026` |
| Instructor  | `instructor@dailydose.local`   | `DailyDose#2026` |
| Customer    | `customer@dailydose.local`     | `Customer#2026`  |

Seeder memakai factory deterministik dan dapat dijalankan berulang tanpa
menambah duplicate data:

- `npm run db:seed:minimal`: dua cabang, master lengkap, Super Owner, Owner,
  Instructor, dan rekening development.
- `npm run db:seed:demo`: profile default dengan seluruh role dan skenario
  pembayaran, kelas, booking, ledger, reschedule, adjustment, audit, serta job.
- `npm run db:seed:volume`: profile demo ditambah 500 transaksi dan 500 audit
  record untuk pagination dan performance testing.

Gunakan `SEED_ANCHOR_DATE=YYYY-MM-DD` bila fixture waktu perlu dipatok. Semua
profile seed gagal sebelum membuka koneksi database ketika `NODE_ENV=production`.

`pnpm openapi:validate` verifies OpenAPI version, checksum, operation IDs and component references. `pnpm openapi:drift` verifies committed generated-client metadata. Full pinned generator output can be inspected with `sh tools/openapi-generator.sh`.

## Safety Boundaries

- Local seed/configuration is synthetic and must never be promoted as production configuration.
- Missing price, quota, fee, TTL, provider or policy must fail explicitly in affected production behavior.
- A request `branchId` is only a filter; authorization comes from authenticated branch assignments.
- Real provider/account/secrets, production migration, and release remain PG-1 blocked.

## Troubleshooting

- If native MySQL is unavailable, confirm the service is running and that
  `mysql -u dailydose -p -h 127.0.0.1 dailydose_local` can connect.
- If optional Docker ports are occupied, stop the conflicting service; do not
  silently change shared ports without updating the documented Docker URL.
- If Flutter cannot update its cache, ensure the pinned SDK is writable or use FVM with `.fvmrc`.
- If Prisma cannot connect, verify `DATABASE_URL` points to the selected native
  (`3306`) or optional Docker (`3307`) MySQL instance.
- If generated drift fails, validate the OpenAPI checksum first. Contract changes require manifest/checksum synchronization before regeneration.

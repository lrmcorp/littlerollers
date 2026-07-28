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
6. Run `npm run dev`, sign in as an OPS or Super Owner account, then open the
   authenticated system status page at `http://localhost:32120/health`.
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

`pnpm openapi:validate` verifies OpenAPI version, checksum, operation IDs and component references. `pnpm openapi:drift` verifies committed generated-client metadata. The generator workflow prefers a local pinned OpenAPI Generator JAR so Docker is not required:

```sh
OPENAPI_GENERATOR_JAR=/absolute/path/openapi-generator-cli-7.15.0.jar \
OPENAPI_GENERATOR_JAVA=/absolute/path/to/java \
pnpm openapi:drift
```

If neither the JAR nor a working Docker daemon is available, the command exits with a setup message before generating files; it does not fail with an ambiguous Docker permission error.

## Safety Boundaries

- Local seed/configuration is synthetic and must never be promoted as production configuration.
- Missing price, quota, fee, TTL, provider or policy must fail explicitly in affected production behavior.
- A request `branchId` is only a filter; authorization comes from authenticated branch assignments.
- Real provider/account/secrets, production migration, and release remain PG-1 blocked.

## Deployment VPS dengan Docker Compose

Docker Compose production menjalankan Web, API, worker, MySQL, Redis, ClamAV,
dan migrasi Prisma. Hanya port Web yang dipublikasikan ke host; database dan API
tetap berada di network internal Docker.

1. Salin `.env.production.example` menjadi `.env.production`.
2. Ganti seluruh nilai `CHANGE_ME`, domain `PUBLIC_WEB_BASE_URL`, alamat email,
   WhatsApp, dan kredensial provider. Password MySQL di `MYSQL_PASSWORD` harus
   sama dengan password di `DATABASE_URL` (URL-encode bila mengandung karakter
   khusus).
3. Jalankan build dan deployment:

   ```bash
   docker compose --env-file .env.production up -d --build
   ```

4. Periksa status dan log:

   ```bash
   docker compose --env-file .env.production ps
   docker compose --env-file .env.production logs -f api web worker
   ```

Aplikasi tersedia di port `32120`. Untuk HTTPS, arahkan reverse proxy VPS
(Caddy, Nginx, atau Traefik) ke `127.0.0.1:32120` dan ubah
`WEB_BIND_ADDRESS=127.0.0.1`. Jangan menjalankan seed demo di production.

Backup minimal mencakup volume `dailydose_mysql-data` dan
`dailydose_private-uploads`. Saat memperbarui aplikasi, tarik kode terbaru lalu
jalankan kembali perintah `up -d --build`; service `migrate` akan menjalankan
migrasi Prisma sebelum API dan worker dimulai.

### Email transaksional SMTP

Production memakai SMTP Niagahoster melalui `smtp.hostinger.com:465` dengan
SSL/TLS. Salin konfigurasi email dari `.env.production.example`, isi password
mailbox `noreply@dailydosepilates.com`, lalu buat encryption key terpisah:

```bash
openssl rand -base64 32
```

Simpan hasilnya sebagai `NOTIFICATION_ENCRYPTION_KEY`. Jangan commit password
SMTP atau encryption key. Pastikan MX, SPF, DKIM, dan DMARC domain telah aktif.
Detail operasional, smoke test, retry, dan rollback terdapat pada
`docs/operations/01-smtp-email-runbook.md`.

## Troubleshooting

- If native MySQL is unavailable, confirm the service is running and that
  `mysql -u dailydose -p -h 127.0.0.1 dailydose_local` can connect.
- If optional Docker ports are occupied, stop the conflicting service; do not
  silently change shared ports without updating the documented Docker URL.
- If Flutter cannot update its cache, ensure the pinned SDK is writable or use FVM with `.fvmrc`.
- If Prisma cannot connect, verify `DATABASE_URL` points to the selected native
  (`3306`) or optional Docker (`3307`) MySQL instance.
- If generated drift fails, validate the OpenAPI checksum first. Contract changes require manifest/checksum synchronization before regeneration.

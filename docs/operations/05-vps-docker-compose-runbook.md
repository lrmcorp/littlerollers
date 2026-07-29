# VPS Docker Compose Deployment Runbook

## Scope

Runbook ini khusus untuk stack `/var/www/dailydose_v2`. Stack lama
`dailydose-pilates` tidak boleh dihentikan atau dikelola dari direktori ini.

## One-time proxy network

Nginx Proxy Manager berjalan pada container terpisah. Buat network bersama dan
hubungkan container yang sudah ada:

```bash
docker network inspect dailydose-v2-proxy >/dev/null 2>&1 || \
  docker network create dailydose-v2-proxy
docker network connect dailydose-v2-proxy nginx-proxy-manager 2>/dev/null || true
```

Proxy Host diarahkan ke `web:32120`.

## First deployment

Set `APP_VERSION` pada `.env.production` ke tag release atau short commit.
Pastikan file hanya dapat dibaca owner:

```bash
chmod 600 .env.production
```

Jalankan dengan project name eksplisit:

```bash
docker compose -p dailydose-v2 --env-file .env.production config --quiet
docker compose -p dailydose-v2 --env-file .env.production up -d mysql redis clamav
docker compose -p dailydose-v2 --env-file .env.production up -d --build migrate
docker compose -p dailydose-v2 --env-file .env.production up -d api worker web
docker compose -p dailydose-v2 --env-file .env.production ps
```

`migrate` harus selesai dengan exit code `0` sebelum API dan worker digunakan.

## Verification

Periksa `healthy` untuk MySQL, Redis, ClamAV, API, dan web. Pastikan container
lama tetap berjalan:

```bash
docker compose -p dailydose-v2 --env-file .env.production logs --tail=200 migrate api worker web
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Healthcheck API hanya memeriksa socket lokal `32121`; readiness dependency detail
tetap diperiksa oleh operator melalui endpoint health terautentikasi.

## Safety and rollback

Jangan menjalankan `docker compose down -v`, `docker system prune`, atau perintah
penghentian massal. Rollback dilakukan dengan mengembalikan `APP_VERSION` ke
release sebelumnya dan menjalankan build/startup kembali. Feature flag dimatikan
tanpa menghapus database, upload privat, audit, atau notification.

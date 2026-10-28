# Deploy produksi

Image aplikasi dibangun oleh GitHub Actions dan dikirim ke GHCR (`ghcr.io/ridho15/dailydose-v2-app`).
Server produksi tidak lagi membangun apa pun: ia hanya menarik image jadi lalu menjalankannya. Server ini dipakai
bersama banyak proyek lain, dan build 10 menit di sana membuat semuanya melambat.

## Cara deploy

**Lewat GitHub** (disarankan): Actions, Deploy production, Run workflow, pilih branch `perbaikan_arsitektur` atau `main`.

**Lewat tag rilis:**

```bash
git tag v2026.10.29
git push origin v2026.10.29
```

Push biasa ke branch **tidak** memicu deploy.

Urutannya: typecheck dan tes unit, bangun dan kirim image, lalu server menarik image itu dan menjalankannya.
Opsi saat menjalankan manual: `run_tests` (matikan hanya untuk perbaikan darurat) dan `deploy` (matikan untuk hanya
membangun dan mengirim image).

## Persiapan satu kali

1. **Secret repository yang sudah dipakai** (Settings, Secrets and variables, Actions): `SERVER_HOST`, `SERVER_USER`,
   `SERVER_SSH_KEY`, `SERVER_PORT` (opsional), `PROJECT_PATH` (bawaan `/var/www/dailydose_v2`).
2. **Variabel repository baru `NEXT_PUBLIC_GOOGLE_CLIENT_ID`** (tab Variables). Nilainya sama dengan yang ada di
   `.env.production` server. Tanpa itu, tombol "Lanjutkan dengan Google" tidak berfungsi, karena nilai ini
   ikut dibakukan ke dalam image saat dibangun. Workflow memberi peringatan bila kosong.
3. **Environment `production`** (Settings, Environments): dibuat otomatis pada deploy pertama. Tambahkan
   "Required reviewers" bila ingin persetujuan manual sebelum server disentuh.
4. **Paket GHCR**: dibuat otomatis oleh workflow dan bersifat privat. Server menariknya dengan token singkat dari
   workflow (`GITHUB_TOKEN`), lalu logout; tidak ada token permanen di server. Setelah image pertama terkirim,
   buka paket `dailydose-v2-app` di GitHub dan pastikan repositori ini terdaftar pada "Manage Actions access".

## Deploy pertama: lakukan bertahap

1. Jalankan workflow dengan `deploy` **dimatikan**. Ini hanya menguji tes dan build di GitHub, lalu mengirim image ke GHCR.
   Periksa tidak ada peringatan soal `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, dan paket `dailydose-v2-app` muncul di GitHub.
2. Pada jam sepi, jalankan lagi dengan `deploy` **dinyalakan** (atau tekan "Re-run" untuk job deploy).
3. Setelah aplikasi sehat, hapus image lama hasil build di server agar disk lega (cukup sekali):
   `docker rmi dailydose-v2-app:dev`
   (abaikan bila namanya berbeda; cek dengan `docker image ls | grep dailydose`).

Deploy pertama di server tetap perlu menarik image sekitar 1 GB; berikutnya hanya layer yang berubah.

## Yang terjadi di server

`update.sh --pull --tag sha-xxxxxxx` (dipanggil workflow):

1. Menyamakan berkas compose dan skrip dengan commit yang dideploy.
2. Menarik `ghcr.io/ridho15/dailydose-v2-app:sha-xxxxxxx`, menyimpan versi yang berjalan sebagai tag `previous`, lalu
   menandai versi baru sebagai `production`.
3. `docker compose up -d --remove-orphans --no-build` (tanpa build), lalu menunggu container sehat. Bila tidak sehat
   dalam 2 menit, skrip gagal dan job GitHub menjadi merah.
4. Mencatat tag di `.deployed-version` dan menyimpan hanya 3 versi `sha-*` terbaru.

## Kembali ke versi sebelumnya

```bash
cd /var/www/dailydose_v2
docker tag ghcr.io/ridho15/dailydose-v2-app:previous ghcr.io/ridho15/dailydose-v2-app:production
docker compose up -d --no-build app
```

Untuk versi yang lebih lama, tarik tag `sha-...` yang diinginkan lalu tandai sebagai `production` dengan cara yang sama.
Catatan: aplikasi menjalankan `prisma db push` saat start. Bila versi baru mengubah skema, versi lama bisa tidak cocok
dengan database; periksa dulu sebelum kembali.

## Cadangan: build di server

Bila GitHub atau GHCR sedang bermasalah, cara lama tetap ada. Ia membangun image di server, jadi pakai di luar jam ramai:

```bash
cd /var/www/dailydose_v2 && ./update.sh
```

`update.sh` tanpa argumen memangkas cache build hanya seperlunya (maksimal 4 GB, atur lewat `BUILD_CACHE_KEEP`) dan
tidak lagi membuang container proyek lain.

## Cakupan tes

Gerbang sebelum membangun image: `pnpm typecheck`, tes unit API (tanpa database), dan tes web. Suite lengkap
(`.github/workflows/ci.yml`: tes integrasi dengan MySQL, Playwright, Dart, pemindaian rahasia) berjalan untuk
pull request dan push ke `main`, terpisah dari deploy.

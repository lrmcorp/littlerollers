# Portainer.io Docker Stack Deployment Runbook — Little Rollers

Dokumen ini adalah panduan operasional langkah-demi-langkah untuk melakukan *deployment* dan *otomasi CD (Continuous Deployment)* stack **Little Rollers** (`littlerollers.playgo.id`) ke server Docker melalui antarmuka web **Portainer.io** dan **GitHub**.

---

## 1. Hasil Audit Port & Network Server

Berdasarkan pengecekan aktual di server:
- **Port MySQL (`3315`):** **TERSEDIA & BEBAS.**
  *(Port lain di server: 3306 dipakai host mysqld, 3308 dipakai limitless_db, 3313 dipakai playsquare-db, 3317 dipakai hrghrd_mysql, 13307 dipakai slmj-mysql-prod).*
- **Port Aplikasi Web (`32120`) & API (`32121`):** Berjalan di dalam Docker Network internal, tidak membebani host.
- **Docker Proxy Network (`proxy-net`):** **SUDAH TERPASANG DI SERVER.** Nginx Proxy Manager (NPM) dan Little Rollers akan langsung saling terhubung melalui network ini.
- **Portainer:** Portainer CE berjalan aktif di port `9000` / `9443`.

---

## 2. Pengaturan Repositori: Public vs Private?

### Rekomendasi Kuat: **PRIVATE**
1. **Keamanan Kode & Logika Bisnis:** Repositori ini memuat seluruh skema relasional database, logika finansial, template email, dan aturan otorisasi bisnis. Repositori komersial wajib di-private untuk mencegah scanning celah keamanan dari luar.
2. **Koneksi Portainer ke Private Repo Sangat Mudah:**
   - Anda cukup membuat **Personal Access Token (Classic)** di GitHub:
     - Buka **GitHub** $\rightarrow$ **Settings** $\rightarrow$ **Developer Settings** $\rightarrow$ **Personal access tokens** $\rightarrow$ **Tokens (classic)**.
     - Klik **Generate new token (classic)**, beri nama (misal: `portainer-deploy`), beri masa berlaku (*No expiration* atau 1 tahun), dan centang scope **`repo`** (Full control of private repositories).
     - Salin token tersebut (dimulai dengan `ghp_...`).
   - Di Portainer, aktifkan **Authentication**:
     - **Username:** Username GitHub Anda.
     - **Password / Token:** Tempelkan Personal Access Token (`ghp_...`).

---

## 3. Pengaturan DNS Cloudflare

1. Masuk ke **Dashboard Cloudflare** $\rightarrow$ domain **`playgo.id`**.
2. Masuk ke menu **DNS** $\rightarrow$ **Records** $\rightarrow$ klik **Add record**:
   - **Type:** `A`
   - **Name:** `littlerollers`
   - **IPv4 address:** IP Server Anda (`[IP_HOST_SERVER]`).
   - **Proxy status:** 
     - **Saat Awal:** Pilih **DNS Only (Abu-abu)** agar proses request SSL Let's Encrypt di Nginx Proxy Manager lolos verifikasi HTTP-01 tanpa kendala.
     - **Setelah SSL NPM Terbit:** Ubah menjadi **Proxied (Oranye)** dengan SSL setting di Cloudflare diatur ke **Full (Strict)**.

---

## 4. Deploy Stack di Portainer (Dengan Otomasi GitHub)

1. Buka dashboard Portainer Anda (`https://your-server-ip:9443` atau `http://your-server-ip:9000`).
2. Masuk ke Environment Docker Anda (misal: **local** / **primary**).
3. Di menu sebelah kiri, klik **Stacks** $\rightarrow$ klik **+ Add stack**.
4. Isi formulir pembuatan stack:
   - **Name:** `littlerollers`
   - **Build method:** Pilih **Repository**.
5. Konfigurasi Git Repository:
   - **Repository URL:** URL repository Git Anda (misal: `https://github.com/username/littlerollers.git`).
   - **Repository reference:** `refs/heads/main`
   - **Compose path:** `docker-compose.portainer.yml`
   - **Authentication:** Aktifkan (ON). Masukkan username GitHub Anda dan Personal Access Token (`ghp_...`).
6. **Aktifkan Deploy Otomatis (Automatic Updates):**
   - Centang opsi **Automatic updates**.
   - Pilih mekanisme **Webhook**.
   - Portainer akan menampilkan **Webhook URL**, contoh:
     `https://your-server:9443/api/stacks/webhooks/a1b2c3d4-e5f6-7890-abcd-1234567890ab`
   - *Simpan Webhook URL ini untuk dipasang di GitHub (lihat Langkah 5).*
7. **Isi Environment Variables:**
   - Di bagian bawah, klik tombol **Advanced mode**.
   - Buka file [`portainer.env.example`](../../portainer.env.example) dari repositori ini.
   - Salin seluruh isinya dan tempelkan ke kolom teks Portainer.
   - **Sesuaikan nilai password & secret:**
     - `MYSQL_PASSWORD` & `MYSQL_ROOT_PASSWORD` (gunakan password acak yang kuat).
     - `SMTP_PASSWORD` (password mailbox Niagahoster/Hostinger).
     - `NOTIFICATION_ENCRYPTION_KEY` (kunci base64 32 bytes, generate via `openssl rand -base64 32`).
8. Klik tombol **Deploy the stack**.
   - Portainer akan meng-clone repository, me-build image `littlerollers-app:latest`, dan menyalakan semua container secara berurutan.

---

## 5. Menghubungkan Otomasi Deploy ke GitHub

Jika pada menu **Settings** repositori Anda tidak ada opsi **Webhooks** (karena role akun Anda adalah *Collaborator*, bukan *Admin/Owner* repositori), Anda memiliki **2 alternatif resmi yang jauh lebih praktis**:

### Opsi 1: Menggunakan GitHub Secrets & Actions (Paling Praktis)
Karena Anda memiliki menu **Secrets and variables**:
1. Buka repositori Anda di **GitHub**.
2. Masuk ke **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
3. Di bagian **Repository secrets**, klik **New repository secret**:
   - **Name:** `PORTAINER_WEBHOOK_URL`
   - **Secret:** Tempelkan Webhook URL yang didapat dari Portainer (dari Langkah 4).
4. Klik **Add secret**.
5. Berkas workflow [`.github/workflows/deploy-portainer.yml`](../../.github/workflows/deploy-portainer.yml) yang sudah saya siapkan akan otomatis berjalan setiap kali ada `git push` ke branch `main`, memanggil Webhook Portainer secara aman di balik layar tanpa memerlukan izin Admin repositori. Anda bahkan bisa memicu deploy manual via tab **Actions** $\rightarrow$ **Deploy to Portainer** $\rightarrow$ **Run workflow**.

---

### Opsi 2: Menggunakan Polling di Portainer (Tanpa Sentuh GitHub Sama Sekali)
Jika Anda tidak ingin mengatur apa pun di GitHub:
1. Di Portainer, saat membuat/mengedit Stack:
   - Pada bagian **Automatic updates**, ubah Mechanism dari **Webhook** menjadi **Polling**.
   - Masukkan interval pengecekan (misal: `5m` untuk setiap 5 menit, atau `1m`).
2. Klik **Update the stack**.
3. Portainer akan secara berkala mengecek commit terbaru di GitHub secara otomatis dan me-redeploy stack bila mendeteksi pembaruan kode.

---

## 6. Konfigurasi Nginx Proxy Manager (NPM)

1. Buka antarmuka Nginx Proxy Manager (`http://your-server-ip:81`).
2. Masuk ke **Hosts** $\rightarrow$ **Proxy Hosts** $\rightarrow$ klik **Add Proxy Host**.
3. Tab **Details**:
   - **Domain Names:** `littlerollers.playgo.id`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `web` *(Portainer dan NPM sudah berada di network `proxy-net` yang sama)*
   - **Forward Port:** `32120`
   - **Block Common Exploits:** Aktifkan (ON)
   - **Websockets Support:** Aktifkan (ON)
4. Tab **SSL**:
   - Pilih **Request a new SSL Certificate**.
   - Centang **Force SSL**, **HTTP/2 Support**, dan **HSTS Enabled**.
   - Masukkan email notifikasi Let's Encrypt Anda dan setujui ToS.
5. Klik **Save**.
6. Uji akses domain: buka `https://littlerollers.playgo.id` di browser. Situs Little Rollers sudah online dan siap digunakan!

---

## 7. Status Normal Container di Portainer

Setelah deploy selesai, daftar container pada stack `littlerollers` akan berstatus:

| Nama Container | Status | Keterangan |
|---|---|---|
| `littlerollers-mysql-1` | `healthy` | Database MySQL 8.4 (port `3315:3306`). |
| `littlerollers-redis-1` | `healthy` | Redis cache & job heartbeat. |
| `littlerollers-clamav-1` | `healthy` | Daemon scanner antivirus. |
| `littlerollers-migrate-1` | `exited with code 0` | **Normal.** Menjalankan migrasi Prisma saat startup. |
| `littlerollers-private-storage-init-1` | `exited with code 0` | **Normal.** Menyetel izin volume upload privat. |
| `littlerollers-api-1` | `healthy` | Backend NestJS. |
| `littlerollers-worker-1` | `running` | Background scheduler & email worker. |
| `littlerollers-web-1` | `healthy` | Frontend Next.js. |

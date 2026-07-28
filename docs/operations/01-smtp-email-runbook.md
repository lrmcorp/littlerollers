# SMTP Email Operations Runbook

**Status:** IN_REVIEW

## Provisioning

1. Verifikasi mailbox `noreply@dailydosepilates.com` dan detail manual SMTP di hPanel.
2. Aktifkan MX, SPF, DKIM, dan DMARC; simpan screenshot/status sebagai release evidence.
3. Buat password mailbox khusus dan `NOTIFICATION_ENCRYPTION_KEY` dengan
   `openssl rand -base64 32`; simpan hanya di secret environment VPS.
4. Jalankan migration, restart API/worker, lalu periksa health dan worker heartbeat.

Verifikasi koneksi dari network/container production tanpa mencetak credential:

```bash
docker compose --env-file .env.production exec worker node -e "const n=require('./apps/worker/node_modules/nodemailer');const t=n.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:process.env.SMTP_SECURE==='true',requireTLS:process.env.SMTP_SECURE!=='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},tls:{rejectUnauthorized:true}});t.verify().then(()=>console.log('SMTP_VERIFY_OK')).finally(()=>t.close())"
```

Setelah verify, gunakan akun UAT yang benar-benar ada untuk memicu reset generik dan pantau occurrence:

```bash
curl -i -X POST https://dailydosepilates.com/api/v1/auth/password/reset-requests \
  -H 'Content-Type: application/json' \
  --data '{"email":"mailbox-uat@example.com"}'
```

Respons harus `202` baik akun ada maupun tidak. Email hanya akan dibuat untuk akun valid; jangan
menyalin token dari email ke ticket atau log.

## Smoke dan observability

- Kirim aktivasi/reset ke mailbox staging yang diizinkan, lalu verifikasi subject, HTML/text, link
  HTTPS, expiry, dan satu occurrence/satu attempt.
- Periksa `GET /api/v1/operations/email-deliveries` menggunakan role OPS/Super Owner.
- Alert pada terminal failure, queue age, retry exhaustion, auth failure, dan rate-limit wait.
- UAT wajib mencakup Gmail, Outlook, Yahoo, dan domain bisnis tanpa token/PII dalam evidence.

## Recovery

- `535/authentication`: hentikan sender, verifikasi username/password hPanel, rotasi secret, restart,
  lalu manual retry dengan reason.
- Timeout/network: verifikasi DNS dan outbound 465; gunakan port 587 + STARTTLS hanya setelah config
  review. Jangan memakai port 25.
- Rate limit: biarkan occurrence pending; jangan menaikkan limit aplikasi melebihi paket provider.
- Rollback: set `EMAIL_DELIVERY_ENABLED=false`. Bila disetujui TL/Ops, isi Resend secret dan ubah
  `EMAIL_DRIVER=resend`; tidak ada failover otomatis.

Password, encryption key, raw token, dan email body tidak pernah dicantumkan pada ticket atau log.

## Secret ownership dan rotasi

| Secret/config | Owner | Rotasi | Evidence aman |
|---|---|---|---|
| `SMTP_PASSWORD` | Operations | 90 hari atau segera setelah incident/personnel change | timestamp rotasi + smoke occurrence ID |
| `NOTIFICATION_ENCRYPTION_KEY` | TL + Operations | tahunan atau incident; rotasi perlu drain/re-encryption plan | key version + change ticket, tanpa nilai key |
| SPF/DKIM/DMARC | Operations | saat provider/domain berubah dan review kuartalan | status hPanel/DNS |
| `RESEND_API_KEY` | Operations | hanya saat rollback disetujui; kosong pada baseline | approval dan timestamp aktivasi |

## UAT dan rollout matrix

| Area | Skenario wajib | Lulus bila |
|---|---|---|
| Gmail/Outlook/Yahoo/domain bisnis | activation, reset, order approved | subject, HTML/text, HTTPS link, mobile layout benar; spam placement dicatat |
| Idempotensi | event duplikat, worker concurrent/restart | satu occurrence dan tidak ada duplicate accepted email |
| Retry | SMTP 4xx/network lalu recover | jadwal 1/5/15/60, attempt bounded, correlation tetap |
| Terminal | auth/recipient 5xx | terminal terlihat, in-app fallback bisnis dan alert operasi tersedia |
| Security | inspect log, audit, API operasi | tidak ada token, secret, raw recipient, body, atau raw SMTP response |
| Reminder | saldo 3/1/0 dan expiry H-7/H-3/H-1 | sekali per package/threshold/offset berdasarkan timezone cabang |
| Staging | recipient override | semua tujuan diarahkan ke mailbox UAT; production menolak override |

Rollout dilakukan per fase: auth/order, lalu booking/identity/ledger, lalu reminder/audit/ops. Setiap
fase memiliki observation window 24 jam sebelum fase berikutnya. Catat queue age, accepted/failure
rate, retry, terminal/dead-letter, dan rate-limit wait dari dashboard Operations. Rollback mematikan
sender tetapi tidak menghapus occurrence atau in-app notification.

# SMTP Email Delivery Contract

**Status:** IN_REVIEW  
**Provider baseline:** Niagahoster/Hostinger SMTP, `smtp.hostinger.com:465`, SSL/TLS

## Persistence dan state

Satu `NotificationOccurrence` dibuat dari deterministic key channel + event + recipient/reference +
template version. `NotificationAttempt` mencatat setiap klaim pengiriman. State adalah `PENDING`,
`SENDING`, `ACCEPTED_BY_SMTP`, `FAILED_RETRYABLE`, `FAILED_TERMINAL`, `EXPIRED`, dan
`FALLBACK_IN_APP`. SMTP acceptance tidak membuktikan inbox delivery.

Worker memakai lease 60 detik, maksimum lima attempt, backoff 1/5/15/60 menit, serta limit default
3/menit dan 150/jam. Network/timeout/SMTP sementara diretry; authentication, invalid envelope,
invalid recipient, template invalid, dan SMTP permanent failure menjadi terminal. Manual retry
membutuhkan `operations:recover`, reason, envelope yang masih berlaku, dan audit.

## Data dan security

Alamat tujuan dan template variables disimpan sebagai envelope AES-256-GCM dengan key production
terpisah. Database hanya mengekspos recipient hash/masked, template/version, status, safe error code,
attempt count, occurrence ID, dan correlation ID. Token, SMTP password, encryption key, HTML body,
raw recipient, serta raw provider response tidak boleh masuk log/audit/API operasi.

Envelope dipurge segera setelah SMTP menerima pesan atau occurrence kedaluwarsa. Envelope terminal
dipertahankan maksimum tujuh hari agar recovery berizin masih mungkin, kemudian dipurge otomatis.
Occurrence key, status, masked recipient, correlation ID, dan safe attempt metadata tetap disimpan
untuk idempotensi dan audit; perubahan retention metadata memerlukan persetujuan governance karena
penghapusan key dapat menyebabkan reminder lama terkirim kembali.

Production menolak recipient override. Staging wajib memakai override/allowlist. Secret inventory
mencatat owner, rotasi, environment, dan verification evidence tanpa nilai secret.

## Provider dan rollback

`EMAIL_DRIVER=smtp` adalah baseline. `resend` tetap tersedia hanya sebagai pilihan rollback manual;
failure SMTP tidak berpindah provider otomatis. `EMAIL_DELIVERY_ENABLED=false` menghentikan sender
tanpa menghapus occurrence atau notifikasi in-app.

## Security checklist

- TLS certificate validation aktif (`rejectUnauthorized=true`); port 465 memakai implicit TLS.
- From address tetap `noreply@dailydosepilates.com`; subject/header tidak menerima input pengguna.
- HTML dan plain text berasal dari template register; semua variabel di-escape dan link harus HTTPS.
- Token auth hanya berada di encrypted envelope/link, memiliki expiry, dan tidak masuk log/audit.
- API Operations hanya menampilkan recipient masked dan safe provider/error code.
- Production menolak recipient override; staging tidak boleh mengirim di luar mailbox UAT.
- Password SMTP dan encryption key berbeda, tidak berada di Git/image, dan dirotasi dengan dual
  control Ops/TL.

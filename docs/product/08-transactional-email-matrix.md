# Transactional Email Matrix

**Status:** IN_REVIEW  
**Version:** 1.0  

| Template | Trigger | Recipient | Email | In-app fallback |
|---|---|---|---:|---:|
| `AUTH_ACCOUNT_ACTIVATION_V1` | activation token dibuat | target email | wajib | tidak tersedia sebelum login |
| `AUTH_PASSWORD_SETUP_V1` | invitation/setup token dibuat | target email | wajib | tidak tersedia sebelum login |
| `AUTH_PASSWORD_RESET_V1` | reset request untuk credential valid | target email | wajib | respons selalu generik |
| `ORDER_CREATED_V1` | `order.created.v1` | customer | wajib | ya |
| `ORDER_ACTION_REQUIRED_V1` | `order.action-required.v1` | customer | wajib | ya |
| `ORDER_APPROVED_V1` | `purchase.approved.v1` | customer | wajib | ya |
| `ORDER_REJECTED_V1` | `purchase.rejected.v1` | customer | wajib | ya |
| `BOOKING_CONFIRMED_V1` | `booking.created.v1` | customer | wajib | ya |
| request reschedule | `booking.reschedule_requested.v1` | Admin cabang/Super Owner | tidak dikirim | in-app wajib |
| `RESCHEDULE_APPROVED/REJECTED_V1` | decision reschedule | customer | wajib | ya |
| `CLASS_CANCELLED_V1` | manual cancellation | booked customer | wajib | ya |
| `IDENTITY_APPROVED/ACTION_REQUIRED_V1` | identity decision | customer | wajib | ya |
| `SESSION_ADJUSTMENT_POSTED/REJECTED_V1` | adjustment decision | customer | wajib | ya |
| `PACKAGE_LOW_BALANCE_V1` | available tepat 3, 1, atau 0 | customer | sekali/threshold/package | ya |
| `PACKAGE_EXPIRY_REMINDER_V1` | branch-local H-7/H-3/H-1 | customer | sekali/offset/package | ya |
| `AUDIT_EXPORT_READY_V1` | private export READY | requestor | wajib | ya |
| `OPERATIONS_JOB_FAILED_V1` | terminal operational failure | OPS/Super Owner | wajib | ya |

`available = ledger balance - active reservation`. Paket inactive/expired, user inactive, atau user
tanpa email tidak menerima email. Link selalu memakai `PUBLIC_WEB_BASE_URL` HTTPS. Email audit tidak
memuat artifact atau isi audit; pengguna membuat download authorization dari halaman audit.

## Delivery rules dan acceptance

- Occurrence dibuat atomik bersama source event/projection dan menggunakan deterministic key.
- Satu worker memegang lease 60 detik; lease yang kedaluwarsa dapat direcovery tanpa mengulang attempt
  yang sudah diterima SMTP.
- Retry hanya untuk kegagalan sementara, maksimum lima attempt dengan backoff 1/5/15/60 menit.
- Kegagalan terminal bisnis menghasilkan in-app fallback dan alert OPS/Super Owner; auth failure tidak
  mengungkap apakah akun ada.
- Reset password selalu memberi respons generik `202`; token yang kedaluwarsa tidak dikirim.
- Reminder saldo memakai ledger dikurangi reservation aktif dan tepat sekali untuk setiap
  package/threshold `3/1/0`; expiry memakai tanggal lokal cabang H-7/H-3/H-1.
- Acceptance gagal bila ada duplicate, silent success, raw recipient/token/secret pada log, retry tak
  terbatas, reminder berulang, atau status bernama `DELIVERED`.

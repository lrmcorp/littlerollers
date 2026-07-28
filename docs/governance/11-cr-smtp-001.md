# CR-SMTP-001 — Email Transaksional melalui SMTP Niagahoster

**Status:** IN_REVIEW  
**Requestor/date:** Product Owner / 2026-07-28  
**Approvers:** Product Owner, Technical Lead, QA, Operations  

## Perubahan yang diminta

Baseline lama menjadikan WhatsApp sebagai kanal utama dan email sebagai post-pilot. Perubahan ini
menambahkan email sebagai kanal production wajib menggunakan akun
`noreply@dailydosepilates.com`, SMTP Niagahoster, dan fallback in-app setelah kegagalan terminal.
Tidak ada failover provider email otomatis.

## Dampak

- `DEC-013`, `US-NOT-01`, kontrak notification, OpenAPI, test/UAT, environment, dan runbook berubah.
- Alamat penerima dan variabel sensitif diantrikan dalam envelope AES-256-GCM; secret tidak masuk
  Git, log, audit, atau response operasi.
- SMTP acceptance tidak disebut delivery. Status sukses tertinggi adalah `ACCEPTED_BY_SMTP`.
- Aktivasi production memerlukan MX/SPF/DKIM/DMARC, smoke SMTP dari container, UAT lintas mailbox,
  monitoring, dan sign-off PO/TL/QA/Ops.

## Keputusan

**Recommendation:** APPROVE setelah provider evidence dan review dokumen selesai.  
**Decision:** PENDING — implementasi lokal diizinkan; production tetap diblokir.

| Approval | Owner | Status | Evidence minimum |
|---|---|---|---|
| Product scope | Product Owner | PENDING | matrix event/recipient dan copy disetujui |
| Architecture/security | Technical Lead | PENDING | TLS, encryption, retry, retention, rollback direview |
| Test/UAT | QA | PENDING | P0/P1 test dan mailbox matrix lulus |
| Production readiness | Operations | PENDING | hPanel, DNS, secret, smoke, dashboard, rollback terverifikasi |

Tidak satu pun status PENDING boleh ditafsirkan sebagai sign-off. `EMAIL_DELIVERY_ENABLED=true` di
production hanya boleh diterapkan setelah seluruh baris berstatus APPROVED dan evidence ditautkan.

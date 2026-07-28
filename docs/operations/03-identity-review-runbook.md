# Runbook Review Verifikasi Identitas

**Status:** DRAFT — production activation requires PO/TL/QA/Ops sign-off  
**Feature flag:** `IDENTITY_REVIEW_ENABLED`

## Tujuan dan otoritas

Runbook ini digunakan untuk review Selfie dan KTP customer melalui tab **Customer** pada
`/users` atau antrean `/identity-verifications`. Review bersifat global dan tidak mengikuti cabang.
Actor wajib memiliki session valid dan capability global yang sesuai:

- `user:read` global untuk menemukan customer;
- `identity-verification:read` untuk melihat status dan preview privat;
- `identity-verification:decide` untuk approve/reject;
- `identity-verification:delete` untuk penghapusan.

Tidak ada MFA. Admin cabang tidak memiliki akses dokumen identitas.

## Prosedur review

1. Cari customer dari `/users`, tab **Customer**, lalu gunakan filter status verifikasi.
2. Buka detail customer dan periksa ringkasan Selfie/KTP.
3. Klik **Periksa dokumen**. Sistem tidak memuat gambar sebelum tindakan eksplisit ini.
4. Preview hanya diterbitkan bila upload `FINALIZED`, scan `CLEAN`, file masih aktif, dan actor
   tetap memiliki permission global.
5. Cocokkan dokumen menggunakan pedoman operasional yang disetujui. Jangan mengunduh,
   mengambil tangkapan layar, atau memindahkan dokumen ke media lain.
6. Approve atau reject dengan reason code terkontrol. Jangan memasukkan nomor KTP atau PII ke
   catatan.
7. Pastikan status customer berubah dan audit/outbox/notifikasi tercatat satu kali.

Authorization preview terikat pada viewer, sekali pakai, berumur singkat, dan divalidasi ulang saat
file dibaca. Perubahan scan/upload/replacement/deletion setelah authorization diterbitkan membuat
read ditolak. Respons file memakai `Cache-Control: private, no-store`.

## Penanganan masalah

| Gejala | Tindakan |
|---|---|
| `CONFIGURATION_REQUIRED` | Pastikan UAT/sign-off selesai sebelum mengaktifkan flag; jangan bypass gate. |
| `FORBIDDEN` atau customer tab tidak tersedia | Verifikasi grant global dan login ulang setelah perubahan RBAC. Jangan memberi override cabang. |
| Preview `NOT_FOUND` | Periksa lifecycle aman: `FINALIZED`, `CLEAN`, aktif, tidak replaced/deleted; terbitkan authorization baru bila yang lama expired/used. |
| Scan `PENDING/ERROR/INFECTED/REJECTED` | Jangan preview. Pulihkan scanner atau minta customer upload ulang sesuai SOP. |
| Keputusan stale | Muat ulang record dan ulangi review; jangan menggunakan versi lama. |
| Notifikasi/email gagal | Gunakan occurrence/correlation ID pada dashboard operasi; ikuti SMTP runbook dan fallback in-app. |

## Rollout dan rollback VPS

1. Deploy dengan `IDENTITY_REVIEW_ENABLED=false`.
2. Jalankan migration dan inspeksi role/override legacy.
3. Verifikasi `SUPER_OWNER` memiliki ketiga capability baru dan Admin tidak memilikinya.
4. Jalankan UAT dengan data non-production.
5. Dapatkan sign-off PO/TL/QA/Ops, lalu aktifkan flag tanpa perubahan kode.
6. Pantau denied access, preview failure, stale authorization, decision failure, audit, outbox,
   dan notification occurrence selama 24 jam.
7. Rollback dengan mengubah flag ke `false`. Jangan menghapus dokumen, authorization, audit, atau
   histori keputusan.

## Evidence minimum

Catat release/commit, actor test, customer test, document ID, correlation ID, authorization ID,
decision audit ID, outbox ID, notification occurrence ID, hasil negative test Admin, serta bukti
tidak ada object key/token/PII mentah pada log.

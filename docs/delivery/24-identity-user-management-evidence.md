# Integrasi Management Pengguna dan Verifikasi Identitas — Evidence

**Status:** LOCAL AUTOMATED PASS / DATABASE MIGRATION AND MANUAL UAT PENDING  
**Production:** BLOCKED; `IDENTITY_REVIEW_ENABLED=false`

## Scope yang diimplementasikan

- Capability global-only `identity-verification:read`, `identity-verification:decide`, dan
  `identity-verification:delete`.
- Capability legacy `identity-verification:review` dinonaktifkan tanpa menghapus histori grant.
- `SUPER_OWNER` memperoleh ketiga capability; `ADMIN` kehilangan akses default.
- Runtime policy menolak global-only capability dari role cabang dan override cabang.
- `/users` memiliki tab **Staf** dan **Customer**, pencarian, status akun, dan filter verifikasi.
- Detail customer menampilkan ringkasan aman Selfie/KTP dan deep-link eksplisit ke reviewer.
- Endpoint `GET /users/{id}/identity-verification` hanya menerima global `user:read` dan
  `identity-verification:read`.
- Preview tetap privat, viewer-bound, single-use, expiring, serta revalidasi `FINALIZED`, `CLEAN`,
  active, dan not-replaced pada authorization maupun file read.
- Approve/reject/delete memakai capability terpisah. Gambar, object key, token, dan PII mentah
  tidak ditambahkan ke respons pengguna umum.

## Artefak

| Area | Referensi |
|---|---|
| Data migration | `20260730090000_identity_review_global_access` |
| Runtime config | `IDENTITY_REVIEW_ENABLED` |
| API contract | `/users?audience=CUSTOMER`, `/users/{id}/identity-verification`, `customerUserId` review filter |
| RBAC | `globalOnly` pada capability definition dan effective scoped grant |
| Web | `/users`, `/users/{id}`, `/identity-verifications?customerUserId=...` |
| Operations | `docs/operations/03-identity-review-runbook.md` |

## Automated evidence — 2026-07-28

| Check | Hasil |
|---|---|
| API TypeScript | PASS |
| Web TypeScript | PASS |
| API identity/policy unit test | PASS — 2 suite, 23 test |
| API non-integration regression | PASS — 26 suite, 96 test |
| API identity MySQL integration | PASS — 1 suite, 15 test |
| Web component/a11y regression | PASS — 29 file, 114 test |
| Web identity Playwright | PASS — 5 focused test |
| Worker notification regression | PASS — 7 suite, 15 test |
| Runtime configuration | PASS — 9 test termasuk production fail-closed |
| OpenAPI validation | PASS — `1.13.0-draft`, 166 operation |
| Generated TS/Dart drift | PASS — 302 TypeScript dan 309 Dart file byte-for-byte |
| MySQL migration | PENDING — status read-only mengonfirmasi migration `20260730090000_identity_review_global_access` belum diterapkan dan perubahan database lokal membutuhkan persetujuan eksplisit |
| Manual browser UAT | BLOCKED — aplikasi Web/API aktif, tetapi login dengan fixture Super Owner berhenti pada configuration gate karena `RBAC_POLICY_SOURCE=database` memerlukan schema migration baru |

Percobaan menjalankan seluruh Playwright suite secara tidak sengaja melalui wrapper package
menjalankan 69 test: 62 lulus dan 7 regresi lama/tidak terkait gagal. Dua spesifikasi identitas
kemudian dijalankan langsung dan seluruh 5 test lulus. Kegagalan suite lain tidak dihitung sebagai
evidence fitur ini dan tetap perlu triage terpisah.

## UAT wajib

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| UAT-IDV-01 | Customer upload Selfie/KTP asli lalu finalize/scan | Customer muncul di tab Customer; status aman tampil |
| UAT-IDV-02 | Admin cabang membuka tab/endpoint/preview/decision/delete | Tidak tersedia atau ditolak; tidak ada informasi dokumen |
| UAT-IDV-03 | Super Owner membuka detail dan preview | Preview explicit, private, sekali pakai, dan audit authorization/view tercatat |
| UAT-IDV-04 | Gunakan authorization dari viewer lain, dua kali, atau setelah expiry | Seluruh read ditolak |
| UAT-IDV-05 | Ubah scan/upload/file menjadi tidak eligible setelah authorization | Read ditolak saat revalidasi |
| UAT-IDV-06 | Approve/reject dengan actor berizin | Tepat satu audit, outbox, in-app, dan email occurrence; status UI diperbarui |
| UAT-IDV-07 | Actor hanya memiliki `user:read` | Profil customer terlihat tanpa status/dokumen identitas |
| UAT-IDV-08 | Reviewer custom GLOBAL dan role/override BRANCH | Global reviewer berhasil; grant bercabang ditolak/tidak efektif |

## Production gate

Production hanya boleh diaktifkan setelah migration berhasil, seluruh UAT di atas lulus, log
dipastikan tidak memuat PII/object key/token, email occurrence diverifikasi, dan PO/TL/QA/Ops
menandatangani evidence. Rollback adalah mematikan feature flag tanpa menghapus dokumen atau
histori.

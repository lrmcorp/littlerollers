# Struktur Repository dan Ownership Implementasi

## Batas domain backend

- `apps/api/src/public-content`: seluruh query publik untuk paket, jadwal, kelas, studio, dan konfigurasi situs. Module lain tidak boleh membangun projection pemasaran sendiri.
- `apps/api/src/classes`: lifecycle class slot, availability, attendance, dan operasi kelas.
- `apps/api/src/packages`: katalog internal, rekening pembayaran, order customer, bukti pembayaran, dan review pembayaran. Setiap workflow berada pada service tersendiri.
- `apps/api/src/master`: administrasi branch, class type, effective configuration, dan public profile. Policy scope dan audit berada pada helper domain bersama.
- `apps/api/src/identity`: authentication/session, administrasi pengguna, assignment, profile customer, antrean verifikasi, dan akses dokumen privat. Query antrean dan akses file tidak diletakkan pada service autentikasi.

Controller hanya menerjemahkan HTTP ke command/query domain. Authorization, branch scope, optimistic locking, idempotency, dan audit tetap diperiksa di service backend.

## Batas frontend

- Route file menjadi container tipis yang memilih shell dan memasok route parameter.
- State dan workflow domain berada di folder fitur route.
- Primitive lintas fitur berada di `apps/web/app/components/admin`, `customer`, atau `public`.
- Transport API publik memakai generated TypeScript client melalui `public-api-client.ts`. Adapter handwritten hanya boleh menambahkan cookie/authentication, pemetaan error, atau view-model.
- Data pemasaran berasal dari endpoint `public-content`; tidak ada katalog bisnis statis di browser.

## Generated code

Sumber kontrak adalah `docs/technical/openapi-v1.yaml`. Direktori berikut tidak diedit manual:

- `packages/api-client-ts/generated`
- `packages/api-client-dart/lib/generated`

Perubahan kontrak dijalankan melalui `pnpm openapi:validate`, `pnpm openapi:generate`, lalu `pnpm openapi:drift`.

## Ownership CSS dan font

- `tailwind.css` memuat Tailwind dan design token.
- `globals.css` hanya memiliki reset, token, font, dan accessibility base.
- `legacy-ui.css` serta `legacy-compatibility.css` adalah lapisan transisi untuk consumer lama; komponen baru tidak boleh menambah selector di sana dan setiap blok dihapus bersama consumer terakhirnya.
- Styling komponen baru wajib memakai utility Tailwind.
- Compatibility selector harus berada di bawah `.legacy-public`, `.legacy-customer`, atau `.legacy-admin`, lalu dihapus bersama consumer terakhir.
- Poppins lokal adalah satu-satunya runtime font. Nama utility `font-serif` tidak dipakai karena menyesatkan meskipun pernah diarahkan ke Poppins.

## Aturan refactor

- Jangan memindahkan business rule ke controller atau frontend.
- Jangan membuat fallback static ketika data public profile tidak lengkap.
- Jangan menambah handwritten contract yang sudah dihasilkan OpenAPI.
- Setiap pemecahan service harus mempertahankan transaction boundary dan characterization test workflow asal.
- File besar dipecah berdasarkan workflow, bukan sekadar jumlah baris.

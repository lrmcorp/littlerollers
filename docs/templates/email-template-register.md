# Email Template Register

**Status:** IN_REVIEW

Setiap template memiliki stable key, version, trigger, recipient policy, subject, HTML dan plain-text,
allowed variables, owner, reviewer, approval, serta replacement reference. Version tidak diedit setelah
production send; perubahan copy material membuat version baru.

Allowed variables v1 hanya `href` HTTPS dan `detail` yang di-escape. Template tidak menerima raw HTML,
header, recipient, token terpisah, provider payload, bukti pembayaran, atau isi audit. Template auth
menerima token hanya sebagai bagian URL terenkripsi dan occurrence kedaluwarsa bersama token.

Daftar v1 dan trigger otoritatif berada pada
`docs/product/08-transactional-email-matrix.md`; copy executable berada di package
`@dailydose/notification-core` dan harus cocok melalui review/test snapshot.

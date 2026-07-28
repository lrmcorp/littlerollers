# BG-2 Reschedule Evidence — US-BKG-02

**Status:** `IMPLEMENTED LOCALLY — PRODUCTION/UAT AND MYSQL INTEGRATION RE-RUN BLOCKED`
**Updated:** 2026-07-28

## Implemented boundary

- Customer Web memperoleh options backend-authoritative, controlled reason, explicit confirmation, pending/result state dan arahan studio setelah cutoff.
- Request sebelum atau tepat H-24 membuat satu pending request tanpa memindahkan reservation. Request setelah boundary ditolak tanpa mutasi.
- Admin cabang/Super Owner dapat approve/reject; approval requester sendiri ditolak. Approval merevalidasi target, capacity, package, reservation dan duplicate customer booking di bawah lock.
- MySQL generated active-key dan unique index mencegah dua booking aktif untuk Customer/ClassSlot yang sama.
- Request menghasilkan staff in-app notification. Approved/rejected menghasilkan customer in-app dan email occurrence melalui notification worker.
- Production memakai `BOOKING_ENABLED`/`RESCHEDULE_ENABLED`; contoh production tetap `false` sampai approval dan UAT.

## Evidence lokal terkini

| Pemeriksaan | Hasil |
|---|---|
| OpenAPI | PASS — `1.12.0-draft`, checksum `7f0b0cd5...1f4793`, 152 operation IDs |
| Generated clients | PASS drift — 265 TypeScript dan 272 Dart files byte-for-byte; generator dijalankan melalui local Java/JAR, tanpa container |
| Workspace typecheck | PASS — 12/12 tasks |
| API non-database | PASS — 23 suites / 86 tests |
| Worker | PASS — 7 suites / 13 tests termasuk staff projection request |
| Web | PASS — 26 files / 100 tests termasuk customer reschedule dan axe |
| Prisma schema | PASS validate |
| MySQL integration/migration | PENDING — MySQL lokal `127.0.0.1:3306` tidak berjalan dan Docker tidak dinyalakan sesuai instruksi |

## Remaining blockers

- Jalankan migrasi pada database staging kosong dan salinan data yang sudah diperiksa duplicate active booking; kemudian jalankan seluruh MySQL integration/concurrency suite.
- Selesaikan browser/device UAT customer Web → queue Admin → approve/reject → in-app/email dan simpan evidence/correlation ID.
- Dapatkan sign-off PO/TL/QA/Ops sebelum mengubah `RESCHEDULE_ENABLED=true` pada VPS.
- Flutter customer UI merupakan follow-up dan tidak memblokir rilis Web v1.

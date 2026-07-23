# Frontend Page Inventory dan Route Map

**Status:** `EXECUTABLE REPOSITORY BASELINE`  
**Tanggal:** 2026-07-23  
**Scope:** Web-first, synthetic non-production

Dokumen ini menetapkan halaman yang dibutuhkan, audience, capability, state minimum dan status implementasi Web. Registry executable berada di `apps/web/app/frontend-pages.ts`. Backend tetap menjadi authorization boundary; visibility navigation hanya bantuan usability.

## Route Inventory

| Route | Audience utama | Read capability | Mutation capability | State wajib | Status Web |
|---|---|---|---|---|---|
| `/` | publik/calon pelanggan | public | none | hero, approach, class formats, locations, brand CTA, responsive footer | implemented local public baseline |
| `/sign-in` | semua pengguna | public | provider/MFA session flow | idle, loading, configuration, rate limit, recovery, expired, success | implemented synthetic |
| `/workspace` | seluruh sesi internal | authenticated | n/a | session loading/error, explicit branch, role-aware cards, assurance/expiry | implemented |
| `/bookings` | Admin, Super Owner | `booking:read` atau `reschedule:read` | `booking:create:assisted`, `reschedule:decide` + MFA | discovery, confirmation, replay, cutoff, full, stale, offline, expired | implemented Web-first |
| `/classes` | publik/calon pelanggan | public read-safe catalog | none; booking mengarah ke autentikasi | explicit studio, 14-day schedule, date/type filter, status/capacity, empty/dependency/retry | implemented local public baseline |
| `/workspace/classes` | Admin, Manager, Super Owner | `class-slot:read` | `class-slot:manage` + MFA untuk publish/cancel | weekly timetable tujuh hari, agenda mobile, create/detail side panel, assign, publish/cancel, filter, configuration, availability, conflict/stale, hidden, offline/session | implemented Web-first local |
| `/purchases` | Customer; Manager/Super Owner reviewer | `package:read` atau `purchase:review` | customer submit; `purchase:decide` + MFA | capability-aware submission/review, package cards, private proof lifecycle, queue/filter/pagination, decision panel, replay/stale/provider/session states | implemented Web-first local |
| `/ledger` | Customer dan internal scoped roles | `ledger:read` | adjustment request/decide capabilities | balance, history, pagination, invariant, SoD, stale | implemented synthetic |
| `/users` | Admin/scoped reader | `user:read` | `user:admin` + MFA | list, invite, deactivate, hidden, conflict, confirmation | implemented synthetic |
| `/assignments` | Super Owner | `assignment:read` | `assignment:manage` + MFA | list, create/end, effective period, overlap, stale | implemented synthetic |
| `/master` | Super Owner/Finance | `master:read` | `master:manage`; finance capability untuk fee/rate | lifecycle, history, overlap, configuration, stale | implemented synthetic |
| `/operations` | OPS, Super Owner | `operations:read` | `operations:recover` + MFA | queued, retrying, locked, late, terminal, recovery | implemented synthetic |
| `/health` | public/support | public safe health | none | ready, degraded, not-ready, dependency timeout | implemented |

## Navigation dan Dashboard Rules

- `/` merupakan brand landing publik dan tidak memanggil `/me` sebagai syarat render. Dashboard internal dipindahkan secara kompatibel ke `/workspace`.
- `/me` menyediakan display name, role, capability, assurance, branch aktif yang boleh dipilih, timezone dan session expiry.
- Route registry tunggal menggerakkan sidebar dan dashboard untuk mencegah label/capability drift.
- Dashboard hanya menampilkan card bila salah satu read capability efektif tersedia. Label “Baca & tindakan” hanya muncul bila mutation capability juga efektif.
- Multi-branch actor wajib memilih cabang sendiri. Dashboard tidak memilih branch pertama dan tidak menyediakan mutation “semua cabang”.
- Direct URL tetap melewati route gate dan API authorization; halaman tersembunyi tidak dianggap sebagai kontrol keamanan.

## `/classes` Weekly Timetable

- Route publik `/classes` hanya memproyeksikan branch aktif, class type aktif, slot masa depan `PUBLISHED/CONFIRMED`, timezone, kapasitas dan tempat tersisa. Instructor/customer/booking/quota internal tidak diekspos. Operator timetable berada di `/workspace/classes`.
- Desktop dan tablet memakai tujuh kolom Senin–Minggu dalam timezone IANA cabang aktif. Mobile 360 memakai agenda berurutan; grid desktop tidak diperkecil menjadi tabel yang sulit dibaca.
- Discovery memuat class slot pada minggu aktif, class type aktif, serta user aktif dengan assignment `INSTRUCTOR` efektif pada cabang/periode tersebut. Nama menjadi label utama dan identifier hanya referensi sekunder.
- Navigasi minggu, filter status/class type/instructor, loading, empty, filtered-empty, configuration, availability, schedule conflict, stale version, hidden resource, offline, success, dan session expiry merupakan state executable.
- Panel samping mempertahankan konteks kalender. Create mengubah tanggal/jam branch-local menjadi RFC3339 tanpa memakai timezone mesin; detail mengirim `expectedVersion` authoritative untuk assign, publish, dan cancel.
- Publish/cancel memerlukan MFA dan capability. Cancellation hanya memakai controlled reason code. Tidak ada optimistic mutation, drag-and-drop, recurrence, room allocation, atau default quota/capacity frontend.

## `/purchases` Submission dan Review Workspace

- Role `CUSTOMER` melihat package submission; actor dengan `purchase:review` melihat internal queue. Keputusan hanya aktif dengan `purchase:decide` dan MFA. Backend tetap authorization boundary.
- Submission memakai kartu package authoritative, file picker PNG/JPEG/PDF, SHA-256 Web Crypto lokal, status scan, polling, replacement, confirmation komersial, dan stable idempotency intent. Checksum dan opaque provider reference tidak ditampilkan.
- Review memakai filter status, keyset pagination, customer label aman, commercial snapshot, serta side panel dengan proof authorization sementara, `expectedVersion`, controlled rejection code, dan hasil server authoritative.
- Active branch atau session authority change membersihkan discovery, selection, proof, queue, panel, cursor, dan intent. Tidak ada ID teknis manual atau pilihan pertama otomatis.
- State executable mencakup loading, empty/filtered-empty, pending/clean/unsafe/error, configuration/provider/offline, hidden, replay/conflict/stale, MFA, success, dan session expiry.

## Halaman Lanjutan yang Belum Dibuka

| Calon route | Dependency | Status |
|---|---|---|
| `/attendance` | story attendance/check-in dan policy completion | pending story/evidence |
| `/reports` | finance/reporting contract dan production decision | pending |
| `/notifications` | provider serta notification policy | blocked |
| `/profile` | profile mutation policy dan provider account-linking production | pending |
| Customer self-service Web | keputusan channel Web customer versus Flutter | deferred |

Figma final, visual approval Product Owner, browser/device UAT, production content, dan Gate 3 tetap `TBD-BLOCKING`.

## Public Landing Baseline

- Struktur publik mencakup header, editorial hero, pendekatan latihan, format kelas resmi, lokasi studio, brand statement, CTA, dan footer.
- Konten format kelas dan lokasi direkonsiliasi terhadap situs resmi Daily Dose Pilates pada 2026-07-23; harga, promo, jadwal, instructor, dan klaim hasil tidak difabrikasi.
- Primary color `#396552`, logo resmi, serif editorial, canvas hangat, botanical geometry, non-image-dependent hero, focus visibility, reduced motion, dan breakpoint 1280/768/360 menjadi baseline lokal.
- CTA transaksi diarahkan ke `/sign-in`; backend/customer session tetap menjadi authorization boundary. Halaman publik tidak membuka package, booking, atau data branch privat.

## Local Evidence 2026-07-23

- Public landing: component/axe PASS; Playwright desktop/tablet/mobile PASS dengan baseline screenshot; browser langsung memverifikasi title, favicon, 7 section, tanpa internal shell/horizontal overflow, dan tanpa console error.
- Web TypeScript, component, dan accessibility: 36 tests PASS.
- Playwright: 26 tests PASS, termasuk dashboard/navigation pada 1280, 768, dan 360 serta session revocation.
- Next.js standalone production build PASS untuk 15 route aplikasi + favicon setelah `/workspace` ditambahkan. Kegagalan sementara `ENOSPC` tidak berulang pada build bersih.
- Perubahan tetap unstaged serta belum di-commit/push sesuai instruksi pengguna.
- `/classes`: 9 focused classes/timezone component tests, full 43 component/a11y, 26 Playwright termasuk lifecycle/configuration dan visual 1280/768/360, production build 14 route, serta `pnpm check` PASS.
- `/purchases`: 5 focused component/a11y dalam total 42 Web tests, 26 Playwright termasuk submission/provider/review dan visual 1280/768/360, production build 14 route, serta `pnpm check` PASS.

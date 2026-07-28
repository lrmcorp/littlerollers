# Frontend Design Baseline

Status: `LOCAL IMPLEMENTATION / INTERIM EXECUTABLE REFERENCE`  
Tanggal: 2026-07-23  
Scope: Web light theme, synthetic non-production

## Tujuan dan Batas Otoritas

Dokumen ini menjadi source of truth repository untuk implementasi frontend sebelum artefak Figma final tersedia. Baseline ini menjaga konsistensi dan membuat acceptance dapat dieksekusi, tetapi **bukan pengganti Figma**, visual approval Product Owner, device/browser UAT, atau Gate 3. Semua Figma node URL/version dan acceptance production tetap `TBD-BLOCKING`.

Navigation visibility membantu usability. Backend tetap satu-satunya authorization boundary untuk capability, role, branch, assurance, dan resource state.

## Design Tokens

| Kelompok | Baseline |
|---|---|
| Brand | primary `#396552`; strong `#274a3d`; soft `#e8f0ec` |
| Surface | canvas hangat, surface putih, muted surface; border netral hijau-abu |
| Status | success, information, warning, danger selalu memakai warna + teks/ikon |
| Typography | Poppins lokal untuk seluruh body, heading, navigation, form, tabel, status, dan tombol; body minimum 16px dan control minimum 14px |
| Spacing | skala 4, 8, 12, 16, 20, 24, 32, 40, 48 px |
| Radius | small untuk control, medium untuk panel, large untuk workspace card |
| Elevation | shadow kecil untuk item; sedang untuk card utama; tidak menjadi indikator status |
| Focus | outline brand 2px, offset 3px, visible pada link/control/region |
| Breakpoint | desktop `>960`, tablet `641–960`, mobile `<=640` |

Implementasi otoritatif token berada di `apps/web/app/globals.css`. Logo memakai aset resmi `https://dailydosepilates.com/assets/images/logo.png` dan memiliki fallback text/alt yang bermakna.

## Component Inventory

| Primitive | Anatomy/variant | Aturan |
|---|---|---|
| Application shell | logo, grouped navigation, environment, topbar, workspace | sidebar desktop; rail tablet; horizontal navigation mobile |
| Role-aware dashboard | greeting, assurance/expiry, active branch, capability-filtered work cards, session summary | tidak menampilkan halaman di luar capability; branch tidak dipilih otomatis |
| Page header | eyebrow, title, description, context | branch/role/timezone/MFA ditempatkan pada context |
| Button | primary, destructive/secondary melalui konteks aksi | label berbentuk kata kerja; disabled bukan satu-satunya penjelasan |
| Form field | label, control, hint/error | label programatik; error aman dan fokus dapat dipindahkan |
| Status badge | neutral/info/success/warning/danger | wajib memiliki teks; warna bukan satu-satunya sinyal |
| Feedback/banner | status/error/warning/info | async memakai live region; error memakai alert |
| Skeleton/empty state | progress placeholder atau title + next action | tidak meniru data sensitif |
| Confirmation panel | consequence title + summary | wajib untuk destructive/financial mutation |
| Data region | accessible overflow + table/list | region fokus; heading/column context dipertahankan |
| Filter/pagination | labeled controls + cursor action | state filter tetap terlihat; cursor rusak dipetakan aman |
| Public landing shell | logo, anchor navigation, editorial hero, content sections, CTA, footer | tidak bergantung sesi; desktop/tablet/mobile; tidak mengekspos data privat |
| Authentication shell | approved brand image, logo, Google CTA, provider/MFA status, safe return | full-screen tanpa internal sidebar; tidak menambahkan password/OTP yang belum didukung |

## Responsive dan Accessibility

- Desktop 1280+: sidebar 264px dan content workspace sampai 1440px.
- Tablet 768: navigation rail 88px, label aktif tetap terbaca, form dapat dua kolom.
- Mobile 360: navigation memakai drawer, seluruh form satu kolom, dan tidak ada aksi kritis yang hanya tersedia lewat hover.
- Table menggunakan overflow pada region berlabel; informasi row tetap memiliki heading/label semantik.
- Urutan heading, label, keyboard, visible focus, reduced motion, live region, dan confirmation panel merupakan acceptance wajib.
- Contrast target WCAG 2.2 AA. Status selalu memadukan copy dan visual marker non-color.

## Screen dan Route Mapping

Inventaris lengkap route/capability/status berada di `docs/design/08-frontend-page-inventory.md`. Konfigurasi executable untuk navigation dan dashboard berada di `apps/web/app/frontend-pages.ts` agar label, grouping dan capability tidak mengalami drift antar-komponen.

| Screen ID | Route | Kelompok layar | State executable |
|---|---|---|---|
| SCR-P-01 | `/` | public brand landing | hero, approach, official class formats, studio locations, CTA, responsive footer |
| SCR-P-03 | `/packages` | public authoritative package catalog | explicit studio, active package cards, class type, Rupiah/session/duration, empty/dependency/retry, auth handoff |
| SCR-P-04 | `/locations` | public approved studio directory | official studio/area labels, schedule/package links, missing-operational-detail notice |
| SCR-P-05 | `/contact` | public support routing | schedule/package self-service, official contact link, no-PII privacy notice |
| SCR-W-01 | `/sign-in` | auth/MFA/recovery boundary | idle, loading, success, configuration, rate limit, expired MFA, forbidden, conflict, session revoked |
| SCR-W-02 | `/users`, `/assignments` | user/role/branch/effective period | scoped user table/filter/cursor/detail, invite, fixed-role matrix, direct-role update, deactivate/reactivate, per-user audit; assignment selector/lifecycle; MFA, stale, confirmation, success, hidden/error |
| SCR-W-03 | `/master` | branch/class/fee/rate/quota | list, create, inactive, history, overlap, stale, configuration |
| SCR-W-04 | `/purchases` | capability-aware package/proof submission + internal review | package cards, file/hash boundary, scan poll/replace, pending submit, queue/filter/pagination, private proof panel, approve/reject, MFA, stale/replay/provider/session |
| SCR-W-05 | `/ledger` | balance/history/adjustment | loading, empty, active/expired, invariant, request/review, SoD, stale |
| SCR-P-02 | `/classes` | public authoritative class catalog | explicit studio, 14-day schedule, date/type filter, availability, empty/dependency/retry, auth handoff |
| SCR-W-06 | `/workspace/classes` | weekly timetable lifecycle | calendar Senin–Minggu desktop/tablet; agenda mobile; create/detail side panel; filter; assign; publish/cancel; configuration, availability, overlap, MFA, stale, hidden, offline/session |
| SCR-W-07 | `/operations` | H-24 jobs/recovery | queued, retrying, locked, late, confirmed, auto-cancelled, configuration, MFA |
| SCR-W-08 | `/bookings` | assisted booking dan reschedule review | explicit active branch; authoritative customer/package/class selectors; balance/capacity/timezone confirmation; reschedule queue dengan approve/reject MFA; loading, empty, pagination, success/replay, cutoff, full, stale, hidden, offline/session |

Sembilan route tersebut sengaja direkonsiliasi menjadi delapan screen groups karena `/users` dan `/assignments` merupakan satu kelompok administrasi identitas.

## Acceptance Matrix

| Route/group | Loading/empty | Validation | Hidden/forbidden | Offline/config | Replay/conflict | Confirmation/success | Session expired |
|---|---:|---:|---:|---:|---:|---:|---:|
| Sign-in | ✓/n.a. | ✓ | ✓ | ✓ | conflict | ✓ | ✓ |
| Users/Assignments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Master | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Purchases | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ledger | ✓ | ✓ | ✓ | offline | ✓ | ✓ | ✓ |
| Classes | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Operations | ✓ | recovery | ✓ | ✓ | locked/retry | ✓ | ✓ |
| Bookings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

`✓` berarti state memiliki executable implementation/fixture pada source/test terkait, bukan production acceptance.

## Copy dan Security Rules

- Copy Bahasa Indonesia, action-oriented, dan menyebut konsekuensi sebelum mutation.
- Enum/problem code mentah dipetakan ke pesan aman; correlation ID dapat dipakai untuk dukungan tanpa menampilkan PII.
- Branch, timezone, role/capability, assurance/MFA, dan efek mutation harus tampak di area konteks atau confirmation.
- Token, OTP, proof, signed URL, provider payload, email/telepon produksi, dan reason bebas tidak boleh masuk UI telemetry atau screenshot fixture.

## Authoritative Session dan Capability Context

- `GET /me` adalah satu-satunya sumber Web untuk display name, role, capability, assurance, masa berlaku sesi, serta branch aktif yang boleh dipilih.
- Route internal menahan render sampai sesi tervalidasi; 401 mengarahkan ke `/sign-in` dengan `returnTo` relatif yang telah disanitasi. `/`, `/classes`, `/packages`, `/locations`, `/contact`, dan `/sign-in` tetap publik. `/health` memerlukan global `operations:read`; dashboard internal berada di `/workspace` dan timetable operator di `/workspace/classes`.
- Navigation disaring berdasarkan capability untuk usability. Direct URL, query branch, dan setiap mutation tetap diverifikasi backend.
- Branch dipilih eksplisit, disimpan per tab melalui `sessionStorage`, dan dihapus bila tidak lagi terdapat pada branch context `/me`. Tidak ada fallback branch pertama atau `all branches`.
- Step-up MFA wajib memuat ulang `/me`; badge assurance tidak boleh dinaikkan hanya dari state frontend.
- Response 401 dari adapter bisnis memicu revocation event lokal, membersihkan context dan branch selection, lalu menjalankan re-authentication tanpa optimistic mutation.
- Assisted booking memakai active branch untuk memuat pelanggan aktif, customer package yang masih berlaku dan memiliki saldo, serta class slot `PUBLISHED/CONFIRMED` yang cocok. Pilihan turunan selalu dihapus ketika branch/customer/package berubah; frontend eligibility hanya bantuan UX dan tidak menggantikan validasi backend.
- Queue reschedule hanya terlihat untuk `reschedule:read`; keputusan memerlukan `reschedule:decide` dan assurance MFA. UI menampilkan sumber, target, cutoff, controlled reason, version dan konsekuensi tanpa free text atau pemindahan reservation optimistik.
- Timetable kelas memakai timezone cabang dari session context, bukan timezone mesin. Minggu selalu dimulai Senin; input lokal dikonversi deterministik ke RFC3339 dan waktu DST yang tidak ada ditolak. Desktop/tablet memakai grid tujuh hari, sedangkan mobile memakai agenda berurutan.
- Panel create/detail kelas menjaga konteks kalender, memuat label class type/instructor authoritative, dan tidak memilih opsi pertama secara otomatis. Assign hanya berlaku untuk `DRAFT`; publish/cancel memakai versi authoritative, MFA, controlled reason, dan hasil server tanpa optimistic mutation.
- Purchase workspace menampilkan submission hanya untuk Customer dan internal queue hanya untuk reviewer. File checksum dihitung lokal tanpa ditampilkan; proof authorization dibuka sementara memakai `noopener,noreferrer`; URL, checksum, dan provider reference tidak disimpan ke state persisten atau telemetry.
- Package, proof, purchase, customer label, cursor, version, dan keputusan berasal dari generated clients. Branch/session change mereset seluruh selection dan intent; retry mempertahankan key intent yang sama hingga hasil authoritative diterima.

## Strategi Migrasi Tailwind

- Tailwind CSS v4 menjadi lapisan styling utama baru dengan token brand Daily Dose pada `app/tailwind.css`.
- Tahap 1 mencakup shared public header, public footer, brand mark, dan layar autentikasi. Komponen tersebut memakai utility class dan tidak lagi bergantung pada selector khusus lama.
- CSS global tetap memegang reset, accessibility primitives, dan komponen internal yang belum dimigrasikan.
- Halaman publik dimigrasikan berikutnya per kelompok agar visual, state data authoritative, serta pengujian responsif dapat diverifikasi sebelum selector lama dihapus.
- Urutan berikutnya: primitive publik dan landing, Studios, Kelas/Paket/Kontak, lalu primitive dan halaman dashboard internal.
- Selector lama hanya dihapus ketika seluruh pemakainya sudah berpindah dan test/build terkait telah lulus.

## Gate Disposition

`FRONTEND DESIGN BASELINE = LOCAL PASS` hanya setelah typecheck, component/axe, Playwright responsive/keyboard/state, production build, dan `pnpm check` hijau. Figma node/version, visual QA manusia, Product Owner approval, browser/device UAT, production configuration, dan `Gate 3 / PG-1` tetap `TBD-BLOCKING`.

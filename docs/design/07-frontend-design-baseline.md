# Frontend Design Baseline

Status: `LOCAL IMPLEMENTATION / INTERIM EXECUTABLE REFERENCE`  
Tanggal: 2026-07-22  
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
| Typography | system sans-serif; heading ringkas; body minimum 16px pada mobile |
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
| Page header | eyebrow, title, description, context | branch/role/timezone/MFA ditempatkan pada context |
| Button | primary, destructive/secondary melalui konteks aksi | label berbentuk kata kerja; disabled bukan satu-satunya penjelasan |
| Form field | label, control, hint/error | label programatik; error aman dan fokus dapat dipindahkan |
| Status badge | neutral/info/success/warning/danger | wajib memiliki teks; warna bukan satu-satunya sinyal |
| Feedback/banner | status/error/warning/info | async memakai live region; error memakai alert |
| Skeleton/empty state | progress placeholder atau title + next action | tidak meniru data sensitif |
| Confirmation panel | consequence title + summary | wajib untuk destructive/financial mutation |
| Data region | accessible overflow + table/list | region fokus; heading/column context dipertahankan |
| Filter/pagination | labeled controls + cursor action | state filter tetap terlihat; cursor rusak dipetakan aman |

## Responsive dan Accessibility

- Desktop 1280+: sidebar 264px dan content workspace sampai 1440px.
- Tablet 768: navigation rail 88px, label aktif tetap terbaca, form dapat dua kolom.
- Mobile 360: navigation horizontal scroll, seluruh form satu kolom, tombol full width, tidak ada aksi kritis yang hanya tersedia lewat hover.
- Table menggunakan overflow pada region berlabel; informasi row tetap memiliki heading/label semantik.
- Urutan heading, label, keyboard, visible focus, reduced motion, live region, dan confirmation panel merupakan acceptance wajib.
- Contrast target WCAG 2.2 AA. Status selalu memadukan copy dan visual marker non-color.

## Screen dan Route Mapping

| Screen ID | Route | Kelompok layar | State executable |
|---|---|---|---|
| SCR-W-01 | `/sign-in` | auth/MFA/recovery boundary | idle, loading, success, configuration, rate limit, expired MFA, forbidden, conflict, session revoked |
| SCR-W-02 | `/users`, `/assignments` | user/role/branch/effective period | list, validation, MFA, confirmation, success, hidden/error |
| SCR-W-03 | `/master` | branch/class/fee/rate/quota | list, create, inactive, history, overlap, stale, configuration |
| SCR-W-04 | `/purchases` | package/proof + review | upload/scan/retry, pending, approve/reject, MFA, conflict, provider failure |
| SCR-W-05 | `/ledger` | balance/history/adjustment | loading, empty, active/expired, invariant, request/review, SoD, stale |
| SCR-W-06 | `/classes` | timetable lifecycle | create, assign, publish/cancel, configuration, availability, overlap, MFA, stale |
| SCR-W-07 | `/operations` | H-24 jobs/recovery | queued, retrying, locked, late, confirmed, auto-cancelled, configuration, MFA |
| SCR-W-08 | `/bookings` | assisted booking | loading, empty, success/replay, cutoff, full, insufficient balance, duplicate, hidden, offline/session |

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
- Route internal menahan render sampai sesi tervalidasi; 401 mengarahkan ke `/sign-in` dengan `returnTo` relatif yang telah disanitasi. `/sign-in` dan `/health` tetap publik.
- Navigation disaring berdasarkan capability untuk usability. Direct URL, query branch, dan setiap mutation tetap diverifikasi backend.
- Branch dipilih eksplisit, disimpan per tab melalui `sessionStorage`, dan dihapus bila tidak lagi terdapat pada branch context `/me`. Tidak ada fallback branch pertama atau `all branches`.
- Step-up MFA wajib memuat ulang `/me`; badge assurance tidak boleh dinaikkan hanya dari state frontend.
- Response 401 dari adapter bisnis memicu revocation event lokal, membersihkan context dan branch selection, lalu menjalankan re-authentication tanpa optimistic mutation.

## Gate Disposition

`FRONTEND DESIGN BASELINE = LOCAL PASS` hanya setelah typecheck, component/axe, Playwright responsive/keyboard/state, production build, dan `pnpm check` hijau. Figma node/version, visual QA manusia, Product Owner approval, browser/device UAT, production configuration, dan `Gate 3 / PG-1` tetap `TBD-BLOCKING`.

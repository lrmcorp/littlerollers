# Rencana Redesign Landing Page — Konsep "Editorial Calm"

Sumber konsep: `http://localhost:8000/locations/` (situs statis `site-v2`: `/assets/site-v2.css`, `/assets/site-v2.js`; halaman `/`, `/classes/`, `/packages/`, `/locations/`, `/contact/` memakai stylesheet yang sama).
Target: landing page `apps/web/app/public-landing.tsx` (+ `HeroCarousel`, `PublicHeader`, `PublicFooter`).
Tanggal analisis: 2026-10-23.

---

## 1. Konsep desain yang diambil

Prinsip utamanya: **tenang, editorial, datar.** Tidak ada kartu berbayang, tidak ada sudut membulat, tidak ada badge pil. Struktur dibangun dari garis tipis 1px, tipografi besar, dan pita hijau gelap yang berselang-seling dengan latar krem.

### 1.1 Warna

| Token referensi | Nilai | Fungsi |
|---|---|---|
| `--green` | `#396552` | Tombol utama, nomor, garis aktif, eyebrow di latar terang |
| `--forest` | `#173d2e` | Pita/section gelap, hover tombol |
| `--deep` | `#102b21` | Footer, dasar hero |
| `--cream` | `#f3f1e9` | Latar halaman & header |
| `--ink` | `#18392c` | Teks utama (hijau tua, bukan hitam) |
| `--muted` | `#4f6255` | Teks sekunder |
| `--line` | `#bdcabc` | Semua garis pemisah 1px |
| tint hover | `#e9eee6` / `#e7eee5` / `#e6eee4` | Latar baris saat hover |
| teks di atas hijau gelap | `#d2e6cf`, `#d9e8d4`, `#e2ebe1`, `#cfdfd0` | Eyebrow, kata serif, paragraf |
| fokus | `#d5a53e` (outline 3px, offset 4px) | Focus ring |
| seleksi teks | `#b8d5ba` | `::selection` |

Catatan: palet ini **mirip tetapi tidak sama** dengan token `dd-*` yang ada (`dd-forest #285740`, `dd-cream #f8f5ef`, aksen `dd-brass`). Aksen emas/brass tidak dipakai di referensi.

### 1.2 Tipografi

- Font: **DM Sans** 400/500/600/700 (v2 sekarang memakai Poppins).
- Judul `.display`: weight **400**, `letter-spacing: -0.072em`, `line-height: 0.93` — terlihat rapat dan besar.
- Kata aksen `.serif`: **Georgia italic**, `letter-spacing: -0.07em`, dipakai pada 1–2 kata terakhir tiap judul ("kind of strong.", "begin again.").
- Eyebrow: 12px, bold, uppercase, `letter-spacing: .12em`.
- Skala judul (clamp): hero beranda `68px → 165px`; hero halaman `70 → 160px`; judul section `42 → 91px`; judul baris `26 → 48px`; badan teks 16–17px, `line-height` 1.6–1.7.
- Nav 13px/600; tombol 14px/700; nomor baris 13px/700 warna `--green`.

### 1.3 Layout & komponen

- Kontainer `.wrap`: `min(100% - 8vw, 1440px)` (mobile: `100% - 40px`). Padding vertikal section `clamp(78px, 10vw, 150px)`.
- **Hero beranda**: full-bleed foto reformer gelap, overlay gradien hijau (`rgba(7,28,20,.9)` → `.4`, plus gradien bawah), teks rata kiri-bawah, tinggi `min(820px, 100svh − 86px)`, gambar bergerak pelan (`hero-drift` 17s alternate). Satu CTA (tombol krem) + catatan "Discover the practice ↓".
- **Intro grid**: 2 kolom `1.25fr / .75fr` — judul besar kiri, paragraf pendek kanan, sejajar bawah.
- **Formats preview**: 3 kolom tanpa kartu, hanya garis atas/bawah/kiri `--line`; isi: label kecil hijau, nama format (22–34px), panah ↗; hover = latar tint + padding-left bergeser.
- **Image statement / photo band**: split 50/50, sisi teks di atas `--forest`, judul display putih + paragraf `#e2ebe1` + text-link; mobile menumpuk 1 kolom.
- **Baris daftar** (`format-row`, `location-row`): grid `nomor | judul | deskripsi | link`, dipisah garis `--line`, hover tint. Dipakai untuk kelas dan lokasi.
- **Text-link**: teks bold 15px dengan garis bawah 1px, jarak ke panah 22px → 30px saat hover.
- **Tombol**: persegi (radius 0), tinggi min 50px, hijau solid; varian `light` (krem) di atas latar gelap.
- **Header**: tinggi 86px, krem, border bawah `--line`, logo 236×58, nav kecil dengan garis bawah pada item aktif, satu tombol hijau solid "Book a class". Mobile (≤900px): tombol "Menu / Close" persegi 48px, panel nav turun dari header.
- **Footer**: `--deep`, logo di atas krem, tautan kecil, garis `#ffffff55`, baris hak cipta.
- **CTA band** (`package-cta`): pita `--forest`, judul display kiri, paragraf + tombol krem kanan.

### 1.4 Gerak & aksesibilitas

- `.reveal`: fade + naik 25px, 0.75s, via `IntersectionObserver` (threshold .05); default terlihat bila JS mati (`js-motion` ditambahkan lewat JS).
- Hover: perubahan latar/padding 0.2s, tanpa bayangan atau `translateY`.
- `prefers-reduced-motion`: semua animasi/transisi dimatikan, reveal langsung terlihat.
- Skip-link, `aria-current`, target sentuh ≥48px, focus ring kuning-emas jelas.

### 1.5 Nada copy

Judul pendek dua baris dengan satu kata serif ("Find your / kind of strong.", "Make room for / your dose."), paragraf 1–2 kalimat, CTA berupa kata kerja singkat. Referensi berbahasa Inggris; v2 berbahasa Indonesia, jadi copy perlu diadaptasi dengan gaya yang sama (lihat §5).

---

## 2. Kondisi landing page dailydose_v2 saat ini

- Stack: Next.js 15 (app router) + React 19 + Tailwind v4 (`app/tailwind.css` `@theme`, token `dd-*`) + `lucide-react`; font Poppins lokal (`app/fonts/*.ttf`) lewat `next/font/local` di `layout.tsx`.
- `app/page.tsx` → `PublicLanding` (499 baris, satu file) berisi: `HeroCarousel` (data dari CMS `siteConfig.heroCarousel`, ada slide default), 4 pilar, studio showcase + statistik (`siteConfig.branches`, `classes`), kelas populer (kartu bergambar + skeleton + state error), 3 testimoni + kutipan filosofi, Paket CTA + 3 langkah, banner CTA bawah, `PublicFooter`.
- Gaya saat ini: kartu `rounded-2xl` + `shadow-dd-card`, badge pil, kata miring pada font sans yang sama, aksen brass, header sticky blur.
- `PublicHeader`/`PublicFooter` dipakai bersama oleh halaman publik lain (classes, packages, locations, contact, privacy, terms, detail).
- Token `dd-*` dipakai di ±132 file (termasuk aplikasi internal) → **jangan diubah nilainya**.
- Tes yang harus tetap hijau: `public-landing.test.tsx` (heading "Stronger Body. Calmer Mind.", nav "Navigasi publik", heading kelas dari `siteConfig`, axe), `public-header.test.tsx`, serta e2e yang menyentuh landing.
- Working tree sudah banyak perubahan (modified) → kerjakan di branch terpisah, mis. `feat/landing-editorial`.

---

## 3. Keputusan arsitektur

1. **Token baru berprefiks `ed-`**, bukan menimpa `dd-*`. Di `app/tailwind.css` (`@theme inline`): `--color-ed-green`, `-forest`, `-deep`, `-cream`, `-ink`, `-muted`, `-line`, `-tint`, `-mint` (teks di atas gelap), `-focus`.
2. **Font DM Sans lokal** (`next/font/local`, simpan di `app/fonts/`, variabel `--font-editorial`) agar build Docker tidak butuh jaringan. Diterapkan hanya pada wrapper landing, jadi aplikasi internal tetap Poppins. Georgia untuk aksen serif (font sistem).
3. **Utility khusus** di `tailwind.css`: `ed-display`, `ed-serif`, `ed-eyebrow`, `ed-link` (text-link), `ed-button` / `ed-button-light`, `ed-row`. Agar JSX tidak berisi string class panjang berulang.
4. **Pecah `public-landing.tsx`** menjadi komponen di `app/components/public/landing/`: `landing-hero`, `landing-intro`, `landing-pillars`, `landing-studio`, `landing-classes`, `landing-voices`, `landing-packages`, `landing-cta`. `PublicLanding` tinggal merakit + memegang fetch `siteConfig`.
5. **`<Reveal>`** (client component): default terlihat saat SSR; setelah mount menambah kelas `js-motion` lalu observer. Menghormati `prefers-reduced-motion`.
6. **Header/footer memakai prop `variant="editorial"`**; halaman publik lain tetap `default` dulu. Rollout ke halaman lain menjadi fase terpisah (§4, Fase 7).
7. **Fungsi tidak berubah**: fetch `accountClient.siteConfig()`, CMS hero, skeleton/error state, sesi login, drawer mobile, `routes`.

---

## 4. Tahapan implementasi

### Fase 0 — Persiapan
- Buat branch `feat/landing-editorial`.
- Ambil screenshot baseline landing sekarang (375 / 768 / 1440) ke `docs/uat/` atau `scratch/` sebagai pembanding.
- Putuskan 4 poin terbuka di §6.

### Fase 1 — Fondasi (token, font, utility) — ✅ SELESAI 2026-10-23
- Tambah token `ed-*`, utility `ed-*`, `@keyframes ed-drift`, aturan `prefers-reduced-motion`, `::selection`, focus ring emas (hanya di dalam `.ed-scope`).
- Tambah DM Sans lokal di `layout.tsx`, variabel `--font-editorial`.
- Wrapper `ed-scope` (font, seleksi, focus ring) **belum dipasang di Fase 1** supaya landing tidak tampil campur Poppins/DM Sans; dipasang bersamaan dengan konversi hero/header di Fase 2–3.
- Buat `Reveal`.
- **Selesai bila**: halaman tetap render, tidak ada perubahan pada route lain, `pnpm --filter @dailydose/web typecheck` lolos.
- **Hasil Fase 1**: `app/fonts/dm-sans-variable.ttf` (+ lisensi OFL), `dmSans` di `layout.tsx` (`preload: false`), token `ed-*` + utility `ed-wrap/section/display/serif/eyebrow/link/button/button-light/row` + `.ed-scope` + CSS reveal di `tailwind.css`, komponen `components/public/landing/reveal.tsx` + tes. Tidak ada perubahan tampilan.

### Fase 2 — Header & footer varian editorial — ✅ SELESAI 2026-10-23
- `PublicHeader variant="editorial"`: krem rata, border `ed-line`, tinggi 86px, nav 13px/600 dengan garis bawah aktif, tombol hijau persegi "Booking Kelas" → `/classes#schedule`, "Masuk"/menu akun tetap ada. Mobile: tombol teks "Menu/Tutup" 48px persegi + panel turun; pertahankan `useOverlayInteraction`, Escape, klik luar.
- Header tetap sticky (UX navigasi), tanpa blur berat.
- `PublicFooter variant="editorial"`: latar `ed-deep`, kolom brand + tautan, baris bawah dengan garis `#ffffff55`; hapus strip CTA newsletter yang berbentuk kartu bulat atau ubah menjadi baris teks. Pertahankan tautan WhatsApp/email dan tautan legal.
- **Selesai bila**: `public-header.test.tsx` lolos, keyboard + mobile berfungsi.
- **Hasil Fase 2**: `PublicHeader`/`PublicFooter` menerima `variant: 'default' | 'editorial'` (default = tampilan lama, tidak berubah). Varian editorial dipasang di `PublicLanding`. Header: tombol utama "Booking Kelas" → `/classes#schedule` (di drawer, "Lihat Paket" menjadi tombol kedua), Masuk/Daftar berupa tautan teks, tombol mobile "Menu"/"Tutup" persegi. Footer: baris CTA "Hubungi Kami", brand + 3 kolom tautan, WhatsApp/Instagram/TikTok sebagai tautan teks. `.ed-scope` kini hanya mengatur `font-family` (warna/latar lewat utility, karena CSS tanpa layer mengalahkan utility Tailwind) dan dipasang pada `<header>`, overlay drawer, dan `<footer>` editorial. Tes baru: varian editorial header (nav, CTA, drawer, axe) dan `public-footer.test.tsx`.

### Fase 3 — Hero — ✅ SELESAI 2026-10-23
- Ubah `HeroCarousel` ke gaya editorial: full-bleed, overlay gradien, tinggi `min(820px, 100svh − header)`, judul `ed-display` (`title` biasa + `highlightTitle` sebagai `ed-serif` berwarna `ed-mint` di baris baru), paragraf maks ±430px, tombol utama `ed-button-light` + CTA kedua berupa `ed-link`.
- Badge pil → eyebrow uppercase. Kontrol carousel → penanda minimalis ("01 / 03" + garis tipis), tombol prev/next persegi; autoplay dijeda saat `prefers-reduced-motion`.
- Efek drift lambat pada gambar (CSS-only), dimatikan saat reduced-motion.
- Catatan aksesibilitas: nama aksesibel heading harus tetap "Stronger Body. Calmer Mind." (jaga spasi antara `title` dan `<span>`), karena dipakai tes.
- **Selesai bila**: slide CMS dan slide default sama-sama tampil benar; teks terbaca di atas semua gambar default.
- **Hasil Fase 3**: `hero-carousel.tsx` ditulis ulang visualnya (data/CMS, id `marketing-hero-title`, aria-label tombol, swipe tetap). Foto full-bleed + overlay hijau gelap + drift 17s; eyebrow dari `badge`; judul `ed-display` dengan `highlightTitle` serif di baris baru; satu tombol krem + satu tautan `ed-link`; baris bawah berisi catatan + penanda garis, nomor "01 / 03" (sembunyi di mobile), tombol prev/next persegi. Perubahan perilaku: autoplay berhenti bila `prefers-reduced-motion`, dan jeda juga saat fokus berada di dalam hero. Dihapus: badge pil, rating bintang (klaim "5 bintang" tanpa sumber), tautan ketiga "Jelajahi Studio" (sudah ada di section studio). `ed-display` diberi `word-spacing: .05em` karena judul Indonesia lebih panjang. Tes baru: `hero-carousel.test.tsx` (4 tes).

### Fase 4 — Intro & pilar — ✅ SELESAI 2026-10-23
- Gabungkan pengantar jadi **intro grid** (judul display + kata serif kiri, paragraf kanan) lalu 4 pilar sebagai **grid 4 kolom bergaris** (nomor hijau, judul, deskripsi) tanpa border-kiri brass dan tanpa ukuran font 11px.
- Bungkus dengan `Reveal`.
- **Hasil Fase 4**: `components/public/landing/landing-intro.tsx` + `landing-pillars.tsx` menggantikan section pilar lama di `PublicLanding` (anchor `#instructors` dipertahankan). Intro: eyebrow "Mengapa Daily Dose", judul "Ruang kecil untuk *bergerak berbeda.*", paragraf pendek; pilar: `<ul>` 4 kolom (lg) / 2 (sm) / 1 (mobile) dengan garis tipis antarkolom, judul `h3` (sebelumnya `strong`), isi pilar tidak diubah. Keduanya dibungkus `Reveal`. Tes baru: `landing-intro.test.tsx`.

### Fase 5 — Studio showcase, kelas, testimoni — ✅ SELESAI 2026-10-23
- **Studio showcase** → split 50/50 `ed-forest` tanpa radius/shadow; gambar `studio-showcase.png`; statistik (`dl`) jadi baris bergaris tipis; CTA `ed-link` "Lihat studio" → `routes.locations`.
- **Kelas populer** → daftar baris `nomor | nama | ringkasan | level + "Lihat detail ↗"`, hover tint. Pertahankan skeleton (jadi baris placeholder), state error, state kosong. Opsional: gambar kelas muncul sebagai thumbnail kecil di baris atau sebagai satu photo band setelah daftar.
- **Testimoni** → satu kutipan besar bergaya serif + 3 kutipan bergaris (tanpa kartu), kutipan filosofi jadi pita tipis.

- **Hasil Fase 5**: tiga komponen baru di `components/public/landing/`: `landing-studio.tsx` (pita `ed-forest`, foto + judul display split 50/50, baris statistik `dl` bergaris di bawahnya; `data-testid="studio-showcase"` ada di dalam `ed-wrap`, anchor `#about` tetap), `landing-classes.tsx` (daftar `ol` bergaris: nomor, foto kecil 4:3, nama `h3`, level, ringkasan, tautan "Lihat detail"; seluruh baris bisa diklik lewat `after:inset-0`, tautan bernama `Lihat detail {nama kelas}`; state skeleton `aria-busy`, error, dan kosong dipertahankan) dan `landing-testimonials.tsx` (satu kutipan besar, dua kutipan bergaris, pita filosofi `ed-mist`; isi kutipan tidak berubah). Root `PublicLanding` kini `bg-ed-cream`, sehingga tidak ada lagi sambungan warna krem ganda. Tes baru: `landing-sections.test.tsx` (5 tes, termasuk axe). Daftar kelas dibatasi 6 baris (`LANDING_CLASS_LIMIT`); bila kelas aktif lebih banyak, muncul tautan "Lihat semua N kelas" ke `/classes` (perubahan dari versi lama yang menampilkan semua).

### Fase 6 — Paket & CTA penutup — ✅ SELESAI 2026-10-23
- Paket + 3 langkah → `package-cta` (pita `ed-forest`: judul display, paragraf, tombol krem) dengan langkah sebagai baris bernomor di bawahnya.
- Banner "Lihat Jadwal" digabung ke pita yang sama agar tidak ada dua blok hijau berurutan; `href` tetap `/classes#schedule`.

- **Hasil Fase 6**: `components/public/landing/landing-packages.tsx` menggantikan section paket dan banner penutup: satu pita `ed-forest` berisi judul display "Bangun rutinitas yang *konsisten.*", paragraf, tombol krem "Pilih Paket" (`/packages`) + tautan "Lihat Jadwal" (`/classes#schedule`, hanya satu tautan, menggantikan banner terpisah), lalu tiga langkah sebagai `ol` baris bernomor. `data-testid="package-journey"` ada di dalam `ed-wrap` (berisi satu `h2` dan satu `ol` dengan tiga `li`). Root `PublicLanding` kini `ed-scope bg-ed-cream text-ed-ink` (tidak ada lagi section gaya lama; `Link`, `routes`, dan style tombol lama dihapus dari file). Tes baru ditambahkan ke `landing-sections.test.tsx` (7 tes, termasuk axe).

### Fase 7 — Rollout ke halaman publik lain — ✅ SELESAI 2026-10-23
- Terapkan varian editorial ke `PublicPageHero` (hero hijau tipis seperti `/locations/`), `locations-view` (baris bernomor), `public-classes-view`, `public-packages-view`, `contact`, lalu hapus varian lama bila tidak terpakai.

- **Hasil Fase 7**: (1) `.ed-scope` kini juga menimpa `--font-ui` ke DM Sans, sehingga utility lama `font-sans` di dalam scope ikut DM Sans (body tetap Poppins, jadi guard e2e font body tetap lolos). (2) `public-page.tsx` ditulis ulang: `PublicPageHero` = pita `ed-forest` (varian `compact` untuk pelanggan di shell aplikasi), `PublicSectionHeading` = eyebrow + judul display, `PublicStatePanel` = panel datar. (3) Halaman `/contact`, `/privacy`, `/terms`, `/locations` ditulis ulang bodinya (baris bernomor bergaris; peta dekoratif palsu di `/locations` dihapus; foto hero `/locations` diganti pita hijau). (4) `/classes`, `/packages`, detail kelas/studio/jadwal/paket, `public-experience`, `package-price` dan `class-faq-section` memakai header/footer editorial, root `ed-scope`, kontainer `ed-wrap`, dan palet `ed-*` hasil penyapuan token (`dd-forest`→`ed-green`, `dd-cream/paper`→`ed-cream`, `dd-ink/muted/line`→`ed-*`, radius dan bayangan dihapus); logika, tes id, dan teks tidak diubah. Belum dilakukan: menghapus varian lama `PublicHeader`/`PublicFooter` `variant="default"` (tidak lagi dipakai halaman publik, masih ada tesnya), dan `publicContainer` masih dipakai `guide-view`. Catatan: pelanggan yang login melihat `/classes`, `/packages`, `/locations` di dalam shell aplikasi pelanggan (tanpa header/footer publik), sehingga isinya kini bernuansa editorial di dalam shell lama.

### Fase 8 — QA & rilis ✅
- `pnpm --filter @dailydose/web typecheck && pnpm --filter @dailydose/web test` (termasuk axe pada landing).
- Perbarui `public-landing.test.tsx` bila struktur heading berubah (mis. kelas sekarang berupa baris, bukan kartu); tambahkan tes reduced-motion untuk `Reveal`.
- Cek visual 375 / 768 / 1024 / 1440 + dark overlay hero pada ketiga gambar default.
- Cek kontras dengan axe/Lighthouse; Lighthouse performa & CLS (hero `priority`, `sizes` benar, tidak ada layout shift dari font).
- `pnpm --filter @dailydose/web build` (output standalone) dan uji lewat Docker bila perlu.
- Jalankan e2e customer/landing yang relevan.

- **Hasil Fase 8**: (1) `tsc --noEmit` bersih; vitest penuh 127 + 118 + 149 + 175 lulus (satu tes `identity.test.tsx` gagal hanya karena zona waktu UTC di VM dan lulus dengan `TZ=Asia/Jakarta`). (2) `next build` sukses di dalam proses e2e mock. (3) e2e mock (`public-responsive`, `public-detail-pages`, `frontend-baseline`): 25 lulus, 11 gagal; himpunan 11 kegagalan **identik dengan baseline sebelum redesign** (9 di `frontend-baseline`: tes `public landing` mengharapkan header login "Akun Saya"/"Buka workspace" sehingga gagal sebelum mencapai assertion landing, snapshot `public-*.png`/`shell-*.png` perlu dibuat ulang, data mock Surabaya/PIK 2, dll.; 2 di `public-responsive`: posisi kartu katalog paket). Tes "landing editorial sections remain balanced at 1440px" dan aturan font baru kini lulus. (4) Posisi kartu pertama `/packages` (batas 620 desktop / 850 mobile) sudah gagal sebelum redesign (746 / 1242); redesign sempat memperburuknya (831), lalu hero varian `compact` dipadatkan sehingga turun ke ~794 desktop. Mencapai batas butuh perampingan layout katalog (pemilih studio + filter), di luar lingkup redesign landing. (5) Belum dilakukan: Lighthouse/CLS dan uji Docker; regenerasi snapshot Playwright; menyesuaikan tes `public landing` ke header publik tanpa login.

---

## 5. Pemetaan section dan usulan copy (Indonesia)

| Section sekarang | Section baru | Judul usulan (aksen serif dicetak miring) |
|---|---|---|
| Hero carousel | Hero editorial | Stronger Body. / *Calmer Mind.* (tetap, dari CMS) |
| 4 pilar (`#instructors`) | Intro grid + pilar bergaris | Ruang kecil untuk / *bergerak berbeda.* |
| Studio showcase (`#about`) | Image statement 50/50 | Sediakan ruang / *untuk dosis harianmu.* |
| Kelas populer | Daftar baris kelas | Temukan kelas / *yang cocok untukmu.* |
| Testimoni | Kutipan editorial | Gerak yang terarah. / *Perubahan yang nyata.* |
| Paket + langkah | Pita CTA + baris langkah | Bangun rutinitas / *yang konsisten.* |
| Banner bawah | Digabung ke pita CTA | Siap saat / *kamu siap.* |

Copy final tetap perlu persetujuan Anda; kalimat di atas hanya usulan agar gaya headline dua baris + satu kata serif konsisten.

---

## 6. Keputusan terbuka (perlu jawaban Anda)

1. **Cakupan**: landing saja (Fase 1–6, header/footer varian) atau langsung seluruh situs publik (+ Fase 7)? *Rekomendasi: landing dulu.*
2. **Foto**: gambar di situs referensi (`reformer-hero.png`, `studio-editorial.png`, `class-editorial.png`) ditandai "Concept imagery is illustrative" — jangan dipakai di produksi. Pakai foto studio asli, atau gambar yang sudah ada di `public/images/public/` sementara? Hero editorial paling kuat dengan foto gelap beresolusi tinggi.
3. **Kelas populer**: daftar baris tanpa gambar (paling sesuai referensi) atau tetap ada thumbnail/foto per kelas?
4. **Bahasa & copy**: tetap Indonesia dengan gaya referensi (usulan §5), atau campur Inggris seperti referensi untuk headline?

## 7. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Header/footer dipakai halaman lain → tampilan tidak konsisten | Prop `variant`, rollout bertahap (Fase 7) |
| Mengubah token `dd-*` merusak aplikasi internal | Token baru `ed-*`, scope `.ed-scope` |
| Tes landing bergantung pada struktur heading | Jaga nama aksesibel heading; perbarui tes bersamaan dengan komponen |
| Letter-spacing -0.072em membuat teks Indonesia panjang sulit dibaca / terpotong | Batasi `max-width`, uji judul terpanjang di 320px, kurangi tracking di mobile bila perlu |
| Font eksternal gagal dimuat di build/Docker | DM Sans lokal, `display: swap` |
| Konten CMS (judul hero panjang) merusak layout | Uji dengan slide CMS nyata + judul 2× lebih panjang; `text-wrap: balance` |
| Working tree kotor | Branch baru, commit per fase |

## 8. Kriteria selesai

- Landing menampilkan palet, tipografi, garis tipis, dan pita gelap seperti referensi, tanpa kartu berbayang/pil/radius.
- Semua data dinamis (hero CMS, studio, kelas) tetap bekerja, termasuk state loading/error/kosong.
- Typecheck, unit test, axe, dan build lolos; tidak ada horizontal scroll di 320px.
- Keyboard & reduced-motion berfungsi; tidak ada regresi pada halaman publik lain dan aplikasi internal.

---

## 9. Catatan tinjauan sebelum Fase 5 (2026-10-23)

- **Latar krem ganda**: root `PublicLanding` masih `bg-dd-cream` (#f8f5ef) sedangkan section editorial memakai `ed-cream` (#f3f1e9). Batas warna terlihat selama section lama belum dikonversi. Ganti root ke `bg-ed-cream text-ed-ink` + `ed-scope` setelah Fase 6.
- **Guard font di e2e**: diperbarui 2026-10-23, body tetap Poppins, `h1` halaman publik harus DM Sans (bukan Cormorant/Georgia/Times).
- **Test id yang harus dipertahankan di Fase 5–6**: `[data-testid="studio-showcase"]` (berisi `h2` dan `dl`, lebar `dl` ≥ 440px di 1024/1280/1440, lebar `h2` ≥ 360px, tinggi `h2` ≤ 180px) dan `[data-testid="package-journey"]` (berisi `h2` dan `ol` dengan tepat 3 baris, lebar `ol` ≥ 360px).
- **Aksesibilitas**: tautan footer editorial kini `min-h-11` di mobile; tombol "Booking Kelas" header memakai utility `ed-button-compact` + `max-lg:hidden` (menggantikan override `!important`).
- **Belum dijalankan**: suite e2e Playwright, `next build`, dan Lighthouse. Hanya unit test (vitest) + tinjauan visual manual.

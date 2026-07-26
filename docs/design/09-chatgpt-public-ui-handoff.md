# Daily Dose Pilates — ChatGPT Frontend Handoff

**Versi:** 1.1  
**Tanggal:** 26 Juli 2026  
**Status:** implementation-ready baseline  
**Scope utama:** Landing (`/`) dan Studios (`/locations`)  
**Stack:** Next.js App Router, React, TypeScript, Tailwind CSS  

## Cara Menggunakan Dokumen Ini

Berikan seluruh dokumen ini kepada ChatGPT bersama task yang ingin dikerjakan. Gunakan instruksi pembuka berikut:

> Anda bekerja pada repository Daily Dose Pilates. Ikuti dokumen handoff ini sebagai spesifikasi utama untuk UI publik. Pertahankan design system, struktur Next.js App Router, aksesibilitas, responsivitas, dan batas data yang dijelaskan. Periksa file yang sudah ada sebelum mengubah kode, jangan mengarang data operasional, jangan mengubah kontrak API tanpa instruksi, dan jalankan test yang relevan setelah implementasi. Jika desain atau data belum disetujui, tandai sebagai TBD dan pertahankan fallback yang aman.

Dokumen ini melengkapi:

- `docs/design/07-frontend-design-baseline.md`
- `docs/design/08-frontend-page-inventory.md`
- `apps/web/app/globals.css`

Jika terjadi perbedaan, kontrak API dan aturan keamanan repository tetap lebih tinggi daripada preferensi visual.

---

# 1. UI Mockup

## 1.1 Arah Visual

Karakter visual: tenang, premium, editorial, hangat, dan berfokus pada mindful movement.

| Elemen | Spesifikasi |
|---|---|
| Brand utama | Forest green `#396552` |
| Brand gelap | Deep forest `#1f4435` |
| Teks utama | Ink `#173329` |
| Latar utama | Paper `#fbfaf7` |
| Latar hangat | Cream `#f5f0e7` |
| Latar lembut | Mist `#e9efea` |
| Heading | Cormorant Garamond lokal / serif editorial |
| Body dan control | DM Sans lokal / system sans-serif fallback |
| Bentuk | Pill button, card radius 22–24px, arch/oval untuk visual |
| Nuansa | Banyak whitespace, garis tipis, dekorasi botanical/geometris |

Logo resmi yang saat ini dipakai:

`https://dailydosepilates.com/assets/images/logo.png`

Logo harus memiliki `alt="Daily Dose Pilates"` dan dimensi eksplisit untuk mencegah layout shift.

## 1.2 Shared Public Shell

### Desktop

```text
┌──────────────────────────────────────────────────────────────────────┐
│ [Daily Dose logo] Beranda Kelas Paket Lokasi Kontak [Masuk][Jadwal]│
└──────────────────────────────────────────────────────────────────────┘
│                         PAGE CONTENT                                 │
┌──────────────────────────────────────────────────────────────────────┐
│ [Daily Dose logo]     Explore          Support                       │
│                       Kelas            Kontak                        │
│                       Paket            Status sistem                 │
│                       Lokasi                                          │
│ ──────────────────────────────────────────────────────────────────── │
│ © 2026 Daily Dose Pilates                                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Tablet dan Mobile

- Tablet: logo dan tombol masuk berada di baris pertama; navigasi berada di baris kedua.
- Mobile: navigasi boleh horizontal-scroll, tetapi tidak boleh menyebabkan body overflow.
- Semua aksi yang tersedia saat hover juga harus tersedia melalui keyboard/touch.
- Skip link menjadi elemen fokus pertama.

## 1.3 Landing Page `/`

### Susunan Section

```text
HEADER

HERO
┌────────────────────────────┬──────────────────────────┐
│ Kicker                     │                          │
│ H1 editorial besar         │   abstract arch visual  │
│ Lead paragraph             │   + figure + orbit      │
│ [Temukan kelas] [Studio]   │   translucent note      │
│ Format | Durasi | Studio   │                          │
└────────────────────────────┴──────────────────────────┘

01 PENDEKATAN KAMI — dark forest manifesto
┌──────────┬──────────────────────────┬─────────────────┐
│ Index    │ Heading + description    │ 3 principles    │
└──────────┴──────────────────────────┴─────────────────┘

02 PILIH PENGALAMAN — cream
┌────────────────┬────────────────┬────────────────┐
│ Private Class  │ Semi Private   │ Private Group  │
│ description    │ description    │ description    │
│ Lihat kelas ↗  │ Lihat kelas ↗  │ Lihat kelas ↗  │
└────────────────┴────────────────┴────────────────┘

03 YOUR DAILY RITUAL
┌────────────────────────┬─────────────────────────────┐
│ breath/oval visual     │ Heading + copy + text link  │
└────────────────────────┴─────────────────────────────┘

04 TEMUKAN STUDIO — mist
01  Green Garden                 Jakarta Barat     Pilih studio →
02  Muara Karang                 Jakarta Utara     Pilih studio →
03  Graha Family                 Surabaya Barat    Pilih studio →
04  Universitas Tarumanagara     Kampus 2          Pilih studio →
05  Orange Groves                PIK 2             Pilih studio →

BRAND QUOTE

FINAL CTA — forest green
Temukan kelas yang sesuai             copy + [Lihat Jadwal]

FOOTER
```

### Responsive

- Desktop `>960px`: hero dua kolom; kelas tiga kolom; ritual dua kolom.
- Tablet `641–960px`: hero satu kolom; card kelas ditumpuk; ritual satu kolom.
- Mobile `<=640px`: padding horizontal 18px; tombol CTA full-width; daftar studio dua kolom semantik (`nomor | konten`); footer dua kolom.
- Target viewport QA: `1280×900`, `768×900`, dan `360×800`.

## 1.4 Studios Page `/locations`

Nama produk di UI adalah “Studio”; route existing tetap `/locations` agar link tidak rusak.

```text
HEADER — active navigation: Lokasi

HERO
Kicker: Studio Daily Dose
H1: Ruang yang tenang, lebih dekat dengan rutinitas Anda.
Lead: pilih studio untuk jadwal dan paket; waktu mengikuti timezone studio.

01 — LOKASI KAMI
Heading: Lima studio untuk bergerak dengan lebih baik.

┌──────────────────────────────┐  ┌──────────────────────────────┐
│ 01                           │  │ 02                           │
│ Daily Dose Pilates           │  │ Daily Dose Pilates           │
│ Green Garden                 │  │ Muara Karang                 │
│ Jakarta Barat                │  │ Jakarta Utara                │
│ Lihat jadwal  Lihat paket    │  │ Lihat jadwal  Lihat paket    │
└──────────────────────────────┘  └──────────────────────────────┘

... tiga studio berikutnya ...

┌──────────────────────────────────────────────────────────────────────┐
│ INFO: alamat, jam operasional, dan petunjuk belum ditampilkan        │
│ sampai sumber operasional disetujui.                                 │
└──────────────────────────────────────────────────────────────────────┘

FOOTER
```

Grid card dua kolom pada desktop/tablet besar dan satu kolom pada mobile. Card kelima boleh mengisi satu kolom; jangan membuat data palsu hanya agar grid terlihat simetris.

---

# 2. Developer Specification

## 2.1 Route dan Tanggung Jawab

| Route | File utama | Render | Data |
|---|---|---|---|
| `/` | `apps/web/app/page.tsx` | Server Component wrapper | konten lokal yang disetujui |
| `/locations` | `apps/web/app/locations/page.tsx` | Server Component | daftar studio lokal yang disetujui |
| shared public shell | `apps/web/app/public-site-header.tsx` | Server-compatible component | link statis |
| design tokens/styles | `apps/web/app/globals.css` | global stylesheet | CSS custom properties |

Landing tidak boleh bergantung pada session atau request `/me`. CTA `Lihat Jadwal`
menuju `/classes#schedule`, sedangkan CTA `Masuk` menuju `/sign-in`. Autentikasi
baru diminta ketika pengguna memulai aksi yang membutuhkan customer session.

## 2.2 Component Contract

### `PublicSiteHeader`

```ts
type PublicSiteHeaderProps = {
  current?: '/' | '/classes' | '/packages' | '/locations' | '/contact';
};
```

- Menampilkan logo, lima link publik, CTA `Masuk`, dan CTA `Lihat Jadwal`.
- Link aktif memakai `aria-current="page"`.
- Nav memakai `aria-label="Navigasi publik"`.
- Tidak menampilkan CTA `trial class` selama kontrak produk trial belum disetujui.

### `PublicSiteFooter`

- Menampilkan logo, kelompok Explore, kelompok Support, dan copyright tahun berjalan.
- Link harus menuju route nyata; tidak boleh memakai `#` sebagai placeholder.

### `PublicLanding`

Data lokal:

```ts
type ClassFormat = {
  number: string;
  title: string;
  description: string;
  note: string;
};

type StudioSummary = readonly [name: string, area: string];
```

Section wajib:

1. Hero
2. Approach/manifesto
3. Class formats
4. Daily ritual
5. Studio list
6. Brand quote
7. Final CTA

### `LocationsPage`

```ts
type Studio = {
  name: string;
  area: string;
  index: string;
};
```

Konten studio yang saat ini disetujui:

1. Green Garden — Jakarta Barat
2. Muara Karang — Jakarta Utara
3. Graha Family — Surabaya Barat
4. Universitas Tarumanagara — Kampus 2
5. Orange Groves — PIK 2

Jangan menambahkan alamat lengkap, jam buka, nomor telepon, URL peta, fasilitas, harga, promo, instructor, atau klaim hasil tanpa sumber yang disetujui.

## 2.3 State dan Interaksi

### Landing

| State/interaksi | Perilaku |
|---|---|
| Initial render | seluruh konten lokal tampil tanpa loading/session gate |
| Header navigation | menuju route publik yang sesuai |
| Header Masuk | `/sign-in` |
| Header Lihat Jadwal | `/classes#schedule` |
| Primary hero CTA | `/classes#schedule` |
| Secondary hero CTA | `/locations` |
| Class card CTA | `/classes` dengan accessible name sesuai kelas |
| Studio row CTA | `/locations` dengan accessible name sesuai studio |
| Final CTA | `/classes#schedule` |
| Logo | kembali ke top/root sesuai shell |
| Hover | underline/translate ringan, tidak menjadi satu-satunya feedback |
| Keyboard focus | focus ring selalu terlihat |
| Reduced motion | transform/transisi dinonaktifkan atau diperkecil |

Landing tidak memiliki state loading, empty, error, atau retry karena tidak memanggil API.

### Studios

| State/interaksi | Perilaku |
|---|---|
| Initial render | lima studio tampil dari konten approved |
| Current nav | link Lokasi memakai `aria-current="page"` |
| Lihat jadwal | menuju `/classes` |
| Lihat paket | menuju `/packages` |
| Missing operational data | tampilkan notice, bukan placeholder data |
| Data belum disetujui | tetap gunakan card minimal `name + area` |

Versi sekarang belum memiliki studio-detail route, filter kota, pencarian, peta, carousel, modal, ataupun API fetch. Fitur tersebut hanya boleh ditambahkan setelah kontrak data dan acceptance disetujui.

## 2.4 Accessibility

- Satu `h1` per halaman dan urutan heading tidak boleh melompat.
- Gunakan landmark `header`, `nav`, `main`, `section`, dan `footer`.
- Setiap halaman memiliki skip link ke main content.
- Dekorasi visual diberi `aria-hidden="true"`; jangan membuat screen reader membacanya sebagai konten.
- Link dengan label visual sama dalam list harus memiliki accessible name yang menyertakan konteks studio/kelas bila diperlukan.
- Contrast target WCAG 2.2 AA.
- Ukuran body minimum 16px pada mobile.
- Status tidak boleh dijelaskan hanya dengan warna.
- Halaman tidak boleh mengalami horizontal overflow pada lebar 360px.

## 2.5 SEO dan Metadata

- Root metadata berasal dari `apps/web/app/layout.tsx`.
- Studios memiliki title `Lokasi Studio`.
- Description harus faktual dan tidak membuat klaim yang belum disetujui.
- Jangan memasukkan data privat atau synthetic fixture dalam metadata.

## 2.6 Out of Scope

- Mengubah backend, schema, atau OpenAPI.
- Membuat booking langsung dari public page tanpa authentication.
- Menawarkan trial class tanpa keputusan produk dan kontrak entitlement tersendiri.
- Mengambil atau menampilkan data branch privat.
- Mengarang content operasional.
- Mengganti route `/locations` menjadi `/studios` tanpa migration/redirect plan.
- Menambahkan library UI baru bila CSS/component existing sudah mencukupi.

---

# 3. Frontend Implementation

## 3.1 Struktur Existing yang Harus Dipertahankan

```text
apps/web/app/
├── layout.tsx
├── page.tsx
├── public-landing.tsx
├── public-site-header.tsx
├── globals.css
└── locations/
    └── page.tsx
```

Landing wrapper:

```tsx
import { PublicLanding } from './public-landing';

export default function Home() {
  return <PublicLanding />;
}
```

Studios page pattern:

```tsx
import type { Metadata } from 'next';
import { PublicSiteFooter, PublicSiteHeader } from '../public-site-header';

export const metadata: Metadata = {
  title: 'Lokasi Studio',
  description: 'Temukan studio Daily Dose Pilates di Jakarta, Tangerang, dan Surabaya.',
};

export default function LocationsPage() {
  return (
    <div className="public-site public-information-page">
      <a className="skip-link" href="#locations-main">
        Langsung ke lokasi
      </a>
      <PublicSiteHeader current="/locations" />
      <main id="locations-main">{/* hero, studio grid, approved-data notice */}</main>
      <PublicSiteFooter />
    </div>
  );
}
```

## 3.2 Implementation Rules

- Gunakan Server Component secara default; tambahkan `'use client'` hanya bila benar-benar ada browser state/event.
- Pertahankan TypeScript strict dan import style project.
- Gunakan semantic HTML sebelum menambahkan ARIA.
- Reuse `PublicSiteHeader`, `PublicSiteFooter`, `public-button`, dan token CSS existing.
- Jangan menyalin header/footer ke page baru.
- Data list dirender dengan `.map()` dan key stabil berbasis nama/ID, bukan index array.
- Jangan melakukan optimistic mutation pada flow yang menyentuh booking/purchase.
- Query atau return URL ke sign-in harus relatif dan disanitasi oleh pola existing.
- Jangan menyimpan token, OTP, proof URL, atau PII pada local storage, telemetry, maupun fixture visual.

## 3.3 Naming

- React component: PascalCase.
- CSS public experience: prefix `public-`.
- CSS location-specific: prefix `location-`.
- Test component: `*.test.tsx`.
- E2E: `apps/web/e2e/*.spec.ts`.

## 3.4 Expected Change Strategy

Untuk revisi visual Landing atau Studios:

1. Ubah data/copy hanya jika sudah disetujui.
2. Ubah markup component dengan semantic structure tetap terjaga.
3. Reuse atau tambah token pada `:root`/`.public-site`, bukan hard-code berulang.
4. Tambahkan aturan responsive pada breakpoint existing `960px` dan `640px`.
5. Update component test untuk perubahan kontrak konten/interaksi.
6. Update screenshot baseline hanya setelah perubahan visual diverifikasi.

---

# 4. QA Checklist

## 4.1 Functional — Landing

- [ ] `/` dapat dibuka tanpa login dan tanpa request session.
- [ ] Logo, nav publik, CTA `Masuk`, dan CTA `Lihat Jadwal` tampil.
- [ ] Hero memiliki satu H1, lead, dua CTA, dan tiga facts.
- [ ] Tiga class format tampil: Private, Semi Private, Private Group.
- [ ] Lima studio tampil dengan nama dan area yang benar.
- [ ] Semua CTA menuju route yang nyata.
- [ ] Semua CTA jadwal menuju `/classes#schedule`; tidak ada klaim atau CTA trial class.
- [ ] Tidak ada harga, promo, alamat, instructor, atau klaim yang tidak disetujui.
- [ ] Footer menampilkan Explore, Support, dan copyright.

## 4.2 Functional — Studios

- [ ] `/locations` menampilkan metadata title dan description yang benar.
- [ ] Navigation “Lokasi” memiliki `aria-current="page"`.
- [ ] Lima studio tampil tepat satu kali.
- [ ] Setiap card memiliki link “Lihat jadwal” dan “Lihat paket”.
- [ ] Notice tentang detail operasional yang belum tersedia tetap tampil.
- [ ] Tidak ada detail operasional yang difabrikasi.

## 4.3 Responsive dan Visual

- [ ] Desktop 1280px tidak memiliki clipping/overflow.
- [ ] Tablet 768px menggunakan layout stack yang benar.
- [ ] Mobile 360px tidak memiliki horizontal body scroll.
- [ ] CTA mobile mudah disentuh dan tidak saling bertumpuk.
- [ ] Heading tidak overflow pada string terpanjang.
- [ ] Card kelima Studios terlihat intentional pada grid.
- [ ] Logo tidak terdistorsi.
- [ ] Spacing, border, radius, dan warna konsisten dengan token.
- [ ] Tidak ada layout shift yang mengganggu saat logo dimuat.

## 4.4 Accessibility

- [ ] Skip link dapat difokuskan dan menuju main content.
- [ ] Semua fungsi dapat digunakan dengan keyboard.
- [ ] `:focus-visible` jelas pada setiap link/control.
- [ ] Heading hierarchy valid.
- [ ] Landmark dan nav label terbaca oleh screen reader.
- [ ] Decorative art tidak dibacakan.
- [ ] Link berulang memiliki context yang cukup.
- [ ] Contrast memenuhi WCAG 2.2 AA.
- [ ] `prefers-reduced-motion` dihormati.
- [ ] Automated axe test tidak menemukan violation.

## 4.5 Content dan Security

- [ ] Bahasa utama konsisten Bahasa Indonesia; istilah Inggris hanya bagian brand voice.
- [ ] Tidak ada PII, credential, token, internal ID, atau synthetic user pada UI publik.
- [ ] Tidak ada private branch data yang bocor.
- [ ] Konten studio sama dengan approved source repository.
- [ ] External link yang membuka tab baru memakai proteksi yang sesuai.
- [ ] Error teknis mentah tidak ditampilkan ke pengguna.

## 4.6 Regression Commands

Jalankan dari root repository:

```bash
pnpm --filter @daily-dose/web test
pnpm --filter @daily-dose/web exec tsc --noEmit
pnpm --filter @daily-dose/web exec playwright test e2e/frontend-baseline.spec.ts
pnpm --filter @daily-dose/web build
```

Jika nama package/script berubah, baca `apps/web/package.json` dan gunakan script yang tersedia. Screenshot tidak boleh diperbarui otomatis sebelum perbedaan visual ditinjau.

## 4.7 Definition of Done

Task dianggap selesai jika:

- implementasi sesuai mockup dan kontrak component;
- semua state/interaksi dalam scope bekerja;
- viewport 1280, 768, dan 360 lulus;
- component test, accessibility test, typecheck, E2E relevan, dan production build lulus;
- tidak ada data yang dikarang;
- perubahan dokumentasi/test ikut diperbarui;
- visual approval manusia dan data production yang belum tersedia tetap ditandai `TBD`, bukan dianggap selesai.

---

# 5. Prompt Template untuk Task Berikutnya

Salin template ini dan isi bagian dalam kurung:

> Gunakan `docs/design/09-chatgpt-public-ui-handoff.md` sebagai spesifikasi. Kerjakan perubahan pada halaman **[Landing/Studios]**: **[jelaskan perubahan]**. Pertahankan route, design system, accessibility, responsive breakpoint, dan approved-content boundary. Inspeksi implementasi existing terlebih dahulu, lalu implementasikan perubahan pada komponen Next.js/React yang sesuai. Tambahkan atau perbarui test, jalankan pemeriksaan yang relevan, dan laporkan file yang berubah, hasil test, asumsi, serta item TBD. Jangan mengarang data atau mengubah backend/API di luar scope.

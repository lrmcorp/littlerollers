# Rencana Aksi: Penyederhanaan Arsitektur Dailydose V2

> **Status Dokumen:** Acuan Resmi Pengerjaan Bertahap (*Official Working Reference*)  
> **Target Utama:** Memangkas kerumitan birokrasi kode (*over-engineering*), mempercepat proses penambahan fitur (*development velocity*), dan membuat struktur kode ramping serta mudah dirawat.

---

## 1. Latar Belakang & Masalah Utama

Sistem Dailydose V2 saat ini mengalami *architectural overhead* yang memperlambat pengembangan:
1. **Rantai Dependensi Terlalu Panjang:** Untuk menambah satu kolom/field sederhana (misalnya foto, nomor kontak, atau catatan), developer harus mengubah 5–6 file di repositori berbeda:
   $$\text{Database Schema} \rightarrow \text{NestJS DTO} \rightarrow \text{NestJS Controller} \rightarrow \text{NestJS Service} \rightarrow \text{OpenAPI Client SDK} \rightarrow \text{Web Client Wrapper} \rightarrow \text{React Component}$$
2. **Birokrasi Form yang Kaku:** Setiap pembaruan data mewajibkan input `reason` (alasan perubahan min. 3 karakter) dan `expectedVersion` (kontrol konkurensi perbankan), serta konfirmasi ganda di antarmuka web yang memperlambat operasional admin.
3. **Ketergantungan Build pada SDK (`packages/api-client-ts`):** Kode frontend terikat pada SDK hasil generator OpenAPI yang harus terus-menerus di-*rebuild* secara manual setiap kali ada perubahan kecil di backend.

---

## 2. Prinsip Penyederhanaan

1. **Prinsip "2-Hop Development":** Menambahkan kolom baru ke depan maksimal hanya menyentuh **2 area**:
   - Skema Database/Service Backend
   - Komponen Form Frontend
2. **Pengerjaan Bertahap & Zero-Regression:** Dilakukan langkah demi langkah tanpa menghentikan sistem yang sudah berjalan, tidak merusak database, dan fitur jadwal/booking tetap aman.
3. **Mengutamakan Kepraktisan Bisnis:** Memperlakukan Dailydose sebagai sistem operasional studio pilates yang lincah, bukan sistem perbankan multi-birokrasi.

---

## 3. Matriks Tahapan Pengerjaan

```
┌────────────────────────────────────────────────────────────────────────┐
│ TAHAP 1: Pemangkasan Birokrasi Form & Konfirmasi                       │
│ (Menghapus kewajiban reason & expectedVersion, form langsung simpan)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TAHAP 2: Pelepasan Ketergantungan Build SDK Client (api-client-ts)     │
│ (Frontend memakai direct-typed client tanpa perlu rebuild manual)      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TAHAP 3: Perampingan Controller & Service Backend (Clean CRUD)         │
│ (Menyatukan logic yang terpecah-pecah ke controller to-the-point)      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TAHAP 4: Sentralisasi Pengelolaan Media & Upload MinIO                 │
│ (Helper global tunggal untuk upload dan resolve gambar)                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TAHAP 5: Pembersihan Dependensi & Build Monorepo                       │
│ (Kompilasi cepat, waktu build hemat, kode bersih tanpa dead-code)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Rincian Teknis Setiap Tahapan

### ✅ TAHAP 1: Pemangkasan Birokrasi Form & Konfirmasi Admin (SELESAI)
* **Status:** SELESAI (Completed)
* **Target:** Membuat form admin terasa ringan, langsung simpan dengan 1 klik, dan kode frontend berkurang 30–40%.
* **Hasil Implementasi:**
  1. **Backend (`apps/api`):**
     - Parameter `expectedVersion` dan `reason` dibuat opsional di `PublicProfileAdminService`, `MasterController`, dan `MasterCatalogService`.
     - Ditambahkan default otomatis: jika admin tidak mengisi `reason`, backend otomatis mencatat audit trail dengan `"Pembaruan profil publik via Web Admin"` atau `"Pembaruan cabang via Web Admin"`.
  2. **Frontend (`apps/web`):**
     - Hapus input field teks `reason` ("Alasan perubahan" / "Alasan pembuatan") dari form pembuatan cabang, pengeditan cabang, dan profil publik.
     - Hapus modal dialog konfirmasi berulang pada aksi non-destruktif (edit nama/deskripsi/foto, profil publik, dan buat cabang). Tombol "Simpan" langsung menyimpan dengan 1 klik.
     - Tetap mempertahankan konfirmasi khusus untuk aksi destruktif (seperti menonaktifkan operasional cabang).
     - Seluruh typecheck monorepo dan unit test lolos 100% tanpa regresi.

---

### ✅ TAHAP 2: Pelepasan Ketergantungan Build SDK Client (`packages/api-client-ts`) (SELESAI)
* **Status:** SELESAI (Completed)
* **Target:** Menghilangkan keharusan me-*rebuild* package OpenAPI setiap kali ada kolom/field baru.
* **Hasil Implementasi:**
  1. **Direct Typed HTTP Helper (`apps/web/app/lib/api-client.ts`):**
     - Dibangun helper universal `apiFetch<T>` yang terintegrasi dengan top-loader progress, credentials session, penanganan status JSON/error, dan dukungan header idempotency.
  2. **Refactor Modul Master (`apps/web/app/api-clients/master-client.ts`):**
     - Sepenuhnya terbebas dari class runtime OpenAPI `MasterApi` dan `Configuration`.
     - Tipe data `Studio` dan `Room` diekspor langsung sebagai interface TypeScript native dengan dukungan instan untuk field baru (seperti `imageKey`, `equipmentText`, `contactPhoneE164`).
     - Seluruh method CRUD master (`listStudios`, `createStudio`, `updateStudio`, `createRoom`, `updateRoom`, `listClassTypes`, dll.) dieksekusi secara to-the-point via `apiFetch`.
  3. **Refactor Komponen Panel Venues (`apps/web/app/branches/branch-venues-panel.tsx`):**
     - Mengimpor tipe `Studio` dan `Room` langsung dari `@/api-clients/master-client`, tidak lagi bergantung pada `@dailydose/api-client-ts/generated`.
  4. **Zero-Rebuild Source Mapping (`tsconfig.json` & `package.json`):**
     - Path alias pada `apps/web/tsconfig.json` dan export mapping `packages/api-client-ts/package.json` diarahkan langsung ke source `.ts`.
     - Penambahan tipe data atau field baru kini dapat langsung dipakai frontend secara instan tanpa perlu menjalankan `pnpm build` di folder packages.

---

### 🟢 TAHAP 3: Perampingan Controller & Service Backend (Clean CRUD) [SELESAI ✅]
* **Target:** Backend NestJS menjadi ringkas, mudah dibaca, dan mirip kemudahan *Resource Controller* di Laravel.
* **Hasil & Pekerjaan yang Telah Diselesaikan:**
  1. **Pembersihan Dead Aliases & Duplikasi:**
     - Mengeliminasi 10 fungsi alias bahasa Indonesia yang usang dan tidak pernah dipanggil di codebase (`daftarCabang`, `detailCabang`, `buatStudio`, `perbaruiStudio`, `daftarRuangan`, `buatRuangan`, `perbaruiRuangan`, `daftarJenisKelas`, `buatJenisKelas`, `perbaruiJenisKelas`).
  2. **Konsolidasi Service Public Profile:**
     - Logika pengelolaan profil publik cabang dan kelas disatukan langsung ke dalam `MasterCatalogService`.
     - `PublicProfileAdminService` dirampingkan dari 127 baris menjadi 29 baris sebagai delegating facade ringan sehingga kompatibilitas modul tetap 100% terjaga.
  3. **Helper Idempotency Terstandarisasi (`executeMutation`):**
     - Menggantikan puluhan baris boilerplate transaksi `$transaction` yang berulang dengan reusable `executeMutation` helper.
  4. **Perampingan Master Controller:**
     - Endpoint profil publik didelegasikan langsung ke catalog service.
  5. **Verifikasi Fungsional:**
     - Skrip verifikasi `tools/verification/verify-phase-3-clean-crud.ts` lulus 100% (CRUD cabang, studio, ruangan, tipe kelas, dan profil publik).
     - Monorepo `pnpm typecheck` dan seluruh 243 test web lulus 100%.

---

### 🟢 TAHAP 4: Sentralisasi Pengelolaan Media & MinIO Storage [SELESAI ✅]
* **Target:** Satu helper upload untuk seluruh aplikasi, tanpa katalog aset statis yang di-*hardcode*.
* **Hasil & Pekerjaan yang Telah Diselesaikan:**
  1. **Penghapusan Hardcoded Catalog (`PUBLIC_ASSET_KEYS`):**
     - Mengeliminasi impor `PUBLIC_ASSET_KEYS` dari `master-catalog.service.ts`.
     - Menggantinya dengan penemuan dinamis (*dynamic asset discovery*) langsung dari database (distinct keys dari tabel `cabang`, `studio`, dan `jenisKelas`) dan MinIO storage.
     - `public-asset-catalog.ts` telah di-deprecate.
  2. **Global Media Helpers:**
     - Dibuat `apps/web/app/lib/media.ts` yang mengekspor fungsi `uploadImage(file)` dan `resolveImageUrl(key)`.
     - `ImageUploadField` berhasil di-refactor menggunakan `uploadImage` (mengurangi 40 baris duplikasi fetch).
  3. **Visual Multi-Image Gallery Component:**
     - Dibuat komponen modern `MultiImageGalleryField` di `apps/web/app/components/forms/multi-image-gallery-field.tsx` (diekspor di `forms.tsx`).
     - Tampilan galeri berbasis kartu thumbnail visual dengan tombol hapus satu-klik, multi-upload drag-and-drop, dan serialisasi data transparan ke `FormData`.
     - Komponen galeri teks usang (`textarea`) pada drawer `branch-public-profile-drawer.tsx` telah digantikan penuh dengan `MultiImageGalleryField`.
  4. **Backend Media Listing Endpoint:**
     - Ditambahkan endpoint `GET /api/v1/public-content-management/media` dan method `PublicMediaService.listMedia()` yang mengurutkan aset dari MinIO / storage lokal berdasarkan tanggal terbaru.
  5. **Verifikasi Fungsional:**
     - Skrip verifikasi `tools/verification/verify-phase-4-media-centralization.ts` lulus 100%.
     - Seluruh tes regresi Tahap 1, 2, 3, monorepo typecheck, dan 243 vitest lolos 100%.

---

### 🟢 TAHAP 5: Pembersihan Monorepo & Script Build [SELESAI ✅]
* **Target:** Kompilasi instan, ukuran repo bersih dari kode usang (*dead-code*), dan pipeline verifikasi terpusat.
* **Hasil & Pekerjaan yang Telah Diselesaikan:**
  1. **Eliminasi 13 File Skrip Sementara & Scratch:**
     - Menghapus skrip migrasi/uji ad-hoc di `tools/` (`copy-assets-to-testing-bucket.ts`, `sync-all-assets-to-testing.ts`, `sync-v1-media-to-v2.ts`, `test-services.ts`, `check_v1_keys.ts`).
     - Menghapus skrip audit dan deep verification bertahap yang redundan di `tools/verification/` (`deep-verify-stage2.ts`, `deep-verify-stage4.ts`, `verify-stage2-packages-vouchers.ts`, `verify-stage2.ts`, `verify-stage3.ts`, `verify-stage4.ts`, `verify-image-upload-flow.ts`, `verify-all-migrated-assets.ts`).
  2. **Konsolidasi Suite Verifikasi Kanonikal:**
     - Menyisakan rangkaian uji resmi per tahap:
       - `tools/verification/verify-phase-1-simplification.ts`
       - `tools/verification/verify-phase-2-direct-client.ts`
       - `tools/verification/verify-phase-3-clean-crud.ts`
       - `tools/verification/verify-phase-4-media-centralization.ts`
  3. **Master Verification Runner (`tools/verification/verify-all-phases.ts`):**
     - Dibuat skrip runner master yang menjalankan seluruh tahap (1 s.d. 4) secara otomatis dan menampilkan matriks status eksekutif terpadu.
  4. **Standarisasi Script `package.json`:**
     - Ditambahkan skrip `"verify:phases"` (menjalankan runner master) dan `"verify:all"` (verifikasi komprehensif: phases + typecheck + web test).
  5. **Verifikasi Fungsional & Nol Regresi:**
     - `pnpm verify:phases` berhasil 100% (semua 4 tahap lulus).
     - `pnpm typecheck` bersih tanpa error di seluruh 10 paket monorepo.
     - `pnpm --filter @dailydose/web test` lulus 100% (59 test suite, 243 test cases).
     - `pnpm --filter @dailydose/api build` lulus tanpa error kompilasi.
* **Hasil yang Dicapai:** Lingkungan kerja bersih, ramping, bebas dari file usang, dan siap untuk deployment serta pengembangan fitur yang jauh lebih cepat.

---

## 5. Indikator Keberhasilan (*Success Metrics*)

| Sebelum Penyederhanaan | Setelah Penyederhanaan |
| :--- | :--- |
| Butuh ubah 5–6 file untuk tambah 1 kolom | Cukup ubah **2 file** (Database & Form UI) |
| Wajib isi "Alasan Perubahan" & verifikasi versi | Langsung simpan dengan **1 klik** |
| Wajib me-rebuild SDK OpenAPI setiap ada perubahan | Tipe data otomatis sinkron secara instan |
| Gambar harus dipilih dari daftar teks hardcode | Unggah langsung dari laptop dengan preview visual |
| File backend terpecah ke 4-5 service per modul | 1 Controller + 1 Service bersih per modul |

---

## 6. Urutan Eksekusi yang Disepakati

Kita akan mengeksekusi rencana ini secara berurutan mulai dari:
👉 **Tahap 1 (Memangkas Birokrasi Form & Validasi)** sebagai langkah pertama yang paling cepat memberikan dampak kemudahan pengembangan.

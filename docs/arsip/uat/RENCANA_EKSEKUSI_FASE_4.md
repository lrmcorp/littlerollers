# Rencana Eksekusi Fase 4: UI/UX, Lokasi Cabang, Panduan & Pengalaman Pengguna
**Tanggal:** 14 Oktober 2026  
**Status:** Ready to Execute  
**Ruang Lingkup:** Poin 7, 14, 15, 16, 17, 18, 23, 24, 25, 26 dari Master Plan Audit UAT 13 Okt 2026

---

## 1. Analisis Masalah & Sasaran Perbaikan

### Poin 7: Konfigurasi Provider WhatsApp & Banner Peringatan Mode Uji
- **Akar Masalah:**
  - Di sistem produksi, variabel lingkungan Meta Cloud API kerap tidak sinkron antara dokumentasi (`WHATSAPP_ACCESS_TOKEN`) dan kode API (`WHATSAPP_API_TOKEN`). Jika variabel kosong, gateway jatuh ke `MockWhatsAppProvider` yang hanya mencatat pesan tanpa mengirim ke pelanggan.
  - Perlu kejelasan status di panel pengingat agar tim operasional dan manajemen sadar ketika sistem berjalan dalam mode mock (simulasi pengujian).
- **Rencana Solusi:**
  - Fungsi `resolveWhatsAppConfig()` di `whatsapp-gateway.service.ts` mendukung kedua nama variabel (`WHATSAPP_ACCESS_TOKEN` dan `WHATSAPP_API_TOKEN`).
  - Banner peringatan visual `Feedback kind="warning"` di `reminders-view.tsx` otomatis aktif jika provider bernilai `MOCK`.
  - Verifikasi unit test di `whatsapp-config.spec.ts`.

---

### Poin 14: Penanganan Halaman 404 (Not Found) Informatif & Eliminasi Skeleton Gantung
- **Akar Masalah:**
  - Sebelumnya, saat pengunjung membuka URL yang tidak dikenal atau tautan studio/kelas yang tidak valid, antarmuka dapat terjebak dalam skeleton memuat abu-abu tanpa pesan yang jelas.
- **Rencana Solusi:**
  - Desain dan aktifkan `apps/web/app/not-found.tsx` dengan badge 404 elegan, teks ramah pengguna, navigasi cepat ke Jadwal Kelas (`/classes`), Paket & Harga (`/packages`), Beranda (`/`), dan Bantuan WhatsApp.
  - Komponen detail studio dan kelas menggunakan penanganan `DetailFailure` yang menyediakan tombol coba lagi (*retry*) dan tautan kembali ke direktori lokasi.

---

### Poin 15: Alur Masuk (Sign-In) & Registrasi Mandiri yang Rapi
- **Akar Masalah:**
  - Pada halaman login (`sign-in-view.tsx`), terdapat tautan ganda "Belum punya akun?" dan teks yang hanya menyebutkan email tanpa opsi nomor WhatsApp.
  - Pada formulir registrasi (`register-view.tsx`), penomoran seksi formulir meloncat dari 1 ke 3, serta terdapat klaim "akun langsung aktif" yang membingungkan pelanggan baru karena pemesanan kelas memerlukan verifikasi identitas (KYC).
- **Rencana Solusi:**
  - Satukan teks login: *"Masuk dengan email atau nomor WhatsApp yang terdaftar beserta password Anda"*.
  - Eliminasi duplikasi tautan pendaftaran; pertahankan satu tautan jelas ke `/register` dan satu tautan bantuan WhatsApp.
  - Standarisasi nomor seksi formulir pendaftaran secara berurutan:
    1. **Data Diri** (Nama lengkap, WhatsApp, Email)
    2. **Keamanan Akun** (Password & Ulangi Password dengan toggle show/hide mandiri)
    3. **Dokumen Identitas** (Selfie & Foto KTP dengan pratinjau lokal dan batas 8 MB)
  - Teks penjelasan jujur: *"Lengkapi verifikasi identitas agar akun siap digunakan untuk memesan jadwal latihan"*.

---

### Poin 16: Status Teknis & Mitigasi Login OTP WhatsApp
- **Akar Masalah:**
  - Fitur login menggunakan OTP WhatsApp memerlukan akun Meta Business resmi yang telah terverifikasi, nomor telepon yang terdaftar pada Cloud API, serta templat pesan kategori *Authentication* yang disetujui Meta.
  - Mengimplementasikan OTP separuh jalan tanpa penyedia resmi akan menyebabkan kegagalan otentikasi bagi pengguna aktif.
- **Rencana Solusi:**
  - Dokumentasikan status teknis arsitektur OTP di backend (`IdentityService.requestOtp` dan `verifyOtp` dengan rate-limiting hash).
  - Terapkan mekanisme pertahanan ganda: jalur login password tetap menjadi jalur utama yang stabil dan andal, dengan kemampuan login menggunakan Email maupun Nomor WhatsApp.
  - Siapkan panduan konfigurasi Meta Authentication Template untuk aktivasi OTP ketika kredensial resmi telah siap.

---

### Poin 17: Info Studio Akurat (Surabaya, Alamat Lengkap & Kapasitas Ranjang)
- **Akar Masalah:**
  - Nilai kota `'Jakarta'` pernah ter-hardcode pada beberapa pemetaan cabang, sehingga cabang Graha Family Surabaya tercetak sebagai *"Graha Family Surabaya, Jakarta"*.
  - Kapasitas studio pada teks statis tertulis "6–8 peserta" padahal studio Daily Dose memiliki ranjang reformer fisik untuk maksimal 4 peserta per kelas. Alamat lengkap studio di kartu lokasi belum ditampilkan utuh.
- **Rencana Solusi:**
  - Gunakan `branchPublicLocation()` di `apps/api/src/master/branch-location.ts` sebagai satu sumber kebenaran data lokasi (Surabaya memetakan ke kota *Surabaya* dan area *Dukuhpakis, Surabaya Barat*).
  - Tampilkan alamat lengkap di seluruh kartu studio di `locations-view.tsx` dan landing page.
  - Perbarui seluruh teks kapasitas kelas menjadi maksimal 4 peserta reformer.

---

### Poin 18: Restrukturisasi Halaman Panduan (Guide) Publik & Pemisahan Staf
- **Akar Masalah:**
  - Halaman panduan publik (`/guide`) memuat istilah teknis dan perbankan yang membingungkan member baru (misalnya "KYC", "LUNAS (Verified)", "Barre", batas upload bukti transfer 5 MB padahal sistem mendukung hingga 10 MB).
  - Tab panduan operasional staf internal (Front Desk, Finance, Super Owner) terekspos ke publik umum.
- **Rencana Solusi:**
  - Tulis ulang panduan publik khusus member dengan bahasa yang ramah, jelas, dan akurat (langkah pendaftaran, pemilihan paket, pemesanan kelas, ubah jadwal H-24, dan kehadiran di studio).
  - Batasi tab panduan operasional internal (Front Desk Scanner QR, Finance Approval, Super Owner Command Center) hanya untuk pengguna yang memiliki sesi staf terautentikasi.
  - Lindungi menggunakan pengujian `guide-view.test.tsx`.

---

### Poin 23, 24, 25, 26: Pembersihan Jargon Programmer, Teks Internal, Grip Socks & Kerapian Format
- **Akar Masalah:**
  - Terdapat kebocoran istilah developer internal pada antarmuka pengguna: `Rules #`, `Keputusan Bisnis #`, `ledger authoritative`, `Optimistic locking`, `(Other Cost)`, `(Realtime)`, `Projection Cost`, `Gross Sales`, `Our Studios`.
  - Instruksi perlengkapan Pilates yang keliru: pengunjung diminta *"membawa perlengkapan pribadi: Reformer"* padahal alat reformer disediakan penuh oleh studio dan pelanggan hanya wajib mengenakan kaus kaki khusus *grip socks*.
  - Pagination merangkai label ganda: *"Menampilkan 1–20 dari 20 dari 20 paket"*.
- **Rencana Solusi:**
  - Buat dan jalankan test pengaman otomatis `jargon-guard.test.ts` yang memindai seluruh komponen frontend dari string terlarang.
  - Perbaiki formula perangkai label di `Pagination` (`apps/web/app/components/admin/admin-ui.tsx`) sehingga label "20 dari 20 paket" tidak digandakan.
  - Perbarui metadata halaman studio menjadi "Studio Kami" (`locations/page.tsx`).
  - Ganti teks perlengkapan kelas dengan kewajiban kaus kaki antiselip (*grip socks*) dan tegaskan bahwa ranjang reformer disediakan lengkap oleh studio.

---

## 2. Rencana Verifikasi & Quality Gates

1. **Lint & Typecheck:**
   - `pnpm typecheck` (8/8 paket hijau, 0 error).
   - `pnpm lint` (8/8 paket hijau, 0 error).
2. **Suite Pengujian Unit & Komponen:**
   - `pnpm --filter @dailydose/api test:unit`: 77/77 test suites passed, 565/565 tests passed.
   - `pnpm --filter @dailydose/web test`: 98/98 test files passed, 485/485 tests passed.
3. **Dokumentasi Hasil:**
   - Terbitkan `docs/uat/LAPORAN_SELESAI_FASE_4.md` yang merangkum hasil verifikasi seluruh poin.

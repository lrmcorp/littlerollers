# Rencana Verifikasi & Pengujian Mendalam Non-Happy Path (Fase 1 – 4)
**Target:** Remediasi UAT Daily Dose Pilates V2  
**Tanggal Rencana:** 14 Oktober 2026  
**Cakupan:** Fase 1, Fase 2, Fase 3, dan Fase 4 (Poin 2 s/d 26, mengecualikan Fase 7)  
**Prinsip Utama:** **STRICTLY NO HAPPY PATH & STRICTLY NO MOCK / FAKE DATA**

---

## 1. Filosofi & Batasan Mutlak Pengujian (Rules of Engagement)

Dokumen ini disusun untuk menguji ketahanan, integritas data, dan keamanan sistem secara agresif tanpa kompromi:

1. **Strictly No Happy Path (Hanya Menguji Kasus Negatif, Ekstrem, dan Anomali):**
   - Tidak ada pengujian alur normal (misal: "customer berhasil booking kelas kosong", "kasir berhasil klik approve transfer valid").
   - Seluruh skenario berfokus pada:
     - Persaingan konkurensi ekstrem (*race conditions* / *slot stampede*).
     - Pembelian dan booking menggunakan saldo 0, paket belum lunas, atau voucher kedaluwarsa.
     - Penolakan duplikasi idempotensi (*rapid double-click* / *replay attack*).
     - Upaya eskalasi hak akses (*privilege escalation*) pada endpoint operasi kritis.
     - Penanganan mutasi rekening bank yang ambigu, nominal kembar, atau kedaluwarsa.
     - Penolakan dokumen berukuran raksasa (> 8 MB) dan format file berbahaya.
     - Pemindaian kebocoran istilah programmer dan data internal di UI publik.
2. **Strictly No Mock / Fake Data (100% Database Nyata & Entitas Riil):**
   - Pengujian dijalankan langsung terhadap instance database MySQL nyata: `dailydose_v2_uat` di `127.0.0.1:3306` melalui `PrismaClient`.
   - Menggunakan data riil hasil migrasi V1 (9.274 pelanggan nyata, 5 cabang resmi: `DD-GG`, `DD-SBY`, `DD-MK`, `DD-PIK2`, `DD-UNTAR`).
   - Menguji slot kelas riil, paket katalog riil, voucher riil di DB (`JULY2026`, dll), dan akun pengujian riil yang berstatus `INACTIVE`.
   - Transaksi database diuji menggunakan isolasi transaksi `Prisma.$transaction` dengan InnoDB row-level locking (`SELECT ... FOR UPDATE`) nyata di MySQL.

---

## 2. Matriks Rincian Skenario Uji per Fase

### A. FASE 1: Integritas Kuota, Booking, Pembayaran & Database Lock (Poin 2, 8, 6, 4, 5, 3)

| ID Uji | Poin | Skenario Adversarial Non-Happy Path | Data Riil yang Digunakan | Mekanisme Pengujian Teknis | Kriteria Lolos (Assertion) |
|---|---|---|---|---|---|
| **ADV-1.1** | **Poin 2** | **Concurrency Stampede pada Kuota Sisa 1** | Slot kelas riil dengan kapasitas 4, sisa kuota 1 ranjang. 10 pelanggan riil berbeda. | Tembakkan 10 request booking manual & reschedule secara paralel (`Promise.all`) dalam selisih < 5ms. | **Tepat 1 request berhasil**, 9 request lainnya GAGAL dengan galat `SLOT_CAPACITY_EXCEEDED`. Kuota slot tidak boleh > 4 (`bookedCount <= 4`). Tidak ada overcapacity (5/4). |
| **ADV-1.2** | **Poin 8** | **Rapid Double-Click / Duplikat Booking Customer Sama** | 1 Pelanggan riil yang sama memesan slot kelas riil yang sama secara simultan. | Eksekusi `pemesanan-kelas.service.ts` dengan 2 request paralel identik `(userId, classSlotId)` tanpa jeda waktu. | **Tepat 1 booking tercatat**, request kedua ditolak keras dengan galat `DUPLICATE_ACTIVE_BOOKING`. Saldo sesi paket riil pelanggan hanya terpotong tepat 1 sesi. |
| **ADV-1.3** | **Poin 6** | **Eksploitasi Paket Belum Lunas (`WAITING_VERIFICATION`) & Paket 0 Sesi** | Paket pelanggan riil terikat pembelian yang belum lunas (kasus Lusianna) dan paket riil dengan `remainingSessions: 0`. | Kirim request booking kelas menggunakan paket belum disetujui / 0 sesi tersebut. | Booking ditolak keras dengan galat `PACKAGE_NOT_ELIGIBLE` atau `UNPAID_PACKAGE_NOT_ALLOWED`. Ledger mutasi sesi tidak menambah entri apa pun (`DEBIT` dibatalkan). |
| **ADV-1.4** | **Poin 4** | **Konflik Mutasi Rekening Nominal Kembar & Mutasi Kedaluwarsa** | Tagihan invoice riil ber-kode unik dan data mutasi bank riil. | Umpankan mutasi bank dengan nominal yang cocok dengan 2 invoice aktif sekaligus, atau mutasi yang tanggalnya lewat 7 hari dari batas waktu. | Sistem **DILARANG auto-approve**. Status mutasi ditandai `MANUAL_REVIEW`, invoice tetap `WAITING_VERIFICATION`, dan sistem mencatat audit peringatan duplikasi nominal. |
| **ADV-1.5** | **Poin 5** | **Bypass Persetujuan Pembayaran Tanpa Bukti Transfer** | Pembelian paket riil metode transfer bank tanpa bukti gambar (`transferReceiptUrl: null` atau `""`). | Kirim mutasi approval `PembelianPaketService.reviewPurchase` dari akun staf kasir tanpa membuka modal / tanpa lampiran bukti. | Aksi persetujuan ditolak dengan galat `PROOF_REQUIRED` / `MISSING_PAYMENT_PROOF`. Paket pelanggan tetap nonaktif. |
| **ADV-1.6** | **Poin 3** | **Deadlock & Query Placeholder Overflow Resilience** | Seluruh 9.274 data pelanggan riil dan ribuan slot kelas riil. | Eksekusi agregasi dashboard cabang bersamaan dengan 5 transaksi reschedule yang sedang mengunci baris slot (`FOR UPDATE`). | Kueri dashboard dieksekusi secara chunking tanpa menembus batas parameter MySQL 65.535, tidak terjadi deadlock 1213, dan respons tidak menghasilkan HTTP 500. |

---

### B. FASE 2: Keamanan Operasional, Hak Akses & Akun Pengujian (Poin 19, 13, 21, 22)

| ID Uji | Poin | Skenario Adversarial Non-Happy Path | Data Riil yang Digunakan | Mekanisme Pengujian Teknis | Kriteria Lolos (Assertion) |
|---|---|---|---|---|---|
| **ADV-2.1** | **Poin 19** | **Unauthorized Trigger Otomasi Auto-Cancel H-24** | Akun riil dengan peran `MEMBER`, `INSTRUCTOR`, `ADMIN`, dan `MANAGER`. | Tembakkan HTTP POST ke `OperationsAutomationController.triggerAutoCancelBatch` menggunakan token peran-peran tersebut. | Seluruh request non-superadmin **WAJIB ditolak HTTP 403 FORBIDDEN**. Hanya akun `SUPER_OWNER` yang memiliki otorisasi. |
| **ADV-2.2** | **Poin 13** | **Percobaan Login & Penugasan Jadwal Akun Dummy Non-Aktif** | 37 akun dummy riil yang telah dinonaktifkan (`admin_test`, `dummy@example.com`, instruktur bernama `-`). | a) Coba login password dengan akun dummy `INACTIVE`.<br>b) Coba buat slot jadwal kelas baru dengan instruktur `INACTIVE`. | Login ditolak HTTP 401 `AUTHENTICATION_REQUIRED`. Pembuatan jadwal ditolak dengan galat `INSTRUCTOR_INACTIVE`. Akun dummy tidak muncul pada katalog publik. |
| **ADV-2.3** | **Poin 21** | **Mutasi Akun Staf Tanpa Jejak Audit & Role Injection** | Akun staf riil di tabel `users`. | Coba ubah profil/peran staf dengan payload peran tidak valid (`SUPERMAN`) atau tanpa menyertakan metadata audit log. | Peran tidak valid ditolak HTTP 422. Setiap mutasi yang berhasil **WAJIB tercatat permanen di tabel `audit_log`** MySQL dengan snapshot data sebelum & sesudah. |
| **ADV-2.4** | **Poin 22** | **Penyusupan Cabang Silang (Cross-Branch Injection)** | Admin cabang Jakarta Barat (`DD-GG`) dan mode "Semua Cabang". | Kirim booking manual dengan `branchId: null`, atau admin `DD-GG` mencoba booking/buat kelas di cabang Surabaya (`DD-SBY`). | Request ditolak HTTP 403 `CROSS_BRANCH_FORBIDDEN` atau HTTP 400 `BRANCH_SELECTION_REQUIRED`. Tidak ada slot silang yang berhasil dibuat. |

---

### C. FASE 3: Keuangan, Honor Instruktur, Katalog Paket & Voucher (Poin 9, 10, 11, 12, 20)

| ID Uji | Poin | Skenario Adversarial Non-Happy Path | Data Riil yang Digunakan | Mekanisme Pengujian Teknis | Kriteria Lolos (Assertion) |
|---|---|---|---|---|---|
| **ADV-3.1** | **Poin 9** | **Pemanfaatan Voucher Kedaluwarsa, Non-Aktif & Format Rusak** | Voucher riil `JULY2026` (status nonaktif/kedaluwarsa), voucher quota 0, dan voucher berformat string `PERCENT`. | Pelanggan riil mencoba checkout pembelian paket menggunakan voucher-voucher tersebut via `pembelian-paket.service.ts`. | Transaksi **ditolak keras** saat order dengan galat `VOUCHER_EXPIRED` atau `VOUCHER_NOT_APPLICABLE`. Sistem dilarang diam-diam mengabaikan voucher dan menagih harga penuh tanpa sadar. |
| **ADV-3.2** | **Poin 11** | **Deteksi Honor Instruktur Kosong & Pencegahan Laba Semu** | Sesi kelas riil yang salah satu kombinasinya dihapus tarif honornya di `InstructorFee`. | Tarik laporan keuangan dan performa cabang di `FinanceService` dan `DashboardService`. | Sistem **DILARANG melaporkan laba bersih = omzet kotor**. Sistem mengembalikan flag `instructorFeeMissing: true` dan menyertakan estimasi `projectionCost` sebagai pengurang omzet. |
| **ADV-3.3** | **Poin 12** | **Pembelian Paket Arsip & Injeksi Nama Terpotong** | 28 paket riil yang telah diarsipkan (`status = 'ARCHIVED'`). | Pelanggan mencoba membeli paket yang berstatus arsip dengan menembak ID paket secara langsung ke API order. | Pembelian ditolak HTTP 404 `PACKAGE_NOT_FOUND` atau `PACKAGE_INACTIVE`. Paket arsip tidak muncul di kueri publik `public-package-query.service.ts`. |
| **ADV-3.4** | **Poin 20** | **Booking dengan Paket Kedaluwarsa & Tab Zombie Package** | Pelanggan riil dengan paket yang tanggal `expiryAt`-nya telah lampau (kemarin), dan status KYC `REJECTED`. | a) Cek kalkulasi tab paket aktif.<br>b) Coba booking kelas menggunakan paket yang sudah kedaluwarsa tersebut. | Tab "Paket Aktif" bernilai 0 (paket terkelompokkan ke tab Riwayat/Kedaluwarsa). Booking ditolak keras dengan galat `PACKAGE_EXPIRED`. |

---

### D. FASE 4: Notifikasi, Info Studio, Panduan & UI/UX (Poin 7, 14, 15, 16, 17, 18, 23, 24, 25, 26)

| ID Uji | Poin | Skenario Adversarial Non-Happy Path | Data Riil yang Digunakan | Mekanisme Pengujian Teknis | Kriteria Lolos (Assertion) |
|---|---|---|---|---|---|
| **ADV-4.1** | **Poin 7** | **Injeksi Nomor Telepon Invalid & Mock Mode Guard** | `WhatsAppGatewayService` saat mode mock aktif. | Kirim pesan notifikasi ke nomor telepon acak yang rusak (`08123`, `+00000`, `bukan-nomor`). | Normalisasi nomor E.164 menangani parsing secara aman tanpa crash, sistem mencatat log internal mock, dan banner peringatan mode uji di UI tetap aktif. |
| **ADV-4.2** | **Poin 14** | **Eksploitasi Slug Tidak Valid & 404 Loading Freeze** | Rute URL tidak dikenal: `/locations/slug-palsu-999` dan `/classes/kelas-fiktif`. | Lakukan HTTP request ke rute tersebut. | Mengembalikan halaman 404 informatif (`not-found.tsx`) dengan status HTTP 404 (atau `DetailFailure` dengan tombol retry). **Nol skeleton abu-abu gantung**. |
| **ADV-4.3** | **Poin 15** | **Injeksi File Raksasa (> 8 MB) & Ekstensi Terlarang pada Registrasi** | Formulir pendaftaran `RegisterView` / `registerCustomer`. | a) Upload selfie 12 MB (melebihi limit 8 MB).<br>b) Upload file biner berbahaya `.exe` / `.sh`.<br>c) Password dan konfirmasi tidak cocok. | Ditolak dengan HTTP 422 `VALIDATION_ERROR` dengan pesan spesifik dalam bahasa Indonesia. **Nol baris user baru** terbuat di basis data. |
| **ADV-4.4** | **Poin 18** | **Penyusupan Panduan Operasional Staf oleh Pengunjung Anonim** | Halaman `/guide` publik. | Pengunjung publik tanpa sesi mencoba mengakses seksi Front Desk Scanner QR, Finance Approval, atau Super Owner. | Seluruh seksi internal **tersembunyi dari DOM/HTML publik**. Teks panduan publik 100% bebas dari istilah terlarang: `KYC`, `Barre`, `APPROVED`, `LUNAS`, `BOOKED`, `ATTENDED`. |
| **ADV-4.5** | **Poin 23-26**| **Pemindaian Bocoran Jargon Developer & Boundary Pagination** | Seluruh berkas komponen frontend Next.js dan komponen `Pagination`. | a) Scan reaktif terhadap 14 pola regex istilah programmer internal.<br>b) Uji `Pagination` dengan `totalItems: 0`, `currentPage: 999`, dan label ganda. | Pelanggaran istilah terlarang = 0. Label pagination tidak mencetak formula ganda *"dari 20 dari 20"*. Metadata judul tab adalah "Studio Kami". |

---

## 3. Arsitektur Runner Pengujian Mandiri (Automated Adversarial Runner)

Untuk mengeksekusi seluruh 19 skenario adversarial di atas secara otomatis dan langsung terhadap database MySQL `dailydose_v2_uat`, dibuat berkas runner terpadu:

- **Lokasi Berkas Runner:** `tools/verification/adversarial-deep-audit-phases-1-to-4.ts`
- **Konfigurasi Lingkungan:** Menggunakan database nyata dari `.env` (`DATABASE_URL=mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat`).
- **Cara Eksekusi:**
  ```bash
  TSX_TSCONFIG_PATH=apps/api/tsconfig.json \
  NODE_PATH=./apps/api/node_modules \
  node --env-file=.env --import ./apps/api/node_modules/tsx/dist/loader.mjs \
  tools/verification/adversarial-deep-audit-phases-1-to-4.ts
  ```
- **Keluaran Hasil Uji:**
  - Ringkasan di konsol terminal dengan ikon `✅ PASS` / `❌ FAIL` per skenario.
  - Berkas bukti audit formal berformat JSON disimpan di:
    [`docs/uat/bukti/adversarial_audit_phases_1_to_4.json`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/bukti/adversarial_audit_phases_1_to_4.json)
  - Laporan komprehensif disimpan di:
    [`docs/uat/LAPORAN_PENGUJIAN_MENDALAM_NON_HAPPY_PATH.md`](file:///Users/lrmcorporation/Documents/Website/dailydose_v2/docs/uat/LAPORAN_PENGUJIAN_MENDALAM_NON_HAPPY_PATH.md)

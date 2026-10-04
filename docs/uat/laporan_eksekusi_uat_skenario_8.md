# LAPORAN HASIL EKSEKUSI USER ACCEPTANCE TESTING (UAT)
## Skenario 8: Koreksi Saldo / Penyesuaian Sesi (Separation of Duties - SOD & Mutasi Buku Besar)

---

> [!IMPORTANT]
> **Status Skenario 8: ✅ PASS (LULUS 100%)**  
> Seluruh alur pengendalian internal *Separation of Duties* (SOD) pada penyesuaian saldo sesi paket pelanggan telah teruji dan berhasil dieksekusi dengan sempurna. Mulai dari pengajuan penambahan +1 sesi oleh Admin Frontdesk (`admin.gg@dailydose.test`) atas paket Jessica Anastasya (`bc5188df-bf14-4ae2-826a-3eb3bc97af22`), penegakan proteksi SOD di mana pemohon tidak memiliki kewenangan menyetujui permintaannya sendiri (*anti-self-approval*), peninjauan oleh pejabat berwenang independen (Super Owner: `ralamzah@gmail.com`), persetujuan resmi melalui modal otorisasi bertingkat, hingga pemutakhiran saldo paket dari 10 sesi menjadi 11 sesi secara atomik disertai penerbitan entri mutasi permanen `ADJUST_MANUAL` pada buku besar *authoritative* (`session_ledger`) di basis data `dailydose_v2_uat`.

---

### 1. Ringkasan Eksekusi Pengujian

| Parameter Pengujian | Rincian Hasil Aktual |
| :--- | :--- |
| **ID Skenario** | **UAT-SCEN-08** |
| **Nama Skenario** | Koreksi Saldo / Penyesuaian Sesi (*Separation of Duties* - SOD & Mutasi Buku Besar) |
| **Aktor Pemohon (Maker)** | `ACT-06` (Admin Frontdesk GG: `admin.gg@dailydose.test`, User ID: `226c028b-5643-423b-ae34-a5f460f297cf`) |
| **Aktor Penyetuju (Checker)**| `ACT-03` (Super Owner / Owner: `ralamzah@gmail.com`, User ID: `00000000-0000-4000-8000-000000000100`) |
| **Waktu Eksekusi** | 2026-10-05 01:19 WIB |
| **Lingkungan** | Chromium Playwright Isolation (Multi-Context Isolation: Admin & Super Owner, Viewport: 1440x900) |
| **Target URL Web** | `http://localhost:32120` |
| **Target API** | `http://127.0.0.1:32121` |
| **Basis Data Target** | `dailydose_v2_uat` (MySQL 8.4 Isolated) |
| **Paket Pelanggan Terkait**| **10 Sessions Group Class Reformer** (ID: `bc5188df-bf14-4ae2-826a-3eb3bc97af22`) |
| **Member Terkait** | **Jessica Anastasya UAT** (`jessica.uat@gmail.com`) |
| **ID Permintaan Penyesuaian**| `d2d588c7-d517-4c97-a422-5e4756293122` |
| **Jumlah Penyesuaian Sesi**| **+1 Sesi** (Alasan: `MIGRATION_CORRECTION` / Koreksi Migrasi) |
| **Hasil Proteksi SOD (Admin)**| **TERLINDUNGI (100% BLOCKED)** — Tombol Setujui tidak tampil, pencegahan *self-approval* aktif |
| **Keputusan Penyetuju (Checker)**| **APPROVED** (Alasan Otorisasi: `CORRECTION_VERIFIED` / Koreksi Diverifikasi) |
| **Entri Buku Besar (Ledger)**| Tipe: `ADJUST_MANUAL`, Jumlah: `+1`, Saldo Akhir: `11`, Creator: Super Owner |
| **Saldo Sesi Akhir Paket** | **11 Sesi Aktif** (*Awal: 10 Sesi → Akhir: 11 Sesi*) |
| **Hasil Akhir** | **PASS (100% Sesuai Dokumen Master UAT & Prinsip SOD Standar Finansial)** |

---

### 2. Bukti Visual Pelaksanaan (Visual Evidence Carousel)

````carousel
![1. Admin Frontdesk Membuka Halaman Penyesuaian Sesi (Tanpa Direct Authority)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_01_admin_adjustment_page.png)
<!-- slide -->
![2. Admin Mengisi Formulir Koreksi Saldo (+1 Sesi untuk Paket Jessica)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_02_admin_adjustment_form.png)
<!-- slide -->
![3. Dialog Konfirmasi Pembuatan Permintaan Penyesuaian](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_03_admin_confirm_request.png)
<!-- slide -->
![4. Permintaan Terkirim dengan Status PENDING Menunggu Keputusan Penyetuju](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_04_admin_request_pending.png)
<!-- slide -->
![5. Penegakan SOD: Admin Pemohon Tidak Dapat Menyetujui Pengajuannya Sendiri](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_05_sod_protection_admin.png)
<!-- slide -->
![6. Super Owner Masuk Memiliki Banner Otoritas dan Tombol Setujui/Tolak](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_06_superowner_review_page.png)
<!-- slide -->
![7. Modal Otorisasi Keputusan Persetujuan Penyesuaian oleh Super Owner](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_07_superowner_decision_modal.png)
<!-- slide -->
![8. Dialog Konfirmasi Posting Penyesuaian Sesi ke Ledger](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_07_superowner_approve_confirm.png)
<!-- slide -->
![9. Notifikasi Sukses: Permintaan Disetujui dan Diposting](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_08_superowner_approved_success.png)
<!-- slide -->
![10. Tab Riwayat: Penyesuaian Tercatat Resmi dengan Status Diposting](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen8_09_adjustment_history_posted.png)
````

---

### 3. Matriks Hasil Pengujian Langkah Demi Langkah

| Tahap | Aktivitas Pengujian | Komponen & Field yang Diuji | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **8.1** | Verifikasi Batasan Hak Akses Maker (Admin) | `/ledger/adjustments`<br>• Aktor: `admin.gg@dailydose.test` | Admin tidak memiliki banner *Direct Authority* dan tidak dapat melakukan mutasi instan | Terverifikasi: Banner direct authority tidak muncul, tombol submit bertuliskan *"Tinjau dan buat permintaan"* | **PASS** |
| **8.2** | Pengisian Formulir Penyesuaian Sesi | Drawer Penyesuaian Sesi<br>• Pelanggan: Jessica Anastasya UAT<br>• Perubahan: `+1`<br>• Alasan: `Koreksi migrasi` | Sistem menampilkan kalkulasi saldo proyeksi (+1 menjadi 11 sesi) dan membuka konfirmasi | Data paket Jessica terpilih, proyeksi saldo 11 sesi tampil, dialog konfirmasi *"Konfirmasi permintaan penyesuaian"* muncul | **PASS** |
| **8.3** | Pengajuan Permintaan Penyesuaian | Tombol `Buat permintaan` | Record permintaan tersimpan dengan status `PENDING`, saldo paket member belum berubah | Toast sukses: *"Permintaan penyesuaian dibuat dan menunggu keputusan tanpa mengubah saldo."* Status: `Menunggu keputusan` | **PASS** |
| **8.4** | Penegakan Prinsip SOD (*Anti-Self-Approval*) | Antrean Penyesuaian Admin (`/ledger/adjustments`) | Admin pemohon dilarang menyetujui permintaannya sendiri | Terverifikasi: Tombol `Setujui` dan `Tolak` tidak dirender untuk Admin (hanya `Lihat detail`). Tidak ada jalan bypass self-approval | **PASS** |
| **8.5** | Akses Pemeriksa Independen (Checker / Super Owner) | `/ledger/adjustments`<br>• Aktor: `ralamzah@gmail.com` | Penyetuju melihat banner wewenang penuh, antrean pengajuan Admin, serta tombol `Setujui` & `Tolak` | Terverifikasi: Banner hijau wewenang tampil, item Jessica terdaftar dengan tombol `Setujui` aktif | **PASS** |
| **8.6** | Eksekusi Otorisasi Persetujuan Penyesuaian | 1. Modal `Persetujuan penyesuaian`<br>2. Dialog `Setujui dan posting` | Penyetuju memilih alasan verifikasi, mengonfirmasi posting, dan mutasi ledger dieksekusi | Alasan `Koreksi telah diverifikasi` dipilih, tombol `Setujui dan posting` ditekan, banner sukses: *"Permintaan disetujui dan diposting."* | **PASS** |
| **8.7** | Pemutakhiran Buku Besar & Saldo Paket | 1. `session_ledger`<br>2. `paket_pelanggan` | Saldo paket bertambah (+1 menjadi 11 sesi), record mutasi `ADJUST_MANUAL` tercipta | Terverifikasi di DB & UI Riwayat: Saldo bertambah menjadi 11 sesi, mutasi tercatat resmi dengan status `Diposting` | **PASS** |

---

### 4. Verifikasi Integritas Data (Database Audit)

Kueri audit dijalankan langsung ke basis data `dailydose_v2_uat`:

```sql
-- 1. Verifikasi Status Akhir Permintaan Penyesuaian & Pemisahan Aktor (Maker vs Checker)
SELECT 
  sar.id AS adjustment_id,
  sar.customerPackageId,
  sar.status,
  sar.sessionCount,
  sar.reasonCode,
  sar.decisionCode,
  sar.requestedById,
  sar.approvedById,
  sar.createdAt,
  sar.decidedAt
FROM session_adjust_request sar
WHERE sar.id = 'd2d588c7-d517-4c97-a422-5e4756293122';

-- 2. Verifikasi Entri Buku Besar Authoritative (Session Ledger)
SELECT 
  sl.id AS ledger_id,
  sl.customerPackageId,
  sl.type AS mutation_type,
  sl.amount,
  sl.balanceAfter,
  sl.referenceId,
  sl.notes,
  sl.createdById,
  sl.createdAt
FROM session_ledger sl
WHERE sl.customerPackageId = 'bc5188df-bf14-4ae2-826a-3eb3bc97af22'
ORDER BY sl.createdAt DESC;

-- 3. Verifikasi Saldo Akhir Paket Pelanggan
SELECT 
  pp.id AS customer_package_id,
  p.name AS package_name,
  pp.totalSessions,
  pp.remainingSessions,
  pp.usedSessions,
  pp.status
FROM paket_pelanggan pp
JOIN paket p ON p.id = pp.packageId
WHERE pp.id = 'bc5188df-bf14-4ae2-826a-3eb3bc97af22';
```

**Hasil Audit Database Aktual:**

| Entitas Database | Field / Kolom | Nilai Aktual di `dailydose_v2_uat` | Status Verifikasi |
| :--- | :--- | :--- | :---: |
| **`session_adjust_request`** | `id` | `d2d588c7-d517-4c97-a422-5e4756293122` | **VALID** |
| | `status` | `APPROVED` | **VALID (Disetujui)** |
| | `sessionCount` | `1` | **VALID (+1 Sesi)** |
| | `reasonCode` | `MIGRATION_CORRECTION` | **VALID (Alasan Pemohon)** |
| | `decisionCode` | `CORRECTION_VERIFIED` | **VALID (Alasan Penyetuju)** |
| | `requestedById` | `226c028b-5643-423b-ae34-a5f460f297cf` *(Admin Frontdesk GG)* | **VALID (Maker)** |
| | `approvedById` | `00000000-0000-4000-8000-000000000100` *(Ridho Al Amzah - Super Owner)* | **VALID (Checker ≠ Maker)** |
| | `decidedAt` | `2026-10-04T18:19:28.188Z` | **VALID** |
| **`session_ledger`** | `type` | `ADJUST_MANUAL` | **VALID (Tipe Mutasi)** |
| | `amount` | `1` | **VALID (+1 Kredit)** |
| | `balanceAfter` | `11` | **VALID (Saldo Mutasi Sesuai)** |
| | `referenceId` | `d2d588c7-d517-4c97-a422-5e4756293122` | **VALID (Tautan Audit Request)** |
| | `createdById` | `00000000-0000-4000-8000-000000000100` *(Super Owner)* | **VALID (Otoritas Penulis)** |
| **`paket_pelanggan`** | `remainingSessions` | `11` *(awalnya 10 sesi)* | **VALID (Bertambah Sempurna)** |
| | `status` | `ACTIVE` | **VALID** |

---

### 5. Catatan Arsitektur & Analisis Kepatuhan Bisnis

1. **Pemisahan Tugas (*Separation of Duties* - SOD):**
   Sistem menerapkan tata kelola keuangan berstandar tinggi dengan memisahkan wewenang antara pihak yang mengajukan koreksi (*Maker*) dan pihak yang mengeksekusi persetujuan (*Checker*). Pengguna dengan peran staf/frontdesk dibatasi hanya memiliki hak `ledger:adjust:request`, sehingga setiap permintaan harus melewati antrean persetujuan.
2. **Pencegahan Persetujuan Diri Sendiri (*Anti-Self-Approval Safeguard*):**
   Pada tataran kode backend (`apps/api/src/packages/ledger.service.ts`), terdapat validasi ketat `!canSelfApprove && row.requestedById === principal.userId`. Jika seorang pengguna mencoba menyetujui permintaannya sendiri, sistem melempar error proteksi finansial. Pada tataran antarmuka (`apps/web/app/ledger/ledger-view.tsx`), tombol `Setujui` dinonaktifkan atau disembunyikan disertai peringatan *"Diajukan oleh Anda — perlu penyetuju lain."*
3. **Pencatatan Buku Besar Authoritative (*Authoritative Session Ledger*):**
   Perubahan saldo sesi tidak pernah dilakukan dengan mutasi langsung pada field tanpa audit. Setiap kenaikan atau penurunan sesi wajib mendalilkan entri pada `session_ledger` dengan tipe mutasi eksplisit (`ADJUST_MANUAL`), nilai selisih (`amount`), saldo setelah transaksi (`balanceAfter`), dan referensi audit yang tidak dapat dimanipulasi (*immutable*).
4. **Pencegahan Saldo Negatif (*Negative Balance Guardrail*):**
   Mekanisme penyesuaian sesi secara otomatis mengalkulasi `projectedAvailable = ledgerBalance + quantity - reserved`. Apabila pengajuan berpotensi menghasilkan saldo negatif, sistem mewajibkan otorisasi tingkat lanjut dengan peringatan bahaya (*danger tone*).

---

### 6. Kesimpulan & Rekomendasi
Skenario 8 telah dinyatakan **LULUS (PASS 100%)** tanpa temuan cacat. Prinsip *Separation of Duties* (SOD) pada modul penyesuaian sesi paket pelanggan terbukti bekerja secara andal dan memenuhi seluruh kriteria penerimaan pengguna.

Rangkaian pengujian UAT siap dilanjutkan ke **Skenario 9: Multi-Cabang & Batasan Akses Studio (Cross-Branch Isolation & Staff Scoping)**.

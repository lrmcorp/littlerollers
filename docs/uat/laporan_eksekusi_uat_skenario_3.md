# LAPORAN HASIL EKSEKUSI USER ACCEPTANCE TESTING (UAT)
## Skenario 3: Pembelian Paket Sesi, Pembayaran Bank Transfer, & Persetujuan Kasir

---

> [!IMPORTANT]
> **Status Skenario 3: ✅ PASS (LULUS 100%)**  
> Seluruh siklus transaksi pembelian paket sesi Pilates, pembuatan invoice, snapshot rekening transfer bank BCA cabang Daily Dose Green Garden, pengunggahan bukti bayar oleh member (`Jessica Anastasya UAT`), peninjauan serta persetujuan oleh tim Finance (`finance.mk@dailydose.test`), penerbitan kuota 10 sesi aktif pada `paket_pelanggan`, pencatatan saldo awal di `session_ledger`, dan verifikasi tampilan saldo di portal member telah teruji dan berhasil dieksekusi dengan isolasi penuh tanpa mengganggu database master.

---

### 1. Ringkasan Eksekusi Pengujian

| Parameter Pengujian | Rincian |
| :--- | :--- |
| **ID Skenario** | **UAT-SCEN-03** |
| **Nama Skenario** | Pembelian Paket Sesi, Pembayaran Bank Transfer, & Persetujuan Kasir |
| **Aktor Pelaksana** | `ACT-02` (Customer: Jessica Anastasya UAT) & `ACT-05` (Finance Manager: Finance MK) |
| **Waktu Eksekusi** | 2026-10-04 02:15 WIB |
| **Lingkungan** | Chromium Playwright Isolation (Dual Isolated Browser Contexts, Viewport: 1440x900) |
| **Target URL Web** | `http://localhost:32120` |
| **Target API** | `http://127.0.0.1:32121` |
| **Basis Data Target** | `dailydose_v2_uat` (MySQL 8.4 Isolated) |
| **Paket Diuji** | **10 Sessions Group Class Reformer** (10 Sesi, Masa Berlaku: 90 Hari, Rp 2.500.000) |
| **Cabang Transaksi** | **Daily Dose Green Garden** (`DD-GG` / `a1000000-0000-4000-8000-000000000001`) |
| **Rekening Tujuan** | **BCA 6600482911 a.n. Gerald Reyner Liando** |
| **Hasil Akhir** | **PASS (100% Sesuai Dokumen Master UAT)** |

---

### 2. Bukti Visual Pelaksanaan (Visual Evidence Carousel)

````carousel
![1. Pemilihan Paket 10 Sessions Group Class Reformer di Katalog](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_01_catalog_selection.png)
<!-- slide -->
![2. Ringkasan Pesanan Checkout di Daily Dose Green Garden](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_02_order_summary.png)
<!-- slide -->
![3. Informasi Rekening BCA & Unggah Bukti Transfer](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_03_proof_selected.png)
<!-- slide -->
![4. Bukti Terkirim - Status Member Menunggu Pemeriksaan Finance](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_04_member_pending_review.png)
<!-- slide -->
![5. Antrean Pembayaran Finance Menampilkan Transaksi Jessica Anastasya](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_05_finance_payments_queue.png)
<!-- slide -->
![6. Detail Pembayaran & Snapshot Invoice di Workspace Finance](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_06_finance_payment_detail.png)
<!-- slide -->
![7. Persetujuan Pembayaran & Aktivasi Paket oleh Finance](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_08_finance_payment_approved.png)
<!-- slide -->
![8. Saldo 10 Sesi Aktif Terverifikasi pada Halaman Member](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen3_09_member_packages_active.png)
````

---

### 3. Matriks Hasil Pengujian Langkah Demi Langkah

| Tahap | Aktivitas Pengujian | Komponen & Field yang Diuji | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **3.1** | Login Akun Member | URL `POST /api/v1/auth/password/sessions`<br>• Email: `jessica.uat@gmail.com`<br>• Password: `DailyDose2026!` | Member berhasil login dan sesi JWT tersimpan | Berhasil masuk ke portal member | **PASS** |
| **3.2** | Navigasi Katalog Paket | URL `GET /packages?branch=a1000000-0000-4000-8000-000000000001`<br>• Filter: Green Garden<br>• Kartu: `10 Sessions Group Class Reformer` | Menampilkan kartu paket:<br>• Nama: 10 Sessions Group Class Reformer<br>• Sesi: 10 sesi<br>• Harga: Rp 2.500.000<br>• Tombol CTA: *Pilih paket* | Kartu paket muncul lengkap dengan harga dan rincian sesi | **PASS** |
| **3.3** | Pembuatan Pesanan (Checkout) | URL `GET /checkout?package=...`<br>• Ringkasan pesanan valid<br>• Tombol `Buat pesanan dan lanjutkan pembayaran` | Sistem membuat invoice pesanan baru dengan status awal `AWAITING_PAYMENT` | Invoice terbit (`INV-MUSRV09P-98FB61`) dengan status `AWAITING_PAYMENT` | **PASS** |
| **3.4** | Peninjauan Rekening Cabang | Snapshot Rekening Pembayaran Cabang Green Garden:<br>• Bank: `Bank Central Asia`<br>• No. Rekening: `6600482911`<br>• Atas Nama: `Gerald Reyner Liando` | Informasi rekening tujuan transfer cabang Green Garden tampil akurat | Data rekening BCA tampil akurat sesuai database cabang | **PASS** |
| **3.5** | Pengunggahan Bukti Bayar | File input dropzone (`input[type="file"]`)<br>• Berkas: `sample_receipt.png` (m-BCA transfer Rp 2.500.000)<br>• Tombol `Kirim bukti pembayaran` | Berkas terunggah ke endpoint privat `/uploads/payment-proofs`, scan bersih, dan status berubah menjadi `PENDING` | Bukti pembayaran berhasil diunggah, status berubah menjadi *"Menunggu pemeriksaan"* | **PASS** |
| **3.6** | Login Staf Finance | URL `GET /sign-in`<br>• Email: `finance.mk@dailydose.test`<br>• Password: `FinancePass123!` | Staf Finance diautentikasi dengan hak akses internal `payment:review` & `payment:decide` | Berhasil login dan dialihkan ke `/workspace` | **PASS** |
| **3.7** | Akses Antrean Pembayaran | URL `GET /workspace/payments` | Antrean menampilkan transaksi member `Jessica Anastasya UAT` (Status: `PENDING`, Total: Rp 2.500.000) | Transaksi ditemukan di tabel antrean dengan status *Menunggu pemeriksaan* | **PASS** |
| **3.8** | Peninjauan Rincian & Bukti | Tombol `Periksa detail` (`/workspace/payments/[id]`)<br>• Verifikasi nominal transfer: Rp 2.500.000<br>• Verifikasi bukti bayar m-BCA | Rincian transaksi, snapshot paket, dan bukti bayar terlampir dengan jelas | Halaman detail memuat seluruh metadata pesanan dan bukti privat | **PASS** |
| **3.9** | Persetujuan Pembayaran | Tombol `Setujui pembayaran` -> Konfirmasi modal `Setujui dan aktifkan paket` | Status berubah menjadi `PAID` / `APPROVED`, timestamp `paidAt` terisi, dan paket pelanggan teraktivasi | Pembayaran disetujui, panel *"Paket pelanggan telah aktif"* muncul | **PASS** |
| **3.10** | Konfirmasi Saldo Sesi Member | URL `GET /account/packages` (Member Portal) | Member menerima paket aktif `10 Sessions Group Class Reformer` dengan saldo **10 sesi tersedia** | Saldo 10 sesi aktif terverifikasi pada kartu paket member | **PASS** |

---

### 4. Verifikasi Integritas Data (Database Audit)

Kueri audit dijalankan langsung ke tabel-tabel terkait di database `dailydose_v2_uat`:

```sql
-- 1. Verifikasi Status Transaksi Pembelian
SELECT 
  id, invoiceNumber, userId, branchId, packageId, 
  totalAmountRp, status, paymentMethod, paidAt, verifiedById, verifiedAt
FROM pembelian 
WHERE id = 'ff31112f-a106-48dd-bc15-70aa98346a16';

-- 2. Verifikasi Berkas Bukti Pembayaran
SELECT id, purchaseId, fileUrl, uploadedAt
FROM bukti_pembayaran 
WHERE purchaseId = 'ff31112f-a106-48dd-bc15-70aa98346a16';

-- 3. Verifikasi Aktivasi Paket Pelanggan
SELECT 
  id, purchaseId, userId, packageId, totalSessions, 
  remainingSessions, usedSessions, validFrom, validUntil, status
FROM paket_pelanggan 
WHERE purchaseId = 'ff31112f-a106-48dd-bc15-70aa98346a16';

-- 4. Verifikasi Mutasi Saldo pada Session Ledger
SELECT 
  id, customerPackageId, type, amount, balanceAfter, referenceId, notes, createdById
FROM session_ledger 
WHERE customerPackageId = 'bc5188df-bf14-4ae2-826a-3eb3bc97af22';
```

#### Hasil Audit Data Aktual di Basis Data:

```json
{
  "pembelian": {
    "id": "ff31112f-a106-48dd-bc15-70aa98346a16",
    "invoiceNumber": "INV-MUSRV09P-98FB61",
    "userId": "b4a79f7a-8f67-47ce-a1e6-a2f21ad75fef",
    "customer": "Jessica Anastasya UAT",
    "branchId": "a1000000-0000-4000-8000-000000000001",
    "branchName": "Daily Dose Green Garden (DD-GG)",
    "packageId": "20000000-0000-4000-8000-000000000301",
    "packageName": "10 Sessions Group Class Reformer",
    "subtotalRp": 2500000,
    "discountRp": 0,
    "totalAmountRp": 2500000,
    "status": "PAID",
    "paymentMethod": "BANK_TRANSFER",
    "paidAt": "2026-10-03T19:15:45.810Z",
    "verifiedById": "e2c5eb7a-da27-4198-8874-7a47337d139c",
    "verifiedByName": "Finance Manager MK (finance.mk@dailydose.test)",
    "verifiedAt": "2026-10-03T19:15:45.810Z"
  },
  "buktiPembayaran": {
    "id": "dd8aa0ea-3d29-42f4-8973-9ca089c6a612",
    "purchaseId": "ff31112f-a106-48dd-bc15-70aa98346a16",
    "fileUrl": "/uploads/payment-proofs/dd8aa0ea-3d29-42f4-8973-9ca089c6a612",
    "uploadedAt": "2026-10-03T19:15:33.929Z"
  },
  "paketPelanggan": {
    "id": "bc5188df-bf14-4ae2-826a-3eb3bc97af22",
    "purchaseId": "ff31112f-a106-48dd-bc15-70aa98346a16",
    "userId": "b4a79f7a-8f67-47ce-a1e6-a2f21ad75fef",
    "totalSessions": 10,
    "remainingSessions": 10,
    "usedSessions": 0,
    "validFrom": "2026-10-03T19:15:45.810Z",
    "validUntil": "2027-01-01T19:15:45.810Z",
    "status": "ACTIVE"
  },
  "sessionLedger": {
    "id": "c90e2195-dde2-4525-aaee-416d2dc3d804",
    "customerPackageId": "bc5188df-bf14-4ae2-826a-3eb3bc97af22",
    "type": "PURCHASE",
    "amount": 10,
    "balanceAfter": 10,
    "referenceId": "ff31112f-a106-48dd-bc15-70aa98346a16",
    "notes": "Saldo awal pembelian paket #INV-MUSRV09P-98FB61",
    "createdById": "e2c5eb7a-da27-4198-8874-7a47337d139c"
  }
}
```

> [!TIP]
> **Kesimpulan Integritas Data:**
> 1. Status pesanan `pembelian` terbukti beralih dari `AWAITING_PAYMENT` -> `PENDING` -> `PAID` dengan pencatatan timestamp `paidAt` dan identitas verifikator `verifiedById` yang valid.
> 2. Paket pelanggan diterbitkan secara atomik dengan kuota `totalSessions: 10`, `remainingSessions: 10`, `usedSessions: 0`, dan masa aktif 90 hari (`validUntil: 2027-01-01`).
> 3. Mutasi saldo tercatat di `session_ledger` dengan tipe `PURCHASE`, penambahan `+10` sesi, saldo akhir `balanceAfter: 10`, dan referensi ke ID pembelian.
> 4. Member `Jessica Anastasya UAT` kini telah memiliki saldo 10 sesi aktif dan siap melanjutkan ke **Skenario 4 (Manajemen Fasilitas & Penjadwalan Kelas)** serta **Skenario 5 (Booking Mandiri)**.

---
*Dokumen ini diterbitkan secara otomatis sebagai bagian dari rangkaian User Acceptance Testing (UAT) Daily Dose Pilates V2 Staging System.*

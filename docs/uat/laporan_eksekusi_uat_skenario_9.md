# LAPORAN HASIL EKSEKUSI USER ACCEPTANCE TESTING (UAT)
## Skenario 9: Rekonsiliasi Finansial, Honor Instruktur, & Tutup Buku / Period Lock

---

> [!IMPORTANT]
> **Status Skenario 9: ✅ PASS (LULUS 100%)**  
> Seluruh alur rekonsiliasi keuangan 5 pilar finansial, pencatatan beban operasional (*other cost*), verifikasi honor mengajar instruktur secara *realtime*, kalkulasi laba bersih, serta eksekusi penutupan buku bulanan (*monthly close / period lock*) telah teruji dan berhasil dieksekusi dengan sempurna. Mulai dari login Finance Staff (`finance.mk@dailydose.test`), verifikasi omset penjualan Rp 2.500.000 dari invoice Jessica Anastasya (`INV-MUSRV09P-98FB61`), validasi honor Coach Clara Rp 150.000 untuk 1 jam kelas selesai, pencatatan beban operasional Rp 500.000 ("Utilitas Listrik & Air Studio"), verifikasi perhitungan laba bersih Rp 1.850.000, hingga penutupan buku permanen di mana status periode berubah menjadi `LOCKED (TERKUNCI)`, snapshot finansial tersimpan aman di tabel `monthly_close`, dan seluruh aksi mutasi biaya menjadi *read-only* (terkunci dari perubahan).

---

### 1. Ringkasan Eksekusi Pengujian

| Parameter Pengujian | Rincian Hasil Aktual |
| :--- | :--- |
| **ID Skenario** | **UAT-SCEN-09** |
| **Nama Skenario** | Rekonsiliasi Finansial, Honor Instruktur, & Tutup Buku / Period Lock |
| **Aktor Pelaksana** | `ACT-04` (Finance Staff / Manager: `finance.mk@dailydose.test`, User ID: `e2c5eb7a-da27-4198-8874-7a47337d139c`) |
| **Waktu Eksekusi** | 2026-10-05 02:05 WIB |
| **Lingkungan** | Chromium Playwright Isolation (Viewport: 1440x900) |
| **Target URL Web** | `http://localhost:32120/finance` |
| **Target API** | `http://127.0.0.1:32121/api/v1` |
| **Basis Data Target** | `dailydose_v2_uat` (MySQL 8.4 Isolated) |
| **Cabang Target** | **Daily Dose Green Garden** (ID: `a1000000-0000-4000-8000-000000000001`) |
| **Periode Finansial** | **Oktober 2026 (`2026-10`)** |
| **Pilar 1: Omset Penjualan** | **Rp 2.500.000** (Invoice `INV-MUSRV09P-98FB61`, 1 transaksi paket Jessica Anastasya) |
| **Pilar 2: Honor Instruktur Realtime** | **Rp 150.000** (Coach Clara, 1 jam kelas selesai Skenario 6, 1 slot selesai) |
| **Pilar 3: Beban Operasional Lain** | **Rp 500.000** (Utilitas Listrik & Air Studio, Kategori: `OPERATING_EXPENSE`) |
| **Pilar 4: Laba Bersih Realtime** | **Rp 1.850.000** (*Perhitungan: Rp 2.500.000 - Rp 150.000 - Rp 500.000*) |
| **Pilar 5: Status Period Lock** | **LOCKED (TERKUNCI)** (*Awal: OPEN → Akhir: LOCKED*) |
| **Snapshot Database** | Tercatat di `monthly_close` dengan nilai omset, beban, dan laba bersih identik |
| **Proteksi Mutasi Pasca Lock**| **READ-ONLY AKTIF** (Tombol formulir input disabled, aksi tabel menjadi "Terkunci") |
| **Hasil Akhir** | **PASS (100% Memenuhi Keputusan Bisnis #8 & Prinsip Akuntansi V2)** |

---

### 2. Bukti Visual Pelaksanaan (Visual Evidence Carousel)

````carousel
![1. Verifikasi Laporan Omset Penjualan Periode 2026-10 (Rp 2.500.000)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_01_omset_report.png)
<!-- slide -->
![2. Verifikasi Laporan Beban Mengajar Instruktur Realtime (Coach Clara Rp 150.000)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_02_instructor_cost_realtime.png)
<!-- slide -->
![3. Input Biaya Operasional Lain Rp 500.000 Berhasil Dicatat (Status Sukses)](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_03_other_cost_saved.png)
<!-- slide -->
![4. Tabel Biaya Operasional Lain Tampil Aktif pada Periode Berstatus OPEN](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_04_other_cost_table.png)
<!-- slide -->
![5. Ringkasan 5 Pilar Finansial & Kalkulasi Laba Bersih Rp 1.850.000 Terverifikasi](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_05_profit_summary_accurate.png)
<!-- slide -->
![6. Dialog Konfirmasi Penutupan Buku Bulanan / Period Lock](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_06_confirm_period_lock_dialog.png)
<!-- slide -->
![7. Periode Berhasil Ditutup: Status LOCKED, Snapshot Permanen & Tombol Terkunci](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_07_period_locked_success.png)
<!-- slide -->
![8. Tabel Biaya Operasional Berubah Menjadi Read-Only ("Terkunci") Pasca Tutup Buku](/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee/uat_scen9_08_other_cost_locked_readonly.png)
````

---

### 3. Rekonsiliasi 5 Pilar Finansial Periode Oktober 2026

Berikut adalah tabulasi komparasi antara nilai yang diharapkan (*expected*) dengan nilai aktual yang dihitung oleh modul finansial Daily Dose Pilates V2:

| Indikator Finansial | Dasar Transaksi / Sumber Data | Ekspektasi (Rp) | Realisasi Sistem (Rp) | Status Validasi |
| :--- | :--- | :---: | :---: | :---: |
| **Total Omset Penjualan** | 1 Pembelian Paket Skenario 3 (`INV-MUSRV09P-98FB61`) | Rp 2.500.000 | **Rp 2.500.000** | ✅ MATCH (100%) |
| **Honor Mengajar Realtime**| 1 Jam Sesi Group Reformer Coach Clara (Skenario 6) | Rp 150.000 | **Rp 150.000** | ✅ MATCH (100%) |
| **Beban Instruktur Proyeksi**| Proyeksi beban 10 sesi paket terjual @ Rp 125.000 | Rp 1.250.000 | **Rp 1.250.000** | ✅ MATCH (100%) |
| **Beban Operasional Lain** | Input Utilitas Listrik & Air Studio (`OPERATING_EXPENSE`) | Rp 500.000 | **Rp 500.000** | ✅ MATCH (100%) |
| **Laba Bersih Realtime** | Omset (`2.500.000`) - Honor Realtime (`150.000`) - Biaya Lain (`500.000`) | Rp 1.850.000 | **Rp 1.850.000** | ✅ MATCH (100%) |
| **Laba Bersih Proyeksi** | Omset (`2.500.000`) - Honor Proyeksi (`1.250.000`) - Biaya Lain (`500.000`) | Rp 750.000 | **Rp 750.000** | ✅ MATCH (100%) |

---

### 4. Audit Bukti Basis Data (`dailydose_v2_uat`)

Pemeriksaan integritas basis data dilakukan melalui kueri langsung terhadap tabel snapshot penutupan buku (`monthly_close`) dan tabel biaya operasional (`other_costs`):

#### A. Snapshot Tabel `monthly_close`
```json
{
  "branchId": "a1000000-0000-4000-8000-000000000001",
  "period": "2026-10",
  "status": "LOCKED",
  "omsetRp": 2500000,
  "costRealtimeRp": 150000,
  "costProjectionRp": 1250000,
  "otherCostRp": 500000,
  "profitRp": 1850000,
  "controlHash": "hash-a1000000-0000-4000-8000-000000000001-2026-10-1791140730175",
  "closedById": "e2c5eb7a-da27-4198-8874-7a47337d139c",
  "closedBy": {
    "displayName": "Finance Manager MK",
    "email": "finance.mk@dailydose.test"
  },
  "closedAt": "2026-10-04T19:05:30.175Z"
}
```

#### B. Rekaman Beban Operasional `other_costs`
```json
{
  "id": "c1f76cf6-562a-4360-a8d1-6782ffce551e",
  "branchId": "a1000000-0000-4000-8000-000000000001",
  "period": "2026-10",
  "category": "OPERATING_EXPENSE",
  "description": "Utilitas Listrik & Air Studio",
  "amountRp": 500000,
  "createdById": "e2c5eb7a-da27-4198-8874-7a47337d139c",
  "createdAt": "2026-10-04T19:05:22.416Z"
}
```

---

### 5. Kepatuhan Tata Kelola & Keputusan Bisnis

1. **Keputusan Bisnis #8 (Tutup Buku Bulanan & Period Lock):**
   - Penutupan buku membekukan seluruh angka finansial ke dalam snapshot permanen (`monthly_close`).
   - Setelah periode berstatus `LOCKED`, endpoint pembuatan biaya (`POST /other-costs`) dan pemutakhiran biaya (`PATCH /other-costs/:id`) menolak mutasi dengan `409 Conflict: PERIOD_ALREADY_LOCKED`.
   - UI front-end secara otomatis menonaktifkan kontrol tombol *"Simpan biaya"* dan *"Tutup periode"*, serta mengubah aksi tabel pengeluaran menjadi teks *"Terkunci"*.
2. **Keputusan Bisnis #9 (Honor Instruktur Realtime Berbasis Kehadiran Selesai):**
   - Honor mengajar hanya diakui jika sesi slot kelas telah mencapai status `COMPLETED` dengan kehadiran instruktur yang terverifikasi.
   - Sesi Coach Clara yang selesai pada Skenario 6 langsung terefleksi secara presisi sebesar Rp 150.000 tanpa deviasi.
3. **Keputusan Bisnis #10 (Cakupan Finansial Berbasis Cabang & Audit Trail):**
   - Seluruh mutasi biaya lain terikat ke ID Cabang Studio (`Daily Dose Green Garden`) dan mencatat pembuat transaksi (`createdById`).
   - Eksekusi penutupan periode meng-generate `controlHash` unik untuk memvalidasi integritas data laporan keuangan.

---

### 6. Kesimpulan & Rekomendasi
Skenario 9 berhasil membuktikan ketangguhan sistem keuangan Daily Dose Pilates V2:
- Perhitungan omset, beban mengajar aktual, beban proyeksi, beban operasional, dan laba bersih berjalan 100% akurat dan terintegrasi dari transaksi-transaksi sebelumnya.
- Mekanisme perlindungan *period lock* menjamin pembukuan masa lampau tidak dapat dimanipulasi atau diubah setelah disahkan oleh staf finansial.
- Skenario dinyatakan **LULUS (PASS 100%)**, siap dilanjutkan ke **Skenario 10: Pengujian Keamanan & Isolasi Data Lintas Cabang (Cross-Branch Isolation & Security RBAC)**.

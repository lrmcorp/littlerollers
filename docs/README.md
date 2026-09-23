# 📚 Dokumentasi Resmi Daily Dose Pilates v2

Selamat datang di pusat dokumentasi resmi **Daily Dose Pilates Studio Management System v2.0**.
Direktori ini berisi seluruh dokumen acuan arsitektur, spesifikasi bisnis, panduan operasional produksi, kamus data, dan skenario pengujian resmi (UAT).

---

## 📑 Indeks Dokumen Resmi (Authoritative Index)

### 1. Kredensial & Pengujian Sistem (Testing & QA)
| Dokumen | Format | Deskripsi & Kegunaan |
| :--- | :---: | :--- |
| [**AKUN_TESTING_RESMI.md**](./AKUN_TESTING_RESMI.md) | Markdown | **Single Source of Truth** untuk seluruh akun testing resmi (7 Role + Customer), kredensial argon2, scope cabang, dan pemetaan rute. |
| [**PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md**](./PANDUAN_DAN_SKENARIO_UAT_LENGKAP_V2.md) | Markdown | Panduan lengkap 10 skenario UAT kronologis alami (Customer Journey, KYC, Booking, Presensi, hingga Tutup Buku). |
| [**DOKUMEN_HASIL_AUDIT_DAN_REVIEW_OPERASIONAL_V2.md**](./DOKUMEN_HASIL_AUDIT_DAN_REVIEW_OPERASIONAL_V2.md) | Markdown | Laporan komprehensif hasil audit teknis, temuan cacat/bug, celah operasional, dan rencana remediasi sistem. |

---

### 2. Panduan Operasional & Kepatuhan Bisnis (Operations & Governance)
| Dokumen | Format | Deskripsi & Kegunaan |
| :--- | :---: | :--- |
| [**FITUR_MODUL_DAN_FLOW_PER_ROLE.md**](./FITUR_MODUL_DAN_FLOW_PER_ROLE.md) | Markdown | **Spesifikasi Lengkap Modul, Fitur, Alur End-to-End per Role (7 Peran), dan Matriks Hak Akses & Pembatasan.** |
| [**Spesifikasi Sistem Daily Dose Pilates v1.0.pdf**](./Spesifikasi%20Sistem%20Daily%20Dose%20Pilates%20v1.0.pdf) | PDF | Dokumen sumber hukum & spesifikasi bisnis resmi dari manajemen (Reyner - HR Group) yang memuat **13 Keputusan Bisnis Mutlak**. |
| [**PANDUAN_OPERASIONAL_PRODUKSI.md**](./PANDUAN_OPERASIONAL_PRODUKSI.md) | Markdown | Standar Prosedur Operasional (SOP) produksi, konfigurasi runtime (Next.js 15, NestJS, Background Worker), manajemen port, dan penanganan insiden. |
| [**RENCANA_AKSI_SPESIFIKASI_V1.md**](./RENCANA_AKSI_SPESIFIKASI_V1.md) | Markdown | Roadmap implementasi teknis untuk memastikan 100% kepatuhan terhadap 13 Keputusan Bisnis yang sudah dikunci. |

---

### 3. Arsitektur, Basis Data & API (Architecture & Data)
| Dokumen | Format | Deskripsi & Kegunaan |
| :--- | :---: | :--- |
| [**PANDUAN_14_TABEL_INTI_DAILYDOSE.md**](./PANDUAN_14_TABEL_INTI_DAILYDOSE.md) | Markdown | *Cheat-sheet* navigasi 14 tabel inti database MySQL untuk mempermudah pengerjaan harian tanpa beban kognitif 97 tabel lama. |
| [**RENCANA_PENYEDERHANAAN_ARSITEKTUR_V2.md**](./RENCANA_PENYEDERHANAAN_ARSITEKTUR_V2.md) | Markdown | Dokumentasi arsitektur perampingan kode, penghapusan birokrasi form, dan pelepasan ketergantungan build SDK generator. |
| [**MOBILE_CUSTOMER_API_CONTRACT.md**](./MOBILE_CUSTOMER_API_CONTRACT.md) | Markdown | Kontrak spesifikasi teknis REST API untuk integrasi aplikasi mobile (iOS & Android). |
| [**DailyDose_V2_Arsitektur_Sistem_dan_Database.pdf**](./DailyDose_V2_Arsitektur_Sistem_dan_Database.pdf) | PDF | Diagram arsitektur modular monolith dan topologi database sistem v2. |
| [**DailyDose_V2_Database_Design_Document.pdf**](./DailyDose_V2_Database_Design_Document.pdf) | PDF | Dokumen perancangan skema relasional database lengkap. |
| [**DailyDose_V2_Kamus_Data_dan_Desain_Database.html**](./DailyDose_V2_Kamus_Data_dan_Desain_Database.html) | HTML | Kamus data interaktif seluruh tabel dan kolom database (dapat dibuka langsung di browser). |
| [**DailyDose_V2_Kamus_Data_dan_Desain_Database.pdf**](./DailyDose_V2_Kamus_Data_dan_Desain_Database.pdf) | PDF | Kamus data format PDF untuk arsip dokumentasi offline. |

---

## 🔒 13 Keputusan Bisnis yang Sudah Dikunci (Locked Decisions)

Setiap pengembangan fitur, audit, dan pengujian wajib tunduk pada 13 Keputusan Bisnis Mutlak berikut:
1. **Sesi Terpotong saat Selesai & Hadir**: Sesi pelanggan tidak dipotong saat booking, melainkan saat status kelas berubah menjadi `COMPLETED` dan pelanggan hadir. Presensi pelanggan dilakukan via Link Mandiri, presensi instruktur via QR Scanner.
2. **Customer Self-Booking**: Pelanggan melakukan booking mandiri dari jadwal kelas (*timetable*); booking manual via Admin hanya untuk *rare cases*.
3. **Expiry Basis**: Masa berlaku paket berbasis tanggal (*validUntil*); sisa sesi hangus otomatis saat tanggal kedaluwarsa tiba.
4. **Cutoff Auto-Cancel H-24**: Kelas otomatis dibatalkan sistem jika peserta kurang dari kuota minimum pada jendela H-24 jam sebelum kelas dimulai, sesi dikembalikan utuh via mutasi `REFUND_AUTOCANCEL`.
5. **Min Quota per Kelas per Cabang**: Kuota minimum peserta ditentukan spesifik per jenis kelas dan per cabang studio.
6. **Birokrasi Reschedule**: Reschedule $\ge$ H-24 jam mengembalikan sesi secara instan; reschedule $<$ H-24 jam memerlukan permohonan darurat medis via Admin dan persetujuan resmi Studio Manager (`SessionAdjustRequest`).
7. **Struktur Multi-Cabang**: Peran *Owner* terikat pada cabang tertentu; *Super Owner* yang berwenang menugaskan kepemilikan multi-cabang.
8. **Tutup Buku Bulanan & Jurnal Koreksi**: Tutup buku membekukan angka finansial (*Period Lock*). Koreksi pasca-lock dicatat sebagai jurnal koreksi di bulan berjalan dengan persetujuan Super Owner.
9. **Batas Toleransi Backfill H+2**: Admin dapat melakukan backfill presensi susulan maksimal hingga H+2 jam setelah kelas selesai.
10. **Isolasi Finansial Cabang**: Owner cabang hanya diizinkan melihat data dan rincian beban instruktur pada cabangnya sendiri (*Zero Cross-Branch Leakage*).
11. **Reminder WhatsApp Internal**: Notifikasi ringkasan paket kedaluwarsa dikirimkan ke WhatsApp Admin setiap 3 jam, serta ke Owner dan Super Owner setiap 3 hari.
12. **Reminder WhatsApp Customer Menjelang Expired**: Dikirimkan otomatis pada H-7, H-3, dan H-1 sebelum paket habis.
13. **Reminder WhatsApp Customer Sudah Expired**: Dikirimkan berkala setiap 3 hari untuk penawaran perpanjangan paket.

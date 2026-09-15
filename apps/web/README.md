# DailyDose V2 - Frontend Web Application (`apps/web`)

Aplikasi web modern DailyDose V2 dibangun menggunakan **Next.js 15 (App Router)** dan **Tailwind CSS**.

---

## 🗺️ Taksonomi Rute & Struktur Folder

Aplikasi web ini memisahkan secara tegas tiga zona pengguna:

```
apps/web/app/
├── (Zona 1: Publik & Katalog)
│   ├── page.tsx                    -> Landing page utama (/)
│   ├── classes/page.tsx            -> Katalog kelas publik (/classes)
│   │   └── [slug]/page.tsx         -> Detail jenis kelas (/classes/[slug])
│   ├── packages/page.tsx           -> Katalog paket sesi publik (/packages)
│   │   └── [id]/page.tsx           -> Detail paket sesi (/packages/[id])
│   ├── locations/page.tsx          -> Informasi lokasi studio (/locations)
│   │   └── [slug]/page.tsx         -> Detail studio cabang (/locations/[slug])
│   ├── schedule/[id]/page.tsx      -> Detail jadwal slot kelas publik (/schedule/[id])
│   ├── contact/page.tsx            -> Halaman kontak & WhatsApp (/contact)
│   └── (Autentikasi)
│       ├── sign-in/page.tsx        -> Halaman masuk (/sign-in)
│       ├── register/page.tsx       -> Pendaftaran akun baru (/register)
│       ├── forgot-password/        -> Lupa password
│       └── reset-password/         -> Reset password
│
├── (Zona 2: Portal Pelanggan / Member)
│   ├── account/                    -> Dashboard akun member (/account)
│   │   ├── profile/page.tsx        -> Profil pelanggan (/account/profile)
│   │   ├── packages/page.tsx       -> Paket aktif & kuota (/account/packages)
│   │   ├── security/page.tsx       -> Ganti password & keamanan (/account/security)
│   │   └── settings/page.tsx       -> Preferensi cabang & studio (/account/settings)
│   ├── orders/page.tsx             -> Riwayat pembelian & invoice (/orders)
│   │   └── [id]/page.tsx           -> Detail invoice & bukti transfer (/orders/[id])
│   ├── bookings/page.tsx           -> Jadwal booking sesi member (/bookings)
│   │   ├── new/page.tsx            -> Alur booking kelas (/bookings/new)
│   │   └── [id]/page.tsx           -> Detail booking & token check-in (/bookings/[id])
│   ├── checkout/page.tsx           -> Alur pembayaran paket (/checkout)
│   └── check-in-pass/page.tsx      -> Pass QR presensi member (/check-in-pass)
│
├── (Zona 3: Admin & Staff Workspace)
│   ├── workspace/                  -> Dashboard utama staf (/workspace)
│   │   ├── branches/               -> Manajemen Cabang (/workspace/branches)
│   │   │   └── [id]/               -> Detail cabang, venue, & rekening transfer
│   │   ├── classes/page.tsx        -> Timetable & Manajemen Slot Kelas (/workspace/classes)
│   │   ├── packages/page.tsx       -> Manajemen Definisi Paket Sesi (/workspace/packages)
│   │   │   └── [id]/page.tsx       -> Edit paket sesi
│   │   ├── vouchers/page.tsx       -> Manajemen Voucher Diskon (/workspace/vouchers)
│   │   │   └── [id]/page.tsx       -> Detail & kuota voucher
│   │   ├── payments/page.tsx       -> Antrean Verifikasi Pembayaran (/workspace/payments)
│   │   │   └── [id]/page.tsx       -> Review bukti transfer
│   │   └── bookings/page.tsx       -> Roster & Booking Asistensi (/workspace/bookings)
│   │
│   ├── customers/page.tsx          -> Database Member & Riwayat (/customers)
│   ├── instructors/page.tsx        -> Manajemen Coach & Jadwal Mengajar (/instructors)
│   ├── users/page.tsx              -> Manajemen Akun Pengguna (/users)
│   │   └── roles-permissions/      -> Pengaturan Hak Akses (/users/roles-permissions)
│   ├── finance/page.tsx            -> Laporan Keuangan & Rekonsiliasi (/finance)
│   ├── ledger/page.tsx             -> Audit Buku Besar Mutasi Sesi (/ledger)
│   ├── audit/page.tsx              -> Audit Trail Aktivitas Sistem (/audit)
│   ├── master/page.tsx             -> Konfigurasi Master & Pengaturan Studio (/master)
│   ├── operations/page.tsx         -> Monitoring Operasional Sistem (/operations)
│   └── check-in-scanner/page.tsx   -> Scanner Presensi QR Studio (/check-in-scanner)
│
└── components/                     -> Komponen UI bersama (Buttons, Modals, Forms, Navbar)
```

---

## 🔐 Multi-Branch Scoping Behavior

Aplikasi web secara otomatis menyelaraskan visibilitas cabang melalui header dropdown:
1. **Superadmin & Staf Tanpa Cabang Tertentu (`preferredBranchId: null`)**:
   - Memiliki akses global (`branch:all`).
   - Dropdown cabang menampilkan seluruh cabang aktif (`DD-JKT`, `DD-BSD`).
   - Staf dapat beralih cabang untuk melihat jadwal dan data masing-masing cabang secara dinamis.
2. **Staf dengan Penugasan Cabang Khusus (`preferredBranchId` terisi UUID)**:
   - Menerapkan *Strict Scoping*.
   - Hanya cabang tersebut yang muncul dan dapat diakses.

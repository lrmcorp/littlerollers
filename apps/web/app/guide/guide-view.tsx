'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileCheck2,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  QrCode,
  Receipt,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import { publicContainer } from '../components/public/public-styles';

type RoleKey = 'customer' | 'frontdesk' | 'finance' | 'owner';

interface GuideSection {
  id: string;
  title: string;
  badge: string;
  description: string;
  steps: {
    number: number;
    title: string;
    description: string;
    tips?: string;
  }[];
  mockup: {
    type: string;
    title: string;
    items: { label: string; value: string; tone?: 'success' | 'warning' | 'info' }[];
    statusBadge?: { text: string; tone: 'success' | 'warning' | 'info' };
  };
}

const roleGuides: Record<
  RoleKey,
  {
    roleName: string;
    tagline: string;
    icon: typeof UserCheck;
    sections: GuideSection[];
  }
> = {
  customer: {
    roleName: 'Pelanggan / Member',
    tagline: 'Panduan lengkap mulai dari pendaftaran, beli paket, booking kelas hingga check-in',
    icon: UserCheck,
    sections: [
      {
        id: 'cust-register',
        title: '1. Registrasi & Verifikasi Identitas (KYC)',
        badge: 'Langkah Awal',
        description:
          'Setiap member baru wajib mendaftar dengan email aktif dan mengunggah foto KTP serta selfie untuk verifikasi keamanan.',
        steps: [
          {
            number: 1,
            title: 'Buka Halaman Pendaftaran',
            description:
              'Klik tombol "Daftar" di sudut kanan atas halaman utama atau kunjungi /register.',
          },
          {
            number: 2,
            title: 'Isi Data Pribadi & Kontak',
            description:
              'Masukkan nama lengkap, email, nomor WhatsApp (format Indonesia), tanggal lahir, dan password minimal 8 karakter.',
          },
          {
            number: 3,
            title: 'Unggah Foto KTP & Foto Selfie',
            description:
              'Unggah foto e-KTP yang jelas dan foto selfie wajah Anda. Data ini dienkripsi dan hanya digunakan untuk verifikasi identitas member studio.',
            tips: 'Pastikan foto tidak buram dan teks KTP dapat terbaca dengan jelas.',
          },
          {
            number: 4,
            title: 'Verifikasi & Aktivasi Akun',
            description:
              'Tim verifikator akan memvalidasi data Anda. Anda akan menerima notifikasi WhatsApp/Email saat akun telah disetujui (APPROVED).',
          },
        ],
        mockup: {
          type: 'form',
          title: 'Status Verifikasi Identitas Member',
          items: [
            { label: 'Status Akun', value: 'APPROVED', tone: 'success' },
            { label: 'Dokumen KTP', value: 'Tervalidasi (e-KTP Terbaca)', tone: 'success' },
            { label: 'Foto Selfie', value: 'Cocok dengan KTP', tone: 'success' },
            { label: 'Akses Booking', value: 'Aktif Penuh', tone: 'info' },
          ],
          statusBadge: { text: 'Terverifikasi', tone: 'success' },
        },
      },
      {
        id: 'cust-package',
        title: '2. Membeli Paket Kelas Pilates',
        badge: 'Pembelian',
        description:
          'Beli paket sesi sesuai kebutuhan studio latihan Anda (Jakarta Studio atau BSD Studio).',
        steps: [
          {
            number: 1,
            title: 'Pilih Lokasi & Paket',
            description:
              'Kunjungi menu "Paket & Harga" (/packages). Pilih lokasi studio (Jakarta atau BSD) lalu tentukan paket sesi (misal: 10 Sesi Reformer).',
          },
          {
            number: 2,
            title: 'Gunakan Voucher Diskon (Opsional)',
            description:
              'Jika memiliki kode promo/voucher, masukkan pada kolom voucher saat checkout untuk mendapatkan potongan harga.',
          },
          {
            number: 3,
            title: 'Lakukan Pembayaran Transfer Bank',
            description:
              'Transfer total tagihan sesuai rekening bank resmi Daily Dose yang tertera di halaman checkout.',
          },
          {
            number: 4,
            title: 'Unggah Bukti Transfer',
            description:
              'Unggah screenshot/foto struk bukti transfer. Tim Finance akan mereview bukti pembayaran dalam waktu singkat dan saldo kuota sesi otomatis bertambah.',
            tips: 'Format bukti bayar yang didukung: JPG, PNG, PDF hingga 5 MB.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Rincian Pesanan Paket Aktif',
          items: [
            { label: 'Nama Paket', value: '10x Group Reformer Pilates' },
            { label: 'Lokasi Berlaku', value: 'Daily Dose Jakarta' },
            { label: 'Total Pembayaran', value: 'Rp 3.500.000' },
            { label: 'Status Pembayaran', value: 'LUNAS (Verified)', tone: 'success' },
            { label: 'Sisa Kuota Sesi', value: '10 Sesi Tersedia', tone: 'info' },
          ],
          statusBadge: { text: 'Paket Aktif', tone: 'success' },
        },
      },
      {
        id: 'cust-booking',
        title: '3. Memilih Jadwal & Booking Kelas',
        badge: 'Reservasi',
        description:
          'Pilih jadwal kelas Pilates harian sesuai instruktur dan waktu luang yang Anda inginkan.',
        steps: [
          {
            number: 1,
            title: 'Buka Jadwal Kelas',
            description:
              'Kunjungi menu "Jadwal" (/classes). Pilih tanggal dan filter jenis kelas (Reformer, Mat, Barre).',
          },
          {
            number: 2,
            title: 'Pilih Slot yang Tersedia',
            description:
              'Klik pada slot kelas yang masih memiliki kuota kosong. Anda dapat melihat nama instruktur dan detail ruangan.',
          },
          {
            number: 3,
            title: 'Konfirmasi Booking',
            description:
              'Pilih paket aktif Anda sebagai metode pembayaran kuota, lalu klik "Konfirmasi Booking".',
          },
          {
            number: 4,
            title: 'Tiket & QR Pass Diterbitkan',
            description:
              'Booking berhasil tercatat! Anda akan menerima konfirmasi via WhatsApp dan tiket QR Code muncul di menu "Booking Saya".',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Tiket Booking Sesi Terkonfirmasi',
          items: [
            { label: 'Kelas', value: 'Reformer Flow - All Levels' },
            { label: 'Jadwal', value: 'Senin, 09:00 - 09:50 WIB' },
            { label: 'Instruktur', value: 'Coach Sarah' },
            { label: 'Studio', value: 'Studio Reformer A - Jakarta' },
            { label: 'Kode Booking', value: 'BKG-202608-0042' },
          ],
          statusBadge: { text: 'BOOKED', tone: 'success' },
        },
      },
      {
        id: 'cust-checkin',
        title: '4. Reschedule & Check-in QR di Studio',
        badge: 'Kehadiran',
        description:
          'Aturan perubahan jadwal kelas dan tata cara check-in saat tiba di lokasi studio.',
        steps: [
          {
            number: 1,
            title: 'Ketentuan Reschedule (Aturan H-24)',
            description:
              'Member dapat melakukan reschedule jadwal kelas mandiri maksimal 24 jam sebelum kelas dimulai (Cutoff H-24) tanpa pemotongan sesi.',
            tips: 'Reschedule kurang dari 24 jam tidak dapat dilakukan untuk menjaga kepastian slot member lain.',
          },
          {
            number: 2,
            title: 'Buka QR Code Pass',
            description:
              'Saat tiba di studio Daily Dose, buka menu "Booking Saya" lalu klik "Lihat QR Pass".',
          },
          {
            number: 3,
            title: 'Tunjukkan ke Front Desk',
            description:
              'Tunjukkan layar QR Code kepada staf resepsionis studio untuk di-scan. Status kehadiran Anda langsung tercatat "ATTENDED".',
          },
        ],
        mockup: {
          type: 'card',
          title: 'QR Code Pass Digital Member',
          items: [
            { label: 'Nama Member', value: 'Budi Santoso' },
            { label: 'Status Kehadiran', value: 'ATTENDED (Hadir)', tone: 'success' },
            { label: 'Waktu Check-In', value: '08:48 WIB' },
            { label: 'Ruangan', value: 'Studio A - Reformer #04' },
          ],
          statusBadge: { text: 'Verified Pass', tone: 'success' },
        },
      },
    ],
  },
  frontdesk: {
    roleName: 'Front Desk & Operasional Cabang',
    tagline: 'Panduan absensi kehadiran QR, pengaturan slot kelas harian, dan assisted booking',
    icon: ClipboardList,
    sections: [
      {
        id: 'ops-scanner',
        title: '1. Scanner QR Code Kehadiran Member',
        badge: 'Check-In',
        description:
          'Fitur pemindai kamera instan untuk memvalidasi kehadiran member yang datang ke studio.',
        steps: [
          {
            number: 1,
            title: 'Buka Menu Scanner',
            description:
              'Masuk ke Workspace lalu pilih menu "Check-in Scanner" (/check-in-scanner).',
          },
          {
            number: 2,
            title: 'Arahkan Kamera ke QR Member',
            description:
              'Arahkan kamera tablet/smartphone ke layar QR Pass member. Sistem akan otomatis mendeteksi kode.',
          },
          {
            number: 3,
            title: 'Validasi Tiket Otomatis',
            description:
              'Sistem akan memverifikasi kecocokan jadwal kelas dan nama member secara real-time. Layar akan menampilkan konfirmasi hijau jika valid.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Hasil Scan Absensi Kehadiran',
          items: [
            { label: 'Status Scan', value: 'VALID - BERHASIL', tone: 'success' },
            { label: 'Nama Member', value: 'Jessica Tan' },
            { label: 'Kelas', value: 'Reformer Intermediate (10:00)' },
            { label: 'Nomor Reformer', value: 'Unit #02' },
          ],
          statusBadge: { text: 'Check-in Sukses', tone: 'success' },
        },
      },
      {
        id: 'ops-classes',
        title: '2. Manajemen Slot & Assisted Booking',
        badge: 'Jadwal & Kuota',
        description:
          'Membantu member walk-in memesan sesi dan mengatur instruktur pengganti jika berhalangan.',
        steps: [
          {
            number: 1,
            title: 'Kelola Slot Kelas Cabang',
            description:
              'Buka menu "Kelas" di workspace. Anda dapat memantau okupansi kursi per sesi dan daftar tunggu (*waitlist*).',
          },
          {
            number: 2,
            title: 'Lakukan Assisted Booking',
            description:
              'Jika ada member yang datang langsung ke meja resepsionis, cari nama member lalu masukkan ke slot kelas yang masih tersedia.',
          },
          {
            number: 3,
            title: 'Ganti Instruktur (*Substitute*)',
            description:
              'Jika instruktur utama berhalangan hadir, staf cabang dapat memilih instruktur pengganti dan member terdaftar otomatis menerima pemberitahuan.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Panel Slot Kelas Studio',
          items: [
            { label: 'Okupansi Kelas', value: '6 / 6 Kursi Penuh', tone: 'warning' },
            { label: 'Instruktur Aktif', value: 'Coach Amanda' },
            { label: 'Status Evaluasi H-24', value: 'CONFIRMED (Ready)', tone: 'success' },
            { label: 'Daftar Hadir', value: '6 Member Terdaftar' },
          ],
          statusBadge: { text: 'Slot Ready', tone: 'info' },
        },
      },
    ],
  },
  finance: {
    roleName: 'Finance & Accounting',
    tagline: 'Panduan verifikasi pembayaran, buku besar saldo (Ledger), dan rekonsiliasi arus kas',
    icon: Receipt,
    sections: [
      {
        id: 'fin-approval',
        title: '1. Verifikasi & Approval Pembayaran',
        badge: 'Arus Kas Masuk',
        description:
          'Memvalidasi bukti transfer masuk dari member sebelum sesi ditambahkan ke kuota akun.',
        steps: [
          {
            number: 1,
            title: 'Buka Antrean Pembayaran',
            description:
              'Buka menu "Pembayaran" (/workspace/payments) untuk melihat daftar pesanan pending dengan bukti transfer baru.',
          },
          {
            number: 2,
            title: 'Cek Mutasi Rekening Bank',
            description:
              'Buka pratinjau bukti transfer member dan cocokkan nominal serta nomor rekening tujuan dengan mutasi bank studio.',
          },
          {
            number: 3,
            title: 'Klik "Approve Payment"',
            description:
              'Jika dana sudah masuk, klik tombol "Setujui". Sistem secara otomatis membuat entri Ledger dan mengisi saldo sesi member.',
            tips: 'Jika bukti transfer palsu atau tidak sesuai nominal, klik "Tolak" dengan menyertakan alasan jelas.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Rincian Verifikasi Pembayaran Transfer',
          items: [
            { label: 'ID Transaksi', value: 'ORD-202608-0188' },
            { label: 'Nominal Mutasi', value: 'Rp 3.500.000 (Sesuai)', tone: 'success' },
            { label: 'Rekening Tujuan', value: 'BCA - Daily Dose Indonesia' },
            { label: 'Keputusan Finance', value: 'APPROVED & LEDGER POSTED', tone: 'success' },
          ],
          statusBadge: { text: 'Approved', tone: 'success' },
        },
      },
      {
        id: 'fin-ledger',
        title: '2. Session Ledger & Penyesuaian Saldo',
        badge: 'Audit & Akuntansi',
        description:
          'Setiap pemakaian, pembelian, kedaluwarsa, atau kompensasi sesi tercatat permanen di Ledger yang tidak dapat dimanipulasi.',
        steps: [
          {
            number: 1,
            title: 'Pantau Buku Besar Saldo',
            description:
              'Buka menu "Ledger" (/ledger) untuk melihat riwayat audit saldo debit/kredit per member.',
          },
          {
            number: 2,
            title: 'Buat Penyesuaian Saldo (*Adjustment*)',
            description:
              'Jika terjadi kompensasi kendala teknis (misal: penambahan 1 sesi darurat), ajukan request adjustment di menu /ledger/adjustments dengan alasan tertulis.',
          },
          {
            number: 3,
            title: 'Otorisasi 4-Eyes Principle',
            description:
              'Setiap penyesuaian saldo memerlukan otorisasi bertingkat sebelum saldo efektif berubah di akun member.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Entri Ledger Audit Saldo',
          items: [
            { label: 'Tipe Mutasi', value: 'SESSION_USAGE (Pengurangan Sesi)' },
            { label: 'Jumlah', value: '-1 Sesi' },
            { label: 'Referensi Booking', value: 'BKG-202608-0042' },
            { label: 'Saldo Akhir', value: '9 Sesi Tersedia', tone: 'info' },
          ],
          statusBadge: { text: 'Audit Synced', tone: 'info' },
        },
      },
    ],
  },
  owner: {
    roleName: 'Super Owner & Manajemen Eksekutif',
    tagline:
      'Panduan kontrol multi-cabang, perizinan RBAC, audit log keamanan, dan laporan laba rugi',
    icon: LayoutDashboard,
    sections: [
      {
        id: 'own-dashboard',
        title: '1. Executive Multi-Branch Command Center',
        badge: 'Pengawasan Bisnis',
        description:
          'Melihat metrik performa seluruh cabang studio (Jakarta & BSD) dalam satu tampilan komprehensif.',
        steps: [
          {
            number: 1,
            title: 'Buka Workspace Dashboard',
            description:
              'Masuk sebagai Super Owner untuk mengakses metrik Gross Sales, Pendapatan Bersih, Okupansi Kursi, dan Anomali.',
          },
          {
            number: 2,
            title: 'Filter Performa Cabang',
            description:
              'Gunakan filter cabang di bagian atas untuk membandingkan pertumbuhan antar cabang studio.',
          },
          {
            number: 3,
            title: 'Deteksi Anomali Keuangan',
            description:
              'Sistem secara otomatis mendeteksi anomali (diskon voucher tidak wajar, refund tertunda) untuk ditindaklanjuti segera.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Ringkasan Eksekutif Multi-Cabang',
          items: [
            { label: 'Total Penjualan Kotor', value: 'Rp 148.500.000', tone: 'success' },
            { label: 'Rata-rata Okupansi', value: '91.4% (Tinggi)', tone: 'success' },
            { label: 'Cabang Terbaik', value: 'Daily Dose Jakarta' },
            { label: 'Antrean Keputusan', value: '0 Pending', tone: 'info' },
          ],
          statusBadge: { text: 'Sehat & Optimal', tone: 'success' },
        },
      },
      {
        id: 'own-rbac',
        title: '2. Dynamic RBAC & Audit Trail Keamanan',
        badge: 'Tata Kelola & Keamanan',
        description:
          'Mengelola hak akses karyawan dan menelusuri seluruh riwayat aktivitas sensitif sistem.',
        steps: [
          {
            number: 1,
            title: 'Kelola Hak Akses Pengguna (/users)',
            description:
              'Tentukan peran staf (SUPER_OWNER, FINANCE, BRANCH_OPERATIONS, INSTRUCTOR). Batasi hak akses cabang sesuai penugasan.',
          },
          {
            number: 2,
            title: 'Buka Audit Trail Log (/audit)',
            description:
              'Setiap aktivitas approval, perubahan status kelas, pembatalan booking, dan modifikasi harga tercatat dengan IP Address dan Timestamp lengkap.',
          },
          {
            number: 3,
            title: 'Pantau Evaluasi Kuota Otomatis H-24',
            description:
              'Sistem Worker mengevaluasi seluruh kelas 24 jam sebelum mulai. Jika kuota minimum tidak terpenuhi, sistem otomatis meng-cancel kelas dan mengembalikan saldo member.',
          },
        ],
        mockup: {
          type: 'card',
          title: 'Log Audit Keamanan Terpusat',
          items: [
            { label: 'Total User Staf', value: '8 Pengguna Terotorisasi' },
            { label: 'Evaluasi H-24 Auto-Job', value: 'RUNNING (Sehat)', tone: 'success' },
            {
              label: 'Audit Log Integrity',
              value: '100% Immutable (Tervalidasi)',
              tone: 'success',
            },
          ],
          statusBadge: { text: 'Secure & Compliant', tone: 'success' },
        },
      },
    ],
  },
};

export function GuideView() {
  const [activeRole, setActiveRole] = useState<RoleKey>('customer');
  const [searchQuery, setSearchQuery] = useState('');

  const currentGuide = roleGuides[activeRole];

  const filteredSections = currentGuide.sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.steps.some((st) => st.title.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <main className="min-h-screen bg-dd-cream font-sans text-dd-ink">
      {/* Header Banner */}
      <header className="border-b border-dd-line/80 bg-white pt-10 pb-12 shadow-sm">
        <div className={publicContainer}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-dd-forest-dark/10 px-3.5 py-1 text-xs font-bold text-dd-forest uppercase">
              <BookOpen className="size-3.5" /> Pusat Panduan Resmi
            </span>
            <Link
              href="/"
              className="text-xs font-bold text-dd-forest no-underline hover:underline"
            >
              ← Kembali ke Beranda
            </Link>
          </div>

          <h1 className="mt-4 font-sans text-3xl font-bold tracking-tight text-dd-ink sm:text-4xl">
            Panduan Penggunaan Aplikasi Daily Dose
          </h1>
          <p className="mt-2 max-w-2xl text-base text-dd-muted">
            Tata cara operasional lengkap langkah-demi-langkah beserta pratinjau antarmuka untuk
            Pelanggan, Front Desk, Tim Finance, dan Super Owner.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute top-3.5 left-4 size-4 text-dd-muted" />
              <input
                type="text"
                placeholder="Cari panduan (misal: booking, bayar, qr pass, reschedule)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-dd-md border border-dd-line bg-dd-cream/50 py-3 pr-4 pl-11 text-sm text-dd-ink outline-none transition focus:border-dd-forest focus:bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Tabs */}
      <nav
        aria-label="Pilih Peran Pengguna"
        className="border-b border-dd-line bg-white/80 sticky top-0 z-20 backdrop-blur-md"
      >
        <div className={publicContainer}>
          <div className="flex space-x-2 overflow-x-auto py-3">
            {(
              [
                { key: 'customer', label: '1. Pelanggan / Member', icon: UserCheck },
                { key: 'frontdesk', label: '2. Front Desk & Cabang', icon: ClipboardList },
                { key: 'finance', label: '3. Finance & Kasir', icon: Receipt },
                { key: 'owner', label: '4. Super Owner & Eksekutif', icon: LayoutDashboard },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeRole === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveRole(tab.key);
                    setSearchQuery('');
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-dd-sm px-4 py-2.5 text-xs font-bold transition ${
                    active
                      ? 'bg-dd-forest text-white shadow-dd-soft'
                      : 'bg-transparent text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <section className={`${publicContainer} py-10`}>
        {/* Role Intro Banner */}
        <div className="mb-10 rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-dd-success-soft text-dd-forest">
              <currentGuide.icon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dd-ink">{currentGuide.roleName}</h2>
              <p className="mt-1 text-sm text-dd-muted">{currentGuide.tagline}</p>
            </div>
          </div>
        </div>

        {/* Sections List */}
        {filteredSections.length === 0 ? (
          <div className="rounded-dd-lg border border-dashed border-dd-line bg-white p-12 text-center text-dd-muted">
            <HelpCircle className="mx-auto size-8 text-dd-muted" />
            <p className="mt-3 font-semibold">
              Tidak ada panduan yang cocok dengan pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-dd-forest underline"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredSections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="overflow-hidden rounded-dd-lg border border-dd-line bg-white shadow-dd-card"
              >
                {/* Section Header */}
                <div className="border-b border-dd-line bg-dd-surface-muted/50 p-6 sm:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-dd-forest-dark/10 px-3 py-0.5 text-[11px] font-bold tracking-wider text-dd-forest uppercase">
                      {section.badge}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-dd-ink sm:text-xl">{section.title}</h3>
                  <p className="mt-1 text-sm text-dd-muted">{section.description}</p>
                </div>

                {/* Grid: Steps & Visual Mockup */}
                <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-8">
                  {/* Left: Steps List */}
                  <div className="space-y-6 lg:col-span-7">
                    <h4 className="text-xs font-bold tracking-wider text-dd-muted uppercase">
                      Langkah-demi-Langkah:
                    </h4>
                    <ol className="space-y-4 m-0 p-0 list-none">
                      {section.steps.map((st) => (
                        <li
                          key={st.number}
                          className="flex items-start gap-3.5 rounded-dd-md border border-dd-line/60 bg-dd-surface-muted/30 p-4 transition hover:bg-dd-surface-muted"
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-dd-forest text-xs font-bold text-white">
                            {st.number}
                          </span>
                          <div className="flex-1">
                            <strong className="block text-sm font-semibold text-dd-ink">
                              {st.title}
                            </strong>
                            <p className="mt-1 text-xs leading-relaxed text-dd-muted">
                              {st.description}
                            </p>
                            {st.tips && (
                              <div className="mt-2.5 flex items-center gap-1.5 rounded-dd-sm bg-dd-brass-soft/50 px-2.5 py-1 text-[11px] font-medium text-dd-brass-dark">
                                <Sparkles className="size-3 shrink-0" />
                                <span>Tip: {st.tips}</span>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Right: Interactive Visual Mockup / Screenshot preview */}
                  <div className="lg:col-span-5">
                    <h4 className="mb-3 text-xs font-bold tracking-wider text-dd-muted uppercase">
                      Pratinjau Antarmuka Aplikasi:
                    </h4>
                    <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-5 shadow-dd-soft">
                      <div className="flex items-center justify-between border-b border-dd-line pb-3">
                        <span className="text-xs font-bold text-dd-ink">
                          {section.mockup.title}
                        </span>
                        {section.mockup.statusBadge && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              section.mockup.statusBadge.tone === 'success'
                                ? 'bg-dd-success-soft text-dd-success'
                                : section.mockup.statusBadge.tone === 'warning'
                                  ? 'bg-dd-warning-soft text-dd-warning'
                                  : 'bg-dd-info-soft text-dd-info'
                            }`}
                          >
                            {section.mockup.statusBadge.text}
                          </span>
                        )}
                      </div>
                      <dl className="mt-4 space-y-3 m-0">
                        {section.mockup.items.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <dt className="text-dd-muted">{item.label}</dt>
                            <dd
                              className={`font-semibold ${
                                item.tone === 'success'
                                  ? 'text-dd-success'
                                  : item.tone === 'warning'
                                    ? 'text-dd-warning'
                                    : item.tone === 'info'
                                      ? 'text-dd-info'
                                      : 'text-dd-ink'
                              }`}
                            >
                              {item.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-5 rounded-dd-sm border border-dashed border-dd-line bg-white p-3 text-center text-[11px] text-dd-muted">
                        ✔ Terhubung secara otomatis ke database pusat Daily Dose
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Direct Action Link Banner */}
        <div className="mt-14 rounded-dd-lg bg-dd-forest p-8 text-white shadow-dd-float">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold">Siap Menggunakan Daily Dose?</h3>
              <p className="mt-1 text-sm text-white/70">
                Masuk ke akun Anda atau jelajahi jadwal kelas pilates sekarang.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/classes"
                className="rounded-dd-sm bg-white px-5 py-2.5 text-xs font-bold text-dd-forest no-underline transition hover:bg-white/90"
              >
                Lihat Jadwal Kelas
              </Link>
              <Link
                href="/sign-in"
                className="rounded-dd-sm border border-white/40 px-5 py-2.5 text-xs font-bold text-white no-underline transition hover:bg-white/10"
              >
                Masuk ke Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

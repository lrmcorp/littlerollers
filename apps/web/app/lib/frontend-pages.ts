export type FrontendPageGroup =
  | 'Operasional Studio'
  | 'Member & Pelanggan'
  | 'Penjualan & Keuangan'
  | 'Pengaturan & Sistem';

export interface FrontendPageDefinition {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  group: FrontendPageGroup;
  capabilities: string[];
  mutationCapabilities?: string[];
  priority: number;
  /**
   * Cakupan cabang halaman: `topbar` mengikuti pemilih "Cabang aktif" di topbar; `global` mencakup
   * semua cabang yang diizinkan dan pemilih di topbar dinonaktifkan.
   */
  branchScope: 'topbar' | 'global';
  accent: 'brand' | 'info' | 'warning' | 'neutral';
  icon?: string;
  roleRelevance?: string[];
  queueBadgeSource?: string;
  dashboardDeepLink?: string;
  isAdvanced?: boolean;
  isDormant?: boolean;
  /**
   * `preview`: halaman belum memakai penyimpanan/sumber data permanen. Diberi tag "Pratinjau" di
   * navigasi dan banner `previewNote` di header agar staf tidak menganggapnya catatan resmi.
   */
  maturity?: 'preview';
  previewNote?: string;
}

export const frontendPages: FrontendPageDefinition[] = [
  // ==========================================
  // 1. OPERASIONAL STUDIO (Tugas Harian Staf)
  // ==========================================
  {
    href: '/workspace',
    label: 'Ringkasan',
    shortLabel: 'Dashboard',
    description: 'Konteks sesi, cabang aktif, dan pintasan pekerjaan sesuai hak akses.',
    group: 'Operasional Studio',
    capabilities: [],
    priority: 1,
    branchScope: 'topbar',
    accent: 'brand',
    icon: 'layout-dashboard',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER', 'FINANCE', 'OPS'],
  },
  {
    href: '/workspace/classes',
    label: 'Timetable kelas',
    shortLabel: 'Kelas',
    description: 'Susun jadwal, tugaskan instruktur, lalu publikasikan atau batalkan kelas.',
    group: 'Operasional Studio',
    capabilities: ['class-slot:read'],
    mutationCapabilities: ['class-slot:manage'],
    priority: 2,
    branchScope: 'topbar',
    accent: 'info',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER'],
  },
  {
    href: '/workspace/bookings',
    label: 'Manajemen Booking',
    shortLabel: 'Booking',
    description: 'Booking bantuan, antrean perubahan jadwal, QR, dan kehadiran pelanggan.',
    group: 'Operasional Studio',
    capabilities: ['booking:read', 'reschedule:read'],
    mutationCapabilities: ['booking:create:assisted', 'reschedule:decide'],
    priority: 3,
    branchScope: 'topbar',
    accent: 'brand',
    icon: 'book-open-check',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER'],
    queueBadgeSource: 'reschedules',
    dashboardDeepLink: '/workspace/bookings?tab=reschedules&status=PENDING',
  },
  {
    href: '/check-in-scanner',
    label: 'Scan QR check-in',
    shortLabel: 'Scan QR',
    description: 'Scan QR pass pelanggan dan catat attendance pada jadwal aktif.',
    group: 'Operasional Studio',
    capabilities: ['attendance:manage'],
    priority: 4,
    branchScope: 'topbar',
    accent: 'info',
    roleRelevance: ['ADMIN', 'MANAGER', 'SUPER_OWNER'],
  },
  {
    href: '/support-cases',
    label: 'Bantuan Pelanggan',
    shortLabel: 'Bantuan',
    description: 'Kasus, prioritas, penugasan, label, dan catatan internal pelanggan.',
    group: 'Operasional Studio',
    capabilities: ['support:read'],
    mutationCapabilities: ['support:manage'],
    priority: 5,
    branchScope: 'global',
    accent: 'warning',
    roleRelevance: ['SUPER_OWNER', 'ADMIN', 'MANAGER'],
    maturity: 'preview',
    previewNote:
      'Kasus bantuan disimpan sementara di memori server dan hilang saat API dimulai ulang. Jangan dijadikan satu-satunya catatan.',
  },
  {
    href: '/workspace/reminders',
    label: 'Otomasi & Log Pengingat WhatsApp',
    shortLabel: 'Otomasi WA',
    description: 'Monitoring sistem auto-cancel kelas H-24 dan antrean notifikasi WhatsApp berjenjang.',
    group: 'Operasional Studio',
    capabilities: ['automation:read'],
    mutationCapabilities: ['automation:run'],
    priority: 6,
    branchScope: 'global',
    accent: 'brand',
    icon: 'message-square',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'MANAGER', 'ADMIN'],
  },

  // ==========================================
  // 2. MEMBER & PELANGGAN (Membership)
  // ==========================================
  {
    href: '/customers',
    label: 'Data Pelanggan',
    shortLabel: 'Pelanggan',
    description: 'Profil pelanggan terpadu, keamanan akun, order, paket, booking, dan timeline.',
    group: 'Member & Pelanggan',
    capabilities: ['customer:read'],
    mutationCapabilities: [
      'customer:write',
      'customer:credential:initialize',
      'customer:security:manage',
    ],
    priority: 10,
    branchScope: 'global',
    accent: 'brand',
    icon: 'users',
    roleRelevance: ['SUPER_OWNER', 'MANAGER', 'ADMIN'],
  },
  {
    href: '/ledger',
    label: 'Sesi Pelanggan',
    shortLabel: 'Sesi Pelanggan',
    description: 'Saldo paket, sesi tertahan, tersedia, dan histori pemakaian pelanggan.',
    group: 'Member & Pelanggan',
    capabilities: ['ledger:read'],
    priority: 11,
    branchScope: 'topbar',
    accent: 'neutral',
  },
  {
    href: '/identity-verifications',
    label: 'Verifikasi pelanggan',
    shortLabel: 'Verifikasi ID',
    description: 'Review selfie dan KTP pelanggan berdasarkan hak akses reviewer.',
    group: 'Member & Pelanggan',
    capabilities: ['identity-verification:read'],
    mutationCapabilities: ['identity-verification:decide'],
    priority: 12,
    branchScope: 'global',
    accent: 'warning',
    queueBadgeSource: 'verifications',
    dashboardDeepLink: '/identity-verifications?status=PENDING',
  },
  {
    href: '/ledger/adjustments',
    label: 'Penyesuaian Sesi',
    shortLabel: 'Penyesuaian Sesi',
    description: 'Permintaan perubahan saldo sesi dengan pemisahan requester dan approver.',
    group: 'Member & Pelanggan',
    capabilities: ['ledger:adjust:read'],
    mutationCapabilities: ['ledger:adjust:request', 'ledger:adjust:decide'],
    priority: 13,
    branchScope: 'topbar',
    accent: 'warning',
    queueBadgeSource: 'adjustments',
    dashboardDeepLink: '/ledger/adjustments?status=PENDING',
    roleRelevance: ['ADMIN', 'MANAGER', 'SUPER_OWNER'],
  },

  // ==========================================
  // 3. PENJUALAN & KEUANGAN (Billing & Kasir)
  // ==========================================
  {
    href: '/workspace/payments',
    label: 'Antrean Pembayaran',
    shortLabel: 'Pembayaran',
    description: 'Antrean pemeriksaan bukti transfer dan keputusan pembayaran.',
    group: 'Penjualan & Keuangan',
    capabilities: ['payment:review', 'purchase:review'],
    mutationCapabilities: ['payment:decide', 'purchase:decide'],
    priority: 20,
    branchScope: 'topbar',
    accent: 'warning',
    icon: 'credit-card',
    roleRelevance: ['ADMIN', 'MANAGER', 'FINANCE', 'SUPER_OWNER'],
    queueBadgeSource: 'payments',
    dashboardDeepLink: '/workspace/payments?status=PENDING',
  },
  {
    href: '/workspace/packages',
    label: 'Paket & promo harga',
    shortLabel: 'Paket',
    description: 'Kelola harga normal, promo aktif, dan histori harga paket.',
    group: 'Penjualan & Keuangan',
    capabilities: ['package-promotion:read'],
    mutationCapabilities: ['package-promotion:manage'],
    priority: 21,
    branchScope: 'topbar',
    accent: 'warning',
    icon: 'package',
    roleRelevance: ['SUPER_OWNER', 'OWNER'],
  },
  {
    href: '/workspace/vouchers',
    label: 'Voucher & promo',
    shortLabel: 'Voucher',
    description: 'Kelola kode voucher, periode aktif, cakupan paket, dan penggunaannya.',
    group: 'Penjualan & Keuangan',
    capabilities: ['voucher:read'],
    mutationCapabilities: ['voucher:manage'],
    priority: 22,
    branchScope: 'global',
    accent: 'warning',
    icon: 'ticket-percent',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'FINANCE'],
  },
  {
    href: '/finance',
    label: 'Keuangan & Tutup Buku',
    shortLabel: 'Keuangan',
    description: 'Rekonsiliasi transaksi, perbandingan cabang, anomali ledger, dan export.',
    group: 'Penjualan & Keuangan',
    capabilities: ['finance:reconcile'],
    mutationCapabilities: ['payment:decide', 'finance:export'],
    priority: 23,
    branchScope: 'topbar',
    accent: 'info',
    icon: 'landmark',
    roleRelevance: ['FINANCE', 'SUPER_OWNER'],
    dashboardDeepLink: '/finance',
  },
  {
    href: '/workspace/branch-performance',
    label: 'Performa Cabang',
    shortLabel: 'Performa Cabang',
    description: 'Omset cabang, estimasi profit, dan detail breakdown fee instruktur.',
    group: 'Penjualan & Keuangan',
    capabilities: ['finance:read'],
    priority: 24,
    branchScope: 'topbar',
    accent: 'brand',
    icon: 'circle-dollar-sign',
    roleRelevance: ['OWNER', 'SUPER_OWNER'],
  },

  // ==========================================
  // 4. PENGATURAN & SISTEM (Super Admin/Owner)
  // ==========================================
  {
    href: '/workspace/branches',
    label: 'Manajemen Cabang',
    shortLabel: 'Studio/Cabang',
    description: 'Kelola profil, rekening, jam buka, Area Studio, dan Ruangan.',
    group: 'Pengaturan & Sistem',
    capabilities: ['master:read'],
    mutationCapabilities: ['master:manage'],
    priority: 30,
    branchScope: 'global',
    accent: 'brand',
    icon: 'building',
  },
  {
    href: '/instructors',
    label: 'Manajemen Instruktur',
    shortLabel: 'Instruktur',
    description: 'Profil instruktur, penugasan, jadwal, check-in, fee, dan kompensasi.',
    group: 'Pengaturan & Sistem',
    capabilities: ['assignment:read'],
    mutationCapabilities: ['assignment:manage'],
    priority: 31,
    branchScope: 'topbar',
    accent: 'info',
    roleRelevance: ['SUPER_OWNER', 'ADMIN', 'MANAGER', 'FINANCE'],
  },
  {
    href: '/users',
    label: 'Pengguna internal',
    shortLabel: 'Staf',
    description: 'Buat, atur role, dan nonaktifkan staf sesuai cakupan cabang.',
    group: 'Pengaturan & Sistem',
    capabilities: ['user:read'],
    mutationCapabilities: ['user:admin'],
    priority: 32,
    branchScope: 'topbar',
    accent: 'neutral',
  },
  {
    href: '/users/roles-permissions',
    label: 'Peran & Hak Akses',
    shortLabel: 'Hak Akses',
    description: 'Matriks hak akses dan jalur pengelolaan peran staf.',
    group: 'Pengaturan & Sistem',
    capabilities: ['user:admin'],
    priority: 33,
    branchScope: 'global',
    accent: 'info',
    icon: 'shield-check',
    roleRelevance: ['SUPER_OWNER'],
    isAdvanced: true,
    maturity: 'preview',
    previewNote:
      'Peran dan izin ditetapkan oleh sistem (hanya baca). Membuat peran khusus dan pengecualian izin belum tersedia; yang dapat diubah di sini adalah peran langsung pengguna.',
  },
  {
    href: '/assignments',
    label: 'Penugasan',
    shortLabel: 'Penugasan',
    description: 'Periode penugasan Owner dan Instruktur per cabang.',
    group: 'Pengaturan & Sistem',
    capabilities: ['assignment:read'],
    mutationCapabilities: ['assignment:manage'],
    priority: 34,
    branchScope: 'topbar',
    accent: 'neutral',
    isAdvanced: true,
  },
  {
    href: '/master',
    label: 'Data Master',
    shortLabel: 'Data Master',
    description: 'Katalog tipe kelas global, cakupan, fee, projection rate, quota, dan capacity.',
    group: 'Pengaturan & Sistem',
    capabilities: ['master:read'],
    mutationCapabilities: ['master:manage'],
    priority: 35,
    branchScope: 'topbar',
    accent: 'neutral',
    isAdvanced: true,
  },
  {
    href: '/data-import',
    label: 'Import Data',
    shortLabel: 'Import Data',
    description: 'Import massal users, paket, kuota member, voucher, dan cabang via Excel atau CSV.',
    group: 'Pengaturan & Sistem',
    capabilities: ['migration:read', 'migration:resolve', 'user:admin', 'master:manage'],
    mutationCapabilities: ['migration:resolve', 'user:admin', 'master:manage'],
    priority: 36,
    branchScope: 'global',
    accent: 'info',
    icon: 'file-spreadsheet',
    roleRelevance: ['SUPER_OWNER'],
    isDormant: true,
  },
  {
    href: '/migrations',
    label: 'Migrasi v1 → v2',
    shortLabel: 'Migrasi',
    description: 'Batch, control total, reject, dan resolution migrasi data v1.',
    group: 'Pengaturan & Sistem',
    capabilities: ['migration:read'],
    mutationCapabilities: ['migration:resolve'],
    priority: 37,
    branchScope: 'global',
    accent: 'warning',
    icon: 'database',
    roleRelevance: ['SUPER_OWNER'],
    isDormant: true,
    maturity: 'preview',
    previewNote:
      'Data batch migrasi di halaman ini adalah contoh, dan keputusan resolusi belum dapat disimpan.',
  },
  {
    href: '/audit',
    label: 'Audit akses',
    shortLabel: 'Audit Akses',
    description: 'Riwayat perubahan pengguna, role, penugasan, dan sesi yang sudah dimasking.',
    group: 'Pengaturan & Sistem',
    capabilities: ['audit:read'],
    priority: 38,
    branchScope: 'topbar',
    accent: 'info',
    isAdvanced: true,
    maturity: 'preview',
    previewNote:
      'Riwayat audit belum disimpan di database, sehingga daftar ini selalu kosong. Aktivitas saat ini hanya tercatat di log server.',
  },
  {
    href: '/notification-management',
    label: 'Manajemen Notifikasi',
    shortLabel: 'Notifikasi',
    description: 'Template, event mapping, delivery, retry, dan antrean gagal.',
    group: 'Pengaturan & Sistem',
    capabilities: ['notification:manage'],
    priority: 39,
    branchScope: 'global',
    accent: 'info',
    roleRelevance: ['SUPER_OWNER'],
    isAdvanced: true,
  },
  {
    href: '/public-content-management',
    label: 'Manajemen Konten Publik',
    shortLabel: 'Konten',
    description: 'Draft, preview, publish, archive, dan versi konten situs.',
    group: 'Pengaturan & Sistem',
    capabilities: ['public-content:read'],
    mutationCapabilities: ['public-content:manage'],
    priority: 40,
    branchScope: 'global',
    accent: 'brand',
    roleRelevance: ['SUPER_OWNER'],
    isAdvanced: true,
  },
  {
    href: '/operations',
    label: 'Evaluasi kuota H-24',
    shortLabel: 'Kuota H-24',
    description: 'Monitor quota evaluation job dan lakukan pemulihan yang berizin.',
    group: 'Pengaturan & Sistem',
    capabilities: ['operations:read'],
    mutationCapabilities: ['operations:recover'],
    priority: 41,
    branchScope: 'global',
    accent: 'warning',
    queueBadgeSource: 'jobs',
    dashboardDeepLink: '/operations?status=FAILED',
    isAdvanced: true,
    maturity: 'preview',
    previewNote:
      'Sebagian data di halaman ini masih contoh dan belum terhubung ke job produksi; lihat keterangan pada tiap bagian.',
  },
  {
    href: '/health',
    label: 'Status sistem',
    shortLabel: 'Status sistem',
    description: 'Kesiapan API dan dependency tanpa mengekspos detail koneksi.',
    group: 'Pengaturan & Sistem',
    capabilities: ['operations:read'],
    priority: 42,
    branchScope: 'global',
    accent: 'info',
    isAdvanced: true,
  },

  // ==========================================
  // CUSTOMER SELF-SERVICE PAGES
  // ==========================================
  {
    href: '/account',
    label: 'Dashboard pelanggan',
    shortLabel: 'Dashboard Saya',
    description: 'Status verifikasi, jadwal, paket, dan booking pelanggan.',
    group: 'Operasional Studio',
    capabilities: ['customer:self'],
    priority: 0,
    branchScope: 'global',
    accent: 'brand',
  },
  {
    href: '/account/verification',
    label: 'Verifikasi identitas',
    shortLabel: 'Verifikasi Saya',
    description: 'Status selfie dan KTP serta unggah ulang bila diperlukan.',
    group: 'Operasional Studio',
    capabilities: ['customer:self'],
    priority: 0,
    branchScope: 'global',
    accent: 'warning',
  },
];

export const frontendPageGroups: FrontendPageGroup[] = [
  'Operasional Studio',
  'Member & Pelanggan',
  'Penjualan & Keuangan',
  'Pengaturan & Sistem',
];

/** Halaman registry yang paling spesifik untuk sebuah path (detail `/x/[id]` memakai halaman `/x`). */
export function pageForPath(pathname: string): FrontendPageDefinition | undefined {
  return [...frontendPages]
    .sort((left, right) => right.href.length - left.href.length)
    .find(
      (page) =>
        pathname === page.href ||
        (page.href !== '/workspace' && pathname.startsWith(`${page.href}/`)),
    );
}

export function canReadPage(capabilities: string[], page: FrontendPageDefinition) {
  return (
    page.capabilities.length === 0 ||
    page.capabilities.some((capability) => capabilities.includes(capability))
  );
}

/**
 * Pintasan Dashboard: halaman yang boleh dibaca akun, diprioritaskan lewat `roleRelevance`
 * (bila cukup relevan), urut menurut `priority`. Halaman dormant dan halaman customer dikecualikan.
 */
export function shortcutPagesFor(
  session: { roles: readonly string[]; capabilities: readonly string[] },
  limit = 6,
): FrontendPageDefinition[] {
  const readable = frontendPages.filter(
    (page) =>
      page.href !== '/workspace' &&
      !page.isDormant &&
      !page.capabilities.includes('customer:self') &&
      canReadPage([...session.capabilities], page),
  );
  const relevant = readable.filter((page) =>
    page.roleRelevance?.some((role) => session.roles.includes(role)),
  );
  const pool = relevant.length >= 3 ? relevant : readable;
  return [...pool].sort((left, right) => left.priority - right.priority).slice(0, limit);
}

export function canMutatePage(capabilities: string[], page: FrontendPageDefinition) {
  return Boolean(
    page.mutationCapabilities?.some((capability) => capabilities.includes(capability)),
  );
}

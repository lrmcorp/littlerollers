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
  accent: 'brand' | 'info' | 'warning' | 'neutral';
  icon?: string;
  roleRelevance?: string[];
  queueBadgeSource?: string;
  dashboardDeepLink?: string;
  isAdvanced?: boolean;
  isDormant?: boolean;
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
    accent: 'info',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER'],
  },
  {
    href: '/workspace/bookings',
    label: 'Jadwal & Presensi',
    shortLabel: 'Jadwal',
    description: 'Booking bantuan, antrean perubahan jadwal, QR, dan kehadiran pelanggan.',
    group: 'Operasional Studio',
    capabilities: ['booking:read', 'reschedule:read'],
    mutationCapabilities: ['booking:create:assisted', 'reschedule:decide'],
    priority: 3,
    accent: 'brand',
    icon: 'book-open-check',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER'],
    queueBadgeSource: 'reschedules',
    dashboardDeepLink: '/workspace/bookings?tab=reschedules&status=PENDING',
  },
  {
    href: '/check-in-scanner',
    label: 'Scan check-in',
    shortLabel: 'Scan QR',
    description: 'Scan QR pass customer dan catat attendance pada jadwal aktif.',
    group: 'Operasional Studio',
    capabilities: ['attendance:manage'],
    priority: 4,
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
    accent: 'warning',
    roleRelevance: ['SUPER_OWNER', 'ADMIN', 'MANAGER'],
  },

  // ==========================================
  // 2. MEMBER & PELANGGAN (Membership)
  // ==========================================
  {
    href: '/customers',
    label: 'Data Pelanggan',
    shortLabel: 'Pelanggan',
    description: 'Profil customer terpadu, keamanan akun, order, paket, booking, dan timeline.',
    group: 'Member & Pelanggan',
    capabilities: ['customer:read'],
    mutationCapabilities: [
      'customer:manage',
      'customer:credential:initialize',
      'customer:security:manage',
    ],
    priority: 10,
    accent: 'brand',
    icon: 'users',
    roleRelevance: ['SUPER_OWNER'],
  },
  {
    href: '/ledger',
    label: 'Sesi Customer',
    shortLabel: 'Sesi Customer',
    description: 'Saldo paket, sesi tertahan, tersedia, dan histori pemakaian customer.',
    group: 'Member & Pelanggan',
    capabilities: ['ledger:read'],
    priority: 11,
    accent: 'neutral',
  },
  {
    href: '/identity-verifications',
    label: 'Verifikasi customer',
    shortLabel: 'Verifikasi ID',
    description: 'Review selfie dan KTP customer berdasarkan permission reviewer.',
    group: 'Member & Pelanggan',
    capabilities: ['identity-verification:read'],
    mutationCapabilities: ['identity-verification:decide'],
    priority: 12,
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
    accent: 'warning',
    queueBadgeSource: 'adjustments',
    dashboardDeepLink: '/ledger/adjustments?status=PENDING',
    isAdvanced: true,
  },

  // ==========================================
  // 3. PENJUALAN & KEUANGAN (Billing & Kasir)
  // ==========================================
  {
    href: '/workspace/payments',
    label: 'Pembayaran',
    shortLabel: 'Pembayaran',
    description: 'Antrean pemeriksaan bukti transfer dan keputusan pembayaran.',
    group: 'Penjualan & Keuangan',
    capabilities: ['payment:review', 'purchase:review'],
    mutationCapabilities: ['payment:decide', 'purchase:decide'],
    priority: 20,
    accent: 'warning',
    icon: 'credit-card',
    roleRelevance: ['ADMIN', 'FINANCE', 'SUPER_OWNER'],
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
    accent: 'warning',
    icon: 'package',
    roleRelevance: ['SUPER_OWNER', 'OWNER'],
  },
  {
    href: '/workspace/vouchers',
    label: 'Voucher',
    shortLabel: 'Voucher',
    description: 'Kelola kode voucher, periode aktif, cakupan paket, dan penggunaannya.',
    group: 'Penjualan & Keuangan',
    capabilities: ['voucher:read'],
    mutationCapabilities: ['voucher:manage'],
    priority: 22,
    accent: 'warning',
    icon: 'ticket-percent',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'FINANCE'],
  },
  {
    href: '/finance',
    label: 'Keuangan & Rekonsiliasi',
    shortLabel: 'Keuangan',
    description: 'Rekonsiliasi transaksi, perbandingan cabang, anomali ledger, dan export.',
    group: 'Penjualan & Keuangan',
    capabilities: ['finance:reconcile'],
    mutationCapabilities: ['payment:decide', 'finance:export'],
    priority: 23,
    accent: 'info',
    icon: 'landmark',
    roleRelevance: ['FINANCE', 'SUPER_OWNER'],
    queueBadgeSource: 'payments',
    dashboardDeepLink: '/finance',
    isAdvanced: true,
  },

  // ==========================================
  // 4. PENGATURAN & SISTEM (Super Admin/Owner)
  // ==========================================
  {
    href: '/workspace/branches',
    label: 'Studio/Cabang',
    shortLabel: 'Studio/Cabang',
    description: 'Kelola profil, rekening, jam buka, Area Studio, dan Ruangan.',
    group: 'Pengaturan & Sistem',
    capabilities: ['master:read'],
    mutationCapabilities: ['master:manage'],
    priority: 30,
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
    accent: 'info',
    roleRelevance: ['SUPER_OWNER', 'ADMIN', 'MANAGER', 'FINANCE'],
  },
  {
    href: '/users',
    label: 'Pengguna internal',
    shortLabel: 'Staf',
    description: 'Buat, atur role, dan nonaktifkan staf sesuai scope cabang.',
    group: 'Pengaturan & Sistem',
    capabilities: ['user:read'],
    mutationCapabilities: ['user:admin'],
    priority: 32,
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
    accent: 'info',
    icon: 'shield-check',
    roleRelevance: ['SUPER_OWNER'],
    isAdvanced: true,
  },
  {
    href: '/assignments',
    label: 'Assignment',
    shortLabel: 'Assignment',
    description: 'Periode penugasan Owner dan Instructor per cabang.',
    group: 'Pengaturan & Sistem',
    capabilities: ['assignment:read'],
    mutationCapabilities: ['assignment:manage'],
    priority: 34,
    accent: 'neutral',
    isAdvanced: true,
  },
  {
    href: '/master',
    label: 'Master data',
    shortLabel: 'Master',
    description: 'Katalog tipe kelas global, scope, fee, projection rate, quota, dan capacity.',
    group: 'Pengaturan & Sistem',
    capabilities: ['master:read'],
    mutationCapabilities: ['master:manage'],
    priority: 35,
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
    accent: 'warning',
    icon: 'database',
    roleRelevance: ['SUPER_OWNER'],
    isDormant: true,
  },
  {
    href: '/audit',
    label: 'Audit akses',
    shortLabel: 'Audit Akses',
    description: 'Riwayat perubahan pengguna, role, assignment, dan sesi yang sudah dimasking.',
    group: 'Pengaturan & Sistem',
    capabilities: ['audit:read'],
    priority: 38,
    accent: 'info',
    isAdvanced: true,
  },
  {
    href: '/notification-management',
    label: 'Manajemen Notifikasi',
    shortLabel: 'Notifikasi',
    description: 'Template, event mapping, delivery, retry, dan dead-letter.',
    group: 'Pengaturan & Sistem',
    capabilities: ['notification:manage'],
    priority: 39,
    accent: 'info',
    roleRelevance: ['SUPER_OWNER'],
    isAdvanced: true,
  },
  {
    href: '/public-content-management',
    label: 'Konten Publik',
    shortLabel: 'Konten',
    description: 'Draft, preview, publish, archive, dan versi konten situs.',
    group: 'Pengaturan & Sistem',
    capabilities: ['public-content:read'],
    mutationCapabilities: ['public-content:manage'],
    priority: 40,
    accent: 'brand',
    roleRelevance: ['SUPER_OWNER'],
    isAdvanced: true,
  },
  {
    href: '/operations',
    label: 'Operations H-24',
    shortLabel: 'Operations',
    description: 'Monitor quota evaluation job dan lakukan recovery yang berizin.',
    group: 'Pengaturan & Sistem',
    capabilities: ['operations:read'],
    mutationCapabilities: ['operations:recover'],
    priority: 41,
    accent: 'warning',
    queueBadgeSource: 'jobs',
    dashboardDeepLink: '/operations?status=FAILED',
    isAdvanced: true,
  },
  {
    href: '/health',
    label: 'Status sistem',
    shortLabel: 'Health',
    description: 'Kesiapan API dan dependency tanpa mengekspos detail koneksi.',
    group: 'Pengaturan & Sistem',
    capabilities: ['operations:read'],
    priority: 42,
    accent: 'info',
    isAdvanced: true,
  },

  // ==========================================
  // CUSTOMER SELF-SERVICE PAGES
  // ==========================================
  {
    href: '/account',
    label: 'Dashboard customer',
    shortLabel: 'Dashboard Saya',
    description: 'Status verifikasi, jadwal, paket, dan booking customer.',
    group: 'Operasional Studio',
    capabilities: ['customer:self'],
    priority: 0,
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
    accent: 'warning',
  },
];

export const frontendPageGroups: FrontendPageGroup[] = [
  'Operasional Studio',
  'Member & Pelanggan',
  'Penjualan & Keuangan',
  'Pengaturan & Sistem',
];

export function canReadPage(capabilities: string[], page: FrontendPageDefinition) {
  return (
    page.capabilities.length === 0 ||
    page.capabilities.some((capability) => capabilities.includes(capability))
  );
}

export function canMutatePage(capabilities: string[], page: FrontendPageDefinition) {
  return Boolean(
    page.mutationCapabilities?.some((capability) => capabilities.includes(capability)),
  );
}

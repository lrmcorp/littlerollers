export type FrontendPageGroup = 'Workspace' | 'Administrasi' | 'Operasional';

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
}

export const frontendPages: FrontendPageDefinition[] = [
  {
    href: '/workspace',
    label: 'Ringkasan',
    shortLabel: 'Dashboard',
    description: 'Konteks sesi, cabang aktif, dan pintasan pekerjaan sesuai hak akses.',
    group: 'Workspace',
    capabilities: [],
    priority: 0,
    accent: 'brand',
    icon: 'layout-dashboard',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER', 'FINANCE', 'OPS'],
  },
  {
    href: '/account',
    label: 'Dashboard customer',
    shortLabel: 'Dashboard Saya',
    description: 'Status verifikasi, jadwal, paket, dan booking customer.',
    group: 'Workspace',
    capabilities: ['customer:self'],
    priority: 0,
    accent: 'brand',
  },
  {
    href: '/account/verification',
    label: 'Verifikasi identitas',
    shortLabel: 'Verifikasi Saya',
    description: 'Status selfie dan KTP serta unggah ulang bila diperlukan.',
    group: 'Workspace',
    capabilities: ['customer:self'],
    priority: 1,
    accent: 'warning',
  },
  {
    href: '/workspace/bookings',
    label: 'Booking & reschedule',
    shortLabel: 'Booking',
    description: 'Booking bantuan, antrean reschedule, QR, dan kehadiran customer.',
    group: 'Workspace',
    capabilities: ['booking:read', 'reschedule:read'],
    mutationCapabilities: ['booking:create:assisted', 'reschedule:decide'],
    priority: 1,
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
    group: 'Workspace',
    capabilities: ['attendance:manage'],
    priority: 2,
    accent: 'info',
    roleRelevance: ['ADMIN', 'MANAGER', 'SUPER_OWNER'],
  },
  {
    href: '/workspace/classes',
    label: 'Timetable kelas',
    shortLabel: 'Kelas',
    description: 'Susun jadwal, tugaskan instructor, lalu publish atau batalkan kelas.',
    group: 'Workspace',
    capabilities: ['class-slot:read'],
    mutationCapabilities: ['class-slot:manage'],
    priority: 2,
    accent: 'info',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'ADMIN', 'MANAGER'],
  },
  {
    href: '/workspace/payments',
    label: 'Pembayaran',
    shortLabel: 'Pembayaran',
    description: 'Antrean pemeriksaan bukti transfer dan keputusan pembayaran.',
    group: 'Workspace',
    capabilities: ['payment:review', 'purchase:review'],
    mutationCapabilities: ['payment:decide', 'purchase:decide'],
    priority: 3,
    accent: 'warning',
    icon: 'credit-card',
    roleRelevance: ['ADMIN', 'FINANCE', 'SUPER_OWNER'],
    queueBadgeSource: 'payments',
    dashboardDeepLink: '/workspace/payments?status=PENDING',
  },
  {
    href: '/finance',
    label: 'Finance & reconciliation',
    shortLabel: 'Finance',
    description: 'Rekonsiliasi transaksi, perbandingan cabang, anomali ledger, dan export.',
    group: 'Workspace',
    capabilities: ['finance:reconcile'],
    mutationCapabilities: ['payment:decide', 'finance:export'],
    priority: 4,
    accent: 'info',
    icon: 'landmark',
    roleRelevance: ['FINANCE', 'SUPER_OWNER'],
    queueBadgeSource: 'payments',
    dashboardDeepLink: '/finance',
  },
  {
    href: '/ledger',
    label: 'Ledger & adjustment',
    shortLabel: 'Ledger',
    description: 'Saldo paket, sesi tertahan, histori, dan penyesuaian sesi customer.',
    group: 'Workspace',
    capabilities: ['ledger:read'],
    mutationCapabilities: ['ledger:adjust:request', 'ledger:adjust:decide'],
    priority: 4,
    accent: 'neutral',
    queueBadgeSource: 'adjustments',
    dashboardDeepLink: '/ledger?tab=adjustments&status=PENDING',
  },
  {
    href: '/users',
    label: 'Pengguna',
    shortLabel: 'Pengguna',
    description: 'Buat, atur role, dan nonaktifkan pengguna sesuai scope cabang.',
    group: 'Administrasi',
    capabilities: ['user:read'],
    mutationCapabilities: ['user:admin'],
    priority: 5,
    accent: 'neutral',
  },
  {
    href: '/users/roles-permissions',
    label: 'Roles & Permissions',
    shortLabel: 'Roles & Permissions',
    description: 'Matrix capability tetap dan jalur pengelolaan role staf.',
    group: 'Administrasi',
    capabilities: ['user:admin'],
    priority: 5,
    accent: 'info',
    icon: 'shield-check',
    roleRelevance: ['SUPER_OWNER'],
  },
  {
    href: '/identity-verifications',
    label: 'Verifikasi customer',
    shortLabel: 'Verifikasi ID',
    description: 'Review selfie dan KTP customer berdasarkan permission reviewer.',
    group: 'Administrasi',
    capabilities: ['identity-verification:read'],
    mutationCapabilities: ['identity-verification:decide'],
    priority: 6,
    accent: 'warning',
  },
  {
    href: '/audit',
    label: 'Audit akses',
    shortLabel: 'Audit Akses',
    description: 'Riwayat perubahan pengguna, role, assignment, dan sesi yang sudah dimasking.',
    group: 'Administrasi',
    capabilities: ['audit:read'],
    priority: 6,
    accent: 'info',
  },
  {
    href: '/assignments',
    label: 'Assignment',
    shortLabel: 'Assignment',
    description: 'Periode penugasan Owner dan Instructor per cabang.',
    group: 'Administrasi',
    capabilities: ['assignment:read'],
    mutationCapabilities: ['assignment:manage'],
    priority: 6,
    accent: 'neutral',
  },
  {
    href: '/master',
    label: 'Master data',
    shortLabel: 'Master',
    description: 'Cabang, class type, fee, projection rate, quota, dan capacity.',
    group: 'Administrasi',
    capabilities: ['master:read'],
    mutationCapabilities: ['master:manage'],
    priority: 7,
    accent: 'neutral',
  },
  {
    href: '/workspace/packages',
    label: 'Paket & promo harga',
    shortLabel: 'Paket',
    description: 'Kelola harga normal, promo aktif, dan histori harga paket.',
    group: 'Administrasi',
    capabilities: ['package-promotion:read'],
    mutationCapabilities: ['package-promotion:manage'],
    priority: 7,
    accent: 'warning',
    icon: 'package',
    roleRelevance: ['SUPER_OWNER', 'OWNER'],
  },
  {
    href: '/workspace/vouchers',
    label: 'Voucher',
    shortLabel: 'Voucher',
    description: 'Kelola kode voucher, periode aktif, scope paket, dan penggunaannya.',
    group: 'Administrasi',
    capabilities: ['voucher:read'],
    mutationCapabilities: ['voucher:manage'],
    priority: 7,
    accent: 'warning',
    icon: 'ticket-percent',
    roleRelevance: ['SUPER_OWNER', 'OWNER', 'FINANCE'],
  },
  {
    href: '/operations',
    label: 'Operations H-24',
    shortLabel: 'Operations',
    description: 'Monitor quota evaluation job dan lakukan recovery yang berizin.',
    group: 'Operasional',
    capabilities: ['operations:read'],
    mutationCapabilities: ['operations:recover'],
    priority: 8,
    accent: 'warning',
  },
  {
    href: '/health',
    label: 'Status sistem',
    shortLabel: 'Health',
    description: 'Kesiapan API dan dependency tanpa mengekspos detail koneksi.',
    group: 'Operasional',
    capabilities: ['operations:read'],
    priority: 9,
    accent: 'info',
  },
];

export const frontendPageGroups: FrontendPageGroup[] = ['Workspace', 'Administrasi', 'Operasional'];

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

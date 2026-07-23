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
  },
  {
    href: '/bookings',
    label: 'Booking & reschedule',
    shortLabel: 'Booking',
    description: 'Booking bantuan, histori, dan antrean keputusan reschedule.',
    group: 'Workspace',
    capabilities: ['booking:read', 'reschedule:read'],
    mutationCapabilities: ['booking:create:assisted', 'reschedule:decide'],
    priority: 1,
    accent: 'brand',
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
  },
  {
    href: '/purchases',
    label: 'Purchase',
    shortLabel: 'Purchase',
    description: 'Bukti pembayaran, status scan, dan antrean keputusan purchase.',
    group: 'Workspace',
    capabilities: ['package:read', 'purchase:review'],
    mutationCapabilities: ['purchase:decide'],
    priority: 3,
    accent: 'warning',
  },
  {
    href: '/ledger',
    label: 'Ledger & adjustment',
    shortLabel: 'Ledger',
    description: 'Saldo paket, reservation, histori ledger, dan session adjustment.',
    group: 'Workspace',
    capabilities: ['ledger:read'],
    mutationCapabilities: ['ledger:adjust:request', 'ledger:adjust:decide'],
    priority: 4,
    accent: 'neutral',
  },
  {
    href: '/users',
    label: 'Pengguna',
    shortLabel: 'Pengguna',
    description: 'Daftar, undang, dan nonaktifkan pengguna sesuai scope cabang.',
    group: 'Administrasi',
    capabilities: ['user:read'],
    mutationCapabilities: ['user:admin'],
    priority: 5,
    accent: 'neutral',
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
    href: '/operations',
    label: 'Operations H-24',
    shortLabel: 'Operations',
    description: 'Monitor quota evaluation job dan lakukan recovery ber-MFA.',
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
    capabilities: [],
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

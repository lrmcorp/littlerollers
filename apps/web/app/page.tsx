import { PageHeader, StatusBadge } from './ui';

const workspaces = [
  ['/users', 'Pengguna', 'Kelola akses, cabang, dan assurance.'],
  ['/master', 'Master data', 'Branch, class type, fee, rate, dan kuota.'],
  ['/purchases', 'Purchase', 'Bukti pembayaran dan antrean keputusan.'],
  ['/ledger', 'Ledger', 'Saldo paket, reservasi, dan adjustment.'],
  ['/classes', 'Kelas', 'Timetable, publish, dan pembatalan.'],
  ['/bookings', 'Booking', 'Booking bantuan dan konsekuensi sesi.'],
];

export default function Home() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace operasional"
        title="Daily Dose Pilates"
        description="Pilih area kerja. Hak akses dan cakupan cabang tetap diverifikasi oleh backend pada setiap permintaan."
        context={
          <>
            <StatusBadge tone="warning">Synthetic non-production</StatusBadge>
            <span>Asia/Jakarta</span>
          </>
        }
      />
      <section className="workspace-grid" aria-label="Area kerja utama">
        {workspaces.map(([href, title, description]) => (
          <a className="workspace-card" href={href} key={href}>
            <strong>{title}</strong>
            <span>{description}</span>
          </a>
        ))}
      </section>
    </>
  );
}

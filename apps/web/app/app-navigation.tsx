'use client';

import { usePathname } from 'next/navigation';
import { useSessionContext } from './session-context';

const groups = [
  {
    label: 'Workspace',
    items: [
      { href: '/', label: 'Ringkasan', capabilities: [] },
      { href: '/bookings', label: 'Booking bantuan', capabilities: ['booking:read'] },
      { href: '/classes', label: 'Timetable kelas', capabilities: ['class-slot:read'] },
      { href: '/purchases', label: 'Purchase', capabilities: ['package:read', 'purchase:review'] },
      { href: '/ledger', label: 'Ledger', capabilities: ['ledger:read'] },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { href: '/users', label: 'Pengguna', capabilities: ['user:read'] },
      { href: '/assignments', label: 'Assignment', capabilities: ['assignment:read'] },
      { href: '/master', label: 'Master data', capabilities: ['master:read'] },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { href: '/operations', label: 'Operations H-24', capabilities: ['operations:read'] },
      { href: '/health', label: 'Status sistem', capabilities: [] },
    ],
  },
];

export function AppNavigation() {
  const pathname = usePathname();
  const context = useSessionContext();
  return (
    <nav className="nav" aria-label="Navigasi utama">
      <a href="/" className="brand" aria-label="Daily Dose Pilates — Beranda">
        <img
          className="brand-logo"
          src="https://dailydosepilates.com/assets/images/logo.png"
          width="500"
          height="138"
          alt="Daily Dose Pilates"
        />
        <span className="brand-caption">Studio operations</span>
      </a>
      <div className="nav-scroll">
        {groups.map((group) => (
          <section className="nav-group" aria-labelledby={`nav-${group.label}`} key={group.label}>
            <h2 id={`nav-${group.label}`}>{group.label}</h2>
            {group.items
              .filter(
                (item) =>
                  item.capabilities.length === 0 || context?.hasCapability(...item.capabilities),
              )
              .map((item) => {
                const active =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <a href={item.href} aria-current={active ? 'page' : undefined} key={item.href}>
                    <span aria-hidden="true" className="nav-dot" />
                    {item.label}
                  </a>
                );
              })}
          </section>
        ))}
      </div>
      <div className="nav-footer">
        <span className="environment-dot" aria-hidden="true" />
        {context?.session ? `${context.session.assurance} · synthetic` : 'Synthetic non-production'}
      </div>
    </nav>
  );
}

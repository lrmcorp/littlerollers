'use client';

import { usePathname } from 'next/navigation';
import { frontendPageGroups, frontendPages } from './frontend-pages';
import { useSessionContext } from './session-context';

export function AppNavigation() {
  const pathname = usePathname();
  const context = useSessionContext();
  return (
    <nav className="nav" aria-label="Navigasi utama">
      <a href="/workspace" className="brand" aria-label="Daily Dose Pilates — Dashboard">
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
        {frontendPageGroups.map((group) => (
          <section className="nav-group" aria-labelledby={`nav-${group}`} key={group}>
            <h2 id={`nav-${group}`}>{group}</h2>
            {frontendPages
              .filter((item) => item.group === group)
              .filter(
                (item) =>
                  item.capabilities.length === 0 || context?.hasCapability(...item.capabilities),
              )
              .map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <a href={item.href} aria-current={active ? 'page' : undefined} key={item.href}>
                    <span aria-hidden="true" className="nav-dot" />
                    <span className="nav-label">{item.shortLabel}</span>
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

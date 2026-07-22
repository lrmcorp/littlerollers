'use client';

import { AppNavigation } from './app-navigation';
import { useSessionContext } from './session-context';
import { StatusBadge } from './ui';

export function ApplicationShell({ children }: { children: React.ReactNode }) {
  const context = useSessionContext();
  const session = context?.session;
  return (
    <div className="shell">
      <AppNavigation />
      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="topbar-label">Daily Dose Pilates</span>
            <strong>{session?.displayName ?? 'Internal workspace'}</strong>
          </div>
          <div className="topbar-context" aria-label="Konteks akses">
            {session ? (
              <>
                <StatusBadge tone={session.assurance === 'MFA' ? 'success' : 'warning'}>
                  {session.assurance}
                </StatusBadge>
                <span>{session.roles.join(' · ')}</span>
                <label className="branch-context-field">
                  <span>Cabang aktif</span>
                  <select
                    aria-label="Cabang aktif"
                    value={context?.activeBranchId ?? ''}
                    onChange={(event) => context?.setActiveBranchId(event.target.value)}
                  >
                    <option value="">Pilih cabang</option>
                    {session.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.code} · {branch.name} · {branch.timezone}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button-quiet" onClick={() => void context?.logout()}>
                  Keluar
                </button>
              </>
            ) : (
              <a href="/sign-in">Masuk / MFA</a>
            )}
          </div>
        </header>
        <main className="content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

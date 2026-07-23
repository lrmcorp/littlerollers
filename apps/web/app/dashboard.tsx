'use client';

import { canMutatePage, canReadPage, frontendPages } from './frontend-pages';
import { useSessionContext } from './session-context';
import { Feedback, PageHeader, StatusBadge } from './ui';

function sessionTime(value: Date) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(value);
}

export function Dashboard() {
  const context = useSessionContext();
  const session = context?.session;
  if (!session) return null;

  const pages = frontendPages
    .filter((page) => page.href !== '/workspace' && canReadPage(session.capabilities, page))
    .sort((left, right) => left.priority - right.priority);
  const activeBranch = context.activeBranch;

  return (
    <div className="dashboard">
      <PageHeader
        eyebrow="Workspace operasional"
        title={`Selamat datang, ${session.displayName}`}
        description="Pilih pekerjaan yang tersedia untuk peran dan capability sesi Anda. Setiap permintaan tetap diverifikasi oleh backend."
        context={
          <>
            <StatusBadge tone={session.assurance === 'MFA' ? 'success' : 'warning'}>
              Assurance {session.assurance}
            </StatusBadge>
            <span>Sesi sampai {sessionTime(session.sessionExpiresAt)}</span>
          </>
        }
      />

      {!activeBranch && session.branches.length > 0 ? (
        <Feedback kind="warning">
          Pilih cabang aktif di bagian atas sebelum membuka atau menjalankan pekerjaan yang memiliki
          scope cabang.
        </Feedback>
      ) : activeBranch ? (
        <section className="dashboard-branch" aria-label="Konteks cabang aktif">
          <div>
            <span className="eyebrow">Cabang aktif</span>
            <strong>{activeBranch.name}</strong>
          </div>
          <span>{activeBranch.code}</span>
          <span>{activeBranch.timezone}</span>
        </section>
      ) : null}

      <section aria-labelledby="dashboard-work-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Akses efektif</p>
            <h2 id="dashboard-work-title">Area kerja Anda</h2>
          </div>
          <span>{pages.length} halaman tersedia</span>
        </div>
        <div className="workspace-grid">
          {pages.map((page) => {
            const mutationAvailable = canMutatePage(session.capabilities, page);
            return (
              <a
                className={`workspace-card workspace-card-${page.accent}`}
                href={page.href}
                key={page.href}
              >
                <span className="workspace-card-kicker">{page.group}</span>
                <strong>{page.label}</strong>
                <span>{page.description}</span>
                <span className="workspace-card-footer">
                  {mutationAvailable ? 'Baca & tindakan' : 'Akses baca'}
                  <span aria-hidden="true">→</span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="dashboard-session" aria-labelledby="session-summary-title">
        <div>
          <p className="eyebrow">Konteks otorisasi</p>
          <h2 id="session-summary-title">Sesi dan peran efektif</h2>
        </div>
        <dl>
          <div>
            <dt>Peran</dt>
            <dd>{session.roles.join(', ')}</dd>
          </div>
          <div>
            <dt>Assurance</dt>
            <dd>{session.assurance}</dd>
          </div>
          <div>
            <dt>Cabang tersedia</dt>
            <dd>{session.branches.length}</dd>
          </div>
          <div>
            <dt>Capability</dt>
            <dd>{session.capabilities.length}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

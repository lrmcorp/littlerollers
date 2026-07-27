'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import {
  browserIdentityClient,
  failureCode,
  type IdentityClient,
  type RoleCatalogItem,
} from '../../identity-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';

const roleLabels: Record<string, string> = {
  SUPER_OWNER: 'Super Owner',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  OPS: 'Operations',
  INSTRUCTOR: 'Instructor',
  CUSTOMER: 'Customer',
};

const roleDescriptions: Record<string, string> = {
  SUPER_OWNER: 'Kendali global, konfigurasi, dan pengawasan seluruh cabang.',
  OWNER: 'Pengawasan read-only terhadap performa dan operasi cabang assignment.',
  ADMIN: 'Operasi harian customer, booking, kelas, dan attendance pada cabang.',
  MANAGER: 'Keputusan operasional sensitif dan pengelolaan kelas pada cabang.',
  FINANCE: 'Keputusan pembayaran dan rekonsiliasi finansial secara global.',
  OPS: 'Monitoring, retry, recovery, dan kesehatan job operasional.',
  INSTRUCTOR: 'Jadwal yang ditugaskan, availability, dan attendance terkait.',
  CUSTOMER: 'Akses mandiri untuk paket, booking, dan akun customer.',
};

function capabilityLabel(value: string) {
  return value
    .split(':')
    .map((part) => part.replaceAll('-', ' '))
    .join(' · ');
}

export function RolePermissionsView({
  client = browserIdentityClient,
}: {
  client?: IdentityClient;
}) {
  const [catalog, setCatalog] = useState<RoleCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    try {
      setCatalog(await client.roleCatalog());
    } catch (error) {
      failureCode(error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const capabilities = [...new Set(catalog.flatMap((item) => item.capabilities))].sort();

  return (
    <section className="space-y-6" aria-labelledby="roles-permissions-title">
      <div className="rounded-dd-xl border border-dd-line bg-dd-surface p-6 shadow-dd-card sm:p-8">
        <PageHeader
          eyebrow="Administrasi akses"
          title="Roles & Permissions"
          titleId="roles-permissions-title"
          description="Super Owner mengelola siapa memperoleh role dan scope. Isi capability setiap role tetap dikunci dan diverifikasi backend."
          context={
            <>
              <StatusBadge tone="success">Fixed permission matrix</StatusBadge>
              <StatusBadge tone="info">Super Owner only</StatusBadge>
            </>
          }
        />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4">
            <ShieldCheck className="size-5 text-dd-forest" aria-hidden="true" />
            <strong className="mt-3 block text-sm">Capability tetap</strong>
            <p className="mt-1 text-sm leading-6 text-dd-muted">
              Tidak ada permission editor dinamis yang dapat melemahkan separation of duties.
            </p>
          </article>
          <article className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4">
            <UsersRound className="size-5 text-dd-forest" aria-hidden="true" />
            <strong className="mt-3 block text-sm">Assignment terkontrol</strong>
            <p className="mt-1 text-sm leading-6 text-dd-muted">
              Role staf langsung dikelola di Pengguna; Owner dan Instructor melalui periode
              Assignment.
            </p>
          </article>
          <article className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4">
            <LockKeyhole className="size-5 text-dd-forest" aria-hidden="true" />
            <strong className="mt-3 block text-sm">Role tertinggi dilindungi</strong>
            <p className="mt-1 text-sm leading-6 text-dd-muted">
              SUPER_OWNER tidak dapat dipromosikan dari panel dan seluruh perubahan menghasilkan
              audit trail.
            </p>
          </article>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="button-primary" href="/users">
            Kelola pengguna <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link className="button-quiet" href="/assignments">
            Kelola Owner & Instructor
          </Link>
        </div>
      </div>

      {loading ? (
        <Skeleton label="Memuat matrix permission" />
      ) : failed ? (
        <Feedback kind="error">
          Matrix permission tidak dapat dimuat.{' '}
          <button onClick={() => void load()}>Coba lagi</button>
        </Feedback>
      ) : catalog.length === 0 ? (
        <EmptyState
          title="Katalog role belum tersedia"
          description="Periksa koneksi API dan konfigurasi identity service."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan role">
            {catalog.map((item) => (
              <article
                key={item.role}
                className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <strong>{roleLabels[item.role] ?? item.role}</strong>
                  <StatusBadge tone={item.scope === 'GLOBAL' ? 'info' : 'neutral'}>
                    {item.scope === 'GLOBAL' ? 'Global' : 'Per cabang'}
                  </StatusBadge>
                </div>
                <p className="mt-3 min-h-16 text-sm leading-6 text-dd-muted">
                  {roleDescriptions[item.role] ?? 'Role aplikasi Daily Dose.'}
                </p>
                <p className="mt-4 border-t border-dd-line pt-3 text-xs font-bold uppercase tracking-wider text-dd-muted">
                  {item.capabilities.length} capability
                </p>
              </article>
            ))}
          </div>

          <section
            className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card"
            aria-labelledby="permission-matrix-title"
          >
            <div className="mb-4">
              <h2 id="permission-matrix-title" className="text-xl">
                Matrix capability read-only
              </h2>
              <p className="mt-1 text-sm text-dd-muted">
                Centang menunjukkan capability efektif yang diberikan backend kepada role.
              </p>
            </div>
            <div
              className="overflow-x-auto rounded-dd-lg border border-dd-line"
              role="region"
              aria-label="Matrix capability role"
              tabIndex={0}
            >
              <table className="min-w-[980px]">
                <thead>
                  <tr>
                    <th>Capability</th>
                    {catalog.map((item) => (
                      <th key={item.role}>{roleLabels[item.role] ?? item.role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {capabilities.map((capability) => (
                    <tr key={capability}>
                      <th className="font-mono text-xs font-semibold capitalize">
                        {capabilityLabel(capability)}
                      </th>
                      {catalog.map((item) => (
                        <td
                          className="text-center"
                          key={item.role}
                          aria-label={`${roleLabels[item.role] ?? item.role}: ${capability}`}
                        >
                          {item.capabilities.includes(capability) ? (
                            <span className="font-bold text-dd-success">Ya</span>
                          ) : (
                            <span className="text-dd-muted">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { canReadPage, frontendPages } from './frontend-pages';
import { useSessionContext } from './session-context';
import { Feedback } from './ui';
import { Button } from './components/actions';
import { Badge, Panel, StatCard } from './components/admin/admin-ui';
import { DateInput, SearchSelect } from './components/forms';
import {
  browserDashboardClient,
  type DashboardClient,
  type DashboardOverview,
} from './dashboard-client';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat('id-ID');
const dateInput = (date: Date) => date.toISOString().slice(0, 10);
const financialMetricKeys = new Set([
  'gross-sales',
  'revenue',
  'projection',
  'instructor-realtime',
  'other-cost',
  'profit',
  'correction',
  'finance-anomalies',
]);

const jobStatusLabel: Record<string, string> = {
  QUEUED: 'Menunggu',
  RUNNING: 'Berjalan',
  RETRYING: 'Mencoba kembali',
  SUCCEEDED: 'Berhasil',
  FAILED: 'Gagal',
};

const jobTypeLabel: Record<string, string> = {
  H24_QUOTA_EVALUATION: 'Evaluasi kuota H-24',
};

const roleCopy = {
  EXECUTIVE: {
    eyebrow: 'Executive overview',
    title: 'Kinerja lintas cabang dalam satu pandangan',
    description:
      'Pantau pertumbuhan, ranking cabang, risiko, anomali, dan keputusan penting tingkat perusahaan.',
  },
  OWNER: {
    eyebrow: 'Owner oversight',
    title: 'Kinerja cabang dalam satu pandangan',
    description:
      'Pantau performa cabang, pendapatan, okupansi, dan pekerjaan yang membutuhkan keputusan Anda.',
  },
  BRANCH_OPERATIONS: {
    eyebrow: 'Branch command center',
    title: 'Operasional cabang hari ini',
    description: 'Prioritaskan kelas, booking, customer, dan antrean keputusan untuk cabang aktif.',
  },
  FINANCE: {
    eyebrow: 'Finance overview',
    title: 'Arus transaksi dan pekerjaan keuangan',
    description: 'Pantau pembayaran, ledger, dan antrean finansial dari satu ruang kerja.',
  },
  OPERATIONS: {
    eyebrow: 'Operations control',
    title: 'Kesehatan operasional dan recovery',
    description:
      'Identifikasi job bermasalah, retry, dan kondisi sistem yang membutuhkan perhatian.',
  },
} as const;

function TrendChart({ points, finance }: { points: DashboardOverview['trend']; finance: boolean }) {
  if (points.length < 2)
    return <p className="py-12 text-center text-sm text-dd-muted">Belum cukup data untuk tren.</p>;
  const values = points.map((point) => (finance ? point.revenue : point.bookings));
  const profitValues = finance ? points.map((point) => point.profit) : [];
  const minimum = Math.min(...values, ...profitValues, 0);
  const maximum = Math.max(...values, ...profitValues, 1);
  const span = Math.max(1, maximum - minimum);
  const y = (value: number) => 92 - ((value - minimum) / span) * 76;
  const polyline = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${y(value)}`)
    .join(' ');
  const profitPolyline = profitValues
    .map((value, index) => `${(index / (profitValues.length - 1)) * 100},${y(value)}`)
    .join(' ');
  return (
    <figure className="mt-5">
      <svg
        role="img"
        aria-labelledby="dashboard-trend-title dashboard-trend-description"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-52 w-full overflow-visible"
      >
        <title id="dashboard-trend-title">Tren {finance ? 'pendapatan' : 'booking'}</title>
        <desc id="dashboard-trend-description">
          {values.map((value, index) => `${points[index]!.date}: ${value}`).join(', ')}
        </desc>
        {[16, 41, 66, 91].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            className="text-dd-line"
            strokeWidth="0.4"
          />
        ))}
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          className="text-dd-forest"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {finance && (
          <polyline
            points={profitPolyline}
            fill="none"
            stroke="currentColor"
            className="text-dd-brass"
            strokeWidth="2"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {finance && (
        <div className="mt-2 flex gap-4 text-xs text-dd-muted">
          <span>— Omzet</span>
          <span className="text-dd-brass">-- Profit</span>
        </div>
      )}
      <figcaption className="mt-2 flex justify-between text-xs text-dd-muted">
        <span>{String(points[0]!.date).slice(0, 10)}</span>
        <span>{String(points.at(-1)!.date).slice(0, 10)}</span>
      </figcaption>
    </figure>
  );
}

export function Dashboard({ client = browserDashboardClient }: { client?: DashboardClient }) {
  const context = useSessionContext();
  const session = context?.session;
  const [overview, setOverview] = useState<DashboardOverview>();
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(false);
  const [until, setUntil] = useState(() => dateInput(new Date()));
  const [from, setFrom] = useState(() => dateInput(new Date(Date.now() - 29 * 86_400_000)));
  const [dashboardBranchId, setDashboardBranchId] = useState('');
  const pages = useMemo(
    () =>
      session
        ? frontendPages
            .filter((page) => page.href !== '/workspace' && canReadPage(session.capabilities, page))
            .sort((left, right) => left.priority - right.priority)
        : [],
    [session],
  );
  const activeBranch = context?.activeBranch;

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setFailure(false);
    try {
      setOverview(await client.overview({ branchId: dashboardBranchId || undefined, from, until }));
    } catch {
      setFailure(true);
    } finally {
      setLoading(false);
    }
  }, [client, dashboardBranchId, from, session, until]);

  useEffect(() => {
    void load();
  }, [load]);
  if (!session) return null;
  const focus =
    overview?.roleFocus ??
    (session.roles.includes('SUPER_OWNER') || session.roles.includes('OWNER')
      ? session.roles.includes('SUPER_OWNER')
        ? 'EXECUTIVE'
        : 'OWNER'
      : session.roles.includes('FINANCE')
        ? 'FINANCE'
        : session.roles.includes('OPS')
          ? 'OPERATIONS'
          : 'BRANCH_OPERATIONS');
  const copy = roleCopy[focus];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 border-b border-dd-line pb-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-dd-brass-soft text-dd-brass">
              <Sparkles className="size-4" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
              {copy.eyebrow}
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-dd-ink sm:text-4xl">
            Selamat datang, {session.displayName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-dd-muted">
            <strong className="font-semibold text-dd-ink">{copy.title}.</strong> {copy.description}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-dd-lg border border-dd-line bg-dd-surface p-3 shadow-sm">
          <SearchSelect
            label="Studio/Cabang"
            value={dashboardBranchId}
            compact
            wrapperClassName="min-w-52"
            placeholder="Semua Studio/Cabang yang diizinkan"
            searchPlaceholder="Cari Studio/Cabang…"
            clearable
            options={session.branches.map((branch) => ({
              id: branch.id,
              label: branch.name,
              description: branch.code,
            }))}
            onChange={setDashboardBranchId}
          />
          <DateInput
            label="Dari"
            value={from}
            max={until}
            compact
            onChange={(event) => setFrom(event.target.value)}
            wrapperClassName="min-w-36"
          />
          <DateInput
            label="Sampai"
            value={until}
            min={from}
            compact
            onChange={(event) => setUntil(event.target.value)}
            wrapperClassName="min-w-36"
          />
          <Button
            variant="secondary"
            onClick={() => void load()}
            disabled={loading}
            leadingIcon={
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            }
          >
            Refresh
          </Button>
        </div>
      </header>

      {!activeBranch &&
        session.branches.length > 0 &&
        !session.roles.includes('SUPER_OWNER') &&
        !session.roles.includes('FINANCE') &&
        !session.roles.includes('OPS') && (
          <Feedback kind="warning">
            Pilih cabang aktif di bagian atas sebelum membuka atau menjalankan pekerjaan yang
            memiliki scope cabang.
          </Feedback>
        )}
      {failure && (
        <Feedback kind="error">
          Ringkasan bisnis belum dapat dimuat. Gunakan pintasan area kerja atau coba refresh.
        </Feedback>
      )}
      {activeBranch && (
        <div className="flex flex-wrap items-center gap-3 rounded-dd-lg border border-emerald-200 bg-dd-success-soft px-4 py-3 text-sm text-dd-success">
          <Building2 className="size-4" />
          <strong>Cabang operasional: {activeBranch.name}</strong>
          <span className="text-dd-success/70">
            {activeBranch.code} · {activeBranch.timezone}
          </span>
        </div>
      )}

      {overview && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-dd-muted">
          <span>
            Scope:{' '}
            <strong className="text-dd-ink">
              {session.branches.find((branch) => branch.id === dashboardBranchId)?.name ??
                'Semua Studio/Cabang yang diizinkan'}
            </strong>
          </span>
          <time dateTime={String(overview.generatedAt)}>
            Diperbarui{' '}
            {new Date(overview.generatedAt).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </time>
        </div>
      )}

      {overview?.financial.completeness === 'INCOMPLETE' && (
        <Feedback kind="warning">
          Laporan keuangan belum lengkap ({overview.financial.anomalyCount} anomali). Angka ini
          belum boleh digunakan untuk monthly close atau sign-off Finance.
        </Feedback>
      )}
      {overview && (
        <p className="text-xs text-dd-muted">
          Cutoff sumber:{' '}
          {new Date(overview.financial.sourceCutoffAt).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      )}

      <section aria-label="Indikator utama" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(overview?.metrics ?? []).map((metric) => (
          <StatCard
            key={metric.key}
            label={metric.label}
            value={
              overview?.financial.completeness === 'INCOMPLETE' &&
              financialMetricKeys.has(metric.key)
                ? 'Belum tersedia'
                : metric.unit === 'IDR'
                  ? rupiah.format(metric.value)
                  : metric.unit === 'PERCENT'
                    ? `${number.format(metric.value)}%`
                    : number.format(metric.value)
            }
            change={metric.changePercent}
            helper={
              overview?.financial.completeness === 'INCOMPLETE' &&
              financialMetricKeys.has(metric.key)
                ? 'Konfigurasi atau sumber belum lengkap'
                : metric.changePercent == null
                  ? 'Periode terpilih'
                  : 'dibanding periode sebelumnya'
            }
          />
        ))}
        {loading &&
          !overview &&
          Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-dd-lg border border-dd-line bg-white/70"
            />
          ))}
      </section>

      {overview?.sections.trend && (
        <Panel className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
            Tren periode
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {focus === 'FINANCE' || focus === 'EXECUTIVE' || focus === 'OWNER'
              ? 'Omzet dan profit operasional'
              : 'Pergerakan booking'}
          </h2>
          <TrendChart
            points={overview.trend}
            finance={focus === 'FINANCE' || focus === 'EXECUTIVE' || focus === 'OWNER'}
          />
        </Panel>
      )}

      <div className={`grid gap-6 ${overview?.sections.risk ? 'xl:grid-cols-[1.6fr_1fr]' : ''}`}>
        {overview?.sections.risk && (
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
                  Action queue
                </p>
                <h2 className="mt-1 text-xl font-semibold">Perlu perhatian Anda</h2>
              </div>
              <Badge tone="warning">
                {overview?.queues.reduce((sum, item) => sum + item.count, 0) ?? 0} item
              </Badge>
            </div>
            <div className="mt-5 divide-y divide-dd-line">
              {overview?.queues.length ? (
                overview.queues.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="group flex items-center gap-4 py-4 text-dd-ink no-underline"
                  >
                    <span className="grid size-10 place-items-center rounded-dd-md bg-dd-brass-soft font-bold text-dd-brass">
                      {item.count}
                    </span>
                    <span className="font-semibold">{item.label}</span>
                    <ArrowRight className="ml-auto size-4 text-dd-muted transition group-hover:translate-x-1 group-hover:text-dd-forest" />
                  </Link>
                ))
              ) : (
                <p className="py-10 text-center text-sm text-dd-muted">
                  Tidak ada antrean yang membutuhkan tindakan.
                </p>
              )}
            </div>
          </Panel>
        )}
        <Panel className="p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
              H-24 risk watch
            </p>
            <h2 className="mt-1 text-xl font-semibold">Kelas berisiko</h2>
          </div>
          <div className="mt-5 space-y-3">
            {overview?.risks.length ? (
              overview.risks.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex gap-3 rounded-dd-md border border-dd-line bg-dd-surface-muted p-3 text-dd-ink no-underline"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dd-warning" />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">{item.className}</strong>
                    <span className="mt-1 block text-xs text-dd-muted">
                      {item.bookedCount}/{item.minimumQuota} minimum ·{' '}
                      {new Date(item.startAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-dd-muted">
                Tidak ada kelas berisiko dalam 24 jam.
              </p>
            )}
          </div>
        </Panel>
      </div>

      {overview?.branches.length ? (
        <Panel className="overflow-hidden">
          <div className="border-b border-dd-line p-5 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
              Portfolio cabang
            </p>
            <h2 className="mt-1 text-xl font-semibold">Performa per cabang</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[720px]">
              <thead>
                <tr>
                  <th>Cabang</th>
                  <th>Omzet</th>
                  <th>Projection</th>
                  <th>Instruktur</th>
                  <th>Pengeluaran</th>
                  <th>Profit</th>
                  <th>Booking</th>
                  <th>Okupansi</th>
                </tr>
              </thead>
              <tbody>
                {overview.branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <strong>{branch.name}</strong>
                      <span className="ml-2 text-xs text-dd-muted">{branch.code}</span>
                    </td>
                    <td>{rupiah.format(branch.revenueRp)}</td>
                    <td>{rupiah.format(branch.projectionRp)}</td>
                    <td>{rupiah.format(branch.instructorRealtimeRp)}</td>
                    <td>{rupiah.format(branch.otherCostRp)}</td>
                    <td>{rupiah.format(branch.profitRp)}</td>
                    <td>{number.format(branch.bookings)}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-stone-100">
                          <span
                            className="block h-full rounded-full bg-dd-forest"
                            style={{ width: `${Math.min(100, branch.occupancyPercent)}%` }}
                          />
                        </div>
                        <strong>{branch.occupancyPercent}%</strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {overview?.sections.jobHealth && (
        <Panel className="overflow-hidden">
          <div className="border-b border-dd-line p-5 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
              Job health
            </p>
            <h2 className="mt-1 text-xl font-semibold">Aktivitas recovery terbaru</h2>
          </div>
          {overview.jobs.length ? (
            <div className="divide-y divide-dd-line">
              {overview.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/operations?job=${job.id}`}
                  className="flex items-center gap-4 px-5 py-4 text-dd-ink no-underline hover:bg-dd-surface-muted sm:px-6"
                >
                  <Badge
                    tone={
                      job.status === 'FAILED'
                        ? 'danger'
                        : job.status === 'SUCCEEDED'
                          ? 'success'
                          : 'warning'
                    }
                  >
                    {jobStatusLabel[job.status] ?? 'Status operasional'}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {jobTypeLabel[job.type] ?? 'Proses operasional'}
                  </span>
                  <span className="text-xs text-dd-muted">
                    Percobaan {job.attemptCount}/{job.maxAttempts}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-10 text-center text-sm text-dd-muted">Belum ada job pada scope ini.</p>
          )}
        </Panel>
      )}

      <section aria-labelledby="quick-work-title">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">Pintasan</p>
            <h2 id="quick-work-title" className="mt-1 text-xl font-semibold">
              Area kerja Anda
            </h2>
          </div>
          <span className="text-sm text-dd-muted">{pages.length} area tersedia</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {pages.slice(0, 6).map((page) => (
            <Link
              href={page.href}
              key={page.href}
              className="group inline-flex min-h-10 items-center gap-2 rounded-dd-md border border-dd-line bg-dd-surface px-3 text-sm font-semibold text-dd-ink no-underline shadow-sm hover:border-dd-brass"
            >
              <CalendarClock className="size-4 text-dd-brass" />
              <span>{page.shortLabel}</span>
              <ArrowRight className="size-4 text-dd-muted transition group-hover:translate-x-1" />
              <span className="sr-only">Buka {page.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

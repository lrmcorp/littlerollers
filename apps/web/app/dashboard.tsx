'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { canReadPage, frontendPages } from '@/lib/frontend-pages';
import { useSessionContext } from './session-context';
import { Feedback } from './ui';
import { Button } from './components/actions';
import { Badge, Panel, StatCard } from './components/admin/admin-ui';
import { DateInput, SearchSelect } from './components/forms';
import {
  browserDashboardClient,
  type DashboardClient,
  type DashboardOverview,
} from '@/api-clients/dashboard-client';
import { formatRupiah } from './lib/formatters';

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
  'pending-payments',
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
        className="h-56 w-full overflow-visible"
      >
        <title id="dashboard-trend-title">Tren {finance ? 'pendapatan' : 'booking'}</title>
        <desc id="dashboard-trend-description">
          {values.map((value, index) => `${points[index]!.date}: ${value}`).join(', ')}
        </desc>
        {[16, 41, 66, 91].map((gridY) => (
          <line
            key={gridY}
            x1="0"
            y1={gridY}
            x2="100"
            y2={gridY}
            stroke="currentColor"
            className="text-dd-line/70"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          className="text-dd-forest drop-shadow-sm"
          strokeWidth="2.5"
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
        <div className="mt-3 flex items-center gap-6 text-xs font-semibold text-dd-muted border-t border-dd-line/60 pt-3">
          <span className="flex items-center gap-1.5 text-dd-forest">
            <span className="size-2.5 rounded-full bg-dd-forest" /> Omzet Bruto
          </span>
          <span className="flex items-center gap-1.5 text-dd-brass">
            <span className="size-2.5 rounded-full bg-dd-brass" /> Profit Operasional
          </span>
        </div>
      )}
      <figcaption className="mt-2 flex justify-between text-[11px] font-medium text-dd-muted">
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
    <div className="space-y-8 font-sans text-dd-ink">
      {/* Header & Filter Card */}
      <header className="flex flex-col gap-6 rounded-2xl border border-dd-line/80 bg-white/95 p-6 sm:p-8 shadow-dd-card backdrop-blur-md xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-dd-forest/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-dd-forest">
            <Sparkles className="size-3.5 text-dd-brass" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-dd-ink">
            Selamat datang, {session.displayName}
          </h1>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-dd-muted">
            <strong className="font-semibold text-dd-ink">{copy.title}.</strong> {copy.description}
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dd-line/80 bg-dd-surface-muted/40 p-3.5 shadow-sm">
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

      {/* Warnings & Scope Banners */}
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
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-dd-success-soft px-4 py-3 text-xs sm:text-sm font-medium text-dd-success shadow-sm">
          <Building2 className="size-4 shrink-0" />
          <strong>Cabang operasional: {activeBranch.name}</strong>
          <span className="text-dd-success/75">
            {activeBranch.code} · {activeBranch.timezone}
          </span>
        </div>
      )}

      {overview && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-dd-muted border-b border-dd-line/60 pb-3">
          <span>
            Scope:{' '}
            <strong className="text-dd-ink">
              {session.branches.find((branch) => branch.id === dashboardBranchId)?.name ??
                'Semua Studio/Cabang yang diizinkan'}
            </strong>
          </span>
          <time dateTime={String(overview.generatedAt)} className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
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

      {/* KPI Metrics Stat Cards */}
      {overview && (() => {
        const metrics = overview.metrics ?? [];
        const financialMetrics = metrics.filter((m) => financialMetricKeys.has(m.key));
        const operationalMetrics = metrics.filter((m) => !financialMetricKeys.has(m.key));

        const renderCard = (metric: (typeof metrics)[number]) => {
          const isFinancial = financialMetricKeys.has(metric.key);
          const isUnavailable =
            metric.value === null ||
            metric.value === undefined ||
            Number.isNaN(metric.value) ||
            (overview.financial.completeness === 'INCOMPLETE' && isFinancial);

          const formattedValue = isUnavailable
            ? 'Belum tersedia'
            : metric.unit === 'IDR'
              ? formatRupiah(metric.value)
              : metric.unit === 'PERCENT'
                ? `${number.format(metric.value)}%`
                : number.format(metric.value);

          const helperText = isUnavailable
            ? 'Konfigurasi atau sumber belum lengkap'
            : metric.changePercent == null
              ? 'Periode terpilih'
              : 'dibanding periode sebelumnya';

          return (
            <StatCard
              key={metric.key}
              label={metric.label}
              value={formattedValue}
              change={isUnavailable ? undefined : (metric.changePercent ?? undefined)}
              helper={helperText}
            />
          );
        };

        return (
          <div className="space-y-8">
            {financialMetrics.length > 0 && (
              <section aria-label="Performa finansial" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
                    Performa Finansial
                  </span>
                  {overview.financial.completeness === 'INCOMPLETE' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 shadow-sm">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      {overview.financial.anomalyCount} anomali data migrasi
                    </span>
                  )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {financialMetrics.map(renderCard)}
                </div>
              </section>
            )}

            {operationalMetrics.length > 0 && (
              <section aria-label="Kinerja operasional dan member" className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
                  Kinerja Operasional & Member
                </span>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {operationalMetrics.map(renderCard)}
                </div>
              </section>
            )}
          </div>
        );
      })()}

      {loading && !overview && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-dd-line/80 bg-white/70 shadow-sm"
            />
          ))}
        </div>
      )}

      {/* Trend Section */}
      {overview?.sections.trend && (
        <Panel className="rounded-2xl border border-dd-line/80 bg-white/95 p-6 sm:p-8 shadow-dd-card backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-dd-line/60 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
                Tren periode
              </span>
              <h2 className="mt-1 font-sans text-xl sm:text-2xl font-bold text-dd-ink">
                {focus === 'FINANCE' || focus === 'EXECUTIVE' || focus === 'OWNER'
                  ? 'Omzet dan profit operasional'
                  : 'Pergerakan booking'}
              </h2>
            </div>
            <TrendingUp className="size-5 text-dd-forest opacity-80" />
          </div>
          <TrendChart
            points={overview.trend}
            finance={focus === 'FINANCE' || focus === 'EXECUTIVE' || focus === 'OWNER'}
          />
        </Panel>
      )}

      {/* Action Queue & Risk Watch Grid */}
      <div className={`grid gap-6 ${overview?.sections.risk ? 'xl:grid-cols-[1.5fr_1fr]' : ''}`}>
        {overview?.sections.risk && (
          <Panel className="rounded-2xl border border-dd-line/80 bg-white/95 p-6 sm:p-8 shadow-dd-card backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-dd-line/60 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
                  Action queue
                </span>
                <h2 className="mt-1 font-sans text-xl font-bold text-dd-ink">
                  Perlu perhatian Anda
                </h2>
              </div>
              <Badge tone="warning">
                {overview?.queues.reduce((sum, item) => sum + item.count, 0) ?? 0} item
              </Badge>
            </div>
            <div className="mt-4 divide-y divide-dd-line/60">
              {overview?.queues.length ? (
                overview.queues.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="group flex items-center gap-4 py-4 text-dd-ink no-underline transition hover:bg-dd-surface-muted/30 rounded-lg px-2"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-dd-brass-soft font-bold text-dd-brass-dark shadow-sm">
                      {item.count}
                    </span>
                    <span className="font-semibold text-sm sm:text-base">{item.label}</span>
                    <ArrowRight className="ml-auto size-4 text-dd-muted transition group-hover:translate-x-1 group-hover:text-dd-forest" />
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center text-sm text-dd-muted">
                  <CheckCircle2 className="mx-auto size-8 text-dd-success/60 mb-2" />
                  Tidak ada antrean yang membutuhkan tindakan.
                </div>
              )}
            </div>
          </Panel>
        )}

        <Panel className="rounded-2xl border border-dd-line/80 bg-white/95 p-6 sm:p-8 shadow-dd-card backdrop-blur-md">
          <div className="border-b border-dd-line/60 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
              H-24 risk watch
            </span>
            <h2 className="mt-1 font-sans text-xl font-bold text-dd-ink">Kelas berisiko</h2>
          </div>
          <div className="mt-4 space-y-3">
            {overview?.risks.length ? (
              overview.risks.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex gap-3.5 rounded-xl border border-dd-line/80 bg-dd-surface-muted/30 p-3.5 text-dd-ink no-underline transition hover:border-dd-forest/60 hover:bg-white"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dd-warning" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-bold text-dd-ink">
                      {item.className}
                    </strong>
                    <span className="mt-1 block text-xs text-dd-muted">
                      {item.bookedCount}/{item.minimumQuota} kuota minimum ·{' '}
                      {new Date(item.startAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-dd-muted">
                <CheckCircle2 className="mx-auto size-8 text-dd-success/60 mb-2" />
                Tidak ada kelas berisiko dalam 24 jam.
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Branch Portfolio Performance Table */}
      {overview?.branches.length ? (
        <Panel className="overflow-hidden rounded-2xl border border-dd-line/80 bg-white/95 shadow-dd-card backdrop-blur-md">
          <div className="border-b border-dd-line/60 p-6 sm:px-8">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
              Portfolio cabang
            </span>
            <h2 className="mt-1 font-sans text-xl sm:text-2xl font-bold text-dd-ink">
              Performa per cabang
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-dd-line bg-dd-surface-muted/50 text-xs font-bold uppercase text-dd-muted">
                <tr>
                  <th className="px-6 py-3.5">Cabang</th>
                  <th className="px-6 py-3.5">Omzet</th>
                  <th className="px-6 py-3.5">Projection</th>
                  <th className="px-6 py-3.5">Instruktur</th>
                  <th className="px-6 py-3.5">Pengeluaran</th>
                  <th className="px-6 py-3.5">Profit</th>
                  <th className="px-6 py-3.5">Booking</th>
                  <th className="px-6 py-3.5">Okupansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dd-line/60">
                {overview.branches.map((branch) => (
                  <tr key={branch.id} className="transition hover:bg-dd-surface-muted/30">
                    <td className="px-6 py-4">
                      <strong className="font-bold text-dd-ink">{branch.name}</strong>
                      <span className="ml-2 rounded bg-dd-surface-muted px-2 py-0.5 text-[11px] font-semibold text-dd-muted">
                        {branch.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatRupiah(branch.revenueRp)}</td>
                    <td className="px-6 py-4 text-dd-muted">{formatRupiah(branch.projectionRp)}</td>
                    <td className="px-6 py-4 text-dd-muted">
                      {formatRupiah(branch.instructorRealtimeRp)}
                    </td>
                    <td className="px-6 py-4 text-dd-muted">{formatRupiah(branch.otherCostRp)}</td>
                    <td className="px-6 py-4 font-bold text-dd-forest">
                      {formatRupiah(branch.profitRp)}
                    </td>
                    <td className="px-6 py-4 font-semibold">{number.format(branch.bookings)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-dd-surface-muted">
                          <span
                            className="block h-full rounded-full bg-dd-forest"
                            style={{ width: `${Math.min(100, branch.occupancyPercent)}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs">{branch.occupancyPercent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {/* Operational Job Health */}
      {overview?.sections.jobHealth && (
        <Panel className="overflow-hidden rounded-2xl border border-dd-line/80 bg-white/95 shadow-dd-card backdrop-blur-md">
          <div className="border-b border-dd-line/60 p-6 sm:px-8">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
              Job health
            </span>
            <h2 className="mt-1 font-sans text-xl sm:text-2xl font-bold text-dd-ink">
              Aktivitas recovery terbaru
            </h2>
          </div>
          {overview.jobs.length ? (
            <div className="divide-y divide-dd-line/60">
              {overview.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/operations?job=${job.id}`}
                  className="flex items-center gap-4 px-6 py-4 text-dd-ink no-underline transition hover:bg-dd-surface-muted/30"
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
            <p className="p-8 text-center text-sm text-dd-muted">Belum ada job pada scope ini.</p>
          )}
        </Panel>
      )}

      {/* Quick Shortcuts Area */}
      <section aria-labelledby="quick-work-title" className="space-y-4 pt-2">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
              Pintasan
            </span>
            <h2 id="quick-work-title" className="mt-1 font-sans text-xl font-bold text-dd-ink">
              Area kerja Anda
            </h2>
          </div>
          <span className="text-xs font-medium text-dd-muted">{pages.length} area tersedia</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {pages.slice(0, 8).map((page) => (
            <Link
              href={page.href}
              key={page.href}
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-dd-line/80 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-dd-ink no-underline shadow-dd-soft transition hover:border-dd-forest hover:bg-dd-surface-muted/40 hover:-translate-y-0.5"
            >
              <CalendarClock className="size-4 text-dd-brass" />
              <span>{page.shortLabel}</span>
              <ArrowRight className="size-3.5 text-dd-muted transition group-hover:translate-x-1 group-hover:text-dd-forest" />
              <span className="sr-only">Buka {page.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

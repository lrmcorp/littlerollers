'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  HardDrive,
  RefreshCw,
  ScanLine,
  Server,
  Workflow,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../components/actions';
import { Panel, StatCard } from '../components/admin/admin-ui';
import { Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { notifySessionFailure } from '@/api-clients/session-client';

export type HealthStatus = 'READY' | 'DEGRADED' | 'NOT_READY';
export type HealthDependency = {
  name: string;
  status: HealthStatus;
  detailCode: string | null;
};
export type HealthResult = {
  status: HealthStatus;
  checkedAt: string;
  dependencies: HealthDependency[];
};

type ViewState =
  | { kind: 'loading'; result: HealthResult | null }
  | { kind: 'ready'; result: HealthResult }
  | { kind: 'error'; result: HealthResult | null };

const dependencyMeta: Record<string, { label: string; icon: LucideIcon }> = {
  api: { label: 'API', icon: Server },
  database: { label: 'Database', icon: Database },
  redis: { label: 'Redis', icon: Workflow },
  worker: { label: 'Worker', icon: Activity },
  'private-storage': { label: 'Penyimpanan privat', icon: HardDrive },
  'payment-proof-scanner': { label: 'Pemindai bukti pembayaran', icon: ScanLine },
};

const statusMeta = {
  READY: {
    label: 'Normal',
    description: 'Layanan siap digunakan.',
    tone: 'success' as const,
    icon: CheckCircle2,
    cardClass: 'border-dd-success/30 bg-dd-success-soft/35',
    iconClass: 'text-dd-success',
  },
  DEGRADED: {
    label: 'Perlu perhatian',
    description: 'Layanan utama tersedia, tetapi ada komponen yang perlu diperiksa.',
    tone: 'warning' as const,
    icon: AlertTriangle,
    cardClass: 'border-dd-warning/30 bg-dd-warning-soft/40',
    iconClass: 'text-dd-warning',
  },
  NOT_READY: {
    label: 'Tidak siap',
    description: 'Layanan penting tidak siap menerima pekerjaan.',
    tone: 'danger' as const,
    icon: XCircle,
    cardClass: 'border-dd-danger/30 bg-dd-danger-soft/35',
    iconClass: 'text-dd-danger',
  },
};

const detailMessages: Record<string, string> = {
  STALE_HEARTBEAT: 'Heartbeat terakhir melewati batas aman. Periksa proses worker.',
  TIMEOUT: 'Pemeriksaan melewati batas waktu. Periksa dependency dan koneksi internal.',
  UNREACHABLE: 'Komponen tidak dapat dijangkau dari API.',
  NOT_CONFIGURED: 'Komponen belum dikonfigurasi untuk environment ini.',
};

function parseHealth(value: unknown): HealthResult | null {
  const body = value as Partial<HealthResult>;
  if (
    !body ||
    !['READY', 'DEGRADED', 'NOT_READY'].includes(String(body.status)) ||
    typeof body.checkedAt !== 'string' ||
    Number.isNaN(Date.parse(body.checkedAt)) ||
    !Array.isArray(body.dependencies)
  )
    return null;
  const dependencies = body.dependencies.filter((item): item is HealthDependency =>
    Boolean(
      item &&
      typeof item.name === 'string' &&
      ['READY', 'DEGRADED', 'NOT_READY'].includes(String(item.status)) &&
      (item.detailCode === null || typeof item.detailCode === 'string'),
    ),
  );
  if (dependencies.length !== body.dependencies.length) return null;
  return { status: body.status as HealthStatus, checkedAt: body.checkedAt, dependencies };
}

async function browserHealthLoader(): Promise<HealthResult> {
  const response = await fetch('/api/v1/operations/health', {
    cache: 'no-store',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (response.status === 401) {
    notifySessionFailure({ response });
    throw new Error('SESSION_EXPIRED');
  }
  if (response.status === 403) throw new Error('FORBIDDEN');
  const result = parseHealth(await response.json().catch(() => null));
  if (!result) throw new Error('INVALID_HEALTH_RESPONSE');
  if (!response.ok && response.status !== 503) throw new Error('HEALTH_REQUEST_FAILED');
  return result;
}

export function HealthView({
  loadHealth = browserHealthLoader,
}: {
  loadHealth?: () => Promise<HealthResult>;
}) {
  const [state, setState] = useState<ViewState>({ kind: 'loading', result: null });
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setState((current) => ({ kind: 'loading', result: current.result }));
    try {
      const result = await loadHealth();
      if (mounted.current) setState({ kind: 'ready', result });
    } catch {
      if (mounted.current) setState((current) => ({ kind: 'error', result: current.result }));
    }
  }, [loadHealth]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const result = state.result;
  const meta = result ? statusMeta[result.status] : null;
  const checkedAt = result
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(result.checkedAt))
    : null;

  return (
    <section className="space-y-6" aria-labelledby="health-title">
      <>
        <AdminPageHeader
          title="Status sistem"
          titleId="health-title"
          description="Kesiapan layanan internal dan dependency penting tanpa menampilkan konfigurasi privat."
          actions={
            <Button
              variant="secondary"
              disabled={state.kind === 'loading'}
              onClick={() => void refresh()}
            >
              <RefreshCw
                className={`size-4 ${state.kind === 'loading' ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Segarkan
            </Button>
          }
        />

        {result && meta ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Kondisi sistem" value={meta.label} tone={meta.tone} />
            <StatCard
              label="Komponen normal"
              value={`${result.dependencies.filter((item) => item.status === 'READY').length}/${result.dependencies.length}`}
            />
            <StatCard label="Pemeriksaan terakhir" value={checkedAt ?? '—'} />
          </div>
        ) : (
          <Skeleton label="Memeriksa status sistem" />
        )}
      </>

      {state.kind === 'error' && (
        <Feedback kind="error">
          Status terbaru tidak dapat diperiksa. Data lama tidak dianggap sebagai kondisi terkini.
          Periksa koneksi lalu gunakan tombol “Segarkan”.
        </Feedback>
      )}

      {result && meta && (
        <>
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 rounded-dd-lg border p-4 ${meta.cardClass}`}
          >
            <meta.icon className={`mt-0.5 size-5 shrink-0 ${meta.iconClass}`} aria-hidden="true" />
            <div>
              <strong className="block text-dd-ink">{meta.label}</strong>
              <p className="mt-1 text-sm leading-6 text-dd-muted">{meta.description}</p>
            </div>
          </div>

          <section aria-labelledby="dependency-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="dependency-title" className="text-lg font-semibold text-dd-ink">
                Komponen layanan
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-dd-muted">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {checkedAt}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.dependencies.map((dependency) => {
                const dependencyStatus = statusMeta[dependency.status];
                const dependencyInfo = dependencyMeta[dependency.name] ?? {
                  label: dependency.name,
                  icon: Server,
                };
                const Icon = dependencyInfo.icon;
                return (
                  <Panel
                    key={dependency.name}
                    className={`p-5 ${dependencyStatus.cardClass}`}
                    aria-label={`${dependencyInfo.label}: ${dependencyStatus.label}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-dd-md bg-white shadow-sm">
                        <Icon className="size-5 text-dd-forest" aria-hidden="true" />
                      </span>
                      <StatusBadge tone={dependencyStatus.tone}>
                        {dependencyStatus.label}
                      </StatusBadge>
                    </div>
                    <h3 className="mt-4 font-semibold text-dd-ink">{dependencyInfo.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-dd-muted">
                      {dependency.detailCode
                        ? (detailMessages[dependency.detailCode] ??
                          'Komponen memerlukan pemeriksaan operasional.')
                        : dependencyStatus.description}
                    </p>
                  </Panel>
                );
              })}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

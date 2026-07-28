'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Download, RefreshCw, Scale } from 'lucide-react';
import { useSessionContext } from '../session-context';
import { Feedback } from '../ui';
import {
  AdminEmptyState,
  Badge,
  Button,
  FilterBar,
  Panel,
  StatCard,
} from '../components/admin/admin-ui';
import { browserFinanceClient, type FinanceClient, type FinanceData } from './finance-client';
import { controlClassName } from '../components/forms';

const money = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const date = (value: Date) => value.toISOString().slice(0, 10);

export function FinanceView({ client = browserFinanceClient }: { client?: FinanceClient }) {
  const context = useSessionContext();
  const [from, setFrom] = useState(() => date(new Date(Date.now() - 29 * 86_400_000)));
  const [until, setUntil] = useState(() => date(new Date()));
  const [data, setData] = useState<FinanceData>();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const allowed = context?.hasCapability('finance:reconcile');
  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setFailed(false);
    try {
      setData(await client.load({ branchId: context?.activeBranchId || undefined, from, until }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [allowed, client, context?.activeBranchId, from, until]);
  useEffect(() => {
    void load();
  }, [load]);

  if (!allowed)
    return (
      <Feedback kind="error">
        Anda tidak memiliki capability finance:reconcile untuk membuka rekonsiliasi.
      </Feedback>
    );
  const metrics = data?.overview.metrics;
  const exportCsv = () => {
    if (!data || !context?.hasCapability('finance:export')) return;
    const rows = [
      [
        'branch_code',
        'branch_name',
        'expected_rp',
        'received_rp',
        'approved_rp',
        'identification_amount_rp',
        'pending_count',
        'anomaly_count',
      ],
      ...data.overview.branches.map((item) => [
        item.code,
        item.name,
        item.expectedRp,
        item.receivedRp,
        item.approvedRp,
        item.identificationAmountRp,
        item.pendingCount,
        item.anomalyCount,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `finance-reconciliation-${from}-${until}.csv`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-dd-line pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
            Finance operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Rekonsiliasi transaksi</h1>
          <p className="mt-2 max-w-2xl text-dd-muted">
            Bandingkan pembayaran, approval, dan pengakuan ledger dari data aktual lintas cabang.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={exportCsv}
            disabled={!data || !context?.hasCapability('finance:export')}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>
      <FilterBar>
        <label className="grid gap-1 text-xs font-bold text-dd-muted">
          Dari
          <input
            className={controlClassName}
            type="date"
            value={from}
            max={until}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-dd-muted">
          Sampai
          <input
            className={controlClassName}
            type="date"
            value={until}
            min={from}
            onChange={(event) => setUntil(event.target.value)}
          />
        </label>
        {context?.activeBranch && (
          <Badge tone="info">
            {context.activeBranch.code} · {context.activeBranch.name}
          </Badge>
        )}
      </FilterBar>
      {failed && (
        <Feedback kind="error">
          Data rekonsiliasi gagal dimuat. Periksa periode dan coba kembali.
        </Feedback>
      )}
      <section
        aria-label="Ringkasan rekonsiliasi"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatCard
          label="Expected"
          value={money.format(metrics?.expectedRp ?? 0)}
          helper="Nilai transaksi periode"
        />
        <StatCard
          label="Received"
          value={money.format(metrics?.receivedRp ?? 0)}
          helper="Bukti final dan bersih"
        />
        <StatCard
          label="Approved"
          value={money.format(metrics?.approvedRp ?? 0)}
          helper="Keputusan Finance"
        />
        <StatCard
          label="Identifikasi transfer"
          value={money.format(metrics?.identificationAmountRp ?? 0)}
          helper="Penyesuaian tiga digit, terpisah dari harga paket"
        />
        <StatCard
          label="Ledger delta"
          value={money.format(metrics?.ledgerDeltaRp ?? 0)}
          tone={metrics?.ledgerDeltaRp ? 'danger' : 'success'}
          helper={`${metrics?.unreconciledCount ?? 0} belum direkonsiliasi`}
        />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-dd-line p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">
                Branch comparison
              </p>
              <h2 className="mt-1 text-xl font-semibold">Status per cabang</h2>
            </div>
            <Scale className="size-5 text-dd-brass" />
          </div>
          {data?.overview.branches.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[680px]">
                <thead>
                  <tr>
                    <th>Cabang</th>
                    <th>Expected</th>
                    <th>Received</th>
                    <th>Approved</th>
                    <th>Identifikasi</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overview.branches.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <span className="ml-2 text-xs text-dd-muted">{item.code}</span>
                      </td>
                      <td>{money.format(item.expectedRp)}</td>
                      <td>{money.format(item.receivedRp)}</td>
                      <td>{money.format(item.approvedRp)}</td>
                      <td>{money.format(item.identificationAmountRp)}</td>
                      <td>
                        <Badge tone={item.pendingCount ? 'warning' : 'success'}>
                          {item.pendingCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              title="Belum ada transaksi"
              description="Tidak ada data pada periode dan cabang yang dipilih."
            />
          )}
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">
                Anomaly review
              </p>
              <h2 className="mt-1 text-xl font-semibold">Perlu pemeriksaan</h2>
            </div>
            <Badge tone={data?.anomalies.length ? 'danger' : 'success'}>
              {data?.anomalies.length ?? 0}
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            {data?.anomalies.length ? (
              data.anomalies.map((item) => (
                <Link
                  href={item.href}
                  key={`${item.purchaseId}-${item.code}`}
                  className="flex gap-3 rounded-dd-md border border-dd-line p-3 text-dd-ink no-underline hover:border-dd-brass"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dd-warning" />
                  <span>
                    <strong className="block text-sm">{item.code.replaceAll('_', ' ')}</strong>
                    <span className="text-xs text-dd-muted">
                      {item.branchCode} · {money.format(item.amountRp)}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-dd-muted">
                Tidak ada anomali pada periode ini.
              </p>
            )}
          </div>
        </Panel>
      </div>
      <Panel className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <strong>Antrean keputusan pembayaran</strong>
          <p className="mt-1 text-sm text-dd-muted">
            Keputusan final hanya tersedia untuk Finance dan Super Owner, lengkap dengan reason
            serta expected version.
          </p>
        </div>
        <Link className="button button-secondary" href="/workspace/payments?status=PENDING">
          Buka payment queue
        </Link>
      </Panel>
    </div>
  );
}

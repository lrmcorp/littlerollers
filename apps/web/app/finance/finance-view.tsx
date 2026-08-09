'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Download, RefreshCw, Scale } from 'lucide-react';
import { useSessionContext } from '../session-context';
import { Feedback } from '../ui';
import {
  AdminEmptyState,
  Badge,
  DataTable,
  FilterBar,
  Pagination,
  Panel,
  StatCard,
} from '../components/admin/admin-ui';
import { Button } from '../components/actions';
import { browserFinanceClient, type FinanceClient, type FinanceData } from './finance-client';
import { controlClassName } from '../components/forms';
import { FinanceCommandsPanel } from './finance-commands-panel';

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
  const [exporting, setExporting] = useState(false);
  const [anomalyCursor, setAnomalyCursor] = useState<string>();
  const [anomalyCursorHistory, setAnomalyCursorHistory] = useState<string[]>([]);
  const [legacyCursor, setLegacyCursor] = useState<string>();
  const [legacyCursorHistory, setLegacyCursorHistory] = useState<string[]>([]);
  const allowed = context?.hasCapability('finance:reconcile');
  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setFailed(false);
    try {
      const input = { branchId: context?.activeBranchId || undefined, from, until };
      const [overview, anomalies, legacyCashflow] = await Promise.all([
        client.overview(input),
        client.anomalies(input),
        client.legacyCashflow(input),
      ]);
      setData({ overview, anomalies, legacyCashflow });
      setAnomalyCursor(undefined);
      setAnomalyCursorHistory([]);
      setLegacyCursor(undefined);
      setLegacyCursorHistory([]);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [allowed, client, context?.activeBranchId, from, until]);

  const loadAnomalyPage = async (cursor?: string) => {
    if (!allowed || !data) return false;
    setLoading(true);
    setFailed(false);
    try {
      const anomalies = await client.anomalies(
        { branchId: context?.activeBranchId || undefined, from, until },
        cursor,
      );
      setData({ ...data, anomalies });
      setAnomalyCursor(cursor);
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const loadLegacyPage = async (cursor?: string) => {
    if (!allowed || !data) return false;
    setLoading(true);
    setFailed(false);
    try {
      const legacyCashflow = await client.legacyCashflow(
        { branchId: context?.activeBranchId || undefined, from, until },
        cursor,
      );
      setData({ ...data, legacyCashflow });
      setLegacyCursor(cursor);
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setLoading(false);
    }
  };
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
  const exportCsv = async () => {
    if (!data || !client.exportReport || !context?.hasCapability('finance:export')) return;
    setExporting(true);
    setFailed(false);
    try {
      const result = await client.exportReport({
        branchId: context.activeBranchId || undefined,
        from,
        until,
      });
      const blob = new Blob([result.content], { type: String(result.mimeType) });
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = result.fileName;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } catch {
      setFailed(true);
    } finally {
      setExporting(false);
    }
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
            leadingIcon={<Download className="size-4" aria-hidden="true" />}
            onClick={() => void exportCsv()}
            disabled={
              exporting ||
              !data ||
              !client.exportReport ||
              !context?.hasCapability('finance:export')
            }
          >
            Export CSV
          </Button>
          <Button
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
            <Badge tone={data?.anomalies.total ? 'danger' : 'success'}>
              {data?.anomalies.total ?? 0}
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            {data?.anomalies.items.length ? (
              data.anomalies.items.map((item) => (
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
          {data && (
            <div className="mt-4">
              <Pagination
                hasPrevious={anomalyCursorHistory.length > 0 && !loading}
                hasNext={Boolean(data.anomalies.page.nextCursor) && !loading}
                totalLabel={`Halaman ${anomalyCursorHistory.length + 1} · ${data.anomalies.items.length.toLocaleString('id-ID')} data dari ${data.anomalies.total.toLocaleString('id-ID')} anomali`}
                onPrevious={() => {
                  const previous = anomalyCursorHistory.at(-1) ?? '';
                  void loadAnomalyPage(previous || undefined).then((loaded) => {
                    if (loaded) setAnomalyCursorHistory((current) => current.slice(0, -1));
                  });
                }}
                onNext={() => {
                  const next = data.anomalies.page.nextCursor;
                  if (!next) return;
                  void loadAnomalyPage(next).then((loaded) => {
                    if (loaded)
                      setAnomalyCursorHistory((current) => [...current, anomalyCursor ?? '']);
                  });
                }}
              />
            </div>
          )}
        </Panel>
      </div>
      <Panel className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dd-line p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">
              Data historis v1
            </p>
            <h2 className="mt-1 text-xl font-semibold">Legacy cashflow</h2>
            <p className="mt-1 text-sm text-dd-muted">
              Income/expense single-entry v1 ditampilkan terpisah dari jurnal double-entry v2.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge tone="success">
              Income {money.format(data?.legacyCashflow.summary.INCOME?.amountRp ?? 0)}
            </Badge>
            <Badge tone="warning">
              Expense {money.format(data?.legacyCashflow.summary.EXPENSE?.amountRp ?? 0)}
            </Badge>
          </div>
        </div>
        <DataTable
          items={data?.legacyCashflow.items ?? []}
          loading={loading}
          rowKey={(item) => item.id}
          emptyTitle="Belum ada legacy cashflow"
          emptyDescription="Tidak ada jurnal v1 pada periode dan scope ini."
          columns={[
            {
              id: 'date',
              header: 'Tanggal',
              cell: (item) => item.occurredAt.toLocaleDateString('id-ID'),
            },
            {
              id: 'type',
              header: 'Tipe',
              cell: (item) => (
                <Badge tone={item.type === 'INCOME' ? 'success' : 'warning'}>
                  {item.type === 'INCOME' ? 'Income' : 'Expense'}
                </Badge>
              ),
            },
            { id: 'description', header: 'Deskripsi', cell: (item) => item.description ?? '—' },
            {
              id: 'branch',
              header: 'Studio/Cabang',
              cell: (item) => item.branch?.name ?? 'Global',
            },
            { id: 'amount', header: 'Nominal', cell: (item) => money.format(item.amountRp) },
          ]}
        />
        {data && (
          <div className="border-t border-dd-line p-4">
            <Pagination
              previousAriaLabel="Legacy cashflow sebelumnya"
              nextAriaLabel="Legacy cashflow berikutnya"
              hasPrevious={legacyCursorHistory.length > 0 && !loading}
              hasNext={Boolean(data.legacyCashflow.page.nextCursor) && !loading}
              totalLabel={`Halaman ${legacyCursorHistory.length + 1} · ${data.legacyCashflow.items.length.toLocaleString('id-ID')} data dari ${data.legacyCashflow.total.toLocaleString('id-ID')} legacy entry`}
              onPrevious={() => {
                const previous = legacyCursorHistory.at(-1) ?? '';
                void loadLegacyPage(previous || undefined).then((loaded) => {
                  if (loaded) setLegacyCursorHistory((current) => current.slice(0, -1));
                });
              }}
              onNext={() => {
                const next = data.legacyCashflow.page.nextCursor;
                if (!next) return;
                void loadLegacyPage(next).then((loaded) => {
                  if (loaded) setLegacyCursorHistory((current) => [...current, legacyCursor ?? '']);
                });
              }}
            />
          </div>
        )}
      </Panel>
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
      {context?.activeBranchId && context.hasCapability('finance:manage') && (
        <FinanceCommandsPanel client={client} branchId={context.activeBranchId} />
      )}
    </div>
  );
}

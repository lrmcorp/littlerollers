'use client';
import { useState } from 'react';
import {
  browserLedgerClient,
  ledgerFailure,
  type LedgerBalance,
  type LedgerClient,
  type LedgerHistory,
  type Adjustment,
} from '../ledger-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { Button, Panel, StatCard } from '../components/admin/admin-ui';

export function LedgerView({ client = browserLedgerClient }: { client?: LedgerClient }) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canRequest = !sessionContext || sessionContext.hasCapability('ledger:adjust:request');
  const canDecide = !sessionContext || sessionContext.hasCapability('ledger:adjust:decide');
  const [items, setItems] = useState<LedgerBalance[]>([]);
  const [history, setHistory] = useState<LedgerHistory | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [packageId, setPackageId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reasonCode, setReasonCode] = useState('MIGRATION_CORRECTION');
  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(ledgerFailure(cause));
    } finally {
      setLoading(false);
    }
  };
  const load = (cursor?: string) =>
    run(async () => {
      const result = await client.list(branchId || undefined, cursor);
      setItems(cursor ? [...items, ...result.items] : result.items);
      setNextCursor(result.nextCursor);
      setMessage(result.items.length ? 'Saldo paket dimuat.' : 'Belum ada paket customer.');
    });
  return (
    <section className="space-y-6" aria-labelledby="ledger-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Append-only ledger"
          title="Saldo dan histori paket"
          titleId="ledger-title"
          description="Saldo authoritative memperhitungkan ledger dan reservation aktif pada cakupan cabang."
          context={
            <>
              <StatusBadge tone="info">Branch scoped</StatusBadge>
              <StatusBadge tone="warning">Mode simulasi</StatusBadge>
            </>
          }
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard label="Paket ditampilkan" value={String(items.length)} />
          <StatCard
            label="Total sesi"
            value={String(items.reduce((sum, item) => sum + item.ledgerBalance, 0))}
          />
          <StatCard
            label="Sesi tersedia"
            value={String(items.reduce((sum, item) => sum + item.available, 0))}
            tone="success"
          />
        </div>
      </Panel>
      {!sessionContext && (
        <label>
          Cabang ledger
          <input value={branchId} onChange={(event) => setBranchId(event.target.value)} />
        </label>
      )}
      <Button disabled={loading} onClick={() => void load()}>
        Muat saldo
      </Button>
      <ul aria-label="Daftar saldo paket">
        {items.map((item) => (
          <li key={item.id}>
            <button onClick={() => void run(async () => setHistory(await client.detail(item.id)))}>
              {item.status} · total {item.ledgerBalance} · reserved {item.reserved} · tersedia{' '}
              {item.available}
            </button>
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 && (
        <EmptyState
          title="Belum ada saldo paket"
          description="Muat saldo sesuai cabang untuk melihat balance dan histori."
        />
      )}
      {nextCursor && (
        <Button variant="secondary" onClick={() => void load(nextCursor)}>
          Muat berikutnya
        </Button>
      )}
      {history && (
        <section aria-labelledby="history-title">
          <h2 id="history-title">Histori ledger</h2>
          <p>
            Status {history.balance.status}; tersedia {history.balance.available}
          </p>
          <ol>
            {history.entries.map((entry) => (
              <li key={entry.id}>
                {entry.type} {entry.quantity}
              </li>
            ))}
          </ol>
          {history.nextCursor && (
            <button
              onClick={() =>
                void run(async () =>
                  setHistory(await client.detail(history.balance.id, history.nextCursor!)),
                )
              }
            >
              Histori berikutnya
            </button>
          )}
        </section>
      )}
      <section aria-labelledby="adjustment-title">
        <h2 id="adjustment-title">Penyesuaian sesi</h2>
        <p className="muted">
          Request Admin tidak mengubah saldo. Keputusan memerlukan Manager/Super Owner berbeda dan
          permission yang sesuai.
        </p>
        <ConfirmationPanel title="Separation of duties">
          Request tidak mengubah saldo. Approval hanya dapat dilakukan actor berbeda yang berizin.
        </ConfirmationPanel>
        <label>
          Paket customer
          <input value={packageId} onChange={(event) => setPackageId(event.target.value)} />
        </label>
        <label>
          Delta sesi
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
        <label>
          Alasan terkontrol
          <select value={reasonCode} onChange={(event) => setReasonCode(event.target.value)}>
            <option>MIGRATION_CORRECTION</option>
            <option>ATTENDANCE_CORRECTION</option>
            <option>PACKAGE_COMPENSATION</option>
            <option>SUPPORT_RECONCILIATION</option>
          </select>
        </label>
        <Button
          disabled={loading || !packageId || !quantity || Number(quantity) === 0 || !canRequest}
          onClick={() =>
            void run(async () => {
              await client.requestAdjustment(
                { customerPackageId: packageId, quantity: Number(quantity), reasonCode },
                crypto.randomUUID(),
              );
              setMessage('Adjustment PENDING dibuat tanpa mutasi saldo.');
            })
          }
        >
          Buat request adjustment
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() =>
            void run(async () =>
              setAdjustments(await client.listAdjustments(branchId || undefined)),
            )
          }
        >
          Muat antrean adjustment
        </Button>
        <ul aria-label="Antrean adjustment">
          {adjustments.map((item) => (
            <li key={item.id}>
              {item.status} · {item.quantity} · {item.reasonCode}
              {item.status === 'PENDING' && (
                <>
                  <button
                    disabled={!canDecide}
                    onClick={() =>
                      void run(async () => {
                        await client.decideAdjustment(
                          item.id,
                          'approve',
                          { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: item.version },
                          crypto.randomUUID(),
                        );
                        setAdjustments(await client.listAdjustments(branchId || undefined));
                      })
                    }
                  >
                    Setujui
                  </button>
                  <button
                    disabled={!canDecide}
                    onClick={() =>
                      void run(async () => {
                        await client.decideAdjustment(
                          item.id,
                          'reject',
                          { reasonCode: 'INVALID_EVIDENCE', expectedVersion: item.version },
                          crypto.randomUUID(),
                        );
                        setAdjustments(await client.listAdjustments(branchId || undefined));
                      })
                    }
                  >
                    Tolak
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {loading && <Skeleton label="Memuat ledger" />}
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}

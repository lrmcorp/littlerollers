'use client';
import { useState } from 'react';
import {
  browserLedgerClient,
  ledgerFailure,
  type LedgerBalance,
  type LedgerClient,
  type LedgerHistory,
} from '../ledger-client';

export function LedgerView({ client = browserLedgerClient }: { client?: LedgerClient }) {
  const [branchId, setBranchId] = useState('');
  const [items, setItems] = useState<LedgerBalance[]>([]);
  const [history, setHistory] = useState<LedgerHistory | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <section className="card" aria-labelledby="ledger-title">
      <p className="muted">SYNTHETIC NON-PRODUCTION · AUTHORITATIVE READ</p>
      <h1 id="ledger-title">Saldo dan histori paket</h1>
      <label>
        Cabang ledger
        <input value={branchId} onChange={(event) => setBranchId(event.target.value)} />
      </label>
      <button disabled={loading} onClick={() => void load()}>
        Muat saldo
      </button>
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
      {nextCursor && <button onClick={() => void load(nextCursor)}>Muat berikutnya</button>}
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
      {loading && <p role="status">Memuat…</p>}
      {message && !loading && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

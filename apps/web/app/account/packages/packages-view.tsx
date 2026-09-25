'use client';

import { useCallback, useEffect, useState } from 'react';
import { browserLedgerClient, type LedgerBalance } from '@/api-clients/ledger-client';
import { ButtonLink } from '../../components/actions';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { Pagination } from '../../components/admin/admin-ui';

export function CustomerPackagesView() {
  const [items, setItems] = useState<LedgerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(async (pageCursor?: string) => {
    setLoading(true);
    setError('');
    try {
      const value = await browserLedgerClient.list(undefined, pageCursor);
      setItems(value.items);
      setNextCursor(value.nextCursor);
      setTotal(value.summary.packageCount);
      setCursor(pageCursor);
      return true;
    } catch {
      setError('Paket Anda belum dapat dimuat.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Member area"
        title="Paket Saya"
        description="Lihat saldo sesi, masa aktif, dan lanjutkan langsung ke jadwal booking."
        context={
          <ButtonLink variant="secondary" size="sm" href="/packages">
            Tambah paket
          </ButtonLink>
        }
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada paket aktif"
          description="Paket akan tampil setelah bukti pembayaran pesanan disetujui."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
                      {item.branchName ?? 'Daily Dose'}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {item.packageName ?? 'Paket kelas'}
                    </h2>
                    <p className="mt-1 text-sm text-dd-muted">
                      {item.classTypeName ?? 'Kelas Daily Dose'}
                    </p>
                  </div>
                  <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {item.status === 'ACTIVE' ? 'Aktif' : 'Tidak aktif'}
                  </StatusBadge>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-dd-lg bg-dd-surface-muted p-3">
                    <dt className="text-xs text-dd-muted">Tersedia</dt>
                    <dd className="mt-1 text-xl font-semibold">{item.available}</dd>
                  </div>
                  <div className="rounded-dd-lg bg-dd-surface-muted p-3">
                    <dt className="text-xs text-dd-muted">Dipesan</dt>
                    <dd className="mt-1 text-xl font-semibold">{item.reserved}</dd>
                  </div>
                  <div className="rounded-dd-lg bg-dd-surface-muted p-3">
                    <dt className="text-xs text-dd-muted">Total</dt>
                    <dd className="mt-1 text-xl font-semibold">{item.ledgerBalance}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-dd-muted">
                  Berlaku sampai {item.expiryAt.toLocaleDateString('id-ID')}
                </p>
                <ButtonLink
                  className="mt-5"
                  href={`/classes?branch=${encodeURIComponent(item.branchId)}#schedule`}
                >
                  Booking kelas
                </ButtonLink>
              </article>
            ))}
          </div>
          <Pagination
            hasPrevious={cursorHistory.length > 0 && !loading}
            hasNext={Boolean(nextCursor) && !loading}
            totalLabel={`${items.length.toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} paket`}
            currentPage={cursorHistory.length + 1}
            onPrevious={() => {
              const previous = cursorHistory.at(-1) ?? '';
              void loadPage(previous || undefined).then((loaded) => {
                if (loaded) setCursorHistory((current) => current.slice(0, -1));
              });
            }}
            onNext={() => {
              if (!nextCursor) return;
              void loadPage(nextCursor).then((loaded) => {
                if (loaded) setCursorHistory((current) => [...current, cursor ?? '']);
              });
            }}
          />
        </>
      )}
    </main>
  );
}

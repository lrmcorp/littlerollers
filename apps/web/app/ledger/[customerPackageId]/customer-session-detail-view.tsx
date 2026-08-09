'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTrackedRouter } from '../../components/app-loading';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { browserLedgerClient, ledgerFailure, type LedgerHistory } from '../../ledger-client';
import { Button, ButtonLink } from '../../components/actions';
import { Badge, Pagination, Panel, StatCard } from '../../components/admin/admin-ui';
import { EmptyState, Feedback, PageHeader, Skeleton } from '../../ui';

const ledgerLabels: Record<string, string> = {
  PURCHASE: 'Aktivasi paket',
  MIGRATION_OPENING: 'Saldo awal migrasi',
  ATTEND: 'Pemakaian sesi',
  REVERSAL: 'Pengembalian sesi',
  ADJUST_MANUAL: 'Penyesuaian manual',
};

const formatDate = (value: Date, withTime = false) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
    timeZone: 'Asia/Jakarta',
  }).format(value);

export function CustomerSessionDetailView({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useTrackedRouter();
  const requestedReturnTo = searchParams.get('returnTo');
  const returnTo =
    requestedReturnTo?.startsWith('/ledger') && !requestedReturnTo.startsWith('//')
      ? requestedReturnTo
      : '/ledger';
  const [cursor, setCursor] = useState(searchParams.get('cursor') ?? '');
  const [history, setHistory] = useState<LedgerHistory>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setHistory(await browserLedgerClient.detail(id, cursor || undefined));
    } catch (cause) {
      setError(await ledgerFailure(cause));
    } finally {
      setLoading(false);
    }
  }, [cursor, id]);

  useEffect(() => void load(), [load]);

  const changePage = (nextCursor: string) => {
    setLoadingMore(true);
    setCursor(nextCursor);
    const query = new URLSearchParams(searchParams.toString());
    if (nextCursor) query.set('cursor', nextCursor);
    else query.delete('cursor');
    router.replace(`/ledger/${id}?${query.toString()}`, { scroll: false });
  };
  useEffect(() => {
    if (!loading) setLoadingMore(false);
  }, [loading]);

  if (loading && !history) return <Skeleton label="Memuat detail sesi customer" />;
  if (!history)
    return (
      <div className="space-y-4">
        <EmptyState
          title="Detail sesi belum tersedia"
          description={error || 'Paket customer tidak ditemukan atau berada di luar scope Anda.'}
        />
        <div className="text-center">
          <Button onClick={() => void load()}>Coba lagi</Button>
        </div>
      </div>
    );

  const { balance } = history;
  return (
    <section className="space-y-6" aria-labelledby="customer-session-detail-title">
      <ButtonLink
        variant="ghost"
        href={returnTo}
        leadingIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
      >
        Kembali ke Sesi Customer
      </ButtonLink>
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Sesi Customer / Detail"
          title={balance.packageName ?? 'Paket customer'}
          titleId="customer-session-detail-title"
          description={`${balance.customer?.displayName ?? 'Customer'} · ${balance.branchName ?? 'Cabang'} · ${balance.classTypeName ?? 'Tipe kelas'}`}
          context={
            <Button
              variant="secondary"
              leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              onClick={() => void load()}
            >
              Perbarui
            </Button>
          }
        />
      </Panel>
      {error && <Feedback kind="error">{error}</Feedback>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Saldo sesi">
        <StatCard
          label="Sesi awal"
          value={String(balance.usage?.initialSessions ?? balance.sessionCountSnapshot ?? 0)}
        />
        <StatCard label="Sesi terpakai" value={String(balance.usage?.usedSessions ?? 0)} />
        <StatCard label="Sesi tertahan" value={String(balance.reserved)} tone="warning" />
        <StatCard label="Sesi tersedia" value={String(balance.available)} tone="success" />
      </section>
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-dd-ink">Status paket</h2>
            <p className="mt-1 text-sm text-dd-muted">
              Aktif {formatDate(balance.activationDate)} · berakhir {formatDate(balance.expiryAt)}
            </p>
          </div>
          <Badge tone={balance.status === 'ACTIVE' ? 'success' : 'neutral'}>
            {balance.status === 'ACTIVE'
              ? 'Aktif'
              : balance.status === 'EXPIRED'
                ? 'Berakhir'
                : 'Tidak aktif'}
          </Badge>
        </div>
        {balance.customer?.id && (
          <ButtonLink className="mt-4" variant="secondary" href={`/users/${balance.customer.id}`}>
            Buka detail customer
          </ButtonLink>
        )}
      </Panel>
      <Panel className="overflow-hidden">
        <div className="border-b border-dd-line px-5 py-4">
          <h2 className="font-semibold text-dd-ink">Reservation aktif</h2>
          <p className="mt-1 text-sm text-dd-muted">
            Sesi yang sedang ditahan oleh booking mendatang.
          </p>
        </div>
        {history.reservations.items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-dd-muted">Tidak ada sesi yang sedang ditahan.</p>
        ) : (
          <ul className="divide-y divide-dd-line">
            {history.reservations.items.map((reservation) => (
              <li
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <strong className="text-sm text-dd-ink">
                    {reservation.className ?? 'Booking kelas'}
                  </strong>
                  <p className="mt-1 text-xs text-dd-muted">
                    {reservation.branchName ?? 'Cabang'} ·{' '}
                    {reservation.startsAt
                      ? formatDate(reservation.startsAt, true)
                      : 'Jadwal tidak tersedia'}
                  </p>
                </div>
                {reservation.bookingId ? (
                  <ButtonLink variant="ghost" href={`/bookings/${reservation.bookingId}`}>
                    Lihat booking
                  </ButtonLink>
                ) : (
                  <Badge tone="warning">{reservation.quantity} sesi tertahan</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel className="overflow-hidden">
        <div className="border-b border-dd-line px-5 py-4">
          <h2 className="font-semibold text-dd-ink">Histori penggunaan sesi</h2>
          <p className="mt-1 text-sm text-dd-muted">
            Urutan terbaru berdasarkan ledger authoritative.
          </p>
        </div>
        {history.entries.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Belum ada histori"
              description="Perubahan sesi akan tampil di sini."
            />
          </div>
        ) : (
          <ol className="divide-y divide-dd-line">
            {history.entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <strong className="text-sm text-dd-ink">
                    {ledgerLabels[entry.type] ?? 'Perubahan sesi'}
                  </strong>
                  <p className="mt-1 text-xs text-dd-muted">
                    {entry.referenceLabel ?? 'Perubahan sesi'} ·{' '}
                    {formatDate(entry.occurredAt, true)}
                    {entry.balanceAfter !== null && entry.balanceAfter !== undefined
                      ? ` · saldo setelah transaksi ${entry.balanceAfter}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <strong className={entry.quantity >= 0 ? 'text-dd-success' : 'text-dd-danger'}>
                    {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity} sesi
                  </strong>
                  {entry.bookingId && (
                    <ButtonLink variant="ghost" href={`/bookings/${entry.bookingId}`}>
                      Booking
                    </ButtonLink>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="border-t border-dd-line p-4">
          <Pagination
            hasPrevious={cursor !== ''}
            hasNext={Boolean(history.nextCursor)}
            totalLabel={loadingMore ? 'Memuat halaman…' : 'Histori penggunaan sesi'}
            onPrevious={() => changePage(history.previousCursor ?? '')}
            onNext={() => history.nextCursor && changePage(history.nextCursor)}
          />
        </div>
      </Panel>
    </section>
  );
}

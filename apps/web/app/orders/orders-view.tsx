'use client';

import { ArrowRight, CalendarClock, PackagePlus, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  browserOrderClient,
  orderError,
  type CustomerOrder,
  type CustomerOrderPage,
  type CustomerOrderSummary,
  type OrderStatus,
} from '@/api-clients/order-client';
import { orderStatusLabels } from '@/lib/order-presenters';
import { Button, ButtonLink } from '../components/actions';
import { useTrackedRouter } from '../components/app-loading';
import { DateInput, SearchInput, SelectInput } from '../components/forms';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { Pagination } from '../components/admin/admin-ui';
import { ADMIN_PAGE_SIZE } from '../lib/pagination';
import { formatRupiah } from '../lib/formatters';

const emptySummary: CustomerOrderSummary = {
  total: 0,
  awaitingPayment: 0,
  pending: 0,
  actionRequired: 0,
  approved: 0,
  rejected: 0,
  expired: 0,
};
const summaryCards: Array<{
  key: keyof CustomerOrderSummary;
  label: string;
  status: '' | OrderStatus;
}> = [
  { key: 'total', label: 'Semua', status: '' },
  { key: 'awaitingPayment', label: 'Belum dibayar', status: 'AWAITING_PAYMENT' },
  { key: 'pending', label: 'Diperiksa', status: 'PENDING' },
  { key: 'actionRequired', label: 'Perlu tindakan', status: 'ACTION_REQUIRED' },
  { key: 'approved', label: 'Disetujui', status: 'APPROVED' },
  { key: 'rejected', label: 'Ditolak', status: 'REJECTED' },
  { key: 'expired', label: 'Kedaluwarsa', status: 'EXPIRED' },
];

function tone(status: OrderStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'EXPIRED') return 'danger' as const;
  if (status === 'ACTION_REQUIRED') return 'warning' as const;
  return 'info' as const;
}

function urgency(order: CustomerOrder) {
  if (order.status === 'AWAITING_PAYMENT') return 'Lanjutkan pembayaran';
  if (order.status === 'ACTION_REQUIRED') return 'Ganti bukti pembayaran';
  if (order.status === 'PENDING') return 'Menunggu verifikasi tim keuangan';
  if (order.status === 'APPROVED') return 'Paket sudah diaktifkan';
  if (order.status === 'REJECTED') return 'Lihat hasil pemeriksaan';
  return 'Pesanan sudah berakhir';
}

export function OrdersView() {
  const router = useTrackedRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const q = searchParams.get('q') ?? '';
  const from = searchParams.get('from') ?? '';
  const until = searchParams.get('until') ?? '';
  const cursor = searchParams.get('cursor') ?? '';
  const [draftQuery, setDraftQuery] = useState(q);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [data, setData] = useState<CustomerOrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const updateFilters = (updates: Record<string, string>, keepCursor = false) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepCursor) {
      next.delete('cursor');
      setCursorHistory([]);
    }
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ''}`, { scroll: false });
  };

  useEffect(() => setDraftQuery(q), [q]);
  useEffect(() => {
    setLoading(true);
    setError('');
    browserOrderClient
      .list({ status, q, from, until, cursor, limit: ADMIN_PAGE_SIZE })
      .then(setData)
      .catch((cause) => setError(orderError(cause)))
      .finally(() => setLoading(false));
  }, [cursor, from, q, status, until]);

  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ''}`;
  const summary = data?.summary ?? emptySummary;
  const activeCard = summaryCards.find((c) => c.status === status);
  const countForActiveFilter = activeCard ? summary[activeCard.key] : summary.total;
  const effectiveTotal = Math.max(countForActiveFilter, data?.items?.length ?? 0);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Portal Member"
        title="Pesanan Saya"
        description="Pantau pembayaran, pemeriksaan bukti, aktivasi paket, dan riwayat setiap pesanan."
        context={
          <ButtonLink href="/packages" leadingIcon={<PackagePlus className="size-4" />}>
            Beli paket
          </ButtonLink>
        }
      />

      <section
        aria-label="Ringkasan pesanan"
        className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 no-scrollbar lg:grid lg:grid-cols-7 lg:overflow-visible"
      >
        {summaryCards.map((card) => {
          const selected = status === card.status;
          return (
            <button
              type="button"
              key={card.key}
              aria-pressed={selected}
              onClick={() => updateFilters({ status: card.status })}
              className={`min-w-[115px] shrink-0 rounded-dd-lg border p-3 text-left transition lg:min-w-0 ${
                selected
                  ? 'border-dd-forest bg-dd-forest text-white shadow-dd-soft'
                  : 'border-dd-line bg-white text-dd-ink hover:border-dd-forest/40'
              }`}
            >
              <span className={`block text-xs ${selected ? 'text-white/70' : 'text-dd-muted'}`}>
                {card.label}
              </span>
              <strong className="mt-1 block text-xl">{summary[card.key]}</strong>
            </button>
          );
        })}
      </section>

      <form
        className="grid gap-3 rounded-dd-xl border border-dd-line bg-white p-4 shadow-dd-card md:grid-cols-[minmax(0,1fr)_180px_170px_170px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters({ q: draftQuery.trim() });
        }}
      >
        <SearchInput
          label="Cari pesanan"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Nama paket atau studio"
          leadingIcon={<Search className="size-4" />}
        />
        <SelectInput
          label="Status"
          value={status}
          onChange={(event) => updateFilters({ status: event.target.value })}
        >
          <option value="">Semua status</option>
          {Object.entries(orderStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        <DateInput
          label="Dari tanggal"
          value={from}
          max={until || undefined}
          onChange={(event) => updateFilters({ from: event.target.value })}
        />
        <DateInput
          label="Sampai tanggal"
          value={until}
          min={from || undefined}
          onChange={(event) => updateFilters({ until: event.target.value })}
        />
        <div className="flex items-end gap-2">
          <Button type="submit">Cari</Button>
          {(q || status || from || until || cursor) && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraftQuery('');
                router.replace(pathname, { scroll: false });
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton label="Memuat pesanan" />
      ) : !data?.items.length ? (
        <EmptyState
          title={q || status || from || until ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}
          description={
            q || status || from || until
              ? 'Ubah atau reset filter untuk melihat pesanan lainnya.'
              : 'Pilih paket yang sesuai lalu buat pesanan sebelum melakukan transfer.'
          }
        />
      ) : (
        <>
          <div className="grid gap-3">
            {data.items.map((item, index) => (
              <Link
                className="group grid gap-4 rounded-dd-xl border border-dd-line bg-white p-5 text-dd-ink no-underline shadow-dd-card transition hover:-translate-y-0.5 hover:border-dd-forest/30 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                href={`/orders/${encodeURIComponent(item.id)}?returnTo=${encodeURIComponent(returnTo)}`}
                key={item.id}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-dd-surface-muted text-xs font-bold text-dd-muted">
                      #{cursorHistory.length * 20 + index + 1}
                    </span>
                    <strong className="text-base">{item.packageName}</strong>
                    <StatusBadge tone={tone(item.status)}>
                      {orderStatusLabels[item.status]}
                    </StatusBadge>
                  </span>
                  <small className="mt-2 flex flex-wrap items-center gap-2 text-dd-muted">
                    <span>{item.branchName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.submittedAt.toLocaleDateString('id-ID')}</span>
                    {item.expiresAt && item.status === 'AWAITING_PAYMENT' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-dd-warning">
                          <CalendarClock className="size-3.5" />
                          Bayar sebelum {item.expiresAt.toLocaleString('id-ID')}
                        </span>
                      </>
                    )}
                  </small>
                  <span className="mt-3 block text-xs font-semibold text-dd-muted">
                    {urgency(item)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-4 sm:justify-end">
                  <strong className="text-lg text-dd-forest">
                    {formatRupiah(item.payableAmountRp)}
                  </strong>
                  <ArrowRight
                    className="size-4 text-dd-muted transition group-hover:translate-x-1 group-hover:text-dd-forest"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={cursorHistory.length + 1}
            totalPages={Math.ceil(effectiveTotal / ADMIN_PAGE_SIZE) || 1}
            totalItems={effectiveTotal}
            pageSize={ADMIN_PAGE_SIZE}
            hasPrevious={cursorHistory.length > 0}
            hasNext={Boolean(data.page.hasMore && data.page.nextCursor)}
            totalLabel={`${data.items.length.toLocaleString('id-ID')} dari ${effectiveTotal.toLocaleString('id-ID')} pesanan`}
            onPrevious={() => {
              const previous = cursorHistory.at(-1) ?? '';
              setCursorHistory((current) => current.slice(0, -1));
              updateFilters({ cursor: previous }, true);
            }}
            onNext={() => {
              if (!data.page.nextCursor) return;
              setCursorHistory((current) => [...current, cursor]);
              updateFilters({ cursor: data.page.nextCursor! }, true);
            }}
          />
        </>
      )}
    </main>
  );
}

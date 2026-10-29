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
} from '../order-client';
import { orderStatusLabels } from '../order-presenters';
import { Button, ButtonLink } from '../components/actions';
import { useTrackedRouter } from '../components/app-loading';
import { DateInput, SearchInput, SelectInput } from '../components/forms';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { Pagination } from '../components/admin/admin-ui';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
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
  { key: 'total', label: 'All', status: '' },
  { key: 'awaitingPayment', label: 'Not paid', status: 'AWAITING_PAYMENT' },
  { key: 'pending', label: 'Being checked', status: 'PENDING' },
  { key: 'actionRequired', label: 'Needs a fix', status: 'ACTION_REQUIRED' },
  { key: 'approved', label: 'Approved', status: 'APPROVED' },
  { key: 'rejected', label: 'Not approved', status: 'REJECTED' },
  { key: 'expired', label: 'Expired', status: 'EXPIRED' },
];

function tone(status: OrderStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'EXPIRED') return 'danger' as const;
  if (status === 'ACTION_REQUIRED') return 'warning' as const;
  return 'info' as const;
}

function urgency(order: CustomerOrder) {
  if (order.status === 'AWAITING_PAYMENT') return 'Continue payment';
  if (order.status === 'ACTION_REQUIRED') return 'Replace proof of payment';
  if (order.status === 'PENDING') return 'Waiting for our finance team';
  if (order.status === 'APPROVED') return 'Package activated';
  if (order.status === 'REJECTED') return 'See why';
  return 'This order has ended';
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
      .list({ status, q, from, until, cursor, limit: 20 })
      .then(setData)
      .catch((cause) => setError(orderError(cause)))
      .finally(() => setLoading(false));
  }, [cursor, from, q, status, until]);

  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ''}`;
  const summary = data?.summary ?? emptySummary;

  return (
    <main className="space-y-6">
      <PageHeader
        variant="customer"
        eyebrow="Orders"
        title="My orders"
        description="Payments, proof checks and package activation for each order."
        context={
          <ButtonLink href="/packages" leadingIcon={<PackagePlus className="size-4" />}>
            Buy a package
          </ButtonLink>
        }
      />

      <section aria-label="Orders by status" className="grid grid-cols-2 gap-3 lg:grid-cols-7">
        {summaryCards.map((card) => {
          const selected = status === card.status;
          return (
            <button
              type="button"
              key={card.key}
              aria-pressed={selected}
              onClick={() => updateFilters({ status: card.status })}
              className={`min-h-20 rounded-dd-lg border p-3 text-left transition ${
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
        className="grid gap-3 rounded-[22px] border border-dd-line bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_170px_170px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters({ q: draftQuery.trim() });
        }}
      >
        <SearchInput
          label="Search orders"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Package or club name"
          leadingIcon={<Search className="size-4" />}
        />
        <SelectInput
          label="Status"
          value={status}
          onChange={(event) => updateFilters({ status: event.target.value })}
        >
          <option value="">All statuses</option>
          {Object.entries(orderStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        <DateInput
          label="From"
          value={from}
          max={until || undefined}
          onChange={(event) => updateFilters({ from: event.target.value })}
        />
        <DateInput
          label="Until"
          value={until}
          min={from || undefined}
          onChange={(event) => updateFilters({ until: event.target.value })}
        />
        <div className="flex items-end gap-2">
          <Button type="submit">Search</Button>
          {(q || status || from || until || cursor) && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraftQuery('');
                router.replace(pathname, { scroll: false });
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton label="Loading orders" />
      ) : !data?.items.length ? (
        <EmptyState
          title={q || status || from || until ? 'No orders match' : 'No orders yet'}
          description={
            q || status || from || until
              ? 'Change or clear the filters to see other orders.'
              : 'Pick a package and place an order before you transfer any money.'
          }
        />
      ) : (
        <>
          <div className="grid gap-3">
            {data.items.map((item) => (
              <Link
                className="group grid gap-4 rounded-[22px] border border-dd-line bg-white p-5 text-dd-ink no-underline transition hover:-translate-y-0.5 hover:border-dd-forest/30 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                href={`/orders/${encodeURIComponent(item.id)}?returnTo=${encodeURIComponent(returnTo)}`}
                key={item.id}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-base">{item.packageName}</strong>
                    <StatusBadge tone={tone(item.status)}>
                      {orderStatusLabels[item.status]}
                    </StatusBadge>
                  </span>
                  <small className="mt-2 flex flex-wrap items-center gap-2 text-dd-muted">
                    <span>{item.branchName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.submittedAt.toLocaleDateString('en-GB')}</span>
                    {item.expiresAt && item.status === 'AWAITING_PAYMENT' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-dd-warning">
                          <CalendarClock className="size-3.5" />
                          Pay before {item.expiresAt.toLocaleString('en-GB')}
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
                    {rupiah.format(item.payableAmountRp)}
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
            hasPrevious={cursorHistory.length > 0}
            hasNext={Boolean(data.page.hasMore && data.page.nextCursor)}
            totalLabel={`Page ${cursorHistory.length + 1} · ${data.items.length} of ${summary.total} orders`}
            labels={{ navigation: 'Pages', previous: 'Previous', next: 'Next' }}
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

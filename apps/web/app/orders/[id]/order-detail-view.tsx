'use client';

import { ArrowLeft, CheckCircle2, Clock3, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerPaymentFlow } from '../../components/customer/customer-payment-flow';
import { AlertBanner } from '../../components/app-feedback';
import { ButtonLink } from '../../components/actions';
import { browserOrderClient, orderError, type CustomerOrder } from '../../order-client';
import { orderReasonLabels, orderTimelineLabels } from '../../order-presenters';
import { Skeleton, StatusBadge } from '../../ui';

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/orders') || value.startsWith('//')) return '/orders';
  try {
    const parsed = new URL(value, 'http://local');
    return parsed.origin === 'http://local' && parsed.pathname === '/orders'
      ? `${parsed.pathname}${parsed.search}`
      : '/orders';
  } catch {
    return '/orders';
  }
}

export function OrderDetailView({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrder(await browserOrderClient.detail(id));
    } catch (cause) {
      setError(orderError(cause));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => void load(), [id]);

  if (loading)
    return (
      <section className="rounded-[22px] border border-dd-line bg-white p-6">
        <Skeleton label="Loading order" />
      </section>
    );

  if (!order)
    return (
      <section className="rounded-[22px] border border-dd-line bg-white p-6">
        <h1 className="m-0 font-display text-3xl text-dd-forest">Order not available</h1>
        <p className="mt-2 text-sm text-dd-muted">
          It may no longer be available, or it belongs to another account.
        </p>
        {error && (
          <div className="mt-5">
            <AlertBanner tone="danger" title="The order did not load" message={error} />
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href={returnTo}>Back to orders</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact the club
          </ButtonLink>
        </div>
      </section>
    );

  const formatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(order.branchTimezone ? { timeZone: order.branchTimezone } : {}),
  });

  return (
    <main className="space-y-6" aria-labelledby="order-title">
      <header>
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All orders
        </Link>
        <p className="mt-4 mb-0 text-sm font-semibold text-dd-forest">
          Order •{order.id.slice(-8)}
        </p>
        <h1 id="order-title" className="mt-1 font-display text-3xl text-dd-forest sm:text-4xl">
          {order.packageName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Pay, upload your proof and follow the order on this page.
        </p>
      </header>

      <CustomerPaymentFlow
        order={order}
        onUpdated={(updated) => {
          setOrder(updated);
          void browserOrderClient.detail(id).then(setOrder);
        }}
      />

      {order.activation && (
        <section className="rounded-[22px] border border-dd-success/25 bg-dd-success-soft p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-dd-lg bg-white text-dd-success">
              <PackageCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="m-0 text-sm font-semibold text-dd-success">Package active</p>
              <h2 className="mt-1 mb-0 font-display text-xl text-dd-forest">{order.packageName}</h2>
              <p className="mt-2 text-sm text-dd-muted">
                {order.activation.sessionCount} sessions · active from{' '}
                {order.activation.activationDate.toLocaleDateString('en-GB')} · valid until{' '}
                {order.activation.expiryAt.toLocaleDateString('en-GB')}
              </p>
              <ButtonLink href="/account/packages" size="sm" className="mt-4">
                My packages
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 font-display text-xl text-dd-forest">Order history</h2>
          </div>
          <StatusBadge tone={order.timelineComplete ? 'success' : 'neutral'}>
            {order.timelineComplete ? 'Full history' : 'Partial history'}
          </StatusBadge>
        </div>
        {!order.timelineComplete && (
          <div className="mt-4">
            <AlertBanner
              tone="info"
              title="Older order"
              message="This history only shows steps we have records for. Missing steps are not filled in."
            />
          </div>
        )}
        {order.timeline?.items.length ? (
          <ol className="mt-6 space-y-0" aria-label="Order history">
            {order.timeline.items.map((item, index) => {
              const copy = orderTimelineLabels[item.type];
              const reason = item.reasonCode ? orderReasonLabels[item.reasonCode] : undefined;
              return (
                <li
                  key={item.id}
                  className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 pb-6"
                >
                  {index < order.timeline!.items.length - 1 && (
                    <span
                      className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-dd-line"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-[1] grid size-8 place-items-center rounded-full border border-dd-line bg-white text-dd-forest">
                    {item.type === 'PAYMENT_APPROVED' || item.type === 'PACKAGE_ACTIVATED' ? (
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    ) : (
                      <Clock3 className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <strong className="block text-sm">{copy.title}</strong>
                    <time
                      className="mt-1 block text-xs text-dd-muted"
                      dateTime={item.occurredAt.toISOString()}
                    >
                      {formatter.format(item.occurredAt)}
                    </time>
                    <p className="mt-2 text-sm leading-6 text-dd-muted">
                      {reason ?? copy.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-5 rounded-dd-lg bg-dd-surface-muted p-4 text-sm text-dd-muted">
            No history to show yet.
          </p>
        )}
      </section>
    </main>
  );
}

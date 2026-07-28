'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserOrderClient, orderError, type CustomerOrder } from '../order-client';
import { orderStatusLabels } from '../order-presenters';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
export function OrdersView() {
  const [items, setItems] = useState<CustomerOrder[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    browserOrderClient
      .list(status)
      .then(setItems)
      .catch((e) => setError(orderError(e)))
      .finally(() => setLoading(false));
  }, [status]);
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Member area"
        title="Pesanan Saya"
        description="Pantau transfer, pemeriksaan bukti, dan aktivasi paket dalam satu tempat."
        context={<Link href="/packages">Beli paket</Link>}
      />
      <label className="grid max-w-xs gap-2 text-sm font-semibold">
        Status
        <select
          className="rounded-dd-md border border-dd-line bg-white px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Semua</option>
          {Object.entries(orderStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pilih paket yang sesuai lalu buat pesanan sebelum melakukan transfer."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link
              className="flex flex-wrap items-center justify-between gap-4 rounded-dd-xl border border-dd-line bg-white p-5 text-dd-ink no-underline shadow-dd-card transition hover:-translate-y-0.5"
              href={
                ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(item.status)
                  ? `/checkout?order=${encodeURIComponent(item.id)}`
                  : `/orders/${item.id}`
              }
              key={item.id}
            >
              <span className="min-w-0">
                <strong className="block">{item.packageName}</strong>
                <small className="mt-1 block text-dd-muted">
                  {item.branchName} · {item.submittedAt.toLocaleDateString('id-ID')}
                </small>
              </span>
              <span className="grid justify-items-end gap-2">
                <strong className="text-dd-forest">{rupiah.format(item.payableAmountRp)}</strong>
                <StatusBadge
                  tone={
                    item.status === 'APPROVED'
                      ? 'success'
                      : item.status === 'REJECTED' || item.status === 'EXPIRED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {orderStatusLabels[item.status]}
                </StatusBadge>
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

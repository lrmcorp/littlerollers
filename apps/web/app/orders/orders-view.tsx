'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserOrderClient, orderError, type CustomerOrder } from '../order-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
const labels: Record<string, string> = {
  AWAITING_PAYMENT: 'Menunggu pembayaran',
  PENDING: 'Sedang diperiksa',
  ACTION_REQUIRED: 'Perlu diperbaiki',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  EXPIRED: 'Kedaluwarsa',
};
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
    <section className="card order-page">
      <PageHeader
        eyebrow="Member area"
        title="Pesanan Saya"
        description="Pantau transfer, pemeriksaan bukti, dan aktivasi paket dalam satu tempat."
        context={<Link href="/packages">Beli paket</Link>}
      />
      <label className="order-filter">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua</option>
          {Object.entries(labels).map(([value, label]) => (
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
        <div className="order-list">
          {items.map((item) => (
            <Link className="order-row" href={`/orders/${item.id}`} key={item.id}>
              <span>
                <strong>{item.packageName}</strong>
                <small>
                  {item.branchName} · {item.submittedAt.toLocaleDateString('id-ID')}
                </small>
              </span>
              <span>
                <strong>{rupiah.format(item.priceRp)}</strong>
                <StatusBadge
                  tone={
                    item.status === 'APPROVED'
                      ? 'success'
                      : item.status === 'REJECTED' || item.status === 'EXPIRED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {labels[item.status]}
                </StatusBadge>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

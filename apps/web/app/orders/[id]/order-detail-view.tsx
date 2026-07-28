'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomerPaymentFlow } from '../../components/customer/customer-payment-flow';
import { AlertBanner } from '../../components/app-feedback';
import { ButtonLink } from '../../components/actions';
import { browserOrderClient, orderError, type CustomerOrder } from '../../order-client';
import { Skeleton } from '../../ui';

export function OrderDetailView({ id }: { id: string }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    browserOrderClient
      .detail(id)
      .then(setOrder)
      .catch((cause) => setError(orderError(cause)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <Skeleton label="Memuat pesanan" />
      </section>
    );

  if (!order)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">Pesanan</p>
        <h1 className="mt-2 text-2xl font-semibold">Pesanan tidak tersedia</h1>
        <p className="mt-2 text-sm text-dd-muted">
          Pesanan mungkin sudah tidak dapat diakses atau bukan milik akun ini.
        </p>
        {error && (
          <div className="mt-5">
            <AlertBanner tone="danger" title="Pesanan belum dapat dimuat" message={error} />
          </div>
        )}
        <ButtonLink href="/orders" className="mt-5">
          Kembali ke pesanan
        </ButtonLink>
      </section>
    );

  return (
    <main className="space-y-6" aria-labelledby="order-title">
      <header>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
        >
          <ArrowLeft className="size-4" />
          Semua pesanan
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
          Pesanan •{order.id.slice(-8)}
        </p>
        <h1 id="order-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          {order.packageName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Pantau pembayaran, unggah bukti, dan lihat hasil pemeriksaan pada satu halaman.
        </p>
      </header>
      <CustomerPaymentFlow order={order} onUpdated={setOrder} />
    </main>
  );
}

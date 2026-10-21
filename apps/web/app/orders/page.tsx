import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrdersView } from './orders-view';

export const metadata: Metadata = {
  title: 'Pesanan Saya',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<p role="status">Memuat pesanan…</p>}>
      <OrdersView />
    </Suspense>
  );
}

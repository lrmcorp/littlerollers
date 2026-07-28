import { Suspense } from 'react';
import { OrdersView } from './orders-view';
export default function OrdersPage() {
  return (
    <Suspense fallback={<p role="status">Memuat pesanan…</p>}>
      <OrdersView />
    </Suspense>
  );
}

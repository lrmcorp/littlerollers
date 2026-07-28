import { Suspense } from 'react';
import { OrderDetailView } from './order-detail-view';
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status">Memuat detail pesanan…</p>}>
      <OrderDetailView id={(await params).id} />
    </Suspense>
  );
}

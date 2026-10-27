import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderDetailView } from './order-detail-view';

export const metadata: Metadata = {
  title: 'Detail Pesanan',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status">Memuat detail pesanan…</p>}>
      <OrderDetailView id={(await params).id} />
    </Suspense>
  );
}

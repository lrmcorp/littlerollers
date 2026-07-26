import { OrderDetailView } from './order-detail-view';
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <OrderDetailView id={(await params).id} />;
}

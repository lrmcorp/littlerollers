import { CustomerDetailView } from './customer-detail-view';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CustomerDetailView id={(await params).id} />;
}

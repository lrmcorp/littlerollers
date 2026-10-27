import type { Metadata } from 'next';
import { CustomerDetailView } from './customer-detail-view';

export const metadata: Metadata = {
  title: 'Detail Pelanggan',
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CustomerDetailView id={(await params).id} />;
}

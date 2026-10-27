import type { Metadata } from 'next';
import { CustomerSessionDetailView } from './customer-session-detail-view';

export const metadata: Metadata = {
  title: 'Detail Sesi Pelanggan',
};

export default async function CustomerSessionDetailPage({
  params,
}: {
  params: Promise<{ customerPackageId: string }>;
}) {
  return <CustomerSessionDetailView id={(await params).customerPackageId} />;
}

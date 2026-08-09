import { CustomerSessionDetailView } from './customer-session-detail-view';

export default async function CustomerSessionDetailPage({
  params,
}: {
  params: Promise<{ customerPackageId: string }>;
}) {
  return <CustomerSessionDetailView id={(await params).customerPackageId} />;
}

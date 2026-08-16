import { SupportCaseDetailView } from './support-case-detail-view';

export default async function SupportCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SupportCaseDetailView id={(await params).id} />;
}

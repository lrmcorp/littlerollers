import { SessionAdjustmentDetailView } from './session-adjustment-detail-view';

export default async function SessionAdjustmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SessionAdjustmentDetailView id={(await params).id} />;
}

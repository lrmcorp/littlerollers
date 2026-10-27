import type { Metadata } from 'next';
import { SessionAdjustmentDetailView } from './session-adjustment-detail-view';

export const metadata: Metadata = {
  title: 'Detail Penyesuaian Sesi',
};

export default async function SessionAdjustmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SessionAdjustmentDetailView id={(await params).id} />;
}

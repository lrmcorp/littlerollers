import type { Metadata } from 'next';
import { BranchDetailView } from '../../../branches/branch-detail-view';

export const metadata: Metadata = {
  title: 'Detail Cabang',
};

export default async function WorkspaceBranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchDetailView id={id} />;
}

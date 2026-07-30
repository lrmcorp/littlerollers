import { BranchDetailView } from '../../../branches/branch-detail-view';

export default async function WorkspaceBranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchDetailView id={id} />;
}

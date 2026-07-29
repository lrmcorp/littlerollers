import { PackagePromotionDetailView } from '../../../package-promotions/package-promotion-detail-view';

export default async function WorkspacePackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PackagePromotionDetailView id={id} />;
}

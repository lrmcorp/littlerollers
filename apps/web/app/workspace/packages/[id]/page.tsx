import type { Metadata } from 'next';
import { PackagePromotionDetailView } from '../../../package-promotions/package-promotion-detail-view';

export const metadata: Metadata = {
  title: 'Detail Paket',
};

export default async function WorkspacePackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PackagePromotionDetailView id={id} />;
}

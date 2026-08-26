import type { Metadata } from 'next';
import { PackageDetailView } from './package-detail-view';
import { publicMetadataValue } from '@/lib/public-detail-metadata';
import type { PublicPackageDetail } from '@/api-clients/public-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await publicMetadataValue<PublicPackageDetail>(
    `/public/package-catalog/${encodeURIComponent(id)}`,
  );
  const title = item ? `${item.name} · ${item.branch.name}` : 'Detail Paket';
  const description = item?.publicProfile.summary ?? 'Detail paket Pilates aktif Daily Dose.';
  return {
    title,
    description,
    alternates: { canonical: `/packages/${id}` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialData = await publicMetadataValue<PublicPackageDetail>(
    `/public/package-catalog/${encodeURIComponent(id)}`,
  );
  return <PackageDetailView id={id} initialData={initialData} />;
}

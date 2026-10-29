import type { Metadata } from 'next';
import { StudioDetailView } from './studio-detail-view';
import { publicMetadataValue } from '../../public-detail-metadata';
import type { PublicStudioDetail } from '../../public-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await publicMetadataValue<PublicStudioDetail>(
    `/public/studios/${encodeURIComponent(slug)}`,
  );
  const title = item?.name ?? 'Club details';
  const description =
    item?.publicProfile.description ??
    'Address, arrival tips, classes, packages and timetable for this Little Rollers club.';
  return {
    title,
    description,
    alternates: { canonical: `/locations/${slug}` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function StudioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const initialData = await publicMetadataValue<PublicStudioDetail>(
    `/public/studios/${encodeURIComponent(slug)}`,
  );
  return <StudioDetailView slug={slug} initialData={initialData} />;
}

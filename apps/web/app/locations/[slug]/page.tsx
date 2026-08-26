import type { Metadata } from 'next';
import { StudioDetailView } from './studio-detail-view';
import { publicMetadataValue } from '@/lib/public-detail-metadata';
import type { PublicStudioDetail } from '@/api-clients/public-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await publicMetadataValue<PublicStudioDetail>(
    `/public/studios/${encodeURIComponent(slug)}`,
  );
  const title = item?.name ?? 'Detail Studio';
  const description =
    item?.publicProfile.description ??
    'Alamat, fasilitas, kelas, paket, dan jadwal studio Daily Dose.';
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

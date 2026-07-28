import type { Metadata } from 'next';
import { ClassDetailView } from './class-detail-view';
import { publicMetadataValue } from '../../public-detail-metadata';
import type { PublicClassDetail } from '../../public-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await publicMetadataValue<PublicClassDetail>(
    `/public/class-types/${encodeURIComponent(slug)}`,
  );
  const title = item
    ? `${item.profile.code === 'BARRE' ? 'Barre' : item.profile.code === 'MAT' ? 'Mat Pilates' : 'Reformer Pilates'} · Daily Dose`
    : 'Detail Kelas';
  const description =
    item?.profile.summary ?? 'Manfaat, perlengkapan, paket, dan jadwal kelas Daily Dose.';
  return {
    title,
    description,
    alternates: { canonical: `/classes/${slug}` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function ClassDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const initialData = await publicMetadataValue<PublicClassDetail>(
    `/public/class-types/${encodeURIComponent(slug)}`,
  );
  return <ClassDetailView slug={slug} initialData={initialData} />;
}

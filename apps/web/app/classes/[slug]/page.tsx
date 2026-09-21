import type { Metadata } from 'next';
import { ClassDetailView } from './class-detail-view';
import { publicMetadataValue } from '@/lib/public-detail-metadata';
import type { PublicClassDetail } from '@/api-clients/public-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await publicMetadataValue<PublicClassDetail>(
    `/public/class-types/${encodeURIComponent(slug)}`,
  );
  const titleName = item
    ? item.profile.code === 'GROUP_CLASS'
      ? 'Group Class'
      : item.profile.code === 'PRIVATE_CLASS'
        ? 'Private Class'
        : item.profile.code === 'SEMI_PRIVATE'
          ? 'Semi Private Class'
          : item.profile.code === 'PRIVATE_GROUP'
            ? 'Private Group'
            : item.profile.slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
    : 'Detail Kelas';
  const title = `${titleName} · Daily Dose`;
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

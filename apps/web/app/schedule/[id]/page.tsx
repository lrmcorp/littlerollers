import type { Metadata } from 'next';
import { ScheduleDetailView } from './schedule-detail-view';
import { publicMetadataValue } from '../../public-detail-metadata';
import type { PublicScheduleDetail } from '../../public-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await publicMetadataValue<PublicScheduleDetail>(
    `/public/class-catalog/${encodeURIComponent(id)}`,
    true,
  );
  const title = item ? `${item.classType.name} · ${item.branch.name}` : 'Session details';
  const description = item
    ? `Time and places left for ${item.classType.name} at ${item.branch.name}.`
    : 'Time, club and places left for a Little Rollers session.';
  return {
    title,
    description,
    alternates: { canonical: `/schedule/${id}` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialData = await publicMetadataValue<PublicScheduleDetail>(
    `/public/class-catalog/${encodeURIComponent(id)}`,
    true,
  );
  return <ScheduleDetailView id={id} initialData={initialData} />;
}

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
  const title = item ? `${item.classType.name} · ${item.branch.name}` : 'Detail Jadwal';
  const description = item
    ? `Jadwal dan ketersediaan ${item.classType.name} di ${item.branch.name}.`
    : 'Waktu, studio, dan ketersediaan kelas Daily Dose.';
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

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScheduleDetailView } from './schedule-detail-view';
import { publicMetadataValue } from '@/lib/public-detail-metadata';
import type { PublicScheduleDetail } from '@/api-clients/public-detail-client';

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
  if (!item) {
    return {
      title: 'Jadwal Tidak Ditemukan · Daily Dose',
    };
  }
  const title = `${item.classType.name} · ${item.branch.name}`;
  const description = `Jadwal dan ketersediaan ${item.classType.name} di ${item.branch.name}.`;
  return {
    title: `${title} · Daily Dose`,
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
  if (!initialData) {
    notFound();
  }
  return <ScheduleDetailView id={id} initialData={initialData} />;
}

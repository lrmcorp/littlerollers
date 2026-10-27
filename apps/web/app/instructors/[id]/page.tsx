import type { Metadata } from 'next';
import { InstructorDetailView } from './instructor-detail-view';

export const metadata: Metadata = {
  title: 'Detail Instruktur',
};
export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InstructorDetailView id={(await params).id} />;
}

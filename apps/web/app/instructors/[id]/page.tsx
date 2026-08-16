import { InstructorDetailView } from './instructor-detail-view';
export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InstructorDetailView id={(await params).id} />;
}

import { UserDetailView } from './user-detail-view';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <UserDetailView id={(await params).id} />;
}

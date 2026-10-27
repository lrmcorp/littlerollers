import type { Metadata } from 'next';
import { UserDetailView } from './user-detail-view';

export const metadata: Metadata = {
  title: 'Detail Pengguna',
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <UserDetailView id={(await params).id} />;
}

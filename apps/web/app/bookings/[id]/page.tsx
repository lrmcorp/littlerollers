import { BookingDetailView } from './booking-detail-view';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <BookingDetailView id={(await params).id} />;
}

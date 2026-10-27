import type { Metadata } from 'next';
import { BookingDetailView } from './booking-detail-view';

export const metadata: Metadata = {
  title: 'Detail Booking',
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <BookingDetailView id={(await params).id} />;
}

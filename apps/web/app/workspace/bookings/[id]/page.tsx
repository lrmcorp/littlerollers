import type { Metadata } from 'next';
import { StaffBookingDetailView } from './staff-booking-detail-view';

export const metadata: Metadata = {
  title: 'Detail Booking',
};

export default async function StaffBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StaffBookingDetailView id={(await params).id} />;
}

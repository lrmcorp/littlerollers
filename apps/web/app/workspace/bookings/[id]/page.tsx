import { StaffBookingDetailView } from './staff-booking-detail-view';

export default async function StaffBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StaffBookingDetailView id={(await params).id} />;
}

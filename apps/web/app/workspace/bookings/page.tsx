import type { Metadata } from 'next';
import { WorkspaceBookingsPageView } from './workspace-bookings-page-view';

export const metadata: Metadata = {
  title: 'Manajemen Booking',
};

export default function WorkspaceBookingsPage() {
  return <WorkspaceBookingsPageView />;
}

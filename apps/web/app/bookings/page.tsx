import type { Metadata } from 'next';
import { BookingsPageView } from './bookings-page-view';

export const metadata: Metadata = {
  title: 'Booking Saya',
};

export default function BookingsPage() {
  return <BookingsPageView />;
}

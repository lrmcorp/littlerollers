import type { Metadata } from 'next';
import { CustomerBookingFlow } from './customer-booking-flow';

export const metadata: Metadata = {
  title: 'Booking Kelas',
};

export default function NewBookingPage() {
  return <CustomerBookingFlow />;
}

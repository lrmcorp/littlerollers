'use client';

import { useSessionContext } from '../session-context';
import { BookingView } from './booking-view';
import { CustomerBookingsView } from './customer-bookings-view';

export function BookingsPageView() {
  const session = useSessionContext()?.session;
  const customerOnly =
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER');
  return customerOnly ? <CustomerBookingsView /> : <BookingView />;
}

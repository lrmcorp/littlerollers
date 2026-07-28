'use client';

import { useEffect } from 'react';
import { useTrackedRouter } from '../components/app-loading';
import { useSessionContext } from '../session-context';
import { CustomerBookingsView } from './customer-bookings-view';
import { Skeleton } from '../ui';

export function BookingsPageView() {
  const context = useSessionContext();
  const router = useTrackedRouter();
  const session = context?.session;
  const customerOnly =
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER');
  useEffect(() => {
    if (context?.status === 'authenticated' && session && !customerOnly)
      router.replace('/workspace/bookings');
  }, [context?.status, customerOnly, router, session]);
  if (!customerOnly) return <Skeleton label="Membuka manajemen booking" />;
  return <CustomerBookingsView />;
}

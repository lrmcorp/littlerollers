'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingView } from '../../bookings/booking-view';
import { useTrackedRouter } from '../../components/app-loading';
import { useSessionContext } from '../../session-context';
import { Skeleton } from '../../ui';

export function WorkspaceBookingsPageView() {
  const context = useSessionContext();
  const router = useTrackedRouter();
  const params = useSearchParams();
  const session = context?.session;
  const customerOnly = Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );

  useEffect(() => {
    if (context?.status === 'authenticated' && customerOnly) router.replace('/bookings');
  }, [context?.status, customerOnly, router]);

  useEffect(() => {
    const requestedBranch = params.get('branch');
    if (
      requestedBranch &&
      context?.session?.branches.some((branch) => branch.id === requestedBranch) &&
      context.activeBranchId !== requestedBranch
    ) {
      context.setActiveBranchId(requestedBranch);
    }
  }, [context, params]);

  useEffect(() => {
    if (context?.status !== 'authenticated') return;
    const current = params.get('branch') ?? '';
    if (current === context.activeBranchId) return;
    const query = new URLSearchParams(params.toString());
    if (context.activeBranchId) query.set('branch', context.activeBranchId);
    else query.delete('branch');
    router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
      scroll: false,
    });
  }, [context?.activeBranchId, context?.status, params, router]);

  if (customerOnly) return <Skeleton label="Membuka booking Anda" />;
  const requestedTab = params.get('tab');
  const tab =
    requestedTab === 'reschedules' || requestedTab === 'attendance' ? requestedTab : 'bookings';
  return (
    <BookingView
      initialTab={tab}
      initialFilters={{
        q: params.get('q') ?? '',
        status: params.get('status') ?? '',
        from: params.get('from') ?? '',
        until: params.get('until') ?? '',
        classSlotId: params.get('classSlotId') ?? '',
        rosterStatus: params.get('rosterStatus') ?? '',
      }}
      initialCursor={params.get('cursor') ?? undefined}
      initialRescheduleCursor={params.get('rescheduleCursor') ?? undefined}
      onTabChange={(next) => {
        const query = new URLSearchParams(params.toString());
        if (next === 'bookings') query.delete('tab');
        else query.set('tab', next);
        if (next !== 'bookings') query.delete('cursor');
        if (next !== 'reschedules') query.delete('rescheduleCursor');
        router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      }}
      onFiltersChange={(filters) => {
        const query = new URLSearchParams(params.toString());
        for (const [key, value] of Object.entries(filters)) {
          if (value) query.set(key, value);
          else query.delete(key);
        }
        query.delete('cursor');
        query.delete('rescheduleCursor');
        router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      }}
      onCursorChange={(cursor) => {
        const query = new URLSearchParams(params.toString());
        if (cursor) query.set('cursor', cursor);
        else query.delete('cursor');
        router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      }}
      onRescheduleCursorChange={(cursor) => {
        const query = new URLSearchParams(params.toString());
        if (cursor) query.set('rescheduleCursor', cursor);
        else query.delete('rescheduleCursor');
        router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      }}
    />
  );
}

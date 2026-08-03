'use client';

import { useEffect, useRef } from 'react';
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
  const branchSync = useRef({
    initialized: false,
    sessionId: '',
    params: '',
    activeBranchId: '',
  });
  const paramsKey = params.toString();

  useEffect(() => {
    if (context?.status === 'authenticated' && customerOnly) router.replace('/bookings');
  }, [context?.status, customerOnly, router]);

  useEffect(() => {
    if (context?.status !== 'authenticated' || !context.session) return;
    const current = params.get('branch') ?? '';
    const valid = !current || context.session.branches.some((branch) => branch.id === current);
    const requestedBranch = valid ? current : '';
    const previous = branchSync.current;

    if (!previous.initialized || previous.sessionId !== context.session.id) {
      branchSync.current = {
        initialized: true,
        sessionId: context.session.id,
        params: paramsKey,
        activeBranchId: context.activeBranchId,
      };
      if (current && !valid) {
        context.setActiveBranchId('');
        const query = new URLSearchParams(paramsKey);
        query.delete('branch');
        query.delete('cursor');
        query.delete('rescheduleCursor');
        router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      } else if (current && context.activeBranchId !== current) {
        context.setActiveBranchId(current);
      } else if (!current && context.activeBranchId) {
        const query = new URLSearchParams(paramsKey);
        query.set('branch', context.activeBranchId);
        query.delete('cursor');
        query.delete('rescheduleCursor');
        router.replace(`/workspace/bookings?${query.toString()}`, { scroll: false });
      }
      return;
    }

    const paramsChanged = previous.params !== paramsKey;
    const activeBranchChanged = previous.activeBranchId !== context.activeBranchId;
    branchSync.current = {
      initialized: true,
      sessionId: context.session.id,
      params: paramsKey,
      activeBranchId: context.activeBranchId,
    };

    // A topbar change is authoritative. Direct URL and Back/Forward changes are
    // authoritative only when the topbar value did not change in the same render.
    if (!activeBranchChanged && paramsChanged) {
      if (!valid) {
        context.setActiveBranchId('');
        const query = new URLSearchParams(paramsKey);
        query.delete('branch');
        query.delete('cursor');
        query.delete('rescheduleCursor');
        router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      } else if (requestedBranch !== context.activeBranchId) {
        context.setActiveBranchId(requestedBranch);
      }
      return;
    }

    if (!activeBranchChanged || (valid && requestedBranch === context.activeBranchId)) return;
    const query = new URLSearchParams(params.toString());
    if (context.activeBranchId) query.set('branch', context.activeBranchId);
    else query.delete('branch');
    query.delete('cursor');
    query.delete('rescheduleCursor');
    router.replace(`/workspace/bookings${query.size ? `?${query.toString()}` : ''}`, {
      scroll: false,
    });
  }, [context, params, paramsKey, router]);

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

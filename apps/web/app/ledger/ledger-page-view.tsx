'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTrackedRouter } from '../components/app-loading';
import { LedgerView } from './ledger-view';
import { Skeleton } from '../ui';

export function LedgerPageView() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const tab = params.get('tab') === 'adjustments' ? 'adjustments' : 'balances';
  useEffect(() => {
    if (tab !== 'adjustments') return;
    const query = new URLSearchParams(params.toString());
    query.delete('tab');
    router.replace(`/ledger/adjustments${query.size ? `?${query.toString()}` : ''}`);
  }, [params, router, tab]);
  if (tab === 'adjustments') return <Skeleton label="Membuka Penyesuaian Sesi" />;
  return (
    <LedgerView
      initialWorkspaceTab={tab}
      customerUserId={params.get('customerUserId') ?? undefined}
      initialSearch={params.get('q') ?? ''}
      initialCursor={params.get('cursor') ?? ''}
      initialStatus={
        ['ACTIVE', 'EXPIRED', 'INACTIVE'].includes(params.get('status') ?? '')
          ? (params.get('status') as 'ACTIVE' | 'EXPIRED' | 'INACTIVE')
          : ''
      }
      onBalanceFiltersChange={(search, status) => {
        const query = new URLSearchParams(params.toString());
        if (search) query.set('q', search);
        else query.delete('q');
        if (status) query.set('status', status);
        else query.delete('status');
        query.delete('cursor');
        router.replace(`/ledger${query.size ? `?${query.toString()}` : ''}`, { scroll: false });
      }}
      onBalancePageChange={(cursor) => {
        const query = new URLSearchParams(params.toString());
        if (cursor) query.set('cursor', cursor);
        else query.delete('cursor');
        router.replace(`/ledger${query.size ? `?${query.toString()}` : ''}`, { scroll: false });
      }}
      onWorkspaceTabChange={(next) => {
        const query = new URLSearchParams(params.toString());
        if (next === 'adjustments') query.set('tab', 'adjustments');
        else {
          query.delete('tab');
          query.delete('status');
        }
        router.replace(`/ledger${query.size ? `?${query.toString()}` : ''}`, { scroll: false });
      }}
    />
  );
}

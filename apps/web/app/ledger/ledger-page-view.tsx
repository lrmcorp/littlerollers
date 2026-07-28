'use client';

import { useSearchParams } from 'next/navigation';
import { useTrackedRouter } from '../components/app-loading';
import { LedgerView } from './ledger-view';

export function LedgerPageView() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const tab = params.get('tab') === 'adjustments' ? 'adjustments' : 'balances';
  return (
    <LedgerView
      initialWorkspaceTab={tab}
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

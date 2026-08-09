'use client';

import { useSearchParams } from 'next/navigation';
import { useTrackedRouter } from '../../components/app-loading';
import { LedgerView } from '../ledger-view';

export function SessionAdjustmentsPageView() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const initialMode = params.get('status') === 'HISTORY' ? 'HISTORY' : 'PENDING';
  const replaceFilters = (updates: Record<string, string>) => {
    const query = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    router.replace(`/ledger/adjustments${query.size ? `?${query.toString()}` : ''}`, {
      scroll: false,
    });
  };
  return (
    <LedgerView
      initialWorkspaceTab="adjustments"
      initialAdjustmentMode={initialMode}
      adjustmentsOnly
      customerUserId={params.get('customerUserId') ?? undefined}
      initialAdjustmentSearch={params.get('q') ?? ''}
      initialAdjustmentFrom={params.get('from') ?? ''}
      initialAdjustmentUntil={params.get('until') ?? ''}
      initialAdjustmentCursor={params.get('cursor') ?? ''}
      onAdjustmentModeChange={(mode) => {
        const query = new URLSearchParams(params.toString());
        query.set('status', mode);
        query.delete('cursor');
        router.replace(`/ledger/adjustments?${query.toString()}`, { scroll: false });
      }}
      onAdjustmentFiltersChange={(filters) => replaceFilters(filters)}
    />
  );
}

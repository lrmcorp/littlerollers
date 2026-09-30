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
      initialAdjustmentPage={params.get('page') ? Math.max(1, Number(params.get('page'))) : 1}
      onAdjustmentModeChange={(mode) => {
        const query = new URLSearchParams(params.toString());
        query.set('status', mode);
        query.delete('cursor');
        query.delete('page');
        router.replace(`/ledger/adjustments?${query.toString()}`, { scroll: false });
      }}
      onAdjustmentFiltersChange={(filters) => {
        const updates: Record<string, string> = {
          q: filters.q,
          from: filters.from,
          until: filters.until,
          cursor: filters.cursor,
        };
        if (filters.page && filters.page > 1) {
          updates.page = String(filters.page);
        } else {
          updates.page = '';
        }
        replaceFilters(updates);
      }}
      onAdjustmentPageNumberChange={(page) => {
        const query = new URLSearchParams(params.toString());
        if (page > 1) query.set('page', String(page));
        else query.delete('page');
        query.delete('cursor');
        router.replace(`/ledger/adjustments${query.size ? `?${query.toString()}` : ''}`, {
          scroll: false,
        });
      }}
    />
  );
}

'use client';

import { useEffect, useState } from 'react';
import { browserDashboardClient } from '@/api-clients/dashboard-client';
import { useSessionContext } from '../session-context';

export type QueueCounts = Record<string, number>;

/**
 * Jumlah antrean kerja staf (pembayaran, reschedule, penyesuaian sesi, …) untuk badge navigasi.
 * Dipakai sekali di shell dan diteruskan ke sidebar serta bottom-nav mobile agar tidak ada
 * dua permintaan dashboard untuk data yang sama.
 */
export function useQueueCounts(enabled: boolean): QueueCounts {
  const context = useSessionContext();
  const session = context?.session;
  const activeBranchId = context?.activeBranchId;
  const [counts, setCounts] = useState<QueueCounts>({});

  useEffect(() => {
    if (!enabled || !session) return;
    let active = true;
    browserDashboardClient
      .overview({ branchId: activeBranchId || undefined })
      .then((overview) => {
        if (active)
          setCounts(Object.fromEntries(overview.queues.map((item) => [item.key, item.count])));
      })
      .catch(() => {
        if (active) setCounts({});
      });
    return () => {
      active = false;
    };
  }, [activeBranchId, enabled, session]);

  return enabled ? counts : {};
}

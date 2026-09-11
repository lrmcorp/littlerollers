'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { MasterView } from './master-view';
import type { MasterTab } from './master-view';
import { useTrackedRouter } from '../components/app-loading';
import { useSessionContext } from '../session-context';

const MASTER_TABS: MasterTab[] = [
  'classTypes',
  'venues',
  'projection',
  'capacity',
  'fees',
  'accounts',
  'publicProfiles',
  'branches',
  'packages',
];

export default function MasterPage() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const session = useSessionContext();
  const setActiveBranchId = session?.setActiveBranchId;
  const requestedTab = params.get('tab') as MasterTab | null;
  const requestedBranch = params.get('branch');
  const activeTab =
    requestedTab && MASTER_TABS.includes(requestedTab) ? requestedTab : 'classTypes';
  useEffect(() => {
    if (requestedBranch) setActiveBranchId?.(requestedBranch);
  }, [requestedBranch, setActiveBranchId]);
  const setActiveTab = (tab: MasterTab) => {
    const next = new URLSearchParams(params.toString());
    if (tab === 'classTypes') next.delete('tab');
    else next.set('tab', tab);
    router.replace(`/master${next.size ? `?${next}` : ''}`);
  };
  return (
    <>
      <MasterView activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

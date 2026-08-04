'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { MasterView } from './master-view';
import type { MasterTab } from './master-view';
import { PaymentAccountsView } from './payment-accounts-view';
import { useTrackedRouter } from '../components/app-loading';
import { useSessionContext } from '../session-context';
import { ButtonLink } from '../components/actions';

const MASTER_TABS: MasterTab[] = [
  'branches',
  'classTypes',
  'venues',
  'packages',
  'projection',
  'capacity',
  'fees',
  'accounts',
  'publicProfiles',
];

export default function MasterPage() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const session = useSessionContext();
  const setActiveBranchId = session?.setActiveBranchId;
  const requestedTab = params.get('tab') as MasterTab | null;
  const requestedBranch = params.get('branch');
  const activeTab = requestedTab && MASTER_TABS.includes(requestedTab) ? requestedTab : 'branches';
  useEffect(() => {
    if (requestedBranch) setActiveBranchId?.(requestedBranch);
  }, [requestedBranch, setActiveBranchId]);
  const setActiveTab = (tab: MasterTab) => {
    const next = new URLSearchParams(params.toString());
    if (tab === 'branches') next.delete('tab');
    else next.set('tab', tab);
    router.replace(`/master${next.size ? `?${next}` : ''}`);
  };
  return (
    <>
      <MasterView activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'packages' && (
        <section className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
          <h2>Paket aktif dan historis</h2>
          <p className="text-dd-muted">
            Pengelolaan paket memiliki workspace tersendiri agar harga, masa aktif, dan histori
            tetap mudah diaudit.
          </p>
          <ButtonLink className="mt-4 w-fit" href="/workspace/packages">
            Buka workspace Paket
          </ButtonLink>
        </section>
      )}
      {activeTab === 'accounts' && <PaymentAccountsView />}
    </>
  );
}

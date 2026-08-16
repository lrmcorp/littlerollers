'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { MasterView, type MasterTab } from '../../../master/master-view';
import { PaymentAccountsView } from '../../../master/payment-accounts-view';
import { useSessionContext } from '../../../session-context';

export function BranchOwnedMasterView({
  branchId,
  tab,
}: {
  branchId: string;
  tab: Extract<MasterTab, 'venues' | 'accounts' | 'publicProfiles'>;
}) {
  const session = useSessionContext();
  useEffect(() => session?.setActiveBranchId(branchId), [branchId, session]);
  return (
    <section className="space-y-5">
      <Link href={`/workspace/branches/${branchId}`} className="font-semibold text-dd-forest">
        ← Kembali ke Studio/Cabang
      </Link>
      <MasterView activeTab={tab} visibleTabs={[tab]} />
      {tab === 'accounts' && <PaymentAccountsView />}
    </section>
  );
}

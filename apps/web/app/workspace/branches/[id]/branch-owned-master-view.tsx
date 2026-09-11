'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { MasterView, type MasterTab } from '../../../master/master-view';
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
      <Link href={`/workspace/branches/${branchId}`} className="inline-flex items-center gap-1.5 font-semibold text-dd-forest hover:underline">
        <ArrowLeft className="size-4" />
        <span>Kembali ke Studio/Cabang</span>
      </Link>
      <MasterView activeTab={tab} visibleTabs={[tab]} />
    </section>
  );
}

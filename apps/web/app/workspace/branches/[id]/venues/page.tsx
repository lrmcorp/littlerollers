import { BranchOwnedMasterView } from '../branch-owned-master-view';
export default async function BranchVenuesPage({ params }: { params: Promise<{ id: string }> }) {
  return <BranchOwnedMasterView branchId={(await params).id} tab="venues" />;
}

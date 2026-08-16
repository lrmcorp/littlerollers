import { BranchOwnedMasterView } from '../branch-owned-master-view';
export default async function BranchPaymentAccountsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BranchOwnedMasterView branchId={(await params).id} tab="accounts" />;
}

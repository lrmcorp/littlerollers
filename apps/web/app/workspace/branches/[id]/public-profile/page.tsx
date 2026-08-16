import { BranchOwnedMasterView } from '../branch-owned-master-view';
export default async function BranchPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BranchOwnedMasterView branchId={(await params).id} tab="publicProfiles" />;
}

import { redirect } from 'next/navigation';

export default async function BranchPaymentAccountsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/workspace/branches/${id}`);
}

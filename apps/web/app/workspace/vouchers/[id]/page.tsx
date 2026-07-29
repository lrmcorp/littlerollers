import { VoucherDetailView } from '../../../vouchers/voucher-detail-view';

export default async function VoucherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VoucherDetailView id={id} />;
}

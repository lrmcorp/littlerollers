import type { Metadata } from 'next';
import { VoucherDetailView } from '../../../vouchers/voucher-detail-view';

export const metadata: Metadata = {
  title: 'Detail Voucher',
};

export default async function VoucherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VoucherDetailView id={id} />;
}

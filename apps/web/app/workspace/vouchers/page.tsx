import type { Metadata } from 'next';
import { VouchersView } from '../../vouchers/vouchers-view';

export const metadata: Metadata = {
  title: 'Voucher & Promo',
};

export default function WorkspaceVouchersPage() {
  return <VouchersView />;
}

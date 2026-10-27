import type { Metadata } from 'next';
import { PurchaseReviewView } from '../../purchases/purchase-review-view';

export const metadata: Metadata = {
  title: 'Antrean Pembayaran',
};
export default function PaymentReviewPage() {
  return <PurchaseReviewView />;
}

import type { Metadata } from 'next';
import { IdentityReviewView } from './review-view';

export const metadata: Metadata = {
  title: 'Verifikasi Pelanggan',
};

export default function IdentityVerificationsPage() {
  return <IdentityReviewView />;
}

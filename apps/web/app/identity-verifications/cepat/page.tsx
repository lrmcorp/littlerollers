import type { Metadata } from 'next';
import { FastReviewView } from '../fast-review-view';

export const metadata: Metadata = {
  title: 'Verifikasi Cepat',
};

export default function FastIdentityReviewPage() {
  return <FastReviewView />;
}

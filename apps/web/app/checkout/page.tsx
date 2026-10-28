import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutView } from './checkout-view';

export const metadata: Metadata = {
  title: 'Checkout Pesanan',
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-xl space-y-3 rounded-dd-lg border border-dd-line bg-dd-surface p-6">
          Menyiapkan checkout…
        </div>
      }
    >
      <CheckoutView />
    </Suspense>
  );
}

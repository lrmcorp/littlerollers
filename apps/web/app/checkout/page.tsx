import { Suspense } from 'react';
import { CheckoutView } from './checkout-view';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="card">Menyiapkan checkout…</div>}>
      <CheckoutView />
    </Suspense>
  );
}

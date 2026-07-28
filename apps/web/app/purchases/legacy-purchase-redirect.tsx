'use client';
import { useEffect } from 'react';
import { useSessionContext } from '../session-context';
import { useTrackedRouter } from '../components/app-loading';
export function LegacyPurchaseRedirect() {
  const context = useSessionContext();
  const router = useTrackedRouter();
  useEffect(() => {
    if (context?.status !== 'authenticated') return;
    router.replace(
      context.hasCapability('payment:review', 'purchase:review')
        ? '/workspace/payments'
        : '/orders',
    );
  }, [context, router]);
  return (
    <section className="card" role="status">
      Mengarahkan ke halaman pesanan…
    </section>
  );
}

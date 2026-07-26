'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '../session-context';
export function LegacyPurchaseRedirect() {
  const context = useSessionContext();
  const router = useRouter();
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

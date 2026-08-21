'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSessionContext } from '../../session-context';

export interface CustomerBadgeMetrics {
  actionableOrdersCount: number;
  upcomingBookingsCount: number;
  verificationActionRequired: boolean;
  expiringPackagesCount: number;
}

const emptyMetrics: CustomerBadgeMetrics = {
  actionableOrdersCount: 0,
  upcomingBookingsCount: 0,
  verificationActionRequired: false,
  expiringPackagesCount: 0,
};

export function useCustomerBadges(): CustomerBadgeMetrics {
  const context = useSessionContext();
  const session = context?.session;
  const isCustomer = session?.roles.includes('CUSTOMER');
  const [metrics, setMetrics] = useState<CustomerBadgeMetrics>(emptyMetrics);

  const fetchMetrics = useCallback(async () => {
    if (!isCustomer) return;
    try {
      const response = await fetch('/api/v1/me/dashboard', { credentials: 'include' });
      if (!response.ok) return;
      const data = await response.json();
      const now = Date.now();
      const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

      const actionableOrders = (data.actionableOrders ?? []).filter(
        (order: { status: string }) =>
          order.status === 'AWAITING_PAYMENT' || order.status === 'ACTION_REQUIRED',
      );

      const expiringPackages = (data.packages ?? []).filter(
        (pkg: { available?: number; expiryAt: string }) => {
          const expiryTime = new Date(pkg.expiryAt).getTime();
          return (
            (pkg.available !== undefined && pkg.available <= 1) ||
            (expiryTime > now && expiryTime <= sevenDaysFromNow)
          );
        },
      );

      const verificationActionRequired =
        data.verification?.status === 'ACTION_REQUIRED' ||
        (data.documents ?? []).some(
          (doc: { status: string }) =>
            doc.status === 'ACTION_REQUIRED' || doc.status === 'REJECTED',
        );

      setMetrics({
        actionableOrdersCount: actionableOrders.length,
        upcomingBookingsCount: (data.upcomingBookings ?? []).length,
        verificationActionRequired,
        expiringPackagesCount: expiringPackages.length,
      });
    } catch {
      // Graceful fallback to empty metrics
    }
  }, [isCustomer]);

  useEffect(() => {
    if (!isCustomer) return;
    void fetchMetrics();
    const interval = window.setInterval(() => void fetchMetrics(), 60_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void fetchMetrics();
    };
    window.addEventListener('focus', onVisibilityChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onVisibilityChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchMetrics, isCustomer]);

  return metrics;
}

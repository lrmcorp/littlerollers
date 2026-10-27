'use client';

import { useCallback, useSyncExternalStore } from 'react';
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

const POLL_MS = 60_000;
/** Fokus/visibilitas yang datang beruntun (pindah tab, klik jendela) tidak perlu memuat ulang berkali-kali. */
const MIN_GAP_MS = 5_000;

/*
 * Badge dipakai oleh navigasi atas, menu bawah, laci navigasi, dan halaman profil sekaligus. Satu penyimpanan
 * bersama menjaga agar hanya ada satu permintaan /me/dashboard, satu interval, dan satu pendengar fokus,
 * tidak peduli berapa komponen yang memakainya.
 */
let metrics: CustomerBadgeMetrics = emptyMetrics;
let inFlight: Promise<void> | null = null;
let lastFetchAt = 0;
let timer: number | undefined;
const listeners = new Set<() => void>();

function publish(next: CustomerBadgeMetrics) {
  metrics = next;
  listeners.forEach((listener) => listener());
}

async function loadMetrics() {
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
        (doc: { status: string }) => doc.status === 'ACTION_REQUIRED' || doc.status === 'REJECTED',
      );

    publish({
      actionableOrdersCount: actionableOrders.length,
      upcomingBookingsCount: (data.upcomingBookings ?? []).length,
      verificationActionRequired,
      expiringPackagesCount: expiringPackages.length,
    });
  } catch {
    // Graceful fallback: badge terakhir tetap dipakai.
  }
}

function fetchMetrics(force = false) {
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastFetchAt < MIN_GAP_MS) return undefined;
  lastFetchAt = Date.now();
  inFlight = loadMetrics().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const onVisible = () => {
  if (document.visibilityState === 'visible') void fetchMetrics();
};

function start() {
  void fetchMetrics(true);
  timer = window.setInterval(() => void fetchMetrics(true), POLL_MS);
  window.addEventListener('focus', onVisible);
  document.addEventListener('visibilitychange', onVisible);
}

function stop() {
  window.clearInterval(timer);
  window.removeEventListener('focus', onVisible);
  document.removeEventListener('visibilitychange', onVisible);
  // Pemakai terakhir pergi (mis. keluar akun): jangan bawa badge ke sesi berikutnya.
  metrics = emptyMetrics;
  lastFetchAt = 0;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

const noopSubscribe = () => () => {};
const getSnapshot = () => metrics;
const getServerSnapshot = () => emptyMetrics;

export function useCustomerBadges(): CustomerBadgeMetrics {
  const context = useSessionContext();
  const isCustomer = Boolean(context?.session?.roles.includes('CUSTOMER'));
  const subscribeIfCustomer = useCallback(
    (listener: () => void) => (isCustomer ? subscribe(listener) : noopSubscribe()),
    [isCustomer],
  );
  const current = useSyncExternalStore(subscribeIfCustomer, getSnapshot, getServerSnapshot);
  return isCustomer ? current : emptyMetrics;
}

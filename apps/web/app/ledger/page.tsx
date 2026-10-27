import type { Metadata } from 'next';
import { LedgerPageView } from './ledger-page-view';

export const metadata: Metadata = {
  title: 'Sesi Pelanggan',
};
export default function LedgerPage() {
  return <LedgerPageView />;
}

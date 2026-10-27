import type { Metadata } from 'next';
import { CheckInScannerView } from './scanner-view';

export const metadata: Metadata = {
  title: 'Scan QR Check-in',
};

export default function CheckInScannerPage() {
  return <CheckInScannerView />;
}

import type { Metadata } from 'next';
import { CheckInPassView } from './check-in-pass-view';

export const metadata: Metadata = {
  title: 'QR Check-in',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export const dynamic = 'force-dynamic';

export default function CheckInPassPage() {
  return <CheckInPassView />;
}

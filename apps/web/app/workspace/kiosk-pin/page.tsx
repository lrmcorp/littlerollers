import type { Metadata } from 'next';
import { KioskPinView } from './kiosk-pin-view';

export const metadata: Metadata = {
  title: 'PIN Kiosk Studio',
};

export default function KioskPinPage() {
  return <KioskPinView />;
}

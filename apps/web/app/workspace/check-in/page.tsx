import type { Metadata } from 'next';
import { CheckInDeskView } from './check-in-desk-view';

export const metadata: Metadata = { title: 'Check-in' };

export default function CheckInDeskPage() {
  return <CheckInDeskView />;
}

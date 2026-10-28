import type { Metadata } from 'next';
import { RenewalView } from './renewal-view';

export const metadata: Metadata = { title: 'Paket habis & renewal' };

export default function RenewalPage() {
  return <RenewalView />;
}

import type { Metadata } from 'next';
import { KasView } from './kas-view';

export const metadata: Metadata = { title: 'Jurnal kas' };

export default function KasPage() {
  return <KasView />;
}

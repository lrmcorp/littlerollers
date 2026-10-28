import type { Metadata } from 'next';
import { KoreksiJamView } from './koreksi-jam-view';

export const metadata: Metadata = { title: 'Koreksi jam instruktur' };

export default function KoreksiJamPage() {
  return <KoreksiJamView />;
}

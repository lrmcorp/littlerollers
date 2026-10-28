import type { Metadata } from 'next';
import { AntreanView } from './antrean-view';

export const metadata: Metadata = { title: 'Antrean yang tertinggal' };

export default function AntreanPage() {
  return <AntreanView />;
}

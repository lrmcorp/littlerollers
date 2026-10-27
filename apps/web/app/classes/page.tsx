import type { Metadata } from 'next';
import { PublicClassesView } from './public-classes-view';

export const metadata: Metadata = {
  title: 'Jadwal Kelas',
  description: 'Jadwal kelas Pilates di Daily Dose Pilates.',
};

export default function PublicClassesPage() {
  return <PublicClassesView />;
}

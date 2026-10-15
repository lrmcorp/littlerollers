import type { Metadata } from 'next';
import { LocationsView } from './locations-view';

export const metadata: Metadata = {
  title: 'Studio Kami',
  description: 'Temukan studio Daily Dose Pilates aktif di Jakarta, Tangerang & Surabaya.',
};

export default function LocationsPage() {
  return <LocationsView />;
}

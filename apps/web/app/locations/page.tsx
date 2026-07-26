import type { Metadata } from 'next';
import { LocationsView } from './locations-view';

export const metadata: Metadata = {
  title: 'Our Studios',
  description: 'Temukan studio Daily Dose Pilates aktif di Jakarta dan BSD.',
};

export default function LocationsPage() {
  return <LocationsView />;
}

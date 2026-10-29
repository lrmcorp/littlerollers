import type { Metadata } from 'next';
import { LocationsView } from './locations-view';

export const metadata: Metadata = {
  title: 'Our clubs',
  description: 'Addresses, arrival tips and timetables for each Little Rollers club.',
};

export default function LocationsPage() {
  return <LocationsView />;
}

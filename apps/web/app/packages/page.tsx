import type { Metadata } from 'next';
import { PublicPackagesView } from './public-packages-view';

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Compare 1-hour and 2-hour session packages at your Little Rollers club.',
};

export default function PublicPackagesPage() {
  return <PublicPackagesView />;
}

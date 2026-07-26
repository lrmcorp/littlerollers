import type { Metadata } from 'next';
import { PublicPackagesView } from './public-packages-view';

export const metadata: Metadata = {
  title: 'Paket Pilates',
  description: 'Lihat paket Pilates aktif berdasarkan studio Daily Dose Pilates pilihan Anda.',
};

export default function PublicPackagesPage() {
  return <PublicPackagesView />;
}

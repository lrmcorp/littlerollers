import type { Metadata } from 'next';
import { CustomerPackagesView } from './packages-view';

export const metadata: Metadata = {
  title: 'Paket Saya',
};

export default function CustomerPackagesPage() {
  return <CustomerPackagesView />;
}

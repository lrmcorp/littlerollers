import type { Metadata } from 'next';
import { CustomerDashboard } from './customer-dashboard';

export const metadata: Metadata = {
  title: 'Beranda Member',
};

export default function AccountPage() {
  return <CustomerDashboard />;
}

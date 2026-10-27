import type { Metadata } from 'next';
import { CustomersView } from './customers-view';

export const metadata: Metadata = {
  title: 'Data Pelanggan',
};

export default function CustomersPage() {
  return <CustomersView />;
}

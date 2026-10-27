import type { Metadata } from 'next';
import { PackagesManagementView } from '../../package-promotions/packages-management-view';

export const metadata: Metadata = {
  title: 'Paket & Promo Harga',
};

export default function WorkspacePackagesPage() {
  return <PackagesManagementView />;
}

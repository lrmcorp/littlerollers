import type { Metadata } from 'next';
import { PublicContentManagementView } from './public-content-management-view';

export const metadata: Metadata = {
  title: 'Manajemen Konten Publik',
};
export default function PublicContentManagementPage() {
  return <PublicContentManagementView />;
}

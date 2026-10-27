import type { Metadata } from 'next';
import { NotificationManagementView } from './notification-management-view';

export const metadata: Metadata = {
  title: 'Manajemen Notifikasi',
};
export default function NotificationManagementPage() {
  return <NotificationManagementView />;
}

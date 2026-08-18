import type { Metadata } from 'next';
import { NotificationsView } from './notifications-view';

export const metadata: Metadata = {
  title: 'Notifikasi — DailyDose',
  description: 'Semua notifikasi dan pembaruan penting untuk akun Anda.',
};

export default function NotificationsPage() {
  return <NotificationsView />;
}

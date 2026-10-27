import type { Metadata } from 'next';
import { CopyWeekView } from './copy-week-view';

export const metadata: Metadata = {
  title: 'Salin Jadwal Minggu',
};

export default function CopyWeekPage() {
  return <CopyWeekView />;
}

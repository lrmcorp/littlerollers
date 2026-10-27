import type { Metadata } from 'next';
import { RecurringScheduleView } from './recurring-schedule-view';

export const metadata: Metadata = {
  title: 'Jadwal Rutin',
};

export default function RecurringSchedulePage() {
  return <RecurringScheduleView />;
}

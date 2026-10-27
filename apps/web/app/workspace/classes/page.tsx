import type { Metadata } from 'next';
import { ClassSlotView } from '../../classes/class-slot-view';

export const metadata: Metadata = {
  title: 'Timetable Kelas',
};

export default function WorkspaceClassesPage() {
  return <ClassSlotView />;
}

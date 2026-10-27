import type { Metadata } from 'next';
import { AssignmentsView } from './assignments-view';

export const metadata: Metadata = {
  title: 'Penugasan',
};

export default function AssignmentsPage() {
  return <AssignmentsView />;
}

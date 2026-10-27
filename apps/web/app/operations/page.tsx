import type { Metadata } from 'next';
import { OperationsView } from './operations-view';

export const metadata: Metadata = {
  title: 'Evaluasi Kuota H-24',
};

export default function OperationsPage() {
  return <OperationsView />;
}

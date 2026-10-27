import type { Metadata } from 'next';
import { InstructorsView } from './instructors-view';

export const metadata: Metadata = {
  title: 'Manajemen Instruktur',
};
export default function InstructorsPage() {
  return <InstructorsView />;
}

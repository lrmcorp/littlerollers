import type { Metadata } from 'next';
import { Dashboard } from '../dashboard';

export const metadata: Metadata = {
  title: 'Ringkasan',
};

export default function WorkspacePage() {
  return <Dashboard />;
}

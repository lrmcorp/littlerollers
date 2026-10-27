import type { Metadata } from 'next';
import { HealthView } from './health-view';

export const metadata: Metadata = {
  title: 'Status Sistem',
};

export default function HealthPage() {
  return <HealthView />;
}

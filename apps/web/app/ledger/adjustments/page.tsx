import type { Metadata } from 'next';
import { SessionAdjustmentsPageView } from './session-adjustments-page-view';

export const metadata: Metadata = {
  title: 'Penyesuaian Sesi',
};

export default function SessionAdjustmentsPage() {
  return <SessionAdjustmentsPageView />;
}

import type { Metadata } from 'next';
import { WorkspaceGuideView } from './workspace-guide-view';

export const metadata: Metadata = {
  title: 'Panduan Operasional Staf | Daily Dose Pilates',
  description: 'Standar Operasional Prosedur (SOP) untuk Front Desk, Finance, dan Super Owner.',
};

export default function WorkspaceGuidePage() {
  return <WorkspaceGuideView />;
}

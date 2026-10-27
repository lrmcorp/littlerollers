import type { Metadata } from 'next';
import { BranchesView } from '../../branches/branches-view';

export const metadata: Metadata = {
  title: 'Manajemen Cabang',
};

export default function WorkspaceBranchesPage() {
  return <BranchesView />;
}

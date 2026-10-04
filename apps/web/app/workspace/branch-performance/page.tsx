import { Suspense } from 'react';
import { OwnerBranchPerformanceView } from './owner-branch-performance-view';

export default function BranchPerformancePage() {
  return (
    <Suspense fallback={null}>
      <OwnerBranchPerformanceView />
    </Suspense>
  );
}

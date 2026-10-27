import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OwnerBranchPerformanceView } from './owner-branch-performance-view';

export const metadata: Metadata = {
  title: 'Performa Cabang',
};

export default function BranchPerformancePage() {
  return (
    <Suspense fallback={null}>
      <OwnerBranchPerformanceView />
    </Suspense>
  );
}

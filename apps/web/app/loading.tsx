'use client';

import { useEffect } from 'react';
import { completeNavigation, startNavigation } from './components/app-loading';

export default function Loading() {
  useEffect(() => {
    startNavigation('Memuat halaman…');
    return () => completeNavigation();
  }, []);
  return (
    <span className="sr-only" role="status">
      Memuat halaman…
    </span>
  );
}

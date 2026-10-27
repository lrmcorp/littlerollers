import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Data Master',
};

export default function MasterLayout({ children }: { children: ReactNode }) {
  return children;
}

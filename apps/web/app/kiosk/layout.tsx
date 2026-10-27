import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Layar Kiosk Studio',
};

export default function KioskLayout({ children }: { children: ReactNode }) {
  return children;
}

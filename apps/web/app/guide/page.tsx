import type { Metadata } from 'next';
import { GuideView } from './guide-view';

export const metadata: Metadata = {
  title: 'Panduan Penggunaan Aplikasi · Daily Dose Pilates',
  description:
    'Panduan mendaftar, membeli paket, memesan kelas, dan hadir di studio Daily Dose Pilates.',
};

export default function GuidePage() {
  return <GuideView />;
}

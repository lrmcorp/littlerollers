import type { Metadata } from 'next';
import { GuideView } from './guide-view';

export const metadata: Metadata = {
  title: 'Panduan Penggunaan Aplikasi · Daily Dose Pilates',
  description:
    'Panduan lengkap tata cara penggunaan aplikasi Daily Dose Pilates untuk Pelanggan, Operasional Cabang, Finance, dan Super Owner.',
};

export default function GuidePage() {
  return <GuideView />;
}

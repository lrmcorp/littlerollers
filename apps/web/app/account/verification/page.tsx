import type { Metadata } from 'next';
import { VerificationView } from './verification-view';

export const metadata: Metadata = {
  title: 'Verifikasi Identitas KTP',
};

export default function VerificationPage() {
  return <VerificationView />;
}

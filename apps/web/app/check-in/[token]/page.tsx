import type { Metadata } from 'next';
import { CheckInLinkView } from './check-in-link-view';

export const metadata: Metadata = {
  title: 'Konfirmasi Kehadiran Kelas - Daily Dose Pilates',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export const dynamic = 'force-dynamic';

export default async function CheckInLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <CheckInLinkView token={token} />;
}

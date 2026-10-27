import type { Metadata } from 'next';
import { KioskView } from './kiosk-view';

export const metadata: Metadata = {
  title: 'Layar Kiosk Studio & Presensi Instruktur',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function KioskBranchPage({
  params,
}: {
  params: Promise<{ branchCode: string }>;
}) {
  const { branchCode } = await params;
  return <KioskView branchCode={branchCode} />;
}

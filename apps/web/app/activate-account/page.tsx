import type { Metadata } from 'next';
import { ActivateAccountView } from './activate-account-view';

export const metadata: Metadata = {
  title: 'Aktivasi Akun',
};

export default function ActivateAccountPage() {
  return <ActivateAccountView />;
}

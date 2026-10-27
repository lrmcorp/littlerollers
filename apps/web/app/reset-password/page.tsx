import type { Metadata } from 'next';
import { ResetPasswordView } from './reset-password-view';

export const metadata: Metadata = {
  title: 'Atur Ulang Password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}

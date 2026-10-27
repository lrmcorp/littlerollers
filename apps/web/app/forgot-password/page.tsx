import type { Metadata } from 'next';
import { ForgotPasswordView } from './forgot-password-view';

export const metadata: Metadata = {
  title: 'Lupa Password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}

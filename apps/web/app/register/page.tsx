import type { Metadata } from 'next';
import { RegisterView } from './register-view';

export const metadata: Metadata = {
  title: 'Daftar Akun',
};

export default function RegisterPage() {
  return <RegisterView />;
}
